import { el, icon, diamondStar, formatCount } from "../utils/dom.js";

const CLIENTS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    steps: ["Open Settings, then Security and login.", "Turn on Developer mode.", "Open Plugins, select +, and enter the MCP URL.", "Enable Collective Stock from Developer mode in a conversation."],
    note: "No authentication is required for approved public renditions."
  },
  {
    id: "claude",
    name: "Claude",
    steps: ["Open Customize, then Connectors.", "Select +, then Add custom connector.", "Name it Collective Stock and paste the MCP URL.", "Enable it from Connectors in the conversation."],
    note: "The same remote URL works in Claude web, Desktop, Cowork, and mobile."
  },
  {
    id: "claude-code",
    name: "Claude Code",
    steps: ["Open a terminal in your project.", "Run the generated command below.", "Use /mcp to confirm the server and tools are connected."],
    note: "Streamable HTTP is the recommended transport for remote servers."
  },
  {
    id: "other",
    name: "Other clients",
    steps: ["Create a remote MCP server entry.", "Choose Streamable HTTP as the transport.", "Paste the MCP URL and connect.", "Allow the five read-only Collective Stock tools."],
    note: "Works with MCP-compatible agents, IDEs, APIs, and automation platforms."
  }
];

const TOOLS = [
  ["search", "Natural-language discovery", "Find visuals from a creative brief, subject, division, category, or intended use."],
  ["fetch", "Citable asset record", "Retrieve full metadata and an asset-page URL after search."],
  ["list_assets", "Precise catalog filtering", "Filter by division, category, media type, orientation, and pagination."],
  ["get_asset", "Production-ready delivery", "Get the best public rendition, rights, alt text, colors, and embed snippets."],
  ["get_brand_kit", "Division identity context", "Load the authoritative palette, logo, positioning, and reference sheets."],
];

const PROMPTS = [
  "Use Collective Stock to find three cinematic Obsidian Arc landscape images. Pick the strongest one and give me its integration-ready URL.",
  "Get the Civic Core brand kit, then find a matching hero image for a public-service landing page. Use the returned palette and alt text.",
  "Find a portrait image for a Signal Velocity event flyer. Return the selected asset, licensing note, dominant colors, and the highest-resolution public URL.",
  "List eight motion films that can work as premium website backgrounds, then fetch the best three for review."
];

function copyButton(label, getValue, toast, className = "button button--secondary") {
  const button = el("button", { class: className, type: "button" }, [icon("copy"), el("span", { text: label })]);
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getValue());
      const text = button.querySelector("span");
      const original = text.textContent;
      text.textContent = "Copied";
      toast?.show?.("Copied to clipboard");
      setTimeout(() => { text.textContent = original; }, 1600);
    } catch { toast?.show?.("Copy failed — select the text manually"); }
  });
  return button;
}

function clientPanel(client, endpoint, toast) {
  const command = `claude mcp add --transport http collective-stock ${endpoint}`;
  const config = JSON.stringify({ mcpServers: { "collective-stock": { type: "streamable-http", url: endpoint } } }, null, 2);
  const code = client.id === "claude-code" ? command : client.id === "other" ? config : "";
  return el("article", { class: "mcp-client-panel", id: `client-${client.id}`, role: "tabpanel", "aria-labelledby": `tab-${client.id}`, hidden: client.id !== "chatgpt" }, [
    el("div", { class: "mcp-client-panel__intro" }, [el("h3", { text: `Connect ${client.name}` }), el("p", { text: client.note })]),
    el("ol", { class: "mcp-steps" }, client.steps.map((step) => el("li", {}, [el("span", { class: "mono", text: String(client.steps.indexOf(step) + 1).padStart(2, "0") }), el("p", { text: step })]))),
    code ? el("div", { class: "mcp-code-row" }, [el("code", { text: code }), copyButton("Copy", () => code, toast, "icon-button mcp-code-copy")]) : null
  ]);
}

function clientsSection(endpoint, toast) {
  const tabList = el("div", { class: "mcp-client-tabs", role: "tablist", "aria-label": "Connection instructions" });
  const panels = CLIENTS.map((client) => clientPanel(client, endpoint, toast));
  CLIENTS.forEach((client, index) => {
    const tab = el("button", { id: `tab-${client.id}`, class: "mcp-client-tab", type: "button", role: "tab", "aria-controls": `client-${client.id}`, "aria-selected": index === 0 ? "true" : "false", tabindex: index === 0 ? "0" : "-1", text: client.name });
    tab.addEventListener("click", () => {
      [...tabList.children].forEach((item) => { item.setAttribute("aria-selected", String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
      panels.forEach((panel) => { panel.hidden = panel.id !== `client-${client.id}`; });
      tab.focus();
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...tabList.children];
      const current = tabs.indexOf(event.currentTarget);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
    });
    tabList.append(tab);
  });
  return el("section", { class: "mcp-connect", "aria-labelledby": "mcp-connect-title" }, [
    el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label mono", text: "ONE ENDPOINT / FOUR SETUPS" }), el("h2", { id: "mcp-connect-title", text: "Connect your workspace." })])]),
    tabList,
    ...panels
  ]);
}

function endpointConsole(endpoint, assetCount, toast) {
  const statusText = el("span", { text: "Checking endpoint" });
  const status = el("span", { class: "mcp-live-status", role: "status", "aria-live": "polite" }, [el("span", { class: "mcp-live-status__dot", "aria-hidden": "true" }), statusText]);
  const root = el("div", { class: "mcp-endpoint-console" }, [
    el("div", { class: "mcp-endpoint-console__head" }, [el("span", { class: "mono", text: "STREAMABLE HTTP" }), status]),
    el("div", { class: "mcp-endpoint-value" }, [el("code", { text: endpoint }), copyButton("Copy MCP URL", () => endpoint, toast, "button button--primary")]),
    el("div", { class: "mcp-endpoint-meta mono" }, [el("span", { text: `${formatCount(assetCount)} approved public assets` }), el("span", { text: "5 read-only tools" }), el("span", { text: "No API key required" })])
  ]);
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    root.classList.add("is-local");
    statusText.textContent = "Live after Vercel deploy";
    return root;
  }
  fetch(`${endpoint}?health=1`, { headers: { Accept: "application/json" } })
    .then((response) => { if (!response.ok) throw new Error("offline"); return response.json(); })
    .then(() => { root.classList.add("is-live"); statusText.textContent = "Endpoint live"; })
    .catch(() => { root.classList.add("is-local"); statusText.textContent = "Endpoint unavailable"; });
  return root;
}

export function McpPage({ assets = [], toast }) {
  const endpoint = `${location.origin}/api/mcp`;
  const publicAssetCount = assets.filter((asset) => asset.visibility === "public").length;
  return el("main", { id: "main-content", class: "mcp-page" }, [
    el("section", { class: "mcp-hero" }, [
      el("div", { class: "mcp-hero__copy" }, [
        el("p", { class: "detail-kicker mono", text: "COLLECTIVE STOCK / MODEL CONTEXT PROTOCOL" }),
        el("h1", {}, ["Your archive.", el("br"), el("span", { text: "Now callable." })]),
        el("p", { text: "Connect one URL and give Claude, ChatGPT, Codex, and any compatible AI workspace direct access to approved Collective AI imagery, motion, brand kits, and production-ready asset URLs." })
      ]),
      el("div", { class: "mcp-hero__signal", "aria-hidden": "true" }, [diamondStar("mcp-signal-star"), el("span", { class: "mcp-signal-orbit mcp-signal-orbit--one" }), el("span", { class: "mcp-signal-orbit mcp-signal-orbit--two" }), el("span", { class: "mcp-signal-node mcp-signal-node--one" }), el("span", { class: "mcp-signal-node mcp-signal-node--two" }), el("span", { class: "mcp-signal-node mcp-signal-node--three" })])
    ]),
    endpointConsole(endpoint, publicAssetCount, toast),
    clientsSection(endpoint, toast),
    el("section", { class: "mcp-capabilities", "aria-labelledby": "mcp-tools-title" }, [
      el("div", { class: "section-heading" }, [el("div", {}, [el("p", { class: "section-label mono", text: "DISCOVER / RETRIEVE / BUILD" }), el("h2", { id: "mcp-tools-title", text: "Five tools. One visual memory." })]), el("p", { text: "Every tool is read-only, deterministic, and restricted to approved public catalog data." })]),
      el("div", { class: "mcp-tool-table" }, TOOLS.map(([name, label, description], index) => el("article", { class: "mcp-tool-row" }, [el("span", { class: "mono mcp-tool-index", text: String(index + 1).padStart(2, "0") }), el("div", {}, [el("code", { text: name }), el("h3", { text: label })]), el("p", { text: description }), icon("arrow")])) )
    ]),
    el("section", { class: "mcp-prompts", "aria-labelledby": "mcp-prompts-title" }, [
      el("div", { class: "mcp-prompts__intro" }, [el("p", { class: "section-label mono", text: "START WITH INTENT" }), el("h2", { id: "mcp-prompts-title", text: "Ask for the asset. Get the implementation." }), el("p", { text: "The connector can search the archive, apply brand context, select a public rendition, and return code-ready URLs without making a copy of the source library." })]),
      el("div", { class: "mcp-prompt-list" }, PROMPTS.map((prompt, index) => el("article", { class: "mcp-prompt" }, [el("span", { class: "mono", text: `PROMPT ${String(index + 1).padStart(2, "0")}` }), el("p", { text: prompt }), copyButton("Copy prompt", () => prompt, toast, "mcp-prompt__copy")])) )
    ]),
    el("section", { class: "mcp-security", "aria-labelledby": "mcp-security-title" }, [
      el("div", {}, [el("p", { class: "section-label mono", text: "RIGHTS-AWARE BY DESIGN" }), el("h2", { id: "mcp-security-title", text: "Open discovery. Protected originals." })]),
      el("div", { class: "mcp-security__copy" }, [el("p", { text: "The MCP server exposes approved public renditions and non-sensitive metadata only. Source paths, prompts, provenance, hashes, and protected original files never enter the public tool response." }), el("p", { text: "When an original requires authorization, the connector says so and returns the approved public rendition for production use. Future private or write-capable tools should use OAuth 2.1 rather than weakening this boundary." })])
    ])
  ]);
}
