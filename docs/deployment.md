# Production deployment

## Vercel configuration

- Runtime: current Node.js LTS
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- Required server environment variable: `PRIVATE_DOWNLOAD_SECRET`
- Required private-media environment variable: `PRIVATE_ASSET_ORIGIN` (HTTPS base URL whose keys match repository-relative `assets/originals/...` and `assets/video/...` paths)
- Optional private-media credential: `PRIVATE_ASSET_ORIGIN_TOKEN` (server-only bearer token sent to the configured origin)
- Optional observability/rate-limit integrations must remain server-side.

The supplied `vercel.json` configures clean division, collection and asset routes; long-lived immutable rendition caching; protected API caching; CSP and security headers; and manifest-only serverless file inclusion. Original media is never included in the static output or function bundle.

## Authentication integration

The repository intentionally does not contain an identity-provider secret or client-side master token. The organization authentication service should issue:

- a library token containing `sub`, `role: "internal"`, and a short `exp`, HMAC-signed with `PRIVATE_DOWNLOAD_SECRET`;
- an asset download token containing `sub`, the exact `assetId`, and a short `exp`.

Prefer an HttpOnly, Secure, SameSite cookie for the library token and a one-use/short-lived authorization header or dedicated cookie for an original download. Query-string capabilities are intentionally rejected. Add edge rate limits by authenticated subject and asset ID. Rotate the signing secret and invalidate outstanding tokens if exposed.

`/api/download` authorizes the manifest record before reading any storage path. A record with `downloadAuthorization: "public"` may be downloaded anonymously; every other value requires a valid token scoped to the exact asset ID. The handler first streams an available local original, then falls back to the same repository-relative key under `PRIVATE_ASSET_ORIGIN`. Redirects and cross-origin path escapes are rejected. If neither local storage nor a private origin is configured, the handler returns `503` without attachment headers.

`/api/manifest` returns full records and provenance only for a valid internal library token. Anonymous responses contain public discovery fields only and an empty provenance occurrence list; storage paths, filenames, hashes, prompts, and source URLs are removed.

## Release gate

Run:

```bash
npm ci
npm run check
npm run test:e2e
npm audit --omit=dev
```

Then review `assets/manifests/audit-summary.json`. A build may deploy as a transparent limited archive while `missingOrInaccessible` is non-zero, but it must not be labeled the complete zero-omission project archive. Final completion requires all historical outputs to be recovered, re-ingested, and reconciled to zero.

For the 2026-08-08 Google Photos ingestion, also review `assets/manifests/google-photos-album-map.json`: it must report 330 discovered and ingested items, 330 unique assets, four videos, zero exact duplicates, and zero unassigned items. The final manifest additionally requires 21 component sheets, 21 paired brand reference sheets, 20 division intro films, 26 Drive motion films, and seven user-supplied still images. This is a source-export gate, not proof about files outside the supplied sources.

The former `Motion MP4s.zip` blocker was superseded by the accessible Drive folder supplied on 2026-08-09. The build must verify all 26 individually downloaded MP4s, 434,000,426 source bytes, and `missingOrInaccessible: 0` before describing the supplied archive as zero-omission complete.

## Post-deploy validation

1. Test public browsing without authentication and verify private fields and provenance occurrences never appear in the manifest response.
2. Test expired, altered and wrong-asset tokens against both APIs.
3. Test authenticated image and video originals against the private origin, including the missing-origin `503` path.
4. Crawl the generated sitemap and verify every clean route.
5. Run Lighthouse and real-user monitoring on the deployed edge environment; local architectural tests are not substitutes for production Core Web Vitals.
6. Validate keyboard-only, screen reader, 200% zoom, reduced-motion, and forced-colors experiences.
