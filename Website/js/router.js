import { viewHome } from './views/home.js';
import { viewNews, bindNews } from './views/news.js';
import { viewLiga, bindLigaTabs } from './views/liga.js';
import { viewArchiv } from './views/simpleViews.js';
import { viewOrganisation, bindOrganisation } from './views/organisation.js';
import { viewGalerie, bindGalerie } from './views/galerie.js';
import { viewAdmin, bindAdmin } from './views/admin.js?v=1790453000000';
import { viewArticle, bindArticle } from './views/article.js';
import { viewImpressum } from './views/impressum.js';
import { viewDatenschutz } from './views/datenschutz.js';

const routes = {
  '/': { render: viewHome },
  '/liga': { render: viewLiga, bind: bindLigaTabs },
  '/news': { render: viewNews, bind: bindNews },
  '/organisation': { render: viewOrganisation, bind: bindOrganisation },
  '/galerie': { render: viewGalerie, bind: bindGalerie },
  '/archiv': { render: viewArchiv },
  '/impressum': { render: viewImpressum },
  '/datenschutz': { render: viewDatenschutz },
  '/admin': { 
    render: () => {
      if(sessionStorage.getItem('dsg_admin') === 'true') return viewAdmin();
      return `
        <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
          <div class="glass-card stagger-item" style="text-align: center; max-width: 400px; width: 100%;">
            <h2 style="margin-bottom: var(--space-md);">Verwaltung Login</h2>
            <input type="password" id="pin-input" placeholder="PIN eingeben" style="width: 100%; padding: var(--space-sm); background: var(--color-surface); border: var(--glass-border); color: var(--color-text-primary); text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; border-radius: 4px; margin-bottom: var(--space-md);">
            <button id="pin-btn" style="width: 100%; background: var(--color-accent); color: #000; font-weight: 700; padding: var(--space-sm); border-radius: 4px;">Login</button>
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
  
  init() {
    window.addEventListener('hashchange', (e) => this.handleRoute(false));
    window.addEventListener('data-updated', (e) => this.handleRoute(true));
    this.handleRoute(false);
  },

  handleRoute(isDataRefresh = false) {
    const rawPath = window.location.hash.slice(1) || '/';
    let path = rawPath.split('?')[0];
    let params = null;
    let route = routes['/'];

    if (rawPath.startsWith('/article/')) {
      path = '/article';
      params = rawPath.split('/')[2];
      route = { render: () => viewArticle(params), bind: bindArticle };
    } else {
      route = routes[path] || routes['/'];
    }
    
    const app = document.getElementById('app');
    
    const renderNewView = () => {
      app.innerHTML = route.render();
      if(route.bind) route.bind();
      
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

      // Animate in
      anime({
        targets: '.stagger-item, .liga-row, .masonry-item',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(100),
        easing: 'spring(1, 80, 10, 0)',
        duration: 1000
      });
    };

    // Animate out if content exists and it's not a background data refresh
    if (app.children.length > 0 && !isDataRefresh && this.currentPath !== path) {
      anime({
        targets: app.children,
        opacity: [1, 0],
        translateY: [0, 20],
        duration: 300,
        easing: 'easeInCubic',
        complete: () => {
          this.currentPath = path;
          renderNewView();
        }
      });
    } else {
      this.currentPath = path;
      renderNewView();
    }
  }
};
