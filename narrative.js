// === NARRATIVE ===
// Rendu du journal narratif : les entrées de storyLog sont des ids, le texte est
// généré au moment de l'affichage via templates, avec fallback générique obligatoire.

function fillTemplate(template, ctx) {
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const parts = path.split('.');
    let value = ctx;
    for (const p of parts) {
      if (value == null) return match;
      value = value[p];
    }
    return value != null ? value : match;
  });
}

function getEventDef(eventId, eventPool) {
  return eventPool.find(e => e.id === eventId) || FALLBACK_EVENT;
}

function buildTemplateContext(entry, state, eventDef) {
  const ctx = { season: entry.season, eventTitle: eventDef.text.title };
  for (const [key, charId] of Object.entries(entry.actorsResolved || {})) {
    const character = state.characters[charId];
    ctx[key] = character ? { name: character.name } : { name: 'quelqu\'un' };
  }
  return ctx;
}

function getSummaryTemplate(entry) {
  if (entry.outcome) {
    const outcomeKey = `${entry.eventId}.${entry.choiceId}.${entry.outcome}`;
    if (SUMMARY_TEMPLATES[outcomeKey]) return SUMMARY_TEMPLATES[outcomeKey];
  }
  const key = `${entry.eventId}.${entry.choiceId}`;
  if (SUMMARY_TEMPLATES[key]) return SUMMARY_TEMPLATES[key];
  const hasPrimaryActor = entry.actorsResolved && entry.actorsResolved.primary != null;
  return hasPrimaryActor ? SUMMARY_TEMPLATES['__fallback__'] : SUMMARY_TEMPLATES['__fallback_no_actor__'];
}

function renderStoryLog(state, eventPool, filterCharacterId) {
  let entries = [...state.storyLog].sort((a, b) => a.season - b.season);
  if (filterCharacterId) {
    entries = entries.filter(e => Object.values(e.actorsResolved || {}).includes(filterCharacterId));
  }
  return entries.map(entry => {
    const eventDef = getEventDef(entry.eventId, eventPool);
    const template = getSummaryTemplate(entry);
    const ctx = buildTemplateContext(entry, state, eventDef);
    return { season: entry.season, text: fillTemplate(template, ctx) };
  });
}
