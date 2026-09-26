import { Store } from '../store.js';

let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'Name', asc: true };

export const renderAdminTeams = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Teams verwalten</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Übersicht aller aktiven und inaktiven Mannschaften</p>
        </div>

        <!-- Controls Toolbar immediately above table -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-team">
                <span style="font-size: 1.1rem; line-height: 1;">+</span> Team anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="team-search" class="admin-input" placeholder="Team suchen..." style="width: 220px;">
                <select id="team-status-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                </select>
            </div>
        </div>
        
        <div class="table-responsive glass-card" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="ID" class="sortable">ID ↕</th>
                        <th data-sort="Name" class="sortable">Name ↕</th>
                        <th data-sort="Aktive Spieler" class="sortable">Aktive Spieler ↕</th>
                        <th data-sort="Aktiv seit" class="sortable">Aktiv seit ↕</th>
                        <th data-sort="Inaktiv seit" class="sortable">Inaktiv seit ↕</th>
                        <th data-sort="Status" class="sortable">Status ↕</th>
                        <th style="width: 100px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="teams-table-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Lade Teams...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="teams-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-t" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-t" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create Team Modal -->
        <div id="team-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card" style="background: var(--color-surface); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: var(--space-lg); border-radius: var(--border-radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h3 id="modal-team-title" style="margin-bottom: var(--space-md);">Team bearbeiten</h3>
                <form id="team-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-team-id">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Team Name</label>
                        <input type="text" id="edit-team-name" class="admin-input" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Aktiv seit</label>
                        <input type="date" id="edit-team-aktiv-seit" class="admin-input" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Inaktiv seit</label>
                        <input type="date" id="edit-team-inaktiv-seit" class="admin-input" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
                        <select id="edit-team-status" class="admin-input" style="width: 100%;">
                            <option value="Aktiv">Aktiv</option>
                            <option value="Inaktiv">Inaktiv</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md); justify-content: space-between; align-items: center;">
                        <button type="button" id="btn-delete-team" class="btn" style="background: #e74c3c; color: white; padding: 8px 16px;">Löschen</button>
                        <div style="display: flex; gap: var(--space-sm); margin-left: auto;">
                            <button type="button" id="btn-close-team-modal" class="btn btn-outline" style="padding: 8px 16px;">Abbrechen</button>
                            <button type="submit" class="btn-dsg" style="padding: 8px 18px;">Speichern</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

export const initAdminTeams = async () => {
    const tbody = document.getElementById('teams-table-body');
    if (!tbody) return;

    if (teamsData.length === 0) {
        const teams = await Store.getAdminTeams();
        // Normalize status
        teamsData = teams.map(t => ({
            ...t,
            Status: (t.Status === 'Nein' || !t.Status || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv'
        }));
        filteredData = [...teamsData];
        sortData('Name', true);
    }
    
    bindEvents();
    renderTable();
};

const renderTable = () => {
    const tbody = document.getElementById('teams-table-body');
    const info = document.getElementById('teams-page-info');
    if (!tbody) return;

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const pageRows = filteredData.slice(startIdx, endIdx);

    if (info) {
        info.innerText = `Zeige ${totalRows > 0 ? startIdx + 1 : 0} bis ${endIdx} von ${totalRows} Teams`;
    }

    const prevBtn = document.getElementById('btn-prev-page-t');
    const nextBtn = document.getElementById('btn-next-page-t');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Teams gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(t => {
        const status = (t.Status === 'Nein' || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';

        const rawIndex = teamsData.indexOf(t);

        return `
            <tr>
                <td style="color: var(--color-text-secondary);">#${t.ID || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${t.Name || '-'}</strong></td>
                <td>${t["Aktive Spieler"] || '0'}</td>
                <td>${t["Aktiv seit"] || '-'}</td>
                <td>${t["Inaktiv seit"] || '-'}</td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
                <td style="text-align: center;">
                    <button class="btn btn-outline edit-single-team-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px;">Bearbeiten</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.edit-single-team-btn').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            openEditModal(idx);
        };
    });
};

const openEditModal = (idx = null) => {
    const modal = document.getElementById('team-modal');
    const title = document.getElementById('modal-team-title');
    const deleteBtn = document.getElementById('btn-delete-team');
    
    if (idx !== null && teamsData[idx]) {
        const t = teamsData[idx];
        title.innerText = 'Team bearbeiten';
        document.getElementById('edit-team-id').value = idx;
        document.getElementById('edit-team-name').value = t.Name || '';
        document.getElementById('edit-team-aktiv-seit').value = t["Aktiv seit"] || '';
        document.getElementById('edit-team-inaktiv-seit').value = t["Inaktiv seit"] || '';
        document.getElementById('edit-team-status').value = t.Status === 'Aktiv' ? 'Aktiv' : 'Inaktiv';
        deleteBtn.style.display = 'block';
    } else {
        title.innerText = 'Neues Team anlegen';
        document.getElementById('edit-team-id').value = 'new';
        document.getElementById('team-edit-form').reset();
        document.getElementById('edit-team-status').value = 'Aktiv';
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
};

const closeEditModal = () => {
    const modal = document.getElementById('team-modal');
    if (modal) modal.style.display = 'none';
};

const applyFilters = () => {
    const searchInput = document.getElementById('team-search');
    const statusSelect = document.getElementById('team-status-filter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = teamsData.filter(t => {
        const matchesSearch = (t.Name && t.Name.toLowerCase().includes(query)) ||
                              (t.ID && t.ID.toLowerCase().includes(query));
        
        const currentStatus = (t.Status === 'Nein' || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        const matchesStatus = status === 'all' || currentStatus === status;
        
        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    sortData(currentSort.column, currentSort.asc);
};

const sortData = (column, asc) => {
    currentSort = { column, asc };
    filteredData.sort((a, b) => {
        const valA = (a[column] || '').toString().toLowerCase();
        const valB = (b[column] || '').toString().toLowerCase();
        
        if (column === 'ID' || column === 'Aktive Spieler') {
            const numA = parseInt(valA) || 0;
            const numB = parseInt(valB) || 0;
            return asc ? numA - numB : numB - numA;
        }

        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
    });
    renderTable();
};

const bindEvents = () => {
    const search = document.getElementById('team-search');
    const status = document.getElementById('team-status-filter');
    const prevBtn = document.getElementById('btn-prev-page-t');
    const nextBtn = document.getElementById('btn-next-page-t');
    const addBtn = document.getElementById('btn-add-team');
    const closeBtn = document.getElementById('btn-close-team-modal');
    const deleteBtn = document.getElementById('btn-delete-team');
    const form = document.getElementById('team-edit-form');

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
            const idVal = document.getElementById('edit-team-id').value;
            if (idVal !== 'new') {
                const idx = parseInt(idVal);
                const t = teamsData[idx];
                if (confirm(`Möchten Sie das Team "${t.Name}" wirklich löschen?`)) {
                    teamsData.splice(idx, 1);
                    Store.saveAdminTeams(teamsData);
                    closeEditModal();
                    applyFilters();
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-team-id').value;
            const updatedTeam = {
                Name: document.getElementById('edit-team-name').value.trim(),
                "Aktiv seit": document.getElementById('edit-team-aktiv-seit').value,
                "Inaktiv seit": document.getElementById('edit-team-inaktiv-seit').value,
                Status: document.getElementById('edit-team-status').value
            };

            if (idVal === 'new') {
                const maxId = teamsData.reduce((max, t) => Math.max(max, parseInt(t.ID) || 0), 0);
                teamsData.unshift({
                    ID: String(maxId + 1),
                    "Aktive Spieler": "0",
                    ...updatedTeam
                });
            } else {
                const idx = parseInt(idVal);
                teamsData[idx] = { ...teamsData[idx], ...updatedTeam };
            }

            Store.saveAdminTeams(teamsData);
            closeEditModal();
            applyFilters();
        };
    }

    document.querySelectorAll('#admin-teams .sortable').forEach(th => {
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
