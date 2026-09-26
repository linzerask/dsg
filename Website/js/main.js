import { Router } from './router.js';

import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  Router.init();

  // Drawer logic
  const drawer = document.getElementById('mobile-drawer');
  const openBtn = document.getElementById('open-drawer');
  const closeBtn = document.getElementById('close-drawer');

  openBtn.addEventListener('click', () => {
    anime({
      targets: drawer,
      right: 0,
      duration: 600,
      easing: 'spring(1, 80, 10, 0)'
    });
  });

  closeBtn.addEventListener('click', () => {
    anime({
      targets: drawer,
      right: '-100%',
      duration: 400,
      easing: 'easeInQuad'
    });
  });
  
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      anime({
        targets: drawer,
        right: '-100%',
        duration: 400,
        easing: 'easeInQuad'
      });
    });
  });
});
