const template = document.createElement('template');
template.innerHTML = `
  <section class="panel auth-panel">
    <div id="auth-card" class="auth-card">
      <div>
        <p class="eyebrow">Cloud sync</p>
        <h2 id="auth-title">Увійти в кабінет</h2>
        <p class="muted">JWT-сесія, PostgreSQL-історія, обране та premium-ready профіль.</p>
      </div>
      <div class="auth-grid">
        <input id="name-input" class="auth-input" placeholder="Ваше ім'я" style="display:none" />
        <input id="email-input" class="auth-input" placeholder="Email" autocomplete="email" />
        <input id="password-input" class="auth-input" placeholder="Пароль" type="password" autocomplete="current-password" />
        <button id="submit-btn" class="btn">Увійти</button>
        <button id="toggle-btn" class="btn btn-ghost" type="button">Створити акаунт</button>
      </div>
    </div>
    <div id="auth-user" class="auth-user" style="display:none">
      <div>✨ Привіт, <strong id="user-name"></strong> <span id="premium-pill" class="premium-pill"></span></div>
      <button id="logout-btn" class="btn btn-secondary">Вийти</button>
    </div>
  </section>
`;

import { adoptStyles } from '../shared-styles.js';

export class AuthPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._mode = 'login';
    this._user = null;
    this._loading = false;
    this._form = { name: '', email: '', password: '' };
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.getElementById('submit-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('submit-auth'));
    });

    this.shadowRoot.getElementById('toggle-btn').addEventListener('click', () => {
      this._mode = this._mode === 'login' ? 'register' : 'login';
      this.updateUI();
      this.dispatchEvent(new CustomEvent('toggle-auth-mode'));
    });

    this.shadowRoot.getElementById('logout-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('logout'));
    });

    ['name', 'email', 'password'].forEach((field) => {
      const input = this.shadowRoot.getElementById(`${field}-input`);
      if (!input) return;
      input.addEventListener('input', (e) => {
        this._form[field] = e.target.value;
        this.dispatchEvent(new CustomEvent('update-form', { detail: { ...this._form } }));
      });
      input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') this.dispatchEvent(new CustomEvent('submit-auth'));
      });
    });
  }

  set user(val) {
    this._user = val;
    this.updateUI();
  }

  set mode(val) {
    this._mode = val;
    this.updateUI();
  }

  set loading(val) {
    this._loading = val;
    const btn = this.shadowRoot.getElementById('submit-btn');
    btn.disabled = val;
  }

  set form(val) {
    this._form = { ...val };
    ['name', 'email', 'password'].forEach((field) => {
      const input = this.shadowRoot.getElementById(`${field}-input`);
      if (input) input.value = val[field] || '';
    });
    this.updateUI();
  }

  updateUI() {
    const authCard = this.shadowRoot.getElementById('auth-card');
    const authUser = this.shadowRoot.getElementById('auth-user');
    const nameInput = this.shadowRoot.getElementById('name-input');

    if (this._user) {
      authCard.style.display = 'none';
      authUser.style.display = 'flex';
      this.shadowRoot.getElementById('user-name').textContent = this._user.name;
      const pill = this.shadowRoot.getElementById('premium-pill');
      pill.textContent = this._user.premiumTier === 'premium' ? 'Premium' : 'Free';
      return;
    }

    authCard.style.display = 'block';
    authUser.style.display = 'none';

    const title = this.shadowRoot.getElementById('auth-title');
    const submitBtn = this.shadowRoot.getElementById('submit-btn');
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');

    if (this._mode === 'login') {
      title.textContent = 'Увійти в кабінет';
      submitBtn.textContent = 'Увійти';
      toggleBtn.textContent = 'Створити акаунт';
      nameInput.style.display = 'none';
    } else {
      title.textContent = 'Створити кабінет';
      submitBtn.textContent = 'Зареєструватись';
      toggleBtn.textContent = 'Вже маю акаунт';
      nameInput.style.display = 'block';
    }

    submitBtn.disabled = this._loading;
  }
}

customElements.define('auth-panel', AuthPanel);
