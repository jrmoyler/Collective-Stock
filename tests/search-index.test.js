import { describe, expect, it } from "vitest";
import { SearchIndex, fuzzyScore } from "../src/search/search-index.js";

const assets = [
  { id: "1", title: "Biological Age Trajectory", division: "Eon Core", divisionSlug: "eon-core", classification: "division", category: "UI Mockups", categorySlug: "ui-mockups", mediaType: "image", width: 1600, height: 900, semanticTags: ["longevity", "biomarkers"], searchKeywords: ["health dashboard"], intendedUse: ["application screen"], license: { slug: "collective-ai-internal-use" }, visibility: "internal", fileFormat: "png", featured: true },
  { id: "2", title: "Quantum Ledger Hero", division: "Quantum Ledger", divisionSlug: "quantum-ledger", classification: "division", category: "Hero Images", categorySlug: "hero-images", mediaType: "image", width: 900, height: 1600, semanticTags: ["finance", "ledger"], searchKeywords: ["quantum finance"], intendedUse: ["website hero"], license: { slug: "public-download" }, visibility: "public", fileFormat: "webp", featured: false },
  { id: "3", title: "Coastal Stock", division: "Collective AI Inc", divisionSlug: "collective-ai-inc", classification: "general-stock", category: "Stock Images", categorySlug: "stock-images", mediaType: "image", width: 1600, height: 900, semanticTags: ["coast"], searchKeywords: ["general stock"], intendedUse: ["editorial"], license: { slug: "public-download" }, visibility: "public", fileFormat: "jpg", featured: false }
];

describe("SearchIndex", () => {
  const index = new SearchIndex(assets);
  it("ranks exact semantic matches", () => expect(index.query({ q: "longevity" })[0].id).toBe("1"));
  it("tolerates minor typos", () => expect(index.query({ q: "biomarkrs" })[0].id).toBe("1"));
  it("synchronizes multiple filter dimensions", () => expect(index.query({ division: "quantum-ledger", orientation: "portrait", visibility: "public" }).map((item) => item.id)).toEqual(["2"]));
  it("supports audited stock collections without leaking them into division pages", () => {
    expect(index.query({ classification: "general-stock" }).map((item) => item.id)).toEqual(["3"]);
    expect(index.query({ division: "collective-ai-inc" }).map((item) => item.id)).not.toContain("3");
  });
  it("rejects unrelated fuzzy results", () => expect(index.query({ q: "volcanic cooking" })).toEqual([]));
  it("produces a stronger exact score than a distant match", () => expect(fuzzyScore("ledger", "ledger")).toBeGreaterThan(fuzzyScore("ledger", "biomarkers")));
});
