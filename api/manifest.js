import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { publicAssetRecord, publicProvenanceRecord } from "../src/data/public-asset.js";

const load = (filename, fallback) => fsp.readFile(path.join(process.cwd(), "assets/manifests", filename), "utf8").then(JSON.parse).catch(() => fallback);

function validLibraryToken(token) {
  const secret = process.env.PRIVATE_DOWNLOAD_SECRET;
  if (!secret || !token) return false;
  const [payloadPart, signature] = String(token).split(".");
  if (!payloadPart || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payloadPart).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return payload.role === "internal" && payload.exp > Math.floor(Date.now() / 1000) && typeof payload.sub === "string";
  } catch { return false; }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Vary", "Cookie, Authorization");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const token = request.headers["x-collective-library-token"] || request.cookies?.collective_library_token;
  const internal = validLibraryToken(token);
  const [manifest, divisions, provenance, audit] = await Promise.all([
    load("asset-manifest.json", { assets: [] }), load("divisions.json", []), load("source-provenance.json", { occurrences: [] }), load("audit-summary.json", {})
  ]);
  const assets = internal
    ? manifest.assets
    : manifest.assets.filter((asset) => asset.visibility === "public").map(publicAssetRecord);
  return response.status(200).json({
    ...manifest,
    assets,
    divisions,
    provenance: internal ? provenance : publicProvenanceRecord(provenance),
    audit: internal ? audit : { ...audit, publicAssets: assets.length },
    access: internal ? "internal" : "public"
  });
}
