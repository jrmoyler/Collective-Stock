import "./styles/fonts.css";
import { el, diamondStar } from "./utils/dom.js";
import { readUrlState } from "./utils/url-state.js";
import { updateDocumentMetadata } from "./utils/metadata.js";
import { collectionRoute } from "./utils/routes.js";
import { AssetManifestLoader } from "./data/manifest-loader.js";
import { FavoritesStore } from "./data/favorites-store.js";
import { SearchIndex } from "./search/search-index.js";
import { LazyMediaController } from "./media/lazy-media-controller.js";
import { Header } from "./components/header.js";
import { Footer } from "./components/footer.js";
import { ToastSystem } from "./components/toast-system.js";
import { SearchDialog } from "./components/search-dialog.js";
import { Lightbox } from "./components/lightbox.js";
import { HomePage } from "./pages/home-page.js";
import { GalleryPage } from "./pages/gallery-page.js";
import { AssetPage } from "./pages/asset-page.js";
import { AuditPage } from "./pages/audit-page.js";
import { McpPage } from "./pages/mcp-page.js";
import { renderFatalError } from "./components/error-boundary.js";

const app = document.querySelector("#app");
const page = document.body.dataset.page || "home";
const state = readUrlState();
const favorites = new FavoritesStore();
const lazyController = new LazyMediaController();
const toast = new ToastSystem();

function loadingScreen() {
  return el("div", { class: "app-loading", role: "status", "aria-live": "polite" }, [diamondStar("is-pulsing"), el("span", { class: "mono", text: "Opening the Collective archive" })]);
}

function searchNavigate(query) {
  window.location.assign(collectionRoute("complete-archive", query));
}

// Tracked from module evaluation rather than after boot: the manifest fetch
// makes boot finish at an unpredictable time, and a reader who starts scrolling
// while it is still in flight must never be pulled back to the hash target.
let readerMovedView = false;
["wheel", "touchstart", "keydown", "pointerdown"].forEach((name) => {
  window.addEventListener(name, () => { readerMovedView = true; }, { passive: true, once: true });
});

/**
 * Re-aligns a `#hash` landing after the page renders.
 *
 * The browser resolves the hash against the loading shell, and the home bands
 * use `content-visibility: auto`, so their estimated heights keep moving the
 * target while real content is laid out. Re-aligning as the page settles
 * honours each section's `scroll-margin-top` and clears the sticky header.
 * Any deliberate scroll from the reader cancels the remaining corrections.
 */
function restoreHashTarget() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;

  // Re-align until the target actually sits at its scroll-margin offset. A
  // single pass is not enough: early on the document is still shorter than its
  // final height, so the scroll is clamped and silently does nothing, and the
  // browser runs its own fragment scroll later against a stale layout. Keep
  // verifying for the whole budget rather than stopping at the first success.
  const deadline = Date.now() + 2000;
  const settle = () => {
    if (readerMovedView) return;
    const expected = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    if (Math.abs(target.getBoundingClientRect().top - expected) > 2) {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    }
    if (Date.now() > deadline) return;
    setTimeout(settle, 100);
  };
  requestAnimationFrame(settle);
}

async function boot() {
  if (!app.children.length) app.replaceChildren(loadingScreen());
  const data = await new AssetManifestLoader().load();
  const assets = data.assets || [];
  const divisions = data.divisions || [];
  const index = new SearchIndex(assets);
  updateDocumentMetadata({ page, state, assets, divisions });
  let lightbox = new Lightbox({ assets, favorites, toast });
  const openPreview = (asset, scope = assets) => {
    if (scope !== lightbox.assets) {
      lightbox.dialog.remove();
      lightbox = new Lightbox({ assets: scope, favorites, toast });
    }
    lightbox.open(asset);
  };
  const header = new Header({ divisions, activeDivision: state.division, activeCollection: page === "collections" ? state.collection : "", activePage: page, access: data.access || "public" });
  const searchDialog = new SearchDialog({ index, assets, divisions, onSearch: searchNavigate });
  header.addEventListener("searchrequest", () => searchDialog.open());

  let content;
  if (page === "home") content = HomePage({ assets, divisions, index, audit: data.audit, onSearch: searchNavigate, onPreview: openPreview, favorites, lazyController, toast });
  else if (page === "division") content = GalleryPage({ type: "division", initialState: state, assets, divisions, index, favorites, lazyController, toast, onPreview: openPreview });
  else if (page === "collections") content = GalleryPage({ type: "collection", initialState: state, assets, divisions, index, favorites, lazyController, toast, onPreview: openPreview });
  else if (page === "asset") content = AssetPage({ asset: assets.find((item) => item.id === state.id), assets, favorites, toast, onPreview: openPreview });
  else if (page === "audit") content = AuditPage({ audit: data.audit, assets });
  else if (page === "mcp") content = McpPage({ assets, toast });
  else content = renderFatalError(new Error(`Unknown page: ${page}`));

  const staticHero = page === "home" ? app.querySelector(".static-home-hero") : null;
  if (staticHero) {
    const renderedHero = content.querySelector(".home-hero");
    staticHero.querySelector(".static-search-placeholder")?.replaceWith(renderedHero.querySelector(".global-search"));
    staticHero.querySelector(".static-hero-mosaic")?.replaceWith(renderedHero.querySelector(".hero-mosaic"));
    staticHero.classList.remove("static-home-hero");
    const staticMain = app.querySelector("main");
    [...content.children].slice(1).forEach((section) => staticMain.append(section));
    app.querySelector(".static-header-placeholder")?.replaceWith(header.root);
    app.append(Footer());
  } else app.replaceChildren(header.root, content, Footer());
  document.documentElement.classList.add("is-ready");
  restoreHashTarget();
  window.addEventListener("beforeunload", () => lazyController.disconnect(), { once: true });
}

boot().catch((error) => app.replaceChildren(renderFatalError(error)));
