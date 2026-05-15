<template>
  <SeoCardPage v-if="route.kind === 'meaning'" :slug="route.slug" />
  <SeoSpreadPage v-else-if="route.kind === 'spread'" :slug="route.slug" />
  <TarotBoard v-else-if="route.kind === 'session'" />
  <JournalPage v-else-if="route.kind === 'journal'" />
  <LibraryPage v-else-if="route.kind === 'library'" />
  <HomePage v-else />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const HomePage = defineAsyncComponent(() => import('./pages/HomePage.vue'));
const TarotBoard = defineAsyncComponent(() => import('./components/TarotBoard.vue'));
const JournalPage = defineAsyncComponent(() => import('./pages/JournalPage.vue'));
const LibraryPage = defineAsyncComponent(() => import('./pages/LibraryPage.vue'));
const SeoCardPage = defineAsyncComponent(() => import('./pages/SeoCardPage.vue'));
const SeoSpreadPage = defineAsyncComponent(() => import('./pages/SeoSpreadPage.vue'));

const route = computed(() => {
  const path = window.location.pathname;
  const meaningMatch = path.match(/^\/meaning\/([A-Za-z0-9_-]+)\/?$/);
  if (meaningMatch?.[1]) return { kind: 'meaning' as const, slug: meaningMatch[1] };

  const spreadMatch = path.match(/^\/spreads\/([A-Za-z0-9_-]+)\/?$/);
  if (spreadMatch?.[1]) return { kind: 'spread' as const, slug: spreadMatch[1] };

  if (path === '/session' || path === '/session/') return { kind: 'session' as const, slug: '' };
  if (path === '/journal' || path === '/journal/') return { kind: 'journal' as const, slug: '' };
  if (path === '/library' || path === '/library/') return { kind: 'library' as const, slug: '' };

  return { kind: 'home' as const, slug: '' };
});
</script>
