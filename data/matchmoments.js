// === MOMENTS DE MATCH JOUABLES ===
// Sur certains matchs importants (pas tous), 2-4 choix successifs pendant le match,
// réutilisant le système successCheck déjà en place. Les résultats alimentent le
// trophée de fin de saison (seasonMatchMoments/seasonMatchStats) sans dupliquer de
// logique de moteur. eligiblePositions filtre le pool par poste (pool unique, pas
// de pools séparés) ; statType alimente les stats de but/passe cumulées.
// intros[] et resultText.success[]/.failure[] sont des variantes tirées aléatoirement
// à chaque occurrence pour casser la répétition sur les longues carrières.

const MATCH_MOMENT_TRIGGER_CHANCE = 0.35; // fraction des beats "normaux" qui deviennent un match jouable

function pickVariant(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const MATCH_MOMENT_POOL = [
  {
    id: 'mm_late_dribble',
    eligiblePositions: ['mid', 'att'],
    title: 'Match serré — dernières minutes',
    intros: [
      "Le score est serré. Sur une contre-attaque, tu te retrouves seul face à deux défenseurs.",
      "Il reste peu de temps. Un ballon récupéré haut te lance en duel contre deux joueurs adverses.",
      "L'égalité tient à un fil. Tu contres et files vers le but, deux défenseurs se replacent devant toi.",
      "Le public retient son souffle. Une percée soudaine te met face à deux adversaires isolés.",
      "Fin de match tendue. Un une-deux rapide te laisse en un contre deux dans les seize mètres.",
    ],
    steps: [
      {
        id: 'step_dribble',
        prompt: 'Que fais-tu ?',
        choices: [
          {
            id: 'attempt_dribble', label: 'Tenter de les déborder',
            successCheck: { stats: [{ stat: 'technique', weight: 0.7 }, { stat: 'mental', weight: 0.3 }], difficulty: 55 },
            effects: { stats: { reputation: 5, formOverall: 4 } },
            failureEffects: { stats: { formOverall: -3 } },
            statType: 'assist',
            resultText: {
              success: [
                'Le geste passe, tu élimines les deux défenseurs !',
                'Une accélération sèche et les deux joueurs sont dans le vent.',
                'Le crochet fait mouche, la voie est libre derrière.',
                'Un festival technique, le public se lève dans les tribunes.',
                'Ils ne touchent pas le ballon, l\'occasion est totale.',
              ],
              failure: [
                'Le ballon est repris, l\'occasion s\'envole.',
                'Le contrôle est trop long, un défenseur intercepte.',
                'La tentative échoue net, contre-attaque adverse immédiate.',
                'Le geste est lu à l\'avance, la défense s\'en sort bien.',
                'Le ballon touche un pied adverse et sort en touche.',
              ],
            },
          },
          {
            id: 'pass_back', label: 'Faire la passe simple à un coéquipier',
            effects: { stats: { tactique: 2 } },
          },
        ],
      },
    ],
  },
  {
    id: 'mm_penalty',
    eligiblePositions: ['mid', 'att'],
    title: 'Penalty décisif',
    intros: [
      "L'arbitre siffle penalty en ta faveur, en toute fin de match.",
      "Une faute limpide dans la surface, l'arbitre pointe le point de penalty.",
      "Le VAR confirme la faute : penalty accordé dans un silence de plomb.",
      "Un contact évident dans la surface adverse, penalty indiscutable.",
      "Le stade retient son souffle : penalty pour ton équipe à quelques minutes du terme.",
    ],
    steps: [
      {
        id: 'step_penalty',
        prompt: 'Qui tire ?',
        choices: [
          {
            id: 'take_penalty', label: 'Le tirer toi-même',
            successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'technique', weight: 0.4 }], difficulty: 50 },
            effects: { stats: { reputation: 8, formOverall: 5 } },
            failureEffects: { stats: { reputation: -4, mental: -3 } },
            statType: 'goal',
            resultText: {
              success: [
                'Sang-froid total, le ballon au fond des filets.',
                'Frappe placée imparable, le gardien s\'incline.',
                'Une panenka osée qui passe, quel culot !',
                'Le ballon claque dans la lucarne, exécution parfaite.',
                'Aucun doute dans le geste, but inscrit avec autorité.',
              ],
              failure: [
                'Le gardien capte, un silence pesant sur le stade.',
                'Le tir s\'envole au-dessus de la barre transversale.',
                'Le poteau repousse la frappe, occasion manquée de peu.',
                'Le gardien détourne du bout des doigts, incroyable arrêt.',
                'La frappe manque de force, facilement captée.',
              ],
            },
          },
          {
            id: 'give_penalty', label: 'Le laisser à un coéquipier',
            effects: { stats: { mental: 2 } },
          },
        ],
      },
    ],
  },
  {
    id: 'mm_defensive_stand',
    eligiblePositions: ['def', 'gk'],
    title: 'Dernier rempart',
    intros: [
      "L'adversaire attaque en supériorité numérique dans les dernières secondes.",
      "Une dernière offensive adverse déferle, tu es le dernier rempart avant le but.",
      "Le chrono s'affole, l'attaque adverse se présente à deux contre un devant toi.",
      "Une ultime action désespérée de l'adversaire, tout repose sur ta réaction.",
      "Le danger est immédiat : un débordement adverse arrive droit sur toi.",
    ],
    steps: [
      {
        id: 'step_defend',
        prompt: 'Comment réagis-tu ?',
        choices: [
          {
            id: 'risky_tackle', label: 'Tenter le tacle décisif',
            successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'tactique', weight: 0.5 }], difficulty: 58 },
            effects: { stats: { reputation: 6, tactique: 3 } },
            failureEffects: { stats: { reputation: -5 }, flags: [{ key: 'conceded_costly_goal' }] },
            resultText: {
              success: [
                'Tacle parfait, l\'attaque est stoppée net.',
                'Intervention chirurgicale, le ballon est récupéré proprement.',
                'Un tacle glissé impeccable, le danger est écarté.',
                'Anticipation parfaite, l\'attaquant est coupé dans son élan.',
                'Un geste défensif salvateur, la tribune exulte.',
              ],
              failure: [
                'Le tacle échoue, but adverse dans la foulée.',
                'Le tacle est manqué, l\'attaquant s\'échappe et marque.',
                'Le contact arrive trop tard, l\'adversaire conclut.',
                'Le geste est mal ajusté, l\'occasion est fatale.',
                'Le duel est perdu, le but tombe juste après.',
              ],
            },
          },
          {
            id: 'contain_safely', label: 'Temporiser sans prendre de risque',
            effects: { stats: { mental: 3 } },
          },
        ],
      },
    ],
  },
  {
    id: 'mm_free_kick',
    eligiblePositions: ['mid', 'att'],
    title: 'Coup franc aux abords de la surface',
    intros: [
      "Une faute obtenue à une distance idéale pour tenter directement.",
      "Coup franc excentré mais à bonne distance, tu peux tenter ta chance.",
      "La faute est sifflée juste aux abords de la surface, position idéale pour frapper.",
      "Un coup franc à vingt mètres, dans un angle favorable pour le cadre.",
      "L'arbitre place le ballon aux abords de la surface, l'occasion est belle.",
    ],
    steps: [
      {
        id: 'step_freekick',
        prompt: 'Ta décision ?',
        choices: [
          {
            id: 'shoot_direct', label: 'Tenter directement au but',
            successCheck: { stats: [{ stat: 'technique', weight: 0.8 }, { stat: 'mental', weight: 0.2 }], difficulty: 62 },
            effects: { stats: { reputation: 7, technique: 2 } },
            failureEffects: { stats: { formOverall: -2 } },
            statType: 'goal',
            resultText: {
              success: [
                'Le ballon file dans la lucarne, magnifique !',
                'Une frappe enroulée qui contourne le mur, imparable.',
                'Le ballon passe au-dessus du mur et rentre sous la barre.',
                'Un tir surpuissant que le gardien ne voit même pas passer.',
                'La trajectoire est parfaite, le gardien est totalement pris à contrepied.',
              ],
              failure: [
                'Le tir passe au-dessus, occasion manquée.',
                'Le mur repousse la frappe, sans danger.',
                'Le ballon s\'écrase sur la barre transversale.',
                'Le gardien capte sans trop de difficulté.',
                'Le tir dévie et sort en corner, rien de plus.',
              ],
            },
          },
          {
            id: 'play_short', label: 'Jouer une combinaison courte',
            effects: { stats: { tactique: 3 } },
          },
        ],
      },
    ],
  },
  {
    id: 'mm_decisive_save',
    eligiblePositions: ['gk'],
    title: 'Arrêt décisif',
    intros: [
      "Un tir surpuissant part au ras du poteau, dans les dernières minutes.",
      "Une frappe lointaine surprend tout le monde et file vers ta cage.",
      "L'attaquant adverse déclenche une frappe croisée en pleine lucarne.",
      "Un tir contré dévie dangereusement vers ton but.",
      "Une reprise de volée puissante part droit sur toi.",
    ],
    steps: [
      {
        id: 'step_save',
        prompt: 'Comment plonges-tu ?',
        choices: [
          {
            id: 'full_stretch_save', label: 'Tenter la parade complète',
            successCheck: { stats: [{ stat: 'physique', weight: 0.5 }, { stat: 'technique', weight: 0.5 }], difficulty: 58 },
            effects: { stats: { reputation: 7, mental: 3 } },
            failureEffects: { stats: { reputation: -5 } },
            resultText: {
              success: [
                'Parade extraordinaire, le stade explose !',
                'Une claquette réflexe qui envoie le ballon en corner.',
                'Détente spectaculaire, le ballon est repoussé in extremis.',
                'Un arrêt de classe mondiale, tes coéquipiers viennent te féliciter.',
                'Le ballon est stoppé net, la cage reste inviolée.',
              ],
              failure: [
                'Le ballon file au fond, impossible à sortir.',
                'La détente est trop courte, le ballon rentre.',
                'Le plongeon arrive une fraction de seconde trop tard.',
                'Le ballon frôle tes doigts avant de terminer au fond.',
                'La trajectoire était injouable, le but tombe.',
              ],
            },
          },
          {
            id: 'concede_safely', label: 'Dévier prudemment en corner',
            effects: { stats: { tactique: 2 } },
          },
        ],
      },
    ],
  },
  {
    id: 'mm_aerial_claim',
    eligiblePositions: ['gk'],
    title: 'Sortie aérienne dans la surface',
    intros: [
      "Un centre plongeant arrive dans une surface bondée.",
      "Un corner dangereux est envoyé au cœur de ta surface.",
      "Un centre tendu traverse toute la défense vers ta cage.",
      "Une chandelle atterrit en plein cœur de la surface, disputée par tout le monde.",
      "Un ballon aérien traîne dangereusement dans tes six mètres.",
    ],
    steps: [
      {
        id: 'step_claim',
        prompt: 'Sors-tu au ballon ?',
        choices: [
          {
            id: 'commit_claim', label: 'Sortir capter le ballon',
            successCheck: { stats: [{ stat: 'mental', weight: 0.6 }, { stat: 'physique', weight: 0.4 }], difficulty: 55 },
            effects: { stats: { reputation: 5, mental: 2 } },
            failureEffects: { stats: { reputation: -6 }, flags: [{ key: 'conceded_costly_goal' }] },
            resultText: {
              success: [
                'Sortie autoritaire, le danger est écarté.',
                'Le ballon est capté proprement au-dessus de la mêlée.',
                'Une sortie décisive qui coupe le centre net.',
                'Le ballon est fermement gardé dans tes mains, aucune contestation possible.',
                'Sortie parfaitement calculée, la menace est neutralisée.',
              ],
              failure: [
                'Le ballon t\'échappe, but adverse au rebond.',
                'La sortie est manquée, un attaquant récupère le ballon.',
                'Le ballon glisse de tes mains, catastrophe évitée de justesse... ou pas.',
                'Bousculé dans la sortie, le ballon file au fond.',
                'Le timing est mauvais, le but est inscrit dans la foulée.',
              ],
            },
          },
          {
            id: 'stay_on_line', label: 'Rester sur ta ligne',
            effects: { stats: { mental: 1 } },
          },
        ],
      },
    ],
  },
];

function pickMatchMoment(positionId) {
  const eligible = MATCH_MOMENT_POOL.filter(m => !m.eligiblePositions || m.eligiblePositions.includes(positionId));
  const pool = eligible.length ? eligible : MATCH_MOMENT_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildMatchMomentEvent(moment) {
  const step = moment.steps[0];
  const intro = moment.intros ? pickVariant(moment.intros) : moment.intro;
  const resolvedChoices = step.choices.map(choice => {
    if (!choice.resultText) return choice;
    const success = Array.isArray(choice.resultText.success) ? pickVariant(choice.resultText.success) : choice.resultText.success;
    const failure = Array.isArray(choice.resultText.failure) ? pickVariant(choice.resultText.failure) : choice.resultText.failure;
    return { ...choice, resultText: { success, failure } };
  });
  return {
    id: `evt_dyn_matchmoment_${moment.id}`,
    category: 'match',
    weight: 1,
    dynamic: true,
    actors: {},
    text: { title: moment.title, body: `${intro} ${step.prompt}` },
    choices: resolvedChoices,
  };
}

function recordMatchMomentOutcome(state, outcome) {
  if (!state.seasonMatchMoments) resetSeasonMatchMoments(state);
  if (outcome === 'success') {
    state.seasonMatchMoments.successCount++;
    state.seasonMatchMoments.attemptCount++;
  } else if (outcome === 'failure') {
    state.seasonMatchMoments.attemptCount++;
  }
}

function recordMatchStat(state, statType) {
  if (!statType) return;
  if (!state.seasonMatchStats) state.seasonMatchStats = { goals: 0, assists: 0 };
  if (!state.careerMatchStats) state.careerMatchStats = { goals: 0, assists: 0 };
  const key = statType === 'goal' ? 'goals' : 'assists';
  state.seasonMatchStats[key]++;
  state.careerMatchStats[key]++;
}
