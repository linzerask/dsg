import { Store } from '../store.js?v=1790560013000';
import { showToast } from './admin.js?v=1790560013000';

let gamesData = [];
let roundsData = [];
let leaguesData = [];
let teamsData = [];
let playersData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: null, asc: true };

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
            <button class="btn-dsg" id="btn-add-game-main" style="background: var(--color-accent); color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Spiel anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="game-search" class="admin-input" placeholder="Team / Ort / Runde..." style="width: 170px;">
                <select id="game-league-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Ligen</option>
                </select>
                <select id="game-round-filter" class="admin-input" style="width: 140px;">
                    <option value="all">Alle Runden</option>
                </select>
                <select id="game-status-filter" class="admin-input" style="width: 150px;">
                    <option value="all">Alle Spiele</option>
                    <option value="played">Nur Gespielte</option>
                    <option value="unplayed">Nur Ausstehend</option>
                    <option value="canceled">Abgesagt/Verschoben</option>
                </select>
                <select id="game-sort-select" class="admin-input" style="width: 175px;">
                    <option value="season-desc">Saison (neueste)</option>
                    <option value="season-asc">Saison (älteste)</option>
                    <option value="date-desc">Datum (neueste)</option>
                    <option value="date-asc" selected>Datum (älteste)</option>
                    <option value="round-asc">Runde (1 → ..)</option>
                    <option value="round-desc">Runde (.. → 1)</option>
                    <option value="league-asc">Liga (A–Z)</option>
                    <option value="home-asc">Heim (A–Z)</option>
                    <option value="away-asc">Auswärts (A–Z)</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="date" class="sortable" style="width: 100px;">Datum ↕</th>
                        <th data-sort="venue" class="sortable" style="max-width: 105px;">Ort ↕</th>
                        <th data-sort="round" class="sortable" style="max-width: 80px;">Runde ↕</th>
                        <th data-sort="home" class="sortable" style="max-width: 125px;">Heim ↕</th>
                        <th data-sort="away" class="sortable" style="max-width: 125px;">Auswärts ↕</th>
                        <th data-sort="score" class="sortable" style="text-align: center; width: 65px;">Ergebnis ↕</th>
                        <th data-sort="ht" class="sortable" style="text-align: center; width: 55px;">HZ ↕</th>
                        <th style="max-width: 75px;">Sonstiges</th>
                        <th style="text-align: center; width: 115px;">Aktionen</th>
                    </tr>
                </thead>
                <tbody id="games-table-body">
                    <tr><td colspan="9" style="text-align: center; padding: 2rem;">Lade Spiele...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card Accordion View -->
        <div id="games-mobile-cards" class="admin-mobile-cards">
            <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Lade Spiele...</div>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="games-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-g" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-g" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Modal 1: Spiel anlegen / bearbeiten -->
        <div id="game-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="game-modal-title" style="margin: 0; font-size: 1.3rem; color: var(--color-text-primary);">Spiel hinzufügen</h3>
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
        <div id="report-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 900px; max-height: 92vh; overflow-y: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 48px rgba(0,0,0,0.35);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 style="margin: 0; font-size: 1.4rem; color: var(--color-text-primary);">Spielbericht eingeben</h3>
                    <button type="button" class="btn-close-report-modal btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>

                <!-- Match Header Information Card -->
                <div class="glass-card" style="padding: var(--space-md); background: rgba(0,150,64,0.08); border-left: 4px solid var(--color-accent); margin-bottom: var(--space-md);">
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary);" id="report-match-title">Walker FC gegen DSG Union Traun</div>
                    <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;" id="report-match-meta">2026 Herbst | 31.10.2026 16:00:00 | DSG-Platz</div>
                </div>

                <form id="report-form" style="display: flex; flex-direction: column; gap: var(--space-lg);">
                    <!-- Score & Halftime Section -->
                    <div style="background: var(--color-surface-hover); padding: var(--space-md); border-radius: 6px; border: 1px solid var(--color-border);">
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

const parseGameDate = (dateStr, timeStr) => {
    if (!dateStr) return 0;
    const str = String(dateStr).trim();
    let year = 1970, month = 0, day = 1;
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            year = parseInt(parts[0]) || 1970;
            month = (parseInt(parts[1]) || 1) - 1;
            day = parseInt(parts[2]) || 1;
        }
    } else if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            day = parseInt(parts[0]) || 1;
            month = (parseInt(parts[1]) || 1) - 1;
            year = parseInt(parts[2]) || 1970;
            if (year < 100) year += 2000;
        }
    }
    let hours = 0, minutes = 0;
    if (timeStr && String(timeStr).includes(':')) {
        const tParts = String(timeStr).split(':');
        hours = parseInt(tParts[0]) || 0;
        minutes = parseInt(tParts[1]) || 0;
    }
    return new Date(year, month, day, hours, minutes).getTime() || 0;
};

const extractSeasonYear = (m) => {
    if (!m) return 0;
    const yrStr = String(m.seasonKey || m.season || m.jahr || '').replace(/\D/g, '');
    if (yrStr.length >= 4) return parseInt(yrStr.slice(0, 4)) || 0;
    return 0;
};

const extractRoundNumber = (m) => {
    if (!m) return 0;
    const str = String(m.round || m.roundNr || '');
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) || 0 : 0;
};

const getDisplayLeagueName = (m) => {
    if (!m) return 'DSG Liga';
    if (m.leagueName) return m.leagueName;
    const sKey = m.seasonKey || '';
    return sKey ? (sKey.startsWith('DSG') || sKey.startsWith('1.') || sKey.startsWith('Saison') || sKey.startsWith('Liga') ? sKey : `DSG Liga ${sKey}`) : 'DSG Liga';
};

const formatDisplayDate = (dateStr, timeStr) => {
    if (!dateStr) return '-';
    let str = String(dateStr).trim();
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            str = `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
        }
    } else if (str.includes('.')) {
        const parts = str.split('.');
        if (parts.length === 3) {
            let yr = parts[2];
            if (yr.length === 2) yr = '20' + yr;
            str = `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${yr}`;
        }
    }
    return `${str} ${timeStr || ''}`.trim();
};

const filterAndSortGames = () => {
    const searchVal = (document.getElementById('game-search')?.value || '').toLowerCase().trim();
    const leagueFilter = document.getElementById('game-league-filter')?.value || 'all';
    const roundFilter = document.getElementById('game-round-filter')?.value || 'all';
    const statusFilter = document.getElementById('game-status-filter')?.value || 'all';
    const sortVal = document.getElementById('game-sort-select')?.value || 'date-asc';

    filteredData = gamesData.filter(m => {
        const dispDate = formatDisplayDate(m.date, m.time).toLowerCase();
        const dispLeague = getDisplayLeagueName(m).toLowerCase();
        const matchesSearch = !searchVal || 
            (m.home && m.home.toLowerCase().includes(searchVal)) ||
            (m.away && m.away.toLowerCase().includes(searchVal)) ||
            (m.venue && m.venue.toLowerCase().includes(searchVal)) ||
            (m.location && m.location.toLowerCase().includes(searchVal)) ||
            (m.round && m.round.toLowerCase().includes(searchVal)) ||
            (m.date && m.date.toLowerCase().includes(searchVal)) ||
            dispDate.includes(searchVal) ||
            dispLeague.includes(searchVal);

        const matchesLeague = leagueFilter === 'all' || m.seasonKey === leagueFilter || dispLeague === leagueFilter.toLowerCase();

        const matchesRound = roundFilter === 'all' || m.round === roundFilter || String(m.roundNr) === roundFilter || (m.round && m.round.includes(roundFilter));

        let matchesStatus = true;
        const isPlayed = (m.score && m.score !== '-:-' && m.score !== ':' && m.score.trim() !== '') || m.status === 'Played' || m.status === 'Gespielt';
        const isCanceledOrPostponed = m.status === 'Postponed' || m.status === 'Canceled' || (m.status && m.status.startsWith('Abgesagt'));
        const isUnplayed = !isPlayed && !isCanceledOrPostponed;

        if (statusFilter === 'played') {
            matchesStatus = isPlayed;
        } else if (statusFilter === 'unplayed') {
            matchesStatus = isUnplayed;
        } else if (statusFilter === 'canceled') {
            matchesStatus = isCanceledOrPostponed;
        }

        return matchesSearch && matchesLeague && matchesRound && matchesStatus;
    });

    // Multi-tier sorting based on sortVal dropdown
    filteredData.sort((a, b) => {
        if (sortVal === 'season-desc') {
            const diffYear = extractSeasonYear(b) - extractSeasonYear(a);
            if (diffYear !== 0) return diffYear;
            const diffRound = extractRoundNumber(a) - extractRoundNumber(b);
            if (diffRound !== 0) return diffRound;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'season-asc') {
            const diffYear = extractSeasonYear(a) - extractSeasonYear(b);
            if (diffYear !== 0) return diffYear;
            const diffRound = extractRoundNumber(a) - extractRoundNumber(b);
            if (diffRound !== 0) return diffRound;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'date-desc') {
            const diffDate = parseGameDate(b.date, b.time) - parseGameDate(a.date, a.time);
            if (diffDate !== 0) return diffDate;
            return extractRoundNumber(b) - extractRoundNumber(a);
        }
        if (sortVal === 'date-asc') {
            const diffDate = parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
            if (diffDate !== 0) return diffDate;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }
        if (sortVal === 'round-asc') {
            const diffRound = extractRoundNumber(a) - extractRoundNumber(b);
            if (diffRound !== 0) return diffRound;
            const diffYear = extractSeasonYear(b) - extractSeasonYear(a);
            if (diffYear !== 0) return diffYear;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'round-desc') {
            const diffRound = extractRoundNumber(b) - extractRoundNumber(a);
            if (diffRound !== 0) return diffRound;
            const diffYear = extractSeasonYear(b) - extractSeasonYear(a);
            if (diffYear !== 0) return diffYear;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'league-asc') {
            const lComp = (getDisplayLeagueName(a) || '').localeCompare(getDisplayLeagueName(b) || '', 'de');
            if (lComp !== 0) return lComp;
            return extractRoundNumber(a) - extractRoundNumber(b);
        }
        if (sortVal === 'home-asc') {
            const hComp = (a.home || '').localeCompare(b.home || '', 'de');
            if (hComp !== 0) return hComp;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'away-asc') {
            const aComp = (a.away || '').localeCompare(b.away || '', 'de');
            if (aComp !== 0) return aComp;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        return 0;
    });

    // Secondary table header click sorting if active
    if (currentSort.column) {
        filteredData.sort((a, b) => {
            let valA = a[currentSort.column] || '';
            let valB = b[currentSort.column] || '';

            if (currentSort.column === 'date') {
                const timeA = parseGameDate(a.date, a.time);
                const timeB = parseGameDate(b.date, b.time);
                if (timeA !== timeB) return currentSort.asc ? timeA - timeB : timeB - timeA;
                return extractRoundNumber(a) - extractRoundNumber(b);
            }

            if (currentSort.column === 'round') {
                const numA = extractRoundNumber(a);
                const numB = extractRoundNumber(b);
                if (numA !== numB) return currentSort.asc ? numA - numB : numB - numA;
                return extractSeasonYear(b) - extractSeasonYear(a);
            }

            if (currentSort.column === 'venue') {
                const vA = String(a.venue || a.location || '').toLowerCase();
                const vB = String(b.venue || b.location || '').toLowerCase();
                return currentSort.asc ? vA.localeCompare(vB, 'de') : vB.localeCompare(vA, 'de');
            }

            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();

            return currentSort.asc ? 
                valA.localeCompare(valB, 'de', { numeric: true }) : 
                valB.localeCompare(valA, 'de', { numeric: true });
        });
    }
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

        const roundDisplay = m.round ? m.round.replace(/\s+\d{2}\.\d{2}\..*$/, '') : '-';

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text-primary); font-size: 0.82rem; white-space: nowrap;">${dateDisplay}</td>
                <td style="color: var(--color-text-secondary); font-size: 0.82rem; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${venue}">${venue}</td>
                <td style="font-weight: 600; color: var(--color-accent); font-size: 0.82rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.round || ''}">${roundDisplay}</td>
                <td style="font-weight: 700; color: var(--color-text-primary); font-size: 0.85rem; max-width: 125px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.home || ''}">${m.home || '-'}</td>
                <td style="font-weight: 700; color: var(--color-text-primary); font-size: 0.85rem; max-width: 125px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.away || ''}">${m.away || '-'}</td>
                <td style="text-align: center; font-weight: 800; font-size: 1rem; color: var(--color-accent); white-space: nowrap;">${scoreDisplay}</td>
                <td style="text-align: center; color: var(--color-text-secondary); font-size: 0.82rem; white-space: nowrap;">${htDisplay}</td>
                <td style="max-width: 75px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.note || m.status || ''}">${noteBadge}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <div style="display: inline-flex; gap: 3px; justify-content: center; align-items: center;">
                        <button class="btn-report-game" data-idx="${rawIndex}" title="Spielbericht erfassen" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                            Bericht
                        </button>
                        <button class="btn-edit-game" data-idx="${rawIndex}" title="Spiel bearbeiten" style="background: rgba(0,0,0,0.04); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-delete-game" data-idx="${rawIndex}" title="Spiel löschen" style="background: rgba(220,53,69,0.08); color: #dc3545; border: 1px solid rgba(220,53,69,0.25); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render Mobile Accordion Cards
    const mobileCardsContainer = document.getElementById('games-mobile-cards');
    if (mobileCardsContainer) {
        if (pageRows.length === 0) {
            mobileCardsContainer.innerHTML = '<div class="glass-card" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Spiele gefunden.</div>';
        } else {
            mobileCardsContainer.innerHTML = pageRows.map(m => {
                const rawIndex = gamesData.indexOf(m);
                const scoreDisplay = (m.score && m.score !== '-:-') ? m.score : ':';
                const htDisplay = m.ht ? m.ht : ':';
                const venue = m.venue || m.location || 'DSG-Platz';
                const dateDisplay = formatDisplayDate(m.date, m.time);

                let noteBadge = m.note || '';
                if (m.status === 'Abgesagt 3:0') noteBadge = '<span class="badge badge-danger" style="font-size: 0.72rem;">Abgesagt 3:0</span>';
                else if (m.status === 'Abgesagt 0:3') noteBadge = '<span class="badge badge-danger" style="font-size: 0.72rem;">Abgesagt 0:3</span>';
                else if (m.status === 'Postponed') noteBadge = '<span class="badge badge-secondary" style="font-size: 0.72rem;">Verschoben</span>';
                else if (m.status === 'Canceled') noteBadge = '<span class="badge badge-danger" style="font-size: 0.72rem;">Abgesagt</span>';

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 4px;">
                                    <div class="admin-m-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        <strong>${m.home || '-'}</strong> vs <strong>${m.away || '-'}</strong>
                                    </div>
                                    <span style="font-weight: 900; font-size: 1.15rem; color: var(--color-accent); flex-shrink: 0;">${scoreDisplay}</span>
                                </div>
                                <div class="admin-m-subtitle">
                                    <span style="color: var(--color-accent); font-weight: 700;">${m.round || 'Spiel'}</span>
                                    <span>•</span>
                                    <span>${dateDisplay}</span>
                                    ${noteBadge ? `<span>•</span> ${noteBadge}` : ''}
                                </div>
                            </div>
                            <div class="admin-m-chevron">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        <div class="admin-m-body">
                            <div class="admin-m-grid">
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Spielort</span>
                                    <span class="admin-m-value">${venue}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Halbzeitstand</span>
                                    <span class="admin-m-value">${htDisplay}</span>
                                </div>
                                <div class="admin-m-grid-item" style="grid-column: 1 / -1;">
                                    <span class="admin-m-label">Status / Notiz</span>
                                    <span class="admin-m-value">${m.status || m.note || 'Regulär'}</span>
                                </div>
                            </div>
                            <div class="admin-m-actions">
                                <button class="btn-report-game full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                    Spielbericht erfassen
                                </button>
                                <button class="btn-edit-game" data-idx="${rawIndex}" style="background: rgba(0,0,0,0.06); color: var(--color-text-primary); border: var(--glass-border); display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Editieren
                                </button>
                                <button class="btn-delete-game" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    Löschen
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Accordion toggle on header click
            mobileCardsContainer.querySelectorAll('.admin-m-header').forEach(hdr => {
                hdr.onclick = () => {
                    const card = hdr.closest('.admin-m-card');
                    if (card) card.classList.toggle('expanded');
                };
            });
        }
    }

    // Bind row action buttons across both Desktop and Mobile views
    const container = document.getElementById('admin-games');
    if (container) {
        container.querySelectorAll('.btn-edit-game').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditGameModal(idx);
            };
        });

        container.querySelectorAll('.btn-delete-game').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                deleteGame(idx);
            };
        });

        container.querySelectorAll('.btn-report-game').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openReportModal(idx);
            };
        });
    }
};

const updateTeamsForSelectedRound = () => {
    const roundSelect = document.getElementById('input-game-round');
    const homeSelect = document.getElementById('input-game-home');
    const awaySelect = document.getElementById('input-game-away');
    const selectedOpt = roundSelect?.selectedOptions[0];
    const sKey = selectedOpt?.getAttribute('data-season-key') || (Store.getData()?.currentSeason || '2022/2023');

    const seasonTeams = Store.getLiga(sKey);
    let teamsToDisplay = [];
    if (seasonTeams && seasonTeams.length > 0) {
        teamsToDisplay = seasonTeams.map(t => ({ name: t.name }));
    } else {
        teamsToDisplay = (teamsData || []).filter(t => t.Status === 'Aktiv' || t.status === 'Aktiv');
    }
    if (teamsToDisplay.length === 0) {
        teamsToDisplay = teamsData || [];
    }

    const teamOptions = '<option value="">-- Team wählen --</option>' + 
        teamsToDisplay.map(t => `<option value="${t.Name || t.name}">${t.Name || t.name}</option>`).join('');

    if (homeSelect) {
        const prevHome = homeSelect.value;
        homeSelect.innerHTML = teamOptions;
        if (prevHome) homeSelect.value = prevHome;
    }
    if (awaySelect) {
        const prevAway = awaySelect.value;
        awaySelect.innerHTML = teamOptions;
        if (prevAway) awaySelect.value = prevAway;
    }
};

const populateFilterAndFormDropdowns = () => {
    const leagueFilterSelect = document.getElementById('game-league-filter');
    const roundFilterSelect = document.getElementById('game-round-filter');
    const modalRoundSelect = document.getElementById('input-game-round');

    // Populate League filter dropdown
    if (leagueFilterSelect) {
        const prevVal = leagueFilterSelect.value || 'all';
        const leagueOptions = (leaguesData || []).map(l => {
            const key = l.seasonKey || l.name;
            const label = l.name && l.year ? `${l.name} ${l.year}` : (l.name || key);
            return `<option value="${key}">${label}</option>`;
        }).join('');
        leagueFilterSelect.innerHTML = '<option value="all">Alle Ligen</option>' + leagueOptions;
        if (prevVal && Array.from(leagueFilterSelect.options).some(o => o.value === prevVal)) {
            leagueFilterSelect.value = prevVal;
        }
    }

    // Unique rounds from matches and roundsData
    const allRoundsList = [];
    (roundsData || []).forEach(r => {
        const matchingLeague = (leaguesData || []).find(l => 
            (l.seasonKey && r.seasonKey && l.seasonKey === r.seasonKey) ||
            (l.name && (r.liga === l.name || r.saison === l.name))
        );
        let leagueName = matchingLeague?.name || r.liga || r.saison || 'DSG Liga';
        const sKey = r.seasonKey || r.jahr || '';
        if (sKey) {
            leagueName = leagueName.replace(sKey, '').trim();
        }
        leagueName = leagueName.replace(/\s*\b\d{4}(\/\d{4})?\b/g, '').trim() || 'DSG Liga';
        const seasonDisplay = sKey ? ` ${sKey}` : '';
        const label = `${leagueName}${seasonDisplay} Runde ${r.runde || ''}`.trim() || `Runde ${r.runde}`;
        if (!allRoundsList.some(item => item.label === label)) {
            allRoundsList.push({ label, roundNr: r.runde, full: `${r.runde}. Runde`, seasonKey: r.seasonKey || (Store.getData()?.currentSeason || '2022/2023'), id: r.id });
        }
    });

    // Also include rounds from gamesData if any missing
    (gamesData || []).forEach(g => {
        if (g.round && !allRoundsList.some(item => item.label === g.round || item.full === g.round)) {
            allRoundsList.push({ label: g.round, roundNr: g.roundNr, full: g.round, seasonKey: g.seasonKey || (Store.getData()?.currentSeason || '2022/2023') });
        }
    });

    if (roundFilterSelect) {
        const prevRound = roundFilterSelect.value || 'all';
        roundFilterSelect.innerHTML = '<option value="all">Alle Runden</option>' + 
            allRoundsList.map(r => `<option value="${r.full}">${r.label || r.full}</option>`).join('');
        if (prevRound && Array.from(roundFilterSelect.options).some(o => o.value === prevRound)) {
            roundFilterSelect.value = prevRound;
        }
    }

    if (modalRoundSelect) {
        modalRoundSelect.innerHTML = allRoundsList.map(r => `
            <option value="${r.full}" data-season-key="${r.seasonKey || (Store.getData()?.currentSeason || '2022/2023')}" data-round-id="${r.id || ''}">${r.label || r.full}</option>
        `).join('');
        modalRoundSelect.onchange = updateTeamsForSelectedRound;
    }

    updateTeamsForSelectedRound();
};

const ensureModalsInBody = () => {
    ['game-modal', 'report-modal'].forEach(id => {
        const allMatching = Array.from(document.querySelectorAll('#' + id));
        if (allMatching.length > 1) {
            const freshModal = allMatching.find(el => el.parentElement !== document.body) || allMatching[allMatching.length - 1];
            allMatching.filter(el => el !== freshModal).forEach(el => el.remove());
            if (freshModal && freshModal.parentElement !== document.body) {
                document.body.appendChild(freshModal);
            }
        } else if (allMatching.length === 1) {
            const el = allMatching[0];
            if (el.parentElement !== document.body) {
                document.body.appendChild(el);
            }
        }
    });
};

const openAddGameModal = () => {
    ensureModalsInBody();
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
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const openEditGameModal = (idx) => {
    ensureModalsInBody();
    const match = gamesData[idx];
    if (!match) return;

    editingMatchId = match.id !== undefined ? match.id : idx;
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

    // Match round & Season Key
    const roundSelect = document.getElementById('input-game-round');
    if (roundSelect) {
        let matchOpt = Array.from(roundSelect.options).find(o => 
            (o.value === match.round || o.text.includes(match.round)) && 
            (o.getAttribute('data-season-key') === match.seasonKey || !match.seasonKey)
        );
        if (!matchOpt) {
            matchOpt = Array.from(roundSelect.options).find(o => o.value === match.round);
        }
        if (matchOpt) {
            matchOpt.selected = true;
        } else {
            const opt = document.createElement('option');
            opt.value = match.round;
            opt.text = match.round;
            opt.setAttribute('data-season-key', match.seasonKey || '2022/2023');
            opt.selected = true;
            roundSelect.appendChild(opt);
        }
    }

    updateTeamsForSelectedRound();

    document.getElementById('input-game-home').value = match.home || '';
    document.getElementById('input-game-away').value = match.away || '';
    document.getElementById('input-game-status').value = match.status || 'Upcoming';

    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeGameModal = () => {
    document.querySelectorAll('#game-modal').forEach(m => {
        m.style.display = 'none';
    });
    editingMatchId = null;
};

const closeReportModal = () => {
    document.querySelectorAll('#report-modal').forEach(m => {
        m.style.display = 'none';
    });
    currentReportMatch = null;
};

const deleteGame = (idx) => {
    const match = gamesData[idx];
    if (!match) return;
    const targetSeasonKey = match.seasonKey || (Store.getData()?.currentSeason || '2022/2023');

    if (confirm(`Möchten Sie das Spiel "${match.home} vs. ${match.away}" wirklich löschen?`)) {
        Store.deleteMatch(targetSeasonKey, match.id);
        Store.recalculateSeason(targetSeasonKey);
        loadDataAndRender();
        showToast('Spiel gelöscht.');
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

    const roundSelect = document.getElementById('input-game-round');
    const selectedRoundOpt = roundSelect?.selectedOptions[0];
    const targetSeasonKey = selectedRoundOpt?.getAttribute('data-season-key') || (Store.getData()?.currentSeason || '2022/2023');

    let existingMatch = editingMatchId !== null ? Store.getMatch(targetSeasonKey, editingMatchId) : null;
    if (!existingMatch && editingMatchId !== null) {
        existingMatch = Store.getMatch(Store.getData()?.currentSeason || '2022/2023', editingMatchId);
    }

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

    const isEditing = (editingMatchId !== null);
    Store.saveMatch(targetSeasonKey, matchData);
    Store.recalculateSeason(targetSeasonKey);
    closeGameModal();
    loadDataAndRender();
    showToast(isEditing ? 'Spiel erfolgreich aktualisiert!' : 'Spiel erfolgreich erstellt!');
};

/* --- Spielbericht (Match Report) Logic --- */

const openReportModal = (idx) => {
    ensureModalsInBody();
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
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const renderReportLists = () => {
    // Render Home Scorers
    const homeGoalsDiv = document.getElementById('report-goals-list-home');
    if (homeGoalsDiv) {
        homeGoalsDiv.innerHTML = reportScorersHome.map((p, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    <strong>${p}</strong>
                </span>
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
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    <strong>${p}</strong>
                </span>
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

    const targetSeasonKey = currentReportMatch.seasonKey || (Store.getData()?.currentSeason || '2022/2023');
    Store.saveMatch(targetSeasonKey, updatedMatch);
    Store.recalculateSeason(targetSeasonKey);
    closeReportModal();
    loadDataAndRender();
    showToast('Spielbericht erfolgreich gespeichert!');
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

    const leagueFilter = document.getElementById('game-league-filter');
    if (leagueFilter) leagueFilter.onchange = () => {
        currentPage = 1;
        renderGamesTable();
    };

    const roundFilter = document.getElementById('game-round-filter');
    if (roundFilter) roundFilter.onchange = () => {
        currentPage = 1;
        renderGamesTable();
    };

    const statusFilter = document.getElementById('game-status-filter');
    if (statusFilter) statusFilter.onchange = () => {
        currentPage = 1;
        renderGamesTable();
    };

    const sortSelect = document.getElementById('game-sort-select');
    if (sortSelect) sortSelect.onchange = () => {
        currentSort = { column: null, asc: true };
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

    // Modal 1 outside-click listener
    const gameModal = document.getElementById('game-modal');
    if (gameModal) {
        gameModal.onclick = (e) => {
            if (e.target === gameModal) closeGameModal();
        };
    }

    // Modal 2: Report Form
    document.querySelectorAll('.btn-close-report-modal').forEach(b => {
        b.onclick = closeReportModal;
    });
    const reportForm = document.getElementById('report-form');
    if (reportForm) reportForm.onsubmit = saveReportForm;
    const saveReportBtn = document.getElementById('btn-save-report');
    if (saveReportBtn) saveReportBtn.onclick = (e) => { e.preventDefault(); saveReportForm(e); };

    // Modal 2 outside-click listener
    const reportModal = document.getElementById('report-modal');
    if (reportModal) {
        reportModal.onclick = (e) => {
            if (e.target === reportModal) closeReportModal();
        };
    }

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
        leaguesData = await Store.getAdminLeagues() || [];
        roundsData = await Store.getAdminRounds() || [];
        teamsData = await Store.getAdminTeams() || [];
        playersData = await Store.getAdminPlayers() || [];

        const seasons = Store.getData()?.seasons || {};
        let allMatches = [];

        // Collect matches from all active/existing seasons
        Object.keys(seasons).forEach(sKey => {
            const sMatches = seasons[sKey]?.matches || [];
            sMatches.forEach(m => {
                allMatches.push({
                    ...m,
                    seasonKey: m.seasonKey || sKey
                });
            });
        });

        gamesData = allMatches;

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
