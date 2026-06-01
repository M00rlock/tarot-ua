const PREFIX = 'tarot-fast:';

export function saveSession(key, data) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {}
}

export function loadSession(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeSession(key) {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {}
}

export function clearSession() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export function saveSpreadSession(data) {
  saveSession('spread', data);
}

export function loadSpreadSession() {
  return loadSession('spread');
}

export function saveInterpretationSession(data) {
  saveSession('interpretation', data);
}

export function loadInterpretationSession() {
  return loadSession('interpretation');
}

export function saveNickname(name) {
  saveSession('nickname', name);
}

export function loadNickname() {
  return loadSession('nickname');
}
