import { el, icon, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { MediaCard, optimizedPath } from "../components/media-card.js";
import { ArtGallery } from "../experience/art-gallery.js";
import { enhanceMasonry } from "../media/masonry-grid.js";
import { collectionRoute, divisionRoute } from "../utils/routes.js";
import { collectionDefinition } from "../data/collection-definitions.js";

const COLLECTIONS = ["animals", "general-stock", "hero-images", "complete-archive"];

function divisionRail(divisions, counts) {
  return el("div", { class: "division-rail" }, divisions.filter((item) => item.slug !== "collective-ai-inc").map((division, index) => el("a", { href: divisionRoute(division.slug), class: "division-rail__item", style: `--division-accent:${division.accent || "#D4A843"}` }, [
    el("span", { class: "division-rail__index mono", text: String(index + 1).padStart(2, "0") }),
    el("span", { class: "division-rail__signal", "aria-hidden": "true" }),
    el("strong", { text: division.name }),
    el("span", { class: "division-rail__count mono", text: `${formatCount(counts.get(division.slug) || 0)} assets` }),
    el("span", { class: "division-rail__facets mono", text: "Explore division" }),
    icon("arrow")
  ])));
}

function collectionRail(assets, index) {
  return el("div", { class: "collection-rail" }, COLLECTIONS.map((slug) => {
    const definition = collectionDefinition(slug);
    const matches = index.query(definition.constraints);
    const preferred = slug === 'animals' ? "Mountain Memory in an Owl's Eye" : slug === 'general-stock' ? 'Coastal Village at Sunset' : '';
    const asset = matches.find(a => a.title === preferred) || matches.find(a => a.mediaType === 'image' && a.featured) || matches[0] || assets[0];
    return el("a", { class: "collection-tile", href: collectionRoute(slug) }, [
      asset ? el("img", { src: optimizedPath(asset), alt: "", width: asset.width, height: asset.height, loading: "lazy", decoding: "async" }) : null,
      el("span", { class: "collection-tile__content" }, [el("strong", { text: definition.title }), el("small", { text: definition.description }), icon("arrow")])
    ]);
  }));
}

function featuredLibraries(assets, index) {
  return el("div", { class: "featured-library-grid" }, ["component-sheets", "division-intro-videos"].map((slug) => {
    const definition = collectionDefinition(slug);
    const matches = index.query(definition.constraints);
    const asset = matches[0];
    return el("a", { class: `featured-library-card is-${slug}`, href: collectionRoute(slug) }, [
      asset ? el("img", { src: optimizedPath(asset, "large"), alt: "", width: asset.width, height: asset.height, loading: "lazy", decoding: "async" }) : null,
      el("span", { class: "featured-library-card__veil", "aria-hidden": "true" }),
      el("span", { class: "featured-library-card__content" }, [
        el("span", { class: "featured-library-card__count mono", text: `${formatCount(matches.length)} verified assets` }),
        el("strong", { text: definition.title }),
        el("small", { text: definition.description }),
        el("span", { class: "featured-library-card__action" }, ["Open library", icon("arrow")])
      ])
    ]);
  }));
}

function motionRail(assets, onPreview) {
  const motion = assets.filter((asset) => asset.categorySlug === "motion-films");
  const intro = assets.filter((asset) => asset.categorySlug === "division-intro-videos");
  const tiles = [...motion, ...intro].slice(0, 8);
  if (!tiles.length) return el("div", { class: "motion-empty", text: "Motion films are being prepared for this archive." });
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
  search.root.querySelector("input").placeholder = "Search the archive";
  search.addEventListener("search", (event) => onSearch(event.detail.query));
  const newest = [...assets].sort((a, b) => String(b.ingestedAt || b.generationDate || "").localeCompare(String(a.ingestedAt || a.generationDate || "")));
  const uploadedImages = newest.filter((asset) => asset.originalDownloadPath?.includes("user-uploads-2026-08-09"));
  const recentMotion = newest.filter((asset) => asset.categorySlug === "motion-films");
  const recent = [uploadedImages[0], recentMotion[0], uploadedImages[1], uploadedImages[2], recentMotion[1], ...uploadedImages.slice(3)].filter(Boolean).slice(0, 8);
  const recentGrid = el("div", { class: "recent-grid" }, recent.map((asset) => MediaCard(asset, { favorites, lazyController, onPreview, toast })));
  enhanceMasonry(recentGrid);
  return el("main", { id: "main-content" }, [
    el("section", { class: "home-hero immersive-hero" }, [
      el("div", { class: "hero-copy" }, [
        el("h1", {}, ["A world ", el("br"), "beyond", el("br"), el("span", { text: "ordinary." })]),
        el("p", {}, ["Discover imagery that moves you.", el("br"), "Build something that moves the world."]),
        el("div", { class: "hero-search-row" }, [search.root, el("a", { class: "button button--primary", href: collectionRoute("complete-archive") }, ["Explore the archive", icon("arrow")])]),
        el("button", { class: "surprise-button", type: "button", onClick: () => {
          const pool = assets.filter(a => a.mediaType === "image");
          if (pool.length) onPreview(pool[Math.floor(Math.random() * pool.length)], pool);
        } }, ["Surprise me", icon("arrow")])
      ]),
      ArtGallery({ assets, onPreview })
    ]),
    el("nav", { class: "hero-quick-links media-type-band", "aria-label": "Media type shortcuts" }, [["All media", "complete-archive"], ["Photography", "stock-images"], ["Motion films", "motion-films"], ["Animals", "animals"], ["Components", "component-sheets"], ["Reference", "reference-images"]].map(([label, slug]) => el("a", { href: collectionRoute(slug), text: label }))),
    el("section", { class: "home-band curated-collections", id: "collections" }, [
      el("div", { class: "section-heading" }, [el("h2", { text: "Follow your curiosity." }), el("a", { href: collectionRoute("complete-archive") }, ["Explore collections", icon("arrow")])]),
      collectionRail(visualAssets, index)
    ]),
    el("section", { class: "home-band featured-libraries" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "New production libraries" }), el("h2", { text: "Build the brand. Set it in motion." })]), el("p", { text: "Complete implementation systems and cinematic identity films—named, verified, and ready to use." })]),
      featuredLibraries(assets, index)
    ]),
    el("section", { class: "home-band featured-divisions", id: "divisions" }, [
      el("div", { class: "section-heading section-heading--side" }, [el("div", {}, [el("p", { class: "section-label", text: "The complete ecosystem" }), el("h2", { text: "Twenty perspectives. One collective." })]), el("a", { href: collectionRoute("complete-archive") }, ["Browse all media", icon("arrow")])]),
      divisionRail(divisions, counts)
    ]),
    el("section", { class: "home-band recently-added" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Archive pulse" }), el("h2", { text: "Recently added" })]), el("a", { href: collectionRoute("recently-added") }, ["View all recent media", icon("arrow")])]),
      recentGrid
    ]),
    el("section", { class: "home-band motion-showcase" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Stories with a pulse" }), el("h2", { text: "Motion film collection" })]), el("a", { href: collectionRoute("motion-films") }, ["View all motion films", icon("arrow")])]),
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
    audit?.missingOrInaccessible > 0 ? el("aside", { class: "audit-notice" }, [icon("lock"), el("div", {}, [el("strong", { text: "Source ingest needs one follow-up" }), el("p", { text: `${formatCount(audit.missingOrInaccessible)} source archive is documented as inaccessible through the current provider limit. No substitutes or silent omissions were used.` })]), el("a", { href: "/audit.html", text: "Read the audit" })]) : null
  ]);
}
