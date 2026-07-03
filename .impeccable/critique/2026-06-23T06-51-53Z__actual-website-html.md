---
target: actual website.html
total_score: 27
p0_count: 1
p1_count: 2
timestamp: 2026-06-23T06-51-53Z
slug: actual-website-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live recalc + value-pop animation give feedback; no explicit "updated" cue beyond the number pop itself |
| 2 | Match System / Real World | 3 | Plain language mostly; "Growth multiplier — 1.47×" has no inline definition for a financial novice |
| 3 | User Control and Freedom | 2 | No reset-to-defaults once inputs are typed; modal Esc/backdrop-click works well |
| 4 | Consistency and Standards | 3 | Pill buttons/16px cards/two-accent rule mostly consistent; marigold/amber is "reserved" in DESIGN.md yet fully active on the Growth Multiplier icon |
| 5 | Error Prevention | 3 | `clampToInput` prevents out-of-range values, but clamps silently with no message |
| 6 | Recognition Rather Than Recall | 3 | Labels/units always visible, no memorization needed |
| 7 | Flexibility and Efficiency | 2 | Single path only; no presets, saved scenarios, or shortcuts |
| 8 | Aesthetic and Minimalist Design | 3 | Mostly clean; custom cursor-follower + 42-dot field are the one excess against an otherwise restrained system |
| 9 | Error Recovery | 2 | Silent input clamping (years snaps to 60 with zero message) — user has no idea their input changed |
| 10 | Help and Documentation | 3 | The info modal is a strong, well-scoped "explain don't impress" feature; no inline help elsewhere (e.g. "Growth multiplier") |
| **Total** | | **27/40** | **Acceptable — solid foundation, real gaps to close before this is "good"** |

## Anti-Patterns Verdict

**Does this look AI-generated? Mostly no, with two tells.**

**LLM assessment:** This doesn't read as templated AI slop at first glance — no gradient text, no glassmorphism, no fake 01/02/03 markers, no identical card-grid filler, real tabular financial data, a restrained two-accent palette that actually matches its own documented system. Two things read as "AI-coded-feeling" rather than "AI-looking": (1) the custom cursor-follower (`#cursorDot`/`#cursorRing`, a permanent RAF loop) is an unrequested flourish with zero functional payoff in a *product-register* finance tool whose whole brand is "calm, not impressive"; (2) the 42-node floating dot field behind the hero is a textbook generative "constellation/particle hero," the kind of ornamental treatment that risks brushing the brand's own "calm, not hype" anti-reference even though it's subtle and on-palette.

**Deterministic scan:** `actual website.html` — 2 findings: `single-font` (warning, line 9) and `em-dash-overuse` (warning, 5 em-dashes in body copy). `css/style.css` — 1 finding: `design-system-color` (advisory) on `rgba(28, 35, 48, 0.08)` at line 485. `js/calculator.js` — clean. Browser-side overlay added 3 more: `ai-color-palette` ("cyan gradient background"), `cramped-padding` on `.breakdown-table-wrap`, and `gpt-thin-border-wide-shadow` (1px border + 48px shadow blur).

**Reconciling the two assessments — several of the detector's hits are false positives once checked against this project's own documented system, already dispositioned earlier this session:**
- `single-font`: the `<link>` on line 9 loads *two* families (Lexend + Be Vietnam Pro) on one line; the detector's string-matching missed the second family. Not a real issue.
- `em-dash-overuse`: pre-existing copy style, not new drift.
- `design-system-color` (rgba 28,35,48,0.08): this is DESIGN.md's own documented "Lifted" hover shadow, just expressed in prose rather than the YAML token list — not drift.
- `gpt-thin-border-wide-shadow`: this is the modal's `0 24px 48px rgba(17,21,31,0.18)` shadow, which DESIGN.md explicitly calls out as "the one deliberately heavier shadow in the system, reserved for the info modal" (the Earned-Depth Rule's stated exception). The detector can't see intent; a human reading the design system can. Not a real issue.
- `ai-color-palette` ("cyan gradient background"): no cyan gradient exists anywhere in this codebase (checked `css/style.css` — the only gradients are the three stat-icon gradients in blue/teal/amber, none cyan). Likely a false positive from the detector's heuristic misreading the radial-gradient hero-decor mask or a chart canvas paint. No action needed.
- `cramped-padding` on `.breakdown-table-wrap`: genuinely worth a quick look (P3 below) but low-confidence without a design call — could be intentional table-bleeds-to-edge.

**No visual overlay was confirmed in either assessment** — Assessment B's injected detector ran and logged to console but produced no on-page highlight boxes, so there's nothing to point you to in a live tab.

## Overall Impression

The bones are good: a real, working calculator with honest math, a documented and mostly-followed design system, and a genuinely useful "what compounding buys you" comparison widget that does exactly what the brand promises (explain, don't impress). The single biggest opportunity is that **the bilingual promise — the product's stated #1 differentiator — is broken on the highest-visibility text on the page.** Toggling to Vietnamese doesn't translate the hero headline, the two card titles, or any of the chart's text. For a product whose entire audience definition is "bilingual EN/VI, family didn't explain this in English," that's not a polish issue, it's a credibility issue.

## What's Working

1. **The "What compounding buys you" comparison widget** converts an abstract growth multiplier into a concrete, three-tier dollar comparison (this plan vs. high-yield savings vs. checking) — exactly the "show the mechanism, don't just state the outcome" principle from PRODUCT.md, executed well.
2. **The `.en`/`.vi` sibling-span architecture**, where it's actually used (field labels, disclaimer, modal body), is well-engineered: same DOM, same layout, pure visibility toggle — avoiding the "translated afterthought" feel the brand explicitly wants to avoid.
3. **Defensive numeric handling** (`clampToInput`, `Math.max(...) || 1` divide-by-zero guards) means the calculator never shows NaN or a broken chart even at extreme inputs (years=60, rate=0) — verified live by both assessments.

## Priority Issues

- **[P0] Bilingual parity is broken on the page's highest-visibility strings.** The hero title ("See your money grow."), both card titles ("Your inputs," "Projected growth"), and the chart's tooltip/aria-label text are hardcoded English with no `.vi` counterpart, confirmed by toggling the language switch and inspecting the DOM. **Why it matters:** this directly contradicts DESIGN.md's "Bilingual parity" principle and PRODUCT.md's explicit "never a translated afterthought" — for users who are more comfortable reading Vietnamese, the most important text on the page never switches. **Fix:** wrap the hero `<h1>` text and both `.card-title` headings in `.en`/`.vi` spans exactly like every other label on the page; localize the Chart.js `label`/`title`/`aria-label` strings via a small string map keyed off `document.body.classList.contains('lang-vi-primary')`. **Suggested command:** `/impeccable harden` (i18n correctness is exactly its territory) or `/impeccable clarify` if you want copy-first framing.

- **[P1] Four of five nav items are unmarked dead links.** "Recommend," "Jargon," "Credit," "Family Split" are real, roadmapped modules per PRODUCT.md, but render as fully-styled, fully-interactive nav pills pointing at `href="#"`. **Why it matters:** a first-time user (exactly this product's target persona) has no signal these aren't built yet; clicking does nothing, which reads as broken rather than "coming soon," and a screen-reader user tabs through four "live" links that go nowhere with no `aria-disabled` state. **Fix:** either visually de-emphasize (lower opacity, `aria-disabled="true"`, suppress hover/active styling) or add a small "coming soon" affordance. **Suggested command:** `/impeccable clarify`.

- **[P1] Input clamping is silent.** Typing 9999 into "Time horizon" snaps to 60 with zero feedback (`clampToInput` rewrites the field directly). **Why it matters:** a confused-first-timer persona won't understand why their input changed itself, which undermines exactly the trust/calm-confidence the brand is built on. **Fix:** a brief inline note near the field ("Capped at 60 years") that appears momentarily when clamping occurs. **Suggested command:** `/impeccable clarify`.

- **[P2] Marigold is documented as reserved/unused but is fully active.** DESIGN.md states marigold has no defined role yet, but `--marigold` plus an amber icon gradient is live on the "Growth multiplier" stat card today, which is a direct violation of the system's own written Two-Accent Rule. **Why it matters:** it's not visually broken (the icon still reads fine), but the design system document and the shipped page now disagree, which will compound as more components get added. **Fix:** either formally assign amber/marigold a role in DESIGN.md (it's arguably earned a place as a third "neutral/informational" stat accent at this point) or recolor that one icon into the teal/blue system. **Suggested command:** `/impeccable document` (resync DESIGN.md with what's actually shipped) or a quick manual color swap.

- **[P3] Unrequested decorative motion: custom cursor-follower + 42-node dot field.** Both run indefinitely via `requestAnimationFrame`/CSS animation loops with no functional payoff in a calm, explain-don't-impress finance tool. Low risk (already gated behind `prefers-reduced-motion` and pointer:fine), but it's the clearest "an agent added flair nobody asked for" tell in an otherwise restrained system. **Fix:** consider cutting the custom cursor entirely; the dot field is more defensible as the hero's signature "graph paper calm" atmosphere per DESIGN.md, so lower priority to touch. **Suggested command:** `/impeccable quieter`.

## Persona Red Flags

**Jordan (Confused First-Timer):** (1) "Growth multiplier — 1.47×" has no inline definition — a first-timer may not connect "×" to "your money is worth 1.47 times what you put in," exactly the kind of unexplained jargon PRODUCT.md says to avoid. (2) The four dead nav links are a direct trust hit on first contact — clicking "Jargon" (which PRODUCT.md describes as a literal glossary feature) and getting nothing could read as "this whole site is broken," before the user even reaches the calculator. (3) Silently-clamped inputs look like the tool "fixed itself" with no explanation.

**Sam (Accessibility-Dependent):** (1) The four `href="#"` nav links are real, focusable tab-stops that announce as live navigation to a screen reader but go nowhere, with no `aria-disabled` or state communicated. (2) The chart canvas (`role="img"`) exposes only one static summary `aria-label` — the year-by-year shape of the curve is only available via the underlying breakdown `<table>` (a good fallback that exists, but isn't explicitly cross-referenced for screen-reader users beyond `aria-describedby`). (3) `--slate` (#5d5f68) label/caption text on `--card` (#faf9f7) is worth a direct contrast-ratio check at the small sizes used for stat labels and table headers — it's close enough to the 4.5:1 line to need verification, not just an eyeball pass.

## Minor Observations

- Disclaimer copy ("Educational tool only — not licensed financial advice") is calm and unobtrusive — good execution of the brand's "calm confidence" principle.
- The three comparison bars (this plan / HYSA / checking) currently distinguish "this plan" vs. "HYSA" by teal opacity alone (0.85 vs 0.35) plus bar width — width already carries the real signal, but a colorblind user relying on color alone between the two teal tones could still struggle; this is a minor reinforcement issue, not a blocker, since width is present.
- `.breakdown-table-wrap`'s bottom edge reads slightly cramped per the detector (P3-tier, low confidence — could be intentional table-bleeds-to-edge).
- Favicon 404 in console is cosmetic noise, not a real defect.

## Questions to Consider

- If "Jargon" is meant to define financial terms inline, why does "Growth multiplier" — the single most jargon-y label on the page today — get no inline definition, when the product's stated purpose is explaining mechanism over impressing with a number?
- Is the custom cursor-follower actually serving the stated audience (anxious first-time earners who want calm), or optimizing for impressing whoever's looking at the code — would removing it cost the page anything a real user would miss?
- Bilingual parity is a stated brand pillar with its own named rule in DESIGN.md — would it be worth a standing checklist item ("did you toggle EN/VI and actually read the result") for every future change that touches visible text?
