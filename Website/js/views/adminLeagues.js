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
            <div style="background: var(--color-surface); max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; padding: var(--space-lg); border-radius: var(--border-radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: var(--glass-border);">
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

                    <!-- Participating Teams Selector -->
                    <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-sm); margin-top: var(--space-xs);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary);">⚽ Teilnehmende Teams</label>
                            <div style="display: flex; gap: 6px;">
                                <button type="button" id="btn-select-all-league-teams" class="btn" style="padding: 3px 8px; font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; border-radius: 4px; color: var(--color-text-primary);">Alle auswählen</button>
                                <button type="button" id="btn-deselect-all-league-teams" class="btn" style="padding: 3px 8px; font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; border-radius: 4px; color: var(--color-text-primary);">Keine</button>
                            </div>
                        </div>
                        <input type="text" id="league-team-search" class="admin-input" placeholder="Teams filtern..." style="width: 100%; margin-bottom: 8px; font-size: 0.85rem; padding: 6px 10px;">
                        
                        <div id="league-teams-checkbox-container" style="max-height: 180px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); padding: 8px 12px; background: rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 6px;">
                            <span style="color: var(--color-text-secondary); font-size: 0.85rem;">Lade Teams...</span>
                        </div>
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
            <div style="background: var(--color-surface); max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; border-radius: var(--border-radius-md); box-shadow: 0 15px 35px rgba(0,0,0,0.35); border: var(--glass-border); overflow: hidden;">
                
                <!-- Fixed Modal Top Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--color-border); background: rgba(0,0,0,0.02); flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <h3 id="league-data-title" style="margin: 0; font-size: 1.25rem; font-weight: 700;">Liga Details</h3>
                        <span id="league-data-badge" class="badge badge-secondary" style="font-size: 0.75rem;">Inaktiv</span>
                    </div>
                    <button type="button" id="btn-close-data-modal" style="background: none; border: none; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--color-text-secondary); padding: 4px 8px;">&times;</button>
                </div>

                <!-- Fixed Modal Sub-Nav Tabs (Never scrolls out of view) -->
                <div id="league-data-tab-bar" style="display: flex; gap: 8px; padding: 12px 24px; border-bottom: 1px solid var(--color-border); background: rgba(0,0,0,0.03); overflow-x: auto; flex-shrink: 0;">
                    <button class="modal-tab-btn" data-modal-tab="table" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s;">📊 Tabelle</button>
                    <button class="modal-tab-btn" data-modal-tab="matches" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s;">⚽ Spielberichte</button>
                    <button class="modal-tab-btn" data-modal-tab="cards" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s;">🟨 Karten</button>
                    <button class="modal-tab-btn" data-modal-tab="scorers" style="padding: 8px 18px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--color-border); cursor: pointer; background: var(--color-surface); color: var(--color-text-primary); transition: all 0.2s;">🎯 Tore</button>
                </div>

                <!-- Scrollable Content Area -->
                <div id="league-data-content" style="padding: 24px; overflow-y: auto; flex: 1; min-height: 300px;">
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
    if (league.name && league.year && !league.name.includes(String(league.year))) {
        return `${league.name} ${league.year}`;
    }
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
                    <button class="btn-league-view" data-action="table" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Tabelle</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="matches" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Spielberichte</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="cards" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Karten</button>
                </td>
                <td style="text-align: center;">
                    <button class="btn-league-view" data-action="scorers" data-idx="${rawIndex}" style="background: rgba(0,179,65,0.06); border: 1px solid rgba(0,179,65,0.4); color: var(--color-accent); font-weight: 600; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Tore</button>
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

const updateModalTabsUI = () => {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        const tab = btn.getAttribute('data-modal-tab');
        if (tab === currentModalTab) {
            btn.style.background = 'var(--color-accent)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--color-accent)';
            btn.style.fontWeight = '700';
            btn.classList.add('active');
        } else {
            btn.style.background = 'var(--color-surface)';
            btn.style.color = 'var(--color-text-primary)';
            btn.style.borderColor = 'var(--color-border)';
            btn.style.fontWeight = '600';
            btn.classList.remove('active');
        }
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

    updateModalTabsUI();
    renderModalContent();
    if (modal) modal.style.display = 'flex';
};

const getMatchGoals = (m) => {
    if (m.events && m.events.length > 0) {
        return m.events.filter(e => e.type === 'goal').map(e => ({
            name: e.name || e.player,
            team: e.team,
            minute: e.minute
        }));
    }
    if (m.scorers && m.scorers.length > 0) {
        return m.scorers.map(s => ({
            name: s.name || s.player,
            team: s.team,
            count: s.count || 1
        }));
    }
    return [];
};

const getMatchCards = (m) => {
    if (m.cards && m.cards.length > 0) {
        return m.cards.map(c => ({
            name: c.name || c.player,
            team: c.team,
            type: c.type || 'yellow',
            minute: c.minute
        }));
    }
    if (m.events && m.events.length > 0) {
        return m.events.filter(e => e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'red').map(e => ({
            name: e.name || e.player,
            team: e.team,
            type: e.type,
            minute: e.minute
        }));
    }
    return [];
};

const renderModalContent = () => {
    const container = document.getElementById('league-data-content');
    if (!container || !selectedLeague) return;

    const seasonKey = getSeasonKey(selectedLeague);
    const storeData = Store.getData();
    const seasonData = storeData.seasons ? storeData.seasons[seasonKey] : null;

    if (!seasonData) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">📁</div>
                <h4 style="color: var(--color-text-primary); margin-bottom: 6px;">Keine Spieldaten vorhanden</h4>
                <p style="font-size: 0.9rem; max-width: 420px; margin: 0 auto;">Für die Saison <strong>${selectedLeague.name} (${seasonKey})</strong> wurden noch keine Daten erfasst oder importiert.</p>
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
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Mannschaften eingetragen.</p>';
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
        const matches = seasonData.schedule || seasonData.matches || [];
        if (matches.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Spielberichte vorhanden.</p>';
            return;
        }

        // Group matches by round
        const roundsMap = {};
        matches.forEach(m => {
            let r = m.round || '1. Runde';
            if (typeof r === 'number') r = `${r}. Runde`;
            if (!roundsMap[r]) roundsMap[r] = [];
            roundsMap[r].push(m);
        });

        const roundKeys = Object.keys(roundsMap).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 24px;">
                ${roundKeys.map(rKey => `
                    <div>
                        <h4 style="color: var(--color-accent); font-size: 1.1rem; margin-bottom: 12px; border-bottom: 2px solid rgba(0,179,65,0.2); padding-bottom: 6px;">${rKey}</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${roundsMap[rKey].map((m, mIdx) => {
                                const matchId = `m-${rKey.replace(/\s+/g, '')}-${mIdx}`;
                                const isCanceled = (m.status || '').toLowerCase().includes('abgesagt');
                                const isPostponed = (m.status || '').toLowerCase().includes('verschoben');
                                let statusBadge = '';
                                if (isCanceled) statusBadge = `<span class="badge" style="background: #e74c3c; color: white; font-size: 0.7rem;">${m.status}</span>`;
                                else if (isPostponed) statusBadge = `<span class="badge" style="background: #f39c12; color: white; font-size: 0.7rem;">Verschoben</span>`;

                                const isTeamMatch = (itemTeam, targetTeam) => {
                                    if (!itemTeam || !targetTeam) return false;
                                    const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^(fc|sc|sv|union|dsg|ask|askoe|st|sankt)/g, '');
                                    const a = clean(itemTeam);
                                    const b = clean(targetTeam);
                                    return itemTeam.toLowerCase().trim() === targetTeam.toLowerCase().trim() ||
                                           (a.length > 2 && b.length > 2 && (a.includes(b) || b.includes(a)));
                                };

                                const homeName = m.home || m.homeTeam || 'Heim';
                                const awayName = m.away || m.awayTeam || 'Gast';

                                const goals = getMatchGoals(m);
                                const cards = getMatchCards(m);

                                const homeGoals = goals.filter(g => isTeamMatch(g.team, homeName));
                                const awayGoals = goals.filter(g => !isTeamMatch(g.team, homeName) && (isTeamMatch(g.team, awayName) || !isTeamMatch(g.team, homeName)));

                                const homeCards = cards.filter(c => isTeamMatch(c.team, homeName));
                                const awayCards = cards.filter(c => !isTeamMatch(c.team, homeName) && (isTeamMatch(c.team, awayName) || !isTeamMatch(c.team, homeName)));

                                const renderTeamGoals = (teamGoals) => {
                                    if (!teamGoals || teamGoals.length === 0) {
                                        return '<p style="color: var(--color-text-secondary); font-size: 0.8rem; margin: 0; font-style: italic; padding: 4px 8px;">Keine Tore</p>';
                                    }
                                    return `
                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            ${teamGoals.map(g => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: rgba(0,0,0,0.03); border-radius: 4px; font-size: 0.85rem;">
                                                    <span style="font-weight: 600; color: var(--color-text-primary);">${g.name} ${g.count > 1 ? `<span style="color: var(--color-accent); font-weight: 700;">(${g.count}x)</span>` : ''}</span>
                                                    <span style="font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600;">${g.minute ? `${g.minute}'` : '⚽'}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `;
                                };

                                const renderTeamCards = (teamCards) => {
                                    if (!teamCards || teamCards.length === 0) {
                                        return '<p style="color: var(--color-text-secondary); font-size: 0.8rem; margin: 0; font-style: italic; padding: 4px 8px;">Keine Karten</p>';
                                    }
                                    return `
                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            ${teamCards.map(c => {
                                                let cardIcon = '🟨';
                                                let cardColor = 'var(--color-text-primary)';
                                                if (c.type === 'yellowRed') { cardIcon = '🟨🟥'; cardColor = '#f39c12'; }
                                                else if (c.type === 'red') { cardIcon = '🟥'; cardColor = '#e74c3c'; }
                                                return `
                                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: rgba(0,0,0,0.03); border-radius: 4px; font-size: 0.85rem;">
                                                        <div style="display: flex; align-items: center; gap: 6px;">
                                                            <span>${cardIcon}</span>
                                                            <span style="font-weight: 600; color: ${cardColor};">${c.name}</span>
                                                        </div>
                                                        <span style="font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600;">${c.minute ? `${c.minute}'` : ''}</span>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    `;
                                };

                                return `
                                    <div class="match-item-card" style="border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface); overflow: hidden; transition: border-color 0.2s;">
                                        <!-- Main Compact Header (Clickable for dropdown) -->
                                        <div class="match-toggle-header" data-target="${matchId}" style="padding: 12px 16px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; user-select: none;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--color-text-secondary);">
                                                <span>📅 ${m.date || ''} ${m.time ? `• ${m.time} Uhr` : ''}</span>
                                                <span>${m.location ? `📍 ${m.location}` : ''}</span>
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px;">
                                                <div style="text-align: right; font-weight: 700; font-size: 0.95rem; color: var(--color-text-primary);">${homeName}</div>
                                                <div style="text-align: center; min-width: 90px; display: flex; flex-direction: column; align-items: center;">
                                                    <span style="font-size: 1.15rem; font-weight: 900; color: ${isCanceled ? '#e74c3c' : 'var(--color-accent)'};">${m.score || '-:-'}</span>
                                                    ${m.ht ? `<span style="font-size: 0.75rem; color: var(--color-text-secondary);">(HT ${m.ht})</span>` : (m.halftime ? `<span style="font-size: 0.75rem; color: var(--color-text-secondary);">(HT ${m.halftime})</span>` : '')}
                                                    ${statusBadge}
                                                </div>
                                                <div style="text-align: left; font-weight: 700; font-size: 0.95rem; color: var(--color-text-primary);">${awayName}</div>
                                            </div>
                                            <div style="display: flex; justify-content: center; align-items: center; margin-top: 2px;">
                                                <span class="accordion-hint" style="font-size: 0.75rem; color: var(--color-accent); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                                    <span class="hint-text">Details anzeigen</span> <span class="hint-arrow">▼</span>
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Collapsible Event Details (Grouped by Team: Home on Left, Away on Right) -->
                                        <div id="${matchId}" class="match-details-body" style="display: none; padding: 16px; border-top: 1px solid var(--color-border); background: rgba(0,0,0,0.015);">
                                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                                                
                                                <!-- Home Team Events (Left) -->
                                                <div style="display: flex; flex-direction: column; gap: 12px; border-right: 1px solid var(--color-border); padding-right: 16px;">
                                                    <div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem; border-bottom: 2px solid rgba(0,179,65,0.4); padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                                                        <span style="color: var(--color-text-primary); font-weight: 800;">${homeName}</span>
                                                        <span style="font-size: 0.7rem; color: var(--color-accent); font-weight: 700; background: rgba(0,179,65,0.1); padding: 2px 6px; border-radius: 4px;">HEIM</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                                            <span>⚽</span> Tore (${homeGoals.reduce((sum, g) => sum + (g.count || 1), 0)})
                                                        </div>
                                                        ${renderTeamGoals(homeGoals)}
                                                    </div>

                                                    <div>
                                                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                                            <span>🟨</span> Karten (${homeCards.length})
                                                        </div>
                                                        ${renderTeamCards(homeCards)}
                                                    </div>
                                                </div>

                                                <!-- Away Team Events (Right) -->
                                                <div style="display: flex; flex-direction: column; gap: 12px; padding-left: 4px;">
                                                    <div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem; border-bottom: 2px solid rgba(0,179,65,0.4); padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                                                        <span style="color: var(--color-text-primary); font-weight: 800;">${awayName}</span>
                                                        <span style="font-size: 0.7rem; color: var(--color-accent); font-weight: 700; background: rgba(0,179,65,0.1); padding: 2px 6px; border-radius: 4px;">GAST</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                                            <span>⚽</span> Tore (${awayGoals.reduce((sum, g) => sum + (g.count || 1), 0)})
                                                        </div>
                                                        ${renderTeamGoals(awayGoals)}
                                                    </div>

                                                    <div>
                                                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                                            <span>🟨</span> Karten (${awayCards.length})
                                                        </div>
                                                        ${renderTeamCards(awayCards)}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Bind match accordion toggles
        container.querySelectorAll('.match-toggle-header').forEach(header => {
            header.onclick = (e) => {
                const targetId = header.getAttribute('data-target');
                const targetBody = document.getElementById(targetId);
                const hintText = header.querySelector('.hint-text');
                const hintArrow = header.querySelector('.hint-arrow');

                if (targetBody) {
                    const isVisible = targetBody.style.display === 'block';
                    targetBody.style.display = isVisible ? 'none' : 'block';
                    if (hintText) hintText.innerText = isVisible ? 'Details anzeigen' : 'Details ausblenden';
                    if (hintArrow) hintArrow.innerText = isVisible ? '▼' : '▲';
                }
            };
        });

    } else if (currentModalTab === 'cards') {
        const cardsList = seasonData.stats?.cards || seasonData.cards || [];
        if (cardsList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Karteneinträge für diese Saison vorhanden.</p>';
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
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Keine Torschützen für diese Saison vorhanden.</p>';
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

let assignedTeamNames = new Set();
let cachedActiveTeams = [];

const renderLeagueTeamsCheckboxes = (filterText = '') => {
    const container = document.getElementById('league-teams-checkbox-container');
    if (!container) return;
    const q = (filterText || '').toLowerCase().trim();
    const visibleTeams = cachedActiveTeams.filter(t => {
        const name = (t.Name || t.name || '').toLowerCase();
        return !q || name.includes(q);
    });

    if (visibleTeams.length === 0) {
        container.innerHTML = '<span style="color: var(--color-text-secondary); font-size: 0.85rem; padding: 4px;">Keine aktiven Teams gefunden.</span>';
        return;
    }

    container.innerHTML = visibleTeams.map(t => {
        const teamName = t.Name || t.name;
        const isChecked = assignedTeamNames.has(teamName.trim().toLowerCase());
        return `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; cursor: pointer; padding: 2px 0;">
                <input type="checkbox" class="league-team-cb" value="${teamName}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--color-accent); width: 16px; height: 16px;">
                <span style="color: var(--color-text-primary); font-weight: ${isChecked ? '600' : '400'};">${teamName}</span>
            </label>
        `;
    }).join('');

    container.querySelectorAll('.league-team-cb').forEach(cb => {
        cb.onchange = (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (e.target.checked) assignedTeamNames.add(val);
            else assignedTeamNames.delete(val);
        };
    });
};

const openEditModal = async (idx = null) => {
    const modal = document.getElementById('league-modal');
    const title = document.getElementById('modal-league-title');
    const nameLabel = document.getElementById('lbl-league-name');
    const submitBtn = document.getElementById('btn-submit-league');
    const deleteBtn = document.getElementById('btn-delete-league');
    
    assignedTeamNames.clear();

    const allTeams = await Store.getAdminTeams();
    cachedActiveTeams = (allTeams || []).filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv');
    cachedActiveTeams.sort((a, b) => (a.Name || a.name || '').localeCompare(b.Name || b.name || ''));

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

        const sKey = getSeasonKey(l);
        const season = Store.getData().seasons ? Store.getData().seasons[sKey] : null;
        if (season && season.teams && Array.isArray(season.teams)) {
            season.teams.forEach(t => {
                if (t && t.name) assignedTeamNames.add(t.name.trim().toLowerCase());
            });
        }
    } else {
        title.innerText = 'Liga hinzufügen';
        if (nameLabel) nameLabel.innerText = 'Name';
        if (submitBtn) submitBtn.innerText = 'Erstellen';
        document.getElementById('edit-league-id').value = 'new';
        document.getElementById('league-edit-form').reset();
        document.getElementById('edit-league-status').value = 'Aktiv';
        deleteBtn.style.display = 'none';

        cachedActiveTeams.forEach(t => assignedTeamNames.add((t.Name || t.name).trim().toLowerCase()));
    }

    renderLeagueTeamsCheckboxes('');
    const teamSearch = document.getElementById('league-team-search');
    if (teamSearch) teamSearch.value = '';

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
            updateModalTabsUI();
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

    const selectAllBtn = document.getElementById('btn-select-all-league-teams');
    if (selectAllBtn) {
        selectAllBtn.onclick = () => {
            cachedActiveTeams.forEach(t => assignedTeamNames.add((t.Name || t.name).trim().toLowerCase()));
            renderLeagueTeamsCheckboxes(document.getElementById('league-team-search')?.value || '');
        };
    }

    const deselectAllBtn = document.getElementById('btn-deselect-all-league-teams');
    if (deselectAllBtn) {
        deselectAllBtn.onclick = () => {
            assignedTeamNames.clear();
            renderLeagueTeamsCheckboxes(document.getElementById('league-team-search')?.value || '');
        };
    }

    const leagueTeamSearch = document.getElementById('league-team-search');
    if (leagueTeamSearch) {
        leagueTeamSearch.oninput = (e) => {
            renderLeagueTeamsCheckboxes(e.target.value);
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
                    const deletedLeague = leaguesData.splice(idx, 1)[0];
                    Store.saveAdminLeagues(leaguesData);
                    Store.deleteLeagueSeason(deletedLeague);
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

            const sKey = getSeasonKey(updatedLeague);
            updatedLeague.seasonKey = sKey;

            if (idVal === 'new') {
                const validIds = leaguesData
                    .map(l => parseInt(l.id) || 0)
                    .filter(n => n > 0 && n < 100000);
                const maxId = validIds.length > 0 ? Math.max(...validIds) : 14;
                updatedLeague.id = maxId + 1;
                leaguesData.unshift(updatedLeague);
            } else {
                const idx = parseInt(idVal);
                leaguesData[idx] = { ...leaguesData[idx], ...updatedLeague };
            }

            const selectedTeamNames = cachedActiveTeams
                .map(t => t.Name || t.name)
                .filter(name => assignedTeamNames.has(name.trim().toLowerCase()));

            Store.saveAdminLeagues(leaguesData);
            Store.ensureLeagueSeason(updatedLeague);
            Store.setLeagueSeasonTeams(sKey, selectedTeamNames);

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
