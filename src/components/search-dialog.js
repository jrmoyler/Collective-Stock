import { el, icon } from "../utils/dom.js";
import { GlobalSearch } from "./global-search.js";

export class SearchDialog {
  constructor({ index, assets, divisions, onSearch }) {
    const search = new GlobalSearch({ index, assets, divisions });
    const close = el("button", { class: "icon-button search-dialog__close", type: "button", "aria-label": "Close search", onClick: () => this.close() }, icon("close"));
    this.dialog = el("dialog", { class: "search-dialog", "aria-labelledby": "search-dialog-title" }, [
      el("div", { class: "search-dialog__panel" }, [close, el("p", { class: "section-label", text: "Search across every division" }), el("h2", { id: "search-dialog-title", text: "What are you building?" }), search.root, el("p", { class: "search-help", text: "Search by visual concept, division, color, format, product, platform, prompt, or intended use." })])
    ]);
    search.addEventListener("search", (event) => { this.close(); onSearch(event.detail.query); });
    this.dialog.addEventListener("click", (event) => { if (event.target === this.dialog) this.close(); });
    this.dialog.addEventListener("keydown", (event) => { if (event.key === "Escape") { event.preventDefault(); this.close(); } }, { capture: true });
    this.dialog.addEventListener("close", () => document.body.classList.remove("has-dialog"));
    this.dialog.addEventListener("cancel", () => document.body.classList.remove("has-dialog"));
    document.body.append(this.dialog);
  }

  open() {
    this.dialog.showModal();
    document.body.classList.add("has-dialog");
    this.dialog.querySelector("input")?.focus();
  }

  close() {
    if (this.dialog.open) this.dialog.close();
    document.body.classList.remove("has-dialog");
  }
}
