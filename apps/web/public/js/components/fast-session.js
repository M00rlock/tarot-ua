import { cardMeaning, delay } from '../utils.js';
import { adoptStyles } from '../shared-styles.js';
import { drawSpread, fetchSpreadDefinitions, fetchSpreadInterpretation } from '../services/api.js';
import { saveSpreadSession, loadSpreadSession, saveInterpretationSession, loadInterpretationSession, loadNickname } from '../services/session-storage.js';
import { trackEvent } from '../analytics/analytics.js';

const SPREAD_META = [
  { id: 'classic3', icon: '✦', card: 'the-magician', name: 'Три карти', kicker: 'Класичний' },
  { id: 'pentagram5', icon: '✧', card: 'the-world', name: 'Пентаграма', kicker: 'Глибокий' },
  { id: 'love5', icon: '♡', card: 'the-lovers', name: 'Стосунки', kicker: 'Почуття' },
  { id: 'career5', icon: '⚜', card: 'ace-of-pentacles', name: 'Карʼєра', kicker: 'Шлях' }
];

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ'];

const template = document.createElement('template');
template.innerHTML = `
  <div class="mystic-backdrop" aria-hidden="true"></div>
  <div class="mystic-runes" aria-hidden="true"></div>
  <main class="mystic-page page-enter">
    <section class="mystic-hero">
      <h1>Швидка містична сесія</h1>
      <p class="subtitle" id="session-subtitle">Оберіть практику — карти самі розкажуть історію. Жодної реєстрації, лише ви і символи.</p>
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
      <div class="mystic-loading-cards">
        <div class="mystic-loading-card-back"></div>
        <div class="mystic-loading-card-back"></div>
        <div class="mystic-loading-card-back"></div>
        <div class="mystic-loading-card-back"></div>
        <div class="mystic-loading-card-back"></div>
      </div>
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
    const nickname = loadNickname();
    const sub = this.shadowRoot.getElementById('session-subtitle');
    if (nickname && sub) {
      sub.textContent = `Вітаю, ${nickname}. Оберіть практику — карти самі розкажуть історію.`;
    }
    this.bindEvents();
    this.drawSpreadGrid();
    this.spawnRunes();
    try {
      this.spreadDefinitions = await fetchSpreadDefinitions();
    } catch {}
    this.tryRestoreSession();
  }

  disconnectedCallback() {
    this._cleanup?.();
  }

  spawnRunes() {
    const container = this.shadowRoot.querySelector('.mystic-runes');
    const symbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ', '☽', '☾', '✧', '✦', '♰', '⚜'];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('span');
      el.className = 'mystic-rune';
      el.textContent = symbols[i % symbols.length];
      el.style.left = `${Math.random() * 100}%`;
      el.style.fontSize = `${0.7 + Math.random() * 1.2}rem`;
      el.style.setProperty('--duration', `${15 + Math.random() * 25}s`);
      el.style.setProperty('--delay', `${Math.random() * 20}s`);
      container.appendChild(el);
    }
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
        <img src="/cards/${s.card}.svg" alt="" class="mystic-spread-mini-card" loading="lazy" onerror="this.style.display='none'">
        <span class="icon">${s.icon}</span>
        <span class="name">${s.name}</span>
        <span class="kicker">${s.kicker}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.mystic-spread-card').forEach((card) => {
      card.addEventListener('click', () => this.selectSpread(card.dataset.id));
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
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
    this.shuffleAnimation();
    this.loading = true;
    this.showLoading(true);

    try {
      const definition = this.spreadDefinitions.find((d) => d.id === type);
      const [drawnCards] = await Promise.all([
        drawSpread(definition?.count ?? 3, type),
        delay(600)
      ]);
      this.spread = drawnCards;
      saveSpreadSession({ spreadType: type, spread: drawnCards });
      trackEvent('fast_spread_drawn', { spreadType: type, cardsCount: drawnCards.length });

      this.renderSpread();
      this.glowPanel('cards-section');

      const interp = await fetchSpreadInterpretation(drawnCards, type, 'psychological');
      this.interpretation = interp;
      saveInterpretationSession(interp);

      this.renderInterpretation();
      this.glowPanel('interpretation-section');
      trackEvent('fast_interpretation_generated', { spreadType: type, provider: interp.provider });
    } catch (err) {
      this.showError(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  shuffleAnimation() {
    const grid = this.shadowRoot.getElementById('spread-grid');
    grid.querySelectorAll('.mystic-spread-card').forEach((card) => {
      card.classList.add('mystic-shuffling');
      setTimeout(() => card.classList.remove('mystic-shuffling'), 2000);
    });
  }

  glowPanel(id) {
    const panel = this.shadowRoot.getElementById(id);
    if (panel) {
      panel.classList.add('glow');
      setTimeout(() => panel.classList.remove('glow'), 3000);
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
    requestAnimationFrame(() => {
      const titleEl = this.shadowRoot.getElementById('spread-title');
      if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  energyTag(description) {
    if (!description) return 'medium';
    const d = description.toLowerCase();
    if (/напружен|інтенси|бурхлив|пристрасн|вогнян/i.test(d)) return 'intense';
    if (/спокійн|гармоні|ясн|легк|м'як/i.test(d)) return 'high';
    if (/застій|важк|туман|мряк/i.test(d)) return 'low';
    return 'medium';
  }

  energyIcon(tag) {
    const icons = { high: '🌿', medium: '🌊', low: '🌙', intense: '⚡' };
    return icons[tag] || '🌊';
  }

  renderInterpretation() {
    if (!this.interpretation) return;
    const section = this.shadowRoot.getElementById('interpretation-section');
    const content = this.shadowRoot.getElementById('interp-content');
    section.style.display = '';
    content.className = 'mystic-interp revealing';

    const interp = this.interpretation;

    const energyTag = this.energyTag(interp.energy);
    const energyIcon = this.energyIcon(energyTag);
    const energyShort = interp.energy
      ? interp.energy.replace(/<[^>]+>/g, '').split(/[.;]/)[0].trim()
      : '';

    const firstSentence = (html) => {
      const t = html.replace(/<[^>]+>/g, '').trim();
      const m = t.match(/^[^.!?]+[.!?]+/);
      return m ? m[0].trim() : t.slice(0, 120);
    };

    const cardFragments = (this.spread || []).map((item) =>
      `<div class="post-fragment">
        <span class="post-label">${item.position}</span>
        <span class="post-card-name">${item.card.name}${item.reversed ? ' ⇄' : ''}</span>
        <span class="post-insight">${firstSentence(cardMeaning(item))}</span>
      </div>`
    ).join('');

    const interactionsFragments = Array.isArray(interp.interactions)
      ? interp.interactions.map((i) =>
          `<div class="post-fragment post-interaction">${firstSentence(i)}</div>`
        ).join('')
      : '';

    const adviceFragments = Array.isArray(interp.advice)
      ? interp.advice.map((a) =>
          `<div class="post-fragment post-advice">${firstSentence(a)}</div>`
        ).join('')
      : interp.advice
        ? `<div class="post-fragment post-advice">${firstSentence(interp.advice)}</div>`
        : '';

    const shadowFragment = interp.shadow
      ? `<div class="post-fragment post-shadow">${firstSentence(interp.shadow)}</div>`
      : '';

    const fragmentHtml = `
      <div class="post-mode" id="post-mode">
        <div class="post-header">
          <span class="post-energy ${energyTag}">${energyIcon} ${energyShort || 'енергія'}</span>
          <span class="post-summary-preview">${firstSentence(interp.summary)}</span>
        </div>
        <div class="post-divider"></div>
        ${cardFragments}
        ${interactionsFragments ? `<div class="post-divider"></div>${interactionsFragments}` : ''}
        ${adviceFragments ? `<div class="post-divider"></div>${adviceFragments}` : ''}
        ${shadowFragment ? `<div class="post-divider"></div>${shadowFragment}` : ''}
      </div>
    `;

    let fullHtml = '';
    if (interp.summary) {
      fullHtml += `<div class="summary">${interp.summary}</div>`;
    }
    if (interp.energy) {
      fullHtml += `<section><h3>Енергія розкладу</h3><p>${interp.energy}</p></section>`;
    }
    if (Array.isArray(interp.interactions)) {
      fullHtml += `<section><h3>Взаємодії карт</h3>${interp.interactions.map((i) => `<p>${i}</p>`).join('')}</section>`;
    }
    if (Array.isArray(interp.cards)) {
      interp.cards.forEach((card) => {
        if (card?.interpretation) {
          fullHtml += `<section><h3>${card.position || 'Карта'}</h3><p>${card.interpretation}</p></section>`;
        }
      });
    }
    if (Array.isArray(interp.advice)) {
      fullHtml += `<div class="advice"><h3>Порада</h3>${interp.advice.map((a) => `<p>${a}</p>`).join('')}</div>`;
    } else if (interp.advice) {
      fullHtml += `<div class="advice"><h3>Порада</h3><p>${interp.advice}</p></div>`;
    }
    if (interp.shadow) {
      fullHtml += `<section><h3>Тінь</h3><p>${interp.shadow}</p></section>`;
    }

    content.innerHTML = `
      <div class="post-view" id="post-view">
        ${fragmentHtml}
      </div>
      <div class="detail-view" id="detail-view" style="display:none">
        ${fullHtml || '<p style="color:rgba(200,185,230,0.5);text-align:center">Тлумачення готується...</p>'}
      </div>
      <div class="post-toggle-bar">
        <button class="post-toggle-btn active" id="toggle-frag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
          Стисло
        </button>
        <button class="post-toggle-btn" id="toggle-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Детально
        </button>
      </div>
    `;

    const fragView = content.querySelector('#post-view');
    const detailView = content.querySelector('#detail-view');
    const fragBtn = content.querySelector('#toggle-frag');
    const detailBtn = content.querySelector('#toggle-detail');

    if (fragBtn && detailBtn && fragView && detailView) {
      fragBtn.addEventListener('click', () => {
        fragView.style.display = '';
        detailView.style.display = 'none';
        fragBtn.classList.add('active');
        detailBtn.classList.remove('active');
      });
      detailBtn.addEventListener('click', () => {
        fragView.style.display = 'none';
        detailView.style.display = '';
        detailBtn.classList.add('active');
        fragBtn.classList.remove('active');
      });
    }

    requestAnimationFrame(() => {
      const header = section.querySelector('.mystic-panel-header');
      if (header) header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
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
