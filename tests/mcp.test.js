import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { MCP_TOOLS, callTool, processMcpMessage } from "../src/server/mcp-catalog.js";
import mcpHandler from "../api/mcp.js";
import { PUBLIC_FORBIDDEN_FIELDS } from "../src/data/public-asset.js";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/manifests/asset-manifest.json"), "utf8"));
const divisions = JSON.parse(fs.readFileSync(path.join(root, "assets/manifests/divisions.json"), "utf8"));
const origin = "https://collective-stock.vercel.app";

function responseMock() {
  return {
    headers: new Map(), statusCode: 200, payload: undefined, ended: false,
    setHeader(name, value) { this.headers.set(name.toLowerCase(), value); },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
    end() { this.ended = true; return this; }
  };
}

describe("Collective Stock remote MCP contract", () => {
  it("negotiates Streamable HTTP initialization with read-only capabilities", () => {
    const response = processMcpMessage({
      message: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } },
      manifest, divisions, origin
    });
    expect(response.status).toBe(200);
    expect(response.body.result.protocolVersion).toBe("2025-06-18");
    expect(response.body.result.capabilities).toHaveProperty("tools");
    expect(response.body.result.serverInfo.name).toBe("collective-stock");
  });

  it("publishes the complete five-tool read-only surface", () => {
    expect(MCP_TOOLS.map((tool) => tool.name)).toEqual(["search", "fetch", "list_assets", "get_asset", "get_brand_kit"]);
    MCP_TOOLS.forEach((tool) => {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, idempotentHint: true });
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.outputSchema.type).toBe("object");
    });
  });

  it("implements OpenAI-compatible search and fetch with citable URLs", () => {
    const search = callTool({ name: "search", args: { query: "Animus Prime industrial mech" }, manifest, divisions, origin });
    expect(search.isError).not.toBe(true);
    expect(search.structuredContent.results.length).toBeGreaterThan(0);
    expect(search.structuredContent.results[0]).toMatchObject({ id: expect.stringMatching(/^cstk_/), url: expect.stringMatching(/^https:\/\/collective-stock\.vercel\.app\/assets\/cstk_/) });
    expect(JSON.parse(search.content[0].text)).toEqual(search.structuredContent);

    const fetchResult = callTool({ name: "fetch", args: { id: search.structuredContent.results[0].id }, manifest, divisions, origin });
    expect(fetchResult.structuredContent).toMatchObject({ id: search.structuredContent.results[0].id, url: expect.stringContaining("/assets/"), metadata: { delivery: { url: expect.stringMatching(/^https:/) } } });
  });

  it("returns integration-ready public URLs without private manifest fields", () => {
    const asset = manifest.assets.find((item) => item.visibility === "public" && item.mediaType === "image");
    const result = callTool({ name: "get_asset", args: { id: asset.id, rendition: "large", format: "webp" }, manifest, divisions, origin });
    const output = result.structuredContent;
    expect(output.delivery.url).toMatch(/^https:\/\/collective-stock\.vercel\.app\/assets\/optimized\/.+\.(webp|jpg|avif)$/);
    expect(output.integration_snippets.html).toContain(output.delivery.url);
    expect(output.rights.original_download_authorization).toBe("authenticated");
    const serialized = JSON.stringify(output);
    PUBLIC_FORBIDDEN_FIELDS.forEach((field) => expect(serialized).not.toContain(`"${field}"`));
  });

  it("filters paginated lists and returns authoritative division brand kits", () => {
    const list = callTool({ name: "list_assets", args: { division: "Civic Core", media_type: "image", orientation: "landscape", limit: 3 }, manifest, divisions, origin });
    expect(list.structuredContent.assets).toHaveLength(3);
    expect(list.structuredContent.assets.every((asset) => asset.division === "Civic Core" && asset.media_type === "image" && asset.orientation === "landscape")).toBe(true);

    const kit = callTool({ name: "get_brand_kit", args: { division: "obsidian-arc" }, manifest, divisions, origin });
    expect(kit.structuredContent).toMatchObject({
      name: "Obsidian Arc",
      slug: "obsidian-arc",
      palette: { background: expect.stringMatching(/^#/), accent: expect.stringMatching(/^#/) },
      collection_url: `${origin}/divisions/obsidian-arc`
    });
    expect(kit.structuredContent.reference_asset?.delivery_url).toMatch(/^https:/);
    expect(kit.structuredContent.component_asset?.delivery_url).toMatch(/^https:/);
  });

  it("rejects malformed requests and unknown tools without exposing internals", () => {
    const malformed = processMcpMessage({ message: { id: 1, method: "tools/list" }, manifest, divisions, origin });
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe(-32600);
    const unknown = callTool({ name: "delete_asset", args: {}, manifest, divisions, origin });
    expect(unknown).toMatchObject({ isError: true });
  });

  it("serves the Vercel endpoint with protocol and cross-client headers", async () => {
    const response = responseMock();
    await mcpHandler({
      method: "POST",
      headers: { host: "collective-stock.vercel.app", "x-forwarded-proto": "https", accept: "application/json, text/event-stream" },
      body: { jsonrpc: "2.0", id: "tools", method: "tools/list", params: {} }
    }, response);
    expect(response.statusCode).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("mcp-protocol-version")).toBe("2025-06-18");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.payload.result.tools).toHaveLength(5);
  });
});
