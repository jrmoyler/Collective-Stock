# Performance report

Refreshed 2026-08-09 after the 433-record media-library build, against the production `dist` build on a 412 × 915 mobile viewport.

## Measured Lighthouse result

| Category / metric | Result | Acceptance target | Gate |
|---|---:|---:|---|
| Performance | 100 | ≥ 90 | Pass |
| Accessibility | 100 | ≥ 95 | Pass |
| Best Practices | 100 | ≥ 95 | Pass |
| SEO | 100 | ≥ 95 | Pass |
| LCP | 1,506 ms | ≤ 2,500 ms | Pass, 994 ms margin |
| CLS | 0.00033 | ≤ 0.1 | Pass |
| Total Blocking Time | 0 ms | Diagnostic only | Pass |
| First Contentful Paint | 1,506 ms | Diagnostic only | — |

Evidence: `reports/lighthouse-mobile.json`. Lighthouse used its mobile profile against a local static server and the packaged Chromium executable. These are lab results, not field Core Web Vitals.

## Scripted slow-4G / CPU-throttled measurement

A separate Playwright/CDP pass used 150 ms latency, 1.6 Mbps downlink, 0.75 Mbps uplink, 4× CPU slowdown, 412 × 915 at 2× device scale, and a settled search-dialog interaction.

| Metric | Result |
|---|---:|
| LCP | 884 ms |
| CLS | 0.00059 |
| Scripted interaction event duration | 80 ms |
| DOMContentLoaded | 911 ms |
| Load event | 1,573 ms |
| Transferred resources | 1,868,442 bytes / 20 requests |
| Accumulated long-task duration | 147 ms |

Evidence: `reports/performance-measurement.json`. The 80 ms event duration is a controlled interaction sample, not field p98 INP certification.

## Production payload and architecture

- Application JavaScript: approximately 61 KB raw / 19.5 KB gzip.
- Application CSS: approximately 47 KB raw / 10.4 KB gzip.
- Static distribution: approximately 119 MB, dominated by lazy public renditions and 24 public video previews rather than application code.
- Self-hosted fonts use WOFF2-only, `font-display: optional` declarations.
- The server-rendered homepage shell preserves its LCP heading while the searchable archive hydrates.
- Below-fold bands use `content-visibility: auto` with intrinsic sizing.
- Public imagery is delivered through dimensioned AVIF/WebP/JPEG candidates; originals are not statically published.
- Optimized renditions receive one-year immutable caching. Protected manifests/downloads are private and `no-store`.
- Twenty-four real video previews are poster-first, muted H.264 derivatives, `playsinline`, lazy, and paired with generated still posters; reduced-motion mode avoids autoplay behavior.

## Remaining performance risk

- The Lighthouse LCP passes by 994 ms in the final local build and must still be rechecked on the deployed CDN with real security headers, compression and edge latency.
- No field RUM/CrUX data exists yet, so the INP target is supported by lab evidence only.
- The current catalog has 24 MP4 previews but no HLS payload to benchmark; caption status remains metadata until production caption/transcript files are supplied.
- The 119 MB static deploy is acceptable for repository validation, but originals must remain in private object storage and usage telemetry should guide future CDN delivery.
