// Stable editorial ordering; missing/private assets fall back to available stills.
export const GALLERY_TITLES = ["Mountain Memory in an Owl's Eye", "Coastal Village at Sunset", "The Long Road Home", "Industrial Mech in Hangar", "Connected Earth at Night"];
export function selectGalleryArt(assets) {
  const stills = assets.filter(a => a.mediaType === 'image' && a.optimizedRenditions?.length);
  const selected = GALLERY_TITLES.map(title => stills.find(a => a.title === title)).filter(Boolean);
  for (const a of stills.filter(a => a.featured)) if (selected.length < 5 && !selected.includes(a)) selected.push(a);
  if (!selected.length) selected.push(...stills.slice(0, 5));
  return selected;
}
export function relativeSlot(index, selected, length) {
  return ((index - selected + Math.floor(length / 2) + length) % length) - Math.floor(length / 2);
}
