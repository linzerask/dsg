import { Store } from '../store.js?v=1793040000000';
import { logout } from '../auth.js?v=1793040000000';
import { calculateSeasonSuspensions, normalizePlayerName, normalizeKey } from '../suspensionUtils.js?v=1793040000000';

let selectedSeason = '2026/2027';
let selectedMatchId = null;
let currentRefereeTab = 'passkontrolle'; // 'passkontrolle' | 'spielbericht'

export const viewRefereeAdmin = (auth) => {
  return `
    <div class="view-admin" style="min-height: calc(100vh - 120px); padding-bottom: 60px;">
      <!-- Referee Header -->
      <div style="background: linear-gradient(135deg, rgba(10, 30, 20, 0.95), rgba(5, 18, 12, 0.98)); border-bottom: 1px solid rgba(0, 240, 95, 0.25); padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg); box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 240, 95, 0.15); border: 2px solid var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              ⚖️
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); font-weight: 700;">
                DSG Liga &bull; Offizieller Schiedsrichter-Bereich
              </div>
              <h2 style="margin: 2px 0 0 0; font-size: 1.35rem; color: #fff;">
                Matchday & Digitaler Spielbericht
              </h2>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button id="referee-logout-btn" class="btn-dsg" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 8px 14px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: 6px;">
              🚪 Abmelden
            </button>
          </div>
        </div>
      </div>

      <div style="max-width: 1200px; margin: 0 auto; padding: 0 var(--space-md);">
        <!-- Match Selector Card -->
        <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-lg); border-radius: 8px; border: 1px solid rgba(0, 240, 95, 0.2);">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-md);">
            <div style="flex: 1; min-width: 280px;">
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
        <div style="display: flex; gap: 8px; margin-bottom: var(--space-lg); border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;">
          <button id="tab-btn-passkontrolle" class="btn-dsg ${currentRefereeTab === 'passkontrolle' ? 'active' : ''}" style="background: ${currentRefereeTab === 'passkontrolle' ? 'var(--color-accent)' : 'var(--color-surface)'}; color: ${currentRefereeTab === 'passkontrolle' ? '#fff' : 'var(--color-text-primary)'}; font-weight: 700; padding: 10px 18px; border-radius: 6px;">
            📋 Passkontrolle vor dem Spiel
          </button>
          <button id="tab-btn-spielbericht" class="btn-dsg ${currentRefereeTab === 'spielbericht' ? 'active' : ''}" style="background: ${currentRefereeTab === 'spielbericht' ? 'var(--color-accent)' : 'var(--color-surface)'}; color: ${currentRefereeTab === 'spielbericht' ? '#fff' : 'var(--color-text-primary)'}; font-weight: 700; padding: 10px 18px; border-radius: 6px;">
            📝 Digitaler Spielbericht
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

  const matchSelect = document.getElementById('referee-match-select');
  const matchMeta = document.getElementById('referee-match-meta');
  const contentContainer = document.getElementById('referee-content-container');
  const tabPasskontrolle = document.getElementById('tab-btn-passkontrolle');
  const tabSpielbericht = document.getElementById('tab-btn-spielbericht');

  // Load matches
  const ligaData = Store.getData();
  const currentSeason = ligaData.currentSeason || '2026/2027';
  selectedSeason = currentSeason;
  const matches = (ligaData.seasons && ligaData.seasons[currentSeason]?.matches) || [];
  const players = await Store.getAdminPlayers();

  // Populate match dropdown: sorted descending by round
  if (matchSelect) {
    matchSelect.innerHTML = '<option value="">-- Bitte Spiel wählen --</option>' + 
      matches.map(m => {
        const roundStr = m.round ? `Runde ${m.round}` : '';
        const dateStr = m.date || '';
        const scoreStr = (m.score && m.score !== '-:-' && m.score !== ':') ? `[${m.score}]` : '(Bevorstehend)';
        return `<option value="${m.id}">${roundStr ? roundStr + ': ' : ''}${m.home} vs ${m.away} ${scoreStr} - ${dateStr}</option>`;
      }).join('');

    // Pre-select first match if available
    if (matches.length > 0 && !selectedMatchId) {
      selectedMatchId = matches[matches.length - 1].id;
      matchSelect.value = selectedMatchId;
    } else if (selectedMatchId) {
      matchSelect.value = selectedMatchId;
    }
  }

  const getActiveMatch = () => {
    return matches.find(m => String(m.id) === String(selectedMatchId));
  };

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

  const renderActiveTab = () => {
    if (!contentContainer) return;
    const match = getActiveMatch();

    if (!match) {
      contentContainer.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 50px 20px; color: var(--color-text-secondary); border-radius: 8px;">
          <h3>Kein Spiel ausgewählt</h3>
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
    tabPasskontrolle.classList.add('active');
    tabPasskontrolle.style.background = 'var(--color-accent)';
    tabPasskontrolle.style.color = '#fff';
    tabSpielbericht?.classList.remove('active');
    if (tabSpielbericht) {
      tabSpielbericht.style.background = 'var(--color-surface)';
      tabSpielbericht.style.color = 'var(--color-text-primary)';
    }
    renderActiveTab();
  });

  tabSpielbericht?.addEventListener('click', () => {
    currentRefereeTab = 'spielbericht';
    tabSpielbericht.classList.add('active');
    tabSpielbericht.style.background = 'var(--color-accent)';
    tabSpielbericht.style.color = '#fff';
    tabPasskontrolle?.classList.remove('active');
    if (tabPasskontrolle) {
      tabPasskontrolle.style.background = 'var(--color-surface)';
      tabPasskontrolle.style.color = 'var(--color-text-primary)';
    }
    renderActiveTab();
  });

  matchSelect?.addEventListener('change', (e) => {
    selectedMatchId = e.target.value;
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
        <div class="glass-card" style="padding: var(--space-md); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-accent); padding-bottom: 8px; margin-bottom: var(--space-md);">
            <h3 style="margin: 0; font-size: 1.15rem; color: #fff;">${teamTitle}</h3>
            <span style="font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; font-weight: 700;">${teamPlayers.length} gemeldet</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; padding-right: 4px;">
            ${teamPlayers.length === 0 ? `
              <div style="font-size: 0.85rem; color: var(--color-text-secondary); text-align: center; padding: 20px;">Keine Spieler für dieses Team registriert.</div>
            ` : teamPlayers.map(p => {
              const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
              const pKey = normalizePlayerName(pName) + '___' + normalizeKey(teamTitle);
              const suspInfo = playerMap.get(pKey);
              const isSuspended = suspInfo && suspInfo.status === 'suspended';

              const isVerified = p.verified || p.passType === 'digital' || !!p.passPhoto || !!p.photo;
              const photoSrc = p.passPhoto || p.photo || '';

              return `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; background: ${isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isSuspended ? '#ef4444' : 'rgba(255,255,255,0.08)'}; border-radius: 6px; padding: 8px 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--glass-border); flex-shrink: 0;">
                      ${photoSrc ? `<img src="${photoSrc}" alt="${pName}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${photoSrc}', '_blank')">` : `<span style="font-size: 0.75rem; opacity: 0.6;">👤</span>`}
                    </div>
                    <div>
                      <div style="font-weight: 700; font-size: 0.9rem; color: ${isSuspended ? '#ef4444' : '#fff'};">
                        ${pName}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
                        ${p.Geburtsdatum ? `Geb.: ${p.Geburtsdatum}` : ''} ${p.Position ? `&bull; ${p.Position}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="text-align: right; flex-shrink: 0;">
                    ${isSuspended ? `
                      <span style="background: #ef4444; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; display: inline-block;">⛔ GESPERRT</span>
                    ` : isVerified ? `
                      <span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-block;">🟢 Digital Pass</span>
                    ` : `
                      <label style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #eab308; cursor: pointer;">
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
      <div style="margin-bottom: var(--space-md); padding: 12px 16px; background: rgba(0, 240, 95, 0.1); border: 1px solid rgba(0, 240, 95, 0.3); border-radius: 6px; font-size: 0.85rem; color: var(--color-text-primary);">
        <strong>💡 Schiedsrichter-Passkontrolle:</strong> Bitte vergleiche vor Spielbeginn die anwesenden Spieler mit dieser Liste. Spieler mit ⛔ <strong>GESPERRT</strong> dürfen keinesfalls eingesetzt werden. Spieler ohne digitales Foto müssen den physischen Spielerpass vorlegen.
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-md);">
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
      <form id="referee-report-form" class="glass-card" style="padding: var(--space-lg); border-radius: 8px; border: 1px solid rgba(0, 240, 95, 0.25);">
        <h3 style="margin-top: 0; margin-bottom: var(--space-md); border-bottom: 1px solid var(--glass-border); padding-bottom: 8px;">
          Digitaler Spielbericht &bull; ${match.home} vs ${match.away}
        </h3>

        <!-- Score Row -->
        <div style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: var(--space-md); margin-bottom: var(--space-lg);">
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
            <h4 style="margin: 0; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 6px;">
              ⚽ Torschützen
            </h4>
            <button type="button" id="btn-add-scorer-row" class="btn-dsg" style="background: rgba(0, 240, 95, 0.15); color: var(--color-accent); border: 1px solid var(--color-accent); font-size: 0.75rem; padding: 4px 10px;">
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
            <h4 style="margin: 0; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 6px;">
              🟨 🟥 Karten & Verwarnungen
            </h4>
            <button type="button" id="btn-add-card-row" class="btn-dsg" style="background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid #eab308; font-size: 0.75rem; padding: 4px 10px;">
              + Karte hinzufügen
            </button>
          </div>
          <div id="cards-container" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Dynamic card rows -->
          </div>
        </div>

        <!-- Schiedsrichter-Vorkommnisse (Incident Notes) -->
        <div style="margin-bottom: var(--space-lg);">
          <label style="display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 6px;">
            Vorkommnisse & Schiedsrichter-Bemerkungen (optional)
          </label>
          <textarea id="rep-referee-notes" class="admin-input" rows="3" placeholder="Besondere Vorfälle, Ausschlüsse, Verletzungen, Platzverhältnisse..." style="width: 100%; font-size: 0.85rem;">${match.refereeNotes || ''}</textarea>
        </div>

        <div style="border-top: 1px solid var(--glass-border); padding-top: var(--space-md); display: flex; justify-content: flex-end; gap: 12px;">
          <button type="submit" id="btn-submit-report" class="btn-dsg" style="background: var(--color-accent); color: #000; font-weight: 800; font-size: 1rem; padding: 12px 24px; border-radius: 6px;">
            💾 Spielbericht offiziell speichern
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
      row.style.background = 'rgba(255,255,255,0.03)';
      row.style.padding = '6px 10px';
      row.style.borderRadius = '6px';
      row.style.border = '1px solid rgba(255,255,255,0.06)';

      row.innerHTML = `
        <select class="admin-input scorer-team" style="font-size: 0.82rem; padding: 6px;">
          <option value="${match.home}" ${initialData.team === match.home ? 'selected' : ''}>${match.home}</option>
          <option value="${match.away}" ${initialData.team === match.away ? 'selected' : ''}>${match.away}</option>
        </select>
        <input type="text" class="admin-input scorer-name" placeholder="Spieler Name" value="${initialData.player || ''}" style="font-size: 0.85rem; padding: 6px;">
        <input type="number" class="admin-input scorer-count" placeholder="Tore" min="1" max="20" value="${initialData.goals || 1}" style="font-size: 0.85rem; padding: 6px; text-align: center;">
        <button type="button" class="btn-dsg btn-remove-row" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 6px; font-weight: 700; border-radius: 4px;">✕</button>
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
      row.style.gridTemplateColumns = '140px 1fr 120px 40px';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      row.style.background = 'rgba(255,255,255,0.03)';
      row.style.padding = '6px 10px';
      row.style.borderRadius = '6px';
      row.style.border = '1px solid rgba(255,255,255,0.06)';

      row.innerHTML = `
        <select class="admin-input card-team" style="font-size: 0.82rem; padding: 6px;">
          <option value="${match.home}" ${initialData.team === match.home ? 'selected' : ''}>${match.home}</option>
          <option value="${match.away}" ${initialData.team === match.away ? 'selected' : ''}>${match.away}</option>
        </select>
        <input type="text" class="admin-input card-player" placeholder="Spieler Name" value="${initialData.player || ''}" style="font-size: 0.85rem; padding: 6px;">
        <select class="admin-input card-type" style="font-size: 0.82rem; padding: 6px;">
          <option value="Gelb" ${initialData.type === 'Gelb' || initialData.type === 'yellow' ? 'selected' : ''}>🟨 Gelb</option>
          <option value="Gelb-Rot" ${initialData.type === 'Gelb-Rot' || initialData.type === 'yellow_red' ? 'selected' : ''}>🟨🟥 Gelb-Rot</option>
          <option value="Rot" ${initialData.type === 'Rot' || initialData.type === 'red' ? 'selected' : ''}>🟥 Rot</option>
        </select>
        <button type="button" class="btn-dsg btn-remove-row" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 6px; font-weight: 700; border-radius: 4px;">✕</button>
      `;

      row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
      cardsContainer.appendChild(row);
    };

    // Populate existing cards
    if (existingCards.length > 0) {
      existingCards.forEach(c => renderCardRow(c));
    } else if (existingEvents.length > 0) {
      existingEvents.filter(e => e.type === 'card' || e.type === 'yellow' || e.type === 'red' || e.type === 'yellow_red').forEach(c => {
        renderCardRow({ team: c.team, player: c.player, type: c.cardType || c.type });
      });
    }

    addCardBtn?.addEventListener('click', () => {
      renderCardRow({ team: match.home, player: '', type: 'Gelb' });
    });

    // Form submit handler
    const form = document.getElementById('referee-report-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-report');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gespeichert...';

      const hScore = document.getElementById('rep-home-score').value.trim();
      const aScore = document.getElementById('rep-away-score').value.trim();
      const hHt = document.getElementById('rep-ht-home').value.trim();
      const aHt = document.getElementById('rep-ht-away').value.trim();
      const refNotes = document.getElementById('rep-referee-notes').value.trim();

      // Collect scorers
      const scorers = [];
      const events = [];
      scorersContainer.querySelectorAll('.scorer-row').forEach(row => {
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
      cardsContainer.querySelectorAll('.card-row').forEach(row => {
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
        renderActiveTab();
      } catch (err) {
        console.error("Save match error:", err);
        alert('Fehler beim Speichern des Spielberichts.');
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Spielbericht offiziell speichern';
      }
    });
  };

  renderActiveTab();
};
