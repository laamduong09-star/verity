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
