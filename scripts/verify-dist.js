import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ROOT, readJson } from "./lib/asset-utils.js";

const required = ["index.html", "division.html", "asset.html", "collections.html", "audit.html", "divisions/zenflow.html", "collections/complete-archive.html", "assets/manifests/asset-manifest.json", "assets/manifests/divisions.json", "assets/manifests/audit-summary.json"];
const missing = [];
for (const file of required) {
  try { await fs.access(path.join(ROOT, "dist", file)); } catch { missing.push(file); }
}
if (missing.length) throw new Error(`Distribution is incomplete: ${missing.join(", ")}`);
const publicManifest = await readJson(path.join(ROOT, "dist/assets/manifests/asset-manifest.json"), { assets: [] });
for (const asset of publicManifest.assets) {
  for (const rendition of asset.optimizedRenditions || []) {
    try { await fs.access(path.join(ROOT, "dist", rendition.path.replace(/^\//, ""))); }
    catch { missing.push(`${asset.id}: ${rendition.path}`); }
  }
  if (asset.mediaType === "video") {
    if (!asset.previewPath) missing.push(`${asset.id}: missing public video preview path`);
    else {
      try { await fs.access(path.join(ROOT, "dist", asset.previewPath.replace(/^\//, ""))); }
      catch { missing.push(`${asset.id}: ${asset.previewPath}`); }
    }
  }
}
if (missing.length) throw new Error(`Distribution is incomplete: ${missing.join(", ")}`);

// The production CSP allow-lists inline scripts by hash. Editing an inline
// block without updating vercel.json would ship a page whose own structured
// data the browser refuses to parse, so the mismatch fails the build here.
const vercelConfig = await readJson(path.join(ROOT, "vercel.json"), { headers: [] });
const policy = vercelConfig.headers
  ?.flatMap((entry) => entry.headers || [])
  .find((header) => header.key?.toLowerCase() === "content-security-policy")?.value || "";
const allowedHashes = new Set([...policy.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((match) => match[1]));
const inlineScript = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g;
const unhashed = [];
for (const file of required.filter((entry) => entry.endsWith(".html"))) {
  const html = await fs.readFile(path.join(ROOT, "dist", file), "utf8");
  for (const [, body] of html.matchAll(inlineScript)) {
    const hash = `sha256-${crypto.createHash("sha256").update(body, "utf8").digest("base64")}`;
    if (!allowedHashes.has(hash)) unhashed.push(`${file}: ${hash}`);
  }
}
if (unhashed.length) {
  throw new Error(`Inline scripts are not allow-listed by the Content-Security-Policy in vercel.json:\n  ${unhashed.join("\n  ")}`);
}

console.log(`Distribution verified with ${required.length} critical entry points, ${publicManifest.assets.length} public asset records, every public rendition/video preview, and ${allowedHashes.size} CSP-hashed inline script(s).`);
