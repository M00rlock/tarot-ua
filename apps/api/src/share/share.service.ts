import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';
import { SharedSpreadEntity } from './shared-spread.entity';

interface CreateSharedSpreadInput {
  title: string;
  spreadType: SpreadType;
  cards: DrawnCard[];
  interpretation?: SpreadInterpretation | null;
}

@Injectable()
export class ShareService {
  constructor(@InjectRepository(SharedSpreadEntity) private readonly sharedSpreads: Repository<SharedSpreadEntity>) {}

  async create(input: CreateSharedSpreadInput, origin = '') {
    const slug = await this.createUniqueSlug();
    const title = input.title || 'Мій розклад Таро';

    const shared = await this.sharedSpreads.save(this.sharedSpreads.create({
      slug,
      title,
      spreadType: input.spreadType,
      cards: input.cards,
      interpretation: input.interpretation ?? null
    }));

    return this.toShareResponse(shared, origin);
  }

  async findBySlug(slug: string) {
    const spread = await this.sharedSpreads.findOne({ where: { slug } });

    if (!spread) {
      throw new NotFoundException('Публічний розклад не знайдено');
    }

    return spread;
  }

  toShareResponse(spread: SharedSpreadEntity, origin = '') {
    const appOrigin = origin || 'http://localhost:5173';
    const apiOrigin = origin || 'http://localhost:3000';
    const path = `/share/${spread.slug}`;
    const cardNames = spread.cards.map((item) => item.card.name).join(' · ');

    return {
      id: spread.id,
      slug: spread.slug,
      title: spread.title,
      spreadType: spread.spreadType,
      cards: spread.cards,
      interpretation: spread.interpretation,
      createdAt: spread.createdAt,
      url: `${appOrigin}${path}`,
      path,
      social: {
        title: `${spread.title} — Таро Черіот`,
        description: cardNames || 'Публічний розклад Таро',
        imageUrl: `${apiOrigin}/api/share/spreads/${spread.slug}/social-card.svg`
      }
    };
  }

  renderSocialCardSvg(spread: SharedSpreadEntity) {
    const width = 1200;
    const height = 630;
    const title = this.escapeXml(spread.title);
    const cards = spread.cards.slice(0, 5);
    const summary = this.escapeXml(spread.interpretation?.summary || 'Розклад Таро з цілісним тлумаченням карт, позицій і взаємодій.');

    const cardBlocks = cards.map((item, index) => {
      const x = 135 + index * 186;
      const reversed = item.reversed ? '↻ ' : '';
      return `
        <g transform="translate(${x},260)">
          <rect width="132" height="214" rx="18" fill="url(#cardGrad)" stroke="#f4d38b" stroke-opacity="0.58"/>
          <circle cx="66" cy="78" r="33" fill="none" stroke="#f4d38b" stroke-opacity="0.55"/>
          <text x="66" y="91" text-anchor="middle" font-size="34" fill="#f4d38b">✦</text>
          <text x="66" y="142" text-anchor="middle" font-size="18" font-weight="700" fill="#fff8e7">${index + 1}</text>
          <text x="66" y="174" text-anchor="middle" font-size="13" fill="#f4d38b">${this.escapeXml(item.position)}</text>
          <text x="66" y="195" text-anchor="middle" font-size="12" fill="#fff8e7">${this.escapeXml(reversed + item.card.name).slice(0, 34)}</text>
        </g>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#110b22"/>
      <stop offset="0.52" stop-color="#281638"/>
      <stop offset="1" stop-color="#120d1f"/>
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#8c68ff" stop-opacity="0.42"/>
      <stop offset="0.58" stop-color="#e6b66a" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241739"/>
      <stop offset="1" stop-color="#6d3f77"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#orb)"/>
  <circle cx="1050" cy="95" r="2" fill="#f4d38b" opacity="0.75"/>
  <circle cx="160" cy="122" r="2" fill="#f4d38b" opacity="0.6"/>
  <circle cx="980" cy="510" r="2" fill="#f4d38b" opacity="0.72"/>
  <text x="80" y="88" fill="#f4d38b" font-size="24" font-weight="800" letter-spacing="5">ТАРО ЧЕРІОТ</text>
  <text x="80" y="154" fill="#fff8e7" font-size="52" font-weight="900">${title}</text>
  <foreignObject x="80" y="180" width="870" height="72">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;color:rgba(255,248,231,.82);font-size:23px;line-height:1.35">${summary}</div>
  </foreignObject>
  ${cardBlocks}
  <text x="80" y="560" fill="#f4d38b" font-size="22" font-weight="800">Поділись своїм розкладом ✦</text>
  <text x="80" y="594" fill="rgba(255,248,231,.72)" font-size="18">${this.escapeXml(spread.cards.map((item) => item.card.name).join(' · ')).slice(0, 120)}</text>
</svg>`;
  }

  private async createUniqueSlug() {
    for (let i = 0; i < 5; i += 1) {
      const slug = randomBytes(5).toString('base64url');
      const existing = await this.sharedSpreads.findOne({ where: { slug } });
      if (!existing) return slug;
    }

    return randomBytes(8).toString('base64url');
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
