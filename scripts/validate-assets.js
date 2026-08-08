import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson, writeJson } from "./lib/asset-utils.js";

const manifestPath = path.join(ROOT, "assets/manifests/asset-manifest.json");
const manifest = await readJson(manifestPath, null);
if (!manifest) throw new Error("asset-manifest.json is missing. Run npm run assets:build.");
const ids = new Set();
const slugs = new Set();
const required = ["id", "title", "slug", "division", "divisionSlug", "mediaType", "category", "categorySlug", "contentHash", "altText", "originalDownloadPath", "license", "visibility"];
const errors = [];
for (const asset of manifest.assets) {
  required.forEach((field) => { if (!asset[field]) errors.push(`${asset.id || asset.title || "unknown"}: missing ${field}`); });
  if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`); else ids.add(asset.id);
  if (slugs.has(asset.slug)) errors.push(`duplicate asset slug: ${asset.slug}`); else slugs.add(asset.slug);
  const paths = [asset.originalDownloadPath, ...(asset.optimizedRenditions || []).map((item) => item.path), asset.posterPath].filter((value) => value?.startsWith("/assets/"));
  for (const publicPath of paths) {
    const localPath = path.join(ROOT, publicPath.replace(/^\//, ""));
    try { await fs.access(localPath); } catch { errors.push(`${asset.id}: broken reference ${publicPath}`); }
  }
  if (asset.visibility !== "public" && asset.license?.slug === "public-download") errors.push(`${asset.id}: public license conflicts with ${asset.visibility} visibility`);
}
const unassigned = await readJson(path.join(ROOT, "assets/manifests/unassigned-assets.json"), []);
if (unassigned.length) errors.push(`${unassigned.length} unassigned assets remain`);
const audit = await readJson(path.join(ROOT, "assets/manifests/audit-summary.json"), {});
audit.brokenAssets = errors.filter((item) => item.includes("broken reference")).length;
audit.validationErrors = errors;
await writeJson(path.join(ROOT, "assets/manifests/audit-summary.json"), audit);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${manifest.assets.length} assets: zero broken references, zero unassigned assets.`);
