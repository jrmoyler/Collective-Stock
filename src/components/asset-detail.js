import { el, icon } from "../utils/dom.js";
import { optimizedPath } from "./media-card.js";
import { assetRoute, divisionRoute } from "../utils/routes.js";
import { LicenseBadge } from "./license-badge.js";
import { DownloadMenu } from "./download-menu.js";
import { getLicense } from "../licensing/license-definitions.js";

function metadataRow(label, value) {
  return el("div", { class: "metadata-row" }, [el("dt", { text: label }), el("dd", { text: value || "Not recorded" })]);
}

export function AssetDetail({ asset, assets, favorites, toast, onPreview }) {
  const license = getLicense(asset.license?.slug);
  const preview = asset.mediaType === "video"
    ? el("video", { src: asset.previewPath, poster: asset.posterPath || "/assets/posters/media-fallback.svg", controls: true, muted: asset.previewAudio === "muted", playsInline: true, preload: "metadata", "aria-label": `Preview ${asset.title}` })
    : el("img", { src: optimizedPath(asset, "large"), alt: asset.altText || asset.title, width: asset.width, height: asset.height, decoding: "async", fetchPriority: "high" });
  const initiallySaved = favorites.has(asset.id);
  const save = el("button", { class: "button button--secondary", type: "button", "aria-pressed": String(initiallySaved), "aria-label": initiallySaved ? `Remove ${asset.title} from saved assets` : `Save ${asset.title}` }, [icon("heart"), el("span", { text: initiallySaved ? "Saved" : "Save asset" })]);
  save.addEventListener("click", () => {
    const next = favorites.toggle(asset.id);
    save.setAttribute("aria-pressed", String(next));
    save.setAttribute("aria-label", next ? `Remove ${asset.title} from saved assets` : `Save ${asset.title}`);
    save.querySelector("span").textContent = next ? "Saved" : "Save asset";
    toast.show(next ? "Saved to your collection" : "Removed from saved assets");
  });
  const copy = el("button", { class: "button button--quiet", type: "button" }, [icon("copy"), "Copy link"]);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.show("Asset link copied");
  });
  const related = assets.filter((item) => item.id !== asset.id && (item.divisionSlug === asset.divisionSlug || asset.relatedAssets?.includes(item.id))).slice(0, 4);
  return el("main", { id: "main-content", class: "asset-detail-page" }, [
    el("nav", { class: "breadcrumbs", "aria-label": "Breadcrumb" }, [el("a", { href: "/", text: "Home" }), icon("chevron"), el("a", { href: divisionRoute(asset.divisionSlug), text: asset.division }), icon("chevron"), el("span", { text: asset.title })]),
    el("section", { class: "asset-detail-layout" }, [
      el("div", { class: "asset-preview-stage" }, [preview, el("button", { class: "preview-expand", type: "button", "aria-label": "Open fullscreen preview", onClick: () => onPreview(asset) }, icon("expand"))]),
      el("aside", { class: "asset-detail-panel" }, [
        el("p", { class: "detail-kicker mono", text: `${asset.division} / ${asset.category}` }),
        el("h1", { text: asset.title }),
        el("p", { class: "asset-description", text: asset.description || asset.altText }),
        el("div", { class: "asset-badges" }, [LicenseBadge(asset, { full: true }), el("span", { class: "visibility-badge", text: asset.visibility === "public" ? (asset.downloadAuthorization === "public" ? "Public download" : "Public preview · original restricted") : "Private / internal asset" })]),
        el("div", { class: "asset-actions" }, [save, copy]),
        el("section", { class: "download-panel" }, [el("h2", { text: "Available files" }), DownloadMenu(asset, { toast })]),
        el("dl", { class: "asset-metadata" }, [
          metadataRow("Dimensions", `${asset.width || "—"} × ${asset.height || "—"}`),
          metadataRow("Aspect ratio", asset.aspectRatio),
          metadataRow("Format", asset.fileFormat?.toUpperCase()),
          metadataRow("File size", asset.fileSizeHuman),
          metadataRow("Series", asset.series),
          metadataRow("Revision", `v${asset.revision || 1}`),
          ...(asset.mediaType === "video" ? [
            metadataRow("Preview audio", asset.previewAudio === "muted" ? "Muted public derivative" : asset.previewAudio),
            metadataRow("Source audio", asset.audioProfile),
            metadataRow("Captions", asset.captionStatus)
          ] : []),
          metadataRow("Original access", asset.downloadAuthorization === "public" ? "Public download" : "Authenticated approval required"),
          metadataRow("Asset ID", asset.id)
        ])
      ])
    ]),
    el("section", { class: "license-detail" }, [
      el("div", {}, [el("p", { class: "section-label", text: "Usage rights" }), el("h2", { text: license.name }), el("p", { text: `Attribution: ${license.attribution}.` })]),
      el("div", {}, [el("h3", { text: "Permitted" }), el("ul", {}, license.permitted.map((item) => el("li", {}, [icon("check"), item])))]),
      el("div", {}, [el("h3", { text: "Restricted" }), el("ul", {}, license.restricted.map((item) => el("li", {}, [icon("close"), item])))])
    ]),
    el("section", { class: "provenance-detail" }, [el("p", { class: "section-label", text: "Provenance" }), el("h2", { text: "Source and generation record" }), el("dl", { class: "asset-metadata" }, [metadataRow("Original filename", asset.originalFilename), metadataRow("Source", asset.source), metadataRow("Source album", asset.sourceAlbum), metadataRow("Album index", asset.albumIndex ? String(asset.albumIndex).padStart(3, "0") : null), metadataRow("Classification confidence", asset.classificationConfidence), metadataRow("Classification notes", asset.classificationNotes), metadataRow("Generation date", asset.generationDate), metadataRow("Content hash", asset.contentHash), metadataRow("Prompt", asset.prompt)])]),
    related.length ? el("section", { class: "related-assets" }, [el("div", { class: "section-heading" }, [el("h2", { text: "Related media" }), el("a", { href: divisionRoute(asset.divisionSlug), text: `View ${asset.division}` })]), el("div", { class: "related-rail" }, related.map((item) => el("a", { href: assetRoute(item.id) }, [el("img", { src: optimizedPath(item), alt: "", loading: "lazy", width: item.width, height: item.height }), el("span", { text: item.title })])))]) : null
  ]);
}
