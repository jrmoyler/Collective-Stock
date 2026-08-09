import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const json = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const manifest = json("assets/manifests/asset-manifest.json");
const divisions = json("assets/manifests/divisions.json");
const audit = json("assets/manifests/audit-summary.json");
const unassigned = json("assets/manifests/unassigned-assets.json");

describe("asset manifest contract", () => {
  it("contains one parent plus twenty functioning division definitions", () => {
    expect(divisions).toHaveLength(21);
    expect(new Set(divisions.map((item) => item.slug)).size).toBe(21);
    expect(divisions.filter((item) => item.slug !== "collective-ai-inc").every((item) => item.logoPath && item.accent)).toBe(true);
  });
  it("assigns every ingested asset exactly once", () => {
    expect(unassigned).toEqual([]);
    expect(manifest.assets).toHaveLength(audit.totalUniqueAssetsIngested);
    expect(new Set(manifest.assets.map((asset) => asset.id)).size).toBe(manifest.assets.length);
    expect(manifest.assets.every((asset) => divisions.some((division) => division.slug === asset.divisionSlug))).toBe(true);
  });
  it("retains all required discovery and rights fields", () => {
    const required = ["id", "title", "slug", "division", "mediaType", "category", "originalFilename", "source", "width", "height", "aspectRatio", "contentHash", "perceptualHash", "dominantColors", "focalPoint", "searchKeywords", "semanticTags", "altText", "intendedUse", "license", "visibility", "originalDownloadPath", "optimizedRenditions", "approvalStatus"];
    manifest.assets.forEach((asset) => required.forEach((field) => expect(asset, `${asset.id} ${field}`).toHaveProperty(field)));
  });
  it("reconciles every supplied file without silently counting inferred history", () => {
    expect(audit.totalFilesDiscovered).toBe(audit.totalUniqueAssetsIngested + audit.exactDuplicates);
    expect(audit.totalFilesDiscovered).toBeGreaterThanOrEqual(330);
    expect(audit.missingOrInaccessible).toBe(0);
    expect(audit.brokenAssets).toBe(0);
    expect(audit.unassignedAssets).toBe(0);
  });
});
