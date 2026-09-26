import { Store } from '../store.js';

let leaguesData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'id', asc: false };

export const renderAdminLeagues = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Übersicht der Ligen</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Verwaltung aller Ligen, Spielklassen und Saisonen</p>
        </div>

        <!-- Controls Toolbar immediately above table -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-league">
                <span style="font-size: 1.1rem; line-height: 1;">+</span> Liga anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="league-search" class="admin-input" placeholder="Suchen..." style="width: 200px;">
                <select id="league-status-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                </select>
            </div>
        </div>
        
        <div class="table-responsive glass-card" style="padding: 0; overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="id" class="sortable" style="width: 50px;"># ↕</th>
                        <th data-sort="name" class="sortable">Name ↕</th>
                        <th data-sort="year" class="sortable">Jahr ↕</th>
                        <th data-sort="status" class="sortable">Aktiv ↕</th>
                        <th style="width: 100px; text-align: center;">Aktion</th>
                        <th style="text-align: center;">Tabelle</th>
                        <th style="text-align: center;">Spielberichte</th>
                        <th style="text-align: center;">Karten</th>
                        <th style="text-align: center;">Tore</th>
                    </tr>
                </thead>
                <tbody id="leagues-table-body">
                    <tr><td colspan="9" style="text-align: center; padding: 2rem;">Lade Ligen...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="leagues-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-l" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-l" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create League Modal matching original screenshots -->
        <div id="league-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card" style="background: var(--color-surface); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: var(--space-lg); border-radius: var(--border-radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h3 id="modal-league-title" style="margin-bottom: var(--space-md);">Liga bearbeiten</h3>
                <form id="league-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-league-id">
                    <div>
                        <label id="lbl-league-name" style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Liga</label>
                        <input type="text" id="edit-league-name" class="admin-input" placeholder="Name" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Jahr</label>
                        <input type="text" id="edit-league-year" class="admin-input" placeholder="YYYY" style="width: 100%;" required>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
                        <select id="edit-league-status" class="admin-input" style="width: 100%;">
                            <option value="Aktiv">Aktiv</option>
                            <option value="Inaktiv">Inaktiv</option>
                        </select>
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
    </div>
    `;
};

export const initAdminLeagues = async () => {
    const tbody = document.getElementById('leagues-table-body');
    if (!tbody) return;

    if (leaguesData.length === 0) {
        leaguesData = await Store.getAdminLeagues();
    }
    
    filteredData = [...leaguesData];
    sortData('id', false);
    bindEvents();
    renderTable();
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
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Keine Ligen gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(l => {
        const status = (l.status === 'Nein' || l.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';
        const rawIndex = leaguesData.indexOf(l);

        return `
            <tr>
                <td style="color: var(--color-text-secondary);">#${l.id || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${l.name || '-'}</strong></td>
                <td>${l.year || '-'}</td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
                <td style="text-align: center;">
                    <button class="btn btn-outline edit-single-league-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px;">Bearbeiten</button>
                </td>
                <td style="text-align: center;">
                    <a href="#/liga" style="color: var(--color-accent); font-weight: 600; text-decoration: none;">Tabelle</a>
                </td>
                <td style="text-align: center;">
                    <a href="#/liga" style="color: var(--color-accent); font-weight: 600; text-decoration: none;">Spielberichte</a>
                </td>
                <td style="text-align: center;">
                    <a href="#/liga" style="color: var(--color-accent); font-weight: 600; text-decoration: none;">Karten</a>
                </td>
                <td style="text-align: center;">
                    <a href="#/liga" style="color: var(--color-accent); font-weight: 600; text-decoration: none;">Tore</a>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.edit-single-league-btn').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            openEditModal(idx);
        };
    });
};

const openEditModal = (idx = null) => {
    const modal = document.getElementById('league-modal');
    const title = document.getElementById('modal-league-title');
    const nameLabel = document.getElementById('lbl-league-name');
    const submitBtn = document.getElementById('btn-submit-league');
    const deleteBtn = document.getElementById('btn-delete-league');
    
    if (idx !== null && leaguesData[idx]) {
        const l = leaguesData[idx];
        title.innerText = 'Liga bearbeiten';
        if (nameLabel) nameLabel.innerText = 'Liga';
        if (submitBtn) submitBtn.innerText = 'Bestätigen';
        document.getElementById('edit-league-id').value = idx;
        document.getElementById('edit-league-name').value = l.name || '';
        document.getElementById('edit-league-year').value = l.year || '';
        document.getElementById('edit-league-status').value = l.status === 'Aktiv' ? 'Aktiv' : 'Inaktiv';
        deleteBtn.style.display = 'block';
    } else {
        title.innerText = 'Liga hinzufügen';
        if (nameLabel) nameLabel.innerText = 'Name';
        if (submitBtn) submitBtn.innerText = 'Erstellen';
        document.getElementById('edit-league-id').value = 'new';
        document.getElementById('league-edit-form').reset();
        document.getElementById('edit-league-status').value = 'Aktiv';
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
};

const closeEditModal = () => {
    const modal = document.getElementById('league-modal');
    if (modal) modal.style.display = 'none';
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
    const prevBtn = document.getElementById('btn-prev-page-l');
    const nextBtn = document.getElementById('btn-next-page-l');
    const addBtn = document.getElementById('btn-add-league');
    const closeBtn = document.getElementById('btn-close-league-modal');
    const deleteBtn = document.getElementById('btn-delete-league');
    const form = document.getElementById('league-edit-form');

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
            const idVal = document.getElementById('edit-league-id').value;
            if (idVal !== 'new') {
                const idx = parseInt(idVal);
                const l = leaguesData[idx];
                if (confirm(`Möchten Sie die Liga "${l.name} (${l.year})" wirklich löschen?`)) {
                    leaguesData.splice(idx, 1);
                    Store.saveAdminLeagues(leaguesData);
                    closeEditModal();
                    applyFilters();
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-league-id').value;
            const updatedLeague = {
                name: document.getElementById('edit-league-name').value.trim(),
                year: parseInt(document.getElementById('edit-league-year').value) || new Date().getFullYear(),
                status: document.getElementById('edit-league-status').value
            };

            if (idVal === 'new') {
                const maxId = leaguesData.reduce((max, l) => Math.max(max, parseInt(l.id) || 0), 0);
                updatedLeague.id = maxId + 1;
                leaguesData.unshift(updatedLeague);
            } else {
                const idx = parseInt(idVal);
                leaguesData[idx] = { ...leaguesData[idx], ...updatedLeague };
            }

            Store.saveAdminLeagues(leaguesData);
            closeEditModal();
            applyFilters();
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
