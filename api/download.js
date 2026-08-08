import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const manifestPath = path.join(process.cwd(), "assets/manifests/asset-manifest.json");
let cachedManifest;

async function manifest() {
  if (!cachedManifest) cachedManifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  return cachedManifest;
}

function validSignedToken(token, assetId) {
  const secret = process.env.PRIVATE_DOWNLOAD_SECRET;
  if (!secret || !token) return false;
  const [payloadPart, signature] = String(token).split(".");
  if (!payloadPart || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payloadPart).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return payload.assetId === assetId && payload.exp > Math.floor(Date.now() / 1000) && typeof payload.sub === "string";
  } catch { return false; }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const id = String(request.query?.id || "");
  const data = await manifest();
  const asset = data.assets.find((item) => item.id === id);
  if (!asset) return response.status(404).json({ error: "Asset not found" });
  const bearer = String(request.headers.authorization || "").match(/^Bearer\s+(.+)$/i)?.[1];
  const cookie = String(request.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("collective_download_token="))?.split("=").slice(1).join("=");
  const token = request.headers["x-collective-download-token"] || bearer || (cookie ? decodeURIComponent(cookie) : "");
  if (asset.visibility !== "public" && !validSignedToken(token, asset.id)) return response.status(401).json({ error: "Authenticated signed access required" });
  const relative = String(asset.originalDownloadPath || "").replace(/^\//, "");
  const absolute = path.resolve(process.cwd(), relative);
  const allowedRoots = ["assets/originals", "assets/video"].map((directory) => path.resolve(process.cwd(), directory));
  if (!allowedRoots.some((root) => absolute.startsWith(`${root}${path.sep}`))) return response.status(403).json({ error: "Invalid download target" });
  try { await fsp.access(absolute); } catch { return response.status(404).json({ error: "Original file unavailable" }); }
  response.setHeader("Content-Type", asset.mimeType || "application/octet-stream");
  response.setHeader("Content-Disposition", `attachment; filename="${String(asset.originalFilename).replace(/["\r\n]/g, "")}"`);
  return fs.createReadStream(absolute).pipe(response);
}
