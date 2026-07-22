// === CHARACTER POOLS ===
// Pools de noms/rôles pour générer des PNJ différents à chaque partie.
// Pas d'instances ici : juste la matière première piochée par generateCharacter().

const ARCHETYPES = {
  prodige_precoce: {
    label: 'Prodige précoce',
    startingBonus: { technique: 15, reputation: 10 },
    eventWeightModifiers: { media: 2.0, injury: 1.5, rival: 1.8 },
    lockedEvents: ['evt_late_bloomer_doubt'],
  },
  joueur_ombre: {
    label: "Joueur de l'ombre",
    startingBonus: { mental: 10 },
    eventWeightModifiers: { teammate: 1.6, coach: 1.8 },
  },
  mercenaire: {
    label: 'Mercenaire',
    startingBonus: { technique: 5, physique: 5 },
    eventWeightModifiers: { transfer: 2.5, money: 1.7 },
    lockedEvents: ['evt_boyhood_club_loyalty'],
  },
};

const NAME_POOLS = {
  firstName: [
    'Karim', 'Yanis', 'Théo', 'Bastien', 'Amadou', 'Léo', 'Rayan', 'Malo',
    'Antoine', 'Jules', 'Nabil', 'Enzo', 'Samir', 'Hugo', 'Idriss', 'Maxime',
    'Younes', 'Gabin', 'Tom', 'Sofiane',
  ],
  lastName: [
    'Ndoye', 'Berthier', 'Vasquez', 'Lemoine', 'Traoré', 'Fontaine', 'Kader',
    'Girard', 'Belkacem', 'Rousseau', 'Diallo', 'Mercier', 'Haddad', 'Perrin',
    'Kouassi', 'Charrier', 'Benali', 'Lacroix', 'Sissoko', 'Verdier',
  ],
};

const ROLE_POOLS = {
  coach: { archetypeTags: ['strict', 'mentor_bienveillant', 'tacticien_froid'] },
  agent: { archetypeTags: ['requin_affaires', 'loyal_discret', 'ambitieux_pressant'] },
  teammate: { archetypeTags: ['veteran_leader', 'jeune_rival_poste', 'boute_en_train', 'perfectionniste'] },
  rival: { archetypeTags: ['arrogant', 'respectueux_competitif', 'sournois'] },
  journalist: { archetypeTags: ['a_charge', 'admiratif', 'investigateur'] },
  family: { archetypeTags: ['protecteur', 'exigeant', 'discret_absent'] },
};

function generateCharacter(state, role, position) {
  const usedNames = new Set(Object.values(state.characters).map(c => c.name));
  let name;
  let attempts = 0;
  do {
    const first = NAME_POOLS.firstName[Math.floor(Math.random() * NAME_POOLS.firstName.length)];
    const last = NAME_POOLS.lastName[Math.floor(Math.random() * NAME_POOLS.lastName.length)];
    name = `${first} ${last}`;
    attempts++;
  } while (usedNames.has(name) && attempts < 20);

  const tags = ROLE_POOLS[role].archetypeTags;
  const archetypeTag = tags[Math.floor(Math.random() * tags.length)];
  const id = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

  const character = {
    id,
    name,
    role,
    archetypeTag,
    position: position || null,
    formLevel: position ? 50 : null,
    firstMetSeason: state.player.career.season,
    active: true,
    relation: { trust: 50, grudge: 0 },
    tags: [],
    lastInteractionSeason: state.player.career.season,
  };
  state.characters[id] = character;
  return character;
}

function initialCast(state) {
  generateCharacter(state, 'coach');
  generateCharacter(state, 'agent');
  generateCharacter(state, 'teammate', state.player.identity.position);
  generateCharacter(state, 'teammate');
  generateCharacter(state, 'rival');
  generateCharacter(state, 'journalist');
  generateCharacter(state, 'family');
}

function findActiveRivalPoste(state) {
  const position = state.player.identity.position;
  return Object.values(state.characters).find(
    c => c.active && c.role === 'teammate' && c.position === position
  );
}

function driveRivalPosteForm(state) {
  const rival = findActiveRivalPoste(state);
  if (!rival) return;
  rival.formLevel = Math.max(10, Math.min(90, rival.formLevel + (Math.random() - 0.5) * 8));
}
