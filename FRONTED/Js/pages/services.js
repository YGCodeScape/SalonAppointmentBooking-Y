// ===============================
// CONFIG
// ===============================
const salonId = 1;
const TAX_PERCENT = 5;

// ===============================
// STATE
// ===============================
let cart = [];
let servicesData = [];
let DOM = {};

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    cacheDOM();
    checkAuth();
    attachGlobalEvents();
    fetchServices();
}

// ===============================
// CACHE DOM
// ===============================
function cacheDOM() {

    DOM.loginBtn = document.getElementById("nav-log-btn");
    DOM.signupBtn = document.getElementById("nav-signup-btn");
    DOM.profileDiv = document.getElementById("nav-profile-div");

    DOM.searchInput = document.getElementById("service-search");
    DOM.categoryButtons = document.querySelectorAll(".services-category-btn");

    DOM.servicesContainer = document.getElementById("servicesContainer");

    DOM.cartOverlayText = document.querySelector(".cart-overlay-text");
    DOM.selectStaffBtn = document.querySelector(".select-staffDate-btn");

    DOM.cartContainer = document.querySelector(".desktop-cart-top");
    DOM.mobileCartPreview = document.querySelector(".mobile-cart-preview");
    DOM.mobileCartLeft = document.querySelector(".cart-left-sec");
    DOM.mobileCartTotal = document.querySelector(".cart-total-amount");

}

// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {

    const token = localStorage.getItem("access_token");

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
// FETCH SERVICES
// ===============================
async function fetchServices() {
    try {
        const res = await fetch(
            `${API_BASE_URL}/services?salon_id=${salonId}`
        );

        if (!res.ok) throw new Error("Services API failed");

        const data = await res.json();

        if (data.status !== "success") return;

        servicesData = data.data.items;

        renderServices(servicesData);

    } catch (error) {

        console.error("Services fetch error:", error);
    }
}

// ===============================
// RENDER SERVICES
// ===============================
function renderServices(services) {

    const html = services.map(service => `

        <div class="servicePage-service-card"
            data-id="${service.service_id}"
            data-name="${service.service_name}"
            data-price="${service.price}"
            data-duration="${service.duration}"
            data-category="${service.category || 'general'}"
        >
            <h4 class="servicePage-service-name">
                ${service.service_name}
            </h4>
            <img src="${IMAGE_BASE}${service.image_url}" alt="${service.service_name}" />
            <div class="service-card-content">
                 <span class="service-disc">${service.description}</span>
                 <small><i class="ri-time-line"></i> ${service.duration} min</small>
                 <span class="service-price">₹${service.price}</span>
                 <button class="service-add-btn"><i class="ri-add-fill"></i></button>
            </div>

        </div>

    `).join("");

    DOM.servicesContainer.innerHTML = html;

}

// ===============================
// GLOBAL EVENTS
// ===============================
function attachGlobalEvents() {

    // SEARCH
    DOM.searchInput.addEventListener("input", handleSearch);

    // CATEGORY FILTER
    DOM.categoryButtons.forEach(btn => {
        btn.addEventListener("click", handleCategory);
    });

    // SERVICE ADD
    document.addEventListener("click", function(e){

        if (e.target.classList.contains("service-add-btn")) {
            handleAddService(e);
        }

    });

}

// ===============================
// SEARCH SERVICES
// ===============================
function handleSearch() {

    const searchValue =
        DOM.searchInput.value.toLowerCase();

    const cards =
        document.querySelectorAll(".servicePage-service-card");

    cards.forEach(card => {

        const name = card
            .querySelector(".servicePage-service-name")
            .textContent
            .toLowerCase();

        card.style.display =
            name.includes(searchValue) ? "flex" : "none";

    });

}

// ===============================
// CATEGORY FILTER
// ===============================
function handleCategory(e) {

    const selected = e.target.dataset.category;

    DOM.categoryButtons.forEach(btn =>
        btn.classList.remove("active-category")
    );

    e.target.classList.add("active-category");

    const cards =
        document.querySelectorAll(".servicePage-service-card");

    cards.forEach(card => {

        const category =
            card.dataset.category;

        card.style.display =
            selected === "all" || selected === category
            ? "flex"
            : "none";

    });

}

// ===============================
// ADD / REMOVE SERVICE
// ===============================
function handleAddService(e) {

    const button = e.target;
    const card = button.closest(".servicePage-service-card");

    const serviceId = card.dataset.id;

    const existing =
        cart.findIndex(item => item.id === serviceId);

    if (existing === -1) {

        cart.push({
            id: serviceId,
            name: card.dataset.name,
            price: parseFloat(card.dataset.price),
            duration: card.dataset.duration
        });

        button.classList.add("service-added-highLight");

    } else {

        cart.splice(existing,1);
        button.classList.remove("service-added-highLight");

    }

    renderCart();

}

// ===============================
// RENDER CART
// ===============================
function renderCart() {

    DOM.cartContainer.innerHTML = "";
    DOM.mobileCartLeft.innerHTML = "";

    if (cart.length === 0) {

        DOM.cartOverlayText.style.display = "block";
        DOM.mobileCartPreview.classList.remove("show-mobile-cart");
        DOM.selectStaffBtn.style.display = "none";

        updateTotals(0);

        return;
    }

    DOM.cartOverlayText.style.display = "none";
    DOM.selectStaffBtn.style.display = "block";

    let subTotal = 0;

    cart.forEach(service => {

        subTotal += service.price;

        const mini = document.createElement("div");

        mini.className = "mini-serviceCard";

        mini.innerHTML = `
            <h4>${service.name}</h4>
            <small>
                <i class="ri-time-line"></i>
                ${service.duration} min
            </small>
            <span>₹${service.price}</span>
        `;

        DOM.cartContainer.appendChild(mini);

        const name = document.createElement("span");

        name.className = "mini-service-name";
        name.textContent = service.name + ", ";

        DOM.mobileCartLeft.appendChild(name);

    });

    updateTotals(subTotal);

}

// ===============================
// UPDATE TOTALS
// ===============================
function updateTotals(subTotal){

    const tax = (subTotal * TAX_PERCENT) / 100;
    const finalTotal = subTotal + tax;

    document.querySelector(".sub-total-amount")
        .textContent = `₹${subTotal.toFixed(2)}`;

    document.querySelector(".tax-amount")
        .textContent = `₹${tax.toFixed(2)}`;

    document.querySelector(".final-total-amount")
        .textContent = `₹${finalTotal.toFixed(2)}`;

    DOM.mobileCartTotal.textContent =
        `₹${subTotal.toFixed(2)}`;

    if (subTotal > 0) {
        DOM.mobileCartPreview.classList.add("show-mobile-cart");
    }

}

// ===============================
// BOOKING BUTTON
// ===============================
document.querySelector(".select-staffDate-btn")
?.addEventListener("click", () => {

    const token = localStorage.getItem("access_token");

    if(token) {
    if (cart.length === 0) {
        alert("Please add at least one service.");
        return;
    }

    localStorage.setItem("bookingSource", "services");
    localStorage.setItem("bookingItems", JSON.stringify(cart));

    window.location.href = "booking.html";
    }
    else {
        showWarning("Please login to book an appointment");
           setTimeout(()=>{
           window.location.href = "./login.html";
          },3500);
         return;
    }
});

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

        console.warn("Logout API failed");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        await showSuccess("Logged out");

        window.location.reload();
    }
}