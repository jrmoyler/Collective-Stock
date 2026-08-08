# Collective Stock

Collective Stock is a manifest-driven media library for Collective AI Inc. It provides a cinematic public discovery layer, authenticated/internal delivery architecture, twenty division galleries, a parent-brand gallery, collection routes, fuzzy search, faceted filtering, rights metadata, responsive media renditions, image/video components, and an evidence-backed audit trail.

## Current audit status

The application is functional and deployable with every media file that was accessible in the supplied workspace. It is **not zero-omission complete**: 265 historical outputs described by the supplied generation packages were not present as local files or exposed conversation attachments. They are recorded in `assets/manifests/missing-assets.json`; no stock substitute or fabricated duplicate was used.

Current local reconciliation:

- 41 files discovered and ingested
- 41 provenance occurrences
- 40 division-assigned assets
- 1 parent-brand asset
- 0 exact duplicates
- 0 unassigned assets
- 0 broken asset references
- 265 expected historical outputs inaccessible across 20 documented batches

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run assets:build
npm run dev
```

Production build and validation:

```bash
npm run check
npm run test:e2e
```

`npm run check` regenerates division data, optimized image renditions, the manifest, provenance, search index, sitemap, Tailwind production CSS, and the deployable `dist/` folder before running unit validation.

## Deployment

1. Import this directory into Vercel.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `PRIVATE_DOWNLOAD_SECRET` to a high-entropy server-only secret.
4. Connect the organization identity provider to mint short-lived HMAC library/download tokens with a subject, expiry, and the required asset or internal role claim.
5. Keep `assets/originals`, `assets/video`, and private manifests out of generic static hosting. The supplied Vercel functions include them only in protected serverless bundles.
6. Replace the example canonical origin in the HTML and sitemap generator if deploying to another production domain.

Public renditions are copied into `dist`. Private originals are streamed only through `/api/download` after an authenticated signed-token check. `/api/manifest` filters the asset and provenance sets at the response layer.

## Source-of-truth order

1. Most recent explicit user instruction
2. Newest division-specific skill
3. Collective AI Design System Bible
4. Collective AI MVP Build Guide
5. Earlier project context

Unresolved source conflicts are documented in `docs/source-conflicts.json`; the implementation does not silently guess.

## Key documentation

- `docs/architecture.md` — component contracts, state ownership, directory map, security and media flows
- `docs/deployment.md` — production deployment and private-access integration
- `assets/manifests/asset-audit-report.html` — full internal reconciliation
- `reports/qa-report.md` — functional and responsive evidence
- `reports/performance-report.md` — measured bundle/media evidence and unmeasured field targets
- `reports/harsh-critic-scorecard.md` — independent quality review and hard-gate result

## Asset re-ingestion

Place newly recovered originals in the appropriate source directory under `assets/originals` or `assets/video`, add any authoritative classification override to `assets/manifests/source-map.json`, and run `npm run assets:build`. Do not delete older revisions. Identical bytes may share a physical optimized file, while each occurrence remains in `source-provenance.json`.
