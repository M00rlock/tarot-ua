<template>
  <main class="page">
    <div class="ambient-orb orb-one" aria-hidden="true"></div>
    <div class="ambient-orb orb-two" aria-hidden="true"></div>
    <header class="hero">
      <div class="hero-top">
        <p class="eyebrow">Пет-проєкт для портфоліо</p>
        <button class="theme-toggle" type="button" @click="toggleTheme">{{ theme === 'dark' ? '☀️ Світла тема' : '🌙 Mystic тема' }}</button>
      </div>
      <h1>Таро Черіот</h1>
      <p class="subtitle">Vue + NestJS + JanusGraph. Онлайн-розклади, карта дня та персональна історія.</p>
    </header>

    <section class="panel auth-panel">
      <div v-if="!currentUser" class="auth-grid">
        <input v-model="authForm.name" class="auth-input" placeholder="Ваше ім’я" @keyup.enter="login" />
        <button class="btn" @click="login">Увійти</button>
      </div>

      <div v-else class="auth-user">
        <div>✨ Привіт, <strong>{{ currentUser }}</strong></div>
        <button class="btn btn-secondary" @click="logout">Вийти</button>
      </div>
    </section>

    <section class="panel controls-panel">
      <div>
        <h2>Оберіть розклад</h2>
        <p class="muted">Додані тематичні сценарії: класика, пентаграма, кохання та кар’єра.</p>
      </div>
      <div class="spread-selector">
        <button
          v-for="definition in spreadDefinitions"
          :key="definition.id"
          class="spread-button"
          :class="{ active: activeSpreadType === definition.id }"
          :disabled="loading"
          @click="refreshSpread(definition.id)"
        >
          <strong>{{ definition.title }}</strong>
          <span>{{ definition.count }} карти</span>
        </button>
      </div>
    </section>

    <section class="panel">
      <h2>Карта дня</h2>
      <p class="muted">{{ todayLabel }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <article v-if="cardOfDay" class="card-day">
        <img class="card-image" :class="{ 'is-reversed': cardOfDay.reversed }" :src="cardOfDay.card.image" :alt="cardOfDay.card.name" loading="lazy" @error="setPlaceholderImage" />
        <div>
          <p class="position">{{ cardOfDay.position }}</p>
          <h3>{{ cardOfDay.card.name }} <span v-if="cardOfDay.reversed">(перевернута)</span></h3>
          <p class="position-hint">{{ cardOfDay.positionDescription }}</p>
          <p class="keywords">{{ cardOfDay.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(cardOfDay) }}</p>
        </div>
      </article>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Поточний розклад</h2>
          <p class="muted" v-if="activeSpreadDefinition">{{ activeSpreadDefinition.title }}</p>
        </div>
        <div class="section-actions" v-if="spread.length">
          <button class="btn btn-secondary" @click="saveFavoriteSpread">★ В обране</button>
          <button class="btn btn-ghost" @click="copySpreadText">Копіювати текст</button>
        </div>
      </div>

      <div v-if="loading" class="muted">Оновлюю розклад...</div>

      <div v-else-if="spread.length === 3" class="spread-grid-3">
        <article v-for="item in spread" :key="`${item.position}-${item.card.id}`" class="card-item">
          <div class="card-visual">
            <img class="card-image" :class="{ 'is-reversed': item.reversed }" :src="item.card.image" :alt="item.card.name" loading="lazy" @error="setPlaceholderImage" />
            <span v-if="item.reversed" class="reversed-badge">↻ перевернута</span>
          </div>
          <p class="position">{{ item.position }}</p>
          <p class="position-hint">{{ item.positionDescription }}</p>
          <h3>{{ item.card.name }}</h3>
          <p class="keywords">{{ item.card.keywords.join(' · ') }}</p>
          <p class="meaning">{{ cardMeaning(item) }}</p>
        </article>
      </div>

      <div v-else-if="spread.length === 5" class="spread-layout-clean">
        <div class="spread-board-clean" aria-label="Пентаграма розкладу">
          <article v-for="(item, index) in spread" :key="`board-${item.position}-${item.card.id}`" class="board-slot" :class="`position-${index}`">
            <div class="board-card-frame">
              <img class="board-card-image" :class="{ 'is-reversed': item.reversed }" :src="item.card.image" :alt="item.card.name" loading="lazy" @error="setPlaceholderImage" />
              <span v-if="item.reversed" class="board-reversed">↻</span>
            </div>
            <div class="board-caption">
              <strong>{{ index + 1 }}. {{ item.position }}</strong>
              <span>{{ item.card.name }}</span>
            </div>
          </article>
        </div>

        <div class="spread-details-clean">
          <article v-for="(item, index) in spread" :key="`details-${item.position}-${item.card.id}`" class="detail-row">
            <span class="detail-number">{{ index + 1 }}</span>
            <div>
              <p class="position">{{ item.position }} <span v-if="item.reversed" class="inline-reversed">/ перевернута</span></p>
              <p class="position-hint">{{ item.positionDescription }}</p>
              <h3>{{ item.card.name }}</h3>
              <p class="keywords">{{ item.card.keywords.join(' · ') }}</p>
              <p class="meaning">{{ cardMeaning(item) }}</p>
            </div>
          </article>
        </div>
      </div>

      <p v-else class="muted">Обери тип розкладу й натисни кнопку.</p>
      <p v-if="copyStatus" class="success">{{ copyStatus }}</p>
    </section>

    <section v-if="favoriteSpreads.length" class="panel">
      <h2>Обрані розклади</h2>
      <div class="history-list">
        <article v-for="entry in favoriteSpreads" :key="entry.id" class="history-item">
          <div class="history-head">
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.date }}</span>
          </div>
          <div class="history-cards">
            <span v-for="card in entry.cards" :key="card">{{ card }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="spreadHistory.length" class="panel">
      <h2>Історія розкладів</h2>
      <div class="history-list">
        <article v-for="entry in spreadHistory" :key="entry.id" class="history-item">
          <div class="history-head">
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.date }}</span>
          </div>
          <div class="history-cards">
            <span v-for="card in entry.cards" :key="card">{{ card }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>Колода ({{ cards.length }} карт)</h2>
      <ul class="deck-list">
        <li v-for="card in cards" :key="card.id">
          <img class="deck-thumb" :src="card.image" :alt="card.name" loading="lazy" @error="setPlaceholderImage" />
          <div>
            <strong>{{ card.name }}</strong>
            <span>{{ card.keywords.join(', ') }}</span>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { drawSpread, fetchCardOfDay, fetchCards, fetchSpreadDefinitions } from '../services/api';
import { cardMeaning } from '../utils';
import type { DrawnCard, SpreadDefinition, SpreadType, TarotCard } from '../types';

interface StoredSpread {
  id: number;
  title: string;
  date: string;
  cards: string[];
}

const cards = ref<TarotCard[]>([]);
const spread = ref<DrawnCard[]>([]);
const spreadDefinitions = ref<SpreadDefinition[]>([]);
const activeSpreadType = ref<SpreadType>('classic3');
const cardOfDay = ref<DrawnCard | null>(null);
const loading = ref(false);
const error = ref('');
const copyStatus = ref('');
const currentUser = ref(localStorage.getItem('tarot-user') || '');
const theme = ref<'dark' | 'light'>((localStorage.getItem('tarot-theme') as 'dark' | 'light') || 'dark');
const authForm = ref({ name: '' });
const spreadHistory = ref<StoredSpread[]>(loadUserList('history'));
const favoriteSpreads = ref<StoredSpread[]>(loadUserList('favorites'));

const activeSpreadDefinition = computed(() => spreadDefinitions.value.find((item) => item.id === activeSpreadType.value));

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
}

function storageKey(kind: 'history' | 'favorites') {
  return `tarot-${kind}-${currentUser.value}`;
}

function loadUserList(kind: 'history' | 'favorites'): StoredSpread[] {
  if (!currentUser.value) return [];
  return JSON.parse(localStorage.getItem(storageKey(kind)) || '[]') as StoredSpread[];
}

function syncUserLists() {
  spreadHistory.value = loadUserList('history');
  favoriteSpreads.value = loadUserList('favorites');
}

async function loadCards() {
  cards.value = await fetchCards(78);
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
}

async function refreshSpread(type: SpreadType = activeSpreadType.value) {
  const definition = spreadDefinitions.value.find((item) => item.id === type);
  activeSpreadType.value = type;
  loading.value = true;
  error.value = '';
  copyStatus.value = '';

  try {
    spread.value = await drawSpread(definition?.count ?? 3, type);
    saveSpreadToHistory(spread.value, definition?.title ?? `Розклад на ${spread.value.length} карт`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  } finally {
    loading.value = false;
  }
}

function login() {
  if (!authForm.value.name.trim()) return;
  currentUser.value = authForm.value.name.trim();
  localStorage.setItem('tarot-user', currentUser.value);
  authForm.value.name = '';
  syncUserLists();
}

function logout() {
  localStorage.removeItem('tarot-user');
  currentUser.value = '';
  spreadHistory.value = [];
  favoriteSpreads.value = [];
}

function spreadToStoredEntry(cards: DrawnCard[], title: string): StoredSpread {
  return {
    id: Date.now(),
    title,
    date: new Date().toLocaleString('uk-UA'),
    cards: cards.map((card) => `${card.position}: ${card.card.name}${card.reversed ? ' (перевернута)' : ''}`)
  };
}

function saveSpreadToHistory(cards: DrawnCard[], title: string) {
  if (!currentUser.value || !cards.length) return;

  spreadHistory.value.unshift(spreadToStoredEntry(cards, title));
  spreadHistory.value = spreadHistory.value.slice(0, 20);
  localStorage.setItem(storageKey('history'), JSON.stringify(spreadHistory.value));
}

function saveFavoriteSpread() {
  if (!currentUser.value) {
    copyStatus.value = 'Спочатку увійди, щоб зберігати обрані розклади.';
    return;
  }

  if (!spread.value.length) return;

  favoriteSpreads.value.unshift(spreadToStoredEntry(spread.value, activeSpreadDefinition.value?.title ?? 'Обраний розклад'));
  favoriteSpreads.value = favoriteSpreads.value.slice(0, 12);
  localStorage.setItem(storageKey('favorites'), JSON.stringify(favoriteSpreads.value));
  copyStatus.value = 'Розклад додано в обране.';
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
    copyStatus.value = 'Текст розкладу скопійовано.';
  } catch {
    copyStatus.value = 'Не вдалося скопіювати автоматично.';
  }
}

onMounted(async () => {
  applyTheme();

  try {
    await Promise.all([loadCards(), loadCardOfDay(), loadSpreadDefinitions()]);
    await refreshSpread('classic3');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  }
});
</script>

<style scoped>
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

</style>
