const template = document.createElement('template');
template.innerHTML = `
  <main class="quiet-page quiet-home">
    <app-nav></app-nav>

    <section class="quiet-hero" aria-labelledby="home-title">
      <p class="quiet-kicker">Простір для тихих роздумів</p>
      <h1 id="home-title">Що зараз у вас всередині?</h1>
      <p class="quiet-lead">
        Іноді достатньо зупинитись на кілька хвилин, щоб краще почути себе.
        Карти, нотатки та м'які ШІ-рефлексії допоможуть сповільнитись і подивитись на свій стан уважніше.
      </p>

      <div class="quiet-actions">
        <a class="quiet-btn quiet-btn-primary" href="/session">Почати тиху сесію</a>
        <a class="quiet-btn quiet-btn-ghost" href="/journal">Відкрити щоденник</a>
      </div>
    </section>

    <section class="quiet-intro-grid" aria-label="Що тут можна зробити">
      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">☾</span>
        <h2>Сповільнитись</h2>
        <p>Зробити невелику паузу, сформулювати думку і повернути увагу до себе.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✧</span>
        <h2>Подивитись уважніше</h2>
        <p>Карти працюють як символи: не дають готових відповідей, а допомагають побачити внутрішній стан.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✍</span>
        <h2>Зберегти думки</h2>
        <p>Кожна сесія може стати записом у щоденнику, до якого можна повернутись пізніше.</p>
      </article>
    </section>
  </main>
`;

import { adoptStyles } from '../shared-styles.js';

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigateTo(a.getAttribute('href'));
      });
    });
  }
}

customElements.define('home-page', HomePage);
