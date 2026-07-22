// === COMPÉTITIONS INTERNATIONALES (fictives) ===
// Une coupe continentale entre clubs + un tournoi international entre sélections.
// Même mécanique d'enjeu qu'un vrai grand tournoi, noms et structure entièrement inventés.

const CONTINENTAL_CUP = {
  id: 'continental_cup',
  label: 'Coupe des Champions Continentale',
  description: "Le tournoi qui oppose les meilleurs clubs du continent, saison après saison.",
  qualificationTierMax: 1, // seuls les clubs de tier 1 (élite) peuvent se qualifier
  qualificationPrestigeMin: 65,
  prestigeRewardWin: 25,
  reputationRewardWin: 20,
  prestigeRewardParticipation: 6,
  reputationRewardParticipation: 5,
};

const INTERNATIONAL_TOURNAMENT = {
  id: 'international_tournament',
  label: 'Tournoi des Nations',
  description: "Le grand rendez-vous international entre sélections nationales, tous les deux ans.",
  frequencySeasons: 2,
  reputationRewardWin: 30,
  reputationRewardParticipation: 10,
  mentalRewardWin: 10,
};

function isClubEligibleForContinentalCup(club) {
  return club.tier <= CONTINENTAL_CUP.qualificationTierMax && club.prestige >= CONTINENTAL_CUP.qualificationPrestigeMin;
}

function evaluateContinentalCupQualification(state) {
  const club = state.player.career.club;
  if (!isClubEligibleForContinentalCup(club)) return null;
  // probabilité de qualification, plus haute si le club est très au-dessus du seuil
  const margin = club.prestige - CONTINENTAL_CUP.qualificationPrestigeMin;
  const chance = Math.min(0.7, 0.25 + margin / 100);
  return Math.random() < chance ? { qualified: true } : null;
}

function buildContinentalCupEvent(state) {
  return {
    id: 'evt_dyn_continental_cup',
    category: 'selection',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: CONTINENTAL_CUP.label,
      body: `${state.player.career.club.name} s'est qualifié pour la ${CONTINENTAL_CUP.label} ! Une compétition exigeante, mais une vitrine inégalée.`,
    },
    choices: [
      {
        id: 'go_all_in',
        label: 'Tout donner pour aller loin dans la compétition',
        successCheck: {
          stats: [{ stat: 'technique', weight: 0.35 }, { stat: 'physique', weight: 0.3 }, { stat: 'mental', weight: 0.35 }],
          difficulty: 65,
        },
        effects: {
          stats: {
            reputation: CONTINENTAL_CUP.reputationRewardWin,
            formOverall: 8,
          },
        },
        failureEffects: {
          stats: { reputation: CONTINENTAL_CUP.reputationRewardParticipation, formOverall: -4, mental: -3 },
        },
        resultText: {
          success: `Une campagne européenne mémorable — ${state.player.career.club.name} et toi marquez les esprits.`,
          failure: "L'aventure s'arrête plus tôt que prévu, mais l'expérience reste précieuse.",
        },
      },
      {
        id: 'play_it_safe',
        label: 'Gérer prudemment ton temps de jeu',
        effects: { stats: { reputation: CONTINENTAL_CUP.reputationRewardParticipation, mental: 3 } },
      },
    ],
  };
}

function buildInternationalTournamentEvent(state) {
  return {
    id: 'evt_dyn_international_tournament',
    category: 'selection',
    weight: 1,
    dynamic: true,
    actors: {},
    text: {
      title: INTERNATIONAL_TOURNAMENT.label,
      body: `Le ${INTERNATIONAL_TOURNAMENT.label} approche, et tu fais partie des joueurs convoqués avec ta sélection nationale.`,
    },
    choices: [
      {
        id: 'embrace_tournament',
        label: 'Viser la victoire finale avec ton pays',
        successCheck: {
          stats: [{ stat: 'mental', weight: 0.4 }, { stat: 'tactique', weight: 0.3 }, { stat: 'technique', weight: 0.3 }],
          difficulty: 68,
        },
        effects: {
          stats: { reputation: INTERNATIONAL_TOURNAMENT.reputationRewardWin, mental: INTERNATIONAL_TOURNAMENT.mentalRewardWin },
        },
        failureEffects: {
          stats: { reputation: INTERNATIONAL_TOURNAMENT.reputationRewardParticipation, mental: -4 },
        },
        resultText: {
          success: "Un parcours international héroïque — ton pays et toi entrez dans l'histoire.",
          failure: "Le tournoi s'achève sur une désillusion collective, difficile à digérer.",
        },
      },
      {
        id: 'play_supporting_role',
        label: 'Assumer un rôle de soutien dans le groupe',
        effects: { stats: { reputation: INTERNATIONAL_TOURNAMENT.reputationRewardParticipation, mental: 4 } },
      },
    ],
  };
}
