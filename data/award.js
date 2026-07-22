// === TROPHÉE INDIVIDUEL DE FIN DE SAISON ===
// Un classement basé sur les stats actuelles + les performances marquantes de la saison
// (moments de match réussis, prestige du club/compétitions jouées), pas juste un score figé.

const SEASON_AWARD = {
  id: 'season_award',
  label: 'Ballon Continental',
};

// Concurrents fictifs générés pour donner un vrai classement, pas juste un score isolé.
const AWARD_RIVAL_POOL = [
  'Yusuf Baran', 'Mateo Lindqvist', 'Kwame Osei', 'Diego Ferraro', 'Aleksander Kowalski',
  'Rui Monteiro', 'Ivo Petrović', 'Noel Fitzgerald', 'Tomás Herrera', 'Milan Vukić',
];

function computeSeasonPerformanceScore(state) {
  const s = state.player.stats;
  const club = state.player.career.club;

  // moments de match réussis cette saison (posés par le système de moments de match, voir matchmoments.js)
  const matchSuccesses = state.seasonMatchMoments?.successCount || 0;
  const matchAttempts = state.seasonMatchMoments?.attemptCount || 0;

  const baseScore = s.reputation * 0.35 + s.technique * 0.2 + s.tactique * 0.15 + s.mental * 0.1;
  const clubPrestigeBonus = club.prestige * 0.15;
  const matchBonus = matchAttempts > 0 ? (matchSuccesses / matchAttempts) * 15 : 0;

  return Math.round(baseScore + clubPrestigeBonus + matchBonus);
}

function runSeasonAward(state) {
  const playerScore = computeSeasonPerformanceScore(state);

  const rivals = AWARD_RIVAL_POOL
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map(name => ({ name, score: Math.round(30 + Math.random() * 65) }));

  const standings = [{ name: 'Toi', score: playerScore, isPlayer: true }, ...rivals]
    .sort((a, b) => b.score - a.score);

  const rank = standings.findIndex(entry => entry.isPlayer) + 1;
  return { rank, total: standings.length, standings, score: playerScore };
}

function resetSeasonMatchMoments(state) {
  state.seasonMatchMoments = { successCount: 0, attemptCount: 0 };
}

function buildSeasonAwardEvent(result) {
  const podium = result.rank <= 3;
  return {
    id: 'evt_dyn_season_award',
    category: 'media',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: SEASON_AWARD.label,
      body: podium
        ? `Le classement du ${SEASON_AWARD.label} vient de tomber : tu termines ${result.rank}${result.rank === 1 ? 'er' : 'ème'} sur ${result.total} !`
        : `Le classement du ${SEASON_AWARD.label} vient de tomber : tu termines ${result.rank}ème sur ${result.total}, en dehors du podium cette année.`,
    },
    choices: [
      {
        id: 'continue_award',
        label: 'Continuer',
        effects: result.rank === 1
          ? { stats: { reputation: 12, mental: 6 }, flags: [{ key: 'won_season_award' }] }
          : (podium ? { stats: { reputation: 6, mental: 3 } } : { stats: { mental: -1 } }),
      },
    ],
  };
}
