const template = document.createElement('template');
template.innerHTML = `
  <section class="panel interpretation-panel" id="interp-section" style="display:none">
    <div class="section-head interpretation-head">
      <div>
        <p class="eyebrow">
          AI-тлумачення
          <span id="provider-pill" class="provider-pill" style="display:none"></span>
        </p>
        <h2>Цілісне прочитання розкладу</h2>
        <p class="muted">Не просто значення карт окремо — а зв'язки, напруга, порада й наступний крок.</p>
      </div>
      <div class="tone-switcher" id="tone-switcher" aria-label="Тон тлумачення"></div>
    </div>

    <div id="loading-state" class="interpretation-loading" style="display:none">
      <span class="spinner-orb" aria-hidden="true"></span>
      <p>Зчитую взаємодію карт...</p>
    </div>

    <article id="interp-card" class="interpretation-card" style="display:none">
      <div class="interpretation-summary">
        <h3 id="interp-title"></h3>
        <p id="interp-summary"></p>
      </div>
      <div class="interpretation-energy">
        <strong>Загальна енергія</strong>
        <p id="interp-energy"></p>
      </div>
      <div id="interactions-block" class="interpretation-block" style="display:none">
        <h3>Взаємодія карт</h3>
        <ul id="interactions-list"></ul>
      </div>
      <div class="interpretation-grid">
        <div class="interpretation-block">
          <h3>Порада</h3>
          <ul id="advice-list"></ul>
        </div>
        <div class="interpretation-block">
          <h3>Тінь</h3>
          <p id="shadow-text"></p>
        </div>
      </div>
      <div class="next-step">
        <strong>Наступний крок</strong>
        <p id="next-step-text"></p>
      </div>
    </article>

    <div id="refresh-state" class="interpretation-refresh" aria-live="polite" style="display:none">
      <span class="spinner-orb spinner-orb-small" aria-hidden="true"></span>
      <span>Оновлюю тон тлумачення...</span>
    </div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class InterpretationPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._hasSpread = false;
    this._interpretation = null;
    this._loading = false;
    this._tone = 'psychological';
    this._tones = [];
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.updateVisibility();
  }

  set hasSpread(val) {
    this._hasSpread = val;
    this.updateVisibility();
  }

  set interpretation(val) {
    this._interpretation = val;
    this.render();
  }

  set loading(val) {
    this._loading = val;
    this.render();
  }

  set tone(val) {
    this._tone = val;
    this.renderToneButtons();
  }

  set tones(val) {
    this._tones = val;
    this.renderToneButtons();
  }

  updateVisibility() {
    const section = this.shadowRoot.getElementById('interp-section');
    section.style.display = this._hasSpread ? '' : 'none';
  }

  render() {
    this.renderToneButtons();
    this.renderInterpretation();
  }

  renderToneButtons() {
    const container = this.shadowRoot.getElementById('tone-switcher');
    container.innerHTML = '';
    this._tones.forEach((toneOption) => {
      const btn = document.createElement('button');
      btn.className = `tone-button${toneOption.value === this._tone ? ' active' : ''}`;
      btn.type = 'button';
      btn.disabled = this._loading;
      btn.textContent = toneOption.label;
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('set-tone', { detail: toneOption.value }));
      });
      container.appendChild(btn);
    });
  }

  renderInterpretation() {
    const section = this.shadowRoot.getElementById('interp-section');
    section.className = `panel interpretation-panel${this._loading ? ' is-loading' : ''}`;

    const loadingState = this.shadowRoot.getElementById('loading-state');
    const interpCard = this.shadowRoot.getElementById('interp-card');
    const refreshState = this.shadowRoot.getElementById('refresh-state');

    if (this._loading && !this._interpretation) {
      loadingState.style.display = 'grid';
      interpCard.style.display = 'none';
      refreshState.style.display = 'none';
      return;
    }

    loadingState.style.display = 'none';
    refreshState.style.display = this._loading && this._interpretation ? 'flex' : 'none';

    if (!this._interpretation) {
      interpCard.style.display = 'none';
      return;
    }

    interpCard.style.display = 'grid';

    const providerPill = this.shadowRoot.getElementById('provider-pill');
    if (this._interpretation.provider) {
      providerPill.style.display = '';
      providerPill.textContent = this._interpretation.provider === 'llm' ? 'LLM' : 'fallback';
    } else {
      providerPill.style.display = 'none';
    }

    this.shadowRoot.getElementById('interp-title').textContent = this._interpretation.title;
    this.shadowRoot.getElementById('interp-summary').textContent = this._interpretation.summary;
    this.shadowRoot.getElementById('interp-energy').textContent = this._interpretation.energy;

    const interactionsBlock = this.shadowRoot.getElementById('interactions-block');
    const interactionsList = this.shadowRoot.getElementById('interactions-list');
    if (this._interpretation.interactions?.length) {
      interactionsBlock.style.display = '';
      interactionsList.innerHTML = '';
      this._interpretation.interactions.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        interactionsList.appendChild(li);
      });
    } else {
      interactionsBlock.style.display = 'none';
    }

    const adviceList = this.shadowRoot.getElementById('advice-list');
    adviceList.innerHTML = '';
    this._interpretation.advice?.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      adviceList.appendChild(li);
    });

    this.shadowRoot.getElementById('shadow-text').textContent = this._interpretation.shadow;
    this.shadowRoot.getElementById('next-step-text').textContent = this._interpretation.nextStep;
  }
}

customElements.define('interpretation-panel', InterpretationPanel);
