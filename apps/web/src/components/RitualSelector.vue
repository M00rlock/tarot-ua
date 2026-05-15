<template>
  <section ref="sectionRef" class="panel controls-panel ritual-panel" :class="{ collapsed }">
    <div class="ritual-head practice-head">
      <div>
        <p class="eyebrow">Спосіб тихої сесії</p>
        <h2>Якою буде ваша практика?</h2>
        <p class="muted">Не шукайте “правильний” варіант. Оберіть той ритм, який сьогодні відчувається спокійніше.</p>
      </div>
      <button v-if="collapsed" class="btn btn-ghost" type="button" @click="$emit('expand')">Змінити практику</button>
    </div>

    <Transition name="ritual-collapse">
      <div v-if="!collapsed" class="spread-selector spread-selector-v2 practice-grid">
        <button
          v-for="definition in definitions"
          :key="definition.id"
          class="spread-button spread-choice practice-card"
          :class="{ active: activeType === definition.id }"
          :disabled="loading"
          @click="$emit('choose', definition.id)"
        >
          <span class="practice-mark" aria-hidden="true">
            <span class="practice-count">{{ definition.count }}</span>
            <span class="practice-count-label">карт{{ definition.count === 3 ? 'и' : '' }}</span>
          </span>

          <span class="choice-body practice-body">
            <span class="practice-kicker">{{ meta(definition.id).kicker }}</span>
            <strong>{{ meta(definition.id).title }}</strong>
            <small>{{ meta(definition.id).description }}</small>
            <em>{{ meta(definition.id).pace }}</em>
          </span>

          <span class="practice-symbol" aria-hidden="true">{{ meta(definition.id).icon }}</span>
        </button>
      </div>
    </Transition>

    <div v-if="collapsed && activeDefinition" class="active-ritual-summary active-practice-summary">
      <span>{{ meta(activeDefinition.id).icon }}</span>
      <div>
        <strong>{{ meta(activeDefinition.id).title }}</strong>
        <small>{{ meta(activeDefinition.id).description }}</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SpreadDefinition, SpreadType } from '../types';

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

const spreadMetaMap: Record<SpreadType, { icon: string; kicker: string; title: string; description: string; pace: string }> = {
  classic3: {
    icon: '✦',
    kicker: 'коротка пауза',
    title: 'Три кроки всередину',
    description: 'Побачити, що було, що є зараз і куди може повести поточний стан.',
    pace: 'на 5–7 хвилин'
  },
  pentagram5: {
    icon: '◇',
    kicker: 'глибше занурення',
    title: 'П’ять сторін ситуації',
    description: 'Повільніше роздивитись питання: опору, тінь, напругу і можливий наступний крок.',
    pace: 'на 10–15 хвилин'
  },
  love5: {
    icon: '♡',
    kicker: 'про зв’язок',
    title: 'Стосунки і відчуття',
    description: 'М’яко подивитись на емоції, очікування, близькість і те, що хочеться зрозуміти.',
    pace: 'коли важливо відчути'
  },
  career5: {
    icon: '⌁',
    kicker: 'про шлях',
    title: 'Робота і напрям',
    description: 'Зібрати думки про фокус, ресурси, перешкоди і найближчий спокійний крок.',
    pace: 'для ясності'
  }
};

function meta(type: SpreadType) {
  return spreadMetaMap[type];
}
</script>

<style scoped>
.practice-head {
  align-items: flex-start;
}

.practice-head h2 {
  margin-bottom: 0.4rem;
}

.practice-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1.15rem;
  align-items: stretch;
}

.practice-card {
  position: relative;
  min-height: 238px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.9rem;
  padding: 1.1rem 0.95rem 1rem;
  overflow: hidden;
  isolation: isolate;
  text-align: center;
  border-radius: 30px;
  border: 1px solid rgba(146, 158, 216, 0.18) !important;
  background:
    radial-gradient(circle at 50% 0%, rgba(124, 136, 184, 0.16), transparent 8.5rem),
    linear-gradient(180deg, rgba(27, 31, 55, 0.94), rgba(15, 18, 33, 0.9)) !important;
  box-shadow:
    0 18px 54px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.055) !important;
  transition:
    transform 260ms ease,
    border-color 260ms ease,
    box-shadow 260ms ease,
    background 260ms ease;
}

.practice-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 36%),
    radial-gradient(circle at 50% 100%, rgba(199, 185, 139, 0.1), transparent 9rem);
  opacity: 0;
  pointer-events: none;
  transition: opacity 260ms ease;
  z-index: -1;
}

.practice-card:hover:not(:disabled),
.practice-card.active {
  transform: translateY(-2px);
  border-color: rgba(199, 185, 139, 0.34) !important;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(199, 185, 139, 0.05) inset,
    0 0 34px rgba(76, 93, 145, 0.12) !important;
}

.practice-card:hover:not(:disabled)::before,
.practice-card.active::before {
  opacity: 1;
}

.practice-mark {
  width: 4.35rem;
  height: 4.35rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  align-content: center;
  border-radius: 26px;
  color: #eef1ff;
  background:
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.14), transparent 2.4rem),
    linear-gradient(145deg, rgba(76, 93, 145, 0.46), rgba(23, 26, 47, 0.82));
  border: 1px solid rgba(146, 158, 216, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 12px 30px rgba(0, 0, 0, 0.18);
}

.practice-count {
  display: block;
  color: #f2f0df;
  font-size: 1.48rem;
  font-weight: 850;
  line-height: 1;
}

.practice-count-label {
  display: block;
  margin-top: 0.15rem;
  color: rgba(231, 234, 246, 0.58);
  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.practice-body {
  width: 100%;
  display: grid;
  gap: 0.42rem;
  justify-items: center;
  padding-right: 0;
}

.practice-kicker {
  display: block;
  color: rgba(199, 185, 139, 0.78) !important;
  font-size: 0.66rem !important;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.practice-body strong {
  color: #f1f3ff;
  font-size: 1.02rem;
  line-height: 1.22;
  text-wrap: balance;
}

.practice-body small {
  color: rgba(231, 234, 246, 0.68) !important;
  font-size: 0.82rem;
  line-height: 1.5;
  text-wrap: pretty;
}

.practice-body em {
  width: fit-content;
  margin-top: 0.2rem;
  padding: 0.28rem 0.58rem;
  border-radius: 999px;
  color: rgba(231, 234, 246, 0.72) !important;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(146, 158, 216, 0.14);
  font-style: normal;
  font-size: 0.7rem;
  font-weight: 700;
}

.practice-symbol {
  position: absolute;
  right: 50%;
  bottom: 0.55rem;
  transform: translateX(50%);
  color: rgba(199, 185, 139, 0.13) !important;
  font-size: 3.1rem !important;
  line-height: 1;
  pointer-events: none;
}

.active-practice-summary {
  border-radius: 24px;
  border: 1px solid rgba(146, 158, 216, 0.18);
  background: rgba(255, 255, 255, 0.045);
}

@media (max-width: 1120px) {
  .practice-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 760px;
    margin-inline: auto;
  }

  .practice-card {
    min-height: 210px;
  }
}

@media (max-width: 620px) {
  .practice-grid {
    grid-template-columns: 1fr;
    max-width: none;
  }

  .practice-card {
    min-height: 172px;
    align-items: flex-start;
    text-align: left;
    padding: 1rem;
  }

  .practice-body {
    justify-items: start;
  }

  .practice-symbol {
    right: 1rem;
    transform: none;
  }
}
</style>
