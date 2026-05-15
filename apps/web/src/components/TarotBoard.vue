<template>
  <main class="page">
    <div class="ambient-orb orb-one" aria-hidden="true"></div>
    <div class="ambient-orb orb-two" aria-hidden="true"></div>
    <header class="hero hero-ritual">
      <div class="hero-top">
        <p class="eyebrow">Пет-проєкт для портфоліо</p>
        <button class="theme-toggle" type="button" @click="toggleTheme">{{ theme === 'dark' ? '☀️ Світла тема' : '🌙 Mystic тема' }}</button>
      </div>
      <h1>Таро Черіот</h1>
      <p class="subtitle">Зосередьтесь на своєму питанні. Оберіть ритуал — і карти відкриються у правильному ритмі.</p>
      <div class="hero-actions">
        <button class="btn btn-large" type="button" @click="scrollToRitual">Розпочати розклад</button>
        <span class="hero-hint">3–5 карт · перевернуті значення · історія</span>
      </div>
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

    <section ref="ritualSection" class="panel controls-panel ritual-panel" :class="{ collapsed: selectorCollapsed }">
      <div class="ritual-head">
        <div>
          <p class="eyebrow">Вибір ритуалу</p>
          <h2>Який розклад вас кличе?</h2>
          <p class="muted">Спочатку оберіть сценарій, далі сторінка сама переведе фокус до карт.</p>
        </div>
        <button v-if="selectorCollapsed" class="btn btn-ghost" type="button" @click="selectorCollapsed = false">Змінити розклад</button>
      </div>

      <Transition name="ritual-collapse">
        <div v-if="!selectorCollapsed" class="spread-selector spread-selector-v2">
          <button
            v-for="definition in spreadDefinitions"
            :key="definition.id"
            class="spread-button spread-choice"
            :class="{ active: activeSpreadType === definition.id }"
            :disabled="loading"
            @click="chooseSpread(definition.id)"
          >
            <span class="choice-icon">{{ spreadMeta(definition.id).icon }}</span>
            <span class="choice-body">
              <strong>{{ definition.title }}</strong>
              <small>{{ spreadMeta(definition.id).description }}</small>
              <em>{{ definition.count }} карти</em>
            </span>
          </button>
        </div>
      </Transition>

      <div v-if="selectorCollapsed && activeSpreadDefinition" class="active-ritual-summary">
        <span>{{ spreadMeta(activeSpreadDefinition.id).icon }}</span>
        <div>
          <strong>{{ activeSpreadDefinition.title }}</strong>
          <small>{{ spreadMeta(activeSpreadDefinition.id).description }}</small>
        </div>
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

    <section ref="boardSection" class="panel board-panel" :class="{ 'board-focus': boardPulse }">
      <div class="section-head">
        <div>
          <p class="eyebrow">Розкриття карт</p>
          <h2>Поточний розклад</h2>
          <p class="muted" v-if="activeSpreadDefinition">{{ activeSpreadDefinition.title }}</p>
        </div>
        <div class="section-actions" v-if="spread.length">
          <button class="btn btn-secondary" @click="saveFavoriteSpread">★ В обране</button>
          <button class="btn btn-ghost" @click="copySpreadText">Копіювати текст</button>
        </div>
      </div>

      <div v-if="loading" class="shuffle-stage" aria-live="polite">
        <div class="shuffle-stack" aria-hidden="true">
          <span v-for="n in 5" :key="n" class="shuffle-card" :style="{ '--shuffle-index': n - 1 }"></span>
        </div>
        <p class="muted">Перемішую колоду...</p>
      </div>

      <div v-else-if="spread.length === 3" class="spread-grid-3">
        <article v-for="(item, index) in spread" :key="`${item.position}-${item.card.id}-${revealKey}`" class="card-item" :style="revealStyle(index)">
          <div class="card-visual animated-card">
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
          <article v-for="(item, index) in spread" :key="`board-${item.position}-${item.card.id}-${revealKey}`" class="board-slot" :class="`position-${index}`" :style="revealStyle(index)">
            <div class="board-card-frame animated-card">
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
          <article v-for="(item, index) in spread" :key="`details-${item.position}-${item.card.id}-${revealKey}`" class="detail-row reveal-detail" :style="detailRevealStyle(index)">
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

    <section v-if="spread.length" class="panel interpretation-panel">
      <div class="section-head interpretation-head">
        <div>
          <p class="eyebrow">AI-тлумачення</p>
          <h2>Цілісне прочитання розкладу</h2>
          <p class="muted">Не просто значення карт окремо — а зв’язки, напруга, порада й наступний крок.</p>
        </div>
        <div class="tone-switcher" aria-label="Тон тлумачення">
          <button
            v-for="tone in interpretationTones"
            :key="tone.value"
            class="tone-button"
            :class="{ active: interpretationTone === tone.value }"
            type="button"
            :disabled="interpretationLoading"
            @click="setInterpretationTone(tone.value)"
          >
            {{ tone.label }}
          </button>
        </div>
      </div>

      <div v-if="interpretationLoading" class="interpretation-loading">
        <span class="spinner-orb" aria-hidden="true"></span>
        <p>Зчитую взаємодію карт...</p>
      </div>

      <article v-else-if="interpretation" class="interpretation-card">
        <div class="interpretation-summary">
          <h3>{{ interpretation.title }}</h3>
          <p>{{ interpretation.summary }}</p>
        </div>

        <div class="interpretation-energy">
          <strong>Загальна енергія</strong>
          <p>{{ interpretation.energy }}</p>
        </div>

        <div v-if="interpretation.interactions.length" class="interpretation-block">
          <h3>Взаємодія карт</h3>
          <ul>
            <li v-for="item in interpretation.interactions" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="interpretation-grid">
          <div class="interpretation-block">
            <h3>Порада</h3>
            <ul>
              <li v-for="item in interpretation.advice" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="interpretation-block">
            <h3>Тінь</h3>
            <p>{{ interpretation.shadow }}</p>
          </div>
        </div>

        <div class="next-step">
          <strong>Наступний крок</strong>
          <p>{{ interpretation.nextStep }}</p>
        </div>
      </article>
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
import { computed, nextTick, onMounted, ref } from 'vue';
import { drawSpread, fetchCardOfDay, fetchCards, fetchSpreadDefinitions, fetchSpreadInterpretation } from '../services/api';
import { cardMeaning } from '../utils';
import type { DrawnCard, InterpretationTone, SpreadDefinition, SpreadInterpretation, SpreadType, TarotCard } from '../types';

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
const currentUser = ref(localStorage.getItem('tarot-user') || '');
const theme = ref<'dark' | 'light'>((localStorage.getItem('tarot-theme') as 'dark' | 'light') || 'dark');
const authForm = ref({ name: '' });
const spreadHistory = ref<StoredSpread[]>(loadUserList('history'));
const favoriteSpreads = ref<StoredSpread[]>(loadUserList('favorites'));

const activeSpreadDefinition = computed(() => spreadDefinitions.value.find((item) => item.id === activeSpreadType.value));

const interpretationTones: Array<{ value: InterpretationTone; label: string }> = [
  { value: 'psychological', label: 'Психологічно' },
  { value: 'mystic', label: 'Містично' },
  { value: 'practical', label: 'Практично' }
];

const spreadMetaMap: Record<SpreadType, { icon: string; description: string }> = {
  classic3: { icon: '✦', description: 'Минуле, теперішнє і найближчий напрямок.' },
  pentagram5: { icon: '⛤', description: 'Глибокий огляд ситуації через п’ять позицій.' },
  love5: { icon: '♡', description: 'Емоції, зв’язок, тінь і можливий розвиток.' },
  career5: { icon: '♜', description: 'Фокус, ресурси, перешкоди й наступний крок.' }
};

function spreadMeta(type: SpreadType) {
  return spreadMetaMap[type];
}

function scrollToRitual() {
  ritualSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function chooseSpread(type: SpreadType) {
  selectorCollapsed.value = true;
  await refreshSpread(type);
  await nextTick();
  boardSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  interpretation.value = null;
  const definition = spreadDefinitions.value.find((item) => item.id === type);
  activeSpreadType.value = type;
  loading.value = true;
  error.value = '';
  copyStatus.value = '';

  try {
    const [drawnCards] = await Promise.all([
      drawSpread(definition?.count ?? 3, type),
      delay(520)
    ]);
    spread.value = drawnCards;
    revealKey.value += 1;
    await generateInterpretation();
    saveSpreadToHistory(spread.value, definition?.title ?? `Розклад на ${spread.value.length} карт`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  } finally {
    loading.value = false;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function revealStyle(index: number) {
  return { '--reveal-delay': `${index * 140}ms` };
}

function detailRevealStyle(index: number) {
  return { '--reveal-delay': `${520 + index * 95}ms` };
}

async function generateInterpretation() {
  if (!spread.value.length) return;

  interpretationLoading.value = true;

  try {
    interpretation.value = await fetchSpreadInterpretation(spread.value, activeSpreadType.value, interpretationTone.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не вдалося згенерувати тлумачення';
  } finally {
    interpretationLoading.value = false;
  }
}

async function setInterpretationTone(tone: InterpretationTone) {
  interpretationTone.value = tone;
  await generateInterpretation();
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
    selectorCollapsed.value = false;
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
  will-change: transform, opacity, filter;
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
  margin-top: 0.2rem;
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

</style>
