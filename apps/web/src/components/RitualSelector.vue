<template>
  <section ref="sectionRef" class="panel controls-panel ritual-panel" :class="{ collapsed }">
    <div class="ritual-head">
      <div>
        <p class="eyebrow">Вибір ритуалу</p>
        <h2>Який розклад вас кличе?</h2>
        <p class="muted">Спочатку оберіть сценарій, далі сторінка сама переведе фокус до карт.</p>
      </div>
      <button v-if="collapsed" class="btn btn-ghost" type="button" @click="$emit('expand')">Змінити розклад</button>
    </div>

    <Transition name="ritual-collapse">
      <div v-if="!collapsed" class="spread-selector spread-selector-v2">
        <button
          v-for="definition in definitions"
          :key="definition.id"
          class="spread-button spread-choice"
          :class="{ active: activeType === definition.id }"
          :disabled="loading"
          @click="$emit('choose', definition.id)"
        >
          <span class="choice-icon">{{ meta(definition.id).icon }}</span>
          <span class="choice-body">
            <strong>{{ definition.title }}</strong>
            <small>{{ meta(definition.id).description }}</small>
            <em>{{ formatCardsCount(definition.count) }}</em>
          </span>
        </button>
      </div>
    </Transition>

    <div v-if="collapsed && activeDefinition" class="active-ritual-summary">
      <span>{{ meta(activeDefinition.id).icon }}</span>
      <div>
        <strong>{{ activeDefinition.title }}</strong>
        <small>{{ meta(activeDefinition.id).description }}</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SpreadDefinition, SpreadType } from '../types';
import { formatCardsCount } from '../utils';

const props = defineProps<{
  definitions: SpreadDefinition[];
  activeType: SpreadType;
  collapsed: boolean;
  loading: boolean;
}>();

defineEmits<{
  choose: [type: SpreadType];
  expand: [];
}>();

const sectionRef = ref<HTMLElement | null>(null);

defineExpose({
  scrollIntoView: () => sectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
});

const activeDefinition = computed(() => props.definitions.find((item) => item.id === props.activeType));

const spreadMetaMap: Record<SpreadType, { icon: string; description: string }> = {
  classic3: { icon: '✦', description: 'Минуле, теперішнє і найближчий напрямок.' },
  pentagram5: { icon: '⛤', description: 'Глибокий огляд ситуації через п’ять позицій.' },
  love5: { icon: '♡', description: 'Емоції, зв’язок, тінь і можливий розвиток.' },
  career5: { icon: '♜', description: 'Фокус, ресурси, перешкоди й наступний крок.' }
};

function meta(type: SpreadType) {
  return spreadMetaMap[type];
}
</script>
