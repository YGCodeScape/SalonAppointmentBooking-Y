const TAX_PERCENT = 5;
// sessionStorage key shared with mobileCart.html
const MOBILE_CART_KEY = "mobileCart";

// max service name chips shown in preview bar before "+N more"
const MAX_CHIPS = 3;

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
    if(!localStorage.getItem("bookingSource")){
     CartManager.clearCart();
   }
    cacheDOM();
    checkAuth();
    attachGlobalEvents();
    fetchSalonInfo()
    cart = CartManager.getCart();
    fetchServices();
    renderCart();
}

// ===============================
// CACHE DOM
// ===============================
function cacheDOM() {
    DOM.loginBtn        = document.getElementById("nav-log-btn");
    DOM.signupBtn       = document.getElementById("nav-signup-btn");
    DOM.profileDiv      = document.getElementById("nav-profile-div");

    DOM.searchInput     = document.getElementById("service-search");
    DOM.categoryButtons = document.querySelectorAll(".services-category-btn");

    DOM.servicesContainer = document.getElementById("servicesContainer");

    DOM.cartOverlayText = document.querySelector(".cart-overlay-text");
    DOM.selectStaffBtn  = document.querySelector(".select-staffDate-btn");
    DOM.cartContainer   = document.querySelector(".desktop-cart-top");

    // mobile cart preview bar
    DOM.mobileCartPreview = document.getElementById("mobileCartPreview");
    DOM.mobileCartNames   = document.getElementById("mobileCartNames");
}

/* ── Scroll: darken navbar ── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {

    const token = localStorage.getItem("access_token");

    if (token) {
        DOM.loginBtn.style.display   = "none";
        DOM.signupBtn.style.display  = "none";
        DOM.profileDiv.style.display = "flex";
    } else {
        DOM.loginBtn.style.display   = "inline-block";
        DOM.signupBtn.style.display  = "inline-block";
        DOM.profileDiv.style.display = "none";
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
        showError("services fetch error.");
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
            data-category="${service.category || "general"}"
        >
            <h4 class="servicePage-service-name">
                ${service.service_name}
            </h4>
            <img src="${IMAGE_BASE}${service.image_url}" alt="${service.service_name}" class="servicePage-service-img" />
            <div class="service-card-content">
                <span class="service-disc">${service.description}</span>
                <small class="service-duration">
                    <i class="ri-time-line"></i> ${service.duration} min
                </small>
                <span class="service-price">₹${service.price}</span>
                <button class="service-add-btn"><i class="ri-add-fill"></i></button>
            </div>
        </div>

    `).join("");

    restoreSelectedServices();
    DOM.servicesContainer.innerHTML = html;
}

function restoreSelectedServices() {
    const cart = CartManager.getCart();

    if (!cart.length) return;
    cart.forEach(service => {
        const card = document.querySelector(
            `.servicePage-service-card[data-id="${service.service_id}"]`
        );
        if (!card) return;
        const btn = card.querySelector(".service-add-btn");
        btn.classList.add("service-added-highLight");
    });

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

    // SERVICE ADD (delegated — catches clicks on icon child too)
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("service-add-btn") ||
            e.target.closest(".service-add-btn")) {
            handleAddService(e);
        }
    });

}

// ===============================
// SEARCH SERVICES
// ===============================
function handleSearch() {

    const searchValue = DOM.searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".servicePage-service-card");

    cards.forEach(card => {

        const name = card
            .querySelector(".servicePage-service-name")
            .textContent
            .toLowerCase();

        card.style.display = name.includes(searchValue) ? "flex" : "none";

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

    const cards = document.querySelectorAll(".servicePage-service-card");

    cards.forEach(card => {

        const category = card.dataset.category;

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

    const button = e.target.closest(".service-add-btn");
    const card   = button.closest(".servicePage-service-card");

    const service = {
        service_id: card.dataset.id,
        service_name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        duration: card.dataset.duration,
        category: card.dataset.category
    };

    cart = CartManager.toggleService(service);
    const exists = cart.find(s => String(s.service_id) === String(service.service_id));

    if (exists) {
        button.classList.add("service-added-highLight");
    } else {
        button.classList.remove("service-added-highLight");
    }
    renderCart();
}

// ===============================
// RENDER CART  (desktop + mobile)
// ===============================
function renderCart() {

    // ── desktop cart ──
    DOM.cartContainer.innerHTML = "";

    if (cart.length === 0) {

        DOM.cartOverlayText.style.display = "block";
        DOM.selectStaffBtn.style.display  = "none";

        updateTotals(0);
        hideMobileCartPreview();

        return;
    }

    DOM.cartOverlayText.style.display = "none";
    DOM.selectStaffBtn.style.display  = "block";

    let subTotal = 0;

    cart.forEach(service => {

        subTotal += service.price;

        const mini = document.createElement("div");
        mini.className = "mini-serviceCard";
        mini.innerHTML = `
            <h4 class="mini-service-name">${service.service_name}</h4>
            <small class="mini-service-duration">
                <i class="ri-time-line"></i>
                ${service.duration} min
            </small>
            <span class="mini-service-price">₹${service.price}</span>
        `;

        DOM.cartContainer.appendChild(mini);

    });

    updateTotals(subTotal);
    showMobileCartPreview();

}

// ===============================
// UPDATE TOTALS  (desktop)
// ===============================
function updateTotals(subTotal) {

    const tax        = (subTotal * TAX_PERCENT) / 100;
    const finalTotal = subTotal + tax;

    document.querySelector(".sub-total-amount").textContent =
        `₹${subTotal.toFixed(2)}`;

    document.querySelector(".tax-amount").textContent =
        `₹${tax.toFixed(2)}`;

    document.querySelector(".final-total-amount").textContent =
        `₹${finalTotal.toFixed(2)}`;

}

// ===============================
// MOBILE CART PREVIEW  –  SHOW
// ===============================
function showMobileCartPreview() {

    const bar   = DOM.mobileCartPreview;
    const chips = DOM.mobileCartNames;

    if (!bar || !chips) return;

    chips.innerHTML = "";

    // render up to MAX_CHIPS name chips, then "+N more"
    const visible  = cart.slice(0, MAX_CHIPS);
    const overflow = cart.length - MAX_CHIPS;

    visible.forEach(service => {
        const chip = document.createElement("span");
        chip.className   = "mobile-cart-chip";
        chip.textContent = service.service_name;
        chips.appendChild(chip);
    });

    if (overflow > 0) {
        const extra = document.createElement("span");
        extra.className   = "mobile-cart-chip overflow-chip";
        extra.textContent = `+${overflow} more`;
        chips.appendChild(extra);
    }

    // make it exist in render tree, then trigger transition
    bar.style.display = "flex";
    requestAnimationFrame(() => {
        bar.classList.add("show-mobile-cart");
    });

}

// ===============================
// MOBILE CART PREVIEW  –  HIDE
// ===============================
function hideMobileCartPreview() {

    const bar = DOM.mobileCartPreview;

    if (!bar) return;

    bar.classList.remove("show-mobile-cart");

    // wait for transition to finish before removing from flow
    setTimeout(() => {
        if (!bar.classList.contains("show-mobile-cart")) {
            bar.style.display = "none";
        }
    }, 420);

}

// ===============================
// OPEN MOBILE CART PAGE
// ===============================
function openMobileCart() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        showWarning("Please login to book an appointment");
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 3500);
        return;
    }

    if (cart.length === 0) return;

    window.location.href = "./mobileCart.html";

}

// ===============================
// BOOKING BUTTON  (desktop)
// ===============================
document.querySelector(".select-staffDate-btn")
    ?.addEventListener("click", () => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            showWarning("Please login to book an appointment");
            setTimeout(() => {
                window.location.href = "./login.html";
            }, 3500);
            return;
        }

        if (cart.length === 0) {
            alert("Please add at least one service.");
            return;
        }

        localStorage.setItem("bookingSource", "services");
        CartManager.sendToBooking();

        window.location.href = "booking.html";
    });

// ===============================
// LOGOUT
// ===============================
async function logout() {

    const confirm = await confirmAction(
        "Logout?",
        "You will be logged out of your account.",
        "Yes, Logout"
    );

    if (!confirm.isConfirmed) return;

    const refreshToken = localStorage.getItem("refresh_token");

    try {

        showLoading("Logging out...");

        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken })
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