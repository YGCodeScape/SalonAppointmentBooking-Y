// ===============================
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    // loadLandingData();
});
const HeroServiceCart = document.querySelectorAll(".hero-display-service-card");
const HeroPackageCart = document.querySelectorAll(".hero-display-package-card");

// ===============================
// AUTH CHECK
// ===============================
function checkAuth() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("currentUser"));

    const loginBtn = document.getElementById("nav-log-btn");
    const signupBtn = document.getElementById("nav-signup-btn");
    const profileDiv = document.getElementById("nav-profile-div");

    if (token && user) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";

        profileDiv.style.display = "flex";

    } else {
        loginBtn.style.display = "inline-block";
        signupBtn.style.display = "inline-block";
        profileDiv.style.display = "none";
    }
}

// ===============================
// LOAD ALL LANDING DATA
// ===============================
async function loadLandingData() {
    try {
        await Promise.all([
            fetchSalonInfo(),
            fetchServices(),
            fetchPackages(),
            fetchGallery()
        ]);
    } catch (error) {
        console.error("Landing load error:", error);
    }
}

// ===============================
// FETCH SALON INFO
// ===============================
async function fetchSalonInfo() {
    try {
        const res = await fetch(`${BASE_URL}/salon`);
        const result = await res.json();

        if (!result.success) return;

        const salon = result.data;

        // Update logo text
        document.querySelector(".logo-text").textContent = salon.name;

        // Update page title
        document.title = salon.name;

    } catch (error) {
        console.error("Salon fetch error:", error);
    }
}

// ===============================
// FETCH SERVICES
// ===============================
async function fetchServices() {
    try {
        const res = await fetch(`${BASE_URL}/services`);
        const result = await res.json();

        if (!result.success) return;

        const services = result.data;
        const container = document.getElementById("servicesContainer");
        container.innerHTML = "";

        services.slice(0, 3).forEach(service => {
            const card = `
                <div class="hero-display-service-card">
                    <span class="price">₹${service.price}</span>
                    <img class="service-img" src="${service.image_url}" alt="${service.name}">
                    <div class="display-card-content">
                        <h4>${service.name}</h4>
                        <small>
                            <i class="ri-time-line"></i> ${service.duration} min
                        </small>
                    </div>
                    <button class="round-add-btn" onclick="redirectToLogin()">
                        <i class="ri-add-fill"></i>
                    </button>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Services fetch error:", error);
    }
}

// ===============================
// FETCH PACKAGES
// ===============================
async function fetchPackages() {
    try {
        const res = await fetch(`${BASE_URL}/packages`);
        const result = await res.json();

        if (!result.success) return;

        const packages = result.data;
        const container = document.getElementById("packagesContainer");
        container.innerHTML = "";

        packages.slice(0, 3).forEach(pkg => {
            const card = `
                <div class="hero-display-package-card">
                    <span class="price">₹${pkg.price}</span>
                    <span class="active-badge">
                        ${pkg.is_active ? "Active" : ""}
                    </span>
                    <img src="${pkg.image_url}" alt="${pkg.name}">
                    <div class="display-card-content">
                        <h4>${pkg.name}</h4>
                        <small>
                            <i class="ri-time-line"></i> ${pkg.duration} min
                        </small>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Packages fetch error:", error);
    }
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.reload();
}

// ===============================
// REDIRECT IF NOT LOGGED
// ===============================
function redirectToLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "./html/login.html";
    }
}

HeroServiceCart.forEach(card => {
    card.addEventListener("click", () => {
        window.location.href = "./html/services.html";
    });
})
HeroPackageCart.forEach(card => {
    card.addEventListener("click", () => {
        window.location.href = "./html/packages.html";
    });
})