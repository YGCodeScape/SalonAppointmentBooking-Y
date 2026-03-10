 // ═══════════════════════════════════════════════
    // MOBILE CART PAGE  –  cart-page.js (inline)
    // Reads cart data from sessionStorage key: "mobileCart"
    // Written by services page JS as JSON array of:
    //   { service_id, service_name, price, duration, category }
    // ═══════════════════════════════════════════════

    const CART_KEY = 'mobileCart';

    // ── helpers ──
    function formatPrice(n) {
      return '₹' + Number(n).toLocaleString('en-IN');
    }

    function getCart() {
      try {
        return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
      } catch { return []; }
    }

    function saveCart(cart) {
      sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // ── remove item ──
    function removeItem(serviceId) {
      let cart = getCart();
      cart = cart.filter(s => String(s.service_id) !== String(serviceId));
      saveCart(cart);
      renderCart();

      // also sync back to services page (so add btn un-highlights when user navigates back)
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    }

    // ── render ──
    function renderCart() {
      const cart = getCart();
      const list = document.getElementById('cartItemsList');
      const emptyState = document.getElementById('cartEmptyState');
      const itemsLabel = document.getElementById('itemsLabel');
      const summaryCard = document.getElementById('cartSummaryCard');
      const bookBtn = document.getElementById('cartBookBtn');
      const badge = document.getElementById('cartCountBadge');

      list.innerHTML = '';

      if (cart.length === 0) {
        emptyState.style.display = 'flex';
        itemsLabel.style.display = 'none';
        summaryCard.style.display = 'none';
        bookBtn.disabled = true;
        badge.textContent = '0 items';
        return;
      }

      emptyState.style.display = 'none';
      itemsLabel.style.display = 'block';
      summaryCard.style.display = 'block';
      bookBtn.disabled = false;
      badge.textContent = cart.length + (cart.length === 1 ? ' item' : ' items');

      // render each card
      cart.forEach((service, idx) => {
        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.style.animationDelay = (idx * 0.06) + 's';
        card.innerHTML = `
          <div class="cart-item-info">
            <div class="cart-item-name">${service.service_name}</div>
            <div class="cart-item-meta">
              <i class="ri-time-line"></i>
              ${service.duration ? service.duration + ' min' : ''}
              ${service.category ? ' &nbsp;·&nbsp; ' + service.category : ''}
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">${formatPrice(service.price)}</span>
            <button class="cart-item-remove" onclick="removeItem('${service.service_id}')" aria-label="Remove">
              <i class="ri-delete-bin-6-line"></i>
            </button>
          </div>
        `;
        list.appendChild(card);
      });

      // summary
      const subtotal = cart.reduce((sum, s) => sum + Number(s.price), 0);
      document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
      document.getElementById('summaryDiscount').textContent = '—';
      document.getElementById('summaryTotal').textContent = formatPrice(subtotal);
    }

    // ── back navigation ──
    function goBack() {
      if (document.referrer && document.referrer.includes('services')) {
        history.back();
      } else {
        window.location.href = './services.html';
      }
    }

    // ── proceed to booking ──
    function proceedToBooking() {
      const cart = getCart();
      if (!cart.length) return;
      // pass cart to booking page via sessionStorage
      sessionStorage.setItem('bookingServices', JSON.stringify(cart));
      window.location.href = './booking.html';
    }

    // init
    renderCart();