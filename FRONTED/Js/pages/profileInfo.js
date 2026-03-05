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
        window.location.href = "./login.html";
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
        window.location.href = "./login.html";
        return;

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
        // preferencesInput.value = user.preferences || "",
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

        if (user.gender && user.gender !== "") {
            genderLocked = true;
            selectedGender = user.gender;

            // lock the whole wrapper using css class instead of inline styles
            if (genderWrapper) {
                genderWrapper.classList.add("locked");
            }

            genderBoxes.forEach(box => {
                if (box.dataset.value === user.gender) {
                    box.classList.add("active");
                }
            });
        }
    } catch (error) {
        console.error("Profile fetch error:", error);
    }

    // ===============================
    // GENDER SELECT
    // ===============================

    genderBoxes.forEach(box => {

        box.addEventListener("click", () => {
            if (genderLocked) return;
            genderBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            selectedGender = box.dataset.value;
        });
    });

    // recalc age when DOB changes
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

            const res = await fetch(`${API_BASE_URL}/customers/me`, {

                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(profileData)

            });

            const result = await res.json();

            if (result.status === "success") {

                alert("Profile updated successfully");

                window.location.href = "../index.html";

            } else {

                alert(result.message || "Update failed");

            }

        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong");
        }
    });

    document.getElementById("profileSkipBtn").addEventListener("click", () => {
        if(token) {
            window.location.href = "../index.html";
        }
        else {
           window.location.href = "./html/login.html";
        }
    })
});