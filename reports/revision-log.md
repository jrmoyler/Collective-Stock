# COLLECTIVE STOCK — harsh-critic revision log

**Second review:** 2026-08-08  
**Current status:** **2 closed / 8 partial / 5 open**  
**Approval state:** **Rejected**

“Partial” means a claimed fix was verified but the original release criterion is not yet fully satisfied. No partial item is treated as a passed approval gate.

| ID | Priority | First-pass defect | Second-pass evidence / change | Remaining acceptance work | Status |
|---|---|---|---|---|---|
| C-001 | P0 | 265 expected historical outputs inaccessible | Deployed and source audits now truthfully retain **265 missing**, but no missing output was recovered; 41 provenance occurrences remain | Export/download, hash, classify, optimize, assign, route, and mathematically reconcile every expected occurrence to zero missing | **OPEN** |
| C-002 | P0 | Production concealed audit and broke `/audit.html` | Homepage notice and deployed audit expose 265 missing; audit link works | Keep notice until C-001 closes; do not label the archive complete meanwhile | **CLOSED** |
| C-003 | P0 | Mobile nav clipped; background/focus unmanaged | Navigation now mounts as a body-level top layer outside the sticky header. The focused Pixel 7 E2E proves menu height ≥ viewport − header, scrollable overflow, ≤1px horizontal overflow, inert background, and Escape restoration; screenshot confirms a full-height panel | Preserve the fix and add the missing 360/390 pair, tablet portrait/landscape, orientation, soft-keyboard, and assistive-technology task recordings | **PARTIAL** |
| C-004 | P0 | Private delivery not end-to-end | Query-string token acceptance removed; HMAC handler/static exclusion retained | Implement authentication, token issuer, scoped expiry/nonce, request access, wrong-asset/expired/rate-limit/noindex production tests, and accurate session UI | **PARTIAL** |
| C-005 | P0 | No performance evidence | Final exact-build homepage Lighthouse now P98/A100/BP100/SEO100, FCP/LCP 1807.5ms, TBT 0ms, CLS .00033; custom 4×CPU/slow-4G run LCP 816ms, INP 56ms | Repeat on archive, division, asset detail, and representative large/mixed-media routes; preserve traces and memory/CPU budgets | **PARTIAL** |
| C-006 | P0 | Accessibility focus/menu/target defects and no evidence | Combobox state, mega Escape, full-height mobile top-layer/inert/focus behavior, filter refocus, search label, and Lighthouse A100 verified | Fix solid focus contrast, all 44×44 targets, and lightbox announcement; add axe, screen-reader, contrast, zoom/reflow and caption evidence | **PARTIAL** |
| C-007 | P0 | Empty/shallow collections and divisions | Static routes exist, but 14/20 required collections are empty and every parent/division route has one card | Populate from complete manifest; prove counts, category depth, related divisions, variants, and no unexpected empty public route | **OPEN** |
| C-008 | P1 | Static images falsely displayed as playable motion | Static references now use expand/reference affordance and static labels | Add real video fixtures and prove play/pause/offscreen/concurrency/reduced-motion/caption/network/HLS behavior | **PARTIAL** |
| C-009 | P1 | Search false positives, incomplete facets/states | ARIA combobox model and focus restoration fixed; nonsense query still returns one result | Tune ranking/empty state; add highlighting, recent/saved queries, literal/assisted modes, all required facets, and precision/recall suite | **PARTIAL** |
| C-010 | P1 | Rendition quality/cache model unsuitable | No material second-pass evidence closes the large-derivative, `<picture>`, descriptor, or content-hash concerns | Generate and validate true card/large/full AVIF/WebP/fallback renditions with safe versioned caching | **OPEN** |
| C-011 | P1 | Division identity mostly palette swap; logo provenance unresolved | No material differentiation change; same geometry/template and one logo/reference card per route | Obtain approved standalone logos, resolve source conflicts, and implement content-aware division personas | **OPEN** |
| C-012 | P1 | Detail lacks occurrence history, variants, releases, context, and verified originals | No real video/variant/related/private-delivery fixture added | Complete governed-DAM detail, related/previous/next state, and checksummed end-to-end downloads | **OPEN** |
| C-013 | P1 | Three-URL sitemap, JS-only route bodies, broken audit link, incomplete metadata | **63 URLs**, canonical/meta/H1/summary non-JS bodies, and working audit route verified | Omit/noindex empty collections; add route JSON-LD, Twitter/social preview correctness, image sitemap data, and complete metadata matrix | **PARTIAL** |
| C-014 | P1 | High Sharp/libvips advisory | Sharp upgraded to **0.35.3**; fresh full `npm audit --json` reports **0 vulnerabilities** | Keep dependency audit in CI | **CLOSED** |
| C-015 | P2 | Tests too narrow | 12 unit and 9 E2E pass; build/validator/Lighthouse/custom performance evidence now saved | Add complete route/link/auth/security/axe/video/network/tablet/visual-regression/per-route performance coverage | **PARTIAL** |

## Re-review order

1. Recover and reconcile C-001; until then the primary product contract fails.
2. Finish C-003, C-004, C-006, and C-007 as release blockers.
3. Finish C-005 and C-008 through C-013 with real mixed-media/variant/private fixtures.
4. Expand C-015 so every gate has repeatable evidence.
5. Run a new independent review. Approval requires **≥9.30 weighted**, **every category ≥9.0**, and **all eight hard gates passing**.
