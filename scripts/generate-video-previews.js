import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT, VIDEO_EXTENSIONS, walk, slugify } from "./lib/asset-utils.js";
import { ffmpegPath, describeMissingBinary } from "./lib/media-binaries.js";

const exec = promisify(execFile);
const videoDir = path.join(ROOT, "assets/video");
const previewDir = path.join(ROOT, "assets/previews");
const videos = (await walk(videoDir)).filter((file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()));
const staleTemporaryOutputs = (await walk(previewDir)).filter((file) => file.endsWith(".generating"));
await Promise.all(staleTemporaryOutputs.map((file) => fs.rm(file, { force: true })));

for (const video of videos) {
  const relativeDirectory = path.dirname(path.relative(videoDir, video));
  const outputDirectory = path.join(previewDir, relativeDirectory);
  const output = path.join(outputDirectory, `${slugify(path.basename(video, path.extname(video)))}-preview.mp4`);
  const temporaryOutput = `${output}.${process.pid}-${randomUUID()}.generating`;
  await fs.mkdir(outputDirectory, { recursive: true });
  try {
    await exec(ffmpegPath, [
      "-y", "-i", video,
      "-map", "0:v:0",
      "-vf", "scale='min(540,iw)':-2",
      "-c:v", "libx264", "-preset", "medium", "-crf", "28",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-f", "mp4", temporaryOutput
    ]);
    const generated = await fs.stat(temporaryOutput);
    if (!generated.size) throw new Error(`Generated an empty preview for ${video}`);
    await fs.rename(temporaryOutput, output);
  } catch (error) {
    throw describeMissingBinary("ffmpeg", error);
  } finally {
    await fs.rm(temporaryOutput, { force: true });
  }
}

console.log(`Verified ${videos.length} muted public video previews.`);
