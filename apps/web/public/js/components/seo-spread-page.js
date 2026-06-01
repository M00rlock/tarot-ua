import { fetchSpreadDefinitions } from '../services/api.js';
import { buildFaqJsonLd, setJsonLd, setSeoMeta } from '../seo/meta.js';
import { ORG_NAME, SPREAD_DEFAULT_DESCRIPTION } from '../constants/seo.js';
import { SPREAD_SLUG_TO_TYPE, SPREAD_USE_CASE } from '../constants/spreads.js';

const template = document.createElement('template');
template.innerHTML = `
  <main class="seo-page">
    <a class="seo-back" href="/">← До головної</a>
    <section id="loading-state" class="seo-panel">Завантажую розклад...</section>
    <section id="not-found" class="seo-panel" style="display:none">
      <p class="eyebrow">404</p>
      <h1>Розклад не знайдено</h1>
      <p class="muted">Можливо, цей тип розкладу ще не додано.</p>
      <a class="seo-btn" href="/">Обрати інший розклад</a>
    </section>
    <div id="spread-content" style="display:none">
      <section class="seo-hero">
        <div class="seo-copy">
          <p class="eyebrow">Розклад Таро</p>
          <h1 id="spread-title"></h1>
          <p id="spread-description" class="seo-lead"></p>
          <a id="try-btn" class="seo-btn" href="/">Спробувати цей розклад</a>
        </div>
        <div id="spread-preview" class="seo-spread-preview"></div>
      </section>
      <section class="seo-panel seo-wide">
        <h2>Коли обирати цей розклад</h2>
        <p id="use-case-text"></p>
      </section>
      <section id="positions-grid" class="seo-grid positions-grid" aria-label="Позиції розкладу"></section>
      <section class="seo-panel seo-wide seo-faq" aria-labelledby="spread-faq-title">
        <h2 id="spread-faq-title">Поширені питання</h2>
        <div id="spread-faq"></div>
      </section>
    </div>
  </main>
`;

import { adoptStyles } from '../shared-styles.js';

export class SeoSpreadPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._slug = '';
    this._spreadDefinition = null;
  }

  static get observedAttributes() { return ['slug']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'slug' && oldVal !== newVal && newVal) {
      this._slug = newVal;
      this.loadSpread();
    }
  }

  async connectedCallback() {
    await adoptStyles(this);
    if (this._slug) this.loadSpread();
    this.shadowRoot.querySelector('.seo-back').addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });
  }

  async loadSpread() {
    const root = this.shadowRoot;
    root.getElementById('loading-state').style.display = 'block';
    root.getElementById('not-found').style.display = 'none';
    root.getElementById('spread-content').style.display = 'none';

    try {
      const definitions = await fetchSpreadDefinitions();
      const type = SPREAD_SLUG_TO_TYPE[this._slug] || this._slug;
      this._spreadDefinition = definitions.find((item) => item.id === type) || null;

      root.getElementById('loading-state').style.display = 'none';

      if (!this._spreadDefinition) {
        root.getElementById('not-found').style.display = 'block';
        setSeoMeta({
          title: `Розклад не знайдено — ${ORG_NAME}`,
          description: 'Сторінку розкладу Таро не знайдено.',
          canonicalPath: `/spreads/${this._slug}`
        });
        return;
      }

      this.renderSpread();
    } catch {
      root.getElementById('loading-state').textContent = 'Помилка завантаження';
    }
  }

  renderSpread() {
    const root = this.shadowRoot;
    const def = this._spreadDefinition;
    root.getElementById('spread-content').style.display = 'block';

    const seoDescription = `${def.title} — онлайн-розклад на ${def.count} карт із поясненням кожної позиції та цілісним тлумаченням.`;
    const useCase = SPREAD_USE_CASE[def.id] || '';

    root.getElementById('spread-title').textContent = def.title;
    root.getElementById('spread-description').textContent = seoDescription;
    root.getElementById('use-case-text').textContent = useCase;

    const tryBtn = root.getElementById('try-btn');
    tryBtn.href = `/?spread=${def.id}`;
    tryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo(`/?spread=${def.id}`);
    });

    const preview = root.getElementById('spread-preview');
    preview.className = `seo-spread-preview cards-${def.count}`;
    preview.innerHTML = '';
    def.positions.forEach((_, index) => {
      const span = document.createElement('span');
      span.textContent = String(index + 1);
      preview.appendChild(span);
    });

    const positionsGrid = root.getElementById('positions-grid');
    positionsGrid.innerHTML = '';
    def.positions.forEach((position, index) => {
      const article = document.createElement('article');
      article.className = 'seo-panel';
      article.innerHTML = `
        <p class="eyebrow">Позиція ${index + 1}</p>
        <h2>${position.name}</h2>
        <p>${position.description}</p>
      `;
      positionsGrid.appendChild(article);
    });

    const faqItems = [
      { question: `Для чого підходить розклад «${def.title}»?`, answer: useCase },
      { question: `Скільки карт у цьому розкладі?`, answer: `У цьому розкладі ${def.count} карт із поясненням кожної позиції.` },
      { question: 'Чи можна зробити цей розклад онлайн?', answer: 'Так, можна перейти до інтерактивного розкладу, отримати карти та зберегти або поділитися результатом.' }
    ];

    const faqContainer = root.getElementById('spread-faq');
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

    const title = `${def.title} — онлайн-розклад Таро`;
    setSeoMeta({
      title,
      description: seoDescription,
      canonicalPath: `/spreads/${this._slug}`,
      type: 'article'
    });

    setJsonLd('spread-page', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: seoDescription,
      author: { '@type': 'Organization', name: ORG_NAME },
      mainEntityOfPage: `${window.location.origin}/spreads/${this._slug}`
    });
    setJsonLd('spread-faq', buildFaqJsonLd(faqItems));
  }
}

customElements.define('seo-spread-page', SeoSpreadPage);
