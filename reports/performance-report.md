# Performance report

Generated 2026-08-08 against the production `dist` build on a 412 × 915 mobile viewport.

## Measured Lighthouse result

| Category / metric | Result | Acceptance target | Gate |
|---|---:|---:|---|
| Performance | 98 | ≥ 90 | Pass |
| Accessibility | 100 | ≥ 95 | Pass |
| Best Practices | 100 | ≥ 95 | Pass |
| SEO | 100 | ≥ 95 | Pass |
| LCP | 1,808 ms | ≤ 2,500 ms | Pass, 692 ms margin |
| CLS | 0.00033 | ≤ 0.1 | Pass |
| Total Blocking Time | 0 ms | Diagnostic only | Pass |
| First Contentful Paint | 1,808 ms | Diagnostic only | — |

Evidence: `reports/lighthouse-mobile.json`. Lighthouse used its mobile profile against a local static server and the packaged Chromium executable. These are lab results, not field Core Web Vitals.

## Scripted slow-4G / CPU-throttled measurement

A separate Playwright/CDP pass used 150 ms latency, 1.6 Mbps downlink, 0.75 Mbps uplink, 4× CPU slowdown, 412 × 915 at 2× device scale, and a settled search-dialog interaction.

| Metric | Result |
|---|---:|
| LCP | 816 ms |
| CLS | 0.00027 |
| Scripted interaction event duration | 56 ms |
| DOMContentLoaded | 835 ms |
| Load event | 1,505 ms |
| Transferred resources | 512,334 bytes / 20 requests |
| Accumulated long-task duration | 50 ms |

Evidence: `reports/performance-measurement.json`. The 56 ms event duration is a controlled interaction sample, not field p98 INP certification.

## Production payload and architecture

- Application JavaScript: approximately 52 KB raw / 17 KB gzip.
- Application CSS: approximately 42 KB raw / 9.5 KB gzip.
- Static distribution: approximately 16 MB, dominated by the approved public media renditions and visual evidence rather than application code.
- Self-hosted fonts use WOFF2-only, `font-display: optional` declarations.
- The server-rendered homepage shell preserves its LCP heading while the searchable archive hydrates.
- Below-fold bands use `content-visibility: auto` with intrinsic sizing.
- Public imagery is delivered through dimensioned AVIF/WebP/JPEG candidates; originals are not statically published.
- Optimized renditions receive one-year immutable caching. Protected manifests/downloads are private and `no-store`.
- Video previews are poster-first, muted, `playsinline`, intersection-controlled, capped, paused offscreen, and disabled in reduced-motion mode.

## Remaining performance risk

- The Lighthouse LCP passes by 692 ms in the final local build and must still be rechecked on the deployed CDN with real security headers, compression and edge latency.
- No field RUM/CrUX data exists yet, so the INP target is supported by lab evidence only.
- The current fixture has no real video, HLS, caption, or transcript payload to benchmark.
- The 16 MB deploy is acceptable because derivatives are lazy/public-media payloads, but image CDN transformation and usage telemetry should guide future rendition pruning.
