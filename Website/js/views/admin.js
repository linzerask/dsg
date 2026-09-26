import { Store } from '../store.js';
import { Router } from '../router.js';
import { renderAdminPlayers, initAdminPlayers } from './adminPlayers.js?v=1790458400000';
import { renderAdminTeams, initAdminTeams } from './adminTeams.js?v=1790458400000';
import { renderAdminLeagues, initAdminLeagues } from './adminLeagues.js?v=1790458400000';
import { renderAdminRounds, initAdminRounds } from './adminRounds.js?v=1790460000000';



export const viewAdmin = () => {
  return `
    <div class="admin-layout" style="display: grid; grid-template-columns: 250px 1fr; min-height: 80vh; gap: var(--space-lg);">
      <aside class="glass-card stagger-item" style="border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0; height: 100%; border-left: none;">
        <h2 style="font-size: 1.5rem; color: var(--color-accent); margin-bottom: var(--space-lg);">Admin Panel</h2>
        <nav style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-nav-btn active" data-target="admin-scores" style="text-align: left; padding: var(--space-sm); color: var(--color-text-primary); font-weight: 700; background: rgba(0,0,0,0.05); border-radius: 4px;">Spielergebnisse</button>
          <button class="admin-nav-btn" data-target="admin-rounds" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">Spielrunden</button>
          <button class="admin-nav-btn" data-target="admin-players" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">Spieler verwalten</button>
          <button class="admin-nav-btn" data-target="admin-teams" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">Teams verwalten</button>
          <button class="admin-nav-btn" data-target="admin-leagues" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">Ligen verwalten</button>
          <button class="admin-nav-btn" data-target="admin-news" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">News verwalten</button>
          <button class="admin-nav-btn" data-target="admin-gallery" style="text-align: left; padding: var(--space-sm); color: var(--color-text-secondary); font-weight: 700; background: none; border: none;">Galerie verwalten</button>
        </nav>
      </aside>
      <div class="admin-content" style="padding: var(--space-lg);">
        <div id="admin-scores" class="admin-section stagger-item">
          <h2>Spielergebnisse & Daten</h2>
          <form id="score-form" style="margin-top: var(--space-md); max-width: 800px; display: flex; flex-direction: column; gap: var(--space-md);">
            <input type="hidden" id="match-id">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Saison</label>
                <select id="match-season" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;"></select>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Runde</label>
                <input type="number" id="match-round" min="1" value="1" required style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Datum</label>
                <input type="date" id="match-date" required style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Status</label>
                <select id="match-status" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                  <option value="Upcoming" selected>Ausstehend / Geplant</option>
                  <option value="Played">Gespielt</option>
                  <option value="Postponed">Verschoben</option>
                  <option value="Canceled">Abgesagt</option>
                  <option value="Abgesagt 3:0">Abgesagt 3:0</option>
                  <option value="Abgesagt 0:3">Abgesagt 0:3</option>
                </select>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
              <select id="team-a" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                <option value="">-- Team A wählen --</option>
              </select>
              <span style="font-weight: 700;">vs.</span>
              <select id="team-b" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                <option value="">-- Team B wählen --</option>
              </select>
            </div>
            
            <div id="score-inputs" style="display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-md);">
               <div style="display: flex; flex-direction: column; gap: 5px;">
                 <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Halbzeitstand</label>
                 <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="ht-goals-a" placeholder="HZ A" min="0" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                    <span>:</span>
                    <input type="number" id="ht-goals-b" placeholder="HZ B" min="0" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                 </div>
               </div>
               <div style="display: flex; flex-direction: column; gap: 5px;">
                 <label style="font-size: 0.8rem; color: var(--color-text-secondary);">Endstand</label>
                 <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="ft-goals-a" placeholder="End A" min="0" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                    <span>:</span>
                    <input type="number" id="ft-goals-b" placeholder="End B" min="0" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px; width: 100%;">
                 </div>
               </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-top: var(--space-md);">
              <div class="glass-card" style="padding: var(--space-sm);">
                <h4 style="margin-bottom: 10px;">Heimteam Ereignisse</h4>
                <div id="events-home" style="display: flex; flex-direction: column; gap: 5px;"></div>
                <button type="button" class="btn btn-outline" id="add-event-home" style="width: 100%; margin-top: 10px; font-size: 0.8rem;">+ Ereignis hinzufügen</button>
              </div>
              <div class="glass-card" style="padding: var(--space-sm);">
                <h4 style="margin-bottom: 10px;">Auswärtsteam Ereignisse</h4>
                <div id="events-away" style="display: flex; flex-direction: column; gap: 5px;"></div>
                <button type="button" class="btn btn-outline" id="add-event-away" style="width: 100%; margin-top: 10px; font-size: 0.8rem;">+ Ereignis hinzufügen</button>
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: var(--space-md);">
              <button type="submit" id="match-submit-btn" style="flex: 1; background: var(--color-accent); color: #000; font-weight: 700; padding: var(--space-sm); border-radius: 4px; cursor: pointer;">Spiel speichern</button>
              <button type="button" id="match-cancel-btn" style="display:none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">Bearbeiten abbrechen</button>
            </div>
          </form>
          
          <div style="margin-top: var(--space-xl);">
            <h3>Vorhandene Spiele</h3>
            <select id="match-list-season" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: 5px 10px; border-radius: 4px; margin-bottom: var(--space-md);"></select>
            <div id="admin-matches-list" style="display: flex; flex-direction: column; gap: var(--space-sm);"></div>
          </div>
        </div>
        <div id="admin-rounds" class="admin-section" style="display: none;">
          ${renderAdminRounds()}
        </div>
        <div id="admin-players" class="admin-section" style="display: none;">
          ${renderAdminPlayers()}
        </div>
        <div id="admin-teams" class="admin-section" style="display: none;">
          ${renderAdminTeams()}
        </div>
        <div id="admin-leagues" class="admin-section" style="display: none;">
          ${renderAdminLeagues()}
        </div>
<div id="admin-news" class="admin-section" style="display: none;">
          <h2>News verwalten</h2>
          <form id="news-form" style="margin-top: var(--space-md); max-width: 500px; display: flex; flex-direction: column; gap: var(--space-md);">
            <input type="hidden" id="news-id">
            <input type="text" id="news-title" placeholder="Titel" required style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            <textarea id="news-excerpt" placeholder="Inhalt/Auszug..." required rows="4" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;"></textarea>
            
            <label style="margin-top: 10px; font-weight: 600;">Bildquelle:</label>
            <div style="display: flex; gap: var(--space-sm);">
              <label><input type="radio" name="news-img-type" value="url" checked> URL</label>
              <label><input type="radio" name="news-img-type" value="file"> Datei hochladen</label>
            </div>
            <input type="text" id="news-image" placeholder="Image URL (optional)" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            <input type="file" id="news-image-file" accept="image/*" multiple style="display: none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            
            <div style="display: flex; gap: 10px;">
              <button type="submit" id="news-submit-btn" style="flex: 1; background: var(--color-accent); color: #000; font-weight: 700; padding: var(--space-sm); border-radius: 4px;">News verÃ¶ffentlichen</button>
              <button type="button" id="news-cancel-btn" style="display:none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">Bearbeiten abbrechen</button>
            </div>
          </form>
          <div style="margin-top: var(--space-xl);">
            <h3>Vorhandene Artikel</h3>
            <div id="admin-news-list" style="margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);"></div>
          </div>
        </div>
        <div id="admin-gallery" class="admin-section" style="display: none;">
          <h2>Galerie verwalten</h2>
          <form id="gallery-form" style="margin-top: var(--space-md); max-width: 500px; display: flex; flex-direction: column; gap: var(--space-md);">
            <input type="hidden" id="gal-id">
            <input type="text" id="gal-title" placeholder="Albumtitel" required style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            <input type="text" id="gal-date" placeholder="Datum (z.B. 15. Juni 2026)" required style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            <textarea id="gal-excerpt" placeholder="Auszug..." required rows="2" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;"></textarea>
            
            <label style="margin-top: 10px; font-weight: 600;">Titelbild-Quelle:</label>
            <div style="display: flex; gap: var(--space-sm);">
              <label><input type="radio" name="gal-cover-type" value="url" checked> URL</label>
              <label><input type="radio" name="gal-cover-type" value="file"> Datei hochladen</label>
            </div>
            <input type="text" id="gal-cover" placeholder="Cover Image URL" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            <input type="file" id="gal-cover-file" accept="image/*" style="display: none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            
            <label style="margin-top: 10px; font-weight: 600;">Galeriebilder-Quelle:</label>
            <div style="display: flex; gap: var(--space-sm);">
              <label><input type="radio" name="gal-images-type" value="url" checked> URLs</label>
              <label><input type="radio" name="gal-images-type" value="file"> Dateien hochladen</label>
            </div>
            <textarea id="gal-images" placeholder="Image URLs (one per line)..." rows="5" style="background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;"></textarea>
            <input type="file" id="gal-images-file" accept="image/*" multiple style="display: none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">
            
            <div style="display: flex; gap: 10px;">
              <button type="submit" id="gal-submit-btn" style="flex: 1; background: var(--color-accent); color: #000; font-weight: 700; padding: var(--space-sm); border-radius: 4px;">Album erstellen</button>
              <button type="button" id="gal-cancel-btn" style="display:none; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); padding: var(--space-sm); border-radius: 4px;">Bearbeiten abbrechen</button>
            </div>
          </form>
          <div style="margin-top: var(--space-xl);">
            <h3>Vorhandene Alben</h3>
            <div id="admin-albums-list" style="margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);"></div>
          </div>
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
  initAdminRounds();
  initAdminPlayers();
  initAdminTeams();
  initAdminLeagues();

  // Navigation
  const btns = document.querySelectorAll('.admin-nav-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'none';
        b.style.color = 'var(--color-text-secondary)';
      });
      e.target.classList.add('active');
      e.target.style.background = 'rgba(0,0,0,0.05)';
      e.target.style.color = 'var(--color-text-primary)';
      
      document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
      const targetId = e.target.dataset.target;
      if (targetId === 'admin-rounds') initAdminRounds();
      if (targetId === 'admin-players') initAdminPlayers();
      if (targetId === 'admin-teams') initAdminTeams();
      if (targetId === 'admin-leagues') initAdminLeagues();
      const target = document.getElementById(targetId);
      target.style.display = 'block';
      anime({ targets: target, opacity: [0, 1], translateY: [10, 0], duration: 400 });
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
          <button class="btn delete-match-btn" data-id="${m.id}" data-season="${season}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">LÃ¶schen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-match-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('MÃ¶chten Sie dieses Spiel wirklich lÃ¶schen? Dadurch werden alle Tabellen und Statistiken neu berechnet!')) {
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

  const renderAdminNewsList = () => {
    const list = document.getElementById('admin-news-list');
    if (!list) return;
    const articles = Store.getNews();
    list.innerHTML = articles.map(a => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm);">
        <div>
          <strong>${a.title}</strong><br>
          <span style="font-size: 0.8rem; color: var(--color-text-secondary);">${a.date}</span>
        </div>
        <div>
          <button class="btn btn-outline edit-news-btn" data-id="${a.id}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Bearbeiten</button>
          <button class="btn delete-news-btn" data-id="${a.id}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">LÃ¶schen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Diesen Artikel lÃ¶schen?')) {
          Store.deleteArticle(e.target.dataset.id);
          renderAdminNewsList();
        }
      });
    });

    document.querySelectorAll('.edit-news-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const article = Store.getArticle(e.target.dataset.id);
        if (article) {
          document.getElementById('news-id').value = article.id;
          document.getElementById('news-title').value = article.title;
          document.getElementById('news-excerpt').value = article.content.replace(/<[^>]+>/g, '');
          document.getElementById('news-image').value = article.image || '';
          document.getElementById('news-submit-btn').textContent = 'News aktualisieren';
          document.getElementById('news-cancel-btn').style.display = 'block';
          window.scrollTo(0,0);
        }
      });
    });
  };

  renderAdminNewsList();

  document.getElementById('news-cancel-btn')?.addEventListener('click', (e) => {
    document.getElementById('news-form').reset();
    document.getElementById('news-id').value = '';
    document.getElementById('news-submit-btn').textContent = 'News verÃ¶ffentlichen';
    e.target.style.display = 'none';
  });

  document.getElementById('news-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('news-submit-btn').textContent = 'Speichert...';
    const id = document.getElementById('news-id').value;
    const title = document.getElementById('news-title').value;
    const content = document.getElementById('news-excerpt').value;
    
    let image = '';
    let galleryArray = [];
    const imgType = document.querySelector('input[name="news-img-type"]:checked').value;
    if (imgType === 'url') {
      const urls = document.getElementById('news-image').value.split('\\n').map(u => u.trim()).filter(u => u.length > 0);
      if (urls.length > 0) image = urls[0];
      if (urls.length > 1) galleryArray = urls.slice(1).map(url => ({ url }));
    } else {
      const fileInput = document.getElementById('news-image-file');
      if (fileInput.files.length > 0) {
        image = await compressImage(fileInput.files[0]);
        for (let i = 1; i < fileInput.files.length; i++) {
          const compressed = await compressImage(fileInput.files[i]);
          if (compressed) galleryArray.push({ url: compressed });
        }
      }
    }
    
    if (id) {
      Store.deleteArticle(id); // delete old to replace
    }
    Store.addNews(title, "", content, image, galleryArray);
    e.target.reset();
    document.getElementById('news-id').value = '';
    document.getElementById('news-submit-btn').textContent = 'News verÃ¶ffentlichen';
    document.getElementById('news-cancel-btn').style.display = 'none';
    document.getElementById('news-image').style.display = 'block';
    document.getElementById('news-image-file').style.display = 'none';
    renderAdminNewsList();
    alert('News gespeichert!');
  });

  const renderAdminAlbumsList = () => {
    const list = document.getElementById('admin-albums-list');
    if (!list) return;
    const albums = Store.getGallery();
    list.innerHTML = albums.map(a => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm);">
        <div>
          <strong>${a.title}</strong><br>
          <span style="font-size: 0.8rem; color: var(--color-text-secondary);">${a.date}</span>
        </div>
        <div>
          <button class="btn btn-outline edit-gal-btn" data-id="${a.id}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Bearbeiten</button>
          <button class="btn delete-gal-btn" data-id="${a.id}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">LÃ¶schen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-gal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Dieses Album lÃ¶schen?')) {
          Store.deleteAlbum(e.target.dataset.id);
          renderAdminAlbumsList();
        }
      });
    });

    document.querySelectorAll('.edit-gal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const album = Store.getAlbum(e.target.dataset.id);
        if (album) {
          document.getElementById('gal-id').value = album.id;
          document.getElementById('gal-title').value = album.title;
          document.getElementById('gal-date').value = album.date;
          document.getElementById('gal-excerpt').value = album.excerpt;
          
          document.querySelector('input[name="gal-cover-type"][value="url"]').checked = true;
          document.getElementById('gal-cover').style.display = 'block';
          document.getElementById('gal-cover-file').style.display = 'none';
          document.getElementById('gal-cover').value = album.image || '';
          
          document.querySelector('input[name="gal-images-type"][value="url"]').checked = true;
          document.getElementById('gal-images').style.display = 'block';
          document.getElementById('gal-images-file').style.display = 'none';
          document.getElementById('gal-images').value = album.images ? album.images.map(i => i.url).join('\\n') : '';

          document.getElementById('gal-submit-btn').textContent = 'Album aktualisieren';
          document.getElementById('gal-cancel-btn').style.display = 'block';
          window.scrollTo(0,0);
        }
      });
    });
  };
  
  renderAdminAlbumsList();

  document.getElementById('gal-cancel-btn')?.addEventListener('click', (e) => {
    document.getElementById('gallery-form').reset();
    document.getElementById('gal-id').value = '';
    document.getElementById('gal-submit-btn').textContent = 'Album erstellen';
    e.target.style.display = 'none';
  });

  document.getElementById('gallery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('gal-submit-btn').textContent = 'Speichert...';
    const id = document.getElementById('gal-id').value;
    const title = document.getElementById('gal-title').value;
    const date = document.getElementById('gal-date').value;
    const excerpt = document.getElementById('gal-excerpt').value;
    
    let existingAlbum = null;
    if (id) existingAlbum = Store.getAlbum(id);

    let cover = '';
    const coverType = document.querySelector('input[name="gal-cover-type"]:checked').value;
    if (coverType === 'url') {
      cover = document.getElementById('gal-cover').value;
    } else {
      const coverFile = document.getElementById('gal-cover-file');
      if (coverFile.files.length > 0) {
        cover = await compressImage(coverFile.files[0]);
      }
    }
    if (!cover && existingAlbum) cover = existingAlbum.image;

    let imagesArray = [];
    const imagesType = document.querySelector('input[name="gal-images-type"]:checked').value;
    if (imagesType === 'url') {
      const urls = document.getElementById('gal-images').value.split('\\n').map(u => u.trim()).filter(u => u.length > 0);
      imagesArray = urls.map(url => ({ url, title }));
    } else {
      const imagesFiles = document.getElementById('gal-images-file');
      for (let i = 0; i < imagesFiles.files.length; i++) {
        const compressed = await compressImage(imagesFiles.files[i]);
        imagesArray.push({ url: compressed, title });
      }
    }
    if (imagesArray.length === 0 && existingAlbum) {
      imagesArray = existingAlbum.images;
    }
    
    if (!cover) {
      alert("Bitte geben Sie ein Titelbild an.");
      document.getElementById('gal-submit-btn').textContent = 'Album erstellen';
      return;
    }
    if (imagesArray.length === 0) {
      alert("Bitte geben Sie mindestens ein Galeriebild an.");
      document.getElementById('gal-submit-btn').textContent = 'Album erstellen';
      return;
    }
    
    if (id) {
      Store.updateAlbum(id, title, date, excerpt, cover, imagesArray);
      alert('Album erfolgreich aktualisiert!');
    } else {
      Store.addAlbum(title, date, excerpt, cover, imagesArray);
      alert('Album erfolgreich erstellt!');
    }
    
    e.target.reset();
    document.getElementById('gal-id').value = '';
    document.getElementById('gal-submit-btn').textContent = 'Album erstellen';
    document.getElementById('gal-cancel-btn').style.display = 'none';
    document.getElementById('gal-cover').style.display = 'block';
    document.getElementById('gal-cover-file').style.display = 'none';
    document.getElementById('gal-images').style.display = 'block';
    document.getElementById('gal-images-file').style.display = 'none';
    renderAdminAlbumsList();
  });

  // Teams Logic
  const renderAdminTeamsList = () => {
    const list = document.getElementById('admin-teams-list');
    if (!list) return;
    const season = teamSeasonSelect?.value;
    if (!season) return;
    const teams = Store.getData().seasons[season]?.teams || [];
    
    if (teams.length === 0) {
      list.innerHTML = '<p style="color: var(--color-text-secondary); font-size: 0.9rem;">Keine Teams fÃ¼r diese Saison vorhanden.</p>';
      return;
    }

    list.innerHTML = teams.map(t => `
      <div class="glass-card" style="padding: var(--space-sm); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700;">${t.name}</span>
        <div>
          <button class="btn btn-outline edit-team-btn" data-id="${t.id}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Bearbeiten</button>
          <button class="btn delete-team-btn" data-id="${t.id}" style="padding: 5px 10px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">LÃ¶schen</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.delete-team-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Team wirklich lÃ¶schen? ACHTUNG: Das lÃ¶scht das Team nur aus der Dropdown-Liste, Matches bleiben bestehen!')) {
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
          const newName = prompt('Neuer Name fÃ¼r das Team:', team.name);
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
