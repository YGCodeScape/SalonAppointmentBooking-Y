let salonId = 1;

// ===============================
// INIT APP
// ===============================
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    checkAuth();
    attachGlobalEvents();
    await loadLandingData();
}

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

// ===============================
// LOAD LANDING PAGE DATA
// ===============================
async function loadLandingData() {

    try {
        if (!salonId) {
            console.error("Salon not found");
            return;
        }

        await Promise.all([
            fetchServices(),
            fetchPackages()
        ]);

    } catch (error) {
        console.error("Landing load error:", error);
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

        const data = await res.json();

        if (data.status !== "success") return;

        renderServices(data.data.items.slice(0, 3));

    } catch (error) {

        console.error("Services fetch error:", error);

    }
}

// ===============================
// RENDER SERVICES
// ===============================
function renderServices(services) {

    const container = document.getElementById("servicesContainer");

    if (!container) return;

    container.innerHTML = "";

    const html = services.map(service => `

        <div class="hero-display-service-card">
            <span class="price">₹${service.price}</span>
            <img
                class="service-img"
                src="${IMAGE_BASE + service.image_url}"
                alt="${service.service_name}"
            >
            <div class="display-card-content">
                <h4>${service.service_name}</h4>
                <small>
                    <i class="ri-time-line"></i>
                    ${service.duration} min
                </small>
            </div>
        </div>

    `).join("");

    container.innerHTML = html;
}

// ===============================
// FETCH PACKAGES
// ===============================
async function fetchPackages() {

    try {
        const res = await fetch(
            `${API_BASE_URL}/packages?salon_id=${salonId}`
        );
        const data = await res.json();

        if (data.status !== "success") return;

        renderPackages(data.data.items.slice(0, 3));

    } catch (error) {

        console.error("Packages fetch error:", error);

    }
}

// ===============================
// RENDER PACKAGES
// ===============================
function renderPackages(packages) {

    const container =
        document.getElementById("packagesContainer");

    if (!container) return;

    container.innerHTML = "";

    const html = packages.map(pkg => `

        <div class="hero-display-package-card">
            <span class="price">
                ₹${pkg.total_price}
            </span>
            <span class="active-badge">Active</span>
            <img
                src="${IMAGE_BASE + pkg.image_url}"
                alt="${pkg.package_name}"
            >
            <div class="display-card-content">
                <h4>${pkg.package_name}</h4>
                <small>
                    Valid ${pkg.validity_days} days
                </small>
            </div>
        </div>

    `).join("");

    container.innerHTML = html;
}

// ===============================
// LOGOUT
// ===============================
async function logout() {

    const refreshToken =
        localStorage.getItem("refresh_token");

    try {

        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

    } catch (error) {
        console.warn("Logout API failed");
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.reload();
}

// ===============================
// LOGIN REDIRECT
// ===============================
function redirectToLogin() {

    const token =
        localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "./html/login.html";
    }

}

// ===============================
// GLOBAL EVENTS
// ===============================
function attachGlobalEvents() {

    document.addEventListener("click", (e) => {

        if (e.target.closest(".hero-display-service-card")) {
            window.location.href = "./html/services.html";
        }

        if (e.target.closest(".hero-display-package-card")) {
            window.location.href = "./html/packages.html";
        }

    });

}