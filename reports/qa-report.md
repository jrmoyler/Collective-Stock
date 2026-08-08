# QA and validation report

## Final automated result

- Asset pipeline validation: **41 assets validated; 0 broken references; 0 unassigned assets**.
- Vitest: **12/12 passed** across manifest, licensing and search/ranking contracts.
- Playwright: **9 passed, 1 deliberate desktop skip**. The skipped case is the mobile-only navigation contract in the desktop project, not an unexecuted product path; the same case passes in the mobile project.
- Production build: **passed**, including Tailwind minification, Vite multi-entry build, public/private distribution split, pre-rendered route generation and critical-entry verification.
- Lighthouse mobile: **98 Performance / 100 Accessibility / 100 Best Practices / 100 SEO** with 1,808 ms LCP and 0.00033 CLS.

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

The functional site and local media set pass their build, asset, responsive and performance gates. The overall product is **not approved as the complete zero-omission project archive** because 265 expected historical outputs remain inaccessible, several content collections are necessarily empty, and real video/private-auth provider payloads are unavailable for end-to-end production certification. No unrelated stock or cloned media was substituted to manufacture coverage.
