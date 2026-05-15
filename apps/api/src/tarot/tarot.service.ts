import { Injectable, OnModuleInit } from '@nestjs/common';
import { TarotGraphService } from './tarot.graph.service';
import { DrawnCard, InterpretationTone, SpreadDefinition, SpreadInterpretation, SpreadType, TarotCard } from './tarot.types';

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


  generateInterpretation(spread: DrawnCard[], spreadType: SpreadType = 'classic3', tone: InterpretationTone = 'psychological'): SpreadInterpretation {
    if (!spread.length) {
      return {
        title: 'AI-тлумачення',
        tone,
        summary: 'Спершу зробіть розклад, щоб отримати цілісне тлумачення.',
        energy: 'Енергія ще не визначена.',
        interactions: [],
        advice: [],
        shadow: 'Тіньова зона з’явиться після вибору карт.',
        nextStep: 'Оберіть розклад і відкрийте карти.'
      };
    }

    const definition = this.resolveSpread(spread.length, spreadType);
    const normalizedTone = ['psychological', 'mystic', 'practical'].includes(tone) ? tone : 'psychological';
    const uprightCount = spread.filter((item) => !item.reversed).length;
    const reversedCount = spread.length - uprightCount;
    const majorCount = spread.filter((item) => item.card.arcana === 'major').length;
    const suits = spread.reduce<Record<string, number>>((acc, item) => {
      const key = item.card.suit ?? 'Старші аркани';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const dominantSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'змішана енергія';
    const focus = spread[0];
    const adviceCard = spread[spread.length - 1];

    return {
      title: `AI-тлумачення · ${definition.title}`,
      tone: normalizedTone,
      summary: this.buildSummary(spread, definition.title, normalizedTone, majorCount, reversedCount, dominantSuit),
      energy: this.buildEnergyLine(majorCount, reversedCount, uprightCount, dominantSuit),
      interactions: this.buildInteractions(spread, normalizedTone),
      advice: this.buildAdvice(spread, normalizedTone),
      shadow: this.buildShadow(spread, normalizedTone),
      nextStep: this.buildNextStep(focus, adviceCard, normalizedTone)
    };
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


  private buildSummary(
    spread: DrawnCard[],
    title: string,
    tone: InterpretationTone,
    majorCount: number,
    reversedCount: number,
    dominantSuit: string
  ): string {
    const first = spread[0];
    const last = spread[spread.length - 1];
    const firstMeaning = this.meaning(first);
    const lastMeaning = this.meaning(last);
    const arcanaPhrase = majorCount >= Math.ceil(spread.length / 2)
      ? 'Розклад має сильний архетипний заряд: тут ідеться не лише про події, а про зміну внутрішньої ролі.'
      : 'Розклад більше говорить про практичні кроки, звички й рішення, ніж про різкий зовнішній поворот.';
    const reversedPhrase = reversedCount > 0
      ? ` ${reversedCount} перевернут${reversedCount === 1 ? 'а карта показує' : 'і карти показують'}, де енергія зараз заблокована або потребує чеснішого погляду.`
      : ' Усі карти відкриті прямо, тому енергія читається як доволі ясна й доступна для дії.';

    if (tone === 'mystic') {
      return `${title} відкривається через карту «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Фінальний акцент — «${last.card.name}», і він веде до теми: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Домінує енергія «${dominantSuit}», тож саме вона задає атмосферу розкладу.`;
    }

    if (tone === 'practical') {
      return `Головна тема розкладу — «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Результуючий вектор показує «${last.card.name}»: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Практичний фокус зараз — сфера «${dominantSuit}».`;
    }

    return `Цей розклад показує внутрішній процес, який починається з «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Далі він поступово приводить до «${last.card.name}»: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Найбільше психологічне навантаження зараз несе тема «${dominantSuit}».`;
  }

  private buildEnergyLine(majorCount: number, reversedCount: number, uprightCount: number, dominantSuit: string): string {
    const balance = reversedCount > uprightCount
      ? 'енергія більше внутрішня: спершу варто розібратися з опором, сумнівами або невисловленими почуттями'
      : 'енергія більше зовнішня: уже є простір для рішень, руху й конкретної дії';
    const intensity = majorCount >= 2
      ? 'висока інтенсивність, бо старші аркани підсилюють значення всього розкладу'
      : 'м’яка інтенсивність, де результат більше залежить від щоденних виборів';

    return `Загальний тон: ${balance}. Інтенсивність: ${intensity}. Домінантна сфера: ${dominantSuit}.`;
  }

  private buildInteractions(spread: DrawnCard[], tone: InterpretationTone): string[] {
    if (spread.length < 2) return [];

    const pairs: string[] = [];
    for (let i = 0; i < spread.length - 1; i += 1) {
      const left = spread[i];
      const right = spread[i + 1];
      const connector = this.connectionPhrase(left, right, tone);
      pairs.push(`${left.position} → ${right.position}: «${left.card.name}» поруч із «${right.card.name}» ${connector}`);
    }

    if (spread.length >= 5) {
      const center = spread[0];
      const bottom = spread[2];
      pairs.push(`Вісь розкладу: «${center.card.name}» задає сенс, а «${bottom.card.name}» показує, як цей сенс може проявитися в реальності.`);
    }

    return pairs;
  }

  private connectionPhrase(left: DrawnCard, right: DrawnCard, tone: InterpretationTone): string {
    const leftKeywords = left.card.keywords.slice(0, 2).join(' і ');
    const rightKeywords = right.card.keywords.slice(0, 2).join(' і ');
    const tension = left.reversed || right.reversed
      ? 'створює напругу між заблокованою енергією та наступним кроком.'
      : 'підсилює плавний перехід від одного стану до іншого.';

    if (tone === 'mystic') {
      return `наче поєднує ${leftKeywords} з ${rightKeywords}: це ${tension}`;
    }

    if (tone === 'practical') {
      return `підказує практичний міст між темами «${leftKeywords}» та «${rightKeywords}»: це ${tension}`;
    }

    return `показує психологічний зв’язок між «${leftKeywords}» та «${rightKeywords}»: це ${tension}`;
  }

  private buildAdvice(spread: DrawnCard[], tone: InterpretationTone): string[] {
    const cardsToUse = spread.slice(-2);
    const advice = cardsToUse.map((item) => {
      const direction = item.reversed
        ? 'не тиснути силою, а спершу повернути собі ясність у цій темі'
        : 'використати цю енергію як опору для наступного кроку';

      if (tone === 'mystic') {
        return `Через позицію «${item.position}» карта «${item.card.name}» радить прислухатися до знаку: ${this.meaning(item)} Тобто — ${direction}.`;
      }

      if (tone === 'practical') {
        return `У позиції «${item.position}» карта «${item.card.name}» дає дію: ${direction}. Орієнтир: ${this.meaning(item)}`;
      }

      return `У позиції «${item.position}» карта «${item.card.name}» радить помітити свій внутрішній патерн: ${this.meaning(item)} Найздоровіший рух — ${direction}.`;
    });

    return advice;
  }

  private buildShadow(spread: DrawnCard[], tone: InterpretationTone): string {
    const reversed = spread.find((item) => item.reversed) ?? spread.find((item) => item.card.arcana === 'major') ?? spread[0];
    const base = `Тіньова зона проявляється через «${reversed.card.name}» у позиції «${reversed.position}»: ${this.meaning(reversed)}`;

    if (tone === 'mystic') {
      return `${base} Це місце, де символи радять не поспішати й не плутати знак із страхом.`;
    }

    if (tone === 'practical') {
      return `${base} Практично це означає: перевірити припущення, не приймати рішення з імпульсу й прибрати один зайвий ризик.`;
    }

    return `${base} Психологічно це може бути точкою захисту: там, де хочеться контролювати, уникати або доводити.`;
  }

  private buildNextStep(focus: DrawnCard, adviceCard: DrawnCard, tone: InterpretationTone): string {
    const actionKeyword = adviceCard.card.keywords[0] ?? 'ясність';
    const focusKeyword = focus.card.keywords[0] ?? 'фокус';

    if (tone === 'mystic') {
      return `Сформулюй одне питання про «${focusKeyword}» і зроби маленький ритуальний крок у напрямку «${actionKeyword}». Не все треба вирішити сьогодні — достатньо відкрити правильні двері.`;
    }

    if (tone === 'practical') {
      return `Запиши один конкретний крок на найближчі 24 години: що ти зробиш із темою «${actionKeyword}», щоб розблокувати «${focusKeyword}».`;
    }

    return `Поспостерігай, де тема «${focusKeyword}» викликає найбільшу реакцію, і обери м’який крок у сторону «${actionKeyword}» без самотиску.`;
  }

  private meaning(item: DrawnCard): string {
    return item.reversed ? item.card.meaningReversed : item.card.meaningUpright;
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
