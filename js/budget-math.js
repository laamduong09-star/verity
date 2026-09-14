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

// Take a fixed dollar amount off the top before splitting the rest.
// $150 to a household does not shrink when a shift gets cut, so it is
// subtracted first rather than treated as a fourth percentage — the
// asymmetry that creates (home's share of the paycheck rises as the
// paycheck falls) is the point, not a bug.
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

if (typeof module !== 'undefined') {
  module.exports = { splitPaycheck, toMonthly, splitAfterHome };
}
