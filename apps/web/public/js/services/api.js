const baseHeaders = { 'Content-Type': 'application/json' };

async function parseJson(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function createShareableSpread(input) {
  return parseJson(await fetch('/api/share/spreads', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(input)
  }), 'Не вдалося створити публічне посилання');
}

export async function fetchSharedSpread(slug) {
  return parseJson(await fetch(`/api/share/spreads/${encodeURIComponent(slug)}`, {
    headers: baseHeaders
  }), 'Публічний розклад не знайдено');
}

export async function fetchCards(count = 78) {
  return parseJson(await fetch(`/api/tarot/cards?count=${count}`, { headers: baseHeaders }), 'Не вдалося завантажити карти');
}

export async function fetchSpreadDefinitions() {
  return parseJson(await fetch('/api/tarot/spreads', { headers: baseHeaders }), 'Не вдалося завантажити типи розкладів');
}

export async function drawSpread(count = 3, type) {
  const params = new URLSearchParams({ count: String(count) });
  if (type) params.set('type', type);
  return parseJson(await fetch(`/api/tarot/draw?${params.toString()}`, { headers: baseHeaders }), 'Не вдалося зробити розклад');
}

export async function fetchCardOfDay(date) {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
  return parseJson(await fetch(`/api/tarot/card-of-day${suffix}`, { headers: baseHeaders }), 'Не вдалося отримати карту дня');
}

export async function fetchSpreadInterpretation(spread, type, tone = 'psychological') {
  return parseJson(await fetch('/api/tarot/interpretation', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ spread, type, tone })
  }), 'Не вдалося згенерувати ШІ-тлумачення');
}
