document.addEventListener("DOMContentLoaded", function () {
  renderStaff();
  renderDate();
});

/* =====================================================
   BOOKING STATE OBJECT
===================================================== */

let bookingData = {
  type: null,          // services | package
  items: [],           // cart items or selected package
  staff: null,
  date: null,
  time: null,
  totalAmount: 0,
  status: "pending"
};
var staffList = [
    { name: 'Pooja S',   role: 'Top Stylist'          },
    { name: 'Priya M',   role: 'Senior Makeup Artist' },
    { name: 'Pratik S',  role: 'Staff Member'         }
  ];

/* ── renderStaff() ── */
  function renderStaff() {
    var container = document.getElementById('staffList');
    container.innerHTML = '';

    staffList.forEach(function(staff) {
      var item = document.createElement('div');
      item.className = 'staff-item';
      item.innerHTML =
      ` <div>
          <div class="staff-name">${staff.name}</div>
          <div class="staff-role">${staff.role}</div>
        </div>
        <div class="radio"></div>
      </div>
      `;

      item.addEventListener('click', function() {
        document.querySelectorAll('.radio').forEach(function(r) {
          r.classList.remove('selected');
        });
        bookingData.staff = staff.name;
        item.querySelector('.radio').classList.add('selected');
      });

      container.appendChild(item);
    });
  }
 // Staff radio selection
  document.querySelectorAll('.staff-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.radio').forEach(r => r.classList.remove('selected'));
      item.querySelector('.radio').classList.add('selected');
    });
  });


  /* ── renderDate() ── */
  var DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var selectedDate = null;

  function renderDate() {
    var container = document.getElementById('daysRow');
    container.innerHTML = '';

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = 0; i < 7; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() + i);

      var cell = document.createElement('div');
      cell.className = 'day-cell' + (i === 0 ? ' dayActive' : '');
      cell.innerHTML = `
         <div class="day-name">${DAY_NAMES[d.getDay()]}</div>
         <div class="day-num">${d.getDate()}</div>
      `;
      if (i === 0) {
        selectedDate = d;
        updateSummaryDate(d);
      }

      (function(date) {
        cell.addEventListener('click', function() {
         // Day selection
         document.querySelectorAll('.day-cell').forEach(cell => {
              cell.addEventListener('click', () => {
                 document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('dayActive'));
                  cell.classList.add('dayActive');
              });
          });
            selectedDate = date;
            updateSummaryDate(date);
          });
      })(d);

      container.appendChild(cell);
    }

    // Update month label
    var firstDay = new Date(today);
    document.getElementById('monthLabel').textContent = MONTH_NAMES[firstDay.getMonth()] + ' ' + firstDay.getFullYear();
  }
  function updateSummaryDate(date) {
    var label = MONTH_NAMES[date.getMonth()] + ', ' +
                DAY_NAMES[date.getDay()] + ' ' +
                date.getDate();
    document.getElementById('summaryDate').textContent = label;
    bookingData.date = selectedDate;
  }


  // AM/PM toggle
  document.querySelectorAll('.am-pm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.am-pm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTimeBadge();
    });
  });

  // ── Canvas Clock ──────────────────────────────────────────────
  const canvas = document.getElementById('clockCanvas');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const R  = cx - 10; // outer radius

  let hours   = 10;   // 10:30 default
  let minutes = 0;

  function drawClock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Face
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour numbers
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1C1C1C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let n = 1; n <= 12; n++) {
      const angle = (n / 12) * 2 * Math.PI - Math.PI / 2;
      const nx = cx + (R - 13) * Math.cos(angle);
      const ny = cy + (R - 13) * Math.sin(angle);
      ctx.fillText(n, nx, ny);
    }

    // Minute hand (thin red)
    const minAngle = (minutes / 60) * 2 * Math.PI - Math.PI / 2;
    drawHand(minAngle, R - 18, 2, '#C0274A');

    // Hour hand (thick dark) — includes minute contribution
    const hrAngle = ((hours % 12 + minutes / 60) / 12) * 2 * Math.PI - Math.PI / 2;
    drawHand(hrAngle, R - 32, 4, '#1a1a1a');

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#C0274A';
    ctx.fill();
  }

  function drawHand(angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + length * Math.cos(angle), cy + length * Math.sin(angle));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function updateTimeBadge() {
    const amPm = document.querySelector('.am-pm-btn.active').textContent;
    const h = String(hours).padStart(2,'0');
    const m = String(minutes).padStart(2,'0');
    document.querySelector('.time-badge').textContent = `${h}:${m} ${amPm}`;
    document.querySelector('.summary-row span:last-child').textContent =
      `${h}:${m}${amPm.toLowerCase()}`;
      bookingData.time = `${h}:${m} ${amPm}`;
  }

  // Drag to set time
  let dragging = null; // 'hour' or 'minute'

  function getAngle(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top  - cy;
    return Math.atan2(y, x); // radians, -π to π
  }

  function distToHandTip(angle, length, ex, ey) {
    const rect = canvas.getBoundingClientRect();
    const tx = cx + length * Math.cos(angle);
    const ty = cy + length * Math.sin(angle);
    return Math.hypot(ex - rect.left - tx, ey - rect.top - ty);
  }

  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('touchstart', startDrag, { passive: true });

  function startDrag(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const minAngle = (minutes / 60) * 2 * Math.PI - Math.PI / 2;
    const hrAngle  = ((hours % 12 + minutes / 60) / 12) * 2 * Math.PI - Math.PI / 2;

    const dMin  = distToHandTip(minAngle, R - 18, clientX, clientY);
    const dHour = distToHandTip(hrAngle,  R - 32, clientX, clientY);

    dragging = dMin < dHour ? 'minute' : 'hour';
  }

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag, { passive: true });

  function onDrag(e) {
    if (!dragging) return;
    const angle = getAngle(e) + Math.PI / 2; // offset so 12 o'clock = 0
    const norm  = (angle + 2 * Math.PI) % (2 * Math.PI); // 0–2π

    if (dragging === 'minute') {
      minutes = Math.round((norm / (20 * Math.PI)) * 60)*15 % 60;
    } else {
      hours = Math.round((norm / (2 * Math.PI)) * 12) % 12 || 12;
    }
    drawClock();
    updateTimeBadge();
  }

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', function(e) {
  if (dragging) e.preventDefault();
    onDrag(e);
  }, { passive: false });

  window.addEventListener('mouseup',  () => dragging = null);
  window.addEventListener('touchend', () => dragging = null);

 /* ── Book Appointment button ── */
document.getElementById('bookBtn').addEventListener('click', function() {
    document.getElementById('modalDate').textContent = document.getElementById('summaryDate').textContent;
    document.getElementById('modalTime').textContent = document.getElementById('summaryTime').textContent;
    // Get selected staff name
    var staffName = bookingData.staff;
    document.getElementById('modalStaff').textContent = staffName ? staffName : 'Not selected';

    document.getElementById('successModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    document.querySelector('.bookingPage-sections').style.pointerEvents = 'none';
  });

 /* ── Close modal ── */
  document.getElementById('backHomeBtn').addEventListener('click', function() {
    document.getElementById('successModal').classList.remove('show');
    document.body.style.overflow = '';
    document.querySelector('.bookingPage-sections').style.pointerEvents = 'all';
    window.location.href = '../index.html'; // Redirect to homepage
  });

  // Init
  drawClock();
  updateTimeBadge();