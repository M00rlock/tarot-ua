# Feature Flags v1

The web app supports PostHog feature flags with safe local fallbacks.

## Flags

| PostHog key | Local key | Default | Purpose |
| --- | --- | --- | --- |
| `mystic-hero-v2` | `mysticHeroV2` | `false` | Tests a more cinematic hero section. |
| `advanced-ai` | `advancedAi` | `false` | Marks advanced AI interpretation experiments. |
| `premium-preview` | `premiumPreview` | `false` | Shows a soft premium preview panel. |
| `enhanced-reveal` | `enhancedReveal` | `true` | Enables stronger card reveal animation flow. |

## Usage

```ts
import { useFeatures } from './analytics/useFeatures';

const { flags, isEnabled } = useFeatures();

if (isEnabled('premiumPreview')) {
  // render experiment
}
```

## Notes

- Without `VITE_POSTHOG_KEY`, the app keeps working with default values.
- Flags are intentionally frontend-only for now.
- For monetization gates, mirror the final entitlement check on the backend later.
