import { formatDate, groupItemsByMonth, pluralizeCards } from '../utils.js';
import { TONE_LABELS } from '../constants/interpretation.js';
import { loadJournal, updateEntry } from '../services/journal-storage.js';

const template = document.createElement('template');
template.innerHTML = `
  <main class="quiet-page">
    <app-nav></app-nav>

    <section class="quiet-room" aria-labelledby="journal-title">
      <p class="quiet-kicker">Особистий щоденник</p>
      <h1 id="journal-title">Історія розкладів</h1>
      <p class="quiet-lead quiet-lead-narrow">
        Усі ваші розклади зберігаються локально в браузері.
      </p>
    </section>

    <section class="quiet-note-panel">
      <div id="journal-content"></div>
      <div id="journal-empty" class="quiet-empty">
        <p>Ще немає записів. Зробіть розклад у тихій сесії — він з'явиться тут.</p>
        <div class="quiet-actions">
          <a class="quiet-btn quiet-btn-primary" href="/session">Перейти до сесії</a>
          <a class="quiet-btn quiet-btn-ghost" href="/">На головну</a>
        </div>
      </div>
    </section>
  </main>
`;

import { adoptStyles } from '../shared-styles.js';

export class JournalPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._expandedId = '';
    this._draftNotes = {};
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigateTo(a.getAttribute('href'));
      });
    });
    this.render();
  }

  render() {
    const items = loadJournal();
    const content = this.shadowRoot.getElementById('journal-content');
    const empty = this.shadowRoot.getElementById('journal-empty');

    if (!items.length) {
      content.innerHTML = '';
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';

    const groups = groupItemsByMonth(items);
    content.innerHTML = groups.map((group) => `
      <section class="journal-month">
        <h3>${group.month}</h3>
        ${group.items.map((entry) => this.renderEntry(entry)).join('')}
      </section>
    `).join('');

    content.querySelectorAll('.journal-summary').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        this._expandedId = this._expandedId === id ? '' : id;
        this.render();
      });
    });

    content.querySelectorAll('.journal-note-textarea').forEach((ta) => {
      ta.addEventListener('input', (e) => {
        this._draftNotes[ta.dataset.id] = e.target.value;
      });
    });

    content.querySelectorAll('.journal-save-note').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const note = this._draftNotes[id] || '';
        updateEntry(id, { note });
        this._draftNotes[id] = note;
        btn.textContent = 'Нотатку збережено';
        setTimeout(() => { btn.textContent = 'Зберегти нотатку'; }, 2000);
      });
    });
  }

  renderEntry(entry) {
    const isExpanded = this._expandedId === entry.id;
    const toneLabel = entry.interpretation?.tone && TONE_LABELS[entry.interpretation.tone]
      ? TONE_LABELS[entry.interpretation.tone]
      : 'Без тону';

    const cardsHtml = entry.cards.map((drawn) => `
      <article class="journal-drawn-card">
        <img src="${drawn.card.image}" alt="${drawn.card.name}" class="${drawn.reversed ? 'is-reversed' : ''}" loading="lazy" decoding="async"
          onerror="this.src='/cards/tarot-placeholder.svg'">
        <div>
          <span class="journal-position">${drawn.position}</span>
          <strong>${drawn.card.name}</strong>
          ${drawn.reversed ? '<small>Перевернута</small>' : ''}
          <p>${drawn.positionDescription}</p>
        </div>
      </article>
    `).join('');

    const interpHtml = entry.interpretation ? `
      <div class="journal-interpretation">
        <div class="journal-meta-row">
          <span>${entry.interpretation.provider === 'llm' ? 'LLM' : 'Fallback'}</span>
          <span>${toneLabel}</span>
        </div>
        <h4>${entry.interpretation.title}</h4>
        <p>${entry.interpretation.summary}</p>
        <p><strong>Енергія:</strong> ${entry.interpretation.energy}</p>
        <p><strong>Тінь:</strong> ${entry.interpretation.shadow}</p>
        <p><strong>Наступний крок:</strong> ${entry.interpretation.nextStep}</p>
      </div>
    ` : '';

    const note = this._draftNotes[entry.id] ?? entry.note ?? '';

    return `
      <article class="journal-card${isExpanded ? ' expanded' : ''}">
        <button class="journal-summary" type="button" data-id="${entry.id}">
          <span class="journal-icon">${entry.favorite ? '★' : '✦'}</span>
          <span class="journal-main">
            <strong>${entry.title}</strong>
            <small>${formatDate(entry.createdAt)} · ${entry.cards.length} ${pluralizeCards(entry.cards.length)} · ${toneLabel}</small>
          </span>
          <span class="journal-chevron">${isExpanded ? '−' : '+'}</span>
        </button>
        ${isExpanded ? `
          <div class="journal-details">
            <div class="journal-card-grid">${cardsHtml}</div>
            ${interpHtml}
            <label class="journal-note">
              <span>Особиста нотатка</span>
              <textarea class="journal-note-textarea" data-id="${entry.id}" placeholder="Що відчувається після цього розкладу? Що справдилось пізніше?" rows="4">${note}</textarea>
            </label>
            <div class="journal-actions">
              <button class="btn btn-secondary" type="button" onclick="window.navigateTo('/session')">Відкрити розклад</button>
              <button class="btn btn-ghost journal-save-note" data-id="${entry.id}">Зберегти нотатку</button>
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }
}

customElements.define('journal-page', JournalPage);
