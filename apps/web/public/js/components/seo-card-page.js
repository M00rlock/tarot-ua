import { fetchCards } from '../services/api.js';
import { buildFaqJsonLd, setJsonLd, setSeoMeta } from '../seo/meta.js';
import { CARD_DEFAULT_DESCRIPTION, CARD_DEFAULT_TITLE, ORG_NAME } from '../constants/seo.js';

const template = document.createElement('template');
template.innerHTML = `
  <main class="seo-page">
    <a class="seo-back" href="/">← До розкладу</a>
    <section id="loading-state" class="seo-panel">Завантажую значення карти...</section>
    <section id="not-found" class="seo-panel" style="display:none">
      <p class="eyebrow">404</p>
      <h1>Карту не знайдено</h1>
      <p class="muted">Схоже, такого аркана ще немає у колоді.</p>
      <a class="seo-btn" href="/">Повернутись до розкладу</a>
    </section>
    <div id="card-content" style="display:none">
      <section class="seo-hero seo-card-hero">
        <div class="seo-copy">
          <p class="eyebrow">Значення карти Таро</p>
          <h1 id="card-title"></h1>
          <p id="card-description" class="seo-lead"></p>
          <div id="card-tags" class="seo-tags"></div>
          <a class="seo-btn" href="/">Зробити розклад</a>
        </div>
        <img id="card-image" class="seo-card-image" src="" alt="" width="280" height="420" loading="eager" fetchpriority="high" />
      </section>
      <section class="seo-grid">
        <article class="seo-panel">
          <h2>Пряме положення</h2>
          <p id="meaning-upright"></p>
        </article>
        <article class="seo-panel accent">
          <h2>Перевернуте положення</h2>
          <p id="meaning-reversed"></p>
        </article>
        <article class="seo-panel">
          <h2 id="love-title"></h2>
          <p id="love-meaning"></p>
        </article>
        <article class="seo-panel">
          <h2 id="career-title"></h2>
          <p id="career-meaning"></p>
        </article>
      </section>
      <section class="seo-panel seo-wide">
        <h2>Порада карти</h2>
        <p id="card-advice"></p>
      </section>
      <section class="seo-panel seo-wide seo-faq" aria-labelledby="card-faq-title">
        <h2 id="card-faq-title">Поширені питання</h2>
        <div id="card-faq"></div>
      </section>
    </div>
  </main>
`;

import { adoptStyles } from '../shared-styles.js';

export class SeoCardPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._slug = '';
    this._card = null;
  }

  static get observedAttributes() { return ['slug']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'slug' && oldVal !== newVal && newVal) {
      this._slug = newVal;
      this.loadCard();
    }
  }

  async connectedCallback() {
    await adoptStyles(this);
    if (this._slug) this.loadCard();
    const backBtn = this.shadowRoot.querySelector('.seo-back');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigateTo('/');
      });
    }
    this.shadowRoot.querySelectorAll('.seo-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigateTo('/');
      });
    });
  }

  get isReversedPage() { return this._slug.endsWith('-reversed'); }
  get cleanSlug() { return this._slug.replace(/-reversed$/, ''); }

  get pageTitle() {
    if (!this._card) return CARD_DEFAULT_TITLE;
    return this.isReversedPage
      ? `Що означає перевернута ${this._card.name}`
      : `Значення карти ${this._card.name}`;
  }

  get pageDescription() {
    if (!this._card) return CARD_DEFAULT_DESCRIPTION;
    const base = this.isReversedPage ? this._card.meaningReversed : this._card.meaningUpright;
    return `${base} Ключові теми: ${this._card.keywords.join(', ')}.`;
  }

  async loadCard() {
    const root = this.shadowRoot;
    root.getElementById('loading-state').style.display = 'block';
    root.getElementById('not-found').style.display = 'none';
    root.getElementById('card-content').style.display = 'none';

    try {
      const cards = await fetchCards(78);
      this._card = cards.find((item) => item.id === this.cleanSlug) || null;

      root.getElementById('loading-state').style.display = 'none';

      if (!this._card) {
        root.getElementById('not-found').style.display = 'block';
        setSeoMeta({
          title: `Карту не знайдено — ${ORG_NAME}`,
          description: 'Сторінку значення карти не знайдено.',
          canonicalPath: `/meaning/${this._slug}`
        });
        return;
      }

      this.renderCard();
    } catch {
      root.getElementById('loading-state').textContent = 'Помилка завантаження';
    }
  }

  renderCard() {
    const root = this.shadowRoot;
    const card = this._card;
    root.getElementById('card-content').style.display = 'block';

    root.getElementById('card-title').textContent = this.pageTitle;
    root.getElementById('card-description').textContent = this.pageDescription;

    const tagsContainer = root.getElementById('card-tags');
    tagsContainer.innerHTML = '';
    card.keywords.forEach((keyword) => {
      const span = document.createElement('span');
      span.textContent = keyword;
      tagsContainer.appendChild(span);
    });

    const img = root.getElementById('card-image');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'seo-card-image' + (this.isReversedPage ? ' is-reversed' : '');

    root.getElementById('meaning-upright').textContent = card.meaningUpright;
    root.getElementById('meaning-reversed').textContent = card.meaningReversed;

    const tone = this.isReversedPage ? card.meaningReversed : card.meaningUpright;
    root.getElementById('love-title').textContent = `${card.name} у коханні`;
    root.getElementById('love-meaning').textContent = `У стосунках ${card.name} підсвічує тему «${card.keywords[0]}». ${tone} Це запрошення чесно подивитися на бажання, межі та спосіб взаємодії з іншою людиною.`;

    root.getElementById('career-title').textContent = `${card.name} у кар'єрі та грошах`;
    root.getElementById('career-meaning').textContent = `У роботі та фінансах ця карта говорить про ${card.keywords.join(', ')}. ${tone} Сфокусуйся на практичному кроці, який можна зробити вже зараз.`;

    const advice = this.isReversedPage
      ? 'Не тисни на ситуацію. Перевернута карта радить побачити блок, назвати його чесно й повернути собі опору через маленьку дію.'
      : `Використай енергію карти як напрямок: ${card.keywords.join(', ')}. Один ясний крок краще за десять тривожних сценаріїв.`;
    root.getElementById('card-advice').textContent = advice;

    const faqItems = [
      { question: `Що означає карта ${card.name}?`, answer: card.meaningUpright },
      { question: `Що означає ${card.name} у перевернутому положенні?`, answer: card.meaningReversed },
      { question: `Яка головна порада карти ${card.name}?`, answer: advice }
    ];

    const faqContainer = root.getElementById('card-faq');
    faqContainer.innerHTML = '';
    faqItems.forEach((item) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = item.question;
      const p = document.createElement('p');
      p.textContent = item.answer;
      details.appendChild(summary);
      details.appendChild(p);
      faqContainer.appendChild(details);
    });

    const title = `${this.pageTitle} — ${ORG_NAME}`;
    setSeoMeta({
      title,
      description: this.pageDescription,
      canonicalPath: `/meaning/${this._slug}`,
      image: card.image,
      type: 'article'
    });

    setJsonLd('card-meaning', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.pageTitle,
      description: this.pageDescription,
      image: `${window.location.origin}${card.image}`,
      author: { '@type': 'Organization', name: ORG_NAME },
      mainEntityOfPage: `${window.location.origin}/meaning/${this._slug}`
    });
    setJsonLd('card-faq', buildFaqJsonLd(faqItems));
  }
}

customElements.define('seo-card-page', SeoCardPage);
