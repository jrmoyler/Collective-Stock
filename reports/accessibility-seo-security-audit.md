# Collective Stock accessibility, SEO, and security audit — second verification pass

**Verdict: NOT APPROVED.** This is an independent verification report, not an implementation sign-off. The revision resolves six original accessibility/SEO/security findings and the high Sharp advisory, but one high-severity production blocker remains: authenticated users still have no complete server-rendered/private detail route and no implemented token-issuance/session path that connects the internal manifest to private downloads. Seven medium and three low findings also remain.

Audit date: 2026-08-08 (America/New_York)  
Reviewed path: `/workspace/scratch/7ac83610e35a/collective-stock`  
Application code changed by this reviewer: **none**; only this Markdown report and its JSON companion were updated.

## Outcome since the first pass

| Finding/control | Second-pass status | Verification evidence |
|---|---:|---|
| Mobile search accessible name | **Resolved** | `header.js` supplies `aria-label="Search archive"`; desktop and mobile Playwright resolve the trigger by that role/name. |
| Search-dialog Escape cleanup | **Pass** | Escape closes the native dialog and removes `body.has-dialog`; covered by the desktop and mobile E2E project. |
| Search combobox ARIA/keyboard state | **Resolved** | Input has `role="combobox"`, `aria-haspopup="listbox"`, `aria-controls`, `aria-expanded`, and an updated `aria-activedescendant`; exactly one active option gets `aria-selected="true"`, while DOM focus stays in the input. |
| Filter focus retention | **Pass** | Category/sort rerenders restore focus by control name; the committed E2E asserts the sort select remains focused after change. |
| Mobile navigation focus isolation | **Pass in tested scope** | At the mobile project viewport, opening the nav marks page `main` inert, confines focus, prevents horizontal overflow, and Escape closes the nav and removes inert. Source also restores the trigger. |
| Mega-menu Escape restoration | **Resolved** | `header.js` records whether the menu was open and focuses the Divisions trigger if Escape closes while focus is inside the mega-menu. |
| Text contrast | **Resolved for the original failures** | Small division indices use a 60% accent/40% white mix; calculated ratios on navy range from 7.27:1 to 15.72:1. Footer legal `#78879b` on `#050A18` is 5.40:1. Lighthouse `color-contrast` passes. |
| HSTS | **Configured** | `vercel.json` sets `max-age=63072000; includeSubDomains; preload`. This was not black-box verified on a deployment. |
| Token in query string | **Resolved** | `api/download.js` now accepts a dedicated header, Bearer header, or dedicated cookie; no download capability is read from `request.query`. |
| Public audit missing count | **Resolved** | `api/manifest.js` preserves the real audit object for public clients; `dist/assets/manifests/audit-summary.json` exposes `missingOrInaccessible: 265`, and E2E verifies the public audit page displays the number without private original paths. |
| Crawlable route bodies / 63 URLs | **Resolved** | Build contains 62 generated route files—21 division, 20 collection, 21 public asset pages—and all 62 contain `main#main-content` plus an H1 fallback. Sitemap contains 63 URLs including home. |
| Lighthouse Accessibility / SEO | **100 / 100** | `reports/lighthouse-mobile.json`, final exact-build local homepage run at 412×915-equivalent mobile emulation: Accessibility 100, SEO 100, Best Practices 100, Performance 98; LCP 1807.518 ms, CLS 0.000330, TBT 0. |
| Sharp/libvips advisory | **Resolved** | Sharp 0.35.3 is installed. A fresh full `npm audit --json` reports 0 critical/high/moderate/low vulnerabilities across production and development dependencies. |

## Evidence and limits

| Check | Result | What was actually tested |
|---|---:|---|
| `npm run build` | Pass in the revised workspace | Asset validation, CSS/Vite build, public-copy step, pre-rendering, and distribution verification passed in this review cycle. |
| `npm test` | 12/12 pass | Unit coverage for manifest, licensing, and search behavior. |
| `npm run test:e2e` | 9 pass, 1 project-inapplicable skip | Desktop and mobile homepage/search, gallery/save/lightbox/filter, combobox/Escape, public audit, and mobile navigation tests pass. The mobile-only navigation test is intentionally skipped in the desktop project. |
| Local Lighthouse artifact | 98 / 100 / 100 / 100 | Performance / Accessibility / Best Practices / SEO for the homepage only, generated 2026-08-08T14:37:53.869Z at `http://127.0.0.1:4173/`. |
| Static route validation | Pass | 62 route HTML files; none lacks the semantic fallback `main` or H1. Sitemap has 63 URLs. |
| Contrast calculation | Text pass; focus risk | Original small text failures now exceed 4.5:1. The global translucent focus ring still composites to only about 1.90–1.98:1 on the primary dark surfaces. |
| Full dependency audit | Pass | Sharp 0.35.3; zero advisories in the current full npm dependency graph. |
| Preferred shared-browser validation | Blocked | The shared cloud browser rejected the local preview with `ERR_BLOCKED_BY_CLIENT`; repository Chromium/Playwright was used for rendered verification. |

The following were **not tested** and must not be inferred from automated scores: deployed Vercel response headers, production HSTS preload eligibility, CSP reporting telemetry, a real identity provider or token issuer, secure-cookie attributes, revocation, authenticated private route rendering, CDN/object-storage signed URLs, rate-limit enforcement, NVDA/JAWS/VoiceOver/TalkBack, Safari/Firefox behavior, 400% zoom, Windows high contrast, real video captions/transcripts, and field Core Web Vitals. Lighthouse 100 Accessibility/SEO covers only its automated homepage audits; it is not WCAG certification or a catalog-wide SEO guarantee.

## Severity-ranked remaining findings

### High

#### SEC-001 — Authenticated private detail/download is still not an end-to-end production flow

- **Tested facts:** `scripts/generate-static-routes.js` emits asset entry files only for the public manifest, and `dist/assets/` contains 21 public asset HTML files. `src/utils/routes.js` nevertheless builds `/assets/{id}` for every asset. Only `api/manifest.js` and `api/download.js` exist; no route or endpoint mints capabilities or creates a signed-in session. The manifest accepts `collective_library_token`, while downloads require a separate asset-scoped capability from a header/Bearer token/`collective_download_token` cookie. `DownloadMenu` sends credentials but does not request or attach a minted asset capability.
- **Impact:** The deny-by-default delivery gate is useful, but an authorized internal user has no demonstrated production route from authentication to private detail to private download. The UI’s “Internal access” and “protected delivery” claims are therefore ahead of implemented behavior.
- **Files:** `src/utils/routes.js`, `src/components/download-menu.js`, `src/components/header.js`, `scripts/generate-static-routes.js`, `api/manifest.js`, `api/download.js`, `vercel.json`.
- **Concrete fix:** Add an authenticated private asset shell/SSR or protected catch-all route; implement a short-lived, asset-scoped capability issuer derived from the authenticated library session; use audience, subject, asset ID, rendition, expiry, nonce, and revocation; deliver via an HttpOnly/Secure/SameSite cookie or authorization header; add audit logging without logging the token.
- **Required verification:** Against a deployed preview, test signed out, signed in, wrong asset, wrong rendition, expired, replayed, revoked, direct static URL, and no-JavaScript access. Verify private routes return `X-Robots-Tag: noindex, nofollow, noarchive` and never enter the sitemap.

### Medium

#### A11Y-005 — Focus indicator remains too low-contrast for the project’s accessibility bar

- **Tested fact:** `--focus` is a 3px `rgba(0,217,181,.3)` shadow and native outlines are removed. Its composited contrast against navy/elevated surfaces is approximately 1.90–1.98:1.
- **Impact:** Lighthouse does not flag this, but keyboard focus can be difficult to perceive, creating risk under WCAG 2.4.7 and the product’s visible-focus requirement.
- **File/fix:** In `src/styles/app.css`, use an opaque 2px+ outline with offset and at least 3:1 non-text contrast; retain the shadow only as enhancement. Test sticky/filter/dialog clipping and forced-colors mode.

#### A11Y-006 — Lightbox slide changes are not announced

- **Tested/static fact:** `src/components/lightbox.js` replaces the preview, title, and index after Previous/Next, but the changing region has no live status and the dialog name remains generic “Asset preview.”
- **Impact:** A screen-reader user may not know that navigation changed the active asset.
- **Concrete fix:** Give the current H2 a stable ID and use `aria-labelledby`; announce the changed title/index through a restrained `aria-live="polite"`/status node while preserving focus on the navigation button.

#### A11Y-007 — The explicit 44×44 project target is not proven for every standalone link

- **Tested facts:** Core icon buttons, selects, search controls, and suggestions have 44px or greater targets, and Lighthouse `target-size` passes. Some standalone text links—especially footer/title links—do not declare a 44px minimum hit box.
- **Impact:** This likely satisfies WCAG 2.5.8 through its 24px/spacing/inline exceptions, but it does not prove the user’s stricter “at least 44×44 pixels” acceptance criterion.
- **Concrete fix:** Apply non-overlapping 44px minimum hit areas to standalone text links and add computed-bounding-box assertions for every interactive element at 320/390/768/1440px.

#### SEO-002 — Empty collection routes remain indexable and included in the sitemap

- **Tested fact:** The public distribution contains 21 assets in only two categories (`Brand Sheets`: 20; `UI Mockups`: 1), while all 20 collection URLs are in the 63-URL sitemap and their generated fallbacks are indexable.
- **Impact:** Empty/thin landing pages dilute crawl quality and can create poor search-result experiences even though Lighthouse SEO is 100.
- **Files/fix:** In `scripts/generate-sitemap.js` and `scripts/generate-static-routes.js`, compute public collection counts; omit empty collections from the sitemap and emit `noindex,follow` until content exists, or add substantial intentional editorial content.

#### SEO-003 — Rich asset/collection/social metadata remains incomplete

- **Tested fact:** Route-specific titles, descriptions, canonicals, and basic Open Graph tags are generated. There is still no per-route `ImageObject`, `CollectionPage`, or `BreadcrumbList` JSON-LD, Twitter card set, or image sitemap entry; generated asset OG type is `website`.
- **Impact:** Lighthouse SEO 100 does not validate rich-result eligibility or social-preview completeness.
- **Files/fix:** Extend `scripts/generate-static-routes.js`, `scripts/generate-sitemap.js`, and `src/utils/metadata.js` with safely escaped per-route structured data, image metadata/alt/dimensions/type, Twitter summary-large-image, and image sitemap nodes.

#### SEC-004 — Download rate limiting and abuse controls are absent

- **Tested/static fact:** No 429 response, `Retry-After`, per-user/IP quota, concurrency/byte budget, or platform rate-limit integration exists in `api/download.js` or `vercel.json`.
- **Impact:** Public originals are streamed through a serverless function and remain susceptible to cost/availability abuse. This is the requested “rate-limit-ready” constraint and is still open.
- **Concrete fix:** Evaluate policy before issuing a short-lived object-storage URL; enforce user/IP budgets and concurrency limits; return 429 with `Retry-After`; log subject/asset/rendition/outcome without token material; test burst and sustained traffic.

#### SEC-005 — Future private posters can still be copied to the public distribution

- **Tested current fact:** No current private poster is present in `dist`. **Architectural fact:** `scripts/copy-public-assets.js` recursively copies all of `assets/posters` before filtering asset records.
- **Impact:** A future internal video poster stored there could become public despite protected original media.
- **Concrete fix:** Copy only poster/preview paths referenced by public manifest records; add a private-poster fixture and assert it is absent from `dist`.

### Low

#### A11Y-008 — Asset alt text is present but editorially generic

- **Tested fact:** Sampled/gallery images have alt attributes, but manifest strings largely identify filename/category/division rather than the visible composition and meaningful text.
- **Fix:** Perform an editorial accessibility pass describing subject, composition, significant embedded text, and intended purpose without duplicating adjacent captions.

#### SEC-006 — Inline-style allowance reduces defense in depth

- **Tested fact:** CSP has strong script restrictions and a matching JSON-LD hash, but `style-src 'unsafe-inline'` remains and division metadata is interpolated into inline custom properties.
- **Fix:** Strictly validate color/token schemas, prefer classes/data attributes, and separate `style-src-elem`/`style-src-attr` when feasible.

#### SEO-004 — `robots.txt` documents a nonexistent private API route

- **Tested fact:** `robots.txt` disallows `/api/private/`, while protected endpoints are under `/api/`. The Vercel API response rule correctly adds `X-Robots-Tag: noindex, nofollow, noarchive`.
- **Fix:** Disallow `/api/` for clarity and retain the response header as the effective control.

## Resolved findings

| ID | Original severity | Resolution evidence |
|---|---:|---|
| A11Y-001 | High | Explicit mobile search accessible name; role/name tests pass. |
| A11Y-002 | High | Escape restores the desktop Divisions trigger when focus was inside the closing menu. |
| SEO-001 | High | All 62 generated division/collection/public-asset route files contain semantic non-JS body fallbacks. |
| SEC-002 | High | Sharp upgraded to 0.35.3; full npm audit is clean. |
| A11Y-003 | Medium | Editable combobox/listbox state and keyboard active-descendant model implemented and tested. |
| A11Y-004 | Medium | Derived text accents and footer legal text now exceed 4.5:1; automated contrast audit passes. |
| SEC-003 | Medium | Capability token removed from query-string handling. |

## WCAG 2.2 AA assessment

| Criterion / area | Status | Tested basis and remaining uncertainty |
|---|---|---|
| 1.1.1 Non-text Content | Partial | Alt attributes exist in sampled pages; editorial quality remains generic. |
| 1.3.1 Info and Relationships | Pass in tested scope | Semantic route fallbacks, landmarks, labels, combobox/listbox roles, and native controls are present. Full AT traversal was not run. |
| 1.4.3 Contrast (Minimum) | Pass in automated/calculated scope | Lighthouse contrast audit passes; original small-text values now calculate at ≥5.40:1. State-by-state catalog coverage was not exhaustive. |
| 1.4.10 Reflow | Pass in tested mobile scope | Mobile E2E reports no horizontal overflow; 400% browser zoom was not separately tested. |
| 1.4.11 Non-text Contrast | Partial | Major control boundaries pass visually; the translucent focus treatment remains below 3:1 against adjacent dark surfaces. |
| 2.1.1 Keyboard | Pass in tested flows | Search, combobox, filter, mega-menu Escape, native dialogs, and mobile navigation work in Chromium. Cross-browser/AT parity is untested. |
| 2.1.2 No Keyboard Trap | Pass in tested scope | Mobile nav traps intentionally and Escape exits; native dialogs close. |
| 2.2.2 Pause/Stop/Hide | Partial | Reduced-motion/video observer code exists; no representative captioned video fixture was tested. |
| 2.4.1 Bypass Blocks | Pass | Skip link targets `#main-content`, including generated route fallback bodies. |
| 2.4.3 Focus Order | Pass in tested flows | Filter rerender, mega-menu Escape, mobile-nav Escape, and combobox focus behavior are corrected. |
| 2.4.7 Focus Visible | **At risk** | Global focus shadow is only ~1.90–1.98:1 and replaces native outlines. |
| 2.4.11 Focus Not Obscured | Pass in tested flows | Mega-menu and mobile-nav focus restoration are corrected; sticky surfaces were not exhaustively tested. |
| 2.5.8 Target Size (Minimum) | Pass by automated WCAG audit; project 44px bar open | Lighthouse target-size passes. The project’s stricter universal 44×44 contract lacks complete bounding-box proof. |
| 3.2.2 On Input | Pass in tested scope | Category/sort rerenders retain focus; clear behavior is name-addressable. |
| 4.1.2 Name, Role, Value | Pass in tested scope | Mobile search is named and combobox/listbox state is exposed. |
| 4.1.3 Status Messages | Partial | Toast status is polite; lightbox slide changes are not announced. |

Automated Lighthouse Accessibility 100 is credible evidence for the tested homepage, but it does not establish zero WCAG defects or replace screen-reader/manual focus review.

## SEO and indexability assessment

- **Verified:** 63 canonical public sitemap URLs; private asset IDs excluded; 62 route-specific static entry bodies contain H1 and useful text; asset fallback pages include image/alt/dimensions/license context; route-specific canonical, title, description, and Open Graph tags exist; homepage Lighthouse SEO is 100.
- **Still open:** empty collections remain indexable; rich per-route schema/Twitter/image-sitemap metadata is incomplete; canonical origin is hardcoded; private authenticated asset routes are not implemented.
- **Boundary:** only the local homepage Lighthouse artifact was inspected. No Search Console, live crawl, deployed canonical redirect, social debugger, or JavaScript-disabled browser crawl of every route was run.

## Security, headers, and private delivery assessment

- **Verified source/config strengths:** CSP has no unsafe inline script mode; JSON-LD hash matches; `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, COOP/CORP, permissions policy, referrer policy, MIME sniff protection, frame denial, and HSTS are configured. API routes are marked private/no-store and noindex. Public distribution contains only 21 public asset records and no private originals/renditions. Download target paths are constrained to approved roots. Query-token acceptance is removed. Full npm audit is clean.
- **Remaining production blockers/risks:** no real authentication/token-issuance/private-route path; no rate limiting; public poster copy is not visibility-aware; cookie flags/revocation/audience separation cannot be verified because the issuer is absent; deployed headers were not captured.
- **Important distinction:** HSTS/CSP/header statements are configuration inspection, not proof of live edge behavior. The private download handler denies invalid capabilities, but deny behavior alone does not demonstrate authorized product usability.

## Approval gates

Approval remains withheld until, at minimum:

1. SEC-001 is implemented and black-box tested on a deployed authenticated preview.
2. SEC-004 has observable 429/`Retry-After`, quota, and logging behavior.
3. Focus-visible styling reaches ≥3:1 and passes keyboard/forced-colors review.
4. Empty collections are noindexed/removed from the sitemap or given substantive public content.
5. Private-poster copying is changed to manifest-driven public-only delivery.
6. NVDA + Chrome and VoiceOver + Safari complete search, filter, lightbox, save, license, and download flows without critical defects.
7. Live Vercel headers, private noindex responses, and direct-static bypass behavior are captured and retained as evidence.
