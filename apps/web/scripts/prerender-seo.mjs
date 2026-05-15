import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '../..');
const distDir = path.join(webRoot, 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = (process.env.SITE_URL || 'https://tarot-chariot.example').replace(/\/$/, '');

const seedPath = path.join(repoRoot, 'apps/api/src/tarot/tarot.seed.ts');
const seed = fs.readFileSync(seedPath, 'utf8');

function matchValue(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*'([^']*)'`));
  return match?.[1] || '';
}

function matchKeywords(block) {
  const match = block.match(/keywords:\s*\[([^\]]*)\]/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((item) => item.trim().replace(/^'|'$/g, ''))
    .filter(Boolean);
}

const cards = Array.from(seed.matchAll(/\{\s*id:\s*'[^']+'[\s\S]*?image:\s*'[^']+'\s*\}/g)).map(([block]) => ({
  id: matchValue(block, 'id'),
  name: matchValue(block, 'name'),
  keywords: matchKeywords(block),
  meaningUpright: matchValue(block, 'meaningUpright'),
  meaningReversed: matchValue(block, 'meaningReversed'),
  image: matchValue(block, 'image')
})).filter((card) => card.id && card.name);

const spreads = [
  {
    slug: 'past-present-future',
    id: 'classic3',
    title: 'Минуле · Теперішнє · Майбутнє',
    description: 'Класичний онлайн-розклад Таро на 3 карти для швидкого аналізу ситуації: що вплинуло, що відбувається зараз і куди все рухається.',
    useCase: 'Підійде, коли треба швидко структурувати питання без зайвої складності.',
    positions: [
      ['Минуле', 'Що вже вплинуло на ситуацію або створило поточний фон.'],
      ['Теперішнє', 'Що відбувається зараз і потребує найбільшої уваги.'],
      ['Майбутнє', 'Найімовірніший напрям розвитку, якщо нічого не змінювати.']
    ]
  },
  {
    slug: 'pentagram',
    id: 'pentagram5',
    title: 'Пентаграма балансу',
    description: 'Розклад Таро на 5 карт для глибшого погляду на дію, емоції, думки, результат і внутрішній сенс ситуації.',
    useCase: 'Корисний для складних ситуацій, де важливо побачити кілька шарів одночасно.',
    positions: [
      ['Дух', 'Головний сенс ситуації та внутрішній вектор.'],
      ['Вогонь / дія', 'Що варто зробити активно й сміливо.'],
      ['Земля / результат', 'Практичний результат або матеріальний прояв.'],
      ['Вода / емоції', 'Почуття, інтуїція та приховані переживання.'],
      ['Повітря / думки', 'Ідеї, логіка, комунікація й ментальні блоки.']
    ]
  },
  {
    slug: 'love-reading',
    id: 'love5',
    title: 'Кохання та стосунки',
    description: 'Онлайн-розклад Таро на кохання: твоя позиція, інша сторона, зв’язок, перешкода та найкраща порада для серця.',
    useCase: 'Підходить для питань про почуття, взаємність, межі, близькість і невизначеність у стосунках.',
    positions: [
      ['Я', 'Твоя позиція, потреби й внутрішній стан у стосунках.'],
      ['Партнер / Інша сторона', 'Стан і мотиви другої людини або потенційного партнера.'],
      ['Зв’язок', 'Що реально тримає вас разом або створює тяжіння.'],
      ['Перешкода', 'Що заважає близькості, довірі або ясності.'],
      ['Порада', 'Найкращий наступний крок для серця й здорових меж.']
    ]
  },
  {
    slug: 'career-reading',
    id: 'career5',
    title: 'Кар’єра та гроші',
    description: 'Онлайн-розклад Таро для кар’єри, грошей і професійних рішень: поточна роль, сильна сторона, ризик, можливість і наступний крок.',
    useCase: 'Допомагає, коли треба оцінити роботу, фінансовий напрямок, ризики або нову можливість.',
    positions: [
      ['Поточна роль', 'Де ти зараз у професійному або фінансовому питанні.'],
      ['Сильна сторона', 'На що варто спертися, щоб рухатися швидше.'],
      ['Ризик', 'Що може забирати ресурс або створити помилку.'],
      ['Можливість', 'Де є потенціал росту, грошей або нового напрямку.'],
      ['Наступний крок', 'Конкретний фокус для дії найближчим часом.']
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absolute(pathname) {
  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function injectHead(html, { title, description, canonicalPath, image = '/seo/og-default.svg', type = 'article', jsonLd = [] }) {
  const canonical = absolute(canonicalPath);
  const imageUrl = absolute(image);
  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    ${jsonLd.map((data, index) => `<script id="ssg-jsonld-${index}" type="application/ld+json">${JSON.stringify(data)}</script>`).join('\n')}`;

  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[\s\S]*?>/, '')
    .replace(/<meta property="og:[\s\S]*?>/g, '')
    .replace(/<meta name="twitter:[\s\S]*?>/g, '')
    .replace('</head>', `${head}\n  </head>`);
}

function writePage(route, html) {
  const outDir = path.join(distDir, route.replace(/^\//, ''), 'index.html').replace(/index\.html\/index\.html$/, 'index.html');
  fs.mkdirSync(path.dirname(outDir), { recursive: true });
  fs.writeFileSync(outDir, html);
}

function cardFaq(card, reversed) {
  return [
    {
      q: `Що означає карта ${card.name}?`,
      a: reversed ? card.meaningReversed : card.meaningUpright
    },
    {
      q: `Що означає ${card.name} у перевернутому положенні?`,
      a: card.meaningReversed
    },
    {
      q: `Яка головна порада карти ${card.name}?`,
      a: `Зверни увагу на теми: ${card.keywords.join(', ')}. Карта радить діяти спокійно й чесно щодо себе.`
    }
  ];
}

function faqJsonLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };
}

function renderFaq(faq) {
  return `<section class="seo-panel seo-wide seo-faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Поширені питання</h2>
    ${faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}
  </section>`;
}

function cardPage(card, reversed) {
  const slug = reversed ? `${card.id}-reversed` : card.id;
  const title = reversed ? `Що означає перевернута ${card.name} — Таро Черіот` : `Значення карти ${card.name} — Таро Черіот`;
  const description = `${reversed ? card.meaningReversed : card.meaningUpright} Ключові теми: ${card.keywords.join(', ')}.`;
  const faq = cardFaq(card, reversed);
  const body = `<main class="seo-page">
    <a class="seo-back" href="/">← До розкладу</a>
    <article class="seo-hero seo-card-hero">
      <div class="seo-copy">
        <p class="eyebrow">Значення карти Таро</p>
        <h1>${escapeHtml(reversed ? `Що означає перевернута ${card.name}` : `Значення карти ${card.name}`)}</h1>
        <p class="seo-lead">${escapeHtml(description)}</p>
        <div class="seo-tags">${card.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div>
        <a class="seo-btn" href="/">Зробити розклад</a>
      </div>
      <img class="seo-card-image${reversed ? ' is-reversed' : ''}" src="${card.image}" alt="${escapeHtml(card.name)}" width="280" height="420" loading="eager" fetchpriority="high" />
    </article>
    <section class="seo-grid" aria-label="Значення карти ${escapeHtml(card.name)}">
      <article class="seo-panel"><h2>Пряме положення</h2><p>${escapeHtml(card.meaningUpright)}</p></article>
      <article class="seo-panel accent"><h2>Перевернуте положення</h2><p>${escapeHtml(card.meaningReversed)}</p></article>
      <article class="seo-panel"><h2>${escapeHtml(card.name)} у коханні</h2><p>У стосунках ${escapeHtml(card.name)} підсвічує тему «${escapeHtml(card.keywords[0] || 'вибір')}». Це запрошення чесно подивитися на бажання, межі та спосіб взаємодії.</p></article>
      <article class="seo-panel"><h2>${escapeHtml(card.name)} у кар’єрі та грошах</h2><p>У роботі ця карта говорить про ${escapeHtml(card.keywords.join(', '))}. Сфокусуйся на практичному кроці, який можна зробити вже зараз.</p></article>
    </section>
    ${renderFaq(faq)}
  </main>`;

  const html = injectHead(template.replace('<div id="app"></div>', `<div id="app">${body}</div>`), {
    title,
    description,
    canonicalPath: `/meaning/${slug}`,
    image: card.image,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: absolute(card.image),
        author: { '@type': 'Organization', name: 'Таро Черіот' },
        mainEntityOfPage: absolute(`/meaning/${slug}`)
      },
      faqJsonLd(faq)
    ]
  });
  writePage(`/meaning/${slug}`, html);
}

function spreadPage(spread) {
  const title = `${spread.title} — онлайн-розклад Таро`;
  const faq = [
    { q: `Для чого підходить розклад «${spread.title}»?`, a: spread.useCase },
    { q: `Скільки карт у цьому розкладі?`, a: `У цьому розкладі ${spread.positions.length} карт із окремим значенням для кожної позиції.` },
    { q: 'Чи можна зробити розклад онлайн?', a: 'Так, на сторінці можна перейти до інтерактивного розкладу й отримати тлумачення карт.' }
  ];
  const body = `<main class="seo-page">
    <a class="seo-back" href="/">← До головної</a>
    <article class="seo-hero">
      <div class="seo-copy">
        <p class="eyebrow">Розклад Таро</p>
        <h1>${escapeHtml(spread.title)}</h1>
        <p class="seo-lead">${escapeHtml(spread.description)}</p>
        <a class="seo-btn" href="/?spread=${spread.id}">Спробувати цей розклад</a>
      </div>
      <div class="seo-spread-preview cards-${spread.positions.length}" aria-hidden="true">${spread.positions.map((_, index) => `<span>${index + 1}</span>`).join('')}</div>
    </article>
    <section class="seo-panel seo-wide"><h2>Коли обирати цей розклад</h2><p>${escapeHtml(spread.useCase)}</p></section>
    <section class="seo-grid positions-grid" aria-label="Позиції розкладу">
      ${spread.positions.map(([name, text], index) => `<article class="seo-panel"><p class="eyebrow">Позиція ${index + 1}</p><h2>${escapeHtml(name)}</h2><p>${escapeHtml(text)}</p></article>`).join('')}
    </section>
    ${renderFaq(faq)}
  </main>`;
  const html = injectHead(template.replace('<div id="app"></div>', `<div id="app">${body}</div>`), {
    title,
    description: spread.description,
    canonicalPath: `/spreads/${spread.slug}`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: spread.description,
        author: { '@type': 'Organization', name: 'Таро Черіот' },
        mainEntityOfPage: absolute(`/spreads/${spread.slug}`)
      },
      faqJsonLd(faq)
    ]
  });
  writePage(`/spreads/${spread.slug}`, html);
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Build output not found: ${indexPath}`);
}

const template = fs.readFileSync(indexPath, 'utf8');

for (const card of cards) {
  cardPage(card, false);
  cardPage(card, true);
}
for (const spread of spreads) spreadPage(spread);

const urls = [
  '/',
  ...cards.flatMap((card) => [`/meaning/${card.id}`, `/meaning/${card.id}-reversed`]),
  ...spreads.map((spread) => `/spreads/${spread.slug}`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${absolute(url)}</loc><changefreq>${url === '/' ? 'daily' : 'monthly'}</changefreq><priority>${url === '/' ? '1.0' : url.startsWith('/meaning') ? '0.8' : '0.7'}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml')}\n`);

console.log(`Prerendered ${cards.length * 2 + spreads.length} SEO pages and sitemap.xml`);
