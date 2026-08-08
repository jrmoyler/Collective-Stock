# COLLECTIVE STOCK — independent harsh-critic scorecard, pass 2

**Review date:** 2026-08-08  
**Decision:** **REJECTED — NOT APPROVED**  
**Weighted score:** **5.72/10** (first pass: 4.69; required: 9.30)  
**Category floor:** **0/16 categories at 9.0**  
**Hard gates:** **2 pass / 6 fail**

This is a second independent verification of the revised implementation, including a final focused mobile-navigation re-test. The visual shell is materially more honest, faster, more crawlable, and better behaved under keyboard interaction than the first-pass build. It is still not the complete Collective AI media library and is not production-ready under the user's acceptance contract. The decisive evidence is unchanged: `audit-summary.json` records **265 missing or inaccessible historical outputs**, the public distribution exposes **21 assets**, every parent/division route has **one card**, and **14 of 20** required collection routes are empty.

## Approval decision

Approval is refused because all three approval conditions fail:

1. **5.72 < 9.30 weighted overall.**
2. **Every category is below the 9.0 floor.**
3. **Six hard gates fail**, including zero-unassigned/reconciliation, complete routes, accessibility, private delivery, mobile completeness, and representative-page performance proof.

The homepage audit notice is now truthful. That is a welcome correction, not reconciliation: publishing the missing count does not turn 265 inaccessible outputs into ingested assets.

## Before → after verification

| Surface | First pass | Revised pass | Verdict |
|---|---|---|---|
| Public audit truth | Deployed summary reset missing count to 0; `/audit.html` absent | Homepage and deployed audit retain **265 missing/inaccessible** and link to the audit | **Fixed** |
| Sitemap / non-JS routes | 3 sitemap URLs; empty JS shells | **63 URLs**; 21 division, 20 collection, and 21 asset fallback bodies with H1/canonical/summary links | **Improved, incomplete** — all 20 collection fallbacks are under 2 KB, 14 collections are empty, and route JSON-LD/Twitter/image-sitemap coverage remains absent |
| Mobile navigation | Background remained active and the fixed panel was clipped to 88px by the sticky header containing block | Navigation is appended to the body top layer; `main` is inert, body scroll locks, focus enters the menu, Escape restores the trigger, and the Pixel 7 E2E assertion proves height ≥ viewport − header with scrollable overflow | **Fixed on the verified Pixel 7 profile**; broader 360/390/tablet/orientation and end-to-end mobile task evidence is still absent |
| Filter focus | Focus moved to `BODY` after rerender | Focus returns to the replacement `SELECT` (`name=division`) | **Fixed** |
| Mega-menu Escape | Focus remained in hidden menu | Escape closes and restores the Divisions trigger | **Fixed** |
| Search combobox | Incomplete state model | Combobox/listbox state, active descendant, selected option, and cleanup are implemented | **Improved** — nonsense query still returns one false-positive card |
| Motion honesty | Static images displayed play affordances | Static motion references use an expand/reference affordance and are labeled static | **Fixed representation**; no real video/caption/failure fixture exists |
| Download token handling | Query-string capability accepted | Query token removed; only header/Bearer/cookie accepted | **Fixed transport issue**; no identity/token issuer/expiry/cross-asset production proof |
| Security headers | No HSTS | HSTS present; CSP script hash retained | **Improved**; `style-src 'unsafe-inline'`, no rate limiting, and future private-poster copy risk remain |
| Dependency audit | 1 high Sharp/libvips advisory | Sharp 0.35.3; full `npm audit` reports **0 vulnerabilities** | **Fixed** |
| Automated tests | 12 unit; 5 E2E pass / 1 skip | **12 unit pass; 9 E2E pass / 1 deliberate desktop skip** | **Improved, incomplete** |
| Lighthouse / CWV | No evidence | Final exact-build mobile homepage: **P98/A100/BP100/SEO100**, FCP/LCP **1,807.5ms**, TBT **0ms**, CLS **0.00033**; custom 4× CPU/slow-4G event run: LCP **816ms**, INP **56ms** | **Homepage passes**; no archive/division/detail Lighthouse/CWV proof and custom INP is one scripted interaction, not field INP |

## Hard gates

| Gate | Status | Evidence |
|---|---|---|
| Zero unassigned assets | **FAIL** | `unassigned-assets.json` is empty only for the 41 locally discovered records. The audit separately records **265 expected outputs inaccessible**, 20 missing batches, and only 41 provenance occurrences. The zero-omission contract is not reconciled. |
| Zero broken assets | **PASS (present inventory only)** | `npm run assets:validate` validates 41 assets with 0 broken references and 0 unassigned; build and 9 E2E cases pass without reported runtime console errors. This does not waive the 265 missing outputs. |
| All routes present and populated | **FAIL** | Routes exist, but each parent/division route exposes one asset and 14/20 required collections render an empty state. A URL is not a complete collection. |
| Zero critical accessibility defects | **FAIL** | Lighthouse Accessibility is 100 and the mobile top-layer, search, mega-menu, and filter focus behaviors now pass their focused checks. However, focus indication still composites at roughly 1.9:1 after native outlines are removed, some targets remain below the explicit 44×44 requirement, and no axe plus screen-reader/zoom/reflow evidence exists. |
| Private delivery enforced | **FAIL** | Query tokens are removed and private originals are excluded from static dist, but there is no authenticated private route, token issuer, approval workflow, expiry/cross-asset/rate-limit proof, or accurate session-state UI. |
| Mobile complete | **FAIL (coverage)** | The focused Pixel 7 navigation geometry and focus test now passes, with a full-height body-level overlay and scrollable content. The gate still requires representative small/large mobile and core search/filter/detail/playback/licensing/download tasks; no 360/390 pair, tablet, orientation, soft-keyboard, media, or download evidence exists. |
| Performance targets met | **FAIL (coverage)** | The homepage measurements pass their numeric thresholds, but the gate requires representative public pages and real mixed-media scale. No archive, division, asset-detail, or large-gallery Lighthouse/CWV traces exist; there are zero videos and only 21 public assets. |
| No placeholder substitution | **PASS** | The build now truthfully lists inaccessible outputs, uses accessible project/source assets, and no longer represents static references as playable video. |

## Category scores

| Category | Weight | Before | After | Evidence-based judgment |
|---|---:|---:|---:|---|
| First impression | 4 | 6.6 | **6.8** | Strong, legible search-led hero and honest audit notice; repeated low-depth logo/reference imagery and a false “Internal access” status keep it below premium catalog credibility. |
| Visual hierarchy | 5 | 7.0 | **7.1** | Calm hierarchy and restrained palette remain strengths; one-card galleries create enormous dead space and enlarged small derivatives soften authority. |
| Brand distinctiveness | 5 | 5.2 | **5.2** | Parent styling is recognizable, but division routes still share essentially identical geometry, spacing, modules, and behavior. Differentiation remains mostly accent/logo/description. |
| Homepage quality | 6 | 4.8 | **6.1** | Media shortcuts now target valid routes, audit status is truthful, and static motion references are no longer fake video. Repetition and a 21-asset catalog still make the editorial rails look demonstrative rather than world-class. |
| Search usability | 9 | 5.4 | **6.1** | URL state, typo tolerance, keyboard suggestions, combobox state, and filter-focus restoration work. `definitely-no-such-asset` still returns one card; highlighting, recent searches, saved searches, semantic/literal mode clarity, and several required facets are absent. |
| Gallery browsing | 8 | 4.6 | **4.9** | Cards and basic facets function, but there is no large/mixed-media corpus, pagination/virtualization, Similar workflow, revision grouping, or meaningful scan density. |
| Asset-detail experience | 8 | 5.0 | **5.1** | Basic preview, metadata, rights, provenance, and download UI exist; no video/variant fixture, related depth, occurrence history, release metadata, or verified original-delivery transaction exists. |
| Division differentiation | 6 | 3.8 | **3.8** | All 21 routes exist but every route contains exactly one public card and the same template. This is a logo sampler, not 20 differentiated premium galleries. |
| Mobile experience | 7 | 5.2 | **6.6** | The body-level full-height menu, inert background, scroll lock, focus trap, Escape restoration, filter refocus, and Pixel 7 geometry assertion now pass. It remains below production baseline because 360/390/tablet/orientation/soft-keyboard and full detail/playback/licensing/download tasks are unproven, and some controls miss the explicit 44px target. |
| Video and motion handling | 6 | 3.2 | **4.2** | Misleading play signals were removed and poster-first architecture exists in code. With zero video assets there is no evidence for playback, captions, concurrency, failure recovery, vertical video, HLS, or reduced-motion behavior. |
| Licensing clarity | 7 | 4.2 | **4.8** | Rights copy is adjacent to actions and query-token leakage is fixed. End-to-end authorization, approval, expiry, audit logging, public/internal identity state, and every required license fixture remain unproven. |
| Accessibility | 8 | 5.0 | **6.4** | Lighthouse A100 plus repaired mobile-nav geometry/focus, search state, mega Escape, and filter focus are real gains. Focus contrast and some touch targets remain deficient, and the required axe/screen-reader/contrast/zoom evidence is absent. |
| Performance | 8 | 4.2 | **8.0** | The final exact-build homepage scores P98/A100/BP100/SEO100 with FCP/LCP 1,807.5ms, TBT 0ms, and CLS .00033, passing stated numeric thresholds. It does not earn 9 because only one shallow route is measured and no real archive-scale/mixed-media memory, CPU, or route comparison exists. |
| Conversion design | 5 | 4.0 | **4.9** | CTAs are clearer and audit trust improved, but users are sent to many empty collections, restricted users have no request-access workflow, and public UI still claims internal access. |
| Professional credibility | 5 | 3.0 | **5.8** | Truthful audit, 63-URL sitemap, static bodies, HSTS, clean dependency audit, green build, and broader tests materially improve credibility. The 265 missing outputs, shallow routes, incomplete auth, minimal SEO bodies, and absence of release-grade validation remain disqualifying. |
| Overall desirability | 3 | 3.8 | **5.0** | A polished, fast, honest shell is now demonstrable. It is still not useful as the promised complete media library and cannot outperform mature stock/DAM workflows with 21 public assets. |

**Weighted calculation:** `Σ(score × weight) / 100 = 5.717`, reported as **5.72/10**.

## Benchmark comparison

- Against Shutterstock, it has the search-led opening but not credible search precision, related-query depth, catalog scale, or media scoping.
- Against Adobe Stock, the editorial rails resemble the right interaction principle but lack real-media variety, Find Similar, edit/context continuity, and mature video evidence.
- Against Getty/iStock, provenance and rights fields exist but content authority, release data, collection depth, and end-to-end licensing enforcement are absent.
- Against Depositphotos, the filter surface is materially shallower and does not offer inclusive/exclusive governance constraints or robust card-level similarity.
- Against Envato Elements, the cross-media taxonomy is aspirational: empty collections and zero videos/3D assets do not demonstrate a working multimedia library.

## Required next revisions, in order

1. Resolve/export and ingest the **265 inaccessible expected outputs**; reconcile occurrence-level provenance to zero missing.
2. Populate all 20 division galleries and every required collection with real manifest data; remove empty collections from indexable/public discovery until populated.
3. Preserve the corrected body-level mobile navigation and finish 360/390/tablet/orientation/soft-keyboard plus full mobile task verification.
4. Implement authenticated private routes, server-minted scoped tokens, expiry/cross-asset/rate-limit tests, request-access, and accurate access-state UI.
5. Tune search against a real corpus, eliminate nonsense false positives, and implement missing facets, highlighting, recent/saved-search architecture, and scale tests.
6. Add real image/video/sheet/variant fixtures and complete detail, rendition, caption, recovery, related, occurrence-history, and previous/next workflows.
7. Complete formal WCAG evidence and representative-route performance/SEO/security validation.

**Final statement:** Approval refused. Do not describe this artifact as the complete archive, as world-class against the named stock platforms, or as production-ready while any of the six failed gates remains open.
