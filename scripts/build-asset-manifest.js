import fs from "node:fs/promises";
import path from "node:path";
import {
  ROOT, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, walk, sha256, imageMetadata, videoMetadata, aspectRatio,
  orientation, humanSize, posixPath, readJson, writeJson, slugify, titleize
} from "./lib/asset-utils.js";

const originalsDir = path.join(ROOT, "assets/originals");
const videoDir = path.join(ROOT, "assets/video");
const optimizedDir = path.join(ROOT, "assets/optimized");
const postersDir = path.join(ROOT, "assets/posters");
const manifestsDir = path.join(ROOT, "assets/manifests");
const sourceMap = await readJson(path.join(manifestsDir, "source-map.json"), { defaults: {}, rules: [], occurrences: [] });
const divisions = await readJson(path.join(manifestsDir, "divisions.json"), []);
const missingDocument = await readJson(path.join(manifestsDir, "missing-assets.json"), []);
const missing = Array.isArray(missingDocument)
  ? missingDocument
  : (missingDocument.missingAssets || missingDocument.conversation_summary_expected_assets || []);
const divisionByToken = [...divisions].sort((a, b) => b.slug.length - a.slug.length);
const optimizedFiles = await walk(optimizedDir);
const posterFiles = await walk(postersDir);
const sourceFiles = [...await walk(originalsDir), ...await walk(videoDir)].filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()) || VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()));
const filesByHash = new Map();

function findRule(file) {
  const name = slugify(path.basename(file));
  return sourceMap.rules?.find((rule) => name.includes(slugify(rule.match || "__never__"))) || {};
}

function detectDivision(file, rule) {
  if (rule.division) return { name: rule.division, slug: rule.divisionSlug || slugify(rule.division), classification: rule.classification || (rule.divisionSlug === "collective-ai-inc" ? "parent-brand" : "division") };
  const token = slugify(file);
  const division = divisionByToken.find((item) => token.includes(item.slug));
  return division ? { name: division.name, slug: division.slug, classification: division.slug === "collective-ai-inc" ? "parent-brand" : "division" } : { name: sourceMap.defaults?.division || "Collective AI Inc", slug: sourceMap.defaults?.divisionSlug || "collective-ai-inc", classification: sourceMap.defaults?.classification || "parent-brand" };
}

function detectCategory(file, rule) {
  if (rule.category) return { name: rule.category, slug: rule.categorySlug || slugify(rule.category) };
  const token = slugify(file);
  const pairs = [
    ["component", "Component Sheets"], ["specification", "Specification Sheets"], ["spec-sheet", "Specification Sheets"],
    ["reference", "Reference Images"], ["hero", "Hero Images"], ["ui", "UI Mockups"], ["mockup", "UI Mockups"],
    ["campaign", "Campaigns and Advertising"], ["poster", "Campaigns and Advertising"], ["flyer", "Campaigns and Advertising"],
    ["hardware", "Hardware Concepts"], ["product", "Product Concepts"], ["motion", "Motion References"], ["3d", "3D and Spatial Media"],
    ["logo", "Brand Sheets"], ["brand", "Brand Sheets"], ["stock", "Stock Images"], ["background", "Website Backgrounds"]
  ];
  const match = pairs.find(([key]) => token.includes(key));
  const name = match?.[1] || sourceMap.defaults?.category || "Complete Archive";
  return { name, slug: slugify(name) };
}

function optimizedRenditions(file) {
  const base = slugify(path.basename(file, path.extname(file)));
  return optimizedFiles.filter((candidate) => path.basename(candidate).startsWith(`${base}-`)).map((candidate) => {
    const match = path.basename(candidate).match(/-(thumbnail|card|large)-(\d+)\.(avif|webp|jpg)$/);
    return { label: match?.[1] || "preview", width: Number(match?.[2]) || undefined, format: match?.[3] || path.extname(candidate).slice(1), path: posixPath(candidate) };
  }).sort((a, b) => (a.width || 0) - (b.width || 0) || a.format.localeCompare(b.format));
}

function generatedPoster(file) {
  const base = slugify(path.basename(file, path.extname(file)));
  const poster = posterFiles.find((candidate) => path.basename(candidate, path.extname(candidate)) === base);
  return poster ? posixPath(poster) : null;
}

function videoMimeType(format) {
  if (format === "mov") return "video/quicktime";
  if (format === "m4v") return "video/x-m4v";
  return `video/${format}`;
}

for (const file of sourceFiles) {
  const hash = await sha256(file);
  const stat = await fs.stat(file);
  const ext = path.extname(file).toLowerCase();
  const mediaType = VIDEO_EXTENSIONS.has(ext) ? "video" : "image";
  const metadata = mediaType === "image" ? await imageMetadata(file) : await videoMetadata(file);
  const rule = findRule(file);
  const division = detectDivision(file, rule);
  const category = detectCategory(file, rule);
  const revisionMatch = path.basename(file).match(/(?:^|[-_])v(?:ersion)?[-_]?(\d+)/i);
  const record = {
    id: `cstk_${hash.slice(0, 20)}`,
    title: rule.title || titleize(path.basename(file)),
    slug: rule.albumIndex
      ? `${slugify(rule.title || path.basename(file))}-gphotos-${String(rule.albumIndex).padStart(3, "0")}`
      : slugify(rule.title || path.basename(file)),
    description: rule.description || `A ${category.name.toLowerCase()} asset from the ${division.name} collection.`,
    division: division.name,
    divisionSlug: division.slug,
    classification: division.classification,
    mediaType,
    category: category.name,
    categorySlug: category.slug,
    originalFilename: rule.originalFilename || path.basename(file),
    albumIndex: rule.albumIndex || null,
    sourceAlbum: rule.sourceAlbum || null,
    sourceUrl: rule.sourceUrl || null,
    source: rule.source || "Supplied project source material",
    series: rule.series || category.name,
    batch: rule.batch || "Local source audit",
    revision: Number(rule.revision || revisionMatch?.[1] || 1),
    generationDate: rule.generationDate || null,
    ingestedAt: "2026-08-08",
    prompt: rule.prompt || null,
    width: metadata.width,
    height: metadata.height,
    duration: metadata.duration || null,
    aspectRatio: aspectRatio(metadata.width, metadata.height),
    orientation: orientation(metadata.width, metadata.height),
    fileFormat: metadata.fileFormat,
    mimeType: mediaType === "video" ? videoMimeType(metadata.fileFormat) : `image/${metadata.fileFormat === "jpg" ? "jpeg" : metadata.fileFormat}`,
    fileSize: stat.size,
    fileSizeHuman: humanSize(stat.size),
    contentHash: hash,
    perceptualHash: metadata.perceptualHash,
    dominantColors: metadata.dominantColors,
    focalPoint: rule.focalPoint || { x: 0.5, y: 0.5 },
    searchKeywords: rule.tags || [division.name, category.name, "Collective AI", "Collective Stock"],
    semanticTags: rule.tags || [division.slug, category.slug],
    altText: rule.altText || `${rule.title || titleize(path.basename(file))}, ${category.name.toLowerCase()} for ${division.name}.`,
    intendedUse: rule.intendedUse || [category.name, "Internal creative work"],
    license: { slug: rule.license || sourceMap.defaults?.license || "collective-ai-internal-use" },
    visibility: rule.visibility || sourceMap.defaults?.visibility || "internal",
    originalDownloadPath: posixPath(file),
    optimizedRenditions: mediaType === "image" ? optimizedRenditions(file) : [],
    posterPath: rule.posterPath || (mediaType === "video" ? generatedPoster(file) || "/assets/posters/media-fallback.svg" : null),
    previewPath: rule.previewPath || (mediaType === "video" && (rule.visibility || sourceMap.defaults?.visibility) === "public" ? posixPath(file) : null),
    relatedAssets: rule.relatedAssets || [],
    featured: Boolean(rule.featured),
    approvalStatus: rule.approvalStatus || sourceMap.defaults?.approvalStatus || "source-verified",
    classificationConfidence: rule.classificationConfidence || null,
    classificationNotes: rule.classificationNotes || null
  };
  if (!filesByHash.has(hash)) filesByHash.set(hash, { record, occurrences: [] });
  filesByHash.get(hash).occurrences.push({ occurrenceId: `occ_${filesByHash.get(hash).occurrences.length + 1}_${hash.slice(0, 12)}`, assetId: record.id, originalFilename: record.originalFilename, sourcePath: posixPath(file), provenance: record.source, division: record.division, batch: record.batch, revision: record.revision, albumIndex: record.albumIndex, sourceAlbum: record.sourceAlbum, sourceUrl: record.sourceUrl });
}

for (const occurrence of sourceMap.occurrences || []) {
  const entry = [...filesByHash.values()].find(({ record }) => record.id === occurrence.assetId || record.slug === occurrence.assetSlug);
  if (entry) entry.occurrences.push({ ...occurrence, occurrenceId: occurrence.occurrenceId || `occ_${entry.occurrences.length + 1}_${entry.record.contentHash.slice(0, 12)}`, assetId: entry.record.id });
}

const assets = [...filesByHash.values()].map((entry) => entry.record).sort((a, b) => Number(b.featured) - Number(a.featured) || a.division.localeCompare(b.division) || a.title.localeCompare(b.title));
const occurrences = [...filesByHash.values()].flatMap((entry) => entry.occurrences);
const exactDuplicates = sourceFiles.length - filesByHash.size;
const missingCount = missing.reduce((sum, item) => {
  const value = item.expectedCount ?? item.expected_request_units ?? item.unresolved_request_units;
  return sum + (Number.isFinite(Number(value)) ? Number(value) : 0);
}, 0);
const audit = {
  generatedAt: new Date().toISOString(),
  totalFilesDiscovered: sourceFiles.length,
  totalUniqueAssetsIngested: assets.length,
  totalOriginalOccurrences: occurrences.length,
  assignedToDivisions: assets.filter((asset) => asset.classification === "division").length,
  parentBrandAssets: assets.filter((asset) => asset.classification === "parent-brand").length,
  crossDivisionAssets: assets.filter((asset) => asset.classification === "cross-division").length,
  exactDuplicates,
  revisionsAndVariants: assets.filter((asset) => asset.revision > 1 || asset.relatedAssets.length).length,
  missingOrInaccessible: missingCount,
  missingBatches: missing.length,
  brokenAssets: 0,
  unassignedAssets: 0,
  reconciliation: `${sourceFiles.length} discovered files = ${assets.length} unique ingested assets + ${exactDuplicates} exact duplicate files; ${occurrences.length} provenance occurrences retained. ${missingCount} expected inaccessible outputs are external to the discovered-file equation.`
};

await writeJson(path.join(manifestsDir, "asset-manifest.json"), { schemaVersion: 1, generatedAt: audit.generatedAt, summary: audit, assets });
await writeJson(path.join(manifestsDir, "source-provenance.json"), { schemaVersion: 1, generatedAt: audit.generatedAt, occurrences });
await writeJson(path.join(manifestsDir, "unassigned-assets.json"), []);
await writeJson(path.join(manifestsDir, "audit-summary.json"), audit);

const rows = [
  ["Total source files discovered", audit.totalFilesDiscovered], ["Unique assets ingested", audit.totalUniqueAssetsIngested],
  ["Provenance occurrences", audit.totalOriginalOccurrences], ["Assigned division assets", audit.assignedToDivisions],
  ["Parent-brand assets", audit.parentBrandAssets], ["Cross-division assets", audit.crossDivisionAssets],
  ["Exact duplicate files", audit.exactDuplicates], ["Revisions and variants", audit.revisionsAndVariants],
  ["Missing or inaccessible expected outputs", audit.missingOrInaccessible], ["Broken assets", audit.brokenAssets], ["Unassigned assets", audit.unassignedAssets]
];
const report = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex,nofollow"><title>Collective Stock Asset Audit</title><style>body{margin:0;background:#050A18;color:#F5F5F5;font:16px system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:64px 24px}h1{font-size:clamp(42px,8vw,88px);line-height:.9;letter-spacing:-.06em}p{color:#8B9BAE;max-width:75ch}table{width:100%;margin:40px 0;border-collapse:collapse}th,td{padding:14px;border-bottom:1px solid #1A2540;text-align:left}td:last-child{font-family:monospace;color:#00D9B5}a{color:#D4A843}.warn{padding:18px;border:1px solid #6c5427;background:#151209}.mono{font-family:monospace;font-size:13px}</style></head><body><main><p class="mono">COLLECTIVE STOCK / AUDIT / ${audit.generatedAt}</p><h1>Asset reconciliation</h1><p>This report reconciles every media file supplied to the repository, including the user-provided Google Photos album export. Exact duplicates retain occurrence provenance; no unrelated media is substituted.</p><table><tbody>${rows.map(([label,value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("")}</tbody></table><p class="warn">${audit.reconciliation}</p><p><a href="/assets/manifests/missing-assets.json">Review the missing-asset ledger</a> · <a href="/assets/manifests/source-provenance.json">Review provenance</a> · <a href="/collections.html?collection=complete-archive">Browse the complete accessible archive</a></p></main></body></html>`;
await fs.writeFile(path.join(manifestsDir, "asset-audit-report.html"), report, "utf8");
console.log(audit.reconciliation);
