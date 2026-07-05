// Paycheck splitter: three sliders divide a paycheck between family,
// future (saving/investing), and present (spending). Amounts update live;
// if the three don't add to 100%, a note says where the rest sits —
// calm information, not an error, unless it's over 100%.

(function () {
  'use strict';

  var pay = document.getElementById('splitPay');
  var ranges = {
    family: document.getElementById('rangeFamily'),
    future: document.getElementById('rangeFuture'),
    present: document.getElementById('rangePresent'),
  };
  var pcts = {
    family: document.getElementById('pctFamily'),
    future: document.getElementById('pctFuture'),
    present: document.getElementById('pctPresent'),
  };
  var amounts = {
    family: document.getElementById('amtFamily'),
    future: document.getElementById('amtFuture'),
    present: document.getElementById('amtPresent'),
  };
  var note = document.getElementById('splitNote');
  var noteUnder = document.getElementById('splitNoteUnder');
  var noteOver = document.getElementById('splitNoteOver');
  if (!pay) return;

  function currency(amount) {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  }

  function update() {
    var paycheck = Math.max(0, parseFloat(pay.value) || 0);
    var total = 0;

    ['family', 'future', 'present'].forEach(function (key) {
      var pct = parseInt(ranges[key].value, 10) || 0;
      total += pct;
      pcts[key].textContent = pct + '%';
      amounts[key].textContent = currency(paycheck * pct / 100);
    });

    var over = total > 100;
    var leftover = Math.abs(100 - total);
    note.classList.toggle('is-active', total !== 100);
    note.classList.toggle('is-over', over);
    noteUnder.hidden = over;
    noteOver.hidden = !over;
    note.querySelectorAll('.split-leftover-pct').forEach(function (el) {
      el.textContent = leftover + '%';
    });
    note.querySelectorAll('.split-leftover-amt').forEach(function (el) {
      el.textContent = currency(paycheck * leftover / 100);
    });
  }

  pay.addEventListener('input', update);
  Object.keys(ranges).forEach(function (key) {
    ranges[key].addEventListener('input', update);
  });

  update();
})();
