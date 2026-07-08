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

  showAllBtn.addEventListener('click', function () {
    allShown = true;
    showAllBtn.setAttribute('aria-expanded', 'true');
    render();
  });

  /* ---------- Suggestion dropdown ---------- */
  // Adapted from the reference "action search bar" component (React/
  // framer-motion) to this stack: focusing the input drops down a panel
  // of term suggestions — group glyph, English name, Vietnamese name,
  // group tag — filtered live, opened with click/Enter, dismissed with
  // Esc/blur. Rows are cloned from the real cards and group headers, so
  // the language toggle keeps working inside the panel for free.

  var suggestPanel = document.getElementById('jargonSuggest');
  var suggestList = document.getElementById('jargonSuggestList');

  var MAX_SUGGESTIONS = 7;
  // What an empty search suggests: the terms people actually arrive
  // hunting for (any name that no longer exists is skipped harmlessly).
  var STARTERS = ['Credit score', 'APR', 'HYSA', 'Compound interest', 'Budget', 'Roth IRA', 'Overdraft'];

  var entries = cards.map(function (card) {
    var group = card.closest('.jargon-group');
    var viNameEl = card.querySelector('.term-vi-name');
    return {
      card: card,
      name: card.querySelector('.term-name').textContent,
      viName: viNameEl ? viNameEl.textContent : '',
      glyph: group.querySelector('.group-glyph svg'),
      groupTitle: group.querySelector('.jargon-group-title')
    };
  });
  var nameHaystacks = entries.map(function (entry) {
    return normalize(entry.name + ' ' + entry.viName);
  });

  var activeIndex = -1;
  var shownEntries = [];

  function matchEntries(query) {
    if (!query) {
      return STARTERS.map(function (name) {
        return entries.filter(function (entry) { return entry.name === name; })[0];
      }).filter(Boolean);
    }
    return entries.filter(function (entry, i) {
      return nameHaystacks[i].indexOf(query) !== -1;
    }).slice(0, MAX_SUGGESTIONS);
  }

  function setActive(index) {
    activeIndex = index;
    Array.prototype.forEach.call(suggestList.children, function (li, i) {
      var isActive = i === index;
      li.classList.toggle('is-active', isActive);
      li.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function selectEntry(entry) {
    input.value = entry.name;
    render();
    closeSuggest();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    entry.card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  function renderSuggest() {
    shownEntries = matchEntries(normalize(input.value.trim()));
    suggestList.innerHTML = '';
    activeIndex = -1;

    shownEntries.forEach(function (entry) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'suggest-item';

      var glyph = document.createElement('span');
      glyph.className = 'suggest-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      if (entry.glyph) glyph.appendChild(entry.glyph.cloneNode(true));

      var names = document.createElement('span');
      names.className = 'suggest-names';
      var name = document.createElement('span');
      name.className = 'suggest-name';
      name.textContent = entry.name;
      var viName = document.createElement('span');
      viName.className = 'suggest-vi';
      viName.textContent = entry.viName;
      names.appendChild(name);
      names.appendChild(viName);

      var tag = document.createElement('span');
      tag.className = 'suggest-group';
      // Clone the group title's .en/.vi spans so the global language
      // toggle switches the tag with everything else.
      Array.prototype.forEach.call(entry.groupTitle.children, function (span) {
        tag.appendChild(span.cloneNode(true));
      });

      btn.appendChild(glyph);
      btn.appendChild(names);
      btn.appendChild(tag);
      // pointerdown fires before the input's blur, so selection wins the
      // race against the close-on-blur timer; preventDefault keeps focus
      // in the input.
      btn.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        selectEntry(entry);
      });

      li.appendChild(btn);
      suggestList.appendChild(li);
    });

    if (!shownEntries.length) closeSuggest();
  }

  function openSuggest() {
    renderSuggest();
    if (!shownEntries.length) return;
    suggestPanel.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function closeSuggest() {
    suggestPanel.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  input.addEventListener('focus', openSuggest);

  input.addEventListener('blur', function () {
    // Small delay so a pointerdown selection isn't cut off mid-click.
    setTimeout(closeSuggest, 120);
  });

  input.addEventListener('input', function () {
    render();
    openSuggest();
  });

  input.addEventListener('keydown', function (event) {
    var isOpen = suggestPanel.classList.contains('is-open');
    if (event.key === 'Escape') {
      closeSuggest();
      return;
    }
    if (!isOpen || !shownEntries.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((activeIndex + 1) % shownEntries.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((activeIndex - 1 + shownEntries.length) % shownEntries.length);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectEntry(shownEntries[activeIndex]);
    }
  });

  render();
})();
