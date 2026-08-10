import { el, icon, diamondStar, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { MediaCard, optimizedPath } from "../components/media-card.js";
import { LicenseBadge } from "../components/license-badge.js";
import { enhanceMasonry } from "../media/masonry-grid.js";
import { collectionRoute, divisionRoute } from "../utils/routes.js";
import { collectionDefinition } from "../data/collection-definitions.js";

const COLLECTIONS = ["hero-images", "reference-images", "motion-films", "complete-archive"];

function formatTime(value) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function motionStage(asset, count, onPreview) {
  if (!asset) return el("div", { class: "hero-mosaic static-hero-mosaic", "aria-label": "Motion library is being prepared" });
  const video = el("video", {
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    poster: asset.posterPath || "/assets/posters/media-fallback.svg",
    "aria-label": `${asset.title}, muted motion preview`
  });
  video.append(el("source", { src: asset.previewPath || asset.originalDownloadPath, type: asset.mimeType || "video/mp4" }));
  const play = el("button", { class: "hero-stage__play", type: "button", "aria-label": `Pause ${asset.title}` }, icon("play"));
  const current = el("span", { class: "mono", text: "00:00" });
  const duration = el("span", { class: "mono", text: formatTime(asset.duration) });
  const scrubber = el("input", { class: "hero-stage__scrubber", type: "range", min: "0", max: String(asset.duration || 1), step: "0.05", value: "0", "aria-label": `Seek through ${asset.title}` });
  const togglePlayback = async () => {
    if (video.paused) await video.play().catch(() => {});
    else video.pause();
  };
  const syncPlayback = () => {
    play.classList.toggle("is-playing", !video.paused);
    play.setAttribute("aria-label", `${video.paused ? "Play" : "Pause"} ${asset.title}`);
  };
  play.addEventListener("click", togglePlayback);
  video.addEventListener("click", togglePlayback);
  video.addEventListener("play", syncPlayback);
  video.addEventListener("pause", syncPlayback);
  video.addEventListener("loadedmetadata", () => {
    scrubber.max = String(video.duration || asset.duration || 1);
    duration.textContent = formatTime(video.duration || asset.duration);
  });
  video.addEventListener("timeupdate", () => {
    current.textContent = formatTime(video.currentTime);
    scrubber.value = String(video.currentTime);
    const progress = video.duration ? video.currentTime / video.duration : 0;
    scrubber.style.setProperty("--progress", `${progress * 100}%`);
  });
  scrubber.addEventListener("input", () => { video.currentTime = Number(scrubber.value); });
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) requestAnimationFrame(() => video.play().catch(syncPlayback));
  return el("div", { class: "hero-mosaic hero-stage" }, [
    video,
    el("div", { class: "hero-stage__topline" }, [
      el("span", { class: "mono", text: `Motion library · 01 / ${String(count).padStart(2, "0")}` }),
      el("button", { class: "hero-stage__expand", type: "button", "aria-label": `Open details for ${asset.title}`, onClick: () => onPreview(asset) }, ["View film", icon("expand")])
    ]),
    el("div", { class: "hero-stage__caption" }, [el("strong", { text: asset.title }), el("span", { text: "Collective motion study" })]),
    el("div", { class: "hero-stage__controls" }, [play, current, scrubber, duration, el("span", { class: "hero-stage__muted mono", text: "MUTED" })])
  ]);
}

function divisionRail(divisions, counts) {
  return el("div", { class: "division-rail" }, divisions.filter((item) => item.slug !== "collective-ai-inc").slice(0, 8).map((division, index) => el("a", { href: divisionRoute(division.slug), class: "division-rail__item", style: `--division-accent:${division.accent || "#D4A843"}` }, [
    el("span", { class: "division-rail__index mono", text: String(index + 1).padStart(2, "0") }),
    el("span", { class: "division-rail__signal", "aria-hidden": "true" }),
    el("strong", { text: division.name }),
    el("span", { class: "division-rail__count mono", text: `${formatCount(counts.get(division.slug) || 0)} assets` }),
    el("span", { class: "division-rail__facets mono", text: "[ photography ]  [ reference ]  [ motion ]" }),
    icon("arrow")
  ])));
}

function collectionRail(assets, index) {
  return el("div", { class: "collection-rail" }, COLLECTIONS.map((slug) => {
    const definition = collectionDefinition(slug);
    const asset = index.query(definition.constraints)[0] || assets[0];
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
  const motionAssets = assets.filter((asset) => asset.categorySlug === "motion-films");
  const heroMotion = motionAssets.find((asset) => asset.title.toLowerCase().includes("owl")) || motionAssets[0];
  const counts = assets.reduce((map, asset) => map.set(asset.divisionSlug, (map.get(asset.divisionSlug) || 0) + 1), new Map());
  const search = new GlobalSearch({ index, assets, divisions });
  search.addEventListener("search", (event) => onSearch(event.detail.query));
  const newest = [...assets].sort((a, b) => String(b.ingestedAt || b.generationDate || "").localeCompare(String(a.ingestedAt || a.generationDate || "")));
  const uploadedImages = newest.filter((asset) => asset.originalDownloadPath?.includes("user-uploads-2026-08-09"));
  const recentMotion = newest.filter((asset) => asset.categorySlug === "motion-films");
  const recent = [uploadedImages[0], recentMotion[0], uploadedImages[1], uploadedImages[2], recentMotion[1], ...uploadedImages.slice(3)].filter(Boolean).slice(0, 8);
  const recentGrid = el("div", { class: "recent-grid" }, recent.map((asset) => MediaCard(asset, { favorites, lazyController, onPreview, toast })));
  enhanceMasonry(recentGrid);
  return el("main", { id: "main-content" }, [
    el("section", { class: "home-hero" }, [
      el("div", { class: "hero-copy" }, [
        el("h1", {}, ["Every vision.", el("br"), "One collective intelligence."]),
        el("p", { text: "Photography, branded reference imagery, motion, and spatial media—curated from the Collective AI ecosystem." }),
        search.root,
        el("nav", { class: "hero-quick-links", "aria-label": "Media type shortcuts" }, [["All media", "complete-archive"], ["Components", "component-sheets"], ["Motion films", "motion-films"], ["Photography", "stock-images"], ["Reference", "reference-images"]].map(([label, slug]) => el("a", { href: collectionRoute(slug), text: label })))
      ]),
      heroMotion ? motionStage(heroMotion, motionAssets.length, onPreview) : el("div", { class: "hero-empty" }, [diamondStar(), el("p", { text: "The source archive is being reconciled." })])
    ]),
    el("section", { class: "home-band featured-libraries" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "New production libraries" }), el("h2", { text: "Build the brand. Set it in motion." })]), el("p", { text: "Complete implementation systems and cinematic identity films—named, verified, and ready to use." })]),
      featuredLibraries(assets, index)
    ]),
    el("section", { class: "home-band featured-divisions" }, [
      el("div", { class: "section-heading section-heading--side" }, [el("div", {}, [el("p", { class: "section-label", text: "The complete ecosystem" }), el("h2", { text: "Featured divisions" })]), el("a", { href: collectionRoute("complete-archive") }, ["Browse all media", icon("arrow")])]),
      divisionRail(divisions, counts)
    ]),
    el("section", { class: "home-band curated-collections" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label", text: "Editorial discovery" }), el("h2", { text: "Curated collections" })]), el("p", { text: "Built for the way creative teams actually search: by intention, format, division, and rights." })]),
      collectionRail(visualAssets, index)
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
