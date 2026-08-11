const STOCK_SCOPES = {
  "animal-stock": { label: "Animals", slug: "animals" },
  "general-stock": { label: "General Stock", slug: "general-stock" }
};

export function stockScope(asset) {
  return STOCK_SCOPES[asset?.classification] || null;
}

export function assetScopeLabel(asset) {
  return stockScope(asset)?.label || asset?.division || "Collective Stock";
}

export function sharesAssetScope(left, right) {
  const leftStock = stockScope(left);
  const rightStock = stockScope(right);
  if (leftStock || rightStock) return leftStock?.slug === rightStock?.slug;
  return left?.divisionSlug === right?.divisionSlug;
}
