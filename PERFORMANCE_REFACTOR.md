# Performance / Refactor pass

## What changed

- `App.vue` now lazy-loads page-level views with `defineAsyncComponent`.
- `TarotBoard.vue` was slimmed down by moving share preview canvas generation into `src/sharePreview.ts`.
- The full 78-card deck is no longer rendered on initial load. It is lazy-loaded only after pressing “Показати колоду”.
- Card thumbnails now use `decoding="async"`.
- Offscreen panels use `content-visibility: auto` with `contain-intrinsic-size` to reduce initial layout/render work.
- Removed permanent `will-change` from reveal cards to avoid unnecessary memory/compositing overhead.

## Build result

After refactor, Vite splits the frontend into separate chunks:

- main app shell
- Tarot board chunk
- SEO card page chunk
- SEO spread page chunk
- API/meta utility chunks

This should reduce unused JS on SEO pages and avoid loading the heavy board UI for indexable content pages.

## Verified

- `npm test` passes
- `npm run build` passes
