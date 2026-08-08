import { el, icon } from "../utils/dom.js";
import { assetRoute } from "../utils/routes.js";
import { LicenseBadge } from "./license-badge.js";

function optimizedPath(asset, size = "card") {
  const renditions = asset.optimizedRenditions || [];
  const match = renditions.find((item) => item.label === size && item.format === "webp") || renditions.find((item) => item.label === size) || renditions[0];
  return match?.path || asset.posterPath || (asset.visibility === "public" ? asset.originalDownloadPath : null) || "/assets/posters/media-fallback.svg";
}

export function MediaCard(asset, { favorites, lazyController, onPreview, toast } = {}) {
  const saved = favorites?.has(asset.id);
  const mediaWrap = el("div", { class: "media-card__media", style: `--placeholder:${asset.dominantColors?.[0] || "#0D1326"};aspect-ratio:${asset.width || 4}/${asset.height || 3}` });
  if (asset.mediaType === "video") {
    const video = el("video", {
      muted: true,
      loop: true,
      playsInline: true,
      preload: "none",
      poster: asset.posterPath || "/assets/posters/media-fallback.svg",
      "aria-label": `Motion preview: ${asset.title}`
    });
    const playable = asset.previewPath || (asset.visibility === "public" ? asset.originalDownloadPath : null);
    if (playable) video.append(el("source", { src: playable, type: asset.mimeType || "video/mp4" }));
    video.addEventListener("error", () => mediaWrap.classList.add("has-media-error"));
    mediaWrap.append(video, el("span", { class: "video-indicator", "aria-hidden": "true" }, icon("play")));
    lazyController?.observe(video);
  } else {
    const src = optimizedPath(asset);
    const image = el("img", {
      alt: asset.altText || asset.title,
      width: asset.width || 1200,
      height: asset.height || 900,
      loading: "lazy",
      decoding: "async",
      draggable: false,
      src,
      srcset: (asset.optimizedRenditions || []).filter((item) => item.width && item.path).map((item) => `${item.path} ${item.width}w`).join(", ") || undefined,
      sizes: "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
    });
    image.addEventListener("load", () => image.classList.add("is-loaded"));
    image.addEventListener("error", () => {
      image.src = "/assets/posters/media-fallback.svg";
      mediaWrap.classList.add("has-media-error");
    }, { once: true });
    mediaWrap.append(image);
  }

  const saveButton = el("button", { class: `card-action save-action ${saved ? "is-saved" : ""}`, type: "button", "aria-label": saved ? `Remove ${asset.title} from saved assets` : `Save ${asset.title}`, "aria-pressed": String(Boolean(saved)) }, icon("heart"));
  saveButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = favorites.toggle(asset.id);
    saveButton.classList.toggle("is-saved", next);
    saveButton.setAttribute("aria-pressed", String(next));
    saveButton.setAttribute("aria-label", next ? `Remove ${asset.title} from saved assets` : `Save ${asset.title}`);
    toast?.show(next ? "Saved to your collection" : "Removed from saved assets");
  });
  const previewButton = el("button", { class: "card-preview-button", type: "button", "aria-label": `Preview ${asset.title}` });
  previewButton.addEventListener("click", () => onPreview?.(asset));
  const card = el("article", { class: "media-card", dataset: { assetId: asset.id } }, [
    mediaWrap,
    previewButton,
    el("div", { class: "media-card__actions" }, [saveButton]),
    el("div", { class: "media-card__footer" }, [
      el("div", {}, [el("h3", {}, el("a", { href: assetRoute(asset.id), text: asset.title })), el("p", { text: `${asset.division} · ${asset.category}` })]),
      LicenseBadge(asset)
    ])
  ]);
  return card;
}

export { optimizedPath };
