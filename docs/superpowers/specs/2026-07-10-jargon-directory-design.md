# Jargon Directory Restyle — Design

**Date:** 2026-07-10
**Status:** Approved (user), pre-implementation
**Reference:** Amplemarket skills library (https://www.amplemarket.com/skills) — category
sections with initial badges and counts, live search count, search bar that docks under
the topbar on scroll.

## Goal

Restyle `jargon.html` from a collapsed search-first page into an always-visible,
category-sectioned directory in the spirit of Amplemarket's skills library, while
keeping every existing constraint: bilingual EN/VI parity is structural, DESIGN.md
tokens and named rules govern visuals, no build tooling, no copied content.

## Decisions (all confirmed with user)

1. **Full directory** — all 44 term cards visible on load, grouped into the 3 existing
   category sections. The one-way "Show all 44 terms" button and its reveal logic are
   deleted. The category structure replaces collapse as the de-intimidating device.
2. **Docked search** — the search bar is sticky: it starts in the hero flow, then pins
   below the frosted topbar capsule when scrolled past. Implemented as CSS
   `position: sticky` on the existing element (not a clone), so the suggestion
   dropdown, keyboard handling, and ARIA combobox wiring work unchanged in both
   positions.
3. **Live count, no filter button** — a status dot + count lives right-aligned inside
   the search capsule. No category-filter control (3 always-visible categories don't
   need one).
4. **Glyph-in-circle category badges** — each category header keeps its existing line
   glyph, presented inside a circular canary-pastel badge (the jargon module's pastel
   per the Pastel-Taxonomy Rule). No two-letter initials: initials would either break
   bilingual parity or change identity per language.

## Components

### Hero

Unchanged glyph, title, subtitle. One addition: a small uppercase eyebrow above the
title, matching the landing poster's eyebrow treatment:

- EN: `BILINGUAL GLOSSARY · 44 TERMS`
- VI: `TỪ ĐIỂN SONG NGỮ · 44 THUẬT NGỮ`

The term number in the eyebrow is filled live from the DOM (same counted-live principle
as the old button, so it can't drift as cards are added).

### Sticky search capsule

- Wrapper (`.jargon-search-wrap`) becomes `position: sticky`, `top` set just below the
  compact topbar capsule's height, z-index one layer beneath the topbar.
- A zero-height sentinel element sits immediately above the wrapper; an
  IntersectionObserver toggles `.is-docked` on the wrapper when the sentinel leaves the
  viewport top. `.is-docked` applies the frosted-white background + hairline recipe
  already used by the scrolled topbar. No scroll listeners.
- Inside the input's right edge: status dot + live count text.
  - At rest: `44 terms` / `44 thuật ngữ` — teal dot (the count is data UI, where teal
    means "result", mirroring the reference's green status dot).
  - Searching with matches: `12 matches` / `12 kết quả` — same teal dot.
  - Zero matches: `0 matches` / `0 kết quả` — dot turns rose (Two-Accent-in-Data-UI
    Rule: rose = caution).
  - Bilingual via the standard `.en`/`.vi` sibling-span pattern; numbers live in a
    dedicated inner span per language so JS updates them without touching copy.
  - Count region has `aria-live="polite"`.
- The suggestion dropdown is untouched and must work in both resting and docked
  positions.

### Category sections

Each `.jargon-group` gets an Amplemarket-style header row:

- 48px circular badge: flat canary pastel fill, existing line glyph inside, ink stroke.
- Existing bilingual `h2` title, unchanged copy.
- Count pill after the title: hairline border, 9999px radius, showing the group's
  visible-card count. Live during search (e.g. `3` while 3 of that group's cards
  match); full count at rest.
- Full-width hairline divider between sections (Hairline-Not-Shadow Rule).
- Groups with zero matches hide entirely (existing behavior kept).

### Cards & grid

Term cards and the grid are unchanged. Search filtering behavior is unchanged except
that the resting state is now "all visible" instead of "all hidden".

## JS changes (`js/jargon.js`)

- Delete `allShown`, the show-all click handler, and the reveal-wrap display logic.
  `render()`'s resting state becomes "card visible".
- `render()` additionally writes: the total count (search capsule + hero eyebrow
  number) and each group's count pill, and toggles the zero-match dot class.
- Add the sentinel IntersectionObserver for `.is-docked` (~8 lines).
- Rewrite the stale comment block at the top of the file (it documents the
  collapsed-by-default behavior).
- Verify with `node --check js/jargon.js`.

## HTML changes (`jargon.html`)

- Delete `#jargonRevealWrap` and the `#showAllTerms` button.
- Add hero eyebrow, search-capsule count span, sentinel div, group count pills.
- Group glyph markup moves inside the new badge circle (same SVGs).

## CSS changes (`css/style.css`)

- Sticky/docked search styles (~15 lines) reusing the frosted topbar recipe.
- Category header row: badge circle, count pill, section divider.
- Remove now-dead reveal-wrap styles.
- Check brace balance after editing.

## Docs

- `DESIGN.md`: add the **Directory Header** pattern (circular pastel badge + title +
  hairline count pill) to the named rules/patterns; add a Provenance note that
  collapsed-by-default jargon (shipped in `44278d8`) was retired 2026-07-10 in favor
  of category structure.

## Out of scope

- No changes to term content, card layout, other pages, or the topbar.
- No category filter UI.
- No re-grouping of the 44 terms.

## Error handling / edge cases

- Empty search → all cards visible, counts at full, empty-state note hidden.
- Zero-match search → existing `#jargonEmpty` note plus rose dot + `0 matches`.
- `prefers-reduced-motion` continues to be respected for scroll-into-view; the docked
  transition uses the same composited-only properties rule as the rest of the site
  (background/border may swap instantly or via opacity; no layout animation).
- No-JS: cards are visible by default in HTML (no `is-hidden` at rest), so the page
  degrades to a fully readable directory; counts are prefilled with static `44` in
  HTML and simply don't go live.

## Verification

1. Load `http://localhost:3000/website/jargon.html`: all 44 cards visible, grouped,
   eyebrow shows 44, capsule shows "44 terms".
2. Type "lai suat": matching cards only, capsule count drops, group pills update,
   empty groups disappear.
3. Type gibberish: rose dot, "0 matches", empty-state note.
4. Scroll mid-page: search capsule docks below topbar, frosted; focus it and the
   dropdown opens correctly while docked.
5. Toggle EN↔VI: eyebrow, counts, and all new strings flip.
6. `node --check js/jargon.js`; CSS brace balance.
