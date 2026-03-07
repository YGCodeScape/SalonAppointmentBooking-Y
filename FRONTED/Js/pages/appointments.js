document.addEventListener("DOMContentLoaded", initPage);

function initPage(){
    cacheDOM();
    checkAuth();
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
     }
 }

//=====================================
// FETCH APPOINTMENTS
//=====================================

async function fetchAppointments(){

    try{

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/appointments`,{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });

        const data = await res.json();

        if(data.status !== "success") return;

        renderAppointments(data.data.items);

    }
    catch(err){
        console.error("Fetch appointment error:",err);
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
                Apex Salons, Sector 7, Airoli, Navi Mumbai
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

function attachCancelEvents(){

    const buttons=document.querySelectorAll(".cancel-btn");

    buttons.forEach(btn=>{

        btn.addEventListener("click",async function(){

            const appointmentId=this.dataset.id;

            const confirmCancel=
            confirm("Cancel this appointment?");

            if(!confirmCancel) return;

            try{

                const token=
                localStorage.getItem("access_token");

                const res=await fetch(
                `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
                {
                    method:"PATCH",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Bearer ${token}`
                    },
                    body:JSON.stringify({
                        cancellation_reason:"Cancelled by customer"
                    })
                });

                const data=await res.json();

                if(data.status==="success"){

                    alert("Appointment cancelled");

                    fetchAppointments();

                }

            }
            catch(err){

                console.error("Cancel error:",err);

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