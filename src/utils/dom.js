const SVG_NS = "http://www.w3.org/2000/svg";

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "htmlFor") node.htmlFor = String(value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key in node && !key.startsWith("aria-")) node[key] = value;
    else node.setAttribute(key, String(value));
  });
  const items = Array.isArray(children) ? children : [children];
  items.flat(Infinity).forEach((child) => {
    if (child === undefined || child === null || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

export function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

export function icon(name, label = "") {
  const paths = {
    search: ["M21 21l-4.35-4.35", "M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"],
    menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
    close: ["M6 6l12 12", "M18 6 6 18"],
    heart: ["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"],
    download: ["M12 3v12", "m7 10 5 5 5-5", "M5 21h14"],
    copy: ["M8 8h11v11H8z", "M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1"],
    chevron: ["m9 18 6-6-6-6"],
    arrow: ["M5 12h14", "m13 6 6 6-6 6"],
    play: ["m8 5 11 7-11 7Z"],
    lock: ["M6 10h12v11H6z", "M8 10V7a4 4 0 0 1 8 0v3"],
    globe: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M2 12h20", "M12 2a15 15 0 0 1 0 20", "M12 2a15 15 0 0 0 0 20"],
    filter: ["M4 5h16", "M7 12h10", "M10 19h4"],
    expand: ["M8 3H3v5", "M16 3h5v5", "M8 21H3v-5", "M16 21h5v-5"],
    check: ["m5 12 4 4L19 6"],
    layers: ["m12 3 9 5-9 5-9-5 9-5Z", "m3 13 9 5 9-5", "m3 17 9 5 9-5"],
    alert: ["M12 3 2.8 20h18.4L12 3Z", "M12 9v5", "M12 17h.01"],
    grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"]
  };
  const svg = svgEl("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": label ? "false" : "true", role: label ? "img" : "presentation" });
  (paths[name] || paths.grid).forEach((d) => svg.append(svgEl("path", { d })));
  svg.classList.add("icon");
  if (label) {
    const title = svgEl("title");
    title.textContent = label;
    svg.append(title);
  }
  return svg;
}

export function diamondStar(className = "") {
  return el("span", { class: `diamond-star ${className}`, "aria-hidden": "true" });
}

export function fragment(...children) {
  const output = document.createDocumentFragment();
  children.flat(Infinity).forEach((child) => child && output.append(child));
  return output;
}

export function clear(node) {
  node.replaceChildren();
  return node;
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

export function slugify(value = "") {
  return String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
