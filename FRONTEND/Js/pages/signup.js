// ===============================
// SALON INFO  (public — no token)
// ===============================
async function fetchSalonInfo() {
    try {
        const res  = await fetch(`${API_BASE_URL}/salon/info?salon_id=${salonId}`);
        const data = await res.json();
 
        if (data.status !== "success") return;
 
        populateSalonInfo(data.data);
 
    } catch (err) {
        showError("Could not load salon info");
    }
}
function populateSalonInfo(salon) {
    const wordMark = document.getElementById("logo-text");
        if (wordMark) {
        wordMark.textContent = salon.salon_name ?? wordMark.textContent;
        const words = wordMark.textContent.split(/\s+/);
        if (words.length > 1) {
            const first = words[0];
            const rest = words.slice(1).join(' ');
            wordMark.innerHTML = `${first} <span>${rest}</span>`;
        } else {
            wordMark.innerHTML = wordMark.textContent;
        }
    }
    else {
        showError("Could not load salon name");
    }
    /* ── Page / browser title ── */
    if (salon.salon_name) {
        document.title = `${salon.salon_name} | Sign up`;
    }
}
fetchSalonInfo();

const form = document.getElementById("signupForm");
const mobileInput = document.getElementById("mobile");

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
    showError("Passwords do not match!");
    isValid = false;
  }

  if (!/^\d{10}$/.test(mobile)) {
    showWarning("Mobile number must be exactly 10 digits.");
    isValid = false;
  }

  if (full_name.length < 3) {
    showWarning("Name must be at least 3 characters.");
    isValid = false;
  }

  if (!emailPattern.test(email)) {
    showWarning("Please enter a valid email address.");
    isValid = false;
  }

  if (!strongPattern.test(password)) {
    showWarning("Password must be 8+ characters with uppercase, number & symbol.");
    isValid = false;
  }

  if (!isValid) return;

  // Prepare data
  const userData = {
  name: full_name,
  phone: mobile,
  email: email,
  password: password,
  salon_id: 1
};

  try {
    showLoading("Creating your account...");
    const response = await fetch(`${API_BASE_URL}/customers/register`, {
     method: "POST",
      headers: { 
       "Content-Type": "application/json" 
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error("Server returned an error.");

    const data = await response.json();
    Swal.close();

    if (data.status === "success") {

      await showSuccess("Registration successful! Please login now.");

      form.reset();
      window.location.href = "../html/login.html";

    } else {
      showError(data.message || "Registration failed.");
    }

  } catch (error) {
     Swal.close();
     showError("Something went wrong. Please try again.");
  }
});

// Restrict mobile to numbers only
mobileInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  const span = input.nextElementSibling;
  const icon = span.querySelector('i');

  if (input.type === "password") {
    input.type = "text";
    icon.className = "ri-eye-off-fill";
  } else {
    input.type = "password";
    icon.className = "ri-eye-fill";
  }
}