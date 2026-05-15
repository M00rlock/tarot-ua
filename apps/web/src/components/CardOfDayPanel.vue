<template>
  <section class="panel">
    <h2>Карта дня</h2>
    <p class="muted">{{ todayLabel }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <article v-if="card" class="card-day">
      <img class="card-image" :class="{ 'is-reversed': card.reversed }" :src="card.card.image" :alt="card.card.name" loading="lazy" decoding="async" @error="$emit('image-error', $event)" />
      <div>
        <p class="position">{{ card.position }}</p>
        <h3>{{ card.card.name }} <span v-if="card.reversed">(перевернута)</span></h3>
        <p class="position-hint">{{ card.positionDescription }}</p>
        <p class="keywords">{{ card.card.keywords.join(' · ') }}</p>
        <p>{{ cardMeaning(card) }}</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { DrawnCard } from '../types';
import { cardMeaning } from '../utils';

defineProps<{
  card: DrawnCard | null;
  todayLabel: string;
  error: string;
}>();

defineEmits<{
  'image-error': [event: Event];
}>();
</script>
