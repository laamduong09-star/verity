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
