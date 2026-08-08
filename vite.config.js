import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        division: resolve(import.meta.dirname, "division.html"),
        asset: resolve(import.meta.dirname, "asset.html"),
        collections: resolve(import.meta.dirname, "collections.html"),
        audit: resolve(import.meta.dirname, "audit.html")
      }
    }
  },
  server: { fs: { strict: true } }
});
