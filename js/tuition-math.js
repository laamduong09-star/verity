// Pure loan math for the Tuition module — no DOM access. Loaded as a plain
// script in the browser (the functions become globals used by js/tuition.js)
// and required directly by the node:test suite, hence the exports guard.

// Standard amortization. `annualRatePercent` is a percent (6.52, not 0.0652).
//
// A 0% rate has to be handled separately: the usual formula divides by
// (1 - (1 + r) ** -n), which is 0 when r is 0. A non-positive principal or
// term returns zeros rather than NaN, because both are reachable while
// someone is mid-typing in the input.
function amortize(principal, annualRatePercent, years) {
  const months = Math.round(years * 12);
  const p = Math.max(0, principal);

  if (p === 0 || months <= 0) {
    return { monthly: 0, totalRepaid: 0, totalInterest: 0, months: Math.max(0, months) };
  }

  const r = annualRatePercent / 100 / 12;
  const monthly = r === 0 ? p / months : (p * r) / (1 - Math.pow(1 + r, -months));
  const totalRepaid = monthly * months;

  return { monthly, totalRepaid, totalInterest: totalRepaid - p, months };
}

// The tiered Standard plan that replaced the flat 10-year plan for loans
// first disbursed on or after July 1, 2026: the term is set by what you
// owe when repayment starts, not chosen. Boundaries are inclusive at the
// bottom of each tier — exactly $25,000 is a 15-year term, not a 10.
const STANDARD_TIERS = [
  { under: 25000, years: 10 },
  { under: 50000, years: 15 },
  { under: 100000, years: 20 },
  { under: Infinity, years: 25 },
];

function standardTierYears(balance) {
  const b = Math.max(0, balance);
  return STANDARD_TIERS.find((tier) => b < tier.under).years;
}

// Two rule-of-thumb ratios, both deliberately against GROSS pay: estimating
// take-home would mean inventing a tax rate, and a made-up number is worse
// here than an honestly-labelled one. Returns null when there's no salary
// to compare against, so the caller can hide the line instead of printing
// a division by zero.
function salaryCheck(totalBorrowed, monthlyPayment, annualSalary) {
  if (!(annualSalary > 0)) return null;
  return {
    borrowedVsSalary: totalBorrowed / annualSalary,
    paymentShareOfGross: monthlyPayment / (annualSalary / 12),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { amortize, standardTierYears, salaryCheck, STANDARD_TIERS };
}
