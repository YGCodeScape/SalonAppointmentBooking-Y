// ===============================
// PROFILE INFO PAGE
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof API_BASE_URL === "undefined") {
        console.error("API_BASE_URL not found");
        return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
        showWarning("Please login to access your profile");
        setTimeout(() => {
           window.location.href = "./login.html";
        }, 1500);
        return;
    }

    // ===============================
    // ELEMENTS
    // ===============================

    const nameInput = document.getElementById("profileNameInput");
    const emailInput = document.getElementById("profileEmailInput");
    const phoneDisplay = document.getElementById("profileNumberDisplay");
    const cityInput = document.getElementById("profileCityInput");
    const dobInput = document.getElementById("profileDOBInput");
    const anniversaryInput = document.getElementById("profileAnniInput");

    const displayName = document.getElementById("profileNameDisplay");

    const genderBoxes = document.querySelectorAll(".gender-box");
    const genderWrapper = document.getElementById("genderBoxWrapper");

    const ageInput = document.getElementById("profileAgeInput");
    const preferencesInput = document.getElementById("profilePreferencesInput");

    const saveBtn = document.getElementById("profileSaveBtn");

    // calculate age based on dob string (YYYY-MM-DD)
    function calculateAge(dob) {
        if (!dob) return "";
        const birth = new Date(dob);
        if (isNaN(birth)) return "";
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    let selectedGender = null;
    let genderLocked = false;
    let customerId = null;

    // ===============================
    // GET CURRENT USER
    // ===============================

    try {

        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const meData = await meRes.json();

        if (meData.status !== "success") {
            throw new Error("Auth failed");
        }

        customerId = meData.data.customer_id;

    } catch (error) {
        console.error("Auth error:", error);
         localStorage.removeItem("access_token");
         showError("Session expired. Please login again.");
         setTimeout(()=>{
             window.location.href = "./login.html";
         },1500);
    }

    // ===============================
    // FETCH CUSTOMER PROFILE
    // ===============================

    try {

        const profileRes = await fetch(
            `${API_BASE_URL}/customers/view/${customerId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const profileData = await profileRes.json();

        if (profileData.status !== "success") return;

        const user = profileData.data;

        nameInput.value = user.name || "";
        emailInput.value = user.email || "";
        dobInput.value = user.date_of_birth || "";
        cityInput.value = user.address || "";
        anniversaryInput.value = user.anniversary_date || "";

        displayName.innerText = user.name || "";
        phoneDisplay.innerText = user.phone || "";

        // calculate and display age from DOB (frontend only)
        if (ageInput) {
            ageInput.value = calculateAge(user.date_of_birth);
        }

        // populate preferences from backend
        if (preferencesInput) {
            preferencesInput.value = user.preferences || "";
        }

        // ===============================
        // GENDER SELECT
        // ===============================

        // Pre-select from backend — handle empty/null/undefined safely
        if (user.gender && user.gender.trim() !== "") {
            genderLocked = true;
            selectedGender = user.gender.trim().toLowerCase();

            if (genderWrapper) {
                genderWrapper.classList.add("locked");
            }

            genderBoxes.forEach(box => {
                // normalize both sides to lowercase for safe comparison
                if (box.dataset.value.toLowerCase() === selectedGender) {
                    box.classList.add("active");
                } else {
                    box.classList.remove("active"); // clear any stale active state
                }
            });

        } else {
            // Gender not set — allow selection, clear any stale active state
            genderLocked = false;
            selectedGender = null;
            genderBoxes.forEach(b => b.classList.remove("active"));
        }

    } catch (error) {
        showError("Unable to load profile information.");
    }

    // Click handler
    genderBoxes.forEach(box => {
        box.addEventListener("click", () => {
            if (genderLocked) return;

            genderBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            selectedGender = box.dataset.value;
        });
    });

    if (dobInput) {
        dobInput.addEventListener("change", () => {
            if (ageInput) {
                ageInput.value = calculateAge(dobInput.value);
            }
        });
    }

    // ===============================
    // UPDATE PROFILE
    // ===============================

    saveBtn.addEventListener("click", async () => {

        const profileData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            address: cityInput.value.trim(),
            date_of_birth: dobInput.value || null,
            anniversary_date: anniversaryInput.value || null
        };

        if (selectedGender) {
            profileData.gender = selectedGender;
        }

        // include preferences field for storage
        if (preferencesInput) {
            profileData.preferences = preferencesInput.value.trim();
        }

        try {
            showLoading("Updating profile...");
            const res = await fetch(`${API_BASE_URL}/customers/me`, {

                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(profileData)
            });

            const result = await res.json();
            Swal.close();

            if (result.status === "success") {
                await showSuccess("Profile updated successfully");
                window.location.href = "../index.html";
            } 
            else {
               showError(result.message || "Profile update failed");
            }

        } catch (error) {
            Swal.close();
            showError("Something went wrong while updating profile");
        }
    });

    document.getElementById("profileSkipBtn").addEventListener("click", () => {
        if (token) {
            window.location.href = "../index.html";
        }
        else {
           window.location.href = "./html/login.html";
        }
    });

});