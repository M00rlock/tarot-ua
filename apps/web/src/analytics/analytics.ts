import type { DrawnCard, InterpretationTone, SpreadType } from '../types';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

type PostHogLike = {
  init: (key: string, options?: Record<string, unknown>) => void;
  capture: (event: string, properties?: AnalyticsProperties) => void;
  identify: (id: string, properties?: AnalyticsProperties) => void;
  reset: () => void;
  opt_out_capturing?: () => void;
  opt_in_capturing?: () => void;
};

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';
const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
const IS_BROWSER = typeof window !== 'undefined';

let initialized = false;
let loadPromise: Promise<void> | null = null;
const queuedEvents: Array<{ name: string; properties?: AnalyticsProperties }> = [];

function isDoNotTrackEnabled() {
  if (!IS_BROWSER) return true;

  return navigator.doNotTrack === '1' || window.localStorage.getItem('tarot-analytics-opt-out') === 'true';
}

function loadPostHogScript(): Promise<void> {
  if (!IS_BROWSER || !POSTHOG_KEY || !ANALYTICS_ENABLED || isDoNotTrackEnabled()) {
    return Promise.resolve();
  }

  if (window.posthog) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `${POSTHOG_HOST.replace(/\/$/, '')}/static/array.js`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return loadPromise;
}

function flushQueue() {
  if (!window.posthog) return;

  while (queuedEvents.length) {
    const event = queuedEvents.shift();
    if (event) window.posthog.capture(event.name, event.properties);
  }
}

export async function initAnalytics() {
  if (initialized || !IS_BROWSER || !POSTHOG_KEY || !ANALYTICS_ENABLED || isDoNotTrackEnabled()) {
    return;
  }

  await loadPostHogScript();

  if (!window.posthog) return;

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    autocapture: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: true
      }
    }
  });

  initialized = true;
  trackPageView();
  flushQueue();
}

export function trackEvent(name: string, properties?: AnalyticsProperties) {
  if (!IS_BROWSER || !ANALYTICS_ENABLED || isDoNotTrackEnabled()) return;

  const payload = {
    path: window.location.pathname,
    ...properties
  };

  if (!initialized || !window.posthog) {
    queuedEvents.push({ name, properties: payload });
    return;
  }

  window.posthog.capture(name, payload);
}

export function trackPageView() {
  trackEvent('$pageview', {
    title: document.title,
    url: window.location.href
  });
}

export function identifyUser(user: { id?: string; email?: string; name?: string; premiumTier?: string } | null) {
  if (!IS_BROWSER || !window.posthog || !user?.id) return;

  window.posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    premiumTier: user.premiumTier
  });
}

export function resetAnalyticsUser() {
  if (!IS_BROWSER || !window.posthog) return;
  window.posthog.reset();
}

export function setAnalyticsOptOut(value: boolean) {
  if (!IS_BROWSER) return;

  window.localStorage.setItem('tarot-analytics-opt-out', String(value));

  if (value) {
    window.posthog?.opt_out_capturing?.();
  } else {
    window.posthog?.opt_in_capturing?.();
    void initAnalytics();
  }
}

export function spreadAnalyticsPayload(spread: DrawnCard[], spreadType: SpreadType) {
  return {
    spreadType,
    cardsCount: spread.length,
    reversedCount: spread.filter((card) => card.reversed).length,
    cardIds: spread.map((item) => item.card.id).join(','),
    positions: spread.map((item) => item.position).join(',')
  };
}

export function interpretationAnalyticsPayload(input: {
  spread: DrawnCard[];
  spreadType: SpreadType;
  tone: InterpretationTone;
  source?: string;
}) {
  return {
    ...spreadAnalyticsPayload(input.spread, input.spreadType),
    tone: input.tone,
    source: input.source
  };
}
