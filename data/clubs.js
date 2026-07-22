// === CLUBS / CHAMPIONNATS ===
// Pays -> championnat -> divisions (4 tiers : Élite/D1/D2/Régional) -> clubs.
// Vrais noms de pays (domaine public). Championnats, clubs et fédérations restent
// fictifs, écrits à la main (pas de génération procédurale). Prestige 0-100
// directement comparable aux stats du joueur.

const COUNTRIES = {
  fr: { id: 'fr', label: 'France' },
  en: { id: 'en', label: 'Angleterre' },
  es: { id: 'es', label: 'Espagne' },
  de: { id: 'de', label: 'Allemagne' },
  it: { id: 'it', label: 'Italie' },
  pt: { id: 'pt', label: 'Portugal' },
  nl: { id: 'nl', label: 'Pays-Bas' },
  be: { id: 'be', label: 'Belgique' },
  tr: { id: 'tr', label: 'Turquie' },
  br: { id: 'br', label: 'Brésil' },
  ar: { id: 'ar', label: 'Argentine' },
  co: { id: 'co', label: 'Colombie' },
  uy: { id: 'uy', label: 'Uruguay' },
  us: { id: 'us', label: 'États-Unis' },
  mx: { id: 'mx', label: 'Mexique' },
  ma: { id: 'ma', label: 'Maroc' },
  sn: { id: 'sn', label: 'Sénégal' },
  jp: { id: 'jp', label: 'Japon' },
  kr: { id: 'kr', label: 'Corée du Sud' },
};

const COMPETITIONS = {
  fr: {
    countryId: 'fr',
    label: 'Championnat de France',
    divisions: [
      { tier: 1, label: 'Ligue Élite', prestigeRange: [62, 100] },
      { tier: 2, label: 'Division Nationale 1', prestigeRange: [42, 61] },
      { tier: 3, label: 'Division Nationale 2', prestigeRange: [24, 41] },
      { tier: 4, label: 'Championnat Régional', prestigeRange: [5, 23] },
    ],
  },
  en: {
    countryId: 'en',
    label: 'Premier Championship',
    divisions: [
      { tier: 1, label: 'Premier Elite League', prestigeRange: [65, 100] },
      { tier: 2, label: 'Championship Division One', prestigeRange: [44, 64] },
      { tier: 3, label: 'Championship Division Two', prestigeRange: [26, 43] },
      { tier: 4, label: 'National League Regional', prestigeRange: [5, 25] },
    ],
  },
  es: {
    countryId: 'es',
    label: 'Liga Española',
    divisions: [
      { tier: 1, label: 'Liga Dorada', prestigeRange: [62, 100] },
      { tier: 2, label: 'Liga de Plata 1', prestigeRange: [42, 61] },
      { tier: 3, label: 'Liga de Plata 2', prestigeRange: [24, 41] },
      { tier: 4, label: 'Segunda Regional', prestigeRange: [5, 23] },
    ],
  },
  de: {
    countryId: 'de',
    label: 'Deutsche Meisterschaft',
    divisions: [
      { tier: 1, label: 'Bundesliga Elite', prestigeRange: [60, 100] },
      { tier: 2, label: 'Zweite Klasse 1', prestigeRange: [42, 59] },
      { tier: 3, label: 'Zweite Klasse 2', prestigeRange: [24, 41] },
      { tier: 4, label: 'Regionalliga', prestigeRange: [5, 23] },
    ],
  },
  it: {
    countryId: 'it',
    label: 'Campionato Italiano',
    divisions: [
      { tier: 1, label: 'Serie Aurea', prestigeRange: [62, 100] },
      { tier: 2, label: 'Serie Argentea 1', prestigeRange: [42, 61] },
      { tier: 3, label: 'Serie Argentea 2', prestigeRange: [24, 41] },
      { tier: 4, label: 'Serie Regionale', prestigeRange: [5, 23] },
    ],
  },
  pt: {
    countryId: 'pt',
    label: 'Campeonato Português',
    divisions: [
      { tier: 1, label: 'Liga de Elite', prestigeRange: [60, 100] },
      { tier: 2, label: 'Liga Nacional 1', prestigeRange: [40, 59] },
      { tier: 3, label: 'Liga Nacional 2', prestigeRange: [22, 39] },
      { tier: 4, label: 'Campeonato Regional', prestigeRange: [5, 21] },
    ],
  },
  nl: {
    countryId: 'nl',
    label: 'Nederlands Kampioenschap',
    divisions: [
      { tier: 1, label: 'Eredivisie Elite', prestigeRange: [60, 100] },
      { tier: 2, label: 'Eerste Klasse 1', prestigeRange: [40, 59] },
      { tier: 3, label: 'Eerste Klasse 2', prestigeRange: [22, 39] },
      { tier: 4, label: 'Regionale Klasse', prestigeRange: [5, 21] },
    ],
  },
  be: {
    countryId: 'be',
    label: 'Championnat de Belgique',
    divisions: [
      { tier: 1, label: 'Division Élite', prestigeRange: [58, 100] },
      { tier: 2, label: 'Division Nationale 1', prestigeRange: [38, 57] },
      { tier: 3, label: 'Division Nationale 2', prestigeRange: [20, 37] },
      { tier: 4, label: 'Division Provinciale', prestigeRange: [5, 19] },
    ],
  },
  tr: {
    countryId: 'tr',
    label: 'Türkiye Şampiyonası',
    divisions: [
      { tier: 1, label: 'Süper Elit Lig', prestigeRange: [60, 100] },
      { tier: 2, label: 'Birinci Lig 1', prestigeRange: [40, 59] },
      { tier: 3, label: 'Birinci Lig 2', prestigeRange: [22, 39] },
      { tier: 4, label: 'Bölgesel Lig', prestigeRange: [5, 21] },
    ],
  },
  br: {
    countryId: 'br',
    label: 'Campeonato Brasileiro',
    divisions: [
      { tier: 1, label: 'Série Dourada', prestigeRange: [62, 100] },
      { tier: 2, label: 'Série Prata 1', prestigeRange: [42, 61] },
      { tier: 3, label: 'Série Prata 2', prestigeRange: [24, 41] },
      { tier: 4, label: 'Série Regional', prestigeRange: [5, 23] },
    ],
  },
  ar: {
    countryId: 'ar',
    label: 'Campeonato Argentino',
    divisions: [
      { tier: 1, label: 'Primera de Elite', prestigeRange: [60, 100] },
      { tier: 2, label: 'Primera Nacional 1', prestigeRange: [40, 59] },
      { tier: 3, label: 'Primera Nacional 2', prestigeRange: [22, 39] },
      { tier: 4, label: 'Torneo Regional', prestigeRange: [5, 21] },
    ],
  },
  co: {
    countryId: 'co',
    label: 'Campeonato Colombiano',
    divisions: [
      { tier: 1, label: 'Liga Dorada', prestigeRange: [56, 100] },
      { tier: 2, label: 'Liga Nacional 1', prestigeRange: [36, 55] },
      { tier: 3, label: 'Liga Nacional 2', prestigeRange: [18, 35] },
      { tier: 4, label: 'Torneo Regional', prestigeRange: [5, 17] },
    ],
  },
  uy: {
    countryId: 'uy',
    label: 'Campeonato Uruguayo',
    divisions: [
      { tier: 1, label: 'Liga de Elite', prestigeRange: [54, 100] },
      { tier: 2, label: 'Liga Nacional 1', prestigeRange: [34, 53] },
      { tier: 3, label: 'Liga Nacional 2', prestigeRange: [16, 33] },
      { tier: 4, label: 'Torneo Regional', prestigeRange: [5, 15] },
    ],
  },
  us: {
    countryId: 'us',
    label: 'National Championship',
    divisions: [
      { tier: 1, label: 'Premier Conference', prestigeRange: [54, 100] },
      { tier: 2, label: 'Championship Conference 1', prestigeRange: [34, 53] },
      { tier: 3, label: 'Championship Conference 2', prestigeRange: [16, 33] },
      { tier: 4, label: 'Regional League', prestigeRange: [5, 15] },
    ],
  },
  mx: {
    countryId: 'mx',
    label: 'Campeonato Mexicano',
    divisions: [
      { tier: 1, label: 'Liga de Oro', prestigeRange: [56, 100] },
      { tier: 2, label: 'Liga de Plata 1', prestigeRange: [36, 55] },
      { tier: 3, label: 'Liga de Plata 2', prestigeRange: [18, 35] },
      { tier: 4, label: 'Liga Regional', prestigeRange: [5, 17] },
    ],
  },
  ma: {
    countryId: 'ma',
    label: 'Championnat du Maroc',
    divisions: [
      { tier: 1, label: 'Division Élite', prestigeRange: [52, 100] },
      { tier: 2, label: 'Division Nationale 1', prestigeRange: [32, 51] },
      { tier: 3, label: 'Division Nationale 2', prestigeRange: [16, 31] },
      { tier: 4, label: 'Division Régionale', prestigeRange: [5, 15] },
    ],
  },
  sn: {
    countryId: 'sn',
    label: 'Championnat du Sénégal',
    divisions: [
      { tier: 1, label: 'Division Élite', prestigeRange: [50, 100] },
      { tier: 2, label: 'Division Nationale 1', prestigeRange: [30, 49] },
      { tier: 3, label: 'Division Nationale 2', prestigeRange: [15, 29] },
      { tier: 4, label: 'Division Régionale', prestigeRange: [5, 14] },
    ],
  },
  jp: {
    countryId: 'jp',
    label: 'Nihon Senshuken',
    divisions: [
      { tier: 1, label: 'Elite Division', prestigeRange: [56, 100] },
      { tier: 2, label: 'National Division 1', prestigeRange: [36, 55] },
      { tier: 3, label: 'National Division 2', prestigeRange: [18, 35] },
      { tier: 4, label: 'Regional Division', prestigeRange: [5, 17] },
    ],
  },
  kr: {
    countryId: 'kr',
    label: 'Hanguk Seonsuweon',
    divisions: [
      { tier: 1, label: 'Elite Division', prestigeRange: [54, 100] },
      { tier: 2, label: 'National Division 1', prestigeRange: [34, 53] },
      { tier: 3, label: 'National Division 2', prestigeRange: [16, 33] },
      { tier: 4, label: 'Regional Division', prestigeRange: [5, 15] },
    ],
  },
};

const CLUBS = [
  // --- France (12) ---
  { id: 'fr_racing_marseille', name: 'Racing Marseille', countryId: 'fr', tier: 1, prestige: 88 },
  { id: 'fr_ol_forez', name: 'Forez Olympique', countryId: 'fr', tier: 1, prestige: 74 },
  { id: 'fr_as_bretagne', name: 'AS Bretagne', countryId: 'fr', tier: 1, prestige: 64 },
  { id: 'fr_racing_nord', name: 'Racing du Nord', countryId: 'fr', tier: 2, prestige: 58 },
  { id: 'fr_fc_lyonnais', name: 'FC Lyonnais', countryId: 'fr', tier: 2, prestige: 50 },
  { id: 'fr_toulouse_occitane', name: 'Toulouse Occitane', countryId: 'fr', tier: 2, prestige: 44 },
  { id: 'fr_stade_alpin', name: 'Stade Alpin', countryId: 'fr', tier: 3, prestige: 36 },
  { id: 'fr_nancy_lorraine', name: 'Nancy Lorraine FC', countryId: 'fr', tier: 3, prestige: 30 },
  { id: 'fr_reims_champagne', name: 'Reims Champagne', countryId: 'fr', tier: 3, prestige: 26 },
  { id: 'fr_as_maritime', name: 'AS Maritime', countryId: 'fr', tier: 4, prestige: 18 },
  { id: 'fr_us_val_de_loire', name: 'US Val-de-Loire', countryId: 'fr', tier: 4, prestige: 14 },
  { id: 'fr_ardennes_fc', name: 'Ardennes FC', countryId: 'fr', tier: 4, prestige: 9 },

  // --- Angleterre (12) ---
  { id: 'en_manchester_forge', name: 'Manchester Forge FC', countryId: 'en', tier: 1, prestige: 92 },
  { id: 'en_london_wanderers', name: 'London Wanderers', countryId: 'en', tier: 1, prestige: 80 },
  { id: 'en_northgate_utd', name: 'Northgate United', countryId: 'en', tier: 1, prestige: 68 },
  { id: 'en_north_shore_utd', name: 'North Shore United', countryId: 'en', tier: 2, prestige: 60 },
  { id: 'en_hartfield_rovers', name: 'Hartfield Rovers', countryId: 'en', tier: 2, prestige: 52 },
  { id: 'en_millbrook_town', name: 'Millbrook Town', countryId: 'en', tier: 2, prestige: 46 },
  { id: 'en_west_valley_fc', name: 'West Valley FC', countryId: 'en', tier: 3, prestige: 38 },
  { id: 'en_redcliff_athletic', name: 'Redcliff Athletic', countryId: 'en', tier: 3, prestige: 32 },
  { id: 'en_stonebridge_utd', name: 'Stonebridge United', countryId: 'en', tier: 3, prestige: 27 },
  { id: 'en_east_end_athletic', name: 'East End Athletic', countryId: 'en', tier: 4, prestige: 16 },
  { id: 'en_bridgeport_town', name: 'Bridgeport Town', countryId: 'en', tier: 4, prestige: 12 },
  { id: 'en_fenmoor_fc', name: 'Fenmoor FC', countryId: 'en', tier: 4, prestige: 8 },

  // --- Espagne (12) ---
  { id: 'es_real_medina', name: 'Real Medina', countryId: 'es', tier: 1, prestige: 90 },
  { id: 'es_atletico_delsol', name: 'Atlético del Sol', countryId: 'es', tier: 1, prestige: 76 },
  { id: 'es_club_costera', name: 'Club Costera', countryId: 'es', tier: 1, prestige: 63 },
  { id: 'es_deportivo_norte', name: 'Deportivo Norte', countryId: 'es', tier: 2, prestige: 58 },
  { id: 'es_union_serrana', name: 'Unión Serrana', countryId: 'es', tier: 2, prestige: 50 },
  { id: 'es_real_vega', name: 'Real Vega', countryId: 'es', tier: 2, prestige: 44 },
  { id: 'es_cd_altomar', name: 'CD Altomar', countryId: 'es', tier: 3, prestige: 37 },
  { id: 'es_atletico_rioja', name: 'Atlético Rioja', countryId: 'es', tier: 3, prestige: 31 },
  { id: 'es_recreativo_sur', name: 'Recreativo Sur', countryId: 'es', tier: 3, prestige: 26 },
  { id: 'es_ud_ribera', name: 'UD Ribera', countryId: 'es', tier: 4, prestige: 17 },
  { id: 'es_cf_montanas', name: 'CF Montañas', countryId: 'es', tier: 4, prestige: 13 },
  { id: 'es_cd_extremo', name: 'CD Extremo', countryId: 'es', tier: 4, prestige: 8 },

  // --- Allemagne (12) ---
  { id: 'de_berlin_kraft', name: 'Berlin Kraft', countryId: 'de', tier: 1, prestige: 89 },
  { id: 'de_rheinstahl', name: 'Rheinstahl SV', countryId: 'de', tier: 1, prestige: 75 },
  { id: 'de_hansa_hafen', name: 'Hansa Hafen', countryId: 'de', tier: 1, prestige: 62 },
  { id: 'de_werk_dortstadt', name: 'Werk Dortstadt', countryId: 'de', tier: 2, prestige: 57 },
  { id: 'de_sued_athletik', name: 'Süd Athletik', countryId: 'de', tier: 2, prestige: 49 },
  { id: 'de_rhein_ahorn', name: 'Rhein Ahorn SV', countryId: 'de', tier: 2, prestige: 43 },
  { id: 'de_westtal_fc', name: 'Westtal FC', countryId: 'de', tier: 3, prestige: 36 },
  { id: 'de_ostmark_united', name: 'Ostmark United', countryId: 'de', tier: 3, prestige: 30 },
  { id: 'de_nordlicht_sv', name: 'Nordlicht SV', countryId: 'de', tier: 3, prestige: 25 },
  { id: 'de_fc_baumtal', name: 'FC Baumtal', countryId: 'de', tier: 4, prestige: 15 },
  { id: 'de_talbach_sv', name: 'Talbach SV', countryId: 'de', tier: 4, prestige: 10 },
  { id: 'de_grenzland_fc', name: 'Grenzland FC', countryId: 'de', tier: 4, prestige: 7 },

  // --- Italie (12) ---
  { id: 'it_milano_azzurra', name: 'Milano Azzurra', countryId: 'it', tier: 1, prestige: 87 },
  { id: 'it_torino_granata', name: 'Torino Granata', countryId: 'it', tier: 1, prestige: 71 },
  { id: 'it_roma_capitale', name: 'Roma Capitale FC', countryId: 'it', tier: 1, prestige: 65 },
  { id: 'it_napoli_vulcano', name: 'Napoli Vulcano', countryId: 'it', tier: 2, prestige: 57 },
  { id: 'it_bologna_rossa', name: 'Bologna Rossa', countryId: 'it', tier: 2, prestige: 49 },
  { id: 'it_firenze_gigli', name: 'Firenze Gigli', countryId: 'it', tier: 2, prestige: 43 },
  { id: 'it_verona_scaligera', name: 'Verona Scaligera', countryId: 'it', tier: 3, prestige: 36 },
  { id: 'it_genova_marinara', name: 'Genova Marinara', countryId: 'it', tier: 3, prestige: 30 },
  { id: 'it_bari_levante', name: 'Bari Levante', countryId: 'it', tier: 3, prestige: 25 },
  { id: 'it_calabria_sud', name: 'Calabria Sud', countryId: 'it', tier: 4, prestige: 16 },
  { id: 'it_sardegna_costa', name: 'Sardegna Costa', countryId: 'it', tier: 4, prestige: 11 },
  { id: 'it_umbria_verde', name: 'Umbria Verde', countryId: 'it', tier: 4, prestige: 7 },

  // --- Portugal (12) ---
  { id: 'pt_lisboa_aurora', name: 'Lisboa Aurora', countryId: 'pt', tier: 1, prestige: 85 },
  { id: 'pt_porto_atlantico', name: 'Porto Atlântico', countryId: 'pt', tier: 1, prestige: 72 },
  { id: 'pt_sporting_dourado', name: 'Sporting Dourado', countryId: 'pt', tier: 1, prestige: 63 },
  { id: 'pt_braga_leoes', name: 'Braga Leões', countryId: 'pt', tier: 2, prestige: 56 },
  { id: 'pt_coimbra_academica', name: 'Coimbra Académica', countryId: 'pt', tier: 2, prestige: 48 },
  { id: 'pt_aveiro_ondas', name: 'Aveiro Ondas FC', countryId: 'pt', tier: 2, prestige: 42 },
  { id: 'pt_algarve_sol', name: 'Algarve Sol FC', countryId: 'pt', tier: 3, prestige: 34 },
  { id: 'pt_evora_alentejo', name: 'Évora Alentejo', countryId: 'pt', tier: 3, prestige: 28 },
  { id: 'pt_viseu_serra', name: 'Viseu Serra FC', countryId: 'pt', tier: 3, prestige: 23 },
  { id: 'pt_setubal_maritimo', name: 'Setúbal Marítimo', countryId: 'pt', tier: 4, prestige: 14 },
  { id: 'pt_faro_costeiro', name: 'Faro Costeiro', countryId: 'pt', tier: 4, prestige: 9 },
  { id: 'pt_guarda_norte', name: 'Guarda Norte FC', countryId: 'pt', tier: 4, prestige: 6 },

  // --- Pays-Bas (12) ---
  { id: 'nl_amsterdam_polder', name: 'Amsterdam Polder', countryId: 'nl', tier: 1, prestige: 86 },
  { id: 'nl_rotterdam_haven', name: 'Rotterdam Haven', countryId: 'nl', tier: 1, prestige: 73 },
  { id: 'nl_denhaag_residentie', name: 'Den Haag Residentie', countryId: 'nl', tier: 1, prestige: 64 },
  { id: 'nl_eindhoven_licht', name: 'Eindhoven Licht', countryId: 'nl', tier: 2, prestige: 55 },
  { id: 'nl_utrecht_domstad', name: 'Utrecht Domstad', countryId: 'nl', tier: 2, prestige: 47 },
  { id: 'nl_tilburg_brabants', name: 'Tilburg Brabants', countryId: 'nl', tier: 2, prestige: 41 },
  { id: 'nl_groningen_noord', name: 'Groningen Noord', countryId: 'nl', tier: 3, prestige: 33 },
  { id: 'nl_arnhem_veluwe', name: 'Arnhem Veluwe FC', countryId: 'nl', tier: 3, prestige: 27 },
  { id: 'nl_breda_baronie', name: 'Breda Baronie', countryId: 'nl', tier: 3, prestige: 22 },
  { id: 'nl_maastricht_zuid', name: 'Maastricht Zuid', countryId: 'nl', tier: 4, prestige: 14 },
  { id: 'nl_zwolle_ijssel', name: 'Zwolle IJssel FC', countryId: 'nl', tier: 4, prestige: 9 },
  { id: 'nl_leeuwarden_fries', name: 'Leeuwarden Fries', countryId: 'nl', tier: 4, prestige: 6 },

  // --- Belgique (12) ---
  { id: 'be_bruxelles_royale', name: 'Bruxelles Royale', countryId: 'be', tier: 1, prestige: 80 },
  { id: 'be_anvers_diamant', name: 'Anvers Diamant FC', countryId: 'be', tier: 1, prestige: 68 },
  { id: 'be_liege_principaute', name: 'Liège Principauté', countryId: 'be', tier: 1, prestige: 60 },
  { id: 'be_gand_arteveld', name: 'Gand Arteveld', countryId: 'be', tier: 2, prestige: 52 },
  { id: 'be_charleroi_carolo', name: 'Charleroi Carolo', countryId: 'be', tier: 2, prestige: 45 },
  { id: 'be_bruges_venise', name: 'Bruges Venise du Nord', countryId: 'be', tier: 2, prestige: 40 },
  { id: 'be_mons_borains', name: 'Mons Borains FC', countryId: 'be', tier: 3, prestige: 32 },
  { id: 'be_namur_citadelle', name: 'Namur Citadelle', countryId: 'be', tier: 3, prestige: 27 },
  { id: 'be_ostende_littoral', name: 'Ostende Littoral', countryId: 'be', tier: 3, prestige: 22 },
  { id: 'be_courtrai_kortrijk', name: 'Courtrai Kortrijk FC', countryId: 'be', tier: 4, prestige: 14 },
  { id: 'be_verviers_lainiere', name: 'Verviers Lainière', countryId: 'be', tier: 4, prestige: 9 },
  { id: 'be_tournai_hainaut', name: 'Tournai Hainaut FC', countryId: 'be', tier: 4, prestige: 6 },

  // --- Turquie (12) ---
  { id: 'tr_istanbul_bogazici', name: 'İstanbul Boğaziçi', countryId: 'tr', tier: 1, prestige: 88 },
  { id: 'tr_ankara_baskent', name: 'Ankara Başkent SK', countryId: 'tr', tier: 1, prestige: 74 },
  { id: 'tr_izmir_ege', name: 'İzmir Ege Yıldızı', countryId: 'tr', tier: 1, prestige: 64 },
  { id: 'tr_bursa_yesil', name: 'Bursa Yeşil Vadi', countryId: 'tr', tier: 2, prestige: 55 },
  { id: 'tr_antalya_akdeniz', name: 'Antalya Akdeniz SK', countryId: 'tr', tier: 2, prestige: 47 },
  { id: 'tr_konya_anadolu', name: 'Konya Anadolu FK', countryId: 'tr', tier: 2, prestige: 42 },
  { id: 'tr_trabzon_karadeniz', name: 'Trabzon Karadeniz', countryId: 'tr', tier: 3, prestige: 34 },
  { id: 'tr_adana_cukurova', name: 'Adana Çukurova SK', countryId: 'tr', tier: 3, prestige: 28 },
  { id: 'tr_kayseri_erciyes', name: 'Kayseri Erciyes FK', countryId: 'tr', tier: 3, prestige: 23 },
  { id: 'tr_gaziantep_fistik', name: 'Gaziantep Fıstık SK', countryId: 'tr', tier: 4, prestige: 15 },
  { id: 'tr_samsun_karadeniz2', name: 'Samsun Sahil FK', countryId: 'tr', tier: 4, prestige: 10 },
  { id: 'tr_eskisehir_porsuk', name: 'Eskişehir Porsuk SK', countryId: 'tr', tier: 4, prestige: 6 },

  // --- Brésil (12) ---
  { id: 'br_rio_maracana', name: 'Rio Maracanã EC', countryId: 'br', tier: 1, prestige: 91 },
  { id: 'br_saopaulo_bandeirante', name: 'São Paulo Bandeirante', countryId: 'br', tier: 1, prestige: 79 },
  { id: 'br_bahia_baiana', name: 'Bahia Baiana EC', countryId: 'br', tier: 1, prestige: 66 },
  { id: 'br_minas_gerais_ouro', name: 'Minas Gerais Ouro', countryId: 'br', tier: 2, prestige: 58 },
  { id: 'br_parana_pinheiro', name: 'Paraná Pinheiro EC', countryId: 'br', tier: 2, prestige: 50 },
  { id: 'br_pernambuco_recife', name: 'Pernambuco Recife FC', countryId: 'br', tier: 2, prestige: 44 },
  { id: 'br_ceara_fortaleza', name: 'Ceará Fortaleza EC', countryId: 'br', tier: 3, prestige: 36 },
  { id: 'br_goias_cerrado', name: 'Goiás Cerrado FC', countryId: 'br', tier: 3, prestige: 30 },
  { id: 'br_amazonas_selva', name: 'Amazonas Selva EC', countryId: 'br', tier: 3, prestige: 25 },
  { id: 'br_espirito_santo', name: 'Espírito Santo FC', countryId: 'br', tier: 4, prestige: 16 },
  { id: 'br_santa_catarina', name: 'Santa Catarina SC', countryId: 'br', tier: 4, prestige: 11 },
  { id: 'br_mato_grosso', name: 'Mato Grosso EC', countryId: 'br', tier: 4, prestige: 7 },

  // --- Argentine (12) ---
  { id: 'ar_buenosaires_puerto', name: 'Buenos Aires Puerto', countryId: 'ar', tier: 1, prestige: 89 },
  { id: 'ar_rosario_litoral', name: 'Rosario Litoral CA', countryId: 'ar', tier: 1, prestige: 75 },
  { id: 'ar_cordoba_sierras', name: 'Córdoba Sierras CA', countryId: 'ar', tier: 1, prestige: 63 },
  { id: 'ar_mendoza_andina', name: 'Mendoza Andina CA', countryId: 'ar', tier: 2, prestige: 55 },
  { id: 'ar_laplata_platense', name: 'La Plata Platense', countryId: 'ar', tier: 2, prestige: 47 },
  { id: 'ar_tucuman_jardin', name: 'Tucumán Jardín CA', countryId: 'ar', tier: 2, prestige: 41 },
  { id: 'ar_saltalapampa', name: 'Salta la Pampa CA', countryId: 'ar', tier: 3, prestige: 33 },
  { id: 'ar_marchiquita', name: 'Mar Chiquita FC', countryId: 'ar', tier: 3, prestige: 27 },
  { id: 'ar_patagonia_sur', name: 'Patagonia Sur CA', countryId: 'ar', tier: 3, prestige: 22 },
  { id: 'ar_neuquen_meseta', name: 'Neuquén Meseta CA', countryId: 'ar', tier: 4, prestige: 14 },
  { id: 'ar_sanjuan_cuyo', name: 'San Juan Cuyo FC', countryId: 'ar', tier: 4, prestige: 9 },
  { id: 'ar_misiones_selva', name: 'Misiones Selva CA', countryId: 'ar', tier: 4, prestige: 6 },

  // --- Colombie (12) ---
  { id: 'co_bogota_altiplano', name: 'Bogotá Altiplano FC', countryId: 'co', tier: 1, prestige: 78 },
  { id: 'co_medellin_paisa', name: 'Medellín Paisa CD', countryId: 'co', tier: 1, prestige: 67 },
  { id: 'co_cali_valle', name: 'Cali Valle FC', countryId: 'co', tier: 1, prestige: 58 },
  { id: 'co_barranquilla_caribe', name: 'Barranquilla Caribe', countryId: 'co', tier: 2, prestige: 49 },
  { id: 'co_cartagena_bahia', name: 'Cartagena Bahía FC', countryId: 'co', tier: 2, prestige: 42 },
  { id: 'co_bucaramanga_santander', name: 'Bucaramanga Santander', countryId: 'co', tier: 2, prestige: 37 },
  { id: 'co_pereira_cafetero', name: 'Pereira Cafetero FC', countryId: 'co', tier: 3, prestige: 28 },
  { id: 'co_manizales_nevado', name: 'Manizales Nevado CD', countryId: 'co', tier: 3, prestige: 23 },
  { id: 'co_ibague_tolima', name: 'Ibagué Tolima FC', countryId: 'co', tier: 3, prestige: 19 },
  { id: 'co_pasto_andino', name: 'Pasto Andino CD', countryId: 'co', tier: 4, prestige: 12 },
  { id: 'co_monteria_sabana', name: 'Montería Sabana FC', countryId: 'co', tier: 4, prestige: 8 },
  { id: 'co_neiva_huila', name: 'Neiva Huila CD', countryId: 'co', tier: 4, prestige: 6 },

  // --- Uruguay (12) ---
  { id: 'uy_montevideo_rambla', name: 'Montevideo Rambla CA', countryId: 'uy', tier: 1, prestige: 75 },
  { id: 'uy_salto_litoral', name: 'Salto Litoral FC', countryId: 'uy', tier: 1, prestige: 62 },
  { id: 'uy_maldonado_costa', name: 'Maldonado Costa CA', countryId: 'uy', tier: 1, prestige: 55 },
  { id: 'uy_paysandu_rio', name: 'Paysandú Río CA', countryId: 'uy', tier: 2, prestige: 46 },
  { id: 'uy_rivera_frontera', name: 'Rivera Frontera FC', countryId: 'uy', tier: 2, prestige: 39 },
  { id: 'uy_tacuarembo_centro', name: 'Tacuarembó Centro CA', countryId: 'uy', tier: 2, prestige: 34 },
  { id: 'uy_colonia_sacramento', name: 'Colonia Sacramento FC', countryId: 'uy', tier: 3, prestige: 26 },
  { id: 'uy_florida_llanura', name: 'Florida Llanura CA', countryId: 'uy', tier: 3, prestige: 21 },
  { id: 'uy_durazno_centro', name: 'Durazno Centro FC', countryId: 'uy', tier: 3, prestige: 17 },
  { id: 'uy_artigas_norte', name: 'Artigas Norte CA', countryId: 'uy', tier: 4, prestige: 11 },
  { id: 'uy_rocha_atlantico', name: 'Rocha Atlántico FC', countryId: 'uy', tier: 4, prestige: 7 },
  { id: 'uy_treinta_tresrios', name: 'Treinta y Tres Ríos CA', countryId: 'uy', tier: 4, prestige: 5 },

  // --- États-Unis (12) ---
  { id: 'us_newyork_harbor', name: 'New York Harbor FC', countryId: 'us', tier: 1, prestige: 76 },
  { id: 'us_losangeles_pacific', name: 'Los Angeles Pacific SC', countryId: 'us', tier: 1, prestige: 65 },
  { id: 'us_chicago_lakeside', name: 'Chicago Lakeside FC', countryId: 'us', tier: 1, prestige: 57 },
  { id: 'us_miami_shoreline', name: 'Miami Shoreline SC', countryId: 'us', tier: 2, prestige: 48 },
  { id: 'us_seattle_evergreen', name: 'Seattle Evergreen FC', countryId: 'us', tier: 2, prestige: 41 },
  { id: 'us_austin_hillcountry', name: 'Austin Hill Country SC', countryId: 'us', tier: 2, prestige: 36 },
  { id: 'us_denver_summit', name: 'Denver Summit FC', countryId: 'us', tier: 3, prestige: 27 },
  { id: 'us_portland_riverside', name: 'Portland Riverside SC', countryId: 'us', tier: 3, prestige: 22 },
  { id: 'us_nashville_ridge', name: 'Nashville Ridge FC', countryId: 'us', tier: 3, prestige: 18 },
  { id: 'us_columbus_heartland', name: 'Columbus Heartland SC', countryId: 'us', tier: 4, prestige: 11 },
  { id: 'us_phoenix_desert', name: 'Phoenix Desert FC', countryId: 'us', tier: 4, prestige: 7 },
  { id: 'us_stlouis_gateway', name: 'St. Louis Gateway SC', countryId: 'us', tier: 4, prestige: 5 },

  // --- Mexique (12) ---
  { id: 'mx_ciudaddemexico_altiplano', name: 'Ciudad de México Altiplano', countryId: 'mx', tier: 1, prestige: 82 },
  { id: 'mx_guadalajara_tapatio', name: 'Guadalajara Tapatío CF', countryId: 'mx', tier: 1, prestige: 70 },
  { id: 'mx_monterrey_regio', name: 'Monterrey Regio FC', countryId: 'mx', tier: 1, prestige: 61 },
  { id: 'mx_puebla_angeles', name: 'Puebla Ángeles CF', countryId: 'mx', tier: 2, prestige: 52 },
  { id: 'mx_veracruz_puerto', name: 'Veracruz Puerto FC', countryId: 'mx', tier: 2, prestige: 44 },
  { id: 'mx_tijuana_frontera', name: 'Tijuana Frontera CF', countryId: 'mx', tier: 2, prestige: 39 },
  { id: 'mx_merida_yucatan', name: 'Mérida Yucatán FC', countryId: 'mx', tier: 3, prestige: 30 },
  { id: 'mx_oaxaca_valle', name: 'Oaxaca Valle CF', countryId: 'mx', tier: 3, prestige: 24 },
  { id: 'mx_leon_bajio', name: 'León Bajío FC', countryId: 'mx', tier: 3, prestige: 20 },
  { id: 'mx_chihuahua_desierto', name: 'Chihuahua Desierto CF', countryId: 'mx', tier: 4, prestige: 12 },
  { id: 'mx_toluca_valle2', name: 'Toluca Valle Alto FC', countryId: 'mx', tier: 4, prestige: 8 },
  { id: 'mx_sonora_norte', name: 'Sonora Norte CF', countryId: 'mx', tier: 4, prestige: 5 },

  // --- Maroc (12) ---
  { id: 'ma_casablanca_atlantique', name: 'Casablanca Atlantique AC', countryId: 'ma', tier: 1, prestige: 72 },
  { id: 'ma_rabat_capitale', name: 'Rabat Capitale AC', countryId: 'ma', tier: 1, prestige: 60 },
  { id: 'ma_marrakech_ocre', name: 'Marrakech Ocre FC', countryId: 'ma', tier: 1, prestige: 53 },
  { id: 'ma_fes_medina', name: 'Fès Médina AC', countryId: 'ma', tier: 2, prestige: 44 },
  { id: 'ma_tanger_detroit', name: 'Tanger Détroit FC', countryId: 'ma', tier: 2, prestige: 38 },
  { id: 'ma_agadir_soleil', name: 'Agadir Soleil AC', countryId: 'ma', tier: 2, prestige: 33 },
  { id: 'ma_oujda_oriental', name: 'Oujda Oriental FC', countryId: 'ma', tier: 3, prestige: 25 },
  { id: 'ma_meknes_imperiale', name: 'Meknès Impériale AC', countryId: 'ma', tier: 3, prestige: 20 },
  { id: 'ma_elJadida_doukkala', name: 'El Jadida Doukkala FC', countryId: 'ma', tier: 3, prestige: 16 },
  { id: 'ma_nador_rif', name: 'Nador Rif AC', countryId: 'ma', tier: 4, prestige: 10 },
  { id: 'ma_beni_mellal', name: 'Béni Mellal FC', countryId: 'ma', tier: 4, prestige: 7 },
  { id: 'ma_ouarzazate_desert', name: 'Ouarzazate Désert AC', countryId: 'ma', tier: 4, prestige: 5 },

  // --- Sénégal (12) ---
  { id: 'sn_dakar_almadies', name: 'Dakar Almadies AS', countryId: 'sn', tier: 1, prestige: 70 },
  { id: 'sn_thies_rail', name: 'Thiès Rail AS', countryId: 'sn', tier: 1, prestige: 58 },
  { id: 'sn_saintlouis_fleuve', name: 'Saint-Louis Fleuve FC', countryId: 'sn', tier: 1, prestige: 51 },
  { id: 'sn_kaolack_bassin', name: 'Kaolack Bassin AS', countryId: 'sn', tier: 2, prestige: 42 },
  { id: 'sn_ziguinchor_casamance', name: 'Ziguinchor Casamance FC', countryId: 'sn', tier: 2, prestige: 36 },
  { id: 'sn_touba_baobab', name: 'Touba Baobab AS', countryId: 'sn', tier: 2, prestige: 31 },
  { id: 'sn_diourbel_centre', name: 'Diourbel Centre FC', countryId: 'sn', tier: 3, prestige: 23 },
  { id: 'sn_louga_savane', name: 'Louga Savane AS', countryId: 'sn', tier: 3, prestige: 18 },
  { id: 'sn_kolda_verdoyant', name: 'Kolda Verdoyant FC', countryId: 'sn', tier: 3, prestige: 15 },
  { id: 'sn_matam_vallee', name: 'Matam Vallée AS', countryId: 'sn', tier: 4, prestige: 9 },
  { id: 'sn_tambacounda_savane2', name: 'Tambacounda Savane FC', countryId: 'sn', tier: 4, prestige: 6 },
  { id: 'sn_fatick_delta', name: 'Fatick Delta AS', countryId: 'sn', tier: 4, prestige: 5 },

  // --- Japon (12) ---
  { id: 'jp_tokyo_sumida', name: 'Tokyo Sumida FC', countryId: 'jp', tier: 1, prestige: 80 },
  { id: 'jp_osaka_naniwa', name: 'Osaka Naniwa SC', countryId: 'jp', tier: 1, prestige: 68 },
  { id: 'jp_yokohama_minato', name: 'Yokohama Minato FC', countryId: 'jp', tier: 1, prestige: 60 },
  { id: 'jp_nagoya_chubu', name: 'Nagoya Chubu SC', countryId: 'jp', tier: 2, prestige: 51 },
  { id: 'jp_fukuoka_hakata', name: 'Fukuoka Hakata FC', countryId: 'jp', tier: 2, prestige: 44 },
  { id: 'jp_sapporo_yuki', name: 'Sapporo Yuki SC', countryId: 'jp', tier: 2, prestige: 39 },
  { id: 'jp_hiroshima_momiji', name: 'Hiroshima Momiji FC', countryId: 'jp', tier: 3, prestige: 30 },
  { id: 'jp_sendai_tohoku', name: 'Sendai Tohoku SC', countryId: 'jp', tier: 3, prestige: 24 },
  { id: 'jp_kobe_minatogawa', name: 'Kobe Minatogawa FC', countryId: 'jp', tier: 3, prestige: 20 },
  { id: 'jp_niigata_kome', name: 'Niigata Kome SC', countryId: 'jp', tier: 4, prestige: 12 },
  { id: 'jp_okayama_momotaro', name: 'Okayama Momotaro FC', countryId: 'jp', tier: 4, prestige: 8 },
  { id: 'jp_kumamoto_takamori', name: 'Kumamoto Takamori SC', countryId: 'jp', tier: 4, prestige: 5 },

  // --- Corée du Sud (12) ---
  { id: 'kr_seoul_hangang', name: 'Seoul Hangang FC', countryId: 'kr', tier: 1, prestige: 78 },
  { id: 'kr_busan_haeundae', name: 'Busan Haeundae SC', countryId: 'kr', tier: 1, prestige: 66 },
  { id: 'kr_incheon_hangman', name: 'Incheon Hangman FC', countryId: 'kr', tier: 1, prestige: 58 },
  { id: 'kr_daegu_palgong', name: 'Daegu Palgong SC', countryId: 'kr', tier: 2, prestige: 49 },
  { id: 'kr_gwangju_mudeung', name: 'Gwangju Mudeung FC', countryId: 'kr', tier: 2, prestige: 42 },
  { id: 'kr_daejeon_hanbat', name: 'Daejeon Hanbat SC', countryId: 'kr', tier: 2, prestige: 37 },
  { id: 'kr_ulsan_taehwa', name: 'Ulsan Taehwa FC', countryId: 'kr', tier: 3, prestige: 28 },
  { id: 'kr_suwon_hwaseong', name: 'Suwon Hwaseong SC', countryId: 'kr', tier: 3, prestige: 23 },
  { id: 'kr_jeonju_hanok', name: 'Jeonju Hanok FC', countryId: 'kr', tier: 3, prestige: 19 },
  { id: 'kr_changwon_jinhae', name: 'Changwon Jinhae SC', countryId: 'kr', tier: 4, prestige: 11 },
  { id: 'kr_jeju_halla', name: 'Jeju Halla FC', countryId: 'kr', tier: 4, prestige: 7 },
  { id: 'kr_pohang_yeongil', name: 'Pohang Yeongil SC', countryId: 'kr', tier: 4, prestige: 5 },
];

function findClubDivisionLabel(club) {
  const competition = COMPETITIONS[club.countryId];
  const division = competition.divisions.find(d => d.tier === club.tier);
  return division ? division.label : '';
}

function clampClubTierByPrestige(club) {
  const competition = COMPETITIONS[club.countryId];
  const matchingDivision = competition.divisions.find(
    d => club.prestige >= d.prestigeRange[0] && club.prestige <= d.prestigeRange[1]
  );
  return matchingDivision ? matchingDivision.tier : club.tier;
}
