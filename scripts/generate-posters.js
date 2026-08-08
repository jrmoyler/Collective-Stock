import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT, VIDEO_EXTENSIONS, walk, slugify } from "./lib/asset-utils.js";

const exec = promisify(execFile);
const videoDir = path.join(ROOT, "assets/video");
const posterDir = path.join(ROOT, "assets/posters");
await fs.mkdir(posterDir, { recursive: true });
const videos = (await walk(videoDir)).filter((file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()));
for (const video of videos) {
  const out = path.join(posterDir, `${slugify(path.basename(video, path.extname(video)))}.jpg`);
  await exec("ffmpeg", ["-y", "-ss", "00:00:01", "-i", video, "-frames:v", "1", "-vf", "scale='min(1800,iw)':-2", "-q:v", "3", out]);
}
console.log(`Generated ${videos.length} video poster frames.`);
