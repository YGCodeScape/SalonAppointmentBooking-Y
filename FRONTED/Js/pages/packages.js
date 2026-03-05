document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
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


//  Get elements
const searchInput = document.getElementById("package-search");
const packageCart = document.querySelectorAll(".package-card");
const bookBtns = document.querySelectorAll(".package-book-btn")


function openDetails(el){
    const pack = el.closest('.package-card');
    pack.classList.add('show-details');
}

function closeDetails(el){
    const pack = el.closest('.package-card');
    pack.classList.remove('show-details');
}

//  Add event listener on search
searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();

    packageCart.forEach(pCard => {
        const packageName = pCard.querySelector(".package-title").textContent.toLowerCase();

        if (packageName.includes(searchValue)) {
            pCard.style.display = "flex";
        } else {
            pCard.style.display = "none";
        }
    });
});


bookBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Get package data from HTML using data attributes
    const packageCard = btn.closest(".package-card");

    const selectedPackage = {
      id: packageCard.dataset.id,
      name: packageCard.dataset.name,
      price: packageCard.dataset.price,
    };

    console.log(selectedPackage.id)
    localStorage.setItem("bookingSource", "packages");

    // store as ARRAY (important)
    localStorage.setItem("bookingItems", JSON.stringify([selectedPackage]));

    window.location.href = "booking.html";
  });

});

// document.addEventListener("DOMContentLoaded", () => {

//     const container = document.querySelector(".packages-container");

//     let allPackages = [];

//     // ================= FETCH PACKAGES =================
//     async function fetchPackages() {
//         try {

//             const response = await fetch(`${API_BASE_URL}/packages`);
//             const data = await response.json();

//             allPackages = data;
//             renderPackages(allPackages);

//         } catch (error) {
//             console.error("Error fetching packages:", error);
//         }
//     }

//     // ================= RENDER PACKAGES =================
//     function renderPackages(packages) {

//         container.innerHTML = "";

//         if (packages.length === 0) {
//             container.innerHTML = "<p>No packages found.</p>";
//             return;
//         }

//         packages.forEach(pkg => {

//             const card = document.createElement("div");
//             card.classList.add("package-card");

//             card.innerHTML = `
//                 <div class="package-image">
//                     <img src="../Assets/images/${pkg.image}" alt="${pkg.name}">
//                 </div>

//                 <div class="package-content">
//                     <div class="package-top">
//                         <h3 class="package-title">${pkg.name}</h3>
//                         <div class="view-details">
//                             <span>view details</span> 
//                             <i class="ri-information-line"></i>
//                         </div>
//                     </div>

//                     <ul class="package-services">
//                         ${pkg.services.map(service => `
//                             <li><i class="ri-check-fill"></i> ${service}</li>
//                         `).join("")}
//                     </ul>

//                     <div class="package-bottom">
//                         <div class="package-price">₹${pkg.price}</div>
//                         <div class="offer-tag">
//                             <img src="../Assets/images/${pkg.offerImage}" alt="offer">
//                         </div>
//                         <button class="package-book-btn" data-id="${pkg.id}">
//                             Book an Appointment
//                         </button>
//                     </div>

//                     <div class="details-panel">
//                         <h4>Terms & Conditions</h4>
//                         <ul>
//                             ${pkg.terms.map(term => `<li>${term}</li>`).join("")}
//                         </ul>
//                         <p class="validity">
//                             Valid till ${formatDate(pkg.validity)}
//                         </p>
//                         <button class="close-btn">Close</button>
//                     </div>
//                 </div>
//             `;

//             container.appendChild(card);
//         });
//     }
//     // Initial Load
//     fetchPackages();
// });