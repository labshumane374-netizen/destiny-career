// === ORIGINE SOCIALE ===
// D'où le joueur vient avant les projecteurs. Influence les stats de départ (empilé
// avec âge/nationalité/poste dans createNewState) et pondère légèrement le pool
// d'événements via eventWeightModifiers (même mécanisme que ARCHETYPES).

const ORIGINS = {
  academy: {
    id: 'academy', label: 'Centre de formation classique',
    description: "Un parcours académique, encadré et rigoureux depuis le plus jeune âge.",
    startingBonus: { tactique: 3, mental: 1 },
    eventWeightModifiers: { coach: 1.3 },
  },
  pro_family: {
    id: 'pro_family', label: 'Fils de sportif pro',
    description: "Un nom qui ouvre des portes, et une pression qui ne te quitte jamais.",
    startingBonus: { reputation: 8, mental: -2 },
    eventWeightModifiers: { media: 1.4, fans: 1.2 },
  },
  working_class: {
    id: 'working_class', label: 'Quartier populaire',
    description: "Tout appris dans la rue et sur des terrains vagues, à la dure.",
    startingBonus: { physique: 4, mental: 3 },
    eventWeightModifiers: { money: 1.3, family: 1.2 },
  },
  futsal: {
    id: 'futsal', label: 'Prodige du futsal',
    description: "Des pieds en or forgés en salle. Le grand terrain reste à apprivoiser.",
    startingBonus: { technique: 6, physique: -2 },
    eventWeightModifiers: { teammate: 1.2 },
  },
  late_bloomer: {
    id: 'late_bloomer', label: 'Révélé sur le tard',
    description: "Personne ne croyait en toi. Le physique et la rage comme seuls bagages.",
    startingBonus: { physique: 5, technique: -3, mental: 2 },
    eventWeightModifiers: { rival: 1.3 },
  },
};
