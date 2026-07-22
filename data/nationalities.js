// === NATIONALITÉ ===
// Vrais noms de pays (domaine public, pas des marques déposées). Fédérations et
// championnats restent fictifs. Distincte du pays de club : un joueur peut être
// d'une nationalité et évoluer dans un championnat d'un autre pays. Influence les
// stats de départ et, indirectement, le niveau du club de départ (difficultyModifier).

const NATIONALITIES = {
  fr: {
    id: 'fr', label: 'France', countryId: 'fr', federation: 'Fédération Continentale Ouest',
    startingBonus: { technique: 2, tactique: 1 }, difficultyModifier: 1.05,
  },
  en: {
    id: 'en', label: 'Angleterre', countryId: 'en', federation: 'Fédération Continentale Ouest',
    startingBonus: { physique: 3 }, difficultyModifier: 1.1,
  },
  es: {
    id: 'es', label: 'Espagne', countryId: 'es', federation: 'Fédération Continentale Sud',
    startingBonus: { technique: 3 }, difficultyModifier: 1.05,
  },
  de: {
    id: 'de', label: 'Allemagne', countryId: 'de', federation: 'Fédération Continentale Centrale',
    startingBonus: { physique: 2, tactique: 2 }, difficultyModifier: 1.05,
  },
  br: {
    id: 'br', label: 'Brésil', countryId: 'br', federation: 'Confédération Australe',
    startingBonus: { technique: 4, mental: 1 }, difficultyModifier: 0.9,
  },
  ar: {
    id: 'ar', label: 'Argentine', countryId: 'ar', federation: 'Confédération Australe',
    startingBonus: { technique: 3, mental: 2 }, difficultyModifier: 0.9,
  },
  ma: {
    id: 'ma', label: 'Maroc', countryId: 'ma', federation: 'Union Sportive du Sahel',
    startingBonus: { physique: 2, mental: 3 }, difficultyModifier: 0.85,
  },
  sn: {
    id: 'sn', label: 'Sénégal', countryId: 'sn', federation: 'Union Sportive du Sahel',
    startingBonus: { physique: 4 }, difficultyModifier: 0.85,
  },
  jp: {
    id: 'jp', label: 'Japon', countryId: 'jp', federation: 'Fédération Pacifique',
    startingBonus: { tactique: 3, mental: 1 }, difficultyModifier: 0.85,
  },
  us: {
    id: 'us', label: 'États-Unis', countryId: 'us', federation: 'Confédération Atlantique Nord',
    startingBonus: { physique: 3, mental: 1 }, difficultyModifier: 0.85,
  },
};

// Pondère le tirage du club de départ selon difficultyModifier : une nationalité
// à formation exigeante (modifier haut) tire davantage vers le bas de la fourchette
// de tier éligible, une nationalité moins structurée (modifier bas) tire vers le haut.
function pickStartingClubByNationality(eligibleClubs, nationality) {
  if (eligibleClubs.length === 0) return null;
  const sorted = [...eligibleClubs].sort((a, b) => b.prestige - a.prestige);
  const modifier = nationality?.difficultyModifier ?? 1;
  // modifier > 1 => biais vers le bas du classement (index élevé), modifier < 1 => vers le haut
  const bias = Math.max(0, Math.min(1, (modifier - 0.8) / 0.4)); // ramène [0.85,1.1] vers [~0.12, ~0.75]
  const index = Math.min(sorted.length - 1, Math.floor(bias * sorted.length + Math.random() * (sorted.length * 0.4)));
  return sorted[index];
}
