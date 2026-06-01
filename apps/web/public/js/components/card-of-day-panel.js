import { cardMeaning } from '../utils.js';

const template = document.createElement('template');
template.innerHTML = `
  <section class="panel">
    <h2>Карта дня</h2>
    <p id="today-label" class="muted"></p>
    <p id="error-msg" class="error" style="display:none"></p>
    <article id="card-day" class="card-day" style="display:none">
      <img id="card-image" class="card-image" src="" alt="" loading="lazy" decoding="async" />
      <div>
        <p id="position" class="position"></p>
        <h3 id="card-name"></h3>
        <p id="position-hint" class="position-hint"></p>
        <p id="keywords" class="keywords"></p>
        <p id="meaning"></p>
      </div>
    </article>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class CardOfDayPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._card = null;
    this._error = '';
  }

  async connectedCallback() {
    await adoptStyles(this);
    const img = this.shadowRoot.getElementById('card-image');
    img.addEventListener('error', (e) => {
      this.dispatchEvent(new CustomEvent('image-error', { detail: e }));
    });
  }

  set card(val) {
    this._card = val;
    this.render();
  }

  set todayLabel(val) {
    this.shadowRoot.getElementById('today-label').textContent = val;
  }

  set error(val) {
    this._error = val;
    const errorEl = this.shadowRoot.getElementById('error-msg');
    if (val) {
      errorEl.textContent = val;
      errorEl.style.display = '';
    } else {
      errorEl.style.display = 'none';
    }
  }

  render() {
    const cardDay = this.shadowRoot.getElementById('card-day');
    if (!this._card) {
      cardDay.style.display = 'none';
      return;
    }
    cardDay.style.display = 'grid';

    const img = this.shadowRoot.getElementById('card-image');
    img.src = this._card.card.image;
    img.alt = this._card.card.name;
    img.className = 'card-image' + (this._card.reversed ? ' is-reversed' : '');

    this.shadowRoot.getElementById('position').textContent = this._card.position;
    this.shadowRoot.getElementById('card-name').innerHTML = `${this._card.card.name}${this._card.reversed ? ' <span>(перевернута)</span>' : ''}`;
    this.shadowRoot.getElementById('position-hint').textContent = this._card.positionDescription;
    this.shadowRoot.getElementById('keywords').textContent = this._card.card.keywords.join(' · ');
    this.shadowRoot.getElementById('meaning').textContent = cardMeaning(this._card);
  }
}

customElements.define('card-of-day-panel', CardOfDayPanel);
