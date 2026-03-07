document.addEventListener("DOMContentLoaded", function () {

    checkAuth();
    fetchAppointments();

});


// ===============================
// AUTH CHECK
// ===============================

function checkAuth(){

    const accessToken = localStorage.getItem("access_token");

    const loginBtn = document.getElementById("nav-log-btn");
    const signupBtn = document.getElementById("nav-signup-btn");
    const profileDiv = document.getElementById("nav-profile-div");

    if(accessToken){

        loginBtn.style.display="none";
        signupBtn.style.display="none";
        profileDiv.style.display="flex";

    }else{
        window.location.href="../login.html";
    }
}

// ===============================
// FETCH APPOINTMENTS
// ===============================

async function fetchAppointments(){

    try{
        const token = localStorage.getItem("access_token");
        
        const res = await fetch(`${API_BASE_URL}/appointments`,{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });

        const data = await res.json();
        if(data.status !== "success"){
            return;
        }
        renderAppointments(data.data.items);

    }catch(err){
        console.error("Appointment fetch error:",err);
    }
}


// ===============================
// RENDER APPOINTMENTS
// ===============================

function renderAppointments(appointments=[]){

    const upcomingContainer=document.getElementById("upcoming");
    const pastContainer=document.getElementById("past");

    upcomingContainer.innerHTML="";
    pastContainer.innerHTML="";

    if(appointments.length===0){

        upcomingContainer.innerHTML="<p>No appointments found.</p>";
        return;

    }

    const now=new Date();

    appointments.forEach(appt=>{

        const appointmentDateObj=new Date(appt.appointment_date);

        const isPast=appointmentDateObj<now;

        const formattedDate=formatDate(appointmentDateObj);

        const statusConfig=getStatusConfig(appt.status);

        const itemsList=appt.items
            ? appt.items.map(i=>i.name).join(", ")
            : "Service";

        const card=document.createElement("div");

        card.classList.add("AppointmentCard");

        card.innerHTML=`
        <div class="AppointmentCard-body">

            <div class="AppointmentCard-header">
                <span class="AppointmentCard-title">${itemsList}</span>

                <span class="badge"
                style="background:${statusConfig.bg};color:${statusConfig.color};">
                ${statusConfig.text}
                </span>
            </div>

            <div class="AppointmentCard-datetime">
                <span class="appointment-date">${formattedDate}</span>
                <span class="dot">•</span>
                <span class="appointment-time">${appt.appointment_time}</span>
            </div>

            <div class="AppointmentCard-stylist">
                Stylist : <strong>${appt.staff_name || "Staff"}</strong>
            </div>

            <div class="AppointmentCard-location">
                Apex Salons, Sector 7, Airoli, Navi Mumbai
            </div>

        </div>
        `;

        if(isPast){
            pastContainer.appendChild(card);
        }else{
            upcomingContainer.appendChild(card);
        }
    });
}

// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateObj){

    const options={
        month:"short",
        weekday:"short",
        day:"numeric"
    };
    return dateObj.toLocaleDateString("en-IN",options);
}

// ===============================
// STATUS CONFIG
// ===============================

function getStatusConfig(status){

    switch(status){

        case "PENDING":
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

        case "REJECTED":
            return{
                text:"REJECTED",
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

// ===============================
// TAB SWITCH
// ===============================

function switchTab(btn,tab){

    const buttons=document.querySelectorAll(".UpPast-btn");

    buttons.forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    document.getElementById("upcoming").style.display=
        tab==="upcoming"?"flex":"none";

    document.getElementById("past").style.display=
        tab==="past"?"flex":"none";

}