const initialInput = document.getElementById('initial');
const monthlyInput = document.getElementById('monthly');
const rateInput = document.getElementById('rate');
const yearsInput = document.getElementById('years');
const finalBalanceEl = document.getElementById('finalBalance');
const statContributedEl = document.getElementById('statContributed');
const statInterestEl = document.getElementById('statInterest');
const statMultiplierEl = document.getElementById('statMultiplier');
const breakdownBodyEl = document.getElementById('breakdownBody');

function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

// Compound interest with regular monthly contributions, compounded monthly.
// Returns one row per year: balance, total contributed so far, and the
// interest earned so far (balance minus what was actually put in).
function projectGrowth(initial, monthlyContribution, annualRatePercent, years) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = years * 12;

  let balance = initial;
  let contributed = initial;
  const rows = [{ year: 0, balance, contributed, interest: 0 }];

  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;
    if (month % 12 === 0) {
      rows.push({ year: month / 12, balance, contributed, interest: balance - contributed });
    }
  }
  return rows;
}

const ctx = document.getElementById('growthChart');
let chartRows = [];

// Stacked-area chart: "Total interest" stacks on top of "Total principal" so
// the top edge traces the total balance, while the tooltip still reports
// each layer's raw (non-cumulative) value as a breakdown.
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Total principal',
        data: [],
        borderColor: '#2348ad',
        backgroundColor: 'rgba(35, 72, 173, 0.18)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#2348ad',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: 'origin',
        tension: 0.15,
      },
      {
        label: 'Total interest',
        data: [],
        borderColor: '#0e7a72',
        backgroundColor: 'rgba(14, 122, 114, 0.18)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#0e7a72',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: '-1',
        tension: 0.15,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Year ${chartRows[items[0].dataIndex]?.year ?? ''}`,
          beforeBody: (items) => {
            const row = chartRows[items[0].dataIndex];
            return row ? `Total balance   ${formatCurrency(row.balance)}` : '';
          },
          label: (item) => ` ${item.dataset.label}   ${formatCurrency(item.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5d5f68', font: { family: 'Inter', size: 12 } },
      },
      y: {
        stacked: true,
        grid: { color: '#d5d3cd' },
        ticks: {
          color: '#5d5f68',
          font: { family: 'Inter', size: 12 },
          callback: (value) => formatCurrency(value),
        },
      },
    },
  },
});

function popValue(el) {
  el.classList.remove('pop');
  // Restart the pop animation on every update (re-adding the class after a
  // reflow lets the @keyframes replay instead of being a no-op).
  void el.offsetWidth;
  el.classList.add('pop');
}

function update() {
  const initial = parseFloat(initialInput.value) || 0;
  const monthly = parseFloat(monthlyInput.value) || 0;
  const rate = parseFloat(rateInput.value) || 0;
  const years = parseInt(yearsInput.value, 10) || 0;

  const rows = projectGrowth(initial, monthly, rate, years);
  const final = rows[rows.length - 1];

  chartRows = rows;
  chart.data.labels = rows.map((row) => `Year ${row.year}`);
  chart.data.datasets[0].data = rows.map((row) => row.contributed);
  chart.data.datasets[1].data = rows.map((row) => row.interest);
  chart.update();

  finalBalanceEl.textContent = formatCurrency(final.balance);
  popValue(finalBalanceEl);

  statContributedEl.textContent = formatCurrency(final.contributed);
  statInterestEl.textContent = formatCurrency(final.interest);
  statMultiplierEl.textContent = `${(final.balance / final.contributed || 0).toFixed(2)}×`;
  popValue(statContributedEl);
  popValue(statInterestEl);
  popValue(statMultiplierEl);

  breakdownBodyEl.innerHTML = rows
    .filter((row) => row.year > 0)
    .map((row) => `
      <tr>
        <td>${row.year}</td>
        <td>${formatCurrency(row.contributed)}</td>
        <td>${formatCurrency(row.interest)}</td>
        <td>${formatCurrency(row.balance)}</td>
      </tr>
    `)
    .join('');
}

[initialInput, monthlyInput, rateInput, yearsInput].forEach((input) => {
  input.addEventListener('input', update);
});

update();

// Custom cursor: a dot that tracks the pointer closely and a ring that
// trails slightly looser (lerp-smoothed), expanding over clickable elements.
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const ringPos = { x: mouse.x, y: mouse.y };

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

document.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  cursorDot.classList.add('active');
  cursorRing.classList.add('active');
});

document.addEventListener('mouseleave', () => {
  cursorDot.classList.remove('active');
  cursorRing.classList.remove('active');
});

document.querySelectorAll('a, button, input, .card').forEach((el) => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

function animateCursor() {
  cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;

  ringPos.x = lerp(ringPos.x, mouse.x, 0.2);
  ringPos.y = lerp(ringPos.y, mouse.y, 0.2);
  cursorRing.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Info modal: explains compound interest, respects whatever language is
// currently toggled since it reuses the same .en/.vi spans.
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const infoModalClose = document.getElementById('infoModalClose');

function openInfoModal() {
  infoModal.hidden = false;
}

function closeInfoModal() {
  infoModal.hidden = true;
}

infoBtn.addEventListener('click', openInfoModal);
infoModalClose.addEventListener('click', closeInfoModal);
infoModal.addEventListener('click', (event) => {
  if (event.target === infoModal) closeInfoModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !infoModal.hidden) closeInfoModal();
});

// Language toggle: switches which bilingual line is visually primary.
const langToggle = document.getElementById('langToggle');
langToggle.addEventListener('click', () => {
  document.body.classList.toggle('lang-vi-primary');
  langToggle.querySelectorAll('.lang-option').forEach((el) => el.classList.toggle('active'));
});
