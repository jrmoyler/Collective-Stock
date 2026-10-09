import { el, icon } from '../utils/dom.js';
import { assetRoute } from '../utils/routes.js';
export function ShareButton(asset, toast) {
  const button = el('button', { class: 'button button--quiet', type: 'button', 'aria-label': `Share ${asset.title}` }, [icon('share'), 'Share artwork']);
  button.addEventListener('click', async () => {
    const url = new URL(assetRoute(asset.id), location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: `${asset.title} — Collective Stock`, url });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); toast?.show('Artwork link copied'); }
      else throw new Error('Clipboard unavailable');
    } catch (error) {
      if (error.name === 'AbortError') return;
      // An ordinary selectable link keeps sharing possible without clipboard permission.
      if (!button.nextElementSibling?.classList.contains('share-fallback')) button.after(el('a', { class: 'share-fallback', href: url, text: url }));
      toast?.show('Select the artwork link to copy or share it.');
    }
  });
  return button;
}
