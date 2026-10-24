// Disciplinary & Suspension Engine for DSG Liga
// Rules: § 13 DSG Meisterschaftsbestimmungen
// - Yellow Cards: 3rd Yellow -> 1 Match Suspension; 5th Yellow -> 1 Match Suspension; 6th+ -> 1 Match Suspension each
// - Yellow-Red Cards: 1 Match Suspension
// - Red Cards: 1 Match Suspension default (or custom commission games)
// - Chronological resolution: suspension is served in the team's immediate next played match

import { Store, sanitizeMojibake } from './store.js';

export const normalizeKey = (str) => {
  if (!str) return '';
  return sanitizeMojibake(String(str))
    .toLowerCase()
    .replace(/fc|dsg|sv|u\.|union|\./g, '')
    .replace(/\s+/g, '')
    .trim();
};

export const normalizePlayerName = (name) => {
  if (!name) return '';
  return sanitizeMojibake(String(name))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseMatchTimestamp = (dateStr, timeStr) => {
  if (!dateStr) return 0;
  const parts = String(dateStr).trim().split('.');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    let hh = 12, mm = 0;
    if (timeStr && String(timeStr).includes(':')) {
      const tParts = String(timeStr).trim().split(':');
      hh = parseInt(tParts[0], 10) || 12;
      mm = parseInt(tParts[1], 10) || 0;
    }
    return new Date(y, m, d, hh, mm).getTime() || 0;
  }
  return 0;
};

export const isMatchFinished = (m) => {
  if (!m) return false;
  const status = (m.status || '').trim();
  if (status === 'Gespielt' || status === 'Played' || status === 'Beendet' || status.startsWith('Abgesagt')) {
    return true;
  }
  const sc = (m.score || '').trim();
  if (sc && sc !== '-:-' && sc !== '- : -' && !sc.toLowerCase().includes('verschoben')) {
    return true;
  }
  return false;
};

/**
 * Calculates complete suspension data for a given season.
 * @param {string} seasonKey - e.g. "2026/2027"
 * @returns {object} { activeSuspensions, pendingWarnings, servedSuspensions, playerMap }
 */
export const calculateSeasonSuspensions = (seasonKey, optionalData = null) => {
  const data = optionalData || (typeof Store !== 'undefined' && Store.getData ? Store.getData() : {});
  const currentKey = seasonKey || data.currentSeason || "2026/2027";
  const season = (data.seasons && data.seasons[currentKey]) ? data.seasons[currentKey] : null;

  if (!season) {
    return {
      activeSuspensions: [],
      pendingWarnings: [],
      servedSuspensions: [],
      playerMap: new Map(),
      teamMatchSchedules: new Map()
    };
  }

  const matches = (season.matches || []).slice();

  // 1. Sort all matches chronologically
  matches.sort((a, b) => {
    const tA = parseMatchTimestamp(a.date, a.time);
    const tB = parseMatchTimestamp(b.date, b.time);
    if (tA !== tB) return tA - tB;
    const rA = parseInt(String(a.round || '').replace(/\D/g, '')) || 0;
    const rB = parseInt(String(b.round || '').replace(/\D/g, '')) || 0;
    return rA - rB;
  });

  // 2. Build chronological schedule per team
  const teamMatches = new Map();
  matches.forEach(m => {
    const hNorm = normalizeKey(m.home);
    const aNorm = normalizeKey(m.away);
    if (hNorm) {
      if (!teamMatches.has(hNorm)) teamMatches.set(hNorm, []);
      teamMatches.get(hNorm).push(m);
    }
    if (aNorm) {
      if (!teamMatches.has(aNorm)) teamMatches.set(aNorm, []);
      teamMatches.get(aNorm).push(m);
    }
  });

  // 3. Track player disciplinary history
  // Key: playerNorm + '___' + teamNorm
  const playerDiscipline = new Map();

  const getPlayerEntry = (name, team) => {
    const cleanName = sanitizeMojibake((name || '').trim());
    const cleanTeam = sanitizeMojibake((team || '').trim());
    const pKey = normalizePlayerName(cleanName) + '___' + normalizeKey(cleanTeam);
    if (!playerDiscipline.has(pKey)) {
      playerDiscipline.set(pKey, {
        name: cleanName,
        team: cleanTeam,
        key: pKey,
        yellowCount: 0,
        yellowRedCount: 0,
        redCount: 0,
        suspensions: [] // list of { triggerMatch, reason, gamesRequired, gamesServed: [], activeMatch: null }
      });
    }
    return playerDiscipline.get(pKey);
  };

  // Process matches in order
  matches.forEach((m, matchIdx) => {
    if (!isMatchFinished(m)) return;

    const combinedEvents = (m.cards && Array.isArray(m.cards) && m.cards.length > 0)
      ? m.cards
      : ((m.events && Array.isArray(m.events)) ? m.events.filter(e => e.type && e.type !== 'goal') : []);

    // Group cards per player for this match (handling 2 yellows in same match -> Yellow-Red)
    const matchCards = new Map();
    combinedEvents.forEach(cd => {
      const name = sanitizeMojibake((cd.player || cd.name || '').trim());
      if (!name) return;
      const team = cd.team ? sanitizeMojibake(cd.team.trim()) : sanitizeMojibake(m.home || '');
      const pKey = normalizePlayerName(name) + '___' + normalizeKey(team);
      if (!matchCards.has(pKey)) {
        matchCards.set(pKey, { name, team, yellows: 0, yellowReds: 0, reds: 0 });
      }
      const entry = matchCards.get(pKey);
      const count = parseInt(cd.count) || 1;
      const t = String(cd.type || cd.card || '').toLowerCase().replace(/[^a-z]/g, '');
      if (t === 'yellow' || t === 'gelb') entry.yellows += count;
      else if (t === 'yellowred' || t === 'gelbrot') entry.yellowReds += count;
      else if (t === 'red' || t === 'rot') entry.reds += count;
    });

    matchCards.forEach(mc => {
      const pd = getPlayerEntry(mc.name, mc.team);

      // Handle Direct Red
      if (mc.reds > 0) {
        pd.redCount += mc.reds;
        pd.suspensions.push({
          type: 'red',
          reason: 'Rote Karte',
          gamesRequired: 1, // default 1 game, overridden if commission specifies
          triggerMatch: m,
          gamesServed: [],
          activeMatch: null
        });
      }

      // Handle Yellow-Red conversion (either explicit yellowRed or 2 yellows in same match)
      if (mc.yellowReds > 0 || mc.yellows >= 2) {
        pd.yellowRedCount += 1;
        pd.suspensions.push({
          type: 'yellowRed',
          reason: 'Gelb-Rote Karte',
          gamesRequired: 1,
          triggerMatch: m,
          gamesServed: [],
          activeMatch: null
        });
      } else if (mc.yellows === 1) {
        pd.yellowCount += 1;
        // Check yellow thresholds: 3rd, 5th, 6th, 7th...
        if (pd.yellowCount === 3) {
          pd.suspensions.push({
            type: 'yellow_3',
            reason: '3. Gelbe Karte',
            gamesRequired: 1,
            triggerMatch: m,
            gamesServed: [],
            activeMatch: null
          });
        } else if (pd.yellowCount === 5) {
          pd.suspensions.push({
            type: 'yellow_5',
            reason: '5. Gelbe Karte',
            gamesRequired: 1,
            triggerMatch: m,
            gamesServed: [],
            activeMatch: null
          });
        } else if (pd.yellowCount >= 6) {
          pd.suspensions.push({
            type: `yellow_${pd.yellowCount}`,
            reason: `${pd.yellowCount}. Gelbe Karte`,
            gamesRequired: 1,
            triggerMatch: m,
            gamesServed: [],
            activeMatch: null
          });
        }
      }
    });
  });

  // 4. Also integrate Admin Manual Bans from Admin Players Database (if applicable)
  let adminPlayers = [];
  try {
    if (typeof window !== 'undefined' && Store && Store.getAdminPlayersSync) {
      adminPlayers = Store.getAdminPlayersSync() || [];
    }
  } catch (e) {
    adminPlayers = [];
  }

  adminPlayers.forEach(ap => {
    const sperreSpiele = parseInt(ap.sperreSpiele || ap.SperreSpiele || 0);
    const sperreGrund = (ap.Sperre || ap.sperre || '').trim();
    if (sperreSpiele > 0 || (sperreGrund && !sperreGrund.toLowerCase().includes('keine'))) {
      const pName = `${ap.Vorname || ''} ${ap.Nachname || ''}`.trim();
      const pTeam = (ap.Team || '').trim();
      if (pName && pTeam) {
        const pd = getPlayerEntry(pName, pTeam);
        // Only add if not already covered
        const alreadyHasActiveManual = pd.suspensions.some(s => s.type === 'commission');
        if (!alreadyHasActiveManual) {
          pd.suspensions.push({
            type: 'commission',
            reason: sperreGrund || 'Urteil Disziplinarkommission',
            gamesRequired: sperreSpiele > 0 ? sperreSpiele : 1,
            triggerMatch: null, // manual ban
            gamesServed: [],
            activeMatch: null,
            isManual: true
          });
        }
      }
    }
  });

  // 5. Resolve suspensions against the team's chronological match schedule
  const activeSuspensions = [];
  const servedSuspensions = [];
  const pendingWarnings = [];
  const playerResultMap = new Map();

  playerDiscipline.forEach(pd => {
    const tNorm = normalizeKey(pd.team);
    const teamSchedule = teamMatches.get(tNorm) || [];

    pd.suspensions.forEach(susp => {
      let remainingGames = susp.gamesRequired;
      const gamesServed = [];

      // Find team's matches strictly after the trigger match
      let startIndex = 0;
      if (susp.triggerMatch) {
        const triggerTime = parseMatchTimestamp(susp.triggerMatch.date, susp.triggerMatch.time);
        startIndex = teamSchedule.findIndex(m => {
          const mTime = parseMatchTimestamp(m.date, m.time);
          return mTime > triggerTime;
        });
        if (startIndex === -1) startIndex = teamSchedule.length;
      }

      for (let i = startIndex; i < teamSchedule.length; i++) {
        if (remainingGames <= 0) break;
        const candidateMatch = teamSchedule[i];
        if (isMatchFinished(candidateMatch)) {
          gamesServed.push(candidateMatch);
          remainingGames--;
        } else {
          // This is the immediate upcoming match where the player is actively banned!
          susp.activeMatch = candidateMatch;
          break;
        }
      }

      susp.gamesServed = gamesServed;
      susp.remainingGames = remainingGames;

      if (remainingGames > 0 && susp.activeMatch) {
        const oppTeam = (normalizeKey(susp.activeMatch.home) === tNorm) ? susp.activeMatch.away : susp.activeMatch.home;
        activeSuspensions.push({
          player: pd.name,
          team: pd.team,
          reason: susp.reason,
          type: susp.type,
          gamesRequired: susp.gamesRequired,
          gamesRemaining: remainingGames,
          nextMatch: {
            round: susp.activeMatch.round || '',
            date: susp.activeMatch.date || '',
            time: susp.activeMatch.time || '',
            opponent: oppTeam,
            match: susp.activeMatch
          }
        });
      } else if (remainingGames <= 0 && gamesServed.length > 0) {
        servedSuspensions.push({
          player: pd.name,
          team: pd.team,
          reason: susp.reason,
          type: susp.type,
          gamesServed: gamesServed.map(m => m.round || m.date || '1 Spiel').join(', ')
        });
      }
    });

    // Check for "Sperre droht" (pending warning at 2 or 4 yellows)
    const hasActiveYellowSuspension = activeSuspensions.some(as => as.player === pd.name && as.team === pd.team);
    if (!hasActiveYellowSuspension) {
      if (pd.yellowCount === 2) {
        pendingWarnings.push({
          player: pd.name,
          team: pd.team,
          yellowCount: 2,
          threshold: 3,
          cardsLeft: 1
        });
      } else if (pd.yellowCount === 4) {
        pendingWarnings.push({
          player: pd.name,
          team: pd.team,
          yellowCount: 4,
          threshold: 5,
          cardsLeft: 1
        });
      }
    }

    // Build quick lookup entry for player
    const active = activeSuspensions.find(as => as.player === pd.name && as.team === pd.team);
    const warning = pendingWarnings.find(pw => pw.player === pd.name && pw.team === pd.team);
    const served = servedSuspensions.filter(ss => ss.player === pd.name && ss.team === pd.team);

    let status = 'eligible';
    let badgeHtml = '';
    let statusText = 'Spielberechtigt';

    if (active) {
      status = 'suspended';
      statusText = `Gesperrt (${active.gamesRemaining} Spiel${active.gamesRemaining > 1 ? 'e' : ''})`;
      badgeHtml = `<span class="sperre-badge sperre-active" title="${active.reason} - Fehlt in ${active.nextMatch.round}">${statusText}</span>`;
    } else if (warning) {
      status = 'warning';
      statusText = `Sperre droht (${warning.yellowCount}/${warning.threshold})`;
      badgeHtml = `<span class="sperre-badge sperre-warning" title="Noch 1 gelbe Karte bis zur Sperre">${statusText}</span>`;
    } else if (served.length > 0) {
      status = 'served';
      statusText = `${served.length}x Sperre verbüßt`;
      badgeHtml = `<span class="sperre-badge sperre-served" title="Sperre bereits verbüßt">${statusText}</span>`;
    }

    playerResultMap.set(pd.key, {
      player: pd.name,
      team: pd.team,
      status,
      statusText,
      badgeHtml,
      active,
      warning,
      served,
      yellowCount: pd.yellowCount,
      yellowRedCount: pd.yellowRedCount,
      redCount: pd.redCount
    });
  });

  return {
    activeSuspensions,
    pendingWarnings,
    servedSuspensions,
    playerMap: playerResultMap,
    teamMatchSchedules: teamMatches
  };
};

/**
 * Returns any actively suspended players for an upcoming match.
 */
export const getMatchSuspensions = (match, seasonKey, optionalData = null) => {
  if (!match || isMatchFinished(match)) return { homeSuspended: [], awaySuspended: [] };

  const { activeSuspensions } = calculateSeasonSuspensions(seasonKey, optionalData);
  const hNorm = normalizeKey(match.home);
  const aNorm = normalizeKey(match.away);

  const homeSuspended = activeSuspensions.filter(as => normalizeKey(as.team) === hNorm);
  const awaySuspended = activeSuspensions.filter(as => normalizeKey(as.team) === aNorm);

  return { homeSuspended, awaySuspended };
};

/**
 * Returns suspension info for a specific player name and team.
 */
export const getPlayerSuspensionInfo = (name, team, seasonKey, optionalData = null) => {
  const { playerMap } = calculateSeasonSuspensions(seasonKey, optionalData);
  const pKey = normalizePlayerName(name) + '___' + normalizeKey(team);
  if (playerMap.has(pKey)) return playerMap.get(pKey);

  // Fallback: search by player name only
  const pNorm = normalizePlayerName(name);
  for (const [key, val] of playerMap.entries()) {
    if (key.startsWith(pNorm + '___')) return val;
  }
  return {
    player: name,
    team: team || '',
    status: 'eligible',
    statusText: 'Spielberechtigt',
    badgeHtml: `<span class="sperre-badge sperre-eligible" title="Spielberechtigt">Spielberechtigt</span>`,
    active: null,
    warning: null,
    served: []
  };
};
