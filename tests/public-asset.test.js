import { describe, expect, it } from "vitest";
import { PUBLIC_FORBIDDEN_FIELDS, publicAssetRecord, publicProvenanceRecord } from "../src/data/public-asset.js";

describe("anonymous public asset projection", () => {
  it("keeps discovery fields and strips private provenance and storage fields", () => {
    const projected = publicAssetRecord({
      id: "asset-1",
      title: "Public asset",
      visibility: "public",
      previewPath: "/assets/previews/asset-1-preview.mp4",
      originalDownloadPath: "/assets/video/private/asset-1.mp4",
      originalFilename: "asset-1.mp4",
      contentHash: "private-hash",
      prompt: "private prompt",
      sourceUrl: "https://private.example/asset-1"
    });

    expect(projected).toMatchObject({
      id: "asset-1",
      title: "Public asset",
      visibility: "public",
      previewPath: "/assets/previews/asset-1-preview.mp4"
    });
    PUBLIC_FORBIDDEN_FIELDS.forEach((field) => expect(projected).not.toHaveProperty(field));
  });

  it("removes every provenance occurrence from anonymous responses", () => {
    const projected = publicProvenanceRecord({
      schemaVersion: "1.0",
      generatedAt: "2026-08-09T00:00:00.000Z",
      occurrences: [{ assetId: "asset-1", sourceUrl: "https://private.example/asset-1" }],
      privateSource: "internal-ledger"
    });

    expect(projected).toEqual({
      schemaVersion: "1.0",
      generatedAt: "2026-08-09T00:00:00.000Z",
      occurrences: []
    });
    expect(projected).not.toHaveProperty("privateSource");
  });
});
