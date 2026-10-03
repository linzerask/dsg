import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1791160000000';
import { showToast } from './admin.js?v=1791160000000';

let roundsData = [];
let leaguesData = [];
let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'id', asc: false };

let editingRoundId = null;

export const renderAdminRounds = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Übersicht der Runden</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Verwaltung aller Spielrunden und Spielansetzungen</p>
        </div>

        <!-- Controls Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-round" style="background: var(--color-accent); color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Runde anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="round-search" class="admin-input" placeholder="Runde / Liga suchen..." style="width: 170px;">
                <select id="round-league-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Ligen</option>
                </select>
                <select id="round-status-filter" class="admin-input" style="width: 130px;">
                    <option value="all">Alle Status</option>
                    <option value="active">Nur Aktiv</option>
                    <option value="inactive">Nur Inaktiv</option>
                </select>
                <select id="round-sort-select" class="admin-input" style="width: 175px;">
                    <option value="season-desc">Saison (neueste)</option>
                    <option value="season-asc">Saison (älteste)</option>
                    <option value="date-desc">Datum (neueste)</option>
                    <option value="date-asc">Datum (älteste)</option>
                    <option value="runde-asc">Runde (1 → ..)</option>
                    <option value="runde-desc">Runde (.. → 1)</option>
                    <option value="league-asc">Liga (A–Z)</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="liga" class="sortable">Liga ↕</th>
                        <th data-sort="jahr" class="sortable">Saison / Jahr ↕</th>
                        <th data-sort="runde" class="sortable">Runde ↕</th>
                        <th data-sort="datumVon" class="sortable">Datum von ↕</th>
                        <th data-sort="datumBis" class="sortable">Datum bis ↕</th>
                        <th data-sort="status" class="sortable">Status ↕</th>
                        <th style="min-width: 220px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="rounds-table-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Lade Spielrunden...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card Accordion View -->
        <div id="rounds-mobile-cards" class="admin-mobile-cards">
            <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Lade Spielrunden...</div>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="rounds-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-r" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-r" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Modal 1: Runde anlegen / bearbeiten -->
        <div id="round-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 600px; max-height: 90vh; max-height: 90dvh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="round-modal-title" style="margin: 0; font-size: 1.3rem; color: var(--color-text-primary);">Runde bearbeiten</h3>
                    <button type="button" class="btn-close-round-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>
                
                <form id="round-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px; font-weight: 600;">Liga</label>
                        <select id="modal-round-liga" class="admin-input" style="width: 100%; font-weight: 500;" required>
                            <!-- Dynamically populated from Ligen verwalten -->
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px; font-weight: 600;">Runde</label>
                        <input type="number" id="modal-round-nr" class="admin-input" min="1" max="50" value="1" style="width: 100%;" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px; font-weight: 600;">Datum von</label>
                            <input type="date" id="modal-round-date-from" class="admin-input" style="width: 100%;" required>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px; font-weight: 600;">Datum bis</label>
                            <input type="date" id="modal-round-date-to" class="admin-input" style="width: 100%;" required>
                        </div>
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="submit" id="btn-save-round" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Erstellen</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal 2: Spiele der Runde ansehen -->
        <div id="round-games-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 720px; max-height: 90vh; max-height: 90dvh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin: auto;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm); gap: 12px;">
                    <div>
                        <h3 id="round-games-modal-title" style="margin: 0; font-size: 1.3rem; color: var(--color-text-primary);">Spiele der Runde</h3>
                        <p id="round-games-modal-subtitle" style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--color-text-secondary);"></p>
                    </div>
                    <button type="button" class="btn-close-round-games-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer; flex-shrink: 0;">Schließen</button>
                </div>
                
                <div id="round-games-list-container">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    </div>
    `;
};

const parseRoundDate = (dateStr) => {
    if (!dateStr) return 0;
    const str = String(dateStr).trim();
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime() || 0;
        }
    }
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            let year = parseInt(parts[2]);
            if (year < 100) year += 2000;
            return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0])).getTime() || 0;
        }
    }
    const t = Date.parse(str);
    return isNaN(t) ? 0 : t;
};

const formatDateDisplay = (dStr) => {
    if (!dStr) return '-';
    const str = String(dStr).trim();
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
        }
    }
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            let yr = parts[2];
            if (yr.length === 2) yr = '20' + yr;
            return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${yr}`;
        }
    }
    return str;
};

const formatDateForInput = (dStr) => {
    if (!dStr) return '';
    const str = String(dStr).trim();
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            let yr = parts[2];
            if (yr.length === 2) yr = '20' + yr;
            return `${yr}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return str;
};

const findMatchingLeague = (r) => {
    if (!r || !leaguesData || leaguesData.length === 0) return null;
    
    // 1. Exact seasonKey match
    if (r.seasonKey) {
        const exact = leaguesData.find(l => l.seasonKey === r.seasonKey);
        if (exact) return exact;
    }

    // 2. Year + Sub-division match
    const rYearStr = (getDisplaySeason(r) || '').replace(/\D/g, '');
    const rYearPrefix = rYearStr.length >= 4 ? rYearStr.slice(0, 4) : '';
    const rLigaName = (r.liga || r.saison || '').toLowerCase();

    return leaguesData.find(l => {
        const lYearStr = String(l.year || l.seasonKey || '').replace(/\D/g, '');
        const lYearPrefix = lYearStr.length >= 4 ? lYearStr.slice(0, 4) : '';
        const yearMatches = (rYearPrefix && lYearPrefix && rYearPrefix === lYearPrefix);
        
        const lName = (l.name || '').toLowerCase();
        const nameMatches = rLigaName.includes(lName) || lName.includes(rLigaName);

        // Sub-division specific checks
        const is1KlasseR = rLigaName.includes('1. klasse') || rLigaName.includes('1klasse');
        const is1KlasseL = lName.includes('1. klasse') || lName.includes('1klasse');
        if (is1KlasseR !== is1KlasseL) return false;

        const isOberesR = rLigaName.includes('oberes');
        const isOberesL = lName.includes('oberes');
        if (isOberesR !== isOberesL) return false;

        const isUnteresR = rLigaName.includes('unteres');
        const isUnteresL = lName.includes('unteres');
        if (isUnteresR !== isUnteresL) return false;

        return yearMatches && nameMatches;
    }) || null;
};

const getDisplayLeagueName = (r) => {
    if (!r) return '-';
    const matchingLeague = findMatchingLeague(r);
    if (matchingLeague && matchingLeague.name) {
        return matchingLeague.name.replace(/\s*\b\d{4}(\/\d{4})?\b/g, '').trim() || matchingLeague.name;
    }
    let name = r.saison || r.liga || 'DSG Liga';
    const sKey = r.seasonKey || r.jahr || '';
    if (sKey) {
        name = name.replace(sKey, '').trim();
    }
    name = name.replace(/\s*\b\d{4}(\/\d{4})?\b/g, '').trim();
    return name || 'DSG Liga';
};

const getDisplaySeason = (r) => {
    if (!r) return '-';
    let yr = r.jahr || '';
    if (!yr && r.seasonKey) {
        const match = String(r.seasonKey).match(/\d{4}(\/\d{4})?/);
        if (match) yr = match[0];
    }
    if (yr) {
        let yrStr = String(yr).trim();
        if (/^\d{4}$/.test(yrStr)) {
            const nextY = parseInt(yrStr) + 1;
            return `${yrStr}/${nextY}`;
        }
        return yrStr.replace(/_[a-zA-Z0-9_-]+$/, '');
    }
    const sMatch = String(r.seasonKey || '').match(/\d{4}(\/\d{4})?/);
    return sMatch ? sMatch[0] : (r.seasonKey || '-');
};

const extractSeasonYear = (r) => {
    if (!r) return 0;
    const yrStr = String(r.seasonKey || r.jahr || r.year || '').replace(/\D/g, '');
    if (yrStr.length >= 4) return parseInt(yrStr.slice(0, 4)) || 0;
    return 0;
};

const extractRoundNumber = (r) => {
    if (!r) return 0;
    const m = String(r.runde || '').match(/\d+/);
    return m ? parseInt(m[0]) || 0 : 0;
};

const filterAndSortData = () => {
    const searchVal = (document.getElementById('round-search')?.value || '').toLowerCase().trim();
    const leagueFilter = document.getElementById('round-league-filter')?.value || 'all';
    const statusFilter = document.getElementById('round-status-filter')?.value || 'all';
    const sortVal = document.getElementById('round-sort-select')?.value || 'season-desc';

    const isLeagueActive = (r) => {
        if (!r) return false;
        const matchingLeague = findMatchingLeague(r);
        return matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : true;
    };

    filteredData = roundsData.filter(r => {
        const matchesSearch = !searchVal || 
            (r.saison && r.saison.toLowerCase().includes(searchVal)) ||
            (r.liga && r.liga.toLowerCase().includes(searchVal)) ||
            String(r.runde).includes(searchVal) ||
            String(r.jahr).includes(searchVal);

        const matchesLeague = leagueFilter === 'all' || 
            r.liga === leagueFilter || 
            r.seasonKey === leagueFilter || 
            getDisplayLeagueName(r) === leagueFilter;

        let matchesStatus = true;
        const active = isLeagueActive(r);
        if (statusFilter === 'active') matchesStatus = active;
        else if (statusFilter === 'inactive') matchesStatus = !active;

        return matchesSearch && matchesLeague && matchesStatus;
    });

    // Multi-tier sorting
    filteredData.sort((a, b) => {
        if (sortVal === 'season-desc') {
            const diffYear = extractSeasonYear(b) - extractSeasonYear(a);
            if (diffYear !== 0) return diffYear;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }
        if (sortVal === 'season-asc') {
            const diffYear = extractSeasonYear(a) - extractSeasonYear(b);
            if (diffYear !== 0) return diffYear;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }
        if (sortVal === 'date-desc') {
            const dateA = parseRoundDate(a.datumVon || a.datumBis);
            const dateB = parseRoundDate(b.datumVon || b.datumBis);
            if (dateB !== dateA) return dateB - dateA;
            return extractRoundNumber(b) - extractRoundNumber(a);
        }
        if (sortVal === 'date-asc') {
            const dateA = parseRoundDate(a.datumVon || a.datumBis);
            const dateB = parseRoundDate(b.datumVon || b.datumBis);
            if (dateA !== dateB) return dateA - dateB;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }
        if (sortVal === 'runde-asc') {
            const diffRunde = extractRoundNumber(a) - extractRoundNumber(b);
            if (diffRunde !== 0) return diffRunde;
            return extractSeasonYear(b) - extractSeasonYear(a);
        }
        if (sortVal === 'runde-desc') {
            const diffRunde = extractRoundNumber(b) - extractRoundNumber(a);
            if (diffRunde !== 0) return diffRunde;
            return extractSeasonYear(b) - extractSeasonYear(a);
        }
        if (sortVal === 'league-asc') {
            const nameA = String(a.liga || '').toLowerCase();
            const nameB = String(b.liga || '').toLowerCase();
            const cmp = nameA.localeCompare(nameB);
            if (cmp !== 0) return cmp;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }

        // Fallback for direct column header sorting
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

        if (currentSort.column === 'datumVon' || currentSort.column === 'datumBis') {
            valA = parseRoundDate(valA);
            valB = parseRoundDate(valB);
        } else if (currentSort.column === 'runde') {
            valA = extractRoundNumber(a);
            valB = extractRoundNumber(b);
        } else if (currentSort.column === 'jahr' || currentSort.column === 'saison') {
            valA = extractSeasonYear(a);
            valB = extractSeasonYear(b);
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return currentSort.asc ? valA - valB : valB - valA;
        }

        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();

        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });
};

const renderTable = () => {
    const tbody = document.getElementById('rounds-table-body');
    if (!tbody) return;

    filterAndSortData();

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageRows = filteredData.slice(startIdx, startIdx + rowsPerPage);

    const pageInfo = document.getElementById('rounds-page-info');
    if (pageInfo) {
        pageInfo.innerText = `Zeige ${totalRows === 0 ? 0 : startIdx + 1} bis ${Math.min(startIdx + rowsPerPage, totalRows)} von ${totalRows} Runden`;
    }

    const prevBtn = document.getElementById('btn-prev-page-r');
    const nextBtn = document.getElementById('btn-next-page-r');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Spielrunden gefunden.</td></tr>';
        return;
    }

    const isLeagueActive = (r) => {
        if (!r) return false;
        const matchingLeague = findMatchingLeague(r);
        return matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : true;
    };

    const INACTIVE_ROUND_TOOLTIP = "Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter 'Ligen verwalten' auf 'Aktiv'.";

    tbody.innerHTML = pageRows.map(r => {
        const rawIndex = roundsData.indexOf(r);
        const isActive = isLeagueActive(r);

        const editBtnHtml = isActive ? `
            <button class="btn-edit-round" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editieren
            </button>
        ` : `
            <span class="tooltip-trigger" data-tooltip="${INACTIVE_ROUND_TOOLTIP}" style="display: inline-flex; cursor: not-allowed;">
                <button class="btn-edit-round" data-idx="${rawIndex}" disabled style="background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; cursor: not-allowed; opacity: 0.45; display: inline-flex; align-items: center; gap: 4px; pointer-events: none;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Editieren
                </button>
            </span>
        `;

        const deleteBtnHtml = isActive ? `
            <button class="btn-delete-round" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Löschen
            </button>
        ` : `
            <span class="tooltip-trigger" data-tooltip="${INACTIVE_ROUND_TOOLTIP}" style="display: inline-flex; cursor: not-allowed;">
                <button class="btn-delete-round" data-idx="${rawIndex}" disabled style="background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; cursor: not-allowed; opacity: 0.45; display: inline-flex; align-items: center; gap: 4px; pointer-events: none;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Löschen
                </button>
            </span>
        `;

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text-primary);">${getDisplayLeagueName(r)}</td>
                <td style="color: var(--color-text-secondary);">${getDisplaySeason(r)}</td>
                <td style="font-weight: 700; color: var(--color-accent);">${r.runde || '-'}</td>
                <td style="color: var(--color-text-secondary);">${formatDateDisplay(r.datumVon)}</td>
                <td style="color: var(--color-text-secondary);">${formatDateDisplay(r.datumBis)}</td>
                <td>
                    ${isActive ? '<span class="badge badge-success" style="font-size: 0.75rem;">Aktiv</span>' : '<span class="badge badge-secondary" style="font-size: 0.75rem;">Inaktiv</span>'}
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        ${editBtnHtml}
                        ${deleteBtnHtml}
                        <button class="btn-view-round-games" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            Spiele ansehen
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render Mobile Accordion Cards
    const mobileCardsContainer = document.getElementById('rounds-mobile-cards');
    if (mobileCardsContainer) {
        if (pageRows.length === 0) {
            mobileCardsContainer.innerHTML = '<div class="glass-card" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Spielrunden gefunden.</div>';
        } else {
            mobileCardsContainer.innerHTML = pageRows.map(r => {
                const rawIndex = roundsData.indexOf(r);
                const isActive = isLeagueActive(r);
                const mEditBtn = isActive ? `
                    <button class="btn-edit-round" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Editieren
                    </button>
                ` : `
                    <span class="tooltip-trigger" data-tooltip="${INACTIVE_ROUND_TOOLTIP}" style="display: block; width: 100%; cursor: not-allowed;">
                        <button class="btn-edit-round" data-idx="${rawIndex}" disabled style="width: 100%; background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); opacity: 0.45; cursor: not-allowed; display: inline-flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Editieren
                        </button>
                    </span>
                `;
                const mDeleteBtn = isActive ? `
                    <button class="btn-delete-round" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Löschen
                    </button>
                ` : `
                    <span class="tooltip-trigger" data-tooltip="${INACTIVE_ROUND_TOOLTIP}" style="display: block; width: 100%; cursor: not-allowed;">
                        <button class="btn-delete-round" data-idx="${rawIndex}" disabled style="width: 100%; background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); opacity: 0.45; cursor: not-allowed; display: inline-flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Löschen
                        </button>
                    </span>
                `;

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div>
                                <div class="admin-m-title">${r.runde ? r.runde + '. Runde' : 'Runde'} <span style="font-weight: normal; color: var(--color-text-secondary); font-size: 0.9rem;">(${getDisplaySeason(r)})</span></div>
                                <div class="admin-m-subtitle">
                                    <span style="font-weight: 600; color: var(--color-text-primary);">${getDisplayLeagueName(r)}</span>
                                    ${isActive ? '<span class="badge badge-success" style="font-size: 0.7rem; margin-left: 6px;">Aktiv</span>' : '<span class="badge badge-secondary" style="font-size: 0.7rem; margin-left: 6px;">Inaktiv</span>'}
                                </div>
                            </div>
                            <div class="admin-m-chevron">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        <div class="admin-m-body">
                            <div class="admin-m-grid">
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Datum von</span>
                                    <span class="admin-m-value">${formatDateDisplay(r.datumVon)}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Datum bis</span>
                                    <span class="admin-m-value">${formatDateDisplay(r.datumBis)}</span>
                                </div>
                            </div>
                            <div class="admin-m-actions">
                                <button class="btn-view-round-games full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    Spiele ansehen
                                </button>
                                ${mEditBtn}
                                ${mDeleteBtn}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Accordion toggle on header click
            mobileCardsContainer.querySelectorAll('.admin-m-header').forEach(hdr => {
                hdr.onclick = () => {
                    const card = hdr.closest('.admin-m-card');
                    if (card) card.classList.toggle('expanded');
                };
            });
        }
    }

    // Bind row action buttons for both Desktop and Mobile views
    const container = document.getElementById('admin-rounds');
    if (container) {
        container.querySelectorAll('.btn-edit-round:not([disabled])').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditRoundModal(idx);
            };
        });

        container.querySelectorAll('.btn-delete-round:not([disabled])').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                deleteRound(idx);
            };
        });

        container.querySelectorAll('.btn-view-round-games').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openViewRoundGamesModal(idx);
            };
        });
    }
};

const populateLeaguesDropdowns = () => {
    const filterSelect = document.getElementById('round-league-filter');
    const modalSelect = document.getElementById('modal-round-liga');

    const freshLeagues = Store.getAdminLeaguesSync();
    if (freshLeagues && freshLeagues.length > 0) {
        leaguesData = freshLeagues;
    } else {
        const fullData = Store.getData();
        if (fullData && fullData.seasons) {
            leaguesData = Object.keys(fullData.seasons).map((sKey, i) => ({
                id: i + 1,
                name: fullData.seasons[sKey].name || `DSG Liga ${sKey}`,
                year: sKey,
                seasonKey: sKey,
                status: 'Aktiv'
            }));
        }
    }

    if (filterSelect) {
        const uniqueLeagueNames = [];
        roundsData.forEach(r => {
            const dName = getDisplayLeagueName(r);
            if (dName && !uniqueLeagueNames.includes(dName)) {
                uniqueLeagueNames.push(dName);
            }
        });
        filterSelect.innerHTML = '<option value="all">Alle Ligen</option>' + 
            uniqueLeagueNames.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    if (modalSelect) {
        const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
        if (activeLeagues.length === 0) {
            modalSelect.innerHTML = '<option value="" disabled selected>Keine aktive Liga verfügbar</option>';
        } else {
            modalSelect.innerHTML = activeLeagues.map(l => {
                const leagueName = l.name || 'DSG Liga';
                const cleanYear = l.year ? String(l.year).replace(/_[a-zA-Z0-9_-]+$/, '') : (l.seasonKey ? String(l.seasonKey).replace(/_[a-zA-Z0-9_-]+$/, '') : '');
                const yearDisplay = cleanYear ? ` (${cleanYear})` : '';
                const seasonKey = l.seasonKey || l.year || (Store.getData()?.currentSeason || '2022/2023');
                return `<option value="${leagueName}" data-season="${seasonKey}" data-year="${cleanYear || seasonKey}">${leagueName}${yearDisplay}</option>`;
            }).join('');
        }

        // Update "+ Runde anlegen" button state
        const addBtn = document.getElementById('btn-add-round');
        if (addBtn) {
            if (activeLeagues.length === 0) {
                addBtn.disabled = true;
                addBtn.style.opacity = '0.5';
                addBtn.style.cursor = 'not-allowed';
                addBtn.parentElement.classList.add('tooltip-trigger');
                addBtn.parentElement.setAttribute('data-tooltip', 'Keine aktive Liga vorhanden. Um Runden anzulegen, aktivieren Sie zuerst eine Liga unter \'Ligen verwalten\'.');
            } else {
                addBtn.disabled = false;
                addBtn.style.opacity = '1';
                addBtn.style.cursor = 'pointer';
                addBtn.parentElement.classList.remove('tooltip-trigger');
                addBtn.parentElement.removeAttribute('data-tooltip');
            }
        }
    }
};

const updateSuggestedRoundNumber = () => {
    if (editingRoundId !== null && editingRoundId !== undefined) return;
    const ligaSelect = document.getElementById('modal-round-liga');
    const roundNrInput = document.getElementById('modal-round-nr');
    if (!ligaSelect || !roundNrInput) return;

    const selectedOpt = ligaSelect.selectedOptions[0];
    const seasonKey = selectedOpt?.getAttribute('data-season') || (Store.getData()?.currentSeason || '2022/2023');
    const ligaName = ligaSelect.value;

    const matchingRounds = roundsData.filter(r => 
        (r.seasonKey && r.seasonKey === seasonKey) || 
        (r.liga && r.liga === ligaName)
    );
    const roundNums = matchingRounds.map(r => parseInt(String(r.runde).replace(/\D/g, '')) || 0);
    const maxRound = roundNums.length > 0 ? Math.max(...roundNums) : 0;
    roundNrInput.value = maxRound + 1;
};

const ensureModalsInBody = () => {
    ['round-modal', 'round-games-modal'].forEach(id => {
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

const openEditRoundModal = (idx = null) => {
    ensureModalsInBody();
    const modal = document.getElementById('round-modal');
    const title = document.getElementById('round-modal-title');
    const submitBtn = document.getElementById('btn-save-round');
    if (!modal) return;

    populateLeaguesDropdowns();

    const ligaSelect = document.getElementById('modal-round-liga');
    if (ligaSelect) {
        ligaSelect.onchange = () => {
            updateSuggestedRoundNumber();
        };
    }

    if (idx !== null && roundsData[idx]) {
        const r = roundsData[idx];
        const matchingLeague = findMatchingLeague(r);
        const isActive = matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : true;
        if (!isActive) {
            showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
            return;
        }

        editingRoundId = r.id || idx;
        title.innerText = 'Runde bearbeiten';
        submitBtn.innerText = 'Aktualisieren';

        if (ligaSelect) {
            let foundOpt = Array.from(ligaSelect.options).find(o => 
                o.value === r.liga || (r.liga && o.value.toLowerCase() === r.liga.toLowerCase())
            ) || Array.from(ligaSelect.options).find(o => 
                o.getAttribute('data-season') === r.seasonKey
            );
            if (!foundOpt) {
                const opt = document.createElement('option');
                opt.value = r.liga || 'DSG Liga';
                opt.text = `${r.liga || 'DSG Liga'}${r.jahr ? ` (${r.jahr})` : ''}`;
                opt.setAttribute('data-season', r.seasonKey || (Store.getData()?.currentSeason || '2022/2023'));
                opt.setAttribute('data-year', r.jahr || r.seasonKey || '2022/2023');
                ligaSelect.appendChild(opt);
                ligaSelect.value = opt.value;
            } else {
                ligaSelect.value = foundOpt.value;
            }
        }

        document.getElementById('modal-round-nr').value = r.runde || 1;
        document.getElementById('modal-round-date-from').value = formatDateForInput(r.datumVon);
        document.getElementById('modal-round-date-to').value = formatDateForInput(r.datumBis);
    } else {
        const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
        if (activeLeagues.length === 0) {
            showToast('Keine aktive Liga vorhanden. Um Runden anzulegen, aktivieren Sie zuerst eine Liga unter "Ligen verwalten".', true);
            return;
        }

        editingRoundId = null;
        title.innerText = 'Runde anlegen';
        submitBtn.innerText = 'Erstellen';

        updateSuggestedRoundNumber();

        const todayIso = new Date().toISOString().split('T')[0];
        document.getElementById('modal-round-date-from').value = todayIso;
        document.getElementById('modal-round-date-to').value = todayIso;
    }

    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeRoundModal = () => {
    document.querySelectorAll('#round-modal').forEach(m => {
        m.style.display = 'none';
    });
    editingRoundId = null;
};

const openViewRoundGamesModal = (idx) => {
    ensureModalsInBody();
    const modal = document.getElementById('round-games-modal');
    const titleEl = document.getElementById('round-games-modal-title');
    const subTitleEl = document.getElementById('round-games-modal-subtitle');
    const listContainer = document.getElementById('round-games-list-container');
    if (!modal || !listContainer) return;

    const round = roundsData[idx];
    if (!round) return;

    if (titleEl) {
        titleEl.innerText = `${round.runde ? round.runde + '. ' : ''}Runde — Spiele`;
    }
    if (subTitleEl) {
        const dateRange = (round.datumVon || round.datumBis) ? ` • ${formatDateDisplay(round.datumVon)} bis ${formatDateDisplay(round.datumBis)}` : '';
        subTitleEl.innerText = `${getDisplayLeagueName(round)} (${getDisplaySeason(round)})${dateRange}`;
    }

    const targetSeasonKey = round.seasonKey || (Store.getData()?.currentSeason || '2026/2027');
    const allSeasonMatches = Store.getMatches(targetSeasonKey) || [];

    const roundNumStr = String(round.runde || '').trim();
    const roundMatches = allSeasonMatches.filter(m => {
        if (!m) return false;
        const mRound = String(m.round || m.roundNr || '').trim();
        if (!mRound) return false;
        return mRound === `${roundNumStr}. Runde` || 
               mRound === `Runde ${roundNumStr}` || 
               mRound === roundNumStr ||
               mRound.startsWith(`${roundNumStr}.`) ||
               mRound.includes(`Runde ${roundNumStr}`);
    });

    if (roundMatches.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--color-text-secondary);">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.45; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px; color: var(--color-text-primary);">Keine Spiele eingetragen</div>
                <p style="font-size: 0.88rem; margin: 0; max-width: 380px; margin-left: auto; margin-right: auto; line-height: 1.45; color: var(--color-text-secondary);">
                    Für diese Spielrunde sind noch keine Spiele hinterlegt. Neue Spiele können im Tab <strong>„Spiele“</strong> angelegt werden.
                </p>
            </div>
        `;
    } else {
        const soccerBallSvg = `
            <svg class="goal-svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; flex-shrink: 0;">
                <circle cx="12" cy="12" r="10" stroke-width="1.8"></circle>
                <path d="M12 7.5L15.8 10.2L14.4 15H9.6L8.2 10.2L12 7.5Z" fill="currentColor" fill-opacity="0.25" stroke-width="1.8"></path>
                <path d="M12 2v5.5"></path>
                <path d="M21.5 8.5l-5.7 1.7"></path>
                <path d="M18 20.3l-3.6-5.3"></path>
                <path d="M6 20.3l3.6-5.3"></path>
                <path d="M2.5 8.5l5.7 1.7"></path>
            </svg>
        `;

        const renderBadge = (type, count) => {
            if (type === 'goal') {
                const ballCount = Math.max(1, parseInt(count) || 1);
                const balls = Array(ballCount).fill(soccerBallSvg).join('');
                return `<span class="event-icon-wrapper" title="${ballCount > 1 ? ballCount + ' Tore' : 'Tor'}">${balls}</span>`;
            }
            if (type === 'yellow') {
                const cardCount = Math.max(1, parseInt(count) || 1);
                if (cardCount >= 2) {
                    return `<span class="match-card-badge-card badge-yellow-red" title="Gelb-Rote Karte (2. Gelbe)"></span>`;
                }
                return `<span class="match-card-badge-card badge-yellow" title="Gelbe Karte"></span>`;
            }
            if (type === 'yellowRed') {
                return `<span class="match-card-badge-card badge-yellow-red" title="Gelb-Rote Karte"></span>`;
            }
            if (type === 'red') {
                return `<span class="match-card-badge-card badge-red" title="Rote Karte"></span>`;
            }
            return '';
        };

        const renderTeamReds = (count) => {
            if (!count || count <= 0) return '';
            const cards = Array(count).fill('<span class="team-red-card-badge" title="Rote Karte / Platzverweis"></span>').join('');
            return `<span class="team-red-cards" title="${count > 1 ? count + ' Platzverweise' : 'Platzverweis'}">${cards}</span>`;
        };

        const groupEvents = (eventsList) => {
            const playerEvents = new Map();
            eventsList.forEach(e => {
                const player = (e.player || e.name || '').trim();
                if (!player) return;
                const type = e.type || 'goal';
                if (!playerEvents.has(player)) playerEvents.set(player, []);
                playerEvents.get(player).push({ type, count: parseInt(e.count) || 1 });
            });

            const results = [];
            playerEvents.forEach((types, player) => {
                const hasYellowRed = types.some(t => t.type === 'yellowRed');
                const hasRed = types.some(t => t.type === 'red');
                const yellowCount = types.filter(t => t.type === 'yellow').reduce((sum, t) => sum + t.count, 0);
                const goalCount = types.filter(t => t.type === 'goal').reduce((sum, t) => sum + t.count, 0);

                if (goalCount > 0) {
                    results.push({ player, type: 'goal', count: goalCount });
                }
                if (hasYellowRed || (hasRed && yellowCount > 0) || yellowCount >= 2) {
                    results.push({ player, type: 'yellowRed', count: 1 });
                } else if (hasRed) {
                    results.push({ player, type: 'red', count: 1 });
                } else if (yellowCount > 0) {
                    results.push({ player, type: 'yellow', count: yellowCount });
                }
            });
            return results;
        };

        listContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                ${roundMatches.map(m => {
                    const isFinished = m.status === 'Beendet' || m.status === 'Played' || m.status === 'Gespielt';
                    const isAbgesagtStatus = (m.status || '').toLowerCase().includes('abgesagt');
                    let statusBadge = '<span class="badge badge-secondary" style="font-size: 0.72rem;">Ausstehend</span>';
                    if (isFinished) {
                        statusBadge = '<span class="badge badge-success" style="font-size: 0.72rem;">Beendet</span>';
                    } else if (isAbgesagtStatus) {
                        statusBadge = `<span class="badge badge-danger" style="font-size: 0.72rem; background: #dc3545; color: #fff;">${m.status}</span>`;
                    } else if (m.status && m.status.includes('Verschoben')) {
                        statusBadge = '<span class="badge badge-warning" style="font-size: 0.72rem; background: #ffc107; color: #000;">Verschoben</span>';
                    }

                    // Calculate Weekday
                    let weekdayStr = '';
                    if (m.date) {
                        const parts = String(m.date).split('.');
                        if (parts.length === 3) {
                            let yr = parseInt(parts[2]);
                            if (yr < 100) yr += 2000;
                            const dObj = new Date(yr, parseInt(parts[1]) - 1, parseInt(parts[0]));
                            if (!isNaN(dObj.getTime())) {
                                const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
                                weekdayStr = days[dObj.getDay()] + ', ';
                            }
                        }
                    }

                    // Normalize team names for event attribution
                    const norm = (s) => (s || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').replace(/\s+/g, '').trim();
                    const homeNorm = norm(m.home);
                    const awayNorm = norm(m.away);

                    let combinedEvents = (m.events && m.events.length > 0) ? [...m.events] : [];
                    if (combinedEvents.length === 0) {
                        (m.cards || []).forEach(c => combinedEvents.push({ type: c.type || 'yellow', player: c.name || c.player, team: c.team, count: 1 }));
                    }
                    const hasEvents = combinedEvents.length > 0;

                    const isHomeEvent = (e) => {
                        const t = String(e.team || '');
                        return t === String(m.home) || (homeNorm && norm(t) === homeNorm);
                    };
                    const isAwayEvent = (e) => {
                        const t = String(e.team || '');
                        return t === String(m.away) || (awayNorm && norm(t) === awayNorm);
                    };

                    const countReds = (evList) => {
                        const dismissedPlayers = new Set();
                        evList.forEach(e => {
                            const p = (e.player || e.name || '').trim();
                            if (!p) return;
                            const t = e.type || 'yellow';
                            if (t === 'red' || t === 'yellowRed') {
                                dismissedPlayers.add(p);
                            }
                        });
                        const yellowCounts = new Map();
                        evList.forEach(e => {
                            const p = (e.player || e.name || '').trim();
                            if (!p) return;
                            if (e.type === 'yellow') {
                                yellowCounts.set(p, (yellowCounts.get(p) || 0) + (parseInt(e.count) || 1));
                            }
                        });
                        yellowCounts.forEach((cnt, p) => {
                            if (cnt >= 2) dismissedPlayers.add(p);
                        });
                        return dismissedPlayers.size;
                    };

                    let homeReds = 0;
                    let awayReds = 0;
                    let eventsHtml = '';

                    if (hasEvents) {
                        homeReds = countReds(combinedEvents.filter(isHomeEvent));
                        awayReds = countReds(combinedEvents.filter(isAwayEvent));

                        const homeGrouped = groupEvents(combinedEvents.filter(isHomeEvent));
                        const awayGrouped = groupEvents(combinedEvents.filter(isAwayEvent));

                        eventsHtml = `
                            <div class="events-accordion" style="display: none;">
                                <div class="events-container">
                                    <div class="events-col-home">
                                        ${homeGrouped.length > 0 ? homeGrouped.map(e => `
                                            <div class="match-event-row match-event-home">
                                                <span class="match-event-player">${e.player}</span>
                                                <div class="match-event-badges">${renderBadge(e.type, e.count)}</div>
                                            </div>
                                        `).join('') : '<span style="font-size: 0.75rem; color: var(--color-text-secondary); opacity: 0.5;">-</span>'}
                                    </div>
                                    <div class="events-col-away">
                                        ${awayGrouped.length > 0 ? awayGrouped.map(e => `
                                            <div class="match-event-row match-event-away">
                                                <div class="match-event-badges">${renderBadge(e.type, e.count)}</div>
                                                <span class="match-event-player">${e.player}</span>
                                            </div>
                                        `).join('') : '<span style="font-size: 0.75rem; color: var(--color-text-secondary); opacity: 0.5;">-</span>'}
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                    const locationStr = m.location || m.venue || '';

                    let displayScore = m.score || '-:-';
                    if (m.status === 'Abgesagt 3:0') displayScore = 'Abges. 3:0';
                    if (m.status === 'Abgesagt 0:3') displayScore = 'Abges. 0:3';
                    if (m.status === 'Postponed') displayScore = 'Verschoben';
                    if (displayScore && displayScore !== '-:-' && displayScore !== '- : -' && !displayScore.startsWith('Abges.') && displayScore !== 'Verschoben') {
                        displayScore = displayScore.replace(/\s*\([^)]*\)/g, '').trim();
                    }
                    const htScore = (m.ht && m.ht !== ':') ? m.ht : (m.score ? (m.score.match(/\(([^)]+)\)/)?.[1] || '') : '');

                    return `
                        <div class="match-card glass-card ${hasEvents ? 'has-events-accordion' : ''}" style="cursor: ${hasEvents ? 'pointer' : 'default'};">
                            <div class="match-card-meta">
                                <div class="match-meta-left">
                                    <span class="match-meta-item">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        ${weekdayStr}${m.date || '-'}${m.time ? ' • ' + m.time + ' Uhr' : ''}
                                    </span>
                                    ${locationStr ? `
                                        <span class="match-meta-item hide-mobile">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                            ${locationStr}
                                        </span>
                                    ` : ''}
                                </div>
                                <div class="match-meta-right" style="display: flex; align-items: center; gap: 8px;">
                                    ${locationStr ? `
                                        <span class="match-meta-item show-mobile" style="opacity: 0.85;">
                                            ${locationStr}
                                        </span>
                                    ` : ''}
                                    ${statusBadge}
                                    ${hasEvents ? `
                                        <span class="match-details-indicator">
                                            <span>Details</span>
                                            <svg class="details-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </span>
                                    ` : ''}
                                </div>
                            </div>

                            <div class="match-card-body">
                                <div class="match-team match-team-home">
                                    <span class="team-name">${m.home || 'Heim'}</span>
                                    ${renderTeamReds(homeReds)}
                                </div>
                                
                                <div class="match-score-center">
                                    <span class="match-score-badge">
                                        ${displayScore}
                                    </span>
                                    ${(htScore && !isAbgesagtStatus) ? `<span class="match-ht-badge">HT ${htScore}</span>` : ''}
                                </div>
                                
                                <div class="match-team match-team-away">
                                    ${renderTeamReds(awayReds)}
                                    <span class="team-name">${m.away || 'Gast'}</span>
                                </div>
                            </div>

                            ${eventsHtml}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Bind interactive accordion click handlers
        listContainer.querySelectorAll('.has-events-accordion').forEach(card => {
            card.addEventListener('click', () => {
                const accordion = card.querySelector('.events-accordion');
                if (!accordion) return;
                if (accordion.style.display === 'none') {
                    accordion.style.display = 'block';
                    card.classList.add('accordion-open');
                    if (typeof anime !== 'undefined') {
                        anime({
                            targets: accordion,
                            opacity: [0, 1],
                            translateY: [-6, 0],
                            duration: 250,
                            easing: 'easeOutQuad'
                        });
                    }
                } else {
                    accordion.style.display = 'none';
                    card.classList.remove('accordion-open');
                }
            });
        });
    }

    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeRoundGamesModal = () => {
    document.querySelectorAll('#round-games-modal').forEach(m => {
        m.style.display = 'none';
    });
};

const deleteRound = (idx) => {
    const r = roundsData[idx];
    if (!r) return;

    const matchingLeague = findMatchingLeague(r);
    const isActive = matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : true;
    if (!isActive) {
        showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
        return;
    }

    if (confirm(`Möchten Sie die Runde "${getDisplayLeagueName(r)} - Runde ${r.runde}" wirklich löschen?`)) {
        const roundId = r.id;
        roundsData = roundsData.filter(item => (roundId !== undefined && roundId !== null ? String(item.id) !== String(roundId) : item !== r));
        Store.saveAdminRounds(roundsData);
        renderTable();
        showToast('Spielrunde gelöscht.');
    }
};

let isEventsBound = false;

export const initAdminRounds = async () => {
    ensureModalsInBody();
    // Load data from Store
    try {
        [roundsData, leaguesData, teamsData] = await Promise.all([
            Store.getAdminRounds(),
            Store.getAdminLeagues(),
            Store.getAdminTeams()
        ]);

        // Clean up any duplicate rounds that might exist
        const seen = new Set();
        roundsData = (roundsData || []).filter(r => {
            const key = `${r.seasonKey || ''}_${r.saison || ''}_${r.jahr || ''}_${r.runde || ''}_${r.liga || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    } catch(e) {
        console.error("Error loading admin rounds data:", e);
    }

    populateLeaguesDropdowns();
    renderTable();

    // Event listeners
    const addRoundBtn = document.getElementById('btn-add-round');
    if (addRoundBtn) addRoundBtn.onclick = () => openEditRoundModal(null);

    document.querySelectorAll('.btn-close-round-modal').forEach(btn => {
        btn.onclick = closeRoundModal;
    });

    document.querySelectorAll('.btn-close-round-games-modal').forEach(btn => {
        btn.onclick = closeRoundGamesModal;
    });

    const searchInput = document.getElementById('round-search');
    if (searchInput) searchInput.oninput = () => {
        currentPage = 1;
        renderTable();
    };

    const filterLeague = document.getElementById('round-league-filter');
    if (filterLeague) filterLeague.onchange = () => {
        currentPage = 1;
        renderTable();
    };

    const statusFilter = document.getElementById('round-status-filter');
    if (statusFilter) statusFilter.onchange = () => {
        currentPage = 1;
        renderTable();
    };

    const sortSelect = document.getElementById('round-sort-select');
    if (sortSelect) sortSelect.onchange = () => {
        currentPage = 1;
        renderTable();
    };

    // Outside-click close for modals
    const roundModal = document.getElementById('round-modal');
    if (roundModal) {
        roundModal.onclick = (e) => {
            if (e.target === roundModal) closeRoundModal();
        };
    }

    const roundGamesModal = document.getElementById('round-games-modal');
    if (roundGamesModal) {
        roundGamesModal.onclick = (e) => {
            if (e.target === roundGamesModal) closeRoundGamesModal();
        };
    }

    // Sorting headers
    document.querySelectorAll('.datagrid-container table.admin-table th.sortable').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
            const col = th.getAttribute('data-sort');
            if (currentSort.column === col) {
                currentSort.asc = !currentSort.asc;
            } else {
                currentSort.column = col;
                currentSort.asc = true;
            }
            renderTable();
        };
    });

    // Pagination
    const prevBtn = document.getElementById('btn-prev-page-r');
    if (prevBtn) prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    };

    const nextBtn = document.getElementById('btn-next-page-r');
    if (nextBtn) nextBtn.onclick = () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };

    // Round Form Submit
    const roundForm = document.getElementById('round-form');
    if (roundForm) {
        roundForm.onsubmit = (e) => {
            e.preventDefault();

            const ligaSelect = document.getElementById('modal-round-liga');
            const selectedOpt = ligaSelect?.selectedOptions[0];
            const liga = ligaSelect ? ligaSelect.value : 'DSG Liga';
            const seasonKey = selectedOpt?.getAttribute('data-season') || (Store.getData()?.currentSeason || '2022/2023');
            const jahr = selectedOpt?.getAttribute('data-year') || seasonKey;
            const saison = liga;

            const runde = parseInt(document.getElementById('modal-round-nr').value) || 1;
            const datumVon = document.getElementById('modal-round-date-from').value;
            const datumBis = document.getElementById('modal-round-date-to').value;

            // Strict active league guard
            const matchingLeague = findMatchingLeague({ seasonKey, liga, saison, jahr });
            const isTargetActive = matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : false;
            if (!isTargetActive) {
                showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
                return;
            }

            if (editingRoundId !== null && editingRoundId !== undefined) {
                const index = roundsData.findIndex(r => String(r.id) === String(editingRoundId));
                if (index !== -1) {
                    roundsData[index] = {
                        ...roundsData[index],
                        saison,
                        jahr,
                        runde,
                        datumVon,
                        datumBis,
                        liga,
                        seasonKey
                    };
                }
            } else {
                // Check if this round already exists for this league/season
                const existing = roundsData.find(r => 
                    String(r.runde) === String(runde) && 
                    (r.seasonKey === seasonKey || r.liga === liga)
                );
                if (existing) {
                    showToast(`Runde ${runde} für ${liga} (${jahr}) existiert bereits!`, true);
                    return;
                }

                const validRoundIds = roundsData.map(r => parseInt(r.id) || 0).filter(n => n > 0 && n < 100000);
                const maxRoundId = validRoundIds.length > 0 ? Math.max(...validRoundIds) : 99;
                const newId = maxRoundId + 1;
                roundsData.unshift({
                    id: newId,
                    saison,
                    jahr,
                    runde,
                    datumVon,
                    datumBis,
                    liga,
                    seasonKey
                });
            }

            const wasEditing = (editingRoundId !== null && editingRoundId !== undefined);
            Store.saveAdminRounds(roundsData);
            closeRoundModal();
            renderTable();
            showToast(wasEditing ? 'Spielrunde erfolgreich aktualisiert!' : 'Spielrunde erfolgreich erstellt!');
        };
    }
};
