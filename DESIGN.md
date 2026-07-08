---
name: Verity
description: A bilingual EN/VI financial literacy toolset, starting with a compound interest calculator
colors:
  paper: "#e7e6e2"
  card: "#faf9f7"
  ink: "#11151f"
  teal: "#0b5a55"
  teal-bright: "#0e7a72"
  blue: "#2348ad"
  blue-focus: "#2f5abf"
  rose: "#c2255c"
  rose-soft: "rgba(194, 37, 92, 0.14)"
  slate: "#5d5f68"
  border: "#d5d3cd"
  icon-blue-start: "#3a5fd9"
  icon-blue-end: "#1d3a8f"
  icon-teal-start: "#129b8f"
  icon-teal-end: "#0a4842"
typography:
  display:
    fontFamily: "Lexend, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Lexend, sans-serif"
    fontSize: "18px"
    fontWeight: 600
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
  pill: "200px"
  lg: "16px"
  md: "10px"
  sm: "8px"
  box: "10px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "28px"
  xl: "32px"
components:
  button-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.slate}"
    rounded: "{rounded.box}"
    padding: "8px 16px"
  button-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.box}"
    padding: "8px 16px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
---

# Design System: Verity

## 1. Overview

**Creative North Star: "Graph Paper Calm"**

The system reads as math worked out on graph paper, not a banking dashboard. A soft pastel gradient-mesh runs behind the whole page: blurred, low-opacity CSS blobs in a single blue hue (`--blue`/`--blue-focus`), drifting slowly and asymmetrically. Fixed to the viewport so it's visible behind every card all the way down the page, not just the hero. Layered above the mesh on the landing hero specifically: a family of ~48 thin, near-parallel bezier curves (`.hero-paths`) that slowly flow — a marching dash animation over each path — stroked in Constellation Blue and masked with a radial-gradient edge fade so they dissolve toward the hero's edges instead of cutting off. (Adapted from a reference "Background Paths" component: same curve math, but rebuilt in plain SVG + CSS in Verity's own blue rather than the source's cold slate, and the letter-by-letter title reveal was dropped since it would break the bilingual `.en`/`.vi` spans and Vietnamese diacritics.) The landing page is the paths' only home — module pages (including the calculator) keep their heroes clean. Surfaces are warm off-white paper and card tones, never cold navy-and-gray; text leans toward near-black ink rather than washed-out gray, so the whole thing stays legible and calm rather than corporate or clinical.

This system explicitly rejects the stiff corporate banking dashboard (cold navy/gray, dense unexplained tables, jargon with no definitions) and the gamified fintech app (confetti, hype-driven number pop, casino urgency). Where a number does animate (the `countPop` on result values), it's a brief, modest emphasis — not a celebration.

**Key Characteristics:**
- Warm paper/card surfaces, never cold gray-blue
- Slow-drifting pastel blue gradient-mesh as the system's signature atmosphere
- Two real accent colors (teal, blue), each with a clear job — not a rainbow of equally-weighted color
- Boxy 10px chips for anything you click in chrome (nav links, language toggle), held inside 16px-radius containers; 16px-radius cards for content. The pill radius survives only on small tags/badges (fact chips, "soon"-style badges), never on primary chrome.
- Flat at rest, lifts only in response to interaction

## 2. Colors

The palette is warm-neutral surfaces carrying two purposeful accents, plus a third (rose) reserved for the caution/highlight role.

### Primary
- **Deep Teal** (`#0b5a55`): the "growth" color. Used for the final-balance result value, the info-button icon, and the interest-area line/fill on the chart. Appears wherever the interface is telling the user something positive is happening with their money.

### Secondary
- **Constellation Blue** (`#2348ad`): the interactive/decorative accent. Drives the custom cursor, the landing hero's flowing background paths, the card top-edge hairline, the principal-area line/fill on the chart, and the hover border + lift on cards. A focus-state variant, **Focus Blue** (`#2f5abf`), governs input focus rings and the language-toggle hover glow — close to Constellation Blue but distinct enough to read as "you're now interacting with this," not "this is decorative."

### Tertiary (reserved)
- **Rose** (`#c2255c`, soft fill `rgba(194, 37, 92, 0.14)`): the caution/highlight color. Currently wired into the input clamp-notes (the message that appears when a rate/years value gets capped). Reserved beyond that for a future "recommended" badge in the planned Recommend module — not a color to spend on decoration. Replaced marigold this session: marigold tested worse as an accessible text color (fails 4.5:1 against both paper and card) and read as a duller, dated amber; rose hits 4.5:1+ against every surface in the palette and reads as a deliberate, vivid pop against the cool teal/blue duo.

### Neutral
- **Paper** (`#e7e6e2`): page background and input-field resting fill.
- **Card** (`#faf9f7`): card and modal surfaces, nav capsule, lang toggle.
- **Ink** (`#11151f`): primary text, active nav state, stat values.
- **Slate** (`#5d5f68`): secondary/label text, chart axis labels.
- **Border** (`#d5d3cd`): all hairline borders and dividers.

### Named Rules
**The Two-Accent Rule.** Only teal and blue do real color work on any given screen. Teal means "this is a result/positive outcome." Blue means "this is interactive or decorative." Don't reach for a third saturated color without a defined role first — that's what rose is reserved for (caution/highlight only).

**The Warm-Never-Cold Rule.** Surfaces are warm off-white (paper/card), never blue-gray or pure white. This is the single biggest thing separating this from a banking dashboard.

**The Ink-Band Exception.** The landing page carries one sanctioned dark surface: a large 24px-radius panel filled with the system's own ink (`#11151f`) that stages the calculator spotlight. It works because it's the palette's own warm near-black — not a foreign navy — and because there is exactly one. Don't add a second dark surface without the same level of justification.

## 3. Typography

**Display Font:** Lexend (with sans-serif fallback)
**Body Font:** Be Vietnam Pro (with sans-serif fallback)

**Character:** Lexend was designed around reading-proficiency research, with rounded, deliberate letterforms — its numerals in particular read as confident and considered, which is why it carries every headline and number on the page. Be Vietnam Pro is a Vietnamese-designed typeface with full native diacritic support; it carries everything a user reads as sentence-length text (and all field/stat labels), so the bilingual EN/VI body of the page has an authentic, non-generic foundation rather than a retrofitted Latin-only body font.

### Hierarchy
- **Display** (600, 44px, line-height 1.05, letter-spacing -0.01em): hero title only.
- **Title** (600, 18-22px, line-height 1.3): card titles, modal title, logo.
- **Data** (700, 26-28px, tabular-nums): the numbers that matter — final balance, stat values. Lexend, not Be Vietnam Pro, even though it's a "body" context: numbers are treated as headline-weight information.
- **Body** (400, 15-17px, line-height 1.4-1.55): hero subtitle, modal paragraph text. Cap at ~70ch.
- **Label** (500, 12-14px): field labels, result labels, breakdown table headers, stat labels.

### Named Rules
**The Numbers-Are-Display Rule.** Any value derived from the calculator (final balance, stat values, breakdown rows) uses `font-variant-numeric: tabular-nums` and the display font, even at small sizes. Numbers in this product are never an afterthought of body text.

## 4. Elevation

Flat at rest, lifts only in response to interaction — depth is earned, not decorative. Cards carry a near-invisible ambient shadow at rest (`0 1px 2px rgba(28, 35, 48, 0.04)`) and a 3px Constellation Blue hairline at 50% opacity along the top edge as a quiet signature, not a stripe accent. On hover, the card rises 3px and the shadow deepens.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 1px 2px rgba(28, 35, 48, 0.04)`): resting state for every card.
- **Lifted** (`box-shadow: 0 12px 24px rgba(28, 35, 48, 0.08)`, paired with `transform: translateY(-3px)` and a Constellation Blue border): hover state for cards.
- **Modal** (`box-shadow: 0 24px 48px rgba(17, 21, 31, 0.18)`): the one deliberately heavier shadow in the system, reserved for the info modal floating above a blurred backdrop.
- **Focus ring** (`box-shadow: 0 0 0 3px rgba(47, 90, 191, 0.14)`, paired with a Focus Blue border): input fields and the language toggle on focus/hover.

### Named Rules
**The Earned-Depth Rule.** Nothing ships with a heavy shadow at rest. Depth shows up only as a response to hover, focus, or the modal's deliberate elevation above the page.

## 5. Components

### Buttons
- **Shape:** boxy rounded-rect (`10px` radius) for labeled chrome chips — nav links, language toggle. Their containers (topbar capsule `16px`, cards `16px`) stay a size rounder so chips read as content within chrome. Icon-only circular controls (info button, modal close) remain circles — they're glyphs, not labels. Hero-scale CTAs (`.btn`) keep the 200px pill as the one deliberately softer shape.
- **Primary (active nav state):** ink background, white text, `8px 16px` padding.
- **Default/Ghost (info button, inactive nav):** card-colored background, 1px border, slate text; hovers to ink text with a teal (info button) or paper (nav) background shift.
- **Hover / Focus:** subtle transform-scale on `:active` (0.95-0.97) for tactile click feedback; border-color and color transition over 0.1-0.15s.

### Cards / Containers
- **Corner Style:** 16px radius.
- **Background:** Card (`#faf9f7`).
- **Shadow Strategy:** see Elevation — ambient at rest, lifted on hover, with the 3px Constellation Blue top-edge hairline as a constant signature regardless of state.
- **Border:** 1px Border color at rest; shifts to Constellation Blue on hover.
- **Internal Padding:** 28px (24px for stat cards' tighter layout).

### Inputs / Fields
- **Style:** Paper-filled, 10px radius, 1px border, prefix/suffix (`$`, `%`, `years`) in slate inline with the value.
- **Hover:** border lightens toward a neutral gray-blue (`#c9cfd6`).
- **Focus:** border shifts to Focus Blue, background lifts to Card, plus the focus-ring shadow.

### Navigation (compacting topbar)
- **Rest state:** an Amplemarket-height band (~62px total) hugging the top edge: logo, then the nav packed immediately left of it (`auto 1fr auto` grid, 20px column gap, desktop only — mobile keeps the nav on its own row), language toggle on the right. No capsule chrome at rest. The nav rides a 2.5px translateY so its 14px text bottoms sit level with the 18px wordmark's (grid centering alone leaves it looking afloat); the compact state resets the nudge since the wordmark is collapsed there. Links sit 12px apart. Active link gets a solid Constellation Blue boxy chip (`10px`); inactive links are ink-colored 14px/600 (slate at 500 read too faint) and hover to a tall opaque card-white box (10px vertical padding) — flipping to paper and slimming to 13px side padding inside the compact capsule, whose card-toned background would otherwise swallow the hover and whose 720px cap the full-width padding would overflow.
- **Compact state:** on scroll (enter at 56px, exit at 8px — hysteresis so it can't flicker), `js/site.js` adds `.is-compact` and the inner grid tightens into a floating 720px, 16px-radius capsule: translucent card background with backdrop blur, hairline border, lifted shadow, 20px left padding so the logo doesn't touch the edge, and the wordmark collapses to just the V glyph. Transitions run 300ms on a strong ease-out; `prefers-reduced-motion` gets instant swaps.
- **Logo:** a bare ink V glyph plus lowercase wordmark, linking to `./` (the landing page) on every page. No badge box in the topbar — the badge survives only in the favicon, where a bare glyph would vanish.
- **Mobile treatment:** the nav drops to its own full-width row below the logo/toggle row under 700px; the compact capsule keeps its 16px radius.

### Stat Icons (signature component)
52×52px squares (8px radius, sharper than the 16px card radius — a deliberately smaller-scale shape language for "a tile within a card"), solid-filled in the stat's own accent color, white 24px icon glyph. Carries the same top-edge-hairline signature every `.card` carries (see Elevation), scaled down — but since the fill itself is already the accent color, the hairline switches to that accent's lighter sibling tone (Focus Blue on a Constellation Blue fill, Bright Teal on a Deep Teal fill, Bright Amber on an Amber fill) so it still reads as an edge highlight instead of disappearing into a flat color.

Total Contributed uses blue, Total Interest uses teal (both follow the Two-Accent Rule's own meanings). Growth Multiplier uses **Amber** (`#c27e0a`, hairline `#efaa34`) — a deliberate, user-requested exception to the Two-Accent Rule: a fourth color chosen as blue's actual color-wheel complement (hue ~38° against blue's ~224°), picked over reusing rose specifically so rose's reserved caution/highlight role stays uncontaminated. Treat this as the one earned exception, not a precedent for a rainbow of stat icons — don't add a fifth.

### Icon tiles & page glyphs (module iconography)
Each module page opens with a single small line glyph (34px, Constellation Blue stroke) centered above the hero title — the page's "mark," used once. Card headers across module pages pair their heading with a 40px, 10px-radius **icon tile**: a soft accent-tinted square (`.tile-blue/.tile-teal/.tile-amber/.tile-rose`) holding a 22px stroke glyph in that accent. Rose tiles appear only on caution content, keeping the reserved role intact. Glyphs are simple 2–3 path line drawings, stroke `currentColor`, never emoji and never filled illustrations.

### Landing bands (landing page only)
The landing page is deliberately not another module page. Its three signature patterns:
- **Quote band:** an oversized left-aligned Lexend pull-quote with a thin hand-drawn SVG squiggle underline (blue at ~55% opacity) and a slate attribution line.
- **Ink spotlight band:** see The Ink-Band Exception. Contains a tag pill, an italic-accent headline (Lexend italic 600), a ghost-on-dark CTA, and rows of boxy "signal chips" (12px radius, translucent white on ink) whose 9px square-ish dots use lighter siblings of the accents so they stay legible on dark.
- **Module accordion:** stacked full-width tabs (16px radius, colored 10px dots, `+` rotating to `×`), one open at a time, animated via the CSS `grid-template-rows: 0fr -> 1fr` trick. Each panel pairs short copy with a mini product visual on paper background.

## 6. Do's and Don'ts

### Do:
- **Do** keep page and input-resting surfaces warm off-white (`#e7e6e2` paper, `#faf9f7` card) — never shift toward blue-gray or pure white.
- **Do** use tabular-nums + Lexend for every number derived from user input or calculation, no matter how small.
- **Do** let depth (shadow + lift) be a response to hover/focus only; cards and inputs are flat at rest.
- **Do** keep teal for "result/positive outcome" and blue for "interactive/decorative" — two accents, each with one job.
- **Do** write every English string with a `.vi` sibling of equal visual weight; never let Vietnamese feel like a translated afterthought.
- **Do** respect `prefers-reduced-motion` for the custom cursor, flowing hero paths, fadeUp entrances, and count-pop — provide an instant/crossfade fallback.

### Don't:
- **Don't** introduce a cold navy/gray dashboard palette, dense unexplained tables, or unexplained jargon — that's the explicit anti-reference.
- **Don't** add confetti, hype-driven number celebrations, or casino-style urgency cues (countdowns, "act now" framing) — financial decisions here are calm, not thrilling.
- **Don't** spend rose decoratively. It's reserved for a caution/highlight role; using it as a third generic accent dilutes the Two-Accent Rule.
- **Don't** use `border-left`/`border-right` as a colored stripe accent anywhere; the system's one deliberate accent border is the full-width 3px top hairline on cards.
- **Don't** add a static drop shadow to a card or input at rest — depth must be earned through interaction, per the Earned-Depth Rule.
- **Don't** ship plain-language copy with undefined financial jargon — define terms inline (the info-modal pattern is the model to reuse, not skip).
