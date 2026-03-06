// ===============================
// GLOBAL STATE
// ===============================

const bookingData = {
    type: null,
    items: [],
    staff: null,
    date: null,
    time: null,
    totalAmount: 0,
    status: "pending"
};

let DOM = {};
let selectedDate = null;
const salonId = 1;

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    cacheDOM();
    loadBookingItems();
    fetchStaff();
    renderDates();
    attachEvents();
    drawClock();
    updateTimeBadge();
}


// ===============================
// CACHE DOM
// ===============================

function cacheDOM(){

    DOM.staffList = document.getElementById("staffList");
    DOM.daysRow = document.getElementById("daysRow");
    DOM.monthLabel = document.getElementById("monthLabel");

    DOM.bookBtn = document.getElementById("bookBtn");

    DOM.summaryDate = document.getElementById("summaryDate");

    DOM.successModal = document.getElementById("successModal");

}


// ===============================
// LOAD ITEMS FROM SERVICES / PACKAGES
// ===============================

function loadBookingItems(){

    const source = localStorage.getItem("bookingSource");

    const items = JSON.parse(
        localStorage.getItem("bookingItems")
    ) || [];

    bookingData.type = source;
    bookingData.items = items;

    let total = 0;

    items.forEach(item => {
        total += Number(item.price || 0);
    });

    bookingData.totalAmount = total;

}

//================================
//FETCH STAFF
//================================
async function fetchStaff(){

    try{
        const res = await fetch(`${API_BASE_URL}/staff?salon_id=${salonId}`);
        const data = await res.json();

        if(data.status !== "success") return;
        renderStaff(data.data.items);

    }
    catch(err) {
        console.error("Staff fetch error:", err);
    }
}
// ===============================
// RENDER STAFF
// ===============================
function renderStaff(staffList = []) {

    if (!DOM.staffList) return;

    DOM.staffList.innerHTML = "";

    if (!Array.isArray(staffList) || staffList.length === 0) {
        DOM.staffList.innerHTML = `<p>No staff available</p>`;
        return;
    }

    staffList.forEach(staff => {
        const div = document.createElement("div");
        div.className = "staff-item";

        div.dataset.staffId = staff.staff_id;

        div.innerHTML = `
            <div>
                <div class="staff-name">${staff.name}</div>
                <div class="staff-role">${staff.specialization || "Staff Member"}</div>
            </div>
            <div class="radio"></div>
        `;

        div.addEventListener("click", () => {

            document
            .querySelectorAll(".staff-item .radio")
            .forEach(r => r.classList.remove("selected"));

            div.querySelector(".radio").classList.add("selected");

            bookingData.staff = {
                id: staff.staff_id,
                name: staff.name
            };

        });
        DOM.staffList.appendChild(div);
    });

}

// ===============================
// DATE RENDER
// ===============================

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderDates(){

    const today = new Date();

    today.setHours(0,0,0,0);

    DOM.daysRow.innerHTML = "";

    for(let i=0;i<7;i++){

        const date = new Date(today);

        date.setDate(today.getDate()+i);

        const cell = document.createElement("div");

        cell.className = "day-cell";

        if(i===0){
            cell.classList.add("dayActive");
            selectedDate = date;
            updateSummaryDate(date);
        }

        cell.innerHTML = `
            <div class="day-name">${DAY_NAMES[date.getDay()]}</div>
            <div class="day-num">${date.getDate()}</div>
        `;

        cell.addEventListener("click",()=>{

            document
            .querySelectorAll(".day-cell")
            .forEach(c=>c.classList.remove("dayActive"));

            cell.classList.add("dayActive");

            selectedDate = date;

            updateSummaryDate(date);

        });

        DOM.daysRow.appendChild(cell);

    }

    DOM.monthLabel.textContent =
        MONTH_NAMES[today.getMonth()] +
        " " +
        today.getFullYear();

}


function updateSummaryDate(date){

    const label =
        MONTH_NAMES[date.getMonth()] + ", " +
        DAY_NAMES[date.getDay()] + " " +
        date.getDate();

    DOM.summaryDate.textContent = label;

    bookingData.date = date;
}


// ===============================
// AM PM BUTTON
// ===============================

function attachEvents(){

    document
    .querySelectorAll(".am-pm-btn")
    .forEach(btn=>{

        btn.addEventListener("click",()=>{

            document
            .querySelectorAll(".am-pm-btn")
            .forEach(b=>b.classList.remove("active"));

            btn.classList.add("active");

            updateTimeBadge();

        });

    });

    DOM.bookBtn.addEventListener("click", handleBooking);

    document
    .getElementById("backHomeBtn")
    .addEventListener("click", closeModal);

    document
    .querySelector(".back-btn")
    .addEventListener("click", handleBack);

}


// ===============================
// FINAL BOOKING
// ===============================

function handleBooking(){

    if(!bookingData.staff){
        alert("Please select staff");
        return;
    }

    const appointments =
        JSON.parse(localStorage.getItem("appointments")) || [];

    const finalBooking = {

        id: Date.now(),

        items: bookingData.items,

        staff: bookingData.staff,

        date: bookingData.date,

        time: bookingData.time,

        totalAmount: bookingData.totalAmount,

        status:"pending",

        createdAt:new Date().toISOString()

    };

    appointments.push(finalBooking);

    localStorage.setItem(
        "appointments",
        JSON.stringify(appointments)
    );

    populateSuccessModal();

    DOM.successModal.classList.add("show");

}


// ===============================
// SUCCESS MODAL DATA
// ===============================

function populateSuccessModal(){

    document.getElementById("modalDate")
        .textContent = DOM.summaryDate.textContent;

    document.getElementById("modalTime")
        .textContent = bookingData.time;

    document.querySelector(".counter-ser")
        .textContent = bookingData.items.length;

    document.querySelector(".serviceOrPackage")
        .textContent = bookingData.type + " added";

    document.getElementById("modalStaff")
        .textContent = bookingData.staff;

    document.getElementById("modalServices")
        .innerHTML =
        bookingData.items
        .map(item =>
            `<span class="model-services-span">${item.name}</span>`
        ).join(",");

    document.getElementById("modTotalValue")
        .textContent = bookingData.totalAmount;

}


// ===============================
// CLOSE MODAL
// ===============================

function closeModal(){

    localStorage.removeItem("bookingSource");
    localStorage.removeItem("bookingItems");

    DOM.successModal.classList.remove("show");

    window.location.href="../index.html";

}

// ===============================
// BACK BUTTON
// ===============================

function handleBack(){

    const source =
        localStorage.getItem("bookingSource");

    if(source==="services"){
        window.location.href="services.html";
    }

    else if(source==="packages"){
        window.location.href="packages.html";
    }

    else{
        window.history.back();
    }

}


// ===============================
// CLOCK
// ===============================
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
   window.addEventListener('mouseup', () => dragging = null);
    window.addEventListener('touchend', () => dragging = null);  


function updateTimeBadge(){
    const ampm = document.querySelector(".am-pm-btn.active").textContent;

    const h = String(hours).padStart(2,"0");

    const m = String(minutes).padStart(2,"0");

    bookingData.time =`${h}:${m} ${ampm}`;

    document.querySelector(".time-badge").textContent = bookingData.time;
     document.getElementById("summaryTime").textContent = bookingData.time;
}
//---------------------------------------
