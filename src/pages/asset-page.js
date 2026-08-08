import { el, icon } from "../utils/dom.js";
import { AssetDetail } from "../components/asset-detail.js";
import { collectionRoute } from "../utils/routes.js";

export function AssetPage({ asset, assets, favorites, toast, onPreview }) {
  if (!asset) return el("main", { id: "main-content", class: "not-found" }, [el("span", { class: "not-found__mark", text: "404" }), el("h1", { text: "Asset not found" }), el("p", { text: "The requested asset ID is not present in the current manifest." }), el("a", { class: "button button--primary", href: collectionRoute("complete-archive") }, ["Browse the archive", icon("arrow")])]);
  if (asset.visibility !== "public") {
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(el("meta", { name: "robots" }));
    robots.setAttribute("content", "noindex,nofollow,noarchive");
  }
  document.title = `${asset.title} — Collective Stock`;
  return AssetDetail({ asset, assets, favorites, toast, onPreview });
}
