const FALLBACK = { generatedAt: null, summary: {}, assets: [], occurrences: [] };

export class AssetManifestLoader {
  #cache;

  async load() {
    if (!this.#cache) this.#cache = this.#fetchAll();
    return this.#cache;
  }

  async #fetchAll() {
    if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      const protectedResponse = await fetch("/api/manifest", { headers: { Accept: "application/json" }, credentials: "same-origin" }).catch(() => null);
      if (protectedResponse?.ok && protectedResponse.headers.get("content-type")?.includes("application/json")) return protectedResponse.json();
    }
    const [manifest, divisions, provenance, audit] = await Promise.all([
      this.#json("/assets/manifests/asset-manifest.json", FALLBACK),
      this.#json("/assets/manifests/divisions.json", []),
      this.#json("/assets/manifests/source-provenance.json", { occurrences: [] }),
      this.#json("/assets/manifests/audit-summary.json", {})
    ]);
    return { ...manifest, divisions, provenance, audit, access: "internal" };
  }

  async #json(url, fallback) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to load ${url}`, error);
      return structuredClone(fallback);
    }
  }
}
