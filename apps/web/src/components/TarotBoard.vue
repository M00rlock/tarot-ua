<template>
  <main class="page">
    <div class="ambient-orb orb-one" aria-hidden="true"></div>
    <div class="ambient-orb orb-two" aria-hidden="true"></div>

    <header class="hero hero-ritual" :class="{ 'hero-v2': flags.mysticHeroV2 }">
      <div class="hero-top">
        <p class="eyebrow">Пет-проєкт для портфоліо</p>
        <button class="theme-toggle" type="button" @click="toggleTheme">{{ theme === 'dark' ? '☀️ Світла тема' : '🌙 Mystic тема' }}</button>
      </div>
      <h1>Таро Черіот</h1>
      <p class="subtitle">{{ flags.mysticHeroV2 ? 'Сформулюйте питання подумки. Оберіть розклад — і нехай карти покажуть прихований вектор.' : 'Зосередьтесь на своєму питанні. Оберіть ритуал — і карти відкриються у правильному ритмі.' }}</p>
      <div class="hero-actions">
        <button class="btn btn-large" type="button" @click="scrollToRitual">Розпочати розклад</button>
        <span class="hero-hint">3–5 карт · перевернуті значення · історія</span>
      </div>
    </header>

    <AuthPanel
      v-model:form="authForm"
      :user="currentUser"
      :mode="authMode"
      :loading="authLoading"
      @submit="submitAuth"
      @toggle-mode="toggleAuthMode"
      @logout="logout"
    />

    <RitualSelector
      ref="ritualSection"
      :definitions="spreadDefinitions"
      :active-type="activeSpreadType"
      :collapsed="selectorCollapsed"
      :loading="loading"
      @choose="chooseSpread"
      @expand="selectorCollapsed = false"
    />

    <CardOfDayPanel
      :card="cardOfDay"
      :today-label="todayLabel"
      :error="error"
      @image-error="setPlaceholderImage"
    />

    <SpreadBoard
      ref="boardSection"
      :spread="spread"
      :active-definition="activeSpreadDefinition"
      :loading="loading"
      :reveal-key="revealKey"
      :board-pulse="boardPulse"
      :copy-status="copyStatus"
      :share-loading="shareLoading"
      @favorite="saveFavoriteSpread"
      @copy="copySpreadText"
      @share="shareCurrentSpread"
      @image-error="setPlaceholderImage"
    />

    <SharePanel
      :share-result="shareResult"
      :preview-url="sharePreviewUrl"
      @copy-url="copyShareUrl"
      @native-share="nativeShare"
      @select-url="selectShareUrl"
    />

    <section v-if="flags.premiumPreview" class="panel premium-preview-panel">
      <p class="eyebrow">Premium preview</p>
      <h2>Глибше AI-тлумачення</h2>
      <p class="muted">Тут можна тестувати м’який upsell: розширений аналіз, персональні висновки, додаткові тони і довшу історію.</p>
      <button class="btn btn-secondary" type="button" @click="trackPremiumPreviewClick">Подивитись можливості</button>
    </section>

    <InterpretationPanel
      :has-spread="Boolean(spread.length)"
      :interpretation="interpretation"
      :loading="interpretationLoading"
      :tone="interpretationTone"
      :tones="interpretationTones"
      @set-tone="setInterpretationTone"
    />

    <TarotJournal
      title="Книга розкладів"
      :items="favoriteSpreads"
      @open="openJournalEntry"
      @save-note="saveJournalNote"
      @image-error="setPlaceholderImage"
    />
    <TarotJournal
      title="Історія розкладів"
      :items="spreadHistory"
      @open="openJournalEntry"
      @save-note="saveJournalNote"
      @image-error="setPlaceholderImage"
    />

    <DeckPanel
      :cards="cards"
      :show-deck="showDeck"
      :loading="deckLoading"
      @toggle="toggleDeck"
      @image-error="setPlaceholderImage"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import AuthPanel from './AuthPanel.vue';
import CardOfDayPanel from './CardOfDayPanel.vue';
import DeckPanel from './DeckPanel.vue';
import InterpretationPanel from './InterpretationPanel.vue';
import RitualSelector from './RitualSelector.vue';
import SharePanel from './SharePanel.vue';
import SpreadBoard from './SpreadBoard.vue';
import TarotJournal from './TarotJournal.vue';
import { clearAccessToken, createShareableSpread, drawSpread, fetchCardOfDay, fetchCards, fetchCloudSpreads, fetchProfile, fetchSharedSpread, fetchSpreadDefinitions, fetchSpreadInterpretation, getAccessToken, loginUser, registerUser, saveCloudSpread, updateCloudSpreadNote } from '../services/api';
import { buildSharePreview } from '../sharePreview';
import { cardMeaning } from '../utils';
import { identifyUser, interpretationAnalyticsPayload, resetAnalyticsUser, spreadAnalyticsPayload, trackEvent } from '../analytics/useAnalytics';
import { useFeatures } from '../analytics/useFeatures';
import type { AuthUser, CloudSpread, DrawnCard, InterpretationTone, SharedSpread, SpreadDefinition, SpreadInterpretation, SpreadType, TarotCard } from '../types';


const cards = ref<TarotCard[]>([]);
const showDeck = ref(false);
const deckLoading = ref(false);
const spread = ref<DrawnCard[]>([]);
const spreadDefinitions = ref<SpreadDefinition[]>([]);
const activeSpreadType = ref<SpreadType>('classic3');
const cardOfDay = ref<DrawnCard | null>(null);
const loading = ref(false);
const revealKey = ref(0);
const error = ref('');
const copyStatus = ref('');
const interpretation = ref<SpreadInterpretation | null>(null);
const interpretationLoading = ref(false);
const interpretationTone = ref<InterpretationTone>('psychological');
const ritualSection = ref<HTMLElement | null>(null);
const boardSection = ref<HTMLElement | null>(null);
const selectorCollapsed = ref(false);
const boardPulse = ref(false);
const currentUser = ref<AuthUser | null>(null);
const theme = ref<'dark' | 'light'>((localStorage.getItem('tarot-theme') as 'dark' | 'light') || 'dark');
const authMode = ref<'login' | 'register'>('login');
const authLoading = ref(false);
const authForm = ref({ name: '', email: '', password: '' });
const spreadHistory = ref<CloudSpread[]>([]);
const favoriteSpreads = ref<CloudSpread[]>([]);
const shareResult = ref<SharedSpread | null>(null);
const sharePreviewUrl = ref('');
const shareLoading = ref(false);
const isSharedView = ref(false);
const { flags } = useFeatures();

const activeSpreadDefinition = computed(() => spreadDefinitions.value.find((item) => item.id === activeSpreadType.value));

const interpretationTones: Array<{ value: InterpretationTone; label: string }> = [
  { value: 'psychological', label: 'Психологічно' },
  { value: 'mystic', label: 'Містично' },
  { value: 'practical', label: 'Практично' }
];

function scrollToRitual() {
  trackEvent('ritual_start_clicked');
  ritualSection.value?.scrollIntoView();
}

async function chooseSpread(type: SpreadType) {
  trackEvent('spread_selected', { spreadType: type });
  selectorCollapsed.value = true;
  await refreshSpread(type);
  await nextTick();
  boardSection.value?.scrollIntoView();
  boardPulse.value = true;
  window.setTimeout(() => {
    boardPulse.value = false;
  }, 1100);
}

const todayLabel = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'full'
}).format(new Date());

function applyTheme() {
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem('tarot-theme', theme.value);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme();
  trackEvent('theme_changed', { theme: theme.value });
}


async function syncUserLists() {
  if (!currentUser.value) {
    spreadHistory.value = [];
    favoriteSpreads.value = [];
    return;
  }

  const [history, favorites] = await Promise.all([
    fetchCloudSpreads(),
    fetchCloudSpreads(true)
  ]);

  spreadHistory.value = history;
  favoriteSpreads.value = favorites;
}

async function loadCards() {
  if (cards.value.length || deckLoading.value) return;

  deckLoading.value = true;
  try {
    cards.value = await fetchCards(78);
  } finally {
    deckLoading.value = false;
  }
}

async function toggleDeck() {
  showDeck.value = !showDeck.value;
  trackEvent('deck_toggled', { expanded: showDeck.value });
  if (showDeck.value) {
    await loadCards();
  }
}

async function loadSpreadDefinitions() {
  spreadDefinitions.value = await fetchSpreadDefinitions();
}

function setPlaceholderImage(event: Event) {
  const image = event.target as HTMLImageElement;

  if (image.src.endsWith('/cards/tarot-placeholder.svg')) {
    return;
  }

  image.src = '/cards/tarot-placeholder.svg';
}

async function loadCardOfDay() {
  cardOfDay.value = await fetchCardOfDay();
  trackEvent('daily_card_opened', {
    cardId: cardOfDay.value.card.id,
    reversed: cardOfDay.value.reversed
  });
}

async function refreshSpread(type: SpreadType = activeSpreadType.value) {
  interpretation.value = null;
  const definition = spreadDefinitions.value.find((item) => item.id === type);
  activeSpreadType.value = type;
  loading.value = true;
  error.value = '';
  copyStatus.value = '';
  shareResult.value = null;
  sharePreviewUrl.value = '';

  try {
    const [drawnCards] = await Promise.all([
      drawSpread(definition?.count ?? 3, type),
      delay(520)
    ]);
    spread.value = drawnCards;
    revealKey.value += flags.value.enhancedReveal ? 1 : 0;
    trackEvent('reading_generated', spreadAnalyticsPayload(spread.value, activeSpreadType.value));
    await generateInterpretation();
    await saveSpreadToHistory(spread.value, definition?.title ?? `Розклад на ${spread.value.length} карт`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  } finally {
    loading.value = false;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}


async function generateInterpretation() {
  if (!spread.value.length) return;

  interpretationLoading.value = true;

  try {
    interpretation.value = await fetchSpreadInterpretation(spread.value, activeSpreadType.value, interpretationTone.value);
    trackEvent('ai_interpretation_generated', interpretationAnalyticsPayload({
      spread: spread.value,
      spreadType: activeSpreadType.value,
      tone: interpretationTone.value,
      source: interpretation.value.provider,
      advancedAiFlag: flags.value.advancedAi
    }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не вдалося згенерувати тлумачення';
  } finally {
    interpretationLoading.value = false;
  }
}

function trackPremiumPreviewClick() {
  trackEvent('premium_preview_clicked', {
    spreadType: activeSpreadType.value,
    hasSpread: Boolean(spread.value.length)
  });
}

async function setInterpretationTone(tone: InterpretationTone) {
  interpretationTone.value = tone;
  trackEvent('interpretation_tone_changed', { tone });
  await generateInterpretation();
}

function toggleAuthMode() {
  authMode.value = authMode.value === 'login' ? 'register' : 'login';
  error.value = '';
}

async function submitAuth() {
  if (!authForm.value.email.trim() || !authForm.value.password.trim()) return;

  authLoading.value = true;
  error.value = '';

  try {
    const session = authMode.value === 'login'
      ? await loginUser({ email: authForm.value.email, password: authForm.value.password })
      : await registerUser({ email: authForm.value.email, password: authForm.value.password, name: authForm.value.name });

    currentUser.value = session.user;
    identifyUser(session.user);
    trackEvent(authMode.value === 'login' ? 'login_completed' : 'registration_completed', {
      premiumTier: session.user.premiumTier
    });
    authForm.value = { name: '', email: '', password: '' };
    await syncUserLists();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не вдалося авторизуватись';
  } finally {
    authLoading.value = false;
  }
}

function logout() {
  trackEvent('logout_clicked');
  clearAccessToken();
  resetAnalyticsUser();
  currentUser.value = null;
  spreadHistory.value = [];
  favoriteSpreads.value = [];
}

async function saveSpreadToHistory(cards: DrawnCard[], title: string) {
  if (!currentUser.value || !cards.length) return;

  const saved = await saveCloudSpread({
    title,
    spreadType: activeSpreadType.value,
    cards,
    interpretation: interpretation.value,
    favorite: false
  });

  spreadHistory.value.unshift(saved);
  spreadHistory.value = spreadHistory.value.slice(0, 20);
}

async function saveFavoriteSpread() {
  if (!currentUser.value) {
    copyStatus.value = 'Спочатку увійди, щоб зберігати обрані розклади.';
    return;
  }

  if (!spread.value.length) return;

  try {
    const saved = await saveCloudSpread({
      title: activeSpreadDefinition.value?.title ?? 'Обраний розклад',
      spreadType: activeSpreadType.value,
      cards: spread.value,
      interpretation: interpretation.value,
      favorite: true
    });

    favoriteSpreads.value.unshift(saved);
    favoriteSpreads.value = favoriteSpreads.value.slice(0, 12);
    trackEvent('favorite_added', spreadAnalyticsPayload(spread.value, activeSpreadType.value));
    copyStatus.value = 'Розклад додано в обране.';
  } catch (err) {
    copyStatus.value = err instanceof Error ? err.message : 'Не вдалося додати в обране.';
  }
}


async function openJournalEntry(entry: CloudSpread) {
  activeSpreadType.value = entry.spreadType;
  spread.value = entry.cards;
  interpretation.value = entry.interpretation;
  selectorCollapsed.value = true;
  shareResult.value = null;
  sharePreviewUrl.value = '';
  copyStatus.value = 'Розклад відкрито з Книги розкладів.';
  trackEvent('journal_entry_opened', {
    id: entry.id,
    spreadType: entry.spreadType,
    favorite: entry.favorite,
    cardsCount: entry.cards.length
  });
  await nextTick();
  boardSection.value?.scrollIntoView();
}

async function saveJournalNote(payload: { id: string; note: string }) {
  try {
    const updated = await updateCloudSpreadNote(payload.id, payload.note);
    spreadHistory.value = spreadHistory.value.map((item) => item.id === updated.id ? updated : item);
    favoriteSpreads.value = favoriteSpreads.value.map((item) => item.id === updated.id ? updated : item);
    trackEvent('journal_note_saved', { id: payload.id, noteLength: payload.note.length });
    copyStatus.value = 'Нотатку збережено.';
  } catch (err) {
    copyStatus.value = err instanceof Error ? err.message : 'Не вдалося зберегти нотатку.';
  }
}

async function shareCurrentSpread() {
  if (!spread.value.length) return;

  trackEvent('share_clicked', spreadAnalyticsPayload(spread.value, activeSpreadType.value));

  shareLoading.value = true;
  copyStatus.value = '';

  try {
    const title = activeSpreadDefinition.value?.title ?? 'Мій розклад Таро';
    const result = await createShareableSpread({
      title,
      spreadType: activeSpreadType.value,
      cards: spread.value,
      interpretation: interpretation.value
    });

    shareResult.value = result;
    sharePreviewUrl.value = await buildSharePreview(result);
    trackEvent('share_link_created', {
      slug: result.slug,
      ...spreadAnalyticsPayload(spread.value, activeSpreadType.value)
    });
    copyStatus.value = 'Публічне посилання створено.';
  } catch (err) {
    copyStatus.value = err instanceof Error ? err.message : 'Не вдалося створити share-link.';
  } finally {
    shareLoading.value = false;
  }
}

async function copyShareUrl() {
  if (!shareResult.value) return;

  try {
    await navigator.clipboard.writeText(shareResult.value.url);
    trackEvent('share_url_copied', { slug: shareResult.value.slug });
    copyStatus.value = 'Посилання скопійовано.';
  } catch {
    copyStatus.value = 'Не вдалося скопіювати посилання автоматично.';
  }
}

function selectShareUrl(event: Event) {
  (event.target as HTMLInputElement).select();
}

async function nativeShare() {
  if (!shareResult.value) return;

  const payload = {
    title: shareResult.value.social.title,
    text: shareResult.value.social.description,
    url: shareResult.value.url
  };

  if (navigator.share) {
    await navigator.share(payload);
    trackEvent('native_share_completed', { slug: shareResult.value.slug });
    return;
  }

  await copyShareUrl();
}

async function loadSharedView(slug: string) {
  const shared = await fetchSharedSpread(slug);
  isSharedView.value = true;
  activeSpreadType.value = shared.spreadType;
  spread.value = shared.cards;
  interpretation.value = shared.interpretation;
  selectorCollapsed.value = true;
  shareResult.value = shared;
  sharePreviewUrl.value = await buildSharePreview(shared);
  copyStatus.value = 'Відкрито публічний розклад.';
  trackEvent('shared_spread_opened', {
    slug,
    spreadType: shared.spreadType,
    cardsCount: shared.cards.length
  });
}

async function copySpreadText() {
  if (!spread.value.length) return;

  const title = activeSpreadDefinition.value?.title ?? 'Розклад Таро';
  const text = [
    title,
    ...spread.value.map((item) => [
      `\n${item.position}: ${item.card.name}${item.reversed ? ' (перевернута)' : ''}`,
      item.positionDescription,
      `Ключові слова: ${item.card.keywords.join(', ')}`,
      `Значення: ${cardMeaning(item)}`
    ].join('\n'))
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    trackEvent('reading_text_copied', spreadAnalyticsPayload(spread.value, activeSpreadType.value));
    copyStatus.value = 'Текст розкладу скопійовано.';
  } catch {
    copyStatus.value = 'Не вдалося скопіювати автоматично.';
  }
}

onMounted(async () => {
  applyTheme();
  trackEvent('app_opened', { theme: theme.value });

  try {
    if (getAccessToken()) {
      try {
        currentUser.value = await fetchProfile();
        identifyUser(currentUser.value);
        await syncUserLists();
      } catch {
        clearAccessToken();
      }
    }

    await Promise.all([loadCardOfDay(), loadSpreadDefinitions()]);

    const sharedMatch = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]+)/);
    if (sharedMatch?.[1]) {
      await loadSharedView(sharedMatch[1]);
    } else {
      await refreshSpread('classic3');
      selectorCollapsed.value = false;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  }
});
</script>

<style>
.page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  display: grid;
  gap: 1.35rem;
}

.hero,
.panel {
  background: rgba(255, 250, 240, 0.92);
  border: 1px solid #dfcda8;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(85, 54, 24, 0.08);
}

.hero {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff9ed 0%, #f4e0bd 100%);
}

.panel {
  padding: 1.15rem;
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
}

.eyebrow {
  margin: 0 0 0.45rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  color: #746451;
}

.hero h1,
.panel h2 {
  margin-top: 0;
}

.hero h1 {
  margin-bottom: 0.35rem;
  font-size: clamp(1.9rem, 4vw, 3rem);
}

.subtitle,
.muted {
  color: #746451;
}

.auth-grid,

.auth-card {
  display: grid;
  gap: 1rem;
}

.auth-card h2 {
  margin: 0 0 0.35rem;
}

.auth-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  align-items: center;
}

.auth-input {
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border, rgba(223, 205, 168, 0.7));
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  padding: 0 1rem;
}

.premium-pill {
  display: inline-flex;
  margin-left: 0.5rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(245, 199, 106, 0.5);
  color: #f5c76a;
  font-size: 0.78rem;
}

.auth-user,
.section-head,
.section-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.auth-user,
.section-head {
  justify-content: space-between;
}

.btn {
  border: 0;
  border-radius: 999px;
  background: #9f5a2b;
  color: #fff;
  font-weight: 800;
  padding: 0.75rem 1.15rem;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
  box-shadow: 0 8px 18px rgba(159, 90, 43, 0.18);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #743a17;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  background: #c28a52;
}

.btn-ghost {
  background: #f1dfcb;
  color: #56361c;
}

.auth-input {
  flex: 1;
  min-width: 220px;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid #d7bd92;
  background: #fffdf8;
  color: #2d2418;
}

.controls-panel {
  display: grid;
  gap: 1rem;
}

.spread-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
}

.spread-button {
  text-align: left;
  border: 1px solid #e0c39e;
  border-radius: 16px;
  padding: 0.85rem;
  background: linear-gradient(180deg, #fffaf0, #f4e4cd);
  color: #2f2a24;
  cursor: pointer;
}

.spread-button strong,
.spread-button span {
  display: block;
}

.spread-button span {
  margin-top: 0.25rem;
  color: #746451;
  font-size: 0.82rem;
}

.spread-button.active {
  border-color: #9f5a2b;
  box-shadow: 0 0 0 3px rgba(159, 90, 43, 0.14);
}

.card-day {
  display: grid;
  grid-template-columns: 138px 1fr;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e2c8a3;
  background: linear-gradient(180deg, #fffaf0, #f7ead8);
}

.card-visual {
  position: relative;
  display: grid;
  place-items: center;
}

.card-image {
  width: 100%;
  max-width: 145px;
  aspect-ratio: 3 / 5;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #d8c4a5;
  background: #f6ebd2;
  box-shadow: 0 10px 22px rgba(57, 36, 18, 0.12);
}

.card-image.is-reversed {
  transform: rotate(180deg);
}

.reversed-badge {
  position: absolute;
  right: 0.25rem;
  bottom: 0.35rem;
  border-radius: 999px;
  padding: 0.25rem 0.48rem;
  background: rgba(45, 36, 24, 0.82);
  color: #fffaf0;
  font-size: 0.66rem;
  line-height: 1;
  white-space: nowrap;
}

.spread-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.card-item {
  border: 1px solid #d9bd94;
  border-radius: 16px;
  padding: 0.9rem;
  background: linear-gradient(180deg, #fffaf0, #f3e1c7);
  text-align: center;
  box-shadow: 0 14px 32px rgba(85, 54, 24, 0.08);
}

.card-item h3 {
  margin: 0.4rem 0 0.25rem;
  color: #2f2a24;
  font-size: 1rem;
}

.position {
  margin: 0.55rem 0 0;
  font-size: 0.72rem;
  color: #746451;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.position-hint {
  margin: 0.24rem auto 0.1rem;
  color: #806b58;
  font-size: 0.76rem;
  line-height: 1.25;
  max-width: 28ch;
}

.keywords {
  color: #9f5a2b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.meaning {
  color: #3d3126;
}


.spread-pentagram-layout {
  display: grid;
  gap: 1.25rem;
  margin-top: 1rem;
}

.spread-pentagram-board {
  --board-card-w: clamp(82px, 10vw, 122px);
  --board-gap: clamp(0.45rem, 1.8vw, 1rem);
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, var(--board-card-w));
  grid-template-rows: repeat(3, auto);
  gap: var(--board-gap) calc(var(--board-gap) * 1.45);
  justify-content: center;
  align-items: center;
  width: min(100%, 560px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(159, 90, 43, 0.22);
  background:
    radial-gradient(circle at 50% 50%, rgba(159, 90, 43, 0.16), transparent 31%),
    linear-gradient(180deg, rgba(255, 251, 243, 0.95), rgba(244, 225, 199, 0.68));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55), 0 18px 44px rgba(85, 54, 24, 0.09);
}

.spread-pentagram-board::before,
.spread-pentagram-board::after {
  content: '';
  position: absolute;
  inset: 13%;
  pointer-events: none;
}

.spread-pentagram-board::before {
  border: 1px solid rgba(159, 90, 43, 0.20);
  border-radius: 50%;
}

.spread-pentagram-board::after {
  background:
    linear-gradient(32deg, transparent 48.8%, rgba(159, 90, 43, 0.13) 49.6%, rgba(159, 90, 43, 0.13) 50.4%, transparent 51.2%),
    linear-gradient(-32deg, transparent 48.8%, rgba(159, 90, 43, 0.13) 49.6%, rgba(159, 90, 43, 0.13) 50.4%, transparent 51.2%),
    linear-gradient(90deg, transparent 49.2%, rgba(159, 90, 43, 0.10) 49.8%, rgba(159, 90, 43, 0.10) 50.2%, transparent 50.8%);
  opacity: 0.65;
}

.pentagram-orb {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.pentagram-orb.position-0 { grid-column: 2; grid-row: 1; }
.pentagram-orb.position-1 { grid-column: 1; grid-row: 2; }
.pentagram-orb.position-4 { grid-column: 3; grid-row: 2; }
.pentagram-orb.position-3 { grid-column: 1; grid-row: 3; }
.pentagram-orb.position-2 { grid-column: 3; grid-row: 3; }

.pentagram-card-visual {
  position: relative;
  width: var(--board-card-w);
  aspect-ratio: 3 / 5;
  padding: 0.25rem;
  border-radius: 13px;
  background: rgba(255, 250, 240, 0.78);
  border: 1px solid rgba(159, 90, 43, 0.36);
  box-shadow: 0 12px 28px rgba(67, 41, 19, 0.12);
}

.pentagram-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.pentagram-image.is-reversed {
  transform: rotate(180deg);
}

.pentagram-card-visual .reversed-badge {
  right: -0.25rem;
  bottom: -0.25rem;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  padding: 0;
  font-size: 0.78rem;
}

.pentagram-caption {
  width: min(145px, 140%);
  min-height: 3.15rem;
  display: grid;
  align-content: start;
  gap: 0.18rem;
  text-align: center;
  color: #4b3827;
}

.pentagram-caption strong {
  font-size: clamp(0.63rem, 1.3vw, 0.74rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #746451;
}

.pentagram-caption span {
  font-size: clamp(0.72rem, 1.5vw, 0.86rem);
  font-weight: 800;
  line-height: 1.15;
}

.spread-details-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.85rem;
}

.detail-card {
  position: relative;
  display: grid;
  grid-template-columns: 70px 1fr;
  grid-template-areas:
    "visual position"
    "visual hint"
    "visual title"
    "visual keywords"
    "visual meaning";
  gap: 0.18rem 0.75rem;
  align-items: start;
  min-height: 0;
  text-align: left;
  padding: 0.85rem 0.9rem;
}

.detail-card::before {
  content: attr(data-index);
  position: absolute;
  top: 0.65rem;
  right: 0.75rem;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #9f5a2b;
  color: #fffaf0;
  font-size: 0.74rem;
  font-weight: 900;
}

.detail-card .card-visual { grid-area: visual; }
.detail-card .position { grid-area: position; margin-top: 0.1rem; padding-right: 1.8rem; }
.detail-card .position-hint { grid-area: hint; margin: 0; max-width: none; }
.detail-card h3 { grid-area: title; margin: 0.15rem 0 0; font-size: 1rem; }
.detail-card .keywords { grid-area: keywords; margin: 0.1rem 0 0; }
.detail-card .meaning { grid-area: meaning; margin: 0.2rem 0 0; }

.detail-card .card-image {
  width: 64px;
  height: 106px;
  max-width: none;
  border-radius: 9px;
}

.detail-card .reversed-badge {
  right: -0.25rem;
  bottom: 0.15rem;
  font-size: 0.55rem;
  padding: 0.22rem 0.34rem;
}

.deck-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
  padding: 0;
  margin: 0;
}

.deck-list li {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 0.65rem;
  align-items: center;
  padding: 0.7rem;
  border-radius: 12px;
  border: 1px solid #e6d2ae;
  background: #fffdf8;
}

.deck-thumb {
  width: 54px;
  height: 88px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #d8c4a5;
  background: #f6ebd2;
}

.deck-list strong {
  display: block;
  margin-bottom: 0.2rem;
}

.deck-list span {
  color: #746451;
  font-size: 0.88rem;
}

.history-list {
  display: grid;
  gap: 0.75rem;
}

.history-item {
  background: #fff8f0;
  border-radius: 14px;
  padding: 0.9rem;
  border: 1px solid #e3c6a7;
}

.history-head,
.history-cards {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.history-head {
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.history-head span {
  color: #746451;
  font-size: 0.85rem;
}

.history-cards span {
  background: #f1dfcb;
  padding: 0.38rem 0.62rem;
  border-radius: 999px;
  font-size: 0.74rem;
}

.error {
  color: #9f2b2b;
  font-weight: 700;
}

.success {
  margin-bottom: 0;
  color: #4f7a33;
  font-weight: 700;
}

@media (max-width: 820px) {
  .spread-grid-3 {
    grid-template-columns: 1fr;
  }

  .spread-details-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .page {
    padding: 1rem 0.7rem 2rem;
  }

  .hero,
  .panel {
    border-radius: 15px;
    padding: 1rem;
  }

  .auth-grid,
  .auth-user,
  .section-head,
  .section-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .card-day {
    grid-template-columns: 1fr;
  }

  .spread-pentagram-board {
    --board-card-w: 74px;
    gap: 0.5rem 0.7rem;
    padding: 0.85rem 0.55rem;
    border-radius: 20px;
  }

  .pentagram-caption {
    min-height: 2.75rem;
  }

  .detail-card {
    grid-template-columns: 58px 1fr;
    padding: 0.78rem;
  }

  .detail-card .card-image {
    width: 54px;
    height: 90px;
  }
}

@media (max-width: 420px) {
  .spread-pentagram-board {
    --board-card-w: 66px;
  }

  .pentagram-caption strong {
    font-size: 0.56rem;
  }

  .pentagram-caption span {
    font-size: 0.68rem;
  }
}

/* SpreadBoard v3: stable, non-overlapping layout */
.spread-grid-3 {
  align-items: stretch;
}

.spread-grid-3 .card-item {
  display: grid;
  grid-template-rows: auto auto auto auto auto 1fr;
  justify-items: center;
  overflow: hidden;
}

.spread-grid-3 .card-image {
  width: clamp(88px, 16vw, 132px);
  max-width: 132px;
  height: auto;
}

.spread-layout-clean {
  display: grid;
  gap: 1.15rem;
  margin-top: 1rem;
}

.spread-board-clean {
  --slot-w: clamp(104px, 15vw, 138px);
  --slot-h: calc(var(--slot-w) * 1.95);
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(3, var(--slot-h));
  gap: clamp(0.45rem, 1.5vw, 0.85rem);
  width: min(100%, 720px);
  margin: 0 auto;
  padding: clamp(0.8rem, 2vw, 1.2rem);
  border-radius: 24px;
  border: 1px solid rgba(159, 90, 43, 0.22);
  background:
    radial-gradient(circle at 50% 48%, rgba(159, 90, 43, 0.13), transparent 34%),
    linear-gradient(180deg, rgba(255, 251, 243, 0.98), rgba(244, 225, 199, 0.76));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.62), 0 18px 44px rgba(85, 54, 24, 0.08);
  overflow: hidden;
}

.spread-board-clean::before {
  content: '';
  position: absolute;
  inset: 11% 18%;
  border: 1px solid rgba(159, 90, 43, 0.16);
  border-radius: 50%;
  pointer-events: none;
}

.board-slot {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;
  align-content: start;
  gap: 0.35rem;
  min-width: 0;
}

.board-slot.position-0 { grid-column: 3; grid-row: 1; }
.board-slot.position-1 { grid-column: 1 / span 2; grid-row: 2; justify-self: center; }
.board-slot.position-4 { grid-column: 4 / span 2; grid-row: 2; justify-self: center; }
.board-slot.position-3 { grid-column: 2; grid-row: 3; }
.board-slot.position-2 { grid-column: 4; grid-row: 3; }

.board-card-frame {
  position: relative;
  width: var(--slot-w);
  aspect-ratio: 3 / 5;
  padding: 0.22rem;
  border-radius: 14px;
  border: 1px solid rgba(159, 90, 43, 0.34);
  background: rgba(255, 250, 240, 0.8);
  box-shadow: 0 12px 28px rgba(67, 41, 19, 0.12);
}

.board-card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.board-card-image.is-reversed {
  transform: rotate(180deg);
}

.board-reversed {
  position: absolute;
  right: -0.32rem;
  bottom: -0.32rem;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(45, 36, 24, 0.84);
  color: #fffaf0;
  font-size: 0.78rem;
  line-height: 1;
}

.board-caption {
  width: min(150px, 145%);
  display: grid;
  gap: 0.1rem;
  text-align: center;
  line-height: 1.15;
}

.board-caption strong {
  color: #746451;
  font-size: clamp(0.58rem, 1vw, 0.7rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.board-caption span {
  color: #2f2a24;
  font-size: clamp(0.7rem, 1.1vw, 0.84rem);
  font-weight: 800;
}

.spread-details-clean {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.detail-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid #d9bd94;
  border-radius: 16px;
  background: linear-gradient(180deg, #fffaf0, #f3e1c7);
  box-shadow: 0 12px 26px rgba(85, 54, 24, 0.07);
}

.detail-number {
  width: 1.7rem;
  height: 1.7rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #9f5a2b;
  color: #fffaf0;
  font-weight: 900;
  font-size: 0.82rem;
}

.detail-row .position,
.detail-row .position-hint,
.detail-row .keywords,
.detail-row .meaning,
.detail-row h3 {
  margin-left: 0;
  margin-right: 0;
}

.detail-row h3 {
  margin-top: 0.22rem;
  margin-bottom: 0.15rem;
  font-size: 1rem;
}

.inline-reversed {
  color: #9f5a2b;
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 760px) {
  .spread-board-clean {
    --slot-w: clamp(76px, 20vw, 104px);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(3, calc(var(--slot-w) * 2.05));
  }

  .board-slot.position-0 { grid-column: 2; grid-row: 1; }
  .board-slot.position-1 { grid-column: 1; grid-row: 2; }
  .board-slot.position-4 { grid-column: 3; grid-row: 2; }
  .board-slot.position-3 { grid-column: 1; grid-row: 3; }
  .board-slot.position-2 { grid-column: 3; grid-row: 3; }
}

@media (max-width: 480px) {
  .spread-board-clean {
    --slot-w: 70px;
    padding: 0.7rem 0.45rem;
    border-radius: 18px;
  }

  .board-caption strong { font-size: 0.54rem; }
  .board-caption span { font-size: 0.64rem; }
}


/* Mystic theme layer */
.page {
  position: relative;
  isolation: isolate;
}

.ambient-orb {
  position: fixed;
  z-index: -1;
  width: 28rem;
  height: 28rem;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(28px);
  opacity: 0.42;
  animation: float-orb 12s ease-in-out infinite alternate;
}

.orb-one {
  left: -10rem;
  top: 8rem;
  background: radial-gradient(circle, rgba(140, 104, 255, 0.5), transparent 68%);
}

.orb-two {
  right: -12rem;
  bottom: 4rem;
  background: radial-gradient(circle, rgba(230, 182, 106, 0.32), transparent 70%);
  animation-delay: -4s;
}

.hero,
.panel {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025)),
    var(--panel);
  border-color: var(--border);
  box-shadow:
    0 22px 70px var(--shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.11);
  backdrop-filter: blur(18px) saturate(1.1);
}

.hero::before,
.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 8%, rgba(230, 182, 106, 0.16), transparent 18rem),
    radial-gradient(circle at 92% 10%, rgba(140, 104, 255, 0.15), transparent 16rem);
  opacity: 0.8;
}

.hero > *,
.panel > * {
  position: relative;
  z-index: 1;
}

.hero {
  min-height: 210px;
  padding: clamp(1.35rem, 3vw, 2.1rem);
  background:
    radial-gradient(circle at 16% 18%, rgba(230, 182, 106, 0.18), transparent 18rem),
    radial-gradient(circle at 82% 10%, rgba(140, 104, 255, 0.2), transparent 18rem),
    linear-gradient(135deg, rgba(28, 18, 45, 0.92), rgba(43, 22, 58, 0.84));
}

.hero-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.8rem;
}

.theme-toggle {
  border: 1px solid rgba(230, 182, 106, 0.32);
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  box-shadow: 0 0 22px rgba(230, 182, 106, 0.08);
}

.hero h1 {
  color: var(--ink);
  text-shadow: 0 0 30px rgba(230, 182, 106, 0.26);
}

.subtitle,
.muted,
.position,
.position-hint,
.deck-list span,
.history-head span,
.spread-button span,
.board-caption strong {
  color: var(--muted);
}

.eyebrow,
.keywords,
.inline-reversed {
  color: var(--gold-strong);
}

.btn {
  background: linear-gradient(135deg, #ba7b32, #7d4cff);
  box-shadow: 0 10px 28px rgba(140, 104, 255, 0.26), 0 0 18px rgba(230, 182, 106, 0.12);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d69a4d, #9a76ff);
}

.btn-secondary {
  background: linear-gradient(135deg, #a96a36, #c77ab0);
}

.btn-ghost {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(230, 182, 106, 0.18);
}

.auth-input {
  color: var(--ink);
  border-color: rgba(230, 182, 106, 0.25);
  background: rgba(8, 6, 17, 0.42);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.auth-input::placeholder {
  color: rgba(247, 234, 216, 0.55);
}

.spread-button,
.card-day,
.card-item,
.detail-row,
.deck-list li,
.history-item {
  color: var(--ink);
  border-color: rgba(230, 182, 106, 0.22);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
    rgba(20, 14, 31, 0.68);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.22);
}

.spread-button.active {
  border-color: rgba(244, 211, 139, 0.78);
  box-shadow: 0 0 0 3px rgba(230, 182, 106, 0.13), 0 0 30px rgba(140, 104, 255, 0.18);
}

.card-item h3,
.detail-row h3,
.board-caption span,
.deck-list strong,
.history-head strong,
.auth-user strong {
  color: var(--ink);
}

.meaning {
  color: rgba(247, 234, 216, 0.88);
}

.card-image,
.deck-thumb,
.board-card-frame {
  border-color: rgba(244, 211, 139, 0.35);
  background: rgba(8, 6, 17, 0.35);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.3),
    0 0 22px rgba(140, 104, 255, 0.14);
}

.spread-board-clean {
  border-color: rgba(244, 211, 139, 0.24);
  background:
    radial-gradient(circle at 50% 42%, rgba(230, 182, 106, 0.16), transparent 30%),
    radial-gradient(circle at 50% 54%, rgba(140, 104, 255, 0.18), transparent 42%),
    linear-gradient(180deg, rgba(23, 15, 38, 0.92), rgba(13, 10, 25, 0.86));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 28px 70px rgba(0, 0, 0, 0.34),
    0 0 55px rgba(140, 104, 255, 0.12);
}

.spread-board-clean::before {
  border-color: rgba(244, 211, 139, 0.18);
  box-shadow: 0 0 38px rgba(230, 182, 106, 0.08);
}

.spread-board-clean::after {
  content: '';
  position: absolute;
  inset: 9% 16%;
  pointer-events: none;
  opacity: 0.4;
  background:
    linear-gradient(34deg, transparent 49.2%, rgba(230, 182, 106, 0.14) 49.8%, rgba(230, 182, 106, 0.14) 50.2%, transparent 50.8%),
    linear-gradient(-34deg, transparent 49.2%, rgba(230, 182, 106, 0.11) 49.8%, rgba(230, 182, 106, 0.11) 50.2%, transparent 50.8%);
}

.board-card-frame:hover,
.card-image:hover,
.deck-thumb:hover {
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.34),
    0 0 32px rgba(230, 182, 106, 0.2),
    0 0 24px rgba(140, 104, 255, 0.14);
}

.detail-number {
  background: linear-gradient(135deg, #ba7b32, #7d4cff);
  color: #fff9e8;
}

.history-cards span {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(230, 182, 106, 0.14);
}

.error { color: #ff9a9a; }
.success { color: #bdf2a1; }

:global([data-theme='light']) .ambient-orb {
  display: none;
}

:global([data-theme='light']) .hero,
:global([data-theme='light']) .panel {
  background: rgba(255, 250, 240, 0.92);
  border-color: #dfcda8;
  box-shadow: 0 18px 45px rgba(85, 54, 24, 0.08);
  backdrop-filter: none;
}

:global([data-theme='light']) .hero {
  background: linear-gradient(135deg, #fff9ed 0%, #f4e0bd 100%);
}

:global([data-theme='light']) .hero::before,
:global([data-theme='light']) .panel::before,
:global([data-theme='light']) .spread-board-clean::after {
  display: none;
}

:global([data-theme='light']) .theme-toggle {
  background: #fffaf0;
  color: #2d2418;
  border-color: #dfcda8;
}

:global([data-theme='light']) .auth-input {
  background: #fffdf8;
  color: #2d2418;
  border-color: #d7bd92;
}

:global([data-theme='light']) .auth-input::placeholder {
  color: #806b58;
}

@keyframes float-orb {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(2rem, -1.5rem, 0) scale(1.08); }
}


/* Card reveal / shuffle animations */
.shuffle-stage {
  display: grid;
  place-items: center;
  gap: 0.9rem;
  min-height: 210px;
  padding: 1.25rem;
}

.shuffle-stack {
  position: relative;
  width: 112px;
  height: 168px;
  perspective: 900px;
}

.shuffle-card {
  --shuffle-index: 0;
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 1px solid rgba(244, 211, 139, 0.42);
  background:
    radial-gradient(circle at 50% 42%, rgba(230, 182, 106, 0.26), transparent 35%),
    linear-gradient(135deg, rgba(33, 21, 55, 0.96), rgba(98, 59, 125, 0.92));
  box-shadow:
    0 18px 36px rgba(0, 0, 0, 0.28),
    0 0 26px rgba(140, 104, 255, 0.14);
  transform-origin: center;
  animation: shuffle-card 780ms ease-in-out infinite;
  animation-delay: calc(var(--shuffle-index) * -115ms);
}

.shuffle-card::before,
.shuffle-card::after {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 12px;
  border: 1px solid rgba(244, 211, 139, 0.34);
}

.shuffle-card::after {
  inset: 22px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 211, 139, 0.24), transparent 62%);
}

.animated-card {
  transform-origin: center;
  transform-style: preserve-3d;
  animation: tarot-flip-reveal 780ms cubic-bezier(0.2, 0.75, 0.2, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
}

.animated-card::before {
  content: '';
  position: absolute;
  inset: 0.22rem;
  border-radius: inherit;
  z-index: 3;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 42%, rgba(230, 182, 106, 0.26), transparent 36%),
    linear-gradient(135deg, rgba(33, 21, 55, 0.96), rgba(98, 59, 125, 0.92));
  border: 1px solid rgba(244, 211, 139, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  animation: card-back-hide 780ms cubic-bezier(0.2, 0.75, 0.2, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
}

.animated-card::after {
  content: '✦';
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  color: rgba(255, 244, 209, 0.88);
  font-size: 1.35rem;
  pointer-events: none;
  animation: card-back-hide 780ms cubic-bezier(0.2, 0.75, 0.2, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
}

.reveal-detail {
  opacity: 0;
  transform: translateY(10px);
  animation: detail-rise 520ms ease both;
  animation-delay: var(--reveal-delay, 520ms);
}

.board-slot,
.card-item {
  perspective: 900px;
}

@keyframes shuffle-card {
  0% {
    transform: translateX(-18px) rotate(-9deg) rotateY(0deg);
    z-index: 1;
  }
  45% {
    transform: translateX(22px) rotate(10deg) rotateY(18deg) translateY(-4px);
    z-index: 5;
  }
  100% {
    transform: translateX(-18px) rotate(-9deg) rotateY(0deg);
    z-index: 1;
  }
}

@keyframes tarot-flip-reveal {
  0% {
    opacity: 0;
    transform: rotateY(180deg) translateY(14px) scale(0.88);
    filter: blur(2px) saturate(0.8);
  }
  45% {
    opacity: 1;
    transform: rotateY(92deg) translateY(-4px) scale(1.03);
    filter: blur(0) saturate(1.1);
  }
  100% {
    opacity: 1;
    transform: rotateY(0deg) translateY(0) scale(1);
    filter: blur(0) saturate(1);
  }
}

@keyframes card-back-hide {
  0%, 48% {
    opacity: 1;
  }
  52%, 100% {
    opacity: 0;
  }
}

@keyframes detail-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:global([data-theme='light']) .shuffle-card,
:global([data-theme='light']) .animated-card::before {
  background:
    radial-gradient(circle at 50% 42%, rgba(159, 90, 43, 0.22), transparent 36%),
    linear-gradient(135deg, #8f4f2a, #c28a52);
}

@media (prefers-reduced-motion: reduce) {
  .shuffle-card,
  .animated-card,
  .animated-card::before,
  .animated-card::after,
  .reveal-detail {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}


/* Ritual selection flow v2 */
.hero-ritual {
  min-height: min(78vh, 720px);
  display: grid;
  align-content: center;
}

.hero-actions {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 1.35rem;
}

.btn-large {
  padding: 0.95rem 1.35rem;
  font-size: 1rem;
}

.hero-hint {
  color: var(--muted);
  font-size: 0.92rem;
}

.ritual-panel {
  scroll-margin-top: 1rem;
  transition: transform 220ms ease, opacity 220ms ease, box-shadow 220ms ease;
}

.ritual-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.ritual-head h2 {
  margin-bottom: 0.35rem;
}

.spread-selector-v2 {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  margin-top: 0.9rem;
}

.spread-choice {
  position: relative;
  min-height: 136px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  align-items: start;
  padding: 1rem;
  overflow: hidden;
  isolation: isolate;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.spread-choice::before {
  content: '';
  position: absolute;
  inset: -45% -20% auto auto;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(230, 182, 106, 0.22), transparent 68%);
  opacity: 0;
  transition: opacity 180ms ease, transform 180ms ease;
  z-index: -1;
}

.spread-choice:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(244, 211, 139, 0.62);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28), 0 0 28px rgba(140, 104, 255, 0.15);
}

.spread-choice:hover:not(:disabled)::before,
.spread-choice.active::before {
  opacity: 1;
  transform: scale(1.12);
}

.choice-icon {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--gold-strong);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(230, 182, 106, 0.25);
  font-size: 1.15rem;
  box-shadow: 0 0 22px rgba(230, 182, 106, 0.08);
}

.choice-body {
  display: grid;
  gap: 0.32rem;
  min-width: 0;
  align-self: stretch;
}

.choice-body strong {
  color: var(--ink);
  font-size: 1rem;
}

.choice-body small {
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.35;
}

.choice-body em {
  width: max-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin-top: auto;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  color: var(--gold-strong);
  background: rgba(230, 182, 106, 0.11);
  border: 1px solid rgba(230, 182, 106, 0.16);
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 800;
}

.active-ritual-summary {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.9rem;
  padding: 0.8rem 0.95rem;
  border-radius: 16px;
  border: 1px solid rgba(230, 182, 106, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.active-ritual-summary > span {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--gold-strong);
  background: rgba(230, 182, 106, 0.1);
}

.active-ritual-summary strong,
.active-ritual-summary small {
  display: block;
}

.active-ritual-summary small {
  margin-top: 0.15rem;
  color: var(--muted);
}

.board-panel {
  scroll-margin-top: 1rem;
  transition: box-shadow 280ms ease, transform 280ms ease;
}

.board-panel.board-focus {
  transform: translateY(-2px);
  box-shadow:
    0 26px 80px var(--shadow),
    0 0 0 1px rgba(244, 211, 139, 0.22),
    0 0 58px rgba(230, 182, 106, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.ritual-collapse-enter-active,
.ritual-collapse-leave-active {
  transition: opacity 220ms ease, transform 220ms ease, max-height 260ms ease;
  overflow: hidden;
  max-height: 520px;
}

.ritual-collapse-enter-from,
.ritual-collapse-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

@media (max-width: 620px) {
  .hero-ritual {
    min-height: 68vh;
  }

  .hero-actions,
  .ritual-head {
    flex-direction: column;
    align-items: stretch;
  }

  .spread-selector-v2 {
    grid-template-columns: 1fr;
  }

  .spread-choice {
    min-height: 118px;
  }
}


/* AI interpretation */
.interpretation-panel {
  border-color: rgba(244, 211, 139, 0.28);
}

.interpretation-head {
  align-items: flex-start;
}

.tone-switcher {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tone-button {
  border: 1px solid rgba(230, 182, 106, 0.2);
  border-radius: 999px;
  padding: 0.55rem 0.75rem;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.07);
  cursor: pointer;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.tone-button:hover:not(:disabled),
.tone-button.active {
  transform: translateY(-1px);
  border-color: rgba(244, 211, 139, 0.68);
  background: rgba(230, 182, 106, 0.14);
}

.interpretation-loading {
  min-height: 150px;
  display: grid;
  place-items: center;
  gap: 0.8rem;
  color: var(--muted);
}

.spinner-orb {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 1px solid rgba(244, 211, 139, 0.28);
  background:
    radial-gradient(circle at 50% 50%, rgba(244, 211, 139, 0.55), transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(140, 104, 255, 0.45), transparent 66%);
  box-shadow: 0 0 34px rgba(140, 104, 255, 0.24), 0 0 24px rgba(230, 182, 106, 0.14);
  animation: interpretation-pulse 1.1s ease-in-out infinite alternate;
}

.interpretation-card {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.interpretation-summary,
.interpretation-energy,
.interpretation-block,
.next-step {
  border: 1px solid rgba(230, 182, 106, 0.18);
  border-radius: 18px;
  padding: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)),
    rgba(8, 6, 17, 0.26);
}

.interpretation-summary {
  border-color: rgba(244, 211, 139, 0.34);
  box-shadow: 0 0 34px rgba(140, 104, 255, 0.1);
}

.interpretation-summary h3,
.interpretation-block h3 {
  margin: 0 0 0.55rem;
  color: var(--ink);
}

.interpretation-summary p,
.interpretation-energy p,
.interpretation-block p,
.next-step p,
.interpretation-block li {
  color: rgba(247, 234, 216, 0.88);
  line-height: 1.58;
}

.interpretation-energy strong,
.next-step strong {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--gold-strong);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
}

.interpretation-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 1rem;
}

.interpretation-block ul {
  margin: 0;
  padding-left: 1.1rem;
}

.interpretation-block li + li {
  margin-top: 0.55rem;
}

.next-step {
  background:
    radial-gradient(circle at 10% 20%, rgba(230, 182, 106, 0.13), transparent 16rem),
    linear-gradient(135deg, rgba(125, 76, 255, 0.16), rgba(186, 123, 50, 0.1));
}

:global([data-theme='light']) .interpretation-summary,
:global([data-theme='light']) .interpretation-energy,
:global([data-theme='light']) .interpretation-block,
:global([data-theme='light']) .next-step {
  background: #fff8f0;
  border-color: #e3c6a7;
}

:global([data-theme='light']) .interpretation-summary p,
:global([data-theme='light']) .interpretation-energy p,
:global([data-theme='light']) .interpretation-block p,
:global([data-theme='light']) .next-step p,
:global([data-theme='light']) .interpretation-block li {
  color: #3d3126;
}

@keyframes interpretation-pulse {
  from { transform: scale(0.92) rotate(0deg); opacity: 0.78; }
  to { transform: scale(1.06) rotate(18deg); opacity: 1; }
}

@media (max-width: 760px) {
  .interpretation-grid {
    grid-template-columns: 1fr;
  }

  .tone-switcher {
    justify-content: flex-start;
  }
}


/* Shareable spreads */
.btn-share {
  background: linear-gradient(135deg, #d08a37, #7d4cff 55%, #c77ab0);
}

.share-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(244, 211, 139, 0.26);
  background:
    radial-gradient(circle at 8% 0%, rgba(230, 182, 106, 0.16), transparent 16rem),
    linear-gradient(135deg, rgba(125, 76, 255, 0.16), rgba(255, 255, 255, 0.045));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22), 0 0 34px rgba(140, 104, 255, 0.12);
}

.share-copy h3 {
  margin: 0 0 0.4rem;
  color: var(--ink);
}

.share-url-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.share-url {
  min-width: 0;
  border-radius: 999px;
  border: 1px solid rgba(230, 182, 106, 0.25);
  background: rgba(8, 6, 17, 0.42);
  color: var(--ink);
  padding: 0.78rem 1rem;
  font-weight: 700;
}

.share-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.share-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.share-preview {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(244, 211, 139, 0.28);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28), 0 0 28px rgba(230, 182, 106, 0.12);
  background: #110b22;
}

.share-panel-enter-active,
.share-panel-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.share-panel-enter-from,
.share-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

:global([data-theme='light']) .share-result {
  background: #fff8f0;
  border-color: #e3c6a7;
}

:global([data-theme='light']) .share-url {
  background: #fffdf8;
  color: #2d2418;
  border-color: #d7bd92;
}

@media (max-width: 820px) {
  .share-result {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .share-url-row {
    grid-template-columns: 1fr;
  }

  .share-actions {
    display: grid;
  }
}

</style>

<style scoped>
.hero-v2 {
  min-height: 360px;
  display: grid;
  align-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(245, 199, 106, 0.24), transparent 32%),
    radial-gradient(circle at 80% 10%, rgba(165, 103, 255, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(28, 18, 43, 0.96), rgba(72, 41, 91, 0.92));
}

.hero-v2 .eyebrow,
.hero-v2 .subtitle,
.hero-v2 .hero-hint {
  color: rgba(255, 250, 240, 0.78);
}

.hero-v2 h1 {
  color: #fff8df;
  text-shadow: 0 0 28px rgba(245, 199, 106, 0.32);
}

.premium-preview-panel {
  border-color: rgba(245, 199, 106, 0.34);
  background:
    radial-gradient(circle at top right, rgba(245, 199, 106, 0.18), transparent 36%),
    rgba(34, 24, 51, 0.82);
}
</style>
