// Tuition page logic. The pure math (amortize, standardTierYears,
// salaryCheck) lives in js/tuition-math.js, loaded just before this file,
// so node's test runner can exercise it without a DOM.
//
// Nothing here builds a sentence. Every string on this page is a static
// .en/.vi pair in the markup and every value this script writes is a
// number, so the language toggle needs no help from JavaScript — which is
// why there is no CHART_STRINGS-style table here the way calculator.js
// needs one.

const borrowedInput = document.getElementById('borrowed');
const rateInput = document.getElementById('rate');
const salaryInput = document.getElementById('salary');
const borrowedClampNoteEl = document.getElementById('borrowedClampNote');
const rateClampNoteEl = document.getElementById('rateClampNote');
const salaryClampNoteEl = document.getElementById('salaryClampNote');
const termChips = Array.from(document.querySelectorAll('#termChips .seg-chip'));

const monthlyEl = document.getElementById('tuMonthly');
const totalRepaidEl = document.getElementById('tuTotalRepaid');
const segPrincipalEl = document.getElementById('tuSegPrincipal');
const segInterestEl = document.getElementById('tuSegInterest');
const principalAmtEl = document.getElementById('tuPrincipalAmt');
const interestAmtEl = document.getElementById('tuInterestAmt');
const EM_DASH = '—';
const borrowedVsSalaryEl = document.getElementById('tuBorrowedVsSalary');
const paymentShareEl = document.getElementById('tuPaymentShare');
const ledgerEl = document.getElementById('tuLedger');

// Which term is showing. It follows the balance through the standard
// tiers until someone picks a term themselves, and then it stops moving —
// changing a control a person just set is the more annoying failure.
let chosenYears = null;

const dollars = (value) => `$${Math.round(value).toLocaleString('en-US')}`;

// Same contract as calculator.js: clamp to the input's own min/max and,
// when the typed value actually fell outside the range, say so in the
// field's .clamp-note rather than silently rewriting it.
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
  const borrowed = clampToInput(borrowedInput, parseFloat(borrowedInput.value) || 0, borrowedClampNoteEl);
  const rate = clampToInput(rateInput, parseFloat(rateInput.value) || 0, rateClampNoteEl);
  // Salary is optional, so an empty field stays empty: running it through
  // clampToInput would write a literal 0 into a box the reader deliberately
  // left blank.
  const salaryRaw = salaryInput.value.trim();
  const salary = salaryRaw === ''
    ? 0
    : clampToInput(salaryInput, parseFloat(salaryRaw) || 0, salaryClampNoteEl);
  if (salaryRaw === '') salaryClampNoteEl.classList.remove('is-active');

  const tierYears = standardTierYears(borrowed);
  const years = chosenYears === null ? tierYears : chosenYears;

  termChips.forEach((chip) => {
    const chipYears = Number(chip.dataset.years);
    const active = chipYears === years;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
    chip.classList.toggle('is-match', chipYears === tierYears);
  });

  const loan = amortize(borrowed, rate, years);

  monthlyEl.textContent = dollars(loan.monthly);
  totalRepaidEl.textContent = dollars(loan.totalRepaid);
  principalAmtEl.textContent = dollars(borrowed);
  interestAmtEl.textContent = dollars(loan.totalInterest);

  // The split bar is the cost of borrowing as a shape. With nothing
  // borrowed there is no shape to draw, so it sits at all-principal
  // rather than collapsing to a divide-by-zero.
  //
  // This is the one bar on the page NOT drawn to the $31,000 ruler — its
  // full width is the total repaid, which is said out loud in the caption
  // under it. The legend items are resized alongside the segments so each
  // label stays under the thing it names.
  const principalShare = loan.totalRepaid > 0 ? borrowed / loan.totalRepaid : 1;
  const principalPct = `${principalShare * 100}%`;
  const interestPct = `${(1 - principalShare) * 100}%`;
  segPrincipalEl.style.width = principalPct;
  segInterestEl.style.width = interestPct;
  principalAmtEl.closest('.tu-legend-item').style.setProperty('--w', principalPct);
  interestAmtEl.closest('.tu-legend-item').style.setProperty('--w', interestPct);

  // Typing a salary must not move anything on the page. Both rows are
  // always in the layout at the same height; only the two values change,
  // from an em dash to a number. Showing and hiding a block here — the
  // obvious implementation — reflowed the results column on the first
  // keystroke and again if the field was cleared.
  const check = salaryCheck(borrowed, loan.monthly, salary);
  borrowedVsSalaryEl.textContent = check ? `${check.borrowedVsSalary.toFixed(2)}×` : EM_DASH;
  paymentShareEl.textContent = check ? `${(check.paymentShareOfGross * 100).toFixed(1)}%` : EM_DASH;
  borrowedVsSalaryEl.classList.toggle('is-empty', !check);
  paymentShareEl.classList.toggle('is-empty', !check);
}

[borrowedInput, rateInput, salaryInput].forEach((input) => {
  input.addEventListener('input', update);
});

termChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chosenYears = Number(chip.dataset.years);
    update();
  });
});

update();

/* ---------- The retracting bar ---------- */
// The markup already carries the true width, so this only ever runs to
// make the number arrive rather than to produce it. Under reduced motion
// the bar is left exactly as the markup drew it.
if (ledgerEl && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
  if ('IntersectionObserver' in window) {
    ledgerEl.classList.add('is-armed');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        ledgerEl.classList.add('is-revealed');
        observer.disconnect();
      });
    }, { threshold: 0.45 });
    observer.observe(ledgerEl);
  }
}
