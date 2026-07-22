// === MAIN: bootstrap, écoute UI, boucle de jeu ===

let state = null;
let currentChosen = null;
let selectedStartingAge = null;
let selectedNationalityId = null;
let selectedPositionId = null;
let selectedOriginId = null;
let selectedPlaystyleId = null;
let enteredPlayerName = 'Toi';

function createNewState(playerName, nationalityId, originId, playstyleId, positionId, archetypeId, startingAge) {
  const ageProfile = STARTING_AGE_PROFILES[startingAge];
  const nationality = NATIONALITIES[nationalityId];
  const position = POSITIONS[positionId];
  const origin = ORIGINS[originId];
  const playstyle = PLAYSTYLES[playstyleId];
  const eligibleClubs = CLUBS.filter(c => c.tier >= ageProfile.clubTierRange[0] && c.tier <= ageProfile.clubTierRange[1]);
  const club = pickStartingClubByNationality(eligibleClubs, nationality) || eligibleClubs[Math.floor(Math.random() * eligibleClubs.length)];

  const s = {
    player: {
      identity: {
        firstName: playerName || 'Toi', lastName: '', archetype: archetypeId, nationalityId,
        originId, playstyleId, position: positionId, birthYear: 2026 - startingAge, startingAge,
      },
      career: {
        season: 1, age: startingAge, retired: false,
        club: { id: club.id, name: club.name, countryId: club.countryId, tier: club.tier, prestige: club.prestige },
        contract: { yearsLeft: ageProfile.contractYears, salaryWeekly: 400 + club.prestige * 15, releaseClause: null, expiresSeason: ageProfile.contractYears },
        history: [],
        playingTime: 50,
        loan: null,
      },
      stats: {
        technique: 55 + ageProfile.statBonus.technique + (nationality?.startingBonus.technique || 0) + (position?.startingBonus.technique || 0) + (origin?.startingBonus.technique || 0) + (playstyle?.startingBonus.technique || 0),
        physique: 60 + ageProfile.statBonus.physique + (nationality?.startingBonus.physique || 0) + (position?.startingBonus.physique || 0) + (origin?.startingBonus.physique || 0) + (playstyle?.startingBonus.physique || 0),
        mental: 50 + ageProfile.statBonus.mental + (nationality?.startingBonus.mental || 0) + (position?.startingBonus.mental || 0) + (origin?.startingBonus.mental || 0) + (playstyle?.startingBonus.mental || 0),
        tactique: 45 + ageProfile.statBonus.tactique + (nationality?.startingBonus.tactique || 0) + (position?.startingBonus.tactique || 0) + (origin?.startingBonus.tactique || 0) + (playstyle?.startingBonus.tactique || 0),
        reputation: 10 + ageProfile.statBonus.reputation + (nationality?.startingBonus.reputation || 0) + (origin?.startingBonus.reputation || 0) + (playstyle?.startingBonus.reputation || 0),
        formOverall: 50 + ageProfile.statBonus.formOverall,
      },
      wallet: { cash: 5000, monthlyExpenses: 400, investments: [], careerEarnings: 0, lastSigningBonus: 0 },
      body: { fatigue: 20, injuryRisk: 10, currentInjury: null },
    },
    characters: {},
    flags: [],
    flagsCount: 0,
    _flagIndex: {},
    _flagsByCharacter: {},
    scheduledFlags: [],
    pendingTransferOffers: [],
    pendingContinentalCup: false,
    pendingInternationalTournament: false,
    pendingSeasonAward: null,
    pendingSeasonRecap: false,
    pendingContractRenegotiation: false,
    seasonMatchMoments: { successCount: 0, attemptCount: 0 },
    seasonMatchStats: { goals: 0, assists: 0 },
    careerMatchStats: { goals: 0, assists: 0 },
    eventLog: {},
    recentEventIds: [],
    storyLog: [],
    yearlySnapshots: [],
  };

  const archetype = ARCHETYPES[archetypeId];
  if (archetype?.startingBonus) {
    for (const [stat, bonus] of Object.entries(archetype.startingBonus)) {
      s.player.stats[stat] = Math.min(100, s.player.stats[stat] + bonus);
    }
  }

  initialCast(s);
  takeYearlySnapshot(s);
  return s;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function renderNameScreen() {
  const input = document.getElementById('input-player-name');
  input.value = '';
  setTimeout(() => input.focus(), 50);
}

document.getElementById('btn-name-continue').addEventListener('click', () => {
  const input = document.getElementById('input-player-name');
  enteredPlayerName = input.value.trim() || 'Toi';
  showScreen('screen-nationality');
  renderNationalityScreen();
});

document.getElementById('input-player-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-name-continue').click();
});

function renderNationalityScreen() {
  const grid = document.getElementById('nationality-grid');
  grid.innerHTML = '';
  for (const [id, nat] of Object.entries(NATIONALITIES)) {
    const country = COUNTRIES[nat.countryId];
    const flag = country ? country.flag : '🏳️';
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    card.innerHTML = `<span class="pick-flag">${flag}</span><div class="pick-body"><h3>${nat.label}</h3><p>${nat.federation}</p></div>`;
    card.addEventListener('click', () => {
      selectedNationalityId = id;
      showScreen('screen-origin');
      renderOriginScreen();
    });
    grid.appendChild(card);
  }
}

const ORIGIN_ICONS = { academy: '🏫', pro_family: '👑', working_class: '🏘️', futsal: '🏟️', late_bloomer: '🔥' };

function renderOriginScreen() {
  const grid = document.getElementById('origin-grid');
  grid.innerHTML = '';
  for (const [id, origin] of Object.entries(ORIGINS)) {
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    card.innerHTML = `<span class="pick-flag">${ORIGIN_ICONS[id] || '⚽'}</span><div class="pick-body"><h3>${origin.label}</h3><p>${origin.description}</p></div>`;
    card.addEventListener('click', () => {
      selectedOriginId = id;
      showScreen('screen-playstyle');
      renderPlaystyleScreen();
    });
    grid.appendChild(card);
  }
}

const PLAYSTYLE_ICONS = { showman: '🎭', workhorse: '🔧', leader: '🧭', maverick: '🃏', calm: '🧊' };

function renderPlaystyleScreen() {
  const grid = document.getElementById('playstyle-grid');
  grid.innerHTML = '';
  for (const [id, style] of Object.entries(PLAYSTYLES)) {
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    card.innerHTML = `<span class="pick-flag">${PLAYSTYLE_ICONS[id] || '⚽'}</span><div class="pick-body"><h3>${style.label}</h3><p>${style.description}</p></div>`;
    card.addEventListener('click', () => {
      selectedPlaystyleId = id;
      showScreen('screen-position');
      renderPositionScreen();
    });
    grid.appendChild(card);
  }
}

const POSITION_ICONS = { gk: '🧤', def: '🛡️', mid: '🎯', att: '⚡' };

function renderPositionScreen() {
  const grid = document.getElementById('position-grid');
  grid.innerHTML = '';
  for (const [id, pos] of Object.entries(POSITIONS)) {
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    card.innerHTML = `<span class="pick-flag">${POSITION_ICONS[id] || '⚽'}</span><div class="pick-body"><h3>${pos.label}</h3><p>${pos.description}</p></div>`;
    card.addEventListener('click', () => {
      selectedPositionId = id;
      showScreen('screen-age');
      renderAgeScreen();
    });
    grid.appendChild(card);
  }
}

function renderAgeScreen() {
  const grid = document.getElementById('age-grid');
  grid.innerHTML = '';
  for (const [ageStr, profile] of Object.entries(STARTING_AGE_PROFILES)) {
    const age = Number(ageStr);
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    const seasons = estimateSeasonsRemaining(age);
    card.innerHTML = `<span class="pick-flag age-badge">${age}</span><div class="pick-body"><h3>${profile.label}</h3><p>${profile.description}</p><p class="age-seasons">~${seasons} saisons de carrière possibles</p></div>`;
    card.addEventListener('click', () => {
      selectedStartingAge = age;
      showScreen('screen-archetype');
      renderArchetypeScreen();
    });
    grid.appendChild(card);
  }
}

const ARCHETYPE_ICONS = { prodige_precoce: '🌟', joueur_ombre: '🌒', mercenaire: '💼' };

function renderArchetypeScreen() {
  const grid = document.getElementById('archetype-grid');
  grid.innerHTML = '';
  for (const [id, def] of Object.entries(ARCHETYPES)) {
    const card = document.createElement('div');
    card.className = 'archetype-card pick-card';
    card.innerHTML = `<span class="pick-flag">${ARCHETYPE_ICONS[id] || '⚽'}</span><div class="pick-body"><h3>${def.label}</h3><p>${archetypeDescription(id)}</p></div>`;
    card.addEventListener('click', () => {
      state = createNewState(enteredPlayerName, selectedNationalityId, selectedOriginId, selectedPlaystyleId, selectedPositionId, id, selectedStartingAge);
      saveGame(state);
      showScreen('screen-career');
      renderCareerBeat();
    });
    grid.appendChild(card);
  }
}

function archetypeDescription(id) {
  if (id === 'prodige_precoce') return "Tu perces tôt, sous les projecteurs. La pression et les jalousies suivront vite.";
  if (id === 'joueur_ombre') return "Personne ne t'attend. Il faudra du temps et de la patience avant de percer.";
  if (id === 'mercenaire') return "Peu attaché à un club, tu suis les meilleures offres, quitte à te faire des ennemis.";
  return '';
}

function renderCareerHeader() {
  const header = document.getElementById('career-header');
  const p = state.player;
  const nationality = NATIONALITIES[p.identity.nationalityId];
  const country = COUNTRIES[p.career.club.countryId];
  const natCountry = nationality ? COUNTRIES[nationality.countryId] : null;
  const currentYear = p.identity.birthYear + p.career.age;
  header.innerHTML = `
    <span>${natCountry ? natCountry.flag : '🏳️'} <strong>${p.identity.firstName}</strong> ${p.career.age} ans · ${currentYear}</span>
    <span><span class="tier-badge tier-${p.career.club.tier}">D${p.career.club.tier}</span><strong>${p.career.club.name}</strong> ${country ? country.flag : ''}</span>
  `;

  renderCareerStatsRow();
  renderGauges();
}

function renderCareerStatsRow() {
  const row = document.getElementById('career-stats-row');
  const p = state.player;
  const stars = Math.max(1, Math.min(5, Math.round(p.stats.reputation / 20)));
  row.innerHTML = `
    <div class="career-stat-pill"><div class="csp-value">⚡ ${Math.round(p.stats.formOverall)}</div><div class="csp-label">Forme</div></div>
    <div class="career-stat-pill"><div class="csp-value">${Math.round(p.wallet.cash / 1000)}k€</div><div class="csp-label">Cash</div></div>
    <div class="career-stat-pill"><div class="csp-value">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div><div class="csp-label">Potentiel</div></div>
  `;
}

function renderGauges() {
  const row = document.getElementById('gauge-row');
  const p = state.player;
  row.innerHTML = `
    <div class="gauge">
      <div class="gauge-label"><span>Forme</span><span>${Math.round(p.stats.formOverall)}</span></div>
      <div class="gauge-track"><div class="gauge-fill gauge-form" style="width:${Math.max(0, Math.min(100, p.stats.formOverall))}%"></div></div>
    </div>
    <div class="gauge">
      <div class="gauge-label"><span>Temps de jeu</span><span>${Math.round(p.career.playingTime)}</span></div>
      <div class="gauge-track"><div class="gauge-fill gauge-playtime" style="width:${Math.max(0, Math.min(100, p.career.playingTime))}%"></div></div>
    </div>
  `;
}

let statPanelOpen = false;

const TRACKED_STAT_ORDER = [
  ['technique', 'Technique'], ['physique', 'Physique'], ['mental', 'Mental'],
  ['tactique', 'Tactique'], ['reputation', 'Réputation'],
];

function renderStatPanel() {
  const panel = document.getElementById('stat-panel');
  if (!statPanelOpen) { panel.innerHTML = ''; panel.classList.remove('open'); return; }
  const p = state.player;
  const nationality = NATIONALITIES[p.identity.nationalityId];
  const origin = ORIGINS[p.identity.originId];
  const playstyle = PLAYSTYLES[p.identity.playstyleId];
  const rows = TRACKED_STAT_ORDER.map(([key, label]) => {
    const value = Math.round(p.stats[key]);
    return `
      <div class="stat-row">
        <span class="stat-row-label">${label}</span>
        <div class="stat-row-track"><div class="stat-row-fill" style="width:${Math.max(0, Math.min(100, value))}%"></div></div>
        <span class="stat-row-value">${value}</span>
      </div>`;
  }).join('');
  const traitChips = [
    origin ? `<span class="trait-chip">${ORIGIN_ICONS[p.identity.originId] || '⚽'} ${origin.label}</span>` : '',
    playstyle ? `<span class="trait-chip">${PLAYSTYLE_ICONS[p.identity.playstyleId] || '⚽'} ${playstyle.label}</span>` : '',
  ].join('');
  panel.classList.add('open');
  panel.innerHTML = `
    <div class="stat-panel-inner">
      <div class="trait-row">${traitChips}</div>
      ${rows}
      <p class="stat-panel-meta">Contrat : ${(p.career.contract.salaryWeekly * 52 / 1000).toFixed(0)}k€/an, ${p.career.contract.yearsLeft} an${p.career.contract.yearsLeft > 1 ? 's' : ''} restant${p.career.contract.yearsLeft > 1 ? 's' : ''} · Nationalité ${nationality ? nationality.label : '—'}</p>
    </div>
  `;
}

function toggleStatPanel() {
  statPanelOpen = !statPanelOpen;
  renderStatPanel();
}

function playBeatTransition(onComplete) {
  const area = document.getElementById('career-event-area');
  if (!area) { onComplete(); return; }
  area.classList.add('beat-out');
  setTimeout(() => {
    onComplete();
    area.classList.remove('beat-out');
    area.classList.add('beat-in');
    setTimeout(() => area.classList.remove('beat-in'), 260);
  }, 140);
}

function renderCareerBeat() {
  renderCareerHeader();
  renderStatPanel();
  currentChosen = advanceBeat(state, EVENTS);
  const { eventDef, resolvedActors } = currentChosen;

  const ctx = { season: state.player.career.season };
  for (const [key, charId] of Object.entries(resolvedActors)) {
    const c = state.characters[charId];
    ctx[key] = { name: c ? c.name : 'quelqu\'un' };
  }

  const card = document.getElementById('event-card');
  card.innerHTML = `<h3>${eventDef.text.title}</h3><p>${fillTemplate(eventDef.text.body, ctx)}</p>`;

  const list = document.getElementById('choice-list');
  list.innerHTML = '';
  for (const choice of eventDef.choices) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => {
      const before = snapshotTrackedValues(state);
      commitChoice(state, currentChosen, choice.id);
      const changes = diffTrackedValues(before, snapshotTrackedValues(state));
      advanceSeasonIfNeeded();
      saveGame(state);
      if (state.player.career.retired) {
        showScreen('screen-dashboard');
        renderDashboardScreen();
      } else {
        renderStatChanges(changes);
        playBeatTransition(() => renderCareerBeat());
      }
    });
    list.appendChild(btn);
  }
}

const TRACKED_STAT_LABELS = {
  technique: 'Technique', physique: 'Physique', mental: 'Mental', tactique: 'Tactique',
  reputation: 'Réputation', formOverall: 'Forme',
};

function snapshotTrackedValues(state) {
  return {
    stats: { ...state.player.stats },
    cash: state.player.wallet.cash,
    playingTime: state.player.career.playingTime,
  };
}

function diffTrackedValues(before, after) {
  const changes = [];
  for (const [stat, label] of Object.entries(TRACKED_STAT_LABELS)) {
    const delta = Math.round((after.stats[stat] - before.stats[stat]) * 10) / 10;
    if (Math.abs(delta) >= 0.1) changes.push({ label, delta });
  }
  const cashDelta = Math.round(after.cash - before.cash);
  if (cashDelta !== 0) changes.push({ label: 'Argent', delta: cashDelta, isMoney: true });
  const playTimeDelta = Math.round(after.playingTime - before.playingTime);
  if (playTimeDelta !== 0) changes.push({ label: 'Temps de jeu', delta: playTimeDelta });
  return changes;
}

function renderStatChanges(changes) {
  const container = document.getElementById('stat-changes');
  if (!container) return;
  if (!changes.length) { container.innerHTML = ''; return; }
  container.innerHTML = changes.map(c => {
    const sign = c.delta > 0 ? '+' : '';
    const cls = c.delta > 0 ? 'stat-up' : 'stat-down';
    const value = c.isMoney ? `${sign}${c.delta}€` : `${sign}${c.delta}`;
    return `<span class="stat-change ${cls}">${c.label} ${value}</span>`;
  }).join('');
}

const BEATS_PER_SEASON = 5;
let beatCounter = 0;

function updatePlayingTime(state) {
  const rival = findActiveRivalPoste(state);
  const rivalForm = rival ? rival.formLevel : 50;
  const delta = (state.player.stats.formOverall - rivalForm) * 0.3;
  state.player.career.playingTime = Math.max(5, Math.min(100, state.player.career.playingTime + delta * 0.2));
}

function advanceSeasonIfNeeded() {
  beatCounter++;
  if (beatCounter >= BEATS_PER_SEASON) {
    beatCounter = 0;

    // Bilan, trophée et événements de compétition évalués sur la saison qui s'achève,
    // avant d'incrémenter saison/âge.
    state.pendingSeasonRecap = true;
    if (state.player.stats.reputation >= 25) {
      state.pendingSeasonAward = runSeasonAward(state);
    }
    if (isClubEligibleForContinentalCup(state.player.career.club) && evaluateContinentalCupQualification(state)) {
      state.pendingContinentalCup = true;
    }
    if (state.player.career.season % INTERNATIONAL_TOURNAMENT.frequencySeasons === 0 && state.player.stats.reputation >= 35) {
      state.pendingInternationalTournament = true;
    }
    if (state.player.career.contract.yearsLeft <= 1) {
      state.pendingContractRenegotiation = true;
    } else if (computeSeasonPerformanceScore(state) >= 70) {
      state.pendingContractRenegotiation = true;
    }

    state.player.career.season++;
    state.player.career.age++;
    state.player.career.contract.yearsLeft = Math.max(0, state.player.career.contract.yearsLeft - 1);
    takeYearlySnapshot(state);
    resetSeasonMatchMoments(state);

    const grossIncome = state.player.career.contract.salaryWeekly * 52;
    const yearlyExpenses = state.player.wallet.monthlyExpenses * 12;
    state.player.wallet.cash += grossIncome - yearlyExpenses;
    state.player.wallet.careerEarnings += grossIncome;

    for (const club of CLUBS) driveClubPrestige(club, state);

    if (state.player.career.loan && (state.player.career.season - state.player.career.loan.startSeason) >= state.player.career.loan.durationSeasons) {
      state.player.career.history.push({ ...state.player.career.club, endSeason: state.player.career.season });
      state.player.career.club = state.player.career.loan.parentClubSnapshot;
      state.player.career.loan = null;
    }

    const offers = evaluateTransferMarket(state, CLUBS);
    if (offers.length) state.pendingTransferOffers.push(...offers);

    driveRivalPosteForm(state);
    updatePlayingTime(state);

    if (state.player.career.age >= RETIREMENT_AGE) {
      state.player.career.retired = true;
    }
  }
}

function renderDashboardScreen() {
  const body = document.getElementById('dashboard-body');
  const data = renderDashboard(state);
  body.innerHTML = `
    <div class="dash-section">
      <h4>Chiffres clés</h4>
      <div class="figure-grid">
        <div class="figure"><div class="value">${data.keyFigures.seasonsPlayed}</div><div class="label">Saisons jouées</div></div>
        <div class="figure"><div class="value">${data.keyFigures.clubsPlayed}</div><div class="label">Clubs traversés</div></div>
        <div class="figure"><div class="value">${data.keyFigures.cash}€</div><div class="label">Fortune</div></div>
        <div class="figure"><div class="value">${data.keyFigures.reputation}</div><div class="label">Réputation</div></div>
      </div>
    </div>
    <div class="dash-section">
      <h4>Relations marquantes</h4>
      ${data.relations.map(r => `
        <div class="relation-row">
          <span>${r.name} ${r.active ? '' : '(parti)'}</span>
          <span class="relation-bars"><span class="bar-trust">Confiance ${r.trust}</span><span class="bar-grudge">Rancune ${r.grudge}</span></span>
        </div>
      `).join('') || '<p class="journal-empty">Aucune relation marquante pour l\'instant.</p>'}
    </div>
    <div class="dash-section">
      <h4>Badges</h4>
      ${data.badges.map(b => `<span class="badge-chip">${b}</span>`).join('') || '<p class="journal-empty">Aucun badge débloqué pour l\'instant.</p>'}
    </div>
  `;
}

function renderJournalScreen() {
  const body = document.getElementById('journal-body');
  const entries = renderStoryLog(state, EVENTS);
  body.innerHTML = entries.length
    ? entries.map(e => `<div class="journal-entry">${e.text}</div>`).join('')
    : '<p class="journal-empty">Ton journal est encore vierge.</p>';
}

// --- Mode debug (?debug=1) : simule N carrières aléatoires pour repérer le contenu mort ---
function simulateCareerForDebug(archetypeId, beatsCount) {
  const s = createNewState(archetypeId);
  const seen = {};
  let localBeatCounter = 0;
  for (let beat = 0; beat < beatsCount; beat++) {
    const chosen = advanceBeat(s, EVENTS);
    seen[chosen.eventDef.id] = (seen[chosen.eventDef.id] || 0) + 1;
    const choice = chosen.eventDef.choices[Math.floor(Math.random() * chosen.eventDef.choices.length)];
    commitChoice(s, chosen, choice.id);
    localBeatCounter++;
    if (localBeatCounter >= BEATS_PER_SEASON) {
      localBeatCounter = 0;
      s.player.career.season++;
      s.player.career.age++;
      s.player.career.contract.yearsLeft = Math.max(0, s.player.career.contract.yearsLeft - 1);
      takeYearlySnapshot(s);
    }
  }
  return seen;
}

function runDebugDiagnostic(runsCount = 40, beatsPerRun = 95) {
  const globalSeen = {};
  const archetypes = Object.keys(ARCHETYPES);
  for (let i = 0; i < runsCount; i++) {
    const archetypeId = archetypes[i % archetypes.length];
    const seen = simulateCareerForDebug(archetypeId, beatsPerRun);
    for (const [id, count] of Object.entries(seen)) {
      globalSeen[id] = (globalSeen[id] || 0) + count;
    }
  }
  return globalSeen;
}

function renderDebugScreen() {
  const summary = document.getElementById('debug-summary');
  const body = document.getElementById('debug-body');
  summary.textContent = 'Simulation en cours...';
  body.innerHTML = '';

  setTimeout(() => {
    const runsCount = 40;
    const globalSeen = runDebugDiagnostic(runsCount, 95);
    const rows = EVENTS.map(e => ({ id: e.id, category: e.category, count: globalSeen[e.id] || 0 }));
    const dead = rows.filter(r => r.count === 0).length;
    const rare = rows.filter(r => r.count > 0 && r.count <= 2).length;

    summary.textContent = `${runsCount} carrières simulées (choix aléatoires) — ${EVENTS.length} événements dans le pool — ${dead} jamais déclenchés, ${rare} rares (≤2 fois).`;

    body.innerHTML = rows
      .sort((a, b) => a.count - b.count)
      .map(r => {
        const rowClass = r.count === 0 ? 'debug-dead' : (r.count <= 2 ? 'debug-rare' : '');
        const countClass = r.count === 0 ? 'debug-zero' : (r.count <= 2 ? 'debug-low' : 'debug-ok');
        return `<div class="debug-row ${rowClass}">
          <span class="debug-id">${r.id} <em>(${r.category})</em></span>
          <span class="debug-count ${countClass}">${r.count}</span>
        </div>`;
      })
      .join('');
  }, 30);
}

// --- Bootstrap ---
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('screen-name');
  renderNameScreen();
});

document.getElementById('btn-resume').addEventListener('click', () => {
  if (state) {
    showScreen('screen-career');
    renderCareerBeat();
  }
});

let dashboardReturnScreen = 'screen-home';

document.getElementById('btn-dashboard').addEventListener('click', () => {
  if (!state) return;
  dashboardReturnScreen = 'screen-home';
  showScreen('screen-dashboard');
  renderDashboardScreen();
});

document.getElementById('btn-dashboard-back').addEventListener('click', () => {
  showScreen(dashboardReturnScreen);
  if (dashboardReturnScreen === 'screen-career') renderCareerHeader();
});

document.getElementById('btn-toggle-stats').addEventListener('click', () => {
  if (!state) return;
  toggleStatPanel();
});

document.getElementById('btn-journal').addEventListener('click', () => {
  if (!state) return;
  showScreen('screen-journal');
  renderJournalScreen();
});
document.getElementById('btn-journal-back').addEventListener('click', () => showScreen('screen-home'));

document.getElementById('btn-debug-back').addEventListener('click', () => showScreen('screen-home'));

(function init() {
  const loaded = loadGame();
  if (loaded) {
    state = loaded;
    rebuildIndexes(state);
    document.getElementById('btn-resume').style.display = 'inline-block';
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === '1') {
    const debugBtn = document.createElement('button');
    debugBtn.className = 'btn-link';
    debugBtn.id = 'btn-debug';
    debugBtn.textContent = '🛠️ Debug';
    debugBtn.addEventListener('click', () => {
      showScreen('screen-debug');
      renderDebugScreen();
    });
    document.querySelector('.home-links').appendChild(debugBtn);
  }
})();
