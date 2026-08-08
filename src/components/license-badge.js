import { el, icon } from "../utils/dom.js";
import { getLicense } from "../licensing/license-definitions.js";

export function LicenseBadge(asset, { full = false } = {}) {
  const license = getLicense(asset.license?.slug);
  return el("span", { class: `license-badge ${license.private ? "is-private" : "is-public"}`, title: license.name }, [icon(license.private ? "lock" : "globe"), el("span", { text: full ? license.name : license.short })]);
}
