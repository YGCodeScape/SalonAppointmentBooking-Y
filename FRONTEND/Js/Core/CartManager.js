/* =========================================
CartManager.js
Single cart system using localStorage
Works for:
- services page
- mobile cart
- booking page
========================================= */

const CART_KEY = "bookingItems";

const CartManager = {

  // ===============================
  // GET CART
  // ===============================
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  // ===============================
  // SAVE CART
  // ===============================
  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  // ===============================
  // TOGGLE SERVICE
  // ===============================
  toggleService(service) {

    let cart = this.getCart();

    const index = cart.findIndex(
      s => String(s.service_id) === String(service.service_id)
    );

    if (index === -1) {
      cart.push(service);
    } else {
      cart.splice(index, 1);
    }

    this.saveCart(cart);

    return cart;
  },

  // ===============================
  // REMOVE SERVICE
  // ===============================
  removeService(serviceId) {

    let cart = this.getCart();

    cart = cart.filter(
      s => String(s.service_id) !== String(serviceId)
    );

    this.saveCart(cart);

    return cart;
  },

  // ===============================
  // CLEAR CART
  // ===============================
  clearCart() {
    localStorage.removeItem(CART_KEY);
  },

  // ===============================
  // TOTAL PRICE
  // ===============================
  getSubtotal() {

    const cart = this.getCart();

    return cart.reduce(
      (sum, s) => sum + Number(s.price),
      0
    );

  },

  // ===============================
  // SEND TO BOOKING
  // ===============================
  sendToBooking() {

    const cart = this.getCart();

    localStorage.setItem(
      "bookingSource",
      "services"
    );

    localStorage.setItem(
      "bookingItems",
      JSON.stringify(cart)
    );
  },

  clearAll(){
    localStorage.removeItem("bookingItems");
    localStorage.removeItem("bookingSource"); 
  }
};