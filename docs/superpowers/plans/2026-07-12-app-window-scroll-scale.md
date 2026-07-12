# App-Window Scroll-Scale + Chrome Dot Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The landing page's `.app-window` hero mockup scales from 83% to 100% as the user scrolls the first 500px (reversible, reduced-motion-safe), and its three chrome dots render as real macOS red/yellow/green instead of flat gray.

**Architecture:** A pure, unit-tested scale-math function (`js/scroll-scale.js`, mirroring the existing `js/budget-math.js` pattern — plain script global + node:test via a `module.exports` guard) feeds an rAF-throttled scroll listener appended to `js/landing.js`, which writes a `--scroll-scale` CSS custom property onto `.app-window`. CSS consumes that property in a `transform: scale()`, composing with the existing hover lift. The dot colors are a separate, independent CSS-only change (three new tokens + `nth-child` selectors).

**Tech Stack:** Vanilla JS (no new dependency), `node --test` for the pure math, plain CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-07-12-app-window-scroll-scale-design.md`.

One correction found while reading the real code: the plan's earlier discussion referenced site.js's topbar scroll listener as "the rAF-throttle pattern to mirror" — but `js/site.js:51-61`'s `onScroll` has **no rAF guard**; it's a cheap boolean-threshold check that doesn't need one. Our listener recalculates a numeric scale on every scroll event and genuinely benefits from rAF batching, so Task 2 below writes a small `ticking`-flag rAF guard as a new (standard, but not copied-from-elsewhere) pattern in this codebase — documented as such in the code comment, not attributed to site.js.

## Global Constraints

- Scale interpolates **linearly from 0.83 at `scrollY = 0` to 1.0 at `scrollY = 500`**, clamped to `[0.83, 1.0]` outside that range. Reversible — recalculated on every scroll event, not a one-time trigger.
- No position or opacity change from this effect — scale only.
- Must respect `prefers-reduced-motion: reduce` — when set, the listener never attaches and the mockup stays permanently at 100% scale via the CSS default.
- Chrome dot colors: `--window-dot-close: #ff5f57` (red), `--window-dot-minimize: #febc2e` (yellow), `--window-dot-maximize: #28c840` (green) — flat fills only, no gradients/glow/hover state, applied by `nth-child` order (1st = close/red, 2nd = minimize/yellow, 3rd = maximize/green).
- Landing page only (`index.html`). No other page has `.app-window`.
- After editing any JS: `node --check js/<file>.js`. After editing `style.css`: brace-balance check.
- Commit after every task (repo: `C:\Users\user\Claude Code\Session\website`, branch `master`).

---

### Task 1: Pure scroll-scale math with unit tests

**Files:**
- Create: `js/scroll-scale.js`
- Create: `tests/scroll-scale.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: global function `computeScrollScale(scrollY)` → number in `[0.83, 1.0]`. Task 2's `landing.js` calls this as a global (plain script tag, no modules), same as `budget.js` calls `splitPaycheck`/`toMonthly` from `budget-math.js`.

- [ ] **Step 1: Write the failing tests**

Create `tests/scroll-scale.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeScrollScale } = require('../js/scroll-scale.js');

test('scrollY 0 gives the minimum scale', () => {
  assert.equal(computeScrollScale(0), 0.83);
});

test('scrollY 500 gives the maximum scale', () => {
  assert.equal(computeScrollScale(500), 1);
});

test('scrollY beyond 500 stays clamped at the maximum', () => {
  assert.equal(computeScrollScale(1200), 1);
});

test('negative scrollY stays clamped at the minimum', () => {
  assert.equal(computeScrollScale(-80), 0.83);
});

test('scrollY 250 (halfway) gives the midpoint scale', () => {
  assert.ok(Math.abs(computeScrollScale(250) - 0.915) < 1e-9);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/scroll-scale.test.js` (from the `website` directory)
Expected: FAIL — `Cannot find module '../js/scroll-scale.js'`

- [ ] **Step 3: Write the implementation**

Create `js/scroll-scale.js`:

```js
// Pure math for the app-window scroll-scale effect — no DOM access.
// Loaded as a plain script in the browser (computeScrollScale becomes a
// global used by js/landing.js) and required directly by the node:test
// suite, hence the exports guard (same pattern as js/budget-math.js).
//
// Linear interpolation from MIN_SCALE at scrollY=0 to MAX_SCALE at
// scrollY=DISTANCE, clamped outside that range — measured and chosen to
// match the scale-in effect on amplemarket.com's hero product shot (see
// docs/superpowers/specs/2026-07-12-app-window-scroll-scale-design.md).
const MIN_SCALE = 0.83;
const MAX_SCALE = 1.0;
const SCROLL_DISTANCE = 500;

function computeScrollScale(scrollY) {
  const progress = Math.min(Math.max(scrollY / SCROLL_DISTANCE, 0), 1);
  return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
}

if (typeof module !== 'undefined') {
  module.exports = { computeScrollScale };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/scroll-scale.test.js`
Expected: 5 passing, 0 failing. Also run `node --check js/scroll-scale.js` — clean exit.

- [ ] **Step 5: Commit**

```bash
git add js/scroll-scale.js tests/scroll-scale.test.js
git commit -m "Add pure scroll-scale math for the app-window effect, with node:test coverage"
```

---

### Task 2: Wire the scroll listener into landing.js + CSS transform

**Files:**
- Modify: `js/landing.js`
- Modify: `index.html:585-586` (script tag order)
- Modify: `css/style.css:2401-2423` (`.app-window`, `.app-window:hover`), `css/style.css:2534-2544` (reduced-motion block — no change needed, already covers `.app-window`, verified in Step 3)

**Interfaces:**
- Consumes: global `computeScrollScale(scrollY)` from Task 1's `js/scroll-scale.js`.
- Produces: `.app-window` element carrying a live `--scroll-scale` custom property, consumed by CSS. No new JS interface for later tasks (Task 3 is independent CSS-only work).

- [ ] **Step 1: Add the script tag**

In `index.html`, change lines 585-586 from:

```html
<script src="js/site.js"></script>
<script src="js/landing.js"></script>
```

to:

```html
<script src="js/site.js"></script>
<script src="js/scroll-scale.js"></script>
<script src="js/landing.js"></script>
```

- [ ] **Step 2: Append the scroll listener to js/landing.js**

Add this block at the end of the existing IIFE in `js/landing.js` (inside the closing `})();` — i.e. insert directly before the final `})();` line):

```js

  /* ---------- App-window scroll-scale ---------- */
  // Mirrors amplemarket.com's hero product-shot behavior: the mockup
  // starts slightly smaller and scales up to full size as the user
  // scrolls through the first 500px (see computeScrollScale in
  // js/scroll-scale.js), reversible in both directions. Skipped entirely
  // under prefers-reduced-motion, leaving the CSS default (--scroll-scale
  // unset -> scale(1), full size) permanently in place.
  var appWindow = document.querySelector('.app-window');
  var prefersReducedMotionScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (appWindow && !prefersReducedMotionScroll) {
    var scaleTicking = false;

    var applyScrollScale = function () {
      appWindow.style.setProperty('--scroll-scale', computeScrollScale(window.scrollY));
      scaleTicking = false;
    };

    var onScrollScale = function () {
      if (!scaleTicking) {
        scaleTicking = true;
        requestAnimationFrame(applyScrollScale);
      }
    };

    window.addEventListener('scroll', onScrollScale, { passive: true });
    applyScrollScale();
  }
```

- [ ] **Step 3: Update the CSS**

In `css/style.css`, change the `.app-window` rule (currently lines 2401-2418):

```css
.app-window {
  display: block;
  position: relative;
  max-width: 960px;
  margin: 56px auto 0;
  text-align: left;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 26px 60px -6px rgba(17, 17, 17, 0.12), 0 28px 28px -14px rgba(17, 17, 17, 0.02),
    0 6px 6px -3px rgba(17, 17, 17, 0.04), 0 1px 1px -0.5px rgba(17, 17, 17, 0.04);
  animation: fadeUp 0.7s ease-out both;
  animation-delay: 0.2s;
  transition: transform 0.2s var(--ease-out-strong), border-color 0.2s var(--ease-out-strong);
  transform: scale(var(--scroll-scale, 1));
  transform-origin: top center;
}

.app-window:hover {
  transform: scale(var(--scroll-scale, 1)) translateY(-3px);
  border-color: rgba(17, 17, 17, 0.18);
}
```

(Only two lines actually change: the added `transform: scale(var(--scroll-scale, 1));` + `transform-origin: top center;` inside `.app-window`, and `.app-window:hover`'s `transform` value gains the `scale(var(--scroll-scale, 1))` prefix. Everything else in the block is unchanged — shown in full so the diff is unambiguous.)

- [ ] **Step 4: Confirm the reduced-motion block already covers this (no edit needed)**

Read `css/style.css:2534-2544` and confirm it still reads:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-pill,
  .hero-trust,
  .app-window {
    animation: none;
  }

  .app-window {
    transition: none;
  }
}
```

This already exists and needs no change — combined with Step 2's JS-level `prefersReducedMotionScroll` guard (which prevents `--scroll-scale` from ever being written), a reduced-motion user gets `scale(var(--scroll-scale, 1))` evaluating to `scale(1)` permanently, with no transition/animation on top.

- [ ] **Step 5: Syntax and brace checks**

Run: `node --check js/landing.js`
Expected: clean exit.

Run: `node -e "const s=require('fs').readFileSync('css/style.css','utf8');console.log((s.match(/{/g)||[]).length,(s.match(/}/g)||[]).length)"`
Expected: two equal numbers.

- [ ] **Step 6: Verify in the preview browser**

On `http://localhost:3000/website/`:
- At the top of the page (`scrollY = 0`): `getComputedStyle(document.querySelector('.app-window')).transform` reflects `scale(0.83)` (a 2D matrix equivalent — check via `element.style.getPropertyValue('--scroll-scale')` for the readable number instead).
- Scroll to `window.scrollY ≈ 250`: `--scroll-scale` ≈ `0.915`.
- Scroll to `window.scrollY ≥ 500`: `--scroll-scale` = `1`, stays there scrolling further.
- Scroll back up to `0`: value decreases back toward `0.83` (reversible, not a one-way reveal).
- Hover over `.app-window` while partway scaled: the element lifts (`translateY(-3px)`) on top of whatever the current scroll-scale is — check via `getComputedStyle`, transform should be a single composed matrix, not just the translate.
- Emulate `prefers-reduced-motion: reduce` (browser dev tools or `resize_window`'s `colorScheme` sibling setting if available, otherwise via the OS/browser setting), reload, scroll: `--scroll-scale` is never set (property reads empty string), element stays visually full-size throughout.

- [ ] **Step 7: Commit**

```bash
git add js/landing.js index.html css/style.css
git commit -m "Add scroll-scrubbed scale effect to the landing page app-window mockup"
```

---

### Task 3: Chrome dot colors

**Files:**
- Modify: `css/style.css` (`:root` token block, ~line 34-45; `.window-dot` rule, ~line 2434-2439)

**Interfaces:**
- Consumes: nothing (independent of Tasks 1-2; touches only the `.window-dot` spans already present in `index.html`, no HTML change).
- Produces: three new CSS custom properties `--window-dot-close`, `--window-dot-minimize`, `--window-dot-maximize`, consumed only within this task's own `nth-child` rules.

- [ ] **Step 1: Add the three tokens to `:root`**

In `css/style.css`, directly after `--pastel-family: #99fff9;` (or after `--pastel-budget` if the budget module plan has already landed — insert immediately after whichever pastel token is currently last), add:

```css
  --window-dot-close: #ff5f57;
  --window-dot-minimize: #febc2e;
  --window-dot-maximize: #28c840;
```

- [ ] **Step 2: Replace the `.window-dot` rule**

Change (currently ~line 2434-2439):

```css
.window-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--stone);
}
```

to:

```css
.window-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Real macOS traffic-light colors — a recognized UI convention, not a
   brand color choice, so these three tokens intentionally sit outside
   the module-pastel system. Confined to these three dots only; see
   DESIGN.md's scoped-exception note. */
.window-dot:nth-child(1) { background: var(--window-dot-close); }
.window-dot:nth-child(2) { background: var(--window-dot-minimize); }
.window-dot:nth-child(3) { background: var(--window-dot-maximize); }
```

- [ ] **Step 3: Brace check and visual verification**

Run the same brace-balance one-liner as Task 2 Step 5.

On `http://localhost:3000/website/`, `.window-chrome`'s three dots read red, yellow, green left to right, flat fills, no gradient/glow, no hover state change.

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "Color the app-window chrome dots as real macOS red/yellow/green"
```

---

### Task 4: Documentation (DESIGN.md)

**Files:**
- Modify: `DESIGN.md`

- [ ] **Step 1: Add the two new tokens to frontmatter `colors`**

After the `pastel-*` entries in the YAML frontmatter `colors:` block, add:

```yaml
  window-dot-close: "#ff5f57"
  window-dot-minimize: "#febc2e"
  window-dot-maximize: "#28c840"
```

- [ ] **Step 2: Document the dot-color exception in §2 (Colors)**

Directly after the Module Pastel Taxonomy table and its "Pastel-Taxonomy Rule" paragraph, add a new short subsection:

```markdown
**Chrome-dot exception (2026-07-12, user-directed).** The landing page's
`.app-window` mockup's three window-chrome dots use real macOS traffic-light
colors (`--window-dot-close` red `#ff5f57`, `--window-dot-minimize` yellow
`#febc2e`, `--window-dot-maximize` green `#28c840`) rather than a module
pastel or a data-UI accent. This is a scoped exception, the same pattern as
the jargon page's category-badge exception: it's a widely recognized UI
convention (macOS window controls), not a brand color decision, and it's
confined to exactly these three decorative dots — nowhere else on the site
uses these tokens.
```

- [ ] **Step 3: Document the scroll-scale effect in the Provenance section (§1)**

In the "Provenance — kept from Verity, on purpose" list, after the aurora-background bullet, add:

```markdown
- **App-window scroll-scale** (2026-07-12, user-directed, adapted from a
  supplied reference at amplemarket.com): the landing hero's `.app-window`
  mockup scales from 83% to 100% as the user scrolls the first 500px,
  reversibly (scrolling back up shrinks it again). Implemented as a small
  vanilla-JS scroll listener writing a `--scroll-scale` CSS custom property
  (`js/landing.js` + `js/scroll-scale.js`), not the reference's GSAP
  ScrollTrigger — chosen to avoid adding an external animation dependency
  for one decorative effect. Respects `prefers-reduced-motion`.
```

- [ ] **Step 4: Commit**

```bash
git add DESIGN.md
git commit -m "Document the app-window scroll-scale effect and chrome-dot color exception"
```

---

### Task 5: Full verification pass

**Files:** none (verification only; fix-forward any failures and note them).

- [ ] **Step 1: Automated checks**

- `node --test tests/scroll-scale.test.js` → 5 passing.
- `node --check js/scroll-scale.js js/landing.js` (run per file) → clean.
- CSS brace-balance one-liner → equal counts.

- [ ] **Step 2: Browser checklist (preview server)**

On `http://localhost:3000/website/`:
- [ ] Page load at `scrollY = 0`: mockup visibly smaller than its final size (~83%).
- [ ] Scroll down slowly to `scrollY ≈ 500`: mockup grows smoothly to full size, stops growing past that point.
- [ ] Scroll back to the top: mockup shrinks back down (reversible).
- [ ] Hover the mockup mid-scroll: hover lift still visible, composed with the current scale (not fighting or resetting it).
- [ ] `prefers-reduced-motion: reduce` emulated: mockup stays full-size at every scroll position; no console errors from the guarded-off listener.
- [ ] Chrome dots: red, yellow, green, left to right, flat, no hover change.
- [ ] Mobile width (375px, `resize_window`): mockup still centered, chip/dot rendering unaffected (dots are decorative and don't reflow).
- [ ] No regressions elsewhere: nav, footer, hero CTAs, and the rest of the landing page unaffected; `getComputedStyle(document.body).backgroundColor` still `rgb(246, 245, 243)`.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "Fix issues found in app-window scroll-scale verification pass"
```

(Skip if nothing changed.)
