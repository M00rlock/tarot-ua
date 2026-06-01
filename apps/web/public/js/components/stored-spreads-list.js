const template = document.createElement('template');
template.innerHTML = `
  <section class="panel" style="display:none">
    <h2 id="list-title"></h2>
    <div id="history-list" class="history-list"></div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class StoredSpreadsList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.render();
  }

  static get observedAttributes() { return ['title', 'items']; }

  attributeChangedCallback() { this.render(); }

  set title(val) { this.setAttribute('title', val); }
  set items(val) { this._items = val; this.render(); }

  render() {
    const items = this._items || [];
    const section = this.shadowRoot.querySelector('section');
    const title = this.shadowRoot.getElementById('list-title');
    const list = this.shadowRoot.getElementById('history-list');

    title.textContent = this.getAttribute('title') || '';

    if (!items.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    list.innerHTML = '';
    items.forEach((entry) => {
      const article = document.createElement('article');
      article.className = 'history-item';
      article.innerHTML = `
        <div class="history-head">
          <strong>${entry.title}</strong>
          <span>${entry.date}</span>
        </div>
        <div class="history-cards">
          ${entry.cards.map((c) => `<span>${c}</span>`).join('')}
        </div>
      `;
      list.appendChild(article);
    });
  }
}

customElements.define('stored-spreads-list', StoredSpreadsList);
