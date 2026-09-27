import { Store } from '../store.js';

import { renderAdminPlayers, initAdminPlayers } from './adminPlayers.js';
import { renderAdminTeams, initAdminTeams } from './adminTeams.js';
import { renderAdminLeagues, initAdminLeagues } from './adminLeagues.js';
import { renderAdminRounds, initAdminRounds } from './adminRounds.js';
import { renderAdminGames, initAdminGames } from './adminGames.js';
import { renderAdminNews, initAdminNews } from './adminNews.js';
import { renderAdminGallery, initAdminGallery } from './adminGallery.js';



let currentAdminTab = 'admin-rounds';
try {
  const savedTab = sessionStorage.getItem('dsg_admin_tab');
  if (savedTab) currentAdminTab = savedTab;
} catch(e) {}

export const viewAdmin = () => {
  try {
    const savedTab = sessionStorage.getItem('dsg_admin_tab');
    if (savedTab) currentAdminTab = savedTab;
  } catch(e) {}
  const activeTab = currentAdminTab || 'admin-rounds';
  const isTabActive = (tabId) => activeTab === tabId;

  return `
    <div class="admin-layout" style="display: grid; grid-template-columns: 250px 1fr; min-height: 80vh; gap: var(--space-lg);">
      <aside class="glass-card stagger-item" style="border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0; height: 100%; border-left: none;">
        <h2 style="font-size: 1.5rem; color: var(--color-accent); margin-bottom: var(--space-lg);">Admin Panel</h2>
        <nav style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-nav-btn ${isTabActive('admin-rounds') ? 'active' : ''}" data-target="admin-rounds" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-rounds') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-rounds') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Spielrunden</button>
          <button class="admin-nav-btn ${isTabActive('admin-games') ? 'active' : ''}" data-target="admin-games" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-games') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-games') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Spiele</button>
          <button class="admin-nav-btn ${isTabActive('admin-players') ? 'active' : ''}" data-target="admin-players" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-players') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-players') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Spieler verwalten</button>
          <button class="admin-nav-btn ${isTabActive('admin-teams') ? 'active' : ''}" data-target="admin-teams" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-teams') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-teams') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Teams verwalten</button>
          <button class="admin-nav-btn ${isTabActive('admin-leagues') ? 'active' : ''}" data-target="admin-leagues" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-leagues') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-leagues') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Ligen verwalten</button>
          <button class="admin-nav-btn ${isTabActive('admin-news') ? 'active' : ''}" data-target="admin-news" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-news') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-news') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">News verwalten</button>
          <button class="admin-nav-btn ${isTabActive('admin-gallery') ? 'active' : ''}" data-target="admin-gallery" style="text-align: left; padding: var(--space-sm); color: ${isTabActive('admin-gallery') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}; font-weight: 700; background: ${isTabActive('admin-gallery') ? 'rgba(0,0,0,0.05)' : 'none'}; border: none; border-radius: 4px; cursor: pointer;">Galerie verwalten</button>
        </nav>
      </aside>
      <div class="admin-content" style="padding: var(--space-lg);">
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
    <style>
      @media (max-width: 768px) {
        .admin-layout { grid-template-columns: 1fr !important; }
        .admin-layout aside { border-radius: 0; border-bottom: var(--glass-border); }
      }
    </style>
  `;
};

export const bindAdmin = () => {
  const activeTab = currentAdminTab || 'admin-rounds';
  if (activeTab === 'admin-rounds') initAdminRounds();
  else if (activeTab === 'admin-games') initAdminGames();
  else if (activeTab === 'admin-players') initAdminPlayers();
  else if (activeTab === 'admin-teams') initAdminTeams();
  else if (activeTab === 'admin-leagues') initAdminLeagues();
  else if (activeTab === 'admin-news') initAdminNews();
  else if (activeTab === 'admin-gallery') initAdminGallery();

  // Navigation
  const btns = document.querySelectorAll('.admin-nav-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const clickedBtn = e.currentTarget || e.target;
      btns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'none';
        b.style.color = 'var(--color-text-secondary)';
      });
      clickedBtn.classList.add('active');
      clickedBtn.style.background = 'rgba(0,0,0,0.05)';
      clickedBtn.style.color = 'var(--color-text-primary)';
      
      document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
      const targetId = clickedBtn.getAttribute('data-target');
      currentAdminTab = targetId;
      try { sessionStorage.setItem('dsg_admin_tab', targetId); } catch(err) {}

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
  const seasons = Object.keys(data.seasons || {}).filter(s => s !== "2025/2026");
  const matchSeasonSelect = document.getElementById('match-season');
  const matchListSeasonSelect = document.getElementById('match-list-season');
  const teamSeasonSelect = document.getElementById('team-season-select');
  if (matchSeasonSelect) {
    matchSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === "2026/2027" ? 'selected' : ''}>${s}</option>`).join('');
  }
  if (matchListSeasonSelect) {
    matchListSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === "2026/2027" ? 'selected' : ''}>${s}</option>`).join('');
  }
  if (teamSeasonSelect) {
    teamSeasonSelect.innerHTML = seasons.map(s => `<option value="${s}" ${s === "2026/2027" ? 'selected' : ''}>${s}</option>`).join('');
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
