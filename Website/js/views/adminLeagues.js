import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1791175000000';
import { showToast } from './admin.js?v=1791175000000';
import { renderTeamLogo } from '../logos.js?v=1791175000000';

let leaguesData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'id', asc: false };

let selectedLeague = null;
let currentModalTab = 'table';

export const formatLeagueYear = (yr) => {
    if (!yr) return '-';
    let s = String(yr).trim();
    if (/^\d{4}$/.test(s)) {
        const nextY = parseInt(s) + 1;
        return `${s}/${nextY}`;
    }
    return s;
};

export const renderAdminLeagues = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Übersicht der Ligen</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Verwaltung aller Ligen, Spielklassen und Saisonen</p>
        </div>

        <!-- Controls Toolbar immediately above table -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-league" style="background: var(--color-accent); color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Liga anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="league-search" class="admin-input" placeholder="Suchen..." style="width: 170px;">
                <select id="league-status-filter" class="admin-input" style="width: 130px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                </select>
                <select id="league-sort-select" class="admin-input" style="width: 170px;">
                    <option value="id-desc"># ID (absteigend)</option>
                    <option value="id-asc"># ID (aufsteigend)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="year-desc">Jahr (neueste)</option>
                    <option value="status">Status (Aktiv zuerst)</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0; overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="id" class="sortable" style="width: 50px;"># ↕</th>
                        <th data-sort="name" class="sortable">Liga / Name ↕</th>
                        <th data-sort="year" class="sortable">Jahr ↕</th>
                        <th data-sort="status" class="sortable">Status ↕</th>
                        <th data-sort="showOnHomepage" class="sortable" style="text-align: center;">Homepage ↕</th>
                        <th style="text-align: center;">Daten & Statistiken</th>
                        <th style="width: 100px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="leagues-table-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Lade Ligen...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card Accordion View -->
        <div id="leagues-mobile-cards" class="admin-mobile-cards">
            <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Lade Ligen...</div>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="leagues-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-l" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-l" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create League Modal -->
        <div id="league-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div class="glass-card modal-content" style="background: var(--color-surface); max-width: 520px; width: 100%; max-height: 90vh; max-height: 90dvh; overflow-y: auto; padding: var(--space-lg); border-radius: var(--border-radius-md); box-shadow: 0 16px 40px rgba(0,0,0,0.3); border: var(--glass-border); margin: auto;">
                <h3 id="modal-league-title" style="margin-bottom: var(--space-md);">Liga bearbeiten</h3>
                <form id="league-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-league-id">
                    <div>
                        <label id="lbl-league-name" style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Liga</label>
                        <input type="text" id="edit-league-name" class="admin-input" placeholder="Name" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Jahr</label>
                        <input type="text" id="edit-league-year" class="admin-input" placeholder="z.B. 2022/2023 oder 2022" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
                        <select id="edit-league-status" class="admin-input" style="width: 100%;">
                            <option value="Aktiv">Aktiv</option>
                            <option value="Inaktiv">Inaktiv</option>
                        </select>
                    </div>

                    <!-- Show on Homepage Checkbox -->
                    <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0 6px 0; background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
                        <input type="checkbox" id="edit-league-show-homepage" style="width: 18px; height: 18px; accent-color: var(--color-accent); cursor: pointer;" checked>
                        <label for="edit-league-show-homepage" style="font-size: 0.88rem; font-weight: 600; cursor: pointer; color: var(--color-text-primary); margin: 0;">
                            Auf Homepage anzeigen (Saison-Auswahl)
                        </label>
                    </div>

                    <!-- Participating Teams Selector (Active leagues only) -->
                    <div id="league-teams-section" style="border-top: 1px solid var(--color-border); padding-top: var(--space-sm); margin-top: var(--space-xs);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); display: inline-flex; align-items: center; gap: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg>
                                Teilnehmende Teams
                            </label>
                            <div style="display: flex; gap: 6px;">
                                <button type="button" id="btn-select-all-league-teams" class="btn" style="padding: 3px 8px; font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; border-radius: 4px; color: var(--color-text-primary);">Alle auswählen</button>
                                <button type="button" id="btn-deselect-all-league-teams" class="btn" style="padding: 3px 8px; font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; border-radius: 4px; color: var(--color-text-primary);">Keine</button>
                            </div>
                        </div>
                        <input type="text" id="league-team-search" class="admin-input" placeholder="Teams filtern..." style="width: 100%; margin-bottom: 8px; font-size: 0.85rem; padding: 6px 10px;">
                        
                        <div id="league-teams-checkbox-container" style="max-height: 180px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); padding: 8px 12px; background: rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 6px;">
                            <span style="color: var(--color-text-secondary); font-size: 0.85rem;">Lade Teams...</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md); justify-content: space-between; align-items: center;">
                        <button type="button" id="btn-delete-league" class="btn" style="background: #e74c3c; color: white; padding: 8px 16px;">Löschen</button>
                        <div style="display: flex; gap: var(--space-sm); margin-left: auto;">
                            <button type="button" id="btn-close-league-modal" class="btn btn-outline" style="padding: 8px 16px;">Abbrechen</button>
                            <button type="submit" id="btn-submit-league" class="btn-dsg" style="padding: 8px 18px;">Bestätigen</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- League Data Inspection Popup (Grid/Tables for Tabelle, Spielberichte, Karten, Tore) -->
        <div id="league-data-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 100000; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div style="background: var(--color-surface); max-width: 900px; width: 100%; max-height: 90vh; max-height: 90dvh; display: flex; flex-direction: column; border-radius: var(--border-radius-md); box-shadow: 0 16px 48px rgba(0,0,0,0.35); border: 1px solid var(--color-border); overflow: hidden; margin: auto;">
                
                <!-- Fixed Modal Top Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--color-border); background: rgba(0,0,0,0.02); flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm); overflow: hidden;">
                        <h3 id="league-data-title" style="margin: 0; font-size: 1.15rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Liga Details</h3>
                        <span id="league-data-badge" class="badge badge-secondary" style="font-size: 0.72rem;">Inaktiv</span>
                    </div>
                    <button type="button" id="btn-close-data-modal" class="btn-outline" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Zurück
                    </button>
                </div>

                <!-- Fixed Modal Sub-Nav Tabs (4 Equal Columns on Mobile & Desktop) -->
                <div id="league-data-tab-bar" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 10px 16px; border-bottom: 1px solid var(--color-border); background: rgba(0,0,0,0.03); flex-shrink: 0; box-sizing: border-box;">
                    <button class="modal-tab-btn" data-modal-tab="table" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 4px; font-size: 0.82rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s; white-space: nowrap;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <span>Tabelle</span>
                    </button>
                    <button class="modal-tab-btn" data-modal-tab="matches" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 4px; font-size: 0.82rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s; white-space: nowrap;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg>
                        <span>Spiele</span>
                    </button>
                    <button class="modal-tab-btn" data-modal-tab="cards" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 4px; font-size: 0.82rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s; white-space: nowrap;">
                        <span style="display:inline-block;width:9px;height:12px;background:#f1c40f;border-radius:2px;"></span>
                        <span>Karten</span>
                    </button>
                    <button class="modal-tab-btn" data-modal-tab="scorers" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 4px; font-size: 0.82rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s; white-space: nowrap;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        <span>Tore</span>
                    </button>
                </div>

                <!-- Scrollable Content Area -->
                <div id="league-data-content" style="padding: 24px; overflow-y: auto; flex: 1; min-height: 300px;">
                    <!-- Injected dynamically based on active tab -->
                </div>
            </div>
        </div>

    </div>
    `;
};

const ensureModalsInBody = () => {
    ['league-modal', 'league-data-modal'].forEach(id => {
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

export const initAdminLeagues = async () => {
    const tbody = document.getElementById('leagues-table-body');
    if (!tbody) return;

    ensureModalsInBody();

    if (leaguesData.length === 0) {
        leaguesData = await Store.getAdminLeagues();
    }
    
    filteredData = [...leaguesData];
    sortData('id', false);
    bindEvents();
    renderTable();
};

const getSeasonKey = (league) => {
    if (!league) return '2022/2023';
    if (league.seasonKey && typeof league.seasonKey === 'string' && league.seasonKey !== 'undefined') {
        const sk = league.seasonKey.trim();
        if (sk === '2026/2027' || sk === '2025/2026' || sk === '2024/2025' || sk === '2024/2025_oberes' || sk === '2024/2025_unteres' || sk === '2023/2024' || sk === '2022/2023' || sk === '2022/2023_1klasse' || sk === '2021/2022' || sk === '2021/2022_1klasse') {
            return sk;
        }
    }
    
    const yrStr = String(league.year || '').trim();
    const nameStr = String(league.name || '').trim();
    
    if (yrStr.includes('2026') || nameStr.includes('26/27') || yrStr.includes('26/27')) {
        if (!nameStr.toLowerCase().includes('sommer') && !nameStr.toLowerCase().includes('cup')) {
            return '2026/2027';
        }
    }
    if (yrStr.includes('2025') || nameStr.includes('25/26') || yrStr.includes('25/26')) {
        return '2025/2026';
    }
    if (yrStr.includes('2024') || nameStr.includes('24/25') || yrStr.includes('24/25')) {
        if (nameStr.toLowerCase().includes('oberes')) return '2024/2025_oberes';
        if (nameStr.toLowerCase().includes('unteres')) return '2024/2025_unteres';
        return '2024/2025';
    }
    if (yrStr.includes('2023') || nameStr.includes('23/24') || yrStr.includes('23/24')) {
        return '2023/2024';
    }
    if (yrStr.includes('2022') || nameStr.includes('22/23') || yrStr.includes('22/23')) {
        if (nameStr.toLowerCase().includes('1. klasse') || nameStr.toLowerCase().includes('1klasse')) return '2022/2023_1klasse';
        return '2022/2023';
    }
    if (yrStr.includes('2021') || nameStr.includes('21/22') || yrStr.includes('21/22')) {
        if (nameStr.toLowerCase().includes('1. klasse') || nameStr.toLowerCase().includes('1klasse')) return '2021/2022_1klasse';
        return '2021/2022';
    }
    
    if (nameStr && yrStr && !nameStr.includes(yrStr)) {
        return `${nameStr} ${yrStr}`;
    }
    return nameStr || yrStr || '2022/2023';
};

const renderTable = () => {
    const tbody = document.getElementById('leagues-table-body');
    const info = document.getElementById('leagues-page-info');
    if (!tbody) return;

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const pageRows = filteredData.slice(startIdx, endIdx);

    if (info) {
        info.innerText = `Zeige ${totalRows > 0 ? startIdx + 1 : 0} bis ${endIdx} von ${totalRows} Ligen`;
    }

    const prevBtn = document.getElementById('btn-prev-page-l');
    const nextBtn = document.getElementById('btn-next-page-l');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Keine Ligen gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(l => {
        const status = (l.status === 'Nein' || l.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';
        const isVisible = (l.showOnHomepage !== false);
        const rawIndex = leaguesData.indexOf(l);

        return `
            <tr>
                <td style="color: var(--color-text-secondary); white-space: nowrap;">#${l.id || '-'}</td>
                <td style="white-space: nowrap;"><strong style="color: var(--color-text-primary);">${l.name || '-'}</strong></td>
                <td style="white-space: nowrap;">${formatLeagueYear(l.year)}</td>
                <td style="white-space: nowrap;"><span class="badge ${badgeClass}">${status}</span></td>
                <td style="text-align: center; white-space: nowrap;">
                    <span class="badge ${isVisible ? 'badge-success' : 'badge-secondary'}" style="font-size: 0.75rem;">
                        ${isVisible ? 'Ja' : 'Nein'}
                    </span>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <div style="display: inline-flex; gap: 4px; justify-content: center; align-items: center;">
                        <button class="btn-league-view" data-action="table" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 3px;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            Tabelle
                        </button>
                        <button class="btn-league-view" data-action="matches" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 3px;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg>
                            Spiele
                        </button>
                        <button class="btn-league-view" data-action="cards" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 3px;">
                            <span style="display:inline-block;width:7px;height:10px;background:#f1c40f;border-radius:1px;"></span>
                            Karten
                        </button>
                        <button class="btn-league-view" data-action="scorers" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 3px;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            Tore
                        </button>
                    </div>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <button class="btn btn-outline edit-single-league-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        Bearbeiten
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render Mobile Accordion Cards
    const mobileCardsContainer = document.getElementById('leagues-mobile-cards');
    if (mobileCardsContainer) {
        if (pageRows.length === 0) {
            mobileCardsContainer.innerHTML = '<div class="glass-card" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Ligen gefunden.</div>';
        } else {
            mobileCardsContainer.innerHTML = pageRows.map(l => {
                const status = (l.status === 'Nein' || l.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
                let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';
                const isVisible = (l.showOnHomepage !== false);
                const rawIndex = leaguesData.indexOf(l);

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div style="flex: 1; min-width: 0;">
                                <div class="admin-m-title">
                                    <span style="color: var(--color-accent); font-weight: 800; margin-right: 4px;">#${l.id || '-'}</span>
                                    <strong>${l.name || '-'}</strong>
                                </div>
                                <div class="admin-m-subtitle">
                                    <span class="badge ${badgeClass}" style="font-size: 0.72rem;">${status}</span>
                                    <span>•</span>
                                    <span>Jahr: ${formatLeagueYear(l.year)}</span>
                                    <span>•</span>
                                    <span>Homepage: ${isVisible ? 'Ja' : 'Nein'}</span>
                                </div>
                            </div>
                            <svg class="admin-m-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="admin-m-body">
                            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: 6px;">
                                Daten & Statistiken einsehen
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: var(--space-sm);">
                                <button class="btn-league-view" data-action="table" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 700; padding: 8px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                    Tabelle
                                </button>
                                <button class="btn-league-view" data-action="matches" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 700; padding: 8px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg>
                                    Spielberichte
                                </button>
                                <button class="btn-league-view" data-action="cards" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 700; padding: 8px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <span style="display:inline-block;width:10px;height:13px;background:#f1c40f;border-radius:2px;"></span>
                                    Karten
                                </button>
                                <button class="btn-league-view" data-action="scorers" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 700; padding: 8px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                                    Tore
                                </button>
                            </div>
                            <div class="admin-m-actions" style="border-top: 1px solid var(--color-border); padding-top: 8px;">
                                <button class="edit-single-league-btn full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    Liga bearbeiten
                                </button>
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

    // Bind action buttons across both Desktop and Mobile views
    const container = document.getElementById('admin-leagues');
    if (container) {
        container.querySelectorAll('.edit-single-league-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditModal(idx);
            };
        });

        container.querySelectorAll('.btn-league-view').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                const action = e.currentTarget.getAttribute('data-action');
                openLeagueDataModal(idx, action);
            };
        });
    }
};

const updateModalTabsUI = () => {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        const tab = btn.getAttribute('data-modal-tab');
        if (tab === currentModalTab) {
            btn.style.background = 'var(--color-accent)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--color-accent)';
            btn.style.fontWeight = '700';
            btn.classList.add('active');
        } else {
            btn.style.background = 'var(--color-surface)';
            btn.style.color = 'var(--color-text-primary)';
            btn.style.borderColor = 'var(--color-border)';
            btn.style.fontWeight = '600';
            btn.classList.remove('active');
        }
    });
};

const openLeagueDataModal = (idx, tab = 'table') => {
    ensureModalsInBody();
    if (idx === null || !leaguesData[idx]) return;
    selectedLeague = leaguesData[idx];
    currentModalTab = tab;

    const modal = document.getElementById('league-data-modal');
    const title = document.getElementById('league-data-title');
    const badge = document.getElementById('league-data-badge');

    if (title) title.innerText = `${selectedLeague.name} (${selectedLeague.year || ''})`;
    if (badge) {
        const status = (selectedLeague.status === 'Nein' || selectedLeague.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        badge.innerText = status;
        badge.className = `badge ${status === 'Aktiv' ? 'badge-success' : 'badge-secondary'}`;
    }

    updateModalTabsUI();
    renderModalContent();
    if (modal) {
        modal.style.display = 'flex';
        const content = modal.querySelector('div') || modal.firstElementChild;
        if (content) content.scrollTop = 0;
    }
};

const getMatchGoals = (m) => {
    if (m.events && m.events.length > 0) {
        return m.events.filter(e => e.type === 'goal').map(e => ({
            name: e.name || e.player,
            team: e.team,
            minute: e.minute
        }));
    }
    if (m.scorers && m.scorers.length > 0) {
        return m.scorers.map(s => ({
            name: s.name || s.player,
            team: s.team,
            count: s.count || 1
        }));
    }
    return [];
};

const getMatchCards = (m) => {
    if (m.cards && m.cards.length > 0) {
        return m.cards.map(c => ({
            name: c.name || c.player,
            team: c.team,
            type: c.type || 'yellow',
            minute: c.minute
        }));
    }
    if (m.events && m.events.length > 0) {
        return m.events.filter(e => e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'red').map(e => ({
            name: e.name || e.player,
            team: e.team,
            type: e.type,
            minute: e.minute
        }));
    }
    return [];
};

const renderModalContent = () => {
    const container = document.getElementById('league-data-content');
    if (!container || !selectedLeague) return;

    const seasonKey = getSeasonKey(selectedLeague);
    const storeData = Store.getData();
    let seasonData = storeData.seasons ? (storeData.seasons[seasonKey] || storeData.seasons[selectedLeague.seasonKey] || storeData.seasons[selectedLeague.year] || storeData.seasons[selectedLeague.name]) : null;

    // Fallback: search keys in seasons
    if (!seasonData && storeData && storeData.seasons) {
        const yrStr = String(selectedLeague.year || '').replace(/\D/g, '');
        if (yrStr.length >= 4) {
            const yrPrefix = yrStr.slice(0, 4);
            for (const k of Object.keys(storeData.seasons)) {
                if (k.includes(yrPrefix)) {
                    seasonData = storeData.seasons[k];
                    break;
                }
            }
        }
    }

    if (!seasonData) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
                <div style="margin-bottom: 12px; color: var(--color-text-secondary); opacity: 0.6;">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h4 style="color: var(--color-text-primary); margin-bottom: 6px;">Keine Spieldaten vorhanden</h4>
                <p style="font-size: 0.9rem; max-width: 420px; margin: 0 auto;">Für die Saison <strong>${selectedLeague.name} (${seasonKey})</strong> wurden noch keine Daten erfasst oder importiert.</p>
            </div>
        `;
        return;
    }

    if (currentModalTab === 'table') {
        const teams = [...(seasonData.teams || [])].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffB = (b.gf || 0) - (b.ga || 0);
            const diffA = (a.gf || 0) - (a.ga || 0);
            if (diffB !== diffA) return diffB - diffA;
            return (b.gf || 0) - (a.gf || 0);
        });

        if (teams.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Mannschaften eingetragen.</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <!-- Desktop Header -->
                <div class="hide-mobile" style="display: grid; grid-template-columns: 36px 1fr 45px 40px 40px 40px 65px 50px 55px; padding: 10px 14px; font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; border-bottom: 1px solid var(--color-border); letter-spacing: 0.05em; background: rgba(0,0,0,0.02); border-radius: 6px;">
                    <span style="text-align: center;">#</span>
                    <span>Mannschaft</span>
                    <span style="text-align: center;">Sp</span>
                    <span style="text-align: center;">S</span>
                    <span style="text-align: center;">U</span>
                    <span style="text-align: center;">N</span>
                    <span style="text-align: center;">Tore</span>
                    <span style="text-align: center;">Diff</span>
                    <span style="text-align: right; color: var(--color-accent);">Pkt</span>
                </div>

                <!-- Teams List -->
                ${teams.map((t, i) => {
                    const diff = (t.gf || 0) - (t.ga || 0);
                    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                    return `
                        <div class="has-league-table-accordion" style="border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); overflow: hidden; cursor: pointer; transition: all 0.2s;">
                            <!-- Desktop Row View -->
                            <div class="hide-mobile" style="display: grid; grid-template-columns: 36px 1fr 45px 40px 40px 40px 65px 50px 55px; align-items: center; padding: 12px 14px; font-size: 0.9rem;">
                                <span style="text-align: center; font-weight: 800; font-size: 1rem; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${i + 1}</span>
                                <div style="font-weight: 700; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px; min-width: 0;">
                                    ${renderTeamLogo(t.name, 'sm')}
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.name}</span>
                                </div>
                                <span style="text-align: center; color: var(--color-text-secondary);">${t.played ?? 0}</span>
                                <span style="text-align: center; color: var(--color-text-secondary);">${t.won ?? 0}</span>
                                <span style="text-align: center; color: var(--color-text-secondary);">${t.drawn ?? 0}</span>
                                <span style="text-align: center; color: var(--color-text-secondary);">${t.lost ?? 0}</span>
                                <span style="text-align: center; color: var(--color-text-secondary);">${t.gf ?? 0}:${t.ga ?? 0}</span>
                                <span style="text-align: center; color: var(--color-text-secondary);">${diffStr}</span>
                                <span style="text-align: right; font-weight: 900; color: var(--color-accent); font-size: 1.1rem;">${t.points ?? 0}</span>
                            </div>

                            <!-- Mobile Touch Card View -->
                            <div class="show-mobile" style="padding: 12px 14px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                                        <span style="font-weight: 900; font-size: 1.05rem; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; min-width: 20px;">${i + 1}</span>
                                        ${renderTeamLogo(t.name, 'sm')}
                                        <span style="font-weight: 700; font-size: 0.95rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                        <span style="font-weight: 800; font-size: 0.92rem; color: var(--color-accent); background: rgba(0,179,65,0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(0,179,65,0.2); white-space: nowrap;">${t.points ?? 0} Pkt</span>
                                        <svg class="league-accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); transition: transform 0.25s ease; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>

                                <!-- Accordion Body on Mobile (6 Stat Badges Grid) -->
                                <div class="league-table-accordion-body" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--color-border); width: 100%;">
                                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center; width: 100%;">
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Spiele</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${t.played ?? 0}</div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Siege</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${t.won ?? 0}</div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Unent.</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${t.drawn ?? 0}</div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Nied.</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${t.lost ?? 0}</div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Tore</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${t.gf ?? 0}:${t.ga ?? 0}</div>
                                        </div>
                                        <div style="background: rgba(0,0,0,0.03); padding: 6px 2px; border-radius: 6px;">
                                            <div style="font-size: 0.62rem; text-transform: uppercase; color: var(--color-text-secondary); font-weight: 700;">Diff</div>
                                            <div style="font-weight: 800; color: var(--color-text-primary); font-size: 0.92rem; margin-top: 2px;">${diffStr}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Bind table accordion toggles on mobile
        container.querySelectorAll('.has-league-table-accordion').forEach(card => {
            card.onclick = () => {
                const body = card.querySelector('.league-table-accordion-body');
                const chevron = card.querySelector('.league-accordion-chevron');
                if (body) {
                    const isVisible = body.style.display === 'block';
                    if (isVisible) {
                        body.style.display = 'none';
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    } else {
                        body.style.display = 'block';
                        if (chevron) chevron.style.transform = 'rotate(180deg)';
                        if (window.anime) {
                            anime({
                                targets: body,
                                opacity: [0, 1],
                                translateY: [-6, 0],
                                duration: 250,
                                easing: 'easeOutCubic'
                            });
                        }
                    }
                }
            };
        });

    } else if (currentModalTab === 'matches') {
        const matches = seasonData.schedule || seasonData.matches || [];
        if (matches.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Spielberichte vorhanden.</p>';
            return;
        }

        // Group matches by round
        const roundsMap = {};
        matches.forEach(m => {
            let r = m.round || '1. Runde';
            if (typeof r === 'number') r = `${r}. Runde`;
            if (!roundsMap[r]) roundsMap[r] = [];
            roundsMap[r].push(m);
        });

        const roundKeys = Object.keys(roundsMap).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

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

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 24px;">
                ${roundKeys.map(rKey => `
                    <div>
                        <h4 style="color: var(--color-accent); font-size: 1.05rem; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid rgba(0,179,65,0.2); padding-bottom: 6px;">${rKey}</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${roundsMap[rKey].map(m => {
                                const isAbgesagtStatus = m.status === 'Abgesagt 3:0' || m.status === 'Abgesagt 0:3';
                                const isAbgesagt = isAbgesagtStatus || (m.score && m.score.includes('Abgesagt')) || (m.status || '').toLowerCase().includes('abgesagt');
                                const isUpcoming = m.status === 'Upcoming';
                                const hasEvents = (m.events && m.events.length > 0) || (m.scorers && m.scorers.length > 0) || (m.cards && m.cards.length > 0);

                                let displayScore = m.score || "-:-";
                                if (m.status === 'Abgesagt 3:0') displayScore = "Abges. 3:0";
                                else if (m.status === 'Abgesagt 0:3') displayScore = "Abges. 0:3";
                                else if (m.status === 'Postponed' || (m.status || '').toLowerCase().includes('verschoben')) displayScore = "Verschoben";

                                if (displayScore && displayScore !== "- : -" && displayScore !== "-:-" && !displayScore.startsWith("Abges.") && displayScore !== "Verschoben") {
                                  displayScore = displayScore.replace(/\s*\([^)]*\)/g, '').trim();
                                }

                                const htScore = (m.ht && m.ht !== ':') ? m.ht : (m.halftime && m.halftime !== ':' ? m.halftime : (m.score ? (m.score.match(/\(([^)]+)\)/)?.[1] || '') : ''));

                                let scoreBadgeClass = 'score-normal';
                                if (isAbgesagtStatus || isAbgesagt) {
                                  scoreBadgeClass = 'score-abgesagt';
                                } else if (isUpcoming || displayScore === '- : -' || displayScore === '-:-') {
                                  scoreBadgeClass = 'score-upcoming';
                                }

                                const dateParts = m.date ? m.date.split('.') : [];
                                let weekdayStr = '';
                                if (dateParts.length === 3) {
                                  let year = parseInt(dateParts[2]); if (year < 100) year += 2000; const d = new Date(year, dateParts[1] - 1, dateParts[0]);
                                  const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
                                  if (!isNaN(d.getDay())) {
                                    weekdayStr = `<span style="font-weight: 700; margin-right: 4px;">${days[d.getDay()]}</span>`;
                                  }
                                }

                                const homeName = m.home || m.homeTeam || 'Heim';
                                const awayName = m.away || m.awayTeam || 'Gast';

                                const norm = (s) => (s || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').replace(/\s+/g, '').trim();
                                const homeNorm = norm(homeName);
                                const awayNorm = norm(awayName);

                                let combinedEvents = (m.events && m.events.length > 0) ? [...m.events] : [];
                                if (combinedEvents.length === 0) {
                                  (m.scorers || []).forEach(s => combinedEvents.push({ type: 'goal', player: s.name || s.player, team: s.team, count: s.count || 1 }));
                                  (m.cards || []).forEach(c => combinedEvents.push({ type: c.type || 'yellow', player: c.name || c.player, team: c.team, count: 1 }));
                                }

                                const isHomeEvent = (e) => {
                                  const t = String(e.team || '');
                                  return t === String(homeName) || (homeNorm && norm(t) === homeNorm);
                                };
                                const isAwayEvent = (e) => {
                                  const t = String(e.team || '');
                                  return t === String(awayName) || (awayNorm && norm(t) === awayNorm);
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

                                const homeGrouped = groupEvents(combinedEvents.filter(isHomeEvent));
                                const awayGrouped = groupEvents(combinedEvents.filter(isAwayEvent));

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

                                const homeReds = countReds(combinedEvents.filter(isHomeEvent));
                                const awayReds = countReds(combinedEvents.filter(isAwayEvent));

                                const venueLocation = m.venue || m.location;

                                return `
                                    <div class="match-card glass-card ${hasEvents ? 'has-events-accordion' : ''}" style="border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); margin-bottom: 0; cursor: ${hasEvents ? 'pointer' : 'default'};">
                                        <div class="match-card-meta">
                                            <div class="match-meta-left">
                                                <span class="match-meta-item">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    ${weekdayStr}${m.date || ''}${m.time ? ' • ' + m.time + ' Uhr' : ''}
                                                </span>
                                                ${venueLocation ? `
                                                    <span class="match-meta-item hide-mobile">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        ${venueLocation}
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div class="match-meta-right">
                                                ${venueLocation ? `
                                                    <span class="match-meta-item show-mobile" style="opacity: 0.85;">
                                                        ${venueLocation}
                                                    </span>
                                                ` : ''}
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
                                                <span class="team-name">${homeName}</span>
                                                ${renderTeamReds(homeReds)}
                                            </div>
                                            
                                            <div class="match-score-center">
                                                <span class="match-score-badge ${scoreBadgeClass}">
                                                    ${displayScore}
                                                </span>
                                                ${(htScore && !isAbgesagtStatus) ? `<span class="match-ht-badge">HT ${htScore}</span>` : ''}
                                            </div>
                                            
                                            <div class="match-team match-team-away">
                                                ${renderTeamReds(awayReds)}
                                                <span class="team-name">${awayName}</span>
                                            </div>
                                        </div>

                                        ${hasEvents ? `
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
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Bind match accordion toggles
        container.querySelectorAll('.has-events-accordion').forEach(card => {
            card.onclick = () => {
                const accordion = card.querySelector('.events-accordion');
                if (!accordion) return;
                const isHidden = accordion.style.display === 'none' || !accordion.style.display;
                if (isHidden) {
                    accordion.style.display = 'block';
                    card.classList.add('accordion-open');
                    if (window.anime) {
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
            };
        });

    } else if (currentModalTab === 'cards') {
        const cardsList = seasonData.stats?.cards || seasonData.cards || [];
        if (cardsList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Karteneinträge für diese Saison vorhanden.</p>';
            return;
        }

        const sortedCards = [...cardsList].sort((a, b) => {
            const ptsB = (b.red || 0) * 4 + (b.yellowRed || 0) * 2 + (b.yellow || 0);
            const ptsA = (a.red || 0) * 4 + (a.yellowRed || 0) * 2 + (a.yellow || 0);
            if (ptsB !== ptsA) return ptsB - ptsA;
            if ((b.red || 0) !== (a.red || 0)) return (b.red || 0) - (a.red || 0);
            if ((b.yellowRed || 0) !== (a.yellowRed || 0)) return (b.yellowRed || 0) - (a.yellowRed || 0);
            return (b.yellow || 0) - (a.yellow || 0);
        });

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                ${sortedCards.map((c, i) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                            <span style="font-weight: 700; color: var(--color-text-secondary); min-width: 20px; font-size: 0.9rem;">${i + 1}</span>
                            <div style="display: flex; flex-direction: column;">
                                <strong style="color: var(--color-text-primary); font-size: 0.92rem;">${c.name || c.player || ''}</strong>
                                <span style="color: var(--color-text-secondary); font-size: 0.78rem;">${c.team || '-'}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                            <div style="display: flex; align-items: center; gap: 4px;" title="Gelbe Karten">
                                <span style="display:inline-block;width:9px;height:13px;background:#f1c40f;border-radius:2px;"></span>
                                <span style="font-weight: 700; font-size: 0.9rem;">${c.yellow || 0}</span>
                            </div>
                            ${(c.yellowRed || 0) > 0 ? `
                            <div style="display: flex; align-items: center; gap: 4px;" title="Gelb-Rote Karten">
                                <span style="display:inline-block;width:9px;height:13px;background:linear-gradient(135deg, #f1c40f 50%, #e74c3c 50%);border-radius:2px;"></span>
                                <span style="font-weight: 700; font-size: 0.9rem; color: #e67e22;">${c.yellowRed}</span>
                            </div>
                            ` : ''}
                            <div style="display: flex; align-items: center; gap: 4px;" title="Rote Karten">
                                <span style="display:inline-block;width:9px;height:13px;background:#e74c3c;border-radius:2px;"></span>
                                <span style="font-weight: 700; font-size: 0.9rem; color: #e74c3c;">${c.red || 0}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (currentModalTab === 'scorers') {
        const scorersList = seasonData.stats?.topScorers || seasonData.topScorers || seasonData.scorers || [];
        if (scorersList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Torschützen für diese Saison vorhanden.</p>';
            return;
        }

        const sortedScorers = [...scorersList].sort((a, b) => (b.goals || 0) - (a.goals || 0));

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                ${sortedScorers.map((s, i) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                            <span style="font-weight: 700; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; min-width: 20px; font-size: 0.9rem;">${i + 1}</span>
                            <div style="display: flex; flex-direction: column;">
                                <strong style="color: var(--color-text-primary); font-size: 0.92rem;">${s.player || s.name || ''}</strong>
                                <span style="color: var(--color-text-secondary); font-size: 0.78rem;">${s.team || '-'}</span>
                            </div>
                        </div>
                        <span style="font-weight: 900; font-size: 1.05rem; color: var(--color-accent); flex-shrink: 0;">${s.goals || 0} Tore</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

let assignedTeamNames = new Set();
let cachedEligibleTeams = [];

const renderLeagueTeamsCheckboxes = (filterText = '') => {
    const container = document.getElementById('league-teams-checkbox-container');
    if (!container) return;
    const q = (filterText || '').toLowerCase().trim();
    const visibleTeams = cachedEligibleTeams.filter(t => {
        const name = (t.Name || t.name || '').toLowerCase();
        return !q || name.includes(q);
    });

    if (visibleTeams.length === 0) {
        container.innerHTML = '<span style="color: var(--color-text-secondary); font-size: 0.85rem; padding: 4px;">Keine passenden Teams gefunden.</span>';
        return;
    }

    container.innerHTML = visibleTeams.map(t => {
        const teamName = (t.Name || t.name || '').trim();
        const isChecked = assignedTeamNames.has(teamName.toLowerCase());
        const isActive = (t.Status === 'Aktiv' || t.status === 'Aktiv');
        const badgeColor = isActive ? '#27ae60' : '#888888';
        const badgeBg = isActive ? 'rgba(39, 174, 96, 0.12)' : 'rgba(136, 136, 136, 0.12)';
        const badgeText = isActive ? 'Aktiv' : 'Inaktiv';
        return `
            <label style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 0.88rem; cursor: pointer; padding: 3px 6px; border-radius: 4px;">
                <div style="display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden;">
                    <input type="checkbox" class="league-team-cb" value="${teamName}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0;">
                    <span class="league-team-label" style="color: var(--color-text-primary); font-weight: ${isChecked ? '600' : '400'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${teamName}</span>
                </div>
                <span style="font-size: 0.72rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; flex-shrink: 0;">${badgeText}</span>
            </label>
        `;
    }).join('');

    container.querySelectorAll('.league-team-cb').forEach(cb => {
        cb.onchange = (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (e.target.checked) assignedTeamNames.add(val);
            else assignedTeamNames.delete(val);
            const labelSpan = e.target.parentElement.querySelector('.league-team-label');
            if (labelSpan) labelSpan.style.fontWeight = e.target.checked ? '600' : '400';
        };
    });
};

const openEditModal = async (idx = null) => {
    ensureModalsInBody();
    const modal = document.getElementById('league-modal');
    const title = document.getElementById('modal-league-title');
    const nameLabel = document.getElementById('lbl-league-name');
    const submitBtn = document.getElementById('btn-submit-league');
    const deleteBtn = document.getElementById('btn-delete-league');
    
    assignedTeamNames.clear();

    const allTeams = await Store.getAdminTeams();
    const teamsMap = new Map();

    // 1. Ingest all master teams from teams.json
    (allTeams || []).forEach(t => {
        const name = (t.Name || t.name || '').trim();
        if (name) {
            teamsMap.set(name.toLowerCase(), {
                Name: name,
                Status: t.Status || t.status || 'Inaktiv',
                ID: t.ID || t.id || ''
            });
        }
    });

    const storeData = Store.getData();

    if (idx !== null && leaguesData[idx]) {
        const l = leaguesData[idx];
        title.innerText = 'Liga bearbeiten';
        if (nameLabel) nameLabel.innerText = 'Liga';
        if (submitBtn) submitBtn.innerText = 'Bestätigen';
        document.getElementById('edit-league-id').value = idx;
        document.getElementById('edit-league-name').value = l.name || '';
        document.getElementById('edit-league-year').value = formatLeagueYear(l.year) !== '-' ? formatLeagueYear(l.year) : '';
        document.getElementById('edit-league-status').value = l.status === 'Aktiv' ? 'Aktiv' : 'Inaktiv';
        document.getElementById('edit-league-show-homepage').checked = (l.showOnHomepage !== false);
        deleteBtn.style.display = 'block';

        const sKey = getSeasonKey(l);
        const season = storeData.seasons ? (storeData.seasons[sKey] || storeData.seasons[l.seasonKey] || storeData.seasons[l.year] || storeData.seasons[l.name]) : null;
        
        // 2. Add all teams participating in this season to map if not present, and mark as assigned
        if (season) {
            if (season.teams && Array.isArray(season.teams) && season.teams.length > 0) {
                season.teams.forEach(t => {
                    const tName = (t && t.name ? t.name : (typeof t === 'string' ? t : '')).trim();
                    if (tName) {
                        const key = tName.toLowerCase();
                        if (!teamsMap.has(key)) {
                            teamsMap.set(key, { Name: tName, Status: 'Inaktiv', ID: '' });
                        }
                        assignedTeamNames.add(key);
                    }
                });
            }
            if (season.matches && Array.isArray(season.matches)) {
                season.matches.forEach(m => {
                    ['homeTeam', 'awayTeam', 'home', 'away'].forEach(prop => {
                        const mTeam = (m[prop] || '').trim();
                        if (mTeam) {
                            const key = mTeam.toLowerCase();
                            if (!teamsMap.has(key)) {
                                teamsMap.set(key, { Name: mTeam, Status: 'Inaktiv', ID: '' });
                            }
                            if (assignedTeamNames.size === 0) {
                                assignedTeamNames.add(key);
                            }
                        }
                    });
                });
            }
        }

        // Fallback if no teams found in season
        if (assignedTeamNames.size === 0) {
            (allTeams || []).filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv').forEach(t => {
                const name = (t.Name || t.name || '').trim();
                if (name) assignedTeamNames.add(name.toLowerCase());
            });
        }
    } else {
        title.innerText = 'Liga hinzufügen';
        if (nameLabel) nameLabel.innerText = 'Name';
        if (submitBtn) submitBtn.innerText = 'Erstellen';
        document.getElementById('edit-league-id').value = 'new';
        document.getElementById('league-edit-form').reset();
        document.getElementById('edit-league-status').value = 'Aktiv';
        document.getElementById('edit-league-show-homepage').checked = true;
        deleteBtn.style.display = 'none';

        // Pre-check active teams for new leagues
        (allTeams || []).filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv').forEach(t => {
            const name = (t.Name || t.name || '').trim();
            if (name) assignedTeamNames.add(name.toLowerCase());
        });
    }

    cachedEligibleTeams = Array.from(teamsMap.values());
    // Sort: Active teams first, then alphabetically
    cachedEligibleTeams.sort((a, b) => {
        const isActA = (a.Status === 'Aktiv' || a.status === 'Aktiv') ? 1 : 0;
        const isActB = (b.Status === 'Aktiv' || b.status === 'Aktiv') ? 1 : 0;
        if (isActA !== isActB) return isActB - isActA;
        return (a.Name || '').localeCompare(b.Name || '');
    });

    renderLeagueTeamsCheckboxes('');
    const teamSearch = document.getElementById('league-team-search');
    if (teamSearch) teamSearch.value = '';

    const teamsSection = document.getElementById('league-teams-section');
    if (teamsSection) {
        teamsSection.style.display = (document.getElementById('edit-league-status').value === 'Inaktiv') ? 'none' : 'block';
    }

    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeEditModal = () => {
    document.querySelectorAll('#league-modal').forEach(m => {
        m.style.display = 'none';
    });
};

const closeLeagueDataModal = () => {
    document.querySelectorAll('#league-data-modal').forEach(m => {
        m.style.display = 'none';
    });
    selectedLeague = null;
};

const applyFilters = () => {
    const searchInput = document.getElementById('league-search');
    const statusSelect = document.getElementById('league-status-filter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = leaguesData.filter(l => {
        const matchesSearch = !query ||
            (l.name && l.name.toLowerCase().includes(query)) ||
            (l.year && l.year.toString().includes(query)) ||
            (l.id && l.id.toString().includes(query));
        
        const currentStatus = (l.status === 'Nein' || l.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        const matchesStatus = status === 'all' || currentStatus === status;
        
        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    sortData(currentSort.column, currentSort.asc);
};

const sortData = (column, asc) => {
    currentSort = { column, asc };
    filteredData.sort((a, b) => {
        if (column === 'status') {
            const priority = { 'Aktiv': 1, 'Inaktiv': 2 };
            const pA = priority[a.status] || 99;
            const pB = priority[b.status] || 99;
            if (pA !== pB) return asc ? pA - pB : pB - pA;
            return (b.year || 0) - (a.year || 0);
        }

        if (column === 'showOnHomepage') {
            const visA = (a.showOnHomepage !== false) ? 1 : 0;
            const visB = (b.showOnHomepage !== false) ? 1 : 0;
            return asc ? visA - visB : visB - visA;
        }

        if (column === 'id' || column === 'year') {
            const numA = parseInt(a[column]) || 0;
            const numB = parseInt(b[column]) || 0;
            return asc ? numA - numB : numB - numA;
        }

        const valA = (a[column] || '').toString().toLowerCase();
        const valB = (b[column] || '').toString().toLowerCase();
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
    });
    renderTable();
};

const bindEvents = () => {
    const search = document.getElementById('league-search');
    const status = document.getElementById('league-status-filter');
    const sortSelect = document.getElementById('league-sort-select');
    const prevBtn = document.getElementById('btn-prev-page-l');
    const nextBtn = document.getElementById('btn-next-page-l');
    const addBtn = document.getElementById('btn-add-league');
    const closeBtn = document.getElementById('btn-close-league-modal');
    const deleteBtn = document.getElementById('btn-delete-league');
    const form = document.getElementById('league-edit-form');
    const leagueModal = document.getElementById('league-modal');

    if (sortSelect) {
        sortSelect.onchange = () => {
            const val = sortSelect.value;
            if (val === 'id-desc') sortData('id', false);
            else if (val === 'id-asc') sortData('id', true);
            else if (val === 'name') sortData('name', true);
            else if (val === 'year-desc') sortData('year', false);
            else if (val === 'status') sortData('status', true);
        };
    }

    if (leagueModal) {
        leagueModal.onclick = (e) => {
            if (e.target === leagueModal) closeEditModal();
        };
    }
    
    // Data modal close & tabs
    const closeDataModalBtn = document.getElementById('btn-close-data-modal');
    if (closeDataModalBtn) closeDataModalBtn.onclick = closeLeagueDataModal;

    const dataModal = document.getElementById('league-data-modal');
    if (dataModal) {
        dataModal.onclick = (e) => {
            if (e.target === dataModal) closeLeagueDataModal();
        };
    }

    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const tab = e.currentTarget.getAttribute('data-modal-tab');
            currentModalTab = tab;
            updateModalTabsUI();
            renderModalContent();
        };
    });

    if (search) search.oninput = applyFilters;
    if (status) status.onchange = applyFilters;

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentPage++; renderTable();
        };
    }

    const selectAllBtn = document.getElementById('btn-select-all-league-teams');
    if (selectAllBtn) {
        selectAllBtn.onclick = () => {
            cachedEligibleTeams.forEach(t => assignedTeamNames.add((t.Name || t.name).trim().toLowerCase()));
            renderLeagueTeamsCheckboxes(document.getElementById('league-team-search')?.value || '');
        };
    }

    const deselectAllBtn = document.getElementById('btn-deselect-all-league-teams');
    if (deselectAllBtn) {
        deselectAllBtn.onclick = () => {
            assignedTeamNames.clear();
            renderLeagueTeamsCheckboxes(document.getElementById('league-team-search')?.value || '');
        };
    }

    const leagueTeamSearch = document.getElementById('league-team-search');
    if (leagueTeamSearch) {
        leagueTeamSearch.oninput = (e) => {
            renderLeagueTeamsCheckboxes(e.target.value);
        };
    }

    const editStatusSelect = document.getElementById('edit-league-status');
    if (editStatusSelect) {
        editStatusSelect.onchange = () => {
            const teamsSection = document.getElementById('league-teams-section');
            if (teamsSection) {
                teamsSection.style.display = editStatusSelect.value === 'Inaktiv' ? 'none' : 'block';
            }
        };
    }

    if (addBtn) addBtn.onclick = () => openEditModal(null);
    if (closeBtn) closeBtn.onclick = closeEditModal;

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const idVal = document.getElementById('edit-league-id').value;
            if (idVal !== 'new') {
                const idx = parseInt(idVal);
                const l = leaguesData[idx];
                if (confirm(`Möchten Sie die Liga "${l.name} (${l.year})" wirklich löschen?`)) {
                    const deletedLeague = leaguesData.splice(idx, 1)[0];
                    Store.saveAdminLeagues(leaguesData);
                    Store.deleteLeagueSeason(deletedLeague);
                    closeEditModal();
                    applyFilters();
                    showToast('Liga gelöscht.');
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-league-id').value;
            const nameInput = document.getElementById('edit-league-name');
            const yearInput = document.getElementById('edit-league-year');
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const yearRaw = yearInput ? yearInput.value.trim() : '';

            if (!nameVal) {
                showToast('Bitte geben Sie einen Namen für die Liga ein!', true);
                if (nameInput) nameInput.focus();
                return;
            }
            if (!yearRaw) {
                showToast('Bitte geben Sie ein gültiges Jahr oder eine Saison ein (z.B. 2022/2023 oder 2022)!', true);
                if (yearInput) yearInput.focus();
                return;
            }

            let normalizedYear = yearRaw;
            if (/^\d{4}$/.test(normalizedYear)) {
                const yr = parseInt(normalizedYear);
                if (yr < 1900 || yr > 2100) {
                    showToast('Bitte geben Sie ein gültiges Jahr ein (z.B. 2026)!', true);
                    if (yearInput) yearInput.focus();
                    return;
                }
                normalizedYear = `${yr}/${yr + 1}`;
            } else if (/^\d{4}\/\d{4}$/.test(normalizedYear)) {
                const [y1, y2] = normalizedYear.split('/').map(Number);
                if (y1 < 1900 || y1 > 2100 || isNaN(y1) || isNaN(y2)) {
                    showToast('Bitte geben Sie eine gültige Saison ein (z.B. 2022/2023)!', true);
                    if (yearInput) yearInput.focus();
                    return;
                }
            } else {
                showToast('Bitte geben Sie ein gültiges Format ein (z.B. 2022/2023 oder 2022)!', true);
                if (yearInput) yearInput.focus();
                return;
            }

            const existingLeague = (idVal !== 'new' && leaguesData[parseInt(idVal)]) ? leaguesData[parseInt(idVal)] : null;
            const updatedLeague = {
                name: nameVal,
                year: normalizedYear,
                status: document.getElementById('edit-league-status').value,
                showOnHomepage: document.getElementById('edit-league-show-homepage').checked,
                seasonKey: existingLeague?.seasonKey || undefined
            };

            const sKey = getSeasonKey(updatedLeague);
            updatedLeague.seasonKey = sKey;

            const isNew = (idVal === 'new');
            if (isNew) {
                const validIds = leaguesData
                    .map(l => parseInt(l.id) || 0)
                    .filter(n => n > 0 && n < 100000);
                const maxId = validIds.length > 0 ? Math.max(...validIds) : 14;
                updatedLeague.id = maxId + 1;
                leaguesData.unshift(updatedLeague);
            } else {
                const idx = parseInt(idVal);
                leaguesData[idx] = { ...leaguesData[idx], ...updatedLeague };
            }

            if (updatedLeague.status === 'Aktiv') {
                const selectedTeamNames = cachedEligibleTeams
                    .map(t => (t.Name || t.name || '').trim())
                    .filter(name => name && assignedTeamNames.has(name.toLowerCase()));
                if (selectedTeamNames.length === 0) {
                    showToast('Bitte wählen Sie mindestens ein teilnehmendes Team aus!', true);
                    return;
                }
                Store.setLeagueSeasonTeams(sKey, selectedTeamNames);
            }

            Store.saveAdminLeagues(leaguesData);
            Store.ensureLeagueSeason(updatedLeague);

            closeEditModal();
            applyFilters();
            showToast(isNew ? 'Liga erfolgreich erstellt!' : 'Liga erfolgreich aktualisiert!');
        };
    }

    document.querySelectorAll('#admin-leagues .sortable').forEach(th => {
        th.onclick = (e) => {
            const col = e.target.getAttribute('data-sort');
            if (currentSort.column === col) {
                sortData(col, !currentSort.asc);
            } else {
                sortData(col, true);
            }
        };
    });
};
