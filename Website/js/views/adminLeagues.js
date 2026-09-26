import { Store } from '../store.js';

let leaguesData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'id', asc: false };

let selectedLeague = null;
let currentModalTab = 'table';

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

        <!-- Edit / Create League Modal -->
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

        <!-- League Data Inspection Popup (Grid/Tables for Tabelle, Spielberichte, Karten, Tore) -->
        <div id="league-data-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000; justify-content: center; align-items: center; padding: 20px; backdrop-filter: blur(4px);">
            <div class="glass-card" style="background: var(--color-surface); max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; border-radius: var(--border-radius-md); box-shadow: 0 15px 35px rgba(0,0,0,0.3); border: var(--glass-border); overflow: hidden;">
                
                <!-- Modal Top Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border); background: rgba(255,255,255,0.02);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <h3 id="league-data-title" style="margin: 0; font-size: 1.25rem; font-weight: 700;">Liga Details</h3>
                        <span id="league-data-badge" class="badge badge-secondary" style="font-size: 0.75rem;">Inaktiv</span>
                    </div>
                    <button type="button" id="btn-close-data-modal" style="background: none; border: none; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--color-text-secondary); padding: 4px 8px;">&times;</button>
                </div>

                <!-- Modal Sub-Nav Tabs -->
                <div style="display: flex; gap: var(--space-xs); padding: var(--space-xs) var(--space-lg); border-bottom: 1px solid var(--color-border); background: rgba(0,0,0,0.02); overflow-x: auto;">
                    <button class="modal-tab-btn active" data-modal-tab="table" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 600; border-radius: 4px; border: none; cursor: pointer; background: var(--color-accent); color: #000;">📊 Tabelle</button>
                    <button class="modal-tab-btn" data-modal-tab="matches" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 600; border-radius: 4px; border: none; cursor: pointer; background: none; color: var(--color-text-secondary);">⚽ Spielberichte</button>
                    <button class="modal-tab-btn" data-modal-tab="cards" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 600; border-radius: 4px; border: none; cursor: pointer; background: none; color: var(--color-text-secondary);">🟨 Karten</button>
                    <button class="modal-tab-btn" data-modal-tab="scorers" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 600; border-radius: 4px; border: none; cursor: pointer; background: none; color: var(--color-text-secondary);">🎯 Tore</button>
                </div>

                <!-- Modal Scrollable Content Container -->
                <div id="league-data-content" style="padding: var(--space-lg); overflow-y: auto; flex: 1;">
                    <!-- Injected dynamically based on active tab -->
                </div>
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

const getSeasonKey = (league) => {
    if (league.seasonKey) return league.seasonKey;
    if (league.name && league.name.includes('26/27')) return '2026/2027';
    if (league.name && league.name.includes('25/26')) return '2025/2026';
    if (league.year === 2026 && (league.name || '').includes('25/26')) return '2025/2026';
    if (league.year === 2025) return '2024/2025';
    if (league.year === 2024) return '2023/2024';
    if (league.year === 2023) return '2022/2023';
    return league.name;
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
                    <button class="btn-league-view" data-action="table" data-idx="${rawIndex}" style="background: none; border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Tabelle</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="matches" data-idx="${rawIndex}" style="background: none; border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Spielberichte</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="cards" data-idx="${rawIndex}" style="background: none; border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Karten</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="scorers" data-idx="${rawIndex}" style="background: none; border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Tore</button>
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

    tbody.querySelectorAll('.btn-league-view').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            const action = e.currentTarget.getAttribute('data-action');
            openLeagueDataModal(idx, action);
        };
    });
};

const openLeagueDataModal = (idx, tab = 'table') => {
    if (idx === null || !leaguesData[idx]) return;
    selectedLeague = leaguesData[idx];
    currentModalTab = tab;

    const modal = document.getElementById('league-data-modal');
    const title = document.getElementById('league-data-title');
    const badge = document.getElementById('league-data-badge');

    if (title) title.innerText = `${selectedLeague.name} (${selectedLeague.year || ''})`;
    if (badge) {
        const status = (selectedLeague.status === 'Nein' || selectedLeague.status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        badge.innerText = status;
        badge.className = `badge ${status === 'Aktiv' ? 'badge-success' : 'badge-secondary'}`;
    }

    // Update modal tab buttons UI
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-modal-tab') === currentModalTab) {
            btn.style.background = 'var(--color-accent)';
            btn.style.color = '#000';
            btn.classList.add('active');
        } else {
            btn.style.background = 'none';
            btn.style.color = 'var(--color-text-secondary)';
            btn.classList.remove('active');
        }
    });

    renderModalContent();
    if (modal) modal.style.display = 'flex';
};

const renderModalContent = () => {
    const container = document.getElementById('league-data-content');
    if (!container || !selectedLeague) return;

    const seasonKey = getSeasonKey(selectedLeague);
    const storeData = Store.getData();
    const seasonData = storeData.seasons ? storeData.seasons[seasonKey] : null;

    if (!seasonData) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-xl) var(--space-md); color: var(--color-text-secondary);">
                <div style="font-size: 2.5rem; margin-bottom: var(--space-sm);">📁</div>
                <h4 style="color: var(--color-text-primary); margin-bottom: var(--space-xs);">Keine Spieldaten vorhanden</h4>
                <p style="font-size: 0.9rem; max-width: 400px; margin: 0 auto;">Für die Saison <strong>${selectedLeague.name} (${seasonKey})</strong> wurden noch keine Daten erfasst oder importiert.</p>
            </div>
        `;
        return;
    }

    if (currentModalTab === 'table') {
        const teams = [...(seasonData.teams || [])].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffB = (b.gf || 0) - (b.ga || 0);
            const diffA = (a.gf || 0) - (a.ga || 0);
            if (diffB !== diffA) return diffB - diffA;
            return (b.gf || 0) - (a.gf || 0);
        });

        if (teams.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Keine Mannschaften eingetragen.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="admin-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">#</th>
                            <th>Mannschaft</th>
                            <th style="text-align: center;">Sp</th>
                            <th style="text-align: center;">S</th>
                            <th style="text-align: center;">U</th>
                            <th style="text-align: center;">N</th>
                            <th style="text-align: center;">Tore</th>
                            <th style="text-align: center;">Diff</th>
                            <th style="text-align: right; font-weight: 700;">Pkt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teams.map((t, i) => {
                            const diff = (t.gf || 0) - (t.ga || 0);
                            const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                            return `
                                <tr>
                                    <td style="text-align: center; font-weight: 700; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${i + 1}</td>
                                    <td><strong style="color: var(--color-text-primary);">${t.name}</strong></td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${t.played ?? 0}</td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${t.won ?? 0}</td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${t.drawn ?? 0}</td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${t.lost ?? 0}</td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${t.gf ?? 0}:${t.ga ?? 0}</td>
                                    <td style="text-align: center; color: var(--color-text-secondary);">${diffStr}</td>
                                    <td style="text-align: right; font-weight: 900; color: var(--color-accent);">${t.points ?? 0}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentModalTab === 'matches') {
        const matches = seasonData.matches || [];
        if (matches.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Keine Spielberichte vorhanden.</p>';
            return;
        }

        // Group matches by round
        const roundsMap = {};
        matches.forEach(m => {
            const r = m.round || 1;
            if (!roundsMap[r]) roundsMap[r] = [];
            roundsMap[r].push(m);
        });

        const roundKeys = Object.keys(roundsMap).sort((a, b) => parseInt(a) - parseInt(b));

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
                ${roundKeys.map(rNum => `
                    <div>
                        <h4 style="color: var(--color-accent); margin-bottom: var(--space-sm); border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">Runde ${rNum}</h4>
                        <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
                            ${roundsMap[rNum].map(m => {
                                const isCanceled = (m.status || '').toLowerCase().includes('abgesagt');
                                const isPostponed = (m.status || '').toLowerCase().includes('verschoben');
                                let statusBadge = '';
                                if (isCanceled) statusBadge = `<span class="badge" style="background: #e74c3c; color: white;">${m.status}</span>`;
                                else if (isPostponed) statusBadge = `<span class="badge" style="background: #f39c12; color: white;">Verschoben</span>`;

                                let scorersList = '';
                                if (m.scorers && m.scorers.length > 0) {
                                    scorersList = `<div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">⚽ ${m.scorers.map(s => `${s.name} (${s.team}${s.count > 1 ? ` ${s.count}x` : ''})`).join(', ')}</div>`;
                                }

                                let cardsList = '';
                                if (m.cards && m.cards.length > 0) {
                                    cardsList = `<div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">🟨 ${m.cards.map(c => `${c.name} (${c.team}${c.minute ? ` ${c.minute}'` : ''})`).join(', ')}</div>`;
                                }

                                return `
                                    <div class="glass-card" style="padding: 10px var(--space-md); border-radius: 4px; display: flex; flex-direction: column; gap: 4px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                            <span style="font-size: 0.8rem; color: var(--color-text-secondary);">${m.date || ''} ${m.time ? `• ${m.time} Uhr` : ''}</span>
                                            <span style="font-size: 0.8rem; color: var(--color-text-secondary);">${m.location ? `📍 ${m.location}` : ''}</span>
                                        </div>
                                        <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-sm); margin: 4px 0;">
                                            <strong style="text-align: right; color: var(--color-text-primary);">${m.home || m.homeTeam || '-'}</strong>
                                            <div style="text-align: center; min-width: 80px;">
                                                <span style="font-size: 1.1rem; font-weight: 900; color: ${isCanceled ? '#e74c3c' : 'var(--color-accent)'};">${m.score || '-:-'}</span>
                                                ${m.halftime ? `<div style="font-size: 0.75rem; color: var(--color-text-secondary);">(HT ${m.halftime})</div>` : ''}
                                                ${statusBadge}
                                            </div>
                                            <strong style="text-align: left; color: var(--color-text-primary);">${m.away || m.awayTeam || '-'}</strong>
                                        </div>
                                        ${scorersList}
                                        ${cardsList}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (currentModalTab === 'cards') {
        const cardsList = seasonData.stats?.cards || seasonData.cards || [];
        if (cardsList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Keine Karteneinträge für diese Saison vorhanden.</p>';
            return;
        }

        const sortedCards = [...cardsList].sort((a, b) => {
            const ptsB = (b.red || 0) * 5 + (b.yellowRed || 0) * 3 + (b.yellow || 0);
            const ptsA = (a.red || 0) * 5 + (a.yellowRed || 0) * 3 + (a.yellow || 0);
            if (ptsB !== ptsA) return ptsB - ptsA;
            if ((b.red || 0) !== (a.red || 0)) return (b.red || 0) - (a.red || 0);
            return (b.yellow || 0) - (a.yellow || 0);
        });

        container.innerHTML = `
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="admin-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">#</th>
                            <th>Spieler</th>
                            <th>Mannschaft</th>
                            <th style="text-align: center; width: 60px;">🟨</th>
                            <th style="text-align: center; width: 60px;">🟨🟥</th>
                            <th style="text-align: center; width: 60px;">🟥</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedCards.map((c, i) => `
                            <tr>
                                <td style="text-align: center; font-weight: 700; color: var(--color-text-secondary);">${i + 1}</td>
                                <td><strong style="color: var(--color-text-primary);">${c.name}</strong></td>
                                <td style="color: var(--color-text-secondary);">${c.team || '-'}</td>
                                <td style="text-align: center; font-weight: 700;">${c.yellow || 0}</td>
                                <td style="text-align: center; font-weight: 700; color: #f39c12;">${c.yellowRed || 0}</td>
                                <td style="text-align: center; font-weight: 700; color: #e74c3c;">${c.red || 0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentModalTab === 'scorers') {
        const scorersList = seasonData.stats?.topScorers || seasonData.topScorers || seasonData.scorers || [];
        if (scorersList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Keine Torschützen für diese Saison vorhanden.</p>';
            return;
        }

        const sortedScorers = [...scorersList].sort((a, b) => (b.goals || 0) - (a.goals || 0));

        container.innerHTML = `
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="admin-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">#</th>
                            <th>Spieler</th>
                            <th>Mannschaft</th>
                            <th style="text-align: right; width: 80px; font-weight: 700;">Tore ⚽</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedScorers.map((s, i) => `
                            <tr>
                                <td style="text-align: center; font-weight: 700; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${i + 1}</td>
                                <td><strong style="color: var(--color-text-primary);">${s.name}</strong></td>
                                <td style="color: var(--color-text-secondary);">${s.team || '-'}</td>
                                <td style="text-align: right; font-weight: 900; color: var(--color-accent);">${s.goals || 0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

const closeLeagueDataModal = () => {
    const modal = document.getElementById('league-data-modal');
    if (modal) modal.style.display = 'none';
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
    
    // Data modal close & tabs
    const closeDataModalBtn = document.getElementById('btn-close-data-modal');
    if (closeDataModalBtn) closeDataModalBtn.onclick = closeLeagueDataModal;

    const dataModal = document.getElementById('league-data-modal');
    if (dataModal) {
        dataModal.onclick = (e) => {
            if (e.target === dataModal) closeLeagueDataModal();
        };
    }

    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const tab = e.currentTarget.getAttribute('data-modal-tab');
            currentModalTab = tab;
            document.querySelectorAll('.modal-tab-btn').forEach(b => {
                if (b === e.currentTarget) {
                    b.style.background = 'var(--color-accent)';
                    b.style.color = '#000';
                    b.classList.add('active');
                } else {
                    b.style.background = 'none';
                    b.style.color = 'var(--color-text-secondary)';
                    b.classList.remove('active');
                }
            });
            renderModalContent();
        };
    });

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
