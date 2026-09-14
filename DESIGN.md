---
name: Verity
description: A bilingual EN/VI financial literacy toolset, starting with a compound interest calculator
colors:
  paper: "#f6f5f3"
  chalk: "#fcfbf9"
  pearl: "#ecebea"
  card: "#ffffff"
  veil: "rgba(255,255,255,0.8)"
  ink: "#111111"
  charcoal: "#111111"
  slate: "#6d6c6b"
  stone: "#b1b1af"
  border: "rgba(17, 17, 17, 0.08)"
  teal: "#0b5a55"
  teal-bright: "#0e7a72"
  blue: "#2348ad"
  blue-focus: "#2f5abf"
  rose: "#c2255c"
  rose-soft: "rgba(194, 37, 92, 0.14)"
  amber: "#c27e0a"
  pastel-calc: "#b7efb2"
  pastel-recommend: "#e2ddfd"
  pastel-jargon: "#ffef99"
  pastel-credit: "#ffd7f0"
  pastel-budget: "#ffddb5"
  window-dot-close: "#ff5f57"
  window-dot-minimize: "#febc2e"
  window-dot-maximize: "#28c840"
typography:
  poster:
    fontFamily: "Lexend, sans-serif"
    fontSize: "clamp(46px, 7vw, 84px)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.03em"
    textTransform: "uppercase"
  heading:
    fontFamily: "Lexend, sans-serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  heading-sm:
    fontFamily: "Lexend, sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Lexend, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  data:
    fontFamily: "Lexend, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
rounded:
  badge: "9999px"
  card: "12px"
  input: "12px"
  button: "8px"
  small: "4px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "28px"
  xl: "32px"
  band: "80-120px"
components:
  button-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "10px 16px"
  button-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "10px 16px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "28px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "13px 14px"
---

# Design System: Verity

## 1. Overview

**Creative North Star: "Sunlit Editorial Calm"**

This system is a deliberate hybrid, adopted 2026-07 from a supplied Amplemarket style reference and merged with the elements of Verity worth keeping. The page reads as a light, airy editorial product: a cream page background site-wide (`--paper`, was white on module pages until 2026-07-10), near-black warm ink type at whisper weights, and a flat-pastel taxonomy that color-codes the modules (one pastel per module). It still explicitly rejects the stiff corporate banking dashboard (cold navy/gray, dense unexplained tables) and the gamified fintech app (confetti, casino urgency) — money here is calm, explained, and bilingual.

**Provenance — kept from Verity, on purpose:**
- **Lexend + Be Vietnam Pro.** Be Vietnam Pro is a Vietnamese-designed body face with native diacritics; the bilingual mission outranks typeface mimicry. Amplemarket's *typography philosophy* was adopted instead of its font.
- **The data-color meanings.** Teal = "result/positive outcome", blue = "interactive", rose = caution, amber = the one earned stat exception. These survive **inside data UI only** (chart, results, meters, focus rings, links) — chrome and decoration no longer use them.
- **The custom cursor** (blue dot + trailing ring) — a personality piece with no Amplemarket equivalent.
- **The blue ambient background** — *landing page only as of 2026-07-19 (user-directed).* Its form evolved blob mesh (`.bg-mesh`) → restored by user request → aurora wash (`.bg-aurora`, 2026-07-10, on every page) → **removed from the module pages 2026-07-19, kept only on the landing page (`index.html`)**. The aurora is blurred repeating-gradient ribbons (blue→indigo→violet stops) washing only the top ~820px of the landing page, masked to fade before the content shell; its drifting layer animates `transform` only. Every module page now carries its own ambient wash instead (see below); the aurora itself remains landing-only. Inside the module content blue still survives only in data UI (chart, results, meters, focus rings, links — the Two-Accent-in-Data-UI Rule) and the custom cursor.
- **The module hero washes** (`.bg-wash`, 2026-08-28, user-directed) — all six module pages reopen the ambient-wash exception, adapted from a supplied Amplemarket-style reference. Same device as the aurora (one `aria-hidden` div at `z-index: -2`, masked to clear before the content begins) but a different palette and a different texture: a static four-stop radial plus film grain from one inline `feTurbulence` tiled as a background-image. Nothing animates. The mechanism is shared and lives in one rule; only `--wash-stops` (and `--wash-height`, where a hero is an unusual size) is set per page, declared on the body next to `--module-pastel`. Two rules govern the palettes: **a page's wash hue is never its own pastel hue** — Jargon's pastel is canary and its wash is pink, Tuition's pastel is aqua and its wash is blush — which keeps the pastel as the page's identity colour, lets the wash read as light rather than as a bigger chip, and keeps the Pastel-Taxonomy Rule intact (those tokens stay flat fills, never gradients); and **no two nav-adjacent pages share a cast**, so across the nav the washes run periwinkle (Calculator), mint (Budget), gold (Recommend), pink (Jargon), sky (Credit), blush (Tuition). Every stop list ends on `--paper` at zero alpha so the wash dissolves rather than ending on an edge. Heights are tuned to measured landmarks; re-check them if a hero gains or loses a line.
- **App-window scroll-scale** (2026-07-12, user-directed, adapted from a
  supplied reference at amplemarket.com): the landing hero's `.app-window`
  mockup scales from 83% to 100% as the user scrolls the first 500px,
  reversibly (scrolling back up shrinks it again). Implemented as a small
  vanilla-JS scroll listener writing a `--scroll-scale` CSS custom property
  (`js/landing.js` + `js/scroll-scale.js`), not the reference's GSAP
  ScrollTrigger — chosen to avoid adding an external animation dependency
  for one decorative effect. Consumed via the standalone CSS `scale`
  property (`scale: var(--scroll-scale, 1);`), not `transform: scale(...)`
  — `.app-window` carries `animation: fadeUp 0.7s ease-out both`, and with
  fill-mode `both` the animation's own `transform` keyframes permanently
  outrank a plain `transform` declaration on the same element, so the
  effect is driven through `scale`, a separate CSS property `fadeUp` never
  touches. Respects `prefers-reduced-motion`. The mockup's `max-width` was
  also raised from `960px` to `1100px` (2026-07-12, user-directed) so it
  reads bigger in both its shrunk and full-scroll states, then to `1280px`
  with a `0.90` starting scale and a `-72px` side-bleed past `.page`'s
  1136px column on viewports ≥ 1345px (2026-07-18, user-directed — see
  the spec's second size-increase addendum).
- **The bilingual `.en`/`.vi` span system** — structural, untouchable.

**Dropped:** the 3px blue card hairline, the 200px CTA pills, Verity's darker paper canvas, and Amplemarket's phoenix orange (no role here). Also retired 2026-07-10: the jargon page's collapsed-by-default term list (`44278d8`) — replaced by the always-visible category directory (Amplemarket skills-library pattern; the section structure does the de-intimidating the collapse used to).

## 2. Colors

### Surfaces
- **Cream / paper** (`--paper`, `#f6f5f3`): the page background, site-wide as of 2026-07-10 (user-directed — first landing-only, then extended to every page; the separate white `--canvas` token was removed, since nothing renders it anymore). The same token also carries the **content shell** (the cream "subpage" below a page's hero — Amplemarket skills-library layout: dynamic backdrop above, flat cream surface below, hard edge; full-bleed via `.content-shell` breaking out of `.page`'s 1200px container, a nested `.page` div restoring the centered column), the full-bleed **quote band**, resting input fill, and example-box tints inside cards. Since page and shell are now the same color, there's no seam left to smooth over between them.
- **Chalk** (`--chalk`, `#fcfbf9`): one step lighter than paper, for alternating full-width **section bands** (`.section-band`) that separate adjacent sections by value rather than by rule or card — the reference layout's sectioning device. A band is a full-width child of `.content-shell` with a nested `.page` restoring the centred column. First used for recommend.html's "Not recommended" section, sitting between two paper sections; reusable on any module page. Also the surface for **panels that sit directly on the cream canvas** (recommend.html's `.rung-figure`), where pure white is a 3.4 L* step and reads as a hard block against `--paper`; chalk halves the step to 2.4 and leaves the hairline to separate. Cards use `--veil` rather than chalk — near-identical in value but translucent, so it composites over whatever sits behind it.
- **Pearl** (`#ecebea`): hover fill for ghost controls and nav chips.
- **Card** (`--card`, `#ffffff`): chrome surfaces only — buttons, the language toggle, the modal, the app-window mock, search suggestions, table cells. No longer the card fill.
- **Veil** (`--veil`, `rgba(255,255,255,0.8)`): the surface for every `.card`, measured from the reference layout's skills cards. Composites to ~`#fdfdfd` on `--paper`, a 1.4 L* step instead of white's 3.4, so the hairline does the separating rather than the tone — the Hairline-Not-Shadow Rule taken to its conclusion. Translucent rather than flat so a card on a `--chalk` band still reads. The reference drops its hairline for a faint shadow; Verity keeps the hairline and adds no shadow. Tinted stat cards (`.stat-card.tint-*`) override this with their own 6% colour wash.
- **Charcoal** (`#111111`, 2026-07-10 user-directed — darkened from the original `#272625`, which read as not dark enough; now identical to `--ink`, reused rather than adding a third dark value): the dark surface — the landing spotlight band, and every page's footer. Never navy.
- **Ink** (`#111111`): primary text and filled primary buttons. Never `#000`.
- **Slate/ash** (`#6d6c6b`) secondary text · **Stone** (`#b1b1af`) strong dividers and fills that were borders · **Hairline** (`rgba(17,17,17,0.08)`) all borders.

### Module Pastel Taxonomy
One flat pastel per module, used identically on the landing accordion chip, the page-hero glyph tile, card icon tiles, and the jargon suggestion glyphs. Declared once per page on `<body class="module-…">` as `--module-pastel`.

| Module | Pastel | Value |
|--------|--------|-------|
| Calculator | Mint | `#b7efb2` |
| Recommend | Soft Violet | `#e2ddfd` |
| Jargon | Canary | `#ffef99` |
| Credit | Petal Pink | `#ffd7f0` |
| Budget | Peach | `#ffddb5` |
| Tuition | Aqua | `#99fff9` |

Peach was chosen for Budget (2026-07-12) because the spec's first pick, lavender, collides with Recommend's soft violet.

Aqua `#99fff9` is **reserved for Tuition** (student loans and paying for college, PRD §6.5) — specced but not yet built, so don't hand aqua to anything else. No `--pastel-tuition` token exists in `style.css` yet; add it when the page is built, rather than carrying a variable nothing renders.

**The Pastel-Taxonomy Rule.** Pastels are flat fills only — never gradients, never hover states, never accent text, never shadowed. The flat color IS the elevation and the differentiation. Glyphs on pastel are always ink.

**Chrome-dot exception (2026-07-12, user-directed).** The landing page's
`.app-window` mockup's three window-chrome dots use real macOS traffic-light
colors (`--window-dot-close` red `#ff5f57`, `--window-dot-minimize` yellow
`#febc2e`, `--window-dot-maximize` green `#28c840`) rather than a module
pastel or a data-UI accent. This is a scoped exception, the same pattern as
the jargon page's category-badge exception: it's a widely recognized UI
convention (macOS window controls), not a brand color decision, and it's
confined to exactly these three decorative dots — nowhere else on the site
uses these tokens.

### Data accents
- **Teal** (`#0b5a55`): result/positive-outcome numbers (final balance, interest column, VI term names, payoff lines).
- **Blue** (`#2348ad`): interactive — cursor, text links, focus rings (`#2f5abf`), chart principal series, meters. Its one ambient/decorative use is the site-wide gradient mesh; otherwise not chrome, not decoration.
- **Rose** (`#c2255c`): reserved caution (clamp notes, myth tags, caution tiles/borders).
- **Amber** (`#c27e0a`): the one earned exception, the multiplier stat icon only.

**The Two-Accent-in-Data-UI Rule.** Teal and blue keep their old jobs, but their territory shrank to data UI. If a surface or chrome element wants color, it gets a module pastel or nothing.

**The Charcoal-Band Rule.** Exactly one dark *content* band per page maximum, always charcoal (`#111111`, same value as `--ink` as of 2026-07-10). Full-bleed as of 2026-07-10 (broken out of `.page` via the `.content-shell` pattern — unconstrained parent + nested `.page` wrapper — not the naive `100vw` trick, which seams against the scrollbar). The site footer (2026-07-10, user-directed, Amplemarket reference) is charcoal on every page and sits outside this count — it's structural chrome at a fixed position, not a page-content moment, the same way the topbar isn't counted as "a light surface." A page may have both its own charcoal band and the charcoal footer at once (the landing page does); footer text follows the ink-band's existing dark-surface convention (white primary text, `rgba(255,255,255,0.65)` secondary, `rgba(255,255,255,0.45)` tertiary/legal), full-bleed with no separate treatment needed since it was never nested inside `.page` to begin with.

## 3. Typography

**Display Font:** Lexend · **Body Font:** Be Vietnam Pro (Vietnamese-native diacritics; see Provenance).

**Weight philosophy (adopted):** headings are weight **400** with aggressively negative tracking — authority through restraint. Weight 900 uppercase exists for exactly one poster moment: the landing "MONEY MADE EASY." hero. Card titles are 500. Nothing between 500 and 900 appears at heading sizes.

### Scale
- **Poster** (900, clamp 46–84px, uppercase, -0.03em, lh 1.1): landing hero only. Line-height stays 1.1 — the reference's 0.8 clips uppercase Vietnamese stacked diacritics.
- **Heading** (400, 44px, -0.04em): base `.hero-title` value, overridden everywhere it's actually used — see Heading-sm and Poster.
- **Heading-sm** (400, 36px, -0.03em): section titles, module page heroes — including the calculator (2026-07-10, user-directed: it used to run the bare 44px heading with no icon glyph and no separate subtitle paragraph, the one page that didn't match the other four; now identical structure and size to Recommend/Jargon/Credit).
- **Subheading** (400, 28px, -0.017em): jargon group titles.
- **Title** (500, 17–22px): card/modal/accordion titles.
- **Body** (400, 14–16px, Be Vietnam Pro): all sentence text. Cap ~70ch.
- **Label** (500, 12–14px) · **Eyebrow** (600, 11px, +0.08em, uppercase, slate).

**The Numbers-Are-Display Rule (kept).** Any value derived from user input or calculation uses Lexend at 600–700 with `tabular-nums`, even at small sizes. The weight-restraint philosophy applies to headings, not to money.

## 4. Elevation

**The Hairline-Not-Shadow Rule.** Cards and inputs carry no shadow at rest — the 1px hairline border is the separation. Hover earns a 2px lift and a darkened hairline (`rgba(17,17,17,0.18)`), nothing glows. Pastel tiles get neither border nor shadow.

Exceptions, deliberately short list:
- **App-window mockup** (landing hero product shot): the featured-xl shadow (`0 26px 60px -6px rgba(17,17,17,0.12)` stack).
- **Info modal**: `0 24px 48px rgba(17,17,17,0.18)` above a blurred backdrop.
- **Compact topbar capsule**: soft `0 12px 24px rgba(17,17,17,0.06)` under frosted blur(16px) white.
- **Jargon search bar** (2026-07-10, user-directed): white at rest (not cream, unlike every other input), soft `0 4px 14px rgba(17,17,17,0.08)` pop-shadow instead of the resting hairline — the reference's search bar reads as a crisp elevated surface, not a flush field. Focus swaps the pop-shadow for the standard blue ring rather than stacking both.

## 5. Components

### Navigation (compacting topbar)
- **Rest:** ~62px band on the canvas, logo + left-packed nav (`auto 1fr auto`, 20px gap, 2.5px baseline nudge), EN|VI toggle right. Active chip = **ink** fill, 8px radius; inactive links ink 14px/600; hover = pearl box.
- **Compact (scroll):** 800px frosted-white capsule, 12px radius, hairline, blur(16px); wordmark collapses to the V glyph; nav side-padding slims to 13px. Hysteresis 56/8px in `js/site.js`. Widened from 720px on 2026-07-12 when Budget became the sixth nav item — the old cap only budgeted for five.

### Buttons & badges
- **Shape language: 8px buttons, 12px cards/inputs, 9999px badges. Nothing else.**
- **Primary** (`.btn-ink`): ink fill, white text, hovers charcoal.
- **Ghost** (`.btn-ghost`): white + hairline, hovers pearl.
- **Badges** (NEW tag, soon-badge, fact chips, myth/truth tags, ink-band pill): true pills.

### Inputs
Cream resting fill, hairline border, 12px radius, ~48px tall, slate prefix/suffix. Focus keeps the blue ring + card-white lift (interactive = blue). Hover border stone.

### Cards
White, hairline, 12px, 28px padding. No top-edge accent (the old 3px blue hairline is gone). Caution cards hover rose.

### Icon tiles & page glyphs
- **Page-hero glyph:** 60px module-pastel tile, 12px radius, ink line glyph — the page's mark.
- **Card icon tiles:** 40px module-pastel tiles, 8px radius, ink glyphs. `tile-rose` keeps rose for caution content only.
- **Stat icons (calculator):** unchanged data trio — blue/teal solid fills with lighter-sibling top hairlines, amber for the multiplier. Recommend's ladder step numbers are pastel tiles with ink numerals.

### Landing bands
- **Quote band:** full-bleed cream-wash section (2026-07-10, user-directed — was a 12px inset panel, now breaks out of `.page` the same way `.content-shell` does), ~76px vertical padding, left-aligned weight-400 pull-quote, ink squiggle underline, white fact-chip pills.
- **Charcoal spotlight band:** see Charcoal-Band Rule. Full-bleed as of 2026-07-10 (same breakout, was also a 12px inset panel). White weight-400 headline, ash secondary, ghost-on-dark CTA, pill tag, boxy signal chips whose small dots keep lighter data-accent siblings (they state data facts).
- **Module accordion:** 12px tabs, 16px flat pastel taxonomy chips (hairline so canary/aqua read on white), `+`→`×`, grid-rows 0fr→1fr animation.

### Jargon directory (adopted 2026-07-10, Amplemarket skills-library pattern)
- **Sticky search capsule:** the search bar starts in the hero flow, then `position: sticky` pins it below the compact topbar; docked, it becomes a frosted tray (the topbar's own recipe — `rgba(255,255,255,0.85)` + blur(16px) + soft shadow + hairline). Inside the input: a live count — teal dot + "44 terms" at rest, "N matches" mid-search, rose dot on zero (data-UI colors doing data jobs).
- **Directory Header (named pattern):** each category section opens with a left-aligned row — 48px circular badge (ink line glyph, 9999px), weight-400 section title, hairline 9999px count pill whose number goes live during search. Full-width hairline dividers separate sections; JS keeps the first *visible* section divider-free while search hides groups.
- **Category-badge color exception (2026-07-10, user-directed):** the three directory badges do *not* all share the page's canary module pastel — Credit & borrowing is `--pastel-jargon-credit` (`#c9dcff`, a periwinkle sized to match the module pastels' saturation/lightness) and Investing & retirement reuses `--pastel-calc` (mint). Earning & saving keeps canary. This is a **deliberate, scoped exception** to the Pastel-Taxonomy Rule — it applies only to `.group-badge` on this page, not to the page-hero glyph, the suggestion-dropdown glyphs, or any other module's pastel identity.
- **Suggestion dropdown:** white 12px panel, hairline, composited-only open animation; rows = module-pastel glyph tile, EN name 600, VI name slate, bilingual group tag. Works identically docked and at rest (same element, never cloned).

### Budget splitter
- **Chip groups** (`.seg-chip`, period and preset selectors): white + hairline at rest, active flips to ink fill per the `button-chip-active` spec — the same pattern `.chip-group` documents elsewhere.
- **Doughnut segments** use data-UI colors doing data jobs, not the module pastel: needs = blue, wants = `--rose-muted`, savings = teal (positive outcome) — mirrored by the static `.legend-dot` markup so chart and legend stay in sync.
- **Bucket-card icon colors (2026-07-24, user-directed):** the three bucket-card stat icons carry the module's own data colors rather than a module pastel — needs = `--blue`, wants = `--rose-muted`, savings = `--teal`. `--rose-muted` is a separate palette entry from the caution `--rose`, not a reuse of it, so rose's reserved caution meaning stays exclusive. Each card's examples (phone bill, eating out, emergency cushion, etc.) crossfade in place with the amount on hover/focus, keeping the card itself compact; on touch, which has no hover, they stay permanently visible instead.
- **Center total:** an HTML overlay (`.donut-center`/`.donut-total`), not a Chart.js plugin — `.donut-wrap` is `position: relative` with the total absolutely centered over the canvas, since Chart.js's own legend/center-text can't hold the `.en`/`.vi` span pair.

### Budget columns
- **The $700 scale invariant.** "Money that goes home" draws three paychecks — $700, $500, $300 — as vertical stacked columns, and every `.bd-stack` is drawn against one scale: $700 is full height, and a column's height *is* its income as a fraction of that maximum (`height: calc(var(--bd-scale) * var(--income) / var(--bd-max))`). $500 and $300 are measured against that same scale, not against their own totals, which is what lets "the paycheck falls 40%, savings falls 57%" be a claim the eye can check against the figure instead of one it has to take on faith.
- **`flex: none` is load-bearing.** `.bd-stack` sits inside a flex row of columns; without `flex: none` it is a flex item with the default `flex-shrink: 1`, and the tallest column gets squeezed by exactly the height of its own label — drawn 11% short, at 2.63 $/px against its neighbours' 2.33. Two stacks a few pixels apart read as identical at a glance; the squeeze is invisible by eye and quietly makes every comparison on the page false. It was caught by measuring during the design pass, not by looking — the same way Tuition's staircase indent and label column each broke its ruler without ever looking wrong.
- **Home is ink, not a fourth bucket color.** Needs/wants/savings are inherited from the doughnut and the bucket cards above the figure; home borrows none of that palette because it is not a category to divide into — it is a subtraction that happens before the split exists. Ink is the one value in the system that reads as "not a category," which is exactly the claim this segment has to make. `--pastel-budget` stays taxonomy only and is never a data fill here, per Tuition's precedent.
- **The home blocks never animate.** The three bucket segments wipe upward into place once, on scroll; the home segment renders complete from the first frame, under JS or reduced motion alike, because the fixed part was never in question — only the split above it moves when income does.
- **The reveal clips the stack, not the segments.** The wipe is one `clip-path` on `.bd-stack`, running from `inset(calc(100% - var(--bd-home-pct)) 0 0 0)` — the home block's top edge — to `inset(0 0 0 0)`. Clipping each bucket segment individually instead animates three boxes in lockstep, each filling from its own bottom edge, so mid-transition the column is three disconnected bands with gaps rather than one edge travelling up; measured halfway it read `inset(7.46%)` on all three at once, which is the tell. Clipping the stack also leaves home uncovered at every frame for free, because the bottom inset never moves off 0. `--bd-home-pct` is derived (`calc(var(--bd-home-amt) * 100% / var(--income))`), never typed, so it cannot drift from the segment heights in the markup.

### Tuition money ruler (redesigned 2026-09-03; replaced the 2026-08-28 card-based version)
- **The instrument is a ruler, not a rail.** Credit is a 300–850 scale because a credit score is a position on one; Tuition is a ruler because every number in the subject is a *quantity* of dollars, and the topic goes wrong when people compare quantities they have never seen side by side. One horizontal scale, $0 → $31,000, stated once at each part opener and obeyed silently by every bar below it.
- **$31,000 is load-bearing.** It is simultaneously the *aggregate* federal borrowing cap for a dependent undergraduate — the most they may ever owe in combined subsidized and unsubsidized Direct Loans, per the FSA Handbook, Vol. 8 Ch. 4 — and, to within $10, one year of published cost at a public four-year. It is **not** a four-year figure, which the page said until 2026-09-05: four years at the annual limits ($5,500 / $6,500 / $7,500 / $7,500) comes to $27,000, and the page's own ladder shows exactly that directly above the bar. The corrected claim is stronger, not weaker — every federal dollar an undergraduate can ever borrow equals one year of sticker price. `#tu-limits` puts those two bars directly above one another at matched length — the page's thesis, and the reason the scale is that number and not a round one.
- **Bars have square ends** (3px radius, not the 9999px pill used elsewhere). A rounded cap puts ink where the quantity has already stopped; on a page whose whole claim is that lengths are comparable, that is a lie worth 3px. Tracks always render the full $31,000 ground, so the empty remainder is visible — that is what makes $7,395 of Pell look like $7,395 rather than like "the maximum".
- **Four colour meanings, held to the bottom:** ink = money you or your family actually pay · `--tu-aid` (`rgba(11,90,85,0.16)`) = money you never repay · `--teal` = subsidized borrowing · `--tu-mid` (`rgba(17,17,17,0.28)`) = unsubsidized, and the rest of the budget · hatched with no fill and a masked right edge = private lending, which has no federal ceiling and so gets a bar with no right-hand end.
- **The module pastel is not a data fill here.** `#99fff9` at full-bar width shouts louder than anything on this page should, so the aqua stays where the taxonomy puts it (hero wash, nav, landing card, the Jargon group badge). Teal keeps its one Two-Accent-in-Data-UI appearance on the monthly-payment headline; rose never appears, because a loan here is a tool with a price, not a warning.
- **No cards, no pills, no boxed callouts.** Sections sit on the cream and separate with hairlines and air, the way Credit does. The single exception is the calculator's input column, which is an instrument rather than prose and earns a surface.
- **The staircase indent steps the text, never the bar** (`--step` on `.tu-order > li`, applied to `.tu-order-when/-name/-body` only). Indenting the track would draw the same percentage in a narrower box, which is a different number of dollars. Below 760px `--step` goes to 0 and the "take this first / then this / only if you have to" labels carry the order alone.
- **The retracting bar** (`.tu-retract`) is the page's only animation: one track drawn at the published tuition line, retracting to the average net price when it scrolls into view. The ink fill is absolutely positioned *over* the aid region rather than beside it — as flex siblings the two widths summed to 69.68% of the ruler, a length matching no real number. The markup carries the true width, so the figure is correct with JavaScript off or reduced motion on; `js/tuition.js` adds `.is-armed` (which parks the fill at the published price) only when motion is allowed.
- **Two greys, two taxonomies.** `--tu-mid` (`rgba(17,17,17,0.28)`) means the costlier kind of debt — unsubsidized, and the interest half of the calculator split. `--tu-rest` (`rgba(17,17,17,0.15)`) means the non-tuition half of a college budget, which is the same kind of money as the tuition half and should recede behind it. They were one token until 2026-09-03, which put an identical grey under two different taxonomies in the adjacent matched bars at `#tu-limits`.
- **Three text levels, not two-and-a-half.** Lede (17px ink) → body (14.5px ink) → caption (13.5px ink, holds the 660px measure) → source (`.tu-dated`, 12.5px slate). The caption used to be slate and half a point off the source, so every section ended in a block of undifferentiated grey; captions carry content, only `.tu-dated` carries sourcing.
- **The spread.** `.tu-spread` is a 660px measure beside a margin column. The measure has to stay at 660px to stay readable and the tracks have to stay at 1136px to stay comparable, which left 476px of nothing down the right of every prose block. The margin now carries sources, the rate-and-fee facts (`.tu-facts` — typed and ruled, replacing the pills), and the answer to the reader's obvious next question. Section headings keep their empty right on purpose; a heading does not want a margin note fighting it.
- **Selector order is load-bearing on the staircase.** `.tu-order-when/-name/-body` each set a `margin` shorthand, so the `margin-left: var(--step)` rule MUST be declared after all three. Declared first, it is silently reset to 0 and the indent disappears without any other symptom — which is exactly how it broke once.
- **Nothing moves when you type.** The salary rows are always in the layout at a fixed height; only the two values change, from an em dash to a number. Showing and hiding a block there reflowed the results column on the first keystroke. Verified by measuring the offset of `#tu-after` before, during and after input: 0px.
- **Motion values.** `--tu-ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — the built-in curves are too weak to read as deliberate. The retracting bar runs 900ms with a 100ms delay (explanatory, seen once). The calculator split runs 140ms, because it retargets on every keystroke and anything slower lags visibly behind the number above it. Both are dropped under `prefers-reduced-motion`.
- **Timelines are drawn as a line with marks, never as a filled bar**, so time is never mistaken for the dollar ruler. Below 760px their absolutely-positioned labels become a stacked legend, because three 124px labels cannot share a 311px line.

### Recommend ladder (expanded 2026-09-03)
- **Seven rungs, not six.** High-interest debt payoff was missing. Every canonical ordering has it (r/personalfinance Prime Directive, Money Guy Financial Order of Operations, Bogleheads) and PRD §6.2 names it the rule that always wins. It sits at step 3 — after the employer match, because a 50% match is an instant 50% return that beats paying down even a 25% card, and before anything invested.
- **The placement block was removed** (2026-09-05). Four questions used to name a starting rung for the reader. It was the only element on the site that issued a personal verdict, which is at odds with the site being educational rather than advisory, and it put 527px of interaction in front of a ladder that explains itself. `js/recommend-ladder.js`, `js/recommend.js` and `tests/recommend-ladder.test.js` went with it; Recommend now has no page script. If a placement aid is ever wanted again, the version to build is one that points at which rungs a question relates to rather than one that names a rung for the reader.
- **The rung prose is ink, not slate.** It is the page’s primary content; set in the secondary text colour, the whole ladder read as caption.
- **`.rung-figure` is a top rule, not a panel.** With `align-items: stretch` every figure stretched to the height of the prose beside it, so a chalk box sat around 40% empty. `align-items: start` plus a hairline gives the same "this is a figure" signal at no cost, and the freed column now carries a **Common mistake** note per rung — real content in what used to be a hole.
- **The figure centres; the body does not** (2026-09-05). `align-items: start` stays on `.rung`, but `.rung-figure` takes `align-self: center`, because top-aligning a short figure dumped all the slack underneath it — 356px on rung 4, most of the rung's height. Centre only the figure, never the whole row: on rungs 6 and 7 the figure is *taller* than the prose beside it, so `align-items: center` on `.rung` would drop the rung number and title away from the top edge on exactly those two. Measured after: gaps split evenly on rungs 1–5 (72/72, 80/79, 60/60, 178/178, 77/77), 0/0 on 6–7 where the figure sets the row height, and every body still starts at offset 0.

## 6. Do's and Don'ts

### Do:
- **Do** keep headings weight 400 with size-proportional negative tracking; reserve 900-uppercase for the landing poster only.
- **Do** use tabular-nums + Lexend 600–700 for every calculated number, no matter how small.
- **Do** use module pastels as flat fills for taxonomy — the same module always gets the same pastel, on every page.
- **Do** keep teal/blue/rose/amber confined to data UI and their reserved roles.
- **Do** write every English string with a `.vi` sibling of equal visual weight; check uppercase/tight-leading treatments against Vietnamese stacked diacritics before shipping them.
- **Do** respect `prefers-reduced-motion` for the cursor, mesh drift, entrances, count-pop, and dropdown (instant swaps / frozen rest positions).

### Don't:
- **Don't** shadow a card, input, or pastel tile at rest — the hairline (or the flat color) is the elevation.
- **Don't** use pastels as gradients, hover states, or text color; don't give two modules the same pastel.
- **Don't** set radii outside 8/12/9999 (+4px for tiny inner squares) — two shape values define the chrome.
- **Don't** use pure `#000` for text or a surface; ink and charcoal (both `#111111` as of 2026-07-10) are the only darks.
- **Don't** add confetti, hype-driven number celebrations, or casino urgency cues — calm is the brand.
- **Don't** ship copy with undefined financial jargon — define terms inline (the info-modal pattern is the model).
