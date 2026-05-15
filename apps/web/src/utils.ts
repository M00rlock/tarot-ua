import type { DrawnCard } from './types';

export function cardMeaning(card: DrawnCard): string {
  return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}


export function pluralizeCards(count: number): string {
  if (count === 1) return 'карта';
  if (count >= 2 && count <= 4) return 'карти';
  return 'карт';
}

export function formatCardsCount(count: number): string {
  return `${count} ${pluralizeCards(count)}`;
}
