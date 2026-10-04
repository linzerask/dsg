import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1791174000000';
import { showToast } from './admin.js?v=1791174000000';

let playersData = [];
let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'seit', asc: false };

export const renderAdminPlayers = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Spieler verwalten</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Übersicht und Verwaltung aller aktiven und archivierten Spieler</p>
        </div>

        <!-- Controls Toolbar immediately above table -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-player" style="background: var(--color-accent); color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Spieler anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="player-search" class="admin-input" placeholder="Suche..." style="width: 140px;">
                <select id="player-team-filter" class="admin-input" style="width: 150px;">
                    <option value="all">&lt;&lt; Alle Teams &gt;&gt;</option>
                </select>
                <select id="player-status-filter" class="admin-input" style="width: 120px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                    <option value="Archiviert">Archiviert</option>
                </select>
                <select id="player-sort-select" class="admin-input" style="width: 170px;">
                    <option value="date-desc" selected>Datum (neueste)</option>
                    <option value="date-asc">Datum (älteste)</option>
                    <option value="birth-asc">Geburtsdatum (älteste)</option>
                    <option value="birth-desc">Geburtsdatum (jüngste)</option>
                    <option value="status">Status (Aktiv zuerst)</option>
                    <option value="id-desc"># ID (absteigend)</option>
                    <option value="id-asc"># ID (aufsteigend)</option>
                    <option value="nachname">Nachname (A-Z)</option>
                    <option value="vorname">Vorname (A-Z)</option>
                    <option value="team">Team (A-Z)</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0; overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="#" class="sortable" style="width: 50px;"># ↕</th>
                        <th data-sort="Vorname" class="sortable">Vorname ↕</th>
                        <th data-sort="Nachname" class="sortable">Nachname ↕</th>
                        <th data-sort="Geburtsdatum" class="sortable">Geburtsdatum ↕</th>
                        <th data-sort="Team" class="sortable">Team ↕</th>
                        <th data-sort="Mitglied" class="sortable" style="text-align: center;">Mitglied ↕</th>
                        <th data-sort="seit" class="sortable">seit ↕</th>
                        <th data-sort="Status" class="sortable">Status ↕</th>
                        <th data-sort="ÖFB-Verein" class="sortable">ÖFB-Verein ↕</th>
                        <th style="width: 90px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="players-table-body">
                    <tr><td colspan="10" style="text-align: center; padding: 2rem;">Lade Spieler...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card Accordion View -->
        <div id="players-mobile-cards" class="admin-mobile-cards">
            <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Lade Spieler...</div>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="players-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create Modal matching round-modal layout -->
        <div id="player-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 600px; max-height: 90vh; max-height: 90dvh; overflow-y: auto; background: var(--color-surface) !important; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="modal-player-title" style="margin: 0; font-size: 1.3rem; color: var(--color-text-primary);">Spieler hinzufügen</h3>
                    <button type="button" class="btn-close-player-modal btn-outline" id="btn-close-modal" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>
                
                <form id="player-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-player-id">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Vorname</label>
                            <input type="text" id="edit-vorname" class="admin-input" placeholder="Vorname" style="width: 100%;" required>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Nachname</label>
                            <input type="text" id="edit-nachname" class="admin-input" placeholder="Nachname" style="width: 100%;" required>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Geburtstag</label>
                            <input type="date" id="edit-geburt" class="admin-input" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Mitglied</label>
                            <select id="edit-mitglied" class="admin-input" style="width: 100%;">
                                <option value="Ja">Ja</option>
                                <option value="Nein">Nein</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Mitglied seit:</label>
                            <input type="date" id="edit-seit" class="admin-input" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Status</label>
                            <select id="edit-status" class="admin-input" style="width: 100%;">
                                <option value="Aktiv">Aktiv</option>
                                <option value="Inaktiv">Inaktiv</option>
                                <option value="Archiviert">Archiviert</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">ÖFB-Verein</label>
                            <input type="text" id="edit-ofb" class="admin-input" placeholder="ÖFB-Verein" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Sperre</label>
                            <input type="text" id="edit-sperre" class="admin-input" placeholder="Grund für Sperre" style="width: 100%;">
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Mannschaft</label>
                        <select id="edit-team" class="admin-input" style="width: 100%;">
                            <option value="">-- Mannschaft auswählen --</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="button" id="btn-delete-player" style="display: none; padding: 10px 16px; background: #dc3545; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Löschen</button>
                        <button type="submit" id="btn-submit-player" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer; text-transform: uppercase;">ERSTELLEN</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

const ensureModalInBody = () => {
    const allMatching = Array.from(document.querySelectorAll('#player-modal'));
    if (allMatching.length > 1) {
        const bodyModal = allMatching.find(el => el.parentElement === document.body);
        if (bodyModal) {
            allMatching.filter(el => el !== bodyModal).forEach(el => el.remove());
            return bodyModal;
        }
    }
    const modal = document.getElementById('player-modal');
    if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    return modal;
};

export const initAdminPlayers = async () => {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return;

    ensureModalInBody();

    if (playersData.length === 0) {
        const [players, teams] = await Promise.all([
            Store.getAdminPlayers(),
            Store.getAdminTeams()
        ]);
        playersData = players;
        teamsData = teams;
    }
    
    populateFilterTeamDropdown();
    filteredData = [...playersData];
    sortData('seit', false);
    bindEvents();
    renderTable();
};

const populateFilterTeamDropdown = () => {
    const teamFilter = document.getElementById('player-team-filter');
    if (!teamFilter) return;

    // Get all unique teams from playersData and teamsData
    const teamSet = new Set();
    teamsData.forEach(t => { if (t.Name) teamSet.add(t.Name); });
    playersData.forEach(p => { if (p.Team) teamSet.add(p.Team); });

    const sortedTeams = Array.from(teamSet).sort((a, b) => a.localeCompare(b));
    teamFilter.innerHTML = '<option value="all">&lt;&lt; Alle Teams &gt;&gt;</option>' +
        sortedTeams.map(name => `<option value="${name}">${name}</option>`).join('');
};

const populateModalTeamDropdown = (currentTeam = '') => {
    const teamSelect = document.getElementById('edit-team');
    if (!teamSelect) return;

    const activeTeams = teamsData
        .filter(t => t.Status === 'Aktiv')
        .map(t => t.Name)
        .sort((a, b) => a.localeCompare(b));

    const options = [...activeTeams];
    if (currentTeam && !options.includes(currentTeam)) {
        options.unshift(currentTeam);
    }

    teamSelect.innerHTML = '<option value="">-- Mannschaft auswählen --</option>' + 
        options.map(name => `<option value="${name}" ${name === currentTeam ? 'selected' : ''}>${name}</option>`).join('');
};

const renderTable = () => {
    const tbody = document.getElementById('players-table-body');
    const info = document.getElementById('players-page-info');
    if (!tbody) return;

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const pageRows = filteredData.slice(startIdx, endIdx);

    if (info) {
        info.innerText = `Zeige ${totalRows > 0 ? startIdx + 1 : 0} bis ${endIdx} von ${totalRows} Spielern`;
    }

    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Keine Spieler gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(p => {
        let badgeClass = 'badge-secondary';
        if (p.Status === 'Aktiv') badgeClass = 'badge-success';
        if (p.Status === 'Inaktiv') badgeClass = 'badge-danger';

        const rawIndex = playersData.indexOf(p);
        const ofbVerein = p['ÖFB-Verein'] || '-';
        const mitglied = p.Mitglied || 'Ja';

        return `
            <tr>
                <td style="color: var(--color-text-secondary); font-size: 0.85rem;">#${p['#'] || '-'}</td>
                <td>${p.Vorname || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${p.Nachname || '-'}</strong></td>
                <td>${p.Geburtsdatum || '-'}</td>
                <td>${p.Team || '-'}</td>
                <td style="text-align: center;">${mitglied}</td>
                <td>${p.seit || '-'}</td>
                <td><span class="badge ${badgeClass}">${p.Status || '-'}</span></td>
                <td><span style="color: var(--color-text-primary);">${ofbVerein}</span></td>
                <td style="text-align: center;">
                    <button class="btn btn-outline edit-single-player-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        Bearbeiten
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render Mobile Accordion Cards
    const mobileCardsContainer = document.getElementById('players-mobile-cards');
    if (mobileCardsContainer) {
        if (pageRows.length === 0) {
            mobileCardsContainer.innerHTML = '<div class="glass-card" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Spieler gefunden.</div>';
        } else {
            mobileCardsContainer.innerHTML = pageRows.map(p => {
                let badgeClass = 'badge-secondary';
                if (p.Status === 'Aktiv') badgeClass = 'badge-success';
                if (p.Status === 'Inaktiv') badgeClass = 'badge-danger';

                const rawIndex = playersData.indexOf(p);
                const ofbVerein = p['ÖFB-Verein'] || '-';
                const mitglied = p.Mitglied || 'Ja';

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div style="flex: 1; min-width: 0;">
                                <div class="admin-m-title">
                                    <span style="color: var(--color-accent); font-weight: 800; margin-right: 4px;">#${p['#'] || '-'}</span>
                                    ${p.Vorname || ''} <strong>${p.Nachname || ''}</strong>
                                </div>
                                <div class="admin-m-subtitle">
                                    <span style="font-weight: 600; color: var(--color-text-primary);">${p.Team || '-'}</span>
                                    <span>•</span>
                                    <span class="badge ${badgeClass}" style="font-size: 0.72rem;">${p.Status || 'Aktiv'}</span>
                                </div>
                            </div>
                            <svg class="admin-m-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="admin-m-body">
                            <div class="admin-m-grid">
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Geburtsdatum</span>
                                    <span class="admin-m-value">${p.Geburtsdatum || '-'}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Mitglied</span>
                                    <span class="admin-m-value">${mitglied}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Mitglied seit</span>
                                    <span class="admin-m-value">${p.seit || '-'}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">ÖFB-Verein</span>
                                    <span class="admin-m-value">${ofbVerein}</span>
                                </div>
                            </div>
                            <div class="admin-m-actions">
                                <button class="edit-single-player-btn full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    Spieler bearbeiten
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

    // Bind edit buttons for both Desktop and Mobile views
    const container = document.getElementById('admin-players');
    if (container) {
        container.querySelectorAll('.edit-single-player-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditModal(idx);
            };
        });
    }
};

const formatDateForInput = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr.startsWith('0000')) return '';
    if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return `${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr;
};

const openEditModal = (idx = null) => {
    const modal = ensureModalInBody();
    const title = document.getElementById('modal-player-title');
    const deleteBtn = document.getElementById('btn-delete-player');
    const submitBtn = document.getElementById('btn-submit-player');
    
    let currentTeam = '';
    if (idx !== null && !isNaN(idx) && playersData[idx]) {
        const p = playersData[idx];
        currentTeam = p.Team || '';
        if (title) title.innerText = 'Spieler bearbeiten';
        if (submitBtn) submitBtn.innerText = 'Aktualisieren';
        document.getElementById('edit-player-id').value = idx;
        document.getElementById('edit-vorname').value = p.Vorname || '';
        document.getElementById('edit-nachname').value = p.Nachname || '';
        document.getElementById('edit-geburt').value = formatDateForInput(p.Geburtsdatum);
        document.getElementById('edit-mitglied').value = p.Mitglied === 'Nein' ? 'Nein' : 'Ja';
        document.getElementById('edit-seit').value = formatDateForInput(p.seit);
        document.getElementById('edit-status').value = p.Status || 'Aktiv';
        document.getElementById('edit-ofb').value = p['ÖFB-Verein'] || '';
        document.getElementById('edit-sperre').value = p.Sperre || '';
        if (deleteBtn) deleteBtn.style.display = 'block';
    } else {
        if (title) title.innerText = 'Spieler hinzufügen';
        if (submitBtn) submitBtn.innerText = 'Erstellen';
        document.getElementById('edit-player-id').value = 'new';
        document.getElementById('player-edit-form').reset();
        document.getElementById('edit-mitglied').value = 'Ja';
        document.getElementById('edit-status').value = 'Aktiv';
        document.getElementById('edit-seit').value = new Date().toISOString().split('T')[0];
        document.getElementById('edit-ofb').value = '';
        document.getElementById('edit-sperre').value = '';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }

    populateModalTeamDropdown(currentTeam);
    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeEditModal = () => {
    document.querySelectorAll('#player-modal').forEach(m => {
        m.style.display = 'none';
    });
};

const applyFilters = () => {
    const searchInput = document.getElementById('player-search');
    const teamSelect = document.getElementById('player-team-filter');
    const statusSelect = document.getElementById('player-status-filter');

    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedTeam = teamSelect ? teamSelect.value : 'all';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = playersData.filter(p => {
        const fullName = `${p.Vorname || ''} ${p.Nachname || ''}`.toLowerCase();
        const matchesSearch = !query || 
            fullName.includes(query) ||
            (p.Vorname && p.Vorname.toLowerCase().includes(query)) ||
            (p.Nachname && p.Nachname.toLowerCase().includes(query)) ||
            (p.Team && p.Team.toLowerCase().includes(query)) ||
            (p['ÖFB-Verein'] && p['ÖFB-Verein'].toLowerCase().includes(query)) ||
            (p['#'] && p['#'].toString().includes(query));
        
        const matchesTeam = selectedTeam === 'all' || p.Team === selectedTeam;
        const matchesStatus = status === 'all' || p.Status === status;
        
        return matchesSearch && matchesTeam && matchesStatus;
    });

    currentPage = 1;
    sortData(currentSort.column, currentSort.asc);
};

const parsePlayerDate = (dStr) => {
    if (!dStr || dStr === '-' || dStr.startsWith('0000')) return 0;
    if (dStr.includes('.')) {
        const parts = dStr.split('.');
        if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            return new Date(y, m, d).getTime() || 0;
        }
    }
    const t = new Date(dStr).getTime();
    return isNaN(t) ? 0 : t;
};

const sortData = (column, asc) => {
    currentSort = { column, asc };
    filteredData.sort((a, b) => {
        if (column === 'seit' || column === 'date' || column === 'Datum') {
            const dateA = parsePlayerDate(a.seit || a.Geburtsdatum);
            const dateB = parsePlayerDate(b.seit || b.Geburtsdatum);
            if (dateA && dateB && dateA !== dateB) {
                return asc ? dateA - dateB : dateB - dateA;
            }
            if (dateA && !dateB) return asc ? -1 : 1;
            if (!dateA && dateB) return asc ? 1 : -1;
            const numA = parseInt(a['#']) || 0;
            const numB = parseInt(b['#']) || 0;
            return asc ? numA - numB : numB - numA;
        }

        if (column === 'Geburtsdatum' || column === 'birth') {
            const dateA = parsePlayerDate(a.Geburtsdatum);
            const dateB = parsePlayerDate(b.Geburtsdatum);
            if (dateA && dateB && dateA !== dateB) {
                return asc ? dateA - dateB : dateB - dateA;
            }
            if (dateA && !dateB) return asc ? -1 : 1;
            if (!dateA && dateB) return asc ? 1 : -1;
            const numA = parseInt(a['#']) || 0;
            const numB = parseInt(b['#']) || 0;
            return asc ? numA - numB : numB - numA;
        }

        if (column === 'Status') {
            const priority = { 'Aktiv': 1, 'Inaktiv': 2, 'Archiviert': 3 };
            const pA = priority[a.Status] || 99;
            const pB = priority[b.Status] || 99;
            if (pA !== pB) return asc ? pA - pB : pB - pA;
            const dateA = parsePlayerDate(a.seit);
            const dateB = parsePlayerDate(b.seit);
            return dateB - dateA;
        }

        if (column === '#') {
            const numA = parseInt(a['#']) || 0;
            const numB = parseInt(b['#']) || 0;
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
    const search = document.getElementById('player-search');
    const teamFilter = document.getElementById('player-team-filter');
    const status = document.getElementById('player-status-filter');
    const sortSelect = document.getElementById('player-sort-select');
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    const addBtn = document.getElementById('btn-add-player');
    const closeBtn = document.getElementById('btn-close-modal');
    const deleteBtn = document.getElementById('btn-delete-player');
    const form = document.getElementById('player-edit-form');
    const playerModal = document.getElementById('player-modal');

    if (search) search.oninput = applyFilters;
    if (teamFilter) teamFilter.onchange = applyFilters;
    if (status) status.onchange = applyFilters;

    if (sortSelect) {
        sortSelect.onchange = () => {
            const val = sortSelect.value;
            if (val === 'date-asc') sortData('seit', true);
            else if (val === 'date-desc') sortData('seit', false);
            else if (val === 'birth-asc') sortData('Geburtsdatum', true);
            else if (val === 'birth-desc') sortData('Geburtsdatum', false);
            else if (val === 'status') sortData('Status', true);
            else if (val === 'id-asc') sortData('#', true);
            else if (val === 'id-desc') sortData('#', false);
            else if (val === 'nachname') sortData('Nachname', true);
            else if (val === 'vorname') sortData('Vorname', true);
            else if (val === 'team') sortData('Team', true);
        };
    }

    if (playerModal) {
        playerModal.onclick = (e) => {
            if (e.target === playerModal) closeEditModal();
        };
    }

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

    if (addBtn) addBtn.onclick = () => openEditModal(null);
    if (closeBtn) closeBtn.onclick = closeEditModal;

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const idVal = document.getElementById('edit-player-id').value;
            if (idVal !== 'new') {
                const idx = parseInt(idVal);
                const p = playersData[idx];
                if (confirm(`Möchten Sie den Spieler "${p.Vorname} ${p.Nachname}" wirklich löschen?`)) {
                    playersData.splice(idx, 1);
                    Store.saveAdminPlayers(playersData);
                    closeEditModal();
                    applyFilters();
                    showToast('Spieler gelöscht.');
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-player-id').value;
            const vornameInput = document.getElementById('edit-vorname');
            const nachnameInput = document.getElementById('edit-nachname');
            const vorname = vornameInput ? vornameInput.value.trim() : '';
            const nachname = nachnameInput ? nachnameInput.value.trim() : '';

            if (!vorname || !nachname) {
                showToast('Bitte Vorname und Nachname eingeben!', true);
                if (!vorname && vornameInput) vornameInput.focus();
                else if (!nachname && nachnameInput) nachnameInput.focus();
                return;
            }

            const updatedPlayer = {
                Vorname: vorname,
                Nachname: nachname,
                Geburtsdatum: document.getElementById('edit-geburt').value,
                Mitglied: document.getElementById('edit-mitglied').value,
                seit: document.getElementById('edit-seit').value || new Date().toISOString().split('T')[0],
                Status: document.getElementById('edit-status').value,
                'ÖFB-Verein': document.getElementById('edit-ofb').value.trim(),
                Sperre: document.getElementById('edit-sperre').value.trim(),
                Team: document.getElementById('edit-team').value
            };

            const isNew = (idVal === 'new');
            if (isNew) {
                // Generate next sequential numeric ID
                const validIds = playersData
                    .map(p => parseInt(p['#']) || 0)
                    .filter(n => n > 0 && n < 100000);
                const maxId = validIds.length > 0 ? Math.max(...validIds) : 5260;
                updatedPlayer['#'] = (maxId + 1).toString();
                playersData.unshift(updatedPlayer);
            } else {
                const idx = parseInt(idVal);
                playersData[idx] = { ...playersData[idx], ...updatedPlayer };
            }

            Store.saveAdminPlayers(playersData);
            closeEditModal();
            populateFilterTeamDropdown();
            applyFilters();
            showToast(isNew ? 'Spieler erfolgreich erstellt!' : 'Spieler erfolgreich aktualisiert!');
        };
    }

    document.querySelectorAll('#admin-players .sortable').forEach(th => {
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
