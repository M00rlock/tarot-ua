import { Injectable, Logger } from '@nestjs/common';
import { DrawnCard, InterpretationTone, SpreadDefinition, SpreadInterpretation } from './tarot.types';

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class LlmInterpretationService {
  private readonly logger = new Logger(LlmInterpretationService.name);

  isConfigured(): boolean {
    return Boolean(this.apiKey());
  }

  async generate(input: {
    spread: DrawnCard[];
    definition: SpreadDefinition;
    tone: InterpretationTone;
    fallback: SpreadInterpretation;
  }): Promise<SpreadInterpretation | null> {
    const apiKey = this.apiKey();
    if (!apiKey) return null;

    const endpoint = process.env.LLM_API_URL ?? 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.LLM_MODEL ?? 'openai/gpt-4o-mini';
    const timeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? 20000);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(process.env.LLM_SITE_URL ? { 'HTTP-Referer': process.env.LLM_SITE_URL } : {}),
          ...(process.env.LLM_APP_NAME ? { 'X-Title': process.env.LLM_APP_NAME } : {})
        },
        body: JSON.stringify({
          model,
          temperature: Number(process.env.LLM_TEMPERATURE ?? 0.75),
          max_tokens: Number(process.env.LLM_MAX_TOKENS ?? 1200),
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: this.systemPrompt()
            },
            {
              role: 'user',
              content: this.userPrompt(input)
            }
          ]
        })
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const details = await response.text().catch(() => '');
        this.logger.warn(`LLM request failed: ${response.status} ${details.slice(0, 300)}`);
        return null;
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = this.parseJson(content);
      return this.normalize(parsed, input.fallback, input.tone);
    } catch (error) {
      this.logger.warn(`LLM interpretation fallback used: ${(error as Error).message}`);
      return null;
    }
  }

  private apiKey(): string {
    return process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '';
  }

  private systemPrompt(): string {
    return [
      'Ти український AI-інтерпретатор Таро для сучасного веб-додатку.',
      'Пиши українською, живо, тепло, глибоко, але без фаталізму.',
      'Не стверджуй майбутнє як факт. Формулюй як можливий напрям, символічну підказку або психологічний патерн.',
      'Не давай медичних, юридичних або фінансових гарантій.',
      'Аналізуй весь розклад цілісно: позиції, сусідство карт, повтори мастей, старші аркани, перевернуті карти.',
      'Відповідай тільки валідним JSON без markdown.',
      'JSON schema: {"title":"string","summary":"string","energy":"string","interactions":["string"],"advice":["string"],"shadow":"string","nextStep":"string"}'
    ].join('\n');
  }

  private userPrompt(input: { spread: DrawnCard[]; definition: SpreadDefinition; tone: InterpretationTone; fallback: SpreadInterpretation }): string {
    const toneMap: Record<InterpretationTone, string> = {
      psychological: 'психологічний: внутрішні процеси, патерни, емоційна чесність, м’яка підтримка',
      mystic: 'містичний: символи, архетипи, атмосфера, інтуїтивна мова без перебільшень',
      practical: 'практичний: конкретні висновки, рішення, ризики, наступні кроки'
    };

    const cards = input.spread.map((item, index) => ({
      index: index + 1,
      position: item.position,
      positionDescription: item.positionDescription,
      card: item.card.name,
      orientation: item.reversed ? 'перевернута' : 'пряма',
      arcana: item.card.arcana,
      suit: item.card.suit ?? 'Старші аркани',
      keywords: item.card.keywords,
      meaning: item.reversed ? item.card.meaningReversed : item.card.meaningUpright
    }));

    return JSON.stringify({
      task: 'Згенеруй цілісне LLM-тлумачення розкладу Таро.',
      spread: {
        id: input.definition.id,
        title: input.definition.title,
        positions: input.definition.positions
      },
      tone: input.tone,
      toneInstruction: toneMap[input.tone],
      cards,
      requirements: [
        'summary: 2-4 речення про головний сюжет розкладу.',
        'energy: короткий опис загальної енергії, домінантної масті/арканів і кількості перевернутих карт.',
        'interactions: 2-5 пунктів про взаємодію конкретних карт між собою.',
        'advice: 2-4 практичні або психологічні поради.',
        'shadow: одна чесна тіньова зона без залякування.',
        'nextStep: один конкретний крок на найближчі 24 години.',
        'Не вигадуй карт, використовуй тільки передані карти.'
      ]
    });
  }

  private parseJson(content: string): unknown {
    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('LLM returned non-JSON content');
      return JSON.parse(match[0]);
    }
  }

  private normalize(value: unknown, fallback: SpreadInterpretation, tone: InterpretationTone): SpreadInterpretation {
    const source = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};

    return {
      title: this.stringValue(source.title, `LLM-тлумачення · ${fallback.title.replace(/^AI-тлумачення · /, '')}`),
      tone,
      summary: this.stringValue(source.summary, fallback.summary),
      energy: this.stringValue(source.energy, fallback.energy),
      interactions: this.stringArray(source.interactions, fallback.interactions),
      advice: this.stringArray(source.advice, fallback.advice),
      shadow: this.stringValue(source.shadow, fallback.shadow),
      nextStep: this.stringValue(source.nextStep, fallback.nextStep),
      provider: 'llm'
    };
  }

  private stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private stringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) return fallback;
    const items = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim());
    return items.length ? items : fallback;
  }
}
