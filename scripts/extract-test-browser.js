import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { ROOT } from "./lib/asset-utils.js";

const source = path.join(ROOT, "node_modules/@sparticuz/chromium/bin/chromium.br");
const directory = path.join(ROOT, ".browser-runtime");
const target = path.join(directory, "chromium");
await fsp.mkdir(directory, { recursive: true });
const stat = await fsp.stat(target).catch(() => ({ size: 0 }));
if (!stat.size) {
  await pipeline(fs.createReadStream(source), createBrotliDecompress(), fs.createWriteStream(target, { mode: 0o700 }));
  await fsp.chmod(target, 0o700);
}
console.log(target);
