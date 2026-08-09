import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Vercel's build image ships no ffmpeg/ffprobe, so the build resolves the
// binaries from npm-installed packages first and only falls back to whatever
// is on PATH for local machines that already have a system install.
function resolveBinary({ label, packageName, environmentVariable }) {
  const override = process.env[environmentVariable];
  if (override) return override;
  try {
    const installed = require(packageName);
    const binary = typeof installed === "string" ? installed : installed?.path || installed?.default;
    if (binary) return binary;
  } catch {
    // Falls through to the PATH lookup below.
  }
  console.warn(`${label}: ${packageName} did not resolve a binary; falling back to "${label}" on PATH.`);
  return label;
}

export const ffmpegPath = resolveBinary({
  label: "ffmpeg",
  packageName: "@ffmpeg-installer/ffmpeg",
  environmentVariable: "FFMPEG_PATH"
});

export const ffprobePath = resolveBinary({
  label: "ffprobe",
  packageName: "@ffprobe-installer/ffprobe",
  environmentVariable: "FFPROBE_PATH"
});

export function describeMissingBinary(label, error) {
  if (error?.code !== "ENOENT") return error;
  return new Error(
    `${label} is unavailable. Install project dependencies with "npm install" so the bundled ${label} binary is present, ` +
      `or point ${label === "ffmpeg" ? "FFMPEG_PATH" : "FFPROBE_PATH"} at a system install.`,
    { cause: error }
  );
}
