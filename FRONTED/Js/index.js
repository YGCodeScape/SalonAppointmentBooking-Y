// ===============================
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
 // loadLandingData();
//    fetchServices();
//    fetchPackages();
});
const HeroServiceCart = document.querySelectorAll(".hero-display-service-card");
const HeroPackageCart = document.querySelectorAll(".hero-display-package-card");

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
// LOAD ALL LANDING DATA
// ===============================
// async function loadLandingData() {

//     try {
//         await Promise.all([
//             fetchServices(),
//             fetchPackages()
//         ]);
//     } catch (error) {
//         console.error("Landing load error:", error);
//     }
// }


// ===============================
// FETCH SERVICES
// ===============================
async function fetchServices() {
    try {
      const res = await fetch(`${API_BASE_URL}/services`);

      const result = await res.json();

        if (result.status !== "success") return;

        const services = result.data.items;

        const container = document.getElementById("servicesContainer");
        container.innerHTML = "";

        services.slice(0,3).forEach(service => {
            const card = `
                <div class="hero-display-service-card">
                    <span class="price">₹${service.price}</span>
                    <img class="service-img"
                    src="${service.image_url}"
                    alt="${service.service_name}">
                    <div class="display-card-content">
                        <h4>${service.service_name}</h4>
                        <small>
                            <i class="ri-time-line"></i>
                            ${service.duration} min
                        </small>
                    </div>
                    <button class="round-add-btn"
                    onclick="redirectToLogin()">
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
        const res = await fetch(`${API_BASE_URL}/packages`);
        const result = await res.json();
        if (result.status !== "success") return;
         const packages = result.data.items;
         const container = document.getElementById("packagesContainer");

        container.innerHTML = "";

        packages.slice(0,3).forEach(pkg => {
            const card = `
                <div class="hero-display-package-card">
                    <span class="price">
                        ₹${pkg.total_price}
                    </span>
                    <img src="${pkg.image_url}"
                    alt="${pkg.package_name}">
                    <div class="display-card-content">
                        <h4>${pkg.package_name}</h4>
                        <small>
                            Valid ${pkg.validity_days} days
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
        console.error("Logout error:", error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.reload();
}

// ===============================
// REDIRECT IF NOT LOGGED
// ===============================
function redirectToLogin() {
    const token = localStorage.getItem("access_token");
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