export class LazyMediaController {
  constructor({ maxPlaying = 2 } = {}) {
    this.maxPlaying = maxPlaying;
    this.playing = new Set();
    this.pending = new Set();
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion.addEventListener?.("change", () => {
      if (this.reducedMotion.matches) [...this.playing, ...this.pending].forEach((video) => this.#pause(video));
    });
    this.observer = new IntersectionObserver((entries) => this.#handle(entries), { rootMargin: "120px 0px", threshold: [0, 0.55] });
  }

  observe(node) { this.observer.observe(node); }

  disconnect() {
    this.observer.disconnect();
    [...this.playing, ...this.pending].forEach((video) => video.pause());
    this.playing.clear();
    this.pending.clear();
  }

  #handle(entries) {
    entries.forEach((entry) => {
      const media = entry.target;
      if (media.tagName === "IMG" && entry.isIntersecting && media.dataset.src) {
        media.src = media.dataset.src;
        media.removeAttribute("data-src");
        media.addEventListener("load", () => media.classList.add("is-loaded"), { once: true });
      }
      if (media.tagName === "VIDEO") {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.55 || this.reducedMotion.matches) this.#pause(media);
        else this.#play(media);
      }
    });
  }

  async #play(video) {
    if (this.playing.has(video) || this.pending.has(video) || this.reducedMotion.matches) return;
    while (this.playing.size + this.pending.size >= this.maxPlaying) {
      this.#pause(this.playing.values().next().value || this.pending.values().next().value);
    }
    this.pending.add(video);
    try {
      await video.play();
      if (!this.pending.has(video) || this.reducedMotion.matches) {
        video.pause();
        return;
      }
      this.playing.add(video);
    } catch {
      video.controls = true;
    } finally {
      this.pending.delete(video);
    }
  }

  #pause(video) {
    if (!video) return;
    video.pause();
    this.pending.delete(video);
    this.playing.delete(video);
  }
}
