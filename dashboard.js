// === DASHBOARD ===
// Tableau de bord : chiffres clés, courbe de stats (snapshots annuels), relations, badges.
// Badges dérivés par le même évaluateur de conditions que les événements (engine.js).

function takeYearlySnapshot(state) {
  const activeChars = Object.values(state.characters).filter(c => c.active);
  const trustAvg = activeChars.length ? activeChars.reduce((s, c) => s + c.relation.trust, 0) / activeChars.length : 0;
  const grudgeMax = activeChars.length ? Math.max(...activeChars.map(c => c.relation.grudge)) : 0;

  state.yearlySnapshots.push({
    season: state.player.career.season,
    age: state.player.career.age,
    club: state.player.career.club.id,
    countryId: state.player.career.club.countryId,
    tier: state.player.career.club.tier,
    prestige: state.player.career.club.prestige,
    reputation: state.player.stats.reputation,
    technique: state.player.stats.technique,
    cash: state.player.wallet.cash,
    trustAvg: Math.round(trustAvg),
    grudgeMax,
  });
}

function computeEarnedBadges(state) {
  return BADGES.filter(badge => evalConditions(badge.condition, state, { resolvedActors: {} }));
}

function getRelationHighlights(state) {
  return Object.values(state.characters)
    .sort((a, b) => (Math.abs(b.relation.trust - 50) + b.relation.grudge) - (Math.abs(a.relation.trust - 50) + a.relation.grudge))
    .slice(0, 10);
}

function renderDashboard(state) {
  const badges = computeEarnedBadges(state);
  const relations = getRelationHighlights(state);
  const clubsPlayed = new Set(state.player.career.history.map(h => h.club)).size + 1;

  return {
    keyFigures: {
      seasonsPlayed: state.player.career.season,
      clubsPlayed,
      cash: state.player.wallet.cash,
      reputation: state.player.stats.reputation,
    },
    statsCurve: state.yearlySnapshots,
    relations: relations.map(c => ({ name: c.name, role: c.role, trust: c.relation.trust, grudge: c.relation.grudge, active: c.active })),
    badges: badges.map(b => b.label),
  };
}
