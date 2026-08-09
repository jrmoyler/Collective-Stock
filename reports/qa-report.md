# QA and validation report

## Final automated result

- Asset pipeline validation: **433 assets validated; 433 unique human-readable titles; 0 broken references; 0 unassigned assets**.
- Google Photos reconciliation: **330/330 album entries ingested; 330 unique hashes; 0 missing; 0 duplicates**.
- Library completeness: **21 component sheets, 21 paired brand reference sheets, and 20 division intro films**; the one monogram film is intentionally global.
- Vitest: **20/20 passed** across album reconciliation, manifest, public projection, licensing and search/ranking contracts.
- Playwright: **13 passed, 1 deliberate desktop skip**. The skipped case is the mobile-only navigation contract in the desktop project, not an unexecuted product path; the same case passes in the mobile project. Both browser profiles verify the 20-film intro collection, muted MP4 derivatives, Escape cleanup, and the 21-sheet component collection.
- Production build: **passed**, including Tailwind minification, Vite multi-entry build, public/private distribution split, pre-rendered route generation and critical-entry verification.
- Lighthouse mobile: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO** with 1,506 ms LCP, 0 ms TBT and 0.00033 CLS.

## Browser and responsive coverage

| Project | Viewport / device | Validated journeys |
|---|---|---|
| Desktop Chromium | 1440 × 1050 | Homepage, live search navigation, division gallery, favorite persistence, lightbox, sort-focus restoration, keyboard combobox, audit route |
| Mobile Chromium | Pixel 7 profile | Same core journeys plus native mobile menu, background inerting, Escape close, focus boundary and horizontal-overflow check |
| Mobile performance | 412 × 915 @2× | Lighthouse and custom slow-4G/4× CPU event metrics |

Visual regression captures are in `reports/screenshots/` for desktop/mobile homepage, desktop/mobile search results, desktop/mobile division pages, and the open mobile navigation. Full-page evidence mode disables only viewport rendering containment and sticky screenshot stitching; production behavior remains tested separately.

## Accessibility contracts exercised

- Native landmark and heading rendering.
- Skip-link visual state and focus-visible behavior.
- Dialog keyboard close and body-scroll cleanup.
- Lightbox Escape cleanup pauses active media and clears its source.
- Combobox/listbox expansion, `aria-activedescendant` and `aria-selected` state.
- Focus retention after filter/sort rerender.
- Lightbox open/close, named video controls, and saved-state button semantics.
- Mobile menu background inerting and Escape cleanup.
- 320 px/mobile reflow and zero horizontal overflow.
- Reduced-motion and forced-colors CSS paths present.
- Lighthouse color-contrast and ARIA audits pass.

The independent accessibility/security review remains authoritative for unautomated screen-reader and identity-provider integration gaps.

## Security and rights checks

- The static distribution contains 413 public records and excludes private originals, internal optimized renditions and private provenance occurrences.
- Anonymous manifest delivery projects discovery fields only; storage paths, filenames, hashes, prompts, source URLs, and all provenance occurrences are removed.
- All 24 public video previews are isolated muted H.264 derivatives. Original image and video downloads are governed by `downloadAuthorization` and require a valid asset-scoped HMAC token unless explicitly public.
- Authorized originals are resolved by manifest ID, confined to approved roots, and streamed from a local file or configured `PRIVATE_ASSET_ORIGIN`.
- Vercel functions include manifests only rather than approximately 650 MB of original media.
- Query-string download tokens are rejected by design; header, bearer or HttpOnly-cookie transport is supported.
- CSP, HSTS, framing denial, MIME-sniff protection, permissions policy and private/no-store API caching are configured.
- Full production and development dependency audit reports zero known vulnerabilities after upgrading the build-time Sharp/libvips pipeline to 0.35.3.

## Evidence limitations and release verdict

The Google Photos export is approved for ingestion: every one of its 330 entries is present, unique, assigned, searchable, and traceable to the source archive. The complete repository has 433 unique records, including the paired component library and 20 intro films. No unrelated stock or cloned media was substituted to manufacture coverage.

This approval is scoped to the supplied media. `Motion MP4s.zip` remains inaccessible at exactly 829,879,395 bytes because it exceeds the Google Drive connector's 100 MB transfer limit; a direct upload or split archive is required. Production identity-provider/private-origin integration still requires deployed end-to-end verification.
