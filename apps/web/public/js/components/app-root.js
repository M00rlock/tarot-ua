import { initAnalytics, trackEvent } from '../analytics/analytics.js';
import { refreshFeatureFlags } from '../analytics/use-features.js';

const template = document.createElement('template');
template.innerHTML = `<div id="outlet"></div>`;

import { adoptStyles } from '../shared-styles.js';

export class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._currentPage = null;
    this._currentRoute = null;
  }

  async connectedCallback() {
    await adoptStyles(this);
    window.navigateTo = (path) => {
      window.history.pushState({}, '', path);
      this.route();
    };

    window.addEventListener('popstate', () => this.route());

    void initAnalytics();
    void refreshFeatureFlags();

    this.route();
  }

  route() {
    const path = window.location.pathname;
    let route;

    const meaningMatch = path.match(/^\/meaning\/([A-Za-z0-9_-]+)\/?$/);
    if (meaningMatch?.[1]) {
      route = { kind: 'meaning', slug: meaningMatch[1] };
    }

    const spreadMatch = path.match(/^\/spreads\/([A-Za-z0-9_-]+)\/?$/);
    if (spreadMatch?.[1]) {
      route = { kind: 'spread', slug: spreadMatch[1] };
    }

    if (path === '/session' || path === '/session/') route = { kind: 'session', slug: '' };
    if (path === '/fast-session' || path === '/fast-session/') route = { kind: 'fast-session', slug: '' };
    if (path === '/journal' || path === '/journal/') route = { kind: 'journal', slug: '' };
    if (path === '/library' || path === '/library/') route = { kind: 'library', slug: '' };
    if (path === '/' || path === '') route = { kind: 'home', slug: '' };

    if (path.match(/^\/share\/([A-Za-z0-9_-]+)/)) {
      route = { kind: 'session', slug: '' };
    }

    if (!route) route = { kind: 'home', slug: '' };

    if (this._currentRoute?.kind === route.kind && this._currentRoute?.slug === route.slug) return;
    this._currentRoute = route;

    this.renderPage(route);
  }

  renderPage(route) {
    const outlet = this.shadowRoot.getElementById('outlet');
    outlet.innerHTML = '';

    let element;
    switch (route.kind) {
      case 'meaning':
        element = document.createElement('seo-card-page');
        element.setAttribute('slug', route.slug);
        break;
      case 'spread':
        element = document.createElement('seo-spread-page');
        element.setAttribute('slug', route.slug);
        break;
      case 'session':
        element = document.createElement('tarot-board');
        break;
      case 'fast-session':
        element = document.createElement('fast-session');
        break;
      case 'journal':
        element = document.createElement('journal-page');
        break;
      case 'library':
        element = document.createElement('library-page');
        break;
      default:
        element = document.createElement('home-page');
    }

    outlet.appendChild(element);
  }
}

customElements.define('app-root', AppRoot);
