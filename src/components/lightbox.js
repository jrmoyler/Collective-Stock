import { el, icon } from "../utils/dom.js";
import { assetRoute } from "../utils/routes.js";
import { optimizedPath } from "./media-card.js";
import { LicenseBadge } from "./license-badge.js";

export class Lightbox {
  constructor({ assets = [], favorites, toast }) {
    this.assets = assets;
    this.favorites = favorites;
    this.toast = toast;
    this.index = 0;
    this.dialog = this.#render();
    document.body.append(this.dialog);
  }

  open(asset) {
    this.index = Math.max(0, this.assets.findIndex((item) => item.id === asset.id));
    this.#update();
    this.dialog.showModal();
    document.body.classList.add("has-dialog");
  }

  close() {
    this.dialog.close();
    document.body.classList.remove("has-dialog");
  }

  #render() {
    const close = el("button", { class: "icon-button lightbox-close", type: "button", "aria-label": "Close preview", onClick: () => this.close() }, icon("close"));
    const previous = el("button", { class: "icon-button lightbox-previous", type: "button", "aria-label": "Previous asset", onClick: () => this.#step(-1) }, icon("chevron"));
    const next = el("button", { class: "icon-button lightbox-next", type: "button", "aria-label": "Next asset", onClick: () => this.#step(1) }, icon("chevron"));
    const content = el("div", { class: "lightbox-content" });
    const dialog = el("dialog", { class: "lightbox", "aria-label": "Asset preview" }, [close, previous, content, next]);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) this.close(); });
    dialog.addEventListener("close", () => document.body.classList.remove("has-dialog"));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") this.#step(-1);
      if (event.key === "ArrowRight") this.#step(1);
    });
    this.content = content;
    return dialog;
  }

  #step(delta) {
    if (!this.assets.length) return;
    this.index = (this.index + delta + this.assets.length) % this.assets.length;
    this.#update();
  }

  #update() {
    const asset = this.assets[this.index];
    if (!asset) return;
    const preview = asset.mediaType === "video"
      ? el("video", { src: asset.previewPath || (asset.visibility === "public" ? asset.originalDownloadPath : undefined), poster: asset.posterPath || "/assets/posters/media-fallback.svg", controls: true, playsInline: true, preload: "metadata" })
      : el("img", { src: optimizedPath(asset, "large"), alt: asset.altText || asset.title, width: asset.width, height: asset.height, decoding: "async" });
    const save = el("button", { class: "button button--secondary", type: "button" }, [icon("heart"), el("span", { text: this.favorites.has(asset.id) ? "Saved" : "Save" })]);
    save.addEventListener("click", () => {
      const next = this.favorites.toggle(asset.id);
      save.querySelector("span").textContent = next ? "Saved" : "Save";
      this.toast.show(next ? "Saved to your collection" : "Removed from saved assets");
    });
    this.content.replaceChildren(
      el("figure", { class: "lightbox-figure" }, preview),
      el("aside", { class: "lightbox-meta" }, [
        el("div", { class: "detail-kicker mono", text: `${String(this.index + 1).padStart(2, "0")} / ${String(this.assets.length).padStart(2, "0")}` }),
        el("h2", { text: asset.title }),
        el("p", { text: asset.description || asset.altText }),
        el("div", { class: "lightbox-meta__row" }, [LicenseBadge(asset, { full: true }), el("span", { class: "mono", text: `${asset.width || "—"} × ${asset.height || "—"}` })]),
        el("div", { class: "lightbox-actions" }, [save, el("a", { class: "button button--primary", href: assetRoute(asset.id) }, ["View details", icon("arrow")])])
      ])
    );
  }
}
