/* ── Star rating ── */
  const stars = document.querySelectorAll('.star');
  let selected = 0;

  function renderStars(n) {
    stars.forEach((s, i) => s.classList.toggle('filled', i < n));
  }

  stars.forEach(s => {
    s.addEventListener('mouseenter', () => renderStars(+s.dataset.i));
    s.addEventListener('mouseleave', () => renderStars(selected));
    s.addEventListener('click', () => { selected = +s.dataset.i; renderStars(selected); });
  });

  renderStars(0);

  function submitFeedback() {
    const txt = document.querySelector('.comment-box').value.trim();
    if (!selected) { alert('Please choose a star rating first!'); return; }
    alert(`Thank you for your ${selected}-star feedback!${txt ? '\n\n"' + txt + '"' : ''}`);
    selected = 0;
    renderStars(0);
    document.querySelector('.comment-box').value = '';
  }