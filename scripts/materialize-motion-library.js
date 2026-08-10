import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT, readJson, sha256, walk } from "./lib/asset-utils.js";

const exec = promisify(execFile);
const sourceDirectory = path.join(ROOT, "assets/source-archives/motion-library-2026-08-09");
const manifest = await readJson(path.join(sourceDirectory, "integrity-manifest.json"), null);

if (!manifest?.files?.length || !manifest.archiveSha256) {
  throw new Error("Motion archive integrity manifest is missing or incomplete.");
}

async function verifyMaterializedFiles() {
  for (const entry of manifest.files) {
    const target = path.join(ROOT, entry.path);
    const stat = await fs.stat(target).catch(() => null);
    if (!stat?.size || await sha256(target) !== entry.sha256) return false;
  }
  return true;
}

if (await verifyMaterializedFiles()) {
  console.log(`Verified ${manifest.files.length} materialized Drive motion originals.`);
} else {
  const chunks = (await walk(sourceDirectory))
    .filter((file) => path.basename(file).startsWith(manifest.chunkPrefix))
    .sort((a, b) => a.localeCompare(b));
  if (chunks.length !== manifest.chunkCount) {
    throw new Error(`Motion archive requires ${manifest.chunkCount} chunks; found ${chunks.length}.`);
  }

  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "collective-stock-motion-"));
  const archive = path.join(temporaryDirectory, manifest.archiveFilename);
  const handle = await fs.open(archive, "w");
  try {
    for (const chunk of chunks) await handle.write(await fs.readFile(chunk));
  } finally {
    await handle.close();
  }

  try {
    const archiveStat = await fs.stat(archive);
    if (archiveStat.size !== manifest.archiveBytes) throw new Error(`Motion archive byte mismatch: ${archiveStat.size}.`);
    if (await sha256(archive) !== manifest.archiveSha256) throw new Error("Motion archive checksum mismatch.");
    await exec("tar", ["-xf", archive, "-C", ROOT]);
    if (!await verifyMaterializedFiles()) throw new Error("One or more materialized motion originals failed checksum verification.");
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }

  console.log(`Materialized and verified ${manifest.files.length} Drive motion originals from ${chunks.length} source chunks.`);
}
