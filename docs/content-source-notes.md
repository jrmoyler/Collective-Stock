# Content source notes

## Decision hierarchy

Apply conflicts in this order:

1. Most recent explicit user instruction.
2. Newest division-specific skill for division-scoped identity, palette, persona, product naming, and guardrails.
3. `01-Collective_AI_Design_System_Bible_v3_actual_logos_with_sections.pdf`.
4. `02-Collective_AI_MVP_Build_Guide_Complete.pdf`.
5. Earlier project conversation context.

The division-skill rule is scoped. An older skill phrase such as “all 15 departments” does not override the newer, parent-level fact that the portfolio contains 20 active divisions. Global portfolio facts come from the Design System Bible unless a current user instruction replaces them.

## Sources reviewed

All supplied sources were read. The `.skill.txt` files are ZIP archives with Markdown content, not plain text.

| Source | Evidence used |
|---|---|
| Design System Bible v3, 59 pages | Parent identity and tokens; 20-division order; actual raster logo gallery; palette spreads; per-division personas and components; cross-division rules; app typography scale; grid; do/don’t rules. |
| MVP Build Guide, 155 pages | May 14, 2026 catalog snapshot; 115 products/platforms; 146 services; 262 technology tools; product objectives; platform architecture; regulated-product build gates; content legibility and QA. |
| Collective AI parent skill + brand reference | Parent wordmark/compact mark details, Hataalii voice, ecosystem and dependency copy, licensing language, JR voice constraints. Used only where non-conflicting. |
| Collective brand asset generator | Parent dark-premium visual register, asset formats, recurring motifs, and concise CTA/copy patterns. |
| Juris Guard skill | Current crimson palette, shield/gavel mark, JurisIQ/ContractForge/RegPulse/Sentinel Shield, legal boundary language. Its referenced `brand.md` is missing. |
| Signal Velocity skill + brand reference | Current cyan palette, dish/signal-bolt mark, VelocityOS/SignalBoard/AdForge/PulseFeed, data-first conversion voice. |
| Eon Core skill + brand reference | Current emerald/cream palette, helix-to-infinity mark, EonOS/BioAge Engine/Protocol Builder/Eon Research Network, evidence-tier and medical boundaries. |
| Nomad Nexus skill + brand reference | Current teal palette, compass/global-grid mark, NomadOS/VisaPilot/NexusStay/FlowMap, immigration/tax verification rules. |
| Binary Loom skill + brand reference | Developer palette and mark, Natural Script positioning, developer voice, internal-to-open-source-to-enterprise licensing path. |
| Gaia Synthesis skill + brand reference | Split organic/digital palette and original mark, environmental science and biosafety cues. |
| Cognara Mind skill | Void Rose palette, shield/brain/pulse mark, four platforms, four doctrines, licensing and Signal Covenant governance. |
| Vital Helix skill + brand reference | Teal/orange platform palette and unchanged original logo, clinical and HIPAA guardrails. |
| Aether Link skill + brand reference | Mint palette, chibi astronaut mark, six-product set, privacy and transparent-verification cues. |
| Animus Prime skill + brand reference | Cyan robot/human mark and human-first robotics safety. |
| Vector Shift skill + brand reference | Navy/silver/cobalt palette, eagle/VS/dissolve mark, autonomous-system safety and regulatory cues. |
| Obsidian Arc skill + brand reference | Obsidian/orange identity, sentinel-eye mark, privacy-paired security language. |

## PDF evidence map

### Design System Bible

- Pages 1-3: version, “20 Active,” and authoritative presentation order.
- Pages 4-9: philosophy, parent palette, typography, spacing, motifs, components, and universal rules.
- Pages 10-11: actual logo mark gallery. These pages visually confirm embedded raster compositions.
- Pages 12-13: parent and 20-division palette swatches.
- Pages 15-54: full division design systems, personas, roles, and component directions.
- Page 55: cross-division rules.
- Pages 56-57: UI type scale, button states, iconography, and layout grid.
- Pages 58-59: binding do/don’t reference and closing brand contract.

### MVP Build Guide

- Pages 1-3: catalog metrics, build status logic, layout/legibility rules, and shared shell.
- Pages 4-5: older catalog order and palette snapshot; subordinate to the design bible and newer skills.
- Pages 6-12: complete 115-product manifest.
- Page 13: recommended shared architecture.
- Pages 14-148: division roles, products, product objectives, build platforms, status, governance flags, and implementation hooks.
- Pages 149-154: division service lines and tooling.
- Page 155: build QA and regulated-product gating.

## Authoritative content facts

- Brand: Collective AI / COLLECTIVE AI / C·AI.
- Legal entity: Collective AI Inc., a C-Corporation.
- Headquarters: Columbus, Ohio.
- Parent tagline: “Architecting a Humane Future.” It is parent-only.
- Portfolio: 20 active divisions in the order encoded in `divisions.json`.
- Intelligence layer: ZenFlow.
- Current agent count: 600, not 450.
- Shared infrastructure: Binary Loom.
- Cross-division execution layer: 20 Synergy Nodes across four phases.
- Catalog snapshot: 115 products/platforms, 146 services, and 262 technology tools, sourced to the May 14, 2026 Master Product Catalog snapshot.

The 115 figure must remain qualified as a catalog snapshot because newer division skills rename or consolidate flagships.

## Content and licensing cues

### Parent and infrastructure

- ZenFlow: enterprise licensing, custom agent architecture, Aegis certification, implementation consulting, and marketplace distribution.
- Binary Loom: internal portfolio adoption, then open source, then enterprise licensing for Natural Script; infrastructure, API, DevOps, and observability services.
- The Collective: strategy, implementation, governance, data science, workforce transformation, and vendor assessment engagements.

### Education, media, and IP

- Hybrid Living: corporate training licensing, P.E.T.E.E.R. licensing, curriculum delivery, certification, and mentorship.
- Nexus Labs: sponsored Collective Times content, Nexus Studios production, Creator Nexus access, and an explicitly licensable AI Content Engine.
- Cognara Mind: Drift Index methodology licensing, Forma certification, Doctrine Engine licensing marketplace, white papers, enterprise methodologies, and academic research partnerships.

### APIs, managed systems, and services

- Aether Link: translation and verification APIs, mesh deployment, remote connectivity, and gap assessments.
- Vital Helix: API access, monitoring, clinical partnerships, telehealth, and corporate wellness, always with clinical oversight.
- Quantum Ledger: finance intelligence, treasury, Web3, advisory, and risk services, subject to financial compliance.
- Juris Guard: subscription suites, AI governance implementation, regulatory intelligence, and LegalTech licensing; assistive only, not legal counsel.
- Signal Velocity: subscriptions, managed growth systems, attribution, paid media, and enterprise retainers.
- Nomad Nexus: consumer subscriptions, enterprise remote-work systems, relocation support, co-living access, and mobility intelligence.
- Eon Core: consumer subscriptions, testing coordination, research partnerships, and corporate longevity programs.

### Public benefit

- Civic Core is portfolio-funded and non-commercial. Do not describe it as a revenue driver, use scarcity, or frame community programs as portfolio marketing.

## Logo and mark handling

The source set contains visual approval references but not standalone production assets.

- The Design System Bible pages 10-11 visibly embed the actual raster logo compositions.
- Division brand references name files such as `binary_loom_logo.png`, `vital_helix_logo.png`, and `eon_core_logo.png`, but none are included as separate files in `project_sources`.
- Do not redraw, trace, crop, recolor, or invent division marks from descriptions.
- Obtain official transparent SVG/PNG files before production.
- The parent wordmark may be typeset from the approved spec because its construction is explicitly textual: COLLECTIVE AI in Space Grotesk Bold; compact mark C·AI.
- The 4-point diamond star is a supporting parentage mark, not a standalone logo or functional icon.
- Vital Helix explicitly keeps its original teal/orange, white-backed logo. That is a mark exception, not permission to use a light app canvas.

## Content safety and deployment cues

The MVP source expressly separates representation from live deployment.

- Medical and longevity products: use clinical review, consent, privacy/HIPAA controls, evidence tiers, contraindications, and no-diagnosis language.
- Legal products: include jurisdiction, effective date, source citations, confidence, and attorney-review boundaries.
- Financial products: include disclaimers, suitability, custody, and execution controls before any live transaction functionality.
- Autonomous mobility and robotics: simulation first; field deployment requires safety and regulatory review.
- Helios Grid and other energy-market settlement: blocked until Juris Guard/SEC clearance.
- Security and surveillance: pair capabilities with privacy, least privilege, retention, and responsible-disclosure language.
- Behavioral systems: informed sovereignty, data minimalism, exit architecture, and no manipulation.
- Visa and tax content: verify with official authorities and direct users to licensed immigration/tax counsel where required.

## Copy voice

Parent copy should lead with the signal, avoid warm-up language, use verified numbers, and ground every forward claim in a mechanism. Avoid these AI-language fingerprints: “delve,” “leverage,” “robust,” “seamless,” “empower,” and “transformative.”

Collective Times uses the Hataalii register: authoritative, precise, forward-looking, and synthesized. It ends on a forward implication or question, not a summary.

## Known unresolved issues

See `conflicts.json` for the full evidence record. The six issues requiring a future source decision are:

1. Reconciliation of the 115-product snapshot with newer flagship naming.
2. Missing standalone production logo files.
3. Missing Juris Guard `references/brand.md`.
4. White-backed approved logo compositions versus the dark-canvas rule.
5. Juris Guard and Nexus Labs both currently resolve to `#DC2626`, contrary to the non-collision rule.
6. Missing component-level overrides for divisions whose newer skills changed their identity after the Design System Bible component pages were authored.
