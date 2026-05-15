<template>
  <main class="quiet-page">
    <AppNav />

    <section class="quiet-room" aria-labelledby="journal-title">
      <p class="quiet-kicker">Особистий щоденник</p>
      <h1 id="journal-title">Історія внутрішнього стану</h1>
      <p class="quiet-lead quiet-lead-narrow">
        Тут поступово з’явиться окремий простір для записів: дата, питання, карти, рефлексія та власні нотатки.
        Поки що щоденник доступний у тихій сесії після входу в акаунт.
      </p>

      <div class="quiet-actions">
        <a class="quiet-btn quiet-btn-primary" href="/session">Перейти до сесії</a>
        <a class="quiet-btn quiet-btn-ghost" href="/">На головну</a>
      </div>
    </section>

    <section class="quiet-note-panel">
      <h2>Ідея щоденника</h2>
      <p>
        Це не просто історія розкладів. Це місце, де можна бачити, які теми повторюються,
        які питання повертаються і що з часом стає зрозумілішим.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import AppNav from '../components/AppNav.vue';
</script>
