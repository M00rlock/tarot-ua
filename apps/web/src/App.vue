<template>
  <SeoCardPage v-if="route.kind === 'meaning'" :slug="route.slug" />
  <SeoSpreadPage v-else-if="route.kind === 'spread'" :slug="route.slug" />
  <TarotBoard v-else />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const TarotBoard = defineAsyncComponent(() => import('./components/TarotBoard.vue'));
const SeoCardPage = defineAsyncComponent(() => import('./pages/SeoCardPage.vue'));
const SeoSpreadPage = defineAsyncComponent(() => import('./pages/SeoSpreadPage.vue'));

const route = computed(() => {
  const path = window.location.pathname;
  const meaningMatch = path.match(/^\/meaning\/([A-Za-z0-9_-]+)\/?$/);
  if (meaningMatch?.[1]) return { kind: 'meaning' as const, slug: meaningMatch[1] };

  const spreadMatch = path.match(/^\/spreads\/([A-Za-z0-9_-]+)\/?$/);
  if (spreadMatch?.[1]) return { kind: 'spread' as const, slug: spreadMatch[1] };

  return { kind: 'app' as const, slug: '' };
});
</script>
