import { getCardMeaning } from '../utils.js';
import { CARD_REVEAL_DELAY_STEP, DETAIL_REVEAL_OFFSET, DETAIL_REVEAL_DELAY_STEP } from '../constants/animations.js';

const template = document.createElement('template');
template.innerHTML = `
  <section id="board-section" class="panel board-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Розкриття карт</p>
        <h2>Поточний розклад</h2>
        <p id="active-title" class="muted"></p>
      </div>
      <div id="section-actions" class="section-actions" style="display:none">
        <button id="fav-btn" class="btn btn-secondary">★ В обране</button>
        <button id="copy-btn" class="btn btn-ghost">Копіювати текст</button>
        <button id="share-btn" class="btn btn-share">📸 Поділитись</button>
      </div>
    </div>

    <div id="shuffle-state" class="shuffle-stage" aria-live="polite" style="display:none">
      <div class="shuffle-stack" aria-hidden="true">
        <span class="shuffle-card" style="--shuffle-index: 0"></span>
        <span class="shuffle-card" style="--shuffle-index: 1"></span>
        <span class="shuffle-card" style="--shuffle-index: 2"></span>
        <span class="shuffle-card" style="--shuffle-index: 3"></span>
        <span class="shuffle-card" style="--shuffle-index: 4"></span>
      </div>
      <p class="muted">Перемішую колоду...</p>
    </div>

    <div id="spread-3" class="spread-grid-3" style="display:none"></div>
    <div id="spread-5" class="spread-layout-clean" style="display:none"></div>
    <p id="empty-state" class="muted">Обери тип розкладу й натисни кнопку.</p>
    <p id="copy-status" class="success" style="display:none"></p>
  </section>
`;

import { adoptStyle } from '../shared-styles.js';

export class SpreadBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._spread = [];
    this._activeDefinition = null;
    this._loading = false;
    this._revealKey = 0;
    this._boardPulse = false;
    this._copyStatus = '';
    this._shareLoading = false;
  }

  async connectedCallback() {
    await adoptStyle(this);
    this.shadowRoot.getElementById('fav-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('favorite'));
    });
    this.shadowRoot.getElementById('copy-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('copy-spread'));
    });
    this.shadowRoot.getElementById('share-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('share'));
    });
  }

  set spread(val) {
    this._spread = val;
    this.render();
  }

  set activeDefinition(val) {
    this._activeDefinition = val;
    this.shadowRoot.getElementById('active-title').textContent = val?.title || '';
  }

  set loading(val) {
    this._loading = val;
    this.render();
  }

  set revealKey(val) { this._revealKey = val; }
  set boardPulse(val) { this._boardPulse = val; this.renderPulse(); }
  set copyStatus(val) {
    this._copyStatus = val;
    const el = this.shadowRoot.getElementById('copy-status');
    if (val) {
      el.textContent = val;
      el.style.display = '';
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    } else {
      el.style.display = 'none';
    }
  }
  set shareLoading(val) {
    this._shareLoading = val;
    this.shadowRoot.getElementById('share-btn').disabled = val;
  }

  scrollIntoView() {
    this.shadowRoot.getElementById('board-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderPulse() {
    const section = this.shadowRoot.getElementById('board-section');
    section.classList.toggle('board-focus', this._boardPulse);
  }

  render() {
    const shuffleState = this.shadowRoot.getElementById('shuffle-state');
    const spread3 = this.shadowRoot.getElementById('spread-3');
    const spread5 = this.shadowRoot.getElementById('spread-5');
    const emptyState = this.shadowRoot.getElementById('empty-state');
    const actions = this.shadowRoot.getElementById('section-actions');

    if (this._loading) {
      shuffleState.style.display = 'grid';
      spread3.style.display = 'none';
      spread5.style.display = 'none';
      emptyState.style.display = 'none';
      return;
    }

    shuffleState.style.display = 'none';

    if (this._spread.length === 3) {
      spread3.style.display = 'grid';
      spread5.style.display = 'none';
      emptyState.style.display = 'none';
      actions.style.display = '';
      this.renderSpread3(spread3);
    } else if (this._spread.length === 5) {
      spread3.style.display = 'none';
      spread5.style.display = '';
      emptyState.style.display = 'none';
      actions.style.display = '';
      this.renderSpread5(spread5);
    } else {
      spread3.style.display = 'none';
      spread5.style.display = 'none';
      emptyState.style.display = '';
      actions.style.display = 'none';
    }
  }

  renderSpread3(container) {
    container.innerHTML = '';
    this._spread.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'card-item';
      article.style = `--reveal-delay: ${index * CARD_REVEAL_DELAY_STEP}ms`;

      const visual = document.createElement('div');
      visual.className = 'card-visual animated-card';
      const img = document.createElement('img');
      img.className = `card-image${item.reversed ? ' is-reversed' : ''}`;
      img.src = item.card.image;
      img.alt = item.card.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', (e) => this.dispatchEvent(new CustomEvent('image-error', { detail: e })));
      visual.appendChild(img);

      if (item.reversed) {
        const badge = document.createElement('span');
        badge.className = 'reversed-badge';
        badge.textContent = '↻ перевернута';
        visual.appendChild(badge);
      }

      article.appendChild(visual);

      const pPos = document.createElement('p');
      pPos.className = 'position';
      pPos.textContent = item.position;
      article.appendChild(pPos);

      const pHint = document.createElement('p');
      pHint.className = 'position-hint';
      pHint.textContent = item.positionDescription;
      article.appendChild(pHint);

      const h3 = document.createElement('h3');
      h3.textContent = item.card.name;
      article.appendChild(h3);

      const pKey = document.createElement('p');
      pKey.className = 'keywords';
      pKey.textContent = item.card.keywords.join(' · ');
      article.appendChild(pKey);

      const pMean = document.createElement('p');
      pMean.className = 'meaning';
      pMean.textContent = getCardMeaning(item);
      article.appendChild(pMean);

      container.appendChild(article);
    });
  }

  renderSpread5(container) {
    container.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'spread-board-clean';
    board.setAttribute('aria-label', 'Пентаграма розкладу');

    this._spread.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = `board-slot position-${index}`;
      slot.style = `--reveal-delay: ${index * CARD_REVEAL_DELAY_STEP}ms`;

      const frame = document.createElement('div');
      frame.className = 'board-card-frame animated-card';
      const img = document.createElement('img');
      img.className = `board-card-image${item.reversed ? ' is-reversed' : ''}`;
      img.src = item.card.image;
      img.alt = item.card.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', (e) => this.dispatchEvent(new CustomEvent('image-error', { detail: e })));
      frame.appendChild(img);

      if (item.reversed) {
        const badge = document.createElement('span');
        badge.className = 'board-reversed';
        badge.textContent = '↻';
        frame.appendChild(badge);
      }

      slot.appendChild(frame);

      const caption = document.createElement('div');
      caption.className = 'board-caption';
      caption.innerHTML = `
        <strong>${index + 1}. ${item.position}</strong>
        <span>${item.card.name}</span>
      `;
      slot.appendChild(caption);

      board.appendChild(slot);
    });

    container.appendChild(board);

    const details = document.createElement('div');
    details.className = 'spread-details-clean';

    this._spread.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'detail-row reveal-detail';
      row.style = `--reveal-delay: ${DETAIL_REVEAL_OFFSET + index * DETAIL_REVEAL_DELAY_STEP}ms`;

      const num = document.createElement('span');
      num.className = 'detail-number';
      num.textContent = String(index + 1);
      row.appendChild(num);

      const div = document.createElement('div');
      const posP = document.createElement('p');
      posP.className = 'position';
      posP.innerHTML = `${item.position}${item.reversed ? ' <span class="inline-reversed">/ перевернута</span>' : ''}`;
      div.appendChild(posP);

      const hintP = document.createElement('p');
      hintP.className = 'position-hint';
      hintP.textContent = item.positionDescription;
      div.appendChild(hintP);

      const h3 = document.createElement('h3');
      h3.textContent = item.card.name;
      div.appendChild(h3);

      const keyP = document.createElement('p');
      keyP.className = 'keywords';
      keyP.textContent = item.card.keywords.join(' · ');
      div.appendChild(keyP);

      const meanP = document.createElement('p');
      meanP.className = 'meaning';
      meanP.textContent = getCardMeaning(item);
      div.appendChild(meanP);

      row.appendChild(div);
      details.appendChild(row);
    });

    container.appendChild(details);
  }
}

customElements.define('spread-board', SpreadBoard);
