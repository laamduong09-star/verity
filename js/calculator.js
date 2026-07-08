const initialInput = document.getElementById('initial');
const monthlyInput = document.getElementById('monthly');
const rateInput = document.getElementById('rate');
const yearsInput = document.getElementById('years');
const initialClampNoteEl = document.getElementById('initialClampNote');
const monthlyClampNoteEl = document.getElementById('monthlyClampNote');
const rateClampNoteEl = document.getElementById('rateClampNote');
const yearsClampNoteEl = document.getElementById('yearsClampNote');
const finalBalanceEl = document.getElementById('finalBalance');
const statContributedEl = document.getElementById('statContributed');
const statInterestEl = document.getElementById('statInterest');
const statMultiplierEl = document.getElementById('statMultiplier');
const breakdownBodyEl = document.getElementById('breakdownBody');
const compareYearsEnEl = document.getElementById('compareYearsEn');
const compareYearsViEl = document.getElementById('compareYearsVi');
const compareFillYouEl = document.getElementById('compareFillYou');
const compareFillHysaEl = document.getElementById('compareFillHysa');
const compareFillCheckingEl = document.getElementById('compareFillChecking');
const compareValueYouEl = document.getElementById('compareValueYou');
const compareValueHysaEl = document.getElementById('compareValueHysa');
const compareValueCheckingEl = document.getElementById('compareValueChecking');
const compareGapEnEl = document.getElementById('compareGapEn');
const compareGapViEl = document.getElementById('compareGapVi');
const compareBehindEnEl = document.getElementById('compareBehindEn');
const compareBehindViEl = document.getElementById('compareBehindVi');
const calloutAheadEl = document.getElementById('calloutAhead');
const calloutBehindEl = document.getElementById('calloutBehind');

// Reference rates for the two "just saving" alternatives, used only to size
// the "what compounding buys you" comparison against this plan's growth rate.
const HYSA_RATE = 4;
const CHECKING_ACCOUNT_RATE = 0.5;

function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// Compound interest with regular monthly contributions, compounded monthly.
// Returns one row per year: balance, total contributed so far, and the
// interest earned so far (balance minus what was actually put in).
//
// The monthly rate is the geometric (not simple-division) equivalent of the
// entered annual rate, i.e. (1 + annualRate)^(1/12) - 1. Dividing the annual
// rate by 12 would compound to an effective annual return higher than what
// was entered (7% input -> 7.23% effective) since compounding amplifies a
// nominal rate; the geometric root keeps the entered rate exact.
function projectGrowth(initial, monthlyContribution, annualRatePercent, years) {
  const annualRate = annualRatePercent / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const totalMonths = years * 12;

  let balance = initial;
  let contributed = initial;
  const rows = [{ year: 0, balance, contributed, interest: 0 }];

  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;
    if (month % 12 === 0) {
      rows.push({ year: month / 12, balance, contributed, interest: balance - contributed });
    }
  }
  return rows;
}

const ctx = document.getElementById('growthChart');
let chartRows = [];

// Chart text isn't markup, so it can't use the .en/.vi sibling-span pattern —
// these strings are picked live from document.body's lang-vi-primary class
// instead, the same toggle state everything else reads.
const isViPrimary = () => document.body.classList.contains('lang-vi-primary');
const CHART_STRINGS = {
  year: { en: 'Year', vi: 'Năm' },
  principal: { en: 'Total principal', vi: 'Tổng tiền gốc' },
  interest: { en: 'Total interest', vi: 'Tổng tiền lãi' },
  balance: { en: 'Total balance', vi: 'Tổng số dư' },
};

// Stacked-area chart: "Total interest" stacks on top of "Total principal" so
// the top edge traces the total balance, while the tooltip still reports
// each layer's raw (non-cumulative) value as a breakdown.
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Total principal',
        data: [],
        borderColor: '#2348ad',
        backgroundColor: 'rgba(35, 72, 173, 0.18)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#2348ad',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: 'origin',
        tension: 0.15,
      },
      {
        label: 'Total interest',
        data: [],
        borderColor: '#0e7a72',
        backgroundColor: 'rgba(14, 122, 114, 0.18)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#0e7a72',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: '-1',
        tension: 0.15,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const lang = isViPrimary() ? 'vi' : 'en';
            return `${CHART_STRINGS.year[lang]} ${chartRows[items[0].dataIndex]?.year ?? ''}`;
          },
          beforeBody: (items) => {
            const row = chartRows[items[0].dataIndex];
            const lang = isViPrimary() ? 'vi' : 'en';
            return row ? `${CHART_STRINGS.balance[lang]}   ${formatCurrency(row.balance)}` : '';
          },
          label: (item) => {
            const lang = isViPrimary() ? 'vi' : 'en';
            const key = item.datasetIndex === 0 ? 'principal' : 'interest';
            return ` ${CHART_STRINGS[key][lang]}   ${formatCurrency(item.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5d5f68', font: { family: 'Be Vietnam Pro', size: 12 } },
      },
      y: {
        stacked: true,
        grid: { color: '#d5d3cd' },
        ticks: {
          color: '#5d5f68',
          font: { family: 'Be Vietnam Pro', size: 12 },
          callback: (value) => formatCurrency(value),
        },
      },
    },
  },
});

function popValue(el) {
  el.classList.remove('pop');
  // Restart the pop animation on every update (re-adding the class after a
  // reflow lets the @keyframes replay instead of being a no-op).
  void el.offsetWidth;
  el.classList.add('pop');
}

// Clamp a parsed value to an input's own min/max attributes, then write the
// clamped value back so out-of-range entries (negative amounts, 9999 years)
// can't silently produce a nonsensical chart. When the raw typed value
// actually exceeded the range, surface the clamp-note next to the field
// instead of just rewriting the input with no explanation.
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

function update() {
  const initial = clampToInput(initialInput, parseFloat(initialInput.value) || 0, initialClampNoteEl);
  const monthly = clampToInput(monthlyInput, parseFloat(monthlyInput.value) || 0, monthlyClampNoteEl);
  const rate = clampToInput(rateInput, parseFloat(rateInput.value) || 0, rateClampNoteEl);
  const years = clampToInput(yearsInput, parseInt(yearsInput.value, 10) || 0, yearsClampNoteEl);

  const rows = projectGrowth(initial, monthly, rate, years);
  const final = rows[rows.length - 1];

  chartRows = rows;
  const chartLang = isViPrimary() ? 'vi' : 'en';
  chart.data.labels = rows.map((row) => `${CHART_STRINGS.year[chartLang]} ${row.year}`);
  chart.data.datasets[0].label = CHART_STRINGS.principal[chartLang];
  chart.data.datasets[1].label = CHART_STRINGS.interest[chartLang];
  chart.data.datasets[0].data = rows.map((row) => row.contributed);
  chart.data.datasets[1].data = rows.map((row) => row.interest);

  // A cleared field (a routine mid-edit state, not a contrived edge case)
  // makes every row's balance 0. Chart.js can't derive a "nice" axis step
  // from an all-zero dataset and autoscales to something like
  // "$1, $0, $0, -$0, -$1" — force a sane fixed range instead of letting
  // it improvise one. Reset to undefined (autoscale) the rest of the time.
  const isFlatZero = rows.every((row) => row.balance === 0);
  chart.options.scales.y.min = isFlatZero ? 0 : undefined;
  chart.options.scales.y.max = isFlatZero ? 100 : undefined;

  chart.update();
  ctx.setAttribute(
    'aria-label',
    isViPrimary()
      ? `Biểu đồ số dư dự kiến trong ${years} năm, đạt ${formatCurrency(final.balance)}: ` +
          `${formatCurrency(final.contributed)} tiền gốc cộng ${formatCurrency(final.interest)} tiền lãi.`
      : `Chart of projected balance over ${years} years, reaching ${formatCurrency(final.balance)}: ` +
          `${formatCurrency(final.contributed)} principal plus ${formatCurrency(final.interest)} interest.`
  );

  finalBalanceEl.textContent = formatCurrency(final.balance);
  popValue(finalBalanceEl);

  statContributedEl.textContent = formatCurrency(final.contributed);
  statInterestEl.textContent = formatCurrency(final.interest);
  statMultiplierEl.textContent = `${(final.balance / final.contributed || 0).toFixed(2)}×`;
  popValue(statContributedEl);
  popValue(statInterestEl);
  popValue(statMultiplierEl);

  const hysaFinal = projectGrowth(initial, monthly, HYSA_RATE, years).at(-1);
  const checkingFinal = projectGrowth(initial, monthly, CHECKING_ACCOUNT_RATE, years).at(-1);
  const maxBalance = Math.max(final.balance, hysaFinal.balance, checkingFinal.balance) || 1;

  compareYearsEnEl.textContent = years;
  compareYearsViEl.textContent = years;
  compareFillYouEl.style.transform = `scaleX(${final.balance / maxBalance})`;
  compareFillHysaEl.style.transform = `scaleX(${hysaFinal.balance / maxBalance})`;
  compareFillCheckingEl.style.transform = `scaleX(${checkingFinal.balance / maxBalance})`;
  compareValueYouEl.textContent = formatCurrency(final.balance);
  compareValueHysaEl.textContent = formatCurrency(hysaFinal.balance);
  compareValueCheckingEl.textContent = formatCurrency(checkingFinal.balance);
  // Branch the callout copy on which side of the HYSA line this plan lands:
  // flooring the gap at $0 and always saying "more" would tell a user whose
  // plan is actually behind a savings account that they're winning by "$0".
  // An exact tie reuses the "ahead" copy (literally true at $0) but is
  // colored neutral gray below — a $0 gap is neither a win nor a loss.
  const isAhead = final.balance >= hysaFinal.balance;
  calloutAheadEl.classList.toggle('is-active', isAhead);
  calloutAheadEl.classList.toggle('is-tied', final.balance === hysaFinal.balance);
  calloutBehindEl.classList.toggle('is-active', !isAhead);
  if (isAhead) {
    const compareGap = formatCurrency(final.balance - hysaFinal.balance);
    compareGapEnEl.textContent = compareGap;
    compareGapViEl.textContent = compareGap;
  } else {
    const compareBehind = formatCurrency(hysaFinal.balance - final.balance);
    compareBehindEnEl.textContent = compareBehind;
    compareBehindViEl.textContent = compareBehind;
  }

  breakdownBodyEl.innerHTML = rows
    .filter((row) => row.year > 0)
    .map(
      (row) => `
      <tr>
        <td>${row.year}</td>
        <td>${formatCurrency(row.contributed)}</td>
        <td class="interest-value">${formatCurrency(row.interest)}</td>
        <td class="balance-value">${formatCurrency(row.balance)}</td>
      </tr>
    `
    )
    .join('');
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedUpdate = debounce(update, 150);

[initialInput, monthlyInput, rateInput, yearsInput].forEach((input) => {
  input.addEventListener('input', debouncedUpdate);
});

// The "Run it in the calculator" links on recommend.html prefill a scenario
// with params matching the input ids (#initial=0&monthly=100&rate=4&years=1).
// They ride in the hash rather than the query string because clean-URL
// servers 301 ".html" to the extensionless path and drop the query string in
// that redirect, while browsers re-attach the fragment. Query-string params
// are honored too for anyone hand-editing a URL on a plain static host.
// A missing or non-numeric param leaves that input's default alone; anything
// out of range goes through the same clampToInput path as typed values, so
// the clamp-note explains it instead of silently rewriting.
const searchParams = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash.slice(1));
[initialInput, monthlyInput, rateInput, yearsInput].forEach((input) => {
  const raw = searchParams.get(input.id) ?? hashParams.get(input.id);
  if (raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw))) {
    input.value = raw.trim();
  }
});

update();

// The custom cursor, language toggle, and compacting topbar are shared
// site chrome and live in js/site.js (loaded before this file).

// Info modal: explains compound interest, respects whatever language is
// currently toggled since it reuses the same .en/.vi spans.
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const infoModalClose = document.getElementById('infoModalClose');

let infoModalTrigger = null;

function getFocusableModalElements() {
  return infoModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
}

function openInfoModal() {
  infoModalTrigger = document.activeElement;
  infoModal.hidden = false;
  infoModalClose.focus();
}

function closeInfoModal() {
  infoModal.hidden = true;
  if (infoModalTrigger) infoModalTrigger.focus();
}

infoBtn.addEventListener('click', openInfoModal);
infoModalClose.addEventListener('click', closeInfoModal);
infoModal.addEventListener('click', (event) => {
  if (event.target === infoModal) closeInfoModal();
});
document.addEventListener('keydown', (event) => {
  if (infoModal.hidden) return;
  if (event.key === 'Escape') {
    closeInfoModal();
    return;
  }
  if (event.key !== 'Tab') return;

  // Trap Tab focus within the modal while it's open.
  const focusable = getFocusableModalElements();
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// Language switching itself is handled by js/site.js (shared across all
// pages, persisted in localStorage). The calculator only reacts: refresh
// the Chart.js labels/tooltips and the icon-only info button's aria-label
// (which can't use the .en/.vi span pattern) whenever the language flips.
function syncLangDependentUi() {
  infoBtn.setAttribute('aria-label', isViPrimary() ? 'Cách hoạt động' : 'How it works');
}

document.addEventListener('verity:langchange', () => {
  syncLangDependentUi();
  update();
});
syncLangDependentUi();
