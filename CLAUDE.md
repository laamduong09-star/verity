# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (EN/VI) financial literacy site for young first-time earners, starting with a single compound-interest calculator page. Today it's hand-written static files — no framework, no package.json yet:

- `actual website.html` — the calculator page (note the literal space in the filename; this used to be `index.html`, renamed outside of git; `index.html` is now the landing page)
- `index.html`, `recommend.html`, `jargon.html`, `credit.html`, `family-split.html` — the other pages
- `css/style.css` — all styling
- `js/` — one vanilla-JS file per page plus shared `site.js`

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

- **Serve locally**: `npx serve -p 8743 .` from the project root, then open `http://localhost:8743/actual%20website.html` (the URL-encoded space is required).
- **Syntax-check the JS** after editing: `node --check js/<file>.js`
- **Check CSS brace balance** after large edits (no CSS parser is wired up): count `{`/`}` are equal, e.g. via `grep -c` or a quick Node one-liner.

If a build step is ever added, document its commands here and keep the no-tooling workflow above working until every page is migrated.

## Architecture

### Single render loop, no framework

`js/calculator.js` is plain vanilla JS. `projectGrowth(initial, monthlyContribution, annualRatePercent, years)` is the one pure calculation function — it returns one row per year (`{ year, balance, contributed, interest }`), cumulative, not per-year deltas. `update()` is the single re-render entry point: it reads all four inputs, calls `projectGrowth` (once for the main plan, again for the high-yield-savings and checking-account comparison baselines), and then pushes the results into every dependent UI piece — the Chart.js graph, the four stat cards, the year-by-year breakdown table, and the "what compounding buys you" comparison widget. `update()` runs on a debounced input listener and is also called directly by the language-toggle click handler (so chart text refreshes immediately on language switch, not just on the next input change). There's no component model — any new derived UI must be wired into `update()` by hand.

`clampToInput(input, value, noteEl)` clamps a value to the input's own `min`/`max` attributes and, when given a `noteEl`, toggles a visible "Capped at X" message next to the field — don't silently clamp a new input without wiring up a matching `.clamp-note` element, that was a fixed bug.

### Bilingual system (EN/VI)

Every visible string is two sibling spans: `<span class="en">...</span><span class="vi">...</span>`. Visibility is controlled entirely by CSS, not per-component logic: a single consolidated rule block at the bottom of `style.css` sets `.en { display: block }` / `.vi { display: none }` by default, and `body.lang-vi-primary .en { display: none }` / `body.lang-vi-primary .vi { display: block }` when the toggle (`#langToggle`, top right) is active.

**Do not add a component-specific override like `.my-thing .en { display: block }`.** A rule with more type/class selectors than the global toggle rule can win on CSS specificity and silently break language switching for that one component (this happened once and was fixed by consolidating into the single base rule — see the comment above `.en { display: block }` in `style.css`). If a component needs its `.en`/`.vi` spans to render as separate stacked lines, that's already the default; don't redeclare `display`.

Numbers never need translation, only copy. Strings that get built dynamically in JS (Chart.js tooltips, the chart's `aria-label`) can't use the span pattern since they're not in the DOM ahead of time — instead they read `document.body.classList.contains('lang-vi-primary')` live via the `isViPrimary()` helper and the `CHART_STRINGS` lookup table near the top of `calculator.js`. Follow that pattern for any new JS-generated bilingual text.

### Design system docs

`PRODUCT.md` (audience, brand personality, anti-references) and `DESIGN.md` (color/type/spacing tokens, named rules) are the source of truth for visual decisions — maintained by the "impeccable" Claude Code skill. Before changing colors, typography, spacing, or motion, check these first. Key named rules actually enforced in the CSS:

- **Pastel-Taxonomy Rule**: five flat pastels color-code the five modules (declared per page as `--module-pastel` via a `<body class="module-…">` hook); flat fills only — never gradients, hovers, or text color.
- **Two-Accent-in-Data-UI Rule**: teal ("result/positive outcome") and blue ("interactive") keep their meanings but only inside data UI (chart, results, meters, links, focus rings). Rose stays reserved for caution.
- **Hairline-Not-Shadow Rule**: white cards on the white canvas separate via 1px `rgba(17,17,17,0.08)` borders, not shadows or tones.
- Shape language is exactly 8px (buttons/chips) / 12px (cards/inputs/capsule) / 9999px (badges); spacing follows a 4px grid (see DESIGN.md).

`.impeccable/` holds that skill's own tooling artifacts (critique snapshots, hook config) — not hand-maintained content.

### Page structure

Top bar (logo, nav capsule, language toggle) → centered hero → two-column calculator grid (inputs card + chart card, stacks to one column under 800px) → stats row (3 stat cards) → breakdown grid (year-by-year table + "what compounding buys you" comparison widget, also stacks under 800px) → disclaimer. An info modal (triggered from the inputs card) explains compound interest inline, per the product's "explain, don't impress" principle.

The nav's `Recommend`/`Jargon`/`Credit`/`Family Split` items are PRODUCT.md's roadmapped future modules, not dead code — they're intentionally `aria-disabled="true"` with a "soon" badge and a blocked click handler, not yet wired to real pages.

## Delegation policy

Implementation work like writing components, styling, and routine edits should be delegated to the `executor` subagent (defined in `.claude/agents/executor.md` at the session project root), while planning, architecture decisions, and reviewing the executor's output stay with the orchestrating session directly. Plan first and present the plan before any code is written; then hand the decided spec to the executor rather than implementing inline.
