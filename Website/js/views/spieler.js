// Players Page View & Interactive Roster
import { Store, sanitizeMojibake } from '../store.js?v=1791182000000';
import { renderIcon } from '../icons.js?v=1791182000000';
import { renderTeamLogo } from '../logos.js?v=1791182000000';
import { getPlayerAvatar, calculatePlayerAge, formatMemberSince, getPlayerLiveStats, normalizePlayerKey } from '../playerUtils.js?v=1791182000000';

let allActivePlayers = [];
let activeSearchQuery = '';
let activeTeamFilter = 'all';
let activePositionFilter = 'all';
let activeSort = 'goals-desc';
let currentPage = 1;
const PLAYERS_PER_PAGE = 24;

export const viewSpieler = () => {
  return `
    <div class="container" style="padding-top: 100px; padding-bottom: 60px;">
      <!-- Hero Header -->
      <div class="stagger-item" style="text-align: center; margin-bottom: var(--space-xl);">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; font-size: 0.8rem; padding: 6px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-sm); border: 1px solid rgba(0, 179, 65, 0.25);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          DSG Spielerkader
        </div>
        <h1 style="font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: -0.5px;">
          DSG <span style="color: var(--color-accent);">SPIELER</span> & KADER
        </h1>
        <p style="color: var(--color-text-secondary); max-width: 650px; margin: 0 auto; font-size: 1.05rem;">
          Die offizielle Spieler-Datenbank der DSG Meisterschaft mit Live-Statistiken, Profilen und Vereinszugehörigkeiten.
        </p>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="glass-card stagger-item" style="padding: var(--space-md); margin-bottom: var(--space-lg); border-radius: var(--border-radius-md);">
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm); justify-content: space-between; align-items: center;">
          
          <!-- Search input -->
          <div style="position: relative; flex: 1; min-width: 220px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-secondary); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="spieler-search-input" class="admin-input" placeholder="Spieler suchen (Name, ID #)..." style="width: 100%; padding-left: 36px; height: 42px; border-radius: 8px; font-size: 0.95rem;">
          </div>

          <!-- Team Filter -->
          <div style="min-width: 180px;">
            <select id="spieler-team-filter" class="admin-input" style="width: 100%; height: 42px; border-radius: 8px; font-size: 0.9rem;">
              <option value="all">Alle Mannschaften</option>
            </select>
          </div>

          <!-- Sort Filter -->
          <div style="min-width: 180px;">
            <select id="spieler-sort-select" class="admin-input" style="width: 100%; height: 42px; border-radius: 8px; font-size: 0.9rem;">
              <option value="goals-desc" selected>Meiste Tore</option>
              <option value="name-asc">Name (A &rarr; Z)</option>
              <option value="team-asc">Team (A &rarr; Z)</option>
              <option value="age-asc">Alter (jüngste zuerst)</option>
              <option value="age-desc">Alter (älteste zuerst)</option>
              <option value="since-asc">Mitglied seit (längste)</option>
            </select>
          </div>
        </div>

        <!-- Position Pills -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: var(--space-sm); padding-top: var(--space-xs); border-top: 1px solid var(--color-border);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); align-self: center; margin-right: 4px;">Position:</span>
          <button class="stats-page-btn spieler-pos-filter active" data-pos="all">Alle</button>
          <button class="stats-page-btn spieler-pos-filter" data-pos="Torwart">Torwart</button>
          <button class="stats-page-btn spieler-pos-filter" data-pos="Abwehr">Abwehr</button>
          <button class="stats-page-btn spieler-pos-filter" data-pos="Mittelfeld">Mittelfeld</button>
          <button class="stats-page-btn spieler-pos-filter" data-pos="Sturm">Sturm</button>
        </div>
      </div>

      <!-- Live Counter & Active Filters Display -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
        <div id="spieler-count-info" style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary);">
          Lade Spielerdatenbank...
        </div>
        <div id="spieler-active-tag" style="font-size: 0.8rem; color: var(--color-accent); font-weight: 700;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); margin-right: 6px;"></span>
          Nur aktive Spieler
        </div>
      </div>

      <!-- Players Grid -->
      <div id="spieler-grid" class="spieler-cards-grid stagger-item">
        <!-- Rendered dynamically -->
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
          <div class="loading-spinner" style="margin: 0 auto 16px auto; width: 36px; height: 36px; border: 3px solid rgba(0, 179, 65, 0.2); border-top-color: var(--color-accent); border-radius: 50%; animation: dsg-spin 0.8s linear infinite;"></div>
          Lade Spielerprofile...
        </div>
      </div>

      <!-- Pagination -->
      <div id="spieler-pagination" class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-xl);">
        <span id="spieler-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Seite 1</span>
        <div style="display: flex; gap: var(--space-xs);">
          <button id="spieler-btn-prev" class="btn-dsg" style="padding: 8px 16px; font-size: 0.85rem;">&laquo; Vorherige</button>
          <button id="spieler-btn-next" class="btn-dsg" style="padding: 8px 16px; font-size: 0.85rem;">Nächste &raquo;</button>
        </div>
      </div>
    </div>

    <!-- Player Profile Modal -->
    <div id="player-profile-modal" class="dsg-player-modal" style="display: none;">
      <div class="dsg-player-modal-backdrop" id="player-modal-backdrop"></div>
      <div class="dsg-player-modal-content glass-card">
        <button class="dsg-player-modal-close" id="player-modal-close" aria-label="Schließen">&times;</button>
        <div id="player-modal-body">
          <!-- Injected dynamically -->
        </div>
      </div>
    </div>

    <style>
      .spieler-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-md);
      }
      .spieler-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        display: flex;
        flex-direction: column;
        cursor: pointer;
        position: relative;
      }
      .spieler-card:hover {
        transform: translateY(-4px);
        border-color: var(--color-accent);
        box-shadow: 0 12px 28px rgba(0, 179, 65, 0.12);
      }
      .spieler-card-header {
        position: relative;
        height: 200px;
        background: #ffffff;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        border-bottom: 1px solid var(--color-border);
      }
      .spieler-card-avatar {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: bottom center;
        transition: transform var(--transition-normal);
        display: block;
      }
      .spieler-card:hover .spieler-card-avatar {
        transform: scale(1.03);
      }
      .spieler-card-team-badge {
        position: absolute;
        bottom: 10px;
        right: 12px;
        width: 44px;
        height: 44px;
        background: var(--color-surface);
        border-radius: 50%;
        padding: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }
      .spieler-card-pos-tag {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.15);
        z-index: 2;
      }
      .spieler-card-body {
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 6px;
      }
      .spieler-card-name {
        font-size: 1.15rem;
        font-weight: 800;
        margin: 0;
        color: var(--color-text-primary);
        line-height: 1.25;
      }
      .spieler-card-team-name {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        margin-bottom: 4px;
      }
      .spieler-stat-pills {
        display: flex;
        gap: 6px;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid var(--color-border);
      }
      .spieler-stat-pill {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 4px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 6px;
        border: 1px solid var(--color-border);
      }
      [data-theme="dark"] .spieler-stat-pill {
        background: rgba(255, 255, 255, 0.04);
      }
      .spieler-stat-val {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1;
      }
      .spieler-stat-lbl {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-text-secondary);
        margin-top: 3px;
      }
      /* Modal Styles */
      .dsg-player-modal {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .dsg-player-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .dsg-player-modal-content {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 580px;
        max-height: 90vh;
        max-height: 90dvh;
        overflow-y: auto;
        background: var(--color-surface) !important;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: var(--space-lg);
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      }
      .dsg-player-modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
        border: none;
        color: var(--color-text-primary);
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background var(--transition-fast);
      }
      [data-theme="dark"] .dsg-player-modal-close {
        background: rgba(255, 255, 255, 0.1);
      }
      .dsg-player-modal-close:hover {
        background: var(--color-accent);
        color: #fff;
      }
      @media (max-width: 600px) {
        .spieler-cards-grid {
          grid-template-columns: 1fr;
        }
        .dsg-player-modal-content {
          padding: var(--space-md);
        }
      }
    </style>
  `;
};

export const bindSpieler = async () => {
  const grid = document.getElementById('spieler-grid');
  const countInfo = document.getElementById('spieler-count-info');
  const searchInput = document.getElementById('spieler-search-input');
  const teamFilter = document.getElementById('spieler-team-filter');
  const sortSelect = document.getElementById('spieler-sort-select');
  const pageInfo = document.getElementById('spieler-page-info');
  const prevBtn = document.getElementById('spieler-btn-prev');
  const nextBtn = document.getElementById('spieler-btn-next');
  const posFilterButtons = document.querySelectorAll('.spieler-pos-filter');
  const modal = document.getElementById('player-profile-modal');
  const modalBody = document.getElementById('player-modal-body');
  const modalClose = document.getElementById('player-modal-close');
  const modalBackdrop = document.getElementById('player-modal-backdrop');

  // Load players data
  let rawPlayers = [];
  try {
    rawPlayers = await Store.getAdminPlayers();
  } catch (err) {
    console.error("Error loading players:", err);
  }

  // Filter strictly active players
  allActivePlayers = (rawPlayers || []).filter(p => (p.Status || p.status) === 'Aktiv').map(p => {
    const fn = sanitizeMojibake((p.Vorname || p.vorname || '').trim());
    const ln = sanitizeMojibake((p.Nachname || p.nachname || '').trim());
    const tm = sanitizeMojibake((p.Team || p.team || '').trim());
    const bDate = (p.Geburtsdatum || p.geburtsdatum || p.birthDate || '').trim();
    const sDate = (p.seit || p.Seit || p.memberSince || '').trim();
    const id = String(p['#'] || p.id || p.ID || '');
    const pos = (p.Position || p.position || '').trim();
    const stats = getPlayerLiveStats(p);

    return {
      id,
      vorname: fn,
      nachname: ln,
      fullName: `${fn} ${ln}`.trim(),
      team: tm,
      birthDate: bDate,
      age: calculatePlayerAge(bDate),
      memberSince: sDate,
      position: pos,
      goals: stats.goals,
      yellow: stats.yellow,
      red: stats.red,
      raw: p
    };
  });

  // Populate Team Filter Dropdown
  const uniqueTeams = Array.from(new Set(allActivePlayers.map(p => p.team).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'de'));
  if (teamFilter) {
    teamFilter.innerHTML = `<option value="all">Alle Mannschaften (${uniqueTeams.length})</option>` +
      uniqueTeams.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  // Check URL query parameters (e.g. #/spieler?id=4491 or #/spieler?search=Baumgartner or #/spieler?team=Croatia)
  const hash = window.location.hash || '';
  let paramId = null;
  let paramSearch = null;
  let paramTeam = null;

  if (hash.includes('?')) {
    const queryString = hash.split('?')[1];
    const urlParams = new URLSearchParams(queryString);
    paramId = urlParams.get('id');
    paramSearch = urlParams.get('search');
    paramTeam = urlParams.get('team');
  }

  if (paramSearch && searchInput) {
    activeSearchQuery = paramSearch.trim();
    searchInput.value = activeSearchQuery;
  }
  if (paramTeam && teamFilter) {
    const matchedTeam = uniqueTeams.find(t => normalizePlayerKey(t).includes(normalizePlayerKey(paramTeam)));
    if (matchedTeam) {
      activeTeamFilter = matchedTeam;
      teamFilter.value = matchedTeam;
    }
  }

  const renderGrid = () => {
    let filtered = allActivePlayers.filter(p => {
      // Search query
      if (activeSearchQuery) {
        const q = normalizePlayerKey(activeSearchQuery);
        const nameMatch = normalizePlayerKey(p.fullName).includes(q) || normalizePlayerKey(p.nachname).includes(q);
        const idMatch = p.id.includes(activeSearchQuery);
        if (!nameMatch && !idMatch) return false;
      }

      // Team filter
      if (activeTeamFilter !== 'all' && p.team !== activeTeamFilter) {
        return false;
      }

      // Position filter
      if (activePositionFilter !== 'all') {
        if (!p.position || !p.position.toLowerCase().includes(activePositionFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (activeSort === 'goals-desc') {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.fullName.localeCompare(b.fullName, 'de');
      }
      if (activeSort === 'name-asc') {
        return a.nachname.localeCompare(b.nachname, 'de') || a.vorname.localeCompare(b.vorname, 'de');
      }
      if (activeSort === 'team-asc') {
        return (a.team || '').localeCompare(b.team || '', 'de') || a.nachname.localeCompare(b.nachname, 'de');
      }
      if (activeSort === 'age-asc') {
        if (a.age !== null && b.age !== null) return a.age - b.age;
        if (a.age !== null) return -1;
        if (b.age !== null) return 1;
        return 0;
      }
      if (activeSort === 'age-desc') {
        if (a.age !== null && b.age !== null) return b.age - a.age;
        if (a.age !== null) return 1;
        if (b.age !== null) return -1;
        return 0;
      }
      if (activeSort === 'since-asc') {
        return (a.memberSince || '9999').localeCompare(b.memberSince || '9999');
      }
      return 0;
    });

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PLAYERS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * PLAYERS_PER_PAGE;
    const endIdx = Math.min(startIdx + PLAYERS_PER_PAGE, totalResults);
    const pagePlayers = filtered.slice(startIdx, endIdx);

    if (countInfo) {
      countInfo.innerHTML = `Zeige <strong>${totalResults === 0 ? 0 : startIdx + 1}–${endIdx}</strong> von <strong>${totalResults}</strong> aktiven Spielern`;
    }

    if (pageInfo) {
      pageInfo.innerText = `Seite ${currentPage} von ${totalPages}`;
    }

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    if (pagePlayers.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary); background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--border-radius-md);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: var(--color-accent);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style="margin: 0 0 6px 0; color: var(--color-text-primary);">Keine aktiven Spieler gefunden</h3>
          <p style="margin: 0; font-size: 0.9rem;">Passe deine Suchbegriffe oder Filter an.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = pagePlayers.map(p => {
      const avatarUrl = getPlayerAvatar(p.raw);
      const teamLogo = renderTeamLogo(p.team, 'xs');
      const ageText = p.age ? `${p.age} Jahre` : '';
      const sinceText = formatMemberSince(p.memberSince);
      const posLabel = p.position ? `<span class="spieler-card-pos-tag">${p.position}</span>` : '';

      return `
        <div class="spieler-card" data-player-id="${p.id}">
          <div class="spieler-card-header">
            ${posLabel}
            <img src="${avatarUrl}" alt="${p.fullName}" class="spieler-card-avatar">
            <div class="spieler-card-team-badge" title="${p.team}">
              ${teamLogo}
            </div>
          </div>
          <div class="spieler-card-body">
            <h3 class="spieler-card-name">${p.fullName}</h3>
            <div class="spieler-card-team-name">${p.team || 'Vereinslos'}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">
              <span>${ageText}</span>
              <span>${sinceText}</span>
            </div>
            <div class="spieler-stat-pills">
              <div class="spieler-stat-pill" title="Tore">
                <span class="spieler-stat-val" style="color: var(--color-accent); display: inline-flex; align-items: center; gap: 4px;">
                  ${renderIcon('ball', { size: 13, color: 'var(--color-accent)' })} ${p.goals}
                </span>
                <span class="spieler-stat-lbl">Tore</span>
              </div>
              <div class="spieler-stat-pill" title="Gelbe Karten">
                <span class="spieler-stat-val" style="color: #eab308; display: inline-flex; align-items: center; gap: 4px;">
                  <span style="display:inline-block;width:9px;height:12px;background:#eab308;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span> ${p.yellow}
                </span>
                <span class="spieler-stat-lbl">Gelb</span>
              </div>
              <div class="spieler-stat-pill" title="Rote & Gelb-Rote Karten">
                <span class="spieler-stat-val" style="color: #ef4444; display: inline-flex; align-items: center; gap: 4px;">
                  <span style="display:inline-block;width:9px;height:12px;background:#ef4444;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span> ${p.red}
                </span>
                <span class="spieler-stat-lbl">Rot</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to cards
    document.querySelectorAll('.spieler-card').forEach(card => {
      card.addEventListener('click', () => {
        const pId = card.getAttribute('data-player-id');
        openPlayerProfile(pId);
      });
    });
  };

  const openPlayerProfile = (playerId) => {
    const player = allActivePlayers.find(p => p.id === String(playerId));
    if (!player) return;

    const avatarUrl = getPlayerAvatar(player.raw);
    const teamLogo = renderTeamLogo(player.team, 'md');
    const ageText = player.age ? `${player.age} Jahre` : 'Unbekannt';
    const bDateFormatted = player.birthDate ? player.birthDate.split('-').reverse().join('.') : '-';
    const sinceText = formatMemberSince(player.memberSince) || '-';

    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-md);">
        
        <!-- Avatar & Team Crest Showcase -->
        <div style="position: relative; width: 130px; height: 130px; border-radius: 50%; background: #ffffff; padding: 4px; border: 3px solid var(--color-accent); box-shadow: 0 8px 24px rgba(0, 179, 65, 0.25); display: flex; align-items: center; justify-content: center; overflow: visible; margin-top: 10px;">
          <img src="${avatarUrl}" alt="${player.fullName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain; object-position: bottom center;">
          <div style="position: absolute; bottom: -2px; right: -4px; width: 44px; height: 44px; background: var(--color-surface); border-radius: 50%; padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center;">
            ${teamLogo}
          </div>
        </div>

        <!-- Name & Title -->
        <div>
          <h2 style="font-size: 1.7rem; font-weight: 800; margin: 0 0 4px 0; color: var(--color-text-primary);">${player.fullName}</h2>
          <a href="#/teams?team=${encodeURIComponent(player.team)}" class="player-modal-team-link" style="font-size: 1.05rem; font-weight: 700; color: var(--color-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            ${player.team} &rarr;
          </a>
          ${player.position ? `<div style="display: inline-block; margin-top: 6px; background: rgba(0, 179, 65, 0.15); color: var(--color-accent); font-weight: 800; font-size: 0.78rem; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">${player.position}</div>` : ''}
        </div>

        <!-- Stats Overview Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;">
          <div style="background: rgba(0, 179, 65, 0.08); border: 1px solid rgba(0, 179, 65, 0.2); border-radius: var(--border-radius-sm); padding: 12px 8px;">
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-accent); display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${renderIcon('ball', { size: 20, color: 'var(--color-accent)' })} ${player.goals}
            </div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Tore Gesamt</div>
          </div>
          <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: var(--border-radius-sm); padding: 12px 8px;">
            <div style="font-size: 1.6rem; font-weight: 800; color: #eab308; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span style="display:inline-block;width:14px;height:18px;background:#eab308;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.25);"></span> ${player.yellow}
            </div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Gelbe Karten</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--border-radius-sm); padding: 12px 8px;">
            <div style="font-size: 1.6rem; font-weight: 800; color: #ef4444; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span style="display:inline-block;width:14px;height:18px;background:#ef4444;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.25);"></span> ${player.red}
            </div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Rote Karten</div>
          </div>
        </div>

        <!-- Personal Info Table -->
        <div style="width: 100%; text-align: left; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); padding: var(--space-md); font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Pass-Nr. / ID:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">#${player.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Alter:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">${ageText} (${bDateFormatted})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">DSG-Mitgliedschaft:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">${sinceText}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Status:</span>
            <span style="font-weight: 700; color: var(--color-accent); display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent);"></span> Aktiv
            </span>
          </div>
        </div>

        <!-- Share & Copy Profile Link -->
        <div style="display: flex; gap: var(--space-sm); width: 100%; margin-top: 4px;">
          <button id="btn-copy-player-link" class="btn btn-outline" style="flex: 1; padding: 10px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span id="copy-player-text">Profil-Link kopieren</span>
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Copy player link handler
    document.getElementById('btn-copy-player-link')?.addEventListener('click', async () => {
      const url = `${window.location.origin}${window.location.pathname}#/spieler?id=${player.id}`;
      try {
        await navigator.clipboard.writeText(url);
        const textSpan = document.getElementById('copy-player-text');
        if (textSpan) textSpan.innerText = 'Link kopiert!';
        setTimeout(() => {
          if (textSpan) textSpan.innerText = 'Profil-Link kopieren';
        }, 2000);
      } catch (e) {
        prompt('Link zum Kopieren:', url);
      }
    });

    // Close team link inside modal if clicked
    document.querySelector('.player-modal-team-link')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.style.display === 'flex') {
      closeModal();
    }
  });

  // Event Listeners for Controls
  searchInput?.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.trim();
    currentPage = 1;
    renderGrid();
  });

  teamFilter?.addEventListener('change', (e) => {
    activeTeamFilter = e.target.value;
    currentPage = 1;
    renderGrid();
  });

  sortSelect?.addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderGrid();
  });

  posFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      posFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePositionFilter = btn.getAttribute('data-pos');
      currentPage = 1;
      renderGrid();
    });
  });

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderGrid();
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  });

  nextBtn?.addEventListener('click', () => {
    currentPage++;
    renderGrid();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  });

  // Initial render
  renderGrid();

  // If specific player ID in URL, open their modal immediately
  if (paramId) {
    setTimeout(() => {
      openPlayerProfile(paramId);
    }, 100);
  }
};


