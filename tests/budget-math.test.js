const test = require('node:test');
const assert = require('node:assert/strict');
const { splitPaycheck, toMonthly, splitAfterHome } = require('../js/budget-math.js');

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
  assert.equal(r.enteredSum, 0);
});

test('negative amount is treated as zero', () => {
  const r = splitPaycheck(-50, 50, 30, 20);
  assert.equal(r.needs, 0);
  assert.equal(r.wants, 0);
  assert.equal(r.savings, 0);
});

test('toMonthly converts each pay period and rounds to whole dollars', () => {
  assert.equal(toMonthly(100, 'week'), 433);
  assert.equal(toMonthly(100, 'biweek'), 217);
  assert.equal(toMonthly(100, 'month'), 100);
  assert.equal(toMonthly(40.4, 'month'), 40);
});

test('$500 with $150 home splits the remaining $350 into 175/105/70', () => {
  const r = splitAfterHome(500, 150, 50, 30, 20);
  assert.equal(r.home, 150);
  assert.equal(r.remainder, 350);
  assert.equal(r.needs, 175);
  assert.equal(r.wants, 105);
  assert.equal(r.savings, 70);
  assert.equal(r.covered, true);
});

test('home larger than the paycheck caps at the paycheck; buckets zero; covered is false', () => {
  const r = splitAfterHome(500, 600, 50, 30, 20);
  assert.equal(r.home, 500);
  assert.equal(r.remainder, 0);
  assert.equal(r.needs, 0);
  assert.equal(r.wants, 0);
  assert.equal(r.savings, 0);
  assert.equal(r.covered, false);
});

test('negative home is treated as zero', () => {
  const r = splitAfterHome(500, -150, 50, 30, 20);
  assert.equal(r.home, 0);
  assert.equal(r.remainder, 500);
  assert.equal(r.covered, true);
});

test('home: 0 returns the same buckets as splitPaycheck on the full amount', () => {
  const withHome = splitAfterHome(500, 0, 50, 30, 20);
  const plain = splitPaycheck(500, 50, 30, 20);
  assert.equal(withHome.needs, plain.needs);
  assert.equal(withHome.wants, plain.wants);
  assert.equal(withHome.savings, plain.savings);
  assert.equal(withHome.home, 0);
  assert.equal(withHome.remainder, 500);
});

test('home + remainder === amount for a non-round case', () => {
  const r = splitAfterHome(837, 150, 55, 25, 20);
  assert.ok(Math.abs(r.home + r.remainder - 837) < 1e-9);
});

test('homeShare rises as income falls with home fixed', () => {
  const at500 = splitAfterHome(500, 150, 50, 30, 20);
  const at300 = splitAfterHome(300, 150, 50, 30, 20);
  assert.ok(Math.abs(at500.homeShare - 0.3) < 1e-9);
  assert.ok(Math.abs(at300.homeShare - 0.5) < 1e-9);
});
