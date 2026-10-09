import { chromium } from '@playwright/test';
import serverless from '@sparticuz/chromium';
import { preview } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Run after npm run build. Uses software WebGL so the enhancement is exercised
// even on CI machines without a physical GPU. Does not claim device FPS.
const output = path.resolve('reports/immersive-experience');
await fs.mkdir(output, { recursive: true });
const server = await preview({ preview: { host: '127.0.0.1', port: 4182 } });
let browser;
const errors = [], failures = [], metrics = {};
try {
  browser = await chromium.launch({ executablePath: await serverless.executablePath(), args: serverless.args, headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://127.0.0.1:4182/');
  await page.locator('.art-gallery__stage.has-webgl').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  const original = await page.locator('canvas').screenshot();
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  await page.waitForTimeout(750); // The finite user-initiated transition.
  assert.equal(await page.locator('.art-gallery__title').textContent(), 'Coastal Village at Sunset');
  assert.ok(!original.equals(await page.locator('canvas').screenshot()), '3D pixels must change with selected artwork');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
    metrics[width] = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, canvasWidth: document.querySelector('canvas').width, canvasHeight: document.querySelector('canvas').height }));
    assert.ok(metrics[width].overflow <= 1, `No overflow at ${width}px`);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: "Show Mountain Memory in an Owl's Eye" }).click();
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(output, 'mobile.png') });
  await page.locator('.art-gallery__controls').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, 'mobile-gallery.png') });
  // A lost GPU context restores a usable image immediately.
  await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.locator('.art-gallery__fallback').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  assert.equal(await page.locator('.art-gallery__title').textContent(), 'Coastal Village at Sunset');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.art-gallery__canvas').count(), 0);
  // Verify detail/download/share controls and clipboard fallback on real records.
  await page.getByRole('button', { name: 'Open artwork: Coastal Village at Sunset' }).click();
  await page.getByRole('link', { name: 'View details', exact: true }).click();
  await page.locator('.download-panel').waitFor();
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); });
  await page.getByRole('button', { name: 'Share Coastal Village at Sunset', exact: true }).click();
  assert.ok(await page.locator('.share-fallback').isVisible());
  await page.screenshot({ path: path.join(output, 'asset-mobile.png') });
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify({ passed: true, browser: await browser.version(), rendering: 'Chromium software WebGL2', cpuThrottle: '4x, interaction and layout checks only', metrics, errors, failedRequests: failures, checks: ['real 3D pixels change on selection', 'responsive layout', 'context-loss fallback', 'reduced motion', 'asset download panel', 'share permission fallback'] }, null, 2));
  console.log('Immersive WebGL, responsive, context-loss and share checks passed.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
