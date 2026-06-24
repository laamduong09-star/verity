# Liquid-gradient page background

## Why

Reference: monopo.vn's hero uses an animated, dark, marbled liquid-chrome
gradient behind white text. We want the same "flowing abstract liquid
gradient" *technique*, but translated into our existing light, warm,
two-accent-color "Graph Paper Calm" system instead of a dark/moody one —
and applied as the page's general background atmosphere, replacing the
current dot constellation rather than living alongside it.

## Placement

A single wrapper, `.bg-liquid`, inserted in `actual website.html` right
after `<body>` (replacing `.hero-decor` and the two `.gutter-decor`
elements). `position: absolute`, `top: 0`, `left: 0`, `right: 0`,
`bottom: 0` against `body` (`body` is `position: relative`) — spans the
full scrollable document height, the same technique the old `.bg-grid`
used, not just the hero. `z-index: -2`, `pointer-events: none`,
`overflow: hidden` (so drifting blobs near an edge never introduce a
horizontal scrollbar), `aria-hidden="true"`.

## Composition

Four plain `<div class="liquid-blob liquid-blob--N">` children inside the
wrapper. Each is a large circle (`border-radius: 50%`, roughly 500–700px),
heavily blurred (`filter: blur(80–100px)`), at low opacity (~0.25–0.35) so
dark-ink body text stays comfortably readable wherever the page scrolls,
not just behind the hero.

Colors, using only existing tokens (no new ones, no rose — rose stays
reserved for the caution role elsewhere):
1. `--teal` — large, upper-left
2. `--blue` — large, upper-right
3. `--teal-bright` — medium, lower-center
4. `--card` (soft paper/white highlight) — adds the reference's "light
   catching the surface" feel without introducing a new color

## Motion

Each blob gets its own `@keyframes` drift: a slow `translate` + slight
`scale`, 30–50s, `ease-in-out infinite alternate`. Durations/delays differ
per blob so they move asynchronously rather than in lockstep — that
asynchrony is what reads as organic rather than mechanical.

`@media (prefers-reduced-motion: reduce)` freezes all four blobs in their
rest position (`animation: none`), matching the existing convention used
elsewhere in `style.css` for the hero title, cards, and modal.

## Removal

Deletes, in `actual website.html`, `css/style.css`, and `js/calculator.js`:
- `.hero-decor` and its 42 hardcoded `nth-child` keyframe-position rules
- `.gutter-decor` (both strips), `generateGutterPattern`,
  `createGutterStrip`, `gutterStrips`, `layoutGutterStrips`,
  `renderGutterStrips`, and the `GUTTER_*` constants

Keeps: the `mouse` position tracker, `canHover`, and
`prefersReducedMotion` — the custom cursor (dot + ring) depends on these
and must keep working unchanged.

## Out of scope

- No WebGL/canvas/SVG-filter shader — pure CSS blur + transform, per the
  chosen technique.
- No mobile-specific blur/opacity reduction unless it turns out to be a
  real perf problem after implementing — not pre-optimizing for a
  hypothetical.
- No rose-colored blob (see Composition above).
