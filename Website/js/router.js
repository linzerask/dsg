import { viewHome, bindHome } from './views/home.js?v=1790560000170';
import { viewNews, bindNews } from './views/news.js?v=1790560000190';
import { viewLiga, bindLigaTabs } from './views/liga.js?v=1790560000230';
import { viewArchiv } from './views/simpleViews.js?v=1790560000099';
import { viewOrganisation, bindOrganisation } from './views/organisation.js?v=1790560000099';
import { viewGalerie, bindGalerie } from './views/galerie.js?v=1790560000099';
import { viewStatistiken, bindStatistiken } from './views/statistiken.js?v=1790560000240';
import { viewAdmin, bindAdmin } from './views/admin.js?v=1790560000290';
import { viewArticle, bindArticle } from './views/article.js?v=1790560000099';
import { viewImpressum } from './views/impressum.js?v=1790560000099';
import { viewDatenschutz } from './views/datenschutz.js?v=1790560000099';

const routes = {
  '/': { render: () => viewHome(), bind: () => bindHome() },
  '/liga': { render: () => viewLiga(), bind: () => bindLigaTabs() },
  '/news': { render: () => viewNews(), bind: () => bindNews() },
  '/statistiken': { render: () => viewStatistiken(), bind: () => bindStatistiken() },
  '/organisation': { render: () => viewOrganisation(), bind: () => bindOrganisation() },
  '/galerie': { render: () => viewGalerie(), bind: () => bindGalerie() },
  '/archiv': { render: () => viewArchiv() },
  '/impressum': { render: () => viewImpressum() },
  '/datenschutz': { render: () => viewDatenschutz() },
  '/admin': { 
    render: () => {
      if(sessionStorage.getItem('dsg_admin') === 'true') return viewAdmin();
      return `
        <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
          <div class="glass-card stagger-item" style="text-align: center; max-width: 400px; width: 100%;">
            <h2 style="margin-bottom: var(--space-md);">Verwaltung Login</h2>
            <input type="password" id="pin-input" placeholder="PIN eingeben" style="width: 100%; padding: var(--space-sm); background: var(--color-surface); border: var(--glass-border); color: var(--color-text-primary); text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; border-radius: 4px; margin-bottom: var(--space-md);">
            <button id="pin-btn" style="width: 100%; background: var(--color-accent); color: #fff; font-weight: 700; padding: var(--space-sm); border-radius: 4px;">Login</button>
          </div>
        </div>
      `;
    },
    bind: () => {
      if(sessionStorage.getItem('dsg_admin') === 'true') {
        bindAdmin();
      } else {
        document.getElementById('pin-btn')?.addEventListener('click', () => {
          if(document.getElementById('pin-input').value === '1111') {
            sessionStorage.setItem('dsg_admin', 'true');
            Router.handleRoute(); // re-render
          } else {
            alert('Falscher PIN');
          }
        });
      }
    }
  }
};

export const Router = {
  currentPath: null,
  currentRawPath: null,
  scrollPositions: new Map(),
  isPopState: false,
  isNavigating: false,
  
  init() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.Router = this;

    window.addEventListener('popstate', () => {
      this.isPopState = true;
    });

    window.addEventListener('hashchange', () => {
      this.handleRoute(false);
    });

    window.addEventListener('scroll', () => {
      if (!this.isNavigating && this.currentRawPath) {
        this.scrollPositions.set(this.currentRawPath, window.scrollY);
      }
    }, { passive: true });

    window.addEventListener('data-updated', () => this.handleRoute(true));
    this.handleRoute(false);
  },

  handleRoute(isDataRefresh = false) {
    const rawPath = window.location.hash.slice(1) || '/';
    let path = rawPath.split('?')[0];
    let params = null;
    let route = routes['/'];

    // Save scroll position of previous route before leaving
    if (this.currentRawPath && this.currentRawPath !== rawPath && !isDataRefresh) {
      this.scrollPositions.set(this.currentRawPath, window.scrollY);
    }

    this.isNavigating = true;

    if (rawPath.startsWith('/article/')) {
      path = '/article';
      const rawArticleId = rawPath.replace(/^\/article\//, '').split('?')[0];
      params = decodeURIComponent(rawArticleId);
      route = { render: () => viewArticle(params), bind: bindArticle };
    } else {
      route = routes[path] || routes['/'];
    }
    
    const app = document.getElementById('app');
    const floatingNav = document.querySelector('.floating-nav');
    
    const renderNewView = () => {
      this.currentPath = path;
      this.currentRawPath = rawPath;
      app.innerHTML = route.render();
      if(route.bind) route.bind();
      
      // Clean up any detached admin modals on body when leaving admin
      if (path !== '/admin') {
        document.querySelectorAll('#player-modal, #team-modal, #round-modal, #add-game-modal, #league-modal, #league-data-modal, #game-modal, #report-modal').forEach(m => m.remove());
      }

      // Update nav active state
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + (path === '/' ? '/' : path));
      });

      // Update document title
      const titleMap = {
        '/': 'Home',
        '/news': 'News',
        '/liga': 'Liga',
        '/organisation': 'Organisation',
        '/galerie': 'Galerie',
        '/archiv': 'Archiv',
        '/admin': 'Admin',
        '/article': 'News',
        '/impressum': 'Impressum',
        '/datenschutz': 'Datenschutz'
      };
      const pageTitle = titleMap[path] || 'Home';
      document.title = `${pageTitle} | DSG Fussball Diözese Linz`;

      // Handle Scroll Position:
      // If navigating back/forward (popstate) and position was saved, restore it.
      // Otherwise, always reset scroll cleanly to the top (0, 0).
      const wasPopState = this.isPopState;
      const targetScrollY = (wasPopState && this.scrollPositions.has(rawPath)) 
        ? this.scrollPositions.get(rawPath) 
        : 0;
      this.isPopState = false;

      window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
        setTimeout(() => {
          window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });
          this.isNavigating = false;
        }, 50);
      });

      // Ensure floating nav is visible on new page load
      floatingNav?.classList.remove('nav-hidden');

      // Animate in
      anime({
        targets: '.stagger-item, .liga-row, .masonry-item',
        opacity: [0, 1],
        translateY: [25, 0],
        delay: anime.stagger(80),
        easing: 'spring(1, 80, 10, 0)',
        duration: 800
      });
    };

    // Animate out if content exists and it's not a background data refresh
    if (app.children.length > 0 && !isDataRefresh && this.currentPath !== path) {
      anime({
        targets: app.children,
        opacity: [1, 0],
        translateY: [0, 15],
        duration: 200,
        easing: 'easeInCubic',
        complete: () => {
          renderNewView();
        }
      });
    } else {
      renderNewView();
    }
  }
};
