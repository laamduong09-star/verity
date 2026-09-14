# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (EN/VI) financial literacy site for young first-time earners, starting with a single compound-interest calculator page. Today it's hand-written static files — no framework, no package.json yet:

- `calculator.html` — the calculator page (this was `index.html` originally, then `actual website.html` with a literal space; renamed to `calculator.html` on 2026-09-13 before publishing, so the public URL is not `/actual%20website.html`. `index.html` is the landing page)
- `index.html`, `recommend.html`, `jargon.html`, `credit.html`, `budget.html`, `tuition.html` — the other pages
- `css/style.css` — the shared design system and every component used on more than one page. Two pages additionally carry a page-scoped stylesheet for a visual system that is theirs alone and would be dead weight everywhere else: `css/credit.css` (the 300–850 score rail), `css/tuition.css` (the money ruler), `css/budget.css` (the money-that-goes-home figure) and `css/recommend.css` (the ladder margin notes), each loaded *after* `style.css`. Default to `style.css`; only reach for a page-scoped file when the component genuinely cannot be reused.
- `js/` — one vanilla-JS file per page plus shared `site.js`. Budget splits its logic across two files: `js/budget-math.js` (pure math, no DOM — `splitPaycheck`/`toMonthly` — node-testable) and `js/budget.js` (DOM wiring, loads budget-math.js first). `js/scroll-scale.js` (the landing app-window scroll effect, see DESIGN.md) follows the same split from `js/landing.js`, and so does Tuition (`js/tuition-math.js` — pure `amortize`/`standardTierYears`/`salaryCheck` — plus `js/tuition.js`). Recommend has no page script at all: its four-question placement block was removed on 2026-09-05 and the ladder is static markup.
- `tests/` — node:test unit tests, inside `website/`: `tests/budget-math.test.js`, `tests/scroll-scale.test.js`, `tests/credit-rail.test.js`, `tests/tuition-math.test.js`. Each requires its module with a `../js/…` relative path, so they must be run from the `website/` directory. See Commands below.

Fonts (Lexend + Be Vietnam Pro) load from Google Fonts via a `<link>` tag in the HTML head; there are no other external dependencies besides Chart.js (also loaded via CDN, referenced in the HTML).

**Build tooling is permitted** (decision 2026-07-10, reversing the earlier no-tooling rule): adding a package manager, bundler, Tailwind, TypeScript, or a framework is allowed when a task genuinely needs it. Two conditions still apply: (1) don't bolt on a toolchain for something plain CSS/JS can express in a few lines — prefer the lightest tool that does the job; (2) whatever the stack, the bilingual `.en`/`.vi` parity system and DESIGN.md remain binding, and existing pages must keep working during any migration.

## Use the right plugin/skill for the task

Don't default to ad-hoc edits or freehand research when an installed plugin already covers the task. Check the available-skills list in context and reach for the match before improvising. Relevant ones for this repo:

**Design / UI**
- **impeccable** — this repo's primary design skill (`PRODUCT.md` + `DESIGN.md` + `.impeccable/` are already set up for it). Use its sub-commands for design review and systematic passes: `/impeccable critique`, `polish`, `layout`, `clarify`, `harden`, `colorize`, `typeset`, etc., rather than editing styles freehand.
- **frontend-design** — shaping a new UI surface or section from scratch where the goal is a distinctive, intentional aesthetic (not a templated/generic-AI-default look). Good for first-pass layout/typography/palette direction before impeccable's review loop kicks in.
- **emil-design-eng** (Emil Kowalski philosophy) — animation, motion, and micro-interaction decisions specifically (easing curves, transition timing, hover/press feedback, when *not* to animate).
- **21st.dev magic** (`mcp__magic__*` tools, formerly "21st dev") — quickly generating, inspecting, or refining individual UI components in isolation.
- **figma** — if a Figma file/design handoff is ever involved (file generation, Code Connect, diagrams).

**Code quality / dev process**
- **superpowers** — process skills: `brainstorming` before any creative/feature work, `systematic-debugging` for bugs, `test-driven-development`, `writing-plans`/`executing-plans` for multi-step work, `using-git-worktrees`, etc.
- **feature-dev** — guided feature development with codebase-understanding and architecture subagents (`code-architect`, `code-explorer`, `code-reviewer`) for anything bigger than a small edit.
- **code-review** — formal review of a diff/PR.
- **code-simplifier** — simplifying/cleaning up recently-changed code without altering behavior.
- **typescript-lsp** — TS/JS language-server-backed lookups (types, references, definitions) if the JS grows complex enough to need it.
- **context7** — fetch current library/framework docs (e.g. a Chart.js API question) instead of relying on training data.

**Repo / infra**
- **github** / **gitlab** — PR, issue, and repo operations instead of raw `gh`/`glab` guesswork.
- **vercel** — if/when this site gets deployed (deployment, env vars, domains).
- **playwright** — browser automation for live verification (used during design critiques to inject the detector overlay and screenshot the page).

**Content / other**
- **marketing-skills** — copywriting, SEO content, ads, etc., if marketing work for this product is requested.
- **claude-seo** — technical/content SEO audits if this site needs to rank.
- **claude-md-management** — revising this very file after a session's learnings.
- **context-engineering** — memory/context-system patterns for multi-agent or long-running work.
- **skill-creator** — creating or editing a skill itself, not for using one.

If a request could plausibly match more than one, pick by what the task most specifically needs rather than the first one that comes to mind.

## Commands

There is no build step, package.json, linter, or test suite in this repo *yet* (build tooling is now permitted — see "What this is"). Until one lands:

- **Serve locally**: `npx serve -p 8743 .` from the project root, then open `http://localhost:8743/calculator.html`.
- **Syntax-check the JS** after editing: `node --check js/<file>.js`
- **Check CSS brace balance** after large edits (no CSS parser is wired up): count `{`/`}` are equal, e.g. via `grep -c` or a quick Node one-liner.
- **Line endings are mixed and must be preserved per file.** Exactly five files are CRLF — `css/style.css`, `DESIGN.md`, `index.html`, `js/scroll-scale.js`, `tests/scroll-scale.test.js` — and everything else is LF. (This list was wrong until 2026-09-13: it named only the first two, so the three CRLF files that are also `.html`/`.js` were being described as LF. Verify with `grep -cU $'\r$' <file>` against `wc -l` rather than trusting the list.) `.gitattributes` sets `* -text` so git stores and checks out bytes exactly as they are; without it `core.autocrlf` rewrites them on checkout and a fresh clone silently differs from this machine. Check with `grep -qU $'\r' <file>` before and after editing. **`sed -i` silently rewrites a CRLF file as LF in this environment** — it converted all 310 lines of DESIGN.md on a one-line insert (2026-09-04). Use the Edit tool on CRLF files, or if you must use `sed -i`, restore afterwards with `sed -i 's/$/\r/' <file>` and verify with `grep -cUv $'\r$' <file>` returning 0 and `grep -cU $'\r\r$' <file>` returning 0.
- **Run unit tests**: from `website/`, `node --test tests/budget-math.test.js tests/scroll-scale.test.js tests/credit-rail.test.js tests/tuition-math.test.js` (39 tests as of 2026-09-05). Run them from `website/`, not the session root — each test requires its module via `../js/…`. List files explicitly rather than pointing `node --test` at the bare `tests/` directory; the directory form hits a path-resolution quirk in this environment's shell and fails with a misleading `Cannot find module 'tests'` error instead of discovering the files inside it. **Watch out:** `node --test` silently *passes* when handed a path that doesn't exist — it reports `pass N, fail 0` for whichever files it did find and says nothing about the missing ones. Check the reported test count matches what you expected before trusting a green run. `js/budget-math.js`, `js/scroll-scale.js`, `js/tuition-math.js` and `js/recommend-ladder.js` are plain browser scripts that also export via `if (typeof module !== 'undefined') module.exports = {...}`, which is what lets node:test `require()` them directly without a DOM.

If a build step is ever added, document its commands here and keep the no-tooling workflow above working until every page is migrated.

## Architecture

### Single render loop, no framework

`js/calculator.js` is plain vanilla JS. `projectGrowth(initial, monthlyContribution, annualRatePercent, years)` is the one pure calculation function — it returns one row per year (`{ year, balance, contributed, interest }`), cumulative, not per-year deltas. `update()` is the single re-render entry point: it reads all four inputs, calls `projectGrowth` (once for the main plan, again for the high-yield-savings and checking-account comparison baselines), and then pushes the results into every dependent UI piece — the Chart.js graph, the four stat cards, the year-by-year breakdown table, and the "what compounding buys you" comparison widget. `update()` runs on a debounced input listener and is also called directly by the language-toggle click handler (so chart text refreshes immediately on language switch, not just on the next input change). There's no component model — any new derived UI must be wired into `update()` by hand.

`clampToInput(input, value, noteEl)` clamps a value to the input's own `min`/`max` attributes and, when given a `noteEl`, toggles a visible "Capped at X" message next to the field — don't silently clamp a new input without wiring up a matching `.clamp-note` element, that was a fixed bug.

`js/budget.js` follows the same single-`update()` pattern as the calculator: one re-render entry point reads all inputs (amount, period, active preset/custom percentages), calls the pure `splitPaycheck`/`toMonthly` helpers, and pushes results into the bucket amounts, the doughnut chart, and the savings cross-link. That cross-link writes `#monthly=X` onto a link to the calculator page — the same hash-prefill format `js/calculator.js` already reads on load, so opening it from Budget lands with the monthly-savings figure pre-filled.

### Bilingual system (EN/VI)

Every visible string is two sibling spans: `<span class="en">...</span><span class="vi">...</span>`. Visibility is controlled entirely by CSS, not per-component logic: a single consolidated rule block at the bottom of `style.css` sets `.en { display: block }` / `.vi { display: none }` by default, and `body.lang-vi-primary .en { display: none }` / `body.lang-vi-primary .vi { display: block }` when the toggle (`#langToggle`, top right) is active.

**Do not add a component-specific override like `.my-thing .en { display: block }`.** A rule with more type/class selectors than the global toggle rule can win on CSS specificity and silently break language switching for that one component (this happened once and was fixed by consolidating into the single base rule — see the comment above `.en { display: block }` in `style.css`). If a component needs its `.en`/`.vi` spans to render as separate stacked lines, that's already the default; don't redeclare `display`.

Numbers never need translation, only copy. Strings that get built dynamically in JS (Chart.js tooltips, the chart's `aria-label`) can't use the span pattern since they're not in the DOM ahead of time — instead they read `document.body.classList.contains('lang-vi-primary')` live via the `isViPrimary()` helper and the `CHART_STRINGS` lookup table near the top of `calculator.js`. Follow that pattern for any new JS-generated bilingual text.

### Design system docs

`PRODUCT.md` (audience, brand personality, anti-references) and `DESIGN.md` (color/type/spacing tokens, named rules) are the source of truth for visual decisions — maintained by the "impeccable" Claude Code skill. Before changing colors, typography, spacing, or motion, check these first. Key named rules actually enforced in the CSS:

- **Pastel-Taxonomy Rule**: a flat-pastel taxonomy color-codes the modules, one pastel per module (declared per page as `--module-pastel` via a `<body class="module-…">` hook); flat fills only — never gradients, hovers, or text color.
- **Two-Accent-in-Data-UI Rule**: teal ("result/positive outcome") and blue ("interactive") keep their meanings but only inside data UI (chart, results, meters, links, focus rings). Rose stays reserved for caution.
- **Hairline-Not-Shadow Rule**: white cards on the white canvas separate via 1px `rgba(17,17,17,0.08)` borders, not shadows or tones.
- Shape language is exactly 8px (buttons/chips) / 12px (cards/inputs/capsule) / 9999px (badges); spacing follows a 4px grid (see DESIGN.md).

`.impeccable/` holds that skill's own tooling artifacts (critique snapshots, hook config) — not hand-maintained content.

### Page structure

Top bar (logo, nav capsule, language toggle) → centered hero → two-column calculator grid (inputs card + chart card, stacks to one column under 800px) → stats row (3 stat cards) → breakdown grid (year-by-year table + "what compounding buys you" comparison widget, also stacks under 800px) → disclaimer. An info modal (triggered from the inputs card) explains compound interest inline, per the product's "explain, don't impress" principle.

Six modules have real pages and live nav links — Calculator, Budget, Recommend, Jargon, Credit, and Tuition. (This section previously said several were `aria-disabled="true"` placeholders with a "soon" badge; that has not been true since they were built, and the disabled-nav markup is gone.)

**`tuition.html` was built out against PRD §6.5 on 2026-08-28** (it had been a content-free shell until then). Two rules govern any future edit to it. First, **every figure on the page is dated in place and expires**: the federal rate and loan fee are for loans first disbursed 2026-07-01 → 2027-06-30, the Pell maximum is the 2026–27 award year, the ledger numbers are College Board 2025–26, and the repayment plans are the two that replaced the flat ten-year Standard plan on 2026-07-01. Re-verify against studentaid.gov and the current College Board Trends report before changing any of them, never from memory — a wrong number here costs someone real money. Second, the page deliberately does not restate what other modules own: interest mechanics belong to Calculator, debt-as-reputation to Credit, definitions to Jargon (whose "Paying for college" group holds the six terms this page introduces). Its own subject is the cost side and the choice between ways of paying.

The repayment calculator models the tiered Standard plan only. RAP is described in prose and deliberately not calculated: it moves with income every year, so any single number printed for it would be fiction.

**The ruler is an invariant, not a style choice** (redesign 2026-09-03, replacing a card-based first version). Every `.tu-track` on the page except the calculator's own split must render at the same left offset and the same width, because the page's entire claim is that a bar twice as long is twice the money. Three separate layout decisions broke it during the build and none were visible by eye — an indented staircase, a two-column definition list, and a label column beside the four-year ladder each put a track in a narrower box, where the same `--w` percentage silently meant fewer dollars. Verify with:

```js
[...new Set([...document.querySelectorAll('.tu-track')]
  .filter(t => !t.classList.contains('tu-calc-track'))
  .map(t => { const r = t.getBoundingClientRect(); return `${Math.round(r.left)}@${Math.round(r.width)}`; }))]
```

That must return exactly one entry, at every viewport width. The calculator's split bar is the one deliberate exception — its full width is the total repaid, and the caption under it says so.

The `--w` percentages are hard-coded in the markup because they are facts, not state ($7,395 of $31,000 is 23.85%). Recompute them against $31,000 if a figure changes.

**Budget's columns carry the same invariant** ("Money that goes home", added 2026-09-04): every `.bd-stack` is drawn against one scale, $700 full height, via `flex: none; height: calc(var(--bd-scale) * var(--income) / var(--bd-max))`. Drop `flex: none` and the tallest stack becomes a flex item with default `flex-shrink: 1`, squeezed by its own label's height — short by a dollars-per-pixel margin invisible by eye. Verify in the browser, at every viewport:

```js
[...new Set([...document.querySelectorAll('.bd-stack')].map((s, i) =>
  Math.round([700, 500, 300][i] / s.getBoundingClientRect().height * 100) / 100))]
```

Must return exactly one entry. The three `.bd-seg.is-home` blocks must likewise all report the same height. See DESIGN.md, "Budget columns".

Each module page owns its visual system rather than sharing one template, because the subjects differ: Recommend is a numbered seven-rung ladder with paired figures (order *is* the content), Credit is a 300–850 score rail the sections anchor to, Tuition is a money ruler — one shared $0–$31,000 horizontal scale that every bar on the page is drawn against. When adding to a module page, extend that page's own language instead of copying another module's layout — a shared shell across the modules is explicitly not the goal.

## Delegation policy

Implementation work like writing components, styling, and routine edits should be delegated to the `executor` subagent (defined in `.claude/agents/executor.md` at the session project root), while planning, architecture decisions, and reviewing the executor's output stay with the orchestrating session directly. Plan first and present the plan before any code is written; then hand the decided spec to the executor rather than implementing inline.
