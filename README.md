# Collective Stock

Collective Stock is a manifest-driven media library for Collective AI Inc. It provides a cinematic public discovery layer, authenticated/internal delivery architecture, twenty division galleries, a parent-brand gallery, collection routes, fuzzy search, faceted filtering, rights metadata, responsive media renditions, image/video components, and an evidence-backed audit trail.

## Current audit status

The media catalog contains 433 unique, human-named records with zero broken references and zero unassigned assets. Original bytes, archive order, content hashes, source filenames, album provenance, division/category assignments, and classification confidence are retained. No stock substitute or fabricated duplicate was used.

Google Photos export reconciliation:

- 330 files discovered and ingested: 326 images and 4 videos
- 330 unique SHA-256 content hashes and provenance occurrences
- all 330 assets assigned across the parent brand and twenty divisions
- 0 exact duplicates within the export
- 0 unassigned assets
- 0 broken asset references
- 0 files missing from the supplied export

The complete catalog also includes 42 records in the Collective AI Inc Component Library (21 component sheets plus 21 paired brand reference sheets) and 20 films in the Division Intro Video Library. Nineteen intro films have explicit division pairings; the monogram film is intentionally global and marked `cross-division`.

One separately requested source archive remains inaccessible: `Motion MP4s.zip` (829,879,395 bytes). The Google Drive connector cannot transfer a file above its 100 MB limit. The public audit and missing-assets ledger report that blocker exactly; no substitute media is counted as recovery. A direct upload or split archive is required to ingest it.

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

The exact supplied ZIP is committed in integrity-checked chunks under `assets/source-archives/google-photos-2026-08-08/`. Before every asset build, `assets:materialize` reconstructs the archive when needed, verifies its SHA-256, restores each full-resolution original to its classified image/video path, and verifies all 330 per-file hashes. Generated originals, renditions, and posters are intentionally gitignored; they are reproducible build outputs rather than competing source copies.

## Deployment

1. Import this directory into Vercel.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `PRIVATE_DOWNLOAD_SECRET` to a high-entropy server-only secret.
4. Connect the organization identity provider to mint short-lived HMAC library/download tokens with a subject, expiry, and the required asset or internal role claim.
5. Store `assets/originals` and `assets/video` in private object storage using the same repository-relative keys. Set `PRIVATE_ASSET_ORIGIN` to its HTTPS base URL and, when required, set `PRIVATE_ASSET_ORIGIN_TOKEN` to the server-only bearer credential.
6. Keep originals out of static hosting and serverless bundles. The download function contains only the manifest and streams an authorized local file or the configured private origin; the manifest function filters anonymous records and removes provenance occurrences.
7. Replace the example canonical origin in the HTML and sitemap generator if deploying to another production domain.

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

Audit and ingest another Google Photos export with:

```bash
npm run assets:album:audit -- <archive.zip> <extract-directory> <audit-directory>
npm run assets:album:ingest -- <audit-directory>/album-inventory.json <extract-directory>/Collective\ Stock
npm run assets:build
```

For individual files, place recovered originals under `assets/originals` or `assets/video`, add authoritative classification overrides to `assets/manifests/source-map.json`, and run `npm run assets:build`. Do not delete older revisions. Identical bytes may share one physical optimized file while every occurrence remains in `source-provenance.json`.
