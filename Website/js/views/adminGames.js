import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1793330000000';
import { showToast } from './admin.js?v=1791200000000';
import { renderTeamLogo } from '../logos.js?v=1791200000000';

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
let reportSubsHome = [];
let reportSubsAway = [];

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
                <input type="text" id="game-search" class="admin-input" placeholder="Team / Saison / Runde..." style="width: 170px;">
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
                    <option value="season-desc" selected>Saison (neueste)</option>
                    <option value="season-asc">Saison (älteste)</option>
                    <option value="date-desc">Datum (neueste)</option>
                    <option value="date-asc">Datum (älteste)</option>
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
                        <th data-sort="season" class="sortable" style="text-align: center; width: 85px;">Saison ↕</th>
                        <th data-sort="round" class="sortable" style="max-width: 80px;">Runde ↕</th>
                        <th data-sort="home" class="sortable" style="max-width: 125px;">Heim ↕</th>
                        <th data-sort="away" class="sortable" style="max-width: 125px;">Auswärts ↕</th>
                        <th data-sort="score" class="sortable" style="text-align: center; width: 65px;">Ergebnis ↕</th>
                        <th data-sort="ht" class="sortable" style="text-align: center; width: 50px;">HZ ↕</th>
                        <th style="text-align: center; min-width: 135px; width: 145px;">Status</th>
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

                <!-- Pending Approval Notice Banner -->
                <div id="report-modal-pending-banner" style="display: none;"></div>

                <!-- Match Header Information Card -->
                <div class="glass-card" style="padding: var(--space-md); background: rgba(0,150,64,0.08); border-left: 4px solid var(--color-accent); margin-bottom: var(--space-md);">
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary);" id="report-match-title">Walker FC gegen DSG Union Traun</div>
                    <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;" id="report-match-meta">2026 Herbst | 31.10.2026 16:00:00 | DSG-Platz</div>
                </div>

                <form id="report-form" style="display: flex; flex-direction: column; gap: var(--space-lg); padding-bottom: 24px;">
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

                    <!-- Übersicht Tore (Scorers) -->
                    <div class="report-section">
                        <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">Übersicht Tore</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                            <!-- Home Goals -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <h5 id="report-goal-heading-home" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen Heim</h5>
                                <div style="display: flex; gap: 6px; align-items: stretch;">
                                    <div class="searchable-player-picker" id="picker-report-scorer-player-home" style="flex: 1; position: relative;">
                                        <input type="hidden" id="report-scorer-player-home" value="">
                                        <div class="searchable-player-input-wrap">
                                            <input type="text" id="input-search-report-scorer-player-home" class="admin-input searchable-player-search" placeholder="Torschütze suchen / wählen..." autocomplete="off" style="height: 34px;">
                                            <span class="combobox-indicator-icon">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </span>
                                        </div>
                                        <div class="searchable-player-dropdown" id="dropdown-report-scorer-player-home" style="display: none;"></div>
                                    </div>
                                    <input type="text" id="report-goal-min-home" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 24 oder 45+2)" style="width: 58px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                    <input type="number" id="report-goal-count-home" min="1" max="20" value="1" class="admin-input" title="Anzahl Tore" placeholder="1" style="width: 44px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                    <button type="button" id="btn-add-goal-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; height: 34px; white-space: nowrap;">+ Hinzufügen</button>
                                </div>
                                <div id="report-goals-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>

                            <!-- Away Goals -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <h5 id="report-goal-heading-away" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen Auswärts</h5>
                                <div style="display: flex; gap: 6px; align-items: stretch;">
                                    <div class="searchable-player-picker" id="picker-report-scorer-player-away" style="flex: 1; position: relative;">
                                        <input type="hidden" id="report-scorer-player-away" value="">
                                        <div class="searchable-player-input-wrap">
                                            <input type="text" id="input-search-report-scorer-player-away" class="admin-input searchable-player-search" placeholder="Torschütze suchen / wählen..." autocomplete="off" style="height: 34px;">
                                            <span class="combobox-indicator-icon">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </span>
                                        </div>
                                        <div class="searchable-player-dropdown" id="dropdown-report-scorer-player-away" style="display: none;"></div>
                                    </div>
                                    <input type="text" id="report-goal-min-away" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 24 oder 45+2)" style="width: 58px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                    <input type="number" id="report-goal-count-away" min="1" max="20" value="1" class="admin-input" title="Anzahl Tore" placeholder="1" style="width: 44px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                    <button type="button" id="btn-add-goal-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; height: 34px; white-space: nowrap;">+ Hinzufügen</button>
                                </div>
                                <div id="report-goals-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Übersicht Karten (Disciplinary) -->
                    <div class="report-section">
                        <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;">Übersicht Karten</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                            <!-- Home Cards -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <h5 id="report-card-heading-home" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten Heim</h5>
                                <div style="display: flex; gap: 6px; margin-bottom: 6px; align-items: stretch;">
                                    <select id="report-card-type-home" class="admin-input" style="width: 95px; font-size: 0.8rem; height: 34px;">
                                        <option value="yellow">Gelb</option>
                                        <option value="yellowRed">Gelb-Rot</option>
                                        <option value="red">Rot</option>
                                    </select>
                                    <div class="searchable-player-picker" id="picker-report-card-player-home" style="flex: 1; position: relative;">
                                        <input type="hidden" id="report-card-player-home" value="">
                                        <div class="searchable-player-input-wrap">
                                            <input type="text" id="input-search-report-card-player-home" class="admin-input searchable-player-search" placeholder="Spieler suchen / wählen..." autocomplete="off" style="height: 34px;">
                                            <span class="combobox-indicator-icon">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </span>
                                        </div>
                                        <div class="searchable-player-dropdown" id="dropdown-report-card-player-home" style="display: none;"></div>
                                    </div>
                                    <input type="text" id="report-card-min-home" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 61)" style="width: 52px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="report-card-reason-home" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                                    <button type="button" id="btn-add-card-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-cards-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>

                            <!-- Away Cards -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <h5 id="report-card-heading-away" style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten Auswärts</h5>
                                <div style="display: flex; gap: 6px; margin-bottom: 6px; align-items: stretch;">
                                    <select id="report-card-type-away" class="admin-input" style="width: 95px; font-size: 0.8rem; height: 34px;">
                                        <option value="yellow">Gelb</option>
                                        <option value="yellowRed">Gelb-Rot</option>
                                        <option value="red">Rot</option>
                                    </select>
                                    <div class="searchable-player-picker" id="picker-report-card-player-away" style="flex: 1; position: relative;">
                                        <input type="hidden" id="report-card-player-away" value="">
                                        <div class="searchable-player-input-wrap">
                                            <input type="text" id="input-search-report-card-player-away" class="admin-input searchable-player-search" placeholder="Spieler suchen / wählen..." autocomplete="off" style="height: 34px;">
                                            <span class="combobox-indicator-icon">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </span>
                                        </div>
                                        <div class="searchable-player-dropdown" id="dropdown-report-card-player-away" style="display: none;"></div>
                                    </div>
                                    <input type="text" id="report-card-min-away" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 61)" style="width: 52px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <input type="text" id="report-card-reason-away" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                                    <button type="button" id="btn-add-card-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
                                </div>
                                <div id="report-cards-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Übersicht Auswechslungen (Substitutions: Max 5 pro Team, Rückwechsel erlaubt) -->
                    <div class="report-section" style="margin-top: var(--space-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 var(--space-sm) 0; border-bottom: 1px solid var(--color-border); padding-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                            <h4 style="margin: 0; font-size: 1.1rem;">Übersicht Auswechslungen</h4>
                            <span style="font-size: 0.75rem; color: var(--color-text-secondary);">DSG-Regel: max. 5 Wechsel pro Team, Rückwechsel erlaubt</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);" class="report-events-grid">
                            <!-- Home Subs -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <h5 id="report-sub-heading-home" style="margin: 0; color: var(--color-text-primary);">Auswechslungen Heim</h5>
                                    <span id="report-sub-counter-home" style="font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; background: rgba(0, 179, 65, 0.15); color: var(--color-accent); border: 1px solid rgba(0, 240, 95, 0.3);">0 / 5 Wechsel</span>
                                </div>
                                <div id="report-sub-form-home" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
                                    <div style="display: flex; gap: 6px; align-items: center;">
                                        <div style="flex: 1;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Aus (Feldspieler)</label>
                                            <select id="report-sub-out-home" class="admin-input" style="width: 100%; font-size: 0.8rem; height: 34px;"></select>
                                        </div>
                                        <div style="flex: 1;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Ein (Ersatzspieler)</label>
                                            <select id="report-sub-in-home" class="admin-input" style="width: 100%; font-size: 0.8rem; height: 34px;"></select>
                                        </div>
                                        <div style="width: 55px;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Min.</label>
                                            <input type="number" id="report-sub-min-home" class="admin-input" min="1" max="90" placeholder="Min" style="width: 100%; font-size: 0.8rem; height: 34px; text-align: center;">
                                        </div>
                                    </div>
                                    <button type="button" id="btn-add-sub-home" class="btn-dsg" style="padding: 6px 12px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; width: 100%;">+ Wechsel eintragen</button>
                                </div>
                                <div id="report-subs-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
                            </div>

                            <!-- Away Subs -->
                            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <h5 id="report-sub-heading-away" style="margin: 0; color: var(--color-text-primary);">Auswechslungen Auswärts</h5>
                                    <span id="report-sub-counter-away" style="font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; background: rgba(0, 179, 65, 0.15); color: var(--color-accent); border: 1px solid rgba(0, 240, 95, 0.3);">0 / 5 Wechsel</span>
                                </div>
                                <div id="report-sub-form-away" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
                                    <div style="display: flex; gap: 6px; align-items: center;">
                                        <div style="flex: 1;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Aus (Feldspieler)</label>
                                            <select id="report-sub-out-away" class="admin-input" style="width: 100%; font-size: 0.8rem; height: 34px;"></select>
                                        </div>
                                        <div style="flex: 1;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Ein (Ersatzspieler)</label>
                                            <select id="report-sub-in-away" class="admin-input" style="width: 100%; font-size: 0.8rem; height: 34px;"></select>
                                        </div>
                                        <div style="width: 55px;">
                                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 2px;">Min.</label>
                                            <input type="number" id="report-sub-min-away" class="admin-input" min="1" max="90" placeholder="Min" style="width: 100%; font-size: 0.8rem; height: 34px; text-align: center;">
                                        </div>
                                    </div>
                                    <button type="button" id="btn-add-sub-away" class="btn-dsg" style="padding: 6px 12px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; width: 100%;">+ Wechsel eintragen</button>
                                </div>
                                <div id="report-subs-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
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
        const fn = sanitizeMojibake((p.Vorname || p.firstName || '').trim());
        const ln = sanitizeMojibake((p.Nachname || p.lastName || '').trim());
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
    const matchingLeague = (leaguesData || []).find(l => 
        (l.seasonKey && m.seasonKey && l.seasonKey === m.seasonKey) ||
        (l.name && (m.liga === l.name || m.league === l.name))
    );
    if (matchingLeague?.name) {
        let cleanYr = (matchingLeague.year || (matchingLeague.seasonKey ? String(matchingLeague.seasonKey).replace(/_[a-zA-Z0-9_-]+$/, '') : '') || '').trim();
        if (/^\d{4}$/.test(cleanYr)) {
            cleanYr = `${cleanYr}/${parseInt(cleanYr, 10) + 1}`;
        }
        return cleanYr ? `${matchingLeague.name} ${cleanYr}` : matchingLeague.name;
    }
    const sKey = m.seasonKey || '';
    const cleanKey = sKey.replace(/_[a-zA-Z0-9_-]+$/, '');
    return cleanKey ? (cleanKey.startsWith('DSG') || cleanKey.startsWith('1.') || cleanKey.startsWith('Saison') || cleanKey.startsWith('Liga') ? cleanKey : `DSG Liga ${cleanKey}`) : 'DSG Liga';
};

const getLeagueOrderWeight = (match) => {
    if (!match) return 0;
    const key = String(match.seasonKey || match.season || '').trim();
    const curSeason = Store.getData()?.currentSeason || '2026/2027';
    const isTest = key.toLowerCase().includes('test');
    const yr = (extractSeasonYear(match) || 2020) - 2000;
    const base = yr * 10000;

    // Primary active season (e.g. DSG Liga 2026/2027) gets highest priority
    if ((key === curSeason || key === '2026/2027') && !isTest) return 990000;
    // Current season's Testliga comes right after main league
    if (isTest && key.includes('2026')) return 980000;

    let sub = 500;
    if (key.includes('oberes')) sub = 400;
    else if (key.includes('unteres')) sub = 300;
    else if (key.includes('1klasse')) sub = 200;
    if (isTest) sub = 100;
    return base + sub;
};

const formatSeasonDisplay = (m) => {
    if (!m) return '-';
    const key = m.seasonKey || m.season || m.seasonName || '';
    if (key.toLowerCase() === 'testliga') return 'Testliga';
    return key || '-';
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
    const sortVal = document.getElementById('game-sort-select')?.value || 'season-desc';

    filteredData = gamesData.filter(m => {
        const dispDate = formatDisplayDate(m.date, m.time).toLowerCase();
        const dispLeague = getDisplayLeagueName(m).toLowerCase();
        const matchesSearch = !searchVal || 
            (m.home && m.home.toLowerCase().includes(searchVal)) ||
            (m.away && m.away.toLowerCase().includes(searchVal)) ||
            (m.seasonKey && m.seasonKey.toLowerCase().includes(searchVal)) ||
            (m.season && m.season.toLowerCase().includes(searchVal)) ||
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
            const weightA = getLeagueOrderWeight(a);
            const weightB = getLeagueOrderWeight(b);
            if (weightA !== weightB) return weightB - weightA;
            const diffRound = extractRoundNumber(a) - extractRoundNumber(b);
            if (diffRound !== 0) return diffRound;
            return parseGameDate(a.date, a.time) - parseGameDate(b.date, b.time);
        }
        if (sortVal === 'season-asc') {
            const weightA = getLeagueOrderWeight(a);
            const weightB = getLeagueOrderWeight(b);
            if (weightA !== weightB) return weightA - weightB;
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

            if (currentSort.column === 'season') {
                const sA = extractSeasonYear(a);
                const sB = extractSeasonYear(b);
                if (sA !== sB) return currentSort.asc ? sA - sB : sB - sA;
                return extractRoundNumber(a) - extractRoundNumber(b);
            }

            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();

            return currentSort.asc ? 
                valA.localeCompare(valB, 'de', { numeric: true }) : 
                valB.localeCompare(valA, 'de', { numeric: true });
        });
    }
};

const isGameActive = (m) => {
    if (!m) return false;
    const matchingLeague = (leaguesData || []).find(l => 
        (l.seasonKey && m.seasonKey && l.seasonKey === m.seasonKey) ||
        (l.name && (m.liga === l.name || m.league === l.name))
    );
    if (matchingLeague) {
        return matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv';
    }
    return true;
};

const INACTIVE_GAME_TOOLTIP = "Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter 'Ligen verwalten' auf 'Aktiv'.";

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
        const isActive = isGameActive(m);
        let scoreDisplay = (m.score && m.score !== '-:-') ? m.score : ':';
        if (scoreDisplay !== ':' && !scoreDisplay.toLowerCase().includes('abgesagt') && !scoreDisplay.toLowerCase().includes('verschoben')) {
            scoreDisplay = scoreDisplay.replace(/\s*\([^)]*\)/g, '').trim();
        }
        let htDisplay = (m.ht && m.ht !== ':') ? m.ht : (m.score ? (m.score.match(/\(([^)]+)\)/)?.[1] || ':') : ':');
        if (!htDisplay || htDisplay.trim() === '') htDisplay = ':';
        const venue = m.venue || m.location || 'DSG-Platz';
        const dateDisplay = formatDisplayDate(m.date, m.time);

        let statusBadge = '-';
        if (m.reportStatus === 'pending_approval') {
            statusBadge = `
                <span style="background: rgba(234, 179, 8, 0.15); color: #b45309; border: 1px solid rgba(234, 179, 8, 0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Freigabe offen
                </span>
            `;
        } else if (m.status === 'Abgesagt 3:0') {
            statusBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center;">Abgesagt 3:0</span>';
        } else if (m.status === 'Abgesagt 0:3') {
            statusBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center;">Abgesagt 0:3</span>';
        } else if (m.status === 'Postponed' || m.status === 'Verschoben') {
            statusBadge = '<span style="background: rgba(100, 116, 139, 0.15); color: #475569; border: 1px solid rgba(100, 116, 139, 0.35); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center;">Verschoben</span>';
        } else if (m.status === 'Canceled' || m.status === 'Abgesagt') {
            statusBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center;">Abgesagt</span>';
        } else if (m.reportStatus === 'approved') {
            statusBadge = `
                <span style="background: rgba(22, 163, 74, 0.15); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.35); padding: 3px 8px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Bestätigt
                </span>
            `;
        } else if (m.note && m.note.trim() !== '') {
            statusBadge = `<span style="color: var(--color-text-secondary); font-size: 0.78rem; font-style: italic; max-width: 135px; overflow: hidden; text-overflow: ellipsis; display: inline-block; white-space: nowrap;" title="${m.note}">${m.note}</span>`;
        }

        const seasonDisplay = formatSeasonDisplay(m);
        const roundDisplay = m.round ? m.round.replace(/\s+\d{2}\.\d{2}\..*$/, '') : '-';

        const isPendingReport = m.reportStatus === 'pending_approval';
        const reportBtnHtml = `
            <button class="btn-report-game" data-idx="${rawIndex}" title="${isPendingReport ? 'Schiedsrichterbericht prüfen & freigeben' : 'Spielbericht ' + (isActive ? 'erfassen' : 'ansehen')}" style="background: var(--color-accent); color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                Bericht
            </button>
        `;

        const editBtnHtml = isActive ? `
            <button class="btn-edit-game" data-idx="${rawIndex}" title="Spiel bearbeiten" style="background: rgba(0,0,0,0.04); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
        ` : `
            <span class="tooltip-trigger" data-tooltip="${INACTIVE_GAME_TOOLTIP}" style="display: inline-flex; cursor: not-allowed;">
                <button class="btn-edit-game" data-idx="${rawIndex}" disabled style="background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: not-allowed; opacity: 0.45; display: inline-flex; align-items: center; pointer-events: none;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
            </span>
        `;

        const deleteBtnHtml = isActive ? `
            <button class="btn-delete-game" data-idx="${rawIndex}" title="Spiel löschen" style="background: rgba(220,53,69,0.08); color: #dc3545; border: 1px solid rgba(220,53,69,0.25); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        ` : `
            <span class="tooltip-trigger" data-tooltip="${INACTIVE_GAME_TOOLTIP}" style="display: inline-flex; cursor: not-allowed;">
                <button class="btn-delete-game" data-idx="${rawIndex}" disabled style="background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 6px; font-size: 0.75rem; font-weight: 600; cursor: not-allowed; opacity: 0.45; display: inline-flex; align-items: center; pointer-events: none;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </span>
        `;

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text-primary); font-size: 0.82rem; white-space: nowrap;">${dateDisplay}</td>
                <td style="text-align: center; font-weight: 600; color: var(--color-text-secondary); font-size: 0.82rem; white-space: nowrap;">${seasonDisplay}</td>
                <td style="font-weight: 600; color: var(--color-accent); font-size: 0.82rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.round || ''}">${roundDisplay}</td>
                <td style="font-weight: 700; color: var(--color-text-primary); font-size: 0.85rem; max-width: 135px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.home || ''}">
                    <div style="display: inline-flex; align-items: center; gap: 6px;">
                        ${renderTeamLogo(m.home, 'xs')}
                        <span>${m.home || '-'}</span>
                    </div>
                </td>
                <td style="font-weight: 700; color: var(--color-text-primary); font-size: 0.85rem; max-width: 135px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.away || ''}">
                    <div style="display: inline-flex; align-items: center; gap: 6px;">
                        ${renderTeamLogo(m.away, 'xs')}
                        <span>${m.away || '-'}</span>
                    </div>
                </td>
                <td style="text-align: center; font-weight: 800; font-size: 1rem; color: var(--color-accent); white-space: nowrap;">${scoreDisplay}</td>
                <td style="text-align: center; color: var(--color-text-secondary); font-size: 0.82rem; white-space: nowrap;">${htDisplay}</td>
                <td style="text-align: center; white-space: nowrap; padding: 6px 8px;">${statusBadge}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <div style="display: inline-flex; gap: 3px; justify-content: center; align-items: center;">
                        ${reportBtnHtml}
                        ${editBtnHtml}
                        ${deleteBtnHtml}
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
                const isActive = isGameActive(m);
                let scoreDisplay = (m.score && m.score !== '-:-') ? m.score : ':';
                if (scoreDisplay !== ':' && !scoreDisplay.toLowerCase().includes('abgesagt') && !scoreDisplay.toLowerCase().includes('verschoben')) {
                    scoreDisplay = scoreDisplay.replace(/\s*\([^)]*\)/g, '').trim();
                }
                let htDisplay = (m.ht && m.ht !== ':') ? m.ht : (m.score ? (m.score.match(/\(([^)]+)\)/)?.[1] || ':') : ':');
                if (!htDisplay || htDisplay.trim() === '') htDisplay = ':';
                const venue = m.venue || m.location || 'DSG-Platz';
                const dateDisplay = formatDisplayDate(m.date, m.time);

                let noteBadge = m.note || '';
                if (m.reportStatus === 'pending_approval') {
                    noteBadge = '<span style="background: rgba(234, 179, 8, 0.15); color: #b45309; border: 1px solid rgba(234, 179, 8, 0.4); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Freigabe offen</span>';
                } else if (m.status === 'Abgesagt 3:0') noteBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;">Abgesagt 3:0</span>';
                else if (m.status === 'Abgesagt 0:3') noteBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;">Abgesagt 0:3</span>';
                else if (m.status === 'Postponed' || m.status === 'Verschoben') noteBadge = '<span style="background: rgba(100, 116, 139, 0.15); color: #475569; border: 1px solid rgba(100, 116, 139, 0.35); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;">Verschoben</span>';
                else if (m.status === 'Canceled' || m.status === 'Abgesagt') noteBadge = '<span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;">Abgesagt</span>';
                else if (m.reportStatus === 'approved') noteBadge = '<span style="background: rgba(22, 163, 74, 0.15); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.35); padding: 2px 7px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;">Bestätigt</span>';

                const mReportBtn = `
                    <button class="btn-report-game full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                        Spielbericht ${isActive ? 'erfassen' : 'ansehen'}
                    </button>
                `;

                const mEditBtn = isActive ? `
                    <button class="btn-edit-game" data-idx="${rawIndex}" style="background: rgba(0,0,0,0.06); color: var(--color-text-primary); border: var(--glass-border); display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Editieren
                    </button>
                ` : `
                    <span class="tooltip-trigger" data-tooltip="${INACTIVE_GAME_TOOLTIP}" style="display: block; width: 100%; cursor: not-allowed;">
                        <button class="btn-edit-game" data-idx="${rawIndex}" disabled style="width: 100%; background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); opacity: 0.45; cursor: not-allowed; display: inline-flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Editieren
                        </button>
                    </span>
                `;

                const mDeleteBtn = isActive ? `
                    <button class="btn-delete-game" data-idx="${rawIndex}" style="background: #dc3545; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Löschen
                    </button>
                ` : `
                    <span class="tooltip-trigger" data-tooltip="${INACTIVE_GAME_TOOLTIP}" style="display: block; width: 100%; cursor: not-allowed;">
                        <button class="btn-delete-game" data-idx="${rawIndex}" disabled style="width: 100%; background: rgba(0,0,0,0.04); color: var(--color-text-secondary); border: 1px solid var(--color-border); opacity: 0.45; cursor: not-allowed; display: inline-flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Löschen
                        </button>
                    </span>
                `;

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <div class="admin-m-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;">
                                        ${renderTeamLogo(m.home, 'xs')}
                                        <strong>${m.home || '-'}</strong> vs ${renderTeamLogo(m.away, 'xs')} <strong>${m.away || '-'}</strong>
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
                                    <span class="admin-m-label">Saison</span>
                                    <span class="admin-m-value">${formatSeasonDisplay(m)}</span>
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
                                ${mReportBtn}
                                ${mEditBtn}
                                ${mDeleteBtn}
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
        container.querySelectorAll('.btn-edit-game:not([disabled])').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditGameModal(idx);
            };
        });

        container.querySelectorAll('.btn-delete-game:not([disabled])').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                deleteGame(idx);
            };
        });

        container.querySelectorAll('.btn-report-game:not([disabled])').forEach(btn => {
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
    const sKey = selectedOpt?.getAttribute('data-season-key') || (Store.getData()?.currentSeason || '2026/2027');

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
    const statusFilterSelect = document.getElementById('game-status-filter');
    const sortFilterSelect = document.getElementById('game-sort-select');
    const searchInput = document.getElementById('game-search');
    const modalRoundSelect = document.getElementById('input-game-round');

    // Restore saved league filter preference
    let savedLeague = 'all';
    try { savedLeague = sessionStorage.getItem('dsg_game_league_filter') || 'all'; } catch(e) {}

    // Populate League filter dropdown
    if (leagueFilterSelect) {
        const currentVal = leagueFilterSelect.value && leagueFilterSelect.value !== 'all' ? leagueFilterSelect.value : savedLeague;
        const leagueOptions = (leaguesData || []).map(l => {
            const key = l.seasonKey || l.name;
            let cleanYr = (l.year || (l.seasonKey ? String(l.seasonKey).replace(/_[a-zA-Z0-9_-]+$/, '') : '') || '').trim();
            if (/^\d{4}$/.test(cleanYr)) {
                cleanYr = `${cleanYr}/${parseInt(cleanYr, 10) + 1}`;
            }
            const label = l.name && cleanYr ? `${l.name} ${cleanYr}` : (l.name || key);
            return `<option value="${key}">${label}</option>`;
        }).join('');
        leagueFilterSelect.innerHTML = '<option value="all">Alle Ligen</option>' + leagueOptions;
        
        const targetVal = (currentVal && Array.from(leagueFilterSelect.options).some(o => o.value === currentVal))
            ? currentVal
            : (savedLeague && Array.from(leagueFilterSelect.options).some(o => o.value === savedLeague))
                ? savedLeague
                : 'all';
        leagueFilterSelect.value = targetVal;
        try { sessionStorage.setItem('dsg_game_league_filter', targetVal); } catch(e) {}
    }

    // Unique rounds from matches and roundsData
    const allRoundsList = [];
    (roundsData || []).forEach(r => {
        const matchingLeague = (leaguesData || []).find(l => 
            (l.seasonKey && r.seasonKey && l.seasonKey === r.seasonKey) ||
            (l.name && (r.liga === l.name || r.saison === l.name))
        );
        let leagueName = matchingLeague?.name || r.liga || r.saison || 'DSG Liga';
        const rawKey = r.seasonKey || r.jahr || '';
        if (rawKey) {
            leagueName = leagueName.replace(rawKey, '').trim();
        }
        leagueName = leagueName.replace(/\s*\b\d{4}(\/\d{4})?\b/g, '').trim() || 'DSG Liga';

        // Extract clean competition year (e.g. '2022/2023' instead of '2022/2023_1klasse')
        let cleanYear = (r.jahr || (r.seasonKey ? String(r.seasonKey).replace(/_[a-zA-Z0-9_-]+$/, '') : '') || matchingLeague?.year || '').trim();
        if (/^\d{4}$/.test(cleanYear)) {
            cleanYear = `${cleanYear}/${parseInt(cleanYear, 10) + 1}`;
        }
        const seasonDisplay = cleanYear ? ` ${cleanYear}` : '';
        const label = `${leagueName}${seasonDisplay} Runde ${r.runde || ''}`.trim() || `Runde ${r.runde}`;
        if (!allRoundsList.some(item => item.label === label)) {
            allRoundsList.push({ 
                label, 
                roundNr: parseInt(r.runde, 10) || 0, 
                full: `${r.runde}. Runde`, 
                seasonKey: r.seasonKey || (Store.getData()?.currentSeason || '2026/2027'), 
                id: r.id,
                leagueName,
                year: cleanYear,
                datumVon: r.datumVon || ''
            });
        }
    });

    // Also include rounds from gamesData if any missing
    (gamesData || []).forEach(g => {
        if (g.round && !allRoundsList.some(item => item.label === g.round || item.full === g.round)) {
            allRoundsList.push({ 
                label: g.round, 
                roundNr: g.roundNr || parseInt(String(g.round).replace(/\D/g, ''), 10) || 0, 
                full: g.round, 
                seasonKey: g.seasonKey || (Store.getData()?.currentSeason || '2026/2027'),
                leagueName: 'DSG Liga',
                year: (Store.getData()?.currentSeason || '2026/2027'),
                datumVon: g.date || ''
            });
        }
    });

    // Sort rounds logically: by Date / Season (most recent season first, then round number ascending)
    allRoundsList.sort((a, b) => {
        // 1. Prioritize current active season
        const curSeason = Store.getData()?.currentSeason || '2026/2027';
        const aIsCur = (a.seasonKey === curSeason || a.year === curSeason);
        const bIsCur = (b.seasonKey === curSeason || b.year === curSeason);
        if (aIsCur && !bIsCur) return -1;
        if (!aIsCur && bIsCur) return 1;

        // 2. Season year descending (most recent season first)
        const getYearNum = (item) => {
            const yrStr = String(item.year || item.seasonKey || item.label || '').replace(/\D/g, '');
            if (yrStr.length >= 4) return parseInt(yrStr.slice(0, 4), 10) || 0;
            return 0;
        };
        const yearDiff = getYearNum(b) - getYearNum(a);
        if (yearDiff !== 0) return yearDiff;

        // 3. Within same season, prioritize primary league ("DSG Liga") before playoffs
        if (a.leagueName !== b.leagueName) {
            if (a.leagueName === 'DSG Liga') return -1;
            if (b.leagueName === 'DSG Liga') return 1;
            return a.leagueName.localeCompare(b.leagueName, 'de');
        }

        // 4. Within same season & league, sort by round number ascending (Runde 1, Runde 2, ...)
        if (a.roundNr !== b.roundNr) {
            return a.roundNr - b.roundNr;
        }

        // 5. Fallback: by start date ascending if available
        if (a.datumVon && b.datumVon) {
            return parseGameDate(a.datumVon) - parseGameDate(b.datumVon);
        }

        return (a.label || '').localeCompare(b.label || '', 'de', { numeric: true });
    });

    let savedRound = 'all';
    try { savedRound = sessionStorage.getItem('dsg_game_round_filter') || 'all'; } catch(e) {}
    if (roundFilterSelect) {
        const currentVal = roundFilterSelect.value && roundFilterSelect.value !== 'all' ? roundFilterSelect.value : savedRound;
        roundFilterSelect.innerHTML = '<option value="all">Alle Runden</option>' + 
            allRoundsList.map(r => `<option value="${r.full}">${r.label || r.full}</option>`).join('');
        const targetVal = (currentVal && Array.from(roundFilterSelect.options).some(o => o.value === currentVal))
            ? currentVal
            : (savedRound && Array.from(roundFilterSelect.options).some(o => o.value === savedRound))
                ? savedRound
                : 'all';
        roundFilterSelect.value = targetVal;
        try { sessionStorage.setItem('dsg_game_round_filter', targetVal); } catch(e) {}
    }

    let savedStatus = 'all';
    try { savedStatus = sessionStorage.getItem('dsg_game_status_filter') || 'all'; } catch(e) {}
    if (statusFilterSelect && savedStatus && Array.from(statusFilterSelect.options).some(o => o.value === savedStatus)) {
        statusFilterSelect.value = savedStatus;
    }

    let savedSort = 'season-desc';
    try { savedSort = sessionStorage.getItem('dsg_game_sort_select') || 'season-desc'; } catch(e) {}
    if (sortFilterSelect && savedSort && Array.from(sortFilterSelect.options).some(o => o.value === savedSort)) {
        sortFilterSelect.value = savedSort;
    }

    let savedSearch = '';
    try { savedSearch = sessionStorage.getItem('dsg_game_search') || ''; } catch(e) {}
    if (searchInput && savedSearch && !searchInput.value) {
        searchInput.value = savedSearch;
    }

    const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
    const activeRoundsList = (activeLeagues.length === 0) ? [] : allRoundsList.filter(r => {
        const matchingLeague = activeLeagues.find(l => 
            (l.seasonKey && r.seasonKey && l.seasonKey === r.seasonKey) ||
            (l.name && (r.leagueName === l.name || (r.label && r.label.startsWith(l.name))))
        );
        return !!matchingLeague;
    });

    if (modalRoundSelect) {
        if (activeRoundsList.length === 0) {
            modalRoundSelect.innerHTML = '<option value="" disabled selected>Keine aktive Spielrunde verfügbar</option>';
        } else {
            modalRoundSelect.innerHTML = activeRoundsList.map(r => `
                <option value="${r.full}" data-season-key="${r.seasonKey || (Store.getData()?.currentSeason || '2026/2027')}" data-round-id="${r.id || ''}">${r.label || r.full}</option>
            `).join('');
        }
        modalRoundSelect.onchange = updateTeamsForSelectedRound;
    }

    // Update "+ Spiel anlegen" button state
    const addGameBtn = document.getElementById('btn-add-game-main');
    if (addGameBtn) {
        if (activeRoundsList.length === 0) {
            addGameBtn.disabled = true;
            addGameBtn.style.opacity = '0.5';
            addGameBtn.style.cursor = 'not-allowed';
            addGameBtn.parentElement.classList.add('tooltip-trigger');
            addGameBtn.parentElement.setAttribute('data-tooltip', 'Keine aktive Spielrunde vorhanden. Um Spiele anzulegen, aktivieren Sie zuerst eine Liga unter \'Ligen verwalten\'.');
        } else {
            addGameBtn.disabled = false;
            addGameBtn.style.opacity = '1';
            addGameBtn.style.cursor = 'pointer';
            addGameBtn.parentElement.classList.remove('tooltip-trigger');
            addGameBtn.parentElement.removeAttribute('data-tooltip');
        }
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
    const activeLeagues = (leaguesData || []).filter(l => l.status === 'Aktiv' || l.Status === 'Aktiv');
    if (activeLeagues.length === 0) {
        showToast('Keine aktive Liga vorhanden. Um Spiele anzulegen, aktivieren Sie zuerst eine Liga unter "Ligen verwalten".', true);
        return;
    }

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

    const roundSelect = document.getElementById('input-game-round');
    const roundFilterVal = document.getElementById('game-round-filter')?.value;
    const leagueFilterVal = document.getElementById('game-league-filter')?.value;
    if (roundSelect && roundSelect.options.length > 0) {
        let optToSelect = null;
        if (roundFilterVal && roundFilterVal !== 'all') {
            optToSelect = Array.from(roundSelect.options).find(o => 
                (o.value === roundFilterVal || o.text.includes(roundFilterVal)) &&
                (!leagueFilterVal || leagueFilterVal === 'all' || o.getAttribute('data-season-key') === leagueFilterVal)
            );
        }
        if (optToSelect) {
            optToSelect.selected = true;
        } else {
            roundSelect.options[0].selected = true;
        }
    }
    updateTeamsForSelectedRound();

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const openEditGameModal = (idx) => {
    ensureModalsInBody();
    const match = gamesData[idx];
    if (!match) return;

    if (!isGameActive(match)) {
        showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
        return;
    }

    editingMatchId = (match.id !== undefined && match.id !== null) ? match.id : null;
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
            opt.setAttribute('data-season-key', match.seasonKey || (Store.getData()?.currentSeason || '2026/2027'));
            opt.selected = true;
            roundSelect.appendChild(opt);
        }
    }

    updateTeamsForSelectedRound();

    document.getElementById('input-game-home').value = match.home || '';
    document.getElementById('input-game-away').value = match.away || '';
    document.getElementById('input-game-status').value = match.status || 'Upcoming';

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeGameModal = () => {
    document.querySelectorAll('#game-modal').forEach(m => {
        m.style.display = 'none';
    });
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    editingMatchId = null;
};

const closeReportModal = () => {
    document.querySelectorAll('#report-modal').forEach(m => {
        m.style.display = 'none';
    });
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    currentReportMatch = null;
};

const deleteGame = (idx) => {
    const match = gamesData[idx];
    if (!match) return;

    if (!isGameActive(match)) {
        showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
        return;
    }

    const targetSeasonKey = match.seasonKey || (Store.getData()?.currentSeason || '2026/2027');

    if (confirm(`Möchten Sie das Spiel "${match.home} vs. ${match.away}" wirklich löschen?`)) {
        Store.deleteMatch(targetSeasonKey, match.id, match);
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
    const targetSeasonKey = selectedRoundOpt?.getAttribute('data-season-key') || (Store.getData()?.currentSeason || '2026/2027');

    // Strict active league guard
    const matchingLeague = (leaguesData || []).find(l => 
        (l.seasonKey && targetSeasonKey && l.seasonKey === targetSeasonKey) ||
        (l.year && targetSeasonKey && l.year === targetSeasonKey) ||
        (l.name && round && round.includes(l.name))
    );
    const isTargetActive = matchingLeague ? (matchingLeague.status === 'Aktiv' || matchingLeague.Status === 'Aktiv') : true;
    if (!isTargetActive) {
        showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
        return;
    }

    let existingMatch = editingMatchId !== null ? Store.getMatch(targetSeasonKey, editingMatchId) : null;
    if (!existingMatch && editingMatchId !== null) {
        existingMatch = Store.getMatch(Store.getData()?.currentSeason || '2026/2027', editingMatchId);
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
        ht: existingMatch ? (existingMatch.ht || existingMatch.htScore || existingMatch.halfTime || '') : '',
        htScore: existingMatch ? (existingMatch.htScore || existingMatch.ht || existingMatch.halfTime || '') : '',
        halfTime: existingMatch ? (existingMatch.halfTime || existingMatch.ht || existingMatch.htScore || '') : '',
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

/* --- Searchable Player Combobox Component & Helpers --- */
const playerComboboxState = {
    'report-card-player-home': { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 },
    'report-card-player-away': { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 },
    'report-scorer-player-home': { players: [], includeOwnGoal: true, filtered: [], highlightedIndex: -1 },
    'report-scorer-player-away': { players: [], includeOwnGoal: true, filtered: [], highlightedIndex: -1 }
};

const populatePlayerCombobox = (id, players, includeOwnGoal = false) => {
    if (!playerComboboxState[id]) {
        playerComboboxState[id] = { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 };
    }
    playerComboboxState[id].players = players || [];
    playerComboboxState[id].includeOwnGoal = includeOwnGoal;
    playerComboboxState[id].highlightedIndex = -1;

    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = '';
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) searchInput.value = '';

    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');

    renderComboboxDropdown(id, '');
};

const renderComboboxDropdown = (id, filterText = '') => {
    const state = playerComboboxState[id];
    if (!state) return;

    const dropdown = document.getElementById('dropdown-' + id);
    if (!dropdown) return;

    const cleanFilter = (filterText || '').toLowerCase().trim();
    let allOptions = [];
    if (state.includeOwnGoal) {
        allOptions.push('Eigentor');
    }
    allOptions = allOptions.concat(state.players);

    let filtered = allOptions;
    if (cleanFilter) {
        filtered = allOptions.filter(opt => opt.toLowerCase().includes(cleanFilter));
    }
    state.filtered = filtered;
    state.highlightedIndex = -1;

    if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="player-option-empty">Keine passenden Spieler gefunden</div>';
        return;
    }

    dropdown.innerHTML = filtered.map((p, idx) => {
        const isSelected = document.getElementById(id)?.value === p;
        const isOwnGoal = p === 'Eigentor';

        let labelHtml = p;
        if (cleanFilter && !isOwnGoal) {
            const startIdx = p.toLowerCase().indexOf(cleanFilter);
            if (startIdx !== -1) {
                const before = p.slice(0, startIdx);
                const match = p.slice(startIdx, startIdx + cleanFilter.length);
                const after = p.slice(startIdx + cleanFilter.length);
                labelHtml = `${before}<span class="option-highlight">${match}</span>${after}`;
            }
        }

        const iconHtml = isOwnGoal
            ? `<span style="display: inline-flex; align-items: center; gap: 5px; color: #ef4444; font-weight: 700;">
                 <svg class="goal-svg-icon goal-svg-icon-own" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ef4444;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                 ${labelHtml}
               </span>`
            : labelHtml;

        return `
            <div class="player-option-item ${isSelected ? 'selected' : ''} ${isOwnGoal ? 'player-option-special' : ''}" data-idx="${idx}" data-val="${p}">
                <span>${iconHtml}</span>
                ${isSelected ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
            </div>
        `;
    }).join('');

    dropdown.querySelectorAll('.player-option-item').forEach(item => {
        const handleSelect = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const val = item.getAttribute('data-val');
            selectComboboxOption(id, val);
        };
        item.onmousedown = handleSelect;
        item.onclick = handleSelect;
    });
};

const updateActiveComboboxClasses = (activePicker) => {
    document.querySelectorAll('#report-modal .is-active-card').forEach(el => el.classList.remove('is-active-card'));
    document.querySelectorAll('#report-modal .is-active-section').forEach(el => el.classList.remove('is-active-section'));
    if (activePicker) {
        const card = activePicker.closest('.report-team-card') || activePicker.closest('.glass-card:not(.modal-content)');
        if (card) card.classList.add('is-active-card');
        const sec = activePicker.closest('.report-section');
        if (sec) sec.classList.add('is-active-section');
    }
};

const selectComboboxOption = (id, value) => {
    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = value;
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) searchInput.value = value;
    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');
    updateActiveComboboxClasses(null);
    renderComboboxDropdown(id, value);
};

const resetPlayerCombobox = (id, autoFocus = false) => {
    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = '';
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) {
        searchInput.value = '';
        if (autoFocus) {
            setTimeout(() => {
                searchInput.focus();
            }, 60);
        }
    }
    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');
    updateActiveComboboxClasses(null);
    renderComboboxDropdown(id, '');
};

const getComboboxValue = (id) => {
    const hiddenInput = document.getElementById(id);
    const searchInput = document.getElementById('input-search-' + id);
    return (hiddenInput?.value || searchInput?.value || '').trim();
};

const setupSearchableComboboxes = () => {
    const ids = [
        'report-card-player-home',
        'report-card-player-away',
        'report-scorer-player-home',
        'report-scorer-player-away'
    ];

    ids.forEach(id => {
        const searchInput = document.getElementById('input-search-' + id);
        const dropdown = document.getElementById('dropdown-' + id);
        const picker = document.getElementById('picker-' + id);
        if (!searchInput || !dropdown || !picker) return;

        const openPicker = () => {
            ids.forEach(otherId => {
                if (otherId !== id) {
                    const otherDropdown = document.getElementById('dropdown-' + otherId);
                    if (otherDropdown) otherDropdown.style.display = 'none';
                    const otherPicker = document.getElementById('picker-' + otherId);
                    if (otherPicker) otherPicker.classList.remove('is-open');
                }
            });
            renderComboboxDropdown(id, searchInput.value);
            dropdown.style.display = 'block';
            picker.classList.add('is-open');
            updateActiveComboboxClasses(picker);
            setTimeout(() => {
                picker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        };

        searchInput.onfocus = openPicker;
        searchInput.onclick = openPicker;

        searchInput.oninput = () => {
            dropdown.style.display = 'block';
            picker.classList.add('is-open');
            const hiddenInput = document.getElementById(id);
            if (hiddenInput) hiddenInput.value = searchInput.value.trim();
            renderComboboxDropdown(id, searchInput.value);
        };

        searchInput.onkeydown = (e) => {
            const state = playerComboboxState[id];
            if (!state || !state.filtered || state.filtered.length === 0) return;

            const items = dropdown.querySelectorAll('.player-option-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                dropdown.style.display = 'block';
                picker.classList.add('is-open');
                state.highlightedIndex = (state.highlightedIndex + 1) % items.length;
                items.forEach((it, idx) => {
                    it.classList.toggle('highlighted', idx === state.highlightedIndex);
                    if (idx === state.highlightedIndex) {
                        it.scrollIntoView({ block: 'nearest' });
                    }
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                dropdown.style.display = 'block';
                picker.classList.add('is-open');
                state.highlightedIndex = (state.highlightedIndex - 1 + items.length) % items.length;
                items.forEach((it, idx) => {
                    it.classList.toggle('highlighted', idx === state.highlightedIndex);
                    if (idx === state.highlightedIndex) {
                        it.scrollIntoView({ block: 'nearest' });
                    }
                });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (state.highlightedIndex >= 0 && state.highlightedIndex < state.filtered.length) {
                    selectComboboxOption(id, state.filtered[state.highlightedIndex]);
                } else if (state.filtered.length === 1) {
                    selectComboboxOption(id, state.filtered[0]);
                } else if (searchInput.value.trim()) {
                    selectComboboxOption(id, searchInput.value.trim());
                }
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
                picker.classList.remove('is-open');
            }
        };
    });

    // Global document outside-click handler
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.searchable-player-picker')) {
            ids.forEach(id => {
                const dropdown = document.getElementById('dropdown-' + id);
                if (dropdown) dropdown.style.display = 'none';
                const picker = document.getElementById('picker-' + id);
                if (picker) picker.classList.remove('is-open');
            });
            updateActiveComboboxClasses(null);
        }
    });
};

/* --- Spielbericht (Match Report) Logic --- */

const openReportModal = (idxOrMatch) => {
    ensureModalsInBody();
    const match = (typeof idxOrMatch === 'object' && idxOrMatch !== null) ? idxOrMatch : gamesData[idxOrMatch];
    if (!match) return;

    currentReportMatch = match;
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    const isPending = match.reportStatus === 'pending_approval';
    const reportData = (isPending && match.refereeReport)
        ? { ...match, ...match.refereeReport }
        : match;

    const pendingBanner = document.getElementById('report-modal-pending-banner');
    if (pendingBanner) {
        if (isPending) {
            pendingBanner.style.display = 'block';
            pendingBanner.innerHTML = `
                <div style="background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.45); border-radius: 8px; padding: 12px 16px; margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <div>
                            <div style="font-weight: 800; color: #b45309; font-size: 0.95rem;">Schiedsrichterbericht liegt zur Prüfung vor</div>
                            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">Überprüfe die Angaben und klicke auf „Spielbericht freigeben & Tabelle aktualisieren“, um das Ergebnis offiziell in die Wertung zu übernehmen.</div>
                        </div>
                    </div>
                    <span style="font-size: 0.74rem; font-weight: 800; color: #b45309; background: rgba(234, 179, 8, 0.25); padding: 4px 10px; border-radius: 999px; text-transform: uppercase; white-space: nowrap;">Wartet auf Freigabe</span>
                </div>
            `;
        } else {
            pendingBanner.style.display = 'none';
        }
    }

    const active = isGameActive(match);
    const saveBtn = document.getElementById('btn-save-report');
    if (saveBtn) {
        saveBtn.disabled = !active;
        saveBtn.innerText = !active
            ? 'Schreibgeschützt (Inaktive Liga)'
            : isPending
                ? 'Spielbericht freigeben & Tabelle aktualisieren'
                : 'Spielbericht speichern';
        saveBtn.style.opacity = active ? '1' : '0.6';
        saveBtn.style.cursor = active ? 'pointer' : 'not-allowed';
    }

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
    const subH = document.getElementById('report-sub-heading-home'); if (subH) subH.innerText = `Auswechslungen ${match.home}`;
    const subA = document.getElementById('report-sub-heading-away'); if (subA) subA.innerText = `Auswechslungen ${match.away}`;

    // Populate Scores from authoritative reportData (which includes submitted refereeReport if pending)
    let scoreHome = '';
    let scoreAway = '';
    const rawScore = reportData.score || match.score || '';
    if (rawScore && rawScore.includes(':') && rawScore !== '-:-' && rawScore !== ':') {
        const cleanScore = rawScore.replace(/\s*\([^)]*\)/g, '').replace(/[^\d:]/g, '').trim();
        if (cleanScore.includes(':')) {
            const parts = cleanScore.split(':');
            scoreHome = parts[0]?.trim() || '';
            scoreAway = parts[1]?.trim() || '';
        }
    }
    document.getElementById('report-ft-home').value = scoreHome;
    document.getElementById('report-ft-away').value = scoreAway;

    let htHome = '';
    let htAway = '';
    const rawHt = reportData.ht || reportData.htScore || reportData.halfTime || match.ht || '';
    if (rawHt && rawHt.includes(':') && rawHt !== ':') {
        const cleanHt = rawHt.replace(/[()]/g, '').replace(/[^\d:]/g, '').trim();
        if (cleanHt.includes(':')) {
            const parts = cleanHt.split(':');
            htHome = parts[0]?.trim() || '';
            htAway = parts[1]?.trim() || '';
        }
    } else if (rawScore && rawScore.includes('(')) {
        const mHt = rawScore.match(/\(([^)]+)\)/);
        if (mHt && mHt[1].includes(':')) {
            const cleanHt = mHt[1].replace(/[^\d:]/g, '').trim();
            const parts = cleanHt.split(':');
            htHome = parts[0]?.trim() || '';
            htAway = parts[1]?.trim() || '';
        }
    }
    document.getElementById('report-ht-home').value = htHome;
    document.getElementById('report-ht-away').value = htAway;

    document.getElementById('report-note').value = reportData.refereeNotes || reportData.note || match.refereeNotes || match.note || '';
    
    let cancelVal = 'none';
    if (match.status === 'Abgesagt 3:0' || (match.status === 'Abgesagt' && match.score && match.score.includes('3:0'))) {
        cancelVal = 'Abgesagt 3:0';
    } else if (match.status === 'Abgesagt 0:3' || (match.status === 'Abgesagt' && match.score && match.score.includes('0:3'))) {
        cancelVal = 'Abgesagt 0:3';
    } else if (match.status === 'Postponed' || match.status === 'Verschoben') {
        cancelVal = 'Postponed';
    } else if (match.status === 'Canceled' || match.status === 'Abgesagt') {
        cancelVal = 'Canceled';
    }
    document.getElementById('report-cancel-select').value = cancelVal;

    // Populate Player Comboboxes for both teams
    const homePlayers = getTeamPlayersList(match.home);
    const awayPlayers = getTeamPlayersList(match.away);

    populatePlayerCombobox('report-card-player-home', homePlayers, false);
    populatePlayerCombobox('report-card-player-away', awayPlayers, false);
    populatePlayerCombobox('report-scorer-player-home', homePlayers, true);
    populatePlayerCombobox('report-scorer-player-away', awayPlayers, true);

    // Reset minute inputs
    const minGoalH = document.getElementById('report-goal-min-home'); if (minGoalH) minGoalH.value = '';
    const minGoalA = document.getElementById('report-goal-min-away'); if (minGoalA) minGoalA.value = '';
    const minCardH = document.getElementById('report-card-min-home'); if (minCardH) minCardH.value = '';
    const minCardA = document.getElementById('report-card-min-away'); if (minCardA) minCardA.value = '';

    // Populate Scorers & Cards lists from authoritative reportData
    const rawScorers = (reportData.scorers && reportData.scorers.length > 0)
        ? reportData.scorers
        : (reportData.events || []).filter(e => e.type === 'goal');

    reportScorersHome = [];
    reportScorersAway = [];
    rawScorers.forEach(s => {
        const sName = sanitizeMojibake(typeof s === 'string' ? s : (s.name || s.player || ''));
        const sMinute = sanitizeMojibake(typeof s === 'object' ? (s.minute || s.min || '') : '');
        const sTeam = sanitizeMojibake(typeof s === 'object' ? (s.team || '') : '');
        const count = typeof s === 'object' ? (s.count || 1) : 1;
        const isHome = sTeam === match.home || normalizeTeamName(sTeam) === normalizeTeamName(match.home);
        for (let i = 0; i < count; i++) {
            if (isHome) {
                reportScorersHome.push({ player: sName, minute: sMinute });
            } else {
                reportScorersAway.push({ player: sName, minute: sMinute });
            }
        }
    });

    const rawCards = (reportData.cards && reportData.cards.length > 0)
        ? reportData.cards
        : (reportData.events || []).filter(e => e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'yellow-red' || e.type === 'gelbrot' || e.type === 'red');

    reportCardsHome = [];
    reportCardsAway = [];
    rawCards.forEach(c => {
        const cTeam = sanitizeMojibake(c.team || '');
        const cObj = { 
            player: sanitizeMojibake(c.name || c.player || ''), 
            type: c.type || 'yellow', 
            reason: sanitizeMojibake(c.reason || ''),
            minute: sanitizeMojibake(c.minute || c.min || '')
        };
        const isHome = cTeam === match.home || normalizeTeamName(cTeam) === normalizeTeamName(match.home);
        const count = c.count || 1;
        for (let i = 0; i < count; i++) {
            if (isHome) {
                reportCardsHome.push({ ...cObj });
            } else {
                reportCardsAway.push({ ...cObj });
            }
        }
    });

    // Populate Substitutions from authoritative reportData (which includes refereeReport if pending)
    const rawSubs = (reportData.substitutions && reportData.substitutions.length > 0)
        ? reportData.substitutions
        : (reportData.events || []).filter(e => e.type === 'substitution');

    reportSubsHome = [];
    reportSubsAway = [];
    rawSubs.forEach(s => {
        const sTeam = sanitizeMojibake(s.team || '');
        const sObj = {
            playerOut: sanitizeMojibake(s.playerOut || ''),
            playerIn: sanitizeMojibake(s.playerIn || ''),
            minute: sanitizeMojibake(s.minute || '')
        };
        const isHome = sTeam === match.home || normalizeTeamName(sTeam) === normalizeTeamName(match.home);
        if (isHome) {
            reportSubsHome.push(sObj);
        } else {
            reportSubsAway.push(sObj);
        }
    });

    // Reset goal counter inputs
    const countHomeInput = document.getElementById('report-goal-count-home');
    if (countHomeInput) countHomeInput.value = '1';
    const countAwayInput = document.getElementById('report-goal-count-away');
    if (countAwayInput) countAwayInput.value = '1';

    renderReportLists();
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const computeAdminPitchAndBench = (teamName, playersList, roster, subs) => {
    let initialPitch = [];
    let initialBench = [];

    if (roster && Array.isArray(roster.players) && roster.players.length > 0) {
        let starterIdx = 0;
        let subIdx = 0;
        roster.players.forEach((rp, idx) => {
            const name = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
            if (!name) return;
            const isStart = (rp.isStarter !== false && rp.role !== 'sub');
            let shirt = '';
            if (isStart) {
                shirt = String(rp.jerseyNumber || (starterIdx + 1));
                starterIdx++;
            } else {
                shirt = String(rp.jerseyNumber || (12 + subIdx));
                subIdx++;
            }
            const pObj = { name, label: `#${shirt} ${name}` };
            if (isStart && initialPitch.length < 11) {
                initialPitch.push(pObj);
            } else {
                initialBench.push(pObj);
            }
        });
        if (initialPitch.length === 0) {
            initialPitch = roster.players.slice(0, 11).map((rp, idx) => {
                const name = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
                return { name, label: `#${rp.jerseyNumber || (idx + 1)} ${name}` };
            });
            initialBench = roster.players.slice(11).map((rp, idx) => {
                const name = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
                return { name, label: `#${rp.jerseyNumber || (12 + idx)} ${name}` };
            });
        }
    } else {
        const pList = (Array.isArray(playersList) && playersList.length > 0) ? playersList : [];
        initialPitch = pList.slice(0, 11).map((name, idx) => ({ name, label: `#${idx + 1} ${name}` }));
        initialBench = pList.slice(11).map((name, idx) => ({ name, label: `#${12 + idx} ${name}` }));
        if (initialBench.length === 0 && initialPitch.length > 0) {
            initialBench = [...initialPitch];
        }
    }

    const currentPitch = [...initialPitch];
    const currentBench = [...initialBench];

    (subs || []).forEach(s => {
        const outName = (s.playerOut || '').trim();
        const inName = (s.playerIn || '').trim();
        const outIdx = currentPitch.findIndex(p => p.name.toLowerCase() === outName.toLowerCase());
        const outObj = outIdx !== -1 ? currentPitch.splice(outIdx, 1)[0] : { name: outName, label: outName };
        const inIdx = currentBench.findIndex(p => p.name.toLowerCase() === inName.toLowerCase());
        const inObj = inIdx !== -1 ? currentBench.splice(inIdx, 1)[0] : { name: inName, label: inName };
        currentBench.push(outObj);
        currentPitch.push(inObj);
    });

    const uniqueBench = [];
    const seen = new Set();
    currentBench.forEach(p => {
        if (!seen.has(p.name.toLowerCase())) {
            seen.add(p.name.toLowerCase());
            uniqueBench.push(p);
        }
    });

    return { pitch: currentPitch, bench: uniqueBench };
};

const updateAdminSubsUI = () => {
    if (!currentReportMatch) return;
    const homePlayers = getTeamPlayersList(currentReportMatch.home);
    const awayPlayers = getTeamPlayersList(currentReportMatch.away);
    const homeRoster = Store.getMatchdayRoster ? Store.getMatchdayRoster(currentReportMatch.id, currentReportMatch.home) : null;
    const awayRoster = Store.getMatchdayRoster ? Store.getMatchdayRoster(currentReportMatch.id, currentReportMatch.away) : null;

    const homeState = computeAdminPitchAndBench(currentReportMatch.home, homePlayers, homeRoster, reportSubsHome);
    const awayState = computeAdminPitchAndBench(currentReportMatch.away, awayPlayers, awayRoster, reportSubsAway);

    // Home elements
    const homeCounter = document.getElementById('report-sub-counter-home');
    const homeForm = document.getElementById('report-sub-form-home');
    const homeListDiv = document.getElementById('report-subs-list-home');
    const homeOutSelect = document.getElementById('report-sub-out-home');
    const homeInSelect = document.getElementById('report-sub-in-home');

    if (homeCounter) {
        const count = reportSubsHome.length;
        homeCounter.textContent = `${count} / 5 Wechsel`;
        if (count >= 5) {
            homeCounter.style.background = 'rgba(234, 179, 8, 0.2)';
            homeCounter.style.color = '#d97706';
            homeCounter.style.borderColor = 'rgba(234, 179, 8, 0.4)';
        } else {
            homeCounter.style.background = 'rgba(0, 179, 65, 0.15)';
            homeCounter.style.color = 'var(--color-accent)';
            homeCounter.style.borderColor = 'rgba(0, 240, 95, 0.3)';
        }
    }
    if (homeForm) {
        if (reportSubsHome.length >= 5) {
            homeForm.style.opacity = '0.5';
            homeForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
        } else {
            homeForm.style.opacity = '1';
            homeForm.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
        }
    }
    if (homeOutSelect) {
        homeOutSelect.innerHTML = homeState.pitch.map(p => `<option value="${p.name}">${p.label || p.name}</option>`).join('');
    }
    if (homeInSelect) {
        homeInSelect.innerHTML = homeState.bench.map(p => `<option value="${p.name}">${p.label || p.name}</option>`).join('');
    }
    if (homeListDiv) {
        homeListDiv.innerHTML = reportSubsHome.map((s, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; border-left: 2px solid var(--color-accent);">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${s.minute ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${s.minute}'</span>` : ''}
                    <span style="color: #dc2626; font-weight: 700; font-size: 0.75rem;">Aus:</span> <strong>${s.playerOut}</strong>
                    <span style="color: var(--color-text-secondary);">&bull;</span>
                    <span style="color: #16a34a; font-weight: 700; font-size: 0.75rem;">Ein:</span> <strong>${s.playerIn}</strong>
                </div>
                <button type="button" class="btn-del-sub-h" data-idx="${i}" title="Wechsel entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
            </div>
        `).join('');

        homeListDiv.querySelectorAll('.btn-del-sub-h').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                reportSubsHome.splice(idx, 1);
                updateAdminSubsUI();
            };
        });
    }

    // Away elements
    const awayCounter = document.getElementById('report-sub-counter-away');
    const awayForm = document.getElementById('report-sub-form-away');
    const awayListDiv = document.getElementById('report-subs-list-away');
    const awayOutSelect = document.getElementById('report-sub-out-away');
    const awayInSelect = document.getElementById('report-sub-in-away');

    if (awayCounter) {
        const count = reportSubsAway.length;
        awayCounter.textContent = `${count} / 5 Wechsel`;
        if (count >= 5) {
            awayCounter.style.background = 'rgba(234, 179, 8, 0.2)';
            awayCounter.style.color = '#d97706';
            awayCounter.style.borderColor = 'rgba(234, 179, 8, 0.4)';
        } else {
            awayCounter.style.background = 'rgba(0, 179, 65, 0.15)';
            awayCounter.style.color = 'var(--color-accent)';
            awayCounter.style.borderColor = 'rgba(0, 240, 95, 0.3)';
        }
    }
    if (awayForm) {
        if (reportSubsAway.length >= 5) {
            awayForm.style.opacity = '0.5';
            awayForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
        } else {
            awayForm.style.opacity = '1';
            awayForm.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
        }
    }
    if (awayOutSelect) {
        awayOutSelect.innerHTML = awayState.pitch.map(p => `<option value="${p.name}">${p.label || p.name}</option>`).join('');
    }
    if (awayInSelect) {
        awayInSelect.innerHTML = awayState.bench.map(p => `<option value="${p.name}">${p.label || p.name}</option>`).join('');
    }
    if (awayListDiv) {
        awayListDiv.innerHTML = reportSubsAway.map((s, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; border-left: 2px solid var(--color-accent);">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${s.minute ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${s.minute}'</span>` : ''}
                    <span style="color: #dc2626; font-weight: 700; font-size: 0.75rem;">Aus:</span> <strong>${s.playerOut}</strong>
                    <span style="color: var(--color-text-secondary);">&bull;</span>
                    <span style="color: #16a34a; font-weight: 700; font-size: 0.75rem;">Ein:</span> <strong>${s.playerIn}</strong>
                </div>
                <button type="button" class="btn-del-sub-a" data-idx="${i}" title="Wechsel entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
            </div>
        `).join('');

        awayListDiv.querySelectorAll('.btn-del-sub-a').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                reportSubsAway.splice(idx, 1);
                updateAdminSubsUI();
            };
        });
    }
};

const renderReportLists = () => {
    // Render Home Scorers
    const homeGoalsDiv = document.getElementById('report-goals-list-home');
    if (homeGoalsDiv) {
        homeGoalsDiv.innerHTML = reportScorersHome.map((item, i) => {
            const pName = typeof item === 'string' ? item : (item.player || item.name || '');
            const pMin = typeof item === 'object' ? (item.minute || item.min || '') : '';
            const isOwnGoal = pName.toLowerCase().includes('eigentor');
            const ballColor = isOwnGoal ? '#ef4444' : 'var(--color-accent)';
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: ${isOwnGoal ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0,0,0,0.03)'}; padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; ${isOwnGoal ? 'border-left: 2px solid #ef4444;' : ''}">
                <span style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg class="goal-svg-icon ${isOwnGoal ? 'goal-svg-icon-own' : ''}" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${ballColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${ballColor};"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    ${pMin ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${pMin}'</span>` : ''}
                    <strong style="${isOwnGoal ? 'color: #ef4444;' : ''}">${pName}</strong>
                </span>
                <button type="button" class="btn-del-goal-h" data-idx="${i}" title="Tor entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
            </div>
            `;
        }).join('');

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
        awayGoalsDiv.innerHTML = reportScorersAway.map((item, i) => {
            const pName = typeof item === 'string' ? item : (item.player || item.name || '');
            const pMin = typeof item === 'object' ? (item.minute || item.min || '') : '';
            const isOwnGoal = pName.toLowerCase().includes('eigentor');
            const ballColor = isOwnGoal ? '#ef4444' : 'var(--color-accent)';
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: ${isOwnGoal ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0,0,0,0.03)'}; padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; ${isOwnGoal ? 'border-left: 2px solid #ef4444;' : ''}">
                <span style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg class="goal-svg-icon ${isOwnGoal ? 'goal-svg-icon-own' : ''}" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${ballColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${ballColor};"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    ${pMin ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${pMin}'</span>` : ''}
                    <strong style="${isOwnGoal ? 'color: #ef4444;' : ''}">${pName}</strong>
                </span>
                <button type="button" class="btn-del-goal-a" data-idx="${i}" title="Tor entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
            </div>
            `;
        }).join('');

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
        if (type === 'yellowRed' || type === 'yellow-red' || type === 'gelbrot') return '<span style="background: #e67e22; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Gelb-Rot</span>';
        if (type === 'red') return '<span style="background: #e74c3c; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Rot</span>';
        return '';
    };

    const homeCardsDiv = document.getElementById('report-cards-list-home');
    if (homeCardsDiv) {
        homeCardsDiv.innerHTML = reportCardsHome.map((c, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${cardBadge(c.type)}
                    ${c.minute ? `<span style="background: rgba(0,0,0,0.07); color: var(--color-text-secondary); font-weight: 700; padding: 1px 5px; border-radius: 3px; font-size: 0.75rem;">${c.minute}'</span>` : ''}
                    <strong>${c.player}</strong>
                    ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
                </div>
                <button type="button" class="btn-del-card-h" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
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
                    ${c.minute ? `<span style="background: rgba(0,0,0,0.07); color: var(--color-text-secondary); font-weight: 700; padding: 1px 5px; border-radius: 3px; font-size: 0.75rem;">${c.minute}'</span>` : ''}
                    <strong>${c.player}</strong>
                    ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
                </div>
                <button type="button" class="btn-del-card-a" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
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

    // Render Substitutions
    updateAdminSubsUI();
};

const saveReportForm = (e) => {
    e.preventDefault();
    if (!currentReportMatch) return;

    if (!isGameActive(currentReportMatch)) {
        showToast('Diese Liga ist inaktiv und schreibgeschützt. Um Änderungen vorzunehmen, ändern Sie den Status unter "Ligen verwalten" auf "Aktiv".', true);
        return;
    }

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

    // Build unified scorers array with minutes
    const scorers = [];
    reportScorersHome.forEach(s => {
        const cleanName = sanitizeMojibake(s.player || s.name || s);
        const cleanMinute = sanitizeMojibake(s.minute || s.min || '');
        scorers.push({ name: cleanName, player: cleanName, team: currentReportMatch.home, type: 'goal', minute: cleanMinute });
    });
    reportScorersAway.forEach(s => {
        const cleanName = sanitizeMojibake(s.player || s.name || s);
        const cleanMinute = sanitizeMojibake(s.minute || s.min || '');
        scorers.push({ name: cleanName, player: cleanName, team: currentReportMatch.away, type: 'goal', minute: cleanMinute });
    });

    // Build unified cards array with minutes
    const cards = [];
    reportCardsHome.forEach(c => {
        const cleanPlayer = sanitizeMojibake(c.player || c.name || '');
        const cleanReason = sanitizeMojibake(c.reason || '');
        const cleanMinute = sanitizeMojibake(c.minute || c.min || '');
        cards.push({ name: cleanPlayer, player: cleanPlayer, team: currentReportMatch.home, type: c.type, reason: cleanReason, minute: cleanMinute });
    });
    reportCardsAway.forEach(c => {
        const cleanPlayer = sanitizeMojibake(c.player || c.name || '');
        const cleanReason = sanitizeMojibake(c.reason || '');
        const cleanMinute = sanitizeMojibake(c.minute || c.min || '');
        cards.push({ name: cleanPlayer, player: cleanPlayer, team: currentReportMatch.away, type: c.type, reason: cleanReason, minute: cleanMinute });
    });

    // Build unified substitutions array
    const substitutions = [];
    reportSubsHome.forEach(s => {
        const cleanOut = sanitizeMojibake(s.playerOut || '');
        const cleanIn = sanitizeMojibake(s.playerIn || '');
        const cleanMinute = sanitizeMojibake(s.minute || '');
        substitutions.push({ team: currentReportMatch.home, playerOut: cleanOut, playerIn: cleanIn, minute: cleanMinute, type: 'substitution' });
    });
    reportSubsAway.forEach(s => {
        const cleanOut = sanitizeMojibake(s.playerOut || '');
        const cleanIn = sanitizeMojibake(s.playerIn || '');
        const cleanMinute = sanitizeMojibake(s.minute || '');
        substitutions.push({ team: currentReportMatch.away, playerOut: cleanOut, playerIn: cleanIn, minute: cleanMinute, type: 'substitution' });
    });

    // Build events timeline
    const events = [];
    scorers.forEach(s => events.push({ type: 'goal', player: s.name, name: s.name, team: s.team, minute: s.minute || '' }));
    cards.forEach(c => events.push({ type: c.type, player: c.name, name: c.name, team: c.team, reason: c.reason || '', minute: c.minute || '' }));
    substitutions.forEach(s => events.push({ type: 'substitution', team: s.team, minute: s.minute || '', playerOut: s.playerOut, playerIn: s.playerIn }));

    const isPending = currentReportMatch.reportStatus === 'pending_approval';
    const finalReportStatus = isPending ? 'approved' : (currentReportMatch.reportStatus || 'approved');

    const updatedMatch = {
        ...currentReportMatch,
        score: score,
        ht: ht,
        htScore: ht,
        halfTime: ht,
        status: status,
        reportStatus: finalReportStatus,
        note: note,
        refereeNotes: note,
        scorers: scorers,
        cards: cards,
        events: events,
        substitutions: substitutions,
        confirmedAt: isPending ? Date.now() : (currentReportMatch.confirmedAt || Date.now()),
        confirmedBy: isPending ? 'Liga-Vorstand' : (currentReportMatch.confirmedBy || '')
    };

    if (updatedMatch.refereeReport) {
        updatedMatch.refereeReport.status = finalReportStatus;
        updatedMatch.refereeReport.substitutions = substitutions;
        if (isPending) updatedMatch.refereeReport.confirmedAt = Date.now();
    }

    const targetSeasonKey = currentReportMatch.seasonKey || (Store.getData()?.currentSeason || '2026/2027');

    // Update dedicated pending reports store if this was pending
    if (isPending && Store.getPendingReportsStore) {
        const pendingStore = Store.getPendingReportsStore();
        const pIdx = pendingStore.findIndex(p => String(p.matchId) === String(currentReportMatch.id) && String(p.seasonKey) === String(targetSeasonKey));
        if (pIdx !== -1) {
            pendingStore[pIdx].status = 'approved';
            pendingStore[pIdx].confirmedAt = Date.now();
            pendingStore[pIdx].confirmedBy = 'Liga-Vorstand';
            Store.savePendingReportsStore(pendingStore);
        }
    }

    Store.saveMatch(targetSeasonKey, deepSanitize(updatedMatch));
    Store.recalculateSeason(targetSeasonKey);
    window.dispatchEvent(new CustomEvent('match-reports-updated'));
    window.dispatchEvent(new CustomEvent('data-updated'));

    closeReportModal();
    loadDataAndRender();
    showToast(isPending ? 'Spielbericht erfolgreich freigegeben & Tabelle aktualisiert!' : 'Spielbericht erfolgreich gespeichert!');
};

const setupEventHandlers = () => {
    // Main toolbar buttons
    const addBtn = document.getElementById('btn-add-game-main');
    if (addBtn) addBtn.onclick = openAddGameModal;

    const searchInput = document.getElementById('game-search');
    if (searchInput) searchInput.oninput = (e) => {
        try { sessionStorage.setItem('dsg_game_search', e.target.value); } catch(err) {}
        currentPage = 1;
        renderGamesTable();
    };

    const leagueFilter = document.getElementById('game-league-filter');
    if (leagueFilter) leagueFilter.onchange = (e) => {
        try { sessionStorage.setItem('dsg_game_league_filter', e.target.value); } catch(err) {}
        currentPage = 1;
        renderGamesTable();
    };

    const roundFilter = document.getElementById('game-round-filter');
    if (roundFilter) roundFilter.onchange = (e) => {
        try { sessionStorage.setItem('dsg_game_round_filter', e.target.value); } catch(err) {}
        currentPage = 1;
        renderGamesTable();
    };

    const statusFilter = document.getElementById('game-status-filter');
    if (statusFilter) statusFilter.onchange = (e) => {
        try { sessionStorage.setItem('dsg_game_status_filter', e.target.value); } catch(err) {}
        currentPage = 1;
        renderGamesTable();
    };

    const sortSelect = document.getElementById('game-sort-select');
    if (sortSelect) sortSelect.onchange = (e) => {
        try { sessionStorage.setItem('dsg_game_sort_select', e.target.value); } catch(err) {}
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

    // Setup searchable player combobox interactions
    setupSearchableComboboxes();

    // Add Goal buttons
    const addGoalH = document.getElementById('btn-add-goal-home');
    const countInputH = document.getElementById('report-goal-count-home');
    const minGoalHInput = document.getElementById('report-goal-min-home');
    if (addGoalH) {
        addGoalH.onclick = () => {
            const val = getComboboxValue('report-scorer-player-home');
            const count = Math.max(1, parseInt(countInputH?.value) || 1);
            const minVal = minGoalHInput ? minGoalHInput.value.replace(/['"]/g, '').trim() : '';
            if (val) {
                for (let i = 0; i < count; i++) {
                    reportScorersHome.push({ player: val, minute: minVal });
                }
                renderReportLists();
                resetPlayerCombobox('report-scorer-player-home', true);
                if (countInputH) countInputH.value = '1';
                if (minGoalHInput) minGoalHInput.value = '';
            }
        };
    }
    if (countInputH) {
        countInputH.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addGoalH) addGoalH.click();
            }
        };
    }
    if (minGoalHInput) {
        minGoalHInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addGoalH) addGoalH.click();
            }
        };
    }

    const addGoalA = document.getElementById('btn-add-goal-away');
    const countInputA = document.getElementById('report-goal-count-away');
    const minGoalAInput = document.getElementById('report-goal-min-away');
    if (addGoalA) {
        addGoalA.onclick = () => {
            const val = getComboboxValue('report-scorer-player-away');
            const count = Math.max(1, parseInt(countInputA?.value) || 1);
            const minVal = minGoalAInput ? minGoalAInput.value.replace(/['"]/g, '').trim() : '';
            if (val) {
                for (let i = 0; i < count; i++) {
                    reportScorersAway.push({ player: val, minute: minVal });
                }
                renderReportLists();
                resetPlayerCombobox('report-scorer-player-away', true);
                if (countInputA) countInputA.value = '1';
                if (minGoalAInput) minGoalAInput.value = '';
            }
        };
    }
    if (countInputA) {
        countInputA.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addGoalA) addGoalA.click();
            }
        };
    }
    if (minGoalAInput) {
        minGoalAInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addGoalA) addGoalA.click();
            }
        };
    }

    // Add Card buttons
    const addCardH = document.getElementById('btn-add-card-home');
    const minCardHInput = document.getElementById('report-card-min-home');
    if (addCardH) addCardH.onclick = () => {
        const typeSelect = document.getElementById('report-card-type-home');
        const reasonInput = document.getElementById('report-card-reason-home');
        const minVal = minCardHInput ? minCardHInput.value.replace(/['"]/g, '').trim() : '';
        const player = getComboboxValue('report-card-player-home');
        if (player) {
            reportCardsHome.push({
                player: player,
                type: typeSelect ? typeSelect.value : 'yellow',
                reason: reasonInput ? reasonInput.value.trim() : '',
                minute: minVal
            });
            renderReportLists();
            resetPlayerCombobox('report-card-player-home', true);
            if (reasonInput) reasonInput.value = '';
            if (minCardHInput) minCardHInput.value = '';
        }
    };
    if (minCardHInput) {
        minCardHInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addCardH) addCardH.click();
            }
        };
    }

    const addCardA = document.getElementById('btn-add-card-away');
    const minCardAInput = document.getElementById('report-card-min-away');
    if (addCardA) addCardA.onclick = () => {
        const typeSelect = document.getElementById('report-card-type-away');
        const reasonInput = document.getElementById('report-card-reason-away');
        const minVal = minCardAInput ? minCardAInput.value.replace(/['"]/g, '').trim() : '';
        const player = getComboboxValue('report-card-player-away');
        if (player) {
            reportCardsAway.push({
                player: player,
                type: typeSelect ? typeSelect.value : 'yellow',
                reason: reasonInput ? reasonInput.value.trim() : '',
                minute: minVal
            });
            renderReportLists();
            resetPlayerCombobox('report-card-player-away', true);
            if (reasonInput) reasonInput.value = '';
            if (minCardAInput) minCardAInput.value = '';
        }
    };
    if (minCardAInput) {
        minCardAInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addCardA) addCardA.click();
            }
        };
    }

    // Add Substitution buttons
    const addSubH = document.getElementById('btn-add-sub-home');
    if (addSubH) {
        addSubH.onclick = () => {
            if (reportSubsHome.length >= 5) return;
            const outPlayer = document.getElementById('report-sub-out-home')?.value;
            const inPlayer = document.getElementById('report-sub-in-home')?.value;
            const minVal = (document.getElementById('report-sub-min-home')?.value || '').replace(/['"]/g, '').trim();
            if (outPlayer && inPlayer) {
                reportSubsHome.push({ playerOut: outPlayer, playerIn: inPlayer, minute: minVal });
                updateAdminSubsUI();
                const minInput = document.getElementById('report-sub-min-home');
                if (minInput) minInput.value = '';
            }
        };
    }

    const addSubA = document.getElementById('btn-add-sub-away');
    if (addSubA) {
        addSubA.onclick = () => {
            if (reportSubsAway.length >= 5) return;
            const outPlayer = document.getElementById('report-sub-out-away')?.value;
            const inPlayer = document.getElementById('report-sub-in-away')?.value;
            const minVal = (document.getElementById('report-sub-min-away')?.value || '').replace(/['"]/g, '').trim();
            if (outPlayer && inPlayer) {
                reportSubsAway.push({ playerOut: outPlayer, playerIn: inPlayer, minute: minVal });
                updateAdminSubsUI();
                const minInput = document.getElementById('report-sub-min-away');
                if (minInput) minInput.value = '';
            }
        };
    }
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
        window.adminGamesDataRef = gamesData;
        window.openAdminReportModalForGame = openReportModal;

        populateFilterAndFormDropdowns();
        renderGamesTable();
    } catch (err) {
        console.error('Error loading games data:', err);
    }
};

export const initAdminGames = async () => {
    ensureModalsInBody();
    setupEventHandlers();
    await loadDataAndRender();
};


