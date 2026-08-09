import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, sha256, writeJson } from "./lib/asset-utils.js";

const source = path.resolve(process.argv[2] || "");
const outputDir = path.resolve(process.argv[3] || path.join(ROOT, "assets/source-archives/google-photos-2026-08-08/chunks"));
const manifestPath = path.resolve(process.argv[4] || path.join(ROOT, "assets/source-archives/google-photos-2026-08-08/archive-chunks.json"));
const chunkSize = 700 * 1024;

if (!process.argv[2]) throw new Error("Usage: node scripts/package-google-photos-archive.js <archive.zip> [chunks-dir] [manifest.json]");
await fs.access(source);
await fs.mkdir(outputDir, { recursive: true });

const handle = await fs.open(source, "r");
const stat = await handle.stat();
const chunks = [];
let offset = 0;
let order = 1;
try {
  while (offset < stat.size) {
    const length = Math.min(chunkSize, stat.size - offset);
    const buffer = Buffer.allocUnsafe(length);
    const { bytesRead } = await handle.read(buffer, 0, length, offset);
    if (bytesRead !== length) throw new Error(`Short archive read at byte ${offset}`);
    const filename = `collective-stock-001.part-${String(order).padStart(4, "0")}`;
    const output = path.join(outputDir, filename);
    await fs.writeFile(output, buffer);
    chunks.push({ order, path: path.relative(ROOT, output).split(path.sep).join("/"), size: length, contentHash: await sha256(output) });
    offset += length;
    order += 1;
  }
} finally {
  await handle.close();
}

await writeJson(manifestPath, {
  schemaVersion: 1,
  sourceZipFilename: path.basename(source),
  fileSize: stat.size,
  contentHash: await sha256(source),
  chunkSize,
  chunkCount: chunks.length,
  chunks
});
console.log(`Packaged ${stat.size} bytes into ${chunks.length} integrity-checked chunks.`);
