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
            <div style="display: flex; gap: var(--space-sm);">
                <input type="text" id="player-search" class="admin-input" placeholder="Suchen (Name, Team)..." style="width: 250px;">
                <select id="player-status-filter" class="admin-input" style="width: 150px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                    <option value="Archiviert">Archiviert</option>
                </select>
                <button class="btn btn-primary" id="btn-add-player">+ Spieler anlegen</button>
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
                        <th>Aktion</th>
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
                <button id="btn-prev-page" class="btn btn-outline" style="padding: 5px 10px;">&laquo; Zurück</button>
                <button id="btn-next-page" class="btn btn-outline" style="padding: 5px 10px;">Vor &raquo;</button>
            </div>
        </div>
    </div>
    `;
};

export const initAdminPlayers = async () => {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return; // Not on the page

    playersData = await Store.getAdminPlayers();
    filteredData = [...playersData];
    
    // Initial Sort by added date (newest first)
    sortData('seit', false);
    
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

    info.innerText = \`Zeige \${totalRows > 0 ? startIdx + 1 : 0} bis \${endIdx} von \${totalRows} Spielern\`;

    document.getElementById('btn-prev-page').disabled = currentPage === 1;
    document.getElementById('btn-next-page').disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Spieler gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(p => {
        let badgeClass = 'badge-secondary';
        if (p.Status === 'Aktiv') badgeClass = 'badge-success';
        if (p.Status === 'Inaktiv') badgeClass = 'badge-danger';

        return \`
            <tr>
                <td>\${p.Vorname || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">\${p.Nachname || '-'}</strong></td>
                <td>\${p.Geburtsdatum || '-'}</td>
                <td>\${p.Team || '-'}</td>
                <td>\${p.seit || '-'}</td>
                <td><span class="badge \${badgeClass}">\${p.Status || '-'}</span></td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="alert('Edit nicht implementiert')">Editieren</button>
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="alert('Löschen nicht implementiert')">Löschen</button>
                    </div>
                </td>
            </tr>
        \`;
    }).join('');
};

const applyFilters = () => {
    const query = document.getElementById('player-search').value.toLowerCase();
    const status = document.getElementById('player-status-filter').value;

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
    document.getElementById('player-search').addEventListener('input', applyFilters);
    document.getElementById('player-status-filter').addEventListener('change', applyFilters);

    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderTable(); }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        currentPage++; renderTable();
    });

    document.querySelectorAll('#players-table-body').forEach(tbody => {
        // Event delegation logic could go here if needed
    });

    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', (e) => {
            const col = e.target.getAttribute('data-sort');
            if (currentSort.column === col) {
                sortData(col, !currentSort.asc);
            } else {
                sortData(col, true);
            }
        });
    });
};
