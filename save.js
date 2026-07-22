// === SAVE / PERSISTENCE ===
// localStorage, schema versionné pour permettre des migrations sans casser les parties en cours.

const SAVE_KEY = 'destiny_career_save_v1';
const SCHEMA_VERSION = 3;

function migrateV1toV2(state) {
  const legacyClub = state.player.career.club;
  const matched = CLUBS.find(c => c.id === legacyClub.id);
  state.player.career.club = matched
    ? { id: matched.id, name: matched.name, countryId: matched.countryId, tier: matched.tier, prestige: matched.prestige }
    : { id: legacyClub.id, name: legacyClub.name, countryId: 'fr', tier: legacyClub.division === 'L1' ? 1 : 2, prestige: 40 };

  state.pendingTransferOffers = state.pendingTransferOffers || [];
  state.player.identity.startingAge = state.player.identity.startingAge || 17;
  return state;
}

function migrateV2toV3(state) {
  state.player.identity.nationalityId = state.player.identity.nationalityId || 'fr';
  state.player.identity.position = state.player.identity.position || 'mid';

  state.player.wallet.careerEarnings = state.player.wallet.careerEarnings ?? 0;
  state.player.wallet.lastSigningBonus = state.player.wallet.lastSigningBonus ?? 0;

  state.player.career.playingTime = state.player.career.playingTime ?? 50;
  state.player.career.loan = state.player.career.loan || null;

  const matched = CLUBS.find(c => c.id === state.player.career.club.id);
  if (matched) state.player.career.club.tier = clampClubTierByPrestige(matched);

  state.pendingContractRenegotiation = state.pendingContractRenegotiation || false;
  state.pendingContinentalCup = state.pendingContinentalCup || false;
  state.pendingInternationalTournament = state.pendingInternationalTournament || false;
  state.pendingSeasonAward = state.pendingSeasonAward || null;

  state.seasonMatchMoments = state.seasonMatchMoments || { successCount: 0, attemptCount: 0 };
  state.seasonMatchStats = state.seasonMatchStats || { goals: 0, assists: 0 };
  state.careerMatchStats = state.careerMatchStats || { goals: 0, assists: 0 };

  return state;
}

function migrate(saved) {
  if (!saved) return null;
  let { schemaVersion, state } = saved;
  if (schemaVersion === 1) {
    state = migrateV1toV2(state);
    schemaVersion = 2;
  }
  if (schemaVersion === 2) {
    state = migrateV2toV3(state);
    schemaVersion = 3;
  }
  if (schemaVersion === SCHEMA_VERSION) return state;

  // Futures migrations incrémentales iront ici, ex:
  // if (schemaVersion === 3) { state = migrateV3toV4(state); schemaVersion = 4; }

  return state;
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch (e) {
    console.warn('Save corrompue, ignorée.', e);
    return null;
  }
}

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, state }));
  } catch (e) {
    console.warn('Impossible de sauvegarder.', e);
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
