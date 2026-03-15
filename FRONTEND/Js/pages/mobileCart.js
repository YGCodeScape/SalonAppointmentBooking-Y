// ===============================
// MOBILE CART PAGE
// ===============================

document.addEventListener("DOMContentLoaded", initCartPage);

function initCartPage() {

  fetchSalonInfo();
  renderCart();
  document
    .getElementById("cartBackBtn")
    .addEventListener("click", goBack);
  document
    .getElementById("cartBookBtn")
    .addEventListener("click", proceedToBooking);
}

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
            /* ── Page / browser title ── */
        if (salon.salon_name) {
            document.title = `${salon.salon_name} | Services Cart`;
        }
}
// ===============================
// FORMAT PRICE
// ===============================
function formatPrice(n) {

  return "₹" + Number(n).toLocaleString("en-IN");

}

// ===============================
// REMOVE ITEM
// ===============================
function removeItem(serviceId) {

      CartManager.removeService(serviceId);
    renderCart(); // re-render list + totals

}

// ===============================
// RENDER CART
// ===============================
function renderCart() {

  const cart = CartManager.getCart();

  const list = document.getElementById("cartItemsList");
  const badge = document.getElementById("cartCountBadge");
  const empty = document.getElementById("cartEmptyState");

  list.innerHTML = "";

  if (!cart.length) {

    empty.style.display = "flex";
    badge.textContent = "0 items";

    return;

  }

  empty.style.display = "none";

  badge.textContent =
    cart.length + (cart.length === 1 ? " item" : " items");

  cart.forEach(service => {

    const card = document.createElement("div");

    card.className = "cart-item-card";

    card.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${service.service_name}</div>
        <div class="cart-item-meta">
          <i class="ri-time-line"></i>
          ${service.duration} min
        </div>
      </div>

      <div class="cart-item-right">

        <span class="cart-item-price">
          ${formatPrice(service.price)}
        </span>

        <button
          class="cart-item-remove"
          onclick="removeItem('${service.service_id}')">

          <i class="ri-delete-bin-6-line"></i>

        </button>

      </div>
    `;

    list.appendChild(card);

  });

    updateSummary(cart);
    updateDesktopSync();
}

// ===============================
// SUMMARY
// ===============================
function updateSummary(cart) {

  const subtotal = cart.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  document.getElementById(
    "summarySubtotal"
  ).textContent = formatPrice(subtotal);

  document.getElementById(
    "summaryTotal"
  ).textContent = formatPrice(subtotal);

}

// ===============================
// BACK
// ===============================
function goBack() {
  CartManager.clearAll();
  window.location.href = "./services.html";
}

// ===============================
// BOOKING
// ===============================
function proceedToBooking() {

  const cart = CartManager.getCart();

  if (!cart.length) return;

  CartManager.sendToBooking();

  window.location.href = "./booking.html";
}
function updateDesktopSync(){

    // optional but useful
    window.dispatchEvent(new Event("cartUpdated"));

}