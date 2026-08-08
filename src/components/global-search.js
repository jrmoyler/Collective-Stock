import { el, icon, clear, formatCount } from "../utils/dom.js";

export class GlobalSearch extends EventTarget {
  constructor({ index, assets, divisions, initialQuery = "", compact = false }) {
    super();
    this.index = index;
    this.assets = assets;
    this.divisions = divisions;
    this.compact = compact;
    this.timer = null;
    this.activeIndex = -1;
    this.root = this.#render(initialQuery);
  }

  #render(initialQuery) {
    const input = el("input", {
      class: "global-search__input",
      type: "search",
      name: "q",
      value: initialQuery,
      autocomplete: "off",
      spellcheck: false,
      placeholder: "Search the complete Collective AI media archive",
      role: "combobox",
      "aria-label": "Search the complete Collective AI media archive",
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": `search-suggestions-${crypto.randomUUID()}`,
      "aria-expanded": "false"
    });
    const list = el("div", { class: "global-search__suggestions", role: "listbox", id: input.getAttribute("aria-controls") });
    const form = el("form", { class: `global-search ${this.compact ? "is-compact" : ""}`, role: "search" }, [
      el("div", { class: "global-search__field" }, [icon("search"), input, el("button", { class: "search-submit", type: "submit", "aria-label": "Submit search" }, icon("arrow"))]),
      list
    ]);
    input.addEventListener("input", () => {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.#updateSuggestions(input, list), 120);
    });
    input.addEventListener("focus", () => this.#updateSuggestions(input, list));
    input.addEventListener("keydown", (event) => this.#onKeydown(event, input, list));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.#commit(input.value);
    });
    document.addEventListener("pointerdown", (event) => {
      if (!form.contains(event.target)) this.#close(input, list);
    });
    return form;
  }

  #updateSuggestions(input, list) {
    const values = this.index.suggestions(input.value, 6);
    clear(list);
    const heading = el("div", { class: "suggestions-heading" }, [
      el("span", { text: input.value ? "Suggested matches" : "Try searching for" }),
      el("span", { class: "mono", text: `${formatCount(this.assets.length)} assets` })
    ]);
    list.append(heading);
    values.forEach((value, index) => {
      const option = el("button", { class: "suggestion", type: "button", role: "option", tabindex: "-1", id: `${list.id}-${index}`, "aria-selected": "false", dataset: { value } }, [icon("search"), el("span", { text: value })]);
      option.addEventListener("click", () => this.#commit(value));
      list.append(option);
    });
    input.setAttribute("aria-expanded", "true");
    this.activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
    list.classList.add("is-open");
  }

  #onKeydown(event, input, list) {
    const options = [...list.querySelectorAll('[role="option"]')];
    if (event.key === "Escape") return this.#close(input, list);
    if (!options.length || !["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % options.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + options.length) % options.length;
    } else if (event.key === "Enter" && this.activeIndex >= 0) {
      event.preventDefault();
      return this.#commit(options[this.activeIndex].dataset.value || options[this.activeIndex].textContent);
    }
    options.forEach((option, index) => option.setAttribute("aria-selected", String(index === this.activeIndex)));
    if (this.activeIndex >= 0) input.setAttribute("aria-activedescendant", options[this.activeIndex].id);
  }

  #commit(query) {
    const value = query.trim();
    const recent = JSON.parse(localStorage.getItem("collective-stock:recent-searches") || "[]").filter((item) => item !== value);
    if (value) localStorage.setItem("collective-stock:recent-searches", JSON.stringify([value, ...recent].slice(0, 8)));
    this.dispatchEvent(new CustomEvent("search", { detail: { query: value } }));
  }

  #close(input, list) {
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    list.querySelectorAll('[role="option"]').forEach((option) => option.setAttribute("aria-selected", "false"));
    this.activeIndex = -1;
    list.classList.remove("is-open");
  }
}
