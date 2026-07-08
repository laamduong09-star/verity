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
})();

// Flowing-paths hero backdrop. Two mirrored families of 24 near-parallel
// bezier curves (the curve formula is from the reference "Background
// Paths" component, adapted to Verity's stack: plain SVG, no framer-
// motion, blue instead of slate, animation driven by CSS in style.css).
// Built in JS rather than 48 lines of hand-written SVG markup, and only
// when the container is present, so it stays landing-page-only.
(function () {
  'use strict';

  var container = document.querySelector('.hero-paths');
  if (!container) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var PER_SIDE = 24;

  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 696 316');
  svg.setAttribute('fill', 'none');

  [1, -1].forEach(function (position) {
    for (var i = 0; i < PER_SIDE; i++) {
      var d =
        'M-' + (380 - i * 5 * position) + ' -' + (189 + i * 6) +
        'C-' + (380 - i * 5 * position) + ' -' + (189 + i * 6) +
        ' -' + (312 - i * 5 * position) + ' ' + (216 - i * 6) +
        ' ' + (152 - i * 5 * position) + ' ' + (343 - i * 6) +
        'C' + (616 - i * 5 * position) + ' ' + (470 - i * 6) +
        ' ' + (684 - i * 5 * position) + ' ' + (875 - i * 6) +
        ' ' + (684 - i * 5 * position) + ' ' + (875 - i * 6);

      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', (0.6 + i * 0.045).toFixed(2));
      // Normalize length so the CSS dash pattern reads uniformly, and pin
      // stroke width through the viewBox scale so lines stay hairline-thin.
      path.setAttribute('pathLength', '1');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      // Base opacity ramps with i (0.10 -> 0.51); duration cycles 20-30s;
      // negative delays desync the flow so it never pulses in unison.
      path.style.setProperty('--o', (0.10 + i * 0.018).toFixed(3));
      path.style.setProperty('--dur', (20 + (i % 6) * 2) + 's');
      path.style.setProperty('--delay', -(i * 1.3).toFixed(2) + 's');
      svg.appendChild(path);
    }
  });

  container.appendChild(svg);
})();
