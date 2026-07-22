// === STYLE DE JEU / SIGNATURE ===
// Trait de personnalité choisi à la création. Influence les stats de départ et
// pondère le pool d'événements (même mécanisme que ORIGINS/ARCHETYPES), donnant
// une vraie coloration narrative aux choix qui reviennent le plus souvent.

const PLAYSTYLES = {
  showman: {
    id: 'showman', label: 'Showman',
    description: "Tu joues pour le public. Chaque geste est une occasion de briller.",
    startingBonus: { reputation: 4, mental: -1 },
    eventWeightModifiers: { media: 1.3, fans: 1.3 },
  },
  workhorse: {
    id: 'workhorse', label: 'Bosseur silencieux',
    description: "Peu de mots, beaucoup d'efforts. Tu laisses le terrain parler pour toi.",
    startingBonus: { physique: 3, tactique: 2 },
    eventWeightModifiers: { coach: 1.2, teammate: 1.2 },
  },
  leader: {
    id: 'leader', label: 'Meneur naturel',
    description: "Tu prends les responsabilités sans qu'on te les demande.",
    startingBonus: { mental: 4, tactique: 1 },
    eventWeightModifiers: { teammate: 1.3, selection: 1.2 },
  },
  maverick: {
    id: 'maverick', label: 'Franc-tireur',
    description: "Tu n'en fais qu'à ta tête, pour le meilleur et pour le pire.",
    startingBonus: { technique: 3, mental: -2 },
    eventWeightModifiers: { rival: 1.3, transfer: 1.2 },
  },
  calm: {
    id: 'calm', label: 'Sang-froid',
    description: "Rien ne te déstabilise. Tu restes le même, sous pression ou non.",
    startingBonus: { mental: 5 },
    eventWeightModifiers: { injury: 0.8, media: 0.8 },
  },
};
