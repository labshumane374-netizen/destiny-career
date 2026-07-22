// === MOMENTS DE MATCH JOUABLES ===
// Sur certains matchs importants (pas tous), 2-4 choix successifs pendant le match,
// réutilisant le système successCheck déjà en place. Les résultats alimentent le
// trophée de fin de saison (seasonMatchMoments/seasonMatchStats) sans dupliquer de
// logique de moteur. eligiblePositions filtre le pool par poste (pool unique, pas
// de pools séparés) ; statType alimente les stats de but/passe cumulées.

const MATCH_MOMENT_TRIGGER_CHANCE = 0.35; // fraction des beats "normaux" qui deviennent un match jouable

const MATCH_MOMENT_POOL = [
  {
    id: 'mm_late_dribble',
    eligiblePositions: ['mid', 'att'],
    title: 'Match serré — dernières minutes',
    intro: "Le score est serré. Sur une contre-attaque, tu te retrouves seul face à deux défenseurs.",
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
            resultText: { success: 'Le geste passe, tu élimines les deux défenseurs !', failure: 'Le ballon est repris, l\'occasion s\'envole.' },
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
    intro: "L'arbitre siffle penalty en ta faveur, en toute fin de match.",
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
            resultText: { success: 'Sang-froid total, le ballon au fond des filets.', failure: 'Le gardien capte, un silence pesant sur le stade.' },
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
    intro: "L'adversaire attaque en supériorité numérique dans les dernières secondes.",
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
            resultText: { success: 'Tacle parfait, l\'attaque est stoppée net.', failure: 'Le tacle échoue, but adverse dans la foulée.' },
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
    intro: "Une faute obtenue à une distance idéale pour tenter directement.",
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
            resultText: { success: 'Le ballon file dans la lucarne, magnifique !', failure: 'Le tir passe au-dessus, occasion manquée.' },
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
    intro: "Un tir surpuissant part au ras du poteau, dans les dernières minutes.",
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
            resultText: { success: 'Parade extraordinaire, le stade explose !', failure: 'Le ballon file au fond, impossible à sortir.' },
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
    intro: "Un centre plongeant arrive dans une surface bondée.",
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
            resultText: { success: 'Sortie autoritaire, le danger est écarté.', failure: 'Le ballon t\'échappe, but adverse au rebond.' },
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
  return {
    id: `evt_dyn_matchmoment_${moment.id}`,
    category: 'match',
    weight: 1,
    dynamic: true,
    actors: {},
    text: { title: moment.title, body: `${moment.intro} ${step.prompt}` },
    choices: step.choices,
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
