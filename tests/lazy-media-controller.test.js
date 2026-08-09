import { afterEach, describe, expect, it, vi } from "vitest";
import { LazyMediaController } from "../src/media/lazy-media-controller.js";

describe("lazy media controller", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("caps concurrent playback and stops every preview for reduced motion", async () => {
    let intersectionHandler;
    let motionHandler;
    const motionPreference = {
      matches: false,
      addEventListener: vi.fn((event, handler) => { if (event === "change") motionHandler = handler; })
    };
    vi.stubGlobal("matchMedia", vi.fn(() => motionPreference));
    vi.stubGlobal("IntersectionObserver", class {
      constructor(handler) { intersectionHandler = handler; }
      observe() {}
      disconnect() {}
    });
    const video = () => ({ tagName: "VIDEO", play: vi.fn(() => Promise.resolve()), pause: vi.fn(), controls: false });
    const first = video();
    const second = video();
    const controller = new LazyMediaController({ maxPlaying: 1 });

    intersectionHandler([{ target: first, isIntersecting: true, intersectionRatio: 1 }]);
    await Promise.resolve();
    intersectionHandler([{ target: second, isIntersecting: true, intersectionRatio: 1 }]);
    await Promise.resolve();
    expect(first.pause).toHaveBeenCalled();
    expect(second.play).toHaveBeenCalledOnce();

    motionPreference.matches = true;
    motionHandler();
    expect(second.pause).toHaveBeenCalled();
    controller.disconnect();
  });
});
