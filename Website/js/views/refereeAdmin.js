import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1793040000000';

import { logout } from '../auth.js?v=1793040000000';

import { calculateSeasonSuspensions, normalizePlayerName, normalizeKey, isMatchFinished } from '../suspensionUtils.js?v=1793040000000';
import { getPlayerAvatar } from '../playerUtils.js?v=1792924000000';



let selectedSeason = '2026/2027';

let selectedMatchId = null;

let currentRefereeTab = 'passkontrolle'; // 'passkontrolle' | 'spielbericht'
let passFilterModes = { home: 'roster', away: 'roster' };



export const viewRefereeAdmin = (auth) => {
  const data = Store.getData();
  const allSeasons = data.seasons || {};
  const allLeagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
  const currentSeasonKey = data.currentSeason || "2026/2027";

  let availableSeasons = allLeagues.map(l => ({
    seasonKey: l.seasonKey || l.id,
    label: l.name || l.title || l.seasonKey
  })).filter(s => !!allSeasons[s.seasonKey]);

  if (availableSeasons.length === 0) {
    availableSeasons = Object.keys(allSeasons).map(k => ({
      seasonKey: k,
      label: k.includes('DSG') ? k : `DSG Liga ${k}`
    }));
  }

  if (!selectedSeason || !allSeasons[selectedSeason]) {
    selectedSeason = currentSeasonKey;
  }

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
                ${availableSeasons.map(s => `
                  <option value="${s.seasonKey}" ${s.seasonKey === selectedSeason ? 'selected' : ''}>${s.label}</option>
                `).join('')}
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
  const currentSeasonKey = ligaData.currentSeason || '2026/2027';
  if (!selectedSeason || !ligaData.seasons || !ligaData.seasons[selectedSeason]) {
    selectedSeason = currentSeasonKey;
  }



  let players = (Store.getAdminPlayersSync ? Store.getAdminPlayersSync() : []) || [];
  if (!players || players.length === 0) {
    try {
      players = (await Store.getAdminPlayers()) || [];
    } catch(e) {
      console.warn('Error loading admin players:', e);
    }
  } else {
    Store.getAdminPlayers().then(p => {
      if (p && Array.isArray(p) && p.length > 0) {
        players = p;
        renderActiveTab();
      }
    });
  }



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

    const formatBirth = (dateStr) => {
      if (!dateStr) return '';
      const str = String(dateStr).trim();
      if (str.includes('.')) return str;
      if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return str;
    };

    const passStorageKey = `dsg_pass_verified_${selectedSeason}___${match.id}`;
    const getVerifiedPasses = () => {
      try {
        return JSON.parse(localStorage.getItem(passStorageKey) || '{}');
      } catch(e) {
        return {};
      }
    };
    const setVerifiedPass = (playerKey, isChecked) => {
      const map = getVerifiedPasses();
      if (isChecked) {
        map[playerKey] = true;
      } else {
        delete map[playerKey];
      }
      localStorage.setItem(passStorageKey, JSON.stringify(map));
    };
    const verifiedPasses = getVerifiedPasses();

    const { playerMap, activeSuspensions } = calculateSeasonSuspensions(selectedSeason);

    const getPlayerSuspensionData = (pName, teamTitle) => {
      const pNorm = normalizePlayerName(pName);
      const tNorm = normalizeKey(teamTitle);
      let susp = playerMap.get(pNorm + '___' + tNorm);

      if (!susp) {
        for (const [key, val] of playerMap.entries()) {
          if (key.startsWith(pNorm + '___')) {
            const entryTeam = key.split('___')[1] || '';
            if (entryTeam.includes(tNorm) || tNorm.includes(entryTeam) || !tNorm) {
              susp = val;
              break;
            }
          }
        }
      }
      if (!susp) {
        for (const [key, val] of playerMap.entries()) {
          if (key.startsWith(pNorm + '___')) {
            susp = val;
            break;
          }
        }
      }

      if (!susp) {
        return {
          isSuspended: false,
          isWarning: false,
          reason: '',
          yellowCount: 0,
          redCount: 0,
          yellowRedCount: 0,
          warningThreshold: 3
        };
      }

      const matchRound = (match.round || '').trim();
      const matchId = String(match.id || '');
      const isFinished = isMatchFinished(match);

      let isSuspended = false;
      let reason = '';

      if (susp.status === 'suspended' && susp.active) {
        const nextM = susp.active.nextMatch?.match;
        if (!isFinished || (nextM && String(nextM.id) === matchId)) {
          isSuspended = true;
          reason = susp.active.reason || 'Spielsperre';
        }
      } else if (susp.served && Array.isArray(susp.served) && susp.served.length > 0) {
        const servedInThisMatch = susp.served.some(s => 
          s.gamesServed && (s.gamesServed.includes(matchRound) || s.gamesServed.includes(match.date))
        );
        if (servedInThisMatch) {
          isSuspended = true;
          reason = susp.served[0]?.reason || 'Spielsperre (abgesessen)';
        }
      }

      if (!isSuspended && susp.yellowCount >= 3) {
        const hasUnservedYellow = susp.active && susp.active.type && susp.active.type.startsWith('yellow');
        if (hasUnservedYellow) {
          isSuspended = true;
          reason = `${susp.yellowCount}. Gelbe Karte`;
        }
      }

      const isWarning = !isSuspended && (susp.status === 'warning' || !!susp.warning || susp.yellowCount === 2 || susp.yellowCount === 4);
      const warningThreshold = susp.warning?.threshold || (susp.yellowCount >= 3 ? 5 : 3);

      return {
        isSuspended,
        isWarning,
        reason,
        statusText: susp.statusText || '',
        yellowCount: susp.yellowCount || 0,
        redCount: susp.redCount || 0,
        yellowRedCount: susp.yellowRedCount || 0,
        warningThreshold
      };
    };

    const homePlayers = filterPlayers(homeTeam);
    const awayPlayers = filterPlayers(awayTeam);

    const homeRoster = Store.getMatchdayRoster(selectedSeason, match.id, homeTeam);
    const awayRoster = Store.getMatchdayRoster(selectedSeason, match.id, awayTeam);

    const renderTeamPassList = (teamTitle, teamPlayers, side) => {
      const roster = side === 'home' ? homeRoster : awayRoster;
      const hasRoster = !!(roster && Array.isArray(roster.players) && roster.players.length > 0);
      const activeFilter = passFilterModes[side] || (hasRoster ? 'roster' : 'active');

      let displayPlayers = teamPlayers;
      if (hasRoster && activeFilter === 'roster') {
        displayPlayers = roster.players.map(rp => {
          const matchingRaw = teamPlayers.find(p => 
            String(p['#'] || p.id) === String(rp.id) ||
            normalizePlayerName(`${p.Vorname || ''} ${p.Nachname || ''}`) === normalizePlayerName(`${rp.firstName || ''} ${rp.lastName || ''}`)
          );
          return {
            ...(matchingRaw || {}),
            Vorname: rp.firstName || matchingRaw?.Vorname || '',
            Nachname: rp.lastName || matchingRaw?.Nachname || '',
            Position: rp.position || matchingRaw?.Position || 'Feldspieler',
            Geburtsdatum: matchingRaw?.Geburtsdatum || '',
            jerseyNumber: rp.jerseyNumber || '',
            passNumber: matchingRaw?.['#'] || matchingRaw?.id || rp.id || '-',
            photoUrl: rp.photo || matchingRaw?.photoUrl || matchingRaw?.passPhoto || '',
            passPhoto: rp.photo || matchingRaw?.passPhoto || '',
            photo: rp.photo || matchingRaw?.photo || '',
            fromRoster: true
          };
        });
      } else {
        const rawList = (!hasRoster && activeFilter !== 'all')
          ? teamPlayers.filter(p => (p.Status || p.status || 'Aktiv').toLowerCase() === 'aktiv')
          : teamPlayers;
        displayPlayers = rawList.map(p => {
          const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
          const inRoster = roster?.players?.find(rp => 
            String(rp.id) === String(p['#'] || p.id) ||
            normalizePlayerName(`${rp.firstName || ''} ${rp.lastName || ''}`) === normalizePlayerName(pName)
          );
          return {
            ...p,
            jerseyNumber: inRoster?.jerseyNumber || '',
            passNumber: p['#'] || p.id || '-',
            isNominated: !!inRoster
          };
        });
      }

      const verifiedCount = displayPlayers.filter(p => {
        const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
        const pKey = normalizePlayerName(pName) + '___' + normalizeKey(teamTitle);
        const suspData = getPlayerSuspensionData(pName, teamTitle);
        if (suspData.isSuspended) return false;
        const hasPhoto = !!(p.photoUrl || p.passPhoto || p.photo || p.foto || p.avatar || p.Foto || p.image);
        return hasPhoto || !!verifiedPasses[pKey];
      }).length;

      const eligibleCount = displayPlayers.filter(p => {
        const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
        const suspData = getPlayerSuspensionData(pName, teamTitle);
        return !suspData.isSuspended;
      }).length;

      const suspendedInList = displayPlayers.filter(p => {
        const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
        const suspData = getPlayerSuspensionData(pName, teamTitle);
        return suspData.isSuspended;
      });

      const warningInList = displayPlayers.filter(p => {
        const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
        const suspData = getPlayerSuspensionData(pName, teamTitle);
        return !suspData.isSuspended && suspData.isWarning;
      });

      return `
        <div class="glass-card" style="padding: var(--space-md); border-radius: 8px; border: 1px solid var(--glass-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-accent); padding-bottom: 8px; margin-bottom: var(--space-sm); flex-wrap: wrap; gap: 6px;">
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; color: var(--color-text-primary);">${teamTitle}</h3>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">
                ${verifiedCount} von ${eligibleCount} spielberechtigten Spielern verifiziert
                ${suspendedInList.length > 0 ? ` &bull; <span style="color: #dc2626; font-weight: 800;">${suspendedInList.length} Gesperrt</span>` : ''}
                ${warningInList.length > 0 ? ` &bull; <span style="color: #d97706; font-weight: 700;">${warningInList.length} Vorverwarnt</span>` : ''}
                ${verifiedCount === eligibleCount && eligibleCount > 0 ? ' <span style="color: #16a34a; font-weight: 800;">(Vollständig überprüft)</span>' : ''}
              </div>
            </div>
            ${hasRoster ? `
              <span style="font-size: 0.75rem; background: rgba(0, 240, 95, 0.15); color: #16a34a; border: 1px solid rgba(0, 240, 95, 0.35); padding: 3px 8px; border-radius: 4px; font-weight: 800;">
                Spieltagskader übermittelt (${roster.players.length})
              </span>
            ` : `
              <span style="font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--glass-border); padding: 3px 8px; border-radius: 4px; font-weight: 700; color: var(--color-text-secondary);">
                ${teamPlayers.length} gemeldet (Kein Spieltagskader)
              </span>
            `}
          </div>

          ${suspendedInList.length > 0 ? `
            <div style="background: rgba(220, 38, 38, 0.12); border: 1px solid #ef4444; color: #dc2626; padding: 10px 14px; border-radius: 6px; font-weight: 700; font-size: 0.82rem; margin-bottom: var(--space-sm); display: flex; align-items: center; gap: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div><strong>ACHTUNG:</strong> ${suspendedInList.length} Spieler in dieser Liste ist <strong>GESPERRT</strong> (${suspendedInList.map(p => `${p.Vorname || ''} ${p.Nachname || ''}`.trim()).join(', ')}) und darf <strong>nicht eingesetzt werden</strong>!</div>
            </div>
          ` : ''}

          ${hasRoster ? `
            <div style="display: flex; gap: 6px; margin-bottom: var(--space-md);">
              <button type="button" class="btn btn-pass-filter ${activeFilter === 'roster' ? 'btn-dsg' : 'btn-outline'}" data-side="${side}" data-mode="roster" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 700;">
                Nur Spieltagskader (${roster.players.length})
              </button>
              <button type="button" class="btn btn-pass-filter ${activeFilter === 'all' ? 'btn-dsg' : 'btn-outline'}" data-side="${side}" data-mode="all" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 700;">
                Alle gemeldeten (${teamPlayers.length})
              </button>
            </div>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: var(--space-md); flex-wrap: wrap;">
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-pass-filter ${activeFilter !== 'all' ? 'btn-dsg' : 'btn-outline'}" data-side="${side}" data-mode="active" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 700;">
                  Nur Aktive (${teamPlayers.filter(p => (p.Status || 'Aktiv').toLowerCase() === 'aktiv').length})
                </button>
                <button type="button" class="btn btn-pass-filter ${activeFilter === 'all' ? 'btn-dsg' : 'btn-outline'}" data-side="${side}" data-mode="all" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 700;">
                  Alle gemeldeten (${teamPlayers.length})
                </button>
              </div>
              <span style="font-size: 0.72rem; color: #d97706; font-weight: 700;">Kein Spieltagskader</span>
            </div>
          `}

          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; padding-right: 4px;">
            ${displayPlayers.length === 0 ? `
              <div style="font-size: 0.85rem; color: var(--color-text-secondary); text-align: center; padding: 20px;">Keine Spieler für dieses Team vorhanden.</div>
            ` : displayPlayers.map(p => {
              const pName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
              const pKey = normalizePlayerName(pName) + '___' + normalizeKey(teamTitle);
              const suspData = getPlayerSuspensionData(pName, teamTitle);
              const isSuspended = suspData.isSuspended;
              const isWarning = suspData.isWarning;

              const hasCustomPhoto = !!(p.photoUrl || p.passPhoto || p.photo || p.foto || p.avatar || p.Foto || p.image);
              const avatarSrc = getPlayerAvatar(p);
              const isPassChecked = !!verifiedPasses[pKey];
              const formattedBirth = formatBirth(p.Geburtsdatum);
              const passNum = p.passNumber || p['#'] || p.id || '-';

              return `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: ${isSuspended ? 'rgba(220, 38, 38, 0.08)' : isWarning ? 'rgba(234, 179, 8, 0.04)' : isPassChecked ? 'rgba(0, 240, 95, 0.04)' : 'var(--color-surface)'}; border: 1px solid ${isSuspended ? '#ef4444' : isWarning ? 'rgba(234, 179, 8, 0.45)' : isPassChecked ? 'rgba(0, 240, 95, 0.45)' : 'var(--glass-border)'}; border-radius: 6px; padding: 8px 10px; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                    ${p.jerseyNumber ? `
                      <span style="background: ${isSuspended ? '#ef4444' : 'var(--color-accent)'}; color: ${isSuspended ? '#fff' : '#000'}; font-weight: 800; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; flex-shrink: 0; min-width: 32px; text-align: center;">#${p.jerseyNumber}</span>
                    ` : `
                      <span style="background: var(--color-surface); border: 1px solid var(--glass-border); color: var(--color-text-secondary); font-weight: 700; padding: 4px 6px; border-radius: 4px; font-size: 0.75rem; flex-shrink: 0; min-width: 32px; text-align: center;">--</span>
                    `}
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid ${isSuspended ? '#ef4444' : hasCustomPhoto ? 'var(--color-accent)' : 'var(--glass-border)'}; flex-shrink: 0;">
                      <img src="${avatarSrc}" alt="${pName}" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center; cursor: pointer;" title="Klicken für Vollbild" onclick="window.open('${avatarSrc}', '_blank')">
                    </div>
                    <div style="min-width: 0; flex: 1;">
                      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span style="font-weight: 700; font-size: 0.92rem; color: ${isSuspended ? '#dc2626' : 'var(--color-text-primary)'}; line-height: 1.25; word-break: break-word;">
                          ${pName}
                        </span>
                        ${isSuspended ? `
                          <span style="background: #dc2626; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.5px; text-transform: uppercase;">GESPERRT</span>
                        ` : isWarning ? `
                          <span style="background: rgba(234, 179, 8, 0.18); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.45); font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 3px;" title="Bei einer weiteren Gelben Karte im nächsten Spiel gesperrt">Sperre droht (${suspData.yellowCount}/${suspData.warningThreshold} Gelbe)</span>
                        ` : ''}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 3px; display: flex; flex-direction: column; gap: 2px;">
                        <div>${formattedBirth ? `Geb.: ${formattedBirth}` : 'Kein Geburtsdatum'}</div>
                        <div style="color: ${isSuspended ? '#dc2626' : 'var(--color-accent)'}; font-weight: 600;">${p.Position || p.position || 'Feldspieler'}</div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                          <span>Pass-Nr.: <span style="font-weight: 700; color: var(--color-text-primary);">${passNum}</span></span>
                          ${(suspData.yellowCount > 0 || suspData.redCount > 0 || suspData.yellowRedCount > 0) ? `
                            <span style="display: inline-flex; align-items: center; gap: 4px;">
                              ${suspData.yellowCount > 0 ? `<span style="background: #eab308; color: #000; font-weight: 800; font-size: 0.68rem; padding: 1px 5px; border-radius: 3px;" title="${suspData.yellowCount} Gelbe Karte(n) in dieser Saison">${suspData.yellowCount} Gelb</span>` : ''}
                              ${suspData.yellowRedCount > 0 ? `<span style="background: #f97316; color: #fff; font-weight: 800; font-size: 0.68rem; padding: 1px 5px; border-radius: 3px;" title="${suspData.yellowRedCount} Gelb-Rote Karte(n)">${suspData.yellowRedCount} Gelb-Rot</span>` : ''}
                              ${suspData.redCount > 0 ? `<span style="background: #dc2626; color: #fff; font-weight: 800; font-size: 0.68rem; padding: 1px 5px; border-radius: 3px;" title="${suspData.redCount} Rote Karte(n)">${suspData.redCount} Rot</span>` : ''}
                            </span>
                          ` : ''}
                        </div>
                        ${isSuspended ? `
                          <div style="color: #dc2626; font-weight: 700; font-size: 0.74rem; margin-top: 2px;">
                            Grund: ${suspData.reason || 'Spielsperre'} &bull; Nicht einsatzberechtigt!
                          </div>
                        ` : isWarning ? `
                          <div style="color: #d97706; font-weight: 600; font-size: 0.72rem; margin-top: 1px;">
                            Vorverwarnung: Noch 1 Gelbe Karte bis zur automatischen Sperre
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="text-align: right; flex-shrink: 0;">
                    ${isSuspended ? `
                      <span style="background: rgba(220, 38, 38, 0.15); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.35); font-size: 0.72rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                        Keine Freigabe
                      </span>
                    ` : hasCustomPhoto ? `
                      <span style="color: #16a34a; font-size: 0.72rem; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; background: rgba(22, 163, 74, 0.1); border: 1px solid rgba(22, 163, 74, 0.25); padding: 3px 8px; border-radius: 4px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Digital verifiziert
                      </span>
                    ` : `
                      <label style="display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: ${isPassChecked ? '#16a34a' : '#d97706'}; cursor: pointer; font-weight: 700; background: ${isPassChecked ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.1)'}; border: 1px solid ${isPassChecked ? 'rgba(22, 163, 74, 0.35)' : 'rgba(217, 119, 6, 0.3)'}; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;">
                        <input type="checkbox" class="physical-pass-check" data-player="${pKey}" ${isPassChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--color-accent);">
                        <span>${isPassChecked ? 'Pass vorgelegt' : 'Pass ok?'}</span>
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
        <div><strong>Schiedsrichter-Passkontrolle:</strong> Bitte vergleiche vor Spielbeginn die anwesenden Spieler mit dieser Liste. Spieler mit <strong>[GESPERRT]</strong> dürfen keinesfalls eingesetzt werden. Bei Teams mit übermitteltem <strong>Spieltagskader</strong> wird standardmäßig nur die gemeldete Aufstellung angezeigt.</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-md);">
        ${renderTeamPassList(homeTeam, homePlayers, 'home')}
        ${renderTeamPassList(awayTeam, awayPlayers, 'away')}
      </div>
    `;

    contentContainer.querySelectorAll('.btn-pass-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const side = btn.getAttribute('data-side');
        const mode = btn.getAttribute('data-mode');
        passFilterModes[side] = mode;
        renderPasskontrolle(match, allPlayers);
      });
    });

    contentContainer.querySelectorAll('.physical-pass-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const pKey = cb.getAttribute('data-player');
        const checked = cb.checked;
        setVerifiedPass(pKey, checked);
        renderPasskontrolle(match, allPlayers);
      });
    });
  };
  const refPlayerComboboxState = {
    'ref-report-card-player-home': { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 },
    'ref-report-card-player-away': { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 },
    'ref-report-scorer-player-home': { players: [], includeOwnGoal: true, filtered: [], highlightedIndex: -1 },
    'ref-report-scorer-player-away': { players: [], includeOwnGoal: true, filtered: [], highlightedIndex: -1 }
  };

  let refReportScorersHome = [];
  let refReportScorersAway = [];
  let refReportCardsHome = [];
  let refReportCardsAway = [];

  const populateRefPlayerCombobox = (id, players, includeOwnGoal = false) => {
    if (!refPlayerComboboxState[id]) {
      refPlayerComboboxState[id] = { players: [], includeOwnGoal: false, filtered: [], highlightedIndex: -1 };
    }
    refPlayerComboboxState[id].players = players || [];
    refPlayerComboboxState[id].includeOwnGoal = includeOwnGoal;
    refPlayerComboboxState[id].highlightedIndex = -1;

    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = '';
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) searchInput.value = '';

    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');

    renderRefComboboxDropdown(id, '');
  };

  const renderRefComboboxDropdown = (id, filterText = '') => {
    const state = refPlayerComboboxState[id];
    if (!state) return;

    const dropdown = document.getElementById('dropdown-' + id);
    if (!dropdown) return;

    const cleanFilter = (filterText || '').toLowerCase().trim();
    let allOptions = [];
    if (state.includeOwnGoal) {
      allOptions.push({ name: 'Eigentor', label: 'Eigentor', isOwnGoal: true });
    }
    allOptions = allOptions.concat(state.players);

    let filtered = allOptions;
    if (cleanFilter) {
      filtered = allOptions.filter(opt => {
        const val = typeof opt === 'object' ? opt.name : opt;
        const lab = typeof opt === 'object' ? opt.label : opt;
        return val.toLowerCase().includes(cleanFilter) || lab.toLowerCase().includes(cleanFilter);
      });
    }
    state.filtered = filtered;
    state.highlightedIndex = -1;

    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="player-option-empty">Keine passenden Spieler gefunden</div>';
      return;
    }

    dropdown.innerHTML = filtered.map((item, idx) => {
      const optVal = typeof item === 'object' ? item.name : item;
      const optLabel = typeof item === 'object' ? item.label : item;
      const isRoster = typeof item === 'object' && item.isRoster;
      const jerseyNum = typeof item === 'object' ? item.jerseyNumber : '';
      const isSelected = document.getElementById(id)?.value === optVal;
      const isOwnGoal = optVal === 'Eigentor';

      let labelHtml = optLabel;
      if (cleanFilter && !isOwnGoal) {
        const startIdx = optLabel.toLowerCase().indexOf(cleanFilter);
        if (startIdx !== -1) {
          const before = optLabel.slice(0, startIdx);
          const match = optLabel.slice(startIdx, startIdx + cleanFilter.length);
          const after = optLabel.slice(startIdx + cleanFilter.length);
          labelHtml = `${before}<span class="option-highlight">${match}</span>${after}`;
        }
      }

      let contentHtml = labelHtml;
      if (isOwnGoal) {
        contentHtml = `<span style="display: inline-flex; align-items: center; gap: 5px; color: #ef4444; font-weight: 700;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          ${labelHtml}
        </span>`;
      } else if (isRoster && jerseyNum) {
        contentHtml = `<span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="background: var(--color-accent); color: #000; font-weight: 800; font-size: 0.72rem; padding: 2px 5px; border-radius: 3px;">#${jerseyNum}</span>
          <span>${labelHtml.replace(/^#[0-9?]+\s*/, '')}</span>
        </span>`;
      }

      return `
        <div class="player-option-item ${isSelected ? 'selected' : ''} ${isOwnGoal ? 'player-option-special' : ''}" data-idx="${idx}" data-val="${optVal}">
          <span>${contentHtml}</span>
          ${isSelected ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
        </div>
      `;
    }).join('');

    dropdown.querySelectorAll('.player-option-item').forEach(el => {
      const handleSelect = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = el.getAttribute('data-val');
        selectRefComboboxOption(id, val);
      };
      el.onmousedown = handleSelect;
      el.onclick = handleSelect;
    });
  };

  const updateRefActiveComboboxClasses = (activePicker) => {
    document.querySelectorAll('#referee-report-form .is-active-card').forEach(el => el.classList.remove('is-active-card'));
    document.querySelectorAll('#referee-report-form .is-active-section').forEach(el => el.classList.remove('is-active-section'));
    if (activePicker) {
      const card = activePicker.closest('.report-team-card') || activePicker.closest('.glass-card');
      if (card) card.classList.add('is-active-card');
      const sec = activePicker.closest('.report-section');
      if (sec) sec.classList.add('is-active-section');
    }
  };

  const selectRefComboboxOption = (id, value) => {
    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = value;
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) searchInput.value = value;
    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');
    updateRefActiveComboboxClasses(null);
    renderRefComboboxDropdown(id, value);
  };

  const resetRefPlayerCombobox = (id, autoFocus = false) => {
    const hiddenInput = document.getElementById(id);
    if (hiddenInput) hiddenInput.value = '';
    const searchInput = document.getElementById('input-search-' + id);
    if (searchInput) {
      searchInput.value = '';
      if (autoFocus) {
        setTimeout(() => searchInput.focus(), 60);
      }
    }
    const dropdown = document.getElementById('dropdown-' + id);
    if (dropdown) dropdown.style.display = 'none';
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.classList.remove('is-open');
    updateRefActiveComboboxClasses(null);
    renderRefComboboxDropdown(id, '');
  };

  const getRefComboboxValue = (id) => {
    const hiddenInput = document.getElementById(id);
    const searchInput = document.getElementById('input-search-' + id);
    return (hiddenInput?.value || searchInput?.value || '').trim();
  };

  const setupRefSearchableComboboxes = () => {
    const ids = [
      'ref-report-card-player-home',
      'ref-report-card-player-away',
      'ref-report-scorer-player-home',
      'ref-report-scorer-player-away'
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
        renderRefComboboxDropdown(id, searchInput.value);
        dropdown.style.display = 'block';
        picker.classList.add('is-open');
        updateRefActiveComboboxClasses(picker);
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
        renderRefComboboxDropdown(id, searchInput.value);
      };

      searchInput.onkeydown = (e) => {
        const state = refPlayerComboboxState[id];
        if (!state || !state.filtered || state.filtered.length === 0) return;

        const items = dropdown.querySelectorAll('.player-option-item');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          dropdown.style.display = 'block';
          picker.classList.add('is-open');
          state.highlightedIndex = (state.highlightedIndex + 1) % items.length;
          items.forEach((it, idx) => {
            it.classList.toggle('highlighted', idx === state.highlightedIndex);
            if (idx === state.highlightedIndex) it.scrollIntoView({ block: 'nearest' });
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          dropdown.style.display = 'block';
          picker.classList.add('is-open');
          state.highlightedIndex = (state.highlightedIndex - 1 + items.length) % items.length;
          items.forEach((it, idx) => {
            it.classList.toggle('highlighted', idx === state.highlightedIndex);
            if (idx === state.highlightedIndex) it.scrollIntoView({ block: 'nearest' });
          });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (state.highlightedIndex >= 0 && state.highlightedIndex < state.filtered.length) {
            const item = state.filtered[state.highlightedIndex];
            selectRefComboboxOption(id, typeof item === 'object' ? item.name : item);
          } else if (state.filtered.length === 1) {
            const item = state.filtered[0];
            selectRefComboboxOption(id, typeof item === 'object' ? item.name : item);
          } else if (searchInput.value.trim()) {
            selectRefComboboxOption(id, searchInput.value.trim());
          }
        } else if (e.key === 'Escape') {
          dropdown.style.display = 'none';
          picker.classList.remove('is-open');
        }
      };
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.searchable-player-picker')) {
        ids.forEach(id => {
          const dropdown = document.getElementById('dropdown-' + id);
          if (dropdown) dropdown.style.display = 'none';
          const picker = document.getElementById('picker-' + id);
          if (picker) picker.classList.remove('is-open');
        });
        updateRefActiveComboboxClasses(null);
      }
    });
  };

  const renderRefReportLists = () => {
    // Render Home Scorers
    const homeGoalsDiv = document.getElementById('ref-report-goals-list-home');
    if (homeGoalsDiv) {
      homeGoalsDiv.innerHTML = refReportScorersHome.map((item, i) => {
        const pName = typeof item === 'string' ? item : (item.player || item.name || '');
        const pMin = typeof item === 'object' ? (item.minute || item.min || '') : '';
        const isOwnGoal = pName.toLowerCase().includes('eigentor');
        const ballColor = isOwnGoal ? '#ef4444' : 'var(--color-accent)';
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isOwnGoal ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0,0,0,0.03)'}; padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; ${isOwnGoal ? 'border-left: 2px solid #ef4444;' : ''}">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${ballColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${ballColor};"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              ${pMin ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${pMin}'</span>` : ''}
              <strong style="${isOwnGoal ? 'color: #ef4444;' : ''}">${pName}</strong>
            </span>
            <button type="button" class="btn-del-ref-goal-h" data-idx="${i}" title="Tor entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
          </div>
        `;
      }).join('');

      homeGoalsDiv.querySelectorAll('.btn-del-ref-goal-h').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          refReportScorersHome.splice(idx, 1);
          renderRefReportLists();
        };
      });
    }

    // Render Away Scorers
    const awayGoalsDiv = document.getElementById('ref-report-goals-list-away');
    if (awayGoalsDiv) {
      awayGoalsDiv.innerHTML = refReportScorersAway.map((item, i) => {
        const pName = typeof item === 'string' ? item : (item.player || item.name || '');
        const pMin = typeof item === 'object' ? (item.minute || item.min || '') : '';
        const isOwnGoal = pName.toLowerCase().includes('eigentor');
        const ballColor = isOwnGoal ? '#ef4444' : 'var(--color-accent)';
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isOwnGoal ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0,0,0,0.03)'}; padding: 5px 8px; border-radius: 4px; font-size: 0.85rem; ${isOwnGoal ? 'border-left: 2px solid #ef4444;' : ''}">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${ballColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${ballColor};"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              ${pMin ? `<span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">${pMin}'</span>` : ''}
              <strong style="${isOwnGoal ? 'color: #ef4444;' : ''}">${pName}</strong>
            </span>
            <button type="button" class="btn-del-ref-goal-a" data-idx="${i}" title="Tor entfernen" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
          </div>
        `;
      }).join('');

      awayGoalsDiv.querySelectorAll('.btn-del-ref-goal-a').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          refReportScorersAway.splice(idx, 1);
          renderRefReportLists();
        };
      });
    }

    const cardBadge = (type) => {
      if (type === 'yellow' || type === 'Gelb') return '<span style="background: #f1c40f; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Gelb</span>';
      if (type === 'yellowRed' || type === 'yellow-red' || type === 'gelbrot' || type === 'Gelb-Rot') return '<span style="background: #e67e22; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Gelb-Rot</span>';
      if (type === 'red' || type === 'Rot') return '<span style="background: #e74c3c; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 0.7rem;">Rot</span>';
      return '';
    };

    // Render Home Cards
    const homeCardsDiv = document.getElementById('ref-report-cards-list-home');
    if (homeCardsDiv) {
      homeCardsDiv.innerHTML = refReportCardsHome.map((c, i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${cardBadge(c.type)}
            ${c.minute ? `<span style="background: rgba(0,0,0,0.07); color: var(--color-text-secondary); font-weight: 700; padding: 1px 5px; border-radius: 3px; font-size: 0.75rem;">${c.minute}'</span>` : ''}
            <strong>${c.player}</strong>
            ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
          </div>
          <button type="button" class="btn-del-ref-card-h" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
        </div>
      `).join('');

      homeCardsDiv.querySelectorAll('.btn-del-ref-card-h').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          refReportCardsHome.splice(idx, 1);
          renderRefReportLists();
        };
      });
    }

    // Render Away Cards
    const awayCardsDiv = document.getElementById('ref-report-cards-list-away');
    if (awayCardsDiv) {
      awayCardsDiv.innerHTML = refReportCardsAway.map((c, i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${cardBadge(c.type)}
            ${c.minute ? `<span style="background: rgba(0,0,0,0.07); color: var(--color-text-secondary); font-weight: 700; padding: 1px 5px; border-radius: 3px; font-size: 0.75rem;">${c.minute}'</span>` : ''}
            <strong>${c.player}</strong>
            ${c.reason ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${c.reason})</span>` : ''}
          </div>
          <button type="button" class="btn-del-ref-card-a" data-idx="${i}" style="background: #dc3545; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">✕</button>
        </div>
      `).join('');

      awayCardsDiv.querySelectorAll('.btn-del-ref-card-a').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          refReportCardsAway.splice(idx, 1);
          renderRefReportLists();
        };
      });
    }
  };

  const renderSpielbericht = (match, allPlayers) => {
    // Parse current scores
    let scoreHome = '';
    let scoreAway = '';
    if (match.score && match.score.includes(':') && match.score !== '-:-' && match.score !== ':') {
      const cleanScore = match.score.replace(/\s*\([^)]*\)/g, '').replace(/[^\d:]/g, '').trim();
      if (cleanScore.includes(':')) {
        const parts = cleanScore.split(':');
        scoreHome = parts[0]?.trim() || '';
        scoreAway = parts[1]?.trim() || '';
      }
    }

    let htHome = '';
    let htAway = '';
    if (match.ht && match.ht.includes(':') && match.ht !== ':') {
      const cleanHt = match.ht.replace(/[()]/g, '').replace(/[^\d:]/g, '').trim();
      if (cleanHt.includes(':')) {
        const parts = cleanHt.split(':');
        htHome = parts[0]?.trim() || '';
        htAway = parts[1]?.trim() || '';
      }
    } else if (match.score && match.score.includes('(')) {
      const mHt = match.score.match(/\(([^)]+)\)/);
      if (mHt && mHt[1].includes(':')) {
        const cleanHt = mHt[1].replace(/[^\d:]/g, '').trim();
        const parts = cleanHt.split(':');
        htHome = parts[0]?.trim() || '';
        htAway = parts[1]?.trim() || '';
      }
    }

    // Populate Scorers & Cards from existing match data
    const rawScorers = (match.scorers && match.scorers.length > 0)
      ? match.scorers
      : (match.events || []).filter(e => e.type === 'goal');

    refReportScorersHome = [];
    refReportScorersAway = [];
    rawScorers.forEach(s => {
      const sName = sanitizeMojibake(typeof s === 'string' ? s : (s.name || s.player || ''));
      const sMinute = sanitizeMojibake(typeof s === 'object' ? (s.minute || s.min || '') : '');
      const sTeam = sanitizeMojibake(typeof s === 'object' ? (s.team || '') : '');
      const count = typeof s === 'object' ? (s.count || s.goals || 1) : 1;
      const isHome = sTeam === match.home || (match.home && sTeam && (sTeam.toLowerCase().includes(match.home.toLowerCase()) || match.home.toLowerCase().includes(sTeam.toLowerCase())));
      for (let i = 0; i < count; i++) {
        if (isHome) {
          refReportScorersHome.push({ player: sName, minute: sMinute });
        } else {
          refReportScorersAway.push({ player: sName, minute: sMinute });
        }
      }
    });

    const rawCards = (match.cards && match.cards.length > 0)
      ? match.cards
      : (match.events || []).filter(e => e.type === 'yellow' || e.type === 'yellowRed' || e.type === 'yellow-red' || e.type === 'gelbrot' || e.type === 'red' || e.type === 'card');

    refReportCardsHome = [];
    refReportCardsAway = [];
    rawCards.forEach(c => {
      const cTeam = sanitizeMojibake(c.team || '');
      let cType = c.type || c.cardType || 'yellow';
      if (cType === 'Gelb') cType = 'yellow';
      else if (cType === 'Gelb-Rot') cType = 'yellowRed';
      else if (cType === 'Rot') cType = 'red';

      const cObj = { 
        player: sanitizeMojibake(c.name || c.player || ''), 
        type: cType, 
        reason: sanitizeMojibake(c.reason || ''),
        minute: sanitizeMojibake(c.minute || c.min || '')
      };
      const isHome = cTeam === match.home || (match.home && cTeam && (cTeam.toLowerCase().includes(match.home.toLowerCase()) || match.home.toLowerCase().includes(cTeam.toLowerCase())));
      const count = c.count || 1;
      for (let i = 0; i < count; i++) {
        if (isHome) {
          refReportCardsHome.push({ ...cObj });
        } else {
          refReportCardsAway.push({ ...cObj });
        }
      }
    });

    const homeRoster = Store.getMatchdayRoster(selectedSeason, match.id, match.home);
    const awayRoster = Store.getMatchdayRoster(selectedSeason, match.id, match.away);

    const getTeamPlayerOptions = (teamName, roster) => {
      const norm = (teamName || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
      const tPlayers = allPlayers.filter(p => {
        const pTeam = (p.Team || p.Mannschaft || p.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
        return pTeam.includes(norm) || norm.includes(pTeam);
      });

      const options = [];
      const addedNames = new Set();

      if (roster && Array.isArray(roster.players)) {
        roster.players.forEach(rp => {
          const full = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
          if (full && !addedNames.has(full.toLowerCase())) {
            addedNames.add(full.toLowerCase());
            options.push({
              name: full,
              label: `#${rp.jerseyNumber || '?'} ${full} (${rp.position || 'Kader'})`,
              jerseyNumber: rp.jerseyNumber || '',
              isRoster: true
            });
          }
        });
      }

      tPlayers.forEach(p => {
        const full = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
        if (full && !addedNames.has(full.toLowerCase())) {
          addedNames.add(full.toLowerCase());
          const num = p['#'] && p['#'] !== '-' ? '#' + p['#'] + ' ' : '';
          options.push({
            name: full,
            label: `${num}${full}`,
            jerseyNumber: p['#'] || '',
            isRoster: false
          });
        }
      });

      return options;
    };

    const homeOptions = getTeamPlayerOptions(match.home, homeRoster);
    const awayOptions = getTeamPlayerOptions(match.away, awayRoster);

    contentContainer.innerHTML = `
      <form id="referee-report-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- Match Header Information Card (Admin Style) -->
        <div class="glass-card" style="padding: var(--space-md); background: rgba(0,150,64,0.08); border-left: 4px solid var(--color-accent);">
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary);" id="ref-report-match-title">${match.home} gegen ${match.away}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;" id="ref-report-match-meta">${match.round || 'Runde'} | ${match.date || ''} ${match.time ? match.time + ' Uhr' : ''} | ${match.venue || match.location || 'DSG-Platz'}</div>
        </div>

        <!-- Score & Halftime Section (Admin Style) -->
        <div style="background: var(--color-surface); padding: var(--space-md); border-radius: 6px; border: 1px solid var(--color-border);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">Tore ${match.home}</label>
              <input type="number" id="ref-report-ft-home" min="0" max="99" class="admin-input" placeholder="0" value="${scoreHome}" style="width: 100%; font-size: 1.1rem; font-weight: 700;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">Tore ${match.away}</label>
              <input type="number" id="ref-report-ft-away" min="0" max="99" class="admin-input" placeholder="0" value="${scoreAway}" style="width: 100%; font-size: 1.1rem; font-weight: 700;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-sm);">
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Tore ${match.home} Halbzeit</label>
              <input type="number" id="ref-report-ht-home" min="0" max="99" class="admin-input" placeholder="0" value="${htHome}" style="width: 100%;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Tore ${match.away} Halbzeit</label>
              <input type="number" id="ref-report-ht-away" min="0" max="99" class="admin-input" placeholder="0" value="${htAway}" style="width: 100%;">
            </div>
          </div>
        </div>

        <!-- Übersicht Tore (Admin 2-Column Split) -->
        <div class="report-section">
          <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px; color: var(--color-text-primary);">Übersicht Tore</h4>
          <div class="report-two-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            <!-- Home Goals -->
            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
              <h5 style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen ${match.home}</h5>
              <div style="display: flex; gap: 6px; align-items: stretch;">
                <div class="searchable-player-picker" id="picker-ref-report-scorer-player-home" style="flex: 1; position: relative;">
                  <input type="hidden" id="ref-report-scorer-player-home" value="">
                  <div class="searchable-player-input-wrap">
                    <input type="text" id="input-search-ref-report-scorer-player-home" class="admin-input searchable-player-search" placeholder="Torschütze suchen / wählen..." autocomplete="off" style="height: 34px;">
                    <span class="combobox-indicator-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                  <div class="searchable-player-dropdown" id="dropdown-ref-report-scorer-player-home" style="display: none;"></div>
                </div>
                <input type="text" id="ref-report-goal-min-home" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 24)" style="width: 58px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                <input type="number" id="ref-report-goal-count-home" min="1" max="20" value="1" class="admin-input" title="Anzahl Tore" placeholder="1" style="width: 44px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                <button type="button" id="btn-add-ref-goal-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; height: 34px; white-space: nowrap;">+ Hinzufügen</button>
              </div>
              <div id="ref-report-goals-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
            </div>

            <!-- Away Goals -->
            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
              <h5 style="margin: 0 0 8px 0; color: var(--color-text-primary);">Torschützen ${match.away}</h5>
              <div style="display: flex; gap: 6px; align-items: stretch;">
                <div class="searchable-player-picker" id="picker-ref-report-scorer-player-away" style="flex: 1; position: relative;">
                  <input type="hidden" id="ref-report-scorer-player-away" value="">
                  <div class="searchable-player-input-wrap">
                    <input type="text" id="input-search-ref-report-scorer-player-away" class="admin-input searchable-player-search" placeholder="Torschütze suchen / wählen..." autocomplete="off" style="height: 34px;">
                    <span class="combobox-indicator-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                  <div class="searchable-player-dropdown" id="dropdown-ref-report-scorer-player-away" style="display: none;"></div>
                </div>
                <input type="text" id="ref-report-goal-min-away" class="admin-input" placeholder="Min." title="Spielminute (optional, z.B. 24)" style="width: 58px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                <input type="number" id="ref-report-goal-count-away" min="1" max="20" value="1" class="admin-input" title="Anzahl Tore" placeholder="1" style="width: 44px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
                <button type="button" id="btn-add-ref-goal-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700; height: 34px; white-space: nowrap;">+ Hinzufügen</button>
              </div>
              <div id="ref-report-goals-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
            </div>
          </div>
        </div>

        <!-- Übersicht Karten (Admin 2-Column Split) -->
        <div class="report-section">
          <h4 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 4px; color: var(--color-text-primary);">Übersicht Karten</h4>
          <div class="report-two-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            <!-- Home Cards -->
            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
              <h5 style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten ${match.home}</h5>
              <div style="display: flex; gap: 6px; margin-bottom: 6px; align-items: stretch;">
                <select id="ref-report-card-type-home" class="admin-input" style="width: 95px; font-size: 0.8rem; height: 34px;">
                  <option value="yellow">Gelb</option>
                  <option value="yellowRed">Gelb-Rot</option>
                  <option value="red">Rot</option>
                </select>
                <div class="searchable-player-picker" id="picker-ref-report-card-player-home" style="flex: 1; position: relative;">
                  <input type="hidden" id="ref-report-card-player-home" value="">
                  <div class="searchable-player-input-wrap">
                    <input type="text" id="input-search-ref-report-card-player-home" class="admin-input searchable-player-search" placeholder="Spieler suchen / wählen..." autocomplete="off" style="height: 34px;">
                    <span class="combobox-indicator-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                  <div class="searchable-player-dropdown" id="dropdown-ref-report-card-player-home" style="display: none;"></div>
                </div>
                <input type="text" id="ref-report-card-min-home" class="admin-input" placeholder="Min." title="Spielminute (optional)" style="width: 52px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
              </div>
              <div style="display: flex; gap: 6px;">
                <input type="text" id="ref-report-card-reason-home" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                <button type="button" id="btn-add-ref-card-home" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
              </div>
              <div id="ref-report-cards-list-home" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
            </div>

            <!-- Away Cards -->
            <div class="glass-card report-team-card" style="padding: var(--space-sm);">
              <h5 style="margin: 0 0 8px 0; color: var(--color-text-primary);">Karten ${match.away}</h5>
              <div style="display: flex; gap: 6px; margin-bottom: 6px; align-items: stretch;">
                <select id="ref-report-card-type-away" class="admin-input" style="width: 95px; font-size: 0.8rem; height: 34px;">
                  <option value="yellow">Gelb</option>
                  <option value="yellowRed">Gelb-Rot</option>
                  <option value="red">Rot</option>
                </select>
                <div class="searchable-player-picker" id="picker-ref-report-card-player-away" style="flex: 1; position: relative;">
                  <input type="hidden" id="ref-report-card-player-away" value="">
                  <div class="searchable-player-input-wrap">
                    <input type="text" id="input-search-ref-report-card-player-away" class="admin-input searchable-player-search" placeholder="Spieler suchen / wählen..." autocomplete="off" style="height: 34px;">
                    <span class="combobox-indicator-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                  </div>
                  <div class="searchable-player-dropdown" id="dropdown-ref-report-card-player-away" style="display: none;"></div>
                </div>
                <input type="text" id="ref-report-card-min-away" class="admin-input" placeholder="Min." title="Spielminute (optional)" style="width: 52px; text-align: center; height: 34px; font-weight: 700; padding: 2px;">
              </div>
              <div style="display: flex; gap: 6px;">
                <input type="text" id="ref-report-card-reason-away" class="admin-input" placeholder="Begründung (optional)..." style="flex: 1; font-size: 0.8rem;">
                <button type="button" id="btn-add-ref-card-away" class="btn-dsg" style="padding: 4px 10px; font-size: 0.8rem; background: var(--color-accent); color: #fff; font-weight: 700;">+ Hinzufügen</button>
              </div>
              <div id="ref-report-cards-list-away" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
            </div>
          </div>
        </div>

        <!-- Schiedsrichter-Vorkommnisse (Incident Notes) -->
        <div style="background: var(--color-surface); padding: var(--space-md); border-radius: 6px; border: 1px solid var(--color-border);">
          <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--color-text-primary);">
            Vorkommnisse & Schiedsrichter-Bemerkungen (optional)
          </label>
          <textarea id="ref-report-notes" class="admin-input" rows="3" placeholder="Besondere Vorfälle, Ausschlüsse, Verletzungen, Platzverhältnisse..." style="width: 100%; font-size: 0.85rem;">${match.refereeNotes || match.note || ''}</textarea>
        </div>

        <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-md); display: flex; justify-content: flex-end; gap: 12px;">
          <button type="submit" id="btn-save-ref-report" class="btn-dsg" style="font-weight: 700; font-size: 1rem; padding: 10px 24px; border-radius: 6px; background: var(--color-accent); color: #fff; cursor: pointer;">
            Spielbericht offiziell speichern
          </button>
        </div>

      </form>
    `;

    // Populate Player Comboboxes for both teams
    populateRefPlayerCombobox('ref-report-card-player-home', homeOptions, false);
    populateRefPlayerCombobox('ref-report-card-player-away', awayOptions, false);
    populateRefPlayerCombobox('ref-report-scorer-player-home', homeOptions, true);
    populateRefPlayerCombobox('ref-report-scorer-player-away', awayOptions, true);

    // Setup searchable player combobox interactions
    setupRefSearchableComboboxes();

    // Render initial goals & cards
    renderRefReportLists();

    // Goal buttons
    const addGoalH = document.getElementById('btn-add-ref-goal-home');
    const countInputH = document.getElementById('ref-report-goal-count-home');
    const minGoalHInput = document.getElementById('ref-report-goal-min-home');
    if (addGoalH) {
      addGoalH.onclick = () => {
        const val = getRefComboboxValue('ref-report-scorer-player-home');
        const count = Math.max(1, parseInt(countInputH?.value, 10) || 1);
        const minVal = minGoalHInput ? minGoalHInput.value.replace(/['"]/g, '').trim() : '';
        if (val) {
          for (let i = 0; i < count; i++) {
            refReportScorersHome.push({ player: val, minute: minVal });
          }
          renderRefReportLists();
          resetRefPlayerCombobox('ref-report-scorer-player-home', true);
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

    const addGoalA = document.getElementById('btn-add-ref-goal-away');
    const countInputA = document.getElementById('ref-report-goal-count-away');
    const minGoalAInput = document.getElementById('ref-report-goal-min-away');
    if (addGoalA) {
      addGoalA.onclick = () => {
        const val = getRefComboboxValue('ref-report-scorer-player-away');
        const count = Math.max(1, parseInt(countInputA?.value, 10) || 1);
        const minVal = minGoalAInput ? minGoalAInput.value.replace(/['"]/g, '').trim() : '';
        if (val) {
          for (let i = 0; i < count; i++) {
            refReportScorersAway.push({ player: val, minute: minVal });
          }
          renderRefReportLists();
          resetRefPlayerCombobox('ref-report-scorer-player-away', true);
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

    // Card buttons
    const addCardH = document.getElementById('btn-add-ref-card-home');
    const cardTypeH = document.getElementById('ref-report-card-type-home');
    const minCardH = document.getElementById('ref-report-card-min-home');
    const reasonCardH = document.getElementById('ref-report-card-reason-home');
    if (addCardH) {
      addCardH.onclick = () => {
        const val = getRefComboboxValue('ref-report-card-player-home');
        const minVal = minCardH ? minCardH.value.replace(/['"]/g, '').trim() : '';
        const reasonVal = reasonCardH ? reasonCardH.value.trim() : '';
        const typeVal = cardTypeH ? cardTypeH.value : 'yellow';
        if (val) {
          refReportCardsHome.push({ player: val, type: typeVal, minute: minVal, reason: reasonVal });
          renderRefReportLists();
          resetRefPlayerCombobox('ref-report-card-player-home', true);
          if (minCardH) minCardH.value = '';
          if (reasonCardH) reasonCardH.value = '';
        }
      };
    }
    if (reasonCardH) {
      reasonCardH.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (addCardH) addCardH.click();
        }
      };
    }

    const addCardA = document.getElementById('btn-add-ref-card-away');
    const cardTypeA = document.getElementById('ref-report-card-type-away');
    const minCardA = document.getElementById('ref-report-card-min-away');
    const reasonCardA = document.getElementById('ref-report-card-reason-away');
    if (addCardA) {
      addCardA.onclick = () => {
        const val = getRefComboboxValue('ref-report-card-player-away');
        const minVal = minCardA ? minCardA.value.replace(/['"]/g, '').trim() : '';
        const reasonVal = reasonCardA ? reasonCardA.value.trim() : '';
        const typeVal = cardTypeA ? cardTypeA.value : 'yellow';
        if (val) {
          refReportCardsAway.push({ player: val, type: typeVal, minute: minVal, reason: reasonVal });
          renderRefReportLists();
          resetRefPlayerCombobox('ref-report-card-player-away', true);
          if (minCardA) minCardA.value = '';
          if (reasonCardA) reasonCardA.value = '';
        }
      };
    }
    if (reasonCardA) {
      reasonCardA.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (addCardA) addCardA.click();
        }
      };
    }

    // Form submit
    const reportForm = document.getElementById('referee-report-form');
    reportForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('btn-save-ref-report');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gespeichert...';

      const ftHome = document.getElementById('ref-report-ft-home').value.trim();
      const ftAway = document.getElementById('ref-report-ft-away').value.trim();
      const htHome = document.getElementById('ref-report-ht-home').value.trim();
      const htAway = document.getElementById('ref-report-ht-away').value.trim();
      const refNotes = document.getElementById('ref-report-notes').value.trim();

      let score = match.score || '-:-';
      let ht = match.ht || '';
      let status = match.status || 'Gespielt';

      if (ftHome !== '' && ftAway !== '') {
        score = `${ftHome}:${ftAway}`;
        status = 'Played';
        if (htHome !== '' && htAway !== '') {
          ht = `${htHome}:${htAway}`;
        }
      }

      // Build unified scorers array with minutes
      const scorers = [];
      refReportScorersHome.forEach(s => {
        const cleanName = sanitizeMojibake(s.player || s.name || s);
        const cleanMinute = sanitizeMojibake(s.minute || s.min || '');
        scorers.push({ name: cleanName, player: cleanName, team: match.home, type: 'goal', count: 1, minute: cleanMinute });
      });
      refReportScorersAway.forEach(s => {
        const cleanName = sanitizeMojibake(s.player || s.name || s);
        const cleanMinute = sanitizeMojibake(s.minute || s.min || '');
        scorers.push({ name: cleanName, player: cleanName, team: match.away, type: 'goal', count: 1, minute: cleanMinute });
      });

      // Build unified cards array with minutes
      const cards = [];
      refReportCardsHome.forEach(c => {
        const cleanPlayer = sanitizeMojibake(c.player || c.name || '');
        const cleanReason = sanitizeMojibake(c.reason || '');
        const cleanMinute = sanitizeMojibake(c.minute || c.min || '');
        cards.push({ name: cleanPlayer, player: cleanPlayer, team: match.home, type: c.type, reason: cleanReason, minute: cleanMinute });
      });
      refReportCardsAway.forEach(c => {
        const cleanPlayer = sanitizeMojibake(c.player || c.name || '');
        const cleanReason = sanitizeMojibake(c.reason || '');
        const cleanMinute = sanitizeMojibake(c.minute || c.min || '');
        cards.push({ name: cleanPlayer, player: cleanPlayer, team: match.away, type: c.type, reason: cleanReason, minute: cleanMinute });
      });

      // Build events timeline
      const events = [];
      scorers.forEach(s => events.push({ type: 'goal', player: s.name, name: s.name, team: s.team, minute: s.minute || '' }));
      cards.forEach(c => events.push({ type: c.type, player: c.name, name: c.name, team: c.team, reason: c.reason || '', minute: c.minute || '' }));

      const updatedMatch = {
        ...match,
        score: score,
        ht: ht,
        htScore: ht,
        halfTime: ht,
        status: status,
        scorers: scorers,
        cards: cards,
        events: events,
        refereeNotes: refNotes,
        note: refNotes,
        lastUpdated: Date.now()
      };

      try {
        Store.saveMatch(selectedSeason, deepSanitize(updatedMatch));
        Store.recalculateSeason(selectedSeason);
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


  window.addEventListener('matchday-roster-updated', () => {
    if (selectedMatchId) {
      renderActiveTab();
    }
  });

  populateMatchDropdown();

};

