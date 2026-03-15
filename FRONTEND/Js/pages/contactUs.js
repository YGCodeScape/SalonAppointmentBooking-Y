document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    initStarRating();
    resetFeedbackForm();
    fetchSalonInfo();
    fetchCompletedAppointments();
});
let selectedRating = 0;
let selectedAppointmentId = null;

/* ── Scroll: darken navbar ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {

    const accessToken = localStorage.getItem("access_token");

    const loginBtn = document.getElementById("nav-log-btn");
    const signupBtn = document.getElementById("nav-signup-btn");
    const profileDiv = document.getElementById("nav-profile-div");

    if (accessToken) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        profileDiv.style.display = "flex";

    } else {
        loginBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        profileDiv.style.display = "none";
    }
}

// ===============================
// SALON INFO  (public — no token)
// ===============================
async function fetchSalonInfo() {
    try {
        const res  = await fetch(`${API_BASE_URL}/salon/info?salon_id=${salonId}`);
        const data = await res.json();
 
        if (data.status !== "success") return;
 
        populateSalonInfo(data.data);
 
    } catch (err) {
        showError("Could not load salon info");
    }
}
 
function populateSalonInfo(salon) {
 
    /* ── Address card ── */
    const wordMark = document.getElementById("logo-text");
    const nameEl    = document.getElementById("salon-name");
    const addressEl = document.getElementById("salon-address");
 
    if (wordMark) {
        wordMark.textContent = salon.salon_name ?? wordMark.textContent;
        const words = wordMark.textContent.split(/\s+/);
        if (words.length > 1) {
            const first = words[0];
            const rest = words.slice(1).join(' ');
            wordMark.innerHTML = `${first} <span>${rest}</span>`;
        } else {
            wordMark.innerHTML = wordMark.textContent;
        }
    }

    if (nameEl)    nameEl.textContent = salon.salon_name ?? nameEl.textContent;
 
    if (addressEl) {
        // Build a readable address from the parts returned by the API
        const parts = [
            salon.address,
            salon.city,
            salon.state,
            salon.country
        ].filter(Boolean);    // drop any null / empty segments
 
        addressEl.innerHTML = parts.join(", ");
    }
 
    /* ── Phone card ── */
    const phoneDisplay = document.getElementById("salon-phone-display");
    const phoneLink    = document.getElementById("salon-phone-link");
 
    if (phoneDisplay && salon.phone) {
        phoneDisplay.textContent = `+91 ${salon.phone}`;
    }
    if (phoneLink && salon.phone) {
        phoneLink.href = `tel:+91${salon.phone}`;
    }
 
    /* ── Email card ── */
    const emailDisplay = document.getElementById("salon-email-display");
    const emailLink    = document.getElementById("salon-email-link");
 
    if (emailDisplay && salon.email) {
        emailDisplay.textContent = salon.email;
    }
    if (emailLink && salon.email) {
        emailLink.href = `mailto:${salon.email}`;
    }
 
    /* ── Page / browser title ── */
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Contact Us`;
    }
}

// ===============================
// fetch completed appointments
// ===============================
async function fetchCompletedAppointments(){
    try{

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/appointments?status=COMPLETED`,{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.status !== "success") return;

        populateAppointmentSelect(data.data.items);

    }
    catch(err){
            showError("Failed to load appointments");
    }
}

function populateAppointmentSelect(appointments){

    const container = document.querySelector(".feedback-card");

    if(!appointments.length){

        const msg = document.createElement("p");
        msg.textContent = "No completed appointments to review.";
        msg.className ="no-appointments-msg";
        container.prepend(msg);
        return;

    }

    const select = document.createElement("select");
    select.className = "appointment-select";

    select.innerHTML = `
        <option value="" class="appointment-option">Select Appointment</option>
    `;

    appointments.forEach(appt=>{

        const option = document.createElement("option");

        const date = new Date(appt.appointment_date)
                        .toLocaleDateString("en-IN");

        option.value = appt.appointment_id;

        option.textContent =
            `Appointment - ${date}`;

        select.appendChild(option);

    });

    select.addEventListener("change",function(){
        selectedAppointmentId = this.value;
    });

    container.prepend(select);
}

async function submitFeedback(){
    if(!selectedAppointmentId){
        showWarning("Please select an appointment");
        return;
    }
    if(selectedRating === 0){
        showWarning("Please select rating");
        return;
    }

    const comment =
        document.querySelector(".comment-box").value.trim();
    try{
        const token = localStorage.getItem("access_token");

        const payload = {
            rating: selectedRating,
            comment: comment,
            is_anonymous: 0
        };

        const res = await fetch(
            `${API_BASE_URL}/appointments/${selectedAppointmentId}/feedback`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify(payload)
            }
        );

        const data = await res.json();

        if(data.status !== "success"){
            showWarning(data.message);
            return;
        }
        Swal.fire({
           title: "feedback sended successfully!",
             icon: "success",
             draggable: true 
         });
        resetFeedbackForm();
    }
    catch(err){
        showError("Failed to submit feedback");
    }
}

// ══════════════════════════════════════════════
//  4.  STAR RATING
// ══════════════════════════════════════════════
function initStarRating() {
  const stars = document.querySelectorAll('.star');

  stars.forEach(star => {
    // hover
    star.addEventListener('mouseenter', () => highlightStars(+star.dataset.i));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating));

    // click / select
    star.addEventListener('click', () => {
      selectedRating = +star.dataset.i;
      highlightStars(selectedRating);
    });
  });
}

function highlightStars(upTo) {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    const i    = +star.dataset.i;
    const icon = star.querySelector('i');

    if (i <= upTo) {
      icon.classList.replace('ri-star-line', 'ri-star-fill');
      star.style.transform = 'scale(1.2)';
    } else {
      icon.classList.replace('ri-star-fill', 'ri-star-line');
      star.style.transform = 'scale(1)';
    }
  });
}

function resetFeedbackForm() {
  selectedRating = 0;
  highlightStars(0);
  document.querySelector('.comment-box').value = '';
}

async function logout() {

    const confirm = await confirmAction(
        "Logout?",
        "You will be logged out of your account.",
        "Yes, Logout"
    );

    if (!confirm.isConfirmed) return;

    const refreshToken =
        localStorage.getItem("refresh_token");

    try {

        showLoading("Logging out...");

        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

        Swal.close();

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out successfully");

        window.location.reload();

    } catch (error) {

        Swal.close();
        showError("Failed to logout.");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out");

        window.location.reload();
    }
}