// Module accordion on the landing page: one panel open at a time,
// clicking an open header closes it. Height animates via the CSS
// grid-rows 0fr -> 1fr transition (no measured max-heights to go stale).

(function () {
  'use strict';

  var heads = document.querySelectorAll('.acc-head');
  if (!heads.length) return;

  heads.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var wasOpen = item.classList.contains('is-open');

      document.querySelectorAll('.acc-item.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
        openItem.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- App-window scroll-scale ---------- */
  // Mirrors amplemarket.com's hero product-shot behavior: the mockup
  // starts slightly smaller and scales up to full size as the user
  // scrolls through the first 500px (see computeScrollScale in
  // js/scroll-scale.js), reversible in both directions. Skipped entirely
  // under prefers-reduced-motion, leaving the CSS default (--scroll-scale
  // unset -> scale(1), full size) permanently in place.
  var appWindow = document.querySelector('.app-window');
  var prefersReducedMotionScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (appWindow && !prefersReducedMotionScroll) {
    var scaleTicking = false;

    var applyScrollScale = function () {
      appWindow.style.setProperty('--scroll-scale', computeScrollScale(window.scrollY));
      scaleTicking = false;
    };

    var onScrollScale = function () {
      if (!scaleTicking) {
        scaleTicking = true;
        requestAnimationFrame(applyScrollScale);
      }
    };

    window.addEventListener('scroll', onScrollScale, { passive: true });
    applyScrollScale();
  }
})();
