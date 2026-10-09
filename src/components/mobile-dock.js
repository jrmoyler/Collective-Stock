import { el, icon } from '../utils/dom.js';
import { collectionRoute } from '../utils/routes.js';
export function MobileDock({ page, state, favorites, onSearch }) {
  const count = el('span', { class: 'dock-count', text: favorites.values().length || '' });
  favorites.addEventListener('change', () => { count.textContent = favorites.values().length || ''; });
  return el('nav', { class: 'mobile-dock', 'aria-label': 'Quick navigation' }, [
    el('a', { href: '/', 'aria-current': page === 'home' ? 'page' : undefined }, [icon('globe'), el('span', { text: 'Home' })]),
    el('a', { href: collectionRoute('complete-archive'), 'aria-current': page === 'collections' && state.collection !== 'saved' ? 'page' : undefined }, [icon('grid'), el('span', { text: 'Explore' })]),
    el('a', { href: collectionRoute('saved'), 'aria-current': state.collection === 'saved' ? 'page' : undefined }, [icon('heart'), el('span', {}, ['Saved', count])]),
    el('button', { type: 'button', 'aria-label': 'Search from quick navigation', onClick: onSearch }, [icon('search'), el('span', { text: 'Search' })])
  ]);
}
