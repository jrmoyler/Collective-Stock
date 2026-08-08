import fs from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./lib/asset-utils.js";

const required = ["index.html", "division.html", "asset.html", "collections.html", "audit.html", "divisions/zenflow.html", "collections/complete-archive.html", "assets/manifests/asset-manifest.json", "assets/manifests/divisions.json", "assets/manifests/audit-summary.json"];
const missing = [];
for (const file of required) {
  try { await fs.access(path.join(ROOT, "dist", file)); } catch { missing.push(file); }
}
if (missing.length) throw new Error(`Distribution is incomplete: ${missing.join(", ")}`);
console.log(`Distribution verified with ${required.length} critical entry points.`);
