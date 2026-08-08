import { defineConfig, devices } from "@playwright/test";
import serverlessChromium from "@sparticuz/chromium";
import { resolve } from "node:path";

serverlessChromium.setGraphicsMode = false;
const executablePath = process.env.COLLECTIVE_STOCK_CHROMIUM || resolve(import.meta.dirname, ".browser-runtime/chromium");
const browserCache = resolve(import.meta.dirname, ".browser-runtime/cache");

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./reports/.playwright",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "reports/playwright", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: {
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
      env: { ...process.env, XDG_CACHE_HOME: browserCache, FONTCONFIG_PATH: "/etc/fonts", FONTCONFIG_FILE: "/etc/fonts/fonts.conf" }
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1050 } } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } }
  ]
});
