const ROW_UNIT = 4;

const parseGap = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Packs a ratio-preserving media grid into tight masonry columns.
 *
 * The grid keeps its ordinary column tracks and reading order; only the row
 * span of each item is computed, so a tall portrait asset no longer forces
 * every short landscape asset in the same row to reserve its height. Items
 * measure their own natural height, which is stable before images load
 * because each card carries an `aspect-ratio` derived from the manifest.
 *
 * Layout stays valid without JavaScript: the masonry row tracks only apply
 * once `is-masonry` is set, so the untouched grid remains the fallback.
 */
export class MasonryGrid {
  #grid;
  #frame = 0;
  #width = -1;
  #observer;

  constructor(grid) {
    this.#grid = grid;
    // Only a width change can alter the packing. Reacting to height would feed
    // back into itself, because assigning spans is what changes the height.
    this.#observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (width === this.#width) return;
      this.#width = width;
      this.schedule();
    });
    this.#observer.observe(grid);
    document.fonts?.ready.then(() => this.schedule()).catch(() => {});
  }

  schedule() {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.layout();
    });
  }

  layout() {
    const grid = this.#grid;
    const items = [...grid.children];
    if (!items.length || grid.classList.contains("is-empty")) {
      grid.classList.remove("is-masonry");
      return;
    }

    const styles = getComputedStyle(grid);
    const columns = styles.gridTemplateColumns.split(" ").filter(Boolean).length;
    const rowGap = parseGap(styles.rowGap);

    // A single column is already tightly packed; masonry spans would only add
    // rounding error, so hand the grid back to normal flow.
    if (columns < 2) {
      grid.classList.remove("is-masonry");
      items.forEach((item) => item.style.removeProperty("--masonry-span"));
      return;
    }

    // Measure every item before writing spans back, so the reads are not
    // interleaved with writes that would force repeated synchronous layout.
    // The grid aligns items to `start`, so each height stays the item's own
    // content height rather than the span the previous pass assigned it.
    grid.classList.add("is-masonry");
    const spans = items.map((item) => {
      const height = item.getBoundingClientRect().height;
      return Math.max(1, Math.ceil((height + rowGap) / (ROW_UNIT + rowGap)));
    });
    items.forEach((item, index) => item.style.setProperty("--masonry-span", String(spans[index])));
  }

  disconnect() {
    this.#observer.disconnect();
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }
}

export function enhanceMasonry(grid) {
  if (!grid || typeof ResizeObserver === "undefined") return null;
  const masonry = new MasonryGrid(grid);
  masonry.layout();
  return masonry;
}
