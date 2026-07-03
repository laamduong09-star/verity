---
target: actual website.html
total_score: 26
p0_count: 0
p1_count: 4
timestamp: 2026-06-24T07-17-05Z
slug: actual-website-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Debounced live update + countPop give clear feedback; fast typers can outrun the 300ms pop animation. |
| 2 | Match System / Real World | 3 | Plain-language labels throughout; clamp-notes read like real sentences, not error codes. |
| 3 | User Control and Freedom | 2 | No reset/undo for inputs; modal Esc/backdrop-close works well. |
| 4 | Consistency and Standards | 4 | Pill buttons, card radius, accent rules, typography consistently applied everywhere. |
| 5 | Error Prevention | 2 | rate/years are clamped with a visible note; initial/monthly have no max at all, inconsistent within the same card. |
| 6 | Recognition Rather Than Recall | 3 | Units stay inline ($, %, years); info modal is one click away. |
| 7 | Flexibility and Efficiency | 2 | No keyboard increment shortcuts beyond native spinners; no quick-start presets. |
| 8 | Aesthetic and Minimalist Design | 3 | Calm, uncluttered; the zero-state chart axis glitch is the one moment that breaks the polish. |
| 9 | Error Recovery | 1 | Clamping silently rewrites values with no undo; comparison widget's $0-floor copy actively misleads rather than helps recovery. |
| 10 | Help and Documentation | 3 | Info modal is genuinely good plain-language help; no inline glossary elsewhere (e.g. "high-yield savings"). |
| **Total** | | **26/40** | **Acceptable, solid foundation, error prevention/recovery need work** |

## Anti-Patterns Verdict

**LLM assessment**: Clean against the absolute-ban list, no gradient text, side-stripe borders, uppercase eyebrows, 01/02/03 markers, or glassmorphism. The two-accent discipline, tabular-nums treatment, and seeded/physics-driven gutter constellation all read as a real design system, not template defaults. The one exception: the background grid is the single most generic, first-idea element on the page, a flat 48px line grid at 5% opacity is the most literal possible execution of "graph paper," and everything else on the page (the amber exception, the gutter constellation) got a more bespoke second pass that the grid never did. (Known open thread: a halftone-dot trajectory-fan replacement was already designed and approved this session but not yet implemented.)

**Deterministic scan**: 3 findings, all pre-existing and previously dispositioned, single-font (false positive, doesn't account for the two linked Google Fonts), em-dash-overuse (accepted, legitimate em-dashes in disclaimer/clamp-note copy), and a design-system-color advisory for rgba(28, 35, 48, 0.08) (the .card:hover shadow, a minor pre-existing doc-gap). No new CLI findings.

**Visual overlays**: The injected browser detector found 2 new issues not caught by the CLI scan: (1) .breakdown-table-wrap has zero internal padding and measurably overflows its container at mobile width (scrollWidth 307px vs clientWidth 236px) with no overflow-x handling, a real, verified mobile defect. (2) A "thin border + wide shadow" pattern flagged on what is almost certainly the info modal, but DESIGN.md explicitly documents the modal's 0 24px 48px shadow as the one deliberately heavier shadow in the system, reserved for the modal, so this reads as a likely false positive against an intentional, documented choice rather than a real issue.

## Overall Impression

This is a real, considered product, not a templated AI page, the two-accent rule, the bilingual parity discipline, and the clamp-note pattern all show a system that mostly polices itself well. But the polish is uneven in exactly the places that matter most for this audience: the two fields most likely to get an extreme value (dollar amounts, not percentages) are the two fields with no guardrail, and the one widget designed to reassure a first-time saver can instead tell them, in plain English, that investing got them "$0 more" when their own plan is the worst of the three options shown. The single biggest opportunity is closing that error-prevention/error-recovery gap, a small set of fixes with outsized trust impact for a "calm confidence" financial product aimed at people without a baseline to sanity-check the numbers themselves.

## What's Working

1. **The clamp-note pattern**, rewrites and explains in one calm sentence using the one color budgeted for caution (rose). Exactly the "explain, don't impress" principle done right.
2. **The info modal**, two short paragraphs that explain the mechanism ("each year's gains start earning their own returns"), not just the term. Matches the audience's stated need.
3. **Keyboard/focus discipline**, full, logical tab order through nav, roadmap items (focusable-but-inert, correctly), toggle, info, inputs, table; modal traps and restores focus correctly.

## Priority Issues

**[P1] Comparison widget gives misleading "win" copy when the user's plan underperforms a savings account.** Why it matters: the gap is clamped to $0 with Math.max(diff, 0), so when "This plan" is visibly the worst bar, the callout still reads "Investing instead of just saving puts $0 more in your pocket", sounding like a hedge or a bug rather than the honest "you're currently behind a savings account" message this audience needs most. Fix: branch the copy when balance is at or below HYSA balance to acknowledge the rate is conservative, instead of a flat "$0 more." Suggested command: /impeccable clarify.

**[P1] Zero/near-zero inputs produce a broken-looking chart.** Why it matters: clearing a field while editing (an easy, ordinary action) yields Chart.js y-axis labels like "$1, $0, $0, -$0, -$1", looks like the page is malfunctioning, not like a contrived edge case, to exactly the persona most likely to second-guess themselves. Fix: detect a flat/zero dataset and force a sane y-axis range instead of relying on autoscale. Suggested command: /impeccable harden.

**[P1] No upper bound on initial/monthly inputs.** Why it matters: rate (max 30) and years (max 60) are properly clamped with a visible note; initial/monthly have only a min. A 9-digit entry produces an unguarded $58B result, inconsistent with the product's own established pattern two fields over. Fix: add a reasonable max (e.g. $1M / $50k-per-month) with the same clamp-note treatment already built for rate/years. Suggested command: /impeccable harden.

**[P1] Breakdown table overflows its container on mobile.** Why it matters: .breakdown-table-wrap has 0 padding and measurably overflows (307px content in a 236px box) with no overflow-x handling, a real rendering defect for the "distracted mobile user" persona, not a false positive (independently verified via getComputedStyle/scrollWidth). Fix: add overflow-x: auto (or a small inset padding) to the wrapper so mobile users get a scrollable table instead of overflow/clipping. Suggested command: /impeccable adapt.

**[P2] The "years" suffix is not wrapped in the .en/.vi bilingual pattern.** Why it matters: confirmed live in VI mode, every other label switches languages, but the suffix span stays in English, directly contradicting the explicit "bilingual parity, never a translated afterthought" rule, and it's the most visible miss precisely because everything else does this correctly. Fix: wrap it in the standard .en/.vi sibling pair ("years" / "nam"). Suggested command: /impeccable adapt.

**[P3] No reset/undo affordance for the four inputs.** Why it matters: minor, recovering from an extreme test value means manually retyping each field; a workaround exists. Fix: small ghost-button "reset to defaults" near "Your inputs." Suggested command: /impeccable delight.

## Persona Red Flags

**Jordan (confused first-timer, low financial literacy, primary persona for this audience):** Lands on 6 simultaneous data surfaces (inputs, chart, 3 stats, table, comparison widget) with no guided "start here" moment. Clearing a field mid-edit shows the broken-looking zero-state chart. Lowering the rate to "test conservative" gets told they gained "$0 more" with no signal that they're now behind a savings account, read at face value as "no difference," not "you're behind."

**Sam (accessibility-dependent, screen reader, keyboard-only, zoom, contrast):** Tab order and modal focus-trap are clean and correct; the custom cursor is correctly gated off keyboard-only users via (hover: hover) and (pointer: fine). Real gap: editing an input updates the final balance, stats, table, and comparison bars with no live-region announcement, a screen-reader user gets silence until they manually re-navigate to each region.

**Riley (stress tester):** Found exactly the two breakages already flagged as P1 (zero-state chart glitch; unbounded dollar fields letting a $58B value through unchallenged), the asymmetry between the two clamped fields (rate, years) and the two unclamped ones (initial, monthly) is the tell this wasn't a deliberate scope decision.

**Mai (project-specific persona, 22, first paycheck, parents speak limited English):** Most likely to switch to VI and screenshot the page to explain it to a parent, the one English word left behind ("years," P2) is exactly the kind of detail that makes that screenshot look unfinished to the person she's trying to build trust with. Separately, the comparison widget assumes she already knows what a "high-yield savings account" is and why it beats checking, never defined inline, despite PRODUCT.md's explicit "define financial terms inline" rule.

## Minor Observations

- Stat icon SVGs (bar-chart, document/list) are generic financial iconography, fine, lowest-priority polish.
- The custom cursor (global cursor: none on hover-capable devices) works smoothly but is the single highest-risk decoration on the page if a user's pointer ever desyncs; not urgent, worth a periodic check.
- rgba(28, 35, 48, 0.08) card-hover shadow color remains undocumented in DESIGN.md's literal token list (pre-existing, minor).

## Questions to Consider

- If "explain, don't impress" is the north star, why does the comparison widget's copy get to be misleadingly upbeat the moment the real number is unflattering, was the below-HYSA branch ever tested?
- rate/years earned a max + clamp-note pair; was leaving initial/monthly unclamped an intentional scope cut, or did "numbers people type" just stop at percentages?
- The grid background is literally named "Graph Paper Calm" in DESIGN.md and is the most literal possible reading of that name, now that a more bespoke replacement (halftone trajectory fan) has already been designed this session, what's left before shipping it?
