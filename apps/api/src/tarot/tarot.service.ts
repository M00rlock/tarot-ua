import { Injectable, OnModuleInit } from '@nestjs/common';
import { TarotGraphService } from './tarot.graph.service';
import { DrawnCard, SpreadDefinition, SpreadType, TarotCard } from './tarot.types';

@Injectable()
export class TarotService implements OnModuleInit {
  constructor(private readonly graphService: TarotGraphService) {}

  async onModuleInit(): Promise<void> {
    await this.graphService.seedIfNeeded();
  }

  async getAllCards(limit: number = 78): Promise<TarotCard[]> {
    return this.graphService.getCards(limit);
  }

  getSpreadDefinitions(): SpreadDefinition[] {
    return SPREAD_DEFINITIONS;
  }

  async drawSpread(count = 3, spreadType?: SpreadType): Promise<DrawnCard[]> {
    const definition = this.resolveSpread(count, spreadType);
    const cards = await this.getAllCards(78);
    const safeCount = Math.max(1, Math.min(definition.count, Math.min(cards.length, definition.positions.length)));

    const pool = [...cards];
    const spread: DrawnCard[] = [];

    for (let i = 0; i < safeCount; i += 1) {
      const index = Math.floor(Math.random() * pool.length);
      const [card] = pool.splice(index, 1);
      const position = definition.positions[i];

      spread.push({
        card,
        position: position.name,
        positionDescription: position.description,
        reversed: Math.random() > 0.5
      });
    }

    return spread;
  }

  async getCardOfDay(date = new Date()): Promise<DrawnCard> {
    const cards = await this.getAllCards(1);
    const dayKey = this.toDayKey(date);
    const hash = this.hash(dayKey);

    return {
      card: cards[hash % cards.length],
      position: 'Карта дня',
      positionDescription: 'Головна тема дня, на яку варто звернути увагу.',
      reversed: ((hash >> 1) & 1) === 1
    };
  }

  private resolveSpread(count: number, spreadType?: SpreadType): SpreadDefinition {
    const byType = spreadType ? SPREAD_DEFINITIONS.find((spread) => spread.id === spreadType) : undefined;

    if (byType) {
      return byType;
    }

    const exact = SPREAD_DEFINITIONS.find((spread) => spread.count === count);
    if (exact) {
      return exact;
    }

    return count >= 5
      ? SPREAD_DEFINITIONS.find((spread) => spread.id === 'pentagram5') ?? SPREAD_DEFINITIONS[0]
      : SPREAD_DEFINITIONS[0];
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


const SPREAD_DEFINITIONS: SpreadDefinition[] = [
  {
    id: 'classic3',
    title: 'Минуле · Теперішнє · Майбутнє',
    count: 3,
    positions: [
      { name: 'Минуле', description: 'Що вже вплинуло на ситуацію або створило поточний фон.' },
      { name: 'Теперішнє', description: 'Що відбувається зараз і потребує найбільшої уваги.' },
      { name: 'Майбутнє', description: 'Найімовірніший напрям розвитку, якщо нічого не змінювати.' }
    ]
  },
  {
    id: 'pentagram5',
    title: 'Пентаграма балансу',
    count: 5,
    positions: [
      { name: 'Дух', description: 'Головний сенс ситуації та внутрішній вектор.' },
      { name: 'Вогонь / дія', description: 'Що варто зробити активно й сміливо.' },
      { name: 'Земля / результат', description: 'Практичний результат або матеріальний прояв.' },
      { name: 'Вода / емоції', description: 'Почуття, інтуїція та приховані переживання.' },
      { name: 'Повітря / думки', description: 'Ідеї, логіка, комунікація й ментальні блоки.' }
    ]
  },
  {
    id: 'love5',
    title: 'Кохання та стосунки',
    count: 5,
    positions: [
      { name: 'Я', description: 'Твоя позиція, потреби й внутрішній стан у стосунках.' },
      { name: 'Партнер / Інша сторона', description: 'Стан і мотиви другої людини або потенційного партнера.' },
      { name: 'Зв’язок', description: 'Що реально тримає вас разом або створює тяжіння.' },
      { name: 'Перешкода', description: 'Що заважає близькості, довірі або ясності.' },
      { name: 'Порада', description: 'Найкращий наступний крок для серця й здорових меж.' }
    ]
  },
  {
    id: 'career5',
    title: 'Кар’єра та гроші',
    count: 5,
    positions: [
      { name: 'Поточна роль', description: 'Де ти зараз у професійному або фінансовому питанні.' },
      { name: 'Сильна сторона', description: 'На що варто спертися, щоб рухатися швидше.' },
      { name: 'Ризик', description: 'Що може забирати ресурс або створити помилку.' },
      { name: 'Можливість', description: 'Де є потенціал росту, грошей або нового напрямку.' },
      { name: 'Наступний крок', description: 'Конкретний фокус для дії найближчим часом.' }
    ]
  }
];
