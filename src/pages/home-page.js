import { el, icon, diamondStar, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { MediaCard, optimizedPath } from "../components/media-card.js";
import { LicenseBadge } from "../components/license-badge.js";
import { enhanceMasonry } from "../media/masonry-grid.js";
import { collectionRoute, divisionRoute } from "../utils/routes.js";

const COLLECTIONS = [
  ["hero-images", "Hero images", "High-impact first impressions"],
  ["brand-sheets", "Brand systems", "Reference, component and specification sheets"],
  ["motion-references", "Motion references", "Movement, timing and cinematic direction"],
  ["complete-archive", "Complete archive", "Every accessible asset, fully reconciled"]
];

function mediaMosaic(assets, onPreview) {
  const selected = assets.slice(0, 7);
  return el("div", { class: "hero-mosaic", "aria-label": "Curated Collective AI media" }, selected.map((asset, index) => {
    const button = el("button", { class: `hero-mosaic__item item-${index + 1}`, type: "button", "aria-label": `Preview ${asset.title}`, style: `--media-aspect:${asset.width}/${asset.height}`, onClick: () => onPreview(asset) }, [
      el("img", { src: optimizedPath(asset, index < 3 ? "large" : "card"), alt: asset.altText || asset.title, width: asset.width, height: asset.height, decoding: "async", fetchPriority: index < 2 ? "high" : "auto" }),
      el("span", { class: "mosaic-meta" }, [el("strong", { text: asset.title }), el("small", { text: asset.division })])
    ]);
    return button;
  }));
}

function divisionRail(divisions, counts) {
  return el("div", { class: "division-rail" }, divisions.filter((item) => item.slug !== "collective-ai-inc").map((division, index) => el("a", { href: divisionRoute(division.slug), class: "division-rail__item", style: `--division-accent:${division.accent || "#D4A843"}` }, [
    el("span", { class: "division-rail__index mono", text: String(index + 1).padStart(2, "0") }),
    el("strong", { text: division.name }),
    el("span", { text: `${formatCount(counts.get(division.slug) || 0)} assets` }),
    icon("arrow")
  ])));
}

function collectionRail(assets) {
  return el("div", { class: "collection-rail" }, COLLECTIONS.map(([slug, title, description], index) => {
    const asset = assets[index % Math.max(assets.length, 1)];
    return el("a", { class: "collection-tile", href: collectionRoute(slug) }, [
      asset ? el("img", { src: optimizedPath(asset), alt: "", width: asset.width, height: asset.height, loading: "lazy", decoding: "async" }) : null,
      el("span", { class: "collection-tile__content" }, [el("strong", { text: title }), el("small", { text: description }), icon("arrow")])
    ]);
  }));
}

function motionRail(assets, onPreview) {
  const motion = assets.filter((asset) => asset.mediaType === "video" || asset.categorySlug === "motion-references").slice(0, 6);
  const fallback = assets.slice(0, 6);
  const tiles = motion.length ? motion : fallback;
  // The rail draws its column count from the tiles it actually has, so a short
  // archive fills the row instead of leaving empty tracks on the right.
  return el("div", { class: "motion-rail", style: `--rail-columns:${Math.max(tiles.length, 1)}` }, tiles.map((asset) => el("button", { class: `motion-tile ${asset.mediaType === "video" ? "is-video" : "is-static"}`, type: "button", "aria-label": `Preview ${asset.mediaType === "video" ? "motion" : "static motion reference"}: ${asset.title}`, onClick: () => onPreview(asset) }, [
    el("img", { src: asset.posterPath || optimizedPath(asset), alt: asset.altText || asset.title, width: asset.width, height: asset.height, loading: "lazy" }),
    el("span", { class: "motion-tile__play" }, icon(asset.mediaType === "video" ? "play" : "expand")),
    el("span", { class: "motion-tile__meta" }, [el("strong", { text: asset.title }), el("small", { text: asset.mediaType === "video" ? "Motion preview" : "Static motion reference" })])
  ])));
}

export function HomePage({ assets, divisions, index, audit, onSearch, onPreview, favorites, lazyController, toast }) {
  const featured = assets.filter((asset) => asset.featured);
  const visualAssets = (featured.length >= 7 ? featured : assets).slice(0, 20);
  const counts = assets.reduce((map, asset) => map.set(asset.divisionSlug, (map.get(asset.divisionSlug) || 0) + 1), new Map());
  const search = new GlobalSearch({ index, assets, divisions });
  search.addEventListener("search", (event) => onSearch(event.detail.query));
  const recent = [...assets].sort((a, b) => String(b.ingestedAt || b.generationDate || "").localeCompare(String(a.ingestedAt || a.generationDate || ""))).slice(0, 8);
  const recentGrid = el("div", { class: "recent-grid" }, recent.map((asset) => MediaCard(asset, { favorites, lazyController, onPreview, toast })));
  enhanceMasonry(recentGrid);
  return el("main", { id: "main-content" }, [
    el("section", { class: "home-hero" }, [
      el("div", { class: "hero-copy" }, [
        el("h1", {}, ["Every vision.", el("br"), "One collective intelligence."]),
        el("p", { text: "Photography, branded reference imagery, motion, and spatial media—curated from the Collective AI ecosystem." }),
        search.root,
        el("div", { class: "hero-quick-links", "aria-label": "Media type shortcuts" }, [["All media", "complete-archive"], ["Photography", "stock-images"], ["Reference", "reference-images"], ["Motion", "videos"], ["Spatial", "3d-spatial-media"]].map(([label, slug], i) => el("a", { href: collectionRoute(slug), class: i === 0 ? "is-active" : "", text: label })))
      ]),
      visualAssets.length ? mediaMosaic(visualAssets, onPreview) : el("div", { class: "hero-empty" }, [diamondStar(), el("p", { text: "The source archive is being reconciled." })])
    ]),
    el("section", { class: "home-band featured-divisions" }, [
      el("div", { class: "section-heading section-heading--side" }, [el("div", {}, [el("p", { class: "section-label", text: "The complete ecosystem" }), el("h2", { text: "Featured divisions" })]), el("a", { href: collectionRoute("complete-archive") }, ["Browse all media", icon("arrow")])]),
      divisionRail(divisions, counts)
    ]),
    el("section", { class: "home-band curated-collections" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Editorial discovery" }), el("h2", { text: "Curated collections" })]), el("p", { text: "Built for the way creative teams actually search: by intention, format, division, and rights." })]),
      collectionRail(visualAssets)
    ]),
    el("section", { class: "home-band recently-added" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Archive pulse" }), el("h2", { text: "Recently added" })]), el("a", { href: collectionRoute("recently-added") }, ["View all recent media", icon("arrow")])]),
      recentGrid
    ]),
    el("section", { class: "home-band motion-showcase" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Built for motion" }), el("h2", { text: "Motion showcase" })]), el("p", { text: "Poster-first previews, viewport-aware playback, static fallbacks, and reduced-motion support are built into the media layer." })]),
      motionRail(assets, onPreview)
    ]),
    el("section", { class: "home-band licensing-section", id: "licensing" }, [
      el("div", { class: "licensing-intro" }, [el("p", { class: "section-label", text: "Rights without ambiguity" }), el("h2", { text: "Licensing, made explicit" }), el("p", { text: "Every asset carries a readable rights profile, visibility state, provenance trail, and delivery policy." }), el("a", { class: "text-link", href: collectionRoute("public-download") }, ["Explore public assets", icon("arrow")])]),
      el("div", { class: "license-principles" }, [
        ["Clear rights", "Permitted and restricted uses are stated on every detail page.", "check"],
        ["Protected delivery", "Private originals route through authenticated, signed delivery architecture.", "lock"],
        ["Attribution clarity", "Credits and editorial terms live beside the download controls.", "globe"],
        ["Future ready", "Rights-managed, royalty-free, and custom licenses share one model.", "layers"]
      ].map(([title, description, iconName]) => el("article", {}, [el("span", { class: "license-principle__icon" }, [icon(iconName)]), el("h3", { text: title }), el("p", { text: description })])))
    ]),
    audit?.missingOrInaccessible > 0 ? el("aside", { class: "audit-notice" }, [icon("lock"), el("div", {}, [el("strong", { text: "Archive audit in progress" }), el("p", { text: `${formatCount(audit.missingOrInaccessible)} expected historical outputs are documented as inaccessible in this environment. No substitutes or silent omissions were used.` })]), el("a", { href: "/audit.html", text: "Read the audit" })]) : null
  ]);
}
