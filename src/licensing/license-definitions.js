export const LICENSES = {
  "collective-ai-internal-use": {
    name: "Collective AI Internal Use",
    short: "Internal",
    permitted: ["Internal presentations", "Collective AI products", "Team communications"],
    restricted: ["Public redistribution", "Resale as a standalone asset", "External campaigns without approval"],
    attribution: "Not required internally",
    private: true
  },
  "royalty-free-commercial-use": {
    name: "Royalty-Free Commercial Use",
    short: "Royalty-Free",
    permitted: ["Commercial campaigns", "Websites and applications", "Presentations and social media"],
    restricted: ["Standalone resale", "Trademark registration", "Unlawful or defamatory use"],
    attribution: "Not required unless noted",
    private: false
  },
  "editorial-use": {
    name: "Editorial Use",
    short: "Editorial",
    permitted: ["News reporting", "Documentary use", "Educational commentary"],
    restricted: ["Advertising endorsement", "Material alteration that changes context", "Merchandise resale"],
    attribution: "Collective AI Inc / Collective Stock",
    private: false
  },
  "restricted-approval-required": {
    name: "Restricted / Approval Required",
    short: "Approval required",
    permitted: ["Approved project use", "Review and evaluation"],
    restricted: ["Publication before approval", "External distribution", "Derivative training datasets"],
    attribution: "Defined during approval",
    private: true
  },
  "rights-managed-custom": {
    name: "Rights Managed / Custom License",
    short: "Rights Managed",
    permitted: ["Uses specified in the signed license"],
    restricted: ["Any use outside licensed territory, term, medium, or audience"],
    attribution: "Defined by license",
    private: false
  },
  "public-download": {
    name: "Public Download",
    short: "Public",
    permitted: ["Download", "Sharing with source credit", "Use under included terms"],
    restricted: ["Misrepresentation of ownership", "Standalone resale"],
    attribution: "See asset terms",
    private: false
  }
};

export function getLicense(slug) {
  return LICENSES[slug] || LICENSES["restricted-approval-required"];
}
