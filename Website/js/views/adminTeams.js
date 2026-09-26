import { Store } from '../store.js';

let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'Name', asc: true };

export const renderAdminTeams = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div class="datagrid-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-sm);">
            <h2>Teams verwalten</h2>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
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
                    </tr>
                </thead>
                <tbody id="teams-table-body">
                    <tr><td colspan="6" style="text-align: center; padding: 2rem;">Lade Teams...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="teams-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-t" class="btn btn-outline" style="padding: 5px 10px;">&laquo; Zurück</button>
                <button id="btn-next-page-t" class="btn btn-outline" style="padding: 5px 10px;">Vor &raquo;</button>
            </div>
        </div>
    </div>
    `;
};

export const initAdminTeams = async () => {
    const tbody = document.getElementById('teams-table-body');
    if (!tbody) return;

    if (teamsData.length === 0) {
        teamsData = await Store.getAdminTeams();
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Keine Teams gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(t => {
        let badgeClass = 'badge-secondary';
        if (t.Status === 'Aktiv') badgeClass = 'badge-success';
        if (t.Status === 'Inaktiv') badgeClass = 'badge-danger';

        return `
            <tr>
                <td style="color: var(--color-text-secondary);">#${t.ID || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${t.Name || '-'}</strong></td>
                <td>${t["Aktive Spieler"] || '-'}</td>
                <td>${t["Aktiv seit"] || '-'}</td>
                <td>${t["Inaktiv seit"] || '-'}</td>
                <td><span class="badge ${badgeClass}">${t.Status || '-'}</span></td>
            </tr>
        `;
    }).join('');
};

const applyFilters = () => {
    const searchInput = document.getElementById('team-search');
    const statusSelect = document.getElementById('team-status-filter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = teamsData.filter(t => {
        const matchesSearch = (t.Name && t.Name.toLowerCase().includes(query)) ||
                              (t.ID && t.ID.toLowerCase().includes(query));
        
        const matchesStatus = status === 'all' || t.Status === status;
        
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
