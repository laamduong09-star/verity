# App-Window Mockup: Scroll-Scale Effect + Chrome Dot Colors — Design

**Date:** 2026-07-12
**Status:** Approved (user-approved design, this doc is the written record)

## Purpose

Two small polish additions to the landing page's `.app-window` hero mockup
(the macOS-style "window" showing the compound calculator's anatomy, in
`index.html`):

1. A scroll-scrubbed scale-in effect, modeled directly on
   `https://www.amplemarket.com/`'s hero product screenshot.
2. Real macOS traffic-light colors on the three `.window-dot` chrome dots
   (currently flat `--stone` gray, all three identical).

## Part 1: Scroll-scale effect

### Reference behavior (measured directly from amplemarket.com)

Inspected `.am-demo-video-border`'s inline `transform` at several scroll
positions:

| `scrollY` | `scale3d(...)` |
|-----------|----------------|
| 0 | 0.828272 |
| 200 (scrolling up from 300) | 0.914616 |
| 300 | 0.991872 |
| 500 | 1 (caps here) |

Confirmed properties:
- **Reversible / scroll-scrubbed**, not a one-time trigger — scrolling back
  up shrinks the element again, tracking scroll position directly.
- **Scale only** — `translate3d` stays `(0px, 0px, 0px)` throughout;
  `opacity` stays `1`. No position shift, no fade.
- Linear-ish interpolation from **~0.83 at `scrollY=0`** to **1.0 at
  `scrollY≈500`**, clamped at 1.0 beyond that.

### Chosen behavior for Verity's `.app-window`

Matches the reference exactly: scale interpolates linearly from **0.83** at
`scrollY = 0` to **1.0** at `scrollY = 500`, clamped to `[0.83, 1.0]` outside
that range, recalculated on every scroll event (reversible).

### Implementation — vanilla JS scroll listener

Chosen over native CSS `animation-timeline: scroll()` (elegant, zero-JS, but
silently falls back to "always full size" on browsers lacking support —
inconsistent behavior was judged worse than a few lines of JS) and over
GSAP + ScrollTrigger (exact library Amplemarket uses, but adds an external
animation dependency for one decorative effect, against this repo's
"lightest tool that does the job" rule).

- New block appended to `js/landing.js` (already loaded only on
  `index.html`).
- rAF-throttled `scroll` listener — same guard pattern as the topbar's
  compacting-scroll listener in `js/site.js` (a `ticking` boolean set in the
  listener and cleared inside the `requestAnimationFrame` callback, so at
  most one calculation runs per frame no matter how many `scroll` events
  fire).
- Each frame: `progress = clamp(window.scrollY / 500, 0, 1)`; write
  `appWindowEl.style.setProperty('--scroll-scale', 0.83 + 0.17 * progress)`.
- Runs once immediately on script load (not just on first scroll) so a
  mid-page reload starts at the scale matching the current scroll position,
  not always 0.83.
- **`prefers-reduced-motion` gate:** if
  `matchMedia('(prefers-reduced-motion: reduce)').matches` is true, the
  listener is never attached and `--scroll-scale` is never written — the
  CSS default (`var(--scroll-scale, 1)`) then keeps the mockup permanently
  at full size. Consistent with the existing reduced-motion block that
  already disables this element's entrance animation and hover transition.

### CSS changes (`css/style.css`)

`.app-window` (~line 2401) gains:

```css
transform: scale(var(--scroll-scale, 1));
transform-origin: top center;
```

`.app-window:hover` (~line 2420) changes from `transform: translateY(-3px);`
to `transform: scale(var(--scroll-scale, 1)) translateY(-3px);` so the
hover-lift and scroll-scale compose as plain CSS instead of one clobbering
the other (both are declarative now — no fighting with a JS-set inline
`transform`, since the JS only ever touches the `--scroll-scale` custom
property).

The existing `fadeUp` load-in animation (`animation: fadeUp 0.7s ease-out
both; animation-delay: 0.2s;`) is untouched — it completes in ~0.9s, well
before a user would scroll.

### Scope

Landing page only (`index.html`'s `.app-window`). No other page has this
element.

## Part 2: Window-chrome dot colors

### Chosen colors

Real macOS traffic-light hex values, for instant recognizability (chosen
over a muted/pastel variant and over staying strictly within the existing
token system — both discussed and explicitly declined):

```css
--window-dot-close: #ff5f57;    /* red */
--window-dot-minimize: #febc2e; /* yellow */
--window-dot-maximize: #28c840; /* green */
```

### Implementation

No HTML changes — the three `.window-dot` spans already exist in
left-to-right order in `index.html`. Colored via `nth-child` in
`css/style.css`, replacing the current flat `background: var(--stone);` on
`.window-dot`:

```css
.window-dot { width: 10px; height: 10px; border-radius: 50%; }
.window-dot:nth-child(1) { background: var(--window-dot-close); }
.window-dot:nth-child(2) { background: var(--window-dot-minimize); }
.window-dot:nth-child(3) { background: var(--window-dot-maximize); }
```

Flat fills only — no gradients, no glow, no hover state — consistent with
the Pastel-Taxonomy Rule's spirit even though these three tokens sit outside
the module-pastel system.

### DESIGN.md documentation

Document as a scoped, named exception in DESIGN.md, the same pattern already
used for the jargon page's category-badge color exception: these three
tokens are a widely-recognized UI convention (macOS window controls), not a
brand color choice, and are confined to exactly these three decorative dots
— not reused anywhere else on the site.

## Error handling / edge cases

- `prefers-reduced-motion`: covered above (Part 1).
- Very short pages / no scroll room: `progress` simply never exceeds a small
  fraction; the mockup stays close to its start scale. No special-casing
  needed — the clamp already bounds the value to `[0.83, 1.0]`.
- Nothing here is user-input-driven, so no validation surface beyond the
  clamp.

## Verification

- Load `index.html` at `scrollY = 0`: `.app-window` renders at 83% scale.
- Scroll to `scrollY = 250`: scale ≈ 0.915 (matches the reference's
  measured midpoint).
- Scroll to `scrollY ≥ 500`: scale = 1.0, stays capped scrolling further.
- Scroll back up: scale decreases again, matching the same formula (not a
  one-way reveal).
- Hover while partially scaled: hover lift (`translateY(-3px)`) still
  applies on top of the current scroll-scale.
- Emulate `prefers-reduced-motion: reduce` (browser dev tools): mockup
  stays at 100% scale regardless of scroll position.
- Chrome dots render red / yellow / green, left to right, flat fills, no
  hover/gradient.
- `node --check js/landing.js` after editing.
- CSS brace-balance check after editing `style.css`.

## Out of scope

- No changes to any other page.
- No changes to the mockup's content (mock inputs, chart bars) beyond what
  the scale transform naturally affects.
- No pinning/sticky behavior — only a scale transform, matching the
  reference's confirmed behavior.
