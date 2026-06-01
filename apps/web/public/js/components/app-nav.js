const template = document.createElement('template');
template.innerHTML = `
  <nav class="quiet-nav" aria-label="Основна навігація">
    <a class="quiet-brand" href="/" aria-label="На головну">
      <span class="quiet-brand-mark" aria-hidden="true">✦</span>
      <span>Tarot UA</span>
    </a>
    <div class="quiet-nav-links">
      <a href="/session">Сесія</a>
      <a href="/journal">Щоденник</a>
      <a href="/library">Карти</a>
    </div>
  </nav>
`;

import { adoptStyles } from '../shared-styles.js';

export class AppNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyles(this);
  }
}

customElements.define('app-nav', AppNav);
