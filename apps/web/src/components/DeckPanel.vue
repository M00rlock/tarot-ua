<template>
  <section class="panel deck-panel">
    <div class="section-head">
      <div>
        <h2>Колода ({{ showDeck ? cards.length : 78 }} карт)</h2>
        <p class="muted">Завантажується тільки за потреби, щоб перший екран був швидшим.</p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="$emit('toggle')">
        {{ showDeck ? 'Сховати колоду' : loading ? 'Завантажую...' : 'Показати колоду' }}
      </button>
    </div>
    <ul v-if="showDeck" class="deck-list">
      <li v-for="card in cards" :key="card.id">
        <img class="deck-thumb" :src="card.image" :alt="card.name" loading="lazy" decoding="async" @error="$emit('image-error', $event)" />
        <div>
          <strong>{{ card.name }}</strong>
          <span>{{ card.keywords.join(', ') }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { TarotCard } from '../types';

defineProps<{
  cards: TarotCard[];
  showDeck: boolean;
  loading: boolean;
}>();

defineEmits<{
  toggle: [];
  'image-error': [event: Event];
}>();
</script>
