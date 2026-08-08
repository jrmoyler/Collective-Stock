import { el, icon } from "../utils/dom.js";

export function renderFatalError(error) {
  console.error(error);
  return el("main", { id: "main-content", class: "fatal-error" }, [
    el("span", { class: "fatal-error__code mono", text: "ARCHIVE_LOAD_ERROR" }),
    el("h1", { text: "The media index could not be opened" }),
    el("p", { text: "The interface is intact, but its local manifest did not load. Refresh the page or run the asset validation task before deploying." }),
    el("button", { class: "button button--primary", type: "button", onClick: () => location.reload() }, ["Reload archive", icon("arrow")])
  ]);
}
