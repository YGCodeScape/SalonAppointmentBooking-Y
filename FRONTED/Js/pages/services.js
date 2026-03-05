document.addEventListener("DOMContentLoaded", function () {
    // fetchServices();
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
const searchInput = document.getElementById("service-search");
const serviceCards = document.querySelectorAll(".servicePage-service-card");
const categoryButtons = document.querySelectorAll(".services-category-btn");
const addButtons = document.querySelectorAll(".service-add-btn");
const cartOverlayText = document.querySelector(".cart-overlay-text");
const selectStaffBtn = document.querySelector(".select-staffDate-btn");
const cartContainer = document.querySelector(".desktop-cart-top");
const mobileCartPreview = document.querySelector(".mobile-cart-preview");
const mobileCartLeft = document.querySelector(".cart-left-sec");
const mobileCartTotal = document.querySelector(".cart-total-amount");

const servicesContainer = document.getElementById("servicesContainer");

// CART STORAGE
let cart = [];
const TAX_PERCENT = 5; // 5% GST

//  Add event listener on search
searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();

    serviceCards.forEach(card => {
        const serviceName = card.querySelector(".servicePage-service-name").textContent.toLowerCase();

        if (serviceName.includes(searchValue)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
});

// Add click event to each category button
categoryButtons.forEach(button => {
    button.addEventListener("click", function () {

        // Remove active class from all buttons
        categoryButtons.forEach(btn => {
            btn.classList.remove("active-category");
        });

        // Add active class to clicked button
        this.classList.add("active-category");

        // Get selected category
        const selectedCategory = this.getAttribute("data-category");

        // Loop through services
        serviceCards.forEach(card => {
            const cardCategory = card.getAttribute("data-category");

            if (selectedCategory === "all" || cardCategory === selectedCategory) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });

    });
});

// service Add Button Highlight Toggle
addButtons.forEach(button => {
    button.addEventListener("click", function () {

        const card = this.closest(".servicePage-service-card");

        const serviceId = card.getAttribute("data-id");
        const serviceName = card.getAttribute("data-name");
        const serviceDuration = card.getAttribute("data-duration")
        const servicePrice = parseFloat(card.getAttribute("data-price"));

        const existingServiceIndex = cart.findIndex(item => item.id === serviceId);

        if (existingServiceIndex === -1) {
            // ADD SERVICE
            cart.push({
                id: serviceId,
                name: serviceName,
                price: servicePrice,
                duration: serviceDuration,
                quantity: 1
            });

            this.classList.add("service-added-highLight");

        } else {
            // REMOVE SERVICE
            cart.splice(existingServiceIndex, 1);
            this.classList.remove("service-added-highLight");
        }

        console.log("Current Cart:", cart);
        renderCart();
    });
});

function renderCart() {

    cartContainer.innerHTML = "";
    mobileCartLeft.innerHTML = "";

    if (cart.length === 0) {
        cartOverlayText.style.display = "block";
        mobileCartPreview.classList.remove("show-mobile-cart");
        selectStaffBtn.style.display = "none";

        document.querySelector(".sub-total-amount").textContent = "₹0";
        document.querySelector(".tax-amount").textContent = "₹0";
        document.querySelector(".final-total-amount").textContent = "₹0";
        mobileCartTotal.textContent = "₹0";

        return;
    }

    cartOverlayText.style.display = "none";
    selectStaffBtn.style.display = "block";

    let subTotal = 0;

    cart.forEach(service => {

        subTotal += service.price;

        const miniCard = document.createElement("div");
        miniCard.classList.add("mini-serviceCard");

        miniCard.innerHTML = `
            <h4 class="mini-service-name">${service.name}</h4>
            <small><i class="ri-time-line"></i> ${service.duration} min</small>
            <span class="mini-service-price">₹${service.price}</span>
        `;

        cartContainer.appendChild(miniCard);

        const nameSpan = document.createElement("span");
        nameSpan.classList.add("mini-service-name");
        nameSpan.textContent = service.name + ", ";        
        mobileCartLeft.appendChild(nameSpan);
    });

 selectStaffBtn.addEventListener("click", function () {

    if (cart.length === 0) {
        alert("Please add at least one service.");
        return;
     }

   localStorage.setItem("bookingSource", "services");
   localStorage.setItem("bookingItems", JSON.stringify(cart));

   window.location.href = "booking.html";
});
    // ---------- CALCULATIONS ----------

    const taxAmount = (subTotal * TAX_PERCENT) / 100;
    const finalTotal = subTotal + taxAmount;

    document.querySelector(".sub-total-amount").textContent =
        `₹${subTotal.toFixed(2)}`;

    document.querySelector(".tax-amount").textContent =
        `₹${taxAmount.toFixed(2)}`;

    document.querySelector(".final-total-amount").textContent =
        `₹${finalTotal.toFixed(2)}`;

    mobileCartTotal.textContent =
        `₹${subTotal.toFixed(2)}`;

    mobileCartPreview.classList.add("show-mobile-cart");
}


// ---------------SERVICES RENDER 
async function fetchServices() {
    try {
        const response = await fetch("/sam_api/services");

        if (!response.ok) {
            throw new Error("Failed to fetch services");
        }
        const services = await response.json();
        renderServices(services);

    } catch (error) {
        console.error("Error fetching services:", error);
    }
}
//-------------------
function renderServices(services) {
    servicesContainer.innerHTML = "";
    services.forEach(service => {

        const card = document.createElement("div");
        card.classList.add("servicePage-service-card");

        card.setAttribute("data-id", service.id);
        card.setAttribute("data-name", service.name);
        card.setAttribute("data-price", service.price);
        card.setAttribute("data-duration", service.duration);
        card.setAttribute("data-category", service.category);

        card.innerHTML = `
            <h3 class="servicePage-service-name">${service.name}</h3>
            <p>${service.duration} min</p>
            <span>₹${service.price}</span>
            <button class="service-add-btn">Add</button>
        `;

        servicesContainer.appendChild(card);
    });

    attachAddButtonListeners();
}
// -------------------
