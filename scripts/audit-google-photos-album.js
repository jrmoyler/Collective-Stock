import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const exec = promisify(execFile);
const [zipArg, extractedArg, outputArg] = process.argv.slice(2);

if (!zipArg || !extractedArg || !outputArg) {
  console.error("Usage: node scripts/audit-google-photos-album.js <album.zip> <extracted-dir> <output-dir>");
  process.exit(1);
}

const zipPath = path.resolve(zipArg);
const extractedDir = path.resolve(extractedArg);
const outputDir = path.resolve(outputArg);
const posterDir = path.join(outputDir, "video-posters");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(posterDir, { recursive: true });

const { stdout: zipListing } = await exec("zipinfo", ["-1", zipPath], { maxBuffer: 4 * 1024 * 1024 });
const archiveEntries = zipListing.split(/\r?\n/).filter(Boolean).filter((entry) => !entry.endsWith("/"));

function contentHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

function displayName(filename) {
  const ext = path.extname(filename);
  const stem = path.basename(filename, ext);
  if (stem.startsWith("file_00000000")) return `${stem.slice(-12)}${ext}`;
  return filename.length > 36 ? `${filename.slice(0, 31)}…${ext}` : filename;
}

async function videoMetadata(file) {
  const { stdout } = await exec("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,duration:format=duration",
    "-of", "json", file
  ]);
  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0] || {};
  return {
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    duration: Number(stream.duration || parsed.format?.duration || 0)
  };
}

const records = [];
for (let index = 0; index < archiveEntries.length; index += 1) {
  const archivePath = archiveEntries[index];
  const relativePath = archivePath.split("/").slice(1).join("/");
  const file = path.join(extractedDir, archivePath);
  const extension = path.extname(file).toLowerCase();
  const mediaType = videoExtensions.has(extension) ? "video" : imageExtensions.has(extension) ? "image" : "other";
  const buffer = await fs.readFile(file);
  const stat = await fs.stat(file);
  let metadata = { width: 0, height: 0, duration: null };
  let contactSource = file;

  if (mediaType === "image") {
    const info = await sharp(buffer, { animated: true, failOn: "none" }).metadata();
    metadata = { width: info.width || 0, height: info.height || 0, duration: null };
  } else if (mediaType === "video") {
    metadata = await videoMetadata(file);
    const posterName = `${String(index + 1).padStart(3, "0")}-${path.basename(file, extension)}.jpg`;
    contactSource = path.join(posterDir, posterName);
    await exec("ffmpeg", ["-y", "-ss", "00:00:01", "-i", file, "-frames:v", "1", "-vf", "scale='min(1200,iw)':-2", "-q:v", "3", contactSource]);
  }

  records.push({
    albumIndex: index + 1,
    archivePath,
    relativePath,
    filename: path.basename(file),
    absolutePath: file,
    mediaType,
    fileSize: stat.size,
    contentHash: contentHash(buffer),
    ...metadata,
    contactSource
  });
}

const columns = 5;
const rows = 5;
const cellWidth = 320;
const cellHeight = 220;
const thumbWidth = 300;
const thumbHeight = 168;
const pageSize = columns * rows;
const pageCount = Math.ceil(records.length / pageSize);

for (let page = 0; page < pageCount; page += 1) {
  const pageRecords = records.slice(page * pageSize, (page + 1) * pageSize);
  const composites = [];
  for (let itemIndex = 0; itemIndex < pageRecords.length; itemIndex += 1) {
    const record = pageRecords[itemIndex];
    const x = (itemIndex % columns) * cellWidth + 10;
    const y = Math.floor(itemIndex / columns) * cellHeight + 10;
    const thumb = await sharp(record.contactSource, { animated: false, failOn: "none" })
      .rotate()
      .resize(thumbWidth, thumbHeight, { fit: "cover", position: "attention" })
      .jpeg({ quality: 84 })
      .toBuffer();
    const label = `${String(record.albumIndex).padStart(3, "0")} · ${displayName(record.filename)}${record.mediaType === "video" ? " · VIDEO" : ""}`;
    const svg = Buffer.from(`<svg width="${thumbWidth}" height="38" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0D1326"/><text x="8" y="24" fill="#F5F5F5" font-family="monospace" font-size="13">${escapeXml(label)}</text></svg>`);
    composites.push({ input: thumb, left: x, top: y });
    composites.push({ input: svg, left: x, top: y + thumbHeight });
  }
  const pageName = `contact-sheet-${String(page + 1).padStart(2, "0")}.jpg`;
  await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 3, background: "#050A18" } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(path.join(outputDir, pageName));
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceZip: zipPath,
  total: records.length,
  images: records.filter((record) => record.mediaType === "image").length,
  videos: records.filter((record) => record.mediaType === "video").length,
  other: records.filter((record) => record.mediaType === "other").length,
  uniqueHashes: new Set(records.map((record) => record.contentHash)).size,
  contactSheetPages: pageCount
};

await fs.writeFile(path.join(outputDir, "album-inventory.json"), `${JSON.stringify({ summary, records: records.map(({ contactSource, absolutePath, ...record }) => record) }, null, 2)}\n`);
console.log(JSON.stringify(summary));
