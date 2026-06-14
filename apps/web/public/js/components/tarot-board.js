import { sleep, getTodayTag, getCardMeaning } from '../utils.js';
import { buildSharePreview } from '../share-preview.js';
import { trackEvent, spreadAnalyticsPayload, interpretationAnalyticsPayload } from '../analytics/analytics.js';
import { getFlags, onFlagsChange } from '../analytics/use-features.js';
import { INTERPRETATION_TONES } from '../constants/interpretation.js';
import {
  createShareableSpread, drawSpreadCards, fetchCardOfDay,
  fetchCards, fetchSharedSpread,
  fetchSpreadDefinitions, fetchSpreadInterpretation,
} from '../services/api.js';
import { loadJournal, addEntry, updateEntry, loadFavorites } from '../services/journal-storage.js';

const template = document.createElement('template');
template.innerHTML = `
  <main class="page session-page">
    <div class="ambient-orb orb-one" aria-hidden="true"></div>
    <div class="ambient-orb orb-two" aria-hidden="true"></div>

    <header class="hero hero-ritual" id="hero-header">
      <div class="hero-top">
        <a class="quiet-back-link" href="/" id="back-link">← На головну</a>
        <p class="eyebrow">Тиха сесія</p>
      </div>
      <h1>Почніть з того, що є всередині</h1>
      <p class="subtitle">Сформулюйте думку, яка зараз не відпускає. Оберіть практику — і дозвольте картам стати приводом для спокійної саморефлексії.</p>
      <div class="hero-actions">
        <button class="btn btn-large" type="button" id="scroll-ritual-btn">Зосередитись і обрати практику</button>
        <span class="hero-hint">пауза · символи · м'яка рефлексія · нотатки</span>
      </div>
    </header>

    <auth-panel id="auth-panel"></auth-panel>
    <ritual-selector id="ritual-selector"></ritual-selector>
    <card-of-day-panel id="card-of-day"></card-of-day-panel>
    <spread-board id="spread-board"></spread-board>
    <share-panel id="share-panel" style="display:none"></share-panel>

    <section id="premium-preview" class="panel premium-preview-panel" style="display:none">
      <p class="eyebrow">Попередній перегляд преміум</p>
      <h2>Глибше ШІ-тлумачення</h2>
      <p class="muted">Тут можна тестувати м'який upsell: розширений аналіз, персональні висновки, додаткові тони і довшу історію.</p>
      <button class="btn btn-secondary" type="button" id="premium-preview-btn">Подивитись можливості</button>
    </section>

    <interpretation-panel id="interpretation-panel"></interpretation-panel>
    <tarot-journal id="favorite-journal" title="Книга розкладів"></tarot-journal>
    <tarot-journal id="history-journal" title="Історія розкладів"></tarot-journal>
    <deck-panel id="deck-panel"></deck-panel>
  </main>
`;

import { adoptStyle } from '../shared-styles.js';

export class TarotBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.currentUser = null;
    this.cards = [];
    this.showDeck = false;
    this.deckLoading = false;
    this.spread = [];
    this.spreadDefinitions = [];
    this.activeSpreadType = 'classic3';
    this.cardOfDay = null;
    this.loading = false;
    this.revealKey = 0;
    this.error = '';
    this.copyStatus = '';
    this.interpretation = null;
    this.interpretationLoading = false;
    this.interpretationTone = 'psychological';
    this.selectorCollapsed = false;
    this.boardPulse = false;
    this.spreadHistory = [];
    this.favoriteSpreads = [];
    this.shareResult = null;
    this.sharePreviewUrl = '';
    this.shareLoading = false;
    this.isSharedView = false;

    this._flags = getFlags();
    this.todayLabel = getTodayTag();
    this.interpretationTones = INTERPRETATION_TONES;
  }

  async connectedCallback() {
    await adoptStyle(this);
    this.bindEvents();
    onFlagsChange((flags) => {
      this._flags = flags;
      this.updatePremiumPreview();
    });

    trackEvent('app_opened', {});

    try {
      this.loadLocalUser();
      await this.syncLocalLists();
      await Promise.all([this.loadCardOfDay(), this.loadSpreadDefinitions()]);

      const sharedMatch = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]+)/);
      if (sharedMatch?.[1]) {
        await this.loadSharedView(sharedMatch[1]);
      } else {
        await this.refreshSpread('classic3');
        this.selectorCollapsed = false;
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Сталася помилка';
    }
  }

  loadLocalUser() {
    const name = localStorage.getItem('tarot-nickname') || '';
    if (name) {
      this.currentUser = { name };
    }
    this.updateAuthPanel();
  }

  bindEvents() {
    const root = this.shadowRoot;

    root.getElementById('back-link').addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });

    root.getElementById('scroll-ritual-btn').addEventListener('click', () => {
      trackEvent('ritual_start_clicked');
      root.getElementById('ritual-selector').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    root.getElementById('premium-preview-btn').addEventListener('click', () => {
      trackEvent('premium_preview_clicked', {
        spreadType: this.activeSpreadType,
        hasSpread: Boolean(this.spread.length)
      });
    });

    const authPanel = root.getElementById('auth-panel');
    authPanel.addEventListener('name-changed', (e) => {
      this.currentUser = e.detail.name ? { name: e.detail.name } : null;
      this.syncLocalLists();
    });

    const ritualSelector = root.getElementById('ritual-selector');
    ritualSelector.addEventListener('choose', (e) => this.chooseSpread(e.detail));
    ritualSelector.addEventListener('expand', () => { this.selectorCollapsed = false; });

    const cardOfDayPanel = root.getElementById('card-of-day');
    cardOfDayPanel.addEventListener('image-error', (e) => this.setPlaceholderImage(e.detail));

    const spreadBoard = root.getElementById('spread-board');
    spreadBoard.addEventListener('favorite', () => this.saveFavoriteSpread());
    spreadBoard.addEventListener('copy-spread', () => this.copySpreadText());
    // spreadBoard.addEventListener('share', () => this.shareCurrentSpread()); // TODO: share
    spreadBoard.addEventListener('image-error', (e) => this.setPlaceholderImage(e.detail));

    const interpPanel = root.getElementById('interpretation-panel');
    interpPanel.addEventListener('set-tone', (e) => this.setInterpretationTone(e.detail));

    const favoriteJournal = root.getElementById('favorite-journal');
    favoriteJournal.addEventListener('open', (e) => this.openJournalEntry(e.detail));
    favoriteJournal.addEventListener('save-note', (e) => this.saveJournalNote(e.detail));
    favoriteJournal.addEventListener('image-error', (e) => this.setPlaceholderImage(e.detail));

    const historyJournal = root.getElementById('history-journal');
    historyJournal.addEventListener('open', (e) => this.openJournalEntry(e.detail));
    historyJournal.addEventListener('save-note', (e) => this.saveJournalNote(e.detail));
    historyJournal.addEventListener('image-error', (e) => this.setPlaceholderImage(e.detail));

    const deckPanel = root.getElementById('deck-panel');
    deckPanel.addEventListener('toggle', () => this.toggleDeck());
    deckPanel.addEventListener('image-error', (e) => this.setPlaceholderImage(e.detail));

    const sharePanel = root.getElementById('share-panel');
    sharePanel.addEventListener('copy-url', () => this.copyShareUrl());
    sharePanel.addEventListener('native-share', () => this.nativeShare());
    sharePanel.addEventListener('select-url', (e) => {
      e.detail.target.select();
    });
  }

  updatePremiumPreview() {
    const el = this.shadowRoot.getElementById('premium-preview');
    el.style.display = this._flags.premiumPreview ? '' : 'none';
  }

  setHeroV2(enabled) {
    const hero = this.shadowRoot.getElementById('hero-header');
    hero.classList.toggle('hero-v2', enabled);
  }

  updateAuthPanel() {
    const panel = this.shadowRoot.getElementById('auth-panel');
    if (panel.updateUI) panel.updateUI();
  }

  // Session methods
  async chooseSpread(type) {
    trackEvent('spread_selected', { spreadType: type });
    this.selectorCollapsed = true;
    this.updateRitualSelector();
    await this.refreshSpread(type);
    this.shadowRoot.getElementById('spread-board').scrollIntoView({ behavior: 'smooth' });
    this.boardPulse = true;
    setTimeout(() => { this.boardPulse = false; }, 1100);
  }

  async loadCards() {
    if (this.cards.length || this.deckLoading) return;
    this.deckLoading = true;
    try {
      this.cards = await fetchCards(78);
    } finally {
      this.deckLoading = false;
      this.updateDeckPanel();
    }
  }

  async toggleDeck() {
    this.showDeck = !this.showDeck;
    trackEvent('deck_toggled', { expanded: this.showDeck });
    this.updateDeckPanel();
    if (this.showDeck) await this.loadCards();
  }

  updateDeckPanel() {
    const panel = this.shadowRoot.getElementById('deck-panel');
    panel.cards = this.cards;
    panel.showDeck = this.showDeck;
    panel.loading = this.deckLoading;
  }

  async loadSpreadDefinitions() {
    this.spreadDefinitions = await fetchSpreadDefinitions();
    this.updateRitualSelector();
  }

  setPlaceholderImage(event) {
    const image = event.target;
    if (image.src.endsWith('cards/tarot-placeholder.svg')) return;
    image.src = 'cards/tarot-placeholder.svg';
  }

  async loadCardOfDay() {
    this.cardOfDay = await fetchCardOfDay();
    trackEvent('daily_card_opened', {
      cardId: this.cardOfDay.card.id,
      reversed: this.cardOfDay.reversed
    });
    this.updateCardOfDay();
  }

  updateCardOfDay() {
    const panel = this.shadowRoot.getElementById('card-of-day');
    panel.card = this.cardOfDay;
    panel.todayLabel = this.todayLabel;
    panel.error = this.error;
  }

  updateRitualSelector() {
    const selector = this.shadowRoot.getElementById('ritual-selector');
    selector.definitions = this.spreadDefinitions;
    selector.activeType = this.activeSpreadType;
    selector.collapsed = this.selectorCollapsed;
    selector.loading = this.loading;
  }

  async refreshSpread(type = this.activeSpreadType) {
    this.interpretation = null;
    const definition = this.spreadDefinitions.find((item) => item.id === type);
    this.activeSpreadType = type;
    this.loading = true;
    this.error = '';
    this.copyStatus = '';
    this.shareResult = null;
    this.sharePreviewUrl = '';

    this.updateSpreadBoard();

    try {
      const [drawnCards] = await Promise.all([
        drawSpreadCards(definition?.count ?? 3, type),
        sleep(520)
      ]);
      this.spread = drawnCards;
      this.revealKey += this._flags.enhancedReveal ? 1 : 0;
      trackEvent('reading_generated', spreadAnalyticsPayload(this.spread, this.activeSpreadType));
      await this.generateInterpretation();
      await this.saveSpreadToHistory(this.spread, definition?.title ?? `Розклад на ${this.spread.length} карт`);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Сталася помилка';
    } finally {
      this.loading = false;
      this.updateSpreadBoard();
    }
  }

  updateSpreadBoard() {
    const board = this.shadowRoot.getElementById('spread-board');
    board.spread = this.spread;
    board.activeDefinition = this.spreadDefinitions.find((d) => d.id === this.activeSpreadType);
    board.loading = this.loading;
    board.revealKey = this.revealKey;
    board.boardPulse = this.boardPulse;
    board.copyStatus = this.copyStatus;
    board.shareLoading = this.shareLoading;
    this.updateRitualSelector();
  }

  updateInterpretationPanel() {
    const panel = this.shadowRoot.getElementById('interpretation-panel');
    panel.hasSpread = Boolean(this.spread.length);
    panel.interpretation = this.interpretation;
    panel.loading = this.interpretationLoading;
    panel.tone = this.interpretationTone;
    panel.tones = this.interpretationTones;
  }

  async generateInterpretation() {
    if (!this.spread.length) return;

    this.interpretationLoading = true;
    this.updateInterpretationPanel();

    try {
      this.interpretation = await fetchSpreadInterpretation(this.spread, this.activeSpreadType, this.interpretationTone);
      trackEvent('ai_interpretation_generated', interpretationAnalyticsPayload({
        spread: this.spread,
        spreadType: this.activeSpreadType,
        tone: this.interpretationTone,
        source: this.interpretation.provider,
      }));
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Не вдалося згенерувати тлумачення';
    } finally {
      this.interpretationLoading = false;
      this.updateInterpretationPanel();
    }
  }

  async setInterpretationTone(tone) {
    if (this.interpretationTone === tone) return;
    this.interpretationTone = tone;
    trackEvent('interpretation_tone_changed', { tone });
    await this.generateInterpretation();
  }

  async syncLocalLists() {
    this.spreadHistory = await loadJournal();
    this.favoriteSpreads = await loadFavorites();
    this.updateJournals();
  }

  updateJournals() {
    this.shadowRoot.getElementById('favorite-journal').items = this.favoriteSpreads;
    this.shadowRoot.getElementById('history-journal').items = this.spreadHistory;
  }

  async saveSpreadToHistory(cards, title) {
    if (!cards.length) return;

    const saved = await addEntry({
      title,
      spreadType: this.activeSpreadType,
      cards,
      interpretation: this.interpretation,
      favorite: false
    });

    this.spreadHistory.unshift(saved);
    this.spreadHistory = this.spreadHistory.slice(0, 20);
    this.updateJournals();
  }

  async saveFavoriteSpread() {
    if (!this.spread.length) return;

    try {
      const def = this.spreadDefinitions.find((d) => d.id === this.activeSpreadType);
      const saved = await addEntry({
        title: def?.title ?? 'Обраний розклад',
        spreadType: this.activeSpreadType,
        cards: this.spread,
        interpretation: this.interpretation,
        favorite: true
      });

      this.favoriteSpreads.unshift(saved);
      this.favoriteSpreads = this.favoriteSpreads.slice(0, 12);
      trackEvent('favorite_added', spreadAnalyticsPayload(this.spread, this.activeSpreadType));
      this.copyStatus = 'Розклад додано в обране.';
    } catch (err) {
      this.copyStatus = err instanceof Error ? err.message : 'Не вдалося додати в обране.';
    }
    this.updateSpreadBoard();
    this.updateJournals();
  }

  async openJournalEntry(entry) {
    this.activeSpreadType = entry.spreadType;
    this.spread = entry.cards;
    this.interpretation = entry.interpretation;
    this.selectorCollapsed = true;
    this.shareResult = null;
    this.sharePreviewUrl = '';
    this.copyStatus = 'Розклад відкрито з Книги розкладів.';
    trackEvent('journal_entry_opened', {
      id: entry.id,
      spreadType: entry.spreadType,
      favorite: entry.favorite,
      cardsCount: entry.cards.length
    });
    this.updateSpreadBoard();
    this.updateInterpretationPanel();
    this.updateSharePanel();
    this.shadowRoot.getElementById('spread-board').scrollIntoView({ behavior: 'smooth' });
  }

  async saveJournalNote(payload) {
    try {
      const updated = await updateEntry(payload.id, { note: payload.note });
      if (updated) {
        this.spreadHistory = await loadJournal();
        this.favoriteSpreads = await loadFavorites();
        trackEvent('journal_note_saved', { id: payload.id, noteLength: payload.note.length });
        this.copyStatus = 'Нотатку збережено.';
      }
    } catch (err) {
      this.copyStatus = err instanceof Error ? err.message : 'Не вдалося зберегти нотатку.';
    }
    this.updateSpreadBoard();
  }

  async shareCurrentSpread() {
    if (!this.spread.length) return;

    trackEvent('share_clicked', spreadAnalyticsPayload(this.spread, this.activeSpreadType));

    this.shareLoading = true;
    this.copyStatus = '';

    try {
      const def = this.spreadDefinitions.find((d) => d.id === this.activeSpreadType);
      const title = def?.title ?? 'Мій розклад Таро';
      const result = await createShareableSpread({
        title,
        spreadType: this.activeSpreadType,
        cards: this.spread,
        interpretation: this.interpretation
      });

      this.shareResult = result;
      this.sharePreviewUrl = await buildSharePreview(result);
      trackEvent('share_link_created', {
        slug: result.slug,
        ...spreadAnalyticsPayload(this.spread, this.activeSpreadType)
      });
      this.copyStatus = 'Публічне посилання створено.';
    } catch (err) {
      this.copyStatus = err instanceof Error ? err.message : 'Не вдалося створити посилання для поширення.';
    } finally {
      this.shareLoading = false;
      this.updateSpreadBoard();
      this.updateSharePanel();
    }
  }

  updateSharePanel() {
    const panel = this.shadowRoot.getElementById('share-panel');
    panel.shareResult = this.shareResult;
    panel.previewUrl = this.sharePreviewUrl;
  }

  async copyShareUrl() {
    if (!this.shareResult) return;
    try {
      await navigator.clipboard.writeText(this.shareResult.url);
      trackEvent('share_url_copied', { slug: this.shareResult.slug });
      this.copyStatus = 'Посилання скопійовано.';
    } catch {
      this.copyStatus = 'Не вдалося скопіювати посилання автоматично.';
    }
    this.updateSpreadBoard();
  }

  async nativeShare() {
    if (!this.shareResult) return;

    const payload = {
      title: this.shareResult.social.title,
      text: this.shareResult.social.description,
      url: this.shareResult.url
    };

    if (navigator.share) {
      await navigator.share(payload);
      trackEvent('native_share_completed', { slug: this.shareResult.slug });
      return;
    }

    await this.copyShareUrl();
  }

  async loadSharedView(slug) {
    const shared = await fetchSharedSpread(slug);
    this.isSharedView = true;
    this.activeSpreadType = shared.spreadType;
    this.spread = shared.cards;
    this.interpretation = shared.interpretation;
    this.selectorCollapsed = true;
    this.shareResult = shared;
    this.sharePreviewUrl = await buildSharePreview(shared);
    this.copyStatus = 'Відкрито публічний розклад.';
    trackEvent('shared_spread_opened', {
      slug,
      spreadType: shared.spreadType,
      cardsCount: shared.cards.length
    });
    this.updateSpreadBoard();
    this.updateInterpretationPanel();
    this.updateSharePanel();
  }

  async copySpreadText() {
    if (!this.spread.length) return;

    const def = this.spreadDefinitions.find((d) => d.id === this.activeSpreadType);
    const title = def?.title ?? 'Розклад Таро';
    const text = [
      title,
      ...this.spread.map((item) => [
        `\n${item.position}: ${item.card.name}${item.reversed ? ' (перевернута)' : ''}`,
        item.positionDescription,
        `Ключові слова: ${item.card.keywords.join(', ')}`,
        `Значення: ${getCardMeaning(item)}`
      ].join('\n'))
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      trackEvent('reading_text_copied', spreadAnalyticsPayload(this.spread, this.activeSpreadType));
      this.copyStatus = 'Текст розкладу скопійовано.';
    } catch {
      this.copyStatus = 'Не вдалося скопіювати автоматично.';
    }
    this.updateSpreadBoard();
  }
}

customElements.define('tarot-board', TarotBoard);
