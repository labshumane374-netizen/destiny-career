// === EVENT POOL ===
// Chaque événement : conditions déclaratives (fact/op/value), actors résolus dynamiquement,
// texte template, choices avec effects (stats/relation/flags/scheduleFlag).
// Premier lot (~24) couvrant : coéquipiers, coach, agent/transferts, famille, médias, rivaux.

const EVENTS = [

  // --- CATÉGORIE : TEAMMATE ---
  {
    id: 'evt_party_invite_snub',
    category: 'teammate',
    weight: 10,
    cooldownSeasons: null,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Une soirée entre coéquipiers',
      body: '{primary.name} organise une soirée pour souder le groupe et t\'invite. Tu es fatigué et tu n\'as pas très envie d\'y aller.',
    },
    choices: [
      { id: 'go', label: 'Y aller quand même', effects: { relation: [{ target: 'primary', trust: 10 }], stats: { formOverall: -2 } } },
      {
        id: 'skip', label: 'Décliner poliment',
        effects: {
          relation: [{ target: 'primary', grudge: 15 }],
          flags: [{ key: 'snubbed_teammate', characterId: '$primary', data: { context: "la soirée d'intégration" } }],
        },
      },
    ],
  },

  {
    id: 'evt_teammate_grudge_payback',
    category: 'teammate',
    weight: 14,
    cooldownSeasons: null,
    maxOccurrences: 1,
    conditions: {
      all: [
        { fact: 'career.season', op: '>=', value: 2 },
        { fact: 'flag', key: 'snubbed_teammate', op: '==', value: true },
      ],
    },
    actors: { primary: { role: 'teammate', filter: { grudge: { gt: 10 } }, pick: 'highestGrudge' } },
    text: {
      title: 'Un vieux compte à régler',
      body: '{primary.name} n\'a jamais digéré {flag.snubbed_teammate.data.context}. Devant tout le vestiaire, il te lance une pique bien sentie.',
    },
    choices: [
      { id: 'apologize', label: "T'excuser publiquement", effects: { relation: [{ target: 'primary', trust: 15, grudge: -30 }], stats: { mental: -2 }, flags: [{ key: 'publicly_apologized', characterId: '$primary' }] } },
      { id: 'double_down', label: 'Hausser les épaules', effects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: -3 }, flags: [{ key: 'refused_apology', characterId: '$primary' }], scheduleFlag: { key: 'locker_room_incident', inSeasons: 1 } } },
    ],
  },

  {
    id: 'evt_locker_room_crisis',
    category: 'teammate',
    weight: 12,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'world_tag', op: '==', value: true }] },
    text: {
      title: 'Tensions dans le vestiaire',
      body: 'L\'ambiance du groupe s\'est dégradée ces derniers temps. Le coach convoque une réunion pour crever l\'abcès.',
    },
    choices: [
      { id: 'mediate', label: 'Prendre la parole pour apaiser', effects: { stats: { mental: 5, reputation: 3 } } },
      { id: 'stay_silent', label: 'Rester en retrait', effects: { stats: { mental: -1 } } },
    ],
  },

  {
    id: 'evt_veteran_mentorship',
    category: 'teammate',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un conseil de vestiaire',
      body: '{primary.name} te prend à part après l\'entraînement pour te donner un conseil sur ton positionnement.',
    },
    choices: [
      { id: 'listen', label: "Écouter attentivement", effects: { relation: [{ target: 'primary', trust: 12 }], stats: { tactique: 4 } } },
      { id: 'brush_off', label: "Balayer d'un revers de main", effects: { relation: [{ target: 'primary', grudge: 8 }] } },
    ],
  },

  {
    id: 'evt_teammate_rivalry_position',
    category: 'teammate',
    weight: 9,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Concurrence directe',
      body: 'Le coach hésite entre toi et {primary.name} pour le prochain match. La tension est palpable à l\'entraînement.',
    },
    choices: [
      {
        id: 'push_harder', label: "Pousser plus fort à l'entraînement",
        successCheck: { stats: [{ stat: 'physique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 50 },
        effects: { stats: { physique: 3, formOverall: 5 }, relation: [{ target: 'primary', grudge: 10 }] },
        failureEffects: { stats: { formOverall: -3, mental: -2 }, relation: [{ target: 'primary', grudge: 5 }] },
        resultText: {
          success: "Tes efforts payent, le coach remarque ta progression.",
          failure: "Tu forces trop et t'épuises sans convaincre le coach.",
        },
      },
      { id: 'respect', label: 'Rester fair-play', effects: { relation: [{ target: 'primary', trust: 10 }] } },
    ],
  },

  {
    id: 'evt_teammate_secret_confided',
    category: 'teammate',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.trust', of: 'any_active_teammate', op: '>', value: 60 }] },
    actors: { primary: { role: 'teammate', filter: { trust: { gt: 60 } }, pick: 'highestTrust' } },
    text: {
      title: 'Une confidence',
      body: '{primary.name} te confie en privé qu\'il traverse une période personnelle difficile et te demande de garder ça pour toi.',
    },
    choices: [
      { id: 'keep_secret', label: 'Garder le secret', effects: { relation: [{ target: 'primary', trust: 20 }], flags: [{ key: 'kept_teammate_secret', characterId: '$primary' }] } },
      { id: 'leak_secret', label: 'En parler à quelqu\'un d\'autre', effects: { relation: [{ target: 'primary', grudge: 25, trust: -20 }], scheduleFlag: { key: 'secret_betrayal_discovered', characterId: '$primary', inSeasons: 1 } } },
    ],
  },

  {
    id: 'evt_secret_betrayal_discovered',
    category: 'teammate',
    weight: 13,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'secret_betrayal_discovered', op: '==', value: true }] },
    text: {
      title: 'La confiance trahie',
      body: 'Ton coéquipier apprend que son secret a circulé dans le vestiaire. Il sait que ça vient de toi.',
    },
    choices: [
      { id: 'own_it', label: 'Assumer et t\'excuser', effects: { stats: { mental: -3 } } },
      { id: 'deny_it', label: 'Nier en bloc', effects: { stats: { reputation: -5 }, flags: [{ key: 'known_liar' }] } },
    ],
  },

  {
    id: 'evt_teammate_captain_vote',
    category: 'teammate',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 5 }, { fact: 'stats.reputation', op: '>=', value: 40 }] },
    text: {
      title: 'Le brassard de capitaine',
      body: 'Le groupe doit voter pour désigner le nouveau capitaine. Ton nom circule.',
    },
    choices: [
      {
        id: 'campaign', label: 'Faire campagne discrètement',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 55 },
        effects: { stats: { reputation: 5 } },
        failureEffects: { stats: { reputation: -4 } },
        resultText: {
          success: "Ta discrète campagne porte ses fruits, le groupe te fait confiance.",
          failure: "Ta démarche s'ébruite et passe pour un calcul, ça se retourne contre toi.",
        },
      },
      { id: 'let_it_come', label: 'Laisser le vote se faire naturellement', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_teammate_language_barrier',
    category: 'teammate',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Nouvelle recrue isolée',
      body: '{primary.name} vient d\'arriver et peine à s\'intégrer, isolé par la barrière de la langue.',
    },
    choices: [
      { id: 'help_integrate', label: 'L\'aider à s\'intégrer', effects: { relation: [{ target: 'primary', trust: 20 }] } },
      { id: 'ignore_newcomer', label: 'Rester dans ton cercle habituel', effects: {} },
    ],
  },

  {
    id: 'evt_teammate_credit_stolen',
    category: 'teammate',
    weight: 9,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un mérite usurpé',
      body: 'Après une victoire, {primary.name} s\'attribue en interview une passe décisive que tu avais faite pour lui, sans te mentionner.',
    },
    choices: [
      { id: 'let_go', label: 'Laisser couler', effects: { stats: { mental: 3 } } },
      {
        id: 'call_out', label: 'Le reprendre publiquement',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: 2 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 25 }], stats: { reputation: -5 } },
        resultText: {
          success: "Le groupe te donne raison, la vérité est rétablie sans trop de casse.",
          failure: "Ta sortie publique passe pour de la mesquinerie et ton image en pâtit.",
        },
      },
    ],
  },

  {
    id: 'evt_teammate_locker_prank',
    category: 'teammate',
    weight: 5,
    maxOccurrences: 2,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Une blague de vestiaire',
      body: '{primary.name} te fait une blague potache devant tout le groupe.',
    },
    choices: [
      { id: 'laugh_along', label: 'Rire avec le groupe', effects: { relation: [{ target: 'primary', trust: 10 }] } },
      { id: 'take_offense', label: 'Mal le prendre', effects: { relation: [{ target: 'primary', grudge: 12 }] } },
    ],
  },

  {
    id: 'evt_teammate_injury_cover',
    category: 'teammate',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Couvrir un blessé',
      body: '{primary.name} joue blessé sans le dire au staff et te demande de ne rien dire pour ne pas perdre sa place.',
    },
    choices: [
      { id: 'cover_for_him', label: 'Le couvrir', effects: { relation: [{ target: 'primary', trust: 18 }], flags: [{ key: 'covered_hidden_injury', characterId: '$primary' }] } },
      { id: 'tell_staff', label: 'Prévenir le staff médical', effects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: 2 } } },
    ],
  },

  {
    id: 'evt_teammate_penalty_dispute',
    category: 'teammate',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Qui tire le penalty ?',
      body: 'Un penalty décisif est à tirer, et {primary.name} et toi le réclamez tous les deux.',
    },
    choices: [
      {
        id: 'insist_take_it', label: 'Insister pour le tirer toi-même',
        successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'technique', weight: 0.4 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 15 }], stats: { reputation: 4 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: -4 } },
        resultText: {
          success: "Tu transformes le penalty, ton insistance était justifiée.",
          failure: "Tu le manques, et ton insistance parait maintenant déplacée.",
        },
      },
      { id: 'let_him_take_it', label: 'Le lui laisser', effects: { relation: [{ target: 'primary', trust: 18 }] } },
    ],
  },

  {
    id: 'evt_teammate_mental_health_support',
    category: 'teammate',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un coéquipier en difficulté',
      body: '{primary.name} traverse une période sombre et s\'isole de plus en plus du groupe.',
    },
    choices: [
      { id: 'reach_out_teammate', label: 'Aller vers lui régulièrement', effects: { relation: [{ target: 'primary', trust: 25 }], stats: { mental: 3 } } },
      { id: 'give_space', label: 'Lui laisser de l\'espace sans intervenir', effects: {} },
    ],
  },

  {
    id: 'evt_teammate_leadership_gap',
    category: 'teammate',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un vide à combler',
      body: 'Après le départ du capitaine historique, {primary.name} et toi semblez être les deux prétendants naturels à un rôle de leader.',
    },
    choices: [
      {
        id: 'step_up_leadership', label: "T'imposer naturellement comme leader",
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 60 },
        effects: { stats: { reputation: 5 }, relation: [{ target: 'primary', grudge: 8 }] },
        failureEffects: { stats: { reputation: -3 }, relation: [{ target: 'primary', grudge: 12 }] },
        resultText: {
          success: "Le vestiaire suit naturellement ton autorité nouvellement affirmée.",
          failure: "Ta tentative de t'imposer sonne creux et divise plus qu'elle ne rassemble.",
        },
      },
      { id: 'support_his_lead', label: 'Le soutenir dans ce rôle', effects: { relation: [{ target: 'primary', trust: 20 }] } },
    ],
  },

  {
    id: 'evt_teammate_generational_gap',
    category: 'teammate',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 30 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Le fossé des générations',
      body: 'Beaucoup plus jeune, {primary.name} a une approche du métier et des réseaux sociaux qui te semble parfois déroutante.',
    },
    choices: [
      { id: 'bridge_gap', label: 'Faire l\'effort de comprendre sa génération', effects: { relation: [{ target: 'primary', trust: 18 }] } },
      { id: 'stay_old_school', label: 'Rester campé sur tes méthodes', effects: { relation: [{ target: 'primary', grudge: 6 }] } },
    ],
  },

  {
    id: 'evt_teammate_style_clash',
    category: 'teammate',
    weight: 6,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Incompatibilité de jeu',
      body: 'Tes automatismes de jeu ne collent pas du tout avec ceux de {primary.name}, ce qui crée des situations confuses sur le terrain.',
    },
    choices: [
      {
        id: 'adapt_to_him', label: "T'adapter à son style",
        successCheck: { stats: [{ stat: 'tactique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 45 },
        effects: { relation: [{ target: 'primary', trust: 12 }], stats: { tactique: 3 } },
        failureEffects: { stats: { tactique: -2 } },
        resultText: {
          success: "Tu trouves la bonne alchimie et le duo fonctionne enfin sur le terrain.",
          failure: "Malgré tes efforts, les automatismes ne collent toujours pas entre vous.",
        },
      },
      { id: 'demand_he_adapts', label: 'Attendre qu\'il s\'adapte à toi', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_teammate_training_bet',
    category: 'teammate',
    weight: 5,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un défi amical',
      body: '{primary.name} te lance un défi à l\'entraînement, perdant paie le repas du groupe.',
    },
    choices: [
      {
        id: 'accept_bet', label: 'Accepter le défi',
        successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'technique', weight: 0.5 }], difficulty: 45 },
        effects: { relation: [{ target: 'primary', trust: 12 }], stats: { formOverall: 3 } },
        failureEffects: { relation: [{ target: 'primary', trust: 3 }], stats: { formOverall: -2 } },
        resultText: {
          success: "Tu remportes le défi, l'ambiance du groupe s'en trouve resserrée.",
          failure: "Tu perds le défi sous les rires du groupe, sans rancune mais sans gloire non plus.",
        },
      },
      { id: 'decline_bet', label: 'Décliner, pas d\'humeur à jouer', effects: { relation: [{ target: 'primary', grudge: 5 }] } },
    ],
  },

  {
    id: 'evt_teammate_farewell',
    category: 'teammate',
    weight: 6,
    maxOccurrences: 2,
    cooldownSeasons: 4,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un départ dans le groupe',
      body: '{primary.name} annonce son transfert vers un autre club. C\'est la fin d\'une aventure commune.',
    },
    choices: [
      { id: 'warm_goodbye', label: 'Lui souhaiter le meilleur chaleureusement', effects: { relation: [{ target: 'primary', trust: 15 }], flags: [{ key: 'warm_farewell', characterId: '$primary' }] } },
      { id: 'cold_goodbye', label: 'Rester distant', effects: {} },
    ],
  },

  // --- CATÉGORIE : COACH ---
  {
    id: 'evt_club_demand_starting_role',
    category: 'coach',
    weight: 8,
    maxOccurrences: 1,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'career.playingTime', op: '<', value: 40 }, { fact: 'stats.formOverall', op: '>=', value: 60 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Demander sa place de titulaire',
      body: 'Tu sens que tu mérites plus de temps de jeu. Tu décides d\'aller en discuter directement avec {primary.name}.',
    },
    choices: [
      {
        id: 'ask_for_starting_role', label: 'Demander clairement à être titularisé',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 55 },
        effects: { playingTime: 15, relation: [{ target: 'primary', trust: 8 }] },
        failureEffects: { relation: [{ target: 'primary', grudge: 12 }], stats: { mental: -3 } },
        resultText: {
          success: "Le coach entend ta demande et t'accorde plus de responsabilités.",
          failure: "Le coach reste sur ses positions, la discussion tourne court.",
        },
      },
      { id: 'wait_patiently', label: 'Rester patient et continuer à travailler', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_club_accept_rotation_role',
    category: 'coach',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.playingTime', op: '>=', value: 40 }, { fact: 'career.playingTime', op: '<=', value: 60 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Un rôle de rotation',
      body: '{primary.name} t\'explique qu\'il compte sur toi comme un élément clé de la rotation de l\'effectif, sans garantie de titularisation systématique.',
    },
    choices: [
      { id: 'accept_rotation', label: 'Accepter ce rôle avec professionnalisme', effects: { stats: { mental: 4 }, relation: [{ target: 'primary', trust: 10 }] } },
      { id: 'refuse_rotation', label: 'Exprimer ton désaccord', effects: { relation: [{ target: 'primary', grudge: 8 }] } },
    ],
  },

  {
    id: 'evt_club_request_loan_for_playtime',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.playingTime', op: '<', value: 25 }, { fact: 'career.contract.yearsLeft', op: '>=', value: 2 }] },
    text: {
      title: 'Demander un prêt pour jouer',
      body: 'Ton temps de jeu s\'est réduit à peau de chagrin. Tu envisages de demander toi-même un prêt pour retrouver du rythme ailleurs.',
    },
    choices: [
      { id: 'request_loan_playtime', label: 'Demander un prêt au club', effects: { flags: [{ key: 'went_on_loan' }], scheduleFlag: { key: 'loan_offer_ready', inSeasons: 0 } } },
      { id: 'fight_for_spot', label: 'Continuer à te battre pour ta place', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_coach_tactical_demand',
    category: 'coach',
    weight: 10,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Exigence tactique',
      body: '{primary.name} te demande de changer ton style de jeu pour coller à son schéma tactique. Ça ne te convient qu\'à moitié.',
    },
    choices: [
      { id: 'comply', label: 'Obéir sans discuter', effects: { relation: [{ target: 'primary', trust: 15 }], stats: { tactique: 3, mental: -2 } } },
      {
        id: 'push_back', label: 'Défendre ton style',
        successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'reputation', weight: 0.4 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 12 }], stats: { mental: 3 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 20 }], stats: { mental: -3 } },
        resultText: {
          success: "Le coach concède un compromis et respecte ta prise de position.",
          failure: "Le coach ferme le dialogue, ta démarche n'a rien changé.",
        },
      },
    ],
  },

  {
    id: 'evt_coach_bench_decision',
    category: 'coach',
    weight: 11,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Sur le banc',
      body: '{primary.name} te laisse sur le banc pour un match important sans explication claire.',
    },
    choices: [
      {
        id: 'confront', label: 'Demander des comptes',
        successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'reputation', weight: 0.4 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 15 }], stats: { reputation: 2 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 22 }], stats: { reputation: -3 } },
        resultText: {
          success: "Le coach reconnaît tes arguments et t'explique franchement sa décision.",
          failure: "Le coach mal reçoit ta démarche et se braque encore plus.",
        },
      },
      { id: 'accept', label: 'Accepter et travailler plus dur', effects: { relation: [{ target: 'primary', trust: 10 }], stats: { formOverall: 4 } } },
    ],
  },

  {
    id: 'evt_coach_trust_reward',
    category: 'coach',
    weight: 9,
    conditions: { all: [{ fact: 'relation.trust', of: 'any_active_coach', op: '>', value: 70 }] },
    actors: { primary: { role: 'coach', pick: 'highestTrust' } },
    text: {
      title: 'La confiance du coach',
      body: '{primary.name} t\'annonce qu\'il compte sur toi comme cadre de l\'équipe la saison prochaine.',
    },
    choices: [
      { id: 'accept_role', label: 'Accepter ce rôle avec fierté', effects: { stats: { reputation: 8, mental: 5 } } },
    ],
  },

  {
    id: 'evt_coach_fired',
    category: 'coach',
    weight: 5,
    maxOccurrences: 2,
    cooldownSeasons: 4,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Changement de coach',
      body: 'Après une série de mauvais résultats, le club limoge {primary.name}. Un nouveau coach arrive.',
    },
    choices: [
      { id: 'adapt', label: "S'adapter au changement", effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_coach_favoritism',
    category: 'coach',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Favoritisme suspecté',
      body: 'Tu remarques que {primary.name} favorise systématiquement certains joueurs dans la rotation, sans lien évident avec le niveau de jeu.',
    },
    choices: [
      {
        id: 'raise_concern', label: 'Aborder le sujet directement avec lui',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 10 }], stats: { mental: 3 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 18 }], stats: { mental: -3 } },
        resultText: {
          success: "Le coach entend ta remarque et se montre plus attentif ensuite.",
          failure: "Le coach prend mal la remarque et se braque, la rotation ne change pas.",
        },
      },
      { id: 'stay_quiet', label: 'Ne rien dire et redoubler d\'efforts', effects: { stats: { formOverall: 4 } } },
    ],
  },

  {
    id: 'evt_coach_private_advice',
    category: 'coach',
    weight: 9,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Un tête-à-tête',
      body: '{primary.name} te convoque en privé pour te parler franchement de ta progression et de tes lacunes.',
    },
    choices: [
      { id: 'take_criticism', label: 'Accepter la critique avec humilité', effects: { relation: [{ target: 'primary', trust: 15 }], stats: { mental: 5 } } },
      { id: 'reject_criticism', label: 'Te justifier point par point', effects: { relation: [{ target: 'primary', grudge: 8 }] } },
    ],
  },

  {
    id: 'evt_coach_risky_tactic',
    category: 'coach',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Un pari tactique',
      body: 'Avant un match décisif, {primary.name} veut te positionner à un poste inhabituel pour surprendre l\'adversaire.',
    },
    choices: [
      {
        id: 'trust_plan', label: 'Lui faire confiance',
        successCheck: { stats: [{ stat: 'tactique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 60 },
        effects: { relation: [{ target: 'primary', trust: 15 }], stats: { tactique: 5 } },
        failureEffects: { relation: [{ target: 'primary', trust: -8 }], stats: { tactique: -3 } },
        resultText: {
          success: "Le pari tactique fonctionne à merveille et surprend l'adversaire.",
          failure: "Le pari tactique échoue et te met en difficulté à ce poste inhabituel.",
        },
      },
      { id: 'doubt_plan', label: 'Exprimer tes doutes', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_coach_public_praise',
    category: 'coach',
    weight: 7,
    conditions: { all: [{ fact: 'stats.formOverall', op: '>=', value: 60 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Éloges publics',
      body: 'En conférence de presse, {primary.name} te couvre d\'éloges devant les médias.',
    },
    choices: [
      { id: 'thank_publicly', label: 'Le remercier publiquement en retour', effects: { relation: [{ target: 'primary', trust: 15 }], stats: { reputation: 4 } } },
      { id: 'stay_neutral', label: 'Rester neutre, méfiant de la pression', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_coach_ultimatum',
    category: 'coach',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.grudge', of: 'any_active_coach', op: '>', value: 50 }] },
    actors: { primary: { role: 'coach', filter: { grudge: { gt: 50 } }, pick: 'highestGrudge' } },
    text: {
      title: 'Ultimatum du coach',
      body: '{primary.name}, excédé par vos tensions répétées, te met en garde : un faux pas de plus et tu seras écarté du groupe.',
    },
    choices: [
      { id: 'fall_in_line', label: 'Te ranger et faire profil bas', effects: { relation: [{ target: 'primary', grudge: -20 }], stats: { mental: -3 } } },
      { id: 'stand_defiant', label: 'Rester campé sur tes positions', effects: { relation: [{ target: 'primary', grudge: 15 }], scheduleFlag: { key: 'coach_benching_threat', characterId: '$primary', inSeasons: 1 } } },
    ],
  },

  {
    id: 'evt_coach_new_arrival_style_clash',
    category: 'coach',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Un nouveau projet de jeu',
      body: '{primary.name} arrive avec une philosophie de jeu radicalement différente de celle à laquelle tu es habitué.',
    },
    choices: [
      {
        id: 'embrace_change', label: "T'adapter avec enthousiasme",
        successCheck: { stats: [{ stat: 'tactique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 50 },
        effects: { relation: [{ target: 'primary', trust: 15 }], stats: { tactique: 5 } },
        failureEffects: { relation: [{ target: 'primary', trust: -5 }], stats: { tactique: -2 } },
        resultText: {
          success: "Tu assimiles vite la nouvelle philosophie et convaincs le coach.",
          failure: "Tu peines à intégrer ce nouveau projet de jeu, non sans le remarquer.",
        },
      },
      { id: 'resist_change', label: 'Résister au changement', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_coach_succession_plan',
    category: 'coach',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.trust', of: 'any_active_coach', op: '>', value: 75 }, { fact: 'player.age', op: '>=', value: 29 }] },
    actors: { primary: { role: 'coach', filter: { trust: { gt: 75 } }, pick: 'highestTrust' } },
    text: {
      title: 'Un plan de succession',
      body: '{primary.name} t\'annonce discrètement qu\'il te verrait bien lui succéder un jour comme entraîneur du club.',
    },
    choices: [
      { id: 'welcome_succession_idea', label: 'Accueillir cette idée avec intérêt', effects: { relation: [{ target: 'primary', trust: 15 }], flags: [{ key: 'succession_path_opened' }] } },
      { id: 'dismiss_succession_idea', label: 'Ne pas t\'y projeter pour l\'instant', effects: {} },
    ],
  },

  {
    id: 'evt_coach_experimental_role',
    category: 'coach',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Un rôle hybride',
      body: '{primary.name} veut t\'essayer à un poste totalement différent de celui où tu excelles habituellement.',
    },
    choices: [
      {
        id: 'embrace_experiment', label: 'Te prêter au jeu avec curiosité',
        successCheck: { stats: [{ stat: 'tactique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { tactique: 6, formOverall: -3 } },
        failureEffects: { stats: { tactique: -2, formOverall: -6 } },
        resultText: {
          success: "L'expérience te fait progresser malgré la perte de repères.",
          failure: "Tu ne trouves jamais tes marques à ce nouveau poste et ta forme en pâtit.",
        },
      },
      { id: 'refuse_experiment', label: 'Refuser de sortir de ta zone de confort', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_coach_family_emergency',
    category: 'coach',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Une absence inattendue',
      body: '{primary.name} doit s\'absenter en urgence pour raisons personnelles juste avant un match clé, laissant le groupe désemparé.',
    },
    choices: [
      {
        id: 'rally_team', label: 'Prendre les devants pour rassurer le groupe',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { reputation: 4, mental: 3 } },
        failureEffects: { stats: { reputation: -2, mental: -2 } },
        resultText: {
          success: "Le groupe se ressoude autour de toi malgré l'absence du coach.",
          failure: "Ta prise d'initiative est mal perçue et sème plus de confusion que d'ordre.",
        },
      },
      { id: 'wait_for_instructions', label: 'Attendre les instructions de l\'adjoint', effects: {} },
    ],
  },

  {
    id: 'evt_coach_benching_threat',
    category: 'coach',
    weight: 11,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'coach_benching_threat', op: '==', value: true }] },
    text: {
      title: 'La menace se concrétise',
      body: 'Comme annoncé, tu es écarté du groupe pour plusieurs matchs consécutifs.',
    },
    choices: [
      { id: 'work_silently', label: 'Travailler dur en silence pour revenir', effects: { stats: { formOverall: 6, mental: 4 } } },
      { id: 'demand_transfer', label: 'Demander à partir', effects: { flags: [{ key: 'requested_transfer' }] } },
    ],
  },

  // --- CATÉGORIE : AGENT / TRANSFER ---
  {
    id: 'evt_agent_distrust_setup',
    category: 'transfer',
    weight: 10,
    maxOccurrences: 1,
    conditions: {
      all: [
        { fact: 'career.contract.yearsLeft', op: '<=', value: 1 },
        { fact: 'relation.trust', of: 'any_active_agent', op: '<', value: 40 },
      ],
    },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Un contrat à signer',
      body: 'Ton contrat arrive à échéance. {primary.name} te propose une offre de prolongation, mais quelque chose sonne faux dans les termes.',
    },
    choices: [
      { id: 'sign_anyway', label: 'Signer sans trop poser de questions', effects: { scheduleFlag: { key: 'agent_lowball_reveal', characterId: '$primary', inSeasons: 1 }, flags: [{ key: 'signed_despite_distrust', characterId: '$primary' }] } },
      { id: 'demand_clarity', label: 'Exiger des explications', effects: { relation: [{ target: 'primary', trust: -10, grudge: 10 }], stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_agent_lowball_reveal',
    category: 'transfer',
    weight: 12,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'agent_lowball_reveal', op: '==', value: true }] },
    text: {
      title: "La commission cachée",
      body: 'Tu découvres que ton agent a pris une commission largement supérieure à ce qui était convenu.',
    },
    choices: [
      { id: 'fire_agent', label: 'Le renvoyer sur-le-champ', effects: { relation: [{ target: 'primary', grudge: 40, trust: -30 }], stats: { reputation: -2 } } },
      { id: 'forgive', label: 'Passer l\'éponge', effects: { relation: [{ target: 'primary', trust: 5 }] } },
    ],
  },

  {
    id: 'evt_transfer_offer_foreign',
    category: 'transfer',
    weight: 13,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }, { fact: 'stats.reputation', op: '>=', value: 20 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: "Offre venue d'ailleurs",
      body: '{primary.name} t\'annonce qu\'un club étranger s\'intéresse à toi, avec un salaire bien supérieur.',
    },
    choices: [
      { id: 'move', label: 'Saisir cette opportunité', effects: { stats: { reputation: 6 }, flags: [{ key: 'moved_abroad' }] } },
      { id: 'stay', label: 'Rester fidèle à ton club', effects: { relation: [{ target: 'primary', trust: -5 }], flags: [{ key: 'stayed_loyal' }] } },
    ],
  },

  {
    id: 'evt_boyhood_club_loyalty',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    text: {
      title: 'Le club formateur',
      body: 'Ton club formateur traverse une crise financière et te demande de baisser ton salaire pour l\'aider.',
    },
    choices: [
      { id: 'accept_cut', label: 'Accepter la baisse de salaire', effects: { stats: { reputation: 5 } } },
      {
        id: 'refuse', label: 'Refuser et négocier ton départ',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { reputation: -3 } },
        failureEffects: { stats: { reputation: -8 } },
        resultText: {
          success: "Ton départ se négocie dans des conditions correctes malgré la tension.",
          failure: "Ton refus est mal perçu par tes anciens supporters et écorne ton image.",
        },
      },
    ],
  },

  {
    id: 'evt_agent_pushes_move',
    category: 'transfer',
    weight: 10,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 } ] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Ton agent insiste',
      body: '{primary.name} te pousse à demander un transfert, arguant que rester ici stagne ta carrière.',
    },
    choices: [
      { id: 'trust_agent', label: 'Suivre son conseil', effects: { relation: [{ target: 'primary', trust: 12 }], flags: [{ key: 'requested_transfer' }] } },
      { id: 'ignore_agent', label: 'Décider de rester malgré tout', effects: { relation: [{ target: 'primary', grudge: 8 }] } },
    ],
  },

  {
    id: 'evt_agent_conflict_of_interest',
    category: 'transfer',
    weight: 9,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Conflit d\'intérêts',
      body: 'Tu apprends que {primary.name} représente aussi un joueur du club qui pourrait te concurrencer directement pour une place de titulaire.',
    },
    choices: [
      {
        id: 'address_directly', label: 'Lui en parler franchement',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 50 },
        effects: { relation: [{ target: 'primary', trust: 10 }] },
        failureEffects: { relation: [{ target: 'primary', grudge: 15, trust: -5 }] },
        resultText: {
          success: "La discussion franche clarifie la situation et rassure tout le monde.",
          failure: "La discussion tourne mal, ton agent se sent accusé et se braque.",
        },
      },
      { id: 'change_agent', label: 'Chercher un nouvel agent', effects: { relation: [{ target: 'primary', grudge: 20, trust: -15 }] } },
    ],
  },

  {
    id: 'evt_transfer_release_clause',
    category: 'transfer',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 55 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Clause libératoire',
      body: '{primary.name} négocie l\'ajout d\'une clause libératoire dans ton prochain contrat, qui te donnerait plus de liberté de mouvement.',
    },
    choices: [
      {
        id: 'insist_clause', label: 'Insister pour l\'obtenir',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 55 },
        effects: { stats: { reputation: 3 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 8 }], stats: { reputation: -2 } },
        resultText: {
          success: "Le club cède et la clause est intégrée au contrat.",
          failure: "Le club refuse net, ton insistance a un peu tendu la négociation.",
        },
      },
      { id: 'drop_clause', label: 'Laisser tomber pour rassurer le club', effects: { relation: [{ target: 'primary', grudge: 5 }] } },
    ],
  },

  {
    id: 'evt_transfer_deadline_drama',
    category: 'transfer',
    weight: 10,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'career.contract.yearsLeft', op: '<=', value: 1 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Dernier jour du mercato',
      body: 'Le mercato ferme dans quelques heures et {primary.name} t\'appelle en urgence : une offre de dernière minute vient d\'arriver.',
    },
    choices: [
      { id: 'jump_at_it', label: 'Sauter sur l\'occasion', effects: { flags: [{ key: 'last_minute_transfer' }] } },
      { id: 'let_it_pass', label: 'Laisser passer, trop précipité', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_agent_rival_poaching',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 40 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Une tentative de débauchage',
      body: 'Un agent concurrent tente de te convaincre de quitter {primary.name} pour le rejoindre lui, avec des promesses alléchantes.',
    },
    choices: [
      { id: 'stay_with_agent', label: 'Rester fidèle à {primary.name}', effects: { relation: [{ target: 'primary', trust: 20 }] } },
      { id: 'switch_agent', label: 'Changer d\'agent', effects: { relation: [{ target: 'primary', grudge: 25, trust: -20 }] } },
    ],
  },

  {
    id: 'evt_transfer_hostile_takeover_rumor',
    category: 'transfer',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    text: {
      title: 'Rumeurs de rachat du club',
      body: 'Des rumeurs circulent sur un possible rachat de ton club par un nouveau propriétaire, créant une incertitude générale.',
    },
    choices: [
      { id: 'wait_and_see', label: 'Attendre d\'y voir plus clair', effects: { stats: { mental: 3 } } },
      { id: 'explore_options', label: 'Explorer discrètement d\'autres options', effects: { flags: [{ key: 'explored_other_clubs' }] } },
    ],
  },

  {
    id: 'evt_transfer_bidding_war',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 60 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Une guerre d\'enchères',
      body: 'Plusieurs grands clubs se disputent ta signature, et {primary.name} savoure la situation autant qu\'il la gère.',
    },
    choices: [
      { id: 'choose_project', label: 'Choisir le club au meilleur projet sportif', effects: { stats: { reputation: 5 } } },
      { id: 'choose_money', label: 'Choisir l\'offre financière la plus haute', effects: { relation: [{ target: 'primary', trust: 10 }] } },
    ],
  },

  {
    id: 'evt_transfer_medical_fail',
    category: 'transfer',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'last_minute_transfer', op: '==', value: true }] },
    text: {
      title: 'Une visite médicale tendue',
      body: 'Le transfert négocié en urgence bute sur des doutes du staff médical du club acheteur.',
    },
    choices: [
      {
        id: 'reassure_medical', label: 'Fournir tous les examens complémentaires demandés',
        successCheck: { stats: [{ stat: 'physique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 50 },
        effects: { stats: { mental: -2 } },
        failureEffects: { stats: { mental: -5 }, flags: [{ key: 'pushed_out' }] },
        resultText: {
          success: "Les examens rassurent le club acheteur, le transfert peut se conclure.",
          failure: "Les doutes médicaux persistent et le club acheteur se retire finalement.",
        },
      },
      { id: 'walk_away', label: 'Abandonner ce transfert', effects: { stats: { reputation: -3 } } },
    ],
  },

  {
    id: 'evt_transfer_loan_proposal',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.formOverall', op: '<=', value: 40 }, { fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Un prêt pour relancer ta carrière',
      body: '{primary.name} suggère un prêt temporaire dans un club plus modeste pour retrouver du rythme.',
    },
    choices: [
      {
        id: 'accept_loan', label: 'Accepter le prêt',
        effects: { flags: [{ key: 'went_on_loan' }], scheduleFlag: { key: 'loan_offer_ready', inSeasons: 0 } },
      },
      { id: 'refuse_loan', label: 'Refuser et te battre pour ta place', effects: { stats: { mental: 5 } } },
    ],
  },

  {
    id: 'evt_transfer_unwanted',
    category: 'transfer',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.grudge', of: 'any_active_coach', op: '>', value: 60 }] },
    actors: { primary: { role: 'coach', filter: { grudge: { gt: 60 } }, pick: 'highestGrudge' } },
    text: {
      title: 'Poussé vers la sortie',
      body: 'Le club, sous l\'impulsion de {primary.name}, te fait clairement comprendre que ton avenir est ailleurs.',
    },
    choices: [
      { id: 'fight_for_place', label: 'Te battre pour rester', effects: { stats: { mental: 5 } } },
      { id: 'accept_exit', label: 'Accepter de partir', effects: { flags: [{ key: 'pushed_out' }] } },
    ],
  },

  // --- CATÉGORIE : FAMILY ---
  {
    id: 'evt_family_pressure_visit',
    category: 'family',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Visite de la famille',
      body: '{primary.name} vient te voir et te rappelle tous les sacrifices faits pour que tu arrives ici.',
    },
    choices: [
      { id: 'reassure', label: 'Les rassurer et prendre du temps pour eux', effects: { relation: [{ target: 'primary', trust: 15 }], stats: { mental: 4 } } },
      { id: 'brush_off_family', label: "Écourter la visite, tu es occupé", effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_family_financial_help',
    category: 'family',
    weight: 9,
    maxOccurrences: 2,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Un coup de main financier',
      body: '{primary.name} traverse une passe difficile et te demande de l\'aide financière.',
    },
    choices: [
      { id: 'help', label: "L'aider financièrement", effects: { wallet: { cashDelta: -3000 }, relation: [{ target: 'primary', trust: 20 }], flags: [{ key: 'helped_family_financially', characterId: '$primary' }] } },
      { id: 'decline_help', label: 'Décliner poliment', effects: { relation: [{ target: 'primary', grudge: 15 }] } },
    ],
  },

  {
    id: 'evt_teammate_fund_project',
    category: 'teammate',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.trust', of: 'any_active_teammate', op: '>', value: 60 }] },
    actors: { primary: { role: 'teammate', filter: { trust: { gt: 60 } }, pick: 'highestTrust' } },
    text: {
      title: 'Un projet à financer',
      body: '{primary.name} monte un petit projet personnel (académie de foot, commerce local) et te sollicite pour un investissement.',
    },
    choices: [
      { id: 'fund_project', label: 'Financer le projet', effects: { wallet: { cashDelta: -5000 }, relation: [{ target: 'primary', trust: 15 }] } },
      { id: 'decline_project', label: 'Décliner poliment', effects: {} },
    ],
  },

  {
    id: 'evt_coach_support_request',
    category: 'coach',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Une association du coach',
      body: '{primary.name} soutient une association caritative locale et te demande d\'y contribuer financièrement.',
    },
    choices: [
      { id: 'support_coach_cause', label: 'Contribuer', effects: { wallet: { cashDelta: -1500 }, relation: [{ target: 'primary', trust: 12 }], stats: { reputation: 3 } } },
      { id: 'decline_coach_cause', label: 'Décliner', effects: {} },
    ],
  },

  {
    id: 'evt_family_missed_moment',
    category: 'family',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Un moment manqué',
      body: 'Un match important tombe le même jour qu\'un événement familial organisé par {primary.name}.',
    },
    choices: [
      { id: 'prioritize_family', label: 'Prioriser la famille', effects: { relation: [{ target: 'primary', trust: 20 }], stats: { formOverall: -3 } } },
      { id: 'prioritize_career', label: 'Prioriser le match', effects: { relation: [{ target: 'primary', grudge: 15 }], stats: { reputation: 3 } } },
    ],
  },

  {
    id: 'evt_family_overbearing_advice',
    category: 'family',
    weight: 7,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Des conseils envahissants',
      body: '{primary.name} s\'immisce de plus en plus dans tes décisions de carrière, jusqu\'à contacter ton club directement.',
    },
    choices: [
      { id: 'set_boundary', label: 'Poser une limite claire', effects: { relation: [{ target: 'primary', grudge: 12 }], stats: { mental: 4 } } },
      { id: 'let_them', label: 'Les laisser faire pour éviter le conflit', effects: { relation: [{ target: 'primary', trust: 8 }], stats: { mental: -2 } } },
    ],
  },

  {
    id: 'evt_family_pride_moment',
    category: 'family',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Une fierté visible',
      body: '{primary.name} assiste à un de tes matchs les plus importants et pleure de fierté dans les tribunes.',
    },
    choices: [
      { id: 'dedicate_moment', label: 'Lui dédier ta performance publiquement', effects: { relation: [{ target: 'primary', trust: 25 }], stats: { reputation: 3 } } },
      { id: 'stay_focused', label: 'Rester concentré sur le jeu', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_family_sibling_jealousy',
    category: 'family',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 30 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Une jalousie fraternelle',
      body: '{primary.name} peine à vivre dans l\'ombre de ta réussite et devient distant.',
    },
    choices: [
      { id: 'include_them', label: 'Les inclure davantage dans ta vie publique', effects: { relation: [{ target: 'primary', trust: 18 }] } },
      { id: 'let_it_be', label: 'Laisser la situation se tasser d\'elle-même', effects: {} },
    ],
  },

  {
    id: 'evt_family_watching_from_afar',
    category: 'family',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'moved_abroad', op: '==', value: true }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Suivre ta carrière de loin',
      body: 'Depuis ton transfert à l\'étranger, {primary.name} ne peut plus suivre tes matchs qu\'à la télévision, à des horaires décalés.',
    },
    choices: [
      { id: 'organize_visits', label: 'Organiser des visites régulières', effects: { relation: [{ target: 'primary', trust: 20 }] } },
      { id: 'rely_on_calls', label: 'Se contenter d\'appels vidéo', effects: { relation: [{ target: 'primary', trust: 5 }] } },
    ],
  },

  {
    id: 'evt_family_reunion_conflict',
    category: 'family',
    weight: 5,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Un repas de famille tendu',
      body: 'Lors d\'un repas de famille, {primary.name} critique ouvertement certains de tes choix de vie devant tout le monde.',
    },
    choices: [
      { id: 'defend_yourself', label: 'Te défendre calmement', effects: { relation: [{ target: 'primary', grudge: 10 }], stats: { mental: 3 } } },
      { id: 'let_it_slide', label: 'Laisser passer pour ne pas envenimer', effects: { relation: [{ target: 'primary', trust: 8 }] } },
    ],
  },

  {
    id: 'evt_family_generational_gift',
    category: 'family',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 40 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Un cadeau pour toute la famille',
      body: 'Avec tes premiers gros revenus, tu envisages d\'offrir une maison à {primary.name} pour le remercier de son soutien.',
    },
    choices: [
      { id: 'give_house', label: 'Offrir ce cadeau généreux', effects: { relation: [{ target: 'primary', trust: 30 }] } },
      { id: 'invest_instead', label: 'Investir cet argent plutôt', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_family_new_addition',
    category: 'family',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    text: {
      title: 'Un heureux événement',
      body: 'Ta famille s\'agrandit. La nouvelle bouleverse joyeusement ton quotidien de sportif de haut niveau.',
    },
    choices: [
      { id: 'take_time_off', label: 'Prendre du temps pour en profiter pleinement', effects: { stats: { mental: 10, formOverall: -3 } } },
      { id: 'quick_return', label: 'Reprendre rapidement l\'entraînement', effects: { stats: { formOverall: 4 } } },
    ],
  },

  {
    id: 'evt_family_estrangement',
    category: 'family',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.grudge', of: 'any_active_family', op: '>', value: 55 }] },
    actors: { primary: { role: 'family', filter: { grudge: { gt: 55 } }, pick: 'highestGrudge' } },
    text: {
      title: 'L\'éloignement',
      body: 'Les tensions accumulées avec {primary.name} ont fini par créer une vraie distance entre vous.',
    },
    choices: [
      { id: 'reach_out', label: 'Faire le premier pas pour renouer', effects: { relation: [{ target: 'primary', trust: 20, grudge: -25 }] } },
      { id: 'accept_distance', label: 'Accepter cette distance', effects: { stats: { mental: -3 } } },
    ],
  },

  // --- CATÉGORIE : MEDIA ---
  {
    id: 'evt_journalist_interview_trap',
    category: 'media',
    weight: 11,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 15 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Une interview piégeuse',
      body: '{primary.name} te pose une question ambiguë sur ton coéquipier lors d\'une interview d\'après-match.',
    },
    choices: [
      {
        id: 'diplomatic', label: 'Répondre de façon diplomate',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 45 },
        effects: { stats: { reputation: 4 } },
        failureEffects: { stats: { reputation: -3 }, flags: [{ key: 'media_controversy' }] },
        resultText: {
          success: "Ta réponse habile désamorce le piège sans froisser personne.",
          failure: "Ta réponse maladroite tombe quand même dans le piège de la question.",
        },
      },
      { id: 'blunt', label: 'Répondre franchement, quitte à choquer', effects: { stats: { reputation: -2 }, flags: [{ key: 'media_controversy' }] } },
    ],
  },

  // --- ÉVÉNEMENTS PAR POSTE ---
  {
    id: 'evt_media_scapegoat_gk',
    category: 'media',
    weight: 8,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'gk' }, { fact: 'stats.formOverall', op: '<=', value: 40 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Le gardien sous le feu des critiques',
      body: 'Après une série de matchs sans clean sheet, {primary.name} écrit un article qui te désigne comme le principal problème de l\'équipe.',
    },
    choices: [
      {
        id: 'stand_firm_gk', label: 'Rester droit dans tes crampons',
        successCheck: { stats: [{ stat: 'mental', weight: 0.7 }, { stat: 'tactique', weight: 0.3 }], difficulty: 52 },
        effects: { stats: { mental: 5, formOverall: 4 } },
        failureEffects: { stats: { mental: -4, reputation: -3 } },
        resultText: { success: "Tu encaisses la pression et reviens plus solide.", failure: "La pression te ronge, la spirale continue." },
      },
      {
        id: 'seek_tactical_support', label: 'Demander un soutien tactique au coach',
        effects: { stats: { tactique: 3 } },
      },
    ],
  },

  {
    id: 'evt_media_scoring_drought_st',
    category: 'media',
    weight: 8,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'att' }, { fact: 'stats.formOverall', op: '<=', value: 40 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'La sécheresse de buts',
      body: '{primary.name} publie un décompte précis du nombre de matchs sans marquer, alimentant le doute autour de ta finition.',
    },
    choices: [
      {
        id: 'work_on_finishing', label: 'Retravailler ta finition sans relâche',
        successCheck: { stats: [{ stat: 'technique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 52 },
        effects: { stats: { technique: 4, formOverall: 5 } },
        failureEffects: { stats: { mental: -4 } },
        resultText: { success: "Le travail paie, tes automatismes reviennent.", failure: "Le doute s'installe encore un peu plus." },
      },
      {
        id: 'ignore_the_noise', label: 'Ignorer complètement le bruit médiatique',
        effects: { stats: { mental: 3 } },
      },
    ],
  },

  {
    id: 'evt_teammate_scapegoat_df',
    category: 'teammate',
    weight: 7,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'def' }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Le bouc émissaire défensif',
      body: 'Après une lourde défaite, {primary.name} blâme publiquement la défense dans le vestiaire, toi en premier lieu.',
    },
    choices: [
      { id: 'defend_yourself_df', label: 'Te défendre calmement devant le groupe', effects: { relation: [{ target: 'primary', grudge: 8 }], stats: { mental: 3 } } },
      { id: 'take_the_blame_df', label: 'Encaisser sans répondre', effects: { relation: [{ target: 'primary', trust: 8 }], stats: { mental: -3 } } },
    ],
  },

  {
    id: 'evt_coach_tactical_overload_mid',
    category: 'coach',
    weight: 7,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'mid' }] },
    actors: { primary: { role: 'coach', pick: 'random' } },
    text: {
      title: 'Une double mission',
      body: 'Faute d\'effectif suffisant, {primary.name} te demande de couvrir à la fois la récupération et la construction du jeu.',
    },
    choices: [
      { id: 'accept_overload', label: 'Accepter cette double mission', effects: { stats: { tactique: 4, formOverall: -3 } } },
      { id: 'refuse_overload', label: 'Refuser, trop exigeant physiquement', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_media_penalty_aftermath_gk',
    category: 'media',
    weight: 6,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'gk' }, { fact: 'flag', key: 'conceded_costly_goal', op: '==', value: true }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Le lendemain du penalty',
      body: 'Au lendemain d\'un but encaissé sur penalty, {primary.name} te demande de revenir en détail sur ton choix de plongeon.',
    },
    choices: [
      { id: 'analyze_calmly_gk', label: 'Analyser calmement ta décision', effects: { stats: { mental: 4, reputation: 2 } } },
      { id: 'deflect_question_gk', label: 'Éluder la question', effects: { stats: { reputation: -2 } } },
    ],
  },

  {
    id: 'evt_transfer_market_pressure_st',
    category: 'transfer',
    weight: 6,
    conditions: { all: [{ fact: 'player.position', op: '==', value: 'att' }, { fact: 'stats.reputation', op: '>=', value: 55 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Les recruteurs s\'agitent',
      body: 'Après une saison prolifique, {primary.name} t\'annonce que plusieurs clubs se renseignent activement sur ta clause de départ.',
    },
    choices: [
      { id: 'welcome_interest_st', label: 'Accueillir cet intérêt avec plaisir', effects: { relation: [{ target: 'primary', trust: 10 }], stats: { reputation: 3 } } },
      { id: 'stay_grounded_st', label: 'Rester concentré sur le club actuel', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_media_controversy_fallout',
    category: 'media',
    weight: 10,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'media_controversy', op: '==', value: true }] },
    text: {
      title: 'Les retombées médiatiques',
      body: 'Ta déclaration a fait réagir. Le club te demande de clarifier ta position en conférence de presse.',
    },
    choices: [
      { id: 'clarify', label: 'Clarifier et t\'excuser', effects: { stats: { reputation: 3 } } },
      { id: 'stand_ground', label: 'Maintenir ta position', effects: { stats: { reputation: -4 }, flags: [{ key: 'stubborn_public_image' }] } },
    ],
  },

  {
    id: 'evt_media_hype_article',
    category: 'media',
    weight: 9,
    conditions: { all: [{ fact: 'stats.formOverall', op: '>=', value: 65 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Un article dithyrambique',
      body: '{primary.name} publie un article te présentant comme le futur grand espoir du football.',
    },
    choices: [
      {
        id: 'embrace_hype', label: "Assumer cette pression",
        successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'reputation', weight: 0.4 }], difficulty: 55 },
        effects: { stats: { reputation: 6, mental: -3 } },
        failureEffects: { stats: { reputation: -4, mental: -5 } },
        resultText: {
          success: "Tu te montres à la hauteur du battage médiatique autour de toi.",
          failure: "Le poids des attentes te déstabilise et ton image en pâtit.",
        },
      },
      { id: 'stay_humble', label: 'Rester humble en public', effects: { stats: { reputation: 2, mental: 3 } } },
    ],
  },

  {
    id: 'evt_journalist_exclusive_offer',
    category: 'media',
    weight: 8,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 30 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Une exclusivité proposée',
      body: '{primary.name} te propose une interview exclusive et approfondie, loin des questions habituelles.',
    },
    choices: [
      { id: 'open_up', label: 'Te livrer sincèrement', effects: { relation: [{ target: 'primary', trust: 20 }], stats: { reputation: 5 } } },
      { id: 'stay_guarded', label: 'Rester sur des réponses convenues', effects: { relation: [{ target: 'primary', grudge: 5 }] } },
    ],
  },

  {
    id: 'evt_journalist_smear_campaign',
    category: 'media',
    weight: 9,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.grudge', of: 'any_active_journalist', op: '>', value: 45 }] },
    actors: { primary: { role: 'journalist', filter: { grudge: { gt: 45 } }, pick: 'highestGrudge' } },
    text: {
      title: 'Une campagne à charge',
      body: '{primary.name} multiplie les articles à charge contre toi depuis des mois, et ça commence à peser sur ton image publique.',
    },
    choices: [
      {
        id: 'respond_publicly', label: 'Répondre publiquement à ses accusations',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 60 },
        effects: { stats: { reputation: -2, mental: 3 } },
        failureEffects: { stats: { reputation: -7, mental: -2 } },
        resultText: {
          success: "Ta réponse posée retourne l'opinion publique en ta faveur.",
          failure: "Ta réponse est perçue comme défensive et alimente encore la polémique.",
        },
      },
      { id: 'ignore_press', label: 'Ignorer complètement la presse', effects: { stats: { mental: 5 } } },
    ],
  },

  {
    id: 'evt_media_social_post_backfire',
    category: 'media',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Un post qui dérape',
      body: 'Un message que tu as publié sur les réseaux sociaux est mal interprété et devient viral pour de mauvaises raisons.',
    },
    choices: [
      { id: 'delete_apologize', label: 'Supprimer et t\'excuser', effects: { stats: { reputation: -1 } } },
      { id: 'leave_it', label: 'Laisser le post en place', effects: { stats: { reputation: -5 }, flags: [{ key: 'social_media_controversy' }] } },
    ],
  },

  {
    id: 'evt_journalist_off_record',
    category: 'media',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'relation.trust', of: 'any_active_journalist', op: '>', value: 65 }] },
    actors: { primary: { role: 'journalist', filter: { trust: { gt: 65 } }, pick: 'highestTrust' } },
    text: {
      title: 'Une confidence off',
      body: '{primary.name} te propose de parler "off", sans que rien ne soit publié, pour mieux comprendre les coulisses du club.',
    },
    choices: [
      { id: 'confide_off_record', label: 'Te confier librement', effects: { relation: [{ target: 'primary', trust: 20 }] } },
      { id: 'stay_cautious', label: 'Rester prudent malgré tout', effects: {} },
    ],
  },

  {
    id: 'evt_media_leaked_dressing_room',
    category: 'media',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'world_tag', op: '==', value: true }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Des tensions internes révélées',
      body: '{primary.name} publie un article détaillant les tensions internes du vestiaire, avec des détails que peu de gens connaissaient.',
    },
    choices: [
      { id: 'address_leak', label: 'Aborder le sujet ouvertement avec le groupe', effects: { stats: { mental: 4 } } },
      { id: 'find_the_leak', label: 'Chercher à identifier la source de la fuite', effects: { stats: { reputation: -2 } } },
    ],
  },

  {
    id: 'evt_media_rumor_denial',
    category: 'media',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Une rumeur à démentir',
      body: '{primary.name} relaie une rumeur infondée sur un futur transfert qui inquiète tes proches.',
    },
    choices: [
      {
        id: 'deny_publicly', label: 'Démentir publiquement et fermement',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 45 },
        effects: { stats: { reputation: 3 } },
        failureEffects: { stats: { reputation: -3 } },
        resultText: {
          success: "Ton démenti clair et net éteint la rumeur presque instantanément.",
          failure: "Ton démenti est perçu comme suspect et alimente encore plus la rumeur.",
        },
      },
      { id: 'let_rumor_die', label: 'Laisser la rumeur s\'éteindre seule', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_media_award_ceremony',
    category: 'media',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 60 }] },
    text: {
      title: 'Une cérémonie de gala',
      body: 'Tu es invité à une grande cérémonie de récompenses du football, sous les projecteurs.',
    },
    choices: [
      { id: 'enjoy_spotlight', label: 'Profiter pleinement des projecteurs', effects: { stats: { reputation: 6, mental: -2 } } },
      { id: 'stay_reserved', label: 'Rester réservé pendant la soirée', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_media_documentary_offer',
    category: 'media',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 65 }] },
    text: {
      title: 'Un documentaire sur ta carrière',
      body: 'Une production souhaite réaliser un documentaire retraçant ton parcours jusqu\'ici.',
    },
    choices: [
      { id: 'accept_documentary', label: 'Accepter, quitte à t\'exposer', effects: { stats: { reputation: 8, mental: -3 } } },
      { id: 'decline_documentary', label: 'Décliner pour préserver ta tranquillité', effects: { stats: { mental: 4 } } },
    ],
  },

  // --- CATÉGORIE : RIVAL ---
  {
    id: 'evt_rival_trash_talk',
    category: 'rival',
    weight: 10,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Provocation d\'avant-match',
      body: '{primary.name} te provoque publiquement avant un match important entre vos deux clubs.',
    },
    choices: [
      { id: 'ignore_rival', label: 'Ignorer et laisser parler le terrain', effects: { stats: { mental: 4 } } },
      { id: 'respond', label: 'Répondre du tac au tac', effects: { relation: [{ target: 'primary', grudge: 15 }], stats: { reputation: 3 } } },
    ],
  },

  {
    id: 'evt_rival_mutual_respect',
    category: 'rival',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Un respect qui s\'installe',
      body: 'Après des années de duels, {primary.name} te propose d\'échanger vos maillots après le match.',
    },
    choices: [
      { id: 'accept_gesture', label: 'Accepter avec respect', effects: { relation: [{ target: 'primary', trust: 25, grudge: -20 }] } },
      { id: 'refuse_gesture', label: 'Refuser froidement', effects: { relation: [{ target: 'primary', grudge: 10 }] } },
    ],
  },

  {
    id: 'evt_rival_foul_play',
    category: 'rival',
    weight: 10,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Un tacle appuyé',
      body: '{primary.name} te fait une faute dangereuse en plein match, à la limite du carton rouge.',
    },
    choices: [
      { id: 'retaliate', label: 'Lui rendre la pareille au prochain contact', effects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: -3 } } },
      { id: 'let_referee_handle', label: 'Laisser l\'arbitre gérer', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_rival_media_feud',
    category: 'rival',
    weight: 9,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 25 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Guerre des mots',
      body: '{primary.name} te critique ouvertement dans la presse, relançant votre rivalité publique.',
    },
    choices: [
      {
        id: 'fire_back', label: 'Répliquer dans les médias',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { relation: [{ target: 'primary', grudge: 15 }], stats: { reputation: 5 } },
        failureEffects: { relation: [{ target: 'primary', grudge: 20 }], stats: { reputation: -4 } },
        resultText: {
          success: "Ta réplique fait mouche et le public se range de ton côté.",
          failure: "Ta réplique tombe à plat et donne l'avantage médiatique à ton rival.",
        },
      },
      { id: 'take_high_road', label: 'Rester au-dessus de la mêlée', effects: { stats: { reputation: 3, mental: 3 } } },
    ],
  },

  {
    id: 'evt_rival_transfer_link',
    category: 'rival',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Une rumeur inattendue',
      body: 'Une rumeur circule : ton propre club envisagerait de recruter {primary.name}, ton pire rival sur le terrain.',
    },
    choices: [
      { id: 'welcome_rival', label: 'Te dire que ça renforcerait l\'équipe', effects: { relation: [{ target: 'primary', trust: 10 }] } },
      { id: 'oppose_signing', label: 'Faire savoir en interne que tu es contre', effects: { relation: [{ target: 'primary', grudge: 15 }] } },
    ],
  },

  {
    id: 'evt_rival_injury_moment',
    category: 'rival',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Le rival à terre',
      body: '{primary.name} se blesse gravement lors d\'un match contre ton équipe. Tout le stade retient son souffle.',
    },
    choices: [
      { id: 'show_concern', label: 'Montrer publiquement ton inquiétude', effects: { relation: [{ target: 'primary', trust: 20, grudge: -15 }], stats: { reputation: 4 } } },
      { id: 'stay_indifferent', label: 'Rester concentré sur le match', effects: { stats: { reputation: -2 } } },
    ],
  },

  {
    id: 'evt_rival_derby_hero_moment',
    category: 'rival',
    weight: 8,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Un derby décisif',
      body: 'Face au club de {primary.name}, tu as l\'occasion de marquer le but qui ferait basculer un derby historique.',
    },
    choices: [
      {
        id: 'seize_moment', label: 'Tenter ta chance malgré la pression',
        successCheck: { stats: [{ stat: 'technique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 65 },
        effects: { stats: { reputation: 8, formOverall: 4 } },
        failureEffects: { stats: { reputation: -3, formOverall: -3 } },
        resultText: {
          success: "Ton geste décisif entre dans la légende du derby.",
          failure: "Ta tentative échoue au pire moment, le derby t'échappe.",
        },
      },
      { id: 'play_safe', label: 'Faire le choix collectif plus sûr', effects: { stats: { tactique: 4 } } },
    ],
  },

  {
    id: 'evt_rival_business_encounter',
    category: 'rival',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'business_founder', op: '==', value: true }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Une rencontre inattendue',
      body: 'En dehors des terrains, tu croises {primary.name} lors d\'un événement business, dans un contexte totalement différent de la compétition.',
    },
    choices: [
      { id: 'network_with_rival', label: 'Discuter cordialement avec lui', effects: { relation: [{ target: 'primary', trust: 15, grudge: -10 }] } },
      { id: 'avoid_rival', label: "Éviter tout contact", effects: {} },
    ],
  },

  {
    id: 'evt_rival_shared_history',
    category: 'rival',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Un passé commun',
      body: 'Tu découvres que {primary.name} et toi avez joué dans le même club de jeunes, des années avant de devenir rivaux.',
    },
    choices: [
      { id: 'embrace_history', label: 'Évoquer ce passé commun avec chaleur', effects: { relation: [{ target: 'primary', trust: 15, grudge: -10 }] } },
      { id: 'dismiss_history', label: 'Ne pas y accorder d\'importance', effects: {} },
    ],
  },

  {
    id: 'evt_rival_award_competition',
    category: 'rival',
    weight: 8,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 50 }] },
    actors: { primary: { role: 'rival', pick: 'random' } },
    text: {
      title: 'Nommés pour le même trophée',
      body: 'Toi et {primary.name} êtes tous deux nommés pour le titre de meilleur joueur de la saison.',
    },
    choices: [
      {
        id: 'campaign_hard', label: 'Multiplier les apparitions médiatiques',
        successCheck: { stats: [{ stat: 'reputation', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 55 },
        effects: { stats: { reputation: 6, mental: -2 } },
        failureEffects: { stats: { reputation: -3, mental: -3 } },
        resultText: {
          success: "Ta campagne médiatique convainc les votants, le trophée penche vers toi.",
          failure: "Ton omniprésence médiatique lasse et se retourne contre toi dans les votes.",
        },
      },
      { id: 'let_performance_speak', label: 'Laisser tes performances parler', effects: { stats: { formOverall: 5 } } },
    ],
  },

  // --- CATÉGORIE : BODY / INJURY ---
  {
    id: 'evt_minor_injury_choice',
    category: 'injury',
    weight: 9,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    text: {
      title: 'Douleur musculaire',
      body: 'Tu ressens une gêne musculaire après l\'entraînement. Le staff médical te propose deux options.',
    },
    choices: [
      { id: 'rest', label: 'Te reposer une semaine', effects: { stats: { formOverall: -3 } } },
      {
        id: 'play_through', label: 'Jouer quand même',
        successCheck: { stats: [{ stat: 'physique', weight: 0.7 }, { stat: 'mental', weight: 0.3 }], difficulty: 50 },
        effects: { stats: { formOverall: 5 }, flags: [{ key: 'played_through_injury' }] },
        failureEffects: { stats: { formOverall: -2, physique: -4 }, flags: [{ key: 'played_through_injury' }] },
        resultText: {
          success: "La gêne ne t'empêche pas de livrer une bonne prestation.",
          failure: "La douleur s'aggrave pendant le match et handicape ton jeu.",
        },
      },
    ],
  },

  {
    id: 'evt_injury_relapse',
    category: 'injury',
    weight: 10,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'played_through_injury', op: '==', value: true }] },
    text: {
      title: 'La blessure ressurgit',
      body: 'La douleur que tu avais ignorée revient plus fort, en plein milieu de saison.',
    },
    choices: [
      { id: 'surgery', label: 'Opter pour une opération', effects: { stats: { physique: -5, mental: 3 } } },
      { id: 'rehab', label: 'Rééducation longue sans opération', effects: { stats: { physique: -2 } } },
    ],
  },

  {
    id: 'evt_injury_long_term',
    category: 'injury',
    weight: 6,
    maxOccurrences: 2,
    cooldownSeasons: 4,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 24 }] },
    text: {
      title: 'Une blessure longue durée',
      body: 'Un tacle malheureux te met sur la touche pour plusieurs mois.',
    },
    choices: [
      { id: 'patient_recovery', label: 'Prendre le temps nécessaire pour bien récupérer', effects: { stats: { physique: -3, mental: 4 } } },
      {
        id: 'rush_recovery', label: 'Précipiter le retour',
        successCheck: { stats: [{ stat: 'physique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 60 },
        effects: { stats: { formOverall: 8 }, flags: [{ key: 'rushed_recovery' }] },
        failureEffects: { stats: { formOverall: -4, physique: -5 }, flags: [{ key: 'rushed_recovery' }] },
        resultText: {
          success: "Ton corps répond bien, le retour précipité paie sur le moment.",
          failure: "Le retour précipité se passe mal et fragilise encore ton corps.",
        },
      },
    ],
  },

  {
    id: 'evt_injury_rushed_consequence',
    category: 'injury',
    weight: 11,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'rushed_recovery', op: '==', value: true }] },
    text: {
      title: 'Le corps rappelle à l\'ordre',
      body: 'Le retour précipité laisse des séquelles : ton corps n\'a jamais vraiment récupéré.',
    },
    choices: [
      { id: 'accept_limits', label: 'Accepter tes nouvelles limites physiques', effects: { stats: { physique: -6, mental: 5 } } },
      { id: 'push_through_pain', label: 'Continuer à forcer malgré tout', effects: { stats: { physique: -10 } } },
    ],
  },

  {
    id: 'evt_injury_medical_second_opinion',
    category: 'injury',
    weight: 7,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    text: {
      title: 'Un second avis médical',
      body: 'Le staff médical du club te propose un traitement, mais un médecin externe suggère une approche différente.',
    },
    choices: [
      { id: 'trust_club_medical', label: 'Suivre l\'avis du club', effects: { stats: { physique: 3 } } },
      { id: 'seek_outside_opinion', label: 'Consulter en externe', effects: { stats: { physique: 5, mental: -1 } } },
    ],
  },

  {
    id: 'evt_injury_teammate_solidarity',
    category: 'injury',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'rushed_recovery', op: '==', value: true }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un soutien pendant la blessure',
      body: 'Pendant ta convalescence, {primary.name} vient régulièrement te rendre visite et t\'aider moralement.',
    },
    choices: [
      { id: 'appreciate_support', label: 'Apprécier sincèrement ce soutien', effects: { relation: [{ target: 'primary', trust: 20 }], stats: { mental: 5 } } },
      { id: 'push_away', label: 'Repousser cette attention, tu veux être seul', effects: { relation: [{ target: 'primary', grudge: 5 }] } },
    ],
  },

  {
    id: 'evt_injury_teammate_similar_setback',
    category: 'injury',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Un même chemin de galère',
      body: '{primary.name} traverse une blessure très similaire à celle que tu as connue, et vient te demander conseil.',
    },
    choices: [
      { id: 'guide_through_injury', label: 'Le guider avec ton expérience', effects: { relation: [{ target: 'primary', trust: 20 }] } },
      { id: 'stay_distant_injury', label: 'Rester distant, chacun sa route', effects: {} },
    ],
  },

  {
    id: 'evt_injury_chronic_pain_management',
    category: 'injury',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 28 }, { fact: 'stats.physique', op: '<=', value: 50 }] },
    text: {
      title: 'Une douleur chronique',
      body: 'Une douleur diffuse t\'accompagne désormais en permanence, sans qu\'aucun diagnostic ne l\'explique clairement.',
    },
    choices: [
      { id: 'adapt_training', label: 'Adapter ton entraînement en conséquence', effects: { stats: { physique: 4, formOverall: -2 } } },
      { id: 'ignore_chronic_pain', label: 'Continuer comme si de rien n\'était', effects: { stats: { formOverall: 5 }, flags: [{ key: 'ignored_chronic_pain' }] } },
    ],
  },

  {
    id: 'evt_injury_prevention_program',
    category: 'injury',
    weight: 6,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Programme de prévention',
      body: 'Le préparateur physique te propose un programme de renforcement préventif, exigeant mais réputé efficace.',
    },
    choices: [
      {
        id: 'commit_program', label: "T'engager sérieusement dans ce programme",
        successCheck: { stats: [{ stat: 'physique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 45 },
        effects: { stats: { physique: 8, mental: -2 } },
        failureEffects: { stats: { physique: -3, mental: -4 } },
        resultText: {
          success: "Le programme exigeant porte ses fruits, ton corps en ressort renforcé.",
          failure: "Le programme s'avère trop dur à tenir et te laisse épuisé sans bénéfice.",
        },
      },
      { id: 'skip_program', label: 'Passer ton tour', effects: {} },
    ],
  },

  {
    id: 'evt_injury_experimental_treatment',
    category: 'injury',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.physique', op: '<=', value: 40 }] },
    text: {
      title: 'Un traitement expérimental',
      body: 'Un spécialiste te propose un traitement de pointe encore peu répandu pour accélérer ta récupération.',
    },
    choices: [
      {
        id: 'try_experimental', label: 'Tenter le traitement expérimental',
        successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 65 },
        effects: { stats: { physique: 10, mental: -3 } },
        failureEffects: { stats: { physique: -6, mental: -4 } },
        resultText: {
          success: "Le traitement expérimental fait ses preuves, ta récupération s'accélère nettement.",
          failure: "Le traitement ne fonctionne pas comme espéré et complique ta convalescence.",
        },
      },
      { id: 'stick_to_classic', label: 'Rester sur les méthodes classiques', effects: { stats: { physique: 3 } } },
    ],
  },

  {
    id: 'evt_injury_burnout_signs',
    category: 'injury',
    weight: 8,
    conditions: { all: [{ fact: 'stats.mental', op: '<=', value: 35 }] },
    text: {
      title: 'Signes d\'épuisement',
      body: 'Le rythme des saisons commence à peser lourd. Tu sens les premiers signes d\'épuisement mental.',
    },
    choices: [
      { id: 'seek_help', label: 'Consulter un préparateur mental', effects: { stats: { mental: 12 } } },
      {
        id: 'push_through', label: 'Serrer les dents et continuer',
        successCheck: { stats: [{ stat: 'mental', weight: 0.7 }, { stat: 'physique', weight: 0.3 }], difficulty: 65 },
        effects: { stats: { mental: -8, formOverall: 5 } },
        failureEffects: { stats: { mental: -14, formOverall: -3 } },
        resultText: {
          success: "Tu tiens le choc et ta forme s'en trouve même portée par l'adrénaline.",
          failure: "Tu craques complètement, l'épuisement mental prend le dessus.",
        },
      },
    ],
  },

  // --- CATÉGORIE : MONEY ---
  {
    id: 'evt_lifestyle_investment',
    category: 'money',
    weight: 8,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Une opportunité d\'investissement',
      body: 'Un contact te propose d\'investir une partie de tes revenus dans une affaire prometteuse.',
    },
    choices: [
      { id: 'invest', label: 'Investir', effects: { wallet: { cashDelta: -1500 }, flags: [{ key: 'risky_investment' }] } },
      { id: 'save', label: 'Épargner prudemment', effects: {} },
    ],
  },

  {
    id: 'evt_money_investment_outcome',
    category: 'money',
    weight: 9,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'risky_investment', op: '==', value: true }, { fact: 'career.season', op: '>=', value: 3 }] },
    text: {
      title: 'Le résultat de l\'investissement',
      body: 'Des nouvelles arrivent enfin sur l\'affaire dans laquelle tu avais investi une partie de tes économies.',
    },
    choices: [
      {
        id: 'celebrate_gain', label: 'Découvrir le résultat',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 45 },
        effects: { wallet: { cashDelta: 3000 }, stats: { mental: 3 } },
        failureEffects: { wallet: { cashDelta: 0 }, stats: { mental: -2 } },
        resultText: { success: "L'affaire a payé, un joli complément d'économies.", failure: "L'affaire tourne court, ton capital de départ est perdu." },
      },
    ],
  },

  {
    id: 'evt_money_flashy_purchase',
    category: 'money',
    weight: 8,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 30 }] },
    text: {
      title: 'Une envie de luxe',
      body: 'Tu craques pour un achat coûteux et très visible : voiture de sport, montre de collection, ou villa.',
    },
    choices: [
      { id: 'buy_it', label: "Craquer pour l'achat", effects: { wallet: { cashDelta: -4000 }, stats: { reputation: 3 }, flags: [{ key: 'flashy_spender' }] } },
      { id: 'resist_urge', label: 'Résister à la tentation', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_money_charity_request',
    category: 'money',
    weight: 8,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 35 }] },
    text: {
      title: 'Une association caritative',
      body: 'Une association locale te sollicite pour parrainer une cause qui te tient à cœur.',
    },
    choices: [
      { id: 'support_cause', label: 'Soutenir financièrement la cause', effects: { stats: { reputation: 8 } } },
      { id: 'decline_charity', label: 'Décliner poliment', effects: {} },
    ],
  },

  {
    id: 'evt_money_business_venture',
    category: 'money',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 5 }] },
    text: {
      title: 'Un projet entrepreneurial',
      body: 'Un ancien coéquipier reconverti te propose de co-fonder une marque de vêtements de sport.',
    },
    choices: [
      { id: 'join_venture', label: 'Te lancer dans l\'aventure', effects: { wallet: { cashDelta: -6000 }, flags: [{ key: 'business_founder' }], scheduleFlag: { key: 'business_venture_outcome', inSeasons: 2 } } },
      { id: 'decline_venture', label: 'Rester concentré sur le foot', effects: {} },
    ],
  },

  {
    id: 'evt_money_business_venture_outcome',
    category: 'money',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'business_venture_outcome', op: '==', value: true }] },
    text: {
      title: 'Le bilan du projet entrepreneurial',
      body: 'Deux ans après ton investissement dans la marque de vêtements de sport, le bilan tombe enfin.',
    },
    choices: [
      {
        id: 'check_venture_result', label: 'Consulter les comptes',
        successCheck: { stats: [{ stat: 'mental', weight: 0.4 }, { stat: 'reputation', weight: 0.6 }], difficulty: 48 },
        effects: { wallet: { cashDelta: 11000 }, stats: { reputation: 4 } },
        failureEffects: { wallet: { cashDelta: 0 }, stats: { mental: -3 } },
        resultText: { success: 'La marque décolle, un joli retour sur investissement.', failure: 'Le projet capote, la mise de départ est perdue.' },
      },
    ],
  },

  {
    id: 'evt_money_family_business_pressure',
    category: 'money',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 3 }] },
    actors: { primary: { role: 'family', pick: 'random' } },
    text: {
      title: 'Une pression familiale sur l\'argent',
      body: '{primary.name} te pousse à investir dans un projet familial dont tu doutes de la viabilité.',
    },
    choices: [
      { id: 'invest_family_project', label: 'Investir malgré tes doutes', effects: { relation: [{ target: 'primary', trust: 15 }], flags: [{ key: 'family_business_investment' }] } },
      { id: 'refuse_family_project', label: 'Refuser fermement', effects: { relation: [{ target: 'primary', grudge: 20 }] } },
    ],
  },

  {
    id: 'evt_money_investment_loss',
    category: 'money',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'family_business_investment', op: '==', value: true }, { fact: 'career.season', op: '>=', value: 5 }] },
    text: {
      title: 'Un investissement qui tourne mal',
      body: 'Le projet familial dans lequel tu avais investi périclite, mettant en péril une partie de tes économies.',
    },
    choices: [
      { id: 'absorb_loss_quietly', label: 'Absorber la perte sans faire de vagues', effects: { stats: { mental: -3 } } },
      { id: 'confront_family_over_loss', label: 'En vouloir à la famille qui t\'avait poussé à investir', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_money_retirement_planning',
    category: 'money',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 29 }] },
    text: {
      title: 'Préparer l\'après-carrière financièrement',
      body: 'Un conseiller te recommande de mettre en place un plan d\'épargne solide en vue de la fin de ta carrière sportive.',
    },
    choices: [
      { id: 'set_up_plan', label: 'Mettre en place ce plan sérieusement', effects: { stats: { mental: 6 } } },
      { id: 'postpone_plan', label: 'Repousser cette question à plus tard', effects: {} },
    ],
  },

  {
    id: 'evt_money_property_investment',
    category: 'money',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 4 }] },
    text: {
      title: 'Investissement immobilier',
      body: 'Un conseiller financier te propose de diversifier ton patrimoine dans l\'immobilier locatif.',
    },
    choices: [
      { id: 'invest_property', label: 'Investir dans l\'immobilier', effects: { wallet: { cashDelta: -8000 }, flags: [{ key: 'property_investment' }] } },
      { id: 'skip_property', label: 'Ne pas te lancer pour l\'instant', effects: {} },
    ],
  },

  {
    id: 'evt_money_property_income',
    category: 'money',
    weight: 5,
    conditions: { all: [{ fact: 'flag', key: 'property_investment', op: '==', value: true }, { fact: 'career.season', op: '>=', value: 5 }] },
    text: {
      title: 'Un revenu locatif régulier',
      body: 'Ton investissement immobilier commence à générer un revenu locatif stable, saison après saison.',
    },
    choices: [
      { id: 'collect_rent', label: 'Encaisser le loyer', effects: { wallet: { cashDelta: 1200 } } },
    ],
  },

  {
    id: 'evt_money_endorsement_deal',
    category: 'money',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 }] },
    text: {
      title: 'Un contrat de sponsoring',
      body: 'Une grande marque d\'équipement sportif te propose un contrat de sponsoring très lucratif sur plusieurs années.',
    },
    choices: [
      { id: 'sign_endorsement', label: 'Signer ce contrat', effects: { stats: { reputation: 5 }, flags: [{ key: 'major_sponsor_deal' }] } },
      { id: 'stay_independent', label: 'Rester libre de tout engagement', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_money_agent_fee_negotiation',
    category: 'money',
    weight: 6,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Renégociation de commission',
      body: '{primary.name} demande une augmentation de sa commission suite à tes bonnes performances récentes.',
    },
    choices: [
      { id: 'accept_fee_increase', label: 'Accepter la demande', effects: { relation: [{ target: 'primary', trust: 15 }] } },
      {
        id: 'negotiate_fee', label: 'Négocier à la baisse',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 50 },
        effects: { relation: [{ target: 'primary', grudge: 8 }] },
        failureEffects: { relation: [{ target: 'primary', grudge: 18, trust: -5 }] },
        resultText: {
          success: "La négociation aboutit à un compromis raisonnable pour les deux parties.",
          failure: "La négociation tourne court et laisse un goût amer à ton agent.",
        },
      },
    ],
  },

  {
    id: 'evt_money_tax_issue',
    category: 'money',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'flashy_spender', op: '==', value: true }] },
    text: {
      title: 'Un contrôle fiscal',
      body: 'Ton train de vie visible attire l\'attention d\'un contrôle fiscal approfondi.',
    },
    choices: [
      { id: 'hire_lawyer', label: "Engager un avocat spécialisé", effects: { stats: { mental: -2 } } },
      { id: 'handle_alone', label: 'Gérer seul la situation', effects: { stats: { reputation: -4, mental: -4 } } },
    ],
  },

  // --- CATÉGORIE : RETIREMENT ---
  {
    id: 'evt_retirement_first_thoughts',
    category: 'retirement',
    weight: 9,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 30 }] },
    text: {
      title: 'Premières pensées de retraite',
      body: 'Pour la première fois, l\'idée de la retraite sportive te traverse sérieusement l\'esprit.',
    },
    choices: [
      { id: 'plan_ahead', label: 'Commencer à préparer l\'après-carrière', effects: { stats: { mental: 5 } } },
      { id: 'push_it_away', label: 'Repousser cette pensée', effects: { stats: { mental: -2 } } },
    ],
  },

  {
    id: 'evt_retirement_coaching_offer',
    category: 'retirement',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 32 }, { fact: 'relation.trust', of: 'any_active_coach', op: '>', value: 55 }] },
    actors: { primary: { role: 'coach', filter: { trust: { gt: 55 } }, pick: 'highestTrust' } },
    text: {
      title: 'Une reconversion se dessine',
      body: '{primary.name} t\'évoque la possibilité de rejoindre le staff technique une fois ta carrière de joueur terminée.',
    },
    choices: [
      { id: 'consider_coaching', label: 'Envisager sérieusement cette voie', effects: { relation: [{ target: 'primary', trust: 10 }], flags: [{ key: 'coaching_path_opened' }] } },
      { id: 'decline_coaching', label: 'Préférer autre chose après le foot', effects: {} },
    ],
  },

  {
    id: 'evt_retirement_farewell_tour',
    category: 'retirement',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 33 }] },
    text: {
      title: 'La dernière saison annoncée',
      body: 'Tu annonces publiquement que la saison en cours sera ta dernière en tant que joueur professionnel.',
    },
    choices: [
      { id: 'embrace_farewell', label: 'Profiter pleinement de chaque match', effects: { stats: { reputation: 10, mental: 5 } } },
      { id: 'stay_low_key', label: 'Rester discret jusqu\'au bout', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_retirement_final_match',
    category: 'retirement',
    weight: 10,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 34 }] },
    text: {
      title: 'Le dernier match',
      body: 'C\'est ton dernier match en tant que professionnel. Le stade te réserve une ovation.',
    },
    choices: [
      { id: 'emotional_farewell', label: 'Laisser exploser ton émotion', effects: { stats: { reputation: 8 } } },
      { id: 'composed_farewell', label: 'Rester digne et posé', effects: { stats: { mental: 6 } } },
    ],
  },

  {
    id: 'evt_retirement_pundit_offer',
    category: 'retirement',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 31 }, { fact: 'stats.reputation', op: '>=', value: 55 }] },
    actors: { primary: { role: 'journalist', pick: 'random' } },
    text: {
      title: 'Une reconversion médiatique',
      body: '{primary.name} te propose de rejoindre une chaîne sportive comme consultant après ta carrière.',
    },
    choices: [
      { id: 'accept_pundit', label: "Accepter l'offre", effects: { relation: [{ target: 'primary', trust: 10 }], flags: [{ key: 'pundit_path_opened' }] } },
      { id: 'decline_pundit', label: "Préférer un autre chemin", effects: {} },
    ],
  },

  {
    id: 'evt_retirement_body_toll',
    category: 'retirement',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 32 }, { fact: 'stats.physique', op: '<=', value: 45 }] },
    text: {
      title: 'Le corps a payé le prix',
      body: 'Des années de haut niveau ont laissé des traces durables sur ton corps.',
    },
    choices: [
      { id: 'accept_toll', label: 'Accepter sereinement ces séquelles', effects: { stats: { mental: 8 } } },
      { id: 'resent_toll', label: 'Ressasser ce sacrifice avec amertume', effects: { stats: { mental: -5 } } },
    ],
  },

  {
    id: 'evt_retirement_academy_offer',
    category: 'retirement',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 30 }, { fact: 'career.history.length', op: '<=', value: 2 }] },
    text: {
      title: 'L\'académie du club formateur',
      body: 'Ton club formateur te propose de revenir un jour pour transmettre ton expérience aux jeunes de l\'académie.',
    },
    choices: [
      { id: 'promise_return', label: 'Promettre d\'y revenir un jour', effects: { stats: { reputation: 5 }, flags: [{ key: 'academy_path_opened' }] } },
      { id: 'stay_noncommittal', label: 'Rester évasif', effects: {} },
    ],
  },

  {
    id: 'evt_retirement_legacy_reflection',
    category: 'retirement',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 34 }] },
    text: {
      title: 'Un bilan de carrière',
      body: 'À l\'approche de la fin, tu prends le temps de repenser à tout le chemin parcouru depuis tes débuts.',
    },
    choices: [
      { id: 'proud_reflection', label: 'Te sentir fier du chemin parcouru', effects: { stats: { mental: 10 } } },
      { id: 'regretful_reflection', label: "Ressentir des regrets sur certains choix", effects: { stats: { mental: -4 } } },
    ],
  },

  // --- CATÉGORIE : FANS ---
  {
    id: 'evt_fans_adoration',
    category: 'fans',
    weight: 8,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 40 }] },
    text: {
      title: 'Adulé par les supporters',
      body: 'À la sortie du stade, une foule de supporters t\'attend pour des autographes et des photos.',
    },
    choices: [
      { id: 'take_time', label: 'Prendre le temps pour chacun', effects: { stats: { reputation: 6, formOverall: -2 } } },
      { id: 'brief_greeting', label: 'Saluer brièvement avant de partir', effects: { stats: { formOverall: 2 } } },
    ],
  },

  {
    id: 'evt_fans_backlash_poor_form',
    category: 'fans',
    weight: 9,
    conditions: { all: [{ fact: 'stats.formOverall', op: '<=', value: 35 }] },
    text: {
      title: 'La grogne des tribunes',
      body: 'Après une série de mauvaises performances, les tribunes commencent à te siffler.',
    },
    choices: [
      { id: 'block_out_noise', label: 'Faire abstraction du bruit', effects: { stats: { mental: 6 } } },
      { id: 'take_it_personally', label: 'Le prendre personnellement', effects: { stats: { mental: -6 } } },
    ],
  },

  {
    id: 'evt_fans_banner_tribute',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.history.length', op: '<=', value: 1 }, { fact: 'stats.reputation', op: '>=', value: 50 }] },
    text: {
      title: 'Une banderole en ton honneur',
      body: 'Les supporters les plus fidèles déploient une immense banderole à ton effigie avant le match.',
    },
    choices: [
      { id: 'salute_fans', label: 'Aller les saluer directement', effects: { stats: { reputation: 8 } } },
      { id: 'stay_focused_fans', label: 'Rester concentré sur l\'échauffement', effects: { stats: { formOverall: 3 } } },
    ],
  },

  {
    id: 'evt_fans_meet_young_supporter',
    category: 'fans',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Un jeune supporter malade',
      body: 'Une association te contacte : un jeune supporter gravement malade rêve de te rencontrer.',
    },
    choices: [
      { id: 'visit_hospital', label: 'Lui rendre visite', effects: { stats: { reputation: 10, mental: 5 } } },
      { id: 'send_gift', label: 'Envoyer un cadeau signé sans se déplacer', effects: { stats: { reputation: 2 } } },
    ],
  },

  {
    id: 'evt_fans_ultras_pressure',
    category: 'fans',
    weight: 7,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 } ] },
    text: {
      title: 'La pression des ultras',
      body: 'Le groupe de supporters le plus radical du club exige publiquement plus d\'engagement de ta part sur le terrain.',
    },
    choices: [
      {
        id: 'meet_ultras', label: 'Aller les rencontrer directement',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'reputation', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { reputation: 5, mental: -2 } },
        failureEffects: { stats: { reputation: -5, mental: -4 } },
        resultText: {
          success: "L'échange direct apaise le groupe le plus radical du club.",
          failure: "La rencontre tourne à la confrontation et envenime encore la situation.",
        },
      },
      { id: 'ignore_ultras', label: 'Ne pas céder à la pression', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_fans_shirt_number_request',
    category: 'fans',
    weight: 4,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 } ] },
    text: {
      title: 'Un numéro symbolique',
      body: 'Un supporter emblématique du club te demande de porter un numéro de maillot chargé d\'histoire pour le club.',
    },
    choices: [
      { id: 'honor_number', label: 'Accepter de porter ce numéro', effects: { stats: { reputation: 6 } } },
      { id: 'keep_own_number', label: 'Garder ton numéro habituel', effects: {} },
    ],
  },

  {
    id: 'evt_fans_rival_club_taunt',
    category: 'fans',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Chants hostiles',
      body: 'Les supporters du club adverse t\'accueillent avec des chants moqueurs pendant tout le match.',
    },
    choices: [
      {
        id: 'silence_them', label: 'Les faire taire par une belle performance',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'technique', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { formOverall: 6, reputation: 3 } },
        failureEffects: { stats: { formOverall: -3, mental: -3 } },
        resultText: {
          success: "Ta performance fait taire les chants moqueurs mieux que n'importe quelle réplique.",
          failure: "Les chants te déstabilisent et ton match en pâtit clairement.",
        },
      },
      { id: 'block_them_out', label: 'Faire abstraction complètement', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_fans_disappointment_after_transfer',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'moved_abroad', op: '==', value: true }] },
    text: {
      title: 'La déception des anciens supporters',
      body: 'Tes anciens supporters expriment publiquement leur déception après ton départ vers un club étranger.',
    },
    choices: [
      { id: 'address_old_fans', label: 'Leur adresser un message public reconnaissant', effects: { stats: { reputation: 5 } } },
      { id: 'move_on_fans', label: 'Tourner la page sans réagir', effects: {} },
    ],
  },

  {
    id: 'evt_fans_signature_celebration',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 55 }] },
    text: {
      title: 'Un but qui marque les esprits',
      body: 'Après un but spectaculaire, les supporters commencent à réclamer que tu adoptes une célébration signature.',
    },
    choices: [
      { id: 'adopt_signature', label: 'Adopter une célébration signature', effects: { stats: { reputation: 6 } } },
      { id: 'stay_simple', label: 'Rester simple, sans chercher l\'effet', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_fans_petition_support',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'requested_transfer', op: '==', value: true }] },
    text: {
      title: 'Une pétition des supporters',
      body: 'Une pétition de supporters circule pour te convaincre publiquement de rester au club malgré ta demande de départ.',
    },
    choices: [
      { id: 'reconsider_for_fans', label: 'Reconsidérer ta décision face à ce soutien', effects: { stats: { reputation: 8 } } },
      { id: 'stick_to_decision', label: 'Maintenir ta décision malgré tout', effects: { stats: { reputation: -4 } } },
    ],
  },

  {
    id: 'evt_fans_local_community_event',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 }] },
    text: {
      title: 'Un événement de quartier',
      body: 'Le club te sollicite pour animer une journée sportive avec les enfants du quartier autour du stade.',
    },
    choices: [
      { id: 'join_event', label: "Participer avec plaisir", effects: { stats: { reputation: 7 } } },
      { id: 'skip_event', label: "Décliner, tu préfères te reposer", effects: { stats: { formOverall: 2 } } },
    ],
  },

  {
    id: 'evt_fans_road_trip_support',
    category: 'fans',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 35 } ] },
    text: {
      title: 'Un déplacement mémorable',
      body: 'Des centaines de supporters ont fait des heures de route pour te voir jouer à l\'extérieur.',
    },
    choices: [
      {
        id: 'give_everything', label: 'Tout donner en leur honneur',
        successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { formOverall: 8, mental: -2 } },
        failureEffects: { stats: { formOverall: -4, physique: -3 } },
        resultText: {
          success: "Tu livres une prestation à la hauteur du déplacement de tes supporters.",
          failure: "Tu t'épuises à trop vouloir en faire et le match tourne mal pour toi.",
        },
      },
      { id: 'play_normally', label: 'Jouer normalement sans pression supplémentaire', effects: { stats: { mental: 3 } } },
    ],
  },

  // --- CATÉGORIE : LIFESTYLE ---
  {
    id: 'evt_lifestyle_new_relationship',
    category: 'lifestyle',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 } ] },
    text: {
      title: 'Une nouvelle rencontre',
      body: 'Tu rencontres quelqu\'un en dehors du monde du football qui commence à compter beaucoup pour toi.',
    },
    choices: [
      { id: 'invest_relationship', label: "T'investir pleinement dans cette relation", effects: { stats: { mental: 8 }, flags: [{ key: 'in_relationship' }] } },
      { id: 'keep_distance', label: 'Garder tes distances pour rester focus', effects: { stats: { formOverall: 4 } } },
    ],
  },

  {
    id: 'evt_lifestyle_relationship_strain',
    category: 'lifestyle',
    weight: 8,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'in_relationship', op: '==', value: true }, { fact: 'career.season', op: '>=', value: 3 }] },
    text: {
      title: 'Une relation mise à l\'épreuve',
      body: 'Les déplacements incessants et la pression du haut niveau mettent ta relation à rude épreuve.',
    },
    choices: [
      { id: 'prioritize_partner', label: 'Faire des efforts pour préserver la relation', effects: { stats: { mental: 6, formOverall: -3 } } },
      { id: 'prioritize_career_relationship', label: 'Laisser le football prendre le dessus', effects: { stats: { formOverall: 5 }, flags: [{ key: 'relationship_ended' }] } },
    ],
  },

  {
    id: 'evt_lifestyle_nightlife_temptation',
    category: 'lifestyle',
    weight: 7,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 } ] },
    text: {
      title: 'Les tentations de la vie nocturne',
      body: 'Le rythme de la célébrité t\'ouvre les portes de soirées où l\'excès est facile.',
    },
    choices: [
      { id: 'stay_disciplined', label: 'Rester discipliné', effects: { stats: { formOverall: 5 } } },
      { id: 'indulge_nightlife', label: 'Céder de temps en temps', effects: { stats: { formOverall: -6, reputation: -2 } } },
    ],
  },

  {
    id: 'evt_lifestyle_hobby_discovery',
    category: 'lifestyle',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 } ] },
    text: {
      title: 'Une passion en dehors du terrain',
      body: 'Tu découvres une passion (musique, peinture, échecs) qui t\'aide à décompresser loin du football.',
    },
    choices: [
      { id: 'nurture_hobby', label: 'Cultiver cette passion régulièrement', effects: { stats: { mental: 8 } } },
      { id: 'drop_hobby', label: "Ne pas t'y consacrer, trop pris par le foot", effects: {} },
    ],
  },

  {
    id: 'evt_lifestyle_diet_discipline',
    category: 'lifestyle',
    weight: 6,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 } ] },
    text: {
      title: 'Discipline alimentaire',
      body: 'Le nutritionniste du club te propose un régime alimentaire strict pour optimiser tes performances.',
    },
    choices: [
      { id: 'follow_diet', label: 'Suivre le régime à la lettre', effects: { stats: { physique: 6, mental: -2 } } },
      { id: 'ignore_diet', label: 'Garder tes habitudes', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_lifestyle_public_appearance',
    category: 'lifestyle',
    weight: 6,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 25 } ] },
    text: {
      title: 'Une apparition publique',
      body: 'Une marque te sollicite pour une apparition publique très rémunératrice, mais chronophage en pleine semaine de match.',
    },
    choices: [
      { id: 'accept_appearance', label: 'Accepter, l\'argent est trop bon', effects: { stats: { formOverall: -4 } } },
      { id: 'decline_appearance', label: 'Décliner pour rester concentré', effects: { stats: { formOverall: 3 } } },
    ],
  },

  {
    id: 'evt_lifestyle_off_season_travel',
    category: 'lifestyle',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Un voyage hors-saison',
      body: 'La trêve estivale approche. Tu hésites entre voyager loin pour décompresser ou rester t\'entraîner intensément.',
    },
    choices: [
      { id: 'travel_far', label: 'Partir loin pour vraiment décrocher', effects: { stats: { mental: 8, formOverall: -3 } } },
      { id: 'train_through_break', label: 'Rester t\'entraîner', effects: { stats: { formOverall: 6, mental: -2 } } },
    ],
  },

  {
    id: 'evt_lifestyle_legacy_project',
    category: 'lifestyle',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 60 }, { fact: 'career.season', op: '>=', value: 6 }] },
    text: {
      title: 'Un projet qui te dépasse',
      body: 'Tu envisages de lancer une fondation ou une académie de football pour les jeunes de ton quartier d\'origine.',
    },
    choices: [
      { id: 'launch_foundation', label: 'Te lancer dans ce projet ambitieux', effects: { stats: { reputation: 10, mental: 6 } } },
      { id: 'postpone_foundation', label: 'Reporter ce projet à la retraite', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_lifestyle_moving_country_adjustment',
    category: 'lifestyle',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'moved_abroad', op: '==', value: true }] },
    text: {
      title: 'S\'adapter à un nouveau pays',
      body: 'Ton transfert à l\'étranger t\'oblige à t\'adapter à une nouvelle langue, une nouvelle culture, loin de tes repères.',
    },
    choices: [
      { id: 'immerse_fully', label: "T'immerger pleinement dans la culture locale", effects: { stats: { mental: 8 } } },
      { id: 'stick_to_expat_circle', label: 'Rester dans un cercle de compatriotes', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_lifestyle_burnout_from_sponsor',
    category: 'lifestyle',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'sponsor_burnout_risk', op: '==', value: true }] },
    text: {
      title: 'Le trop-plein',
      body: 'Entre les matchs et les obligations commerciales, tu sens que tu n\'as plus un instant à toi.',
    },
    choices: [
      { id: 'take_break', label: 'Prendre une pause forcée', effects: { stats: { mental: 10, formOverall: -4 } } },
      { id: 'push_through_burnout', label: 'Continuer à tout encaisser', effects: { stats: { mental: -8 } } },
    ],
  },

  {
    id: 'evt_lifestyle_sponsor_pressure',
    category: 'lifestyle',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'major_sponsor_deal', op: '==', value: true }] },
    text: {
      title: 'Les exigences du sponsor',
      body: 'Ton sponsor principal exige de plus en plus de disponibilité pour des tournages et événements promotionnels.',
    },
    choices: [
      { id: 'comply_sponsor', label: "Te plier à ces exigences", effects: { stats: { formOverall: -4 }, flags: [{ key: 'sponsor_burnout_risk' }] } },
      { id: 'push_back_sponsor', label: "Renégocier les termes du contrat", effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_lifestyle_public_image_choice',
    category: 'lifestyle',
    weight: 5,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 40 } ] },
    text: {
      title: 'Construire son image',
      body: 'Une agence de communication te propose de travailler ton image publique de façon plus stratégique.',
    },
    choices: [
      { id: 'craft_image', label: "Accepter de façonner ton image", effects: { wallet: { monthlyExpensesDelta: 300 }, stats: { reputation: 6, mental: -2 } } },
      { id: 'stay_authentic', label: 'Rester toi-même sans calcul', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_money_agent_advance_request',
    category: 'money',
    weight: 6,
    maxOccurrences: 2,
    cooldownSeasons: 4,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 } ] },
    actors: { primary: { role: 'agent', pick: 'random' } },
    text: {
      title: 'Une avance sur salaire',
      body: '{primary.name} te propose une avance immédiate sur tes revenus futurs, contre une commission plus élevée le moment venu.',
    },
    choices: [
      { id: 'accept_advance', label: "Accepter l'avance", effects: { wallet: { cashDelta: 2000 }, relation: [{ target: 'primary', trust: 5 }] } },
      { id: 'decline_advance', label: 'Décliner, rester prudent', effects: {} },
    ],
  },

  {
    id: 'evt_money_lifestyle_downgrade',
    category: 'money',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'wallet.cash', op: '<=', value: 1000 } ] },
    text: {
      title: 'Revoir son train de vie',
      body: 'Tes finances se resserrent. Il devient urgent de réduire certaines dépenses récurrentes.',
    },
    choices: [
      { id: 'cut_expenses', label: 'Réduire ton train de vie', effects: { wallet: { monthlyExpensesDelta: -300 }, stats: { mental: -3 } } },
      { id: 'keep_spending', label: 'Continuer comme avant', effects: { stats: { mental: 2 } } },
    ],
  },

  {
    id: 'evt_money_windfall_or_setback',
    category: 'money',
    weight: 6,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 1 } ] },
    text: {
      title: 'Un imprévu financier',
      body: 'Une petite dépense imprévue surgit — ou à l\'inverse, un remboursement fiscal tombe au bon moment.',
    },
    choices: [
      {
        id: 'face_it', label: 'Voir ce que ça donne',
        successCheck: { stats: [{ stat: 'mental', weight: 1 }], difficulty: 45 },
        effects: { wallet: { cashDelta: 800 } },
        failureEffects: { wallet: { cashDelta: -800 } },
        resultText: { success: 'Bonne surprise, un petit remboursement inattendu.', failure: 'Une réparation coûteuse s\'impose.' },
      },
    ],
  },

  // --- CATÉGORIE : SELECTION (équipe nationale) ---
  {
    id: 'evt_selection_first_call',
    category: 'selection',
    weight: 10,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 35 }, { fact: 'career.season', op: '>=', value: 2 }] },
    text: {
      title: 'Première convocation',
      body: 'Le sélectionneur national t\'appelle pour la première fois en équipe nationale.',
    },
    choices: [
      { id: 'answer_call', label: 'Répondre présent avec fierté', effects: { stats: { reputation: 10, mental: 3 } } },
      { id: 'plead_fatigue', label: 'Invoquer la fatigue pour décliner cette fois', effects: { stats: { formOverall: 5 }, flags: [{ key: 'declined_first_call' }] } },
    ],
  },

  {
    id: 'evt_selection_bench_frustration',
    category: 'selection',
    weight: 8,
    conditions: { all: [{ fact: 'flag', key: 'declined_first_call', op: '!=', value: true }, { fact: 'stats.reputation', op: '>=', value: 40 }] },
    text: {
      title: 'Sur le banc en sélection',
      body: 'Convoqué mais laissé sur le banc lors des matchs de qualification, la frustration monte.',
    },
    choices: [
      { id: 'stay_patient', label: 'Rester patient et travailler', effects: { stats: { mental: 6 } } },
      { id: 'voice_frustration', label: 'Faire savoir ton mécontentement', effects: { stats: { reputation: -3 } } },
    ],
  },

  {
    id: 'evt_selection_major_tournament',
    category: 'selection',
    weight: 9,
    maxOccurrences: 2,
    cooldownSeasons: 3,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 50 } ] },
    text: {
      title: 'Une grande compétition internationale',
      body: 'Tu es sélectionné pour disputer un grand tournoi international avec ton pays.',
    },
    choices: [
      {
        id: 'embrace_pressure', label: 'Embrasser la pression de l\'événement',
        successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'reputation', weight: 0.4 }], difficulty: 60 },
        effects: { stats: { reputation: 12, mental: -3 } },
        failureEffects: { stats: { reputation: -5, mental: -6 } },
        resultText: {
          success: "Tu es à la hauteur de l'événement et ta réputation grandit encore.",
          failure: "La pression finit par te submerger et le tournoi tourne mal pour toi.",
        },
      },
      { id: 'play_it_safe', label: 'Jouer ton rôle sans en faire trop', effects: { stats: { mental: 5 } } },
    ],
  },

  {
    id: 'evt_selection_captain_armband',
    category: 'selection',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 65 }, { fact: 'career.season', op: '>=', value: 6 }] },
    text: {
      title: 'Brassard national',
      body: 'Le sélectionneur t\'annonce qu\'il souhaite te confier le brassard de capitaine de l\'équipe nationale.',
    },
    choices: [
      { id: 'accept_captaincy', label: 'Accepter cet honneur', effects: { stats: { reputation: 10, mental: 5 } } },
      { id: 'suggest_other', label: 'Suggérer un joueur plus expérimenté', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_selection_injury_before_tournament',
    category: 'selection',
    weight: 7,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'flag', key: 'rushed_recovery', op: '==', value: true }, { fact: 'stats.reputation', op: '>=', value: 50 }] },
    text: {
      title: 'Forfait avant le tournoi',
      body: 'Une rechute physique menace ta participation au tournoi international tant attendu.',
    },
    choices: [
      {
        id: 'risk_it', label: 'Prendre le risque de jouer quand même',
        successCheck: { stats: [{ stat: 'physique', weight: 0.7 }, { stat: 'mental', weight: 0.3 }], difficulty: 65 },
        effects: { stats: { physique: -8, reputation: 6 } },
        failureEffects: { stats: { physique: -15, reputation: -5 } },
        resultText: {
          success: "Ton corps tient le coup et tu disputes le tournoi malgré le risque pris.",
          failure: "La blessure se réveille en plein tournoi, aggravant nettement ton état.",
        },
      },
      { id: 'withdraw', label: 'Déclarer forfait pour préserver ta santé', effects: { stats: { mental: 4, reputation: -3 } } },
    ],
  },

  {
    id: 'evt_selection_teammate_reunion',
    category: 'selection',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 } ] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Retrouvailles en sélection',
      body: 'Tu retrouves {primary.name}, ton ancien coéquipier de club, désormais dans le groupe national.',
    },
    choices: [
      { id: 'reconnect', label: 'Renouer des liens forts', effects: { relation: [{ target: 'primary', trust: 15 }] } },
      { id: 'keep_professional', label: 'Rester purement professionnel', effects: {} },
    ],
  },

  {
    id: 'evt_selection_qualifier_pressure',
    category: 'selection',
    weight: 7,
    cooldownSeasons: 2,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 } ] },
    text: {
      title: 'Match qualificatif décisif',
      body: 'Un match de qualification à enjeu peut envoyer ton pays vers une grande compétition.',
    },
    choices: [
      { id: 'perform_under_pressure', label: 'Répondre présent sous la pression', effects: { stats: { reputation: 8, formOverall: 5 } } },
      { id: 'freeze_under_pressure', label: 'Craquer sous l\'enjeu', effects: { stats: { mental: -5, reputation: -3 } } },
    ],
  },

  {
    id: 'evt_selection_new_manager',
    category: 'selection',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 }, { fact: 'career.season', op: '>=', value: 5 }] },
    text: {
      title: 'Nouveau sélectionneur national',
      body: 'Un nouveau sélectionneur prend les rênes de l\'équipe nationale et redistribue les cartes pour chaque poste.',
    },
    choices: [
      {
        id: 'impress_new_manager', label: 'Tout donner pour le convaincre',
        successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'mental', weight: 0.5 }], difficulty: 55 },
        effects: { stats: { formOverall: 6, mental: -2 } },
        failureEffects: { stats: { formOverall: -3, mental: -4 } },
        resultText: {
          success: "Le nouveau sélectionneur remarque tes efforts et te garde dans ses plans.",
          failure: "Tu t'épuises sans convaincre, le sélectionneur reste sur ses doutes.",
        },
      },
      { id: 'rely_on_reputation', label: 'Compter sur ta réputation établie', effects: { stats: { reputation: -2 } } },
    ],
  },

  {
    id: 'evt_selection_veteran_status',
    category: 'selection',
    weight: 4,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 30 }, { fact: 'stats.reputation', op: '>=', value: 55 }] },
    text: {
      title: 'Devenu un vétéran du groupe',
      body: 'Tu réalises que tu es désormais l\'un des joueurs les plus expérimentés du groupe national, un rôle bien différent de tes débuts.',
    },
    choices: [
      { id: 'embrace_veteran_role', label: 'Endosser ce rôle de référence', effects: { stats: { reputation: 5, mental: 4 } } },
      { id: 'stay_one_of_group', label: 'Rester simplement un membre du groupe parmi d\'autres', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_selection_friendly_experiment',
    category: 'selection',
    weight: 5,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 45 } ] },
    text: {
      title: 'Un match amical pour expérimenter',
      body: 'Le sélectionneur profite d\'un match amical sans enjeu pour tester un système de jeu inhabituel avec toi dans un rôle différent.',
    },
    choices: [
      {
        id: 'embrace_experiment_selection', label: 'Te prêter au jeu avec sérieux',
        successCheck: { stats: [{ stat: 'tactique', weight: 0.6 }, { stat: 'mental', weight: 0.4 }], difficulty: 45 },
        effects: { stats: { tactique: 5 } },
        failureEffects: { stats: { tactique: -2, mental: -2 } },
        resultText: {
          success: "Le système inhabituel te réussit et enrichit ton registre tactique.",
          failure: "Tu ne trouves pas tes automatismes dans ce système expérimental.",
        },
      },
      { id: 'play_it_safe_selection', label: 'Rester sur des valeurs sûres', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_selection_dual_nationality',
    category: 'selection',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'career.season', op: '>=', value: 2 }, { fact: 'stats.reputation', op: '>=', value: 30 }] },
    text: {
      title: 'Un choix de nationalité sportive',
      body: 'Éligible pour deux sélections nationales différentes, tu dois trancher définitivement lequel de ces deux maillots tu porteras.',
    },
    choices: [
      { id: 'choose_heart', label: "Suivre ton cœur, pays d'origine de la famille", effects: { stats: { mental: 6 } } },
      { id: 'choose_opportunity', label: "Choisir la sélection offrant le plus d'opportunités sportives", effects: { stats: { reputation: 5 } } },
    ],
  },

  {
    id: 'evt_selection_underdog_run',
    category: 'selection',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'stats.reputation', op: '>=', value: 50 }, { fact: 'career.season', op: '>=', value: 4 }] },
    text: {
      title: 'Un parcours inattendu',
      body: 'Contre toute attente, la sélection nationale enchaîne les bons résultats et rêve d\'un parcours historique.',
    },
    choices: [
      {
        id: 'lead_the_run', label: 'Prendre les responsabilités sur le terrain',
        successCheck: { stats: [{ stat: 'mental', weight: 0.5 }, { stat: 'tactique', weight: 0.5 }], difficulty: 60 },
        effects: { stats: { reputation: 10, mental: -3 } },
        failureEffects: { stats: { reputation: -4, mental: -5 } },
        resultText: {
          success: "Tu portes l'équipe et le parcours historique continue grâce à toi.",
          failure: "Le poids des responsabilités te fait craquer au pire moment du parcours.",
        },
      },
      { id: 'support_quietly', label: 'Apporter ta pierre à l\'édifice sans en faire trop', effects: { stats: { mental: 4 } } },
    ],
  },

  {
    id: 'evt_selection_final_cap',
    category: 'selection',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 33 }, { fact: 'stats.reputation', op: '>=', value: 45 }] },
    text: {
      title: 'Dernière sélection nationale',
      body: 'Le sélectionneur t\'annonce que cette convocation sera probablement ta dernière en équipe nationale.',
    },
    choices: [
      { id: 'savor_last_cap', label: 'Savourer ce dernier moment sous le maillot national', effects: { stats: { reputation: 8, mental: 6 } } },
      { id: 'stay_stoic_last_cap', label: 'Rester stoïque, une page qui se tourne', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_retirement_hometown_tribute',
    category: 'retirement',
    weight: 5,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 33 }, { fact: 'career.history.length', op: '<=', value: 2 }] },
    text: {
      title: 'Un hommage de la ville natale',
      body: 'Ta ville natale organise une cérémonie pour célébrer ton parcours avant ta retraite.',
    },
    choices: [
      { id: 'attend_tribute', label: 'Assister avec émotion à la cérémonie', effects: { stats: { reputation: 6, mental: 6 } } },
      { id: 'decline_tribute', label: 'Décliner, préférant la discrétion', effects: { stats: { mental: 3 } } },
    ],
  },

  {
    id: 'evt_retirement_stadium_naming',
    category: 'retirement',
    weight: 4,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 34 }, { fact: 'stats.reputation', op: '>=', value: 70 }, { fact: 'career.history.length', op: '<=', value: 1 }] },
    text: {
      title: 'Un honneur suprême',
      body: 'Ton club formateur envisage de nommer une tribune du stade en ton honneur, en reconnaissance de toute ta carrière.',
    },
    choices: [
      { id: 'accept_honor', label: 'Accepter cet honneur avec émotion', effects: { stats: { reputation: 10, mental: 8 } } },
      { id: 'deflect_honor', label: 'Suggérer de dédier cet honneur au club plutôt qu\'à toi', effects: { stats: { reputation: 4, mental: 4 } } },
    ],
  },

  {
    id: 'evt_retirement_youngster_advice',
    category: 'retirement',
    weight: 6,
    maxOccurrences: 1,
    conditions: { all: [{ fact: 'player.age', op: '>=', value: 31 }] },
    actors: { primary: { role: 'teammate', pick: 'random' } },
    text: {
      title: 'Transmettre son expérience',
      body: 'Un jeune du groupe, {primary.name}, te demande conseil pour affronter la pression du haut niveau comme tu l\'as fait.',
    },
    choices: [
      { id: 'mentor_youngster', label: 'Prendre le temps de le conseiller sérieusement', effects: { relation: [{ target: 'primary', trust: 25 }], stats: { reputation: 4 } } },
      { id: 'brief_advice', label: 'Lui donner un conseil rapide', effects: { relation: [{ target: 'primary', trust: 8 }] } },
    ],
  },
];
