import { Store } from '../store.js?v=1790560001200';
import { showToast } from './admin.js?v=1790560001200';

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
                <select id="round-sort-select" class="admin-input" style="width: 160px;">
                    <option value="runde-asc">Runde (1-14)</option>
                    <option value="runde-desc">Runde (14-1)</option>
                    <option value="jahr-desc">Jahr (neueste)</option>
                    <option value="date-asc">Datum von</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="saison" class="sortable">Saison ↕</th>
                        <th data-sort="jahr" class="sortable">Jahr ↕</th>
                        <th data-sort="runde" class="sortable">Runde ↕</th>
                        <th data-sort="datumVon" class="sortable">Datum von ↕</th>
                        <th data-sort="datumBis" class="sortable">Datum bis ↕</th>
                        <th data-sort="liga" class="sortable">Liga ↕</th>
                        <th style="min-width: 220px; text-align: center;">Action</th>
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
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Saison</label>
                        <select id="modal-round-saison" class="admin-input" style="width: 100%;" required>
                            <option value="Herbst">Herbst</option>
                            <option value="Frühjahr">Frühjahr</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Jahr</label>
                        <input type="number" id="modal-round-jahr" class="admin-input" value="2026" style="width: 100%;" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Runde</label>
                        <input type="number" id="modal-round-nr" class="admin-input" min="1" max="50" value="1" style="width: 100%;" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Datum von</label>
                            <input type="date" id="modal-round-date-from" class="admin-input" style="width: 100%;" required>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Datum bis</label>
                            <input type="date" id="modal-round-date-to" class="admin-input" style="width: 100%;" required>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Liga</label>
                        <select id="modal-round-liga" class="admin-input" style="width: 100%;" required>
                            <!-- Populated with active leagues -->
                        </select>
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="submit" id="btn-save-round" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Aktualisieren</button>
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

const filterAndSortData = () => {
    const searchVal = (document.getElementById('round-search')?.value || '').toLowerCase().trim();
    const leagueFilter = document.getElementById('round-league-filter')?.value || 'all';
    const statusFilter = document.getElementById('round-status-filter')?.value || 'all';
    const sortVal = document.getElementById('round-sort-select')?.value || 'runde-asc';

    const isLeagueActive = (r) => {
        if (!r) return false;
        if (r.seasonKey === '2026/2027') return true;
        if (r.liga && (r.liga.includes('26/27') || r.liga.includes('2026/2027'))) return true;
        const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
        return activeLeagues.some(l => 
            (l.seasonKey && l.seasonKey === r.seasonKey) || 
            (l.name && r.liga && r.liga.toLowerCase().includes(l.name.toLowerCase()))
        );
    };

    filteredData = roundsData.filter(r => {
        const matchesSearch = !searchVal || 
            (r.saison && r.saison.toLowerCase().includes(searchVal)) ||
            (r.liga && r.liga.toLowerCase().includes(searchVal)) ||
            String(r.runde).includes(searchVal) ||
            String(r.jahr).includes(searchVal);

        const matchesLeague = leagueFilter === 'all' || r.liga === leagueFilter || r.seasonKey === leagueFilter;

        let matchesStatus = true;
        const active = isLeagueActive(r);
        if (statusFilter === 'active') matchesStatus = active;
        else if (statusFilter === 'inactive') matchesStatus = !active;

        return matchesSearch && matchesLeague && matchesStatus;
    });

    // Handle sortVal
    if (sortVal === 'runde-asc') {
        currentSort = { column: 'runde', asc: true };
    } else if (sortVal === 'runde-desc') {
        currentSort = { column: 'runde', asc: false };
    } else if (sortVal === 'jahr-desc') {
        currentSort = { column: 'jahr', asc: false };
    } else if (sortVal === 'date-asc') {
        currentSort = { column: 'datumVon', asc: true };
    }

    // Sorting
    filteredData.sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

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
        if (r.seasonKey === '2026/2027') return true;
        if (r.liga && (r.liga.includes('26/27') || r.liga.includes('2026/2027'))) return true;
        const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
        return activeLeagues.some(l => 
            (l.seasonKey && l.seasonKey === r.seasonKey) || 
            (l.name && r.liga && r.liga.toLowerCase().includes(l.name.toLowerCase()))
        );
    };

    tbody.innerHTML = pageRows.map(r => {
        const rawIndex = roundsData.indexOf(r);
        const isActive = isLeagueActive(r);

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text-primary);">${r.saison || '-'}</td>
                <td>${r.jahr || '-'}</td>
                <td style="font-weight: 700; color: var(--color-accent);">${r.runde || '-'}</td>
                <td style="color: var(--color-text-secondary);">${r.datumVon || '-'}</td>
                <td style="color: var(--color-text-secondary);">${r.datumBis || '-'}</td>
                <td>
                    <span style="font-weight: 600;">${r.liga || '-'}</span>
                    ${isActive ? '<span class="badge badge-success" style="font-size: 0.7rem; margin-left: 6px;">Aktiv</span>' : '<span class="badge badge-secondary" style="font-size: 0.7rem; margin-left: 6px;">Inaktiv</span>'}
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        <button class="btn-edit-round" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Editieren
                        </button>
                        <button class="btn-delete-round" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Löschen
                        </button>
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
                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div>
                                <div class="admin-m-title">${r.runde || 'Runde'} <span style="font-weight: normal; color: var(--color-text-secondary); font-size: 0.9rem;">(${r.saison || ''} ${r.jahr || ''})</span></div>
                                <div class="admin-m-subtitle">
                                    <span style="font-weight: 600; color: var(--color-text-primary);">${r.liga || '-'}</span>
                                    ${isActive ? '<span class="badge badge-success" style="font-size: 0.7rem;">Aktiv</span>' : '<span class="badge badge-secondary" style="font-size: 0.7rem;">Inaktiv</span>'}
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
                                    <span class="admin-m-value">${r.datumVon || '-'}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Datum bis</span>
                                    <span class="admin-m-value">${r.datumBis || '-'}</span>
                                </div>
                            </div>
                            <div class="admin-m-actions">
                                <button class="btn-view-round-games full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    Spiele ansehen
                                </button>
                                <button class="btn-edit-round" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Editieren
                                </button>
                                <button class="btn-delete-round" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    Löschen
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

    // Bind row action buttons for both Desktop and Mobile views
    const container = document.getElementById('admin-rounds');
    if (container) {
        container.querySelectorAll('.btn-edit-round').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditRoundModal(idx);
            };
        });

        container.querySelectorAll('.btn-delete-round').forEach(btn => {
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
    }

    const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');

    if (filterSelect) {
        const uniqueLeagueNames = [...new Set(roundsData.map(r => r.liga).filter(Boolean))];
        filterSelect.innerHTML = '<option value="all">Alle Ligen</option>' + 
            uniqueLeagueNames.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    if (modalSelect) {
        // Only allow active leagues when creating/editing a round
        const leaguesToShow = activeLeagues.length > 0 ? activeLeagues : [{ name: 'Liga 26/27', year: 2026, seasonKey: '2026/2027' }];
        modalSelect.innerHTML = leaguesToShow.map(l => `
            <option value="${l.name || 'Liga 26/27 2026'}" data-season="${l.seasonKey || '2026/2027'}">
                ${l.name} (${l.year || '2026'})
            </option>
        `).join('');
    }
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

    if (idx !== null && roundsData[idx]) {
        editingRoundId = roundsData[idx].id || idx;
        const r = roundsData[idx];
        title.innerText = 'Runde bearbeiten';
        submitBtn.innerText = 'Aktualisieren';

        document.getElementById('modal-round-saison').value = r.saison || 'Herbst';
        document.getElementById('modal-round-jahr').value = r.jahr || 2026;
        document.getElementById('modal-round-nr').value = r.runde || 1;
        document.getElementById('modal-round-date-from').value = r.datumVon || '';
        document.getElementById('modal-round-date-to').value = r.datumBis || '';
        
        const ligaSelect = document.getElementById('modal-round-liga');
        if (ligaSelect) {
            // Ensure the round's current league is present in the dropdown even if inactive
            if (!Array.from(ligaSelect.options).some(o => o.value === r.liga)) {
                const opt = document.createElement('option');
                opt.value = r.liga;
                opt.text = r.liga;
                opt.selected = true;
                ligaSelect.appendChild(opt);
            } else {
                ligaSelect.value = r.liga;
            }
        }
    } else {
        editingRoundId = null;
        title.innerText = 'Runde anlegen';
        submitBtn.innerText = 'Erstellen';

        document.getElementById('modal-round-saison').value = 'Herbst';
        document.getElementById('modal-round-jahr').value = 2026;
        
        // Suggest next round number
        const maxRound = Math.max(0, ...roundsData.filter(r => r.seasonKey === '2026/2027').map(r => r.runde || 0));
        document.getElementById('modal-round-nr').value = maxRound + 1;
        document.getElementById('modal-round-date-from').value = new Date().toISOString().split('T')[0];
        document.getElementById('modal-round-date-to').value = new Date().toISOString().split('T')[0];
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
        const dateRange = (round.datumVon || round.datumBis) ? ` • ${round.datumVon || ''} bis ${round.datumBis || ''}` : '';
        subTitleEl.innerText = `${round.liga || 'DSG Liga'} (${round.saison || ''} ${round.jahr || ''})${dateRange}`;
    }

    const targetSeasonKey = round.seasonKey || '2026/2027';
    let allSeasonMatches = Store.getMatches(targetSeasonKey) || [];

    // Fallback: If no matches in targetSeasonKey, search across all seasons
    if (allSeasonMatches.length === 0) {
        const fullData = Store.getData();
        if (fullData && fullData.seasons) {
            for (let sKey in fullData.seasons) {
                if (fullData.seasons[sKey]?.matches) {
                    allSeasonMatches = allSeasonMatches.concat(fullData.seasons[sKey].matches);
                }
            }
        }
    }

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
        listContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                ${roundMatches.map(m => {
                    const isFinished = m.status === 'Beendet' || m.status === 'Played' || m.status === 'Gespielt';
                    let statusBadge = '<span class="badge badge-secondary" style="font-size: 0.72rem;">Ausstehend</span>';
                    if (isFinished) {
                        statusBadge = '<span class="badge badge-success" style="font-size: 0.72rem;">Beendet</span>';
                    } else if (m.status && m.status.includes('Abgesagt')) {
                        statusBadge = `<span class="badge badge-danger" style="font-size: 0.72rem; background: #dc3545; color: #fff;">${m.status}</span>`;
                    } else if (m.status && m.status.includes('Verschoben')) {
                        statusBadge = '<span class="badge badge-warning" style="font-size: 0.72rem; background: #ffc107; color: #000;">Verschoben</span>';
                    }

                    return `
                        <div class="glass-card" style="padding: 14px 18px; border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--color-text-secondary);">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>${m.date || '-'} • ${m.time || '-'}</span>
                                </div>
                                <div>${statusBadge}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 6px 0;">
                                <div style="flex: 1; text-align: right; font-weight: 700; font-size: 0.92rem; color: var(--color-text-primary); word-break: break-word;">${m.home || 'Heim'}</div>
                                <div style="text-align: center; font-weight: 800; font-size: 1.1rem; color: var(--color-accent); background: rgba(0,150,64,0.08); padding: 4px 12px; border-radius: 6px; min-width: 60px; flex-shrink: 0;">${m.score || '-:-'}</div>
                                <div style="flex: 1; text-align: left; font-weight: 700; font-size: 0.92rem; color: var(--color-text-primary); word-break: break-word;">${m.away || 'Gast'}</div>
                            </div>
                            ${m.location ? `
                                <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span>${m.location}</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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

    if (confirm(`Möchten Sie die Runde "${r.saison} ${r.jahr} - Runde ${r.runde}" wirklich löschen?`)) {
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

            const saison = document.getElementById('modal-round-saison').value;
            const jahr = parseInt(document.getElementById('modal-round-jahr').value) || 2026;
            const runde = parseInt(document.getElementById('modal-round-nr').value) || 1;
            const datumVon = document.getElementById('modal-round-date-from').value;
            const datumBis = document.getElementById('modal-round-date-to').value;
            const ligaSelect = document.getElementById('modal-round-liga');
            const liga = ligaSelect ? ligaSelect.value : '';
            const seasonKey = ligaSelect?.selectedOptions[0]?.getAttribute('data-season') || '2026/2027';

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
                // Check if this round already exists
                const existing = roundsData.find(r => r.runde === runde && r.seasonKey === seasonKey && r.saison === saison);
                if (existing) {
                    alert(`Runde ${runde} (${saison} ${jahr}) existiert bereits!`);
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
