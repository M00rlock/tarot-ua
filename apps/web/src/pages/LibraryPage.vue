<template>
  <main class="quiet-page">
    <AppNav />

    <section class="quiet-room" aria-labelledby="library-title">
      <p class="quiet-kicker">Бібліотека символів</p>
      <h1 id="library-title">Карти як мова для роздумів</h1>
      <p class="quiet-lead quiet-lead-narrow">
        Бібліотека поступово стане спокійним довідником: значення карт, образи, питання для саморефлексії
        та підказки для особистого щоденника.
      </p>

      <div class="quiet-actions">
        <a class="quiet-btn quiet-btn-primary" href="/session">Почати сесію</a>
        <a class="quiet-btn quiet-btn-ghost" href="/">На головну</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import AppNav from '../components/AppNav.vue';
</script>
