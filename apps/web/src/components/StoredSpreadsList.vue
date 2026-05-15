<template>
  <section v-if="items.length" class="panel">
    <h2>{{ title }}</h2>
    <div class="history-list">
      <article v-for="entry in items" :key="entry.id" class="history-item">
        <div class="history-head">
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.date }}</span>
        </div>
        <div class="history-cards">
          <span v-for="card in entry.cards" :key="card">{{ card }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface StoredSpreadView {
  id: string;
  title: string;
  date: string;
  cards: string[];
}

defineProps<{
  title: string;
  items: StoredSpreadView[];
}>();
</script>
