// === CONTENT: résumés narratifs + badges ===
// Résumés custom pour les moments forts (indexés eventId.choiceId).
// Fallback générique obligatoire pour tout le reste — cohérent avec "volume large
// d'abord, peaufiner l'écriture après".

const SUMMARY_TEMPLATES = {
  // --- Callbacks différés (moments les plus marquants, priorité à l'écriture custom) ---
  'evt_party_invite_snub.skip': "Saison {season} : tu as décliné l'invitation de {primary.name}, qui ne l'a pas digéré.",
  'evt_party_invite_snub.go': "Saison {season} : soirée mémorable avec {primary.name}, le lien s'est renforcé.",
  'evt_teammate_grudge_payback.apologize': "Saison {season} : tu as fait la paix avec {primary.name} devant tout le vestiaire.",
  'evt_teammate_grudge_payback.double_down': "Saison {season} : tu as ignoré la pique de {primary.name} — la tension est restée entière.",
  'evt_secret_betrayal_discovered.own_it': "Saison {season} : tu as assumé avoir trahi la confidence d'un coéquipier.",
  'evt_secret_betrayal_discovered.deny_it': "Saison {season} : tu as menti pour couvrir ta trahison — ça t'a coûté en crédibilité.",
  'evt_agent_lowball_reveal.fire_agent': "Saison {season} : tu as viré {primary.name} après avoir découvert la commission cachée.",
  'evt_agent_lowball_reveal.forgive': "Saison {season} : tu as pardonné à {primary.name} malgré la commission excessive.",
  'evt_coach_benching_threat.work_silently': "Saison {season} : écarté du groupe, tu as travaillé dans l'ombre pour revenir plus fort.",
  'evt_coach_benching_threat.demand_transfer': "Saison {season} : écarté du groupe, tu as demandé à partir.",
  'evt_injury_relapse.surgery': "Saison {season} : la blessure ignorée t'a forcé à l'opération.",
  'evt_injury_rushed_consequence.accept_limits': "Saison {season} : ton retour précipité a laissé des séquelles que tu as fini par accepter.",
  'evt_media_controversy_fallout.clarify': "Saison {season} : tu as dû clarifier tes propos après la polémique médiatique.",
  'evt_media_controversy_fallout.stand_ground': "Saison {season} : tu as maintenu ta position malgré la polémique, au prix de ton image.",

  // --- Moments forts ponctuels ---
  'evt_rival_mutual_respect.accept_gesture': "Saison {season} : {primary.name} et toi avez échangé vos maillots — la rivalité s'est muée en respect.",
  'evt_coach_trust_reward.accept_role': "Saison {season} : {primary.name} a fait de toi un cadre de l'équipe.",
  'evt_coach_succession_plan.welcome_succession_idea': "Saison {season} : {primary.name} t'a évoqué une reconversion comme entraîneur à ses côtés.",
  'evt_selection_first_call.answer_call': "Saison {season} : première convocation en équipe nationale, un rêve qui se réalise.",
  'evt_selection_captain_armband.accept_captaincy': "Saison {season} : tu as reçu le brassard de capitaine de la sélection nationale.",
  'evt_selection_final_cap.savor_last_cap': "Saison {season} : ta dernière sélection nationale, savourée pleinement.",
  'evt_retirement_final_match.emotional_farewell': "Saison {season} : ton dernier match professionnel, sous une ovation mémorable.",
  'evt_retirement_stadium_naming.accept_honor': "Saison {season} : une tribune du stade porte désormais ton nom.",
  'evt_family_estrangement.reach_out': "Saison {season} : tu as fait le premier pas pour renouer avec {primary.name}.",
  'evt_family_new_addition.take_time_off': "Saison {season} : ta famille s'est agrandie, et tu as pris le temps d'en profiter.",
  'evt_lifestyle_legacy_project.launch_foundation': "Saison {season} : tu as lancé ta fondation pour les jeunes de ton quartier d'origine.",
  'evt_fans_meet_young_supporter.visit_hospital': "Saison {season} : tu as rendu visite à un jeune supporter malade, un moment fort loin des projecteurs.",

  '__fallback__': 'Saison {season} : un choix marquant concernant {primary.name}.',
  '__fallback_no_actor__': 'Saison {season} : {eventTitle}.',
};

const BADGES = [
  {
    id: 'loyal_servant',
    label: 'Fidèle au poste',
    condition: { all: [{ fact: 'career.history.length', op: '<=', value: 2 }] },
  },
  {
    id: 'globe_trotter',
    label: 'Globe-trotter',
    condition: { all: [{ fact: 'career.history.length', op: '>=', value: 5 }] },
  },
  {
    id: 'media_darling',
    label: 'Chouchou des médias',
    condition: { all: [{ fact: 'stats.reputation', op: '>=', value: 80 }] },
  },
  {
    id: 'iron_body',
    label: 'Corps de fer',
    condition: { all: [{ fact: 'stats.physique', op: '>=', value: 85 }] },
  },
  {
    id: 'mental_fortress',
    label: 'Forteresse mentale',
    condition: { all: [{ fact: 'stats.mental', op: '>=', value: 85 }] },
  },
  {
    id: 'tactical_master',
    label: 'Maître tacticien',
    condition: { all: [{ fact: 'stats.tactique', op: '>=', value: 85 }] },
  },
  {
    id: 'technical_virtuoso',
    label: 'Virtuose technique',
    condition: { all: [{ fact: 'stats.technique', op: '>=', value: 85 }] },
  },
  {
    id: 'national_hero',
    label: 'Héros national',
    condition: { all: [{ fact: 'flag', key: 'succession_path_opened', op: '!=', value: true }, { fact: 'stats.reputation', op: '>=', value: 75 }] },
  },
  {
    id: 'wealthy_retiree',
    label: 'Fortune bâtie',
    condition: { all: [{ fact: 'career.season', op: '>=', value: 10 }] },
  },
  {
    id: 'controversial_figure',
    label: 'Figure controversée',
    condition: { all: [{ fact: 'flag', key: 'media_controversy', op: '==', value: true }] },
  },
  {
    id: 'peacemaker',
    label: 'Artisan de paix',
    condition: { all: [{ fact: 'flag', key: 'publicly_apologized', op: '==', value: true }] },
  },
  {
    id: 'family_first',
    label: 'La famille avant tout',
    condition: { all: [{ fact: 'flag', key: 'family_business_investment', op: '==', value: true }] },
  },
  {
    id: 'legacy_builder',
    label: 'Bâtisseur d\'héritage',
    condition: { all: [{ fact: 'flag', key: 'academy_path_opened', op: '==', value: true }] },
  },
  {
    id: 'resilient_body',
    label: 'Corps résilient',
    condition: { all: [{ fact: 'flag', key: 'rushed_recovery', op: '==', value: true }, { fact: 'career.season', op: '>=', value: 8 }] },
  },
  {
    id: 'globally_adored',
    label: 'Adulé partout',
    condition: { all: [{ fact: 'flag', key: 'moved_abroad', op: '==', value: true }, { fact: 'stats.reputation', op: '>=', value: 70 }] },
  },
];
