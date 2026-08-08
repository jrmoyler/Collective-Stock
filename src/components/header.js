import { el, icon, diamondStar, fragment } from "../utils/dom.js";
import { collectionRoute, divisionRoute } from "../utils/routes.js";

export class Header extends EventTarget {
  constructor({ divisions = [], activeDivision = "", access = "public" } = {}) {
    super();
    this.divisions = divisions;
    this.activeDivision = activeDivision;
    this.access = access;
    this.root = this.#render();
  }

  #render() {
    const megaId = "division-mega-menu";
    const navButton = el("button", { class: "nav-link nav-menu-trigger", type: "button", "aria-expanded": "false", "aria-controls": megaId }, ["Divisions", icon("chevron")]);
    const mega = this.#megaMenu(megaId);
    navButton.addEventListener("click", () => {
      const next = navButton.getAttribute("aria-expanded") !== "true";
      navButton.setAttribute("aria-expanded", String(next));
      mega.hidden = !next;
    });
    const mobileButton = el("button", { class: "icon-button mobile-menu-button", type: "button", "aria-expanded": "false", "aria-controls": "mobile-navigation", "aria-label": "Open navigation" }, icon("menu"));
    const mobile = this.#mobileNavigation();
    let header;
    const setMobileOpen = (next, { restoreFocus = false } = {}) => {
      mobileButton.setAttribute("aria-expanded", String(next));
      mobileButton.setAttribute("aria-label", next ? "Close navigation" : "Open navigation");
      mobile.hidden = !next;
      mobileButton.replaceChildren(icon(next ? "close" : "menu"));
      document.body.classList.toggle("has-mobile-nav", next);
      header.querySelectorAll(".wordmark, .desktop-nav, .header-search-button, .access-indicator").forEach((node) => { node.inert = next; });
      document.querySelectorAll("#app > main, #app > footer").forEach((node) => { node.inert = next; });
      if (next) mobile.querySelector("a")?.focus();
      else if (restoreFocus) mobileButton.focus();
    };
    mobileButton.addEventListener("click", () => setMobileOpen(mobileButton.getAttribute("aria-expanded") !== "true"));
    header = el("header", { class: "site-header" }, [
      el("div", { class: "header-inner" }, [
        el("a", { class: "wordmark", href: "/", "aria-label": "Collective Stock home" }, [diamondStar(), el("span", { text: "COLLECTIVE STOCK" })]),
        el("nav", { class: "desktop-nav", "aria-label": "Primary navigation" }, [
          el("a", { class: "nav-link", href: collectionRoute("complete-archive"), text: "Browse" }),
          navButton,
          el("a", { class: "nav-link", href: collectionRoute("videos"), text: "Motion" }),
          el("a", { class: "nav-link", href: "/#licensing", text: "Licensing" })
        ]),
        el("div", { class: "header-actions" }, [
          el("button", { class: "header-search-button", type: "button", "aria-label": "Search archive", onClick: () => this.dispatchEvent(new Event("searchrequest")) }, [icon("search"), el("span", { text: "Search archive" })]),
          el("span", { class: "access-indicator", title: this.access === "internal" ? "Authenticated internal archive view" : "Public archive view" }, [icon(this.access === "internal" ? "lock" : "globe"), el("span", { text: this.access === "internal" ? "Internal access" : "Public access" })]),
          mobileButton
        ])
      ]),
      mega
    ]);
    document.body.append(mobile);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const megaWasOpen = navButton.getAttribute("aria-expanded") === "true";
        navButton.setAttribute("aria-expanded", "false");
        mega.hidden = true;
        if (megaWasOpen && mega.contains(document.activeElement)) navButton.focus();
        if (mobileButton.getAttribute("aria-expanded") === "true") setMobileOpen(false, { restoreFocus: true });
      }
      if (event.key === "Tab" && mobileButton.getAttribute("aria-expanded") === "true") {
        const focusable = [mobileButton, ...mobile.querySelectorAll("a[href], button:not([disabled])")];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    return header;
  }

  #megaMenu(id) {
    const parent = this.divisions.find((division) => division.slug === "collective-ai-inc");
    const items = this.divisions.filter((division) => division.slug !== "collective-ai-inc");
    return el("div", { class: "mega-menu", id, hidden: true }, [
      el("div", { class: "mega-menu__inner" }, [
        el("div", { class: "mega-menu__intro" }, [
          el("p", { class: "section-label", text: "21 complete collections" }),
          el("h2", { text: "One intelligence. Twenty distinct divisions." }),
          el("p", { text: "Move through the complete visual system without losing the thread of the parent brand." }),
          parent ? this.#divisionLink(parent, true) : null
        ]),
        el("div", { class: "mega-menu__grid" }, items.map((division, index) => this.#divisionLink(division, false, index)))
      ])
    ]);
  }

  #divisionLink(division, parent = false, index = 0) {
    const link = el("a", {
      class: `division-menu-link ${parent ? "is-parent" : ""} ${division.slug === this.activeDivision ? "is-active" : ""}`,
      href: divisionRoute(division.slug),
      style: `--division-accent:${division.accent || "#D4A843"}`
    }, [
      el("span", { class: "division-menu-link__index mono", text: parent ? "00" : String(index + 1).padStart(2, "0") }),
      el("span", { text: division.name }),
      icon("arrow")
    ]);
    return link;
  }

  #mobileNavigation() {
    return el("nav", { id: "mobile-navigation", class: "mobile-navigation", hidden: true, "aria-label": "Mobile navigation" }, [
      el("div", { class: "mobile-primary-links" }, [
        el("a", { href: collectionRoute("complete-archive"), text: "Browse archive" }),
        el("a", { href: collectionRoute("videos"), text: "Motion" }),
        el("a", { href: "/#licensing", text: "Licensing" })
      ]),
      el("p", { class: "section-label", text: "Divisions" }),
      fragment(this.divisions.map((division) => this.#divisionLink(division)))
    ]);
  }
}
