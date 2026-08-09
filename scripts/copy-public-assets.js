import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson } from "./lib/asset-utils.js";

async function copy(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
}

const pairs = [
  ["assets/posters", "dist/assets/posters"],
  ["assets/logos", "dist/assets/logos"],
  ["robots.txt", "dist/robots.txt"],
  ["sitemap.xml", "dist/sitemap.xml"]
  ,["favicon.svg", "dist/favicon.svg"]
];
for (const [from, to] of pairs) await copy(path.join(ROOT, from), path.join(ROOT, to));
const manifest = await readJson(path.join(ROOT, "assets/manifests/asset-manifest.json"), { assets: [] });
const divisions = await readJson(path.join(ROOT, "assets/manifests/divisions.json"), []);
const audit = await readJson(path.join(ROOT, "assets/manifests/audit-summary.json"), {});
const publicAssets = manifest.assets.filter((asset) => asset.visibility === "public");
for (const asset of publicAssets) {
  for (const rendition of asset.optimizedRenditions || []) {
    const relative = rendition.path.replace(/^\//, "");
    await copy(path.join(ROOT, relative), path.join(ROOT, "dist", relative));
  }
  if (asset.mediaType === "video" && asset.previewPath?.startsWith("/assets/video/")) {
    const relative = asset.previewPath.replace(/^\//, "");
    await copy(path.join(ROOT, relative), path.join(ROOT, "dist", relative));
  }
}
const manifestDir = path.join(ROOT, "dist/assets/manifests");
await fs.mkdir(manifestDir, { recursive: true });
await fs.writeFile(path.join(manifestDir, "asset-manifest.json"), JSON.stringify({ ...manifest, summary: { publicAssets: publicAssets.length }, assets: publicAssets }, null, 2));
await fs.writeFile(path.join(manifestDir, "divisions.json"), JSON.stringify(divisions, null, 2));
await fs.writeFile(path.join(manifestDir, "source-provenance.json"), JSON.stringify({ occurrences: [] }, null, 2));
await fs.writeFile(path.join(manifestDir, "audit-summary.json"), JSON.stringify({ ...audit, publicAssets: publicAssets.length }, null, 2));
console.log(`Copied ${publicAssets.length} public assets and ${pairs.length} public asset groups; private originals and metadata remain outside the static distribution.`);
