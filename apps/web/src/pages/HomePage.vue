<template>
  <main class="quiet-page quiet-home">
    <AppNav />

    <section class="quiet-hero" aria-labelledby="home-title">
      <p class="quiet-kicker">Простір для тихих роздумів</p>
      <h1 id="home-title">Що зараз у вас всередині?</h1>
      <p class="quiet-lead">
        Іноді достатньо зупинитись на кілька хвилин, щоб краще почути себе.
        Карти, нотатки та м’які ШІ-рефлексії допоможуть сповільнитись і подивитись на свій стан уважніше.
      </p>

      <div class="quiet-actions">
        <a class="quiet-btn quiet-btn-primary" href="/session">Почати тиху сесію</a>
        <a class="quiet-btn quiet-btn-ghost" href="/journal">Відкрити щоденник</a>
      </div>
    </section>

    <section class="quiet-intro-grid" aria-label="Що тут можна зробити">
      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">☾</span>
        <h2>Сповільнитись</h2>
        <p>Зробити невелику паузу, сформулювати думку і повернути увагу до себе.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✧</span>
        <h2>Подивитись уважніше</h2>
        <p>Карти працюють як символи: не дають готових відповідей, а допомагають побачити внутрішній стан.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✍</span>
        <h2>Зберегти думки</h2>
        <p>Кожна сесія може стати записом у щоденнику, до якого можна повернутись пізніше.</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import AppNav from '../components/AppNav.vue';
</script>
