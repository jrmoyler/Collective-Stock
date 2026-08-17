import fs from "node:fs/promises";
import path from "node:path";
import { MCP_PROTOCOL_VERSION, MCP_SERVER_VERSION, processMcpMessage } from "../src/server/mcp-catalog.js";

let catalogPromise;

function catalog() {
  if (!catalogPromise) {
    const root = path.join(process.cwd(), "assets/manifests");
    catalogPromise = Promise.all([
      fs.readFile(path.join(root, "asset-manifest.json"), "utf8").then(JSON.parse),
      fs.readFile(path.join(root, "divisions.json"), "utf8").then(JSON.parse)
    ]).then(([manifest, divisions]) => ({ manifest, divisions }));
  }
  return catalogPromise;
}

function requestOrigin(request) {
  const proto = String(request.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(request.headers["x-forwarded-host"] || request.headers.host || "collective-stock.vercel.app").split(",")[0].trim();
  return `${proto}://${host}`;
}

function bodyFrom(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string" && request.body.length <= 1_000_000) return JSON.parse(request.body);
  return null;
}

function commonHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Authorization");
  response.setHeader("Access-Control-Expose-Headers", "MCP-Protocol-Version");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

export default async function handler(request, response) {
  commonHeaders(response);
  if (request.method === "OPTIONS") return response.status(204).end();
  const origin = requestOrigin(request);
  if (request.method === "HEAD") return response.status(200).end();
  if (request.method === "GET") {
    if (String(request.query?.health || "") !== "1") {
      response.setHeader("Allow", "POST, OPTIONS, HEAD");
      return response.status(405).json({ error: "Use POST for Streamable HTTP MCP requests.", endpoint: `${origin}/api/mcp` });
    }
    const { manifest } = await catalog();
    return response.status(200).json({ status: "ok", name: "collective-stock", version: MCP_SERVER_VERSION, protocolVersion: MCP_PROTOCOL_VERSION, publicAssets: manifest.assets.filter((asset) => asset.visibility === "public").length, endpoint: `${origin}/api/mcp` });
  }
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  let message;
  try { message = bodyFrom(request); }
  catch { return response.status(400).json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }
  const { manifest, divisions } = await catalog();
  const result = processMcpMessage({ message, manifest, divisions, origin });
  response.setHeader("MCP-Protocol-Version", result.protocolVersion || request.headers["mcp-protocol-version"] || MCP_PROTOCOL_VERSION);
  if (result.status === 204) return response.status(204).end();
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  return response.status(result.status).json(result.body);
}
