<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Пет-проєкт для портфоліо</p>
      <h1>Таро Черіот</h1>
      <p class="subtitle">Vue + NestJS + JanusGraph. Онлайн-розклад і щоденна карта.</p>
      <div class="hero-actions">
        <button class="btn" :disabled="loading" @click="refreshSpread">
          {{ loading ? 'Оновлюю розклад...' : 'Зробити розклад на 3 карти' }}
        </button>
      </div>
    </header>

    <section class="panel">
      <h2>Карта дня</h2>
      <p class="muted">{{ todayLabel }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <article v-if="cardOfDay" class="card-day">
        <img class="card-image" :src="cardOfDay.card.image" :alt="cardOfDay.card.name" loading="lazy" />
        <div>
          <p class="position">{{ cardOfDay.position }}</p>
          <h3>
            {{ cardOfDay.card.name }}
            <span v-if="cardOfDay.reversed">(перевернута)</span>
          </h3>
          <p class="keywords">{{ cardOfDay.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(cardOfDay) }}</p>
        </div>
      </article>
    </section>

    <section class="panel">
      <h2>Поточний розклад</h2>
      <div v-if="spread.length > 0" class="spread-grid">
        <article v-for="item in spread" :key="`${item.position}-${item.card.id}`" class="card-item">
          <img class="card-image" :src="item.card.image" :alt="item.card.name" loading="lazy" />
          <p class="position">{{ item.position }}</p>
          <h3>
            {{ item.card.name }}
            <span v-if="item.reversed">(перевернута)</span>
          </h3>
          <p class="keywords">{{ item.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(item) }}</p>
        </article>
      </div>
      <p v-else class="muted">Натисни кнопку і отримай свій розклад.</p>
    </section>

    <section class="panel">
      <h2>Колода ({{ cards.length }} карт)</h2>
      <ul class="deck-list">
        <li v-for="card in cards" :key="card.id">
          <img class="deck-thumb" :src="card.image" :alt="card.name" loading="lazy" />
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
import { onMounted, ref } from 'vue';
import { drawSpread, fetchCardOfDay, fetchCards } from '../services/api';
import { cardMeaning } from '../utils';
import type { DrawnCard, TarotCard } from '../types';

const cards = ref<TarotCard[]>([]);
const spread = ref<DrawnCard[]>([]);
const cardOfDay = ref<DrawnCard | null>(null);
const loading = ref(false);
const error = ref('');

const todayLabel = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'full'
}).format(new Date());

async function loadCards() {
  cards.value = await fetchCards();
}

async function loadCardOfDay() {
  cardOfDay.value = await fetchCardOfDay();
}

async function refreshSpread() {
  loading.value = true;
  error.value = '';

  try {
    spread.value = await drawSpread(3);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadCards(), loadCardOfDay(), refreshSpread()]);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  }
});
</script>
