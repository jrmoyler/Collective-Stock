import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import yauzl from "yauzl";
import { ROOT, readJson, sha256 } from "./lib/asset-utils.js";

const archiveManifestPath = path.join(ROOT, "assets/source-archives/google-photos-2026-08-08/archive-chunks.json");
const albumMapPath = path.join(ROOT, "assets/manifests/google-photos-album-map.json");
const archiveManifest = await readJson(archiveManifestPath, null);
const albumMap = await readJson(albumMapPath, null);
if (!archiveManifest || !albumMap) throw new Error("Google Photos source archive manifest or album map is missing.");

async function validDestination(asset) {
  const destination = path.join(ROOT, asset.destinationPath.replace(/^\//, ""));
  try { return await sha256(destination) === asset.contentHash; } catch { return false; }
}

const validity = await Promise.all(albumMap.assets.map(validDestination));
if (validity.every(Boolean)) {
  console.log(`Verified ${albumMap.assets.length} materialized Google Photos originals.`);
  process.exit(0);
}

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "collective-stock-album-"));
const archivePath = path.join(temporaryDirectory, archiveManifest.sourceZipFilename);
try {
  const archiveHandle = await fs.open(archivePath, "w");
  try {
    for (const chunk of archiveManifest.chunks) {
      const chunkPath = path.join(ROOT, chunk.path);
      const stat = await fs.stat(chunkPath);
      if (stat.size !== chunk.size || await sha256(chunkPath) !== chunk.contentHash) throw new Error(`Archive chunk failed integrity validation: ${chunk.path}`);
      await archiveHandle.writeFile(await fs.readFile(chunkPath));
    }
  } finally {
    await archiveHandle.close();
  }
  const archiveStat = await fs.stat(archivePath);
  if (archiveStat.size !== archiveManifest.fileSize || await sha256(archivePath) !== archiveManifest.contentHash) throw new Error("Reconstructed Google Photos ZIP failed integrity validation.");

  const pending = new Map(albumMap.assets.filter((_, index) => !validity[index]).map((asset) => [asset.sourceArchivePath, asset]));
  const zip = await new Promise((resolve, reject) => yauzl.open(archivePath, { lazyEntries: true, autoClose: false }, (error, value) => error ? reject(error) : resolve(value)));
  await new Promise((resolve, reject) => {
    zip.on("error", reject);
    zip.on("end", resolve);
    zip.on("entry", (entry) => {
      const asset = pending.get(entry.fileName);
      if (!asset) { zip.readEntry(); return; }
      const destination = path.join(ROOT, asset.destinationPath.replace(/^\//, ""));
      const temporaryDestination = `${destination}.materializing`;
      fs.mkdir(path.dirname(destination), { recursive: true }).then(() => {
        zip.openReadStream(entry, async (error, stream) => {
          if (error) { reject(error); return; }
          try {
            await pipeline(stream, fsSync.createWriteStream(temporaryDestination));
            if (await sha256(temporaryDestination) !== asset.contentHash) throw new Error(`Materialized file hash mismatch: ${asset.sourceArchivePath}`);
            await fs.rename(temporaryDestination, destination);
            pending.delete(entry.fileName);
            zip.readEntry();
          } catch (streamError) { reject(streamError); }
        });
      }).catch(reject);
    });
    zip.readEntry();
  });
  zip.close();
  if (pending.size) throw new Error(`Archive is missing ${pending.size} mapped entries: ${[...pending.keys()].slice(0, 5).join(", ")}`);
  console.log(`Materialized and verified ${albumMap.assets.length} Google Photos originals from the committed source archive.`);
} finally {
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
}
