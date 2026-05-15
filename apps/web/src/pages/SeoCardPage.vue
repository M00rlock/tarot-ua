<template>
  <main class="seo-page">
    <a class="seo-back" href="/">← До розкладу</a>

    <section v-if="loading" class="seo-panel">Завантажую значення карти...</section>
    <section v-else-if="!card" class="seo-panel">
      <p class="eyebrow">404</p>
      <h1>Карту не знайдено</h1>
      <p class="muted">Схоже, такого аркана ще немає у колоді.</p>
      <a class="seo-btn" href="/">Повернутись до розкладу</a>
    </section>

    <template v-else>
      <section class="seo-hero seo-card-hero">
        <div class="seo-copy">
          <p class="eyebrow">Значення карти Таро</p>
          <h1>{{ pageTitle }}</h1>
          <p class="seo-lead">{{ pageDescription }}</p>
          <div class="seo-tags">
            <span v-for="keyword in card.keywords" :key="keyword">{{ keyword }}</span>
          </div>
          <a class="seo-btn" href="/">Зробити розклад</a>
        </div>
        <img class="seo-card-image" :class="{ 'is-reversed': isReversedPage }" :src="card.image" :alt="card.name" width="280" height="420" loading="eager" fetchpriority="high" />
      </section>

      <section class="seo-grid">
        <article class="seo-panel">
          <h2>Пряме положення</h2>
          <p>{{ card.meaningUpright }}</p>
        </article>
        <article class="seo-panel accent">
          <h2>Перевернуте положення</h2>
          <p>{{ card.meaningReversed }}</p>
        </article>
        <article class="seo-panel">
          <h2>{{ card.name }} у коханні</h2>
          <p>{{ loveMeaning }}</p>
        </article>
        <article class="seo-panel">
          <h2>{{ card.name }} у кар’єрі та грошах</h2>
          <p>{{ careerMeaning }}</p>
        </article>
      </section>

      <section class="seo-panel seo-wide">
        <h2>Порада карти</h2>
        <p>{{ advice }}</p>
      </section>

      <section class="seo-panel seo-wide seo-faq" aria-labelledby="card-faq-title">
        <h2 id="card-faq-title">Поширені питання</h2>
        <details v-for="item in faqItems" :key="item.question">
          <summary>{{ item.question }}</summary>
          <p>{{ item.answer }}</p>
        </details>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchCards } from '../services/api';
import { setJsonLd, setSeoMeta } from '../seo/meta';
import type { TarotCard } from '../types';

const props = defineProps<{ slug: string }>();
const loading = ref(true);
const card = ref<TarotCard | null>(null);

const isReversedPage = computed(() => props.slug.endsWith('-reversed'));
const cleanSlug = computed(() => props.slug.replace(/-reversed$/, ''));

const pageTitle = computed(() => {
  if (!card.value) return 'Значення карти Таро';
  return isReversedPage.value
    ? `Що означає перевернута ${card.value.name}`
    : `Значення карти ${card.value.name}`;
});

const pageDescription = computed(() => {
  if (!card.value) return 'Повне значення карти Таро у прямому та перевернутому положенні.';
  const base = isReversedPage.value ? card.value.meaningReversed : card.value.meaningUpright;
  return `${base} Ключові теми: ${card.value.keywords.join(', ')}.`;
});

const loveMeaning = computed(() => {
  if (!card.value) return '';
  const tone = isReversedPage.value ? card.value.meaningReversed : card.value.meaningUpright;
  return `У стосунках ${card.value.name} підсвічує тему «${card.value.keywords[0]}». ${tone} Це запрошення чесно подивитися на бажання, межі та спосіб взаємодії з іншою людиною.`;
});

const careerMeaning = computed(() => {
  if (!card.value) return '';
  const tone = isReversedPage.value ? card.value.meaningReversed : card.value.meaningUpright;
  return `У роботі та фінансах ця карта говорить про ${card.value.keywords.join(', ')}. ${tone} Сфокусуйся на практичному кроці, який можна зробити вже зараз.`;
});

const advice = computed(() => {
  if (!card.value) return '';
  return isReversedPage.value
    ? `Не тисни на ситуацію. Перевернута карта радить побачити блок, назвати його чесно й повернути собі опору через маленьку дію.`
    : `Використай енергію карти як напрямок: ${card.value.keywords.join(', ')}. Один ясний крок краще за десять тривожних сценаріїв.`;
});

const faqItems = computed(() => {
  if (!card.value) return [];
  return [
    {
      question: `Що означає карта ${card.value.name}?`,
      answer: card.value.meaningUpright
    },
    {
      question: `Що означає ${card.value.name} у перевернутому положенні?`,
      answer: card.value.meaningReversed
    },
    {
      question: `Яка головна порада карти ${card.value.name}?`,
      answer: advice.value
    }
  ];
});

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.value.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };
}

onMounted(async () => {
  const cards = await fetchCards(78);
  card.value = cards.find((item) => item.id === cleanSlug.value) || null;
  loading.value = false;

  if (card.value) {
    setSeoMeta({
      title: `${pageTitle.value} — Таро Черіот`,
      description: pageDescription.value,
      canonicalPath: `/meaning/${props.slug}`,
      image: card.value.image,
      type: 'article'
    });

    setJsonLd('card-meaning', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pageTitle.value,
      description: pageDescription.value,
      image: `${window.location.origin}${card.value.image}`,
      author: { '@type': 'Organization', name: 'Таро Черіот' },
      mainEntityOfPage: `${window.location.origin}/meaning/${props.slug}`
    });
    setJsonLd('card-faq', buildFaqJsonLd());
  } else {
    setSeoMeta({
      title: 'Карту не знайдено — Таро Черіот',
      description: 'Сторінку значення карти не знайдено.',
      canonicalPath: `/meaning/${props.slug}`
    });
  }
});
</script>
