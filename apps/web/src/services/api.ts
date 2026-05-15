import type { AuthSession, AuthUser, CloudSpread, DrawnCard, InterpretationTone, SpreadDefinition, SpreadInterpretation, SpreadType, TarotCard } from '../types';

const tokenKey = 'tarot-access-token';

export function getAccessToken() {
  return localStorage.getItem(tokenKey) || '';
}

export function setAccessToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearAccessToken() {
  localStorage.removeItem(tokenKey);
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const baseHeaders: Record<string, string> = {
  'Content-Type': 'application/json'
};

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {}
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function registerUser(input: { email: string; password: string; name: string }): Promise<AuthSession> {
  const session = await parseJson<AuthSession>(await fetch('/api/auth/register', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(input)
  }), 'Не вдалося створити акаунт');
  setAccessToken(session.accessToken);
  return session;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthSession> {
  const session = await parseJson<AuthSession>(await fetch('/api/auth/login', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(input)
  }), 'Не вдалося увійти');
  setAccessToken(session.accessToken);
  return session;
}

export async function fetchProfile(): Promise<AuthUser> {
  return parseJson<AuthUser>(await fetch('/api/auth/me', {
    headers: { ...baseHeaders, ...authHeaders() }
  }), 'Не вдалося завантажити профіль');
}

export async function fetchCloudSpreads(favorite?: boolean): Promise<CloudSpread[]> {
  const suffix = favorite === undefined ? '' : `?favorite=${favorite}`;
  return parseJson<CloudSpread[]>(await fetch(`/api/me/spreads${suffix}`, {
    headers: { ...baseHeaders, ...authHeaders() }
  }), 'Не вдалося завантажити історію');
}

export async function saveCloudSpread(input: { title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation?: SpreadInterpretation | null; favorite?: boolean }): Promise<CloudSpread> {
  return parseJson<CloudSpread>(await fetch('/api/me/spreads', {
    method: 'POST',
    headers: { ...baseHeaders, ...authHeaders() },
    body: JSON.stringify(input)
  }), 'Не вдалося зберегти розклад');
}

export async function markCloudFavorite(id: string, favorite: boolean): Promise<CloudSpread> {
  return parseJson<CloudSpread>(await fetch(`/api/me/spreads/${id}/favorite`, {
    method: 'PATCH',
    headers: { ...baseHeaders, ...authHeaders() },
    body: JSON.stringify({ favorite })
  }), 'Не вдалося оновити обране');
}

export async function fetchCards(count = 78): Promise<TarotCard[]> {
  return parseJson<TarotCard[]>(await fetch(`/api/tarot/cards?count=${count}`, { headers: baseHeaders }), 'Не вдалося завантажити карти');
}

export async function fetchSpreadDefinitions(): Promise<SpreadDefinition[]> {
  return parseJson<SpreadDefinition[]>(await fetch('/api/tarot/spreads', { headers: baseHeaders }), 'Не вдалося завантажити типи розкладів');
}

export async function drawSpread(count = 3, type?: SpreadType): Promise<DrawnCard[]> {
  const params = new URLSearchParams({ count: String(count) });
  if (type) params.set('type', type);
  return parseJson<DrawnCard[]>(await fetch(`/api/tarot/draw?${params.toString()}`, { headers: baseHeaders }), 'Не вдалося зробити розклад');
}

export async function fetchCardOfDay(date?: string): Promise<DrawnCard> {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
  return parseJson<DrawnCard>(await fetch(`/api/tarot/card-of-day${suffix}`, { headers: baseHeaders }), 'Не вдалося отримати карту дня');
}

export async function fetchSpreadInterpretation(spread: DrawnCard[], type: SpreadType, tone: InterpretationTone = 'psychological'): Promise<SpreadInterpretation> {
  return parseJson<SpreadInterpretation>(await fetch('/api/tarot/interpretation', {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ spread, type, tone })
  }), 'Не вдалося згенерувати AI-тлумачення');
}
