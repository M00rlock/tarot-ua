const template = document.createElement('template');
template.innerHTML = `
  <section class="panel auth-panel">
    <div id="auth-card" class="auth-card">
      <div>
        <p class="eyebrow">Профіль</p>
        <h2>Ваше ім'я</h2>
        <p class="muted">Як до вас звертатись? Ім'я зберігається локально.</p>
      </div>
      <div class="auth-grid">
        <input id="name-input" class="auth-input" placeholder="Нікнейм" maxlength="30" />
        <button id="save-btn" class="btn">Почати</button>
      </div>
    </div>
    <div id="auth-user" class="auth-user" style="display:none">
      <div>Привіт, <strong id="user-name"></strong></div>
      <button id="change-btn" class="btn btn-secondary">Змінити ім'я</button>
    </div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class AuthPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._name = localStorage.getItem('tarot-nickname') || '';
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.updateUI();

    this.shadowRoot.getElementById('save-btn').addEventListener('click', () => {
      this.saveName();
    });

    this.shadowRoot.getElementById('name-input').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.saveName();
    });

    this.shadowRoot.getElementById('change-btn').addEventListener('click', () => {
      localStorage.removeItem('tarot-nickname');
      this._name = '';
      this.updateUI();
      this.dispatchEvent(new CustomEvent('name-changed', { detail: { name: '' } }));
    });
  }

  saveName() {
    const input = this.shadowRoot.getElementById('name-input');
    const name = input.value.trim();
    if (!name) return;
    localStorage.setItem('tarot-nickname', name);
    this._name = name;
    this.updateUI();
    this.dispatchEvent(new CustomEvent('name-changed', { detail: { name } }));
  }

  updateUI() {
    const authCard = this.shadowRoot.getElementById('auth-card');
    const authUser = this.shadowRoot.getElementById('auth-user');

    if (this._name) {
      authCard.style.display = 'none';
      authUser.style.display = 'flex';
      this.shadowRoot.getElementById('user-name').textContent = this._name;
    } else {
      authCard.style.display = 'block';
      authUser.style.display = 'none';
      this.shadowRoot.getElementById('name-input').value = '';
      this.shadowRoot.getElementById('name-input').focus();
    }
  }
}

customElements.define('auth-panel', AuthPanel);
