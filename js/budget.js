// Budget splitter page logic. The pure math (splitPaycheck, toMonthly)
// lives in js/budget-math.js, loaded just before this file, so node's test
// runner can exercise it without a DOM.

const amountInput = document.getElementById('amount');
const amountClampNoteEl = document.getElementById('amountClampNote');
const homeInput = document.getElementById('home');
const homeClampNoteEl = document.getElementById('homeClampNote');
const offTopEl = document.getElementById('bdOffTop');
const donutLegendEl = document.getElementById('donutLegend');
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
const donutTotalEl = document.getElementById('donutTotal');
const chartCanvas = document.getElementById('budgetChart');

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

// The % fields stay in the layout at all times (never [hidden]) so picking
// Custom never changes the inputs card's height. Outside the Custom preset
// they're locked read-only and show the active preset's own ratio — a
// readout, not an editable field. Useful side effect: switching Home ->
// Custom starts you at 20/30/50 instead of snapping back to 50/30/20.
function syncSplitFields() {
  const locked = activePreset !== 'custom';
  customSplitEl.classList.toggle('is-locked', locked);
  BUCKET_KEYS.forEach((key) => {
    pctInputs[key].readOnly = locked;
    if (locked) {
      pctInputs[key].value = PRESETS[activePreset][key];
      pctClampNotes[key].classList.remove('is-active');
    }
  });
}

// Chart text isn't markup, so it can't use the .en/.vi sibling-span pattern —
// these strings are picked live off body's lang-vi-primary class instead
// (same approach as js/calculator.js).
const CHART_STRINGS = {
  home: { en: 'Goes home', vi: 'Gửi về nhà' },
  needs: { en: 'Needs', vi: 'Nhu cầu' },
  wants: { en: 'Wants', vi: 'Mong muốn' },
  savings: { en: 'Savings', vi: 'Tiết kiệm' },
};

// Separate from BUCKET_KEYS (which stays needs/wants/savings for the three
// stat cards): the doughnut gains a fourth arc, home, but only when home > 0.
// Arc order is home, needs, wants, savings.
const CHART_KEYS = ['home', 'needs', 'wants', 'savings'];

// Data-UI colors doing data jobs: home = ink (a subtraction, not a bucket),
// needs = blue, wants = muted rose (--rose-muted in style.css, written here
// as a literal since this file has no access to CSS custom properties — same
// reason #111111, #2348ad and #0e7a72 are literals), savings = teal
// (positive outcome). Mirrored by .legend-dot in style.css — keep the two in
// sync.
const SEGMENT_COLORS = ['#111111', '#2348ad', '#9d3f5f', '#0e7a72'];
const EMPTY_COLOR = '#ecebea'; // pearl — muted single ring when there's nothing to split

// Tracks which keys the doughnut is currently drawing (with or without the
// home arc), so the tooltip callback below can look up the right label
// without re-deriving it from chart.data.labels, which is already
// language-translated text by the time the tooltip reads it.
let currentChartKeys = BUCKET_KEYS;

const chart = new Chart(chartCanvas, {
  type: 'doughnut',
  data: {
    labels: ['Needs', 'Wants', 'Savings'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: SEGMENT_COLORS.slice(1),
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
            const key = currentChartKeys[item.dataIndex];
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
  // The fourth arc — home — only exists when there's a home figure to show.
  // At home: 0 the doughnut is exactly what it was before this feature.
  const showHome = split.home > 0;
  const keys = showHome ? CHART_KEYS : CHART_KEYS.slice(1);
  const colors = showHome ? SEGMENT_COLORS : SEGMENT_COLORS.slice(1);
  currentChartKeys = keys;

  // The static legend mirrors the arcs — DESIGN.md keeps the two in sync,
  // so a fourth arc without a fourth swatch is an unnamed colour.
  donutLegendEl.classList.toggle('has-home', showHome && !isEmpty);

  chart.data.labels = keys.map((key) => CHART_STRINGS[key][lang]);
  if (isEmpty) {
    // A zero paycheck has no shares to show — render one muted pearl ring
    // instead of letting Chart.js draw nothing at all.
    chart.data.datasets[0].data = [1];
    chart.data.datasets[0].backgroundColor = [EMPTY_COLOR];
  } else {
    chart.data.datasets[0].data = keys.map((key) => split[key]);
    chart.data.datasets[0].backgroundColor = colors;
  }
  chart.options.plugins.tooltip.enabled = !isEmpty;
  chart.update();

  // The centre total keeps showing the full paycheck, not the remainder —
  // "amount" here is the clamped input, never split.remainder.
  donutTotalEl.textContent = formatCurrency(amount);
  chartCanvas.setAttribute(
    'aria-label',
    isViPrimary()
      ? (showHome
          ? `Biểu đồ chia ${formatCurrency(amount)} thành ${formatCurrency(split.home)} gửi về nhà, ` +
              `${formatCurrency(split.needs)} nhu cầu, ${formatCurrency(split.wants)} mong muốn ` +
              `và ${formatCurrency(split.savings)} tiết kiệm.`
          : `Biểu đồ chia ${formatCurrency(amount)} thành ${formatCurrency(split.needs)} nhu cầu, ` +
              `${formatCurrency(split.wants)} mong muốn và ${formatCurrency(split.savings)} tiết kiệm.`)
      : (showHome
          ? `Doughnut chart splitting ${formatCurrency(amount)} into ${formatCurrency(split.home)} for home, ` +
              `${formatCurrency(split.needs)} needs, ${formatCurrency(split.wants)} wants, ` +
              `and ${formatCurrency(split.savings)} savings.`
          : `Doughnut chart splitting ${formatCurrency(amount)} into ${formatCurrency(split.needs)} needs, ` +
              `${formatCurrency(split.wants)} wants, and ${formatCurrency(split.savings)} savings.`)
  );
}

// The off-the-top line between the calculator and the stats row. Permanently
// in the layout at both states (home > 0 and home === 0) so entering a home
// amount for the first time shifts nothing below it. JS-generated like the
// chart strings above, not .en/.vi spans, because the numbers change.
const OFFTOP_STRINGS = {
  home: {
    en: (home, remainder) => `${home} goes home first. The three buckets below divide the remaining ${remainder}.`,
    vi: (home, remainder) => `${home} được gửi về nhà trước. Ba nhóm bên dưới chia ${remainder} còn lại.`,
  },
  none: {
    en: (amount) => `Nothing goes out first. The three buckets below divide the whole ${amount}.`,
    vi: (amount) => `Không có khoản nào đi ra trước. Ba nhóm bên dưới chia trọn ${amount}.`,
  },
  uncovered: {
    en: (amount) => `You entered more than this paycheck. Capped at ${amount}, which leaves nothing to split.`,
    vi: (amount) => `Bạn đã nhập nhiều hơn kỳ lương này. Đã giới hạn ở ${amount}, nên không còn gì để chia.`,
  },
};

function renderOffTop(amount, split) {
  const lang = isViPrimary() ? 'vi' : 'en';
  if (!split.covered) {
    offTopEl.textContent = OFFTOP_STRINGS.uncovered[lang](formatCurrency(amount));
  } else if (split.home > 0) {
    offTopEl.textContent = OFFTOP_STRINGS.home[lang](formatCurrency(split.home), formatCurrency(split.remainder));
  } else {
    offTopEl.textContent = OFFTOP_STRINGS.none[lang](formatCurrency(amount));
  }
}

function update() {
  const amount = clampToInput(amountInput, parseFloat(amountInput.value) || 0, amountClampNoteEl);
  const home = clampToInput(homeInput, parseFloat(homeInput.value) || 0, homeClampNoteEl);
  const pcts = currentPercentages();
  const split = splitAfterHome(amount, home, pcts.needs, pcts.wants, pcts.savings);

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
  savingsLinkEl.href = 'calculator.html#monthly=' + monthlySavings;
  savingsLinkEl.querySelectorAll('.savings-monthly-value').forEach((el) => {
    el.textContent = formatCurrency(monthlySavings);
  });

  renderChart(amount, split);
  renderOffTop(amount, split);
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
homeInput.addEventListener('input', debouncedUpdate);
Object.values(pctInputs).forEach((input) => {
  input.addEventListener('input', debouncedUpdate);
});

periodChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activePeriod = chip.dataset.period;
    periodChips.forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    update();
  });
});

presetChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activePreset = chip.dataset.preset;
    presetChips.forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    syncSplitFields();
    update();
  });
});

// Language switching is handled by js/site.js; this page only re-renders
// its JS-generated strings (and, after Task 4, the chart) when it flips.
document.addEventListener('verity:langchange', update);

syncSplitFields();
update();
