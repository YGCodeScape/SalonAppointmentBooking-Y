document.addEventListener("DOMContentLoaded", async function () {

    if (typeof API_BASE_URL === "undefined") {
        console.error("API_BASE_URL is not defined!");
        return;
    }

    // ===============================
    // STORAGE DATA
    // ===============================

    const signupUser = JSON.parse(localStorage.getItem("signupUser"));
    const token = localStorage.getItem("jwtToken");

    const isSignupMode = !!signupUser;
    const isEditMode = !isSignupMode && !!token;

    // ===============================
    // ELEMENTS
    // ===============================

    const nameInput = document.getElementById("profileNameInput");
    const emailInput = document.getElementById("profileEmailInput");
    const ageInput = document.getElementById("profileNumberInput");
    const dobInput = document.getElementById("profileDOBInput");
    const anniversaryInput = document.getElementById("profileAnniInput");
    const displayName = document.getElementById("profileNameDisplay");
    const displayNumber = document.getElementById("profileNumberDisplay");

    const genderBoxes = document.querySelectorAll(".gender-box");
    const saveBtn = document.getElementById("profileSaveBtn");
    const skipBtn = document.getElementById("profileSkipBtn");

    let selectedGender = null;
    let genderLocked = false;

    // ===============================
    // AUTO FILL (SIGNUP MODE)
    // ===============================

    if (isSignupMode) {
        nameInput.value = signupUser.full_name || "";
        emailInput.value = signupUser.email || "";
        displayName.innerText = signupUser.full_name || "";
        displayNumber.innerText = signupUser.mobile || "";
    }

    // ===============================
    // AUTO FETCH (EDIT MODE)
    // ===============================

    if (isEditMode) {
        try {
            const response = await fetch(`${API_BASE_URL}/getProfile.php`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();

            if (data.status === "success") {

                const user = data.user;

                nameInput.value = user.full_name || "";
                emailInput.value = user.email || "";
                ageInput.value = user.age || "";
                dobInput.value = user.dob || "";
                anniversaryInput.value = user.anniversary || "";

                displayName.innerText = user.full_name || "";
                displayNumber.innerText = user.mobile || "";

                // Lock gender if already set
                if (user.gender) {
                    selectedGender = user.gender;
                    genderLocked = true;

                    genderBoxes.forEach(box => {
                        if (box.dataset.value === user.gender) {
                            box.classList.add("active");
                        }
                        box.style.pointerEvents = "none";
                        box.style.opacity = "0.6";
                    });
                }
            }

        } catch (err) {
            console.error("Profile fetch error:", err);
        }
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

    // ===============================
    // SAVE PROFILE
    // ===============================

    saveBtn.addEventListener("click", async function () {

        const profileData = {
            email: emailInput.value.trim(),
            full_name: nameInput.value.trim(),
            gender: selectedGender,
            age: ageInput.value ? parseInt(ageInput.value) : null,
            dob: dobInput.value || null,
            anniversary: anniversaryInput.value || null
        };

        if (!profileData.full_name || !profileData.email) {
            alert("Name and Email are required");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/updateProfile.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(isSignupMode || isEditMode ? { "Authorization": "Bearer " + token } : {})
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.status === "success") {

                // Save latest user locally
                localStorage.setItem("currentUser", JSON.stringify(data.user));

                // ===============================
                // SIGNUP FLOW → LOGIN
                // ===============================
                if (isSignupMode) {
                    localStorage.removeItem("signupUser");
                    window.location.href = "../html/login.html";
                    return;
                }

                // ===============================
                // EDIT FLOW → INDEX
                // ===============================
                if (isEditMode) {
                    window.location.href = "../index.html";
                    return;
                }

            } else {
                alert(data.message || "Update failed");
            }

        } catch (error) {
            console.error("Profile Update Error:", error);
            alert("Something went wrong.");
        }
    });

    // ===============================
    // SKIP BUTTON
    // ===============================

    skipBtn.addEventListener("click", function (e) {
        e.preventDefault();

        if (isSignupMode) {
            window.location.href = "../html/login.html";
        } else {
            window.location.href = "../index.html";
        }
    });

});