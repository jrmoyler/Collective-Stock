const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

export function divisionRoute(slug) {
  return isLocal() ? `/division.html?division=${encodeURIComponent(slug)}` : `/divisions/${encodeURIComponent(slug)}`;
}

export function collectionRoute(slug, query = "") {
  if (isLocal()) {
    const params = new URLSearchParams({ collection: slug });
    if (query) params.set("q", query);
    return `/collections.html?${params}`;
  }
  return `/collections/${encodeURIComponent(slug)}${query ? `?q=${encodeURIComponent(query)}` : ""}`;
}

export function assetRoute(id) {
  return isLocal() ? `/asset.html?id=${encodeURIComponent(id)}` : `/assets/${encodeURIComponent(id)}`;
}
