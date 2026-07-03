# Pastel gradient-mesh page background

## Why

Reference: Steep's marketing site uses a calm, almost-static, blurred
multi-hue pastel gradient mesh behind floating dashboard cards (peach/pink/
lavender/blue). We want that *calm, settled* quality — replacing the
current animated WebGL liquid-noise shader (`initBgCanvas` in
`js/calculator.js`), which is too actively flowing for this look — while
staying entirely within our existing "Graph Paper Calm" palette rather
than introducing new pastel hues.

Initially implemented as a multi-hue mesh (teal/blue/rose, per the
Composition section below) to most closely match the reference. After
shipping, a follow-up request restricted the palette to blue-only — see
the updated Composition section, which now documents what's actually
live rather than the original multi-hue exploration.

## Placement

A single wrapper, `<div class="bg-mesh" aria-hidden="true">`, replacing
`<canvas id="bgCanvas">` in `actual website.html`. `position: fixed`,
`top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `z-index: -2`,
`pointer-events: none`, `overflow: hidden`. Fixed to the viewport (not
document height) — matches the WebGL canvas's existing behavior: cheaper
than a document-height element, and still satisfies "visible behind every
card at any scroll position" because fixed elements show through
regardless of scroll offset.

## Composition

**Shipped (blue-only):** 5 plain `<span class="mesh-blob mesh-blob--N">`
children inside the wrapper, each a circle 320–480px across, blurred
`filter: blur(80px)`, `mix-blend-mode: multiply`, opacity 0.16–0.26.
Colors alternate between only `--blue` and `--blue-focus` — no teal or
rose — at varying opacity/size to create depth without introducing a
second hue:
1. `--blue`, 480px, top-left (`top: -8%; left: -6%`), opacity 0.26
2. `--blue-focus`, 420px, top-right (`top: 6%; right: -8%`), opacity 0.22
3. `--blue`, 380px, bottom-left (`bottom: 4%; left: 8%`), opacity 0.16
4. `--blue-focus`, 320px, bottom-right (`bottom: -6%; right: 12%`),
   opacity 0.2
5. `--blue`, 340px, center (`top: 30%; left: 38%`), opacity 0.18

Positioned asymmetrically by percentage offsets, not grid-aligned, echoing
the reference's scattered-but-balanced feel.

<details>
<summary>Original multi-hue exploration (not shipped)</summary>

The first version used 5–6 blobs across three hues, tinted toward
`--paper`/white for pastel softness:
1. `--teal-bright` — large, upper-left
2. `--blue` — large, mid-right
3. `--rose-soft` — medium, lower-left (already a pastel tint, used as-is)
4. `--teal-bright` (smaller variant) — lower-right
5. `--blue` (smaller variant) — upper-center, optional 6th blob if the
   5-blob layout reads too sparse once implemented

A follow-up request replaced teal/rose with blue-only variants (see
above) for a calmer, single-hue look.

</details>

## Motion

Each blob gets its own `@keyframes` drift: slow `translate` (±20–40px),
slight `opacity` oscillation, 40–70s, `ease-in-out infinite alternate`.
Durations/delays differ per blob so they move asynchronously — "very
subtle drift," not a liquid flow. This is calmer/slower than the previous
liquid-gradient spec's 30–50s blobs, matching the more static reference.

`@media (prefers-reduced-motion: reduce)` freezes all blobs in their rest
position (`animation: none`), matching the existing convention used
elsewhere in `style.css` (hero title, cards, modal, and the WebGL shader
being replaced).

## Removal

Deletes, in `actual website.html`, `css/style.css`, and
`js/calculator.js`:
- `<canvas id="bgCanvas">` markup
- `.bg-canvas` CSS rule
- The entire `initBgCanvas` IIFE (WebGL context setup, fragment/vertex
  shader source, `colorRamp()`, animation loop)

Keeps: the `mouse` position tracker, `canHover`, and
`prefersReducedMotion` consts — the custom cursor depends on these and
must keep working unchanged. `prefersReducedMotion` is reused directly for
the new `@media` rule above (CSS-side, not JS-side, since there's no
canvas to drive anymore).

## Out of scope

- No new color tokens — pastel effect comes from low opacity + blur over
  `--paper`, not new hues.
- No WebGL/canvas — pure CSS blur + transform, per the chosen approach.
- No mobile-specific blur/opacity reduction unless it turns out to be a
  real perf problem after implementing — not pre-optimizing for a
  hypothetical.
- DESIGN.md's Overview section gets updated to describe the new pastel
  mesh background once implemented, replacing its current WebGL
  description.
