// === POSTE ===
// Gardien / Défenseur / Milieu / Attaquant. Influence les stats de départ (empilé
// avec âge/nationalité dans createNewState) et filtre les moments de match éligibles
// via eligiblePositions (data/matchmoments.js).

const POSITIONS = {
  gk: {
    id: 'gk', label: 'Gardien de but',
    description: "Le dernier rempart. Chaque erreur se paie cash, chaque arrêt peut sauver un match.",
    startingBonus: { mental: 6, tactique: 3, technique: -4, physique: 1 },
  },
  def: {
    id: 'def', label: 'Défenseur',
    description: "Le roc de l'équipe. Solidité et sens du placement avant tout.",
    startingBonus: { physique: 5, tactique: 4, technique: -3 },
  },
  mid: {
    id: 'mid', label: 'Milieu de terrain',
    description: "Le métronome. Vision de jeu et équilibre entre les lignes.",
    startingBonus: { tactique: 5, technique: 2, physique: -2 },
  },
  att: {
    id: 'att', label: 'Attaquant',
    description: "Le finisseur. On retient les buts, pas les efforts défensifs.",
    startingBonus: { technique: 5, mental: 2, tactique: -3 },
  },
};
