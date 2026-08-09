import { describe, expect, it } from "vitest";
import { COLLECTION_DEFINITIONS, applyCollectionConstraints, collectionDefinition } from "../src/data/collection-definitions.js";

describe("collection definitions", () => {
  it("keeps component and intro collection scopes immutable", () => {
    expect(new Set(COLLECTION_DEFINITIONS.map((item) => item.slug)).size).toBe(COLLECTION_DEFINITIONS.length);
    expect(collectionDefinition("component-sheets")).toMatchObject({
      navigation: true,
      constraints: { category: "component-sheets" }
    });
    expect(applyCollectionConstraints({ category: "stock-images", mediaType: "image", q: "identity" }, "division-intro-videos")).toMatchObject({
      category: "division-intro-videos",
      mediaType: "video",
      q: "identity"
    });
  });
});
