import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ROOT, readJson, slugify, titleize, writeJson } from "./lib/asset-utils.js";
import { googlePhotosAssignment, googlePhotosAssignmentCount } from "./google-photos-assignments.js";

const [inventoryArg, extractedRootArg] = process.argv.slice(2);
if (!inventoryArg || !extractedRootArg) {
  console.error("Usage: node scripts/ingest-google-photos-album.js <album-inventory.json> <extracted-root>");
  process.exit(1);
}

const inventoryPath = path.resolve(inventoryArg);
const extractedRoot = path.resolve(extractedRootArg);
const manifestsDir = path.join(ROOT, "assets/manifests");
const sourceMapPath = path.join(manifestsDir, "source-map.json");
const albumMapPath = path.join(manifestsDir, "google-photos-album-map.json");
const divisions = await readJson(path.join(manifestsDir, "divisions.json"), []);
const divisionByName = new Map(divisions.map((division) => [division.name, division]));
const inventory = await readJson(inventoryPath, null);

const ALBUM_NAME = "Collective Stock — Google Photos export 2026-08-08";
const ALBUM_URL = "https://photos.app.goo.gl/fr2pzJkjpTxkbGQB9";
const SOURCE_LABEL = "User-supplied Google Photos album ZIP attached on 2026-08-08";

if (!inventory?.records || inventory.records.length !== googlePhotosAssignmentCount) {
  throw new Error(`Expected ${googlePhotosAssignmentCount} audited album records, found ${inventory?.records?.length || 0}`);
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function derivedTitle(record, assignment) {
  if (!assignment.deriveTitleFromFilename) return assignment.title;
  const stem = path.basename(record.filename, path.extname(record.filename));
  const cleaned = stem
    .replace(/^collective_ai_stock_\d+_/i, "")
    .replace(/^\d+_terra_axis_/i, "")
    .replace(/^(zenflow|binary_loom|vital_helix|vector_shift|nomad_nexus)_stock_/i, `${assignment.division} Stock `);
  const title = titleize(cleaned);
  return title.startsWith(assignment.division) ? title : `${assignment.division} — ${title}`;
}

function meaningfulTags(title, division, category) {
  const words = title.toLowerCase().replace(/[^a-z0-9\s-]+/g, " ").split(/\s+/).filter((word) => word.length > 2);
  return [...new Set([division, category, "Collective AI", "Collective Stock", "Google Photos archive", ...words])];
}

function stockCollection(classification) {
  if (classification === "animal-stock") return "Animals";
  if (classification === "general-stock") return "General Stock";
  return null;
}

function classificationNotes(classification, confidence) {
  if (classification === "animal-stock") return "Visual audit confirmed an animal-led subject; kept outside every division gallery.";
  if (classification === "general-stock") return "Visual audit confirmed unbranded standalone stock; kept outside every division gallery.";
  return confidence === "low" ? "Division attribution is thematic because the source is unbranded; retain album provenance for future reclassification." : null;
}

const albumRecords = [];
const sourceRules = [];
const seenHashes = new Set();

for (const record of [...inventory.records].sort((a, b) => a.albumIndex - b.albumIndex)) {
  const assignment = googlePhotosAssignment(record.albumIndex);
  const division = divisionByName.get(assignment.division);
  if (!division) throw new Error(`Unknown division assignment at album index ${record.albumIndex}: ${assignment.division}`);

  const sourcePath = path.join(extractedRoot, record.archivePath);
  const buffer = await fs.readFile(sourcePath);
  const hash = sha256(buffer);
  if (hash !== record.contentHash) throw new Error(`Hash mismatch for album index ${record.albumIndex}: ${record.filename}`);
  if (seenHashes.has(hash)) throw new Error(`Unexpected exact duplicate in album at index ${record.albumIndex}: ${record.filename}`);
  seenHashes.add(hash);

  const extension = path.extname(record.filename).toLowerCase();
  const destinationRoot = record.mediaType === "video" ? path.join(ROOT, "assets/video") : path.join(ROOT, "assets/originals");
  const physicalFilename = `gphotos-${String(record.albumIndex).padStart(3, "0")}-${slugify(path.basename(record.filename, extension))}${extension}`;
  const destinationPath = path.join(destinationRoot, "google-photos-2026-08-08", division.slug, physicalFilename);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);

  const title = derivedTitle(record, assignment);
  const classification = assignment.classification || (division.slug === "collective-ai-inc" ? "parent-brand" : "division");
  const collection = stockCollection(classification);
  const categorySlug = slugify(assignment.category);
  const tags = meaningfulTags(title, collection || division.name, assignment.category);
  const altText = `${title}, ${assignment.category.toLowerCase()} classified for the ${collection || division.name} collection.`;
  const destinationRelative = `/${path.relative(ROOT, destinationPath).split(path.sep).join("/")}`;

  const mapRecord = {
    albumIndex: record.albumIndex,
    originalFilename: record.filename,
    contentHash: hash,
    sourceArchivePath: record.archivePath,
    destinationPath: destinationRelative,
    mediaType: record.mediaType,
    title,
    division: division.name,
    divisionSlug: division.slug,
    classification,
    category: assignment.category,
    categorySlug,
    classificationConfidence: assignment.confidence || "high",
    width: record.width,
    height: record.height,
    duration: record.duration || null
  };
  albumRecords.push(mapRecord);
  sourceRules.push({
    match: path.basename(physicalFilename, extension),
    originalFilename: record.filename,
    albumIndex: record.albumIndex,
    sourceAlbum: ALBUM_NAME,
    sourceUrl: ALBUM_URL,
    source: SOURCE_LABEL,
    title,
    division: division.name,
    divisionSlug: division.slug,
    classification,
    category: assignment.category,
    categorySlug,
    series: collection ? `Collective Stock / ${collection}` : `${division.name} / Google Photos Archive`,
    batch: "Google Photos album export 2026-08-08",
    generationDate: null,
    prompt: null,
    altText,
    intendedUse: [assignment.category, "Collective AI creative production", "Internal and approved public media use"],
    tags,
    license: "collective-ai-internal-use",
    visibility: "public",
    approvalStatus: "source-verified",
    classificationConfidence: assignment.confidence || "high",
    classificationNotes: classificationNotes(classification, assignment.confidence),
    featured: assignment.category === "Hero Images" && [48, 58, 69, 93, 177, 195, 225, 236, 256, 259, 271, 279, 286, 301, 313, 329].includes(record.albumIndex)
  });
}

const sourceMap = await readJson(sourceMapPath, { schemaVersion: 1, defaults: {}, rules: [], occurrences: [] });
sourceMap.rules = [
  ...(sourceMap.rules || []).filter((rule) => rule.sourceAlbum !== ALBUM_NAME),
  ...sourceRules
];
await writeJson(sourceMapPath, sourceMap);

const byDivision = Object.fromEntries(divisions.map((division) => [division.name, albumRecords.filter((record) => record.division === division.name).length]));
await writeJson(albumMapPath, {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceAlbum: ALBUM_NAME,
  sourceUrl: ALBUM_URL,
  sourceZipFilename: path.basename(inventory.summary?.sourceZip || "Collective Stock-1-001.zip"),
  reconciliation: {
    discovered: inventory.records.length,
    ingestedOccurrences: albumRecords.length,
    uniqueAssets: seenHashes.size,
    exactDuplicates: albumRecords.length - seenHashes.size,
    unassigned: inventory.records.length - albumRecords.length,
    images: albumRecords.filter((record) => record.mediaType === "image").length,
    videos: albumRecords.filter((record) => record.mediaType === "video").length,
    byDivision
  },
  assets: albumRecords
});

console.log(JSON.stringify({ discovered: inventory.records.length, ingested: albumRecords.length, unique: seenHashes.size, images: inventory.summary.images, videos: inventory.summary.videos, unassigned: 0 }));
