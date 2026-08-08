import { el, icon, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { FilterBar } from "../components/filter-bar.js";
import { MediaGrid } from "../components/media-grid.js";
import { optimizedPath } from "../components/media-card.js";
import { writeUrlState } from "../utils/url-state.js";

const COLLECTION_TITLES = {
  "stock-images": "Stock images",
  "reference-images": "Reference images",
  "hero-images": "Hero images",
  "website-backgrounds": "Website backgrounds",
  "app-backgrounds": "App backgrounds",
  "brand-sheets": "Brand sheets",
  "component-sheets": "Component sheets",
  "specification-sheets": "Specification sheets",
  "ui-mockups": "UI mockups",
  "campaigns-advertising": "Campaigns and advertising",
  "product-concepts": "Product concepts",
  "hardware-concepts": "Hardware concepts",
  "motion-references": "Motion references",
  "videos": "Videos",
  "3d-spatial-media": "3D and spatial media",
  "recently-added": "Recently added",
  "featured": "Featured",
  "alternate-versions": "Alternate versions",
  "complete-archive": "Complete archive",
  "public-download": "Public downloads"
};

function applyCollection(state, collection) {
  const next = { ...state };
  if (collection === "featured") next.featured = true;
  if (collection === "alternate-versions") next.alternate = true;
  if (collection === "videos") next.mediaType = "video";
  if (collection === "public-download") next.visibility = "public";
  const categories = ["stock-images", "reference-images", "hero-images", "website-backgrounds", "app-backgrounds", "brand-sheets", "component-sheets", "specification-sheets", "ui-mockups", "campaigns-advertising", "product-concepts", "hardware-concepts", "motion-references", "3d-spatial-media"];
  if (categories.includes(collection)) next.category = collection;
  if (collection === "recently-added") next.sort = "newest";
  return next;
}

export function GalleryPage({ type, initialState, assets, divisions, index, favorites, lazyController, toast, onPreview }) {
  const division = type === "division" ? divisions.find((item) => item.slug === initialState.division) || divisions[0] : null;
  const state = applyCollection({ ...initialState, division: division?.slug || initialState.division }, initialState.collection);
  const shell = el("main", { id: "main-content", class: "gallery-page", style: division ? `--division-accent:${division.accent || "#D4A843"}` : undefined });
  const results = el("div", { class: "gallery-results" });
  const renderResults = (restoreFocus = "") => {
    const matched = index.query(state);
    results.replaceChildren();
    const filter = new FilterBar({ state, facets: index.facets(index.query({ division: division?.slug || "" })), divisions, total: matched.length });
    const grid = new MediaGrid({ favorites, lazyController, toast, onPreview: (asset) => onPreview(asset, matched), onClear: clearFilters });
    filter.addEventListener("change", (event) => { state[event.detail.name] = event.detail.value; sync(event.detail.name); });
    filter.addEventListener("clear", () => clearFilters(true));
    results.append(filter.root, grid.render(matched));
    if (restoreFocus) results.querySelector(`[name="${restoreFocus}"]`)?.focus();
    const count = shell.querySelector("[data-result-count]");
    if (count) count.textContent = `${formatCount(matched.length)} assets`;
  };
  const clearFilters = (restoreFocus = false) => {
    ["q", "category", "mediaType", "orientation", "license", "visibility", "format"].forEach((key) => { state[key] = ""; });
    state.division = division?.slug || "";
    state.sort = "featured";
    sync(restoreFocus ? "clear" : "");
  };
  const sync = (restoreFocus = "") => {
    writeUrlState(state);
    renderResults(restoreFocus);
  };
  const scopedAssets = index.query({ division: division?.slug || "" });
  const heroAsset = scopedAssets.find((asset) => asset.featured) || scopedAssets[0];
  const search = new GlobalSearch({ index, assets, divisions, initialQuery: state.q, compact: true });
  search.addEventListener("search", (event) => { state.q = event.detail.query; sync(); });
  shell.append(
    el("section", { class: `gallery-hero ${division ? "is-division" : "is-collection"}` }, [
      el("div", { class: "gallery-hero__copy" }, [
        el("nav", { class: "breadcrumbs", "aria-label": "Breadcrumb" }, [el("a", { href: "/", text: "Home" }), icon("chevron"), el("span", { text: division ? division.name : "Collections" })]),
        division?.logoPath ? el("div", { class: "division-logo-frame" }, el("img", { src: division.logoPath, alt: `${division.name} approved logo reference`, width: 900, height: 900, decoding: "async" })) : null,
        el("p", { class: "detail-kicker mono", text: division ? `${division.number || "00"} / Collective AI division` : "Collective Stock / Curated collection" }),
        el("h1", { text: division?.name || COLLECTION_TITLES[state.collection] || "Complete archive" }),
        el("p", { text: division?.description || "Every locally accessible image, source document, motion reference, revision, and provenance record in one searchable archive." }),
        el("div", { class: "gallery-hero__meta" }, [el("strong", { "data-result-count": "", text: `${formatCount(scopedAssets.length)} assets` }), el("span", { text: `${new Set(scopedAssets.map((asset) => asset.categorySlug)).size} categories` }), el("span", { text: "Manifest verified" })]),
        search.root
      ]),
      heroAsset ? el("button", { class: "gallery-hero__media", type: "button", "aria-label": `Preview ${heroAsset.title}`, onClick: () => onPreview(heroAsset, scopedAssets) }, [el("img", { src: optimizedPath(heroAsset, "large"), alt: heroAsset.altText || heroAsset.title, width: heroAsset.width, height: heroAsset.height, fetchPriority: "high", decoding: "async" }), el("span", { class: "gallery-hero__media-meta" }, [el("strong", { text: heroAsset.title }), el("small", { text: heroAsset.category })])]) : el("div", { class: "gallery-hero__missing" }, [el("strong", { text: "No locally accessible hero asset" }), el("p", { text: "The omission is documented in the asset audit." })])
    ]),
    results
  );
  renderResults();
  return shell;
}
