# Immersive experience — implementation and QA

The redesign keeps Collective Stock's manifest-driven architecture, all twenty active divisions, scoped collections, rights checks, server delivery and MCP integration. It adds a real Three.js artwork gallery, editorial discovery, a saved collection, native sharing with a recoverable clipboard fallback, and touch navigation.

## Evidence

- Design concept: [immersive-gallery-concept.webp](immersive-gallery-concept.webp), generated with built-in Image Gen before implementation. Prompt: a midnight/gold editorial media archive with the exact primary copy, native search/navigation, dimensional archive photographs and a downstream collection section. The concept is direction, never used as flattened app UI.
- [Desktop 1536 × 1024](desktop.webp), [mobile 390 × 844](mobile.webp), [mobile gallery controls](mobile-gallery.webp), [asset detail and share fallback](asset-mobile.webp).
- [WebGL and responsive check results](verification.json).
- Cloud Browser could not reach the local development server (`ERR_CONNECTION_REFUSED`). Visual and functional verification therefore used local Playwright Chromium. Screenshots are real renders with actual catalog media.

## Validation completed

- Asset pipeline: 466 catalog assets, zero broken references or unassigned records.
- Production distribution: 446 public records, every public image rendition/video preview present; original security boundary preserved; all static entry points verified.
- Unit tests: 33 passed across 9 files.
- Browser regression suite: 30 passed across desktop and Pixel 7 emulation. Two desktop cases are intentionally skipped because they test mobile-only navigation.
- WebGL2 enhancement tested using Chromium 149 software rendering: real canvas pixels change when selecting a different artwork; no page errors or failed HTTP requests.
- Interaction/layout checks under 4× CPU throttling at widths 320, 390, 768 and 1440: zero horizontal page overflow. This is not a physical-device FPS benchmark.
- Context loss: the visible DOM artwork fallback returns and navigation remains functional.
- Reduced motion: no WebGL canvas; instant artwork selection remains available.
- Saved items survive navigation and reload; removing the last item produces the intentional empty state.
- Compact view changes the column count and recalculates masonry row spans.
- Search survives corrupt local storage; sorting preserves keyboard focus; modal Escape cleans up videos; mobile drawer focus/inert handling remains intact.
- Public previews, restricted download messaging and a denied/unavailable share API fallback were exercised. Authenticated original-file delivery still requires the existing deployment credentials.

## Fidelity ledger

Concept and final desktop render were inspected with `view_image` at native 1536 × 1024, together with mobile render evidence.

| Comparison | Result / correction |
| --- | --- |
| Primary copy | Hero, description, Explore the archive, Surprise me, search placeholder and collection heading match. No added hero eyebrow. |
| Layout hierarchy | Split copy/gallery, category band and uneven editorial collection introduction retained. Mobile stacks these with fixed quick navigation. |
| Typography | Space Grotesk roles and tight heading rhythm retained; font display changed to swap so the intended face loads reliably. |
| Palette | Midnight #050A18, gold #D4A843, ivory #F5F5F5 and teal focus accents match the design record. |
| Dimensional composition | Real framed 3D image planes, perspective and pointer response. Enlarged camera framing after screenshot review. |
| Media provenance | Intentional difference: actual catalog photographs replace the concept generator's imagined variations; full asset previews retain original aspect ratios. |
| Navigation | Existing brand diamond retained. Taxonomy/MCP/licensing live in the division menu, mobile drawer and footer; Saved is directly accessible. These functional extensions preserve the app's existing destinations. |
| Responsive behavior | Fixed oversized perspective overflow and inherited mobile tile minimum widths; verified 320–1536px. Mobile dock no longer suffers pointer interception from the gallery. |
| Fallback | Same artwork, order and controls without WebGL; no blank canvas or required GPU-only interaction. |

The implementation was visually checked against the concept for the primary composition, copy, typography, palette and interaction hierarchy. Documented adaptations use the real archive and preserve the existing app's broader information architecture. No unresolved clipping, overflow, broken control or missing requested media remains in the tested views. Virality and performance on every physical device are not represented as tested outcomes.

## Reproduce

```sh
npm ci
npm run build
npm test
node scripts/extract-test-browser.js
npm run test:e2e
npm run verify:experience
```

`verify:experience` emits disposable PNG/JSON evidence under `reports/immersive-experience/`; the reviewed, compressed snapshots above are committed with the PR. Three.js is dynamically imported only for the visible home gallery; its compressed chunk is about 132 kB. No endless render loop, autoplay carousel or scroll hijacking is used.
