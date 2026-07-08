// Live filter for the jargon glossary. Matching is diacritic-insensitive
// so "lai suat" finds "lãi suất" — typing Vietnamese without tone marks
// (the common case on English keyboards) still works.
//
// The full term list is hidden on page load — 44 cards at once reads as
// intimidating, and the search bar is meant to be the page's main tool.
// Cards appear either by matching a search or via the one-way "show all
// terms" button below the search bar.

(function () {
  'use strict';

  var input = document.getElementById('jargonSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.term-card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.jargon-group'));
  var empty = document.getElementById('jargonEmpty');
  var revealWrap = document.getElementById('jargonRevealWrap');
  var showAllBtn = document.getElementById('showAllTerms');
  if (!input) return;

  var allShown = false;

  // The button says how many terms it's hiding; counted live so the
  // number can't drift as cards get added.
  Array.prototype.forEach.call(document.querySelectorAll('.term-count'), function (el) {
    el.textContent = cards.length;
  });

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

  function render() {
    var query = normalize(input.value.trim());
    var searching = query.length > 0;
    var anyVisible = false;

    cards.forEach(function (card, i) {
      // While searching, matches win regardless of the reveal state;
      // at rest, everything follows the show-all toggle.
      var hit = searching ? haystacks[i].indexOf(query) !== -1 : allShown;
      card.classList.toggle('is-hidden', !hit);
      if (hit) anyVisible = true;
    });

    groups.forEach(function (group) {
      var hasVisible = group.querySelector('.term-card:not(.is-hidden)');
      group.style.display = hasVisible ? '' : 'none';
    });

    // The "no match" note only makes sense mid-search — the collapsed
    // rest state shows the reveal button instead.
    empty.classList.toggle('is-visible', searching && !anyVisible);
    revealWrap.style.display = searching || allShown ? 'none' : '';
  }

  input.addEventListener('input', render);

  showAllBtn.addEventListener('click', function () {
    allShown = true;
    showAllBtn.setAttribute('aria-expanded', 'true');
    render();
  });

  render();
})();
