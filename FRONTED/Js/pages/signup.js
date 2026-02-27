// ===============================
// signup.js (Final + JWT Enabled)
// ===============================

const form = document.getElementById("signupForm");
const mobileInput = document.getElementById("mobile");
const mobileError = document.getElementById("mobileError");
const nameError = document.getElementById("nameError");
const passwordError = document.getElementById("passwordError");

const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const full_name = document.getElementById("fullname").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  let isValid = true;

  // Validations
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    isValid = false;
  }

  if (!/^\d{10}$/.test(mobile)) {
    mobileError.style.display = "block";
    mobileError.textContent = "Mobile number must be exactly 10 digits.";
    setTimeout(() => mobileError.style.display = "none", 3000);
    isValid = false;
  }

  if (full_name.length < 3) {
    nameError.style.display = "block";
    nameError.textContent = "Name must be at least 3 characters.";
    setTimeout(() => nameError.style.display = "none", 3000);
    isValid = false;
  }

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    isValid = false;
  }

  if (!strongPattern.test(password)) {
    passwordError.style.display = "block";
    passwordError.textContent =
      "Password must be 8+ characters with uppercase, number & symbol.";
    setTimeout(() => passwordError.style.display = "none", 3000);
    isValid = false;
  }

  if (!isValid) return;

  // Prepare data
  const userData = { full_name, mobile, email, password };

  try {
    const response = await fetch(`${API_BASE_URL}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error("Server returned an error.");

    const data = await response.json();
    console.log("Register Response:", data);

    if (data.status === "success") {
      // Store temporary signup user
      localStorage.setItem("signupUser", JSON.stringify(data.user));

      // Store JWT token for immediate profile updates
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
      }

      alert("Registration successful! Please complete your profile.");

      form.reset();
      window.location.href = "../html/profileInfo.html";

    } else {
      alert(data.message || "Registration failed.");
    }

  } catch (error) {
    console.error("Signup Error:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Restrict mobile to numbers only
mobileInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}