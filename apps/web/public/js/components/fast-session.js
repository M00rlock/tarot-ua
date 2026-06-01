import { cardMeaning, delay } from '../utils.js';
import { adoptStyles } from '../shared-styles.js';
import { drawSpread, fetchSpreadDefinitions, fetchSpreadInterpretation } from '../services/api.js';
import { saveSpreadSession, loadSpreadSession, saveInterpretationSession, loadInterpretationSession } from '../services/session-storage.js';
import { trackEvent } from '../analytics/analytics.js';

const SPREAD_META = [
  { id: 'classic3', icon: '✦', name: 'Три карти', kicker: 'Класичний' },
  { id: 'pentagram5', icon: '✧', name: 'Пентаграма', kicker: 'Глибокий' },
  { id: 'love5', icon: '♡', name: 'Стосунки', kicker: 'Почуття' },
  { id: 'career5', icon: '⚜', name: 'Карʼєра', kicker: 'Шлях' }
];

const template = document.createElement('template');
template.innerHTML = `
  <div class="mystic-backdrop" aria-hidden="true"></div>
  <main class="mystic-page">
    <section class="mystic-hero">
      <h1>Швидка містична сесія</h1>
      <p class="subtitle">Оберіть практику — карти самі розкажуть історію. Жодної реєстрації, лише ви і символи.</p>
    </section>

    <section class="mystic-panel" id="spread-selector">
      <div class="mystic-panel-header">
        <h2>Оберіть розклад</h2>
        <span class="mystic-ornament">☾ ✦ ☾</span>
      </div>
      <div class="mystic-spread-grid" id="spread-grid"></div>
    </section>

    <section class="mystic-panel" id="cards-section" style="display:none">
      <div class="mystic-panel-header">
        <h2 id="spread-title">Ваш розклад</h2>
        <span class="mystic-ornament" id="card-count"></span>
      </div>
      <div class="mystic-cards" id="cards-container"></div>
      <div class="mystic-status" id="cards-status"></div>
    </section>

    <section class="mystic-panel" id="interpretation-section" style="display:none">
      <div class="mystic-panel-header">
        <h2>Тлумачення</h2>
        <span class="mystic-ornament">✧ ✦ ✧</span>
      </div>
      <div class="mystic-interp" id="interp-content"></div>
    </section>

    <div class="mystic-loading" id="loading-indicator" style="display:none">
      <div class="mystic-spinner"></div>
      <span>Карти відкриваються...</span>
    </div>

    <div class="mystic-nav">
      <a href="/session" id="full-session-link">Повна сесія зі збереженням</a>
      <a href="/" id="home-link">На головну</a>
    </div>
  </main>
`;

export class FastSession extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.spreadDefinitions = [];
    this.activeSpreadType = null;
    this.spread = [];
    this.interpretation = null;
    this.loading = false;
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.bindEvents();
    this.drawSpreadGrid();
    try {
      this.spreadDefinitions = await fetchSpreadDefinitions();
    } catch {}
    this.tryRestoreSession();
  }

  bindEvents() {
    const root = this.shadowRoot;
    root.getElementById('full-session-link').addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/session');
    });
    root.getElementById('home-link').addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });
  }

  drawSpreadGrid() {
    const grid = this.shadowRoot.getElementById('spread-grid');
    grid.innerHTML = SPREAD_META.map((s) => `
      <div class="mystic-spread-card" data-id="${s.id}">
        <span class="icon">${s.icon}</span>
        <span class="name">${s.name}</span>
        <span class="kicker">${s.kicker}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.mystic-spread-card').forEach((card) => {
      card.addEventListener('click', () => this.selectSpread(card.dataset.id));
    });
  }

  tryRestoreSession() {
    const saved = loadSpreadSession();
    if (saved?.spread?.length) {
      this.activeSpreadType = saved.spreadType;
      this.spread = saved.spread;
      this.interpretation = loadInterpretationSession();
      this.renderSpread();
      if (this.interpretation) this.renderInterpretation();
      this.highlightSelected();
    }
  }

  highlightSelected() {
    this.shadowRoot.querySelectorAll('.mystic-spread-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.id === this.activeSpreadType);
    });
  }

  async selectSpread(type) {
    if (this.loading) return;
    this.activeSpreadType = type;
    this.highlightSelected();
    this.loading = true;
    this.showLoading(true);

    try {
      const definition = this.spreadDefinitions.find((d) => d.id === type);
      const [drawnCards] = await Promise.all([
        drawSpread(definition?.count ?? 3, type),
        delay(400)
      ]);
      this.spread = drawnCards;
      saveSpreadSession({ spreadType: type, spread: drawnCards });
      trackEvent('fast_spread_drawn', { spreadType: type, cardsCount: drawnCards.length });

      this.renderSpread();

      const interp = await fetchSpreadInterpretation(drawnCards, type, 'psychological');
      this.interpretation = interp;
      saveInterpretationSession(interp);

      this.renderInterpretation();
      trackEvent('fast_interpretation_generated', { spreadType: type, provider: interp.provider });
    } catch (err) {
      this.showError(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  renderSpread() {
    const def = this.spreadDefinitions.find((d) => d.id === this.activeSpreadType);
    const title = def?.title ?? SPREAD_META.find((m) => m.id === this.activeSpreadType)?.name ?? 'Розклад';
    const container = this.shadowRoot.getElementById('cards-container');
    const status = this.shadowRoot.getElementById('cards-status');
    const section = this.shadowRoot.getElementById('cards-section');

    section.style.display = '';
    this.shadowRoot.getElementById('spread-title').textContent = title;
    this.shadowRoot.getElementById('card-count').textContent = `${this.spread.length} карти`;

    container.innerHTML = this.spread.map((item, i) => `
      <div class="mystic-card-slot revealing" style="animation-delay:${i * 0.2}s">
        <img src="/cards/${item.card.image}" alt="${item.card.name}"
          loading="lazy"
          onerror="this.src='/cards/tarot-placeholder.svg'">
        <div class="position">${item.position}</div>
        <div class="card-name">${item.card.name}${item.reversed ? ' ⇄' : ''}</div>
        <div class="card-meaning">${cardMeaning(item)}</div>
      </div>
    `).join('');

    status.textContent = '';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderInterpretation() {
    if (!this.interpretation) return;
    const section = this.shadowRoot.getElementById('interpretation-section');
    const content = this.shadowRoot.getElementById('interp-content');
    section.style.display = '';

    const interp = this.interpretation;
    let html = '';

    if (interp.summary) {
      html += `<div class="summary">${interp.summary}</div>`;
    }

    if (interp.energy) {
      html += `<section><h3>Енергія розкладу</h3><p>${interp.energy}</p></section>`;
    }

    if (Array.isArray(interp.cards)) {
      interp.cards.forEach((card) => {
        if (card?.interpretation) {
          html += `<section><h3>${card.position || 'Карта'}</h3><p>${card.interpretation}</p></section>`;
        }
      });
    }

    if (interp.advice) {
      html += `<div class="advice">${interp.advice}</div>`;
    }

    if (interp.shadow) {
      html += `<section><h3>Тінь</h3><p>${interp.shadow}</p></section>`;
    }

    content.innerHTML = html || '<p style="color:rgba(200,185,230,0.5);text-align:center">Тлумачення готується...</p>';
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showLoading(show) {
    this.shadowRoot.getElementById('loading-indicator').style.display = show ? '' : 'none';
  }

  showError(msg) {
    const status = this.shadowRoot.getElementById('cards-status');
    status.innerHTML = `<div class="mystic-error">${msg}</div>`;
  }
}

customElements.define('fast-session', FastSession);
