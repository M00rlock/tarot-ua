import { formatDate, groupItemsByMonth, pluralizeCards } from '../utils.js';
import { TONE_LABELS } from '../constants/interpretation.js';

const template = document.createElement('template');
template.innerHTML = `
  <section class="panel journal-panel" style="display:none">
    <div class="section-head">
      <div>
        <p class="eyebrow">Tarot Journal</p>
        <h2 id="journal-title"></h2>
        <p class="muted">Збережені розклади як особистий архів: карти, позиції, AI-тлумачення і твої нотатки.</p>
      </div>
      <span id="journal-count" class="journal-count"></span>
    </div>
    <div id="journal-timeline" class="journal-timeline"></div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class TarotJournal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._items = [];
    this._expandedId = '';
    this._draftNotes = {};
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.render();
  }

  set title(val) { this.setAttribute('title', val); }
  set items(val) { this._items = val; this.render(); }

  get title() { return this.getAttribute('title') || ''; }

  render() {
    const section = this.shadowRoot.querySelector('section');
    const items = this._items;

    if (!items.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    this.shadowRoot.getElementById('journal-title').textContent = this.title;
    this.shadowRoot.getElementById('journal-count').textContent = `${items.length} ${items.length === 1 ? 'запис' : 'записів'}`;

    const timeline = this.shadowRoot.getElementById('journal-timeline');
    timeline.innerHTML = '';

    const groups = groupItemsByMonth(items);
    groups.forEach((group) => {
      const monthSection = document.createElement('section');
      monthSection.className = 'journal-month';
      const h3 = document.createElement('h3');
      h3.textContent = group.month;
      monthSection.appendChild(h3);

      group.items.forEach((entry) => {
        monthSection.appendChild(this.createEntryCard(entry));
      });

      timeline.appendChild(monthSection);
    });
  }

  createEntryCard(entry) {
    const article = document.createElement('article');
    article.className = `journal-card${this._expandedId === entry.id ? ' expanded' : ''}`;

    const summary = document.createElement('button');
    summary.className = 'journal-summary';
    summary.type = 'button';
    summary.innerHTML = `
      <span class="journal-icon">✦</span>
      <span class="journal-main">
        <strong>${entry.title}</strong>
        <small>${formatDate(entry.createdAt)} · ${entry.cards.length} ${pluralizeCards(entry.cards.length)} · ${this.toneLabel(entry.interpretation?.tone)}</small>
      </span>
      <span class="journal-chevron">${this._expandedId === entry.id ? '−' : '+'}</span>
    `;
    summary.addEventListener('click', () => {
      this._expandedId = this._expandedId === entry.id ? '' : entry.id;
      this.render();
    });
    article.appendChild(summary);

    if (this._expandedId === entry.id) {
      const details = document.createElement('div');
      details.className = 'journal-details';

      const cardGrid = document.createElement('div');
      cardGrid.className = 'journal-card-grid';
      entry.cards.forEach((drawn) => {
        const cardArticle = document.createElement('article');
        cardArticle.className = 'journal-drawn-card';
        const img = document.createElement('img');
        img.src = drawn.card.image;
        img.alt = drawn.card.name;
        img.className = drawn.reversed ? 'is-reversed' : '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', (e) => {
          this.dispatchEvent(new CustomEvent('image-error', { detail: e }));
        });
        const div = document.createElement('div');
        div.innerHTML = `
          <span class="journal-position">${drawn.position}</span>
          <strong>${drawn.card.name}</strong>
          ${drawn.reversed ? '<small>Перевернута</small>' : ''}
          <p>${drawn.positionDescription}</p>
        `;
        cardArticle.appendChild(img);
        cardArticle.appendChild(div);
        cardGrid.appendChild(cardArticle);
      });
      details.appendChild(cardGrid);

      if (entry.interpretation) {
        const interpDiv = document.createElement('div');
        interpDiv.className = 'journal-interpretation';
        interpDiv.innerHTML = `
          <div class="journal-meta-row">
            <span>${entry.interpretation.provider === 'llm' ? 'LLM' : 'Fallback'}</span>
            <span>${this.toneLabel(entry.interpretation.tone)}</span>
          </div>
          <h4>${entry.interpretation.title}</h4>
          <p>${entry.interpretation.summary}</p>
          <p><strong>Енергія:</strong> ${entry.interpretation.energy}</p>
          <p><strong>Тінь:</strong> ${entry.interpretation.shadow}</p>
          <p><strong>Наступний крок:</strong> ${entry.interpretation.nextStep}</p>
        `;
        details.appendChild(interpDiv);
      }

      const label = document.createElement('label');
      label.className = 'journal-note';
      label.innerHTML = '<span>Особиста нотатка</span>';
      const textarea = document.createElement('textarea');
      textarea.value = this._draftNotes[entry.id] ?? entry.note ?? '';
      textarea.placeholder = 'Що відчувається після цього розкладу? Що справдилось пізніше?';
      textarea.rows = 4;
      textarea.addEventListener('input', (e) => {
        this._draftNotes[entry.id] = e.target.value;
      });
      label.appendChild(textarea);

      const actions = document.createElement('div');
      actions.className = 'journal-actions';
      const openBtn = document.createElement('button');
      openBtn.className = 'btn btn-secondary';
      openBtn.type = 'button';
      openBtn.textContent = 'Відкрити розклад';
      openBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('open', { detail: entry }));
      });
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-ghost';
      saveBtn.type = 'button';
      saveBtn.textContent = 'Зберегти нотатку';
      saveBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('save-note', {
          detail: { id: entry.id, note: this._draftNotes[entry.id] ?? entry.note ?? '' }
        }));
      });
      actions.appendChild(openBtn);
      actions.appendChild(saveBtn);

      details.appendChild(label);
      details.appendChild(actions);
      article.appendChild(details);
    }

    return article;
  }

  toneLabel(tone) {
    return tone && tone in TONE_LABELS ? TONE_LABELS[tone] : 'Без тону';
  }
}

customElements.define('tarot-journal', TarotJournal);
