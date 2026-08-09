import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { ffprobePath, describeMissingBinary } from "./media-binaries.js";

const exec = promisify(execFile);

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"]);
export const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);

export const slugify = (value = "") => String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const titleize = (value = "") => String(value).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
export const posixPath = (value) => `/${path.relative(ROOT, value).split(path.sep).join("/")}`;
export const readJson = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return structuredClone(fallback); } };
export const writeJson = async (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");

export async function walk(directory) {
  const output = [];
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(full));
    else output.push(full);
  }
  return output;
}

export async function sha256(file) {
  const buffer = await fs.readFile(file);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const hex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
const color = (r, g, b) => `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();

export async function imageMetadata(file) {
  const pipeline = sharp(file, { animated: true, failOn: "none" });
  const [metadata, stats, raw] = await Promise.all([
    pipeline.metadata(),
    pipeline.stats(),
    pipeline.clone().resize(9, 8, { fit: "fill" }).greyscale().raw().toBuffer()
  ]);
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const means = stats.channels.map((item) => item.mean);
  let pHash = "";
  for (let y = 0; y < 8; y += 1) {
    let byte = 0;
    for (let x = 0; x < 8; x += 1) byte |= Number(raw[y * 9 + x] > raw[y * 9 + x + 1]) << (7 - x);
    pHash += byte.toString(16).padStart(2, "0");
  }
  const [r = 13, g = 19, b = 38] = means;
  return {
    width,
    height,
    fileFormat: metadata.format || path.extname(file).slice(1).toLowerCase(),
    hasAlpha: Boolean(metadata.hasAlpha),
    dominantColors: [color(r, g, b), color(r * .68, g * .68, b * .68), color(r * 1.24, g * 1.24, b * 1.24)],
    perceptualHash: pHash
  };
}

export async function videoMetadata(file) {
  const extension = path.extname(file).slice(1).toLowerCase();
  let stdout;
  try {
    ({ stdout } = await exec(ffprobePath, [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,duration,codec_name:format=duration,format_name",
      "-of", "json",
      file
    ]));
  } catch (error) {
    throw describeMissingBinary("ffprobe", error);
  }
  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0] || {};
  return {
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    duration: Number(stream.duration || parsed.format?.duration || 0),
    codec: stream.codec_name || null,
    fileFormat: extension || parsed.format?.format_name?.split(",")[0] || "mp4",
    dominantColors: ["#0D1326", "#09101D", "#15203A"],
    perceptualHash: null
  };
}

export function aspectRatio(width, height) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  if (!width || !height) return "unknown";
  const d = gcd(width, height);
  return `${width / d}:${height / d}`;
}

export const orientation = (width, height) => width === height ? "square" : width > height ? "landscape" : "portrait";
export const humanSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
