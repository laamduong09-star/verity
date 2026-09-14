const test = require('node:test');
const assert = require('node:assert/strict');
const { amortize, standardTierYears, salaryCheck } = require('../js/tuition-math.js');

test('amortizes a federal-rate loan to the standard monthly payment', () => {
  // $27,000 at 6.52% over 15 years. Worked by hand from
  // P*r / (1 - (1+r)^-n) with r = 0.0652/12, n = 180.
  const r = amortize(27000, 6.52, 15);
  assert.ok(Math.abs(r.monthly - 235.50) < 0.01, `monthly was ${r.monthly}`);
  assert.equal(r.months, 180);
  assert.ok(Math.abs(r.totalRepaid - r.monthly * 180) < 1e-9);
  assert.ok(Math.abs(r.totalInterest - (r.totalRepaid - 27000)) < 1e-9);
});

test('interest is the whole cost of borrowing, never negative', () => {
  const r = amortize(20000, 6.52, 10);
  assert.ok(r.totalInterest > 0);
  assert.ok(r.totalRepaid > 20000);
});

test('a longer term lowers the payment and raises the total interest', () => {
  const short = amortize(40000, 6.52, 10);
  const long = amortize(40000, 6.52, 20);
  assert.ok(long.monthly < short.monthly);
  assert.ok(long.totalInterest > short.totalInterest);
});

test('0% interest divides evenly instead of dividing by zero', () => {
  const r = amortize(12000, 0, 10);
  assert.equal(r.monthly, 100);
  assert.equal(r.totalInterest, 0);
  assert.equal(r.totalRepaid, 12000);
});

test('nothing borrowed and no term return zeros, not NaN', () => {
  assert.deepEqual(amortize(0, 6.52, 10), { monthly: 0, totalRepaid: 0, totalInterest: 0, months: 120 });
  assert.deepEqual(amortize(-500, 6.52, 10), { monthly: 0, totalRepaid: 0, totalInterest: 0, months: 120 });
  assert.deepEqual(amortize(10000, 6.52, 0), { monthly: 0, totalRepaid: 0, totalInterest: 0, months: 0 });
});

test('standard tier terms follow the balance, with $25,000 in the 15-year tier', () => {
  assert.equal(standardTierYears(0), 10);
  assert.equal(standardTierYears(24999), 10);
  assert.equal(standardTierYears(25000), 15);
  assert.equal(standardTierYears(49999), 15);
  assert.equal(standardTierYears(50000), 20);
  assert.equal(standardTierYears(99999), 20);
  assert.equal(standardTierYears(100000), 25);
  assert.equal(standardTierYears(500000), 25);
});

test('a negative balance still lands in the lowest tier', () => {
  assert.equal(standardTierYears(-1), 10);
});

test('salary check compares borrowing to one year of pay and payment to gross monthly', () => {
  const r = salaryCheck(31000, 300, 62000);
  assert.equal(r.borrowedVsSalary, 0.5);
  assert.ok(Math.abs(r.paymentShareOfGross - 300 / (62000 / 12)) < 1e-12);
});

test('salary check returns null without a salary to compare against', () => {
  assert.equal(salaryCheck(31000, 300, 0), null);
  assert.equal(salaryCheck(31000, 300, NaN), null);
});
