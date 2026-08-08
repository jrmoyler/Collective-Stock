import { el, clear } from "../utils/dom.js";
import { MediaCard } from "./media-card.js";

export class MediaGrid {
  constructor(options = {}) {
    this.options = options;
    this.root = el("div", { class: "media-grid", role: "list", "aria-label": "Media results" });
  }

  render(assets = []) {
    clear(this.root);
    if (!assets.length) {
      this.root.classList.add("is-empty");
      this.root.append(el("section", { class: "empty-state" }, [
        el("span", { class: "empty-state__mark", "aria-hidden": "true", text: "◇" }),
        el("h2", { text: "No media matches this view" }),
        el("p", { text: "Clear a filter or try a broader visual concept." }),
        el("button", { class: "button button--secondary", type: "button", text: "Clear all filters", onClick: () => this.options.onClear?.() })
      ]));
      return this.root;
    }
    this.root.classList.remove("is-empty");
    assets.forEach((asset) => {
      const item = el("div", { role: "listitem" }, MediaCard(asset, this.options));
      this.root.append(item);
    });
    return this.root;
  }
}
