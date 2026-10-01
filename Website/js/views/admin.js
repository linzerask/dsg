import { Store } from '../store.js?v=1790560007000';
import { renderAdminPlayers, initAdminPlayers } from './adminPlayers.js?v=1790560007000';
import { renderAdminTeams, initAdminTeams } from './adminTeams.js?v=1790560007000';
import { renderAdminLeagues, initAdminLeagues } from './adminLeagues.js?v=1790560007000';
import { renderAdminRounds, initAdminRounds } from './adminRounds.js?v=1790560007000';
import { renderAdminGames, initAdminGames } from './adminGames.js?v=1790560007000';
import { renderAdminNews, initAdminNews } from './adminNews.js?v=1790560007000';
import { renderAdminGallery, initAdminGallery } from './adminGallery.js?v=1790560007000';

export const showToast = (message, isError = false) => {
  let toast = document.getElementById('dsg-admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dsg-admin-toast';
    toast.className = 'dsg-toast';
    document.body.appendChild(toast);
  }
  toast.className = `dsg-toast ${isError ? 'error' : ''}`;
  const iconSvg = isError 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ff4757; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #2ed573; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  toast.innerHTML = `${iconSvg} <span style="font-weight: 600; font-size: 0.92rem;">${message}</span>`;
  toast.classList.add('show');
  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
};
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

export const ensureAllAdminModalsInBody = () => {
  const modalIds = [
    'round-modal', 'round-games-modal', 'add-game-modal',
    'game-modal', 'report-modal',
    'player-modal', 'team-modal',
    'league-modal', 'league-data-modal'
  ];
  modalIds.forEach(id => {
    const allMatching = Array.from(document.querySelectorAll('#' + id));
    if (allMatching.length > 1) {
      const freshModal = allMatching.find(el => el.parentElement !== document.body) || allMatching[allMatching.length - 1];
      allMatching.filter(el => el !== freshModal).forEach(el => el.remove());
      if (freshModal && freshModal.parentElement !== document.body) {
        document.body.appendChild(freshModal);
      }
    } else if (allMatching.length === 1) {
      const el = allMatching[0];
      if (el.parentElement !== document.body) {
        document.body.appendChild(el);
      }
    }
  });
};



let currentAdminTab = 'admin-rounds';
try {
  const savedTab = sessionStorage.getItem('dsg_admin_tab');
  if (savedTab) currentAdminTab = savedTab;
} catch(e) {}

const tabLabels = {
  'admin-rounds': 'Spielrunden',
  'admin-games': 'Spiele',
  'admin-players': 'Spieler verwalten',
  'admin-teams': 'Teams verwalten',
  'admin-leagues': 'Ligen verwalten',
  'admin-news': 'News verwalten',
  'admin-gallery': 'Galerie verwalten'
};

const tabIcons = {
  'admin-rounds': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  'admin-games': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
  'admin-players': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  'admin-teams': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  'admin-leagues': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7.5"></path><path d="M14 14.66V17c0 .55.45 1 1 1h1.5"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`,
  'admin-news': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>`,
  'admin-gallery': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
};

export const viewAdmin = () => {
  try {
    const savedTab = sessionStorage.getItem('dsg_admin_tab');
    if (savedTab) currentAdminTab = savedTab;
  } catch(e) {}
  const activeTab = currentAdminTab || 'admin-rounds';
  const isTabActive = (tabId) => activeTab === tabId;
  const currentLabel = tabLabels[activeTab] || 'Spielrunden';
  const currentIcon = tabIcons[activeTab] || tabIcons['admin-rounds'];

  return `
    <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); padding-top: var(--space-sm);">
      <div class="admin-layout" style="display: grid; grid-template-columns: 260px 1fr; min-height: 80vh; gap: var(--space-lg);">
        <aside class="glass-card stagger-item admin-sidebar" style="border-radius: var(--border-radius-md); height: fit-content; border: var(--glass-border); padding: var(--space-md);">
        <div class="admin-sidebar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <h2 style="font-size: 1.4rem; color: var(--color-accent); margin: 0;">Admin Panel</h2>
          <button id="admin-m-nav-toggle" class="admin-m-nav-toggle-btn" aria-label="Menü öffnen">
            <span id="admin-m-nav-current-label" style="display: inline-flex; align-items: center; justify-content: center;">
              ${currentIcon}
              <span>${currentLabel}</span>
            </span>
            <svg class="admin-m-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
        <nav id="admin-nav-menu" class="admin-nav-accordion-content">
          <button class="admin-nav-btn ${isTabActive('admin-rounds') ? 'active' : ''}" data-target="admin-rounds">
            ${tabIcons['admin-rounds']}
            <span>Spielrunden</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-games') ? 'active' : ''}" data-target="admin-games">
            ${tabIcons['admin-games']}
            <span>Spiele</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-players') ? 'active' : ''}" data-target="admin-players">
            ${tabIcons['admin-players']}
            <span>Spieler verwalten</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-teams') ? 'active' : ''}" data-target="admin-teams">
            ${tabIcons['admin-teams']}
            <span>Teams verwalten</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-leagues') ? 'active' : ''}" data-target="admin-leagues">
            ${tabIcons['admin-leagues']}
            <span>Ligen verwalten</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-news') ? 'active' : ''}" data-target="admin-news">
            ${tabIcons['admin-news']}
            <span>News verwalten</span>
          </button>
          <button class="admin-nav-btn ${isTabActive('admin-gallery') ? 'active' : ''}" data-target="admin-gallery">
            ${tabIcons['admin-gallery']}
            <span>Galerie verwalten</span>
          </button>
        </nav>
      </aside>
      <div class="admin-content" style="padding: 0; min-width: 0;">
        <div id="admin-rounds" class="admin-section ${isTabActive('admin-rounds') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-rounds') ? 'block' : 'none'};">
          ${renderAdminRounds()}
        </div>
        <div id="admin-games" class="admin-section ${isTabActive('admin-games') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-games') ? 'block' : 'none'};">
          ${renderAdminGames()}
        </div>
        <div id="admin-players" class="admin-section ${isTabActive('admin-players') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-players') ? 'block' : 'none'};">
          ${renderAdminPlayers()}
        </div>
        <div id="admin-teams" class="admin-section ${isTabActive('admin-teams') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-teams') ? 'block' : 'none'};">
          ${renderAdminTeams()}
        </div>
        <div id="admin-leagues" class="admin-section ${isTabActive('admin-leagues') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-leagues') ? 'block' : 'none'};">
          ${renderAdminLeagues()}
        </div>
        <div id="admin-news" class="admin-section ${isTabActive('admin-news') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-news') ? 'block' : 'none'};">
          ${renderAdminNews()}
        </div>
        <div id="admin-gallery" class="admin-section ${isTabActive('admin-gallery') ? 'stagger-item' : ''}" style="display: ${isTabActive('admin-gallery') ? 'block' : 'none'};">
          ${renderAdminGallery()}
        </div>
      </div>
    </div>
  </div>
  <style>
      .admin-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 80vh;
        gap: var(--space-lg);
        width: 100%;
        min-width: 0;
      }
      .admin-sidebar {
        border-radius: var(--border-radius-md);
        height: fit-content;
        border: var(--glass-border);
        padding: var(--space-md);
        min-width: 0;
        position: sticky;
        top: 100px;
      }
      .admin-content {
        min-width: 0;
        padding: 0;
      }
      .admin-m-nav-toggle-btn {
        display: none;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        background: rgba(0, 150, 64, 0.08);
        border: 1px solid var(--color-accent);
        color: var(--color-accent);
        border-radius: 9999px;
        padding: 10px 24px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 2px 8px rgba(0, 150, 64, 0.06);
      }
      .admin-m-nav-toggle-btn:active {
        transform: scale(0.98);
      }
      #admin-m-nav-current-label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-weight: 700;
        color: var(--color-accent);
      }
      .admin-m-nav-toggle-btn .admin-m-nav-chevron {
        position: absolute;
        right: 18px;
        top: 50%;
        transform: translateY(-50%);
        transition: transform 0.25s ease;
        color: var(--color-accent);
      }
      .admin-m-nav-toggle-btn.open .admin-m-nav-chevron {
        transform: translateY(-50%) rotate(180deg);
      }
      .admin-nav-accordion-content {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .admin-nav-btn {
        display: flex;
        align-items: center;
        text-align: left;
        padding: 10px 14px;
        font-weight: 600;
        font-size: 0.92rem;
        color: var(--color-text-secondary);
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
      }
      .admin-nav-btn:hover {
        background: rgba(0, 150, 64, 0.06);
        color: var(--color-accent);
      }
      .admin-nav-btn.active {
        background: rgba(0, 150, 64, 0.12) !important;
        color: var(--color-accent) !important;
        font-weight: 700;
      }
      @media (max-width: 768px) {
        .admin-layout {
          grid-template-columns: 1fr !important;
          gap: var(--space-sm) !important;
          width: 100% !important;
        }
        .admin-sidebar {
          position: static !important;
          border-radius: var(--border-radius-md) !important;
          border: var(--glass-border) !important;
          margin: 0 auto 12px auto !important;
          max-width: 500px !important;
          width: 100% !important;
          padding: 12px !important;
          box-sizing: border-box;
        }
        .admin-sidebar-header {
          margin-bottom: 0 !important;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .admin-sidebar h2 {
          display: none !important;
        }
        .admin-m-nav-toggle-btn {
          display: flex !important;
        }
        .admin-nav-accordion-content {
          display: none !important;
          margin-top: 12px;
          border-top: 1px solid var(--color-border);
          padding-top: 12px;
          gap: 8px;
        }
        .admin-nav-accordion-content.open {
          display: flex !important;
        }
        .admin-nav-accordion-content .admin-nav-btn {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          padding: 11px 16px !important;
          border-radius: 9999px !important;
          width: 100% !important;
        }
        .admin-content {
          padding: 0 !important;
          width: 100% !important;
        }
      }
    </style>
  `;
};

export const bindAdmin = () => {
  ensureAllAdminModalsInBody();

  const activeTab = currentAdminTab || 'admin-rounds';
  if (activeTab === 'admin-rounds') initAdminRounds();
  else if (activeTab === 'admin-games') initAdminGames();
  else if (activeTab === 'admin-players') initAdminPlayers();
  else if (activeTab === 'admin-teams') initAdminTeams();
  else if (activeTab === 'admin-leagues') initAdminLeagues();
  else if (activeTab === 'admin-news') initAdminNews();
  else if (activeTab === 'admin-gallery') initAdminGallery();

  // Mobile Accordion Toggle
  const toggleBtn = document.getElementById('admin-m-nav-toggle');
  const navMenu = document.getElementById('admin-nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('open');
      } else {
        navMenu.classList.add('open');
        toggleBtn.classList.add('open');
      }
    });
  }

  // Navigation Buttons
  const btns = document.querySelectorAll('.admin-nav-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const clickedBtn = e.currentTarget || e.target;
      btns.forEach(b => b.classList.remove('active'));
      clickedBtn.classList.add('active');
      
      document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
      const targetId = clickedBtn.getAttribute('data-target');
      currentAdminTab = targetId;
      try { sessionStorage.setItem('dsg_admin_tab', targetId); } catch(err) {}

      // Update mobile label
      const currentLabelEl = document.getElementById('admin-m-nav-current-label');
      if (currentLabelEl && tabLabels[targetId]) {
        currentLabelEl.innerHTML = `${tabIcons[targetId] || ''}<span>${tabLabels[targetId]}</span>`;
      }

      // Close mobile accordion menu on selection
      if (navMenu && window.innerWidth <= 768) {
        navMenu.classList.remove('open');
        toggleBtn?.classList.remove('open');
      }

      ensureAllAdminModalsInBody();

      if (targetId === 'admin-rounds') initAdminRounds();
      if (targetId === 'admin-games') initAdminGames();
      if (targetId === 'admin-players') initAdminPlayers();
      if (targetId === 'admin-teams') initAdminTeams();
      if (targetId === 'admin-leagues') initAdminLeagues();
      if (targetId === 'admin-news') initAdminNews();
      if (targetId === 'admin-gallery') initAdminGallery();
      const target = document.getElementById(targetId);
      if (target) {
        target.style.display = 'block';
        anime({ targets: target, opacity: [0, 1], translateY: [10, 0], duration: 400, complete: () => { target.style.transform = 'none'; } });
      }
    });
  });

  // Populate Teams & Seasons
  const data = Store.getData();
  const seasons = Object.keys(data.seasons || {});
  const activeSeason = data.currentSeason || seasons[0] || "2022/2023";
  const matchSeasonSelect = document.getElementById('match-season');
  const matchListSeasonSelect = document.getElementById('match-list-season');
  const teamSeasonSelect = document.getElementById('team-season-select');
  if (matchSeasonSelect) {
    matchSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === activeSeason ? 'selected' : ''}>${s}</option>`).join('');
  }
  if (matchListSeasonSelect) {
    matchListSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === activeSeason ? 'selected' : ''}>${s}</option>`).join('');
  }
  if (teamSeasonSelect) {
    teamSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === activeSeason ? 'selected' : ''}>${s}</option>`).join('');
  }

  const populateTeamsDropdown = (season) => {
    const data = Store.getData();
    const teams = data.seasons[season]?.teams || [];
    const selectA = document.getElementById('team-a');
    const selectB = document.getElementById('team-b');
    const options = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    if (selectA) selectA.innerHTML = options;
    if (selectB) {
      selectB.innerHTML = options;
      if (teams.length > 1) selectB.value = teams[1].id;
    }
  };

  if (matchSeasonSelect) {
    populateTeamsDropdown(matchSeasonSelect.value);
    matchSeasonSelect.addEventListener('change', (e) => {
      populateTeamsDropdown(e.target.value);
    });
  }

  // Events logic
  const createEventRow = (containerId, player = '', type = 'goal', count = 1) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'event-row';
    row.style = 'display: flex; gap: 5px; align-items: center;';
    
    row.innerHTML = `
      <input type="text" class="event-player" placeholder="Spielername" value="${player}" style="flex: 1; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: 5px; border-radius: 4px; font-size: 0.8rem;" required>
      <select class="event-type" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: 5px; border-radius: 4px; font-size: 0.8rem;">
        <option value="goal" ${type === 'goal' ? 'selected' : ''}>Tor</option>
        <option value="yellow" ${type === 'yellow' ? 'selected' : ''}>Gelbe Karte</option>
        <option value="yellowRed" ${type === 'yellowRed' ? 'selected' : ''}>Gelb-Rot</option>
        <option value="red" ${type === 'red' ? 'selected' : ''}>Rote Karte</option>
      </select>
      <input type="hidden" class="event-count" value="1">
      <button type="button" class="btn remove-event-btn" style="padding: 5px 8px; background: #e74c3c; border: none; color: white; border-radius: 4px; font-size: 0.8rem;">X</button>
    `;
    
    row.querySelector('.remove-event-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  };

  document.getElementById('add-event-home')?.addEventListener('click', () => createEventRow('events-home'));
  document.getElementById('add-event-away')?.addEventListener('click', () => createEventRow('events-away'));

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => resolve('');
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Image Type Toggles
  document.querySelectorAll('input[name="news-img-type"]').forEach(r => {
    r.addEventListener('change', e => {
      document.getElementById('news-image').style.display = e.target.value === 'url' ? 'block' : 'none';
      document.getElementById('news-image-file').style.display = e.target.value === 'file' ? 'block' : 'none';
    });
  });
  document.querySelectorAll('input[name="gal-cover-type"]').forEach(r => {
    r.addEventListener('change', e => {
      document.getElementById('gal-cover').style.display = e.target.value === 'url' ? 'block' : 'none';
      document.getElementById('gal-cover-file').style.display = e.target.value === 'file' ? 'block' : 'none';
    });
  });
  document.querySelectorAll('input[name="gal-images-type"]').forEach(r => {
    r.addEventListener('change', e => {
      document.getElementById('gal-images').style.display = e.target.value === 'url' ? 'block' : 'none';
      document.getElementById('gal-images-file').style.display = e.target.value === 'file' ? 'block' : 'none';
    });
  });

  // Forms
  const renderAdminMatchesList = () => {
    const list = document.getElementById('admin-matches-list');
    const seasonSelect = document.getElementById('match-list-season');
    if (!list || !seasonSelect) return;
    
    const season = seasonSelect.value;
    const matches = Store.getMatches(season);
    
    list.innerHTML = matches.map(m => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm);">
        <div>
          <strong>${m.home} vs ${m.away}</strong> 
          <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-accent); margin-left: 10px;">${m.score}</span><br>
          <span style="font-size: 0.8rem; color: var(--color-text-secondary);">Runde ${m.round} - ${m.date}</span>
        </div>
        <div>
          <button class="btn btn-outline edit-match-btn" data-id="${m.id}" data-season="${season}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Bearbeiten</button>
          <button class="btn delete-match-btn" data-id="${m.id}" data-season="${season}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">Löschen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-match-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Möchten Sie dieses Spiel wirklich löschen? Dadurch werden alle Tabellen und Statistiken neu berechnet!')) {
          Store.deleteMatch(e.target.dataset.season, e.target.dataset.id);
          renderAdminMatchesList();
        }
      });
    });

    document.querySelectorAll('.edit-match-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const match = Store.getMatch(e.target.dataset.season, e.target.dataset.id);
        if (match) {
          document.getElementById('match-id').value = match.id;
          document.getElementById('match-season').value = e.target.dataset.season;
          document.getElementById('match-round').value = match.round;
          document.getElementById('match-status').value = match.status || 'Played';
          
          if (match.date) {
            // Convert from DD.MM.YYYY to YYYY-MM-DD for date input
            const parts = match.date.split('.');
            if (parts.length === 3) {
              document.getElementById('match-date').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          
          const seasonTeams = Store.getData().seasons[e.target.dataset.season]?.teams || [];
          document.getElementById('team-a').value = seasonTeams.find(t=>t.name===match.home)?.id || match.home;
          document.getElementById('team-b').value = seasonTeams.find(t=>t.name===match.away)?.id || match.away;
          
          if (match.status === 'Played' || !match.status) {
             const pts = match.score.replace('*', '').split(':');
             document.getElementById('ft-goals-a').value = pts[0];
             document.getElementById('ft-goals-b').value = pts[1];
             if(match.ht) {
               const hts = match.ht.split(':');
               document.getElementById('ht-goals-a').value = hts[0];
               document.getElementById('ht-goals-b').value = hts[1];
             } else {
               document.getElementById('ht-goals-a').value = '';
               document.getElementById('ht-goals-b').value = '';
             }
          } else {
             document.getElementById('ft-goals-a').value = '';
             document.getElementById('ft-goals-b').value = '';
          }
          
          document.getElementById('events-home').innerHTML = '';
          document.getElementById('events-away').innerHTML = '';
          if (match.events) {
             match.events.forEach(ev => {
               if(ev.team === document.getElementById('team-a').value || seasonTeams.find(t=>t.id===ev.team)?.name === match.home) {
                 createEventRow('events-home', ev.player, ev.type, ev.count);
               } else {
                 createEventRow('events-away', ev.player, ev.type, ev.count);
               }
             });
          }

          document.getElementById('match-submit-btn').textContent = 'Spiel aktualisieren';
          document.getElementById('match-cancel-btn').style.display = 'block';
          window.scrollTo(0,0);
        }
      });
    });
  };

  document.getElementById('match-list-season')?.addEventListener('change', renderAdminMatchesList);
  setTimeout(renderAdminMatchesList, 100);

  document.getElementById('match-cancel-btn')?.addEventListener('click', (e) => {
    document.getElementById('score-form').reset();
    document.getElementById('match-id').value = '';
    document.getElementById('events-home').innerHTML = '';
    document.getElementById('events-away').innerHTML = '';
    document.getElementById('match-status').value = 'Upcoming';
    document.getElementById('match-submit-btn').textContent = 'Spiel speichern';
    e.target.style.display = 'none';
  });

  document.getElementById('score-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('match-id').value;
    const season = document.getElementById('match-season').value;
    const round = parseInt(document.getElementById('match-round').value) || 1;
    const status = document.getElementById('match-status').value;
    const ta = document.getElementById('team-a').value;
    const tb = document.getElementById('team-b').value;
    
    if(ta && tb && ta === tb) { alert('Bitte unterschiedliche Teams auswählen.'); return; }

    const htGa = document.getElementById('ht-goals-a').value;
    const htGb = document.getElementById('ht-goals-b').value;
    const ftGa = document.getElementById('ft-goals-a').value;
    const ftGb = document.getElementById('ft-goals-b').value;

    let scoreStr = '';
    let htStr = '';
    
    if (status !== 'Played') {
      scoreStr = status === 'Walkover' ? '3:0*' : status;
      if (status === 'Upcoming') scoreStr = '- : -';
    } else {
      if(ftGa === '' || ftGb === '') { alert('Bitte ein gültiges Endergebnis für gespielte Matches eingeben.'); return; }
      scoreStr = `${ftGa}:${ftGb}`;
      if (htGa !== '' && htGb !== '') {
        htStr = `${htGa}:${htGb}`;
      }
    }

    const events = [];
    document.querySelectorAll('.event-row').forEach(row => {
      const player = row.querySelector('.event-player').value.trim();
      const type = row.querySelector('.event-type').value;
      const count = parseInt(row.querySelector('.event-count').value) || 1;
      const isHome = row.closest('#events-home') !== null;
      if (player) {
        events.push({ player, type, count, team: isHome ? ta : tb });
      }
    });

    // Make sure we have real names for home and away in match data
    const currentSeasonTeams = Store.getData().seasons[season]?.teams || [];
    const teamA = currentSeasonTeams.find(t => String(t.id) === String(ta))?.name || ta;
    const teamB = currentSeasonTeams.find(t => String(t.id) === String(tb))?.name || tb;

    const dateInput = document.getElementById('match-date').value;
    let formattedDate = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (dateInput) {
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    }

    const matchData = {
      id,
      season,
      round,
      status,
      home: teamA,
      away: teamB,
      score: scoreStr,
      ht: htStr,
      events,
      date: formattedDate
    };

    // Extract scorers and cards for leaderboard updates in store.js
    const scorers = [];
    const cards = [];
    events.forEach(e => {
       const teamName = (e.team === ta) ? teamA : teamB;
       if (e.type === 'goal') {
         for(let i=0; i<e.count; i++) scorers.push({ name: e.player, team: teamName });
       } else {
         for(let i=0; i<e.count; i++) cards.push({ name: e.player, type: e.type, team: teamName });
       }
    });
    matchData.scorers = scorers;
    matchData.cards = cards;

    Store.saveMatch(season, matchData);
    e.target.reset();
    document.getElementById('events-home').innerHTML = '';
    document.getElementById('events-away').innerHTML = '';
    document.getElementById('match-id').value = '';
    document.getElementById('match-status').value = 'Upcoming';
    document.getElementById('match-submit-btn').textContent = 'Spiel speichern';
    document.getElementById('match-cancel-btn').style.display = 'none';
    
    renderAdminMatchesList();
    
    alert('Spiel gespeichert!');
  });

  // Teams Logic
  const renderAdminTeamsList = () => {
    const list = document.getElementById('admin-teams-list');
    if (!list) return;
    const season = teamSeasonSelect?.value;
    if (!season) return;
    const teams = Store.getData().seasons[season]?.teams || [];
    
    if (teams.length === 0) {
      list.innerHTML = '<p style="color: var(--color-text-secondary); font-size: 0.9rem;">Keine Teams für diese Saison vorhanden.</p>';
      return;
    }

    list.innerHTML = teams.map(t => `
      <div class="glass-card" style="padding: var(--space-sm); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700;">${t.name}</span>
        <div>
          <button class="btn btn-outline edit-team-btn" data-id="${t.id}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Bearbeiten</button>
          <button class="btn delete-team-btn" data-id="${t.id}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">Löschen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-team-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Team wirklich löschen? ACHTUNG: Das löscht das Team nur aus der Dropdown-Liste, Matches bleiben bestehen!')) {
          const id = parseInt(e.target.dataset.id);
          const data = Store.getData();
          const seasonData = data.seasons[teamSeasonSelect.value];
          seasonData.teams = seasonData.teams.filter(t => t.id !== id);
          Store.saveData(data);
          renderAdminTeamsList();
          if (matchSeasonSelect) populateTeamsDropdown(matchSeasonSelect.value);
        }
      });
    });

    document.querySelectorAll('.edit-team-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const data = Store.getData();
        const seasonData = data.seasons[teamSeasonSelect.value];
        const team = seasonData.teams.find(t => t.id === id);
        if (team) {
          const newName = prompt('Neuer Name für das Team:', team.name);
          if (newName && newName.trim() !== '') {
            team.name = newName.trim();
            Store.saveData(data);
            renderAdminTeamsList();
            if (matchSeasonSelect) populateTeamsDropdown(matchSeasonSelect.value);
          }
        }
      });
    });
  };

  if (teamSeasonSelect) {
    teamSeasonSelect.addEventListener('change', renderAdminTeamsList);
    renderAdminTeamsList();
  }

  document.getElementById('team-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const season = teamSeasonSelect.value;
    const name = document.getElementById('team-name').value.trim();
    if (!name) return;
    
    const data = Store.getData();
    const seasonData = data.seasons[season];
    if (!seasonData.teams) seasonData.teams = [];
    
    // Find highest ID
    const maxId = seasonData.teams.reduce((max, t) => Math.max(max, t.id), 0);
    
    seasonData.teams.push({
      id: maxId + 1,
      name: name,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
    });
    
    Store.saveData(data);
    document.getElementById('team-form').reset();
    renderAdminTeamsList();
    if (matchSeasonSelect) populateTeamsDropdown(matchSeasonSelect.value);
  });
};
