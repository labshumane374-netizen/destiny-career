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

// === BILAN DE SAISON ===
// Récapitulatif systématique en fin de saison (matchs, buts, passes, note, classement
// du club, salaire perçu), distinct du trophée individuel (qui suppose un seuil de
// réputation). Génère aussi un titre de presse fictif variant selon la performance.

function estimateSeasonMatchesPlayed(state) {
  const playingTime = state.player.career.playingTime ?? 50;
  return Math.round(18 + (playingTime / 100) * 20);
}

function computeSeasonRating(state) {
  const s = state.player.stats;
  const base = (s.formOverall + s.technique + s.tactique + s.mental) / 4;
  return Math.max(3, Math.min(9.5, base / 10));
}

const SEASON_RECAP_HEADLINES = {
  excellent: [
    "{name}, révélation de la saison — {club} tient sa pépite",
    "{name} illumine {club} : une saison de très haute volée",
    "{name} sur une autre planète, {club} jubile",
  ],
  good: [
    "{name} confirme, {club} avance sereinement",
    "Saison solide pour {name} et {club}",
    "{name} monte en puissance à {club}",
  ],
  average: [
    "{name}, une saison sans éclat à {club}",
    "{club} : {name} cherche encore son rythme",
    "{name} entre deux eaux cette saison",
  ],
  poor: [
    "{name}, l'année blanche : le déclassement guette",
    "{club} déçoit, {name} en première ligne des critiques",
    "{name} traverse une saison à oublier",
  ],
};

function pickSeasonHeadline(tier, playerName, clubName) {
  const pool = SEASON_RECAP_HEADLINES[tier];
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template.replace('{name}', playerName).replace('{club}', clubName);
}

function buildSeasonRecapEvent(state) {
  const matches = estimateSeasonMatchesPlayed(state);
  const goals = state.seasonMatchStats?.goals || 0;
  const assists = state.seasonMatchStats?.assists || 0;
  const rating = computeSeasonRating(state);
  const club = state.player.career.club;
  const division = findClubDivisionLabel(club);
  const seasonIncome = Math.round((state.player.career.contract.salaryWeekly * 52) / 100000) / 10;

  let tier = 'average';
  if (rating >= 7.5) tier = 'excellent';
  else if (rating >= 6.2) tier = 'good';
  else if (rating < 5) tier = 'poor';

  const clubRank = Math.max(1, Math.min(18, Math.round(20 - club.prestige / 6 + (Math.random() - 0.5) * 4)));
  const headline = pickSeasonHeadline(tier, state.player.identity.firstName, club.name);

  return {
    id: 'evt_dyn_season_recap',
    category: 'media',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: `Saison ${state.player.identity.birthYear + state.player.career.age - 1}-${String(state.player.career.age).slice(-2)} · ${club.name}`,
      body: `« ${headline} »\n\n📊 ${matches} matchs · ${goals} buts · ${assists} passes déc. · note ${rating.toFixed(1)}\n\nChampionnat (${division}) : ${clubRank}e`,
    },
    choices: [
      {
        id: 'continue_recap',
        label: 'Continuer',
        effects: { wallet: { cashDelta: 0 } },
      },
    ],
  };
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
