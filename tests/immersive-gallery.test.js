import { describe, it, expect } from 'vitest';
import { selectGalleryArt, relativeSlot, GALLERY_TITLES } from '../src/experience/art-selection.js';

describe('editorial gallery catalog boundaries', () => {
  it('uses only available image renditions and handles an empty archive', () => {
    expect(selectGalleryArt([])).toEqual([]);
    const image = { id: 'a', title: GALLERY_TITLES[0], mediaType: 'image', optimizedRenditions: [{ path: '/actual.webp' }] };
    const video = { ...image, id: 'b', mediaType: 'video' };
    const missing = { ...image, id: 'c', optimizedRenditions: [] };
    expect(selectGalleryArt([video, missing, image])).toEqual([image]);
  });
  it('wraps selected artwork through every slot without duplicates', () => {
    for (const count of [1, 2, 3, 4, 5]) for (let selected = 0; selected < count; selected++) {
      const slots = Array.from({ length: count }, (_, i) => relativeSlot(i, selected, count));
      expect(new Set(slots).size).toBe(count);
      expect(slots[selected]).toBe(0);
      expect(Math.max(...slots.map(Math.abs))).toBeLessThanOrEqual(Math.floor(count / 2));
    }
  });
});
