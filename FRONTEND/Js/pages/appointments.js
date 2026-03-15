document.addEventListener("DOMContentLoaded", initPage);

function initPage(){
    cacheDOM();
    checkAuth();
    fetchSalonInfo();
    fetchAppointments();
}
let DOM = {};
const token = localStorage.getItem("access_token");
// ===============================
// CACHE DOM
// ===============================
function cacheDOM() {

    DOM.loginBtn = document.getElementById("nav-log-btn");
    DOM.signupBtn = document.getElementById("nav-signup-btn");
    DOM.profileDiv = document.getElementById("nav-profile-div");

    DOM.searchInput = document.getElementById("package-search");
    DOM.packagesContainer = document.querySelector(".packages-container");
}

/* ── Scroll: darken navbar ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


//=====================================
// AUTH CHECK
//=====================================
function checkAuth() {
    if (token) {
        DOM.loginBtn.style.display = "none";
        DOM.signupBtn.style.display = "none";
        DOM.profileDiv.style.display = "flex";
        
    } else {
        DOM.loginBtn.style.display = "inline-block";
        DOM.signupBtn.style.display = "inline-block";
        DOM.profileDiv.style.display = "none";
        showWarning("Please login to check your appointment");
           setTimeout(()=>{
           window.location.href = "./login.html";
          },3500);
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
    const wordMark = document.getElementById("logo-text");
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
    else {
        showError("Could not load salon name");
    }
}

//=====================================
// FETCH APPOINTMENTS
//=====================================

async function fetchAppointments(){

    try{

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/customers/me/appointments`,{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.status !== "success") return;

        renderAppointments(data.data.items);

    }
    catch(err){
        showError("Failed to load appointments.");
    }

}

//=====================================
// RENDER APPOINTMENTS
//=====================================

function renderAppointments(appointments=[]){

    const upcomingContainer=document.getElementById("upcoming");
    const pastContainer=document.getElementById("past");

    upcomingContainer.innerHTML="";
    pastContainer.innerHTML="";

    if(!appointments.length){
        upcomingContainer.innerHTML="<p>No appointments found</p>";
        upcomingContainer.classList.add("no-text")
        return;
    }

    const now=new Date();

    appointments.forEach(appt=>{

        //==================================
        // DATE + TIME
        //==================================

        const apptDateTime=new Date(
            `${appt.appointment_date}T${appt.start_time}`
        );

        const isPast=apptDateTime<now;

        const formattedDate=formatDate(apptDateTime);
        const formattedTime=formatTime(appt.start_time);

        //==================================
        // SERVICES
        //==================================

        let serviceNames=[];
        let staffName=null;

        if(appt.services && appt.services.length){

            appt.services.forEach(s=>{
                serviceNames.push(s.service_name);
                staffName=s.staff_name;
            });
        }

        //==================================
        // PACKAGES
        //==================================

        let packageNames=[];

        if(appt.packages && appt.packages.length){

            appt.packages.forEach(p=>{
                packageNames.push(p.package_name);
                staffName=p.staff_name;
            });

        }

        //==================================
        // ITEMS LIST
        //==================================

        const itemsList=[
            ...serviceNames,
            ...packageNames
        ].join(", ");

        //==================================
        // STATUS CONFIG
        //==================================

        const statusConfig=getStatusConfig(appt.status);

        //==================================
        // CARD
        //==================================

        const card=document.createElement("div");

        card.className="AppointmentCard";

        card.innerHTML=`

        <div class="AppointmentCard-body">

            <div class="AppointmentCard-header">

                <span class="AppointmentCard-title">
                ${itemsList || "Salon Service"}
                </span>

                <span class="badge"
                style="background:${statusConfig.bg};
                color:${statusConfig.color};">

                ${statusConfig.text}

                </span>

            </div>

            <div class="AppointmentCard-datetime">

                <span class="appointment-date">
                ${formattedDate}
                </span>

                <span class="dot">•</span>

                <span class="appointment-time">
                ${formattedTime}
                </span>

            </div>

            <div class="AppointmentCard-stylist">
                Staff Name :
                <strong>${staffName || "-"}</strong>
            </div>

            <div class="AppointmentCard-location">
               123 Main Street, Mumbai Maharashtra India
            </div>

            <div class="AppointmentCard-footer">

                <button class="cancel-appointment-btn"
                data-id="${appt.appointment_id}">
                Cancel Appointment
                </button>

            </div>

        </div>
        `;

        if(isPast){
            pastContainer.appendChild(card);
        }
        else{
            upcomingContainer.appendChild(card);
        }

    });

    attachCancelEvents();

}

//=====================================
// CANCEL BUTTON
//=====================================

function attachCancelEvents() {

    const buttons = document.querySelectorAll(".cancel-appointment-btn");

    buttons.forEach(btn => {

        btn.addEventListener("click", async function () {

            const appointmentId = this.dataset.id;

            const result = await confirmAction(
                "Cancel Appointment?",
                "Your slot will be released for other customers.",
                "Yes, Cancel it"
            );

            if (!result.isConfirmed) return;

            try {

                const token = localStorage.getItem("access_token");

                showLoading("Cancelling appointment...");

                const res = await fetch(
                    `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            cancellation_reason: "Cancelled by customer"
                        })
                    }
                );

                const data = await res.json();

                Swal.close();

                if (data.status === "success") {

                    await showSuccess("Your appointment has been cancelled.");

                    fetchAppointments();
                } else {
                    showError(data.message || "Cancellation failed.");
                }

            } catch (err) {
                Swal.close();
                showError("Something went wrong while cancelling.");
            }

        });

    });
}

//=====================================
// DATE FORMAT
//=====================================

function formatDate(date){

    const options={
        weekday:"short",
        month:"short",
        day:"numeric"
    };

    return date.toLocaleDateString("en-IN",options);

}

//=====================================
// TIME FORMAT
//=====================================

function formatTime(time){

    const [hour,min]=time.split(":");

    let h=parseInt(hour);

    const ampm=h>=12?"PM":"AM";

    h=h%12;
    h=h?h:12;

    return `${String(h).padStart(2,"0")}:${min} ${ampm}`;

}

//=====================================
// STATUS STYLE
//=====================================

function getStatusConfig(status){

    switch(status){

        case "PENDING":
        case "pending":

        return{
            text:"PENDING",
            bg:"#FFF4E5",
            color:"#FF9800"
        };

        case "CONFIRMED":

        return{
            text:"CONFIRMED",
            bg:"#E8F5E9",
            color:"#2E7D32"
        };

        case "CANCELLED":

        return{
            text:"CANCELLED",
            bg:"#FDECEA",
            color:"#C62828"
        };

        case "COMPLETED":

        return{
            text:"COMPLETED",
            bg:"#E3F2FD",
            color:"#1565C0"
        };

        default:

        return{
            text:status,
            bg:"#eee",
            color:"#333"
        };

    }

}

//=====================================
// TAB SWITCH
//=====================================

function switchTab(btn,tab){

    const buttons=document.querySelectorAll(".UpPast-btn");

    buttons.forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    document.getElementById("upcoming").style.display=
        tab==="upcoming"?"flex":"none";

    document.getElementById("past").style.display=
        tab==="past"?"flex":"none";

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