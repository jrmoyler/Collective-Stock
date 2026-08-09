import { el, formatCount, icon } from "../utils/dom.js";
import { collectionRoute } from "../utils/routes.js";

const ROWS = [
  ["Files discovered", "totalFilesDiscovered"],
  ["Unique assets ingested", "totalUniqueAssetsIngested"],
  ["Original occurrences", "totalOriginalOccurrences"],
  ["Assigned division assets", "assignedToDivisions"],
  ["Parent-brand assets", "parentBrandAssets"],
  ["Cross-division assets", "crossDivisionAssets"],
  ["Exact duplicate files", "exactDuplicates"],
  ["Revisions and variants", "revisionsAndVariants"],
  ["Missing or inaccessible outputs", "missingOrInaccessible"],
  ["Broken assets", "brokenAssets"],
  ["Unassigned assets", "unassignedAssets"]
];

export function AuditPage({ audit = {}, assets = [] }) {
  const missing = Number(audit.missingOrInaccessible || 0);
  const generated = audit.generatedAt ? new Date(audit.generatedAt).toLocaleString() : "Build time unavailable";
  return el("main", { id: "main-content", class: "audit-page" }, [
    el("header", { class: "audit-hero" }, [
      el("p", { class: "detail-kicker mono", text: "COLLECTIVE STOCK / TRANSPARENT RECONCILIATION" }),
      el("h1", { text: "Nothing hidden. Nothing substituted." }),
      el("p", { text: "This public summary separates files actually available to the build from requested historical project outputs that the current workspace cannot access. The internal archive retains the precise source ledger without exposing private prompts or file paths." }),
      el("div", { class: `audit-status ${missing ? "is-blocked" : "is-clear"}` }, [
        icon(missing ? "alert" : "check"),
        el("strong", { text: missing ? `${formatCount(missing)} source archive${missing === 1 ? "" : "s"} remain${missing === 1 ? "s" : ""} inaccessible` : "Zero missing or inaccessible outputs" }),
        el("span", { text: missing ? "Zero-omission completion remains blocked." : "The zero-omission gate is clear." })
      ]),
      missing && audit.missingSourceName ? el("div", { class: "audit-source-blocker" }, [
        el("strong", { text: audit.missingSourceName }),
        el("p", { text: audit.missingSourceReason || "This source could not be retrieved by the current provider." })
      ]) : null
    ]),
    el("section", { class: "audit-reconciliation", "aria-labelledby": "audit-table-heading" }, [
      el("div", { class: "section-heading" }, [
        el("div", {}, [el("p", { class: "section-label mono", text: `MANIFEST GENERATED / ${generated}` }), el("h2", { id: "audit-table-heading", text: "Reconciliation table" })]),
        el("a", { class: "text-link", href: collectionRoute("complete-archive"), text: `Browse ${formatCount(assets.length)} accessible public assets` })
      ]),
      el("div", { class: "audit-table-wrap" }, el("table", { class: "audit-table" }, [
        el("thead", {}, el("tr", {}, [el("th", { scope: "col", text: "Measure" }), el("th", { scope: "col", text: "Count" })])),
        el("tbody", {}, ROWS.map(([label, key]) => el("tr", {}, [
          el("th", { scope: "row", text: label }),
          el("td", { class: "mono", text: formatCount(Number(audit[key] || 0)) })
        ])))
      ])),
      el("p", { class: "audit-equation mono", text: audit.reconciliation || "Reconciliation detail is unavailable for this access tier." }),
      el("p", { class: "audit-privacy-note", text: "Public delivery contains only approved public renditions. Private originals, source provenance, generation prompts, and the detailed missing-file ledger remain protected by the authenticated manifest and download layer." })
    ])
  ]);
}
