import { Store } from '../store.js';

let gamesData = [];
let roundsData = [];
let teamsData = [];
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'date', asc: false };

let editingMatchId = null;
let currentReportMatch = null;
let reportScorersHome = [];
let reportScorersAway = [];
let reportCardsHome = [];
let reportCardsAway = [];

let isEventsBound = false;

export const renderAdminGames = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Übersicht der Spiele</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Verwaltung aller Spielansetzungen, Spielergebnisse und Spielberichte</p>
        </div>

        <!-- Controls Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-game-main" style="background: var(--color-accent); color: #fff; font-weight: 700;">
                <span style="font-size: 1.1rem; line-height: 1;">+</span> Spiel anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="game-search" class="admin-input" placeholder="Team / Ort / Runde suchen..." style="width: 220px;">
                <select id="game-round-filter" class="admin-input" style="width: 200px;">
                    <option value="all">Alle Runden</option>
                </select>
            </div>
        </div>
        
        <div class="table-responsive glass-card" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="date" class="sortable">Datum ↕</th>
                        <th data-sort="venue" class="sortable">Ort ↕</th>
                        <th data-sort="round" class="sortable">Runde ↕</th>
                        <th data-sort="home" class="sortable">Heimmannschaft ↕</th>
                        <th data-sort="away" class="sortable">Auswärtsmannschaft ↕</th>
                        <th data-sort="score" class="sortable" style="text-align: center;">Ergebnis ↕</th>
                        <th data-sort="ht" class="sortable" style="text-align: center;">Halbzeit ↕</th>
                        <th>Sonstiges</th>
                        <th style="min-width: 280px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="games-table-body">
                    <tr><td colspan="9" style="text-align: center; padding: 2rem;">Lade Spiele...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="games-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-g" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-g" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Modal 1: Spiel anlegen / bearbeiten -->
        <div id="game-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 9999; justify-content: center; align-items: center; padding: 20px; backdrop-filter: blur(4px);">
            <div class="glass-card modal-content" style="width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="game-modal-title" style="margin: 0; font-size: 1.3rem;">Spiel hinzufügen</h3>
                    <button type="button" class="btn-close-game-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>
                
                <form id="main-game-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Datum & Uhrzeit</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                            <input type="date" id="input-game-date" class="admin-input" required>
                            <input type="time" id="input-game-time" class="admin-input" value="16:00" required>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Ort</label>
                        <input type="text" id="input-game-location" class="admin-input" value="DSG-Platz" placeholder="z.B. Sportplatz Traun, DSG-Platz" style="width: 100%;" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Runde</label>
                        <select id="input-game-round" class="admin-input" style="width: 100%;" required>
                            <!-- Populated with active rounds -->
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Heimmannschaft</label>
                            <select id="input-game-home" class="admin-input" style="width: 100%;" required>
                                <option value="">-- Team wählen --</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Auswärtsmannschaft</label>
                            <select id="input-game-away" class="admin-input" style="width: 100%;" required>
                                <option value="">-- Team wählen --</option>
                            </select>
                        </div>
                    </div>

                    <div id="game-status-wrapper" style="display: none;">
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Spielstatus</label>
                        <select id="input-game-status" class="admin-input" style="width: 100%;">
                            <option value="Upcoming">Ausstehend / Geplant</option>
                            <option value="Played">Gespielt</option>
                            <option value="Postponed">Verschoben</option>
                            <option value="Canceled">Abgesagt</option>
                            <option value="Abgesagt 3:0">Abgesagt 3:0 (Heim gewinnt)</option>
                            <option value="Abgesagt 0:3">Abgesagt 0:3 (Auswärts gewinnt)</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 4px;">Sonstiges</label>
                        <input type="text" id="input-game-note" class="admin-input" placeholder="Sonstiges (optional)..." style="width: 100%;">
                    </div>

                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="submit" id="btn-save-game-submit" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Bestätigen</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal 2: Spielbericht eingeben -->
        <div id="report-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; box-sizing: border-box; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center; padding: 20px; backdrop-filter: blur(4px);">
            <div class="glass-card modal-content" style="width: 100%; max-width: 900px; max-height: 92vh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 15px 50px rgba(0,0,0,0.35);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 style="margin: 0; font-size: 1.4rem;">Spielbericht eingeben</h3>
                    <button type="button" class="btn-close-report-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>

                <!-- Match Header Information Card -->
                <div class="glass-card" style="padding: var(--space-md); background: rgba(0,150,64,0.04); border-left: 4px solid var(--color-accent); margin-bottom: var(--space-md);">
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary);" id="report-match-title">Walker FC gegen DSG Union Traun</div>
                    <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;" id="report-match-meta">2026 Herbst | 31.10.2026 16:00:00 | DSG-Platz</div>
                </div>

                <form id="report-form" style="display: flex; flex-direction: column; gap: var(--space-lg);">
                    <!-- Score & Halftime Section -->
                    <div style="background: rgba(0,0,0,0.02); padding: var(--space-md); border-radius: 6px; border: var(--glass-border);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                            <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;" id="lbl-goals-home">Tore Heim</label>
                                <input type="number" id="report-ft-home" min="0" max="99" class="admin-input" placeholder="0" style="width: 100%; font-size: 1.1rem; font-weight: 700;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;" id="lbl-goals-away">Tore Auswärts</label>
                                <input type="number" id="report-ft-away" min="0" max="99" class="admin-input" placeholder="0" style="width: 100%; font-size: 1.1rem; font-weight: 700;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-sm);">
                            <div>
                                <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;" id="lbl-ht-home">Tore Heim Halbzeit</label>
                                <input type="number" id="report-ht-home" min="0" max="99" class="admin-input" placeholder="0" style="width: 100%;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;" id="lbl-ht-away">Tore Auswärts Halbzeit</label>
                                <input type="number" id="report-ht-away" min="0" max="99" class="admin-input" placeholder="0" style="width: 100%;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md); margin-top: var(--space-sm);">
                            <div>
                                <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Sonstiges</label>
                                <input type="text" id="report-note" class="admin-input" placeholder="Bemerkungen / Sonstiges..." style="width: 100%;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Spielabbruch / Status</label>
                                <select id="report-cancel-select" class="admin-input" style="width: 100%;">
                                    <option value="none">Keine (Regulär)</option>
                                    <option value="Abgesagt 3:0">Abgesagt 3:0 (Heimsieg)</option>
                                    <option value="Abgesagt 0:3">Abgesagt 0:3 (Auswärtssieg)</option>
                                    <option value="Postponed">Verschoben</option>
                                    <option value="Canceled">Abgesagt</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Übersicht Karten (Disciplinary) -->
                    <div>
                        <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">Übersicht Karten</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                            <!-- Home Cards -->
                            <div class="glass-card" style="padding: var(--space-sm);">
                                <h5 id="report-card-heading-home" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten Heim</h5>
                                <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                                    <select id="report-card-type-home" class="admin-input" style="width: 95px; font-size: 0.8rem;">
                                        <option value="yellow">Gelb</option>
                                        <option value="yellowRed">Gelb-Rot</option>
                                        <option value="red">Rot</option>
                                    </select>
                                    <select id="report-card-player-home" class="admin-input" style="flex: 1; font-size: 0.8rem;">
                                        <option value="">-- Spieler wählen --</option>
                                    </select>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="report-card-reason-home" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                                    <button type="button" id="btn-add-card-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-cards-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>

                            <!-- Away Cards -->
                            <div class="glass-card" style="padding: var(--space-sm);">
                                <h5 id="report-card-heading-away" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten Auswärts</h5>
                                <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                                    <select id="report-card-type-away" class="admin-input" style="width: 95px; font-size: 0.8rem;">
                                        <option value="yellow">Gelb</option>
                                        <option value="yellowRed">Gelb-Rot</option>
                                        <option value="red">Rot</option>
                                    </select>
                                    <select id="report-card-player-away" class="admin-input" style="flex: 1; font-size: 0.8rem;">
                                        <option value="">-- Spieler wählen --</option>
                                    </select>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="report-card-reason-away" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                                    <button type="button" id="btn-add-card-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-cards-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Übersicht Tore (Scorers) -->
                    <div>
                        <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">Übersicht Tore</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                            <!-- Home Goals -->
                            <div class="glass-card" style="padding: var(--space-sm);">
                                <h5 id="report-goal-heading-home" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen Heim</h5>
                                <div style="display: flex; gap: 6px;">
                                    <select id="report-scorer-player-home" class="admin-input" style="flex: 1; font-size: 0.8rem;">
                                        <option value="">-- Torschütze wählen --</option>
                                        <option value="Eigentor">Eigentor</option>
                                    </select>
                                    <button type="button" id="btn-add-goal-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-goals-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>

                            <!-- Away Goals -->
                            <div class="glass-card" style="padding: var(--space-sm);">
                                <h5 id="report-goal-heading-away" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen Auswärts</h5>
                                <div style="display: flex; gap: 6px;">
                                    <select id="report-scorer-player-away" class="admin-input" style="flex: 1; font-size: 0.8rem;">
                                        <option value="">-- Torschütze wählen --</option>
                                        <option value="Eigentor">Eigentor</option>
                                    </select>
                                    <button type="button" id="btn-add-goal-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-goals-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-sm);">
                        <button type="submit" id="btn-save-report" class="primary-btn" style="flex: 1; padding: 12px; font-weight: 700; font-size: 1rem; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Spielbericht speichern</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

const normalizeTeamName = (name) => {
    return (name || '').toLowerCase()
        .replace(/fc|dsg|sv|u\.|union|\./g, '')
        .replace(/\s+/g, '')
        .trim();
};

const getTeamPlayersList = (teamName) => {
    const normTeam = normalizeTeamName(teamName);
    if (!normTeam || !playersData || !Array.isArray(playersData)) return [];

    return playersData.filter(p => {
        const pNorm = normalizeTeamName(p.Team || p.team);
        return pNorm === normTeam || (pNorm && normTeam && (pNorm.includes(normTeam) || normTeam.includes(pNorm)));
    }).map(p => {
        const fn = (p.Vorname || p.firstName || '').trim();
        const ln = (p.Nachname || p.lastName || '').trim();
        return `${fn} ${ln}`.trim();
    }).filter(Boolean).sort();
};

const formatDisplayDate = (dateStr, timeStr) => {
    if (!dateStr) return '-';
    let d = dateStr;
    // convert from YYYY-MM-DD or DD.MM.YY to standard readable
    if (d.includes('-')) {
        const parts = d.split('-');
        if (parts.length === 3) d = `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return `${d} ${timeStr || ''}`.trim();
};

const filterAndSortGames = () => {
    const searchVal = (document.getElementById('game-search')?.value || '').toLowerCase().trim();
    const roundFilter = document.getElementById('game-round-filter')?.value || 'all';

    filteredData = gamesData.filter(m => {
        const matchesSearch = !searchVal || 
            (m.home && m.home.toLowerCase().includes(searchVal)) ||
            (m.away && m.away.toLowerCase().includes(searchVal)) ||
            (m.venue && m.venue.toLowerCase().includes(searchVal)) ||
            (m.location && m.location.toLowerCase().includes(searchVal)) ||
            (m.round && m.round.toLowerCase().includes(searchVal)) ||
            (m.date && m.date.toLowerCase().includes(searchVal));

        const matchesRound = roundFilter === 'all' || m.round === roundFilter || String(m.roundNr) === roundFilter;

        return matchesSearch && matchesRound;
    });

    // Sorting
    filteredData.sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

        if (currentSort.column === 'date') {
            const parseD = (d) => {
                if (!d) return 0;
                if (d.includes('.')) {
                    const p = d.split('.');
                    if (p.length === 3) {
                        const y = p[2].length === 2 ? `20${p[2]}` : p[2];
                        return new Date(`${y}-${p[1]}-${p[0]}`).getTime() || 0;
                    }
                }
                return new Date(d).getTime() || 0;
            };
            valA = parseD(a.date);
            valB = parseD(b.date);
            return currentSort.asc ? valA - valB : valB - valA;
        }

        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();

        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });
};

const renderGamesTable = () => {
    const tbody = document.getElementById('games-table-body');
    if (!tbody) return;

    filterAndSortGames();

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageRows = filteredData.slice(startIdx, startIdx + rowsPerPage);

    const pageInfo = document.getElementById('games-page-info');
    if (pageInfo) {
        pageInfo.innerText = `Zeige ${totalRows === 0 ? 0 : startIdx + 1} bis ${Math.min(startIdx + rowsPerPage, totalRows)} von ${totalRows} Spielen`;
    }

    const prevBtn = document.getElementById('btn-prev-page-g');
    const nextBtn = document.getElementById('btn-next-page-g');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Spiele gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(m => {
        const rawIndex = gamesData.indexOf(m);
        const scoreDisplay = (m.score && m.score !== '-:-') ? m.score : ':';
        const htDisplay = m.ht ? m.ht : ':';
        const venue = m.venue || m.location || 'DSG-Platz';
        const dateDisplay = formatDisplayDate(m.date, m.time);

        let noteBadge = m.note || '';
        if (m.status === 'Abgesagt 3:0') noteBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">Abgesagt 3:0</span>';
        else if (m.status === 'Abgesagt 0:3') noteBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">Abgesagt 0:3</span>';
        else if (m.status === 'Postponed') noteBadge = '<span class="badge badge-secondary" style="font-size: 0.75rem;">Verschoben</span>';
        else if (m.status === 'Canceled') noteBadge = '<span class="badge badge-danger" style="font-size: 0.75rem;">Abgesagt</span>';

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text-primary); font-size: 0.85rem;">${dateDisplay}</td>
                <td style="color: var(--color-text-secondary); font-size: 0.85rem;">${venue}</td>
                <td style="font-weight: 600; color: var(--color-accent); font-size: 0.85rem;">${m.round || '-'}</td>
                <td style="font-weight: 700; color: var(--color-text-primary);">${m.home || '-'}</td>
                <td style="font-weight: 700; color: var(--color-text-primary);">${m.away || '-'}</td>
                <td style="text-align: center; font-weight: 800; font-size: 1.05rem; color: var(--color-accent);">${scoreDisplay}</td>
                <td style="text-align: center; color: var(--color-text-secondary); font-size: 0.9rem;">${htDisplay}</td>
                <td>${noteBadge}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center; flex-wrap: wrap;">
                        <button class="btn-edit-game" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Editieren</button>
                        <button class="btn-delete-game" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Löschen</button>
                        <button class="btn-report-game" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Spielbericht</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Bind row action buttons
    tbody.querySelectorAll('.btn-edit-game').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            openEditGameModal(idx);
        };
    });

    tbody.querySelectorAll('.btn-delete-game').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            deleteGame(idx);
        };
    });

    tbody.querySelectorAll('.btn-report-game').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            openReportModal(idx);
        };
    });
};

const populateFilterAndFormDropdowns = () => {
    const roundFilterSelect = document.getElementById('game-round-filter');
    const modalRoundSelect = document.getElementById('input-game-round');
    const modalHomeSelect = document.getElementById('input-game-home');
    const modalAwaySelect = document.getElementById('input-game-away');

    // Unique rounds from matches and roundsData
    const allRoundsList = [];
    roundsData.forEach(r => {
        const label = `${r.saison || ''} ${r.jahr || ''} Runde ${r.runde || ''}`.trim() || `Runde ${r.runde}`;
        if (!allRoundsList.some(item => item.label === label)) {
            allRoundsList.push({ label, roundNr: r.runde, full: `${r.runde}. Runde` });
        }
    });

    // Also include rounds from gamesData if any missing
    gamesData.forEach(g => {
        if (g.round && !allRoundsList.some(item => item.label === g.round || item.full === g.round)) {
            allRoundsList.push({ label: g.round, roundNr: g.roundNr, full: g.round });
        }
    });

    if (roundFilterSelect) {
        roundFilterSelect.innerHTML = '<option value="all">Alle Runden</option>' + 
            allRoundsList.map(r => `<option value="${r.full}">${r.full}</option>`).join('');
    }

    if (modalRoundSelect) {
        modalRoundSelect.innerHTML = allRoundsList.map(r => `
            <option value="${r.full}">${r.label || r.full}</option>
        `).join('');
    }

    // Active Teams
    const activeTeams = teamsData.filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv');
    const teamsToShow = activeTeams.length > 0 ? activeTeams : [
        { Name: 'SV Croatia Linz' },
        { Name: 'DSG St. Josef/Oed FC' },
        { Name: 'Union Heiligenberg' },
        { Name: 'Walker FC' },
        { Name: 'FC Gornjak' },
        { Name: 'DSG Union Traun' },
        { Name: 'Etehad Linz' }
    ];

    const teamOptions = '<option value="">-- Team wählen --</option>' + 
        teamsToShow.map(t => `<option value="${t.Name || t.name}">${t.Name || t.name}</option>`).join('');

    if (modalHomeSelect) modalHomeSelect.innerHTML = teamOptions;
    if (modalAwaySelect) modalAwaySelect.innerHTML = teamOptions;
};

const openAddGameModal = () => {
    editingMatchId = null;
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('game-modal-title');
    const statusWrapper = document.getElementById('game-status-wrapper');
    const submitBtn = document.getElementById('btn-save-game-submit');
    if (!modal) return;

    populateFilterAndFormDropdowns();

    title.innerText = 'Spiel hinzufügen';
    submitBtn.innerText = 'Erstellen';
    if (statusWrapper) statusWrapper.style.display = 'none';

    document.getElementById('input-game-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('input-game-time').value = '16:00';
    document.getElementById('input-game-location').value = 'DSG-Platz';
    document.getElementById('input-game-note').value = '';
    document.getElementById('input-game-home').value = '';
    document.getElementById('input-game-away').value = '';

    modal.style.display = 'flex';
};

const openEditGameModal = (idx) => {
    const match = gamesData[idx];
    if (!match) return;

    editingMatchId = match.id || idx;
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('game-modal-title');
    const statusWrapper = document.getElementById('game-status-wrapper');
    const submitBtn = document.getElementById('btn-save-game-submit');
    if (!modal) return;

    populateFilterAndFormDropdowns();

    title.innerText = 'Spiel editieren';
    submitBtn.innerText = 'Bestätigen';
    if (statusWrapper) statusWrapper.style.display = 'block';

    // Parse date for input
    let dVal = match.date || '';
    if (dVal.includes('.')) {
        const parts = dVal.split('.');
        if (parts.length === 3) {
            const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            dVal = `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    document.getElementById('input-game-date').value = dVal;
    document.getElementById('input-game-time').value = match.time || '16:00';
    document.getElementById('input-game-location').value = match.venue || match.location || 'DSG-Platz';
    document.getElementById('input-game-note').value = match.note || '';

    // Match round
    const roundSelect = document.getElementById('input-game-round');
    if (roundSelect) {
        if (!Array.from(roundSelect.options).some(o => o.value === match.round)) {
            const opt = document.createElement('option');
            opt.value = match.round;
            opt.text = match.round;
            opt.selected = true;
            roundSelect.appendChild(opt);
        } else {
            roundSelect.value = match.round;
        }
    }

    document.getElementById('input-game-home').value = match.home || '';
    document.getElementById('input-game-away').value = match.away || '';
    document.getElementById('input-game-status').value = match.status || 'Upcoming';

    modal.style.display = 'flex';
};

const closeGameModal = () => {
    const modal = document.getElementById('game-modal');
    if (modal) modal.style.display = 'none';
};

const deleteGame = (idx) => {
    const match = gamesData[idx];
    if (!match) return;

    if (confirm(`Möchten Sie das Spiel "${match.home} vs. ${match.away}" wirklich löschen?`)) {
        Store.deleteMatch('2026/2027', match.id);
        loadDataAndRender();
    }
};

const saveGameForm = (e) => {
    e.preventDefault();

    const date = document.getElementById('input-game-date').value;
    const time = document.getElementById('input-game-time').value;
    const location = document.getElementById('input-game-location').value.trim();
    const round = document.getElementById('input-game-round').value;
    const home = document.getElementById('input-game-home').value;
    const away = document.getElementById('input-game-away').value;
    const note = document.getElementById('input-game-note').value.trim();
    const status = document.getElementById('input-game-status')?.value || 'Upcoming';

    if (!home || !away) {
        alert('Bitte Heimmannschaft und Auswärtsmannschaft auswählen.');
        return;
    }

    if (home === away) {
        alert('Heim- und Auswärtsmannschaft müssen unterschiedlich sein.');
        return;
    }

    // Format date to DD.MM.YY for compatibility
    let formattedDate = date;
    if (date.includes('-')) {
        const [y, m, d] = date.split('-');
        formattedDate = `${d}.${m}.${y.slice(-2)}`;
    }

    let existingMatch = editingMatchId !== null ? Store.getMatch('2026/2027', editingMatchId) : null;

    const matchData = {
        id: editingMatchId !== null ? editingMatchId : Date.now(),
        date: formattedDate,
        time: time,
        venue: location,
        location: location,
        round: round,
        home: home,
        away: away,
        note: note,
        score: existingMatch ? existingMatch.score : '-:-',
        ht: existingMatch ? existingMatch.ht : '',
        status: status,
        scorers: existingMatch ? (existingMatch.scorers || []) : [],
        cards: existingMatch ? (existingMatch.cards || []) : [],
        events: existingMatch ? (existingMatch.events || []) : []
    };

    Store.saveMatch('2026/2027', matchData);
    closeGameModal();
    loadDataAndRender();
};

/* --- Spielbericht (Match Report) Logic --- */

const openReportModal = (idx) => {
    const match = gamesData[idx];
    if (!match) return;

    currentReportMatch = match;
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    // Set match summary info
    document.getElementById('report-match-title').innerText = `${match.home} gegen ${match.away}`;
    document.getElementById('report-match-meta').innerText = `${match.round || ''} | ${formatDisplayDate(match.date, match.time)} | ${match.venue || match.location || 'DSG-Platz'}`;

    document.getElementById('lbl-goals-home').innerText = `Tore ${match.home}`;
    document.getElementById('lbl-goals-away').innerText = `Tore ${match.away}`;
    document.getElementById('lbl-ht-home').innerText = `Tore ${match.home} Halbzeit`;
    document.getElementById('lbl-ht-away').innerText = `Tore ${match.away} Halbzeit`;
    document.getElementById('report-card-heading-home').innerText = `Karten ${match.home}`;
    document.getElementById('report-card-heading-away').innerText = `Karten ${match.away}`;
    document.getElementById('report-goal-heading-home').innerText = `Torschützen ${match.home}`;
    document.getElementById('report-goal-heading-away').innerText = `Torschützen ${match.away}`;

    // Populate Scores
    let scoreHome = '';
    let scoreAway = '';
    if (match.score && match.score.includes(':') && match.score !== '-:-' && match.score !== ':') {
        const parts = match.score.split(':');
        scoreHome = parts[0].trim();
        scoreAway = parts[1].trim();
    }
    document.getElementById('report-ft-home').value = scoreHome;
    document.getElementById('report-ft-away').value = scoreAway;

    let htHome = '';
    let htAway = '';
    if (match.ht && match.ht.includes(':') && match.ht !== ':') {
        const parts = match.ht.split(':');
        htHome = parts[0].trim();
        htAway = parts[1].trim();
    }
    document.getElementById('report-ht-home').value = htHome;
    document.getElementById('report-ht-away').value = htAway;

    document.getElementById('report-note').value = match.note || '';
    document.getElementById('report-cancel-select').value = (match.status && match.status !== 'Played' && match.status !== 'Upcoming') ? match.status : 'none';

    // Populate Player dropdowns for both teams
    const homePlayers = getTeamPlayersList(match.home);
    const awayPlayers = getTeamPlayersList(match.away);

    const buildPlayerOptions = (players, includeOwnGoal = false) => {
        let opts = '<option value="">-- Spieler wählen --</option>';
        if (includeOwnGoal) opts += '<option value="Eigentor">Eigentor</option>';
        players.forEach(p => {
            opts += `<option value="${p}">${p}</option>`;
        });
        return opts;
    };

    document.getElementById('report-card-player-home').innerHTML = buildPlayerOptions(homePlayers);
    document.getElementById('report-card-player-away').innerHTML = buildPlayerOptions(awayPlayers);
    document.getElementById('report-scorer-player-home').innerHTML = buildPlayerOptions(homePlayers, true);
    document.getElementById('report-scorer-player-away').innerHTML = buildPlayerOptions(awayPlayers, true);

    // Populate Scorers & Cards lists
    reportScorersHome = [];
    reportScorersAway = [];
    (match.scorers || []).forEach(s => {
        const sName = s.name || s.player || '';
        const sTeam = s.team || '';
        if (sTeam === match.home || normalizeTeamName(sTeam) === normalizeTeamName(match.home)) {
            reportScorersHome.push(sName);
        } else {
            reportScorersAway.push(sName);
        }
    });

    reportCardsHome = [];
    reportCardsAway = [];
    (match.cards || []).forEach(c => {
        const cTeam = c.team || '';
        const cObj = { player: c.name || c.player || '', type: c.type || 'yellow', reason: c.reason || '' };
        if (cTeam === match.home || normalizeTeamName(cTeam) === normalizeTeamName(match.home)) {
            reportCardsHome.push(cObj);
        } else {
            reportCardsAway.push(cObj);
        }
    });

    renderReportLists();
    modal.style.display = 'flex';
};

const closeReportModal = () => {
    const modal = document.getElementById('report-modal');
    if (modal) modal.style.display = 'none';
    currentReportMatch = null;
};

const renderReportLists = () => {
    // Render Home Scorers
    const homeGoalsDiv = document.getElementById('report-goals-list-home');
    if (homeGoalsDiv) {
        homeGoalsDiv.innerHTML = reportScorersHome.map((p, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <span>⚽ <strong>${p}</strong></span>
                <button type="button" class="btn-del-goal-h" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">X</button>
            </div>
        `).join('');

        homeGoalsDiv.querySelectorAll('.btn-del-goal-h').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                reportScorersHome.splice(idx, 1);
                renderReportLists();
            };
        });
    }

    // Render Away Scorers
    const awayGoalsDiv = document.getElementById('report-goals-list-away');
    if (awayGoalsDiv) {
        awayGoalsDiv.innerHTML = reportScorersAway.map((p, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <span>⚽ <strong>${p}</strong></span>
                <button type="button" class="btn-del-goal-a" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">X</button>
            </div>
        `).join('');

        awayGoalsDiv.querySelectorAll('.btn-del-goal-a').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                reportScorersAway.splice(idx, 1);
                renderReportLists();
            };
        });
    }

    // Render Home Cards
    const cardBadge = (type) => {
        if (type === 'yellow') return '<span style="background: #f1c40f; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Gelb</span>';
        if (type === 'yellowRed') return '<span style="background: #e67e22; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Gelb-Rot</span>';
        if (type === 'red') return '<span style="background: #e74c3c; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Rot</span>';
        return '';
    };

    const homeCardsDiv = document.getElementById('report-cards-list-home');
    if (homeCardsDiv) {
        homeCardsDiv.innerHTML = reportCardsHome.map((c, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${cardBadge(c.type)}
                    <strong>${c.player}</strong>
                    ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
                </div>
                <button type="button" class="btn-del-card-h" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">X</button>
            </div>
        `).join('');

        homeCardsDiv.querySelectorAll('.btn-del-card-h').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                reportCardsHome.splice(idx, 1);
                renderReportLists();
            };
        });
    }

    // Render Away Cards
    const awayCardsDiv = document.getElementById('report-cards-list-away');
    if (awayCardsDiv) {
        awayCardsDiv.innerHTML = reportCardsAway.map((c, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${cardBadge(c.type)}
                    <strong>${c.player}</strong>
                    ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
                </div>
                <button type="button" class="btn-del-card-a" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">X</button>
            </div>
        `).join('');

        awayCardsDiv.querySelectorAll('.btn-del-card-a').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                reportCardsAway.splice(idx, 1);
                renderReportLists();
            };
        });
    }
};

const saveReportForm = (e) => {
    e.preventDefault();
    if (!currentReportMatch) return;

    const ftHome = document.getElementById('report-ft-home').value.trim();
    const ftAway = document.getElementById('report-ft-away').value.trim();
    const htHome = document.getElementById('report-ht-home').value.trim();
    const htAway = document.getElementById('report-ht-away').value.trim();
    const note = document.getElementById('report-note').value.trim();
    const cancelVal = document.getElementById('report-cancel-select').value;

    let score = '-:-';
    let ht = '';
    let status = 'Upcoming';

    if (cancelVal !== 'none') {
        status = cancelVal;
        if (cancelVal === 'Abgesagt 3:0') {
            score = '3:0';
        } else if (cancelVal === 'Abgesagt 0:3') {
            score = '0:3';
        }
    } else if (ftHome !== '' && ftAway !== '') {
        score = `${ftHome}:${ftAway}`;
        status = 'Played';
        if (htHome !== '' && htAway !== '') {
            ht = `${htHome}:${htAway}`;
        }
    }

    // Build unified scorers array
    const scorers = [];
    reportScorersHome.forEach(p => {
        scorers.push({ name: p, player: p, team: currentReportMatch.home, type: 'goal' });
    });
    reportScorersAway.forEach(p => {
        scorers.push({ name: p, player: p, team: currentReportMatch.away, type: 'goal' });
    });

    // Build unified cards array
    const cards = [];
    reportCardsHome.forEach(c => {
        cards.push({ name: c.player, player: c.player, team: currentReportMatch.home, type: c.type, reason: c.reason });
    });
    reportCardsAway.forEach(c => {
        cards.push({ name: c.player, player: c.player, team: currentReportMatch.away, type: c.type, reason: c.reason });
    });

    // Build events timeline
    const events = [];
    scorers.forEach(s => events.push({ type: 'goal', player: s.name, name: s.name, team: s.team }));
    cards.forEach(c => events.push({ type: c.type, player: c.name, name: c.name, team: c.team, reason: c.reason }));

    const updatedMatch = {
        ...currentReportMatch,
        score: score,
        ht: ht,
        status: status,
        note: note,
        scorers: scorers,
        cards: cards,
        events: events
    };

    Store.saveMatch('2026/2027', updatedMatch);
    closeReportModal();
    loadDataAndRender();
};

const setupEventHandlers = () => {
    // Main toolbar buttons
    const addBtn = document.getElementById('btn-add-game-main');
    if (addBtn) addBtn.onclick = openAddGameModal;

    const searchInput = document.getElementById('game-search');
    if (searchInput) searchInput.oninput = () => {
        currentPage = 1;
        renderGamesTable();
    };

    const roundFilter = document.getElementById('game-round-filter');
    if (roundFilter) roundFilter.onchange = () => {
        currentPage = 1;
        renderGamesTable();
    };

    // Pagination
    const prevBtn = document.getElementById('btn-prev-page-g');
    if (prevBtn) prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderGamesTable();
        }
    };

    const nextBtn = document.getElementById('btn-next-page-g');
    if (nextBtn) nextBtn.onclick = () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderGamesTable();
        }
    };

    // Table sorting
    document.querySelectorAll('#games-table-body th.sortable, .admin-table th.sortable').forEach(th => {
        th.onclick = (e) => {
            const col = e.currentTarget.getAttribute('data-sort');
            if (currentSort.column === col) {
                currentSort.asc = !currentSort.asc;
            } else {
                currentSort.column = col;
                currentSort.asc = true;
            }
            renderGamesTable();
        };
    });

    // Modal 1: Game Form
    document.querySelectorAll('.btn-close-game-modal').forEach(b => {
        b.onclick = closeGameModal;
    });
    const mainGameForm = document.getElementById('main-game-form');
    if (mainGameForm) mainGameForm.onsubmit = saveGameForm;
    const saveGameBtn = document.getElementById('btn-save-game-submit');
    if (saveGameBtn) saveGameBtn.onclick = (e) => { e.preventDefault(); saveGameForm(e); };

    // Modal 2: Report Form
    document.querySelectorAll('.btn-close-report-modal').forEach(b => {
        b.onclick = closeReportModal;
    });
    const reportForm = document.getElementById('report-form');
    if (reportForm) reportForm.onsubmit = saveReportForm;
    const saveReportBtn = document.getElementById('btn-save-report');
    if (saveReportBtn) saveReportBtn.onclick = (e) => { e.preventDefault(); saveReportForm(e); };

    // Add Goal buttons
    const addGoalH = document.getElementById('btn-add-goal-home');
    if (addGoalH) addGoalH.onclick = () => {
        const select = document.getElementById('report-scorer-player-home');
        const val = select ? select.value.trim() : '';
        if (val) {
            reportScorersHome.push(val);
            renderReportLists();
            select.value = '';
        }
    };

    const addGoalA = document.getElementById('btn-add-goal-away');
    if (addGoalA) addGoalA.onclick = () => {
        const select = document.getElementById('report-scorer-player-away');
        const val = select ? select.value.trim() : '';
        if (val) {
            reportScorersAway.push(val);
            renderReportLists();
            select.value = '';
        }
    };

    // Add Card buttons
    const addCardH = document.getElementById('btn-add-card-home');
    if (addCardH) addCardH.onclick = () => {
        const typeSelect = document.getElementById('report-card-type-home');
        const playerSelect = document.getElementById('report-card-player-home');
        const reasonInput = document.getElementById('report-card-reason-home');
        const player = playerSelect ? playerSelect.value.trim() : '';
        if (player) {
            reportCardsHome.push({
                player: player,
                type: typeSelect ? typeSelect.value : 'yellow',
                reason: reasonInput ? reasonInput.value.trim() : ''
            });
            renderReportLists();
            if (playerSelect) playerSelect.value = '';
            if (reasonInput) reasonInput.value = '';
        }
    };

    const addCardA = document.getElementById('btn-add-card-away');
    if (addCardA) addCardA.onclick = () => {
        const typeSelect = document.getElementById('report-card-type-away');
        const playerSelect = document.getElementById('report-card-player-away');
        const reasonInput = document.getElementById('report-card-reason-away');
        const player = playerSelect ? playerSelect.value.trim() : '';
        if (player) {
            reportCardsAway.push({
                player: player,
                type: typeSelect ? typeSelect.value : 'yellow',
                reason: reasonInput ? reasonInput.value.trim() : ''
            });
            renderReportLists();
            if (playerSelect) playerSelect.value = '';
            if (reasonInput) reasonInput.value = '';
        }
    };
};

const loadDataAndRender = async () => {
    try {
        gamesData = Store.getMatches('2026/2027') || [];
        roundsData = await Store.getAdminRounds() || [];
        teamsData = await Store.getAdminTeams() || [];
        playersData = await Store.getAdminPlayers() || [];

        populateFilterAndFormDropdowns();
        renderGamesTable();
    } catch (err) {
        console.error('Error loading games data:', err);
    }
};

export const initAdminGames = async () => {
    // Ensure modals are attached to body for full viewport centered overlay
    const gameModal = document.getElementById('game-modal');
    if (gameModal && gameModal.parentElement !== document.body) {
        document.body.appendChild(gameModal);
    }
    const reportModal = document.getElementById('report-modal');
    if (reportModal && reportModal.parentElement !== document.body) {
        document.body.appendChild(reportModal);
    }

    setupEventHandlers();
    await loadDataAndRender();
};
