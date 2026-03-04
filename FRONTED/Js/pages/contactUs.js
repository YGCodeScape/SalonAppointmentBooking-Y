// ══════════════════════════════════════════════
//  contactUs.js  —  APEX Salons
// ══════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────
const API_BASE = 'https://api.apexsalons.com'; // change to your real base URL

// ── STATE ───────────────────────────────────────
let selectedRating = 0;

// ══════════════════════════════════════════════
//  1.  INIT  (runs on DOMContentLoaded)
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  fetchContactInfo();
  initStarRating();
});

// ══════════════════════════════════════════════
//  3.  FETCH CONTACT INFO  → render dynamically
// ══════════════════════════════════════════════
async function fetchContactInfo() {
  try {
    const res  = await fetch(`${API_BASE}/contact-info`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    renderContactInfo(data);

  } catch (err) {
    console.warn('Could not fetch contact info, using static fallback.', err);
    renderContactInfo(getFallbackContactInfo());
  }
}

// ── Render address, phones, emails, social links ──
function renderContactInfo(data) {
  renderAddress(data.address);
  renderSocials(data.socials);
  renderPhoneCard(data.phones);
  renderEmailCard(data.emails);
  renderMapEmbed(data.mapEmbedUrl);
}

function renderAddress(address) {
  const p = document.querySelector('.address-text p');
  if (!p || !address) return;
  p.innerHTML = `${address.line1},<br>${address.line2},<br>${address.city}`;
}

function renderSocials(socials) {
  if (!socials) return;

  const fb = document.querySelector('.social-row .facebook');
  const ig = document.querySelector('.social-row .instagram');
  const tw = document.querySelector('.social-row .x');

  if (fb && socials.facebook) fb.href = socials.facebook;
  if (ig && socials.instagram) ig.href = socials.instagram;
  if (tw && socials.twitter)   tw.href = socials.twitter;
}

function renderPhoneCard(phones) {
  if (!phones || !phones.length) return;

  const card = document.querySelectorAll('.contact-card')[0];
  if (!card) return;

  const infoDiv = card.querySelector('.contact-cart-info');
  const primary = phones[0];

  infoDiv.innerHTML = `
    <p>${phones.map(p => `+${p}`).join('<br>')}</p>
    <a href="tel:+${primary}" class="contact-btn">Call Now</a>
  `;
}

function renderEmailCard(emails) {
  if (!emails || !emails.length) return;

  const card = document.querySelectorAll('.contact-card')[1];
  if (!card) return;

  const infoDiv = card.querySelector('.contact-cart-info');
  const primary = emails[0];

  infoDiv.innerHTML = `
    <p>${emails.join('<br>')}</p>
    <a href="mailto:${primary}" class="contact-btn">Send Email</a>
  `;
}

function renderMapEmbed(embedUrl) {
  if (!embedUrl) return;
  const iframe = document.querySelector('.map-container iframe');
  if (iframe) iframe.src = embedUrl;
}

// ── Static fallback data (mirrors HTML) ─────────
function getFallbackContactInfo() {
  return {
    address: {
      line1 : 'Shop Number G 10 Shiv Shankar, Plot No.1',
      line2 : 'Sector 7, Airoli, Navi Mumbai',
      city  : 'Maharashtra 400708',
    },
    phones : ['910887997278', '919897867453'],
    emails : ['apexsalonsinfo@gmail.com'],
    socials: {
      facebook : 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter  : 'https://twitter.com',
    },
    mapEmbedUrl: null, // keeps iframe src unchanged
  };
}

// ══════════════════════════════════════════════
//  4.  STAR RATING
// ══════════════════════════════════════════════
function initStarRating() {
  const stars = document.querySelectorAll('.star');

  stars.forEach(star => {
    // hover
    star.addEventListener('mouseenter', () => highlightStars(+star.dataset.i));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating));

    // click / select
    star.addEventListener('click', () => {
      selectedRating = +star.dataset.i;
      highlightStars(selectedRating);
    });
  });
}

function highlightStars(upTo) {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    const i    = +star.dataset.i;
    const icon = star.querySelector('i');

    if (i <= upTo) {
      icon.classList.replace('ri-star-line', 'ri-star-fill');
      star.style.transform = 'scale(1.2)';
    } else {
      icon.classList.replace('ri-star-fill', 'ri-star-line');
      star.style.transform = 'scale(1)';
    }
  });
}

// ══════════════════════════════════════════════
//  5.  SUBMIT FEEDBACK
// ══════════════════════════════════════════════
async function submitFeedback() {
  const comment    = document.querySelector('.comment-box').value.trim();
  const submitBtn  = document.querySelector('.submit-btn');

  // ── validation ──
  if (!selectedRating) {
    showToast('Please select a star rating ⭐', 'warning');
    return;
  }
  if (!comment) {
    showToast('Please write a comment before submitting 📝', 'warning');
    return;
  }

  const payload = {
    rating : selectedRating,
    comment,
    userId : getUserId(),           // null if guest
    page   : 'contactUs',
    createdAt: new Date().toISOString(),
  };

  // ── loading state ──
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // ── success ──
    showToast('Thank you for your feedback! 🙌', 'success');
    resetFeedbackForm();

  } catch (err) {
    console.error('Feedback submission failed:', err);
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Feedback';
  }
}

function resetFeedbackForm() {
  selectedRating = 0;
  highlightStars(0);
  document.querySelector('.comment-box').value = '';
}

// ══════════════════════════════════════════════
//  6.  HELPERS
// ══════════════════════════════════════════════

/** Returns the logged-in user's id, or null for guests */
function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Simple toast notification */
function showToast(message, type = 'success') {
  // remove any existing toast
  document.querySelector('.apex-toast')?.remove();

  const colors = {
    success: 'linear-gradient(135deg,#ff2d6e,#ff4d82)',
    warning: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    error  : 'linear-gradient(135deg,#ef4444,#f87171)',
  };

  const toast = document.createElement('div');
  toast.className = 'apex-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position       : 'fixed',
    bottom         : '30px',
    left           : '50%',
    transform      : 'translateX(-50%) translateY(80px)',
    background     : colors[type] || colors.success,
    color          : '#fff',
    padding        : '14px 28px',
    borderRadius   : '50px',
    fontFamily     : 'Plus Jakarta Sans, sans-serif',
    fontSize       : '0.95rem',
    fontWeight     : '600',
    boxShadow      : '0 8px 30px rgba(0,0,0,.25)',
    zIndex         : '9999',
    transition     : 'transform .35s cubic-bezier(.34,1.56,.64,1), opacity .35s ease',
    opacity        : '0',
    whiteSpace     : 'nowrap',
  });

  document.body.appendChild(toast);

  // slide in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  // slide out after 3 s
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}