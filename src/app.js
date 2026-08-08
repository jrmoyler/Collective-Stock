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
  const header = new Header({ divisions, activeDivision: state.division, access: data.access || "public" });
  const searchDialog = new SearchDialog({ index, assets, divisions, onSearch: searchNavigate });
  header.addEventListener("searchrequest", () => searchDialog.open());

  let content;
  if (page === "home") content = HomePage({ assets, divisions, index, audit: data.audit, onSearch: searchNavigate, onPreview: openPreview, favorites, lazyController, toast });
  else if (page === "division") content = GalleryPage({ type: "division", initialState: state, assets, divisions, index, favorites, lazyController, toast, onPreview: openPreview });
  else if (page === "collections") content = GalleryPage({ type: "collection", initialState: state, assets, divisions, index, favorites, lazyController, toast, onPreview: openPreview });
  else if (page === "asset") content = AssetPage({ asset: assets.find((item) => item.id === state.id), assets, favorites, toast, onPreview: openPreview });
  else if (page === "audit") content = AuditPage({ audit: data.audit, assets });
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
  window.addEventListener("beforeunload", () => lazyController.disconnect(), { once: true });
}

boot().catch((error) => app.replaceChildren(renderFatalError(error)));
