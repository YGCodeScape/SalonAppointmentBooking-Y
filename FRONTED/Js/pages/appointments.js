document.addEventListener("DOMContentLoaded", function () {
    loadAppointments();
});

// function loadAppointments() {

//   const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

//   const container = document.getElementById("appointmentsContainer");

//   if (appointments.length === 0) {
//     container.innerHTML = "<p>No appointments found.</p>";
//     return;
//   }

//   container.innerHTML = "";

//   appointments.forEach((appointment) => {

//     const card = document.createElement("div");
//     card.classList.add("appointment-card");

//     let itemsList = "";

//     appointment.items.forEach(item => {
//       itemsList += `<li>${item.name}</li>`;
//     });

//     card.innerHTML = `
//       <h3>${appointment.date} - ${appointment.time}</h3>
//       <p><strong>Staff:</strong> ${appointment.staff}</p>
//       <ul>${itemsList}</ul>
//       <p><strong>Total:</strong> ₹${appointment.totalAmount}</p>
//       <p class="status ${appointment.status}">
//         ${appointment.status.toUpperCase()}
//       </p>
//     `;

//     container.appendChild(card);
//   });
// }