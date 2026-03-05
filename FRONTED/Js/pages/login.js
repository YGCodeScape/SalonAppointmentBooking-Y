// ===============================
// LOGIN.JS (API Integrated)
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  if (typeof API_BASE_URL === "undefined") {
    console.error("API_BASE_URL is not defined!");
    return;
  }

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const token = localStorage.getItem("access_token");

  if (token) {
    window.location.href = "../index.html";
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          login_type: "CUSTOMER",
          salon_id: 1
        })
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.status === "success") {

        const accessToken = data.data.access_token;
        const refreshToken = data.data.refresh_token;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        alert("Login successful");

        window.location.href = "../index.html";

      } else {
        alert(data.message || "Login failed");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
    }

  });

});