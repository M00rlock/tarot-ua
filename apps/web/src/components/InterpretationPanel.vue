<template>
  <section v-if="hasSpread" class="panel interpretation-panel" :class="{ 'is-loading': loading }">
    <div class="section-head interpretation-head">
      <div>
        <p class="eyebrow">AI-тлумачення <span v-if="interpretation?.provider" class="provider-pill">{{ interpretation.provider === 'llm' ? 'LLM' : 'fallback' }}</span></p>
        <h2>Цілісне прочитання розкладу</h2>
        <p class="muted">Не просто значення карт окремо — а зв’язки, напруга, порада й наступний крок.</p>
      </div>
      <div class="tone-switcher" aria-label="Тон тлумачення">
        <button
          v-for="toneOption in tones"
          :key="toneOption.value"
          class="tone-button"
          :class="{ active: tone === toneOption.value }"
          type="button"
          :disabled="loading"
          @click="$emit('set-tone', toneOption.value)"
        >
          {{ toneOption.label }}
        </button>
      </div>
    </div>

    <div v-if="loading && !interpretation" class="interpretation-loading">
      <span class="spinner-orb" aria-hidden="true"></span>
      <p>Зчитую взаємодію карт...</p>
    </div>

    <article v-if="interpretation" class="interpretation-card">
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

    <div v-if="loading && interpretation" class="interpretation-refresh" aria-live="polite">
      <span class="spinner-orb spinner-orb-small" aria-hidden="true"></span>
      <span>Оновлюю тон тлумачення...</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { InterpretationTone, SpreadInterpretation } from '../types';

defineProps<{
  hasSpread: boolean;
  interpretation: SpreadInterpretation | null;
  loading: boolean;
  tone: InterpretationTone;
  tones: Array<{ value: InterpretationTone; label: string }>;
}>();

defineEmits<{
  'set-tone': [tone: InterpretationTone];
}>();
</script>
