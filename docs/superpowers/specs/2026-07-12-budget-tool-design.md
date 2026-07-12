# Budget Module — 50/30/20 Paycheck Splitter — Design

**Date:** 2026-07-12
**Status:** Approved (user-approved design, this doc is the written record)

## Purpose

An interactive budgeting tool for teen first-time earners: enter what you get paid,
see it split into Needs / Wants / Savings with real dollar amounts, concrete
teen-relevant examples of each bucket, and a bridge into the existing compound-interest
calculator ("see what saving $X/month grows into"). First of four planned new modules
(Budgeting, FAFSA guide, credit-from-scratch, immigrant-targeted scams); this spec
covers only the Budgeting Tool.

Chosen shape: **presets + adjustable split** (approach A). Rejected: fixed 50/30/20
only (a teen living at home has almost no "needs", so a fixed 50% needs bucket
misfits the audience) and a draggable stacked-bar divider (drag + touch +
accessibility cost duplicates what chips and number inputs express more clearly).

**Stateless.** Nothing persists between visits — same as the calculator. No
localStorage, no accounts.

## Page & module identity

- New files: `budget.html`, `js/budget.js`.
- Body class `module-budget`; new pastel token `--pastel-budget` in the soft
  lavender family — exact hex chosen during implementation, tuned against the
  existing five pastels.
- Nav capsule on **all** pages gains a "Budget" item; footer link list too.
- `DESIGN.md`: Pastel-Taxonomy Rule rewords from "five flat pastels color-code the
  five modules" to "one flat pastel per module"; new token documented.

## Layout

Mirrors the calculator page:

1. `.page-hero` — lavender icon tile (three-column split glyph), 36px heading,
   `.page-hero-sub` paragraph.
2. Two-column grid: **inputs card** (left) + **chart card** (right); stacks to one
   column under 800px, same breakpoint as the calculator grid.
3. Row of three **bucket cards**: Needs / Wants / Savings.

## Inputs card

- **Amount input** — "Money you get", with a period `<select>`:
  *per week / every two weeks / per month*.
- **Preset chips** (8px radius, existing chip style):
  - **50/30/20 — Classic**
  - **20/30/50 — Living at home** (save aggressively while expenses are low)
  - **Custom**
- Selecting **Custom** reveals three percentage inputs (Needs / Wants / Savings).
  - While the three don't sum to 100, results render using the entered values
    **normalized to their sum**, and an inline note appears (same pattern and
    styling as the calculator's `.clamp-note`): "Adds up to 87% — adjusted to fit."
  - Individual inputs clamp to `min="0" max="100"` via the existing
    `clampToInput` pattern.

## Calculation & render loop

Same architecture as `calculator.js`, no shared state between pages:

- One pure function `splitPaycheck(amount, pctNeeds, pctWants, pctSavings)`
  returning per-bucket dollar amounts (normalizing percentages to their sum).
- One `update()` entry point: reads all inputs, calls `splitPaycheck`, pushes into
  the chart, the three bucket cards, and the savings cross-link. Wired to a
  debounced input listener **and** called directly by the language-toggle click
  handler (so chart text refreshes on language switch).

## Chart card

- Chart.js **doughnut**, three segments in the established data-UI palette;
  center label shows the paycheck total for the selected period.
- Chart.js loads via the same CDN `<script>` tag the calculator page uses.
- Tooltips and the chart `aria-label` are JS-generated, so they follow the
  existing `CHART_STRINGS` lookup + `isViPrimary()` pattern, not the span pattern.

## Bucket cards

Each card: dollar amount (large), percentage (small), and 3–4 concrete teen
examples as a plain list:

- **Needs:** phone bill, bus pass, food you owe family, school supplies.
- **Wants:** eating out, games, clothes, streaming.
- **Savings:** emergency cushion, future goals (laptop, car, college costs).

The **Savings card** ends with the cross-link:
"See what saving $X/month grows into →" pointing at
`actual%20website.html?monthly=X` where X is the savings amount converted to
monthly (×4.33 for weekly, ×2.17 for biweekly, ×1 for monthly), rounded to a
whole dollar.

### Calculator-side change

`js/calculator.js` gains a small on-load step: read the `monthly` query param;
if present and numeric, prefill the monthly-contribution input **through the
existing `clampToInput`** (so the cap note shows if the value exceeds the input's
max), then call `update()`. No other calculator behavior changes.

## Bilingual (EN/VI)

- Every visible string is the standard sibling-span pair
  `<span class="en">…</span><span class="vi">…</span>`.
- **No component-level `.en`/`.vi` display overrides** — visibility is owned
  solely by the consolidated rule block at the bottom of `style.css`.
- JS-generated strings (chart tooltips, aria-label, the dynamic "$X/month" link
  text) use the `CHART_STRINGS`-style lookup keyed off `isViPrimary()`.

## Error handling

- Empty or zero amount: buckets render $0 and the chart renders muted/empty —
  no error state, no blocking.
- Custom percentages summing ≠ 100: normalize + inline note (above).
- Out-of-range single values: input `min`/`max` clamp via `clampToInput` with a
  visible clamp note (never silent).

## Verification

- `node --check js/budget.js` and `node --check js/calculator.js`.
- CSS brace-balance check after `style.css` edits.
- Live on the preview server (`http://localhost:3000/website/budget.html`):
  - Split math spot-checked at known values (e.g. $200 at 50/30/20 → 100/60/40).
  - Preset chips switch ratios; Custom reveals inputs; normalization note appears
    and disappears correctly.
  - Savings cross-link opens the calculator with monthly contribution prefilled
    and results recomputed.
  - Language toggle flips every string on the page, including chart tooltips.
  - Both budget page and calculator page checked at mobile width.
  - `getComputedStyle(document.body).backgroundColor` → `rgb(246, 245, 243)`
    (cream canvas holds on the new page).

## Out of scope

- FAFSA guide, credit-from-scratch, and scams modules (separate future specs).
- Any persistence (localStorage or otherwise).
- Itemized/custom expense line items inside buckets.
- Draggable chart interactions.
