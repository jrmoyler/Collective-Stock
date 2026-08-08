import path from "node:path";
import { ROOT, readJson, writeJson } from "./lib/asset-utils.js";

const source = await readJson(path.join(ROOT, "assets/manifests/division-source.json"), { divisions: [] });
const parent = {
  number: "00",
  order: 0,
  slug: "collective-ai-inc",
  name: "Collective AI Inc",
  subtitle: "Parent Company & Venture Studio",
  description: "A humane technology ecosystem coordinating twenty distinct divisions through one shared intelligence, governance, and design foundation.",
  persona: "Cinematic restraint, systems authority, and legible intelligence.",
  tagline: "Architecting a Humane Future.",
  background: "#050A18",
  surface: "#0D1326",
  accent: "#D4A843",
  secondary: "#00D9B5",
  logoPath: null,
  sourceOfTruth: "Collective AI Design System Bible v3 and parent division skill"
};
const divisions = (source.divisions || []).map((division) => ({
  number: String(division.order).padStart(2, "0"),
  order: division.order,
  slug: division.slug,
  name: division.name,
  subtitle: division.subtitle,
  description: division.role,
  persona: division.persona,
  tagline: division.tagline,
  launch: division.launch,
  background: division.palette?.background,
  surface: division.palette?.surface,
  accent: division.palette?.primary,
  secondary: division.palette?.secondary,
  logoPath: `/assets/logos/gallery-${String(division.order).padStart(2, "0")}-${division.slug}.png`,
  logoDescription: division.logo?.mark,
  products: division.currentFlagships || [],
  sourceOfTruth: division.sourceOfTruth
}));
await writeJson(path.join(ROOT, "assets/manifests/divisions.json"), [parent, ...divisions]);
console.log(`Generated parent plus ${divisions.length} division records from the authoritative brand extraction.`);
