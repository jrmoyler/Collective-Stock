import { stockScope } from "../data/asset-scope.js";

const FIELD_WEIGHTS = {
  title: 12,
  division: 9,
  category: 8,
  semanticTags: 7,
  searchKeywords: 6,
  intendedUse: 5,
  series: 4,
  originalFilename: 4,
  sourceAlbum: 3,
  albumIndex: 2,
  prompt: 3,
  dominantColors: 2
};

function normalize(value = "") {
  return String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9#]+/g, " ").trim();
}

function trigrams(value) {
  const padded = `  ${normalize(value)} `;
  const grams = new Set();
  for (let i = 0; i < padded.length - 2; i += 1) grams.add(padded.slice(i, i + 3));
  return grams;
}

function fuzzyScore(query, candidate) {
  if (!query || !candidate) return 0;
  const q = normalize(query);
  const c = normalize(candidate);
  if (c === q) return 1;
  if (c.startsWith(q)) return 0.92;
  if (c.includes(q)) return 0.82;
  const qg = trigrams(q);
  const cg = trigrams(c);
  let overlap = 0;
  qg.forEach((gram) => { if (cg.has(gram)) overlap += 1; });
  return overlap / Math.max(qg.size, cg.size, 1);
}

function orientation(asset) {
  if (asset.orientation) return asset.orientation;
  if (asset.width === asset.height) return "square";
  return asset.width > asset.height ? "landscape" : "portrait";
}

export class SearchIndex {
  constructor(assets = []) {
    this.assets = assets;
  }

  query(state = {}) {
    const query = normalize(state.q || "");
    const tokens = query.split(" ").filter(Boolean);
    let rows = this.assets.filter((asset) => {
      if (state.division && (asset.divisionSlug !== state.division || stockScope(asset))) return false;
      if (state.classification && asset.classification !== state.classification) return false;
      if (state.category && asset.categorySlug !== state.category) return false;
      if (state.mediaType && asset.mediaType !== state.mediaType) return false;
      if (state.orientation && orientation(asset) !== state.orientation) return false;
      if (state.license && asset.license?.slug !== state.license) return false;
      if (state.visibility && asset.visibility !== state.visibility) return false;
      if (state.downloadAuthorization && asset.downloadAuthorization !== state.downloadAuthorization) return false;
      if (state.format && asset.fileFormat !== state.format) return false;
      if (state.featured === true && !asset.featured) return false;
      if (state.alternate === true && Number(asset.revision || 1) <= 1 && !asset.relatedAssets?.length) return false;
      if (state.sourceAlbum && asset.sourceAlbum !== state.sourceAlbum) return false;
      return true;
    }).map((asset, position) => ({ asset, position, score: this.#score(asset, tokens) }));

    if (query) rows = rows.filter((row) => row.score >= Math.max(2.2, tokens.length * 1.25));
    const sort = state.sort || "featured";
    rows.sort((a, b) => {
      if (query && b.score !== a.score) return b.score - a.score;
      if (sort === "newest") return String(b.asset.generationDate || b.asset.ingestedAt || "").localeCompare(String(a.asset.generationDate || a.asset.ingestedAt || ""));
      if (sort === "title") return a.asset.title.localeCompare(b.asset.title);
      if (sort === "resolution") return (b.asset.width * b.asset.height) - (a.asset.width * a.asset.height);
      if (b.asset.featured !== a.asset.featured) return Number(b.asset.featured) - Number(a.asset.featured);
      return a.position - b.position;
    });
    return rows.map((row) => ({ ...row.asset, _score: row.score }));
  }

  #score(asset, tokens) {
    if (!tokens.length) return asset.featured ? 10 : 1;
    return tokens.reduce((total, token) => {
      const best = Object.entries(FIELD_WEIGHTS).reduce((highest, [field, weight]) => {
        const value = Array.isArray(asset[field]) ? asset[field].join(" ") : asset[field] || "";
        return Math.max(highest, fuzzyScore(token, value) * weight);
      }, 0);
      return total + best;
    }, 0);
  }

  suggestions(query, limit = 6) {
    const normalized = normalize(query);
    if (!normalized) return ["cinematic hero imagery", "brand reference sheets", "motion backgrounds", "division logos", "specification sheets"].slice(0, limit);
    const values = new Set();
    this.query({ q: normalized }).slice(0, 16).forEach((asset) => {
      values.add(asset.title);
      (asset.searchKeywords || []).forEach((keyword) => values.add(keyword));
    });
    return [...values].filter((value) => fuzzyScore(normalized, value) > 0.2).slice(0, limit);
  }

  facets(assets = this.assets) {
    const count = (field, transform = (value) => value) => assets.reduce((acc, asset) => {
      const raw = transform(asset[field], asset);
      const values = Array.isArray(raw) ? raw : [raw];
      values.filter(Boolean).forEach((value) => acc.set(value, (acc.get(value) || 0) + 1));
      return acc;
    }, new Map());
    return {
      division: count("divisionSlug"),
      category: count("categorySlug"),
      classification: count("classification"),
      mediaType: count("mediaType"),
      orientation: count("orientation", (_, asset) => orientation(asset)),
      license: count("license", (value) => value?.slug),
      visibility: count("visibility"),
      format: count("fileFormat")
    };
  }
}

export { normalize, fuzzyScore, orientation };
