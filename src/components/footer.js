import { el, diamondStar } from "../utils/dom.js";
import { collectionRoute } from "../utils/routes.js";

export function Footer() {
  const year = new Date().getFullYear();
  return el("footer", { class: "site-footer" }, [
    el("div", { class: "footer-main" }, [
      el("div", { class: "footer-brand" }, [diamondStar(), el("strong", { text: "COLLECTIVE STOCK" }), el("p", { text: "The complete visual memory of Collective AI Inc." })]),
      el("div", { class: "footer-column" }, [el("h2", { text: "Discover" }), el("a", { href: collectionRoute("component-sheets"), text: "Component sheets" }), el("a", { href: collectionRoute("division-intro-videos"), text: "Intro films" }), el("a", { href: collectionRoute("motion-films"), text: "Motion films" }), el("a", { href: collectionRoute("complete-archive"), text: "Complete archive" })]),
      el("div", { class: "footer-column" }, [el("h2", { text: "Rights" }), el("a", { href: "/#licensing", text: "Licensing" }), el("a", { href: "/audit.html", text: "Asset audit" }), el("a", { href: "/audit.html#provenance", text: "Protected provenance" })]),
      el("div", { class: "footer-column" }, [el("h2", { text: "Collective AI" }), el("span", { text: "Architecting a Humane Future." }), el("span", { text: "Columbus, Ohio" })])
    ]),
    el("div", { class: "footer-legal" }, [el("span", { text: `© ${year} Collective AI Inc.` }), el("span", { class: "mono", text: "Manifest-driven · Rights-aware · Future-ready" })])
  ]);
}
