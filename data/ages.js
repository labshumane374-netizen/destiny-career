// === ÂGE DE DÉPART ===
// Double effet validé : stats de départ ET bande de tier de clubs éligibles.
// Le trade-off "moins de saisons totales" reste implicite via l'âge de retraite (35 ans).

const STARTING_AGE_PROFILES = {
  16: {
    label: '16 ans — Espoir précoce',
    description: "Tu intègres un centre de formation. Peu de bagage, mais toute une carrière devant toi.",
    statBonus: { technique: 0, physique: 0, mental: 0, tactique: 0, reputation: 0, formOverall: 0 },
    clubTierRange: [4, 4],
    contractYears: 3,
  },
  17: {
    label: '17 ans — Jeune espoir',
    description: "Tu sors tout juste de l'académie, avec quelques matchs pros dans les jambes.",
    statBonus: { technique: 3, physique: 2, mental: 0, tactique: 2, reputation: 2, formOverall: 0 },
    clubTierRange: [3, 4],
    contractYears: 3,
  },
  18: {
    label: '18 ans — Prêt à percer',
    description: "Ta première vraie saison chez les pros s'annonce, avec un peu plus d'exigence.",
    statBonus: { technique: 6, physique: 5, mental: 3, tactique: 4, reputation: 5, formOverall: 0 },
    clubTierRange: [2, 4],
    contractYears: 3,
  },
  19: {
    label: '19 ans — Semi-professionnel',
    description: "Tu as déjà quelques saisons complètes derrière toi, un profil plus mature.",
    statBonus: { technique: 9, physique: 8, mental: 5, tactique: 6, reputation: 8, formOverall: 0 },
    clubTierRange: [1, 3],
    contractYears: 2,
  },
  20: {
    label: '20 ans — Déjà expérimenté',
    description: "Un joueur formé, capable d'intégrer directement un club ambitieux — mais avec moins de saisons devant toi.",
    statBonus: { technique: 12, physique: 10, mental: 8, tactique: 8, reputation: 12, formOverall: 0 },
    clubTierRange: [1, 2],
    contractYears: 2,
  },
};

const RETIREMENT_AGE = 35;

function estimateSeasonsRemaining(startingAge) {
  return RETIREMENT_AGE - startingAge;
}
