// Live filter for the jargon glossary. Matching is diacritic-insensitive
// so "lai suat" finds "lãi suất" — typing Vietnamese without tone marks
// (the common case on English keyboards) still works.

(function () {
  'use strict';

  var input = document.getElementById('jargonSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.term-card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.jargon-group'));
  var empty = document.getElementById('jargonEmpty');
  if (!input) return;

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd');
  }

  // Each card matches against ALL its text (both languages), so the search
  // works no matter which language is currently toggled visible.
  var haystacks = cards.map(function (card) {
    return normalize(card.textContent);
  });

  input.addEventListener('input', function () {
    var query = normalize(input.value.trim());
    var anyVisible = false;

    cards.forEach(function (card, i) {
      var hit = !query || haystacks[i].indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !hit);
      if (hit) anyVisible = true;
    });

    groups.forEach(function (group) {
      var hasVisible = group.querySelector('.term-card:not(.is-hidden)');
      group.style.display = hasVisible ? '' : 'none';
    });

    empty.classList.toggle('is-visible', !anyVisible);
  });
})();
