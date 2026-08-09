# QA and validation report

## Final automated result

- Asset pipeline validation: **371 assets validated; 0 broken references; 0 unassigned assets**.
- Google Photos reconciliation: **330/330 album entries ingested; 330 unique hashes; 0 missing; 0 duplicates**.
- Vitest: **15/15 passed** across album reconciliation, manifest, licensing and search/ranking contracts.
- Playwright: **11 passed, 1 deliberate desktop skip**. The skipped case is the mobile-only navigation contract in the desktop project, not an unexecuted product path; the same case passes in the mobile project. Both browser profiles verify the four-item video collection and a real MP4 response.
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
- Combobox/listbox expansion, `aria-activedescendant` and `aria-selected` state.
- Focus retention after filter/sort rerender.
- Lightbox open/close and saved-state controls.
- Mobile menu background inerting and Escape cleanup.
- 320 px/mobile reflow and zero horizontal overflow.
- Reduced-motion and forced-colors CSS paths present.
- Lighthouse color-contrast and ARIA audits pass.

The independent accessibility/security review remains authoritative for unautomated screen-reader and identity-provider integration gaps.

## Security and rights checks

- The static distribution excludes private originals, internal optimized renditions and private provenance occurrences.
- Anonymous manifest delivery contains public records only.
- Internal originals are resolved by manifest ID, confined to approved roots, and require a valid asset-scoped HMAC token.
- Query-string download tokens are rejected by design; header, bearer or HttpOnly-cookie transport is supported.
- CSP, HSTS, framing denial, MIME-sniff protection, permissions policy and private/no-store API caching are configured.
- Full production and development dependency audit reports zero known vulnerabilities after upgrading the build-time Sharp/libvips pipeline to 0.35.3.

## Evidence limitations and release verdict

The Google Photos export is approved for ingestion: every one of its 330 entries is present, unique, assigned, searchable, and traceable to the source archive. The complete repository has 371 unique assets and includes four working video fixtures. No unrelated stock or cloned media was substituted to manufacture coverage.

This approval is scoped to the supplied export. It does not certify that the album contains every output from every historical conversation, and production identity-provider/private-download integration still requires deployed end-to-end verification.
