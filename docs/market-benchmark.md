# COLLECTIVE STOCK — 2026 stock-platform interaction benchmark

**Review date:** 2026-08-08  
**Role:** Independent market benchmark lead  
**Scope:** Public, signed-out desktop surfaces for Shutterstock, Adobe Stock, Getty Images/iStock, Depositphotos, and Envato Elements. This document benchmarks interaction patterns; it does **not** approve, score, or certify the COLLECTIVE STOCK implementation.

## Executive findings

The five platforms have converged on a common 2026 model: search is the primary homepage action; media scope is chosen before or during search; results are image-dense but paired with progressive filters; an asset detail page combines a large preview with rights, dimensions, and a conversion control; and AI-assisted search/editing is now part of the discovery path rather than a separate novelty.

The most useful synthesis for COLLECTIVE STOCK is:

1. **Search like Shutterstock:** expose conventional and assisted search as distinct, understandable modes; keep related queries and media scope visible.
2. **Curate like Adobe Stock:** follow the hero with cross-media editorial collections and allow an asset to move from discovery to modification without losing context.
3. **Explain rights like Getty:** put the license, releases, file dimensions, provenance, and permitted transaction beside the preview—not in a remote legal page.
4. **Filter like Depositphotos:** provide high-value visual filters (orientation, people, point of view, color, date, contributor, editorial/AI exclusions) in an expandable structure.
5. **Organize media like Envato Elements:** make heterogeneous formats understandable through a strong taxonomy, compatibility metadata, and curated multi-format collections.

COLLECTIVE STOCK should combine those principles without reproducing any competitor's wording, iconography, pricing-card structure, page proportions, brand signals, or distinctive trade dress.

## Method and evidence quality

The benchmark used live public pages in a signed-out cloud browser, semantic DOM snapshots where available, and current first-party license/help pages. A single neutral query—“future city”—was used to compare result architecture. Detail pages were opened from live results. No account was created, no purchase or download was attempted, and no CAPTCHA was bypassed.

Evidence labels used below:

- **Observed:** directly present on the live public page on the review date.
- **Documented:** stated on a first-party product, help, or license page.
- **Inference:** a design implication for COLLECTIVE STOCK, explicitly separated from competitor facts.

## Side-by-side interaction matrix

| Area | Shutterstock | Adobe Stock | Getty Images / iStock | Depositphotos | Envato Elements |
|---|---|---|---|---|---|
| Homepage hierarchy | Search-led hero with Search / Search Assistant / Generate choices, media chips, trending queries, and a prominent unlimited-download offer. | Search-led hero followed by AI Studio, media-tabbed curated collections, popular-use collections, plan CTA, and FAQ. | Very restrained search-led hero; Creative/Editorial/Video scoping; promotional/editorial carousel; a visually dense content stream. | Search-led hero with asset-type scope, AI Mode, reverse-image search, trending terms; relatively sparse public homepage below. | Value proposition and subscription CTA share priority with search; broad cross-media taxonomy and asset-count category links dominate discovery. |
| Search modes | Explicit **AI search** versus **Standard search**, related queries, reverse-image entry point, and media scope. | Asset-type dropdown, visual search, Find Similar, and AI-assisted editing/search ecosystem. | Search scopes distinguish creative images/video, editorial images/video, and general image/video search. | Asset-type search, AI Assistant, AI Mode, and image search. | Asset-type scoped search, Looks Like visual search, and a separate “Sounds Like” entry for audio. |
| Result refinement | Filters, upload date, “Unlimited images only,” related queries, media cross-link, and pagination. | Filters, Find Similar, sort, result count, view controls, asset type, and visual search. | Strong content-mode separation; search guidance and enterprise tooling exist, but the public homepage emphasizes broad mode selection more than visible faceting. | Deep visible facets: orientation, isolated/renders, people count/demographics/framing, camera angle, date, contributor, editorial, color, origin/location, season/time, size, excluded keywords, and AI content. | Category-specific filters for people, color, orientation, and relevance sorting; taxonomy is strongest at category entry points. |
| Grid/card actions | Dense results with semantic asset labels; content-type provenance is visible in titles/URLs; related-search loop is strong. | Dense results with descriptive image alternatives and a persistent search/refinement shell. | Homepage cards foreground contributor and asset ID; premium/editorial provenance is prominent. | Save, Find Similar, and Quick Preview actions appear on result cards. | Cards expose descriptive title and author; previews and author portfolios connect discovery to related assets. |
| Asset detail | Large preview, AI edit entry points, Save/Try, multiple file sizes, pricing choice, Enhanced License option, asset ID/date/category/contributor. | Large preview, Edit in AI Studio, Save, preview download, Find Similar, file ID, dimensions, type, category, and Standard/Extended license choices. | Zoom, Save, Comp, Embed, Buy Print; resolution/price choices; license type, creator, collection, max file, upload date, location, release info, and categories. | Large preview plus remove-background, Save, Share, Sample, and a strong account-creation gate before download. | Large preview, subscription CTA, collection save, orientation/dimensions, commercial-license link, description, tags, similar media, and author portfolio. |
| Licensing message | Standard versus Enhanced; current public copy describes worldwide, perpetual usage and differentiates print/merchandise limits. | Standard, Enhanced, and Extended distinctions are documented; the asset page lets the user choose applicable options before licensing. | Getty puts royalty-free license and release metadata on the detail page. iStock states Standard by default, Extended for additional rights, and a royalty-free model. | Standard versus Extended is documented, but the sampled signed-out detail flow foregrounded registration more than rights explanation. | One commercial license model with a separate license for each project use; the detail page describes a lifetime commercial license and links to full terms. |
| Video/motion | Dedicated video product, HD/4K search, video-specific plans, and media switching. | Homepage video collection cards expose play controls, duration, HD/4K badges; dedicated video library and advanced shot-size/angle filters are documented. | Dedicated creative-video and editorial-video modes; current public creative-video page shows durations and HD/4K positioning. | Dedicated video and music surfaces; homepage promotes HD/4K video. | Video templates, stock video, motion graphics, vertical video, VJ loops, effects, overlays, transitions, and software-compatibility taxonomy are first-class. |
| Conversion pattern | Persistent unlimited-download CTA, pricing visibility, per-image versus subscription comparison on detail, business upsell. | Free-trial banner, license/download CTA on detail, plan CTA after editorial discovery, AI editing as added value. | Price and license are adjacent to the preview; packs, subscriptions, market-freeze, comp/embed, and enterprise paths address different buyer intents. | Sign-up gate is the strongest conversion device on the sampled asset detail page; pricing and live chat are persistent. | “Subscribe to download” is paired with unlimited assets, AI tools, license promise, and annual price anchor. |
| Accessibility signals observed | Search/detail pages included a skip link, landmarked primary navigation, labeled tabs, searchbox, headings, and an explicit disabled state for unavailable actions. | Labeled navigation, tablists, play/pause controls, descriptive asset alternatives, radiogroup licensing, and semantic detail metadata. Adobe also publishes a Stock web accessibility conformance report covering WCAG 2.0/2.1 A and AA. | Labeled navigation/search, descriptive image alternatives, explicit button names, radio choices, headings, and structured detail labels. Carousel content appeared duplicated in the semantic snapshot, a risk to verify with screen readers. | Controls were generally labeled, but several filter labels relied on generic text/switch adjacency; the detail sign-up interstitial materially interrupts the content flow. | A skip link, labeled main navigation/search, semantic fieldsets/checkboxes, descriptive previews, breadcrumbs, headings, and terms/definitions were observed. |
| Performance signals | Search/detail content rendered publicly, but no competitor Core Web Vitals were measured. | Media-rich homepage defers into carousels and explicit play controls; numeric CWV not measured. | Large content stream and carousel; numeric CWV not measured. | Lean homepage; deeper filter UI appears on results; numeric CWV not measured. | Very large cross-media navigation and rich homepage taxonomy; numeric CWV not measured. |

## Platform notes and actionable implications

### Shutterstock

Observed on the [homepage](https://www.shutterstock.com/), [“future city” results](https://www.shutterstock.com/search/future-city), and a sampled [asset detail page](https://www.shutterstock.com/image-photo/modern-city-illustration-isolated-white-space-2085734305):

- The homepage makes the transaction legible immediately: one dominant search surface, explicit media tabs, and an obvious path to subscription value.
- Search preserves two mental models—AI-assisted and literal/standard—rather than silently blending them. Results add related searches, a media cross-link, result count, upload-date refinement, and pagination.
- Detail pages integrate AI edits with practical file data and show a Standard-versus-Enhanced decision beside price and download.
- The persistent commercial layer is effective but visually busy; COLLECTIVE STOCK should keep internal users focused on finding and using media, with monetization or public licensing presented only when relevant.

Documented licensing: Shutterstock’s current [license agreement](https://www.shutterstock.com/license) and [pricing](https://www.shutterstock.com/pricing) distinguish Standard and Enhanced rights and subscription/enterprise models.

**Apply:** mode clarity, related-search loop, media scope, visible result count, inline format/license options.  
**Avoid copying:** header composition, orange CTA treatment, subscription-card layout, exact AI-mode naming, or asset-detail proportions.

### Adobe Stock

Observed on the [homepage](https://stock.adobe.com/), [“future city” results](https://stock.adobe.com/search?k=future%20city), and a sampled [asset detail page](https://stock.adobe.com/images/big-data-connection-technology-concept/379844625):

- The homepage does more than search: it demonstrates a search → edit → license workflow, then uses media tabs and curated collections to support inspiration without a query.
- Search exposes asset type, visual search, filters, Find Similar, sorting, result count, and a dense grid with meaningful alternative text.
- The detail page gives the preview primary visual weight but keeps file ID, dimensions, type, category, creator, keywords, and license choice within the same page.
- Video cards surface duration and HD/4K badges and require an explicit play action in the semantic surface.

Documented discovery and rights: Adobe’s [advanced search features](https://stock.adobe.com/search-features) include reverse image, color, copyspace, depth-of-field, and video shot filters. Its [license terms](https://stock.adobe.com/license-terms) distinguish Standard, Enhanced, Extended, and Editorial use. Adobe publishes an [Adobe Stock web accessibility conformance report](https://www.adobe.com/accessibility/compliance/adobe-stock-web-2023-acr.html).

**Apply:** inspirational editorial rails, visual similarity, file metadata, before-license preview/edit architecture, video badges and controls.  
**Avoid copying:** Adobe product chrome, AI Studio presentation, free-trial banner design, Spectrum visual language, or Creative Cloud workflow mimicry.

### Getty Images / iStock

Observed on the [Getty homepage](https://www.gettyimages.com/), [creative video](https://www.gettyimages.com/creative-video), and a sampled [Getty asset detail page](https://www.gettyimages.com/detail/photo/business-problem-solving-and-decision-making-royalty-free-image/2277486321):

- Getty’s key advantage is content authority. The homepage distinguishes Creative, Editorial, and Video before the user searches; asset detail reinforces that authority through creator, collection, upload date, location, release status, and license type.
- The detail page supports multiple professional intents—zoom, save, comp, embed, print, direct license, packs, and enterprise rights—without reducing everything to one download button.
- The large number of homepage assets creates editorial energy, but repeated carousel groups in the semantic snapshot are a caution: cloned slides must be hidden correctly from assistive technology.

iStock’s current first-party pages document a simpler royalty-free model: the [homepage](https://www.istockphoto.com/) positions photos, videos, vectors, and illustrations; the [license help page](https://www.istockphoto.com/help/licenses) and [content license agreement](https://www.istockphoto.com/legal/license-agreement) state Standard by default and Extended for additional rights; the [using-files FAQ](https://www.istockphoto.com/faq/using-files) describes commercial/editorial uses and modification.

**Apply:** explicit creative/editorial distinction, release information, provenance, comps, professional-use actions, and visible rights status.  
**Avoid copying:** Getty’s black/white editorial treatment, premium-agency tone verbatim, creator/ID card design, or iStock’s Signature/Essentials merchandising.

### Depositphotos

Observed on the [homepage](https://depositphotos.com/), [“future city” results](https://depositphotos.com/photos/future-city.html), and a sampled [asset detail page](https://depositphotos.com/photo/futuristic-architecture-neon-lights-contemporary-cityscape-sunset-rendering-849450950.html):

- Depositphotos provides the most visibly comprehensive result filters in the sample. It supports both inclusive and exclusive constraints (People Only/Exclude People, Editorial Only/Exclude Editorial, isolated/renders exclusions), which is especially useful in a governed internal library.
- Card-level Save, Find Similar, and Quick Preview actions reduce unnecessary detail-page visits.
- The public detail experience makes account creation the dominant action before download. That can improve acquisition, but it obscures rights and is inappropriate for authenticated internal users who already have access.

Documented rights and media: the [homepage](https://depositphotos.com/) presents images, vectors, illustrations, video, editorial, and audio; the current [Standard versus Extended guide](https://blog.depositphotos.com/standard-license-vs-extended-license.html) explains the two image-license levels.

**Apply:** inclusive/exclusive filters, quick preview, card-level similarity, visual/AI search, and deep query control.  
**Avoid copying:** acquisition gate timing, purple/green visual system, filter-panel styling, or exact quick-action treatment.

### Envato Elements

Observed on the [homepage](https://elements.envato.com/), [“future city” photo results](https://elements.envato.com/photos/future%2Bcity), and a sampled [asset detail page](https://elements.envato.com/creative-city-wallpaper-with-glowing-polygonal-con-CUKBHLS):

- Envato is the best reference for a library that must span photos, stock video, motion graphics, templates, audio, graphics, 3D, fonts, add-ons, and presentations. Category navigation includes compatibility and use-case pathways, not just file type.
- Results expose people, color, and orientation filters; detail pages provide dimensions, tags, descriptions, related assets, author portfolios, and a consistent license link.
- The navigation is information-rich enough to become overwhelming. COLLECTIVE STOCK should use its 20-division mega-menu and media taxonomy through progressive disclosure, with search always available as the escape hatch.

Documented licensing: the [Envato Elements License](https://help.elements.envato.com/hc/en-us/articles/360000628966-Envato-Elements-License) grants a license for a specified project use, requires a new license for a separate project use, and preserves completed-project rights after subscription end under its terms. The [license certificate guide](https://help.elements.envato.com/hc/en-us/articles/360000621443-Envato-item-license-certificate) frames the certificate as proof for a specific item/project.

**Apply:** cross-media taxonomy, compatibility metadata, curated mixed-format collections, project-linked license records, and related-author/series navigation.  
**Avoid copying:** mega-menu columns, subscription promise wording, green brand treatment, asset-count merchandising, or exact category labels/order.

## Required COLLECTIVE STOCK patterns

### Homepage and navigation

- Make the global search the primary action, with media scope directly attached.
- Follow the hero with actual-project editorial collections, division entry points, recent media, and a motion/video rail; avoid a generic marketing homepage.
- Keep the 20-division mega-menu progressively disclosed and searchable. Mobile must use a dedicated full-screen/bottom-sheet navigation pattern, not a compressed desktop mega-menu.
- Show the current access context (“Internal,” “Public,” or “Restricted”) as operational status, not a decorative badge.

### Search and gallery discovery

- Separate literal catalog search from assisted/semantic search in wording and behavior.
- Preserve query and filters in the URL; expose result count; provide related queries, recent searches, and an obvious reset.
- Use inclusive and exclusive governance filters: e.g. Internal only / exclude internal, AI-generated / non-AI, approved / pending, image / video / 3D.
- Result cards should support Save, Quick Preview, Find Similar, and visible media metadata. No essential action may be hover-only.
- Group exact variants and revisions without collapsing provenance occurrences.

### Asset detail and licensing

- Keep preview, provenance, dimensions, format, revision/series, visibility, license, permitted/restricted uses, and download renditions in one coherent detail experience.
- Place license/access status beside the download action. A disabled button or hidden CSS is not access control.
- Add “comp/preview” behavior for internal workflows, but watermark and delivery rules must follow manifest visibility.
- Show model/property/release status when applicable; for AI assets, show generation provenance and prompt visibility policy.
- Preserve previous/next navigation and variant/related rails without losing the active search context.

### Video and motion

- Poster first; `playsinline`; muted only when autoplaying; explicit accessible play/pause; duration, orientation, resolution, and caption status visible before playback.
- Activate previews only in-view, pause offscreen, cap simultaneous playback, respect reduced motion, and fall back to the poster on network failure.
- Support vertical media as a first-class layout, not a crop of landscape cards.

### Accessibility and performance

- Include skip links, landmarks, one coherent page `h1`, labeled search scope, keyboard-operable filter chips, focus restoration from dialogs, and no duplicated carousel content in the accessibility tree.
- Test media controls with screen readers and keyboard, not only automated scanners.
- Use real responsive derivatives, fixed dimensions/aspect ratio, poster-first video, limited above-the-fold priority, immutable caching, and a preview concurrency budget.
- Judge COLLECTIVE STOCK against its explicit mobile Core Web Vitals targets. Competitor page weight or visual richness is not permission to miss them.

## Conversion principles without public-market dark patterns

COLLECTIVE STOCK has both internal and potentially public users, so conversion must be context-aware:

- **Internal:** optimize for successful search, confident rights selection, and correct download—not account acquisition.
- **Public:** explain value, license, and required authentication before the irreversible action; preserve preview and metadata without forcing registration prematurely.
- **Restricted:** explain who can approve access and preserve a non-destructive request-access architecture; never reveal the private original URL.
- **Everywhere:** avoid fake urgency, preselected paid upgrades, ambiguous “free” claims, obstructive sign-up walls, and consent bundled into unrelated actions.

## Access blockers and limits

1. **iStock live-site blocker:** direct cloud-browser navigation returned a site-provided “Site Unavailable / Unable to access this site” page. iStock observations therefore rely on current first-party indexed homepage, FAQ, pricing, and license pages; no live iStock grid or mobile interaction is claimed.
2. **Regional redirects:** Adobe Stock redirected to an Australian locale and Getty Images to `gettyimages.com.au` in the cloud browser. Local currency and regional offer copy were treated as incidental, not global defaults.
3. **Signed-out scope:** account-only functions—boards/libraries, saved searches, purchases, actual downloads, license history, project registration, team permissions, and signed URLs—were not exercised.
4. **Mobile limitation:** the available live-browser surface used a fixed desktop viewport. Responsive mobile layouts, gestures, breakpoint behavior, and soft-keyboard behavior were not directly observed. The rubric requires separate real-device or emulated mobile evidence for COLLECTIVE STOCK.
5. **Performance limitation:** the browser’s page Performance API was unavailable in the inspection sandbox, so no competitor LCP/CLS/INP or byte-weight numbers are reported. The COLLECTIVE STOCK critic must use Lighthouse/DevTools or equivalent controlled measurements on the implementation.
6. **Video limitation:** public video pages and semantic play controls, duration, and quality labels were inspected; hover autoplay timing, concurrent playback limits, captions, transcript coverage, HLS behavior, and reduced-motion behavior were not exhaustively tested.
7. **Accessibility limitation:** this was a semantic inspection, not a full assistive-technology audit. No competitor receives a WCAG conformance claim from this benchmark. Adobe’s own published conformance report is cited as first-party documentation, not independent certification.
8. **Temporal volatility:** pricing, asset counts, AI features, and marketing copy change frequently. Interaction principles are the durable output; current counts or price examples should not be copied into COLLECTIVE STOCK requirements.

## Handoff to the independent critic

Use `rubric.json` as the scoring contract. Require evidence for every category and preserve all hard gates. A weighted score at or above 9.3/10 is necessary but not sufficient: any hard-gate failure blocks approval. Do not award competitor-parity points for visual resemblance; score COLLECTIVE STOCK on task success, its own Collective AI identity, and whether it implements the abstract interaction principles above.

