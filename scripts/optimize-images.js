import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, IMAGE_EXTENSIONS, walk, slugify } from "./lib/asset-utils.js";

const originalsDir = path.join(ROOT, "assets/originals");
const optimizedDir = path.join(ROOT, "assets/optimized");
const sizes = [{ label: "thumbnail", width: 360 }, { label: "card", width: 800 }, { label: "large", width: 1800 }];
const files = (await walk(originalsDir)).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
await fs.mkdir(optimizedDir, { recursive: true });

for (const file of files) {
  const source = sharp(file, { failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const base = slugify(path.basename(file, path.extname(file)));
  for (const size of sizes.filter((item) => !metadata.width || item.width <= metadata.width || item.label === "thumbnail")) {
    const width = Math.min(size.width, metadata.width || size.width);
    const common = source.clone().resize({ width, withoutEnlargement: true, fit: "inside" });
    await Promise.all([
      common.clone().avif({ quality: size.label === "thumbnail" ? 52 : 68, effort: 5 }).toFile(path.join(optimizedDir, `${base}-${size.label}-${width}.avif`)),
      common.clone().webp({ quality: size.label === "thumbnail" ? 72 : 84, effort: 5 }).toFile(path.join(optimizedDir, `${base}-${size.label}-${width}.webp`)),
      common.clone().jpeg({ quality: size.label === "thumbnail" ? 78 : 88, mozjpeg: true }).toFile(path.join(optimizedDir, `${base}-${size.label}-${width}.jpg`))
    ]);
  }
}

console.log(`Optimized ${files.length} original images.`);
