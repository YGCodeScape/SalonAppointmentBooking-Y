// ===============================
// CONFIG
// ===============================
const salonId = 1;

// ===============================
// STATE
// ===============================
let packagesData = [];
let DOM = {};
const token = localStorage.getItem("access_token");
// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    cacheDOM();
    checkAuth();
    attachEvents();
    fetchPackages();
}

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

// ===============================
// AUTH CHECK
// ===============================
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

// ===============================
// FETCH PACKAGES
// ===============================
async function fetchPackages() {

    try {

        const res = await fetch( `${API_BASE_URL}/packages?salon_id=${salonId}`);

        if (!res.ok) throw new Error("Packages API failed");

        const data = await res.json();

        if (data.status !== "success") return;

        packagesData = data.data.items;

        renderPackages(packagesData);

    } catch (error) {
        console.error("Packages fetch error:", error);
    }
}

// ===============================
// RENDER PACKAGES
// ===============================
function renderPackages(packages) {

    if (!DOM.packagesContainer) return;

    if (packages.length === 0) {
        DOM.packagesContainer.innerHTML = "<p>No packages available</p>";
        return;
    }

    const html = packages.map(pkg => `

        <div class="package-card"
            data-id="${pkg.package_id}"
            data-name="${pkg.package_name}"
            data-price="${pkg.total_price}"
        >
            <div class="package-image">
                <img 
                    src="${IMAGE_BASE + pkg.image_url}"
                    alt="${pkg.package_name}"
                >
            </div>
            <div class="package-content">
                <div class="package-top">
                    <h3 class="package-title">${pkg.package_name}</h3>
                    <div class="view-details">
                        <span>view details</span>
                        <i class="ri-information-line"></i>
                    </div>
                </div>

                <ul class="package-services">
                    ${pkg.services
                        ? pkg.services
                              .split(",")
                              .filter(s => s.trim())
                              .map(s => `<li><i class="ri-check-fill"></i>${s.trim()}</li>`)
                              .join("")
                        : ""}
                </ul>

                <div class="package-bottom">
                    <div class="package-price">₹${pkg.total_price}</div>
                    <div class="offer-tag">${pkg.discount}%off</div>
                    <button class="package-book-btn">
                        Book Appointment
                    </button>
                </div>

                <div class="details-panel">
                    <h4>Package Details</h4>
                    <p class="package-description">
                        ${pkg.description || "Premium salon package"}
                    </p>
                    <ul>
                       <li>Non-refundable</li>
                       <li>Not transferable</li>
                       <li>Prior appointment required</li>
                    </ul>
                    <p class="validity">
                        Valid for ${pkg.validity_days} days
                    </p>

                    <button class="close-btn">
                        Close
                    </button>
                </div>

            </div>
        </div>

    `).join("");

    DOM.packagesContainer.innerHTML = html;

}

// ===============================
// GLOBAL EVENTS
// ===============================
function attachEvents() {

    // SEARCH
    DOM.searchInput.addEventListener("input", handleSearch);

    // PACKAGE ACTIONS
    document.addEventListener("click", handlePackageActions);

}

// ===============================
// SEARCH PACKAGES
// ===============================
function handleSearch() {

    const value = DOM.searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".package-card");

    cards.forEach(card => {

        const name = card
            .querySelector(".package-title")
            .textContent
            .toLowerCase();

        card.style.display =
            name.includes(value) ? "flex" : "none";

    });

}

// ===============================
// PACKAGE ACTION HANDLER
// ===============================
function handlePackageActions(e) {

    // OPEN DETAILS
    if (e.target.closest(".view-details")) {

        const card =
            e.target.closest(".package-card");

        card.classList.add("show-details");

    }

    // CLOSE DETAILS
    if (e.target.classList.contains("close-btn")) {

        const card =
            e.target.closest(".package-card");

        card.classList.remove("show-details");

    }

    // BOOK PACKAGE
    if (e.target.classList.contains("package-book-btn")) {

      if(token) {
          const card = e.target.closest(".package-card");

         const selectedPackage = {
             id: card.dataset.id,
             name: card.dataset.name,
             price: card.dataset.price
         };

         localStorage.setItem(
             "bookingSource",
             "packages"
         );

         localStorage.setItem(
             "bookingItems",
             JSON.stringify([selectedPackage])
         );
         window.location.href = "booking.html";
      }
      else {
        alert("login first to book an appointment.")
      }
    }
}