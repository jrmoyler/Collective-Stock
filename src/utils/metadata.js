import { el } from "./dom.js";
import { collectionDefinition } from "../data/collection-definitions.js";
import { assetScopeLabel } from "../data/asset-scope.js";

function meta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  const node = document.querySelector(selector) || document.head.appendChild(el("meta", property ? { property: name } : { name }));
  node.setAttribute("content", content);
}

export function updateDocumentMetadata({ page, state, assets, divisions }) {
  const asset = page === "asset" ? assets.find((item) => item.id === state.id) : null;
  const division = page === "division" ? divisions.find((item) => item.slug === state.division) : null;
  const collection = page === "collections" ? collectionDefinition(state.collection) : null;
  const title = asset ? `${asset.title} — Collective Stock` : division ? `${division.name} Stock Media — Collective Stock` : collection ? `${collection.title} — Collective Stock` : page === "audit" ? "Asset Audit — Collective Stock" : page === "mcp" ? "Collective Stock MCP — Connect Your AI Workspace" : "Collective Stock — The Collective AI Media Library";
  const description = asset ? `${asset.title}: ${asset.category} in ${assetScopeLabel(asset)}. Review dimensions, rights, source metadata, and available renditions.` : division ? `Browse the complete ${division.name} media collection, with approved reference imagery, brand sheets, concepts, and revisions.` : collection ? collection.description : page === "mcp" ? "Connect Claude, ChatGPT, Codex, and compatible AI tools directly to the Collective Stock media archive through one remote MCP URL." : "Search and license the Collective AI Inc media archive across twenty distinct divisions.";
  const canonical = asset ? `/assets/${asset.id}` : division ? `/divisions/${division.slug}` : page === "collections" ? `/collections/${state.collection}` : page === "audit" ? "/audit" : page === "mcp" ? "/mcp" : "/";
  document.title = title;
  meta("description", description);
  meta("og:title", title, true);
  meta("og:description", description, true);
  meta("og:type", asset ? "article" : "website", true);
  meta("robots", asset?.visibility === "internal" || page === "audit" ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large");
  const link = document.querySelector('link[rel="canonical"]') || document.head.appendChild(el("link", { rel: "canonical" }));
  link.setAttribute("href", new URL(canonical, "https://collective-stock.vercel.app").href);
}
