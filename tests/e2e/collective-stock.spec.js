import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const screenshotDir = path.resolve(import.meta.dirname, "../../reports/screenshots");

test.beforeAll(async () => fs.mkdir(screenshotDir, { recursive: true }));

async function warmLazyMedia(page) {
  await page.evaluate(async () => {
    document.documentElement.classList.add("visual-regression");
    for (const media of document.querySelectorAll('img[loading="lazy"], video')) {
      media.scrollIntoView({ block: "center", inline: "center" });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    // Lazy images parked inside a horizontally scrolling rail can stay outside
    // the viewport on narrow layouts, so their decode never settles. Bound the
    // wait per image; screenshots then capture whatever genuinely rendered
    // rather than hanging the whole test on one deferred fetch.
    const decoded = (image) => Promise.race([
      image.decode?.().catch(() => {}) ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ]);
    await Promise.all([...document.images].map(decoded));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
}

test("homepage renders real archive media and search navigates", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Collective Stock/);
  await expect(page.getByRole("heading", { name: /Every vision/ })).toBeVisible();
  await expect(page.locator('.hero-quick-links [aria-current="page"]')).toHaveCount(0);
  await expect(page.locator(".hero-mosaic img").first()).toBeVisible();
  await warmLazyMedia(page);
  await page.screenshot({ path: path.join(screenshotDir, `homepage-${testInfo.project.name}.png`), fullPage: true });
  await page.locator(".home-hero input[type=search]").fill("ZenFlow");
  await page.locator(".home-hero form").press("Enter");
  await expect(page).toHaveURL(/collections\.html.*q=ZenFlow/);
  await expect(page.locator(".media-card").first()).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: path.join(screenshotDir, `search-results-${testInfo.project.name}.png`), fullPage: true });
});

test("division gallery, filtering, preview, and saved state work", async ({ page }, testInfo) => {
  await page.goto("/division.html?division=zenflow");
  await expect(page.getByRole("heading", { name: "ZenFlow", exact: true })).toBeVisible();
  await expect(page.locator('.site-header a[href="/division.html?division=zenflow"][aria-current="page"]').first()).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".division-logo-frame img")).toBeVisible();
  expect(await page.locator(".media-card").count()).toBeGreaterThan(1);
  await page.locator(".media-card").first().hover();
  await page.locator(".save-action").first().click();
  await expect(page.locator(".save-action").first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('button[aria-pressed="true"]').first()).toHaveAttribute("aria-label", /Save|Remove/);
  await page.locator(".card-preview-button").first().click();
  await expect(page.locator("dialog.lightbox")).toBeVisible();
  await page.getByRole("button", { name: "Close preview" }).click();
  await expect(page.locator('[name="sort"]')).toBeVisible();
  await page.locator('[name="sort"]').selectOption("title");
  await expect(page.locator('[name="sort"]')).toBeFocused();
  await expect(page.locator(".skip-link")).toHaveCSS("opacity", "0");
  await page.evaluate(() => document.documentElement.classList.add("visual-regression"));
  await page.screenshot({ path: path.join(screenshotDir, `division-${testInfo.project.name}.png`), fullPage: true });
});

test("search dialog and combobox keyboard state clean up correctly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search archive" }).click();
  const dialog = page.getByRole("dialog", { name: "What are you building?" });
  const input = dialog.getByRole("combobox");
  await expect(dialog).toBeVisible();
  await input.fill("brand");
  await page.waitForTimeout(160);
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /search-suggestions-/);
  await expect(dialog.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/has-dialog/);
});

test("public audit exposes the real reconciliation without private paths", async ({ page }) => {
  await page.goto("/audit.html");
  await expect(page.getByRole("heading", { name: "Nothing hidden. Nothing substituted." })).toBeVisible();
  await expect(page.getByText("1 source archive remains inaccessible")).toBeVisible();
  await expect(page.getByText("Motion MP4s.zip", { exact: true })).toBeVisible();
  await expect(page.getByText(/829,879,395 bytes/)).toBeVisible();
  await expect(page.getByText(/assets\/originals/)).toHaveCount(0);
  const manifestResponse = await page.request.get("/assets/manifests/asset-manifest.json");
  expect(manifestResponse.ok()).toBe(true);
  const publicManifest = await manifestResponse.json();
  expect(publicManifest.assets).toHaveLength(413);
  const forbiddenFields = ["originalDownloadPath", "originalFilename", "contentHash", "perceptualHash", "prompt", "source", "sourceAlbum", "sourceUrl", "albumIndex", "batch", "generationDate"];
  for (const asset of publicManifest.assets) {
    forbiddenFields.forEach((field) => expect(asset).not.toHaveProperty(field));
  }
});

test("all division intro films use playable muted derivatives and clean up on Escape", async ({ page }) => {
  await page.goto("/collections.html?collection=division-intro-videos");
  await expect(page.getByRole("heading", { name: "Division intro videos", exact: true })).toBeVisible();
  await expect(page.locator(".media-card")).toHaveCount(20);
  await expect(page.locator('.site-header a[href="/collections.html?collection=division-intro-videos"][aria-current="page"]').first()).toHaveAttribute("aria-current", "page");
  await page.locator(".card-preview-button").first().click();
  const preview = page.locator("dialog.lightbox video");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^\/assets\/previews\/division-intro-videos\/.+-preview\.mp4$/);
  expect(await preview.evaluate((video) => video.muted)).toBe(true);
  const response = await page.request.get(await preview.getAttribute("src"));
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("video/mp4");
  await preview.evaluate((video) => video.play());
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.lightbox")).not.toBeVisible();
  expect(await preview.evaluate((video) => ({ paused: video.paused, src: video.getAttribute("src") }))).toEqual({ paused: true, src: null });
});

test("component sheet collection remains locked to all twenty-one sheets", async ({ page }) => {
  await page.goto("/collections.html?collection=component-sheets");
  await expect(page.getByRole("heading", { name: "Component sheets", exact: true })).toBeVisible();
  await expect(page.locator(".media-card")).toHaveCount(21);
  await expect(page.locator('.site-header a[href="/collections.html?collection=component-sheets"][aria-current="page"]').first()).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page.locator(".media-card")).toHaveCount(21);
  await expect(page.locator('[name="category"]')).toHaveCount(0);
});

test("mobile navigation is intentional and page has no horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only contract");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.locator("#app > main")).toHaveAttribute("inert", "");
  const menuGeometry = await page.getByRole("navigation", { name: "Mobile navigation" }).evaluate((node) => ({ height: node.getBoundingClientRect().height, viewport: window.innerHeight, header: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")), scrollHeight: node.scrollHeight }));
  expect(menuGeometry.height).toBeGreaterThanOrEqual(menuGeometry.viewport - menuGeometry.header - 1);
  expect(menuGeometry.scrollHeight).toBeGreaterThan(menuGeometry.height);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(screenshotDir, "mobile-navigation.png"), fullPage: false });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
  await expect(page.locator("#app > main")).not.toHaveAttribute("inert", "");
});
