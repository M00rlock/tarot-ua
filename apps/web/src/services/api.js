const tokenKey = 'tarot-access-token';
export function getAccessToken() {
    return localStorage.getItem(tokenKey) || '';
}
export function setAccessToken(token) {
    localStorage.setItem(tokenKey, token);
}
export function clearAccessToken() {
    localStorage.removeItem(tokenKey);
}
function authHeaders() {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
const baseHeaders = {
    'Content-Type': 'application/json'
};
async function parseJson(response, fallbackMessage) {
    if (!response.ok) {
        let message = fallbackMessage;
        try {
            const error = await response.json();
            message = error.message || message;
        }
        catch { }
        throw new Error(message);
    }
    return (await response.json());
}
export async function registerUser(input) {
    const session = await parseJson(await fetch('/api/auth/register', {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify(input)
    }), 'Не вдалося створити акаунт');
    setAccessToken(session.accessToken);
    return session;
}
export async function loginUser(input) {
    const session = await parseJson(await fetch('/api/auth/login', {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify(input)
    }), 'Не вдалося увійти');
    setAccessToken(session.accessToken);
    return session;
}
export async function fetchProfile() {
    return parseJson(await fetch('/api/auth/me', {
        headers: { ...baseHeaders, ...authHeaders() }
    }), 'Не вдалося завантажити профіль');
}
export async function fetchCloudSpreads(favorite) {
    const suffix = favorite === undefined ? '' : `?favorite=${favorite}`;
    return parseJson(await fetch(`/api/me/spreads${suffix}`, {
        headers: { ...baseHeaders, ...authHeaders() }
    }), 'Не вдалося завантажити історію');
}
export async function saveCloudSpread(input) {
    return parseJson(await fetch('/api/me/spreads', {
        method: 'POST',
        headers: { ...baseHeaders, ...authHeaders() },
        body: JSON.stringify(input)
    }), 'Не вдалося зберегти розклад');
}
export async function markCloudFavorite(id, favorite) {
    return parseJson(await fetch(`/api/me/spreads/${id}/favorite`, {
        method: 'PATCH',
        headers: { ...baseHeaders, ...authHeaders() },
        body: JSON.stringify({ favorite })
    }), 'Не вдалося оновити обране');
}
export async function fetchCards(count = 78) {
    return parseJson(await fetch(`/api/tarot/cards?count=${count}`, { headers: baseHeaders }), 'Не вдалося завантажити карти');
}
export async function fetchSpreadDefinitions() {
    return parseJson(await fetch('/api/tarot/spreads', { headers: baseHeaders }), 'Не вдалося завантажити типи розкладів');
}
export async function drawSpread(count = 3, type) {
    const params = new URLSearchParams({ count: String(count) });
    if (type)
        params.set('type', type);
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
    }), 'Не вдалося згенерувати AI-тлумачення');
}
