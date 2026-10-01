import { Router } from './router.js?v=1790560012000';
import { Store } from './store.js?v=1790560012000';

window.Store = Store;

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

  // Theme Toggle Management
  const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const drawerThemeLight = document.getElementById('drawer-theme-light');
  const drawerThemeDark = document.getElementById('drawer-theme-dark');

  const updateThemeUI = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('dsg_theme', theme);
    } catch(e) {}

    // Update Desktop Switcher Icons
    if (themeIconSun && themeIconMoon) {
      if (isDark) {
        themeIconSun.style.display = 'block';
        themeIconMoon.style.display = 'none';
      } else {
        themeIconSun.style.display = 'none';
        themeIconMoon.style.display = 'block';
      }
    }

    // Update Mobile Drawer Buttons
    if (drawerThemeLight && drawerThemeDark) {
      if (isDark) {
        drawerThemeDark.classList.add('active');
        drawerThemeLight.classList.remove('active');
      } else {
        drawerThemeLight.classList.add('active');
        drawerThemeDark.classList.remove('active');
      }
    }
  };

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem('dsg_theme');
      if (saved === 'dark') return 'dark';
    } catch(e) {}
    return 'light';
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || getInitialTheme();
  updateThemeUI(initialTheme);

  // Desktop Toggle Event
  themeToggleDesktop?.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (typeof anime !== 'undefined') {
      anime({
        targets: themeToggleDesktop,
        rotate: '+=180deg',
        duration: 400,
        easing: 'easeInOutQuad'
      });
    }
    updateThemeUI(active);
  });

  // Mobile Drawer Toggle Events
  drawerThemeLight?.addEventListener('click', () => updateThemeUI('light'));
  drawerThemeDark?.addEventListener('click', () => updateThemeUI('dark'));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

