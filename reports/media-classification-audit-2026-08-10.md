# Media classification audit — 2026-08-10 (America/New_York)

The audit date uses the project timezone, America/New_York. The album-map and search-snapshot timestamps preserve that UTC offset so the August 10 review date and the build chronology remain unambiguous.

## Outcome

All 466 source assets were reviewed against their visible subject, embedded marks, filename/provenance, series continuity, and division color language. Division color was used as corroborating evidence, never as the sole assignment signal.

- 416 images were visually inspected.
- All 50 videos were reviewed from representative opening, middle, and closing frames.
- 396 assets remain in their verified division, parent-brand, or cross-division scope.
- 20 animal-led assets now live in the dedicated **Animals** collection.
- 50 unbranded or standalone assets now live in **General Stock**.
- No Animals or General Stock asset is returned by a division-page query.
- Nine Google Photos records whose physical destination directory disagreed with their manifest division are now reconciled; the current mismatch count is zero.

The parent division value on standalone stock is custodial schema metadata only. The public UI, search scope, breadcrumbs, related media, and collection pages use the audited Animals or General Stock scope.

## Reclassification decisions

| Source cohort | Reviewed | Animals | General Stock | Division-scoped retained |
| --- | ---: | ---: | ---: | ---: |
| Google Photos album | 330 | 14 | 23 | 293 |
| Direct image uploads | 7 | 1 | 6 | 0 |
| Standalone motion library | 26 | 5 | 21 | 0 |
| Division intro films | 20 | 0 | 0 | 20 |
| Other named/component/reference media | 83 | 0 | 0 | 83 |
| **Total** | **466** | **20** | **50** | **396** |

### Animals

- Google Photos: Lion at Dawn (3), Predator Confrontation (4), Running Leopard (3), and Liquid Horse Study (4).
- Direct upload: Mountain Memory in an Owl's Eye (1).
- Motion: Arctic Fox in the Morning Haze; Moon Nest in the Ancient Tree; Mountain Memory in an Owl's Eye; Rainforest Toucan in the Canopy; Silverback in Monochrome (5).

### General Stock

- Google Photos standalone `IMG-*` series: Dustworld Astronaut (4), Wildflower Contemplation (4), Modular Glass Habitat (1), Neon Motorcycle Run (3), Luminous Bio-Tree (4), and Neon City Corridor (3).
- Google Photos videos: Misty Green Mountain Flyover; Storm over Golden Fields; Breakthrough Light over Mountains; Volumetric Light Portal (4).
- Direct uploads: Crimson Tea at the Farmhouse Window; Paper Trails through Lavender Hills; Coastal Village at Sunset; The Long Road Home; Pacific Boulevard in Blue; Palm Promenade to the Sea (6).
- The remaining 21 unbranded films in the standalone motion library.

Every one of the 33 Google Photos files whose original filename begins with `IMG-` is now in Animals or General Stock. None remains assigned to a division.

## Physical destination reconciliation

The audit also found nine pre-existing cases where the manifest named one scope but the materialized file lived in another division directory. Album indices 11, 47, 50, 53, 57, 58, 59, 317, and 319 now materialize into the same custodial directory recorded by their metadata. Four are the unbranded videos now held under the parent stock custodian; the remaining five retain their visually verified Vector Shift or Animus Prime metadata. The validation source map now reports zero destination/metadata mismatches.

## Corrected intro-film assignment

`violet-synaptic-mirror-intro-video.mp4` was previously treated as a global parent-brand film. Its on-screen Z/F balance mark matches the approved ZenFlow identity, so it is now a high-confidence ZenFlow division intro. The other 19 intro films retain their visually verified division assignments.

## Retained division assignments

The remaining Google Photos sets and repository media were retained where at least one of these signals supported the current division:

1. A printed division name, approved logo, or distinctive monogram is visible.
2. The original filename explicitly names the division.
3. A continuous generated series shares the division's established palette and visual system.
4. The visible subject directly matches the division's documented domain and neighboring verified assets.

The cross-division visual-language moodboard remains cross-division because it intentionally combines multiple division systems. Unbranded subjects were not left in a division merely because their colors could plausibly fit.

## Regression controls

The validation suite now fails if:

- any standalone `IMG-*` file falls outside Animals or General Stock;
- any of the 26 unbranded motion studies is assigned to a division;
- an Animals or General Stock item carries a non-parent custodial division;
- the expected audited totals change from 20 Animals and 50 General Stock assets without an explicit test update;
- the Violet Synaptic Mirror intro is no longer high-confidence ZenFlow;
- a division-page search returns an Animals or General Stock item.
