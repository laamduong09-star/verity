// The score rail: maps how far you've read into credit.html onto the
// 300–850 score scale, so the rail's fill, its readout, and the compact
// bar under the nav all track the climb.
//
// Split the same way as js/scroll-scale.js and js/budget-math.js — the
// pure functions below carry all the arithmetic and are exported for
// node:test (tests/credit-rail.test.js); the DOM wiring underneath
// touches the page and is never unit-tested.

(function () {
  'use strict';

  var SCORE_MIN = 300;
  var SCORE_MAX = 850;
  var SCORE_SPAN = SCORE_MAX - SCORE_MIN;

  function clamp01(n) {
    if (!isFinite(n)) return 0;
    return Math.min(1, Math.max(0, n));
  }

  // How far the reader is through the tracked region, 0..1. Once the
  // region is shorter than the viewport there's nothing to scroll
  // through, so it reads as "at the top" until you pass it entirely.
  function railProgress(scrollY, railTop, railHeight, viewportHeight) {
    var scrollable = railHeight - viewportHeight;
    if (scrollable <= 0) return scrollY >= railTop ? 1 : 0;
    return clamp01((scrollY - railTop) / scrollable);
  }

  function scoreAtProgress(p) {
    return Math.round(SCORE_MIN + clamp01(p) * SCORE_SPAN);
  }

  // The bands people actually quote, from the published FICO ranges.
  function bandFor(score) {
    if (score < 580) return 'building';
    if (score < 670) return 'fair';
    if (score < 740) return 'good';
    return 'best';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      railProgress: railProgress,
      scoreAtProgress: scoreAtProgress,
      bandFor: bandFor,
    };
  }

  if (typeof document === 'undefined') return;

  function init() {
    var scope = document.getElementById('creditRailScope');
    var rail = document.getElementById('creditRail');
    var bar = document.getElementById('creditRailBar');
    var scoreEl = document.getElementById('creditRailScore');
    var barScoreEl = document.getElementById('creditRailBarScore');
    if (!scope) return;

    var dots = [].slice.call(scope.querySelectorAll('.cr-dot'));
    var frame = 0;
    var lastBand = '';

    // Each dot sits where its section comes into view, on the same
    // scale as the fill — so a dot passing under the head means "this
    // is the section you're in", not a decorative notch.
    function placeDots() {
      var box = scope.getBoundingClientRect();
      var top = box.top + window.scrollY;
      var scrollable = box.height - window.innerHeight;
      dots.forEach(function (dot) {
        var target = document.getElementById(dot.getAttribute('data-anchor') || '');
        if (!target) return;
        var at = 0;
        if (scrollable > 0) {
          var targetTop = target.getBoundingClientRect().top + window.scrollY;
          at = clamp01((targetTop - top) / scrollable);
        }
        dot.style.setProperty('--at', (at * 100) + '%');
      });
    }

    function apply() {
      frame = 0;

      var box = scope.getBoundingClientRect();
      var p = railProgress(window.scrollY, box.top + window.scrollY, box.height, window.innerHeight);
      var score = scoreAtProgress(p);

      if (rail) rail.style.setProperty('--cr-rail-progress', String(p));
      if (bar) bar.style.setProperty('--cr-rail-progress', String(p));
      if (scoreEl) scoreEl.textContent = String(score);
      if (barScoreEl) barScoreEl.textContent = String(score);

      // data-band drives which label CSS reveals — no string is ever
      // built in JS, so the .en/.vi toggle keeps full control.
      var band = bandFor(score);
      if (band !== lastBand) {
        lastBand = band;
        if (rail) rail.setAttribute('data-band', band);
      }
    }

    // Coalesce to one update per frame by replacing the pending frame
    // rather than guarding with a boolean. A boolean latches: browsers
    // suspend rAF while the tab is hidden, so a scroll that happens on
    // the way out would set the flag, never get its callback, and wedge
    // the rail for the rest of the page's life. Cancel-and-requeue has
    // no flag to get stuck.
    function onScroll() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    }

    function onResize() {
      placeDots();
      onScroll();
    }

    // Coming back to a hidden tab, no scroll event fires for the
    // distance that was travelled before leaving, so catch up on the
    // way in.
    function onVisibility() {
      if (document.visibilityState !== 'visible') return;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      apply();
    }

    placeDots();
    apply();

    // Under reduced motion the fill, readout and compact bar are all
    // hidden (see credit.css), so there is nothing left to keep in sync
    // and no reason to hold a scroll listener open.
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
