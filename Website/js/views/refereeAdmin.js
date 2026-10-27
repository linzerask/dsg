import { Store } from '../store.js?v=1793040000000';

import { logout } from '../auth.js?v=1793040000000';

import { calculateSeasonSuspensions, normalizePlayerName, normalizeKey } from '../suspensionUtils.js?v=1793040000000';
import { getPlayerAvatar } from '../playerUtils.js?v=1792924000000';



let selectedSeason = '2026/2027';

let selectedMatchId = null;

let currentRefereeTab = 'passkontrolle'; // 'passkontrolle' | 'spielbericht'



export const viewRefereeAdmin = (auth) => {

  return `

    <div class="view-admin" style="min-height: calc(100vh - 120px); padding-bottom: 60px;">

      

      <div class="container" style="max-width: 1200px; margin: 0 auto; padding: var(--space-md) var(--space-md);">

        

        <!-- Referee Header Banner -->

        <div class="glass-card stagger-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); padding: var(--space-lg); margin-bottom: var(--space-lg); border-left: 4px solid var(--color-accent);">

          <div>

            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">Offizieller Schiedsrichter-Bereich</div>

            <h1 style="margin: 4px 0 6px 0; font-size: clamp(1.25rem, 4vw, 1.8rem);">Matchday & Digitaler Spielbericht</h1>

            <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin: 0;">Passkontrolle und digitale Spielerfassung der DSG Liga</p>

          </div>

          <div style="display: flex; gap: var(--space-sm); align-items: center;">

            <button id="referee-logout-btn" class="btn btn-outline" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.35) !important; font-weight: 700; padding: 8px 16px;">

              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>

              Abmelden

            </button>

          </div>

        </div>



        <!-- Match & Season Selector Card -->

        <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-lg); border-radius: 8px; border: 1px solid var(--glass-border);">

          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-md);">

            <div style="flex: 1 1 200px; min-width: 0; width: 100%;">

              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-accent); margin-bottom: 6px; text-transform: uppercase;">

                Liga / Saison wählen

              </label>

              <select id="referee-season-select" class="admin-input" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px;">

                <option value="Testliga 2026/2027">Testliga 2026/2027 (Testbetrieb)</option>

                <option value="2026/2027">DSG Liga 2026/2027 (Offiziell)</option>

              </select>

            </div>

            <div style="flex: 2 1 260px; min-width: 0; width: 100%;">

              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-accent); margin-bottom: 6px; text-transform: uppercase;">

                Spiel auswählen

              </label>

              <select id="referee-match-select" class="admin-input" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px;">

                <option value="">-- Bitte Spiel wählen --</option>

              </select>

            </div>

            <div id="referee-match-meta" style="font-size: 0.85rem; color: var(--color-text-secondary); text-align: right;">

              <!-- Meta filled dynamically -->

            </div>

          </div>

        </div>



        <!-- Navigation Tabs -->

        <div style="display: flex; gap: 8px; margin-bottom: var(--space-md); border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;">

          <button id="tab-btn-passkontrolle" class="btn ${currentRefereeTab === 'passkontrolle' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 9px 18px; font-size: 0.9rem;">

            Passkontrolle vor dem Spiel

          </button>

          <button id="tab-btn-spielbericht" class="btn ${currentRefereeTab === 'spielbericht' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 9px 18px; font-size: 0.9rem;">

            Digitaler Spielbericht

          </button>

        </div>



        <!-- Content Area -->

        <div id="referee-content-container">

          <!-- Filled dynamically -->

        </div>



      </div>

    </div>

  `;

};



export const bindRefereeAdmin = async () => {

  const logoutBtn = document.getElementById('referee-logout-btn');

  logoutBtn?.addEventListener('click', () => {

    logout();

    window.location.hash = '#/admin';

    window.location.reload();

  });



  const seasonSelect = document.getElementById('referee-season-select');

  const matchSelect = document.getElementById('referee-match-select');

  const matchMeta = document.getElementById('referee-match-meta');

  const contentContainer = document.getElementById('referee-content-container');

  const tabPasskontrolle = document.getElementById('tab-btn-passkontrolle');

  const tabSpielbericht = document.getElementById('tab-btn-spielbericht');



  const ligaData = Store.getData();

  if (ligaData.seasons && ligaData.seasons['Testliga 2026/2027']) {

    selectedSeason = 'Testliga 2026/2027';

  } else {

    selectedSeason = ligaData.currentSeason || '2026/2027';

  }



  let players = (Store.getAdminPlayersSync ? Store.getAdminPlayersSync() : []) || [];

  Store.getAdminPlayers().then(p => {

    if (p && Array.isArray(p) && p.length > 0) {

      players = p;

      renderActiveTab();

    }

  });



  const getSeasonMatches = () => {

    const data = Store.getData();

    return (data.seasons && data.seasons[selectedSeason]?.matches) || [];

  };



  const getActiveMatch = () => {

    const matches = getSeasonMatches();

    return matches.find(m => String(m.id) === String(selectedMatchId));

  };



  const populateMatchDropdown = () => {

    const matches = getSeasonMatches();

    if (!matchSelect) return;



    if (matches.length === 0) {

      matchSelect.innerHTML = '<option value="">-- Keine Spiele in dieser Saison vorhanden --</option>';

      selectedMatchId = null;

    } else {

      matchSelect.innerHTML = '<option value="">-- Bitte Spiel wählen --</option>' + 

        matches.map(m => {

          const roundStr = m.round ? `Runde ${m.round}` : '';

          const dateStr = m.date || '';

          const scoreStr = (m.score && m.score !== '-:-' && m.score !== ':') ? `[${m.score}]` : '(Bevorstehend)';

          return `<option value="${m.id}">${roundStr ? roundStr + ': ' : ''}${m.home} vs ${m.away} ${scoreStr} - ${dateStr}</option>`;

        }).join('');



      if (!selectedMatchId || !matches.some(m => String(m.id) === String(selectedMatchId))) {

        selectedMatchId = matches[0].id;

      }

      matchSelect.value = selectedMatchId;

    }



    const activeMatch = getActiveMatch();

    updateMetaDisplay(activeMatch);

    renderActiveTab();

  };



  if (seasonSelect) {

    seasonSelect.value = selectedSeason;

    seasonSelect.addEventListener('change', (e) => {

      selectedSeason = e.target.value;

      selectedMatchId = null;

      populateMatchDropdown();

    });

  }



  matchSelect?.addEventListener('change', (e) => {

    selectedMatchId = e.target.value;

    const activeMatch = getActiveMatch();

    updateMetaDisplay(activeMatch);

    renderActiveTab();

  });



  const updateMetaDisplay = (match) => {

    if (!matchMeta) return;

    if (!match) {

      matchMeta.innerHTML = '';

      return;

    }

    matchMeta.innerHTML = `

      <div><strong>Datum:</strong> ${match.date || 'Offen'} &bull; <strong>Uhrzeit:</strong> ${match.time ? match.time + ' Uhr' : 'Offen'}</div>

      <div><strong>Ort:</strong> ${match.location || 'DSG Sportanlage'}</div>

      <div><strong>Status:</strong> <span style="color: ${match.status === 'Gespielt' || match.status === 'Played' ? '#22c55e' : 'var(--color-accent)'}; font-weight: 700;">${match.status || 'Geplant'}</span></div>

    `;

  };



  const updateTabButtonStyles = () => {

    if (tabPasskontrolle) {

      tabPasskontrolle.className = `btn ${currentRefereeTab === 'passkontrolle' ? 'btn-dsg' : 'btn-outline'}`;

    }

    if (tabSpielbericht) {

      tabSpielbericht.className = `btn ${currentRefereeTab === 'spielbericht' ? 'btn-dsg' : 'btn-outline'}`;

    }

  };



  const renderActiveTab = () => {

    if (!contentContainer) return;

    const match = getActiveMatch();



    if (!match) {

      contentContainer.innerHTML = `

        <div class="glass-card" style="text-align: center; padding: 50px 20px; color: var(--color-text-secondary); border-radius: 8px;">

          <h3 style="color: var(--color-text-primary);">Kein Spiel ausgewählt</h3>

          <p style="font-size: 0.95rem;">Wähle oben im Dropdown ein Spiel aus, um die Passkontrolle durchzuführen oder den Spielbericht zu bearbeiten.</p>

        </div>

      `;

      return;

    }



    updateMetaDisplay(match);



    if (currentRefereeTab === 'passkontrolle') {

      renderPasskontrolle(match, players);

    } else {

      renderSpielbericht(match, players);

    }

  };



  // Tab switching

  tabPasskontrolle?.addEventListener('click', () => {

    currentRefereeTab = 'passkontrolle';

    updateTabButtonStyles();

    renderActiveTab();

  });



  tabSpielbericht?.addEventListener('click', () => {

    currentRefereeTab = 'spielbericht';

    updateTabButtonStyles();

    renderActiveTab();

  });



  const renderPasskontrolle = (match, allPlayers) => {

    const homeTeam = match.home || '';

    const awayTeam = match.away || '';



    const filterPlayers = (teamName) => {

      const norm = teamName.toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();

      return allPlayers.filter(p => {

        const pTeam = (p.Team || p.Mannschaft || p.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();

        return pTeam.includes(norm) || norm.includes(pTeam);

      });

    };



    const { playerMap } = calculateSeasonSuspensions(selectedSeason);



    const homePlayers = filterPlayers(homeTeam);

    const awayPlayers = filterPlayers(awayTeam);



    const renderTeamPassList = (teamTitle, teamPlayers, side) => {

      return `

        <div class="glass-card" style="padding: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border);">

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-accent); padding-bottom: 8px; margin-bottom: var(--space-md);">

            <h3 style="margin: 0; font-size: 1.15rem; color: var(--color-text-primary);">${teamTitle}</h3>

            <span style="font-size: 0.8rem; background: var(--color-surface); border: 1px solid var(--glass-border); padding: 3px 8px; border-radius: 4px; font-weight: 700; color: var(--color-text-secondary);">${teamPlayers.length} gemeldet</span>

          </div>



          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; padding-right: 4px;">

            ${teamPlayers.length === 0 ? `

              <div style="font-size: 0.85rem; color: var(--color-text-secondary); text-align: center; padding: 20px;">Keine Spieler für dieses Team registriert.</div>

            ` : teamPlayers.map(p => {

              const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();

              const pKey = normalizePlayerName(pName) + '___' + normalizeKey(teamTitle);

              const suspInfo = playerMap.get(pKey);

              const isSuspended = suspInfo && suspInfo.status === 'suspended';



              const hasCustomPhoto = !!(p.photoUrl || p.passPhoto || p.photo || p.foto || p.avatar || p.Foto || p.image);
              const avatarSrc = getPlayerAvatar(p);
              const isVerified = p.verified || p.passType === 'digital' || hasCustomPhoto;

              return `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: ${isSuspended ? 'rgba(220, 38, 38, 0.08)' : 'var(--color-surface)'}; border: 1px solid ${isSuspended ? '#ef4444' : 'var(--glass-border)'}; border-radius: 6px; padding: 8px 10px;">
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                    <div style="width: 42px; height: 42px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid ${hasCustomPhoto ? 'var(--color-accent)' : 'var(--glass-border)'}; flex-shrink: 0;">
                      <img src="${avatarSrc}" alt="${pName}" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center; cursor: pointer;" title="Klicken für Vollbild" onclick="window.open('${avatarSrc}', '_blank')">
                    </div>
                    <div style="min-width: 0; flex: 1;">
                      <div style="font-weight: 700; font-size: 0.88rem; color: ${isSuspended ? '#dc2626' : 'var(--color-text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${pName}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${p.Geburtsdatum ? `Geb.: ${p.Geburtsdatum}` : ''} ${p.Position ? `&bull; ${p.Position}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="text-align: right; flex-shrink: 0;">
                    ${isSuspended ? `
                      <span style="background: #dc2626; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; display: inline-block;">GESPERRT</span>
                    ` : hasCustomPhoto ? `
                      <span style="color: #16a34a; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Digital verifiziert
                      </span>
                    ` : `
                      <label style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #d97706; cursor: pointer; font-weight: 600;">
                        <input type="checkbox" class="physical-pass-check" data-player="${pName}" style="cursor: pointer;">
                        <span>Pass ok</span>
                      </label>
                    `}
                  </div>
                </div>
              `;

            }).join('')}

          </div>

        </div>

      `;

    };



    contentContainer.innerHTML = `

      <div style="margin-bottom: var(--space-md); padding: 12px 16px; background: rgba(0, 240, 95, 0.08); border: 1px solid rgba(0, 240, 95, 0.3); border-radius: 6px; font-size: 0.85rem; color: var(--color-text-primary); display: flex; align-items: flex-start; gap: 10px;">

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); flex-shrink: 0; margin-top: 1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

        <div><strong>Schiedsrichter-Passkontrolle:</strong> Bitte vergleiche vor Spielbeginn die anwesenden Spieler mit dieser Liste. Spieler mit <strong>[GESPERRT]</strong> dürfen keinesfalls eingesetzt werden. Spieler ohne digitales Foto müssen den physischen Spielerpass vorlegen.</div>

      </div>



      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-md);">

        ${renderTeamPassList(homeTeam, homePlayers, 'home')}

        ${renderTeamPassList(awayTeam, awayPlayers, 'away')}

      </div>

    `;

  };



  const renderSpielbericht = (match, allPlayers) => {

    const existingEvents = match.events || [];

    const existingScorers = match.scorers || [];

    const existingCards = match.cards || [];



    // Separate scorers

    let homeScore = 0;

    let awayScore = 0;

    if (match.score && match.score.includes(':')) {

      const parts = match.score.split(':');

      homeScore = parseInt(parts[0].trim(), 10) || 0;

      awayScore = parseInt(parts[1].trim(), 10) || 0;

    }



    let htHome = '';

    let htAway = '';

    if (match.ht && match.ht.includes(':')) {

      const parts = match.ht.split(':');

      htHome = parts[0].trim();

      htAway = parts[1].trim();

    }



    contentContainer.innerHTML = `

      <form id="referee-report-form" class="glass-card" style="padding: var(--space-lg); border-radius: 8px; border: 1px solid var(--glass-border);">

        <h3 style="margin-top: 0; margin-bottom: var(--space-md); border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; color: var(--color-text-primary);">

          Digitaler Spielbericht &bull; ${match.home} vs ${match.away}

        </h3>



        <!-- Score Row -->

        <div style="background: var(--color-surface); border: 1px solid var(--glass-border); border-radius: 8px; padding: var(--space-md); margin-bottom: var(--space-lg);">

          <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-md); align-items: center; text-align: center;">

            <div>

              <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-accent); margin-bottom: 6px;">${match.home}</div>

              <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Endstand Tore</label>

              <input type="number" id="rep-home-score" min="0" max="99" value="${homeScore}" class="admin-input" style="font-size: 1.8rem; font-weight: 800; text-align: center; width: 80px; margin: 0 auto; padding: 6px;">

            </div>



            <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-secondary); padding-top: 20px;">:</div>



            <div>

              <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-accent); margin-bottom: 6px;">${match.away}</div>

              <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Endstand Tore</label>

              <input type="number" id="rep-away-score" min="0" max="99" value="${awayScore}" class="admin-input" style="font-size: 1.8rem; font-weight: 800; text-align: center; width: 80px; margin: 0 auto; padding: 6px;">

            </div>

          </div>



          <!-- Half-time score -->

          <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 14px; font-size: 0.85rem;">

            <span style="color: var(--color-text-secondary);">Halbzeitstand (HZ):</span>

            <input type="number" id="rep-ht-home" min="0" max="99" value="${htHome}" placeholder="0" class="admin-input" style="width: 50px; text-align: center; padding: 4px;">

            <span>:</span>

            <input type="number" id="rep-ht-away" min="0" max="99" value="${htAway}" placeholder="0" class="admin-input" style="width: 50px; text-align: center; padding: 4px;">

          </div>

        </div>



        <!-- Torschützen Section -->

        <div style="margin-bottom: var(--space-lg);">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">

            <h4 style="margin: 0; font-size: 1rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px;">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><circle cx="12" cy="12" r="10"/><path d="m12 7 3.5 2.5-1.5 4.5h-4L8.5 9.5z"/></svg>

              Torschützen

            </h4>

            <button type="button" id="btn-add-scorer-row" class="btn btn-outline" style="font-size: 0.78rem; padding: 5px 12px; color: var(--color-accent) !important; border-color: var(--color-accent) !important; font-weight: 700;">

              + Tor hinzufügen

            </button>

          </div>

          <div id="scorers-container" style="display: flex; flex-direction: column; gap: 8px;">

            <!-- Dynamic scorer rows -->

          </div>

        </div>



        <!-- Disziplinarstrafen (Karten) Section -->

        <div style="margin-bottom: var(--space-lg);">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">

            <h4 style="margin: 0; font-size: 1rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px;">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #eab308;"><rect x="4" y="3" width="11" height="16" rx="2"/><rect x="9" y="5" width="11" height="16" rx="2" style="opacity: 0.5;"/></svg>

              Disziplinarkarten

            </h4>

            <button type="button" id="btn-add-card-row" class="btn btn-outline" style="font-size: 0.78rem; padding: 5px 12px; color: #d97706 !important; border-color: #d97706 !important; font-weight: 700;">

              + Karte hinzufügen

            </button>

          </div>

          <div id="cards-container" style="display: flex; flex-direction: column; gap: 8px;">

            <!-- Dynamic card rows -->

          </div>

        </div>



        <!-- Schiedsrichter-Vorkommnisse (Incident Notes) -->

        <div style="margin-bottom: var(--space-lg);">

          <label style="display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-primary);">

            Vorkommnisse & Schiedsrichter-Bemerkungen (optional)

          </label>

          <textarea id="rep-referee-notes" class="admin-input" rows="3" placeholder="Besondere Vorfälle, Ausschlüsse, Verletzungen, Platzverhältnisse..." style="width: 100%; font-size: 0.85rem;">${match.refereeNotes || ''}</textarea>

        </div>



        <div style="border-top: 1px solid var(--glass-border); padding-top: var(--space-md); display: flex; justify-content: flex-end; gap: 12px;">

          <button type="submit" id="btn-submit-report" class="btn-dsg" style="font-weight: 800; font-size: 1rem; padding: 12px 24px; border-radius: 6px; cursor: pointer;">

            Spielbericht offiziell speichern

          </button>

        </div>

      </form>

    `;



    // Scorers dynamic list

    const scorersContainer = document.getElementById('scorers-container');

    const addScorerBtn = document.getElementById('btn-add-scorer-row');



    const renderScorerRow = (initialData = {}) => {

      const row = document.createElement('div');

      row.className = 'scorer-row';

      row.style.display = 'grid';

      row.style.gridTemplateColumns = '140px 1fr 80px 40px';

      row.style.gap = '8px';

      row.style.alignItems = 'center';

      row.style.background = 'var(--color-surface)';

      row.style.padding = '6px 10px';

      row.style.borderRadius = '6px';

      row.style.border = '1px solid var(--glass-border)';



      row.innerHTML = `

        <select class="admin-input scorer-team" style="font-size: 0.82rem; padding: 6px;">

          <option value="${match.home}" ${initialData.team === match.home ? 'selected' : ''}>${match.home}</option>

          <option value="${match.away}" ${initialData.team === match.away ? 'selected' : ''}>${match.away}</option>

        </select>

        <input type="text" class="admin-input scorer-name" placeholder="Spieler Name" value="${initialData.player || ''}" style="font-size: 0.85rem; padding: 6px;">

        <input type="number" class="admin-input scorer-count" placeholder="Tore" min="1" max="20" value="${initialData.goals || 1}" style="font-size: 0.85rem; padding: 6px; text-align: center;">

        <button type="button" class="btn btn-outline btn-remove-row" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.3) !important; padding: 6px; font-weight: 700; border-radius: 4px;">✕</button>

      `;



      row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());

      scorersContainer.appendChild(row);

    };



    // Populate existing scorers

    if (existingScorers.length > 0) {

      existingScorers.forEach(s => renderScorerRow(s));

    } else if (existingEvents.length > 0) {

      // Group goals from events

      const goalsMap = new Map();

      existingEvents.filter(e => e.type === 'goal').forEach(g => {

        const key = `${g.team}_${g.player}`;

        if (!goalsMap.has(key)) {

          goalsMap.set(key, { team: g.team, player: g.player, goals: 0 });

        }

        goalsMap.get(key).goals += 1;

      });

      goalsMap.forEach(v => renderScorerRow(v));

    }



    addScorerBtn?.addEventListener('click', () => {

      renderScorerRow({ team: match.home, player: '', goals: 1 });

    });



    // Cards dynamic list

    const cardsContainer = document.getElementById('cards-container');

    const addCardBtn = document.getElementById('btn-add-card-row');



    const renderCardRow = (initialData = {}) => {

      const row = document.createElement('div');

      row.className = 'card-row';

      row.style.display = 'grid';

      row.style.gridTemplateColumns = '140px 1fr 130px 40px';

      row.style.gap = '8px';

      row.style.alignItems = 'center';

      row.style.background = 'var(--color-surface)';

      row.style.padding = '6px 10px';

      row.style.borderRadius = '6px';

      row.style.border = '1px solid var(--glass-border)';



      row.innerHTML = `

        <select class="admin-input card-team" style="font-size: 0.82rem; padding: 6px;">

          <option value="${match.home}" ${initialData.team === match.home ? 'selected' : ''}>${match.home}</option>

          <option value="${match.away}" ${initialData.team === match.away ? 'selected' : ''}>${match.away}</option>

        </select>

        <input type="text" class="admin-input card-player" placeholder="Spieler Name" value="${initialData.player || ''}" style="font-size: 0.85rem; padding: 6px;">

        <select class="admin-input card-type" style="font-size: 0.82rem; padding: 6px;">

          <option value="Gelb" ${initialData.type === 'Gelb' || initialData.type === 'yellow' ? 'selected' : ''}>Gelbe Karte</option>

          <option value="Gelb-Rot" ${initialData.type === 'Gelb-Rot' || initialData.type === 'yellow_red' ? 'selected' : ''}>Gelb-Rote Karte</option>

          <option value="Rot" ${initialData.type === 'Rot' || initialData.type === 'red' ? 'selected' : ''}>Rote Karte</option>

        </select>

        <button type="button" class="btn btn-outline btn-remove-row" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.3) !important; padding: 6px; font-weight: 700; border-radius: 4px;">✕</button>

      `;



      row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());

      cardsContainer.appendChild(row);

    };



    // Populate existing cards

    if (existingCards.length > 0) {

      existingCards.forEach(c => renderCardRow(c));

    } else if (existingEvents.length > 0) {

      existingEvents.filter(e => e.type === 'card' || e.type === 'yellow' || e.type === 'red' || e.type === 'yellowRed').forEach(c => {

        let cardType = 'Gelb';

        if (c.cardType) cardType = c.cardType;

        else if (c.type === 'red') cardType = 'Rot';

        else if (c.type === 'yellowRed') cardType = 'Gelb-Rot';

        renderCardRow({ team: c.team, player: c.player, type: cardType });

      });

    }



    addCardBtn?.addEventListener('click', () => {

      renderCardRow({ team: match.home, player: '', type: 'Gelb' });

    });



    // Form submit

    const reportForm = document.getElementById('referee-report-form');

    reportForm?.addEventListener('submit', (e) => {

      e.preventDefault();



      const submitBtn = document.getElementById('btn-submit-report');

      submitBtn.disabled = true;

      submitBtn.textContent = 'Wird gespeichert...';



      const hScore = parseInt(document.getElementById('rep-home-score').value, 10) || 0;

      const aScore = parseInt(document.getElementById('rep-away-score').value, 10) || 0;

      const hHt = document.getElementById('rep-ht-home').value.trim();

      const aHt = document.getElementById('rep-ht-away').value.trim();

      const refNotes = document.getElementById('rep-referee-notes').value.trim();



      // Collect scorers

      const scorers = [];

      const events = [];

      document.querySelectorAll('#scorers-container .scorer-row').forEach(row => {

        const team = row.querySelector('.scorer-team').value;

        const player = row.querySelector('.scorer-name').value.trim();

        const goals = parseInt(row.querySelector('.scorer-count').value, 10) || 1;

        if (player) {

          scorers.push({ team, player, goals });

          for (let i = 0; i < goals; i++) {

            events.push({ type: 'goal', team, player });

          }

        }

      });



      // Collect cards

      const cards = [];

      document.querySelectorAll('#cards-container .card-row').forEach(row => {

        const team = row.querySelector('.card-team').value;

        const player = row.querySelector('.card-player').value.trim();

        const type = row.querySelector('.card-type').value;

        if (player) {

          cards.push({ team, player, type });

          events.push({ type: 'card', team, player, cardType: type });

        }

      });



      const updatedMatch = {

        ...match,

        score: `${hScore}:${aScore}`,

        ht: (hHt !== '' && aHt !== '') ? `${hHt}:${aHt}` : (match.ht || ''),

        status: 'Gespielt',

        scorers,

        cards,

        events,

        refereeNotes: refNotes,

        lastUpdated: Date.now()

      };



      try {

        Store.saveMatch(selectedSeason, updatedMatch);

        alert('Spielbericht erfolgreich gespeichert und Tabelle aktualisiert!');

        populateMatchDropdown();

      } catch (err) {

        console.error("Save match error:", err);

        alert('Fehler beim Speichern des Spielberichts.');

        submitBtn.disabled = false;

        submitBtn.textContent = 'Spielbericht offiziell speichern';

      }

    });

  };



  populateMatchDropdown();

};

