import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson } from "./lib/asset-utils.js";

const required = ["index.html", "division.html", "asset.html", "collections.html", "audit.html", "divisions/zenflow.html", "collections/complete-archive.html", "assets/manifests/asset-manifest.json", "assets/manifests/divisions.json", "assets/manifests/audit-summary.json"];
const missing = [];
for (const file of required) {
  try { await fs.access(path.join(ROOT, "dist", file)); } catch { missing.push(file); }
}
if (missing.length) throw new Error(`Distribution is incomplete: ${missing.join(", ")}`);
const publicManifest = await readJson(path.join(ROOT, "dist/assets/manifests/asset-manifest.json"), { assets: [] });
for (const asset of publicManifest.assets) {
  for (const rendition of asset.optimizedRenditions || []) {
    try { await fs.access(path.join(ROOT, "dist", rendition.path.replace(/^\//, ""))); }
    catch { missing.push(`${asset.id}: ${rendition.path}`); }
  }
  if (asset.mediaType === "video") {
    if (!asset.previewPath) missing.push(`${asset.id}: missing public video preview path`);
    else {
      try { await fs.access(path.join(ROOT, "dist", asset.previewPath.replace(/^\//, ""))); }
      catch { missing.push(`${asset.id}: ${asset.previewPath}`); }
    }
  }
}
if (missing.length) throw new Error(`Distribution is incomplete: ${missing.join(", ")}`);
console.log(`Distribution verified with ${required.length} critical entry points, ${publicManifest.assets.length} public asset records, and every public rendition/video preview.`);
