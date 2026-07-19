# Accordion Rainbow Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A soft, slowly drifting Amplemarket-style rainbow glow (blurred pastel blobs + grain) behind the six-module accordion on the landing page.

**Architecture:** Pure CSS. One decorative `div` + `span` inside `<section id="modules">`; two pseudo-elements carry blurred radial-gradient blob clusters on slow transform-only drift loops; the span carries a static inline-SVG `feTurbulence` grain at `soft-light` blend. No JS, no dependencies.

**Tech Stack:** Hand-written HTML/CSS (this repo has no build step). Spec: `docs/superpowers/specs/2026-07-19-accordion-rainbow-glow-design.md`.

## Global Constraints

- Landing page only (`index.html`); no other page or section gets the glow.
- Bilingual rule: the glow is `aria-hidden` decoration with no text — do NOT add any `.en`/`.vi` spans or CSS display overrides for them.
- Palette is fixed: lavender `#a78bfa`, soft pink `#f0abcf`, peach `#fdba74`, mint `#a7f3d0` — these four hues appear ONLY inside the glow layer (scoped decorative exception; do not reuse elsewhere).
- Motion must be `transform`-only (composited), with a `prefers-reduced-motion` static fallback.
- The glow must never intercept clicks (`pointer-events: none`) or cause horizontal overflow.
- Run tests as `node --test tests/budget-math.test.js tests/scroll-scale.test.js` — never the bare directory form (`node --test tests/` hits an environment path quirk and fails with a misleading `Cannot find module 'tests'`).

---

### Task 1: Glow layer (markup + CSS)

**Files:**
- Modify: `index.html` (~line 248, inside `<section class="section" id="modules">`)
- Modify: `css/style.css` (new block; plus one addition to the existing accordion reduced-motion block at ~line 2967)

**Interfaces:**
- Produces: `.acc-glow` / `.acc-glow-grain` class names and the `glowDriftA`/`glowDriftB` keyframes (Task 3 verifies these by name via `getComputedStyle`).

- [ ] **Step 1: Add the markup**

In `index.html`, the modules section currently opens:

```html
  <section class="section" id="modules">
    <div class="section-head">
```

Insert the glow element between those two lines, as the section's first child:

```html
  <section class="section" id="modules">
    <div class="acc-glow" aria-hidden="true"><span class="acc-glow-grain"></span></div>
    <div class="section-head">
```

- [ ] **Step 2: Add the CSS block**

In `css/style.css`, directly BEFORE the existing comment block `/* ==================================================================\n   Module-page iconography + pastel identity` (~line 2974), insert:

```css
/* ---------- Landing: accordion rainbow glow ---------- */
/* Amplemarket-reference pastel glow behind the module accordion (spec:
   docs/superpowers/specs/2026-07-19-accordion-rainbow-glow-design.md).
   Pure CSS stand-in for the reference's WebGL shader: two blurred
   radial-gradient blob clusters drifting on transform-only loops, plus
   a static SVG-noise grain. The four hues here are a scoped decorative
   exception (DESIGN.md provenance note) — they exist nowhere else in
   the system. */
#modules {
  position: relative;
  isolation: isolate;
}

.acc-glow {
  position: absolute;
  inset: -60px 0;
  z-index: -1;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 15%, #000 85%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 15%, #000 85%, transparent 100%);
}

.acc-glow::before,
.acc-glow::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60%;
  filter: blur(70px);
  will-change: transform;
}

/* Left cluster: lavender + soft pink bleeding in from the left edge. */
.acc-glow::before {
  left: -12%;
  background-image:
    radial-gradient(42% 34% at 28% 26%, rgba(167, 139, 250, 0.5), transparent 70%),
    radial-gradient(38% 30% at 18% 68%, rgba(240, 171, 207, 0.45), transparent 70%);
  animation: glowDriftA 70s ease-in-out infinite alternate;
}

/* Right cluster: peach + mint bleeding in from the right edge. */
.acc-glow::after {
  right: -12%;
  background-image:
    radial-gradient(42% 34% at 72% 30%, rgba(253, 186, 116, 0.5), transparent 70%),
    radial-gradient(36% 30% at 82% 72%, rgba(167, 243, 208, 0.45), transparent 70%);
  animation: glowDriftB 90s ease-in-out infinite alternate;
}

/* Different durations keep the clusters out of phase forever; alternate
   direction means no loop snap. transform-only = fully composited. */
@keyframes glowDriftA {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(40px, -30px, 0) scale(1.08); }
}

@keyframes glowDriftB {
  from { transform: translate3d(0, 0, 0) scale(1.06); }
  to { transform: translate3d(-45px, 25px, 0) scale(0.96); }
}

/* Grain: tiny tiled feTurbulence noise, painted above the blobs. It
   needs its own element — a parent's background paints BELOW its
   pseudo-elements, so a third background layer on .acc-glow could
   never sit on top of the ::before/::after blobs. */
.acc-glow-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
  opacity: 0.5;
}
```

These are NEW elements — the `fadeUp`/`transform` fill-mode conflict documented for `.app-window` does not apply (nothing else animates these pseudos), so plain `transform` keyframes are safe here.

- [ ] **Step 3: Reduced-motion fallback**

In the EXISTING accordion reduced-motion block (~line 2967):

```css
@media (prefers-reduced-motion: reduce) {
  .acc-panel,
  .acc-icon {
    transition: none;
  }
}
```

extend it to:

```css
@media (prefers-reduced-motion: reduce) {
  .acc-panel,
  .acc-icon {
    transition: none;
  }

  .acc-glow::before,
  .acc-glow::after {
    animation: none;
  }
}
```

(The glow stays as a static wash — same fallback pattern as the aurora.)

- [ ] **Step 4: Checks**

Run from the repo root:
- `node --test tests/budget-math.test.js tests/scroll-scale.test.js` → expected: 11/11 pass (regression only; this task touches no JS).
- CSS brace balance: `grep -c '{' css/style.css` and `grep -c '}' css/style.css` → expected: equal counts (they were 494/494 before this task; the new block adds 12 `{`/`}` pairs and the reduced-motion extension adds 1 more → 507/507).
- `acc-glow` appears exactly 3 times in the codebase's HTML: `grep -c 'acc-glow' index.html` → expected 2 (div + span); `grep -rl 'acc-glow' --include='*.html' .` → expected only `./index.html`.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "Add rainbow glow behind the landing module accordion

Amplemarket-reference pastel glow as pure CSS: lavender/pink cluster
left, peach/mint right, blur(70px), transform-only drift loops (70s/90s
alternate), static feTurbulence grain at soft-light. Scoped decorative
exception; reduced-motion freezes it to a static wash.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 2: DESIGN.md provenance note

**Files:**
- Modify: `DESIGN.md` (the "Adopted" list in section 1 — the list containing the scroll-scale bullet)

**Interfaces:**
- Consumes: the shipped class names from Task 1 (`.acc-glow`, `.acc-glow-grain`) — the note must match the real code.

- [ ] **Step 1: Add the bullet**

In `DESIGN.md`, find the bullet that ends `…see the spec's second size-increase addendum).` (the scroll-scale bullet, ~line 137). Directly AFTER that bullet (before the `**The bilingual .en/.vi span system**` bullet), insert:

```markdown
- **The accordion rainbow glow** (2026-07-19, user-directed) — an
  Amplemarket-reference pastel glow behind the landing module accordion
  (`.acc-glow` + `.acc-glow-grain` inside `#modules`, landing page only):
  two blurred radial-gradient blob clusters (lavender `#a78bfa` + pink
  `#f0abcf` left, peach `#fdba74` + mint `#a7f3d0` right) drifting on
  slow transform-only loops under a static SVG `feTurbulence` grain at
  `soft-light`. Pure CSS stand-in for the reference's WebGL shader. These
  four hues are a **scoped decorative exception**: background light only,
  never UI color — Pastel-Taxonomy, Two-Accent-in-Data-UI, and
  Hairline-Not-Shadow are unaffected. Freezes to a static wash under
  `prefers-reduced-motion`, same as the aurora.
```

- [ ] **Step 2: Verify the note against live code**

Read the shipped `css/style.css` glow block and confirm every claim in the bullet (class names, four hex values, blend mode, reduced-motion behavior) matches the code exactly. Fix the bullet (not the code) on any mismatch.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "Document the accordion rainbow glow as a scoped decorative exception

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 3: Live verification pass

**Files:** none (verification only; fix-forward any failures and note them).

**Note:** This task needs the preview browser, which the executor subagent cannot drive — it runs in the orchestrating session.

- [ ] **Step 1: Automated checks**

- `node --test tests/budget-math.test.js tests/scroll-scale.test.js` → 11/11.
- CSS brace balance → equal counts (507/507 expected).

- [ ] **Step 2: Browser checklist**

On `http://localhost:3000/website/` (cache-bust `style.css` by swapping the stylesheet `href` with a `?v=` param — `location.reload(true)` does NOT refresh it in the preview browser):

- [ ] Glow visible behind/around the accordion: lavender/pink from the left edge, peach/mint from the right.
- [ ] `getComputedStyle` on the pseudos: `animation-name` is `glowDriftA`/`glowDriftB`, `filter` contains `blur(70px)`; `.acc-glow` has `z-index: -1` and `pointer-events: none`.
- [ ] No horizontal overflow: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- [ ] Accordion still functions: click the Budget head → panel opens (glow doesn't intercept).
- [ ] Reduced-motion: the session browser cannot emulate `prefers-reduced-motion` (established in the scroll-scale plan, Task 5) — verify at code level that the accordion reduced-motion block now also targets `.acc-glow::before/::after` with `animation: none`.
- [ ] Mobile 375px: glow present, no horizontal overflow, accordion stacks normally.
- [ ] Screenshot the accordion section for the user (desktop width).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "Fix issues found in accordion glow verification pass"
```

(Skip if nothing changed.)
