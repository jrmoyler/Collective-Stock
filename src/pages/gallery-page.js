import { el, icon, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { FilterBar } from "../components/filter-bar.js";
import { MediaGrid } from "../components/media-grid.js";
import { optimizedPath } from "../components/media-card.js";
import { writeUrlState } from "../utils/url-state.js";
import { applyCollectionConstraints, collectionDefinition } from "../data/collection-definitions.js";

export function GalleryPage({ type, initialState, assets, divisions, index, favorites, lazyController, toast, onPreview }) {
  const division = type === "division" ? divisions.find((item) => item.slug === initialState.division) || divisions[0] : null;
  const definition = collectionDefinition(initialState.collection);
  const collectionConstraints = type === "collection" ? definition.constraints : {};
  const state = applyCollectionConstraints({ ...initialState, division: division?.slug || initialState.division }, type === "collection" ? initialState.collection : "complete-archive");
  const locked = [...Object.keys(collectionConstraints).filter((key) => ["category", "mediaType", "visibility"].includes(key)), ...(division ? ["division"] : [])];
  const variant = collectionConstraints.category === "component-sheets" ? "sheet" : collectionConstraints.category === "division-intro-videos" ? "intro" : "";
  const shell = el("main", { id: "main-content", class: `gallery-page ${variant ? `gallery-page--${variant}` : ""}`, style: division ? `--division-accent:${division.accent || "#D4A843"}` : undefined });
  const results = el("div", { class: "gallery-results" });
  const renderResults = (restoreFocus = "") => {
    const matched = index.query(state);
    results.replaceChildren();
    const constrained = index.query({ ...collectionConstraints, division: division?.slug || "" });
    const filter = new FilterBar({ state, facets: index.facets(constrained), divisions, total: matched.length, locked });
    const grid = new MediaGrid({ favorites, lazyController, toast, variant, masonry: !variant, onPreview: (asset) => onPreview(asset, matched), onClear: clearFilters });
    filter.addEventListener("change", (event) => { state[event.detail.name] = event.detail.value; sync(event.detail.name); });
    filter.addEventListener("clear", () => clearFilters(true));
    results.append(filter.root, grid.render(matched));
    if (restoreFocus) results.querySelector(`[name="${restoreFocus}"]`)?.focus();
    const count = shell.querySelector("[data-result-count]");
    if (count) count.textContent = `${formatCount(matched.length)} assets`;
  };
  const clearFilters = (restoreFocus = false) => {
    ["q", "category", "mediaType", "orientation", "license", "visibility", "format"].forEach((key) => { state[key] = ""; });
    Object.assign(state, collectionConstraints);
    state.division = division?.slug || "";
    state.sort = collectionConstraints.sort || "featured";
    sync(restoreFocus ? "clear" : "");
  };
  const sync = (restoreFocus = "") => {
    writeUrlState(state);
    renderResults(restoreFocus);
  };
  const scopedAssets = index.query({ ...collectionConstraints, division: division?.slug || "" });
  const heroAsset = scopedAssets.find((asset) => asset.featured) || scopedAssets[0];
  const search = new GlobalSearch({ index, assets, divisions, initialQuery: state.q, compact: true });
  search.addEventListener("search", (event) => { state.q = event.detail.query; sync(); });
  shell.append(
    el("section", { class: `gallery-hero ${division ? "is-division" : "is-collection"}` }, [
      el("div", { class: "gallery-hero__copy" }, [
        el("nav", { class: "breadcrumbs", "aria-label": "Breadcrumb" }, [el("a", { href: "/", text: "Home" }), icon("chevron"), el("span", { text: division ? division.name : "Collections" })]),
        division?.logoPath ? el("div", { class: "division-logo-frame" }, el("img", { src: division.logoPath, alt: `${division.name} approved logo reference`, width: 900, height: 900, decoding: "async" })) : null,
        el("p", { class: "detail-kicker mono", text: division ? `${division.number || "00"} / Collective AI division` : "Collective Stock / Curated collection" }),
        el("h1", { text: division?.name || definition.title }),
        el("p", { text: division?.description || definition.description }),
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
