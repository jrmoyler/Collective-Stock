export const COLLECTION_DEFINITIONS = [
  { slug: "stock-images", title: "Stock images", description: "Production-ready photography and illustrative media.", constraints: { category: "stock-images" } },
  { slug: "reference-images", title: "Reference images", description: "Approved visual direction, brand language, and concept references.", constraints: { category: "reference-images" } },
  { slug: "hero-images", title: "Hero images", description: "High-impact first impressions for websites, campaigns, and presentations.", constraints: { category: "hero-images" }, featured: true },
  { slug: "website-backgrounds", title: "Website backgrounds", description: "Atmospheric backdrops designed for digital product surfaces.", constraints: { category: "website-backgrounds" } },
  { slug: "app-backgrounds", title: "App backgrounds", description: "Interface-ready background systems for apps and tools.", constraints: { category: "app-backgrounds" } },
  { slug: "brand-sheets", title: "Brand sheets", description: "Logos, marks, and approved brand-system documentation.", constraints: { category: "brand-sheets" } },
  { slug: "component-sheets", title: "Component sheets", description: "The complete parent-and-division UI component library, verified and implementation-ready.", constraints: { category: "component-sheets" }, featured: true, navigation: true },
  { slug: "division-intro-videos", title: "Division intro videos", description: "Cinematic identity films with global scope unless a division pairing is explicitly stated.", constraints: { category: "division-intro-videos", mediaType: "video" }, featured: true, navigation: true },
  { slug: "specification-sheets", title: "Specification sheets", description: "Precise design and production specifications.", constraints: { category: "specification-sheets" } },
  { slug: "ui-mockups", title: "UI mockups", description: "Product-interface concepts and implementation references.", constraints: { category: "ui-mockups" } },
  { slug: "campaigns-advertising", title: "Campaigns and advertising", description: "Campaign creative and promotional systems.", constraints: { category: "campaigns-advertising" } },
  { slug: "product-concepts", title: "Product concepts", description: "Product and service visualization concepts.", constraints: { category: "product-concepts" } },
  { slug: "hardware-concepts", title: "Hardware concepts", description: "Physical product and device visualization concepts.", constraints: { category: "hardware-concepts" } },
  { slug: "motion-references", title: "Motion references", description: "Movement, timing, transition, and cinematic direction.", constraints: { category: "motion-references" } },
  { slug: "videos", title: "Videos", description: "Every playable film and motion asset in the archive.", constraints: { mediaType: "video" } },
  { slug: "3d-spatial-media", title: "3D and spatial media", description: "Spatial concepts, environments, and three-dimensional references.", constraints: { category: "3d-spatial-media" } },
  { slug: "recently-added", title: "Recently added", description: "The newest verified additions to the archive.", constraints: { sort: "newest" } },
  { slug: "featured", title: "Featured", description: "Editorially selected media from across the Collective AI ecosystem.", constraints: { featured: true } },
  { slug: "alternate-versions", title: "Alternate versions", description: "Revisions, variants, and related creative explorations.", constraints: { alternate: true } },
  { slug: "complete-archive", title: "Complete archive", description: "Every locally accessible image, film, revision, and provenance record in one searchable archive.", constraints: {} },
  { slug: "public-download", title: "Public downloads", description: "Assets currently cleared for anonymous download and delivery.", constraints: { visibility: "public", downloadAuthorization: "public" } }
];

export const COLLECTIONS_BY_SLUG = new Map(COLLECTION_DEFINITIONS.map((definition) => [definition.slug, definition]));

export function collectionDefinition(slug = "complete-archive") {
  return COLLECTIONS_BY_SLUG.get(slug) || COLLECTIONS_BY_SLUG.get("complete-archive");
}

export function applyCollectionConstraints(state = {}, slug = "complete-archive") {
  return { ...state, ...collectionDefinition(slug).constraints };
}
