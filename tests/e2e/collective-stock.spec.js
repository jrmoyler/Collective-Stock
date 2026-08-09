import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const screenshotDir = path.resolve(import.meta.dirname, "../../reports/screenshots");

test.beforeAll(async () => fs.mkdir(screenshotDir, { recursive: true }));

async function warmLazyMedia(page) {
  await page.evaluate(async () => {
    document.documentElement.classList.add("visual-regression");
    for (const media of document.querySelectorAll('img[loading="lazy"], video')) {
      media.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    await Promise.all([...document.images].map((image) => image.decode?.().catch(() => {})));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
}

test("homepage renders real archive media and search navigates", async ({ page }, testInfo) => {
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Collective Stock/);
  await expect(page.getByRole("heading", { name: /Every vision/ })).toBeVisible();
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
  await expect(page.locator(".division-logo-frame img")).toBeVisible();
  expect(await page.locator(".media-card").count()).toBeGreaterThan(1);
  await page.locator(".media-card").first().hover();
  await page.locator(".save-action").first().click();
  await expect(page.locator(".save-action").first()).toHaveAttribute("aria-pressed", "true");
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
  await expect(page.getByText("Zero missing or inaccessible outputs")).toBeVisible();
  await expect(page.getByText(/assets\/originals/)).toHaveCount(0);
});

test("all four album videos have playable public previews", async ({ page }) => {
  await page.goto("/collections.html?collection=videos");
  await expect(page.getByRole("heading", { name: "Videos", exact: true })).toBeVisible();
  await expect(page.locator(".media-card")).toHaveCount(4);
  await page.locator(".card-preview-button").first().click();
  const preview = page.locator("dialog.lightbox video");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^\/assets\/video\/google-photos-2026-08-08\/.+\.mp4$/);
  const response = await page.request.get(await preview.getAttribute("src"));
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("video/mp4");
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
