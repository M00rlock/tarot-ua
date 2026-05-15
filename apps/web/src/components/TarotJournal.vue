<template>
  <section v-if="items.length" class="panel journal-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Tarot Journal</p>
        <h2>{{ title }}</h2>
        <p class="muted">Збережені розклади як особистий архів: карти, позиції, AI-тлумачення і твої нотатки.</p>
      </div>
      <span class="journal-count">{{ items.length }} {{ items.length === 1 ? 'запис' : 'записів' }}</span>
    </div>

    <div class="journal-timeline">
      <section v-for="group in groupedItems" :key="group.month" class="journal-month">
        <h3>{{ group.month }}</h3>

        <article v-for="entry in group.items" :key="entry.id" class="journal-card" :class="{ expanded: expandedId === entry.id }">
          <button class="journal-summary" type="button" @click="toggle(entry.id)">
            <span class="journal-icon">✦</span>
            <span class="journal-main">
              <strong>{{ entry.title }}</strong>
              <small>{{ formatDate(entry.createdAt) }} · {{ entry.cards.length }} {{ pluralizeCards(entry.cards.length) }} · {{ toneLabel(entry.interpretation?.tone) }}</small>
            </span>
            <span class="journal-chevron">{{ expandedId === entry.id ? '−' : '+' }}</span>
          </button>

          <div v-if="expandedId === entry.id" class="journal-details">
            <div class="journal-card-grid">
              <article v-for="drawn in entry.cards" :key="`${entry.id}-${drawn.position}-${drawn.card.id}`" class="journal-drawn-card">
                <img :src="drawn.card.image" :alt="drawn.card.name" :class="{ 'is-reversed': drawn.reversed }" loading="lazy" decoding="async" @error="emit('image-error', $event)" />
                <div>
                  <span class="journal-position">{{ drawn.position }}</span>
                  <strong>{{ drawn.card.name }}</strong>
                  <small v-if="drawn.reversed">Перевернута</small>
                  <p>{{ drawn.positionDescription }}</p>
                </div>
              </article>
            </div>

            <div v-if="entry.interpretation" class="journal-interpretation">
              <div class="journal-meta-row">
                <span>{{ entry.interpretation.provider === 'llm' ? 'LLM' : 'Fallback' }}</span>
                <span>{{ toneLabel(entry.interpretation.tone) }}</span>
              </div>
              <h4>{{ entry.interpretation.title }}</h4>
              <p>{{ entry.interpretation.summary }}</p>
              <p><strong>Енергія:</strong> {{ entry.interpretation.energy }}</p>
              <p><strong>Тінь:</strong> {{ entry.interpretation.shadow }}</p>
              <p><strong>Наступний крок:</strong> {{ entry.interpretation.nextStep }}</p>
            </div>

            <label class="journal-note">
              <span>Особиста нотатка</span>
              <textarea :value="draftNotes[entry.id] ?? entry.note ?? ''" placeholder="Що відчувається після цього розкладу? Що справдилось пізніше?" rows="4" @input="updateDraft(entry.id, $event)"></textarea>
            </label>

            <div class="journal-actions">
              <button class="btn btn-secondary" type="button" @click="emit('open', entry)">Відкрити розклад</button>
              <button class="btn btn-ghost" type="button" @click="saveNote(entry)">Зберегти нотатку</button>
            </div>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { CloudSpread, InterpretationTone } from '../types';

const props = defineProps<{
  title: string;
  items: CloudSpread[];
}>();

const emit = defineEmits<{
  open: [entry: CloudSpread];
  'save-note': [payload: { id: string; note: string }];
  'image-error': [event: Event];
}>();

const expandedId = ref<string>('');
const draftNotes = reactive<Record<string, string>>({});

const groupedItems = computed(() => {
  const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  const groups = new Map<string, CloudSpread[]>();

  props.items.forEach((item) => {
    const month = formatter.format(new Date(item.createdAt));
    groups.set(month, [...(groups.get(month) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([month, items]) => ({ month, items }));
});

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? '' : id;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

function pluralizeCards(count: number) {
  if (count === 1) return 'карта';
  if (count >= 2 && count <= 4) return 'карти';
  return 'карт';
}

function toneLabel(tone?: InterpretationTone) {
  const labels: Record<InterpretationTone, string> = {
    psychological: 'Психологічно',
    mystic: 'Містично',
    practical: 'Практично'
  };
  return tone ? labels[tone] : 'Без тону';
}

function updateDraft(id: string, event: Event) {
  draftNotes[id] = (event.target as HTMLTextAreaElement).value;
}

function saveNote(entry: CloudSpread) {
  emit('save-note', {
    id: entry.id,
    note: draftNotes[entry.id] ?? entry.note ?? ''
  });
}
</script>
