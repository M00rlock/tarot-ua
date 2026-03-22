import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { TAROT_SEED } from './tarot.seed';
import { TarotCard } from './tarot.types';

const { driver } = require('gremlin');

@Injectable()
export class TarotGraphService implements OnModuleDestroy {
  private readonly logger = new Logger(TarotGraphService.name);
  private readonly client: any;

  constructor() {
    const endpoint = process.env.JANUSGRAPH_ENDPOINT ?? 'ws://localhost:8182/gremlin';
    this.client = new driver.Client(endpoint, {
      traversalSource: 'g',
      mimeType: 'application/vnd.gremlin-v3.0+json'
    });
  }

  async getCards(): Promise<TarotCard[]> {
    try {
      const result = await this.client.submit(
        'g.V().hasLabel("card").project("id","name","arcana","keywords","meaningUpright","meaningReversed","image").by(id()).by(values("name")).by(values("arcana")).by(values("keywords")).by(values("meaningUpright")).by(values("meaningReversed")).by(values("image"))'
      );
      const rows = result.toArray() as Array<Map<string, unknown>>;

      if (rows.length === 0) {
        return TAROT_SEED;
      }

      return rows.map((row, index) => {
        const getFirst = <T>(key: string): T | undefined => {
          const value = row.get(key);
          if (Array.isArray(value)) {
            return value[0] as T;
          }
          return value as T | undefined;
        };

        const seedFallbackId = TAROT_SEED[index % TAROT_SEED.length].id;
        const cardId = String(getFirst('id') ?? seedFallbackId);
        const image = String(getFirst('image') ?? `/cards/${seedFallbackId}.svg`);

        return {
          id: cardId,
          name: String(getFirst('name') ?? 'Невідома карта'),
          arcana: (getFirst('arcana') as TarotCard['arcana']) ?? 'major',
          keywords: this.normalizeKeywords(row.get('keywords')),
          meaningUpright: String(getFirst('meaningUpright') ?? ''),
          meaningReversed: String(getFirst('meaningReversed') ?? ''),
          image
        };
      });
    } catch (error) {
      this.logger.warn('JanusGraph недоступний, використовую локальні seed-дані.');
      this.logger.debug(String(error));
      return TAROT_SEED;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async seedIfNeeded(): Promise<void> {
    try {
      const check = await this.client.submit('g.V().hasLabel("card").count()');
      const count = Number(check.first());

      if (count > 0) {
        return;
      }

      for (const card of TAROT_SEED) {
        await this.client.submit(
          'g.addV("card").property("name", name).property("arcana", arcana).property("keywords", keywords).property("meaningUpright", upright).property("meaningReversed", reversed).property("image", image)',
          {
            name: card.name,
            arcana: card.arcana,
            keywords: card.keywords.join(', '),
            upright: card.meaningUpright,
            reversed: card.meaningReversed,
            image: card.image
          }
        );
      }
    } catch {
      // Локальна розробка може працювати без JanusGraph.
    }
  }

  private normalizeKeywords(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }
}
