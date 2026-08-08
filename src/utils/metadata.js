import { el } from "./dom.js";

function meta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  const node = document.querySelector(selector) || document.head.appendChild(el("meta", property ? { property: name } : { name }));
  node.setAttribute("content", content);
}

export function updateDocumentMetadata({ page, state, assets, divisions }) {
  const asset = page === "asset" ? assets.find((item) => item.id === state.id) : null;
  const division = page === "division" ? divisions.find((item) => item.slug === state.division) : null;
  const title = asset ? `${asset.title} — Collective Stock` : division ? `${division.name} Stock Media — Collective Stock` : page === "collections" ? "Curated Media Collections — Collective Stock" : page === "audit" ? "Asset Audit — Collective Stock" : "Collective Stock — The Collective AI Media Library";
  const description = asset ? `${asset.title}: ${asset.category} for ${asset.division}. Review dimensions, rights, source metadata, and available renditions.` : division ? `Browse the complete ${division.name} media collection, with approved reference imagery, brand sheets, concepts, and revisions.` : "Search and license the Collective AI Inc media archive across twenty distinct divisions.";
  const canonical = asset ? `/assets/${asset.id}` : division ? `/divisions/${division.slug}` : page === "collections" ? `/collections/${state.collection}` : page === "audit" ? "/audit" : "/";
  document.title = title;
  meta("description", description);
  meta("og:title", title, true);
  meta("og:description", description, true);
  meta("og:type", asset ? "article" : "website", true);
  meta("robots", asset?.visibility === "internal" || page === "audit" ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large");
  const link = document.querySelector('link[rel="canonical"]') || document.head.appendChild(el("link", { rel: "canonical" }));
  link.setAttribute("href", new URL(canonical, "https://collective-stock.vercel.app").href);
}
