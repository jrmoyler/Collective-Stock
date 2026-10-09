# Collective Stock — Immersive editorial gallery

## Product and direction
A searchable, rights-aware media archive for creators. Preserve existing asset records, routes, downloads, filters, MCP integration and the twenty active divisions. Primary path: discover → preview → inspect rights → download. Secondary path: save → revisit → share. The design is a midnight museum of the archive's actual artwork, not a replacement asset library.

## Visual system
- Midnight #050A18 canvas; #0A0F1E secondary surfaces; #111827 raised controls.
- Ivory #F5F5F5 text; #A8B3C4 secondary text; #D4A843 gold primary action; #00D9B5 focus/selected accent; #273247 borders.
- Space Grotesk 400/500/600 for headings and UI, system sans fallback. JetBrains Mono 400 for counts. Hero 56–112px, section titles 32–64px, body 16–18px, controls 14px. Headings tightly tracked, body generous line-height.
- 1540px maximum shell, 20–64px responsive gutters. Open editorial bands, thin rules, softly rounded 8–16px media surfaces. Avoid nested cards and decorative particles.
- Existing approved diamond mark and actual archive images. No external stock imagery or new product claims.

## Screen contract
Home: simplified header; left title 'A world beyond ordinary.'; description 'Discover imagery that moves you. Build something that moves the world.'; search; Explore the archive / Surprise me; right 3D artwork carousel with accessible previous/next/open controls; category band; Follow your curiosity collections; production libraries; recent assets; motion showcase; division directory; licensing.
Gallery: spacious editorial header, search, format shortcuts, saved filter and grid-density controls; existing facets and masonry results. Asset page: large image stage, clear rights/download panel, save/share controls. Shared navigation and responsive design extend to MCP/audit. Saved gallery reuses live favorites and existing previews; empty states explain the next action.

## 3D / 2.5D architecture
Lazy-loaded Three.js uses the same five existing image renditions as the DOM carousel. Museum display panels have thickness, perspective, restrained lighting, and user-directed movement. DOM artwork stack is the initial render and WebGL fallback. No essential control exists only in canvas. Pointer parallax is fine-pointer only; touch swipe retains vertical page scroll. No autoplay rotation. Frame loop runs only during input/tween and while visible. DPR capped at 1.5; render size follows container. Reduced motion uses an instant/static composition. Pause, context-loss recovery, visibility and disposal are explicit.

## Interaction and access
44px minimum touch targets; visible focus; native buttons/links/dialogs; keyboard arrows only within gallery; route navigation does not require a scene. Menu retains focus management and Escape. Search keeps original semantics. Save changes synchronize across surfaces; storage failures do not break previews. Share uses native share if supported, clipboard with recoverable failure otherwise. Every interactive state must remain legible.

## Responsive
Desktop split hero. Tablet balanced stack. Mobile title, search and primary action precede an equally detailed swipeable gallery; 2-column collection strip and 1/2-column asset density options. Fixed bottom navigation includes Home, Explore, Saved and Search with safe-area spacing. No horizontal page overflow at 320px. Motion preference applies across CSS and WebGL. Filters wrap instead of trapping horizontal scroll.

## Verification
Build, existing unit and browser suites plus targeted carousel, saved, sharing and responsive regressions. Inspect 1440px desktop, 390px mobile and 320px narrow viewport; keyboard navigation; reduced motion; no-WebGL fallback; actual WebGL scene; network errors; no hidden essential features. No guarantee of virality or unmeasured physical-device performance.
