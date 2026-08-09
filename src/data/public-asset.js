const PUBLIC_FIELDS = [
  "id", "title", "slug", "description", "division", "divisionSlug", "classification",
  "mediaType", "category", "categorySlug", "series", "revision", "ingestedAt",
  "width", "height", "duration", "audioProfile", "captionStatus", "aspectRatio",
  "orientation", "fileFormat", "mimeType", "fileSizeHuman", "dominantColors",
  "focalPoint", "searchKeywords", "semanticTags", "altText", "intendedUse", "license",
  "visibility", "downloadAuthorization", "optimizedRenditions", "posterPath", "previewPath",
  "previewAudio", "relatedAssets", "featured", "approvalStatus", "classificationConfidence",
  "classificationNotes"
];

export const PUBLIC_FORBIDDEN_FIELDS = [
  "originalDownloadPath", "originalFilename", "contentHash", "perceptualHash", "prompt",
  "source", "sourceAlbum", "sourceUrl", "albumIndex", "batch", "generationDate"
];

export function publicAssetRecord(asset) {
  return Object.fromEntries(
    PUBLIC_FIELDS
      .filter((field) => asset[field] !== undefined)
      .map((field) => [field, asset[field]])
  );
}

export function publicProvenanceRecord(provenance = {}) {
  return {
    schemaVersion: provenance.schemaVersion,
    generatedAt: provenance.generatedAt,
    occurrences: []
  };
}
