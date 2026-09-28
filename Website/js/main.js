import { Router } from './router.js?v=1790560000110';
import { Store } from './store.js?v=1790560000110';

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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

