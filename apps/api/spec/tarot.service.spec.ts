import { TAROT_SEED } from '../src/tarot/tarot.seed';
import { TarotGraphService } from '../src/tarot/tarot.graph.service';
import { TarotService } from '../src/tarot/tarot.service';

describe('TarotService', () => {
  let service: TarotService;

  beforeEach(() => {
    const graphStub: Partial<TarotGraphService> = {
      getCards: async () => TAROT_SEED,
      seedIfNeeded: async () => undefined
    };

    service = new TarotService(graphStub as TarotGraphService);
  });

  it('returns requested spread size with unique cards', async () => {
    const spread = await service.drawSpread(3);

    expect(spread.length).toBe(3);

    const ids = spread.map((item) => item.card.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('caps spread size to allowed number of positions', async () => {
    const spread = await service.drawSpread(99);
    expect(spread.length).toBe(5);
  });

  it('returns deterministic card of day for the same date', async () => {
    const date = new Date('2026-03-22T00:00:00.000Z');
    const first = await service.getCardOfDay(date);
    const second = await service.getCardOfDay(date);

    expect(first.card.id).toBe(second.card.id);
    expect(first.reversed).toBe(second.reversed);
    expect(first.position).toBe('Карта дня');
  });
});
