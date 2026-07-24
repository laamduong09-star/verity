# Rainbow glow behind the landing module accordion

**Date:** 2026-07-19
**Status:** Approved
**Reference:** amplemarket.com's grainy pastel shader glow behind their hero
folder stack (implemented there as a WebGL `shader-canvas`; inspected live
2026-07-19). We replicate ~90% of the look in pure CSS, per the repo's
"lightest tool that does the job" rule.

## What

A soft, slowly drifting rainbow glow — blurred pastel color blobs with a
grain texture — behind the six-module accordion on the landing page
(`index.html`, `<section id="modules">`). Decorative only. Landing page
only; no other page gets it.

Decisions made during brainstorming (user-directed):

- **Placement:** behind the module accordion (not the hero app-window).
- **Palette:** Amplemarket's rainbow family (lavender/pink/peach/mint) —
  chosen over reusing the six module pastels and over extending the blue
  aurora.
- **Approach:** pure-CSS blurred gradient blobs + SVG-noise grain overlay —
  chosen over re-skinning the aurora's interference-stripe technique (wrong
  visual: stripes, not blobs) and over a WebGL shader canvas (a whole JS
  subsystem for one decorative effect).

## Markup (index.html)

Inside `<section class="section" id="modules">`, as its first child (before
`.section-head`):

```html
<div class="acc-glow" aria-hidden="true"><span class="acc-glow-grain"></span></div>
```

One wrapper div (carries the two blob-cluster pseudo-elements), one span
(carries the grain, which must paint *above* the blobs — CSS paint order
puts a parent's background below its pseudo-elements, so the grain needs
its own element, not a third background layer).

## CSS (css/style.css, new block near the accordion styles)

### Containment

- `#modules` gets `position: relative; isolation: isolate;` so the glow
  stacks under the section's own content but cannot escape behind other
  sections' backgrounds.
- `.acc-glow`: `position: absolute; inset: -60px 0; z-index: -1;
  pointer-events: none; overflow: visible;`. The negative vertical inset
  lets the glow bleed a little past the section bounds so it reads as
  ambient light, not a striped band. `body { overflow-x: hidden }` (already
  present) absorbs any horizontal bleed.
- Soft edges: `.acc-glow` carries a `mask-image` (and `-webkit-` twin)
  linear-gradient fading to transparent over the top and bottom ~15% so
  the glow never hard-stops.

### Blob clusters (the color)

- `.acc-glow::before` — **left cluster**: stacked `radial-gradient`s of
  lavender `#a78bfa` and soft pink `#f0abcf` at roughly 40–50% alpha,
  positioned to bleed in from the section's left edge.
- `.acc-glow::after` — **right cluster**: peach `#fdba74` and mint
  `#a7f3d0`, same treatment, right edge.
- Both: large (each roughly 45–60% of the section's width, sized with
  percentages so mobile scales for free), `filter: blur(70px)`,
  `border-radius: 50%` unnecessary (the radial gradients fade to
  transparent themselves; the pseudo is just a transparent canvas).
- Exact gradient geometry (blob offsets, sizes, alpha per stop) is the
  implementer's to tune visually against the reference screenshot; the
  four hues above and the "bleed in from the edges, don't puddle in the
  center" composition are fixed.

### Motion (the "dynamic")

- Each cluster drifts on its own `transform`-only keyframe loop
  (translate a few tens of px + scale between ~0.95 and ~1.08):
  `::before` ~70s, `::after` ~90s, both `ease-in-out alternate infinite`
  so there is no loop snap. Different durations keep the two clusters out
  of phase forever.
- `transform`-only means fully composited — no repaint cost. Same
  performance discipline as the aurora's single-tile drift. `will-change:
  transform` on both pseudos.
- These are NEW elements — the `fadeUp`/`transform` fill-mode conflict
  documented for `.app-window` does not apply here (nothing else animates
  these pseudos), so plain `transform` in keyframes is safe.
- `prefers-reduced-motion: reduce`: `animation: none` on both pseudos —
  the glow stays as a static wash, exactly the aurora's fallback pattern.

### Grain (the shader-y texture)

- `.acc-glow-grain`: `position: absolute; inset: 0;` with a tiny tiled
  SVG `feTurbulence` noise as an inline `data:` URI background (no
  network request), `mix-blend-mode: soft-light`, opacity ~0.5, static
  (no animation — animated grain is the one Amplemarket nicety we skip;
  static grain reads correctly and costs nothing).
- The turbulence tile should be small (~120–200px square, `fractalNoise`,
  high `baseFrequency` ~0.8) so the grain is fine, not blotchy.

## Design-system fit

- **DESIGN.md**: add a provenance note alongside the aurora's entry — the
  glow is a *scoped decorative exception* introducing four non-system hues
  (lavender/pink/peach/mint), allowed only as this background layer on the
  landing accordion. Flat-pastel taxonomy, Two-Accent-in-Data-UI, and
  Hairline-Not-Shadow rules are untouched (this is background light, not
  UI color, fills, or borders).
- The white accordion cards sit on top; the glow shows around and between
  them — same figure/ground relationship as Amplemarket's folders on
  their shader.

## Out of scope

- Any other page or section.
- Animated grain, WebGL, hue-rotation cycling.
- Changes to the existing top-of-page aurora.
- JS of any kind.

## Verification

No unit-testable logic (pure CSS). Verify:

1. `node --test tests/budget-math.test.js tests/scroll-scale.test.js`
   still 11/11 (regression only; list files explicitly — the bare
   directory form has a known path quirk).
2. CSS brace balance still equal after the edit.
3. Live at `http://localhost:3000/website/` (cache-bust `style.css` via a
   `?v=` href swap — `location.reload(true)` is NOT sufficient in the
   preview browser):
   - Glow visible behind/around the accordion, colors bleeding from the
     left (lavender/pink) and right (peach/mint) edges.
   - Both clusters visibly drift over ~30s of watching; no layout shift,
     no scrollbar, `document.documentElement.scrollWidth <= clientWidth`.
   - `getComputedStyle` on the pseudos confirms `animation-name` set and
     `z-index: -1` layering (accordion cards paint above).
   - Emulate `prefers-reduced-motion: reduce` if the tooling allows;
     otherwise verify the media-query rule exists and targets both
     pseudos (code-level check — the session browser cannot emulate it,
     per the scroll-scale plan's Task 5 precedent).
   - Mobile 375px: glow present, no horizontal overflow.
4. Accordion still functions (click a head, panel opens) — the glow must
   not intercept clicks (`pointer-events: none`).

## Revision 2026-07-19: edge-columns (matching Amplemarket more closely)

First cut read as a diffuse pastel cloud across the whole section because
the blobs sat mid-section (28%/72%) behind the title and cards. Reworked to
match Amplemarket's actual technique (their effect is a full-width WebGL
canvas literally class-named "pillars"): the colour is pushed fully to the
left and right edges as two tall columns with the bright spot at each edge
(4%/0% left, 96%/100% right) fading toward a clean centre where the cards
sit; grain opacity raised 0.5 → 0.9. The glow box is now the section width
(`top/bottom: -40px; left/right: 0`) with `overflow: hidden`, and the
pseudo-columns are `left: 0; width: 100%` positioned purely by gradient
stops — so nothing extends past the section horizontally and the old 8px
mobile overflow is gone. Drift shortened to 26s/32s with smaller travel
(clipped by the glow's `overflow: hidden`). Verified live at 1680px and
375px: colour hugs both edges, centre clean, columns drift, zero horizontal
overflow at either width.
