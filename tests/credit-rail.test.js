const test = require('node:test');
const assert = require('node:assert');

const { railProgress, scoreAtProgress, bandFor } = require('../js/credit-rail.js');

test('railProgress: 0 at the top of the tracked region', () => {
  assert.strictEqual(railProgress(0, 0, 4000, 800), 0);
});

test('railProgress: 1 at the bottom of the tracked region', () => {
  // scrollable = 4000 - 800 = 3200
  assert.strictEqual(railProgress(3200, 0, 4000, 800), 1);
});

test('railProgress: halfway is 0.5', () => {
  assert.strictEqual(railProgress(1600, 0, 4000, 800), 0.5);
});

test('railProgress: clamps below 0 when scrolled above the region', () => {
  assert.strictEqual(railProgress(-500, 200, 4000, 800), 0);
});

test('railProgress: clamps above 1 when scrolled past the region', () => {
  assert.strictEqual(railProgress(99999, 0, 4000, 800), 1);
});

test('railProgress: region shorter than the viewport does not divide by zero', () => {
  assert.strictEqual(railProgress(0, 500, 400, 800), 0);
  assert.strictEqual(railProgress(600, 500, 400, 800), 1);
});

test('railProgress: offset region accounts for its own top', () => {
  // region starts 1000px down, 4000 tall, 800 viewport -> 3200 scrollable
  assert.strictEqual(railProgress(1000, 1000, 4000, 800), 0);
  assert.strictEqual(railProgress(2600, 1000, 4000, 800), 0.5);
  assert.strictEqual(railProgress(4200, 1000, 4000, 800), 1);
});

test('scoreAtProgress: endpoints are exactly 300 and 850', () => {
  assert.strictEqual(scoreAtProgress(0), 300);
  assert.strictEqual(scoreAtProgress(1), 850);
});

test('scoreAtProgress: midpoint is 575', () => {
  assert.strictEqual(scoreAtProgress(0.5), 575);
});

test('scoreAtProgress: clamps out-of-range input', () => {
  assert.strictEqual(scoreAtProgress(-3), 300);
  assert.strictEqual(scoreAtProgress(9), 850);
});

test('scoreAtProgress: always returns an integer', () => {
  for (const p of [0.13, 0.271, 0.3333, 0.6789, 0.91]) {
    assert.strictEqual(Number.isInteger(scoreAtProgress(p)), true);
  }
});

test('bandFor: exact boundaries fall on the right side', () => {
  assert.strictEqual(bandFor(300), 'building');
  assert.strictEqual(bandFor(579), 'building');
  assert.strictEqual(bandFor(580), 'fair');
  assert.strictEqual(bandFor(669), 'fair');
  assert.strictEqual(bandFor(670), 'good');
  assert.strictEqual(bandFor(739), 'good');
  assert.strictEqual(bandFor(740), 'best');
  assert.strictEqual(bandFor(850), 'best');
});

test('bandFor: every score on the scale maps to a known band', () => {
  const known = new Set(['building', 'fair', 'good', 'best']);
  for (let s = 300; s <= 850; s++) {
    assert.strictEqual(known.has(bandFor(s)), true, `no band for ${s}`);
  }
});
