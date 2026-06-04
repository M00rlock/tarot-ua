const { randomBytes } = require('node:crypto');
const { readShared, writeShared } = require('./db');

async function create(input, origin = '') {
  const slug = createSlug();
  const title = input.title || 'Мій розклад Таро';

  const record = {
    id: randomBytes(12).toString('hex'),
    slug,
    title,
    spread_type: input.spreadType,
    cards: input.cards,
    interpretation: input.interpretation || null,
    created_at: new Date().toISOString(),
  };

  const spreads = readShared();
  spreads.push(record);
  writeShared(spreads);

  return toShareResponse(record, origin);
}

async function findBySlug(slug) {
  const spreads = readShared();
  const record = spreads.find((s) => s.slug === slug);
  if (!record) {
    const err = new Error('Публічний розклад не знайдено');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

function toShareResponse(spread, origin = '') {
  const appOrigin = origin || 'http://localhost:5173';
  const apiOrigin = origin || 'http://localhost:3000';
  const path = `/share/${spread.slug}`;
  const cardNames = spread.cards.map((item) => item.card.name).join(' · ');

  return {
    id: spread.id,
    slug: spread.slug,
    title: spread.title,
    spreadType: spread.spread_type,
    cards: spread.cards,
    interpretation: spread.interpretation,
    createdAt: spread.created_at,
    url: `${appOrigin}${path}`,
    path,
    social: {
      title: `${spread.title} — Таро Черіот`,
      description: cardNames || 'Публічний розклад Таро',
      imageUrl: `${apiOrigin}/api/share/spreads/${spread.slug}/social-card.svg`,
    },
  };
}

function renderSocialCardSvg(spread) {
  const width = 1200;
  const height = 630;
  const title = escapeXml(spread.title);
  const cards = spread.cards.slice(0, 5);
  const summary = escapeXml(spread.interpretation?.summary || 'Розклад Таро з цілісним тлумаченням карт, позицій і взаємодій.');

  const cardBlocks = cards.map((item, index) => {
    const x = 135 + index * 186;
    const reversed = item.reversed ? '↻ ' : '';
    return `
        <g transform="translate(${x},260)">
          <rect width="132" height="214" rx="18" fill="url(#cardGrad)" stroke="#f4d38b" stroke-opacity="0.58"/>
          <circle cx="66" cy="78" r="33" fill="none" stroke="#f4d38b" stroke-opacity="0.55"/>
          <text x="66" y="91" text-anchor="middle" font-size="34" fill="#f4d38b">✦</text>
          <text x="66" y="142" text-anchor="middle" font-size="18" font-weight="700" fill="#fff8e7">${index + 1}</text>
          <text x="66" y="174" text-anchor="middle" font-size="13" fill="#f4d38b">${escapeXml(item.position)}</text>
          <text x="66" y="195" text-anchor="middle" font-size="12" fill="#fff8e7">${escapeXml(reversed + item.card.name).slice(0, 34)}</text>
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
  <text x="80" y="594" fill="rgba(255,248,231,.72)" font-size="18">${escapeXml(spread.cards.map((item) => item.card.name).join(' · ')).slice(0, 120)}</text>
</svg>`;
}

function createSlug() {
  return randomBytes(5).toString('base64url');
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { create, findBySlug, toShareResponse, renderSocialCardSvg };
