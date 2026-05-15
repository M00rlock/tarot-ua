<template>
  <section ref="sectionRef" class="panel board-panel" :class="{ 'board-focus': boardPulse }">
    <div class="section-head">
      <div>
        <p class="eyebrow">Розкриття карт</p>
        <h2>Поточний розклад</h2>
        <p class="muted" v-if="activeDefinition">{{ activeDefinition.title }}</p>
      </div>
      <div class="section-actions" v-if="spread.length">
        <button class="btn btn-secondary" @click="$emit('favorite')">★ В обране</button>
        <button class="btn btn-ghost" @click="$emit('copy')">Копіювати текст</button>
        <button class="btn btn-share" :disabled="shareLoading" @click="$emit('share')">📸 Поділитись</button>
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
          <img class="card-image" :class="{ 'is-reversed': item.reversed }" :src="item.card.image" :alt="item.card.name" loading="lazy" decoding="async" @error="$emit('image-error', $event)" />
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
            <img class="board-card-image" :class="{ 'is-reversed': item.reversed }" :src="item.card.image" :alt="item.card.name" loading="lazy" decoding="async" @error="$emit('image-error', $event)" />
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DrawnCard, SpreadDefinition } from '../types';
import { cardMeaning } from '../utils';

defineProps<{
  spread: DrawnCard[];
  activeDefinition?: SpreadDefinition;
  loading: boolean;
  revealKey: number;
  boardPulse: boolean;
  copyStatus: string;
  shareLoading: boolean;
}>();

defineEmits<{
  favorite: [];
  copy: [];
  share: [];
  'image-error': [event: Event];
}>();

const sectionRef = ref<HTMLElement | null>(null);

defineExpose({
  scrollIntoView: () => sectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
});

function revealStyle(index: number) {
  return { '--reveal-delay': `${index * 140}ms` };
}

function detailRevealStyle(index: number) {
  return { '--reveal-delay': `${520 + index * 95}ms` };
}
</script>
