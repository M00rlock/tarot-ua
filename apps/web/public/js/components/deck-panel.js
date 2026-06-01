const template = document.createElement('template');
template.innerHTML = `
  <section class="panel deck-panel">
    <div class="section-head">
      <div>
        <h2 id="deck-title">Колода (78 карт)</h2>
        <p class="muted">Завантажується тільки за потреби, щоб перший екран був швидшим.</p>
      </div>
      <button id="toggle-btn" class="btn btn-ghost" type="button">Показати колоду</button>
    </div>
    <ul id="deck-list" class="deck-list" style="display:none"></ul>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class DeckPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._cards = [];
    this._showDeck = false;
    this._loading = false;
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.getElementById('toggle-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    });
  }

  set cards(val) {
    this._cards = val;
    this.shadowRoot.getElementById('deck-title').textContent = `Колода (${val.length} карт)`;
    if (this._showDeck) this.renderDeck();
  }

  set showDeck(val) {
    this._showDeck = val;
    const list = this.shadowRoot.getElementById('deck-list');
    const btn = this.shadowRoot.getElementById('toggle-btn');
    list.style.display = val ? '' : 'none';
    btn.textContent = val ? 'Сховати колоду' : this._loading ? 'Завантажую...' : 'Показати колоду';
    if (val && this._cards.length) this.renderDeck();
  }

  set loading(val) {
    this._loading = val;
    const btn = this.shadowRoot.getElementById('toggle-btn');
    if (!this._showDeck) btn.textContent = val ? 'Завантажую...' : 'Показати колоду';
    btn.disabled = val;
  }

  renderDeck() {
    const list = this.shadowRoot.getElementById('deck-list');
    list.innerHTML = '';
    this._cards.forEach((card) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      img.className = 'deck-thumb';
      img.src = card.image;
      img.alt = card.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', (e) => {
        this.dispatchEvent(new CustomEvent('image-error', { detail: e }));
      });

      const div = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = card.name;
      const span = document.createElement('span');
      span.textContent = card.keywords.join(', ');
      div.appendChild(strong);
      div.appendChild(span);

      li.appendChild(img);
      li.appendChild(div);
      list.appendChild(li);
    });
  }
}

customElements.define('deck-panel', DeckPanel);
