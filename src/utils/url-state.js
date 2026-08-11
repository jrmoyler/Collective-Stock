export function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const [, routeType, routeSlug] = window.location.pathname.match(/^\/(divisions|collections|assets)\/([^/]+)\/?$/) || [];
  return {
    q: params.get("q") || "",
    division: params.get("division") || (routeType === "divisions" ? decodeURIComponent(routeSlug) : ""),
    category: params.get("category") || "",
    classification: params.get("classification") || "",
    mediaType: params.get("mediaType") || "",
    orientation: params.get("orientation") || "",
    license: params.get("license") || "",
    visibility: params.get("visibility") || "",
    format: params.get("format") || "",
    sort: params.get("sort") || "featured",
    collection: params.get("collection") || (routeType === "collections" ? decodeURIComponent(routeSlug) : "complete-archive"),
    id: params.get("id") || (routeType === "assets" ? decodeURIComponent(routeSlug) : "")
  };
}

export function writeUrlState(state, { replace = true } = {}) {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value && value !== "featured" && !(key === "collection" && value === "complete-archive")) params.set(key, value);
  });
  const url = `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`;
  history[replace ? "replaceState" : "pushState"]({}, "", url);
}
