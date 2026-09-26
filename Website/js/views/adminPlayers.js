import { Store } from '../store.js';

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
            <button class="btn-dsg" id="btn-add-player">
                <span style="font-size: 1.1rem; line-height: 1;">+</span> Spieler anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="player-search" class="admin-input" placeholder="Suchen (Name, Team)..." style="width: 220px;">
                <select id="player-status-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                    <option value="Archiviert">Archiviert</option>
                </select>
            </div>
        </div>
        
        <div class="table-responsive glass-card" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="Vorname" class="sortable">Vorname ↕</th>
                        <th data-sort="Nachname" class="sortable">Nachname ↕</th>
                        <th data-sort="Geburtsdatum" class="sortable">Geburtsdatum ↕</th>
                        <th data-sort="Team" class="sortable">Team ↕</th>
                        <th data-sort="seit" class="sortable">Seit ↕</th>
                        <th data-sort="Status" class="sortable">Status ↕</th>
                        <th style="width: 100px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="players-table-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Lade Spieler...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="players-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create Modal -->
        <div id="player-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card" style="background: var(--color-surface); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: var(--space-lg); border-radius: var(--border-radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h3 id="modal-player-title" style="margin-bottom: var(--space-md);">Spieler bearbeiten</h3>
                <form id="player-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-player-id">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Vorname</label>
                        <input type="text" id="edit-vorname" class="admin-input" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Nachname</label>
                        <input type="text" id="edit-nachname" class="admin-input" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Geburtsdatum</label>
                        <input type="date" id="edit-geburt" class="admin-input" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Team (Aktive Mannschaften)</label>
                        <select id="edit-team" class="admin-input" style="width: 100%;" required>
                            <option value="">-- Team auswählen --</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Seit (Registrierungsdatum)</label>
                        <input type="date" id="edit-seit" class="admin-input" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
                        <select id="edit-status" class="admin-input" style="width: 100%;">
                            <option value="Aktiv">Aktiv</option>
                            <option value="Inaktiv">Inaktiv</option>
                            <option value="Archiviert">Archiviert</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md); justify-content: space-between; align-items: center;">
                        <button type="button" id="btn-delete-player" class="btn" style="background: #e74c3c; color: white; padding: 8px 16px;">Löschen</button>
                        <div style="display: flex; gap: var(--space-sm); margin-left: auto;">
                            <button type="button" id="btn-close-modal" class="btn btn-outline" style="padding: 8px 16px;">Abbrechen</button>
                            <button type="submit" class="btn-dsg" style="padding: 8px 18px;">Speichern</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

export const initAdminPlayers = async () => {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return;

    if (playersData.length === 0) {
        const [players, teams] = await Promise.all([
            Store.getAdminPlayers(),
            Store.getAdminTeams()
        ]);
        playersData = players;
        teamsData = teams;
    }
    
    filteredData = [...playersData];
    sortData('Status', true);
    bindEvents();
    renderTable();
};

const populateTeamDropdown = (currentTeam = '') => {
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

    teamSelect.innerHTML = '<option value="">-- Team auswählen --</option>' + 
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Spieler gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(p => {
        let badgeClass = 'badge-secondary';
        if (p.Status === 'Aktiv') badgeClass = 'badge-success';
        if (p.Status === 'Inaktiv') badgeClass = 'badge-danger';

        const rawIndex = playersData.indexOf(p);

        return `
            <tr>
                <td>${p.Vorname || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${p.Nachname || '-'}</strong></td>
                <td>${p.Geburtsdatum || '-'}</td>
                <td>${p.Team || '-'}</td>
                <td>${p.seit || '-'}</td>
                <td><span class="badge ${badgeClass}">${p.Status || '-'}</span></td>
                <td style="text-align: center;">
                    <button class="btn btn-outline edit-single-player-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px;">Bearbeiten</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.edit-single-player-btn').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            openEditModal(idx);
        };
    });
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
    const modal = document.getElementById('player-modal');
    const title = document.getElementById('modal-player-title');
    const deleteBtn = document.getElementById('btn-delete-player');
    
    let currentTeam = '';
    if (idx !== null && playersData[idx]) {
        const p = playersData[idx];
        currentTeam = p.Team || '';
        title.innerText = 'Spieler bearbeiten';
        document.getElementById('edit-player-id').value = idx;
        document.getElementById('edit-vorname').value = p.Vorname || '';
        document.getElementById('edit-nachname').value = p.Nachname || '';
        document.getElementById('edit-geburt').value = formatDateForInput(p.Geburtsdatum);
        document.getElementById('edit-seit').value = formatDateForInput(p.seit);
        document.getElementById('edit-status').value = p.Status || 'Aktiv';
        deleteBtn.style.display = 'block';
    } else {
        title.innerText = 'Neuen Spieler anlegen';
        document.getElementById('edit-player-id').value = 'new';
        document.getElementById('player-edit-form').reset();
        document.getElementById('edit-status').value = 'Aktiv';
        document.getElementById('edit-seit').value = new Date().toISOString().split('T')[0];
        deleteBtn.style.display = 'none';
    }

    populateTeamDropdown(currentTeam);
    modal.style.display = 'flex';
};

const closeEditModal = () => {
    const modal = document.getElementById('player-modal');
    if (modal) modal.style.display = 'none';
};

const applyFilters = () => {
    const searchInput = document.getElementById('player-search');
    const statusSelect = document.getElementById('player-status-filter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = playersData.filter(p => {
        const matchesSearch = (p.Vorname && p.Vorname.toLowerCase().includes(query)) ||
                              (p.Nachname && p.Nachname.toLowerCase().includes(query)) ||
                              (p.Team && p.Team.toLowerCase().includes(query));
        
        const matchesStatus = status === 'all' || p.Status === status;
        
        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    sortData(currentSort.column, currentSort.asc);
};

const sortData = (column, asc) => {
    currentSort = { column, asc };
    filteredData.sort((a, b) => {
        if (column === 'Status') {
            const priority = { 'Aktiv': 1, 'Inaktiv': 2, 'Archiviert': 3 };
            const pA = priority[a.Status] || 99;
            const pB = priority[b.Status] || 99;
            if (pA !== pB) return asc ? pA - pB : pB - pA;
            return (b.seit || '').localeCompare(a.seit || '');
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
    const status = document.getElementById('player-status-filter');
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    const addBtn = document.getElementById('btn-add-player');
    const closeBtn = document.getElementById('btn-close-modal');
    const deleteBtn = document.getElementById('btn-delete-player');
    const form = document.getElementById('player-edit-form');

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
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-player-id').value;
            const updatedPlayer = {
                Vorname: document.getElementById('edit-vorname').value.trim(),
                Nachname: document.getElementById('edit-nachname').value.trim(),
                Geburtsdatum: document.getElementById('edit-geburt').value,
                Team: document.getElementById('edit-team').value,
                seit: document.getElementById('edit-seit').value || new Date().toISOString().split('T')[0],
                Status: document.getElementById('edit-status').value
            };

            if (idVal === 'new') {
                playersData.unshift(updatedPlayer);
            } else {
                const idx = parseInt(idVal);
                playersData[idx] = { ...playersData[idx], ...updatedPlayer };
            }

            Store.saveAdminPlayers(playersData);
            closeEditModal();
            applyFilters();
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
