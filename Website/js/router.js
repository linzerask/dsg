import { viewHome, bindHome } from './views/home.js?v=1793370000000';

import { viewNews, bindNews } from './views/news.js?v=1791305000000';

import { viewLiga, bindLigaTabs } from './views/liga.js?v=1792924000000';

import { viewSpieler, bindSpieler } from './views/spieler.js?v=1792924000000';

import { viewTeams, bindTeams } from './views/teams.js?v=1792924000000';

import { viewArchiv } from './views/simpleViews.js?v=1791305000000';

import { viewOrganisation, bindOrganisation } from './views/organisation.js?v=1791305000000';

import { viewGalerie, bindGalerie } from './views/galerie.js?v=1791305000000';

import { viewStatistiken, bindStatistiken } from './views/statistiken.js?v=1793370000000';

import { viewAdmin, bindAdmin } from './views/admin.js?v=1793250000000';

import { getAuth, loginWithPin, logout } from './auth.js?v=1793127696174';

import { viewTeamAdmin, bindTeamAdmin } from './views/teamAdmin.js?v=1793230000000';

import { viewRefereeAdmin, bindRefereeAdmin } from './views/refereeAdmin.js?v=1793238000000';

import { viewArticle, bindArticle } from './views/article.js?v=1791305000000';

import { viewImpressum } from './views/impressum.js?v=1791305000000';

import { viewDatenschutz, bindDatenschutz } from './views/datenschutz.js?v=1791306000000';



const routes = {

  '/': { render: () => viewHome(), bind: () => bindHome() },

  '/liga': { render: () => viewLiga(), bind: () => bindLigaTabs() },

  '/teams': { render: () => viewTeams(), bind: () => bindTeams() },

  '/vereine': { render: () => viewTeams(), bind: () => bindTeams() },

  '/spieler': { render: () => viewSpieler(), bind: () => bindSpieler() },

  '/kader': { render: () => viewSpieler(), bind: () => bindSpieler() },

  '/news': { render: () => viewNews(), bind: () => bindNews() },

  '/statistiken': { render: () => viewStatistiken(), bind: () => bindStatistiken() },

  '/organisation': { render: () => viewOrganisation(), bind: () => bindOrganisation() },

  '/galerie': { render: () => viewGalerie(), bind: () => bindGalerie() },

  '/archiv': { render: () => viewArchiv() },

  '/impressum': { render: () => viewImpressum() },

  '/datenschutz': { render: () => viewDatenschutz(), bind: () => bindDatenschutz() },

  '/admin': { 

    render: () => {

      const auth = getAuth();

      if (auth.isLoggedIn) {

        if (auth.role === 'admin') return viewAdmin();

        if (auth.role === 'team' || auth.role === 'team_manager') return viewTeamAdmin(auth);

        if (auth.role === 'referee') return viewRefereeAdmin(auth);

      }

      return `

        <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 50vh; padding: var(--space-md);">

          <div class="glass-card stagger-item" style="text-align: center; max-width: 400px; width: 100%; padding: var(--space-xl) var(--space-lg); border-radius: var(--border-radius-md);">

            <h2 style="margin-bottom: var(--space-md); font-size: 1.5rem;">Verwaltung Login</h2>

            <input type="password" id="pin-input" placeholder="PIN eingeben" maxlength="6" autofocus style="width: 100%; padding: var(--space-sm); background: var(--color-surface); border: 1px solid var(--glass-border); color: var(--color-text-primary); text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; border-radius: 4px; margin-bottom: var(--space-md); outline: none;">

            <button id="pin-btn" class="btn-dsg" style="width: 100%; font-weight: 700; padding: var(--space-sm); border-radius: 4px; cursor: pointer;">Login</button>

            <div id="login-error-msg" style="color: #ef4444; font-size: 0.85rem; margin-top: 10px; display: none;"></div>

          </div>

        </div>

      `;

    },

    bind: () => {

      const auth = getAuth();

      if (auth.isLoggedIn) {

        if (auth.role === 'admin') bindAdmin();

        else if (auth.role === 'team' || auth.role === 'team_manager') bindTeamAdmin(auth);

        else if (auth.role === 'referee') bindRefereeAdmin(auth);

      } else {

        const pinInput = document.getElementById('pin-input');

        const pinBtn = document.getElementById('pin-btn');

        const errorMsg = document.getElementById('login-error-msg');



        const doLogin = () => {

          const currentInput = document.getElementById('pin-input');

          const val = (currentInput ? currentInput.value : pinInput?.value || '').trim();

          const res = loginWithPin(val);

          if (res.success) {

            Router.handleRoute();

          } else {

            if (errorMsg) {

              errorMsg.textContent = res.error || 'Ungültiger PIN. Bitte erneut versuchen.';

              errorMsg.style.display = 'block';

            } else {

              alert(res.error || 'Falscher PIN');

            }

            if (pinInput) {

              pinInput.value = '';

              pinInput.focus();

            }

          }

        };



        pinBtn?.addEventListener('click', doLogin);

        pinInput?.addEventListener('keydown', (e) => {

          if (e.key === 'Enter') doLogin();

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



  showLoader(title = 'Wird geladen', subtitle = 'DSG Liga Diözese Linz') {

    const loader = document.getElementById('dsg-global-loader');

    if (!loader) return;

    const titleText = loader.querySelector('.dsg-loader-title-text');

    const subText = loader.querySelector('.dsg-loader-subtitle');

    if (titleText) titleText.textContent = title;

    if (subText) subText.textContent = subtitle;

    loader.classList.add('is-active');

    loader.setAttribute('aria-hidden', 'false');

  },



  hideLoader() {

    const loader = document.getElementById('dsg-global-loader');

    if (!loader) return;

    loader.classList.remove('is-active');

    loader.setAttribute('aria-hidden', 'true');

  },

  

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



    let refreshTimer = null;
    const debouncedRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        this.handleRoute(true);
      }, 60);
    };

    window.addEventListener('data-updated', debouncedRefresh);
    window.addEventListener('leagues-updated', debouncedRefresh);
    window.addEventListener('rounds-updated', debouncedRefresh);

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



    const titleMap = {

      '/': 'Home',

      '/news': 'News',

      '/liga': 'Liga',

      '/statistiken': 'Statistiken',

      '/teams': 'Teams',

      '/vereine': 'Teams',

      '/spieler': 'Spieler',

      '/kader': 'Spieler',

      '/organisation': 'Organisation',

      '/galerie': 'Galerie',

      '/archiv': 'Archiv',

      '/admin': 'Verwaltung',

      '/article': 'News',

      '/impressum': 'Impressum',

      '/datenschutz': 'Datenschutz'

    };

    const pageTitle = titleMap[path] || 'Home';

    

    const renderNewView = () => {

      this.currentPath = path;

      this.currentRawPath = rawPath;

      

      // Ensure mobile drawer is always closed and animation stopped on route transition

      if (typeof window.closeDrawer === 'function') {

        window.closeDrawer();

      } else {

        const d = document.getElementById('mobile-drawer');

        const o = document.getElementById('drawer-overlay');

        if (d) {

          if (typeof anime !== 'undefined') anime.remove(d);

          d.style.right = '-100%';

        }

        if (o) o.classList.remove('active');

        document.body.classList.remove('no-scroll');

        document.documentElement.classList.remove('no-scroll');

      }

      

      try {

        const newHtml = route.render();
        if (isDataRefresh && app.innerHTML === newHtml) {
          this.isNavigating = false;
          return;
        }
        app.innerHTML = newHtml;

        if(route.bind) route.bind();

      } catch(err) {

        console.error("View rendering error:", err);

      }

      

      // Clean up any detached admin modals on body when leaving admin

      if (path !== '/admin') {

        document.querySelectorAll('#player-modal, #team-modal, #round-modal, #add-game-modal, #round-games-modal, #league-modal, #league-data-modal, #game-modal, #report-modal, #dsg-player-stats-modal').forEach(m => m.remove());

      }



      // Update nav active state

      document.querySelectorAll('.nav-link').forEach(link => {

        link.classList.toggle('active', link.getAttribute('href') === '#' + (path === '/' ? '/' : path));

      });



      // Update document title

      document.title = `${pageTitle} | DSG Fussball Diözese Linz`;



      // Handle Scroll Position:

      const wasPopState = this.isPopState;

      const targetScrollY = (wasPopState && this.scrollPositions.has(rawPath)) 

        ? this.scrollPositions.get(rawPath) 

        : (isDataRefresh ? window.scrollY : 0);

      this.isPopState = false;



      if (!isDataRefresh) {
        window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });

        requestAnimationFrame(() => {

          window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });

          setTimeout(() => {

            window.scrollTo({ top: targetScrollY, left: 0, behavior: 'instant' });

            this.isNavigating = false;

          }, 50);

        });
      } else {
        this.isNavigating = false;
      }



      // Ensure floating nav is visible on new page load

      floatingNav?.classList.remove('nav-hidden');



      // Dismiss loader

      this.hideLoader();



      // Clean, reliable page entry animation (only on user navigation, silent on background refresh)

      if (!isDataRefresh && typeof anime !== 'undefined') {

        anime({

          targets: '#app > *',

          opacity: [0, 1],

          translateY: [12, 0],

          easing: 'easeOutCubic',

          duration: 280

        });

      }

    };



    // User navigation: show loader instantly and yield frame so browser paints it before doing heavy render

    if (app.children.length > 0 && !isDataRefresh && this.currentPath !== path) {

      this.showLoader('Wird geladen', `${pageTitle} • DSG Liga`);

      requestAnimationFrame(() => {

        setTimeout(renderNewView, 50);

      });

    } else {

      renderNewView();

    }

  }

};





