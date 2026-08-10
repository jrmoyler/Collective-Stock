# Collective Stock media audit

## 2026-08-08 Google Photos export

The attached `Collective Stock-1-001.zip` is the authoritative file inventory for this ingestion.

`330 archive entries = 330 ingested and assigned occurrences + 0 missing files`

- 326 images and 4 MP4 videos
- 330 unique SHA-256 content hashes
- 0 exact duplicates within the export
- 0 unassigned archive entries
- 0 broken source references
- all parent-brand and twenty division galleries represented

Archive order is preserved as a stable `albumIndex` from 1 through 330. Each asset also retains its original filename, source archive path, destination path, content hash, source album and URL, division, category, media type, dimensions, classification confidence, and optional classification notes in `assets/manifests/google-photos-album-map.json`.

Classification combined filename evidence with visual review of fourteen contact sheets. Three unbranded items have deliberately recorded low-confidence thematic assignments so they can be reclassified without replacing or renaming the source bytes:

| Album index | Assignment | Review note |
|---:|---|---|
| 124 | Aether Link | starfield / orbital-network visual |
| 319 | Eon Core | volumetric-light / portal video |
| 328 | Cognara Mind | dual-energy thoughtform visual |

The four videos were probed with `ffprobe`, retained at original resolution, and given generated poster frames. Image originals remain full resolution; optimized AVIF, WebP, and JPEG renditions are derived during `npm run assets:build`.

## Recovered motion source

The inaccessible monolithic `Motion MP4s.zip` was superseded by the accessible Google Drive folder supplied on 2026-08-09. All **26 MP4 files** visible in that folder were downloaded individually, totaling **434,000,426 verified bytes**, and each has a source record, poster, muted preview, classification, and searchable collection entry. The missing-source ledger is now empty.

## Reconciliation artifacts

- `assets/manifests/google-photos-album-map.json` — immutable album-order mapping and classification review
- `assets/manifests/source-map.json` — deterministic build rules
- `assets/manifests/asset-manifest.json` — unique asset records used by the application
- `assets/manifests/source-provenance.json` — occurrence-level source trail
- `assets/manifests/missing-assets.json` — current scope and resolved-source ledger
- `assets/manifests/audit-summary.json` — generated repository-wide reconciliation
- `assets/manifests/asset-audit-report.html` — human-readable generated report

## Historical baseline and scope boundary

Before the Google Photos export was supplied, the workspace contained 41 accessible media files: 40 raster candidates extracted from the design-system PDF and one parent-brand design concept. The MVP build-guide PDF contained no embedded raster images, and the packaged division skill payloads contained text/Markdown rather than media.

The earlier `265` figure was a request ledger inferred from conversation summaries, not an inventory of 265 verified successful generations. It is superseded for this ingestion and is not added to the discovered-file equation. Conversely, zero missing from this ZIP does not independently prove that every output from every historical ChatGPT conversation is present in the album.

No unrelated stock image, fabricated duplicate, or filename-only placeholder was introduced to manufacture coverage. The Google Photos export, seven supplied stills, and all 26 supplied Drive films are fully reconciled with no inaccessible batches remaining.
