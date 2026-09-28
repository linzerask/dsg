import { Store } from '../store.js?v=1790560000100';

let roundsData = [];
let leaguesData = [];
let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'id', asc: false };

let editingRoundId = null;
let preselectedRoundForMatch = null;

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
        <div id="round-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="round-modal-title" style="margin: 0; font-size: 1.3rem;">Runde bearbeiten</h3>
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

        <!-- Modal 2: Spiel hinzufügen -->
        <div id="add-game-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 style="margin: 0; font-size: 1.3rem;">Spiel hinzufügen</h3>
                    <button type="button" class="btn-close-game-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>
                
                <form id="game-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Datum & Uhrzeit</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                            <input type="date" id="modal-game-date" class="admin-input" required>
                            <input type="time" id="modal-game-time" class="admin-input" value="18:00" required>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Ort</label>
                        <input type="text" id="modal-game-location" class="admin-input" value="DSG-Platz" placeholder="z.B. Sportplatz Traun, DSG-Platz" style="width: 100%;" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Runde</label>
                        <select id="modal-game-round" class="admin-input" style="width: 100%;" required>
                            <!-- Populated with active rounds -->
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Heimmannschaft</label>
                            <select id="modal-game-home" class="admin-input" style="width: 100%;" required>
                                <option value="">-- Team wählen --</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Auswärtsmannschaft</label>
                            <select id="modal-game-away" class="admin-input" style="width: 100%;" required>
                                <option value="">-- Team wählen --</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Sonstiges</label>
                        <input type="text" id="modal-game-note" class="admin-input" placeholder="Sonstiges (optional)..." style="width: 100%;">
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="submit" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Erstellen</button>
                    </div>
                </form>
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

    const activeLeagues = leaguesData.filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
    const isLeagueActive = (r) => {
        if (!r.liga && !r.seasonKey) return false;
        return activeLeagues.some(l => 
            (l.seasonKey && l.seasonKey === r.seasonKey) || 
            (l.name && r.liga && r.liga.toLowerCase().includes(l.name.toLowerCase())) ||
            (r.seasonKey === '2026/2027')
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

    // Check which leagues are active
    const activeLeagues = leaguesData.filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
    const isLeagueActive = (r) => {
        if (!r.liga && !r.seasonKey) return false;
        return activeLeagues.some(l => 
            (l.seasonKey && l.seasonKey === r.seasonKey) || 
            (l.name && r.liga && r.liga.toLowerCase().includes(l.name.toLowerCase())) ||
            (r.seasonKey === '2026/2027')
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
                        <button class="btn-add-game-to-round" data-idx="${rawIndex}" ${!isActive ? 'disabled style="opacity: 0.5; cursor: not-allowed; background: #6c757d; color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"' : 'style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;"'}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Spiel anlegen
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
                                <button class="btn-add-game-to-round full-width" data-idx="${rawIndex}" ${!isActive ? 'disabled style="opacity: 0.5; cursor: not-allowed; background: #6c757d; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"' : 'style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;"'}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Spiel anlegen
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

        container.querySelectorAll('.btn-add-game-to-round').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                const round = roundsData[idx];
                if (round) {
                    openAddGameModal(round);
                }
            };
        });
    }
};

const populateLeaguesDropdowns = () => {
    const filterSelect = document.getElementById('round-league-filter');
    const modalSelect = document.getElementById('modal-round-liga');

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
    const roundModal = document.getElementById('round-modal');
    if (roundModal && roundModal.parentElement !== document.body) {
        document.body.appendChild(roundModal);
    }
    const addGameModal = document.getElementById('add-game-modal');
    if (addGameModal && addGameModal.parentElement !== document.body) {
        document.body.appendChild(addGameModal);
    }
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
};

const closeRoundModal = () => {
    const modal = document.getElementById('round-modal');
    if (modal) modal.style.display = 'none';
    editingRoundId = null;
};

const openAddGameModal = (round = null) => {
    ensureModalsInBody();
    const modal = document.getElementById('add-game-modal');
    if (!modal) return;

    preselectedRoundForMatch = round;

    // Filter only ACTIVE teams as explicitly requested
    const activeTeams = teamsData.filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv');

    const homeSelect = document.getElementById('modal-game-home');
    const awaySelect = document.getElementById('modal-game-away');
    const roundSelect = document.getElementById('modal-game-round');

    const teamOptions = '<option value="">-- Team wählen --</option>' + 
        activeTeams.map(t => `<option value="${t.Name || t.name}">${t.Name || t.name}</option>`).join('');

    if (homeSelect) homeSelect.innerHTML = teamOptions;
    if (awaySelect) awaySelect.innerHTML = teamOptions;

    // Populate active rounds
    const activeRounds = roundsData.filter(r => r.seasonKey === '2026/2027' || (r.liga && r.liga.includes('26/27')));
    if (roundSelect) {
        roundSelect.innerHTML = activeRounds.map(r => `
            <option value="${r.runde}. Runde" ${round && round.runde === r.runde ? 'selected' : ''}>
                ${r.liga || 'Liga 26/27 2026'} ${r.saison || 'Herbst'} Runde ${r.runde}
            </option>
        `).join('');
    }

    // Prefill date with round's datumVon
    if (round && round.datumVon) {
        document.getElementById('modal-game-date').value = round.datumVon;
    } else {
        document.getElementById('modal-game-date').value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('modal-game-time').value = '18:00';
    document.getElementById('modal-game-location').value = 'DSG-Platz';
    document.getElementById('modal-game-note').value = '';

    modal.style.display = 'flex';
};

const closeAddGameModal = () => {
    const modal = document.getElementById('add-game-modal');
    if (modal) modal.style.display = 'none';
    preselectedRoundForMatch = null;
};

const deleteRound = (idx) => {
    const r = roundsData[idx];
    if (!r) return;

    if (confirm(`Möchten Sie die Runde "${r.saison} ${r.jahr} - Runde ${r.runde}" wirklich löschen?`)) {
        roundsData.splice(idx, 1);
        Store.saveAdminRounds(roundsData);
        renderTable();
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

    if (isEventsBound) return;
    isEventsBound = true;

    // Event listeners
    const addRoundBtn = document.getElementById('btn-add-round');
    if (addRoundBtn) addRoundBtn.onclick = () => openEditRoundModal(null);

    document.querySelectorAll('.btn-close-round-modal').forEach(btn => {
        btn.onclick = closeRoundModal;
    });

    document.querySelectorAll('.btn-close-game-modal').forEach(btn => {
        btn.onclick = closeAddGameModal;
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

    const addGameModal = document.getElementById('add-game-modal');
    if (addGameModal) {
        addGameModal.onclick = (e) => {
            if (e.target === addGameModal) closeAddGameModal();
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
            const liga = document.getElementById('modal-round-liga').value;

            const activeLeague = leaguesData.find(l => l.name === liga || l.name === (liga && liga.split(' ')[0]));
            const seasonKey = activeLeague ? (activeLeague.seasonKey || '2026/2027') : '2026/2027';

            if (editingRoundId !== null) {
                const index = roundsData.findIndex(r => r.id === editingRoundId);
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

            Store.saveAdminRounds(roundsData);
            closeRoundModal();
            renderTable();
        };
    }

    // Add Game Form Submit
    const gameForm = document.getElementById('game-form');
    if (gameForm) {
        gameForm.onsubmit = (e) => {
            e.preventDefault();

            const date = document.getElementById('modal-game-date').value;
            const time = document.getElementById('modal-game-time').value;
            const location = document.getElementById('modal-game-location').value;
            const round = document.getElementById('modal-game-round').value;
            const home = document.getElementById('modal-game-home').value;
            const away = document.getElementById('modal-game-away').value;
            const note = document.getElementById('modal-game-note').value;

            if (!home || !away) {
                alert('Bitte wählen Sie sowohl ein Heim- als auch ein Auswärtsteam aus.');
                return;
            }

            if (home === away) {
                alert('Heim- und Auswärtsteam dürfen nicht identisch sein.');
                return;
            }

            const newMatch = {
                id: `game_${Date.now()}`,
                round: round,
                date: date,
                time: time,
                location: location,
                home: home,
                away: away,
                score: "-:-",
                ht: "",
                status: "Upcoming",
                note: note || '',
                events: [],
                scorers: [],
                cards: []
            };

            const activeSeasonKey = '2026/2027';
            Store.saveMatch(activeSeasonKey, newMatch);

            alert(`Spiel erfolgreich angelegt:\n${home} vs. ${away} (${round})`);
            closeAddGameModal();
        };
    }
};
