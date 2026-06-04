const STORAGE_KEY = 'tarot-journal';
const MAX_ENTRIES = 50;

export function loadJournal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJournal(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function addEntry(entry) {
  const entries = loadJournal();
  const newEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: entry.title,
    spreadType: entry.spreadType,
    cards: entry.cards,
    interpretation: entry.interpretation || null,
    favorite: entry.favorite || false,
    note: entry.note || '',
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  saveJournal(entries.slice(0, MAX_ENTRIES));
  return newEntry;
}

export function updateEntry(id, updates) {
  const entries = loadJournal();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], ...updates };
  saveJournal(entries);
  return entries[index];
}

export function removeEntry(id) {
  const entries = loadJournal().filter((e) => e.id !== id);
  saveJournal(entries);
}

export function loadFavorites() {
  return loadJournal().filter((e) => e.favorite);
}
