const baseHeaders = {
    'Content-Type': 'application/json'
};
export async function fetchCards(count = 78) {
    const response = await fetch(`/api/tarot/cards?count=${count}`, { headers: baseHeaders });
    if (!response.ok) {
        throw new Error('Не вдалося завантажити карти');
    }
    return (await response.json());
}
export async function fetchSpreadDefinitions() {
    const response = await fetch('/api/tarot/spreads', { headers: baseHeaders });
    if (!response.ok) {
        throw new Error('Не вдалося завантажити типи розкладів');
    }
    return (await response.json());
}
export async function drawSpread(count = 3, type) {
    const params = new URLSearchParams({ count: String(count) });
    if (type) {
        params.set('type', type);
    }
    const response = await fetch(`/api/tarot/draw?${params.toString()}`, { headers: baseHeaders });
    if (!response.ok) {
        throw new Error('Не вдалося зробити розклад');
    }
    return (await response.json());
}
export async function fetchCardOfDay(date) {
    const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await fetch(`/api/tarot/card-of-day${suffix}`, { headers: baseHeaders });
    if (!response.ok) {
        throw new Error('Не вдалося отримати карту дня');
    }
    return (await response.json());
}
