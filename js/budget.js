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

  renderChart(amount, split);
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
