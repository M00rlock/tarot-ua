import { cardMeaning } from '../src/utils';
import type { DrawnCard } from '../src/types';

describe('cardMeaning', () => {
  const card: DrawnCard = {
    position: 'Present',
    reversed: false,
    card: {
      id: 'the-star',
      name: 'The Star',
      arcana: 'major',
      keywords: ['hope'],
      meaningUpright: 'Optimism and healing.',
      meaningReversed: 'Doubt and burnout.',
      image: '/cards/the-star.svg'
    }
  };

  it('returns upright meaning when card is not reversed', () => {
    expect(cardMeaning(card)).toBe('Optimism and healing.');
  });

  it('returns reversed meaning when card is reversed', () => {
    expect(cardMeaning({ ...card, reversed: true })).toBe('Doubt and burnout.');
  });
});
