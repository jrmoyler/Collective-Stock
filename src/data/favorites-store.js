const STORAGE_KEY = "collective-stock:favorites:v1";

export class FavoritesStore extends EventTarget {
  #ids = new Set();

  constructor() {
    super();
    try {
      this.#ids = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      this.#ids = new Set();
    }
  }

  has(id) { return this.#ids.has(id); }

  toggle(id) {
    this.#ids.has(id) ? this.#ids.delete(id) : this.#ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.#ids]));
    this.dispatchEvent(new CustomEvent("change", { detail: { id, saved: this.#ids.has(id) } }));
    return this.#ids.has(id);
  }

  values() { return [...this.#ids]; }
}
