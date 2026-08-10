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
    const required = ["id", "title", "slug", "division", "mediaType", "category", "originalFilename", "source", "width", "height", "aspectRatio", "contentHash", "perceptualHash", "dominantColors", "focalPoint", "searchKeywords", "semanticTags", "altText", "intendedUse", "license", "visibility", "downloadAuthorization", "originalDownloadPath", "optimizedRenditions", "approvalStatus"];
    manifest.assets.forEach((asset) => required.forEach((field) => expect(asset, `${asset.id} ${field}`).toHaveProperty(field)));
  });
  it("reconciles every supplied file without silently counting inferred history", () => {
    expect(audit.totalFilesDiscovered).toBe(audit.totalUniqueAssetsIngested + audit.exactDuplicates);
    expect(audit.totalFilesDiscovered).toBe(466);
    expect(audit.missingOrInaccessible).toBe(0);
    expect(audit.missingBatches).toBe(0);
    expect(audit.brokenAssets).toBe(0);
    expect(audit.unassignedAssets).toBe(0);
  });
  it("publishes complete named component, intro-film, and motion libraries", () => {
    const componentLibrary = manifest.assets.filter((asset) => asset.series === "Collective AI Inc Component Library");
    const components = componentLibrary.filter((asset) => asset.categorySlug === "component-sheets");
    const brandReferences = componentLibrary.filter((asset) => asset.categorySlug === "reference-images" && asset.title.endsWith("— Brand Reference Sheet"));
    const intros = manifest.assets.filter((asset) => asset.series === "Division Intro Video Library" && asset.categorySlug === "division-intro-videos");
    const motion = manifest.assets.filter((asset) => asset.series === "Collective Stock Motion Film Library" && asset.categorySlug === "motion-films");
    const userUploads = manifest.assets.filter((asset) => asset.originalDownloadPath.includes("user-uploads-2026-08-09"));
    expect(components).toHaveLength(21);
    expect(brandReferences).toHaveLength(21);
    expect(intros).toHaveLength(20);
    expect(intros.filter((asset) => asset.classification === "cross-division")).toHaveLength(1);
    expect(motion).toHaveLength(26);
    expect(userUploads).toHaveLength(7);
    [...intros, ...motion].forEach((asset) => {
      expect(asset.audioProfile).toBeTruthy();
      expect(asset.captionStatus).toBeTruthy();
      expect(asset.posterPath).toBeTruthy();
      expect(asset.previewPath).toMatch(/^\/assets\/previews\/.+-preview\.mp4$/);
      expect(asset.previewAudio).toBe("muted");
      expect(asset.downloadAuthorization).toBe("authenticated");
    });
    expect(manifest.assets.filter((asset) => asset.downloadAuthorization === "public")
      .every((asset) => !["collective-ai-internal-use", "restricted-approval-required"].includes(asset.license?.slug))).toBe(true);
    expect(new Set(manifest.assets.map((asset) => asset.title)).size).toBe(manifest.assets.length);
    const genericMachineTitle = /^(?:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|(?:detail|gallery)\s+\d+|.+\s+stock\s+\d+)$/i;
    expect(manifest.assets.some((asset) => genericMachineTitle.test(asset.title))).toBe(false);
  });
  it("provides enhanced high-resolution delivery renditions for every low-resolution source", () => {
    const lowResolution = manifest.assets.filter((asset) => asset.mediaType === "image" && (asset.width * asset.height < 1_000_000 || (asset.width < 800 && asset.height < 800)));
    expect(lowResolution).toHaveLength(82);
    lowResolution.forEach((asset) => {
      expect(asset.optimizedRenditions.some((rendition) => rendition.label === "large" && rendition.width === 1800), asset.title).toBe(true);
    });
  });
});
