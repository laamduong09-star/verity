const test = require('node:test');
const assert = require('node:assert/strict');
const { computeScrollScale } = require('../js/scroll-scale.js');

test('scrollY 0 gives the minimum scale', () => {
  assert.equal(computeScrollScale(0), 0.9);
});

test('scrollY 500 gives the maximum scale', () => {
  assert.equal(computeScrollScale(500), 1);
});

test('scrollY beyond 500 stays clamped at the maximum', () => {
  assert.equal(computeScrollScale(1200), 1);
});

test('negative scrollY stays clamped at the minimum', () => {
  assert.equal(computeScrollScale(-80), 0.9);
});

test('scrollY 250 (halfway) gives the midpoint scale', () => {
  assert.ok(Math.abs(computeScrollScale(250) - 0.95) < 1e-9);
});
