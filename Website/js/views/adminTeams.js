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
            <div style="display: flex; gap: var(--space-sm);">
                <input type="text" id="team-search" class="admin-input" placeholder="Team suchen..." style="width: 250px;">
                <select id="team-status-filter" class="admin-input" style="width: 150px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                </select>
                <button class="btn btn-primary" id="btn-add-team">+ Team anlegen</button>
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
                        <th>Aktion</th>
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

    teamsData = await Store.getAdminTeams();
    filteredData = [...teamsData];
    
    sortData('Name', true);
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

    info.innerText = \`Zeige \${totalRows > 0 ? startIdx + 1 : 0} bis \${endIdx} von \${totalRows} Teams\`;

    document.getElementById('btn-prev-page-t').disabled = currentPage === 1;
    document.getElementById('btn-next-page-t').disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Teams gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(t => {
        let badgeClass = 'badge-secondary';
        if (t.Status === 'Aktiv') badgeClass = 'badge-success';
        if (t.Status === 'Inaktiv') badgeClass = 'badge-danger';

        return \`
            <tr>
                <td style="color: var(--color-text-secondary);">#\${t.ID || '-'}</td>
                <td><strong style="color: var(--color-text-primary);">\${t.Name || '-'}</strong></td>
                <td>\${t["Aktive Spieler"] || '-'}</td>
                <td>\${t["Aktiv seit"] || '-'}</td>
                <td>\${t["Inaktiv seit"] || '-'}</td>
                <td><span class="badge \${badgeClass}">\${t.Status || '-'}</span></td>
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
    const query = document.getElementById('team-search').value.toLowerCase();
    const status = document.getElementById('team-status-filter').value;

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
        
        // Handle numeric sorting for ID or Aktive Spieler
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
    document.getElementById('team-search').addEventListener('input', applyFilters);
    document.getElementById('team-status-filter').addEventListener('change', applyFilters);

    document.getElementById('btn-prev-page-t').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderTable(); }
    });

    document.getElementById('btn-next-page-t').addEventListener('click', () => {
        currentPage++; renderTable();
    });

    document.querySelectorAll('#teams-table-body').forEach(tbody => {
        // Event delegation
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
