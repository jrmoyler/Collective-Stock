import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson } from "./lib/asset-utils.js";
import { COLLECTION_DEFINITIONS } from "../src/data/collection-definitions.js";

const origin = "https://collective-stock.vercel.app";
const divisions = await readJson(path.join(ROOT, "assets/manifests/divisions.json"), []);
const manifest = await readJson(path.join(ROOT, "assets/manifests/asset-manifest.json"), { assets: [] });
const collections = COLLECTION_DEFINITIONS.map(({ slug }) => slug);
const paths = [
  "/",
  ...divisions.map((division) => `/divisions/${division.slug}`),
  ...collections.map((collection) => `/collections/${collection}`),
  ...manifest.assets.filter((asset) => asset.visibility === "public").map((asset) => `/assets/${asset.id}`)
];
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map((urlPath) => `  <url><loc>${escape(`${origin}${urlPath}`)}</loc></url>`).join("\n")}\n</urlset>\n`;
await fs.writeFile(path.join(ROOT, "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap with ${new Set(paths).size} public URLs.`);
