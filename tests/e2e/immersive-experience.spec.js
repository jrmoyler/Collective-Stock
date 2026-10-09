import { test, expect } from '@playwright/test';

test('carousel changes real artwork, supports keyboard and opens the selected preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.art-gallery__title')).toHaveText("Mountain Memory in an Owl's Eye");
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  await expect(page.locator('.art-gallery__title')).toHaveText('Coastal Village at Sunset');
  await page.locator('.art-gallery__stage').press('ArrowRight');
  await expect(page.locator('.art-gallery__title')).toHaveText('The Long Road Home');
  await page.getByRole('button', { name: 'Open artwork: The Long Road Home', exact: true }).click();
  await expect(page.locator('.lightbox h2')).toHaveText('The Long Road Home');
  await page.keyboard.press('Escape');
  await expect(page.locator('.lightbox')).not.toBeVisible();
});

test('saved assets persist and can be removed from the saved collection', async ({ page }) => {
  await page.goto('/collections.html?collection=saved');
  await expect(page.getByRole('heading', { name: 'Make room for inspiration.' })).toBeVisible();
  await page.goto('/collections.html?collection=animals');
  const card = page.locator('.media-card').first();
  const id = await card.getAttribute('data-asset-id');
  await card.locator('.save-action').click();
  await page.goto('/collections.html?collection=saved');
  await expect(page.locator('.media-card')).toHaveCount(1);
  await expect(page.locator('.media-card')).toHaveAttribute('data-asset-id', id);
  await page.reload();
  await expect(page.locator('.save-action')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.save-action').click();
  await expect(page.getByRole('heading', { name: 'Make room for inspiration.' })).toBeVisible();
});

test('gallery density changes and no route overflows at narrow widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.art-gallery__stage')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.goto('/collections.html?collection=animals');
    const before = await page.locator('.media-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    await page.getByRole('button', { name: 'Use compact grid' }).click();
    await expect.poll(() => page.locator('.media-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBeGreaterThan(before);
    await expect(page.getByRole('button', { name: 'Use comfortable grid' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('reduced motion and unavailable WebGL retain artwork and controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.art-gallery__fallback')).toBeVisible();
  await expect(page.locator('.art-gallery__canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  await expect(page.locator('.art-gallery__title')).toHaveText('Coastal Village at Sunset');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type === 'webgl2' ? null : original.call(this, type, ...args); };
  });
  await page.reload();
  await expect(page.locator('.art-gallery__fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  await expect(page.locator('.art-gallery__title')).toHaveText('Coastal Village at Sunset');
});

test('search survives corrupt browser storage', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('collective-stock:recent-searches', '{broken'));
  await page.goto('/');
  await page.locator('.home-hero input').fill('ZenFlow');
  await page.locator('.home-hero input').press('Enter');
  await expect(page).toHaveURL(/q=ZenFlow/);
  await expect(page.locator('.media-card').first()).toBeVisible();
});

test('mobile quick navigation and swipe retain vertical scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');
  await page.goto('/');
  const stage = page.locator('.art-gallery__stage');
  await expect(stage).toHaveCSS('touch-action', 'pan-y');
  await stage.dispatchEvent('pointerdown', { clientX: 280, clientY: 400, pointerType: 'touch' });
  await stage.dispatchEvent('pointerup', { clientX: 110, clientY: 402, pointerType: 'touch' });
  await expect(page.locator('.art-gallery__title')).toHaveText('Coastal Village at Sunset');
  await page.getByRole('navigation', { name: 'Quick navigation' }).getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your inspiration, collected.' })).toBeVisible();
});
