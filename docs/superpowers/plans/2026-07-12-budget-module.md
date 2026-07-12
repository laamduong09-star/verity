# Budget Module (50/30/20 Paycheck Splitter) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new `budget.html` module page where a teen enters what they get paid, sees it split into Needs / Wants / Savings (preset ratios or custom percentages), visualized as a doughnut chart, with a cross-link that prefills the compound-interest calculator with the monthly savings amount.

**Architecture:** Static HTML page + one pure-math JS file (`js/budget-math.js`, unit-tested with node's built-in test runner) + one DOM-wiring JS file (`js/budget.js`) following `js/calculator.js`'s single-`update()` render-loop pattern. All styling appended to the shared `css/style.css`, reusing the calculator's `.calculator` grid, `.card`, `.field`, `.stats-row` classes. No persistence, no framework.

**Tech Stack:** Vanilla HTML/CSS/JS, Chart.js 4 via existing CDN tag, `node --test` for the math unit tests (zero new dependencies).

**Spec:** `docs/superpowers/specs/2026-07-12-budget-tool-design.md`. Three deviations from the spec, all discovered against the real code:
1. **No calculator.js change needed** — `js/calculator.js:314-321` already reads `monthly` from query string AND hash and prefills through `clampToInput`. The cross-link uses the hash form (`#monthly=X`) per the comment there (clean-URL servers drop query strings on redirect).
2. **Sixth pastel is peach `#ffddb5`, not lavender** — the spec's "lavender family" collides with Recommend's soft violet `#e2ddfd`.
3. **Pay period is a chip group, not a `<select>`** — `<option>` elements can't hold the `.en`/`.vi` sibling spans, so a select would break the bilingual system; three toggle chips use the standard span pattern.

## Global Constraints

- Every visible string is `<span class="en">…</span><span class="vi">…</span>` siblings. NEVER add a component-specific `.en`/`.vi` display override (breaks the global language toggle via specificity — documented bug class).
- JS-generated strings read `document.body.classList.contains('lang-vi-primary')` live (the `isViPrimary()` + `CHART_STRINGS` pattern from `js/calculator.js:76-82`).
- Radii: 8px (buttons/chips), 12px (cards/inputs), 9999px (badges) — nothing else. Spacing on a 4px grid.
- Pastels are flat fills only — never gradients, hovers, or text color.
- Teal `#0b5a55`/`#0e7a72` = result/positive, blue `#2348ad` = interactive, rose = caution, all confined to data UI. Never `#000` (ink is `#111111`).
- No shadows on cards/inputs at rest — 1px `rgba(17,17,17,0.08)` hairline is the separation.
- Stateless: no localStorage, no accounts.
- After editing any JS: `node --check js/<file>.js`. After editing style.css: brace-balance check.
- Commit after every task (repo: `C:\Users\user\Claude Code\Session\website`, branch `master`).

---

### Task 1: Pure split math with unit tests

**Files:**
- Create: `js/budget-math.js`
- Create: `tests/budget-math.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: global functions `splitPaycheck(amount, pctNeeds, pctWants, pctSavings)` → `{ needs, wants, savings, enteredSum, normalized }` (dollar numbers, un-rounded) and `toMonthly(amount, period)` → integer dollars, `period ∈ 'week' | 'biweek' | 'month'`. Task 3's `budget.js` calls both as globals (plain script tags, no modules).

- [ ] **Step 1: Write the failing tests**

Create `tests/budget-math.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { splitPaycheck, toMonthly } = require('../js/budget-math.js');

test('50/30/20 splits $200 into 100/60/40, not normalized', () => {
  const r = splitPaycheck(200, 50, 30, 20);
  assert.equal(r.needs, 100);
  assert.equal(r.wants, 60);
  assert.equal(r.savings, 40);
  assert.equal(r.enteredSum, 100);
  assert.equal(r.normalized, false);
});

test('percentages not summing to 100 normalize to their own sum', () => {
  const r = splitPaycheck(100, 40, 40, 40); // sum 120 -> thirds
  assert.ok(Math.abs(r.needs - 100 / 3) < 1e-9);
  assert.ok(Math.abs(r.wants - 100 / 3) < 1e-9);
  assert.ok(Math.abs(r.savings - 100 / 3) < 1e-9);
  assert.equal(r.enteredSum, 120);
  assert.equal(r.normalized, true);
});

test('buckets always account for the full amount', () => {
  const r = splitPaycheck(837, 55, 25, 20);
  assert.ok(Math.abs(r.needs + r.wants + r.savings - 837) < 1e-9);
});

test('all-zero percentages return all-zero buckets, flagged normalized', () => {
  const r = splitPaycheck(500, 0, 0, 0);
  assert.deepEqual(
    { needs: r.needs, wants: r.wants, savings: r.savings },
    { needs: 0, wants: 0, savings: 0 }
  );
  assert.equal(r.normalized, true);
});

test('negative amount is treated as zero', () => {
  const r = splitPaycheck(-50, 50, 30, 20);
  assert.equal(r.needs, 0);
  assert.equal(r.savings, 0);
});

test('toMonthly converts each pay period and rounds to whole dollars', () => {
  assert.equal(toMonthly(100, 'week'), 433);
  assert.equal(toMonthly(100, 'biweek'), 217);
  assert.equal(toMonthly(100, 'month'), 100);
  assert.equal(toMonthly(40.4, 'month'), 40);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/` (from the `website` directory)
Expected: FAIL — `Cannot find module '../js/budget-math.js'`

- [ ] **Step 3: Write the implementation**

Create `js/budget-math.js`:

```js
// Pure math for the budget splitter — no DOM access. Loaded as a plain
// script in the browser (the functions become globals used by js/budget.js)
// and required directly by the node:test suite, hence the exports guard.

// Split an amount across three percentages. The percentages are normalized
// to their own sum so the buckets always account for exactly the full
// amount, even while a custom split is mid-edit and doesn't add to 100.
// An all-zero sum returns all-zero buckets rather than dividing by zero.
function splitPaycheck(amount, pctNeeds, pctWants, pctSavings) {
  const sum = pctNeeds + pctWants + pctSavings;
  const safeAmount = Math.max(0, amount);
  if (sum <= 0) {
    return { needs: 0, wants: 0, savings: 0, enteredSum: sum, normalized: sum !== 100 };
  }
  return {
    needs: safeAmount * (pctNeeds / sum),
    wants: safeAmount * (pctWants / sum),
    savings: safeAmount * (pctSavings / sum),
    enteredSum: sum,
    normalized: sum !== 100,
  };
}

// Convert a per-period amount to the monthly figure the calculator
// cross-link needs. 4.33 = 52 weeks / 12 months; 2.17 = 26 paychecks / 12.
const PERIOD_TO_MONTHLY = { week: 4.33, biweek: 2.17, month: 1 };

function toMonthly(amount, period) {
  return Math.round(amount * (PERIOD_TO_MONTHLY[period] || 1));
}

if (typeof module !== 'undefined') {
  module.exports = { splitPaycheck, toMonthly };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/`
Expected: 6 passing, 0 failing. Also run `node --check js/budget-math.js` — clean.

- [ ] **Step 5: Commit**

```bash
git add js/budget-math.js tests/budget-math.test.js
git commit -m "Add pure split math for the budget module, with node:test coverage"
```

---

### Task 2: budget.html page + all new CSS

**Files:**
- Create: `budget.html`
- Modify: `css/style.css` (`:root` token block ~line 34-45; module-pastel map ~line 2965-2969; new section appended at end of file)

**Interfaces:**
- Consumes: existing classes `.topbar`, `.page-hero`, `.content-shell`, `.calculator`, `.inputs-card`, `.graph-card`, `.chart-wrap`, `.field`, `.input-wrap`, `.clamp-note`, `.stats-row`, `.stat-card`, `.icon-tile`, `.site-footer` — all already in `css/style.css`.
- Produces: the complete static page with every element ID Task 3 and Task 4 read: `amount`, `amountClampNote`, `periodChips`, `presetChips`, `customSplit`, `pctNeeds`/`pctWants`/`pctSavings` (+ `…ClampNote` each), `splitNote`, `budgetChart`, `donutTotal`, `amtNeeds`/`amtWants`/`amtSavings`, `pctLabelNeeds`/`pctLabelWants`/`pctLabelSavings`, `savingsLink`. New CSS classes `.chip-group`, `.seg-chip`, `.custom-split`, `.donut-wrap`, `.donut-center`, `.donut-total`, `.donut-legend`, `.legend-item`, `.legend-dot`, `.bucket-pct`, `.bucket-list`, `.savings-link`, `.module-budget`.

- [ ] **Step 1: Add the pastel token and module mapping to css/style.css**

In the `:root` block, directly after `--pastel-family: #99fff9;` (line ~38), add:

```css
  --pastel-budget: #ffddb5;
```

Next to the other module mappings (after `.module-fam { --module-pastel: var(--pastel-family); }`, line ~2969), add:

```css
.module-budget { --module-pastel: var(--pastel-budget); }
```

- [ ] **Step 2: Append the budget component styles to the end of css/style.css**

```css
/* ---------- Budget module ---------- */

/* Chip groups: pay-period toggle and preset ratios. White + hairline like
   btn-ghost; active chip flips to ink fill per the button-chip-active spec. */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.seg-chip {
  appearance: none;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 13px;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.seg-chip:hover { background: var(--pearl); }

.seg-chip.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}

.seg-chip:focus-visible {
  outline: 2px solid var(--blue-focus);
  outline-offset: 2px;
}

/* Custom percentage fields, revealed only while the Custom preset is active.
   The explicit [hidden] rule is required: display:grid on the class would
   otherwise beat the UA's [hidden]{display:none}. */
.custom-split {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.custom-split[hidden] { display: none; }
.custom-split .field { margin-bottom: 0; }

/* Doughnut center total + static legend (Chart.js's own legend can't hold
   the .en/.vi span pair, so the legend is plain markup). */
.donut-wrap { position: relative; }

.donut-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.donut-total {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.donut-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 14px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 9999px;
}

/* Same data-UI colors as the doughnut segments in js/budget.js
   (SEGMENT_COLORS): needs = interactive blue, wants = neutral stone,
   savings = positive teal. Keep the two in sync. */
.legend-dot.dot-needs { background: #2348ad; }
.legend-dot.dot-wants { background: #b1b1af; }
.legend-dot.dot-savings { background: #0e7a72; }

/* Bucket cards (reuse .stats-row / .stat-card / .icon-tile) */
.bucket-pct {
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
  margin-top: -8px;
}

.bucket-list {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13.5px;
  color: var(--slate);
}

.savings-link {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--blue);
  text-decoration: none;
}

.savings-link:hover { text-decoration: underline; }
```

- [ ] **Step 3: Create budget.html**

Copy these blocks **verbatim from `actual website.html`**, they are shared chrome:
- The full `<head>` (lines 3-12), changing only `<title>` to `Verity: Budget`.
- `<div class="bg-aurora">`, the two cursor divs (lines 14-17).
- The full `<header class="topbar">` block (lines 19-42) — then in its `nav-capsule`, remove `active` from the Calculator link and insert after it: `<a href="budget.html" class="nav-link active">Budget</a>`.
- The full `<footer class="site-footer">` block (lines 289-307) — then in its `footer-links`, insert after the Calculator link: `<a href="budget.html">Budget</a>`.

Body opens with `<body class="module-budget">`. Between topbar and footer, the page content:

```html
<main>
  <div class="page">
  <section class="page-hero" id="heroSection">
    <div class="page-hero-glyph" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M12 3.5V12"/>
        <path d="M12 12l6 6"/>
        <path d="M12 12l-8 2.5"/>
      </svg>
    </div>
    <h1 class="hero-title">
      <span class="en">Every dollar gets a job.</span>
      <span class="vi">Mỗi đồng tiền đều có nhiệm vụ.</span>
    </h1>
    <p class="page-hero-sub">
      <span class="en">Enter what you get paid and see it split into needs, wants, and savings — before it disappears on its own.</span>
      <span class="vi">Nhập số tiền bạn nhận được và xem nó được chia thành nhu cầu, mong muốn và tiết kiệm — trước khi nó tự biến mất.</span>
    </p>
  </section>
  </div>

  <div class="content-shell">
  <div class="page">

  <section class="calculator">
    <div class="card inputs-card">
      <div class="inputs-card-header">
        <h2 class="card-title">
          <span class="en">Your paycheck</span>
          <span class="vi">Kỳ lương của bạn</span>
        </h2>
      </div>

      <div class="field">
        <label class="field-label" for="amount">
          <span class="en">Money you get</span>
          <span class="vi">Số tiền bạn nhận được</span>
        </label>
        <div class="input-wrap">
          <span class="prefix">$</span>
          <input type="number" id="amount" value="500" min="0" max="1000000" step="10">
        </div>
        <p class="clamp-note" id="amountClampNote">
          <span class="en">Capped at <span class="clamp-note-value"></span></span>
          <span class="vi">Đã giới hạn ở <span class="clamp-note-value"></span></span>
        </p>
      </div>

      <div class="field">
        <span class="field-label" id="periodLabel">
          <span class="en">How often</span>
          <span class="vi">Bao lâu một lần</span>
        </span>
        <div class="chip-group" id="periodChips" role="group" aria-labelledby="periodLabel">
          <button type="button" class="seg-chip" data-period="week">
            <span class="en">Per week</span>
            <span class="vi">Mỗi tuần</span>
          </button>
          <button type="button" class="seg-chip" data-period="biweek">
            <span class="en">Every two weeks</span>
            <span class="vi">Hai tuần một lần</span>
          </button>
          <button type="button" class="seg-chip active" data-period="month">
            <span class="en">Per month</span>
            <span class="vi">Mỗi tháng</span>
          </button>
        </div>
      </div>

      <div class="field">
        <span class="field-label" id="presetLabel">
          <span class="en">How to split it</span>
          <span class="vi">Cách chia</span>
        </span>
        <div class="chip-group" id="presetChips" role="group" aria-labelledby="presetLabel">
          <button type="button" class="seg-chip active" data-preset="classic">
            <span class="en">50/30/20 · Classic</span>
            <span class="vi">50/30/20 · Cổ điển</span>
          </button>
          <button type="button" class="seg-chip" data-preset="home">
            <span class="en">20/30/50 · Living at home</span>
            <span class="vi">20/30/50 · Sống cùng gia đình</span>
          </button>
          <button type="button" class="seg-chip" data-preset="custom">
            <span class="en">Custom</span>
            <span class="vi">Tùy chỉnh</span>
          </button>
        </div>
      </div>

      <div class="custom-split" id="customSplit" hidden>
        <div class="field">
          <label class="field-label" for="pctNeeds">
            <span class="en">Needs</span>
            <span class="vi">Nhu cầu</span>
          </label>
          <div class="input-wrap">
            <input type="number" id="pctNeeds" value="50" min="0" max="100" step="5">
            <span class="suffix">%</span>
          </div>
          <p class="clamp-note" id="pctNeedsClampNote">
            <span class="en">Capped at <span class="clamp-note-value"></span>%</span>
            <span class="vi">Đã giới hạn ở <span class="clamp-note-value"></span>%</span>
          </p>
        </div>
        <div class="field">
          <label class="field-label" for="pctWants">
            <span class="en">Wants</span>
            <span class="vi">Mong muốn</span>
          </label>
          <div class="input-wrap">
            <input type="number" id="pctWants" value="30" min="0" max="100" step="5">
            <span class="suffix">%</span>
          </div>
          <p class="clamp-note" id="pctWantsClampNote">
            <span class="en">Capped at <span class="clamp-note-value"></span>%</span>
            <span class="vi">Đã giới hạn ở <span class="clamp-note-value"></span>%</span>
          </p>
        </div>
        <div class="field">
          <label class="field-label" for="pctSavings">
            <span class="en">Savings</span>
            <span class="vi">Tiết kiệm</span>
          </label>
          <div class="input-wrap">
            <input type="number" id="pctSavings" value="20" min="0" max="100" step="5">
            <span class="suffix">%</span>
          </div>
          <p class="clamp-note" id="pctSavingsClampNote">
            <span class="en">Capped at <span class="clamp-note-value"></span>%</span>
            <span class="vi">Đã giới hạn ở <span class="clamp-note-value"></span>%</span>
          </p>
        </div>
      </div>

      <p class="clamp-note" id="splitNote">
        <span class="en">Adds up to <span class="split-sum-value"></span>% — adjusted to fit.</span>
        <span class="vi">Tổng là <span class="split-sum-value"></span>% — đã điều chỉnh cho đủ 100%.</span>
      </p>
    </div>

    <div class="card graph-card">
      <div class="graph-card-header">
        <h2 class="card-title">
          <span class="en">Where it goes</span>
          <span class="vi">Tiền đi về đâu</span>
        </h2>
      </div>
      <div class="chart-wrap donut-wrap">
        <canvas id="budgetChart" role="img" aria-label="Doughnut chart splitting your pay into needs, wants, and savings."></canvas>
        <div class="donut-center" aria-hidden="true">
          <span class="donut-total" id="donutTotal">$0</span>
        </div>
      </div>
      <div class="donut-legend" aria-hidden="true">
        <span class="legend-item">
          <span class="legend-dot dot-needs"></span>
          <span class="en">Needs</span>
          <span class="vi">Nhu cầu</span>
        </span>
        <span class="legend-item">
          <span class="legend-dot dot-wants"></span>
          <span class="en">Wants</span>
          <span class="vi">Mong muốn</span>
        </span>
        <span class="legend-item">
          <span class="legend-dot dot-savings"></span>
          <span class="en">Savings</span>
          <span class="vi">Tiết kiệm</span>
        </span>
      </div>
    </div>
  </section>

  <section class="stats-row">
    <div class="card stat-card tint-blue">
      <span class="icon-tile tile-blue" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11l9-7 9 7"/>
          <path d="M5 10v9h14v-9"/>
        </svg>
      </span>
      <span class="field-label">
        <span class="en">Needs</span>
        <span class="vi">Nhu cầu</span>
      </span>
      <span class="stat-value" id="amtNeeds">$0</span>
      <span class="bucket-pct" id="pctLabelNeeds">50%</span>
      <ul class="bucket-list">
        <li><span class="en">Phone bill</span><span class="vi">Tiền điện thoại</span></li>
        <li><span class="en">Bus pass</span><span class="vi">Vé xe buýt</span></li>
        <li><span class="en">Food you owe family</span><span class="vi">Tiền ăn phụ gia đình</span></li>
        <li><span class="en">School supplies</span><span class="vi">Dụng cụ học tập</span></li>
      </ul>
    </div>

    <div class="card stat-card">
      <span class="icon-tile tile-blue" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="9" width="16" height="11" rx="1.5"/>
          <path d="M4 12h16"/>
          <path d="M12 9v11"/>
          <path d="M8.5 9a2.2 2.2 0 1 1 3.5-2.6A2.2 2.2 0 1 1 15.5 9"/>
        </svg>
      </span>
      <span class="field-label">
        <span class="en">Wants</span>
        <span class="vi">Mong muốn</span>
      </span>
      <span class="stat-value" id="amtWants">$0</span>
      <span class="bucket-pct" id="pctLabelWants">30%</span>
      <ul class="bucket-list">
        <li><span class="en">Eating out</span><span class="vi">Ăn ngoài</span></li>
        <li><span class="en">Games</span><span class="vi">Trò chơi</span></li>
        <li><span class="en">Clothes</span><span class="vi">Quần áo</span></li>
        <li><span class="en">Streaming</span><span class="vi">Dịch vụ xem phim, nhạc</span></li>
      </ul>
    </div>

    <div class="card stat-card tint-teal">
      <span class="icon-tile tile-teal" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 17l6-6 4 4 6-7"/>
          <path d="M20 12V8h-4"/>
        </svg>
      </span>
      <span class="field-label">
        <span class="en">Savings</span>
        <span class="vi">Tiết kiệm</span>
      </span>
      <span class="stat-value accent" id="amtSavings">$0</span>
      <span class="bucket-pct" id="pctLabelSavings">20%</span>
      <ul class="bucket-list">
        <li><span class="en">Emergency cushion</span><span class="vi">Quỹ dự phòng</span></li>
        <li><span class="en">Future goals — laptop, car, college</span><span class="vi">Mục tiêu tương lai — laptop, xe, đại học</span></li>
      </ul>
      <a class="savings-link" id="savingsLink" href="actual%20website.html#monthly=0">
        <span class="en">See what saving <span class="savings-monthly-value">$0</span>/month grows into →</span>
        <span class="vi">Xem <span class="savings-monthly-value">$0</span>/tháng tiết kiệm sẽ tăng trưởng thành bao nhiêu →</span>
      </a>
    </div>
  </section>

  <p class="disclaimer">
    <span class="en">Educational tool only. Not licensed financial advice.</span>
    <span class="vi">Chỉ là công cụ giáo dục. Không phải lời khuyên tài chính được cấp phép.</span>
  </p>

  </div>
  </div>
</main>
```

Scripts before `</body>` (budget-math before budget so the globals exist):

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script src="js/site.js"></script>
<script src="js/budget-math.js"></script>
<script src="js/budget.js"></script>
</body>
</html>
```

(`js/budget.js` doesn't exist yet — the static page must still render; a 404 script tag is harmless for one task.)

- [ ] **Step 4: Verify statically**

- CSS brace balance: `node -e "const s=require('fs').readFileSync('css/style.css','utf8');console.log((s.match(/{/g)||[]).length,(s.match(/}/g)||[]).length)"` — two equal numbers.
- Open `http://localhost:3000/website/budget.html` in the preview browser: aurora at top, cream body (`getComputedStyle(document.body).backgroundColor` → `rgb(246, 245, 243)`), peach hero glyph, inputs card + chart card side by side, three bucket cards, charcoal footer. Language toggle flips every string (static check — no JS on this page yet beyond site.js).

- [ ] **Step 5: Commit**

```bash
git add budget.html css/style.css
git commit -m "Add budget page markup and budget-module styles (peach pastel, chips, donut, buckets)"
```

---

### Task 3: budget.js — inputs, presets, buckets, note, cross-link

**Files:**
- Create: `js/budget.js`

**Interfaces:**
- Consumes: globals `splitPaycheck`, `toMonthly` from `js/budget-math.js`; all element IDs from Task 2; `verity:langchange` event dispatched by `js/site.js`.
- Produces: working page minus the chart. `update()` is the single render entry point; Task 4 appends a `renderChart(amount, split)` call at its end.

- [ ] **Step 1: Write js/budget.js**

```js
// Budget splitter page logic. The pure math (splitPaycheck, toMonthly)
// lives in js/budget-math.js, loaded just before this file, so node's test
// runner can exercise it without a DOM.

const amountInput = document.getElementById('amount');
const amountClampNoteEl = document.getElementById('amountClampNote');
const periodChips = Array.from(document.querySelectorAll('#periodChips .seg-chip'));
const presetChips = Array.from(document.querySelectorAll('#presetChips .seg-chip'));
const customSplitEl = document.getElementById('customSplit');
const splitNoteEl = document.getElementById('splitNote');
const savingsLinkEl = document.getElementById('savingsLink');
const pctInputs = {
  needs: document.getElementById('pctNeeds'),
  wants: document.getElementById('pctWants'),
  savings: document.getElementById('pctSavings'),
};
const pctClampNotes = {
  needs: document.getElementById('pctNeedsClampNote'),
  wants: document.getElementById('pctWantsClampNote'),
  savings: document.getElementById('pctSavingsClampNote'),
};
const bucketAmountEls = {
  needs: document.getElementById('amtNeeds'),
  wants: document.getElementById('amtWants'),
  savings: document.getElementById('amtSavings'),
};
const bucketPctEls = {
  needs: document.getElementById('pctLabelNeeds'),
  wants: document.getElementById('pctLabelWants'),
  savings: document.getElementById('pctLabelSavings'),
};

const BUCKET_KEYS = ['needs', 'wants', 'savings'];

// Ratios are % of the paycheck in needs / wants / savings order.
const PRESETS = {
  classic: { needs: 50, wants: 30, savings: 20 },
  home: { needs: 20, wants: 30, savings: 50 },
};

let activePreset = 'classic';
let activePeriod = 'month';

function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

const isViPrimary = () => document.body.classList.contains('lang-vi-primary');

// Mirrors clampToInput in js/calculator.js (each page loads only its own
// script, so the helper is duplicated rather than moved into shared chrome).
function clampToInput(input, value, noteEl) {
  const min = input.min !== '' ? Number(input.min) : -Infinity;
  const max = input.max !== '' ? Number(input.max) : Infinity;
  const clamped = Math.min(Math.max(value, min), max);
  if (String(clamped) !== input.value) input.value = clamped;
  if (noteEl) {
    noteEl.classList.toggle('is-active', value !== clamped);
    noteEl.querySelectorAll('.clamp-note-value').forEach((el) => {
      el.textContent = clamped;
    });
  }
  return clamped;
}

function currentPercentages() {
  if (activePreset !== 'custom') return PRESETS[activePreset];
  return {
    needs: clampToInput(pctInputs.needs, parseFloat(pctInputs.needs.value) || 0, pctClampNotes.needs),
    wants: clampToInput(pctInputs.wants, parseFloat(pctInputs.wants.value) || 0, pctClampNotes.wants),
    savings: clampToInput(pctInputs.savings, parseFloat(pctInputs.savings.value) || 0, pctClampNotes.savings),
  };
}

function update() {
  const amount = clampToInput(amountInput, parseFloat(amountInput.value) || 0, amountClampNoteEl);
  const pcts = currentPercentages();
  const split = splitPaycheck(amount, pcts.needs, pcts.wants, pcts.savings);

  BUCKET_KEYS.forEach((key) => {
    bucketAmountEls[key].textContent = formatCurrency(split[key]);
    // Show the *effective* share (normalized), so the percentage always
    // agrees with the dollar amount next to it while a custom split is
    // mid-edit and doesn't sum to 100.
    const effective = split.enteredSum > 0 ? Math.round((pcts[key] / split.enteredSum) * 100) : 0;
    bucketPctEls[key].textContent = effective + '%';
  });

  // The "adds up to N%" note only concerns the custom preset — the built-in
  // ratios always sum to 100.
  const showNote = activePreset === 'custom' && split.normalized;
  splitNoteEl.classList.toggle('is-active', showNote);
  splitNoteEl.querySelectorAll('.split-sum-value').forEach((el) => {
    el.textContent = split.enteredSum;
  });

  // Cross-link into the compound calculator. The hash form (#monthly=X)
  // matches what js/calculator.js already reads — see the comment there
  // about clean-URL servers dropping query strings.
  const monthlySavings = toMonthly(split.savings, activePeriod);
  savingsLinkEl.href = 'actual%20website.html#monthly=' + monthlySavings;
  savingsLinkEl.querySelectorAll('.savings-monthly-value').forEach((el) => {
    el.textContent = formatCurrency(monthlySavings);
  });
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedUpdate = debounce(update, 150);

amountInput.addEventListener('input', debouncedUpdate);
Object.values(pctInputs).forEach((input) => {
  input.addEventListener('input', debouncedUpdate);
});

periodChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activePeriod = chip.dataset.period;
    periodChips.forEach((c) => c.classList.toggle('active', c === chip));
    update();
  });
});

presetChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activePreset = chip.dataset.preset;
    presetChips.forEach((c) => c.classList.toggle('active', c === chip));
    customSplitEl.hidden = activePreset !== 'custom';
    update();
  });
});

// Language switching is handled by js/site.js; this page only re-renders
// its JS-generated strings (and, after Task 4, the chart) when it flips.
document.addEventListener('verity:langchange', update);

update();
```

- [ ] **Step 2: Syntax check**

Run: `node --check js/budget.js`
Expected: clean exit.

- [ ] **Step 3: Verify in the preview browser**

On `http://localhost:3000/website/budget.html`:
- Default state: $500 · per month · Classic → buckets read $250 / $150 / $100, labels 50% / 30% / 20%, savings link says "$100/month" and href ends `#monthly=100`.
- Click "20/30/50 · Living at home" → $100 / $150 / $250.
- Click Custom → three % fields appear (50/30/20 carried); set Needs to 40 → sum 90 → note "Adds up to 90% — adjusted to fit." appears; set Wants to 40 → sum 100 → note disappears.
- Type 150 into a % field → input rewrites to 100 and its "Capped at 100%" note shows.
- Switch period to "Per week" with $100 savings/week → link shows $433/month, href `#monthly=433`.
- Click the savings link → calculator opens with Monthly contribution = 433 and recomputed results.

- [ ] **Step 4: Commit**

```bash
git add js/budget.js
git commit -m "Wire the budget splitter: presets, custom normalization, buckets, calculator cross-link"
```

---

### Task 4: Doughnut chart with bilingual strings and empty state

**Files:**
- Modify: `js/budget.js`

**Interfaces:**
- Consumes: `update()`, `formatCurrency`, `isViPrimary`, `BUCKET_KEYS` from Task 3; `#budgetChart` canvas and `#donutTotal` from Task 2; global `Chart` from the CDN tag.
- Produces: `renderChart(amount, split)` called as the last line of `update()`.

- [ ] **Step 1: Add the chart block**

Insert after the `bucketPctEls` declaration block (grouping the chart lookups with the others):

```js
const donutTotalEl = document.getElementById('donutTotal');
const chartCanvas = document.getElementById('budgetChart');
```

Insert after the `currentPercentages` function, before `update`:

```js
// Chart text isn't markup, so it can't use the .en/.vi sibling-span pattern —
// these strings are picked live off body's lang-vi-primary class instead
// (same approach as js/calculator.js).
const CHART_STRINGS = {
  needs: { en: 'Needs', vi: 'Nhu cầu' },
  wants: { en: 'Wants', vi: 'Mong muốn' },
  savings: { en: 'Savings', vi: 'Tiết kiệm' },
};

// Data-UI colors doing data jobs: needs = blue, wants = neutral stone,
// savings = teal (positive outcome). Mirrored by .legend-dot in style.css —
// keep the two in sync.
const SEGMENT_COLORS = ['#2348ad', '#b1b1af', '#0e7a72'];
const EMPTY_COLOR = '#ecebea'; // pearl — muted single ring when there's nothing to split

const chart = new Chart(chartCanvas, {
  type: 'doughnut',
  data: {
    labels: ['Needs', 'Wants', 'Savings'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: SEGMENT_COLORS,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',
    animation: { duration: 500, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => {
            const lang = isViPrimary() ? 'vi' : 'en';
            const key = BUCKET_KEYS[item.dataIndex];
            return ` ${CHART_STRINGS[key][lang]}   ${formatCurrency(item.parsed)}`;
          },
        },
      },
    },
  },
});

function renderChart(amount, split) {
  const lang = isViPrimary() ? 'vi' : 'en';
  const isEmpty = amount <= 0;

  chart.data.labels = BUCKET_KEYS.map((key) => CHART_STRINGS[key][lang]);
  if (isEmpty) {
    // A zero paycheck has no shares to show — render one muted pearl ring
    // instead of letting Chart.js draw nothing at all.
    chart.data.datasets[0].data = [1];
    chart.data.datasets[0].backgroundColor = [EMPTY_COLOR];
  } else {
    chart.data.datasets[0].data = [split.needs, split.wants, split.savings];
    chart.data.datasets[0].backgroundColor = SEGMENT_COLORS;
  }
  chart.options.plugins.tooltip.enabled = !isEmpty;
  chart.update();

  donutTotalEl.textContent = formatCurrency(amount);
  chartCanvas.setAttribute(
    'aria-label',
    isViPrimary()
      ? `Biểu đồ chia ${formatCurrency(amount)} thành ${formatCurrency(split.needs)} nhu cầu, ` +
          `${formatCurrency(split.wants)} mong muốn và ${formatCurrency(split.savings)} tiết kiệm.`
      : `Doughnut chart splitting ${formatCurrency(amount)} into ${formatCurrency(split.needs)} needs, ` +
          `${formatCurrency(split.wants)} wants, and ${formatCurrency(split.savings)} savings.`
  );
}
```

Then add as the **last line inside `update()`**:

```js
  renderChart(amount, split);
```

- [ ] **Step 2: Syntax check**

Run: `node --check js/budget.js`
Expected: clean exit.

- [ ] **Step 3: Verify in the preview browser**

- Default state: three-segment doughnut (blue/stone/teal), white gaps, "$500" centered.
- Change amount → segments and center total animate to match bucket cards.
- Clear the amount field → single muted pearl ring, "$0" center, no tooltips.
- Toggle VI → hover tooltips show "Nhu cầu / Mong muốn / Tiết kiệm"; canvas `aria-label` is Vietnamese (check via devtools or `read_page`).

- [ ] **Step 4: Commit**

```bash
git add js/budget.js
git commit -m "Add the budget doughnut chart with bilingual tooltips and a muted empty state"
```

---

### Task 5: Budget link in nav and footer on all existing pages

**Files:**
- Modify: `index.html`, `actual website.html`, `recommend.html`, `jargon.html`, `credit.html`, `family-split.html`

**Interfaces:**
- Consumes: existing `.nav-capsule` and `.footer-links` markup (identical structure on every page).
- Produces: site-wide navigation to `budget.html`.

- [ ] **Step 1: Add the nav item on all six pages**

In each page's `<nav class="nav-capsule">`, insert directly after the Calculator link:

```html
      <a href="budget.html" class="nav-link">Budget</a>
```

(No page gets `active` — budget.html itself already has it from Task 2.)

- [ ] **Step 2: Add the footer link on all six pages**

In each page's `<nav class="footer-links">`, insert directly after the Calculator link:

```html
      <a href="budget.html">Budget</a>
```

- [ ] **Step 3: Verify**

`grep -c 'budget.html' index.html "actual website.html" recommend.html jargon.html credit.html family-split.html` → 2 per file. In the preview browser, spot-check one page: nav shows Calculator · Budget · Recommend · Jargon · Credit · Family Split, both nav and footer link work, and the nav capsule still fits on one line at desktop width **and** in the docked compact state (scroll down — the capsule slims but must not wrap; if it wraps, reduce `.nav-link` side padding for six items rather than shrinking font size).

- [ ] **Step 4: Commit**

```bash
git add index.html "actual website.html" recommend.html jargon.html credit.html family-split.html
git commit -m "Add Budget to the nav capsule and footer links on every page"
```

---

### Task 6: Documentation updates (DESIGN.md, CLAUDE.md)

**Files:**
- Modify: `DESIGN.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: DESIGN.md**

1. Frontmatter `colors`: add `pastel-budget: "#ffddb5"` after `pastel-family`.
2. Overview (§1): change "a five-pastel taxonomy that color-codes the five modules" to "a flat-pastel taxonomy that color-codes the modules (one pastel per module)".
3. Module Pastel Taxonomy table (§2): add row `| Budget | Peach | \`#ffddb5\` |` after Family Split. Add below the table: "Peach was chosen for Budget (2026-07-12) because the spec's first pick, lavender, collides with Recommend's soft violet."
4. §5 Components: add a short "Budget splitter" entry noting the chip groups (`.seg-chip`, white + hairline, active = ink fill — the button-chip-active spec), the doughnut's data-UI segment colors (needs blue / wants stone / savings teal), and the HTML-overlay center total.

- [ ] **Step 2: CLAUDE.md**

1. File inventory ("What this is"): add `budget.html` to the pages list, and note `js/budget-math.js` (pure math, node-testable) + `js/budget.js` (DOM wiring) + `tests/`.
2. Commands section: add `node --test tests/` as the unit-test command, noting the exports-guard pattern (`if (typeof module !== 'undefined')`) that lets browser scripts be required by node:test.
3. Architecture: one sentence noting budget.js follows the calculator's single-`update()` pattern, and that the calculator's `#monthly=X` hash-prefill is consumed by the budget page's savings cross-link.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md CLAUDE.md
git commit -m "Document the budget module: sixth pastel, chip components, test command"
```

---

### Task 7: Full verification pass

**Files:** none (verification only; fix-forward any failures and note them).

- [ ] **Step 1: Automated checks**

- `node --test tests/` → all passing.
- `node --check js/budget.js js/budget-math.js` (run per file) → clean.
- CSS brace balance one-liner → equal counts.

- [ ] **Step 2: Browser checklist (preview server, all from the spec)**

On `http://localhost:3000/website/budget.html`:
- [ ] $200 at Classic → $100 / $60 / $40.
- [ ] Preset chips switch ratios; Custom reveals fields; normalization note appears at sum≠100 and clears at 100.
- [ ] Savings cross-link opens the calculator with monthly contribution prefilled and results recomputed.
- [ ] Language toggle flips every visible string AND chart tooltips AND the savings-link amount text.
- [ ] Body background `rgb(246, 245, 243)`; aurora fades into cream; charcoal footer flush.
- [ ] Mobile width (375px): cards stack, chip groups wrap without overflow, doughnut stays centered with legible center total.
- [ ] Reduced motion: with `prefers-reduced-motion` emulated, no chart entry animation regression worse than the calculator page's behavior (Chart.js animation is acceptable there today; do not make it worse).

On the calculator page: default load (no hash) unchanged — inputs 500/100/7/10.
On every other page: nav + footer show Budget; nothing else moved.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "Fix issues found in budget module verification pass"
```

(Skip if nothing changed.)
