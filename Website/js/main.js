import { Router } from './router.js?v=1790560300000';
import { Store } from './store.js?v=1790560300000';

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

  // Custom Cursor-Following Floating Tooltip
  initFloatingTooltip();
};

const initFloatingTooltip = () => {
  let tooltipEl = document.getElementById('dsg-floating-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'dsg-floating-tooltip';
    tooltipEl.className = 'dsg-floating-tooltip';
    document.body.appendChild(tooltipEl);
  }

  let activeTarget = null;
  let isVisible = false;

  const updatePosition = (clientX, clientY) => {
    if (!isVisible) return;
    const offset = 14;
    let x = clientX + offset;
    let y = clientY + offset;
    const rect = tooltipEl.getBoundingClientRect();
    const pad = 12;

    if (x + rect.width > window.innerWidth - pad) {
      x = clientX - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight - pad) {
      y = clientY - rect.height - 10;
    }
    if (x < pad) x = pad;
    if (y < pad) y = pad;

    tooltipEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
  };

  const showTooltip = (target, clientX, clientY) => {
    const text = target.getAttribute('data-tooltip');
    if (!text) return;

    activeTarget = target;
    isVisible = true;

    tooltipEl.innerHTML = `
      <div class="tooltip-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div class="tooltip-text">${text}</div>
    `;

    tooltipEl.style.display = 'flex';
    updatePosition(clientX, clientY);

    requestAnimationFrame(() => {
      tooltipEl.classList.add('active');
    });
  };

  const hideTooltip = () => {
    if (!isVisible) return;
    isVisible = false;
    activeTarget = null;
    tooltipEl.classList.remove('active');
    setTimeout(() => {
      if (!isVisible) {
        tooltipEl.style.display = 'none';
        tooltipEl.style.transform = 'translate3d(-9999px, -9999px, 0) scale(0.96)';
      }
    }, 150);
  };

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target, e.clientX, e.clientY);
    }
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      if (!isVisible || activeTarget !== target) {
        showTooltip(target, e.clientX, e.clientY);
      } else {
        updatePosition(e.clientX, e.clientY);
      }
    } else if (isVisible) {
      hideTooltip();
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (!activeTarget) return;
    if (e.target === activeTarget || activeTarget.contains(e.target)) {
      const related = e.relatedTarget;
      if (!related || !activeTarget.contains(related)) {
        hideTooltip();
      }
    }
  }, { passive: true });

  window.addEventListener('scroll', hideTooltip, { passive: true });
  window.addEventListener('hashchange', hideTooltip);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


