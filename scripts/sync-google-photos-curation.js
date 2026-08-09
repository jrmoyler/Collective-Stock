import path from "node:path";
import { googlePhotosAssignment, googlePhotosAssignmentCount } from "./google-photos-assignments.js";
import { ROOT, readJson, slugify, titleize, writeJson } from "./lib/asset-utils.js";

const manifests = path.join(ROOT, "assets/manifests");
const albumMapPath = path.join(manifests, "google-photos-album-map.json");
const sourceMapPath = path.join(manifests, "source-map.json");
const divisions = await readJson(path.join(manifests, "divisions.json"), []);
const albumMap = await readJson(albumMapPath, null);
const sourceMap = await readJson(sourceMapPath, null);
if (!albumMap || !sourceMap) throw new Error("Google Photos album or source map is missing.");
if (albumMap.assets?.length !== googlePhotosAssignmentCount) throw new Error(`Expected ${googlePhotosAssignmentCount} album records, found ${albumMap.assets?.length || 0}.`);

const divisionByName = new Map(divisions.map((division) => [division.name, division]));

function derivedTitle(record, assignment) {
  if (!assignment.deriveTitleFromFilename) return assignment.title;
  const stem = path.basename(record.originalFilename, path.extname(record.originalFilename));
  const cleaned = stem
    .replace(/^collective_ai_stock_\d+_/i, "")
    .replace(/^\d+_terra_axis_/i, "")
    .replace(/^(zenflow|binary_loom|vital_helix|vector_shift|nomad_nexus)_stock_/i, `${assignment.division} Stock `);
  const title = titleize(cleaned);
  return title.startsWith(assignment.division) ? title : `${assignment.division} — ${title}`;
}

function curate(record) {
  const assignment = googlePhotosAssignment(record.albumIndex);
  const division = divisionByName.get(assignment.division);
  if (!division) throw new Error(`Unknown division ${assignment.division} at album index ${record.albumIndex}.`);
  const title = derivedTitle(record, assignment);
  const classification = assignment.classification || (division.slug === "collective-ai-inc" ? "parent-brand" : "division");
  const categorySlug = slugify(assignment.category);
  const words = title.toLowerCase().replace(/[^a-z0-9\s-]+/g, " ").split(/\s+/).filter((word) => word.length > 2);
  const tags = [...new Set([division.name, assignment.category, "Collective AI", "Collective Stock", "Google Photos archive", ...words])];
  return {
    title,
    division: division.name,
    divisionSlug: division.slug,
    classification,
    category: assignment.category,
    categorySlug,
    classificationConfidence: assignment.confidence || "high",
    classificationNotes: assignment.confidence === "low" ? "Division attribution is thematic because the source is unbranded; retain album provenance for future reclassification." : null,
    tags,
    altText: `${title}, ${assignment.category.toLowerCase()} classified for the ${division.name} collection.`
  };
}

albumMap.assets = albumMap.assets.map((record) => {
  const { tags, altText, classificationNotes, ...albumFields } = curate(record);
  const { tags: previousTags, altText: previousAltText, classificationNotes: previousNotes, ...albumRecord } = record;
  return { ...albumRecord, ...albumFields };
});
albumMap.generatedAt = new Date().toISOString();
albumMap.reconciliation.byDivision = Object.fromEntries(divisions.map((division) => [division.name, albumMap.assets.filter((record) => record.division === division.name).length]));

sourceMap.rules = sourceMap.rules.map((rule) => {
  if (rule.sourceAlbum !== albumMap.sourceAlbum || !rule.albumIndex) return rule;
  const record = albumMap.assets.find((asset) => asset.albumIndex === rule.albumIndex);
  const curated = curate(record);
  return {
    ...rule,
    ...curated,
    series: `${curated.division} / Google Photos Archive`,
    intendedUse: [curated.category, "Collective AI creative production", "Internal and approved public media use"],
    featured: curated.category === "Hero Images" && [48, 58, 69, 93, 177, 195, 225, 236, 256, 259, 271, 279, 286, 301, 313, 329].includes(record.albumIndex)
  };
});

await writeJson(albumMapPath, albumMap);
await writeJson(sourceMapPath, sourceMap);
console.log(`Synchronized ${albumMap.assets.length} curated Google Photos names and division assignments.`);
