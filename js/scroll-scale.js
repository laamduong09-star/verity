// Pure math for the app-window scroll-scale effect — no DOM access.
// Loaded as a plain script in the browser (computeScrollScale becomes a
// global used by js/landing.js) and required directly by the node:test
// suite, hence the exports guard.
//
// Linear interpolation from MIN_SCALE at scrollY=0 to MAX_SCALE at
// scrollY=DISTANCE, clamped outside that range. MIN_SCALE was originally
// 0.83, measured from the scale-in effect on amplemarket.com's hero
// product shot; it was raised to 0.90 on 2026-07-18 (user-directed) so
// the mockup reads larger before any scrolling (see
// docs/superpowers/specs/2026-07-12-app-window-scroll-scale-design.md).
const MIN_SCALE = 0.9;
const MAX_SCALE = 1.0;
const SCROLL_DISTANCE = 500;

function computeScrollScale(scrollY) {
  const progress = Math.min(Math.max(scrollY / SCROLL_DISTANCE, 0), 1);
  return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
}

if (typeof module !== 'undefined') {
  module.exports = { computeScrollScale };
}
