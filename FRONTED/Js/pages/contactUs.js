document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    initStarRating();
    resetFeedbackForm();
    fetchCompletedAppointments();
});

let selectedRating = 0;
let selectedAppointmentId = null;
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
        console.error("Appointment fetch error:",err);
    }
}

function populateAppointmentSelect(appointments){

    const container = document.querySelector(".feedback-card");

    if(!appointments.length){

        const msg = document.createElement("p");
        msg.textContent = "No completed appointments to review.";
        container.prepend(msg);
        return;

    }

    const select = document.createElement("select");
    select.className = "appointment-select";

    select.innerHTML = `
        <option value="">Select Appointment</option>
    `;

    appointments.forEach(appt=>{

        const option = document.createElement("option");

        const date = new Date(appt.appointment_date)
                        .toLocaleDateString("en-IN");

        option.value = appt.appointment_id;

        option.textContent =
            `Appointment ${appt.appointment_id} - ${date}`;

        select.appendChild(option);

    });

    select.addEventListener("change",function(){
        selectedAppointmentId = this.value;
    });

    container.prepend(select);
}

async function submitFeedback(){
    if(!selectedAppointmentId){
        alert("Please select an appointment");
        return;
    }
    if(selectedRating === 0){
        alert("Please select rating");
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
            alert(data.message);
            return;
        }
        alert("Thank you for your feedback!");
        resetFeedbackForm();
    }
    catch(err){
        console.error("Feedback error:",err);
        alert("Failed to submit feedback");
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
