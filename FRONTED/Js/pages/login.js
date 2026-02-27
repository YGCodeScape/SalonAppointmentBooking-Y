// ===============================
// LOGIN.JS - PRODUCTION READY
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  if (typeof API_BASE_URL === 'undefined') {
    console.error("API_BASE_URL is not defined!");
    return;
  }

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const mobileInput = document.getElementById("mobile");
  const passwordInput = document.getElementById("password");
  const submitBtn = form.querySelector("button");

  let attempts = 0;
  const maxAttempts = 3;

  // ===============================
  // ALREADY LOGGED IN CHECK
  // ===============================
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("currentUser");

  if (token && currentUser) {
    window.location.href = "../index.html";
    return;
  }

  // ===============================
  // LOGIN SUBMIT
  // ===============================
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email && !mobile) {
      alert("Please enter Email or Mobile number");
      return;
    }

    if (!password) {
      alert("Please enter password");
      return;
    }

    const identifier = email || mobile;

    try {

      // Clear old session
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");

      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier,
          password
        })
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok && data.status === "success") {

        // ===============================
        // STORE SESSION DATA
        // ===============================
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        // Clear temporary signup user
        localStorage.removeItem("signupUser");

        alert("Login successful!");

        window.location.href = "../index.html";

      } else {

        attempts++;
        alert(data.message || "Invalid credentials");

        if (attempts >= maxAttempts) {
          alert("Too many failed attempts! Try again later.");
          submitBtn.disabled = true;
        }
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    }
  });

  // ===============================
  // INPUT LOGIC
  // ===============================

  emailInput.addEventListener("input", function () {
    mobileInput.disabled = this.value.length > 0;
    if (this.value.length === 0) mobileInput.disabled = false;
  });

  mobileInput.addEventListener("input", function () {
    emailInput.disabled = this.value.length > 0;
    if (this.value.length === 0) emailInput.disabled = false;

    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

});

// ===============================
// TOGGLE PASSWORD
// ===============================
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}