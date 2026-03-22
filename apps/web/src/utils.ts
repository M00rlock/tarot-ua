import type { DrawnCard } from './types';

export function cardMeaning(card: DrawnCard): string {
  return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}
