import { spreadMeta } from '../constants/spreads.js';

const template = document.createElement('template');
template.innerHTML = `
  <section id="ritual-section" class="panel controls-panel ritual-panel">
    <div class="ritual-head practice-head">
      <div>
        <p class="eyebrow">Спосіб тихої сесії</p>
        <h2>Якою буде ваша практика?</h2>
        <p class="muted">Не шукайте "правильний" варіант. Оберіть той ритм, який сьогодні відчувається спокійніше.</p>
      </div>
      <button id="expand-btn" class="btn btn-ghost" type="button" style="display:none">Змінити практику</button>
    </div>
    <div id="selector-grid" class="spread-selector spread-selector-v2 practice-grid"></div>
    <div id="active-summary" class="active-ritual-summary active-practice-summary" style="display:none"></div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class RitualSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._definitions = [];
    this._activeType = 'classic3';
    this._collapsed = false;
    this._loading = false;
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.getElementById('expand-btn').addEventListener('click', () => {
      this._collapsed = false;
      this.updateUI();
      this.dispatchEvent(new CustomEvent('expand'));
    });
  }

  set definitions(val) {
    this._definitions = val;
    this.updateUI();
  }

  set activeType(val) {
    this._activeType = val;
    this.updateUI();
  }

  set collapsed(val) {
    this._collapsed = val;
    this.updateUI();
  }

  set loading(val) {
    this._loading = val;
    this.updateUI();
  }

  scrollIntoView() {
    this.shadowRoot.getElementById('ritual-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateUI() {
    const section = this.shadowRoot.getElementById('ritual-section');
    const grid = this.shadowRoot.getElementById('selector-grid');
    const expandBtn = this.shadowRoot.getElementById('expand-btn');
    const summary = this.shadowRoot.getElementById('active-summary');

    section.classList.toggle('collapsed', this._collapsed);
    expandBtn.style.display = this._collapsed ? '' : 'none';

    if (this._collapsed) {
      grid.style.display = 'none';
      const activeDef = this._definitions.find((d) => d.id === this._activeType);
      if (activeDef) {
        const meta = spreadMeta(activeDef.id);
        summary.style.display = 'flex';
        summary.innerHTML = `
          <span>${meta.icon}</span>
          <div>
            <strong>${meta.title}</strong>
            <small>${meta.description}</small>
          </div>
        `;
      }
    } else {
      grid.style.display = '';
      summary.style.display = 'none';
      this.renderGrid(grid);
    }
  }

  renderGrid(container) {
    container.innerHTML = '';
    this._definitions.forEach((def) => {
      const meta = spreadMeta(def.id);
      const btn = document.createElement('button');
      btn.className = `spread-button spread-choice practice-card${def.id === this._activeType ? ' active' : ''}`;
      btn.disabled = this._loading;
      btn.innerHTML = `
        <span class="practice-mark" aria-hidden="true">
          <span class="practice-count">${def.count}</span>
          <span class="practice-count-label">карт${def.count === 3 ? 'и' : ''}</span>
        </span>
        <span class="choice-body practice-body">
          <span class="practice-kicker">${meta.kicker}</span>
          <strong>${meta.title}</strong>
          <small>${meta.description}</small>
          <em>${meta.pace}</em>
        </span>
        <span class="practice-symbol" aria-hidden="true">${meta.icon}</span>
      `;
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('choose', { detail: def.id }));
      });
      container.appendChild(btn);
    });
  }
}

customElements.define('ritual-selector', RitualSelector);
