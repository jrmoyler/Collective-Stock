import { el } from "../utils/dom.js";

export class ToastSystem {
  constructor() {
    this.region = el("div", { class: "toast-region", role: "status", "aria-live": "polite", "aria-atomic": "true" });
    document.body.append(this.region);
  }

  show(message, { timeout = 2600 } = {}) {
    const toast = el("div", { class: "toast", text: message });
    this.region.append(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, timeout);
  }
}
