---
name: Verity
description: A bilingual EN/VI financial literacy toolset, starting with a compound interest calculator
colors:
  canvas: "#ffffff"
  paper: "#f6f5f3"
  pearl: "#ecebea"
  card: "#ffffff"
  ink: "#111111"
  charcoal: "#272625"
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
  pastel-family: "#99fff9"
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

This system is a deliberate hybrid, adopted 2026-07 from a supplied Amplemarket style reference and merged with the elements of Verity worth keeping. The page reads as a light, airy editorial product: white canvas, cream-wash bands, near-black warm ink type at whisper weights, and a five-pastel taxonomy that color-codes the five modules. It still explicitly rejects the stiff corporate banking dashboard (cold navy/gray, dense unexplained tables) and the gamified fintech app (confetti, casino urgency) — money here is calm, explained, and bilingual.

**Provenance — kept from Verity, on purpose:**
- **Lexend + Be Vietnam Pro.** Be Vietnam Pro is a Vietnamese-designed body face with native diacritics; the bilingual mission outranks typeface mimicry. Amplemarket's *typography philosophy* was adopted instead of its font.
- **The data-color meanings.** Teal = "result/positive outcome", blue = "interactive", rose = caution, amber = the one earned stat exception. These survive **inside data UI only** (chart, results, meters, focus rings, links) — chrome and decoration no longer use them.
- **The custom cursor** (blue dot + trailing ring) — a personality piece with no Amplemarket equivalent.
- **The blue ambient background** — blue's one sanctioned ambient/decorative use, and the "theme is blue" signature. Its form has evolved: blob mesh (`.bg-mesh`) → removed in the initial merge → restored by user request → **replaced 2026-07-10 by the aurora wash** (`.bg-aurora`, user-directed, adapted natively from a supplied React "AuroraBackground" component). The aurora is blurred repeating-gradient ribbons (blue→indigo→violet stops) washing only the top ~820px of each page, masked to fade before the content shell. Its drifting layer animates `transform` only — the reference's `background-position` animation is paint-level, the same class that made BackgroundPaths flicker against the cursor's rAF loop.
- **The bilingual `.en`/`.vi` span system** — structural, untouchable.

**Dropped:** the 3px blue card hairline, the 200px CTA pills, Verity's darker paper canvas, and Amplemarket's phoenix orange (no role here). Also retired 2026-07-10: the jargon page's collapsed-by-default term list (`44278d8`) — replaced by the always-visible category directory (Amplemarket skills-library pattern; the section structure does the de-intimidating the collapse used to).

## 2. Colors

### Surfaces
- **Canvas** (`#ffffff`): the page, washed at the top by the aurora background (see Provenance) — the aurora is the only thing allowed between canvas and content. **Landing-only exception (2026-07-10, user-directed):** `body.landing` uses cream (`--paper`) instead, so the aurora's fade blends into a warm tone instead of handing off to white; module pages keep the white canvas.
- **Cream Wash / paper** (`#f6f5f3`): the **content shell** (the cream "subpage" that carries everything below a page's hero — adopted 2026-07-10 from the Amplemarket skills-library layout: dynamic backdrop above, one flat cream surface below, hard edge). Unlike the quote band, this is genuinely full-bleed — edge to edge of the viewport, no side gaps, no rounded corners — because it *is* the page's lower background, not a decorative accent inside it. Structurally it breaks out of `.page`'s 1200px container: `<main>` carries no width constraint, `.content-shell` is its direct full-width child, and a nested `.page` div restores the centered column so cards line up with the hero. Also used for light section bands (quote band, still an inset panel — a smaller, different-role decoration), resting input fill, and example-box tints inside cards. (`--paper` points here so every legacy paper-tint stays a tint.)
- **Pearl** (`#ecebea`): hover fill for ghost controls and nav chips.
- **Card** (`#ffffff`): card surfaces — separated from canvas by the hairline border, not by tone or shadow.
- **Charcoal** (`#272625`): the dark surface — the landing spotlight band, and (2026-07-10, user-directed) every page's footer. Warm near-black, never navy.
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
| Family Split | Aqua | `#99fff9` |

**The Pastel-Taxonomy Rule.** Pastels are flat fills only — never gradients, never hover states, never accent text, never shadowed. The flat color IS the elevation and the differentiation. Glyphs on pastel are always ink.

### Data accents
- **Teal** (`#0b5a55`): result/positive-outcome numbers (final balance, interest column, VI term names, payoff lines).
- **Blue** (`#2348ad`): interactive — cursor, text links, focus rings (`#2f5abf`), chart principal series, meters. Its one ambient/decorative use is the site-wide gradient mesh; otherwise not chrome, not decoration.
- **Rose** (`#c2255c`): reserved caution (clamp notes, myth tags, caution tiles/borders).
- **Amber** (`#c27e0a`): the one earned exception, the multiplier stat icon only.

**The Two-Accent-in-Data-UI Rule.** Teal and blue keep their old jobs, but their territory shrank to data UI. If a surface or chrome element wants color, it gets a module pastel or nothing.

**The Charcoal-Band Rule.** Exactly one dark *content* band per page maximum, always charcoal `#272625`. Full-bleed as of 2026-07-10 (broken out of `.page` via the `.content-shell` pattern — unconstrained parent + nested `.page` wrapper — not the naive `100vw` trick, which seams against the scrollbar). The site footer (2026-07-10, user-directed, Amplemarket reference) is charcoal on every page and sits outside this count — it's structural chrome at a fixed position, not a page-content moment, the same way the topbar isn't counted as "a light surface." A page may have both its own charcoal band and the charcoal footer at once (the landing page does); footer text follows the ink-band's existing dark-surface convention (white primary text, `rgba(255,255,255,0.65)` secondary, `rgba(255,255,255,0.45)` tertiary/legal), full-bleed with no separate treatment needed since it was never nested inside `.page` to begin with.

## 3. Typography

**Display Font:** Lexend · **Body Font:** Be Vietnam Pro (Vietnamese-native diacritics; see Provenance).

**Weight philosophy (adopted):** headings are weight **400** with aggressively negative tracking — authority through restraint. Weight 900 uppercase exists for exactly one poster moment: the landing "MONEY MADE EASY." hero. Card titles are 500. Nothing between 500 and 900 appears at heading sizes.

### Scale
- **Poster** (900, clamp 46–84px, uppercase, -0.03em, lh 1.1): landing hero only. Line-height stays 1.1 — the reference's 0.8 clips uppercase Vietnamese stacked diacritics.
- **Heading** (400, 44px, -0.04em): calculator hero.
- **Heading-sm** (400, 36px, -0.03em): section titles, module page heroes.
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
- **Compact (scroll):** 720px frosted-white capsule, 12px radius, hairline, blur(16px); wordmark collapses to the V glyph; nav side-padding slims to 13px. Hysteresis 56/8px in `js/site.js`.

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
- **Category-badge color exception (2026-07-10, user-directed):** the three directory badges do *not* all share the page's canary module pastel — Credit & borrowing is `--pastel-jargon-credit` (`#c9dcff`, a periwinkle sized to match the other five pastels' saturation/lightness) and Investing & retirement reuses `--pastel-calc` (mint). Earning & saving keeps canary. This is a **deliberate, scoped exception** to the Pastel-Taxonomy Rule — it applies only to `.group-badge` on this page, not to the page-hero glyph, the suggestion-dropdown glyphs, or any other module's pastel identity.
- **Suggestion dropdown:** white 12px panel, hairline, composited-only open animation; rows = module-pastel glyph tile, EN name 600, VI name slate, bilingual group tag. Works identically docked and at rest (same element, never cloned).

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
- **Don't** use pure `#000` for text or a second dark surface color; ink `#111111` and charcoal `#272625` are the only darks.
- **Don't** add confetti, hype-driven number celebrations, or casino urgency cues — calm is the brand.
- **Don't** ship copy with undefined financial jargon — define terms inline (the info-modal pattern is the model).
