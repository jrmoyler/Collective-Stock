import { el, icon } from '../utils/dom.js';
import { optimizedPath } from '../components/media-card.js';
import { selectGalleryArt, relativeSlot } from './art-selection.js';

export function ArtGallery({ assets, onPreview }) {
  const art = selectGalleryArt(assets);
  if (!art.length) return el('div', { class: 'art-gallery-empty', text: 'Explore the archive to find your next inspiration.' });
  let selected = 0, scene, disposed = false, enhanced = false, generation = 0;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const listen = (target, type, handler, options = {}) => target.addEventListener(type, handler, { ...options, signal: abort.signal });
  const fallback = el('div', { class: 'art-gallery__fallback', 'aria-hidden': 'true' }, art.map((a, i) => el('div', { class: 'art-panel', dataset: { index: i } }, el('img', { src: optimizedPath(a), alt: '', width: a.width, height: a.height, decoding: 'async', fetchPriority: i === 0 ? 'high' : 'auto' }))));
  const stage = el('div', { class: 'art-gallery__stage', tabindex: '0', role: 'group', 'aria-label': 'Artwork gallery. Swipe or use arrow keys to browse.' }, fallback);
  const title = el('strong', { class: 'art-gallery__title' });
  const count = el('span', { class: 'art-gallery__count mono' });
  const status = el('span', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const dots = art.map((a, i) => el('button', { class: 'gallery-dot', type: 'button', 'aria-label': `Show ${a.title}`, onClick: () => select(i) }, el('span')));
  const previous = el('button', { class: 'icon-button art-gallery__previous', type: 'button', 'aria-label': 'Previous artwork', onClick: () => select(selected - 1) }, icon('arrow'));
  const next = el('button', { class: 'icon-button', type: 'button', 'aria-label': 'Next artwork', onClick: () => select(selected + 1) }, icon('arrow'));
  const open = el('button', { class: 'art-gallery__open', type: 'button', onClick: () => onPreview(art[selected], art) }, ['Open artwork', icon('expand')]);
  const root = el('section', { class: 'art-gallery', 'aria-label': 'Featured artwork carousel', 'aria-roledescription': 'carousel' }, [stage, el('div', { class: 'art-gallery__controls' }, [previous, el('div', { class: 'art-gallery__caption' }, [title, el('div', { class: 'art-gallery__progress' }, [count, el('div', { class: 'gallery-dots', 'aria-label': 'Choose artwork' }, dots)])]), next, open]), status]);
  function select(value, announce = true) {
    selected = (value + art.length) % art.length;
    title.textContent = art[selected].title;
    count.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(art.length).padStart(2, '0')}`;
    open.setAttribute('aria-label', `Open artwork: ${art[selected].title}`);
    fallback.querySelectorAll('.art-panel').forEach((panel, i) => {
      const slot = relativeSlot(i, selected, art.length);
      panel.style.setProperty('--slot', slot);
      panel.style.setProperty('--distance', Math.abs(slot));
      panel.style.zIndex = String(5 - Math.abs(slot));
      panel.classList.toggle('is-current', slot === 0);
      panel.classList.toggle('is-distant', Math.abs(slot) > 1);
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(selected === i)));
    scene?.select(selected);
    if (announce) status.textContent = `${art[selected].title}. Artwork ${selected + 1} of ${art.length}.`;
  }
  listen(stage, 'keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(selected + (event.key === 'ArrowRight' ? 1 : -1)); }
    if (event.key === 'Enter') onPreview(art[selected], art);
  });
  let down;
  listen(stage, 'pointerdown', event => { down = { x: event.clientX, y: event.clientY }; });
  listen(stage, 'pointerup', event => {
    if (!down) return;
    const dx = event.clientX - down.x, dy = event.clientY - down.y;
    down = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.3) select(selected + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) onPreview(art[selected], art);
  });
  listen(stage, 'pointercancel', () => { down = null; });
  listen(stage, 'pointerleave', () => { down = null; scene?.point(0, 0); });
  listen(stage, 'pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse') return;
    const box = stage.getBoundingClientRect();
    scene?.point((event.clientX - box.left) / box.width - .5, (event.clientY - box.top) / box.height - .5);
  }, { passive: true });
  async function enhance() {
    if (enhanced || disposed || motion.matches) return;
    enhanced = true;
    const currentGeneration = ++generation;
    try {
      const { createArtScene } = await import('./art-scene.js');
      if (disposed || motion.matches) { enhanced = false; return; }
      const created = await createArtScene(stage, art, { selected, onFailure: () => stage.classList.remove('has-webgl') });
      if (disposed || currentGeneration !== generation || motion.matches) created?.dispose();
      else { scene = created; scene?.select(selected); }
    } catch { stage.classList.remove('has-webgl'); }
  }
  const observer = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    scene?.setVisible(visible && !document.hidden);
    if (visible) enhance();
  }, { threshold: .05 });
  observer.observe(stage);
  listen(document, 'visibilitychange', () => scene?.setVisible(!document.hidden && stage.getBoundingClientRect().bottom > 0));
  listen(motion, 'change', () => {
    generation++; scene?.dispose(); scene = null; enhanced = false;
    stage.classList.remove('has-webgl');
    if (!motion.matches) enhance();
  });
  // Keep the back/forward cache usable; dispose only on final page departure.
  listen(window, 'pagehide', event => {
    if (event.persisted) { scene?.setVisible(false); return; }
    disposed = true; observer.disconnect(); scene?.dispose(); abort.abort();
  });
  listen(window, 'pageshow', () => scene?.setVisible(true));
  select(0, false);
  return root;
}
