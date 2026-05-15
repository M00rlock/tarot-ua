<template>
  <main class="seo-page">
    <a class="seo-back" href="/">← До головної</a>

    <section v-if="loading" class="seo-panel">Завантажую розклад...</section>
    <section v-else-if="!spreadDefinition" class="seo-panel">
      <p class="eyebrow">404</p>
      <h1>Розклад не знайдено</h1>
      <p class="muted">Можливо, цей тип розкладу ще не додано.</p>
      <a class="seo-btn" href="/">Обрати інший розклад</a>
    </section>

    <template v-else>
      <section class="seo-hero">
        <div class="seo-copy">
          <p class="eyebrow">Розклад Таро</p>
          <h1>{{ spreadDefinition.title }}</h1>
          <p class="seo-lead">{{ seoDescription }}</p>
          <a class="seo-btn" :href="`/?spread=${spreadDefinition.id}`">Спробувати цей розклад</a>
        </div>
        <div class="seo-spread-preview" :class="`cards-${spreadDefinition.count}`">
          <span v-for="(_, index) in spreadDefinition.positions" :key="index">{{ index + 1 }}</span>
        </div>
      </section>

      <section class="seo-panel seo-wide">
        <h2>Коли обирати цей розклад</h2>
        <p>{{ useCase }}</p>
      </section>

      <section class="seo-grid positions-grid" aria-label="Позиції розкладу">
        <article v-for="(position, index) in spreadDefinition.positions" :key="position.name" class="seo-panel">
          <p class="eyebrow">Позиція {{ index + 1 }}</p>
          <h2>{{ position.name }}</h2>
          <p>{{ position.description }}</p>
        </article>
      </section>

      <section class="seo-panel seo-wide seo-faq" aria-labelledby="spread-faq-title">
        <h2 id="spread-faq-title">Поширені питання</h2>
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
import { fetchSpreadDefinitions } from '../services/api';
import { setJsonLd, setSeoMeta } from '../seo/meta';
import type { SpreadDefinition, SpreadType } from '../types';

const props = defineProps<{ slug: string }>();
const loading = ref(true);
const spreadDefinition = ref<SpreadDefinition | null>(null);

const slugToType: Record<string, SpreadType> = {
  classic3: 'classic3',
  'past-present-future': 'classic3',
  pentagram5: 'pentagram5',
  pentagram: 'pentagram5',
  love5: 'love5',
  'love-reading': 'love5',
  career5: 'career5',
  'career-reading': 'career5'
};

const seoDescription = computed(() => {
  if (!spreadDefinition.value) return 'Онлайн-розклад Таро з поясненням позицій.';
  return `${spreadDefinition.value.title} — онлайн-розклад на ${spreadDefinition.value.count} карт із поясненням кожної позиції та цілісним тлумаченням.`;
});

const useCase = computed(() => {
  switch (spreadDefinition.value?.id) {
    case 'love5':
      return 'Цей розклад підходить для питань про стосунки, почуття, межі, очікування та приховану напругу між людьми.';
    case 'career5':
      return 'Цей розклад добре працює для професійних рішень, грошей, нових можливостей, ризиків і наступного практичного кроку.';
    case 'pentagram5':
      return 'Пентаграма балансу корисна, коли ситуація має кілька шарів: дії, емоції, думки, результат і внутрішній сенс.';
    default:
      return 'Класичний розклад із трьох карт допомагає швидко побачити минуле, поточний стан і найближчий напрямок розвитку.';
  }
});

const faqItems = computed(() => {
  if (!spreadDefinition.value) return [];
  return [
    {
      question: `Для чого підходить розклад «${spreadDefinition.value.title}»?`,
      answer: useCase.value
    },
    {
      question: `Скільки карт у цьому розкладі?`,
      answer: `У цьому розкладі ${spreadDefinition.value.count} карт із поясненням кожної позиції.`
    },
    {
      question: 'Чи можна зробити цей розклад онлайн?',
      answer: 'Так, можна перейти до інтерактивного розкладу, отримати карти та зберегти або поділитися результатом.'
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
  const definitions = await fetchSpreadDefinitions();
  const type = slugToType[props.slug] || props.slug as SpreadType;
  spreadDefinition.value = definitions.find((item) => item.id === type) || null;
  loading.value = false;

  if (spreadDefinition.value) {
    setSeoMeta({
      title: `${spreadDefinition.value.title} — онлайн-розклад Таро`,
      description: seoDescription.value,
      canonicalPath: `/spreads/${props.slug}`,
      type: 'article'
    });

    setJsonLd('spread-page', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${spreadDefinition.value.title} — онлайн-розклад Таро`,
      description: seoDescription.value,
      author: { '@type': 'Organization', name: 'Таро Черіот' },
      mainEntityOfPage: `${window.location.origin}/spreads/${props.slug}`
    });
    setJsonLd('spread-faq', buildFaqJsonLd());
  } else {
    setSeoMeta({
      title: 'Розклад не знайдено — Таро Черіот',
      description: 'Сторінку розкладу Таро не знайдено.',
      canonicalPath: `/spreads/${props.slug}`
    });
  }
});
</script>
