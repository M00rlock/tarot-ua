const template = document.createElement('template');
template.innerHTML = `
  <aside id="share-result" class="share-result" aria-live="polite" style="display:none">
    <div class="share-copy">
      <p class="eyebrow">Публічний розклад</p>
      <h3>Готово до поширення</h3>
      <p class="muted">Створено short URL, social card і PNG preview для месенджерів або соцмереж.</p>
      <div class="share-url-row">
        <input id="share-url" class="share-url" readonly />
        <button id="copy-url-btn" class="btn btn-secondary">Копіювати URL</button>
      </div>
      <div class="share-actions">
        <button id="native-share-btn" class="btn btn-ghost">Системно поділитись</button>
        <a id="download-link" class="btn btn-ghost share-download" download="tarot-spread.png" style="display:none">Завантажити PNG</a>
        <a id="social-link" class="btn btn-ghost share-download" target="_blank" rel="noreferrer" style="display:none">Social card SVG</a>
      </div>
    </div>
    <img id="preview-img" class="share-preview" src="" alt="Прев'ю розкладу для поширення" style="display:none" />
  </aside>
`;

import { adoptStyles } from '../shared-styles.js';

export class SharePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._shareResult = null;
    this._previewUrl = '';
  }

  async connectedCallback() {
    await adoptStyles(this);
    this.shadowRoot.getElementById('copy-url-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('copy-url'));
    });
    this.shadowRoot.getElementById('native-share-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('native-share'));
    });
    this.shadowRoot.getElementById('share-url').addEventListener('focus', (e) => {
      this.dispatchEvent(new CustomEvent('select-url', { detail: e }));
    });
  }

  set shareResult(val) {
    this._shareResult = val;
    const container = this.shadowRoot.getElementById('share-result');
    const urlInput = this.shadowRoot.getElementById('share-url');
    const socialLink = this.shadowRoot.getElementById('social-link');

    if (val) {
      container.style.display = 'grid';
      urlInput.value = val.url;
      socialLink.style.display = '';
      socialLink.href = val.social.imageUrl;
    } else {
      container.style.display = 'none';
    }
  }

  set previewUrl(val) {
    this._previewUrl = val;
    const img = this.shadowRoot.getElementById('preview-img');
    const downloadLink = this.shadowRoot.getElementById('download-link');
    if (val) {
      img.style.display = '';
      img.src = val;
      downloadLink.style.display = '';
      downloadLink.href = val;
    } else {
      img.style.display = 'none';
      downloadLink.style.display = 'none';
    }
  }
}

customElements.define('share-panel', SharePanel);
