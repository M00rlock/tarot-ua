import { Injectable, OnModuleInit } from '@nestjs/common';
import { TarotGraphService } from './tarot.graph.service';
import { DrawnCard, TarotCard } from './tarot.types';

@Injectable()
export class TarotService implements OnModuleInit {
  constructor(private readonly graphService: TarotGraphService) {}

  async onModuleInit(): Promise<void> {
    await this.graphService.seedIfNeeded();
  }

  async getAllCards(): Promise<TarotCard[]> {
    return this.graphService.getCards();
  }

  async drawSpread(count = 3): Promise<DrawnCard[]> {
    const cards = await this.getAllCards();
    const positions = ['Минуле', 'Теперішнє', 'Майбутнє', 'Виклик', 'Порада'];
    const safeCount = Math.max(1, Math.min(count, Math.min(cards.length, positions.length)));

    const pool = [...cards];
    const spread: DrawnCard[] = [];

    for (let i = 0; i < safeCount; i += 1) {
      const index = Math.floor(Math.random() * pool.length);
      const [card] = pool.splice(index, 1);

      spread.push({
        card,
        position: positions[i],
        reversed: Math.random() > 0.5
      });
    }

    return spread;
  }

  async getCardOfDay(date = new Date()): Promise<DrawnCard> {
    const cards = await this.getAllCards();
    const dayKey = this.toDayKey(date);
    const hash = this.hash(dayKey);

    return {
      card: cards[hash % cards.length],
      position: 'Карта дня',
      reversed: ((hash >> 1) & 1) === 1
    };
  }

  private toDayKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private hash(value: string): number {
    let hash = 0;

    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }

    return hash;
  }
}
