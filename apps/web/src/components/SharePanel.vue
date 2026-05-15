<template>
  <Transition name="share-panel">
    <aside v-if="shareResult" class="share-result" aria-live="polite">
      <div class="share-copy">
        <p class="eyebrow">Публічний розклад</p>
        <h3>Готово до поширення</h3>
        <p class="muted">Створено short URL, social card і PNG preview для месенджерів або соцмереж.</p>
        <div class="share-url-row">
          <input class="share-url" :value="shareResult.url" readonly @focus="$emit('select-url', $event)" />
          <button class="btn btn-secondary" @click="$emit('copy-url')">Копіювати URL</button>
        </div>
        <div class="share-actions">
          <button class="btn btn-ghost" @click="$emit('native-share')">Системно поділитись</button>
          <a v-if="previewUrl" class="btn btn-ghost share-download" :href="previewUrl" download="tarot-spread.png">Завантажити PNG</a>
          <a class="btn btn-ghost share-download" :href="shareResult.social.imageUrl" target="_blank" rel="noreferrer">Social card SVG</a>
        </div>
      </div>
      <img v-if="previewUrl" class="share-preview" :src="previewUrl" alt="Превʼю розкладу для поширення" />
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import type { SharedSpread } from '../types';

defineProps<{
  shareResult: SharedSpread | null;
  previewUrl: string;
}>();

defineEmits<{
  'copy-url': [];
  'native-share': [];
  'select-url': [event: Event];
}>();
</script>
