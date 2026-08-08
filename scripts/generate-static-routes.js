import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, readJson } from "./lib/asset-utils.js";

const origin = "https://collective-stock.vercel.app";
const divisions = await readJson(path.join(ROOT, "assets/manifests/divisions.json"), []);
const manifest = await readJson(path.join(ROOT, "dist/assets/manifests/asset-manifest.json"), { assets: [] });
const collectionNames = {
  "stock-images": "Stock Images", "reference-images": "Reference Images", "hero-images": "Hero Images",
  "website-backgrounds": "Website Backgrounds", "app-backgrounds": "App Backgrounds", "brand-sheets": "Brand Sheets",
  "component-sheets": "Component Sheets", "specification-sheets": "Specification Sheets", "ui-mockups": "UI Mockups",
  "campaigns-advertising": "Campaigns and Advertising", "product-concepts": "Product Concepts", "hardware-concepts": "Hardware Concepts",
  "motion-references": "Motion References", videos: "Videos", "3d-spatial-media": "3D and Spatial Media",
  "recently-added": "Recently Added", featured: "Featured", "alternate-versions": "Alternate Versions", "complete-archive": "Complete Archive", "public-download": "Public Downloads"
};
const htmlEscape = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function withMetadata(template, { title, description, canonical, image = "", fallbackHtml = "" }) {
  const tags = [
    `<link rel="canonical" href="${htmlEscape(`${origin}${canonical}`)}" />`,
    `<meta property="og:title" content="${htmlEscape(title)}" />`,
    `<meta property="og:description" content="${htmlEscape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${htmlEscape(`${origin}${canonical}`)}" />`,
    image ? `<meta property="og:image" content="${htmlEscape(new URL(image, origin).href)}" />` : ""
  ].filter(Boolean).join("\n    ");
  const output = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${htmlEscape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${htmlEscape(description)}" />`)
    .replace("<link rel=\"icon\"", `${tags}\n    <link rel=\"icon\"`);
  return fallbackHtml ? output.replace('<div id="app"></div>', `<div id="app">${fallbackHtml}</div>`) : output;
}

async function writeRoute(directory, slug, template, metadata) {
  const output = path.join(ROOT, "dist", directory, `${slug}.html`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, withMetadata(template, metadata), "utf8");
}

const [divisionTemplate, collectionTemplate, assetTemplate] = await Promise.all([
  fs.readFile(path.join(ROOT, "dist/division.html"), "utf8"),
  fs.readFile(path.join(ROOT, "dist/collections.html"), "utf8"),
  fs.readFile(path.join(ROOT, "dist/asset.html"), "utf8")
]);

for (const division of divisions) {
  await writeRoute("divisions", division.slug, divisionTemplate, {
    title: `${division.name} Stock Media — Collective Stock`,
    description: `Browse the complete ${division.name} media collection, with approved reference imagery, brand sheets, concepts, and revisions.`,
    canonical: `/divisions/${division.slug}`,
    fallbackHtml: `<main id="main-content" class="noscript"><p>Collective AI division</p><h1>${htmlEscape(division.name)}</h1><p>${htmlEscape(division.description || `Browse the ${division.name} media collection.`)}</p><a href="/collections/complete-archive">Browse the complete archive</a></main>`
  });
}
for (const [slug, name] of Object.entries(collectionNames)) {
  await writeRoute("collections", slug, collectionTemplate, {
    title: `${name} — Collective Stock`,
    description: `Browse ${name.toLowerCase()} across the Collective AI Inc media archive.`,
    canonical: `/collections/${slug}`,
    fallbackHtml: `<main id="main-content" class="noscript"><p>Collective Stock collection</p><h1>${htmlEscape(name)}</h1><p>Browse ${htmlEscape(name.toLowerCase())} across the Collective AI Inc media archive.</p><a href="/">Return to Collective Stock</a></main>`
  });
}
for (const asset of manifest.assets.filter((item) => item.visibility === "public")) {
  const image = asset.optimizedRenditions?.find((item) => item.label === "large" && item.format === "webp")?.path || asset.optimizedRenditions?.[0]?.path;
  await writeRoute("assets", asset.id, assetTemplate, {
    title: `${asset.title} — Collective Stock`,
    description: `${asset.title}: ${asset.category} for ${asset.division}. Review dimensions, rights, source metadata, and available renditions.`,
    canonical: `/assets/${asset.id}`,
    image,
    fallbackHtml: `<main id="main-content" class="noscript"><p>${htmlEscape(asset.division)} / ${htmlEscape(asset.category)}</p><h1>${htmlEscape(asset.title)}</h1>${image ? `<img src="${htmlEscape(image)}" alt="${htmlEscape(asset.altText || asset.title)}" width="${asset.width}" height="${asset.height}">` : ""}<p>${htmlEscape(asset.altText || `${asset.title}, ${asset.category} for ${asset.division}.`)}</p><p>${htmlEscape(asset.width)} × ${htmlEscape(asset.height)} · ${htmlEscape(asset.fileFormat?.toUpperCase())} · ${htmlEscape(asset.license?.slug)}</p><a href="/divisions/${htmlEscape(asset.divisionSlug)}">Browse ${htmlEscape(asset.division)}</a></main>`
  });
}
console.log(`Pre-rendered ${divisions.length} divisions, ${Object.keys(collectionNames).length} collections, and ${manifest.assets.length} public asset entry pages.`);
