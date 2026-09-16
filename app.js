const MOVIE_SHOWTIME_DATA = {
  '12:30 PM': {
    movie: 'Dune: Part Two',
    screen: 'Screen 02'
  },
  '6:15 PM': {
    movie: 'The Batman',
    screen: 'Screen 05'
  },
  '9:45 PM': {
    movie: 'Avatar: The Way of Water',
    screen: 'Screen 03'
  }
};

const TIER_CONFIG = {
  silver: { label: 'Silver', pricePaise: 14900, accent: '#aeb8c7' },
  gold: { label: 'Gold', pricePaise: 21900, accent: '#d7a946' },
  recliner: { label: 'Recliner', pricePaise: 28900, accent: '#8d5bd2' }
};

const SEAT_LAYOUT = {
  A: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'],
  B: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
  C: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
};

const SEAT_TIERS = {
  A1: 'silver', A2: 'silver', A3: 'silver', A4: 'silver', A5: 'silver', A6: 'silver', A7: 'silver', A8: 'silver', A9: 'silver', A10: 'silver', A11: 'silver', A12: 'silver',
  B1: 'gold', B2: 'gold', B3: 'gold', B4: 'gold', B5: 'gold', B6: 'gold', B7: 'gold', B8: 'gold', B9: 'gold', B10: 'gold',
  C1: 'recliner', C2: 'recliner', C3: 'recliner', C4: 'recliner', C5: 'recliner', C6: 'recliner'
};

const SHOWTIME_BOOKED_SEATS = {
  '12:30 PM': ['A2', 'A6', 'B3', 'B9', 'C1'],
  '6:15 PM': ['A1', 'A5', 'B2', 'B7', 'C4', 'C5'],
  '9:45 PM': ['A3', 'A7', 'A9', 'B1', 'B5', 'C2', 'C6']
};

const FESTIVAL_DISCOUNT_PA = 15000;
const MEMBER_PERCENT = 10;
const CONVENIENCE_FEE_PER_TICKET_PA = 2500;
const GST_RATE = 18;

const state = {
  showtime: '12:30 PM',
  festival: false,
  member: false,
  selectedSeats: []
};

const showtimeSelect = document.getElementById('showtimeSelect');
const festivalDiscount = document.getElementById('festivalDiscount');
const memberDiscount = document.getElementById('memberDiscount');
const ticketBreakdown = document.getElementById('ticketBreakdown');
const totalAmount = document.getElementById('totalAmount');
const bookingNotice = document.getElementById('bookingNotice');
const statusPill = document.getElementById('statusPill');
const bookButton = document.getElementById('bookButton');
const tierList = document.getElementById('tierList');
const seatMap = document.getElementById('seatMap');
const movieTitle = document.getElementById('movieTitle');
const screenTag = document.getElementById('screenTag');
const customerName = document.getElementById('customerName');
const customerEmail = document.getElementById('customerEmail');
const customerPhone = document.getElementById('customerPhone');
const seatPriceInput = document.getElementById('seatPriceInput');
const importButton = document.getElementById('importButton');
const importReport = document.getElementById('importReport');
const receiptPanel = document.getElementById('receiptPanel');
const receiptContent = document.getElementById('receiptContent');
const printReceiptBtn = document.getElementById('printReceiptBtn');

function formatMoneyPaise(valuePaise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valuePaise / 100);
}

function safeRoundToPaise(valuePaise) {
  return Math.round(valuePaise);
}

function getBookedSeatsForCurrentShowtime() {
  return SHOWTIME_BOOKED_SEATS[state.showtime] || [];
}

function getSeatTier(seatId) {
  return SEAT_TIERS[seatId] || null;
}

function getAllSeatIdsForTier(tierKey) {
  return Object.entries(SEAT_TIERS)
    .filter(([, tier]) => tier === tierKey)
    .map(([seatId]) => seatId);
}

function getAvailableInventoryForCurrentShowtime(tierKey) {
  const booked = new Set(getBookedSeatsForCurrentShowtime());
  return getAllSeatIdsForTier(tierKey).filter((seatId) => !booked.has(seatId)).length;
}

function getTierQuantities() {
  return {
    silver: state.selectedSeats.filter((seat) => seat.tier === 'silver').length,
    gold: state.selectedSeats.filter((seat) => seat.tier === 'gold').length,
    recliner: state.selectedSeats.filter((seat) => seat.tier === 'recliner').length
  };
}

function getTotalTicketCount() {
  return state.selectedSeats.length;
}

function getTierLineItems() {
  const lines = [];
  const quantities = getTierQuantities();

  Object.entries(TIER_CONFIG).forEach(([tierKey, meta]) => {
    const qty = quantities[tierKey];
    if (qty > 0) {
      lines.push({
        label: `${meta.label} × ${qty}`,
        amountPaise: safeRoundToPaise(meta.pricePaise * qty)
      });
    }
  });

  return lines;
}

function getMemberDiscountPaise(baseTicketSubtotalPaise) {
  if (!state.member) return 0;
  return safeRoundToPaise((baseTicketSubtotalPaise * MEMBER_PERCENT) / 100);
}

function getFestivalDiscountPaise() {
  return state.festival ? FESTIVAL_DISCOUNT_PA : 0;
}

function calculateBill() {
  const quantities = getTierQuantities();
  const baseTicketSubtotalPaise = Object.entries(TIER_CONFIG).reduce((sum, [tierKey, meta]) => {
    return sum + meta.pricePaise * quantities[tierKey];
  }, 0);

  const memberDiscountPaise = getMemberDiscountPaise(baseTicketSubtotalPaise);
  const festivalDiscountPaise = getFestivalDiscountPaise();
  const discountedSubtotalPaise = Math.max(0, baseTicketSubtotalPaise - memberDiscountPaise - festivalDiscountPaise);
  const convenienceFeePaise = getTotalTicketCount() * CONVENIENCE_FEE_PER_TICKET_PA;
  const gstOnChargeableAmountPaise = safeRoundToPaise((discountedSubtotalPaise + convenienceFeePaise) * GST_RATE / 100);
  const totalPaise = discountedSubtotalPaise + convenienceFeePaise + gstOnChargeableAmountPaise;

  return {
    baseTicketSubtotalPaise,
    memberDiscountPaise,
    festivalDiscountPaise,
    discountedSubtotalPaise,
    convenienceFeePaise,
    gstOnChargeableAmountPaise,
    totalPaise
  };
}

function normalizeSeatName(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function titleCaseText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function parsePricePaise(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;

  const cleaned = String(rawValue)
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (!cleaned) return null;

  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric) || numeric < 0) return null;

  return Math.round(numeric * 100);
}

function cleanSeatPriceList(rawText) {
  const rows = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cleaned = [];
  const duplicates = [];
  const rejected = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const cells = row.split(/[|,;\t]+/).map((cell) => cell.trim());
    const nameCell = cells[0] || '';
    const priceCell = cells[1] || cells[0] || '';
    const normalizedName = normalizeSeatName(nameCell);

    const pricePaise = parsePricePaise(priceCell);

    if (!normalizedName) {
      rejected.push({ row: index + 1, value: row, reason: 'Empty class name' });
      return;
    }

    if (pricePaise === null) {
      rejected.push({ row: index + 1, value: row, reason: 'Missing or invalid price' });
      return;
    }

    if (pricePaise <= 0) {
      rejected.push({ row: index + 1, value: row, reason: 'Non-positive price' });
      return;
    }

    if (seen.has(normalizedName)) {
      duplicates.push({ row: index + 1, value: row, original: titleCaseText(normalizedName), reason: 'Duplicate normalized class name' });
      return;
    }

    seen.add(normalizedName);
    cleaned.push({
      key: normalizedName,
      label: titleCaseText(normalizedName),
      pricePaise,
      displayPrice: formatMoneyPaise(pricePaise)
    });
  });

  return {
    imported: rows.length,
    cleaned: cleaned.length,
    duplicates: duplicates.length,
    rejected: rejected.length,
    cleanedRows: cleaned,
    duplicatesRows: duplicates,
    rejectedRows: rejected
  };
}

function renderImportReport(summary) {
  const summaryItems = [
    { label: 'Imported rows', value: summary.imported },
    { label: 'Cleaned entries', value: summary.cleaned },
    { label: 'De-duplicated', value: summary.duplicates },
    { label: 'Rejected', value: summary.rejected }
  ];

  importReport.innerHTML = `
    <div class="report-card">
      <h4>Import summary</h4>
      <div class="report-metrics">
        ${summaryItems.map((item) => `<div class="metric-pill"><span>${item.label}</span><strong>${item.value}</strong></div>`).join('')}
      </div>
    </div>

    <div class="report-card">
      <h4>Cleaned class list</h4>
      <div class="report-rows">
        ${summary.cleanedRows.length
          ? summary.cleanedRows.map((row) => `<div class="report-row"><span>${row.label}</span><span class="muted">${row.displayPrice}</span></div>`).join('')
          : '<div class="report-row"><span>No valid rows</span><span class="muted">—</span></div>'}
      </div>
    </div>

    <div class="report-card">
      <h4>Rejected rows</h4>
      <div class="report-rows">
        ${summary.rejectedRows.length
          ? summary.rejectedRows.map((row) => `<div class="report-row"><span>${row.value}</span><span class="muted">${row.reason}</span></div>`).join('')
          : '<div class="report-row"><span>No rejected rows</span><span class="muted">clear</span></div>'}
      </div>
    </div>
  `;
}

function processSeatPriceImport() {
  const summary = cleanSeatPriceList(seatPriceInput.value);
  renderImportReport(summary);
  bookingNotice.textContent = `${summary.cleaned} valid seat classes imported. ${summary.duplicates} duplicates removed and ${summary.rejected} rows rejected.`;
}

function renderShowtimes() {
  showtimeSelect.innerHTML = '';

  Object.keys(SHOWTIME_BOOKED_SEATS).forEach((showtime) => {
    const option = document.createElement('option');
    option.value = showtime;
    option.textContent = `${showtime} • ${MOVIE_SHOWTIME_DATA[showtime].movie}`;
    showtimeSelect.appendChild(option);
  });

  showtimeSelect.value = state.showtime;
  const activeMovie = MOVIE_SHOWTIME_DATA[state.showtime];
  movieTitle.textContent = activeMovie.movie;
  screenTag.textContent = activeMovie.screen;
}

function renderTierCards() {
  tierList.innerHTML = '';
  const quantities = getTierQuantities();

  Object.entries(TIER_CONFIG).forEach(([tierKey, meta]) => {
    const capacity = getAvailableInventoryForCurrentShowtime(tierKey);
    const soldOut = capacity <= 0;
    const card = document.createElement('div');
    card.className = `tier-card${soldOut ? ' sold-out' : ''}`;

    card.innerHTML = `
      <div class="tier-info">
        <div class="tier-header">
          <div class="tier-name">
            <span class="dot" style="background:${meta.accent}"></span>
            ${meta.label}
          </div>
          <span class="badge ${soldOut ? 'out' : 'available'}">${soldOut ? 'Sold out' : `Available ${capacity}`}</span>
        </div>
        <div class="tier-price">${formatMoneyPaise(meta.pricePaise)} / ticket</div>
        <div class="tier-meta">
          <span>${soldOut ? 'Not bookable for this showtime' : 'Seats available for selection'}</span>
        </div>
      </div>
      <div class="qty-chip">${quantities[tierKey]} selected</div>
    `;

    tierList.appendChild(card);
  });
}

function renderSeatMap() {
  seatMap.innerHTML = '';
  const booked = new Set(getBookedSeatsForCurrentShowtime());
  const selectedSeatIds = new Set(state.selectedSeats.map((seat) => seat.id));

  Object.entries(SEAT_LAYOUT).forEach(([row, seats]) => {
    const rowContainer = document.createElement('div');
    rowContainer.className = 'seat-row';

    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = row;
    rowContainer.appendChild(label);

    seats.forEach((seatId) => {
      const tier = getSeatTier(seatId);
      const button = document.createElement('button');
      const isBooked = booked.has(seatId);
      const isSelected = selectedSeatIds.has(seatId);

      button.type = 'button';
      button.className = `seat ${isBooked ? 'booked' : `available ${tier}`}${isSelected ? ' selected' : ''}`;
      button.textContent = seatId.slice(1);
      button.title = `${tier} seat ${seatId}`;
      button.disabled = isBooked;
      button.setAttribute('data-seat-id', seatId);

      if (!isBooked) {
        button.addEventListener('click', () => toggleSeat(seatId));
      }

      rowContainer.appendChild(button);
    });

    seatMap.appendChild(rowContainer);
  });
}

function renderBill() {
  const totalTicketCount = getTotalTicketCount();
  const bill = calculateBill();
  const lines = getTierLineItems();
  ticketBreakdown.innerHTML = '';

  if (!lines.length) {
    ticketBreakdown.innerHTML = '<div class="line"><span>Tickets</span><strong>₹0.00</strong></div>';
  } else {
    lines.forEach((line) => {
      const entry = document.createElement('div');
      entry.className = 'line';
      entry.innerHTML = `<span>${line.label}</span><strong>${formatMoneyPaise(line.amountPaise)}</strong>`;
      ticketBreakdown.appendChild(entry);
    });
  }

  const subtotalEntry = document.createElement('div');
  subtotalEntry.className = 'line';
  subtotalEntry.innerHTML = `<span>Ticket subtotal</span><strong>${formatMoneyPaise(bill.baseTicketSubtotalPaise)}</strong>`;
  ticketBreakdown.appendChild(subtotalEntry);

  if (bill.memberDiscountPaise > 0) {
    const memberEntry = document.createElement('div');
    memberEntry.className = 'line discount';
    memberEntry.innerHTML = `<span>Member discount (-${MEMBER_PERCENT}%)</span><strong>-${formatMoneyPaise(bill.memberDiscountPaise)}</strong>`;
    ticketBreakdown.appendChild(memberEntry);
  }

  if (bill.festivalDiscountPaise > 0) {
    const festivalEntry = document.createElement('div');
    festivalEntry.className = 'line discount';
    festivalEntry.innerHTML = `<span>Festival discount</span><strong>-${formatMoneyPaise(bill.festivalDiscountPaise)}</strong>`;
    ticketBreakdown.appendChild(festivalEntry);
  }

  const netSubtotalEntry = document.createElement('div');
  netSubtotalEntry.className = 'line';
  netSubtotalEntry.innerHTML = `<span>Net ticket amount</span><strong>${formatMoneyPaise(bill.discountedSubtotalPaise)}</strong>`;
  ticketBreakdown.appendChild(netSubtotalEntry);

  const convenienceEntry = document.createElement('div');
  convenienceEntry.className = 'line';
  convenienceEntry.innerHTML = `<span>Convenience fee</span><strong>${formatMoneyPaise(bill.convenienceFeePaise)}</strong>`;
  ticketBreakdown.appendChild(convenienceEntry);

  const gstEntry = document.createElement('div');
  gstEntry.className = 'line';
  gstEntry.innerHTML = `<span>GST (18%)</span><strong>${formatMoneyPaise(bill.gstOnChargeableAmountPaise)}</strong>`;
  ticketBreakdown.appendChild(gstEntry);

  totalAmount.textContent = formatMoneyPaise(bill.totalPaise);

  if (totalTicketCount === 0) {
    bookingNotice.textContent = 'Select your seats to see the live total.';
    statusPill.textContent = 'Live availability';
    bookButton.disabled = true;
    return;
  }

  bookingNotice.textContent = `${totalTicketCount} ticket${totalTicketCount > 1 ? 's' : ''} selected for ${state.showtime}.`;
  statusPill.textContent = `${totalTicketCount} seat${totalTicketCount > 1 ? 's' : ''} selected`;
  bookButton.disabled = !(customerName.value.trim() && customerEmail.value.trim() && customerPhone.value.trim());
}

function toggleSeat(seatId) {
  const seatTier = getSeatTier(seatId);
  const booked = getBookedSeatsForCurrentShowtime();
  if (!seatTier || booked.includes(seatId)) return;

  const current = state.selectedSeats.find((seat) => seat.id === seatId);

  if (current) {
    state.selectedSeats = state.selectedSeats.filter((seat) => seat.id !== seatId);
  } else {
    state.selectedSeats.push({ id: seatId, tier: seatTier, label: seatId });
  }

  renderTierCards();
  renderSeatMap();
  renderBill();
}

function renderReceipt() {
  const bill = calculateBill();
  const seatLabels = state.selectedSeats.map((seat) => seat.id).join(', ');

  receiptContent.innerHTML = `
    <div class="receipt-block">
      <div class="receipt-row"><span>Customer</span><strong>${customerName.value.trim() || 'Guest'}</strong></div>
      <div class="receipt-row"><span>Email</span><strong>${customerEmail.value.trim() || 'N/A'}</strong></div>
      <div class="receipt-row"><span>Phone</span><strong>${customerPhone.value.trim() || 'N/A'}</strong></div>
    </div>

    <div class="receipt-block">
      <div class="receipt-row"><span>Movie</span><strong>${MOVIE_SHOWTIME_DATA[state.showtime].movie}</strong></div>
      <div class="receipt-row"><span>Screen</span><strong>${MOVIE_SHOWTIME_DATA[state.showtime].screen}</strong></div>
      <div class="receipt-row"><span>Showtime</span><strong>${state.showtime}</strong></div>
      <div class="receipt-row"><span>Seats</span><strong>${seatLabels || 'None selected'}</strong></div>
    </div>

    <div class="receipt-block">
      ${getTierLineItems().map((line) => `
        <div class="receipt-row">
          <span>${line.label}</span>
          <strong>${formatMoneyPaise(line.amountPaise)}</strong>
        </div>
      `).join('') || '<div class="receipt-row"><span>Tickets</span><strong>₹0.00</strong></div>'}
      <div class="receipt-row"><span>Ticket subtotal</span><strong>${formatMoneyPaise(bill.baseTicketSubtotalPaise)}</strong></div>
      ${bill.memberDiscountPaise > 0 ? `<div class="receipt-row"><span>Member discount</span><strong>- ${formatMoneyPaise(bill.memberDiscountPaise)}</strong></div>` : ''}
      ${bill.festivalDiscountPaise > 0 ? `<div class="receipt-row"><span>Festival discount</span><strong>- ${formatMoneyPaise(bill.festivalDiscountPaise)}</strong></div>` : ''}
      <div class="receipt-row"><span>Convenience fee</span><strong>${formatMoneyPaise(bill.convenienceFeePaise)}</strong></div>
      <div class="receipt-row"><span>GST</span><strong>${formatMoneyPaise(bill.gstOnChargeableAmountPaise)}</strong></div>
    </div>

    <div class="receipt-total">
      <span>Total paid</span>
      <span>${formatMoneyPaise(bill.totalPaise)}</span>
    </div>
  `;
}

function updateCustomerValidation() {
  const hasCustomerDetails = customerName.value.trim() && customerEmail.value.trim() && customerPhone.value.trim();
  bookButton.disabled = !hasCustomerDetails || getTotalTicketCount() === 0;
}

showtimeSelect.addEventListener('change', (event) => {
  state.showtime = event.target.value;
  state.selectedSeats = [];
  const activeMovie = MOVIE_SHOWTIME_DATA[state.showtime];
  movieTitle.textContent = activeMovie.movie;
  screenTag.textContent = activeMovie.screen;
  renderTierCards();
  renderSeatMap();
  renderBill();
});

festivalDiscount.addEventListener('change', (event) => {
  state.festival = event.target.checked;
  renderBill();
});

memberDiscount.addEventListener('change', (event) => {
  state.member = event.target.checked;
  renderBill();
});

[customerName, customerEmail, customerPhone].forEach((field) => {
  field.addEventListener('input', () => {
    updateCustomerValidation();
  });
});

bookButton.addEventListener('click', () => {
  const totalTicketCount = getTotalTicketCount();
  const bill = calculateBill();

  if (totalTicketCount === 0) {
    bookingNotice.textContent = 'Select at least one seat before checkout.';
    return;
  }

  if (!customerName.value.trim() || !customerEmail.value.trim() || !customerPhone.value.trim()) {
    bookingNotice.textContent = 'Please complete the customer details before confirming the booking.';
    return;
  }

  renderReceipt();
  receiptPanel.classList.remove('hidden');

  const summaryText = `Booked ${totalTicketCount} ticket(s) for ${state.showtime} for ${customerName.value.trim()}. Total due: ${formatMoneyPaise(bill.totalPaise)}.`;
  bookingNotice.textContent = summaryText;
  statusPill.textContent = 'Booking confirmed';
  bookButton.textContent = 'Booking confirmed';
  bookButton.disabled = true;
});

printReceiptBtn.addEventListener('click', () => {
  window.print();
});

importButton.addEventListener('click', processSeatPriceImport);

renderImportReport(cleanSeatPriceList(seatPriceInput.value));
renderShowtimes();
renderTierCards();
renderSeatMap();
renderBill();
renderReceipt();
updateCustomerValidation();
