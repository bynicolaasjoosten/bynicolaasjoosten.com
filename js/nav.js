const hamburger = document.querySelector('.topnav__hamburger');
const overlay   = document.querySelector('.nav__overlay');

if (hamburger && overlay) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}
