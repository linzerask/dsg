import { Store } from '../store.js';

let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'seit', asc: false };

export const renderAdminPlayers = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div class="datagrid-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-sm);">
            <h2>Spieler verwalten</h2>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
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
                    </tr>
                </thead>
                <tbody id="players-table-body">
                    <tr><td colspan="6" style="text-align: center; padding: 2rem;">Lade Spieler...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="players-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page" class="btn btn-outline" style="padding: 5px 10px;">&laquo; Zurück</button>
                <button id="btn-next-page" class="btn btn-outline" style="padding: 5px 10px;">Vor &raquo;</button>
            </div>
        </div>
    </div>
    `;
};

export const initAdminPlayers = async () => {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return;

    if (playersData.length === 0) {
        playersData = await Store.getAdminPlayers();
        filteredData = [...playersData];
        sortData('seit', false);
    }
    
    bindEvents();
    renderTable();
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Keine Spieler gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(p => {
        let badgeClass = 'badge-secondary';
        if (p.Status === 'Aktiv') badgeClass = 'badge-success';
        if (p.Status === 'Inaktiv') badgeClass = 'badge-danger';

        return `
            <tr>
                <td>${p.Vorname || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">${p.Nachname || '-'}</strong></td>
                <td>${p.Geburtsdatum || '-'}</td>
                <td>${p.Team || '-'}</td>
                <td>${p.seit || '-'}</td>
                <td><span class="badge ${badgeClass}">${p.Status || '-'}</span></td>
            </tr>
        `;
    }).join('');
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
