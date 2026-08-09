import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson, writeJson } from "./lib/asset-utils.js";

const manifestPath = path.join(ROOT, "assets/manifests/asset-manifest.json");
const manifest = await readJson(manifestPath, null);
if (!manifest) throw new Error("asset-manifest.json is missing. Run npm run assets:build.");
const ids = new Set();
const slugs = new Set();
const titles = new Set();
const required = ["id", "title", "slug", "division", "divisionSlug", "mediaType", "category", "categorySlug", "contentHash", "altText", "originalDownloadPath", "license", "visibility", "downloadAuthorization"];
const genericMachineTitle = /^(?:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|(?:detail|gallery)\s+\d+|.+\s+stock\s+\d+)$/i;
const errors = [];
for (const asset of manifest.assets) {
  required.forEach((field) => { if (!asset[field]) errors.push(`${asset.id || asset.title || "unknown"}: missing ${field}`); });
  if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`); else ids.add(asset.id);
  if (slugs.has(asset.slug)) errors.push(`duplicate asset slug: ${asset.slug}`); else slugs.add(asset.slug);
  if (titles.has(asset.title)) errors.push(`duplicate display title: ${asset.title}`); else titles.add(asset.title);
  if (genericMachineTitle.test(asset.title || "")) errors.push(`${asset.id}: machine-generated display title ${asset.title}`);
  const paths = [asset.originalDownloadPath, ...(asset.optimizedRenditions || []).map((item) => item.path), asset.posterPath, asset.previewPath].filter((value) => value?.startsWith("/assets/"));
  for (const publicPath of paths) {
    const localPath = path.join(ROOT, publicPath.replace(/^\//, ""));
    try { await fs.access(localPath); } catch { errors.push(`${asset.id}: broken reference ${publicPath}`); }
  }
  if (asset.visibility !== "public" && asset.license?.slug === "public-download") errors.push(`${asset.id}: public license conflicts with ${asset.visibility} visibility`);
  if (asset.downloadAuthorization === "public" && ["collective-ai-internal-use", "restricted-approval-required"].includes(asset.license?.slug)) {
    errors.push(`${asset.id}: restricted license conflicts with public download authorization`);
  }
  if (asset.visibility === "public" && asset.mediaType === "video") {
    if (!asset.previewPath?.startsWith("/assets/previews/")) errors.push(`${asset.id}: public video requires an isolated preview under /assets/previews/`);
    if (asset.previewAudio !== "muted") errors.push(`${asset.id}: public video preview must declare muted audio`);
  }
}
const unassigned = await readJson(path.join(ROOT, "assets/manifests/unassigned-assets.json"), []);
if (unassigned.length) errors.push(`${unassigned.length} unassigned assets remain`);
const componentLibrary = manifest.assets.filter((asset) => asset.series === "Collective AI Inc Component Library");
const componentSheets = componentLibrary.filter((asset) => asset.categorySlug === "component-sheets");
const brandReferences = componentLibrary.filter((asset) => asset.categorySlug === "reference-images" && asset.title?.endsWith("— Brand Reference Sheet"));
const introFilms = manifest.assets.filter((asset) => asset.series === "Division Intro Video Library" && asset.categorySlug === "division-intro-videos");
if (componentSheets.length !== 21) errors.push(`component library requires 21 component sheets; found ${componentSheets.length}`);
if (brandReferences.length !== 21) errors.push(`component library requires 21 paired brand reference sheets; found ${brandReferences.length}`);
if (introFilms.length !== 20) errors.push(`division intro video library requires 20 films; found ${introFilms.length}`);
if (introFilms.filter((asset) => asset.classification === "cross-division").length !== 1) errors.push("division intro video library requires exactly one global cross-division film");
const audit = await readJson(path.join(ROOT, "assets/manifests/audit-summary.json"), {});
audit.brokenAssets = errors.filter((item) => item.includes("broken reference")).length;
audit.validationErrors = errors;
await writeJson(path.join(ROOT, "assets/manifests/audit-summary.json"), audit);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${manifest.assets.length} assets: zero broken references, zero unassigned assets.`);
