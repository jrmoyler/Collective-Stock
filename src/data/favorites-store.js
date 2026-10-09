const STORAGE_KEY = "collective-stock:favorites:v1";

export class FavoritesStore extends EventTarget {
  #ids = new Set();

  constructor() {
    super();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      this.#ids = new Set(Array.isArray(stored) ? stored.filter(id => typeof id === "string") : []);
    } catch {
      this.#ids = new Set();
    }
  }

  has(id) { return this.#ids.has(id); }

  toggle(id) {
    this.#ids.has(id) ? this.#ids.delete(id) : this.#ids.add(id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.#ids])); } catch { /* Session saves still work when storage is blocked. */ }
    this.dispatchEvent(new CustomEvent("change", { detail: { id, saved: this.#ids.has(id) } }));
    return this.#ids.has(id);
  }

  values() { return [...this.#ids]; }
}
