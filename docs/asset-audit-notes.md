# COLLECTIVE STOCK local media audit

## Bottom line

- No historical ChatGPT conversation/project images were found as local files. Current-build images and PDF render intermediates are explicitly separated from historical assets.
- The design-system PDF contains 40 color-image streams and 40 paired soft masks. These reconcile to 40 retained RGBA PNG candidates: 20 gallery logo compositions and 20 detail-page raster fragments.
- The MVP build-guide PDF contains no embedded raster images.
- Thirteen files named `.skill.txt` are ZIP packages. Their 24 file payloads are text/Markdown only; none contains image, video, or audio bytes.
- The conversation-summary ledger represents 265 requested output units, not 265 confirmed successful generations. With zero local historical matches, all 265 request units remain unresolved.

## Scope

Scanned `/workspace/scratch/7ac83610e35a`, including `project_sources`, while excluding `.git` and `node_modules`. Generated audit files were kept under `/workspace/scratch/7ac83610e35a/workstreams/asset-archivist` and excluded from the pre-existing/current-workspace media count.

Source-file reconciliation, based strictly on local bytes:

`16 source files = 2 PDFs + 13 ZIP skill packages + 1 Markdown file`

`24 ZIP payload files = 24 text/Markdown payloads + 0 media payloads`

`0 loose image/video/audio files in project_sources`

## PDF extraction and logo candidates

For `01-Collective_AI_Design_System_Bible_v3_actual_logos_with_sections.pdf`:

`80 embedded raster objects = 40 RGB image streams + 40 soft-mask streams = 40 image/mask pairs`

`40 retained PNGs = 20 gallery logo compositions + 20 detail-page raster fragments`

`40 retained PNGs = 40 unique SHA-256 hashes`

The 20 gallery candidates correspond, in PDF order, to ZenFlow, The Collective, Hybrid Living, Nexus Labs, Kinetic Edge, Quantum Ledger, Terra Axis, Binary Loom, Vector Shift, Aether Link, Obsidian Arc, Civic Core, Cognara Mind, Vital Helix, Gaia Synthesis, Animus Prime, Juris Guard, Signal Velocity, Nomad Nexus, and Eon Core. They were visually checked against rendered PDF pages 10-11.

The 20 detail candidates come from the odd-numbered division pages 15-53. They are retained because they are embedded media, but they are not always complete logos. For example, some are a supporting mark or raster fragment while other parts of the page composition remain vector-drawn. Use the `gallery-*` candidates as the stronger logo source.

The PDF describes its gallery as vector, but the local PDF exposes these marks to `pdfimages` as raster XObjects. No standalone SVG/EPS/AI logo files were discovered.

One extraction exception was handled without inventing data: PDF image number 28 / object 190 (Gaia Synthesis gallery) produced a truncated PNG from `pdfimages -png`. A complete 1465×837 PPM extraction of the same PDF object was used with its paired mask to build `gallery-15-gaia-synthesis.png`. The inventory preserves both hashes and flags the failed PNG extraction.

All 40 retained candidates were reopened and fully decoded as RGBA PNGs. The 20 gallery files are fully opaque; the 20 detail files retain transparent pixels from their PDF masks.

## Workspace media snapshot outside this audit workstream

At the final scan snapshot:

`23 physical PNG files = 22 unique SHA-256 hashes`

The duplicate hash is the current-session homepage design concept stored at both:

- `generated_images/exec-5c1a1c49-7954-4c2c-bb9a-b69843b5bc12.png`
- `collective-stock/assets/originals/collective-stock-homepage-design-concept.png`

The remaining images are current-session PDF render intermediates under `workstreams/brand-systems/tmp/pdf-renders`. One such intermediate, `build-relevant-contact.png`, is truncated; it is recorded as invalid in the inventory and was not modified here. No video or audio files were found.

These current-session artifacts are not evidence that historical ChatGPT project images are locally available.

## Expected/missing conversation ledger

The user-provided conversation summary supplied request counts but no exact filenames or source bytes. Therefore the safe reconciliation is:

`265 expected request units = 0 confirmed local historical files + 265 unresolved request units`

| Division/entity | Expected request units | Confirmed local historical matches | Unresolved |
|---|---:|---:|---:|
| Signal Velocity | 19 | 0 | 19 |
| Gaia Synthesis | 22 | 0 | 22 |
| The Collective | 42 | 0 | 42 |
| Hybrid Living | 22 | 0 | 22 |
| Nexus Labs | 54 | 0 | 54 |
| Juris Guard | 34 | 0 | 34 |
| Eon Core | 16 | 0 | 16 |
| Quantum Ledger | 12 | 0 | 12 |
| Animus Prime | 12 | 0 | 12 |
| Vital Helix | 4 | 0 | 4 |
| Collective AI Inc parent | 2 | 0 | 2 |
| Kinetic Edge | 2 | 0 | 2 |
| Vector Shift | 2 | 0 | 2 |
| ZenFlow | 2 | 0 | 2 |
| Binary Loom | 2 | 0 | 2 |
| Terra Axis | 4 | 0 | 4 |
| Obsidian Arc | 2 | 0 | 2 |
| Aether Link | 6 | 0 | 6 |
| Civic Core | 4 | 0 | 4 |
| Unspecified two-image sheet request | 2 | 0 | 2 |
| **Total** | **265** | **0** | **265** |

This is a request ledger, not a success ledger. The successful-generation count remains unknown because the corresponding conversation outputs and files are inaccessible. Cognara Mind and Nomad Nexus were not assigned conversation-image counts in the supplied summary.

Separately, ten packaged brand references declare exact logo filenames such as `signal_velocity_logo.png` and `vital_helix_logo.png`. None of those exact filenames exists locally. The JSON ledger links each absent declaration to a PDF-derived visual candidate, but those candidates do not prove that the originally declared files exist.

## Outputs

- `/workspace/scratch/7ac83610e35a/workstreams/asset-archivist/local-media-inventory.json`
- `/workspace/scratch/7ac83610e35a/workstreams/asset-archivist/inaccessible-expected-assets.json`
- `/workspace/scratch/7ac83610e35a/workstreams/asset-archivist/extracted-logo-candidates/`
- `/workspace/scratch/7ac83610e35a/workstreams/asset-archivist/audit-notes.md`
