document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadAppointments();

});
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
/* -------------------------------
   MAIN LOAD FUNCTION
--------------------------------*/
function loadAppointments() {

  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  const upcomingContainer = document.getElementById("upcoming");
  const pastContainer = document.getElementById("past");

  upcomingContainer.innerHTML = "";
  pastContainer.innerHTML = "";

  if (appointments.length === 0) {
    upcomingContainer.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  const now = new Date();

  appointments.forEach((appointment, index) => {

    const appointmentDateObj = new Date(appointment.date);
    const isPast = appointmentDateObj < now;

    const formattedDate = formatDate(appointmentDateObj);

    const statusConfig = getStatusConfig(appointment.status);

    const icon = getIconByItems(appointment.items);

    let itemsList = appointment.items.map(item => item.name).join(", ");

    const card = document.createElement("div");
    card.classList.add("AppointmentCard");

    card.innerHTML = `
      <div class="AppointmentCard-body">
        <div class="AppointmentCard-header">
          <span class="AppointmentCard-title">${itemsList}</span>
          <span class="badge" style="
              background:${statusConfig.bg};
              color:${statusConfig.color};
          ">${statusConfig.text}</span>
        </div>

        <div class="AppointmentCard-datetime">
          <span class="appointment-date">${formattedDate}</span>
          <span class="dot">•</span>
          <span class="appointment-time">${appointment.time}</span>
        </div>

        <div class="AppointmentCard-stylist">
          Stylist : <strong>${appointment.staff}</strong>
        </div>

        <div class="AppointmentCard-location">
          Apex Salons, Sector 7, Airoli, Navi Mumbai.
        </div>

        <div class="AppointmentCard-footer">
          <button class="btn-update" data-index="${index}">Update</button>
          <span class="AppointmentCard-icon">${icon}</span>
        </div>
      </div>
    `;

    if (isPast) {
      pastContainer.appendChild(card);
    } else {
      upcomingContainer.appendChild(card);
    }
  });

  attachUpdateListeners();
}


/* -------------------------------
   FORMAT DATE
--------------------------------*/
function formatDate(dateObj) {
  const options = { month: "short", weekday: "short", day: "numeric" };
  return dateObj.toLocaleDateString("en-IN", options);
}


/* -------------------------------
   STATUS STYLE CONFIG
--------------------------------*/
function getStatusConfig(status) {

  switch (status) {

    case "pending":
      return {
        text: "PENDING",
        bg: "#FFF4E5",
        color: "#FF9800"
      };

    case "accepted":
      return {
        text: "CONFIRMED",
        bg: "#E8F5E9",
        color: "#2E7D32"
      };

    case "rejected":
      return {
        text: "REJECTED",
        bg: "#FDECEA",
        color: "#C62828"
      };

    case "completed":
      return {
        text: "COMPLETED",
        bg: "#E3F2FD",
        color: "#1565C0"
      };

    default:
      return {
        text: status.toUpperCase(),
        bg: "#eee",
        color: "#333"
      };
  }
}


/* -------------------------------
   ICON BASED ON ITEM TYPE
--------------------------------*/
function getIconByItems(items) {

//   if (!items || items.length === 0) return "✂️";

  if (items.length === 1 && items[0].type === "package") {
    return "🎁";
  }

  return "✂️";
}


/* -------------------------------
   UPDATE BUTTON DELETE LOGIC
--------------------------------*/
function attachUpdateListeners() {

  const updateButtons = document.querySelectorAll(".btn-update");

  updateButtons.forEach(btn => {

    btn.addEventListener("click", function () {

      const index = this.getAttribute("data-index");

      let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

      appointments.splice(index, 1);

      localStorage.setItem("appointments", JSON.stringify(appointments));

      // Redirect to home for re booking
      window.location.href = "../index.html";
    });
  });
}


/* -------------------------------
   TAB SWITCH LOGIC (IMPROVED)
--------------------------------*/
function switchTab(btn, tab) {

  const buttons = document.querySelectorAll(".UpPast-btn");

  buttons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.getElementById("upcoming").style.display =
    tab === "upcoming" ? "flex" : "none";

  document.getElementById("past").style.display =
    tab === "past" ? "flex" : "none";
}