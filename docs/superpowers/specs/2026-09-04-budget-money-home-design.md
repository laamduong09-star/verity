# Budget — "Money that goes home"

Date: 2026-09-04
Status: approved (design), ready for implementation

## Why

PRD §2 names "accounts for family financial contribution as a real input, not
an edge case" as a project goal. On `budget.html` today that contribution is
one item in a list of Needs examples ("Food you owe family") and a preset chip
label ("Living at home"). It is an edge case.

Budget is also the thinnest module page (351 lines) and the only one running
the shared Calculator template rather than its own visual system, which the
per-page-identity rule exists to prevent.

Budget is not in the PRD. §6.1–6.6 cover Calculator, Recommendation, Jargon,
Credit, Tuition, Disclaimer; the §5.0 site map lists five tools plus home. A
PRD §6.7 is owed but is not part of this work.

## Decisions (locked)

1. **Subject** — money that goes to the household. Not paycheck mechanics, not
   the needs/wants line, not banking logistics.
2. **Mechanism** — a fixed dollar amount taken off the top, not a fourth
   percentage. "$150 to my mom" does not shrink when shifts get cut, and the
   asymmetry that creates is the section's whole content.
3. **Voice — neutral instrument.** The page shows the arithmetic and takes no
   position on whether the contribution should happen or how large it should
   be. It states what the numbers do; it never advises. "Income fell 40%,
   savings fell 57%" is a fact and stays. "Keep savings above zero" is advice
   and does not appear.
4. **Instrument** — vertical stacked columns as small multiples at three
   income levels. Vertical reads as a paycheck and stays clear of Tuition's
   horizontal ruler and Credit's score rail.

## The scale invariant

Every `.bd-stack` is drawn to one scale: $700 is full height. A column's
height *is* its income as a fraction of that maximum.

```css
.bd-stack {
  flex: none;
  height: calc(var(--bd-scale) * var(--income) / var(--bd-max));
}
```

`--bd-scale: 300px`, `--bd-max: 700`, `--income` set per column in the markup.

`flex: none` is load-bearing. Without it the stack is a flex item with default
`flex-shrink: 1`, and the tallest column gets squeezed by exactly the height of
its own label — drawn 11% short, at 2.63 $/px against its neighbours' 2.33.
This is invisible by eye and makes every comparison on the page false. It was
caught by measurement during the design pass, not by looking.

Verify in the browser, at every viewport:

```js
[...new Set([...document.querySelectorAll('.bd-stack')].map((s, i) =>
  Math.round([700, 500, 300][i] / s.getBoundingClientRect().height * 100) / 100))]
```

Must return exactly one entry. The three `.bd-seg.is-home` blocks must
likewise all report the same height.

Segment heights are percentages of their own stack, not of the scale:

| | $700 | $500 | $300 |
|---|---|---|---|
| Savings | 15.71% ($110) | 14% ($70) | 10% ($30) |
| Wants | 23.57% ($165) | 21% ($105) | 15% ($45) |
| Needs | 39.29% ($275) | 35% ($175) | 25% ($75) |
| Goes home | 21.43% ($150) | 30% ($150) | 50% ($150) |

These are facts, not state — hardcoded in markup, the same discipline as
Tuition's `--w` values. Recompute against $700 if a figure changes.

## Color

Three of the four are inherited, not chosen: DESIGN.md locks needs / wants /
savings across the doughnut and the bucket-card icons, and the columns must
speak the same language as the tool six inches above them.

- `--bd-needs: #2348ad` (blue)
- `--bd-wants: #9d3f5f` (rose-muted)
- `--bd-savings: #0e7a72` (teal-bright — the value the doughnut and
  `.legend-dot.dot-savings` already use, *not* `--teal` #0b5a55)
- `--bd-home: #111111` (ink), with `box-shadow: 0 -3px 0 0 var(--paper)`
  separating it from the three buckets above it

Home is ink because it is the only segment that is not a bucket — it is a
subtraction that happens before the split exists, and ink is the one value in
the palette that reads as "not a category." `--pastel-budget` stays taxonomy
only (hero wash, nav, landing card); it is never a data fill, per the
precedent Tuition set.

## Motion

Seen once or twice per visit, purpose explanatory, so it gets one orchestrated
reveal.

- Stacks wipe upward: `clip-path: inset(100% 0 0 0)` to `inset(0 0 0 0)`
- 520ms, `--bd-ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
- Stagger 60ms, left to right
- **The home blocks never animate.** The fixed part was never in question.
- `clip-path` rather than `scaleY` so labels and edges do not distort
- Markup carries true heights; `js/budget.js` adds `.is-armed` only when
  motion is allowed. Correct with JS off and under `prefers-reduced-motion`.

Nothing animates on input. The new field retargets on every keystroke, and
nothing may move in layout while typing.

## Tool change

### `js/budget-math.js`

`splitPaycheck` is unchanged so all six existing tests keep passing. Add:

```js
function splitAfterHome(amount, home, pctNeeds, pctWants, pctSavings) {
  const safeAmount = Math.max(0, amount);
  const sentHome = Math.min(Math.max(0, home), safeAmount);
  const remainder = safeAmount - sentHome;
  const split = splitPaycheck(remainder, pctNeeds, pctWants, pctSavings);
  return {
    ...split,
    home: sentHome,
    remainder,
    homeShare: safeAmount > 0 ? sentHome / safeAmount : 0,
    covered: sentHome === Math.max(0, home),
  };
}
```

Export it alongside the existing two.

`covered` exists for the honest edge case: asking to send $600 out of a $500
paycheck caps at $500 and says so, rather than showing negative buckets.

### `tests/budget-math.test.js` — six new tests (42 to 48 suite-wide)

1. $500 with $150 home splits the remaining $350 into 175/105/70
2. home larger than the paycheck caps at the paycheck; buckets zero;
   `covered === false`
3. negative home is treated as zero
4. `home: 0` returns the same buckets as `splitPaycheck` on the full amount
5. `home + remainder === amount` for a non-round case
6. `homeShare` rises as income falls with home fixed (0.3 at $500, 0.5 at $300)

### `budget.html` — new input

A `$` field in the inputs card, directly under "Money you get":

- `id="home"`, `value="0"`, `min="0"`, `max="1000000"`, `step="10"`
- label: "Money that goes home" / "Tiền gửi về nhà"
- `.clamp-note` with `id="homeClampNote"`, following the existing pattern
  exactly (`clampToInput` wires it)

At `home: 0` the page behaves exactly as it does today. The feature is
invisible until someone has a reason to use it.

### `js/budget.js`

- `update()` calls `splitAfterHome`; the three bucket cards and their
  percentages continue to read from the returned split (which is now computed
  on the remainder).
- Doughnut gains a fourth arc **only when `home > 0`**. Keep
  `BUCKET_KEYS = ['needs','wants','savings']` for the cards; add a separate
  chart key list and a `home` entry in `CHART_STRINGS`
  ("Goes home" / "Gửi về nhà"). Arc order: home, needs, wants, savings.
  `SEGMENT_COLORS` gains `#111111` in the home position.
- The doughnut centre total keeps showing the full paycheck.
- Update the canvas `aria-label` to include the home figure when non-zero.
- The savings cross-link keeps using the savings figure, which is now
  post-deduction. That is correct — it is what would actually be saved.

### The off-the-top line

A hairline-separated line of type between the calculator and the stats row,
`id="bdOffTop"`. **Permanently in the layout at both states**, so entering a
home amount for the first time shifts nothing. Text is JS-generated (the
numbers change), so it follows the `isViPrimary()` + strings-table pattern
CLAUDE.md documents, not `.en`/`.vi` spans.

- `home > 0`: "$150 goes home first. The three buckets below divide the
  remaining $350." / "$150 được gửi về nhà trước. Ba nhóm bên dưới chia $350
  còn lại."
- `home === 0`: "Nothing goes out first. The three buckets below divide the
  whole $500." / "Không có khoản nào đi ra trước. Ba nhóm bên dưới chia trọn
  $500."
- `covered === false`: "You entered more than this paycheck. Capped at $500,
  which leaves nothing to split." / "Bạn đã nhập nhiều hơn kỳ lương này. Đã
  giới hạn ở $500, nên không còn gì để chia."

No fourth stat card. Home is not part of the split; the card grid stays at
three.

## New section — copy

Placed after `.savings-cta`, inside `.page`. All strings are `.en`/`.vi`
sibling spans.

**Eyebrow:** When the amount is fixed / Khi số tiền là cố định

**Heading:** The split assumes the whole paycheck is available to divide. /
Cách chia này giả định cả kỳ lương đều có thể đem ra chia.

**Lede:** 50/30/20 divides all of your after-tax income. When a fixed amount
goes elsewhere first, the three buckets divide what is left — and the amount
that goes first does not change when your hours do. /
50/30/20 chia toàn bộ thu nhập sau thuế của bạn. Khi một khoản cố định đi ra
trước, ba nhóm chỉ chia phần còn lại — và khoản đi trước đó không đổi khi số
giờ làm của bạn thay đổi.

**Figure caption:** Three paychecks, the same $150 going home, split 50/30/20
on the remainder. From $500 to $300 the paycheck falls 40% and savings falls
57%, because the fixed amount holds its size while everything above it divides
less. Home goes from 30% of the paycheck to 50% without anyone changing it. /
Ba kỳ lương, cùng $150 gửi về nhà, phần còn lại chia 50/30/20. Từ $500 xuống
$300, kỳ lương giảm 40% còn tiết kiệm giảm 57%, vì khoản cố định giữ nguyên
kích thước trong khi mọi phần bên trên chia ít đi. Phần gửi về nhà đi từ 30%
lên 50% của kỳ lương mà không ai thay đổi nó.

**Row names:** Savings / Tiết kiệm · Wants / Mong muốn · Needs / Nhu cầu ·
Goes home / Gửi về nhà

**Closing beat:** If the amount going home is large enough, the remainder will
not cover needs at the share you picked. The tool still divides what is left,
so the needs figure it shows is what the split produces, not what your needs
cost. Entering more than the paycheck caps the amount at what you were paid. /
Nếu khoản gửi về nhà đủ lớn, phần còn lại sẽ không đủ cho nhu cầu ở tỷ lệ bạn
chọn. Công cụ vẫn chia phần còn lại, nên con số nhu cầu hiển thị là kết quả
của cách chia, không phải chi phí thực tế cho nhu cầu của bạn. Nhập nhiều hơn
kỳ lương thì số tiền sẽ bị giới hạn ở mức bạn được trả.

**Source note** (`.bd-dated`, 12.5px slate): The 50/30/20 rule comes from
Elizabeth Warren and Amelia Warren Tyagi's *All Your Worth* (2005), where it
divides a household's own after-tax income. /
Quy tắc 50/30/20 xuất phát từ cuốn *All Your Worth* (2005) của Elizabeth
Warren và Amelia Warren Tyagi, nơi nó chia thu nhập sau thuế của chính hộ gia
đình.

## Files

- `css/budget.css` — new, `bd-` prefix (verified free: zero hits in
  `style.css`), loaded after `style.css` in `budget.html`
- `budget.html` — new input, off-the-top line, new section
- `js/budget-math.js` — `splitAfterHome`
- `js/budget.js` — wiring, fourth arc, off-the-top line
- `tests/budget-math.test.js` — six new tests
- `DESIGN.md` — a "Budget columns" component section recording the scale
  invariant and the `flex: none` trap
- `CLAUDE.md` — the invariant check snippet, beside Tuition's

## Verification

- `node --test` over the five test files, listed explicitly, from `website/`:
  **48 pass, 0 fail**. Check the count; `node --test` silently passes missing
  paths.
- Brace balance in `css/budget.css`.
- `.en` / `.vi` parity in `budget.html` must match exactly (36 each before this
  work).
- Scale invariant and equal home-block heights at 1440px and 390px.
- Typing in the home field causes 0px layout shift: measure the offset of the
  stats row before, during and after input.
- Line endings: `budget.html`, `js/*.js`, `css/budget.css`, `CLAUDE.md` are LF;
  `css/style.css` and `DESIGN.md` are CRLF. Preserve per file.

## Out of scope

- PRD §6.7 for Budget
- Any advisory framing (ruled out by decision 3)
- Driving the small multiples from live input — static and hardcoded, per
  Tuition's precedent
