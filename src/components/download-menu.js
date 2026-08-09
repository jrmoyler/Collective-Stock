import { el, icon } from "../utils/dom.js";

export function DownloadMenu(asset, { toast } = {}) {
  const root = el("div", { class: "download-menu" });
  const anonymousDownload = asset.downloadAuthorization === "public";
  const options = [
    ...(asset.optimizedRenditions || []).filter((item) => ["card", "large"].includes(item.label)).map((item) => ({ label: `${item.label === "large" ? "Large preview" : "Web preview"} · ${item.width}w`, path: item.path, public: anonymousDownload, original: false })),
    { label: `Original · ${asset.width}×${asset.height}`, path: asset.originalDownloadPath, public: anonymousDownload, original: true }
  ];
  options.forEach((option) => {
    const button = el("button", { class: "download-option", type: "button" }, [
      icon(option.public ? "download" : "lock"),
      el("span", {}, [el("strong", { text: option.label }), el("small", { text: option.public ? "Available now" : "Authenticated access required" })])
    ]);
    button.addEventListener("click", async () => {
      if (!option.public && !option.original) {
        toast?.show("Preview download requires authenticated approval");
        return;
      }
      if (option.original) {
        const response = await fetch(`/api/download?id=${encodeURIComponent(asset.id)}&rendition=original`, { credentials: "same-origin" }).catch(() => null);
        if (!response?.ok) {
          toast?.show(option.public ? "Original file is not available from this preview" : "Original download requires authenticated approval");
          return;
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = el("a", { href: url, download: `${asset.slug || "collective-stock-asset"}.${asset.fileFormat || "bin"}` });
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast?.show("Original download started");
      } else if (option.path) {
        const anchor = el("a", { href: option.path, download: "", rel: "nofollow" });
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        toast?.show("Download started");
      }
    });
    root.append(button);
  });
  return root;
}
