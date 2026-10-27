import { Store } from '../store.js?v=1793040000000';

import { logout } from '../auth.js';

import { Router } from '../router.js';

import { getPlayerAvatar, calculateTeamPlayerStats, openPlayerStatsModal } from '../playerUtils.js?v=1793130000000';
import { calculateSeasonSuspensions, normalizePlayerName, normalizeKey } from '../suspensionUtils.js?v=1793040000000';

import { storage } from '../firebase.js';

import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";



let currentTeamTab = 'kader'; // 'kader' | 'nachmelden' | 'antraege'

let searchQuery = '';

let statusFilter = 'Aktiv'; // 'all' | 'Aktiv' | 'Inaktiv'

let activeUploadPlayer = null;
let selectedKaderSeasonKey = null;
let selectedKaderMatchId = null;
let selectedStatsSeasonKey = null;



const compressImage = (file) => {

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onload = (e) => {

      const img = new Image();

      img.onload = () => {

        const canvas = document.createElement('canvas');

        let width = img.width;

        let height = img.height;

        const maxDim = 800;

        if (width > maxDim || height > maxDim) {

          if (width > height) {

            height = Math.round((height * maxDim) / width);

            width = maxDim;

          } else {

            width = Math.round((width * maxDim) / height);

            height = maxDim;

          }

        }

        canvas.width = width;

        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));

      };

      img.onerror = () => resolve(null);

      img.src = e.target.result;

    };

    reader.onerror = () => resolve(null);

    reader.readAsDataURL(file);

  });

};



const uploadPhotoToStorage = async (file) => {

  if (!file) return null;

  try {

    const cleanName = (file.name || 'pass')

      .replace(/[^a-zA-Z0-9.-]/g, '_')

      .toLowerCase();

    const storagePath = `passes/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);

    return await getDownloadURL(snapshot.ref);

  } catch (err) {

    console.warn("Storage upload failed, falling back to compression:", err);

    return null;

  }

};



export const viewTeamAdmin = (auth) => {

  const teamName = auth.teamName || 'Mein Team';

  return `

    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: var(--space-md) var(--space-md);">

      

      <!-- Team Header Banner -->

      <div class="glass-card stagger-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); padding: var(--space-lg); margin-bottom: var(--space-lg); border-left: 4px solid var(--color-accent);">

        <div>

          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">Vereinsverwaltung</div>

          <h1 style="margin: 4px 0 6px 0; font-size: 1.8rem;">${teamName}</h1>

          <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin: 0;">Verwalte den Spielerkader, Passfotos und Neuanmeldungen deines Vereins</p>

        </div>

        <div style="display: flex; gap: var(--space-sm); align-items: center;">

          <button id="team-logout-btn" class="btn btn-outline" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.35) !important; font-weight: 700; padding: 8px 16px;">

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>

            Abmelden

          </button>

        </div>

      </div>



      <!-- Navigation Tabs -->

      <div style="display: flex; gap: var(--space-xs); border-bottom: 1px solid var(--glass-border); margin-bottom: var(--space-lg); overflow-x: auto;">

        <button class="team-tab-btn ${currentTeamTab === 'kader' ? 'active' : ''}" data-tab="kader" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'kader' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'kader' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer;">

          Mein Kader

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'spieltagskader' ? 'active' : ''}" data-tab="spieltagskader" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'spieltagskader' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'spieltagskader' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer; white-space: nowrap;">

          Spieltagskader

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'statistiken' ? 'active' : ''}" data-tab="statistiken" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'statistiken' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'statistiken' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer; white-space: nowrap;">

          Statistiken

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'nachmelden' ? 'active' : ''}" data-tab="nachmelden" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'nachmelden' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'nachmelden' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer;">

          + Spieler anmelden

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'antraege' ? 'active' : ''}" data-tab="antraege" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'antraege' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'antraege' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center;">

          Meine Anträge <span id="team-requests-badge" style="display: none; background: var(--color-accent); color: #fff; font-size: 0.72rem; padding: 2px 7px; border-radius: 10px; margin-left: 6px; font-weight: 700;"></span>

        </button>

      </div>



      <!-- Tab Content Area -->

      <div id="team-tab-content">

        <!-- Injected dynamically -->

      </div>



    </div>



    <!-- Upload Photo Modal -->

    <div id="photo-upload-modal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">

      <div class="glass-card modal-content" style="max-width: 480px; width: 90%; padding: var(--space-lg); border-radius: 10px; position: relative;">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">

          <h3 id="modal-player-name" style="margin: 0; font-size: 1.25rem;">Passfoto hochladen</h3>

          <button type="button" id="modal-close-x-btn" aria-label="Schließen" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--color-text-secondary); line-height: 1; padding: 4px;">✕</button>

        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: var(--space-md);">Fotografiere den bestehenden Spielerpass oder lade ein klares Porträtfoto hoch.</p>

        

        <div style="text-align: center; margin-bottom: var(--space-md);">

          <div id="modal-avatar-preview-box" style="width: 110px; height: 110px; border-radius: 50%; overflow: hidden; margin: 0 auto 12px auto; border: 3px solid var(--color-accent); background: #111;">

            <img id="modal-avatar-preview-img" src="Spieler/1.jpg" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center;">

          </div>

          <input type="file" id="modal-file-input" accept="image/*" capture="environment" style="display: none;">

          <button type="button" id="modal-select-file-btn" class="btn btn-dsg" style="padding: 9px 18px; font-weight: 600;">

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>

            Foto aufnehmen / auswählen

          </button>

          <div id="modal-upload-status" style="font-size: 0.8rem; margin-top: 8px; color: var(--color-text-secondary);"></div>

        </div>



        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--glass-border); padding-top: var(--space-md);">

          <button type="button" id="modal-cancel-btn" class="btn btn-outline" style="padding: 8px 16px;">Abbrechen</button>

          <button type="button" id="modal-save-btn" class="btn btn-dsg" style="background: #22c55e; color: #fff; font-weight: 700; padding: 8px 20px;">Speichern</button>

        </div>

      </div>

    </div>

  `;

};




const formatBirthdate = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (str.includes('.')) return str;
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return str;
};

const parseMatchKickoff = (dateStr, timeStr) => {
  if (!dateStr) return null;
  let year, month, day;
  const d = String(dateStr).trim();
  if (d.includes('.')) {
    const parts = d.split('.');
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (d.includes('-')) {
    const parts = d.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }
  if (!year || isNaN(year) || isNaN(month) || isNaN(day)) return null;

  let hours = 18;
  let minutes = 0;
  if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
    const [h, m] = timeStr.split(':');
    const pH = parseInt(h, 10);
    const pM = parseInt(m, 10);
    if (!isNaN(pH)) hours = pH;
    if (!isNaN(pM)) minutes = pM;
  }
  return new Date(year, month, day, hours, minutes).getTime();
};

export const bindTeamAdmin = async (auth) => {

  const teamName = auth.teamName || 'Mein Team';

  let stagedPhotoUrl = null;
  let statsStatusFilter = 'Aktiv';
  let statsSearchQuery = '';



  document.getElementById('team-logout-btn')?.addEventListener('click', () => {

    logout();

    window.location.hash = '#/admin';

    window.location.reload();

  });



  const updateBadge = () => {

    const badge = document.getElementById('team-requests-badge');

    if (!badge) return;

    const allRequests = Store.getPlayerRequests();

    const teamRequests = allRequests.filter(r => (r.teamName || '').toLowerCase() === teamName.toLowerCase() && r.status === 'pending');

    if (teamRequests.length > 0) {

      badge.textContent = String(teamRequests.length);

      badge.style.display = 'inline-block';

    } else {

      badge.style.display = 'none';

    }

  };



  const tabButtons = document.querySelectorAll('.team-tab-btn');

  tabButtons.forEach(btn => {

    btn.addEventListener('click', () => {

      currentTeamTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {

        const isActive = b.getAttribute('data-tab') === currentTeamTab;

        b.style.borderBottomColor = isActive ? 'var(--color-accent)' : 'transparent';

        b.style.color = isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)';

      });

      renderTab();

    });

  });



  const renderTab = async () => {

    const container = document.getElementById('team-tab-content');

    if (!container) return;

    updateBadge();



    if (currentTeamTab === 'kader') {

      const allPlayers = await Store.getAdminPlayers();

      // Match players belonging to this team (flexible match)

      const teamPlayers = allPlayers.filter(p => {

        const t = (p.Team || '').trim().toLowerCase();

        const myT = teamName.trim().toLowerCase();

        return t === myT || t.includes(myT) || myT.includes(t);

      });



      const filtered = teamPlayers.filter(p => {

        // Status filter

        const pStatus = p.Status || p.status || 'Aktiv';

        if (statusFilter !== 'all' && pStatus.toLowerCase() !== statusFilter.toLowerCase()) {

          return false;

        }

        // Search query

        if (!searchQuery) return true;

        const q = searchQuery.toLowerCase();

        const name = `${p.Vorname || ''} ${p.Nachname || ''}`.toLowerCase();

        return name.includes(q);

      });



      const activeCount = teamPlayers.filter(p => (p.Status || p.status || 'Aktiv').toLowerCase() === 'aktiv').length;

      const inactiveCount = teamPlayers.length - activeCount;



      container.innerHTML = `

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">

          <div>

            <h3 style="margin: 0; font-size: 1.25rem;">Spielerkader (${filtered.length} von ${teamPlayers.length} Spielern)</h3>

            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 2px;">

              ${activeCount} Aktiv &bull; ${inactiveCount} Inaktiv / Archiviert

            </p>

          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">

            <input type="text" id="kader-search" class="admin-input" placeholder="Spieler suchen..." value="${searchQuery}" style="width: 170px;">

            <select id="kader-status-filter" class="admin-input" style="width: 140px; font-size: 0.85rem; font-weight: 600;">

              <option value="Aktiv" ${statusFilter === 'Aktiv' ? 'selected' : ''}>Nur Aktive</option>

              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Alle Spieler</option>

              <option value="Inaktiv" ${statusFilter === 'Inaktiv' ? 'selected' : ''}>Nur Inaktive</option>

            </select>

          </div>

        </div>



        ${filtered.length === 0 ? `

          <div class="glass-card" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary); border-radius: 8px;">

            <h4>Keine passenden Spieler gefunden</h4>

            <p style="font-size: 0.85rem;">Passe den Filter oder den Suchbegriff an.</p>

          </div>

        ` : `

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: var(--space-md);">
            ${filtered.map(p => {
              const hasCustomPhoto = Boolean(p.photoUrl && p.photoUrl.trim() !== '');
              const isSuspended = Boolean(p.Sperre && p.Sperre.trim() !== '');
              const pStatus = p.Status || p.status || 'Aktiv';
              const isInactive = pStatus.toLowerCase() !== 'aktiv';
              const avatarSrc = getPlayerAvatar(p);
              const pPosition = (p.Position || p.position || '').trim();
              const formattedBirth = formatBirthdate(p.Geburtsdatum);

              return `
                <div class="glass-card kader-player-profile-card" data-player-id="${p['#'] || p.id || (p.Vorname + '_' + p.Nachname)}" style="display: flex; flex-direction: column; justify-content: space-between; padding: 14px; border-radius: 8px; border: 1px solid ${isSuspended ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)'}; background: ${isSuspended ? 'rgba(220, 38, 38, 0.05)' : 'var(--color-surface)'}; cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;" title="Klicken für Spielerstatistiken">
                  <!-- Info Section -->
                  <div style="display: flex; gap: 14px; align-items: flex-start;">
                    <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: #111; flex-shrink: 0; border: 2px solid ${hasCustomPhoto ? 'var(--color-accent)' : 'rgba(255,255,255,0.12)'};">
                      <img src="${avatarSrc}" alt="${p.Vorname} ${p.Nachname}" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center;">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.98rem; color: var(--color-text-primary); line-height: 1.3; word-break: break-word;">
                        ${p.Vorname} ${p.Nachname}
                      </div>
                      ${pPosition && pPosition !== '-' ? `
                        <div style="font-size: 0.78rem; font-weight: 600; color: var(--color-accent); margin-top: 2px;">
                          ${pPosition}
                        </div>
                      ` : ''}
                      <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 3px; white-space: nowrap;">
                        ${formattedBirth ? `Geb.: ${formattedBirth}` : 'Kein Geburtsdatum'}
                      </div>
                      <div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
                        ${isSuspended ? `
                          <span style="background: rgba(220, 38, 38, 0.12); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Gesperrt</span>
                        ` : hasCustomPhoto ? `
                          <span style="background: rgba(22, 163, 74, 0.12); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Digital verifiziert</span>
                        ` : `
                          <span style="background: rgba(217, 119, 6, 0.12); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Passfoto fehlt</span>
                        `}
                        ${isInactive ? `
                          <span style="background: rgba(100, 116, 139, 0.15); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Inaktiv</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <!-- Action Button: Placed underneath the status pills and text -->
                  <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                    <button type="button" class="btn btn-outline btn-upload-player-photo" data-id="${p['#'] || (p.Vorname + '_' + p.Nachname)}" style="width: 100%; color: var(--color-text-primary) !important; font-size: 0.8rem; font-weight: 600; padding: 7px 12px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;" title="Passfoto / Alten Spielerpass hochladen">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      ${hasCustomPhoto ? 'Passfoto ändern' : 'Passfoto hochladen'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;

      document.getElementById('kader-search')?.addEventListener('input', (e) => {

        searchQuery = e.target.value;

        renderTab();

      });



      document.getElementById('kader-status-filter')?.addEventListener('change', (e) => {

        statusFilter = e.target.value;

        renderTab();

      });



      // Wire player profile modal openers on player cards
      container.querySelectorAll('.kader-player-profile-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-upload-player-photo')) return;
          const pId = card.getAttribute('data-player-id');
          const playerObj = filtered.find(x => String(x['#'] || x.id || (x.Vorname + '_' + x.Nachname)) === String(pId));
          if (playerObj) {
            openPlayerStatsModal(playerObj, { teamName, seasonKey: Store.getData()?.currentSeason });
          }
        });
      });

      // Bind photo upload modal openers

      container.querySelectorAll('.btn-upload-player-photo').forEach(btn => {

        btn.addEventListener('click', () => {

          const playerId = btn.getAttribute('data-id');

          const p = teamPlayers.find(pl => (pl['#'] || (pl.Vorname + '_' + pl.Nachname)) === playerId);

          if (p) {

            openUploadModal(p);

          }

        });

      });



        } else if (currentTeamTab === 'spieltagskader') {
      const data = Store.getData();
      const allSeasons = data.seasons || {};
      const allLeagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
      const normTeam = (teamName || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();

      // Collect all available seasons where this team has matches
      const availableSeasons = [];
      Object.keys(allSeasons).forEach(sKey => {
        const s = allSeasons[sKey];
        if (s && Array.isArray(s.matches)) {
          const hasMatch = s.matches.some(m => {
            const h = (m.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
            const a = (m.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
            return h.includes(normTeam) || normTeam.includes(h) || a.includes(normTeam) || normTeam.includes(a);
          });
          if (hasMatch) {
            const leagueObj = allLeagues.find(l => l.seasonKey === sKey || l.name === sKey);
            let label = leagueObj ? `${leagueObj.name} ${leagueObj.year || ''}`.trim() : (s.name ? `${s.name} ${s.year || ''}`.trim() : (sKey === '2026/2027' ? 'DSG Liga 2026/2027' : sKey));
            availableSeasons.push({
              seasonKey: sKey,
              label: label,
              isCurrent: leagueObj ? !!leagueObj.isCurrent : (sKey === (data.currentSeason || '2026/2027'))
            });
          }
        }
      });

      // Sort: current season first, then reverse chronological
      availableSeasons.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return b.seasonKey.localeCompare(a.seasonKey);
      });

      if (availableSeasons.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="padding: var(--space-xl); text-align: center; border-radius: 8px;">
            <p style="color: var(--color-text-secondary); margin: 0;">Keine angesetzten Spiele für diesen Verein gefunden.</p>
          </div>
        `;
        return;
      }

      // Default season: current season or first in list
      if (!selectedKaderSeasonKey || !availableSeasons.some(s => s.seasonKey === selectedKaderSeasonKey)) {
        const currentS = availableSeasons.find(s => s.isCurrent) || availableSeasons[0];
        selectedKaderSeasonKey = currentS ? currentS.seasonKey : (data.currentSeason || '2026/2027');
      }

      const currentSeasonObj = allSeasons[selectedKaderSeasonKey] || {};
      const seasonMatches = Array.isArray(currentSeasonObj.matches) ? currentSeasonObj.matches : [];
      const teamMatches = seasonMatches.filter(m => {
        const h = (m.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
        const a = (m.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
        return h.includes(normTeam) || normTeam.includes(h) || a.includes(normTeam) || normTeam.includes(a);
      });

      if (teamMatches.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-accent); margin-bottom: 6px; text-transform: uppercase;">
              Liga / Saison
            </label>
            <select id="kader-season-select" class="admin-input" style="width: 100%; max-width: 320px; font-size: 0.95rem; font-weight: 600; padding: 10px;">
              ${availableSeasons.map(s => `
                <option value="${s.seasonKey}" ${s.seasonKey === selectedKaderSeasonKey ? 'selected' : ''}>${s.label}</option>
              `).join('')}
            </select>
          </div>
          <div class="glass-card" style="padding: var(--space-xl); text-align: center; border-radius: 8px;">
            <p style="color: var(--color-text-secondary); margin: 0;">Keine Spiele in der ausgewählten Saison vorhanden.</p>
          </div>
        `;
        document.getElementById('kader-season-select')?.addEventListener('change', (e) => {
          selectedKaderSeasonKey = e.target.value;
          selectedKaderMatchId = null;
          renderTab();
        });
        return;
      }

      // Default match: first unplayed or first in list
      if (!selectedKaderMatchId || !teamMatches.some(m => String(m.id) === String(selectedKaderMatchId))) {
        const unplayed = teamMatches.find(m => m.status !== 'Gespielt' && (!m.score || m.score === '-:-' || m.score === '- : -'));
        selectedKaderMatchId = unplayed ? unplayed.id : teamMatches[0].id;
      }

      const currentMatch = teamMatches.find(m => String(m.id) === String(selectedKaderMatchId)) || teamMatches[0];
      const isPlayed = currentMatch.status === 'Gespielt' || (currentMatch.score && currentMatch.score !== '-:-' && currentMatch.score !== '- : -');

      // Kickoff & 15-Minute Deadline calculation
      const kickoffTimestamp = parseMatchKickoff(currentMatch.date, currentMatch.time);
      const deadlineTimestamp = kickoffTimestamp ? (kickoffTimestamp - 15 * 60 * 1000) : null;
      const isPastDeadline = deadlineTimestamp ? (Date.now() > deadlineTimestamp) : false;
      const isRosterLocked = isPlayed || isPastDeadline;

      let deadlineFormatted = '';
      if (deadlineTimestamp) {
        const dDate = new Date(deadlineTimestamp);
        deadlineFormatted = `${dDate.toLocaleDateString('de-AT')} um ${dDate.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} Uhr`;
      }

      const existingRoster = Store.getMatchdayRoster(selectedKaderSeasonKey, currentMatch.id, teamName);
      const isSubmitted = !!(existingRoster && existingRoster.players && existingRoster.players.length > 0);

      const allPlayers = await Store.getAdminPlayers();
      // STRICT RULE: Only active players (inaktiv cannot play)
      const teamPlayers = allPlayers.filter(p => {
        const t = (p.Team || p.Mannschaft || '').trim().toLowerCase();
        const myT = teamName.trim().toLowerCase();
        const status = (p.Status || p.status || 'Aktiv').toLowerCase();
        return (t === myT || t.includes(myT) || myT.includes(t)) && status === 'aktiv';
      });

      const { playerMap } = calculateSeasonSuspensions(selectedKaderSeasonKey);

      const getPlayerSuspensionData = (pName, teamTitle) => {
        const pNorm = normalizePlayerName(pName);
        const tNorm = normalizeKey(teamTitle);
        let susp = playerMap.get(pNorm + '___' + tNorm);

        if (!susp) {
          for (const [key, val] of playerMap.entries()) {
            if (key.startsWith(pNorm + '___')) {
              const entryTeam = key.split('___')[1] || '';
              if (entryTeam.includes(tNorm) || tNorm.includes(entryTeam) || !tNorm) {
                susp = val;
                break;
              }
            }
          }
        }
        if (!susp) {
          for (const [key, val] of playerMap.entries()) {
            if (key.startsWith(pNorm + '___')) {
              susp = val;
              break;
            }
          }
        }

        if (!susp) {
          return {
            isSuspended: false,
            isWarning: false,
            reason: '',
            yellowCount: 0,
            redCount: 0,
            yellowRedCount: 0,
            warningThreshold: 3
          };
        }

        const matchRound = (currentMatch.round || '').trim();
        const matchId = String(currentMatch.id || '');
        const isFinished = isPlayed;

        let isSuspended = false;
        let reason = '';

        if (susp.status === 'suspended' && susp.active) {
          const nextM = susp.active.nextMatch?.match;
          if (!isFinished || (nextM && String(nextM.id) === matchId)) {
            isSuspended = true;
            reason = susp.active.reason || 'Spielsperre';
          }
        } else if (susp.served && Array.isArray(susp.served) && susp.served.length > 0) {
          const servedInThisMatch = susp.served.some(s => 
            s.gamesServed && (s.gamesServed.includes(matchRound) || s.gamesServed.includes(currentMatch.date))
          );
          if (servedInThisMatch) {
            isSuspended = true;
            reason = susp.served[0]?.reason || 'Spielsperre (abgesessen)';
          }
        }

        if (!isSuspended && susp.yellowCount >= 3) {
          const hasUnservedYellow = susp.active && susp.active.type && susp.active.type.startsWith('yellow');
          if (hasUnservedYellow) {
            isSuspended = true;
            reason = `${susp.yellowCount}. Gelbe Karte`;
          }
        }

        const isWarning = !isSuspended && (susp.status === 'warning' || !!susp.warning || susp.yellowCount === 2 || susp.yellowCount === 4);
        const warningThreshold = susp.warning?.threshold || (susp.yellowCount >= 3 ? 5 : 3);

        return {
          isSuspended,
          isWarning,
          reason,
          statusText: susp.statusText || '',
          yellowCount: susp.yellowCount || 0,
          redCount: susp.redCount || 0,
          yellowRedCount: susp.yellowRedCount || 0,
          warningThreshold
        };
      };

      // Prepare players with suspension & roster data
      const processedPlayers = teamPlayers.map(p => {
        const pName = `${p.Vorname || ''} ${p.Nachname || ''}`.trim();
        const suspData = getPlayerSuspensionData(pName, teamName);
        const isSuspended = suspData.isSuspended;

        let inRosterPlayer = null;
        if (existingRoster && Array.isArray(existingRoster.players)) {
          inRosterPlayer = existingRoster.players.find(rp => 
            String(rp.id) === String(p['#'] || p.id) ||
            normalizePlayerName((rp.firstName || '') + ' ' + (rp.lastName || '')) === normalizePlayerName(pName)
          );
        }

        // STRICT REQUIREMENT: No auto-selection unless already saved in existing roster and not suspended
        const isChecked = existingRoster && !isSuspended ? !!inRosterPlayer : false;
        
        // Starting 11 vs Ersatzbank role
        let isStarter = true;
        if (existingRoster && Array.isArray(existingRoster.players) && inRosterPlayer) {
          isStarter = inRosterPlayer.isStarter !== false && inRosterPlayer.role !== 'sub';
        }
        
        // STRICT REQUIREMENT: No pre-filled jersey number unless already saved in existing roster
        let currentJersey = '';
        if (existingRoster && inRosterPlayer && inRosterPlayer.jerseyNumber && !isSuspended) {
          currentJersey = inRosterPlayer.jerseyNumber;
        }

        return {
          raw: p,
          id: p['#'] || p.id || pName,
          pName,
          position: p.Position || p.position || 'Feldspieler',
          isSuspended,
          suspReason: suspData.reason,
          isWarning: suspData.isWarning,
          yellowCount: suspData.yellowCount,
          redCount: suspData.redCount,
          yellowRedCount: suspData.yellowRedCount,
          warningThreshold: suspData.warningThreshold,
          isChecked,
          isStarter,
          jerseyNumber: currentJersey,
          avatar: getPlayerAvatar(p)
        };
      });

      // Sort: checked players first (if any), then non-suspended first, then alphabetical
      processedPlayers.sort((a, b) => {
        if (a.isChecked !== b.isChecked) return a.isChecked ? -1 : 1;
        if (a.isSuspended !== b.isSuspended) return a.isSuspended ? 1 : -1;
        const numA = parseInt(a.jerseyNumber, 10);
        const numB = parseInt(b.jerseyNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return a.pName.localeCompare(b.pName);
      });

      const initialCount = processedPlayers.filter(p => p.isChecked && !p.isSuspended).length;
      container.innerHTML = `
        <!-- Match & Season Selector Card -->
        <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border);">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-md);">
            <!-- Season / League Selector -->
            <div style="flex: 1 1 200px; min-width: 0;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-accent); margin-bottom: 6px; text-transform: uppercase;">
                Liga / Saison
              </label>
              <select id="kader-season-select" class="admin-input" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px;">
                ${availableSeasons.map(s => `
                  <option value="${s.seasonKey}" ${s.seasonKey === selectedKaderSeasonKey ? 'selected' : ''}>${s.label}</option>
                `).join('')}
              </select>
            </div>

            <!-- Match Selector -->
            <div style="flex: 2 1 300px; min-width: 0;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-accent); margin-bottom: 6px; text-transform: uppercase;">
                Spielbegegnung
              </label>
              <select id="kader-match-select" class="admin-input" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px;">
                ${teamMatches.map(m => {
                  const datePart = m.date ? ` • ${m.date}` : '';
                  const timePart = m.time ? ` (${m.time} Uhr)` : '';
                  const roundPart = m.round ? `${m.round}: ` : '';
                  const isMPlayed = m.status === 'Gespielt' || (m.score && m.score !== '-:-' && m.score !== '- : -');
                  const scorePart = isMPlayed ? ` [${m.score}]` : '';
                  return `<option value="${m.id}" ${String(m.id) === String(selectedKaderMatchId) ? 'selected' : ''}>${roundPart}${m.home} vs ${m.away}${datePart}${timePart}${scorePart}</option>`;
                }).join('')}
              </select>
            </div>

            <!-- Status Badge & Meta -->
            <div style="text-align: right; flex-shrink: 0; min-width: 130px;">
              <div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 700;">Spielstatus</div>
              <div style="font-weight: 800; font-size: 1rem; color: ${isPlayed ? 'var(--color-accent)' : 'var(--color-text-primary)'}; margin-top: 2px;">
                ${isPlayed ? `Gespielt (${currentMatch.score || ''})` : 'Bevorstehend'}
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">
                ${currentMatch.date ? `${currentMatch.date}${currentMatch.time ? ` • ${currentMatch.time} Uhr` : ''}` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Status Alert Box -->
        ${isRosterLocked ? `
          <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.35); border-radius: 8px; padding: 14px 18px; margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #dc2626; flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <div style="font-weight: 800; color: #dc2626; font-size: 0.95rem;">Kaderbearbeitung gesperrt (Frist abgelaufen)</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
                  ${isPlayed ? 'Dieses Spiel wurde bereits beendet.' : `Die Frist für Kaderänderungen endete 15 Minuten vor Anpfiff (${deadlineFormatted || '15 Min. vor Anpfiff'}).`} Der Spieltagskader ist für Bearbeitungen gesperrt.
                </div>
              </div>
            </div>
            <span style="background: rgba(220, 38, 38, 0.2); color: #dc2626; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(220, 38, 38, 0.4); text-transform: uppercase;">Gesperrt</span>
          </div>
        ` : isSubmitted ? `
          <div style="background: rgba(0, 240, 95, 0.08); border: 1px solid rgba(0, 240, 95, 0.35); border-radius: 8px; padding: 14px 18px; margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <div style="font-weight: 800; color: var(--color-accent); font-size: 0.95rem;">Spieltagskader übermittelt &mdash; Änderungen bis 15 Min. vor Anpfiff möglich</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
                  ${existingRoster.players.length} Spieler nominiert &bull; Zuletzt übermittelt am ${new Date(existingRoster.submittedAt).toLocaleDateString('de-AT')} um ${new Date(existingRoster.submittedAt).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} Uhr${deadlineFormatted ? ` &bull; Frist: ${deadlineFormatted}` : ''}
                </div>
              </div>
            </div>
            <span style="background: rgba(0, 240, 95, 0.2); color: #16a34a; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(0, 240, 95, 0.4); text-transform: uppercase;">Aktiv &amp; Bearbeitbar</span>
          </div>
        ` : `
          <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: var(--space-md); font-size: 0.85rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 10px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #d97706; flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>Wähle die anwesenden Spieler aus und trage für jeden Spieler die heutige Trikotnummer ein. Änderungen und Aktualisierungen sind jederzeit bis 15 Minuten vor Anpfiff${deadlineFormatted ? ` (${deadlineFormatted})` : ''} möglich.</div>
          </div>
        `}

        <!-- Control Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem;">Kader-Nominierung &amp; Trikotnummern</h3>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${teamPlayers.length} aktive Spieler im Verein verfügbar. Rückennummern gelten flexibel für dieses Spiel.
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" id="kader-select-all-btn" class="btn btn-outline" ${isRosterLocked ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="font-size: 0.78rem; padding: 6px 12px; font-weight: 700;">Alle aktiven wählen</button>
            <button type="button" id="kader-deselect-all-btn" class="btn btn-outline" ${isRosterLocked ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="font-size: 0.78rem; padding: 6px 12px; font-weight: 700;">Auswahl aufheben</button>
            <span id="kader-counter-badge" style="background: rgba(0, 240, 95, 0.15); color: #16a34a; border: 1px solid rgba(0, 240, 95, 0.3); padding: 5px 12px; border-radius: 6px; font-weight: 800; font-size: 0.85rem;">
              ${initialCount} Spieler nominiert
            </span>
          </div>
        </div>

        <!-- Players Grid -->
        <div id="kader-players-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; margin-bottom: var(--space-lg);">
          ${processedPlayers.map(p => {
            return `
              <div class="kader-player-card glass-card" data-player-id="${p.id}" style="padding: 10px 12px; border-radius: 8px; border: 1px solid ${p.isSuspended ? '#ef4444' : p.isChecked ? 'var(--color-accent)' : p.isWarning ? 'rgba(234, 179, 8, 0.45)' : 'var(--glass-border)'}; background: ${p.isSuspended ? 'rgba(220, 38, 38, 0.06)' : p.isWarning ? 'rgba(234, 179, 8, 0.03)' : 'var(--color-surface)'}; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: border-color 0.2s;">
                <div class="kader-player-info-area" style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; cursor: pointer;" title="Klicken für Spielerstatistiken">
                  <input type="checkbox" class="kader-player-check" data-player-id="${p.id}" ${p.isChecked ? 'checked' : ''} ${p.isSuspended || isRosterLocked ? 'disabled' : ''} style="width: 18px; height: 18px; cursor: ${p.isSuspended || isRosterLocked ? 'not-allowed' : 'pointer'}; accent-color: var(--color-accent); flex-shrink: 0;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #111; border: 2px solid ${p.isSuspended ? '#ef4444' : p.isChecked ? 'var(--color-accent)' : 'var(--glass-border)'}; flex-shrink: 0;">
                    <img src="${p.avatar}" alt="${p.pName}" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center;">
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span style="font-weight: 700; font-size: 0.92rem; color: ${p.isSuspended ? '#dc2626' : 'var(--color-text-primary)'}; word-break: break-word;">
                        ${p.pName}
                      </span>
                      ${p.isSuspended ? `
                        <span style="background: #dc2626; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 3px; letter-spacing: 0.5px;">GESPERRT (${p.suspReason || 'Sperre'})</span>
                      ` : p.isWarning ? `
                        <span style="background: rgba(234, 179, 8, 0.18); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.45); font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 3px;" title="Bei einer weiteren Gelben Karte im nächsten Spiel gesperrt">Sperre droht (${p.yellowCount}/${p.warningThreshold} Gelbe)</span>
                      ` : ''}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 2px; margin-top: 2px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${p.position}</span>
                        ${(p.yellowCount > 0 || p.redCount > 0 || p.yellowRedCount > 0) ? `
                          <span style="display: inline-flex; align-items: center; gap: 3px; margin-left: 4px;">
                            ${p.yellowCount > 0 ? `<span style="background: #eab308; color: #000; font-weight: 800; font-size: 0.66rem; padding: 1px 4px; border-radius: 2px;" title="${p.yellowCount} Gelbe Karte(n)">${p.yellowCount}G</span>` : ''}
                            ${p.yellowRedCount > 0 ? `<span style="background: #f97316; color: #fff; font-weight: 800; font-size: 0.66rem; padding: 1px 4px; border-radius: 2px;" title="${p.yellowRedCount} Gelb-Rot">${p.yellowRedCount}GR</span>` : ''}
                            ${p.redCount > 0 ? `<span style="background: #dc2626; color: #fff; font-weight: 800; font-size: 0.66rem; padding: 1px 4px; border-radius: 2px;" title="${p.redCount} Rot">${p.redCount}R</span>` : ''}
                          </span>
                        ` : ''}
                      </div>
                      ${p.isSuspended ? `
                        <div style="color: #dc2626; font-size: 0.72rem; font-weight: 700;">Nicht spielberechtigt &bull; Darf nicht aufgestellt werden</div>
                      ` : p.isWarning ? `
                        <div style="color: #d97706; font-size: 0.72rem; font-weight: 600;">Vorverwarnung: Noch 1 Gelbe Karte bis zur Sperre</div>
                      ` : ''}
                    </div>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary);">Nr.</label>
                    <input type="number" class="admin-input kader-jersey-input" data-player-id="${p.id}" min="1" max="99" placeholder="--" value="${p.jerseyNumber}" ${p.isSuspended || isRosterLocked ? 'disabled' : ''} style="width: 50px; text-align: center; font-weight: 800; font-size: 0.95rem; padding: 4px; ${p.isSuspended || isRosterLocked ? 'cursor: not-allowed; opacity: 0.7;' : ''}">
                  </div>
                  <button type="button" class="btn kader-role-btn ${p.isStarter ? 'btn-dsg' : 'btn-outline'}" data-player-id="${p.id}" data-role="${p.isStarter ? 'starter' : 'sub'}" ${p.isSuspended || isRosterLocked ? 'disabled' : ''} style="font-size: 0.72rem; padding: 3px 8px; font-weight: 800; border-radius: 4px; line-height: 1.1; ${!p.isChecked ? 'display: none;' : ''}; white-space: nowrap;" title="Klicken um zwischen Startelf und Bank zu wechseln">
                    ${p.isStarter ? 'Startelf' : 'Bank'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <!-- Submit Bar -->
        <div class="glass-card" style="padding: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div style="font-size: 0.85rem; color: var(--color-text-secondary);">
            ${isRosterLocked ? 'Der Kader kann nach Ablauf der Frist nicht mehr verändert werden.' : 'Du kannst diesen Kader bis 15 Minuten vor dem Anpfiff jederzeit erneut aktualisieren.'}
          </div>
          <button type="button" id="kader-submit-btn" class="btn ${isRosterLocked ? 'btn-outline' : 'btn-dsg'}" ${isRosterLocked ? 'disabled' : ''} style="padding: 12px 24px; font-weight: 800; font-size: 0.95rem; ${isRosterLocked ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
            ${isRosterLocked ? 'Kaderabgabe gesperrt' : isSubmitted ? 'Spieltagskader aktualisieren & freigeben' : 'Spieltagskader für Schiedsrichter freigeben'}
          </button>
        </div>
      `;

      // Wire Season Selector
      document.getElementById('kader-season-select')?.addEventListener('change', (e) => {
        selectedKaderSeasonKey = e.target.value;
        selectedKaderMatchId = null;
        renderTab();
      });

      // Wire Match Selector
      document.getElementById('kader-match-select')?.addEventListener('change', (e) => {
        selectedKaderMatchId = e.target.value;
        renderTab();
      });

      // Update counter helper with Startelf & Bank counts
      const updateKaderCounter = () => {
        const checkedBoxes = Array.from(document.querySelectorAll('.kader-player-check:checked'));
        const totalCount = checkedBoxes.length;
        let starterCount = 0;
        let subCount = 0;
        checkedBoxes.forEach(cb => {
          const pId = cb.getAttribute('data-player-id');
          const roleBtn = document.querySelector(`.kader-role-btn[data-player-id="${pId}"]`);
          const isStart = roleBtn?.getAttribute('data-role') !== 'sub';
          if (isStart) starterCount++;
          else subCount++;
        });

        const badge = document.getElementById('kader-counter-badge');
        if (badge) {
          badge.innerHTML = `<strong>${starterCount}</strong> Startelf &bull; <strong>${subCount}</strong> Bank (${totalCount} Nominiert)`;
          if (starterCount === 11) {
            badge.style.color = '#16a34a';
            badge.style.borderColor = 'rgba(0, 240, 95, 0.4)';
          } else {
            badge.style.color = '#d97706';
            badge.style.borderColor = 'rgba(234, 179, 8, 0.4)';
          }
        }
      };

      // Wire player stats modal on card click (excluding inputs/buttons)
      document.querySelectorAll('.kader-player-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('input, button, label, .kader-player-check, .kader-jersey-input, .kader-role-btn')) {
            return;
          }
          const pId = card.getAttribute('data-player-id');
          const pObj = processedPlayers.find(x => String(x.id) === String(pId));
          if (pObj) {
            openPlayerStatsModal(pObj.raw || pObj, { teamName, seasonKey: selectedKaderSeasonKey });
          }
        });
      });

      // Checkbox changes & Role button wiring
      if (!isRosterLocked) {
        document.querySelectorAll('.kader-player-check').forEach(cb => {
          cb.addEventListener('change', (e) => {
            const pId = e.target.getAttribute('data-player-id');
            const card = e.target.closest('.kader-player-card');
            const roleBtn = document.querySelector(`.kader-role-btn[data-player-id="${pId}"]`);
            if (card) {
              card.style.borderColor = e.target.checked ? 'var(--color-accent)' : 'var(--glass-border)';
            }
            if (roleBtn) {
              if (e.target.checked) {
                roleBtn.style.display = 'inline-block';
                // Auto-assignment: if < 11 starters currently, assign Startelf, otherwise Bank
                const currentStarters = Array.from(document.querySelectorAll('.kader-player-check:checked'))
                  .filter(c => c !== e.target && document.querySelector(`.kader-role-btn[data-player-id="${c.getAttribute('data-player-id')}"]`)?.getAttribute('data-role') !== 'sub').length;
                if (currentStarters < 11) {
                  roleBtn.setAttribute('data-role', 'starter');
                  roleBtn.className = 'btn btn-dsg kader-role-btn';
                  roleBtn.textContent = 'Startelf';
                } else {
                  roleBtn.setAttribute('data-role', 'sub');
                  roleBtn.className = 'btn btn-outline kader-role-btn';
                  roleBtn.textContent = 'Bank';
                }
              } else {
                roleBtn.style.display = 'none';
              }
            }
            updateKaderCounter();
          });
        });

        // Wire role toggle buttons
        document.querySelectorAll('.kader-role-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentRole = btn.getAttribute('data-role');
            const newRole = currentRole === 'sub' ? 'starter' : 'sub';
            btn.setAttribute('data-role', newRole);
            btn.className = `btn ${newRole === 'starter' ? 'btn-dsg' : 'btn-outline'} kader-role-btn`;
            btn.textContent = newRole === 'starter' ? 'Startelf' : 'Bank';
            updateKaderCounter();
          });
        });

        // Select All / Deselect All
        document.getElementById('kader-select-all-btn')?.addEventListener('click', () => {
          document.querySelectorAll('.kader-player-check:not(:disabled)').forEach(cb => {
            cb.checked = true;
            const card = cb.closest('.kader-player-card');
            if (card) card.style.borderColor = 'var(--color-accent)';
          });
          updateKaderCounter();
        });

        document.getElementById('kader-deselect-all-btn')?.addEventListener('click', () => {
          document.querySelectorAll('.kader-player-check').forEach(cb => {
            cb.checked = false;
            const card = cb.closest('.kader-player-card');
            if (card) card.style.borderColor = 'var(--glass-border)';
          });
          updateKaderCounter();
        });

        // Submit logic
        document.getElementById('kader-submit-btn')?.addEventListener('click', async () => {
          const checkedBoxes = Array.from(document.querySelectorAll('.kader-player-check:checked'));
          if (checkedBoxes.length === 0) {
            alert('Bitte wähle mindestens einen Spieler für den Spieltagskader aus.');
            return;
          }

          const selectedList = [];
          const usedNumbers = new Set();
          let hasDuplicate = false;
          let dupNum = '';
          let missingNumber = false;

          for (const cb of checkedBoxes) {
            const pId = cb.getAttribute('data-player-id');
            const pObj = processedPlayers.find(p => String(p.id) === String(pId));
            if (!pObj) continue;

            const numInput = document.querySelector(`.kader-jersey-input[data-player-id="${pId}"]`);
            const jerseyNum = (numInput?.value || '').trim();

            if (!jerseyNum) {
              missingNumber = true;
            }

            if (jerseyNum) {
              if (usedNumbers.has(jerseyNum)) {
                hasDuplicate = true;
                dupNum = jerseyNum;
              }
              usedNumbers.add(jerseyNum);
            }

            const roleBtn = document.querySelector(`.kader-role-btn[data-player-id="${pId}"]`);
            const isStarter = roleBtn ? roleBtn.getAttribute('data-role') !== 'sub' : true;
            selectedList.push({
              id: String(pId),
              firstName: pObj.raw.Vorname || pObj.raw.firstName || '',
              lastName: pObj.raw.Nachname || pObj.raw.lastName || '',
              jerseyNumber: jerseyNum,
              position: pObj.position,
              isStarter: isStarter,
              role: isStarter ? 'starter' : 'sub',
              photo: pObj.raw.photo || pObj.raw.photoUrl || pObj.raw.passPhoto || '',
              avatar: pObj.avatar
            });
          }

          if (missingNumber) {
            alert('Bitte trage für alle ausgewählten Spieler eine Trikotnummer ein.');
            return;
          }

          if (hasDuplicate) {
            alert(`Die Trikotnummer #${dupNum} wurde mehrfach vergeben. Bitte jede Rückennummer pro Spiel nur einmal vergeben.`);
            return;
          }

          const btn = document.getElementById('kader-submit-btn');
          if (btn) {
            btn.disabled = true;
            btn.textContent = 'Wird übermittelt...';
          }

          await Store.saveMatchdayRoster(selectedKaderSeasonKey, currentMatch.id, teamName, selectedList, {
            matchLabel: `${currentMatch.home} vs ${currentMatch.away}`
          });

          alert(`Spieltagskader erfolgreich freigegeben! ${selectedList.length} Spieler wurden an den Schiedsrichter übermittelt.`);
          renderTab();
        });
      }

        } else if (currentTeamTab === 'statistiken') {
      const allPlayers = await Store.getAdminPlayers();
      const allSeasons = Store.getData().seasons || {};
      const allLeagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
      const normTeam = (teamName || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();

      // Collect available seasons for this team
      const availableSeasons = [];
      Object.keys(allSeasons).forEach(sKey => {
        const s = allSeasons[sKey];
        if (s && Array.isArray(s.matches)) {
          const hasMatch = s.matches.some(m => {
            const h = (m.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
            const a = (m.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
            return h.includes(normTeam) || normTeam.includes(h) || a.includes(normTeam) || normTeam.includes(a);
          });
          if (hasMatch) {
            const leagueObj = allLeagues.find(l => l.seasonKey === sKey || l.name === sKey);
            let label = leagueObj ? `${leagueObj.name} ${leagueObj.year || ''}`.trim() : (s.name ? `${s.name} ${s.year || ''}`.trim() : sKey);
            availableSeasons.push({ seasonKey: sKey, label });
          }
        }
      });

      if (!selectedStatsSeasonKey || !availableSeasons.some(s => s.seasonKey === selectedStatsSeasonKey)) {
        selectedStatsSeasonKey = selectedKaderSeasonKey || (availableSeasons[0] ? availableSeasons[0].seasonKey : '2026/2027');
      }

      const teamStats = calculateTeamPlayerStats(selectedStatsSeasonKey, teamName, allPlayers);
      const totalGoals = teamStats.players.reduce((acc, p) => acc + p.goals, 0);
      const totalYellow = teamStats.players.reduce((acc, p) => acc + p.yellowCards, 0);
      const totalYellowRed = teamStats.players.reduce((acc, p) => acc + p.yellowRedCards, 0);
      const totalRed = teamStats.players.reduce((acc, p) => acc + p.redCards, 0);

      const allTeamStatsPlayers = teamStats.players || [];
      const activeCount = allTeamStatsPlayers.filter(p => (p.raw?.Status || p.raw?.status || p.status || 'Aktiv').toLowerCase() === 'aktiv').length;
      const inactiveCount = allTeamStatsPlayers.length - activeCount;

      const filteredStatsPlayers = allTeamStatsPlayers.filter(p => {
        const pStatus = (p.raw?.Status || p.raw?.status || p.status || 'Aktiv').toLowerCase();
        if (statsStatusFilter !== 'all') {
          if (statsStatusFilter.toLowerCase() === 'aktiv' && pStatus !== 'aktiv') return false;
          if (statsStatusFilter.toLowerCase() === 'inaktiv' && pStatus === 'aktiv') return false;
        }
        if (!statsSearchQuery) return true;
        const q = statsSearchQuery.toLowerCase();
        return (p.name || '').toLowerCase().includes(q) || String(p.jerseyNumber || '').includes(q);
      });

      container.innerHTML = `
        <!-- Season Selector & Header -->
        <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div>
            <h3 style="margin: 0; font-size: 1.3rem;">Team-Statistiken &amp; Einsatzzeiten</h3>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin: 3px 0 0 0;">
              Einsatzminuten, Startelf-Quoten, Torschützen und Fairplay-Status deines Kaders
            </p>
          </div>
          <div style="min-width: 200px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); margin-bottom: 4px; text-transform: uppercase;">Saison wählen</label>
            <select id="team-stats-season-select" class="admin-input" style="width: 100%; font-size: 0.95rem; font-weight: 700; padding: 8px 12px;">
              ${availableSeasons.map(s => `
                <option value="${s.seasonKey}" ${s.seasonKey === selectedStatsSeasonKey ? 'selected' : ''}>${s.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: var(--space-lg);">
          <div class="glass-card" style="padding: 14px; border-radius: 8px; text-align: center; border-left: 3px solid var(--color-accent);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Spiele absolviert</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--color-text-primary); margin-top: 4px;">${teamStats.playedMatchesCount}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 2px;">In dieser Saison</div>
          </div>
          <div class="glass-card" style="padding: 14px; border-radius: 8px; text-align: center; border-left: 3px solid #3b82f6;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Max. Spielzeit</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #3b82f6; margin-top: 4px;">${teamStats.maxMinutes} <span style="font-size: 0.85rem; font-weight: 600;">Min.</span></div>
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 2px;">90 Min. pro Spiel</div>
          </div>
          <div class="glass-card" style="padding: 14px; border-radius: 8px; text-align: center; border-left: 3px solid #22c55e;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Erzielte Tore</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #22c55e; margin-top: 4px;">${totalGoals}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 2px;">Gesamter Kader</div>
          </div>
          <div class="glass-card" style="padding: 14px; border-radius: 8px; text-align: center; border-left: 3px solid #eab308;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Gelbe Karten</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #eab308; margin-top: 4px;">${totalYellow}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 2px;">Fairplay-Konto</div>
          </div>
          <div class="glass-card" style="padding: 14px; border-radius: 8px; text-align: center; border-left: 3px solid #dc2626;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Platzverweise</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #dc2626; margin-top: 4px;">${totalYellowRed + totalRed}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 2px;">${totalYellowRed} GR &bull; ${totalRed} R</div>
          </div>
        </div>

        <!-- Squad Performance Table -->
        <div class="glass-card" style="padding: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 10px;">
            <div>
              <div id="stats-player-count" style="font-weight: 800; font-size: 1.1rem; color: var(--color-text-primary);">
                Kaderübersicht (${filteredStatsPlayers.length} von ${allTeamStatsPlayers.length} Spielern)
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">
                ${activeCount} Aktiv &bull; ${inactiveCount} Inaktiv / Archiviert
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <select id="stats-status-filter" class="admin-input" style="width: 140px; font-size: 0.85rem; font-weight: 600; padding: 6px 10px;">
                <option value="Aktiv" ${statsStatusFilter === 'Aktiv' ? 'selected' : ''}>Nur Aktive</option>
                <option value="all" ${statsStatusFilter === 'all' ? 'selected' : ''}>Alle Spieler</option>
                <option value="Inaktiv" ${statsStatusFilter === 'Inaktiv' ? 'selected' : ''}>Nur Inaktive</option>
              </select>
              <input type="text" id="stats-player-search" class="admin-input" placeholder="Spieler suchen..." value="${statsSearchQuery}" style="padding: 6px 12px; font-size: 0.85rem; width: 170px;">
            </div>
          </div>

          <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--glass-border); color: var(--color-text-secondary); font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 10px 10px; width: 45px; text-align: center;">Nr.</th>
                  <th style="padding: 10px 10px;">Spieler</th>
                  <th style="padding: 10px 10px;">Einsätze &amp; Startelf</th>
                  <th style="padding: 10px 10px; min-width: 130px;">Einsatzzeit (Min.)</th>
                  <th style="padding: 10px 10px; text-align: center;">Tore</th>
                  <th style="padding: 10px 10px; text-align: center;">Min. / Tor</th>
                  <th style="padding: 10px 10px; text-align: center;">Karten</th>
                  <th style="padding: 10px 10px; text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody id="team-stats-tbody">
                ${filteredStatsPlayers.length === 0 ? `
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 30px 15px; color: var(--color-text-secondary);">
                      Keine Spieler gefunden. Passe den Status-Filter oder Suchbegriff an.
                    </td>
                  </tr>
                ` : filteredStatsPlayers.map((p) => {
                  const pct = teamStats.maxMinutes > 0 ? Math.round((p.minutes / teamStats.maxMinutes) * 100) : 0;
                  const startPct = p.played > 0 ? Math.round((p.started / p.played) * 100) : 0;
                  const minPerGoal = p.goals > 0 ? (p.minutes > 0 ? Math.round(p.minutes / p.goals) : '<90') : null;
                  const goalsPerGame = p.played > 0 ? (p.goals / p.played).toFixed(2) : '0.00';

                  return `
                    <tr class="stats-row" data-player-id="${p.id}" style="border-bottom: 1px solid var(--glass-border); transition: background 0.15s ease;">
                      <td style="padding: 10px 10px; text-align: center; font-weight: 800; color: var(--color-text-secondary);">
                        ${p.jerseyNumber ? '#' + p.jerseyNumber : '-'}
                      </td>
                      <td style="padding: 10px 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <img src="${p.avatar}" alt="${p.name}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); flex-shrink: 0;">
                          <div>
                            <div style="font-weight: 800; color: var(--color-text-primary);">${p.name}</div>
                            <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${p.position || 'Feldspieler'}</div>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 10px 10px;">
                        <div style="font-weight: 800; font-size: 0.95rem;">${p.played} <span style="font-size: 0.75rem; color: var(--color-text-secondary);">/ ${teamStats.playedMatchesCount}</span></div>
                        <div style="font-size: 0.7rem; color: var(--color-text-secondary); margin-top: 1px;">
                          <span style="color: ${startPct >= 70 ? 'var(--color-accent)' : 'inherit'}; font-weight: ${startPct >= 70 ? '700' : 'normal'};">${p.started} Start (${startPct}%)</span> &bull; ${p.subbedIn} Ein
                        </div>
                      </td>
                      <td style="padding: 10px 10px; min-width: 130px;">
                        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem; margin-bottom: 3px;">
                          <span>${p.minutes} Min.</span>
                          <span style="color: var(--color-text-secondary); font-size: 0.75rem;">${pct}%</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 3px; overflow: hidden;">
                          <div style="background: var(--color-accent); height: 100%; width: ${pct}%; border-radius: 3px;"></div>
                        </div>
                      </td>
                      <td style="padding: 10px 10px; text-align: center;">
                        <span style="font-weight: 900; font-size: 1rem; color: ${p.goals > 0 ? '#22c55e' : 'var(--color-text-secondary)'};">
                          ${p.goals}
                        </span>
                      </td>
                      <td style="padding: 10px 10px; text-align: center;">
                        ${minPerGoal !== null ? `
                          <div style="font-weight: 800; font-size: 0.9rem; color: #22c55e;">
                            ${minPerGoal} <span style="font-size: 0.7rem; font-weight: 600;">Min.</span>
                          </div>
                          <div style="font-size: 0.68rem; color: var(--color-text-secondary); margin-top: 1px;">
                            ${goalsPerGame} T/Sp.
                          </div>
                        ` : `
                          <span style="color: var(--color-text-secondary);">-</span>
                        `}
                      </td>
                      <td style="padding: 10px 10px; text-align: center;">
                        <div style="display: inline-flex; align-items: center; gap: 4px; font-weight: 800; font-size: 0.75rem;">
                          ${p.yellowCards > 0 ? `<span style="background: #eab308; color: #000; padding: 1px 5px; border-radius: 2px;">${p.yellowCards}G</span>` : ''}
                          ${p.yellowRedCards > 0 ? `<span style="background: #f97316; color: #fff; padding: 1px 5px; border-radius: 2px;">${p.yellowRedCards}GR</span>` : ''}
                          ${p.redCards > 0 ? `<span style="background: #dc2626; color: #fff; padding: 1px 5px; border-radius: 2px;">${p.redCards}R</span>` : ''}
                          ${p.yellowCards === 0 && p.yellowRedCards === 0 && p.redCards === 0 ? '<span style="color: var(--color-text-secondary);">-</span>' : ''}
                        </div>
                      </td>
                      <td style="padding: 10px 10px; text-align: right;">
                        ${p.isSuspended ? `
                          <span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 0.72rem;">Gesperrt</span>
                        ` : p.isWarning ? `
                          <span style="background: rgba(234, 179, 8, 0.18); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.45); padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 0.72rem;">Sperre droht</span>
                        ` : `
                          <span style="background: rgba(34, 197, 94, 0.12); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem;">Berechtigt</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Wire season change
      document.getElementById('team-stats-season-select')?.addEventListener('change', (e) => {
        selectedStatsSeasonKey = e.target.value;
        renderTab();
      });

      // Wire status filter
      document.getElementById('stats-status-filter')?.addEventListener('change', (e) => {
        statsStatusFilter = e.target.value;
        renderTab();
      });

      // Wire player modal clicks on stats table rows
      container.querySelectorAll('#team-stats-tbody .stats-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.setAttribute('title', 'Klicken für Spielerstatistiken & Details');
        row.addEventListener('click', () => {
          const pId = row.getAttribute('data-player-id');
          const pStat = allTeamStatsPlayers.find(x => String(x.id) === String(pId));
          if (pStat) {
            openPlayerStatsModal(pStat.raw || pStat, { teamName, seasonKey: selectedStatsSeasonKey });
          }
        });
      });

      // Wire player search filter (instant live search)
      document.getElementById('stats-player-search')?.addEventListener('input', (e) => {
        statsSearchQuery = e.target.value.toLowerCase().trim();
        const rows = container.querySelectorAll('#team-stats-tbody .stats-row');
        let visibleCount = 0;
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          const matches = text.includes(statsSearchQuery);
          row.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });
        const countEl = document.getElementById('stats-player-count');
        if (countEl) {
          countEl.textContent = `Kaderübersicht (${visibleCount} von ${allTeamStatsPlayers.length} Spielern)`;
        }
      });


    } else if (currentTeamTab === 'nachmelden') {

      container.innerHTML = `

        <div class="glass-card" style="max-width: 600px; margin: 0 auto; padding: var(--space-lg); border-radius: 8px;">

          <h3 style="margin-top: 0; margin-bottom: 6px;">Spieler anmelden / Passantrag</h3>

          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: var(--space-lg);">

            Trage hier einen neuen Spieler oder einen bestehenden Spieler mit altem Spielerpass ein. Nach Prüfung durch den Vorstand wird der Spieler offiziell freigeschaltet.

          </p>



          <form id="team-player-request-form" style="display: flex; flex-direction: column; gap: var(--space-md);">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Vorname *</label>

                <input type="text" id="req-vorname" class="admin-input" required placeholder="z.B. Max" style="width: 100%;">

              </div>

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Nachname *</label>

                <input type="text" id="req-nachname" class="admin-input" required placeholder="z.B. Mustermann" style="width: 100%;">

              </div>

            </div>



            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Geburtsdatum *</label>

                <input type="date" id="req-geburtsdatum" class="admin-input" required style="width: 100%;">

              </div>

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Position</label>

                <select id="req-position" class="admin-input" style="width: 100%;">

                  <option value="Feldspieler">Feldspieler</option>

                  <option value="Torwart">Torwart</option>

                  <option value="Verteidiger">Verteidiger</option>

                  <option value="Mittelfeld">Mittelfeld</option>

                  <option value="Stürmer">Stürmer</option>

                </select>

              </div>

            </div>



            <div>

              <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Foto / Alter Spielerpass</label>

              <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 6px 0;">Lade ein Passfoto oder ein Foto des physischen Spielerpasses hoch.</p>

              <input type="file" id="req-photo-file" accept="image/*" class="admin-input" style="width: 100%;">

              <div id="req-photo-status" style="font-size: 0.8rem; margin-top: 4px;"></div>

            </div>



            <div>

              <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Notiz / Bisheriger Pass (optional)</label>

              <textarea id="req-note" class="admin-input" placeholder="z.B. Bisheriger Pass vorhanden / Neuanmeldung / Ex-Verein..." rows="2" style="width: 100%;"></textarea>

            </div>



            <div style="margin-top: var(--space-sm);">

              <button type="submit" id="req-submit-btn" class="btn-dsg" style="background: var(--color-accent); color: #fff; font-weight: 700; width: 100%; padding: 12px; cursor: pointer;">

                Passantrag absenden

              </button>

            </div>

          </form>

        </div>

      `;



      // Form submit handler

      const form = document.getElementById('team-player-request-form');

      form?.addEventListener('submit', async (e) => {

        e.preventDefault();

        const submitBtn = document.getElementById('req-submit-btn');

        submitBtn.disabled = true;

        submitBtn.textContent = 'Wird übermittelt...';



        const fileInput = document.getElementById('req-photo-file');

        let photoUrl = '';

        if (fileInput && fileInput.files && fileInput.files[0]) {

          const file = fileInput.files[0];

          photoUrl = await uploadPhotoToStorage(file);

          if (!photoUrl) {

            photoUrl = await compressImage(file);

          }

        }



        const newReq = {

          teamName,

          firstName: document.getElementById('req-vorname').value.trim(),

          lastName: document.getElementById('req-nachname').value.trim(),

          birthDate: document.getElementById('req-geburtsdatum').value,

          position: document.getElementById('req-position').value,

          photoUrl: photoUrl || '',

          note: document.getElementById('req-note').value.trim()

        };



        const success = await Store.addPlayerRequest(newReq);

        if (success) {

          alert('Passantrag erfolgreich eingereicht! Der Liga-Vorstand wird den Antrag prüfen.');

          currentTeamTab = 'antraege';

          renderTab();

        } else {

          alert('Fehler beim Einreichen des Antrags.');

          submitBtn.disabled = false;

          submitBtn.textContent = 'Passantrag absenden';

        }

      });



    } else if (currentTeamTab === 'antraege') {

      const allRequests = Store.getPlayerRequests();

      const teamRequests = allRequests.filter(r => (r.teamName || '').toLowerCase() === teamName.toLowerCase());



      if (teamRequests.length === 0) {

        container.innerHTML = `

          <div class="glass-card" style="text-align: center; padding: 40px; color: var(--color-text-secondary); border-radius: 8px;">

            <h3 style="color: var(--color-text-primary);">Keine Anträge eingereicht</h3>

            <p style="font-size: 0.9rem;">Dein Verein hat bisher keine Neuanmeldungen oder Passanträge eingereicht.</p>

          </div>

        `;

        return;

      }



      container.innerHTML = `

        <h3 style="margin-bottom: var(--space-md);">Eingereichte Anträge (${teamRequests.length})</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">

          ${teamRequests.map(r => {

            const isPending = r.status === 'pending';

            const isApproved = r.status === 'approved';

            const statusBadge = isPending 

              ? `<span style="background: rgba(234, 179, 8, 0.15); color: #d97706; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">In Prüfung</span>`

              : isApproved

              ? `<span style="background: rgba(34, 197, 94, 0.15); color: #16a34a; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Genehmigt</span>`

              : `<span style="background: rgba(239, 68, 68, 0.15); color: #dc2626; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Abgelehnt</span>`;



            return `

              <div class="glass-card" style="border: 1px solid var(--glass-border); border-radius: 8px; padding: var(--space-md); display: flex; flex-direction: column; gap: 8px;">

                <div style="display: flex; justify-content: space-between; align-items: flex-start;">

                  <div>

                    <h4 style="margin: 0; font-size: 1.1rem; color: var(--color-text-primary);">${r.firstName} ${r.lastName}</h4>

                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${r.birthDate ? `Geb.: ${r.birthDate}` : ''}</div>

                  </div>

                  ${statusBadge}

                </div>

                ${r.photoUrl ? `

                  <div style="text-align: center; margin: 4px 0;">

                    <img src="${r.photoUrl}" alt="Passfoto" style="max-height: 100px; border-radius: 4px; object-fit: contain;">

                  </div>

                ` : ''}

                ${r.note ? `<div style="font-size: 0.8rem; background: var(--color-surface); padding: 6px; border-radius: 4px; border: 1px solid var(--glass-border);"><strong>Notiz:</strong> ${r.note}</div>` : ''}

                ${r.reviewNote ? `<div style="font-size: 0.8rem; color: #dc2626; background: rgba(239, 68, 68, 0.08); padding: 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.2);"><strong>Vorstands-Rückmeldung:</strong> ${r.reviewNote}</div>` : ''}

              </div>

            `;

          }).join('')}

        </div>

      `;

    }

  };



  // Upload Photo Modal Logic

  const modal = document.getElementById('photo-upload-modal');

  const closeModal = () => {

    if (modal) modal.style.display = 'none';

    stagedPhotoUrl = null;

    activeUploadPlayer = null;

  };



  const openUploadModal = (player) => {

    activeUploadPlayer = player;

    stagedPhotoUrl = null;

    const nameEl = document.getElementById('modal-player-name');

    const previewImg = document.getElementById('modal-avatar-preview-img');

    const statusText = document.getElementById('modal-upload-status');

    const fileInput = document.getElementById('modal-file-input');



    if (nameEl) nameEl.textContent = `Passfoto: ${player.Vorname} ${player.Nachname}`;

    if (previewImg) previewImg.src = getPlayerAvatar(player);

    if (statusText) statusText.textContent = '';

    if (fileInput) fileInput.value = '';

    if (modal) modal.style.display = 'flex';

  };



  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);

  document.getElementById('modal-close-x-btn')?.addEventListener('click', closeModal);



  // Close when clicking outside modal on backdrop

  modal?.addEventListener('click', (e) => {

    if (e.target === modal) {

      closeModal();

    }

  });



  // Close on Escape key

  window.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {

      closeModal();

    }

  });



  document.getElementById('modal-select-file-btn')?.addEventListener('click', () => {

    document.getElementById('modal-file-input')?.click();

  });



  document.getElementById('modal-file-input')?.addEventListener('change', async (e) => {

    const file = e.target.files && e.target.files[0];

    if (!file) return;

    const previewImg = document.getElementById('modal-avatar-preview-img');

    const statusText = document.getElementById('modal-upload-status');



    if (statusText) statusText.textContent = 'Lade hoch...';

    let url = await uploadPhotoToStorage(file);

    if (!url) {

      url = await compressImage(file);

    }

    if (url) {

      stagedPhotoUrl = url;

      if (previewImg) previewImg.src = url;

      if (statusText) {

        statusText.textContent = 'Foto bereit zum Speichern!';

        statusText.style.color = '#22c55e';

      }

    } else {

      if (statusText) {

        statusText.textContent = 'Fehler beim Laden des Fotos.';

        statusText.style.color = '#ef4444';

      }

    }

  });



  document.getElementById('modal-save-btn')?.addEventListener('click', async () => {

    if (!stagedPhotoUrl || !activeUploadPlayer) {

      alert('Bitte wähle zuerst ein Foto aus.');

      return;

    }

    const saveBtn = document.getElementById('modal-save-btn');

    saveBtn.disabled = true;

    saveBtn.textContent = 'Wird gespeichert...';



    const pId = activeUploadPlayer['#'] || (activeUploadPlayer.Vorname + '_' + activeUploadPlayer.Nachname);

    const success = await Store.updatePlayerPassPhoto(pId, stagedPhotoUrl);

    saveBtn.disabled = false;

    saveBtn.textContent = 'Speichern';

    if (success) {

      closeModal();

      renderTab();

    } else {

      alert('Fehler beim Speichern des Fotos.');

    }

  });



  window.addEventListener('matchday-roster-updated', () => {
    if (currentTeamTab === 'spieltagskader') {
      renderTab();
    }
  });

  renderTab();

};

