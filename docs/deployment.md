# Production deployment

## Vercel configuration

- Runtime: current Node.js LTS
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- Required server environment variable: `PRIVATE_DOWNLOAD_SECRET`
- Optional observability/rate-limit integrations must remain server-side.

The supplied `vercel.json` configures clean division, collection and asset routes; long-lived immutable rendition caching; protected API caching; CSP and security headers; and serverless file inclusion for protected manifests/originals.

## Authentication integration

The repository intentionally does not contain an identity-provider secret or client-side master token. The organization authentication service should issue:

- a library token containing `sub`, `role: "internal"`, and a short `exp`, HMAC-signed with `PRIVATE_DOWNLOAD_SECRET`;
- an asset download token containing `sub`, the exact `assetId`, and a short `exp`.

Prefer an HttpOnly, Secure, SameSite cookie for the library token and a one-use/short-lived query or header token for an original download. Add edge rate limits by authenticated subject and asset ID. Rotate the signing secret and invalidate outstanding tokens if exposed.

## Release gate

Run:

```bash
npm ci
npm run check
npm run test:e2e
npm audit --omit=dev
```

Then review `assets/manifests/audit-summary.json`. A build may deploy as a transparent limited archive while `missingOrInaccessible` is non-zero, but it must not be labeled the complete zero-omission project archive. Final completion requires all historical outputs to be recovered, re-ingested, and reconciled to zero.

For the 2026-08-08 Google Photos ingestion, also review `assets/manifests/google-photos-album-map.json`: it must report 330 discovered and ingested items, 330 unique assets, four videos, zero exact duplicates, and zero unassigned items. This is a source-export gate, not proof about files outside that export.

## Post-deploy validation

1. Test public browsing without authentication and verify internal IDs never appear in the manifest response.
2. Test expired, altered and wrong-asset tokens against both APIs.
3. Test authenticated internal browsing and original downloads.
4. Crawl the generated sitemap and verify every clean route.
5. Run Lighthouse and real-user monitoring on the deployed edge environment; local architectural tests are not substitutes for production Core Web Vitals.
6. Validate keyboard-only, screen reader, 200% zoom, reduced-motion, and forced-colors experiences.
