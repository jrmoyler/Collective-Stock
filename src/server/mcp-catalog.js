import { publicAssetRecord } from "../data/public-asset.js";

export const MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_SERVER_VERSION = "1.0.0";

const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2025-06-18",
  "2025-03-26",
  "2024-11-05"
]);

const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const ASSET_SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "url"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    url: { type: "string", format: "uri" },
    media_type: { type: "string", enum: ["image", "video"] },
    division: { type: "string" },
    category: { type: "string" },
    orientation: { type: "string" },
    delivery_url: { type: "string", format: "uri" }
  }
};

export const MCP_TOOLS = [
  {
    name: "search",
    title: "Search Collective Stock",
    description: "Use this when you need to find Collective Stock assets by subject, visual direction, division, category, intended use, or natural-language creative brief. Returns citable asset pages. Call fetch or get_asset with a returned ID for complete metadata and delivery URLs.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: { query: { type: "string", minLength: 1, description: "Natural-language asset search, for example: 'cinematic Civic Core city background'." } }
    },
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["results"],
      properties: { results: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "title", "url"], properties: { id: { type: "string" }, title: { type: "string" }, url: { type: "string", format: "uri" } } } } }
    },
    annotations: TOOL_ANNOTATIONS
  },
  {
    name: "fetch",
    title: "Fetch an asset record",
    description: "Use this after search to retrieve the complete citable record for one Collective Stock asset, including rights, creative metadata, and the best public delivery URL.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id"],
      properties: { id: { type: "string", minLength: 1, description: "The cstk_ asset ID returned by search." } }
    },
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title", "text", "url"],
      properties: {
        id: { type: "string" }, title: { type: "string" }, text: { type: "string" }, url: { type: "string", format: "uri" }, metadata: { type: "object" }
      }
    },
    annotations: TOOL_ANNOTATIONS
  },
  {
    name: "list_assets",
    title: "List and filter assets",
    description: "Use this to browse a controlled page of Collective Stock media with exact filters. Best for requests such as 'show 12 portrait images from Vital Helix' or 'list motion films'.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", description: "Optional natural-language or keyword query." },
        division: { type: "string", description: "Optional division name or slug." },
        category: { type: "string", description: "Optional category name or slug." },
        media_type: { type: "string", enum: ["image", "video"] },
        orientation: { type: "string", enum: ["landscape", "portrait", "square"] },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 12 },
        cursor: { type: "string", description: "Opaque cursor returned by the previous list_assets call." }
      }
    },
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["assets", "total", "next_cursor"],
      properties: {
        assets: { type: "array", items: ASSET_SUMMARY_SCHEMA }, total: { type: "integer" }, next_cursor: { type: ["string", "null"] }
      }
    },
    annotations: TOOL_ANNOTATIONS
  },
  {
    name: "get_asset",
    title: "Get an integration-ready asset",
    description: "Use this when placing a selected asset into a flyer, website, app, social post, presentation, or design workflow. Returns absolute delivery URLs, dimensions, alt text, palette, rights, and ready-to-use HTML, Markdown, React, and CSS snippets. Public renditions are directly retrievable; protected originals remain rights-gated.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id"],
      properties: {
        id: { type: "string", minLength: 1, description: "The cstk_ asset ID." },
        rendition: { type: "string", enum: ["auto", "large", "card", "thumbnail", "preview"], default: "auto", description: "Preferred public rendition. Auto selects a large image or muted video preview." },
        format: { type: "string", enum: ["auto", "webp", "avif", "jpg"], default: "auto", description: "Preferred image format when available." }
      }
    },
    outputSchema: { type: "object" },
    annotations: TOOL_ANNOTATIONS
  },
  {
    name: "get_brand_kit",
    title: "Get a division brand kit",
    description: "Use this before creating division-specific flyers, websites, apps, or campaigns. Returns the authoritative palette, positioning, logo URL, and matching reference/component assets for one Collective AI division or the parent company.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["division"],
      properties: { division: { type: "string", minLength: 1, description: "Division name or slug, for example 'Obsidian Arc' or 'obsidian-arc'." } }
    },
    outputSchema: { type: "object" },
    annotations: TOOL_ANNOTATIONS
  }
];

function absoluteUrl(value, origin) {
  if (!value) return null;
  return new URL(value, `${origin}/`).href;
}

function normalize(value = "") {
  return String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function slug(value = "") {
  return normalize(value).replaceAll(" ", "-");
}

function publicAssets(manifest = {}) {
  return (manifest.assets || []).filter((asset) => asset.visibility === "public").map(publicAssetRecord);
}

function assetSearchText(asset) {
  return normalize([
    asset.id, asset.title, asset.description, asset.division, asset.divisionSlug,
    asset.classification, asset.mediaType, asset.category, asset.categorySlug,
    asset.series, asset.orientation, ...(asset.searchKeywords || []),
    ...(asset.semanticTags || []), ...(asset.intendedUse || [])
  ].join(" "));
}

function searchScore(asset, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 1;
  const stopwords = new Set(["a", "an", "and", "for", "from", "in", "of", "or", "the", "to", "with"]);
  const tokens = normalizedQuery.split(/\s+/).filter((token) => token && !stopwords.has(token));
  const title = normalize(asset.title);
  const division = normalize(asset.division);
  const category = normalize(asset.category);
  const haystack = assetSearchText(asset);
  let score = 0;
  if (normalize(asset.id) === normalizedQuery) score += 500;
  if (title === normalizedQuery) score += 180;
  if (title.includes(normalizedQuery)) score += 90;
  if (division === normalizedQuery || slug(asset.division) === slug(query)) score += 70;
  if (category === normalizedQuery || slug(asset.category) === slug(query)) score += 50;
  let matches = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) matches += 1;
    if (title.includes(token)) score += 20;
    else if (division.includes(token)) score += 14;
    else if (category.includes(token)) score += 10;
    else if (haystack.includes(token)) score += 4;
  }
  if (tokens.length && matches < Math.max(1, Math.ceil(tokens.length * .4))) return 0;
  if (asset.featured) score += 2;
  return score;
}

function rankedAssets(assets, query = "") {
  return assets
    .map((asset, index) => ({ asset, index, score: searchScore(asset, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.asset.featured) - Number(a.asset.featured) || a.index - b.index)
    .map(({ asset }) => asset);
}

function findAsset(manifest, id) {
  const wanted = String(id || "");
  return publicAssets(manifest).find((asset) => asset.id === wanted || asset.slug === wanted);
}

function preferredImageRendition(asset, rendition = "auto", format = "auto") {
  const renditions = asset.optimizedRenditions || [];
  const wantedLabel = rendition === "auto" || rendition === "preview" ? "large" : rendition;
  const labelMatches = renditions.filter((item) => item.label === wantedLabel);
  const pool = labelMatches.length ? labelMatches : renditions;
  if (!pool.length) return null;
  const formats = format === "auto" ? ["webp", "jpg", "avif"] : [format, "webp", "jpg", "avif"];
  return [...pool].sort((a, b) => (b.width || 0) - (a.width || 0) || formats.indexOf(a.format) - formats.indexOf(b.format))[0];
}

function deliveryFor(asset, origin, rendition = "auto", format = "auto") {
  if (asset.mediaType === "video") {
    return {
      kind: "muted-preview",
      url: absoluteUrl(asset.previewPath || asset.posterPath, origin),
      mime_type: asset.previewPath ? "video/mp4" : "image/svg+xml",
      width: asset.width,
      height: asset.height,
      original_requires_authorization: asset.downloadAuthorization !== "public"
    };
  }
  const selected = preferredImageRendition(asset, rendition, format);
  return {
    kind: selected?.label || "public-rendition",
    url: absoluteUrl(selected?.path, origin),
    mime_type: selected ? `image/${selected.format === "jpg" ? "jpeg" : selected.format}` : asset.mimeType,
    width: selected?.width || asset.width,
    height: selected?.width ? Math.round(selected.width * asset.height / asset.width) : asset.height,
    original_requires_authorization: asset.downloadAuthorization !== "public"
  };
}

function assetPage(asset, origin) {
  return `${origin}/assets/${encodeURIComponent(asset.id)}`;
}

function summarize(asset, origin) {
  return {
    id: asset.id,
    title: asset.title,
    url: assetPage(asset, origin),
    media_type: asset.mediaType,
    division: asset.division,
    category: asset.category,
    orientation: asset.orientation,
    delivery_url: deliveryFor(asset, origin).url
  };
}

function integrationSnippets(asset, delivery) {
  if (!delivery.url) return {};
  if (asset.mediaType === "video") {
    return {
      html: `<video src="${delivery.url}" poster="" muted loop playsinline></video>`,
      markdown: `[${asset.title}](${delivery.url})`,
      react: `<video src="${delivery.url}" aria-label="${asset.altText}" muted loop playsInline />`
    };
  }
  const alt = String(asset.altText || asset.title).replaceAll('"', "&quot;");
  return {
    html: `<img src="${delivery.url}" alt="${alt}" loading="lazy">`,
    markdown: `![${asset.altText || asset.title}](${delivery.url})`,
    react: `<img src="${delivery.url}" alt="${alt}" loading="lazy" />`,
    css_background: `background-image: url("${delivery.url}");`
  };
}

function fullAsset(asset, origin, rendition = "auto", format = "auto") {
  const delivery = deliveryFor(asset, origin, rendition, format);
  return {
    id: asset.id,
    title: asset.title,
    description: asset.description,
    asset_page_url: assetPage(asset, origin),
    delivery,
    media: {
      type: asset.mediaType,
      mime_type: asset.mimeType,
      width: asset.width,
      height: asset.height,
      aspect_ratio: asset.aspectRatio,
      orientation: asset.orientation,
      duration_seconds: asset.duration || null
    },
    creative: {
      division: asset.division,
      category: asset.category,
      series: asset.series,
      alt_text: asset.altText,
      dominant_colors: asset.dominantColors || [],
      focal_point: asset.focalPoint,
      keywords: asset.searchKeywords || [],
      intended_use: asset.intendedUse || []
    },
    rights: {
      license: asset.license?.slug || "unspecified",
      visibility: asset.visibility,
      approval_status: asset.approvalStatus,
      public_rendition_retrievable: Boolean(delivery.url),
      original_download_authorization: asset.downloadAuthorization,
      original_download_url: `${origin}/api/download?id=${encodeURIComponent(asset.id)}`
    },
    integration_snippets: integrationSnippets(asset, delivery)
  };
}

function textResult(value) {
  return { structuredContent: value, content: [{ type: "text", text: JSON.stringify(value) }] };
}

function toolError(message) {
  return { isError: true, content: [{ type: "text", text: message }] };
}

function decodeCursor(cursor) {
  if (!cursor) return 0;
  try {
    const value = Number.parseInt(Buffer.from(String(cursor), "base64url").toString("utf8"), 10);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}

function encodeCursor(value) {
  return Buffer.from(String(value), "utf8").toString("base64url");
}

export function callTool({ name, args = {}, manifest, divisions = [], origin }) {
  const assets = publicAssets(manifest);
  if (name === "search") {
    if (typeof args.query !== "string" || !args.query.trim()) return toolError("query must be a non-empty string");
    const results = rankedAssets(assets, args.query).slice(0, 20).map((asset) => ({ id: asset.id, title: asset.title, url: assetPage(asset, origin) }));
    return textResult({ results });
  }
  if (name === "fetch") {
    const asset = findAsset(manifest, args.id);
    if (!asset) return toolError(`Public asset not found: ${String(args.id || "")}`);
    const detail = fullAsset(asset, origin);
    return textResult({
      id: asset.id,
      title: asset.title,
      text: `${asset.description}\n\nDivision: ${asset.division}\nCategory: ${asset.category}\nMedia: ${asset.mediaType}, ${asset.width} × ${asset.height}, ${asset.orientation}\nIntended use: ${(asset.intendedUse || []).join(", ")}\nLicense: ${asset.license?.slug || "unspecified"}\nPublic delivery URL: ${detail.delivery.url || "Unavailable"}`,
      url: detail.asset_page_url,
      metadata: detail
    });
  }
  if (name === "list_assets") {
    const limit = Math.min(50, Math.max(1, Number.parseInt(args.limit, 10) || 12));
    const divisionToken = slug(args.division);
    const categoryToken = slug(args.category);
    let filtered = rankedAssets(assets, args.query || "");
    if (divisionToken) filtered = filtered.filter((asset) => asset.divisionSlug === divisionToken || slug(asset.division) === divisionToken);
    if (categoryToken) filtered = filtered.filter((asset) => asset.categorySlug === categoryToken || slug(asset.category) === categoryToken);
    if (args.media_type) filtered = filtered.filter((asset) => asset.mediaType === args.media_type);
    if (args.orientation) filtered = filtered.filter((asset) => asset.orientation === args.orientation);
    const offset = decodeCursor(args.cursor);
    const page = filtered.slice(offset, offset + limit);
    return textResult({
      assets: page.map((asset) => summarize(asset, origin)),
      total: filtered.length,
      next_cursor: offset + page.length < filtered.length ? encodeCursor(offset + page.length) : null
    });
  }
  if (name === "get_asset") {
    const asset = findAsset(manifest, args.id);
    if (!asset) return toolError(`Public asset not found: ${String(args.id || "")}`);
    return textResult(fullAsset(asset, origin, args.rendition, args.format));
  }
  if (name === "get_brand_kit") {
    const token = slug(args.division);
    const division = divisions.find((item) => item.slug === token || slug(item.name) === token);
    if (!division) return toolError(`Division not found: ${String(args.division || "")}`);
    const matches = assets.filter((asset) => asset.divisionSlug === division.slug);
    const reference = matches.find((asset) => asset.categorySlug === "reference-images");
    const component = matches.find((asset) => asset.categorySlug === "component-sheets");
    return textResult({
      slug: division.slug,
      name: division.name,
      subtitle: division.subtitle,
      description: division.description,
      persona: division.persona,
      tagline: division.tagline,
      palette: { background: division.background, surface: division.surface, accent: division.accent, secondary: division.secondary },
      logo_url: absoluteUrl(division.logoPath, origin),
      collection_url: `${origin}/divisions/${division.slug}`,
      reference_asset: reference ? summarize(reference, origin) : null,
      component_asset: component ? summarize(component, origin) : null
    });
  }
  return toolError(`Unknown tool: ${String(name || "")}`);
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message, data) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

export function processMcpMessage({ message, manifest, divisions = [], origin }) {
  if (!message || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return { status: 400, body: jsonRpcError(message?.id, -32600, "Invalid Request") };
  }
  if (message.id === undefined) return { status: 204, body: null };
  if (message.method === "initialize") {
    const requested = message.params?.protocolVersion;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.has(requested) ? requested : MCP_PROTOCOL_VERSION;
    return {
      status: 200,
      protocolVersion,
      body: jsonRpcResult(message.id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false } },
        serverInfo: { name: "collective-stock", title: "Collective Stock", version: MCP_SERVER_VERSION, websiteUrl: `${origin}/mcp` },
        instructions: "Collective Stock provides approved public media for creative production. Search first, then call get_asset for a direct public rendition URL and integration snippets. Use get_brand_kit before division-specific work. Respect the returned license and alt text. Originals marked authenticated remain protected; use the public delivery URL unless the user has separate download authorization."
      })
    };
  }
  if (message.method === "ping") return { status: 200, body: jsonRpcResult(message.id, {}) };
  if (message.method === "tools/list") return { status: 200, body: jsonRpcResult(message.id, { tools: MCP_TOOLS }) };
  if (message.method === "tools/call") {
    const name = message.params?.name;
    if (typeof name !== "string") return { status: 400, body: jsonRpcError(message.id, -32602, "Invalid params", "tools/call requires params.name") };
    return { status: 200, body: jsonRpcResult(message.id, callTool({ name, args: message.params?.arguments || {}, manifest, divisions, origin })) };
  }
  if (message.method === "resources/list") {
    return { status: 200, body: jsonRpcResult(message.id, { resources: [
      { uri: "collective-stock://catalog", name: "Collective Stock public catalog", description: "Public asset catalog summary and available MCP tools.", mimeType: "application/json" },
      { uri: "collective-stock://divisions", name: "Collective AI division directory", description: "Authoritative public identity data for the parent company and twenty divisions.", mimeType: "application/json" }
    ] }) };
  }
  if (message.method === "resources/read") {
    const uri = message.params?.uri;
    const data = uri === "collective-stock://catalog"
      ? { asset_count: publicAssets(manifest).length, endpoint: `${origin}/api/mcp`, tools: MCP_TOOLS.map(({ name, description }) => ({ name, description })) }
      : uri === "collective-stock://divisions"
        ? divisions.map(({ sourceOfTruth: _sourceOfTruth, products: _products, ...division }) => division)
        : null;
    if (!data) return { status: 200, body: jsonRpcError(message.id, -32002, "Resource not found", uri) };
    return { status: 200, body: jsonRpcResult(message.id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data) }] }) };
  }
  return { status: 200, body: jsonRpcError(message.id, -32601, "Method not found", message.method) };
}
