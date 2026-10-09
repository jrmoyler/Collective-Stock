import { el, icon, formatCount } from "../utils/dom.js";
import { GlobalSearch } from "../components/global-search.js";
import { FilterBar } from "../components/filter-bar.js";
import { MediaGrid } from "../components/media-grid.js";
import { optimizedPath } from "../components/media-card.js";
import { writeUrlState } from "../utils/url-state.js";
import { applyCollectionConstraints, collectionDefinition } from "../data/collection-definitions.js";

export function GalleryPage({ type, initialState, assets, divisions, index, favorites, lazyController, toast, onPreview }) {
  const division = type === "division" ? divisions.find((item) => item.slug === initialState.division) || divisions[0] : null;
  const savedView = type === "collection" && initialState.collection === "saved";
  const definition = collectionDefinition(initialState.collection);
  const collectionConstraints = type === "collection" ? definition.constraints : {};
  const state = applyCollectionConstraints({ ...initialState, division: division?.slug || initialState.division }, type === "collection" ? initialState.collection : "complete-archive");
  const locked = [...Object.keys(collectionConstraints).filter((key) => ["category", "classification", "mediaType", "visibility"].includes(key)), ...(division ? ["division"] : [])];
  const variant = collectionConstraints.category === "component-sheets" ? "sheet" : collectionConstraints.category === "division-intro-videos" ? "intro" : "";
  const shell = el("main", { id: "main-content", class: `gallery-page ${variant ? `gallery-page--${variant}` : ""}`, style: division ? `--division-accent:${division.accent || "#D4A843"}` : undefined });
  const results = el("div", { class: "gallery-results" });
  let activeGrid;
  const renderResults = (restoreFocus = "") => {
    const matched = index.query(state).filter(a => !savedView || favorites.has(a.id));
    activeGrid?.masonry?.disconnect();
    results.replaceChildren();
    const constrained = index.query({ ...collectionConstraints, division: division?.slug || "" });
    const filter = new FilterBar({ state, facets: index.facets(constrained), divisions, total: matched.length, locked });
    const grid = new MediaGrid({ favorites, lazyController, toast, variant, masonry: !variant, onPreview: (asset) => onPreview(asset, matched), onClear: clearFilters });
    activeGrid = grid;
    filter.addEventListener("change", (event) => { state[event.detail.name] = event.detail.value; sync(event.detail.name); });
    filter.addEventListener("clear", () => clearFilters(true));
    if (savedView && !favorites.values().some(id => assets.some(a => a.id === id))) {
      results.append(el("section", { class: "saved-empty" }, [icon("heart"), el("h2", { text: "Make room for inspiration." }), el("p", { text: "Tap the heart on any artwork to keep it here. Your next idea starts with a single image." }), el("a", { class: "button button--primary", href: "/collections.html?collection=complete-archive", text: "Discover the archive" })]));
    } else results.append(filter.root, grid.render(matched));
    if (restoreFocus) results.querySelector(`[name="${restoreFocus}"]`)?.focus();
    const count = shell.querySelector("[data-result-count]");
    if (count) count.textContent = `${formatCount(matched.length)} assets`;
  };
  const clearFilters = (restoreFocus = false) => {
    ["q", "category", "classification", "mediaType", "orientation", "license", "visibility", "format"].forEach((key) => { state[key] = ""; });
    Object.assign(state, collectionConstraints);
    state.division = division?.slug || "";
    state.sort = collectionConstraints.sort || "featured";
    sync(restoreFocus ? "clear" : "");
  };
  const sync = (restoreFocus = "") => {
    writeUrlState(state);
    renderResults(restoreFocus);
  };
  const scopedAssets = index.query({ ...collectionConstraints, division: division?.slug || "" }).filter(a => !savedView || favorites.has(a.id));
  const heroAsset = scopedAssets.find((asset) => asset.featured) || scopedAssets[0];
  const search = new GlobalSearch({ index, assets, divisions, initialQuery: state.q, compact: true });
  search.addEventListener("search", (event) => { state.q = event.detail.query; sync(); });
  let compact = false;
  const density = el("button", { class: "view-toggle", type: "button", "aria-label": "Use compact grid", "aria-pressed": "false", onClick: () => {
    compact = !compact; shell.classList.toggle("is-compact-grid", compact);
    density.setAttribute("aria-pressed", String(compact));
    density.setAttribute("aria-label", compact ? "Use comfortable grid" : "Use compact grid");
    density.querySelector("span").textContent = compact ? "Compact view" : "Comfortable view";
    activeGrid?.masonry?.schedule();
  } }, [icon("grid"), el("span", { text: "Comfortable view" })]);
  const toolbar = el("div", { class: "gallery-toolbar" }, [el("span", { text: savedView ? "Your saved collection" : "Find your next idea" }), density]);
  shell.append(
    el("section", { class: `gallery-hero ${savedView ? "is-saved-gallery" : ""} ${division ? "is-division" : "is-collection"}` }, [
      el("div", { class: "gallery-hero__copy" }, [
        el("nav", { class: "breadcrumbs", "aria-label": "Breadcrumb" }, [el("a", { href: "/", text: "Home" }), icon("chevron"), el("span", { text: division ? division.name : "Collections" })]),
        division?.logoPath ? el("div", { class: "division-logo-frame" }, el("img", { src: division.logoPath, alt: `${division.name} approved logo reference`, width: 900, height: 900, decoding: "async" })) : null,
        el("p", { class: "detail-kicker mono", text: division ? `${division.number || "00"} / Collective AI division` : "Collective Stock / Curated collection" }),
        el("h1", { text: division?.name || definition.title }),
        el("p", { text: division?.description || definition.description }),
        el("div", { class: "gallery-hero__meta" }, [el("strong", { "data-result-count": "", text: `${formatCount(scopedAssets.length)} assets` }), el("span", { text: `${new Set(scopedAssets.map((asset) => asset.categorySlug)).size} categories` }), el("span", { text: "Manifest verified" })]),
        search.root
      ]),
      heroAsset ? el("button", { class: "gallery-hero__media", type: "button", "aria-label": `Preview ${heroAsset.title}`, onClick: () => onPreview(heroAsset, scopedAssets) }, [el("img", { src: optimizedPath(heroAsset, "large"), alt: heroAsset.altText || heroAsset.title, width: heroAsset.width, height: heroAsset.height, fetchPriority: "high", decoding: "async" }), el("span", { class: "gallery-hero__media-meta" }, [el("strong", { text: heroAsset.title }), el("small", { text: heroAsset.category })])]) : el("div", { class: "gallery-hero__missing" }, [el("strong", { text: savedView ? "A space for your next idea." : "No artwork in this collection yet" }), el("p", { text: savedView ? "Save an artwork to begin your collection." : "Try another collection from the archive." })])
    ]),
    toolbar, results
  );
  if (savedView) {
    favorites.addEventListener("change", () => {
      const restore = results.contains(document.activeElement);
      renderResults();
      if (restore) { toolbar.tabIndex = -1; toolbar.focus(); }
    });
  }
  renderResults();
  return shell;
}
