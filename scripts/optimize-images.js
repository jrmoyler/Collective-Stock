import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, IMAGE_EXTENSIONS, walk, slugify } from "./lib/asset-utils.js";

const originalsDir = path.join(ROOT, "assets/originals");
const optimizedDir = path.join(ROOT, "assets/optimized");
const sizes = [
  { label: "thumbnail", width: 360, allowUpscale: false },
  { label: "card", width: 800, allowUpscale: true },
  { label: "large", width: 1800, allowUpscale: true }
];
const files = (await walk(originalsDir)).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
await fs.mkdir(optimizedDir, { recursive: true });

async function optimize(file) {
  const source = sharp(file, { failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const base = slugify(path.basename(file, path.extname(file)));
  for (const size of sizes) {
    const width = size.allowUpscale ? size.width : Math.min(size.width, metadata.width || size.width);
    const outputs = ["avif", "webp", "jpg"].map((format) => path.join(optimizedDir, `${base}-${size.label}-${width}.${format}`));
    const [sourceStat, outputStats] = await Promise.all([
      fs.stat(file),
      Promise.all(outputs.map((output) => fs.stat(output))).catch(() => [])
    ]);
    if (outputStats.length === outputs.length && outputStats.every((stat) => stat.mtimeMs >= sourceStat.mtimeMs)) continue;
    const shouldEnhance = size.allowUpscale && Boolean(metadata.width) && metadata.width < width;
    let common = source.clone().resize({
      width,
      withoutEnlargement: !size.allowUpscale,
      fit: "inside",
      kernel: sharp.kernel.lanczos3
    });
    // Originals remain untouched. Low-resolution sources receive a restrained
    // Lanczos enlargement and micro-contrast pass in their delivery renditions.
    if (shouldEnhance) common = common.sharpen({ sigma: 0.8 });
    await Promise.all([
      common.clone().avif({ quality: size.label === "thumbnail" ? 52 : 68, effort: 1 }).toFile(outputs[0]),
      common.clone().webp({ quality: size.label === "thumbnail" ? 72 : 84, effort: 4 }).toFile(outputs[1]),
      common.clone().jpeg({ quality: size.label === "thumbnail" ? 78 : 88, mozjpeg: true }).toFile(outputs[2])
    ]);
  }
}

const queue = [...files];
const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
  while (queue.length) await optimize(queue.shift());
});
await Promise.all(workers);

console.log(`Optimized ${files.length} original images.`);
