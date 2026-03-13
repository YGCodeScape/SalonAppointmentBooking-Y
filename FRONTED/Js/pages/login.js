// ===============================
// LOGIN.JS (API Integrated)
// ===============================
document.addEventListener("DOMContentLoaded", function () {

  if (typeof API_BASE_URL === "undefined") {
    showError("API configuration error.");
    return;
  }

  const form = document.getElementById("loginForm");
  const mobileInput = document.getElementById("mobile");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const token = localStorage.getItem("access_token");

  // disable/enable fields based on input/focus
  if (mobileInput && emailInput) {
      const updateState = () => {
          if (mobileInput.value.trim()) {
              emailInput.disabled = true;
              emailInput.value = "";
          } else {
              emailInput.disabled = false;
          }
          if (emailInput.value.trim()) {
              mobileInput.disabled = true;
              mobileInput.value = "";
          } else {
              mobileInput.disabled = false;
          }
      };

      mobileInput.addEventListener("input", updateState);
      emailInput.addEventListener("input", updateState);

      mobileInput.addEventListener("focus", () => {
          emailInput.disabled = true;
          emailInput.value = "";
      });
      emailInput.addEventListener("focus", () => {
          mobileInput.disabled = true;
          mobileInput.value = "";
      });

      // restrict mobile to digits only (like signup)
      mobileInput.addEventListener("input", function () {
          this.value = this.value.replace(/\D/g, "").slice(0, 10);
          updateState();
      });
  }

  if (token) {
    window.location.href = "../index.html";
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const mobile = mobileInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // require password plus either mobile or email
    if ((!mobile && !email) || !password) {
      showError("Please provide email or mobile number and password.");
      return;
    }

    try {

      // build payload depending on which identifier is provided
      const payload = {
        password: password,
        login_type: "CUSTOMER",
        salon_id: 1
      };
      if (mobile) {
        payload.phone = mobile;
      } else {
        payload.email = email;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();


      if (data.status === "success") {

        const accessToken = data.data.access_token;
        const refreshToken = data.data.refresh_token;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        await showSuccess("Login successful");
        window.location.href = "../index.html";

      } else {
        showError(data.message || "Login failed");
      }

    } catch (error) {
      showError("Server error. Please try again.");
    }
  });
});
  // Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}