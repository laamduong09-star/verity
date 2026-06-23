# Side-Gutter Constellation — Design Spec

## Summary

Add an interactive, cursor-reactive constellation (dots + connecting lines) to the left and right gutters of the page — the empty space outside the centered 1200px content column on wide screens. This finishes a concept DESIGN.md's Overview already names ("a loose constellation of floating dots") but never actually built: the existing hero dots float with no connecting lines. The gutter version gets both the lines and a new cursor-repulsion interaction the hero dots don't have.

## Why this instead of the alternatives considered

Clouds (the original idea, including a pixel-art treatment matching a user-supplied reference image) were explored and rejected: they're an unrelated weather/sky motif with no connection to a compound-interest calculator, and would look fine on literally any site — the opposite of distinctive. A faint uptrend sparkline and a soft blurred color-wash were also considered; the constellation won because it's the only option that's both visually distinctive *and* literally completes an existing, already-documented system concept rather than introducing a new one.

## Scope

**In scope:**
- Two new decorative layers, one per side gutter, each ~140px wide, full viewport height
- Visible only above a 1400px viewport width (below that, gutters are too narrow to hold this without crowding the real layout — it simply doesn't render, no responsive repositioning attempted)
- ~6–8 dots per strip connected by a loose chain of lines (not a dense mesh)
- Ambient bob animation reusing the existing `dotFloat` keyframe (same device as the hero dots, new coordinates)
- Cursor-reactive physics: dots repel from the cursor within a radius and spring back to their rest position when it moves away; connecting lines redraw live to stay attached to their dot's current position
- `prefers-reduced-motion` freezes both the ambient bob and the cursor interaction entirely (dots render statically at rest position)
- `(hover: hover) and (pointer: fine)` gates the cursor interaction off entirely on touch devices (no real cursor to react to)
- `aria-hidden="true"` on both strips — pure decoration, same treatment as the existing `.bg-grid` and `.hero-decor`

**Out of scope:**
- Any change to the existing hero dot field (it stays exactly as-is; this is a separate, new device)
- Mobile/tablet layout (gutters don't exist below 1400px, nothing to add there)
- Any non-decorative behavior (this never affects layout, scroll, or any real interactive element)

## Visual design

- Dots: same opacity range as the existing hero dots (~0.2–0.5), radius 3–4px, fill `var(--blue)` (Constellation Blue — the system's "interactive/decorative" accent, and now literally interactive)
- Lines: `var(--blue)`, opacity ~0.2–0.25 — fainter than the dots themselves, so dots read as the bright points and lines as quiet connective tissue, matching how a real constellation reads (bright stars, faint lines)
- Implementation: inline SVG per strip (not the div+CSS-transform technique the hero dots use) — SVG natively supports `<line>` elements with live-updatable endpoints, which the cursor-repulsion interaction requires every frame

## Motion

**Ambient (always on, modulo reduced-motion):** Each dot bobs via the existing `dotFloat` keyframe (`translateY` + opacity pulse), staggered per dot. Lines stay static at rest; the bob amplitude is small enough that a static line endpoint won't visibly disconnect from its softly-bobbing dot.

**Cursor interaction (added on top, requires JS):** A `requestAnimationFrame` loop per strip tracks each dot's rest position and current position/velocity:
- On `mousemove` within the strip, any dot within `REPEL_RADIUS` (~90px in demo units, scale to the strip's actual coordinate space) gets pushed away from the cursor, force falling off with distance
- A spring force (`SPRING` constant, ~0.06) continuously pulls each dot back toward its rest position
- A damping factor (~0.82) prevents oscillation/overshoot, so the return-to-rest reads as a smooth settle, not a bounce
- On `mouseleave`, the repulsion force stops applying and the spring alone carries dots back to rest
- Validated live via an interactive demo during design (8 points, 7 connecting lines, same constants) — user-approved as "feels right," so these constants carry over as the starting values, tunable after it's live in the real strip width if the proportions feel different at 140px vs. the demo's 500px panel

## Accessibility

- Both strips: `aria-hidden="true"`, `pointer-events: none` is **not** applied (the strip needs to receive `mousemove` for the interaction) — but the strips have no focusable content and convey no information, so this doesn't create a keyboard-nav or screen-reader issue
- `@media (prefers-reduced-motion: reduce)`: disable the `dotFloat` animation (existing pattern, just extend its selector to include the new dots) and skip starting the cursor-interaction `requestAnimationFrame` loop entirely — dots render once at rest position and never move
- `@media (hover: hover) and (pointer: fine)`: gate the `mousemove` listener setup behind this so touch devices never attach it (matches the existing convention used for card hover-lift elsewhere in the CSS)

## Files touched

- `actual website.html` — two new container elements (e.g. `<div class="gutter-decor gutter-decor--left" aria-hidden="true"><svg>...</svg></div>` and the right-side equivalent), placed once near the top of `<body>` so they sit behind all page content regardless of scroll position
- `css/style.css` — `.gutter-decor` positioning/sizing, the 1400px visibility breakpoint, extending the existing `dotFloat` / `prefers-reduced-motion` rules to cover the new dots
- `js/calculator.js` — the per-strip rAF physics loop (rest/current/velocity tracking, repulsion + spring + damping, live SVG attribute updates), gated behind the `(hover: hover) and (pointer: fine)` media query check in JS (`matchMedia`)

## Open questions for implementation

None — constants and behavior were validated live via the interactive demo before this spec was written. The implementer should treat the demo's `REPEL_RADIUS`/`REPEL_STRENGTH`/`SPRING`/`DAMPING` values as the starting point and re-tune only if the 140px strip width makes the proportions feel different from the 500px demo panel.
