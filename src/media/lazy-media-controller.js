export class LazyMediaController {
  constructor({ maxPlaying = 2 } = {}) {
    this.maxPlaying = maxPlaying;
    this.playing = new Set();
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    this.observer = new IntersectionObserver((entries) => this.#handle(entries), { rootMargin: "120px 0px", threshold: [0, 0.55] });
  }

  observe(node) { this.observer.observe(node); }

  disconnect() {
    this.observer.disconnect();
    this.playing.forEach((video) => video.pause());
    this.playing.clear();
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
    if (this.playing.has(video)) return;
    while (this.playing.size >= this.maxPlaying) this.#pause(this.playing.values().next().value);
    try {
      await video.play();
      this.playing.add(video);
    } catch {
      video.controls = true;
    }
  }

  #pause(video) {
    if (!video) return;
    video.pause();
    this.playing.delete(video);
  }
}
