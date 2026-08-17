# Collective Stock remote MCP server

Collective Stock exposes a public, read-only Model Context Protocol endpoint at:

```text
https://collective-stock.vercel.app/api/mcp
```

The endpoint uses stateless Streamable HTTP over HTTPS. It can be connected to ChatGPT, Claude, Claude Code, the OpenAI Responses API, the Anthropic Messages API, and other MCP clients. It never requires an OpenAI or Anthropic API key; the client is connecting to Collective Stock, not proxying through a model provider.

## Available tools

| Tool | Purpose |
|---|---|
| `search` | Natural-language asset discovery with citable asset-page URLs. Its request and response schema follows OpenAI's `search` compatibility contract. |
| `fetch` | Full citable asset metadata after search. Its response follows OpenAI's `fetch` compatibility contract. |
| `list_assets` | Exact filters for division, category, media type, orientation, limit, and cursor. |
| `get_asset` | Absolute delivery URLs, dimensions, alt text, dominant colors, rights, and HTML/Markdown/React/CSS integration snippets. |
| `get_brand_kit` | Division palette, logo, positioning, collection URL, reference sheet, and component sheet. |

All tools declare the MCP `readOnlyHint`, `destructiveHint: false`, and `idempotentHint` annotations. The server also exposes `collective-stock://catalog` and `collective-stock://divisions` resources for clients that support MCP resources.

## Connect ChatGPT

1. In ChatGPT on the web, open **Settings → Security and login** and turn on **Developer mode**.
2. Open **Plugins**, select **+**, and create a developer-mode app.
3. Choose a public endpoint with no authentication and enter `https://collective-stock.vercel.app/api/mcp`.
4. Refresh the discovered tools when the server changes.
5. In a conversation, enable Developer mode and select Collective Stock.

ChatGPT currently supports remote MCP over SSE and Streamable HTTP. Collective Stock uses Streamable HTTP. The `search` and `fetch` tools also make the archive compatible with ChatGPT research and citation workflows.

Official references:

- [OpenAI: Building MCP servers](https://developers.openai.com/api/docs/mcp)
- [OpenAI: ChatGPT developer mode](https://developers.openai.com/api/docs/guides/developer-mode)

## Connect Claude

1. Open **Customize → Connectors**.
2. Select **+ → Add custom connector**.
3. Name the connector **Collective Stock**.
4. Enter `https://collective-stock.vercel.app/api/mcp` and finish setup.
5. Enable Collective Stock from the connector menu in a conversation.

For Team and Enterprise organizations, an Owner or Primary Owner must add the connector in organization settings first. Claude connects from Anthropic's cloud infrastructure, so the endpoint must remain publicly reachable.

Official reference: [Anthropic: custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

## Connect Claude Code

```bash
claude mcp add --transport http collective-stock https://collective-stock.vercel.app/api/mcp
```

Then run `/mcp` in Claude Code to inspect the server and its tools.

## Generic client configuration

```json
{
  "mcpServers": {
    "collective-stock": {
      "type": "streamable-http",
      "url": "https://collective-stock.vercel.app/api/mcp"
    }
  }
}
```

## Protocol smoke test

```bash
curl -sS https://collective-stock.vercel.app/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'
```

List tools:

```bash
curl -sS https://collective-stock.vercel.app/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## Rights and security boundary

The MCP endpoint only reads records with `visibility: public`, then passes them through the same `publicAssetRecord` allowlist used by the web application. Public tool output excludes source paths, source filenames, prompts, provenance, content hashes, perceptual hashes, private source URLs, and generation metadata.

`get_asset` returns the highest appropriate approved rendition or muted video preview. It reports when the original is protected and supplies the existing `/api/download` URL without bypassing its signed-token check. No MCP tool writes, deletes, uploads, or modifies assets.

If private or write-capable MCP tools are added later, implement MCP-compliant OAuth 2.1 with protected-resource metadata. Do not replace this boundary with a shared secret embedded in a client-side page.
