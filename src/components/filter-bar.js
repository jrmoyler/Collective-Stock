import { el, icon, formatCount } from "../utils/dom.js";

function select(label, name, values, current, formatLabel = (value) => value) {
  const control = el("select", { name, "aria-label": label });
  control.append(el("option", { value: "", text: label }));
  [...values.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).forEach(([value, count]) => {
    control.append(el("option", { value, text: `${formatLabel(value)} (${formatCount(count)})`, selected: current === value }));
  });
  return el("label", { class: "filter-select" }, [el("span", { class: "sr-only", text: label }), control, icon("chevron")]);
}

const titleCase = (value = "") => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export class FilterBar extends EventTarget {
  constructor({ state, facets, divisions = [], total = 0 }) {
    super();
    this.state = state;
    this.facets = facets;
    this.divisions = divisions;
    this.total = total;
    this.root = this.#render();
  }

  #render() {
    const divisionNames = new Map(this.divisions.map((item) => [item.slug, item.name]));
    const controls = el("div", { class: "filter-controls" }, [
      select("All divisions", "division", this.facets.division, this.state.division, (value) => divisionNames.get(value) || titleCase(value)),
      select("All categories", "category", this.facets.category, this.state.category, titleCase),
      select("All media", "mediaType", this.facets.mediaType, this.state.mediaType, titleCase),
      select("All orientations", "orientation", this.facets.orientation, this.state.orientation, titleCase),
      select("All licenses", "license", this.facets.license, this.state.license, titleCase),
      select("All access", "visibility", this.facets.visibility, this.state.visibility, titleCase),
      select("All formats", "format", this.facets.format, this.state.format, (value) => String(value).toUpperCase())
    ]);
    controls.querySelectorAll("select").forEach((control) => control.addEventListener("change", () => this.dispatchEvent(new CustomEvent("change", { detail: { name: control.name, value: control.value } }))));
    const sort = el("select", { name: "sort", "aria-label": "Sort media" }, [
      el("option", { value: "featured", selected: this.state.sort === "featured", text: "Curated" }),
      el("option", { value: "newest", selected: this.state.sort === "newest", text: "Newest" }),
      el("option", { value: "title", selected: this.state.sort === "title", text: "Title A–Z" }),
      el("option", { value: "resolution", selected: this.state.sort === "resolution", text: "Highest resolution" })
    ]);
    sort.addEventListener("change", () => this.dispatchEvent(new CustomEvent("change", { detail: { name: "sort", value: sort.value } })));
    const clear = el("button", { class: "clear-filters", name: "clear", type: "button", text: "Clear all", onClick: () => this.dispatchEvent(new Event("clear")) });
    const trigger = el("button", { class: "filter-trigger", type: "button", "aria-expanded": "false" }, [icon("filter"), "Filters"]);
    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(open));
      controls.classList.toggle("is-open", open);
    });
    return el("section", { class: "filter-bar", "aria-label": "Filter and sort media" }, [
      el("div", { class: "filter-bar__summary" }, [el("strong", { class: "mono", text: `${formatCount(this.total)} results` }), trigger]),
      controls,
      el("div", { class: "sort-controls" }, [clear, el("label", { class: "sort-select" }, [el("span", { text: "Sort" }), sort, icon("chevron")])])
    ]);
  }
}
