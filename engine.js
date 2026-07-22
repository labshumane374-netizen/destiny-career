// === ENGINE ===
// Sélection des événements candidats, résolution des acteurs, tirage pondéré,
// application des effets. Vocabulaire de conditions volontairement fermé (voir FACT_RESOLVERS
// et OP_FUNCS) : un nouvel opérateur ne s'ajoute que s'il sert au moins 3 événements.

const OP_FUNCS = {
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  'in': (a, b) => Array.isArray(b) && b.includes(a),
};

// --- Résolution de "fact" (chemin dans le state, ou requête spéciale) ---
function resolveFact(fact, state, ctx) {
  if (fact === 'career.season') return state.player.career.season;
  if (fact === 'player.age') return state.player.career.age;
  if (fact === 'career.contract.yearsLeft') return state.player.career.contract.yearsLeft;
  if (fact === 'career.history.length') return state.player.career.history.length;
  if (fact === 'career.club.prestige') return state.player.career.club.prestige;
  if (fact === 'career.club.tier') return state.player.career.club.tier;
  if (fact === 'player.position') return state.player.identity.position;
  if (fact === 'wallet.cash') return state.player.wallet.cash;
  if (fact.startsWith('stats.')) return state.player.stats[fact.slice(6)];
  if (fact.startsWith('relation.')) {
    const dim = fact.slice(9); // 'trust' | 'grudge'
    const actorRef = ctx.currentActorFilter?.of;
    if (actorRef && actorRef.startsWith('$')) {
      const charId = ctx.resolvedActors[actorRef.slice(1)];
      return state.characters[charId]?.relation[dim] ?? null;
    }
    return null; // résolu via 'any_active_<role>' dans evalCondition, pas ici
  }
  return undefined;
}

function hasFlagWithin(state, key, seasons, ctx) {
  const ids = state._flagIndex[key] || [];
  const currentSeason = state.player.career.season;
  return ids.some(id => {
    const f = state.flags.find(fl => fl.id === id);
    if (!f) return false;
    if (ctx.characterId && f.characterId !== ctx.characterId) return false;
    return seasons == null || (currentSeason - f.season) <= seasons;
  });
}

function countTag(state, tag, sinceSeasons) {
  const currentSeason = state.player.career.season;
  return state.flags.filter(f => f.data?.tag === tag && (sinceSeasons == null || (currentSeason - f.season) <= sinceSeasons)).length;
}

// --- Conditions qui portent sur "any_active_<role>" avec un filtre de relation ---
function findAnyMatchingCharacter(state, of, filter) {
  const role = of.replace('any_active_', '');
  return Object.values(state.characters).find(c => {
    if (!c.active) return false;
    if (role !== 'any' && c.role !== role) return false;
    if (filter?.grudge?.gt != null && !(c.relation.grudge > filter.grudge.gt)) return false;
    if (filter?.trust?.gt != null && !(c.relation.trust > filter.trust.gt)) return false;
    if (filter?.trust?.lt != null && !(c.relation.trust < filter.trust.lt)) return false;
    return true;
  });
}

function evalCondition(cond, state, ctx) {
  if (cond.fact === 'flag') {
    return hasFlagWithin(state, cond.key, cond.seasons, { characterId: cond.characterId ? ctx.resolvedActors[cond.characterId.slice(1)] : null });
  }
  if (cond.fact && cond.fact.startsWith('relation.') && cond.of) {
    const match = findAnyMatchingCharacter(state, cond.of, null);
    if (!match) return false;
    const dim = cond.fact.slice(9);
    return OP_FUNCS[cond.op](match.relation[dim], cond.value);
  }
  const value = resolveFact(cond.fact, state, ctx);
  if (value === undefined) return false;
  return OP_FUNCS[cond.op](value, cond.value);
}

function evalConditions(node, state, ctx) {
  if (node.all) return node.all.every(c => evalConditions(c, state, ctx));
  if (node.any) return node.any.some(c => evalConditions(c, state, ctx));
  return evalCondition(node, state, ctx);
}

// --- Résolution des acteurs d'un événement (le levier principal de recombinaison) ---
function resolveActors(eventDef, state) {
  const resolved = {};
  if (!eventDef.actors) return resolved;
  for (const [key, spec] of Object.entries(eventDef.actors)) {
    const candidates = Object.values(state.characters).filter(c => {
      if (!c.active) return false;
      if (spec.role && c.role !== spec.role) return false;
      if (spec.filter?.grudge?.gt != null && !(c.relation.grudge > spec.filter.grudge.gt)) return false;
      if (spec.filter?.trust?.gt != null && !(c.relation.trust > spec.filter.trust.gt)) return false;
      if (spec.filter?.trust?.lt != null && !(c.relation.trust < spec.filter.trust.lt)) return false;
      return true;
    });
    if (candidates.length === 0) return null; // événement écarté, pas d'acteur dispo
    let chosen;
    if (spec.pick === 'highestGrudge') chosen = candidates.sort((a, b) => b.relation.grudge - a.relation.grudge)[0];
    else if (spec.pick === 'highestTrust') chosen = candidates.sort((a, b) => b.relation.trust - a.relation.trust)[0];
    else chosen = candidates[Math.floor(Math.random() * candidates.length)];
    resolved[key] = chosen.id;
  }
  return resolved;
}

// --- Cooldown / maxOccurrences ---
function isEventAvailable(eventDef, state) {
  const log = state.eventLog[eventDef.id];
  if (!log) return true;
  if (eventDef.maxOccurrences != null && log.count >= eventDef.maxOccurrences) return false;
  if (eventDef.cooldownSeasons != null) {
    const seasonsSince = state.player.career.season - log.lastSeason;
    if (seasonsSince < eventDef.cooldownSeasons) return false;
  }
  return true;
}

function isArchetypeCompatible(eventDef, archetypeId) {
  if (eventDef.archetypes && eventDef.archetypes.length && !eventDef.archetypes.includes(archetypeId)) return false;
  const archetype = ARCHETYPES[archetypeId];
  if (archetype?.lockedEvents?.includes(eventDef.id)) return false;
  return true;
}

// --- Sélection des candidats ---
function selectCandidateEvents(state, eventPool) {
  const archetypeId = state.player.identity.archetype;
  const candidates = [];
  for (const eventDef of eventPool) {
    if (!isArchetypeCompatible(eventDef, archetypeId)) continue;
    if (!isEventAvailable(eventDef, state)) continue;
    const resolvedActors = resolveActors(eventDef, state);
    if (eventDef.actors && resolvedActors === null) continue;
    const ctx = { resolvedActors: resolvedActors || {} };
    if (eventDef.conditions && !evalConditions(eventDef.conditions, state, ctx)) continue;
    candidates.push({ eventDef, resolvedActors: resolvedActors || {} });
  }
  return candidates;
}

// --- Tirage pondéré avec pénalité de récence ---
function pickWeighted(candidates, state) {
  if (candidates.length === 0) return null;
  const archetype = ARCHETYPES[state.player.identity.archetype];
  const origin = ORIGINS[state.player.identity.originId];
  const playstyle = PLAYSTYLES[state.player.identity.playstyleId];
  const recentCounts = {};
  for (const id of state.recentEventIds || []) {
    const def = candidates.find(c => c.eventDef.id === id)?.eventDef;
    const cat = def?.category;
    if (cat) recentCounts[cat] = (recentCounts[cat] || 0) + 1;
  }

  const weighted = candidates.map(c => {
    const archetypeMod = archetype?.eventWeightModifiers?.[c.eventDef.category] ?? archetype?.eventWeightModifiers?.[c.eventDef.id] ?? 1;
    const originMod = origin?.eventWeightModifiers?.[c.eventDef.category] ?? 1;
    const playstyleMod = playstyle?.eventWeightModifiers?.[c.eventDef.category] ?? 1;
    const modifier = archetypeMod * originMod * playstyleMod;
    const recencyPenalty = 1 + (recentCounts[c.eventDef.category] || 0);
    const weight = (c.eventDef.weight * modifier) / recencyPenalty;
    return { ...c, weight };
  });

  const total = weighted.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * total;
  for (const c of weighted) {
    roll -= c.weight;
    if (roll <= 0) return c;
  }
  return weighted[weighted.length - 1];
}

// --- Clamp + rendements décroissants au-delà de 80, appliqués une fois pour tout le moteur ---
function applyDiminishingGain(current, rawGain) {
  if (rawGain <= 0) return Math.max(0, current + rawGain);
  const effectiveGain = current >= 80 ? rawGain * (1 - current / 120) : rawGain;
  return Math.min(100, current + effectiveGain);
}

// --- Multiplicateur de temps de jeu : module les gains positifs de stats, jamais les pénalités ---
function getPlayingTimeMultiplier(playingTime) {
  return 0.7 + (playingTime / 100) * 0.6;
}

// --- Système de probabilité de réussite cachée (successCheck) ---
function resolveStatOrRelationValue(entry, state, resolvedActors) {
  if (entry.stat) return state.player.stats[entry.stat] ?? 0;
  if (entry.relation) {
    const ref = entry.of || 'primary';
    const charId = ref.startsWith('$') ? resolvedActors[ref.slice(1)] : resolvedActors[ref];
    const character = state.characters[charId];
    return character ? (character.relation[entry.relation] ?? 0) : 0;
  }
  return 0;
}

function computeSuccessChance(check, state, resolvedActors) {
  const totalWeight = check.stats.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = check.stats.reduce((sum, s) => {
    return sum + resolveStatOrRelationValue(s, state, resolvedActors) * s.weight;
  }, 0);
  const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  const delta = normalizedScore - check.difficulty;
  const rawChance = 0.5 + delta / 100;

  const min = check.minChance ?? 0.10;
  const max = check.maxChance ?? 0.90;
  return Math.max(min, Math.min(max, rawChance));
}

function applyEffects(state, eventDef, choice, resolvedActors) {
  const effects = choice.effects || {};

  if (effects.stats) {
    const playTimeMultiplier = getPlayingTimeMultiplier(state.player.career.playingTime ?? 50);
    for (const [stat, delta] of Object.entries(effects.stats)) {
      const cur = state.player.stats[stat];
      if (cur === undefined) continue;
      const adjustedDelta = delta > 0 ? delta * playTimeMultiplier : delta;
      state.player.stats[stat] = Math.max(0, Math.min(100, applyDiminishingGain(cur, adjustedDelta)));
    }
  }

  if (effects.relation) {
    for (const rel of effects.relation) {
      const charId = rel.target.startsWith('$') ? resolvedActors[rel.target.slice(1)] : resolvedActors[rel.target];
      const character = state.characters[charId];
      if (!character || !character.active) continue;
      if (rel.trust != null) character.relation.trust = Math.max(0, Math.min(100, applyDiminishingGain(character.relation.trust, rel.trust)));
      if (rel.grudge != null) character.relation.grudge = Math.max(0, Math.min(100, applyDiminishingGain(character.relation.grudge, rel.grudge)));
      character.lastInteractionSeason = state.player.career.season;
    }
  }

  if (effects.flags) {
    for (const flagSpec of effects.flags) {
      const charId = flagSpec.characterId?.startsWith('$') ? resolvedActors[flagSpec.characterId.slice(1)] : flagSpec.characterId;
      addFlag(state, flagSpec.key, charId, flagSpec.data || {});
    }
  }

  if (effects.scheduleFlag) {
    const s = effects.scheduleFlag;
    const charId = s.characterId?.startsWith('$') ? resolvedActors[s.characterId.slice(1)] : s.characterId;
    state.scheduledFlags.push({
      key: s.key,
      characterId: charId || null,
      dueSeason: state.player.career.season + s.inSeasons,
    });
  }

  if (effects.transfer) {
    const club = CLUBS.find(c => c.id === effects.transfer.clubId);
    if (club) {
      if (effects.transfer.isLoan) {
        state.player.career.loan = {
          parentClubSnapshot: { ...state.player.career.club },
          startSeason: state.player.career.season,
          durationSeasons: effects.transfer.loanDurationSeasons || 1,
        };
      }
      state.player.career.history.push({ ...state.player.career.club, endSeason: state.player.career.season });
      state.player.career.club = { id: club.id, name: club.name, countryId: club.countryId, tier: club.tier, prestige: club.prestige };
      const newSalary = Math.round(state.player.career.contract.salaryWeekly * (effects.transfer.salaryMultiplier || 1.1));
      if (!effects.transfer.isLoan) {
        state.player.career.contract = {
          yearsLeft: 3,
          salaryWeekly: newSalary,
          releaseClause: null,
          expiresSeason: state.player.career.season + 3,
        };
        const signingBonus = effects.transfer.signingBonus
          ?? Math.round(club.prestige * 80 * (1 + state.player.stats.reputation / 100));
        state.player.wallet.cash += signingBonus;
        state.player.wallet.lastSigningBonus = signingBonus;
      }
    }
  }

  if (effects.contract) {
    if (effects.contract.yearsLeft != null) state.player.career.contract.yearsLeft = effects.contract.yearsLeft;
    if (effects.contract.salaryWeekly != null) state.player.career.contract.salaryWeekly = effects.contract.salaryWeekly;
    if (effects.contract.expiresSeason != null) state.player.career.contract.expiresSeason = effects.contract.expiresSeason;
  }

  if (effects.wallet) {
    if (effects.wallet.cashDelta != null) state.player.wallet.cash += effects.wallet.cashDelta;
    if (effects.wallet.monthlyExpensesDelta != null) {
      state.player.wallet.monthlyExpenses = Math.max(0, state.player.wallet.monthlyExpenses + effects.wallet.monthlyExpensesDelta);
    }
  }

  if (effects.playingTime != null) {
    state.player.career.playingTime = Math.max(0, Math.min(100, state.player.career.playingTime + effects.playingTime));
  }

  if (eventDef.producesTags) {
    for (const tag of eventDef.producesTags) {
      addFlag(state, 'world_tag', null, { tag });
    }
  }
}

function addFlag(state, key, characterId, data) {
  const flag = {
    id: `flg_${String(state.flagsCount++).padStart(5, '0')}`,
    key,
    season: state.player.career.season,
    characterId: characterId || null,
    data,
  };
  state.flags.push(flag);
  (state._flagIndex[key] ||= []).push(flag.id);
  if (characterId) (state._flagsByCharacter[characterId] ||= []).push(flag.id);
}

function consumeScheduledFlags(state) {
  const due = state.scheduledFlags.filter(s => s.dueSeason <= state.player.career.season);
  state.scheduledFlags = state.scheduledFlags.filter(s => s.dueSeason > state.player.career.season);
  for (const s of due) addFlag(state, s.key, s.characterId, {});
}

function rebuildIndexes(state) {
  state._flagIndex = {};
  state._flagsByCharacter = {};
  for (const f of state.flags) {
    (state._flagIndex[f.key] ||= []).push(f.id);
    if (f.characterId) (state._flagsByCharacter[f.characterId] ||= []).push(f.id);
  }
}

// --- Marché des transferts actifs ---
function computePlayerMarketValue(state) {
  const s = state.player.stats;
  return s.reputation * 0.4 + s.technique * 0.15 + s.physique * 0.15 + s.tactique * 0.15 + s.mental * 0.15;
}

function findLoanTargetClub(state, allClubs) {
  const marketValue = computePlayerMarketValue(state);
  const currentClub = state.player.career.club;
  const candidates = allClubs.filter(c => c.id !== currentClub.id && c.prestige < marketValue - 10);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function evaluateTransferMarket(state, allClubs) {
  if (state.player.career.loan) return [];
  const marketValue = computePlayerMarketValue(state);
  const currentClub = state.player.career.club;
  const contractLocked = state.player.career.contract.yearsLeft > 1;
  const offers = [];

  for (const club of allClubs) {
    if (club.id === currentClub.id) continue;
    const gap = club.prestige - marketValue;
    if (gap > 20) continue;
    if (gap < -35 && Math.random() > 0.05) continue;

    const ambitionScore = Math.max(0, marketValue - currentClub.prestige);
    const interestChance = contractLocked
      ? 0.05 + ambitionScore / 300
      : 0.15 + ambitionScore / 150;

    if (Math.random() < Math.min(0.6, interestChance)) {
      offers.push({
        clubId: club.id,
        prestigeDelta: club.prestige - currentClub.prestige,
        salaryMultiplier: 1 + Math.max(0, gap) * -0.01 + Math.random() * 0.3,
      });
    }
  }
  return offers.sort((a, b) => b.prestigeDelta - a.prestigeDelta).slice(0, 1);
}

function driveClubPrestige(club, state) {
  const drift = (Math.random() - 0.45) * 3;
  club.prestige = Math.max(5, Math.min(100, club.prestige + drift));
  const competition = COMPETITIONS[club.countryId];
  const matchingDivision = competition.divisions.find(
    d => club.prestige >= d.prestigeRange[0] && club.prestige <= d.prestigeRange[1]
  );
  if (matchingDivision) club.tier = matchingDivision.tier;
}

// --- Négociation de contrat (fin de contrat naturelle, transfert, ou demande ponctuelle) ---
function computeContractBaseSalary(state) {
  const performanceScore = computeSeasonPerformanceScore(state);
  const marketValue = computePlayerMarketValue(state);
  return Math.round(200 + marketValue * 8 + performanceScore * 6);
}

function computeContractProposals(state, minYears) {
  const base = computeContractBaseSalary(state);
  const durations = [minYears, minYears + 1, minYears + 2].filter(y => y >= 1 && y <= 5);
  return durations.map(years => ({
    years,
    salaryWeekly: Math.round(base * (1.25 - years * 0.05)),
    signingBonus: years >= 3 ? Math.round(base * 4 * (years / 4)) : 0,
  }));
}

function applyAgentInfluence(proposals, agentTrust) {
  const trustFactor = 1 + (agentTrust - 50) / 250;
  return proposals.map(p => ({
    ...p,
    salaryWeekly: Math.round(p.salaryWeekly * trustFactor),
    signingBonus: Math.round(p.signingBonus * trustFactor),
  }));
}

function buildContractNegotiationEvent(state) {
  const currentYearsLeft = state.player.career.contract.yearsLeft;
  const minYears = currentYearsLeft > 1 ? currentYearsLeft : 1;
  let proposals = computeContractProposals(state, minYears);

  const agent = Object.values(state.characters).find(c => c.active && c.role === 'agent');
  if (agent) proposals = applyAgentInfluence(proposals, agent.relation.trust);

  return {
    id: 'evt_dyn_contract_negotiation',
    category: 'transfer',
    weight: 1,
    dynamic: true,
    actors: agent ? { primary: { role: 'agent', pick: 'random' } } : {},
    text: {
      title: 'Négociation de contrat',
      body: agent
        ? `{primary.name} te présente les offres de prolongation négociées avec ${state.player.career.club.name}.`
        : `${state.player.career.club.name} te présente ses offres de prolongation de contrat.`,
    },
    choices: proposals.map(p => ({
      id: `sign_${p.years}y`,
      label: `${p.years} an${p.years > 1 ? 's' : ''} — ${p.salaryWeekly}/sem${p.signingBonus ? ` (+prime ${p.signingBonus})` : ''}`,
      effects: {
        contract: {
          yearsLeft: p.years,
          salaryWeekly: p.salaryWeekly,
          expiresSeason: state.player.career.season + p.years,
        },
        wallet: p.signingBonus ? { cashDelta: p.signingBonus } : undefined,
      },
    })),
  };
}

function buildTransferOfferEvent(offer, club) {
  const division = findClubDivisionLabel(club);
  return {
    id: `evt_dyn_transfer_offer_${club.id}`,
    category: 'transfer',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: 'Une offre de transfert',
      body: `${club.name} (${division}) souhaite te recruter.`,
    },
    choices: [
      {
        id: 'accept', label: `Rejoindre ${club.name}`,
        effects: { transfer: { clubId: club.id, salaryMultiplier: offer.salaryMultiplier } },
      },
      { id: 'decline', label: 'Décliner et rester', effects: {} },
    ],
  };
}

// --- Boucle principale d'un beat ---
const FALLBACK_EVENT = {
  id: 'evt_fallback_training',
  category: 'fallback',
  weight: 1,
  text: { title: 'Entraînement de routine', body: 'Une semaine tranquille, rien de notable à signaler.' },
  choices: [{ id: 'continue', label: 'Continuer', effects: {} }],
};

function buildLoanOfferEvent(club) {
  const division = findClubDivisionLabel(club);
  return {
    id: `evt_dyn_loan_offer_${club.id}`,
    category: 'transfer',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: 'Un club d\'accueil pour ton prêt',
      body: `${club.name} (${division}) accepte de t'accueillir en prêt pour la saison à venir.`,
    },
    choices: [
      { id: 'confirm_loan', label: `Rejoindre ${club.name} en prêt`, effects: { transfer: { clubId: club.id, isLoan: true, loanDurationSeasons: 1 } } },
      { id: 'cancel_loan', label: 'Finalement rester', effects: {} },
    ],
  };
}

function advanceBeat(state, eventPool) {
  consumeScheduledFlags(state);

  if (state.pendingTransferOffers && state.pendingTransferOffers.length) {
    const offer = state.pendingTransferOffers.shift();
    const club = CLUBS.find(c => c.id === offer.clubId);
    if (club) return { eventDef: buildTransferOfferEvent(offer, club), resolvedActors: {} };
  }

  if (hasFlagWithin(state, 'loan_offer_ready', 0, {}) && !hasFlagWithin(state, 'loan_offer_resolved', 0, {}) && !state.player.career.loan) {
    const targetClub = findLoanTargetClub(state, CLUBS);
    if (targetClub) {
      addFlag(state, 'loan_offer_resolved', null, {});
      return { eventDef: buildLoanOfferEvent(targetClub), resolvedActors: {} };
    }
  }

  if (state.pendingSeasonRecap) {
    state.pendingSeasonRecap = false;
    return { eventDef: buildSeasonRecapEvent(state), resolvedActors: {} };
  }

  if (state.pendingContractRenegotiation) {
    state.pendingContractRenegotiation = false;
    return { eventDef: buildContractNegotiationEvent(state), resolvedActors: {} };
  }

  if (state.pendingContinentalCup) {
    state.pendingContinentalCup = false;
    return { eventDef: buildContinentalCupEvent(state), resolvedActors: {} };
  }

  if (state.pendingInternationalTournament) {
    state.pendingInternationalTournament = false;
    return { eventDef: buildInternationalTournamentEvent(state), resolvedActors: {} };
  }

  if (state.pendingSeasonAward) {
    const result = state.pendingSeasonAward;
    state.pendingSeasonAward = null;
    return { eventDef: buildSeasonAwardEvent(result), resolvedActors: {} };
  }

  if (Math.random() < MATCH_MOMENT_TRIGGER_CHANCE) {
    const moment = pickMatchMoment(state.player.identity.position);
    return { eventDef: buildMatchMomentEvent(moment), resolvedActors: {} };
  }

  const candidates = selectCandidateEvents(state, eventPool);
  const chosen = pickWeighted(candidates, state) || { eventDef: FALLBACK_EVENT, resolvedActors: {} };
  return chosen;
}

function commitChoice(state, chosen, choiceId) {
  const { eventDef, resolvedActors } = chosen;
  const choice = eventDef.choices.find(c => c.id === choiceId);

  let outcome = null;
  if (choice.successCheck) {
    const chance = computeSuccessChance(choice.successCheck, state, resolvedActors);
    outcome = Math.random() < chance ? 'success' : 'failure';
    const effectsToApply = outcome === 'success' ? choice : { effects: choice.failureEffects || {} };
    applyEffects(state, eventDef, effectsToApply, resolvedActors);
    if (eventDef.category === 'match') {
      recordMatchMomentOutcome(state, outcome);
      if (outcome === 'success' && choice.statType) recordMatchStat(state, choice.statType);
    }
  } else {
    applyEffects(state, eventDef, choice, resolvedActors);
  }

  state.storyLog.push({
    season: state.player.career.season,
    eventId: eventDef.id,
    choiceId: choice.id,
    outcome,
    actorsResolved: resolvedActors,
  });

  const log = (state.eventLog[eventDef.id] ||= { count: 0, lastSeason: 0 });
  log.count++;
  log.lastSeason = state.player.career.season;

  state.recentEventIds = [...(state.recentEventIds || []), eventDef.id].slice(-8);

  return outcome;
}
