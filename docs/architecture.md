# Architecture and component map

## Runtime model

Collective Stock is a progressively enhanced, multi-entry Vite application made from semantic HTML, Tailwind-generated production CSS, and dependency-light ES modules. Components return native DOM nodes, own only their local state, communicate through events, and render from a shared manifest contract. There is no framework runtime or unsafe metadata-to-HTML interpolation.

### State and data flow

1. `AssetManifestLoader` requests the protected manifest endpoint in production and uses sanitized static manifests during local/static preview.
2. `app.js` creates the immutable asset/division data set, shared search index, favorites store, media controller, toast region, and lightbox.
3. URL state owns searchable/filterable gallery state. Clean Vercel routes and local query routes resolve through the same parser.
4. Page components receive explicit dependencies and return a `<main>` region.
5. Cards dispatch user intent to the shared lightbox/favorites/download layers; they do not mutate the manifest.

## Component contracts

| Component | Responsibility | Owned state / safeguards |
|---|---|---|
| `Header` | Desktop navigation, 20-division mega-menu, parent gallery, mobile navigation | Menu-expanded state, Escape handling, native links/buttons |
| `GlobalSearch` | Debounced search input, suggestions, recent searches | Input/query state; native search form and labels |
| `SearchDialog` | Command-style global discovery | Dialog focus/close behavior and accessible form |
| `FilterBar` | Division, category, type, orientation, license, visibility, format and sort filters | Filter controls dispatch normalized change events |
| `SearchIndex` | Weighted exact, semantic, prefix and typo-tolerant matching | Immutable documents; faceting and stable ranking |
| `MediaGrid` | Responsive result grid and empty state | Render-only; preserves result order |
| `MediaCard` | Image/video preview, metadata, save and detail actions | Explicit dimensions, responsive sources, no raw HTML |
| `MotionPreview` / `LazyMediaController` | Muted in-view preview activation | `IntersectionObserver`, simultaneous-preview cap, teardown, reduced motion |
| `Lightbox` | Large preview and previous/next keyboard navigation | Native modal dialog, focus restoration, Escape behavior |
| `AssetDetail` | Preview, metadata, variants, related assets and rights | Reads one asset record; no permissive fallback |
| `LicenseBadge` | Human-readable rights state | Maps only to approved license definitions |
| `DownloadMenu` | Rendition/original actions | Private originals route through signed server endpoint |
| `FavoritesStore` | Saved asset IDs | Namespaced local storage with defensive parsing |
| `ToastSystem` | Polite success/error feedback | Shared live region and automatic cleanup |
| `ErrorBoundary` | Recoverable boot failure surface | Sanitized user-facing error state |
| `AuditPage` | Public, non-sensitive reconciliation | Accurate counts; detailed ledger remains protected |

## Directory map

```text
/
├── index.html, division.html, asset.html, collections.html, audit.html
├── api/                    # Protected manifest and signed original delivery
├── assets/
│   ├── originals/         # Preserved source files; never copied wholesale to dist
│   ├── optimized/         # AVIF/WebP/JPEG responsive renditions
│   ├── logos/             # Approved source-extracted logo references
│   ├── posters/           # Video/static fallback posters
│   ├── video/             # Original motion assets and future HLS sources
│   └── manifests/         # Source map, assets, provenance, audit and search data
├── src/
│   ├── components/        # DOM components and composite controls
│   ├── data/              # Manifest loader and favorites store
│   ├── licensing/         # Rights definitions
│   ├── media/             # Lazy motion controller
│   ├── pages/             # Homepage, gallery, asset and audit page compositions
│   ├── search/            # Search index/ranking
│   ├── styles/            # Tailwind input/generated CSS and custom system CSS
│   └── utils/             # Safe DOM, URL state and metadata helpers
├── scripts/               # Ingestion, optimization, search, sitemap and validation
├── tests/                 # Vitest contracts and Playwright user journeys
├── docs/                  # Brand/source/architecture/deployment evidence
└── reports/               # QA, performance, critic scorecards and screenshots
```

## Asset pipeline

- Originals remain at native resolution and receive SHA-256 and perceptual hashes.
- Sharp reads dimensions, orientation and color metadata, and writes AVIF, WebP and JPEG thumbnail/card/large renditions without upscaling.
- Transparent or typography-heavy sources preserve the original and conservative derivatives.
- Every record carries stable IDs, classification, provenance, series/revision data, search fields, alt text, rights, visibility, download path, renditions and related assets.
- Validation fails on missing required fields, duplicate stable IDs, unassigned assets, broken source/rendition paths, missing division routes, and unsafe public-original leakage.

## Security model

- Static `dist` contains public optimized renditions only.
- `/api/manifest` requires a valid internal HMAC token before returning private assets or their provenance occurrences.
- `/api/download` resolves a manifest ID, validates access, normalizes the path, confines it to the original/video roots, and streams with attachment headers.
- Private API responses are `no-store` and `noindex`; no secret is bundled into client JavaScript.
- A restrictive CSP, framing denial, permission policy, referrer policy, MIME sniffing protection and same-origin isolation headers are supplied in `vercel.json`.
- Rate limiting and identity-provider token issuance belong at the edge/auth integration boundary; the handlers are structured for both.

## Accessibility and motion

Semantic landmarks, ordered headings, visible focus, 44-pixel controls, alt text, native dialogs, button semantics, URL-backed states and non-hover actions target WCAG 2.2 AA. Motion previews use posters first, `playsinline`, muted playback, `preload=none|metadata`, in-view activation, pause-on-exit, a concurrency cap and complete `prefers-reduced-motion` opt-out.
