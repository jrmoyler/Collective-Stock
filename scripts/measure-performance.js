import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";

const root = path.resolve(import.meta.dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff": "font/woff", ".woff2": "font/woff2" };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const absolute = path.resolve(root, "dist", relative);
  if (!absolute.startsWith(`${path.resolve(root, "dist")}${path.sep}`) && absolute !== path.resolve(root, "dist/index.html")) { response.writeHead(403).end(); return; }
  try {
    const body = await fs.readFile(absolute);
    response.writeHead(200, { "Content-Type": mime[path.extname(absolute)] || "application/octet-stream", "Cache-Control": "no-store" }).end(body);
  } catch { response.writeHead(404).end("Not found"); }
});
await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
const executablePath = process.env.COLLECTIVE_STOCK_CHROMIUM || path.join(root, ".browser-runtime/chromium");
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
  env: { ...process.env, XDG_CACHE_HOME: path.join(root, ".browser-runtime/cache"), FONTCONFIG_PATH: "/etc/fonts", FONTCONFIG_FILE: "/etc/fonts/fonts.conf" }
});
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8, connectionType: "cellular4g" });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.addInitScript(() => {
  window.__collectiveVitals = { lcp: 0, cls: 0, inp: 0, longTasks: 0 };
  new PerformanceObserver((list) => { const entries = list.getEntries(); window.__collectiveVitals.lcp = entries.at(-1)?.startTime || 0; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__collectiveVitals.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__collectiveVitals.longTasks += entry.duration; }).observe({ type: "longtask", buffered: true });
  try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__collectiveVitals.inp = Math.max(window.__collectiveVitals.inp, entry.duration || 0); }).observe({ type: "event", buffered: true, durationThreshold: 16 }); } catch {}
});
const started = Date.now();
await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle", timeout: 60_000 });
const wallLoadMs = Date.now() - started;
await page.waitForTimeout(1_000);
await page.evaluate(() => { window.__collectiveVitals.inp = 0; });
await page.getByRole("button", { name: "Search archive" }).click();
await page.waitForTimeout(500);
const metrics = await page.evaluate(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  return {
    ...window.__collectiveVitals,
    ttfb: navigation?.responseStart || 0,
    domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
    loadEvent: navigation?.loadEventEnd || 0,
    transferSize: performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry.transferSize || 0), navigation?.transferSize || 0),
    resources: performance.getEntriesByType("resource").length
  };
});
const output = {
  generatedAt: new Date().toISOString(),
  url: "http://127.0.0.1:4173/",
  profile: { viewport: "412x915@2x", latencyMs: 150, downlinkMbps: 1.6, uplinkMbps: 0.75, cpuSlowdown: 4 },
  measurement: { ...metrics, wallLoadMs },
  interpretation: "Custom Playwright/CDP lab profile. This is not a Lighthouse score or field Core Web Vitals certification. INP is a single scripted interaction, not the field p98 statistic."
};
await fs.writeFile(path.join(root, "reports/performance-measurement.json"), JSON.stringify(output, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
console.log(JSON.stringify(output, null, 2));
