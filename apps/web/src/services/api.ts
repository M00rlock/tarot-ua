import type { DrawnCard, TarotCard } from '../types';

const baseHeaders = {
  'Content-Type': 'application/json'
};

export async function fetchCards(): Promise<TarotCard[]> {
  const response = await fetch('/api/tarot/cards', { headers: baseHeaders });
  if (!response.ok) {
    throw new Error('Не вдалося завантажити карти');
  }

  return (await response.json()) as TarotCard[];
}

export async function drawSpread(count = 3): Promise<DrawnCard[]> {
  const response = await fetch(`/api/tarot/draw?count=${count}`, { headers: baseHeaders });
  if (!response.ok) {
    throw new Error('Не вдалося зробити розклад');
  }

  return (await response.json()) as DrawnCard[];
}

export async function fetchCardOfDay(date?: string): Promise<DrawnCard> {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await fetch(`/api/tarot/card-of-day${suffix}`, { headers: baseHeaders });

  if (!response.ok) {
    throw new Error('Не вдалося отримати карту дня');
  }

  return (await response.json()) as DrawnCard;
}
