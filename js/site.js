// Shared site behaviors, loaded on every page BEFORE any page-specific
// script: language toggle (persisted across pages via localStorage),
// the custom cursor, and the scroll-compacting topbar.
//
// Pages that need to react to a language flip (e.g. the calculator's
// Chart.js labels) listen for the 'verity:langchange' event on document
// instead of binding their own click handler to the toggle.

(function () {
  'use strict';

  /* ---------- Language ---------- */
  var langToggle = document.getElementById('langToggle');

  function isVi() {
    return document.body.classList.contains('lang-vi-primary');
  }

  function applyLang(vi) {
    document.body.classList.toggle('lang-vi-primary', vi);
    document.documentElement.setAttribute('lang', vi ? 'vi' : 'en');
    if (langToggle) {
      langToggle.querySelectorAll('.lang-option').forEach(function (el) {
        el.classList.toggle('active', (el.dataset.lang === 'vi') === vi);
      });
    }
  }

  var saved = null;
  try { saved = localStorage.getItem('verity-lang'); } catch (e) { /* private mode */ }
  if (saved === 'vi') applyLang(true);

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      var vi = !isVi();
      applyLang(vi);
      try { localStorage.setItem('verity-lang', vi ? 'vi' : 'en'); } catch (e) { /* ignore */ }
      document.dispatchEvent(new CustomEvent('verity:langchange'));
    });
  }

  /* ---------- Scroll-compacting topbar ---------- */
  // Two thresholds (enter at 56px, exit at 8px) so the bar doesn't
  // flicker between states when the user rests right at the boundary.
  var topbar = document.querySelector('.topbar');
  if (topbar) {
    var compact = false;
    var ENTER_AT = 56;
    var EXIT_AT = 8;

    var onScroll = function () {
      var y = window.scrollY;
      var next = compact ? y > EXIT_AT : y > ENTER_AT;
      if (next !== compact) {
        compact = next;
        topbar.classList.toggle('is-compact', compact);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Custom cursor ---------- */
  // A dot that tracks the pointer closely and a ring that trails slightly
  // looser (lerp-smoothed), expanding over clickable elements. The CSS
  // only activates it for fine pointers; guard here too so pages without
  // the cursor elements don't error.
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing) {
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var ringPos = { x: mouse.x, y: mouse.y };

    var lerp = function (start, end, factor) {
      return start + (end - start) * factor;
    };

    document.addEventListener('mousemove', function (event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      cursorDot.classList.add('active');
      cursorRing.classList.add('active');
    });

    document.addEventListener('mouseleave', function () {
      cursorDot.classList.remove('active');
      cursorRing.classList.remove('active');
    });

    document.querySelectorAll('a, button, input, .card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorRing.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { cursorRing.classList.remove('hovering'); });
    });

    // .cursor-ring is sized at its largest (hovering) state in CSS; resting
    // size is a scale-down of that, so the hover "grow" only ever animates
    // transform. The scale is lerped here in JS (not via a CSS transition)
    // since a CSS transition on `transform` would also catch the position
    // translate rewritten every frame, doubling up and feeling sluggish.
    var RING_REST_SCALE = 0.75;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ringScale = RING_REST_SCALE;

    var animateCursor = function () {
      cursorDot.style.transform = 'translate(' + mouse.x + 'px, ' + mouse.y + 'px) translate(-50%, -50%)';

      var targetScale = cursorRing.classList.contains('hovering') ? 1 : RING_REST_SCALE;

      // With reduced motion, snap the ring straight to the pointer/size
      // instead of lerp-trailing behind it — the lag is the visible motion.
      if (prefersReducedMotion) {
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        ringScale = targetScale;
      } else {
        ringPos.x = lerp(ringPos.x, mouse.x, 0.2);
        ringPos.y = lerp(ringPos.y, mouse.y, 0.2);
        ringScale = lerp(ringScale, targetScale, 0.2);
      }
      cursorRing.style.transform = 'translate(' + ringPos.x + 'px, ' + ringPos.y + 'px) translate(-50%, -50%) scale(' + ringScale + ')';

      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }
})();
