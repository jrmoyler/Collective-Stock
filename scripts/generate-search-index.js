import path from "node:path";
import { ROOT, readJson, writeJson } from "./lib/asset-utils.js";

const manifest = await readJson(path.join(ROOT, "assets/manifests/asset-manifest.json"), { assets: [] });
const albumMap = await readJson(path.join(ROOT, "assets/manifests/google-photos-album-map.json"), { generatedAt: null });
const documents = manifest.assets.map((asset) => ({
  id: asset.id,
  title: asset.title,
  division: asset.division,
  category: asset.category,
  text: [asset.title, asset.division, asset.category, asset.series, asset.prompt, asset.originalFilename, asset.sourceAlbum, asset.albumIndex, ...(asset.searchKeywords || []), ...(asset.semanticTags || []), ...(asset.intendedUse || []), ...(asset.dominantColors || [])].filter(Boolean).join(" ").toLowerCase()
}));
await writeJson(path.join(ROOT, "assets/manifests/search-index.json"), { schemaVersion: 1, generatedAt: albumMap.generatedAt || manifest.generatedAt, documents });
console.log(`Indexed ${documents.length} assets.`);
