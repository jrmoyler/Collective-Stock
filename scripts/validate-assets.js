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
const validClassifications = new Set(["division", "parent-brand", "cross-division", "animal-stock", "general-stock"]);
for (const asset of manifest.assets) {
  required.forEach((field) => { if (!asset[field]) errors.push(`${asset.id || asset.title || "unknown"}: missing ${field}`); });
  if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`); else ids.add(asset.id);
  if (slugs.has(asset.slug)) errors.push(`duplicate asset slug: ${asset.slug}`); else slugs.add(asset.slug);
  if (titles.has(asset.title)) errors.push(`duplicate display title: ${asset.title}`); else titles.add(asset.title);
  if (genericMachineTitle.test(asset.title || "")) errors.push(`${asset.id}: machine-generated display title ${asset.title}`);
  if (!validClassifications.has(asset.classification)) errors.push(`${asset.id}: invalid classification ${asset.classification}`);
  if (["animal-stock", "general-stock"].includes(asset.classification) && asset.divisionSlug !== "collective-ai-inc") errors.push(`${asset.id}: standalone stock must not be assigned to a division`);
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
const albumMap = await readJson(path.join(ROOT, "assets/manifests/google-photos-album-map.json"), { assets: [] });
const destinationMismatches = albumMap.assets.filter((asset) => asset.destinationPath?.split("/").at(-2) !== asset.divisionSlug);
if (destinationMismatches.length) errors.push(`${destinationMismatches.length} Google Photos destinations disagree with their manifest division`);
const componentLibrary = manifest.assets.filter((asset) => asset.series === "Collective AI Inc Component Library");
const componentSheets = componentLibrary.filter((asset) => asset.categorySlug === "component-sheets");
const brandReferences = componentLibrary.filter((asset) => asset.categorySlug === "reference-images" && asset.title?.endsWith("— Brand Reference Sheet"));
const introFilms = manifest.assets.filter((asset) => asset.series === "Division Intro Video Library" && asset.categorySlug === "division-intro-videos");
if (componentSheets.length !== 21) errors.push(`component library requires 21 component sheets; found ${componentSheets.length}`);
if (brandReferences.length !== 21) errors.push(`component library requires 21 paired brand reference sheets; found ${brandReferences.length}`);
if (introFilms.length !== 20) errors.push(`division intro video library requires 20 films; found ${introFilms.length}`);
if (introFilms.some((asset) => !["division", "parent-brand"].includes(asset.classification))) errors.push("every intro video requires a verified division or parent-brand assignment");
if (introFilms.filter((asset) => asset.classification === "parent-brand").length !== 1) errors.push("the intro library requires exactly one explicitly named parent-brand film");
const violet = introFilms.find((asset) => asset.originalDownloadPath.endsWith("/violet-synaptic-mirror-intro-video.mp4"));
if (!violet || violet.divisionSlug !== "zenflow" || violet.classificationConfidence !== "high") errors.push("Violet Synaptic Mirror must be verified as a high-confidence ZenFlow intro film");
const animalStock = manifest.assets.filter((asset) => asset.classification === "animal-stock");
const generalStock = manifest.assets.filter((asset) => asset.classification === "general-stock");
if (animalStock.length !== 20) errors.push(`Animals collection requires 20 visually audited assets; found ${animalStock.length}`);
if (generalStock.length !== 50) errors.push(`General Stock collection requires 50 visually audited assets; found ${generalStock.length}`);
const whatsAppStock = manifest.assets.filter((asset) => asset.originalFilename?.startsWith("IMG-"));
if (whatsAppStock.length !== 33 || whatsAppStock.some((asset) => !["animal-stock", "general-stock"].includes(asset.classification))) errors.push("all 33 IMG-* stock sources must be isolated in Animals or General Stock");
const motionFilms = manifest.assets.filter((asset) => asset.series === "Collective Stock Motion Film Library");
if (motionFilms.length !== 26 || motionFilms.some((asset) => !["animal-stock", "general-stock"].includes(asset.classification))) errors.push("all 26 standalone motion studies must be isolated in Animals or General Stock");
const audit = await readJson(path.join(ROOT, "assets/manifests/audit-summary.json"), {});
audit.brokenAssets = errors.filter((item) => item.includes("broken reference")).length;
audit.validationErrors = errors;
await writeJson(path.join(ROOT, "assets/manifests/audit-summary.json"), audit);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${manifest.assets.length} assets: zero broken references, zero unassigned assets.`);
