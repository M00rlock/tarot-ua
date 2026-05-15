import { computed, onMounted, ref } from 'vue';
import { isFeatureEnabled, reloadFeatureFlags } from './analytics';

export type FeatureFlagKey = 'mysticHeroV2' | 'advancedAi' | 'premiumPreview' | 'enhancedReveal';

const fallbackFlags: Record<FeatureFlagKey, boolean> = {
  mysticHeroV2: false,
  advancedAi: false,
  premiumPreview: false,
  enhancedReveal: true
};

const postHogFlagKeys: Record<FeatureFlagKey, string> = {
  mysticHeroV2: 'mystic-hero-v2',
  advancedAi: 'advanced-ai',
  premiumPreview: 'premium-preview',
  enhancedReveal: 'enhanced-reveal'
};

const flags = ref<Record<FeatureFlagKey, boolean>>({ ...fallbackFlags });
let loaded = false;

export async function refreshFeatureFlags() {
  await reloadFeatureFlags();

  flags.value = Object.fromEntries(
    Object.entries(postHogFlagKeys).map(([localKey, remoteKey]) => [
      localKey,
      isFeatureEnabled(remoteKey, fallbackFlags[localKey as FeatureFlagKey])
    ])
  ) as Record<FeatureFlagKey, boolean>;

  loaded = true;
}

export function useFeatures() {
  if (!loaded) {
    onMounted(() => {
      void refreshFeatureFlags();
    });
  }

  return {
    flags: computed(() => flags.value),
    isEnabled: (key: FeatureFlagKey) => flags.value[key],
    refreshFeatureFlags
  };
}

export function getExperimentVariant(name: string, variants: string[], fallback = variants[0]) {
  if (!variants.length || typeof window === 'undefined') return fallback;

  const cached = window.localStorage.getItem(`tarot-exp-${name}`);
  if (cached && variants.includes(cached)) return cached;

  const index = Math.abs(hashString(`${name}:${navigator.userAgent}`)) % variants.length;
  const selected = variants[index] ?? fallback;
  window.localStorage.setItem(`tarot-exp-${name}`, selected);
  return selected;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}
