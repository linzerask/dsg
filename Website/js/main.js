import { Router } from './router.js?v=1790560000210';
import { Store } from './store.js?v=1790560000181';

const initApp = () => {
  Store.init();
  Router.init();

  // Mobile Drawer logic
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const openBtn = document.getElementById('open-drawer');
  const closeBtn = document.getElementById('close-drawer');

  const openDrawer = () => {
    if (overlay) overlay.classList.add('active');
    anime({
      targets: drawer,
      right: 0,
      duration: 500,
      easing: 'spring(1, 80, 10, 0)'
    });
  };

  const closeDrawer = () => {
    if (overlay) overlay.classList.remove('active');
    anime({
      targets: drawer,
      right: '-100%',
      duration: 350,
      easing: 'easeInQuad'
    });
  };

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);
  
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Smart dynamic auto-hiding floating navigation
  const floatingNav = document.querySelector('.floating-nav');
  let lastScrollY = window.scrollY;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Always visible at the top
    if (currentScrollY <= 20) {
      floatingNav?.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Scroll Down -> Slide out
    if (currentScrollY > lastScrollY + scrollThreshold && currentScrollY > 60) {
      floatingNav?.classList.add('nav-hidden');
    }
    // Scroll Up -> Slide in
    else if (currentScrollY < lastScrollY - scrollThreshold) {
      floatingNav?.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    floatingNav?.classList.remove('nav-hidden');
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

