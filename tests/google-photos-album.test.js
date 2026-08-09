import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const json = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const album = json("assets/manifests/google-photos-album-map.json");
const manifest = json("assets/manifests/asset-manifest.json");
const provenance = json("assets/manifests/source-provenance.json");

describe("Google Photos album ingestion", () => {
  it("reconciles every archive entry exactly once", () => {
    expect(album.reconciliation).toMatchObject({
      discovered: 330,
      ingestedOccurrences: 330,
      uniqueAssets: 330,
      exactDuplicates: 0,
      unassigned: 0,
      images: 326,
      videos: 4
    });
    expect(album.assets).toHaveLength(330);
    expect(new Set(album.assets.map((asset) => asset.albumIndex))).toEqual(new Set(Array.from({ length: 330 }, (_, index) => index + 1)));
    expect(new Set(album.assets.map((asset) => asset.contentHash)).size).toBe(330);
  });

  it("retains album provenance and valid classifications in the built manifest", () => {
    const albumHashes = new Set(album.assets.map((asset) => asset.contentHash));
    const ingested = manifest.assets.filter((asset) => albumHashes.has(asset.contentHash));
    expect(ingested).toHaveLength(330);
    expect(ingested.every((asset) => asset.sourceAlbum && asset.albumIndex && asset.classificationConfidence)).toBe(true);
    const occurrences = provenance.occurrences.filter((item) => item.sourceAlbum === album.sourceAlbum);
    expect(occurrences).toHaveLength(330);
  });

  it("builds playable metadata and poster frames for all four videos", () => {
    const videoHashes = new Set(album.assets.filter((asset) => asset.mediaType === "video").map((asset) => asset.contentHash));
    const videos = manifest.assets.filter((asset) => videoHashes.has(asset.contentHash));
    expect(videos).toHaveLength(4);
    videos.forEach((video) => {
      expect(video.duration).toBeGreaterThan(0);
      expect(video.width).toBeGreaterThan(0);
      expect(video.height).toBeGreaterThan(0);
      expect(video.posterPath).toMatch(/^\/assets\/posters\/.+\.jpg$/);
      expect(video.previewPath).toMatch(/^\/assets\/previews\/.+-preview\.mp4$/);
      expect(video.previewPath).not.toBe(video.originalDownloadPath);
      expect(video.previewAudio).toBe("muted");
      expect(video.downloadAuthorization).toBe("authenticated");
    });
  });
});
