// Player Utilities & Automated Statistics Aggregator
import { Store, sanitizeMojibake } from './store.js?v=1791182000000';
import { calculateSeasonSuspensions } from './suspensionUtils.js?v=1793040000000';

export function normalizePlayerKey(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/ä|ae|ã¤/g, 'ae')
    .replace(/ö|oe|ã¶/g, 'oe')
    .replace(/ü|ue|ã¼/g, 'ue')
    .replace(/ß|ss|ãŸ/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function getPlayerHash(str) {
  let hash = 0;
  const s = String(str || '').toLowerCase().trim();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlayerAvatar(player) {
  if (!player) return 'Spieler/1.jpg';
  
  // Custom photo if uploaded
  const custom = player.photoUrl || player.foto || player.avatar || player.Foto || player.image;
  if (custom && custom.trim() !== '') {
    return custom.trim();
  }

  // Deterministic standard avatar from 1.jpg to 20.jpg
  const idStr = String(player['#'] || player.id || player.ID || (player.Vorname + '_' + player.Nachname) || '1');
  const avatarIndex = (getPlayerHash(idStr) % 20) + 1;
  return `Spieler/${avatarIndex}.jpg`;
}

export function calculatePlayerAge(birthDateStr) {
  if (!birthDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr.trim())) return null;
  const birth = new Date(birthDateStr.trim());
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 && age < 100 ? age : null;
}

export function formatMemberSince(sinceStr) {
  if (!sinceStr || sinceStr === '0000-00-00') return '';
  const parts = sinceStr.split('-');
  if (parts.length > 0 && parts[0] && parts[0] !== '0000') {
    const year = parts[0];
    const currYear = new Date().getFullYear();
    const diff = currYear - parseInt(year);
    if (diff > 0) {
      return `Seit ${year} (${diff} Jahre)`;
    }
    return `Seit ${year}`;
  }
  return `Seit ${sinceStr}`;
}

export function getPlayerPositionCategory(position) {
  if (!position) return '';
  const p = position.toLowerCase();
  if (p.includes('torwart') || p.includes('tw') || p.includes('keeper')) return 'Torwart';
  if (p.includes('innenverteidiger') || p.includes('verteidiger') || p.includes('abwehr') || p.includes('schienen') || p.includes('libero') || p.includes('iv') || p.includes('lv') || p.includes('rv') || p.includes('lwb') || p.includes('rwb')) return 'Abwehr';
  if (p.includes('mittelfeld') || p.includes('sechser') || p.includes('achter') || p.includes('zehner') || p.includes('flügel') || p.includes('dm') || p.includes('zm') || p.includes('om') || p.includes('lm') || p.includes('rm')) return 'Mittelfeld';
  if (p.includes('stürmer') || p.includes('sturm') || p.includes('spitze') || p.includes('angriff') || p.includes('linksaußen') || p.includes('rechtsaußen') || p.includes('ms') || p.includes('la') || p.includes('ra') || p.includes('hs') || p.includes('cf')) return 'Sturm';
  return 'Mittelfeld';
}

export function getPlayerPositionLabel(player) {
  if (!player) return '';
  const pos = sanitizeMojibake((player.Position || player.position || '').trim());
  const side = sanitizeMojibake((player.positionSide || player.side || player.PositionSide || '').trim());
  
  if (!pos && !side) return '';
  if (!pos) return side;
  if (!side) return pos;
  if (pos === 'Torwart' || pos.includes('Torwart')) return pos;
  if (pos.toLowerCase().includes('links') && side.toLowerCase() === 'links') return pos;
  if (pos.toLowerCase().includes('rechts') && side.toLowerCase() === 'rechts') return pos;
  if (pos.toLowerCase().includes('zentral') && side.toLowerCase() === 'zentral') return pos;
  return `${pos} (${side})`;
}

// Compute live goals and cards for all players across all match reports in Store
let cachedPlayerStats = null;
let lastStatsComputeTime = 0;

export function computeAllPlayerStats() {
  const now = Date.now();
  if (cachedPlayerStats && (now - lastStatsComputeTime < 2000)) {
    return cachedPlayerStats;
  }

  const data = Store.getData();
  const seasons = data.seasons || {};
  const statsMap = {}; // key: normalizedName -> { goals, yellow, red, yellowRed, teams: Set() }

  const registerEvent = (rawName, type, count = 1, team = '') => {
    const name = sanitizeMojibake((rawName || '').trim());
    if (!name) return;
    const key = normalizePlayerKey(name);
    if (!key) return;

    if (!statsMap[key]) {
      statsMap[key] = {
        name,
        goals: 0,
        yellow: 0,
        red: 0,
        yellowRed: 0,
        teams: new Set()
      };
    }

    if (team) statsMap[key].teams.add(sanitizeMojibake(team.trim()));

    if (type === 'goal') {
      statsMap[key].goals += count;
    } else if (type === 'yellow') {
      statsMap[key].yellow += count;
    } else if (type === 'red') {
      statsMap[key].red += count;
    } else if (type === 'yellowRed' || type === 'yellow-red') {
      statsMap[key].yellowRed += count;
      // Do not add to yellow or red: first yellow is cancelled/subsumed!
    }
  };

  Object.keys(seasons).forEach(seasonKey => {
    const s = seasons[seasonKey];
    if (!s) return;

    // 1. Matches events
    (s.matches || []).forEach(m => {
      if (m.events && Array.isArray(m.events)) {
        m.events.forEach(ev => {
          if (ev.type === 'goal') {
            const pName = sanitizeMojibake((ev.player || ev.name || '').trim());
            if (pName && !pName.toLowerCase().includes('eigentor') && !pName.toLowerCase().includes('own goal')) {
              registerEvent(pName, 'goal', parseInt(ev.count) || 1, ev.team);
            }
          }
        });
      } else if (m.scorers && Array.isArray(m.scorers)) {
        m.scorers.forEach(sc => {
          const pName = sanitizeMojibake((sc.name || sc.player || '').trim());
          if (pName && !pName.toLowerCase().includes('eigentor') && !pName.toLowerCase().includes('own goal')) {
            registerEvent(pName, 'goal', parseInt(sc.count) || parseInt(sc.goals) || 1, sc.team);
          }
        });
      }

      // Disciplinary cards resolved per match (first yellow cancelled on yellow-red)
      const cardList = (m.cards && Array.isArray(m.cards) && m.cards.length > 0)
        ? m.cards
        : ((m.events && Array.isArray(m.events)) ? m.events.filter(e => e.type && e.type !== 'goal') : []);

      const matchCardsPerPlayer = new Map();
      cardList.forEach(cd => {
        const cleanName = sanitizeMojibake((cd.player || cd.name || '').trim());
        if (!cleanName) return;
        const team = cd.team ? sanitizeMojibake(cd.team.trim()) : '';
        const pKey = normalizePlayerKey(cleanName);
        if (!pKey) return;
        if (!matchCardsPerPlayer.has(pKey)) {
          matchCardsPerPlayer.set(pKey, { name: cleanName, team, yellows: 0, yellowReds: 0, reds: 0 });
        }
        const entry = matchCardsPerPlayer.get(pKey);
        const count = parseInt(cd.count) || 1;
        const t = String(cd.type || cd.card || '').toLowerCase().replace(/[^a-z]/g, '');
        if (t === 'yellow' || t === 'gelb') entry.yellows += count;
        else if (t === 'yellowred' || t === 'gelbrot') entry.yellowReds += count;
        else if (t === 'red' || t === 'rot') entry.reds += count;
        else {
          if (cd.yellow) entry.yellows += parseInt(cd.yellow) || 0;
          if (cd.yellowRed || cd.gelbrot || cd['yellow-red'] || cd.yellow_red) entry.yellowReds += parseInt(cd.yellowRed || cd.gelbrot || cd['yellow-red'] || cd.yellow_red) || 0;
          if (cd.red) entry.reds += parseInt(cd.red) || 0;
        }
      });

      matchCardsPerPlayer.forEach(mc => {
        if (mc.yellowReds > 0 || mc.yellows >= 2) {
          registerEvent(mc.name, 'yellowRed', Math.max(1, mc.yellowReds), mc.team);
        } else if (mc.yellows === 1) {
          registerEvent(mc.name, 'yellow', 1, mc.team);
        }
        if (mc.reds > 0) {
          registerEvent(mc.name, 'red', mc.reds, mc.team);
        }
      });
    });

    // 2. Season scorers list
    if (s.stats && s.stats.scorers && Array.isArray(s.stats.scorers)) {
      s.stats.scorers.forEach(sc => {
        const pName = (sc.player || sc.name || '').trim();
        if (!pName || pName.toLowerCase().includes('eigentor') || pName.toLowerCase().includes('own goal')) return;
        const key = normalizePlayerKey(pName);
        const g = parseInt(sc.goals || sc.count || 0) || 0;
        if (key && g > 0) {
          if (!statsMap[key]) {
            registerEvent(pName, 'goal', g, sc.team);
          } else if (statsMap[key].goals < g) {
            statsMap[key].goals = g;
          }
        }
      });
    }

    // 3. Season cards list
    if (s.stats && s.stats.cards && Array.isArray(s.stats.cards)) {
      s.stats.cards.forEach(c => {
        const pName = (c.player || c.name || '').trim();
        const key = normalizePlayerKey(pName);
        const y = parseInt(c.yellow || c.gelb || 0) || 0;
        const yr = parseInt(c.yellowRed || c.gelbrot || c['yellow-red'] || c.yellow_red || 0) || 0;
        const r = parseInt(c.red || c.rot || 0) || 0;
        if (key) {
          if (!statsMap[key]) {
            statsMap[key] = { name: pName, goals: 0, yellow: y, red: r, yellowRed: yr, teams: new Set(c.team ? [c.team] : []) };
          } else {
            if (y > statsMap[key].yellow) statsMap[key].yellow = y;
            if (yr > statsMap[key].yellowRed) statsMap[key].yellowRed = yr;
            if (r > statsMap[key].red) statsMap[key].red = r;
          }
        }
      });
    }
  });

  cachedPlayerStats = statsMap;
  lastStatsComputeTime = now;
  return statsMap;
}

export function getPlayerLiveStats(player) {
  const statsMap = computeAllPlayerStats();
  if (!player) return { goals: 0, yellow: 0, red: 0 };

  const vorname = (player.Vorname || player.vorname || '').trim();
  const nachname = (player.Nachname || player.nachname || '').trim();
  const fullName = `${vorname} ${nachname}`.trim();
  const reversedName = `${nachname} ${vorname}`.trim();

  const key1 = normalizePlayerKey(fullName);
  const key2 = normalizePlayerKey(reversedName);
  const key3 = normalizePlayerKey(nachname);

  const matched = statsMap[key1] || statsMap[key2] || (key3 ? statsMap[key3] : null);
  if (matched) {
    return {
      goals: matched.goals || 0,
      yellow: matched.yellow || 0,
      yellowRed: matched.yellowRed || 0,
      red: matched.red || 0
    };
  }

  return { goals: 0, yellow: 0, yellowRed: 0, red: 0 };
}

// Find a player's database ID or query param from a match event player name
export function getPlayerLink(playerName, teamName = '') {
  if (!playerName) return '';
  const players = Store.getAdminPlayersSync ? Store.getAdminPlayersSync() : [];
  const targetKey = normalizePlayerKey(playerName);
  const targetTeamKey = teamName ? normalizePlayerKey(teamName) : '';

  if (Array.isArray(players) && players.length > 0) {
    // 1. Exact match Vorname + Nachname or Nachname + Vorname with team
    const foundWithTeam = players.find(p => {
      const fn = `${p.Vorname || ''} ${p.Nachname || ''}`;
      const rn = `${p.Nachname || ''} ${p.Vorname || ''}`;
      const nameMatch = normalizePlayerKey(fn) === targetKey || normalizePlayerKey(rn) === targetKey;
      if (!nameMatch) return false;
      if (targetTeamKey && p.Team) {
        return normalizePlayerKey(p.Team).includes(targetTeamKey) || targetTeamKey.includes(normalizePlayerKey(p.Team));
      }
      return true;
    });

    if (foundWithTeam) {
      const id = foundWithTeam['#'] || foundWithTeam.id || foundWithTeam.ID;
      return `#/spieler?id=${encodeURIComponent(id)}`;
    }

    // 2. Match without team filter
    const found = players.find(p => {
      const fn = `${p.Vorname || ''} ${p.Nachname || ''}`;
      const rn = `${p.Nachname || ''} ${p.Vorname || ''}`;
      return normalizePlayerKey(fn) === targetKey || normalizePlayerKey(rn) === targetKey;
    });

    if (found) {
      const id = found['#'] || found.id || found.ID;
      return `#/spieler?id=${encodeURIComponent(id)}`;
    }
  }

  return `#/spieler?search=${encodeURIComponent(playerName)}`;
}

// Compute club top scorers for a given team, filtered by season ('all' or specific seasonKey)
export function getTeamScorers(teamName, seasonFilter = 'all') {
  if (!teamName) return [];
  const teamNorm = normalizePlayerKey(teamName);
  const data = Store.getData();
  const seasons = data.seasons || {};
  const scorersMap = {};

  const targetSeasons = (seasonFilter === 'all' || !seasonFilter)
    ? Object.keys(seasons)
    : (seasons[seasonFilter] ? [seasonFilter] : []);

  targetSeasons.forEach(sKey => {
    const s = seasons[sKey];
    if (!s) return;

    // 1. Matches events
    (s.matches || []).forEach(m => {
      const hNorm = normalizePlayerKey(m.home);
      const aNorm = normalizePlayerKey(m.away);
      const isTeamMatch = hNorm.includes(teamNorm) || teamNorm.includes(hNorm) || aNorm.includes(teamNorm) || teamNorm.includes(aNorm);

      if (m.events && Array.isArray(m.events)) {
        m.events.forEach(ev => {
          if (ev.type === 'goal') {
            const evTeamNorm = normalizePlayerKey(ev.team || '');
            const belongsToTeam = evTeamNorm ? (evTeamNorm.includes(teamNorm) || teamNorm.includes(evTeamNorm)) : isTeamMatch;
            if (belongsToTeam) {
              const pName = sanitizeMojibake((ev.player || '').trim());
              if (!pName || pName.toLowerCase().includes('eigentor') || pName.toLowerCase().includes('own goal')) return;
              const key = normalizePlayerKey(pName);
              const count = parseInt(ev.count) || 1;
              if (key) {
                if (!scorersMap[key]) {
                  scorersMap[key] = { name: pName, goals: 0 };
                }
                scorersMap[key].goals += count;
              }
            }
          }
        });
      } else if (m.scorers && Array.isArray(m.scorers)) {
        m.scorers.forEach(sc => {
          const scTeamNorm = normalizePlayerKey(sc.team || '');
          const belongsToTeam = scTeamNorm ? (scTeamNorm.includes(teamNorm) || teamNorm.includes(scTeamNorm)) : isTeamMatch;
          if (belongsToTeam) {
            const pName = sanitizeMojibake((sc.name || sc.player || '').trim());
            const key = normalizePlayerKey(pName);
            const count = parseInt(sc.count || sc.goals) || 1;
            if (key) {
              if (!scorersMap[key]) {
                scorersMap[key] = { name: pName, goals: 0 };
              }
              scorersMap[key].goals += count;
            }
          }
        });
      }
    });

    // 2. Season aggregated stats scorers table (fallback/override for single season if match events weren't detailed)
    if (s.stats && s.stats.scorers && Array.isArray(s.stats.scorers)) {
      s.stats.scorers.forEach(sc => {
        const scTeamNorm = normalizePlayerKey(sc.team || '');
        if (scTeamNorm && (scTeamNorm.includes(teamNorm) || teamNorm.includes(scTeamNorm))) {
          const pName = sanitizeMojibake((sc.player || sc.name || '').trim());
          const key = normalizePlayerKey(pName);
          const g = parseInt(sc.goals || sc.count) || 0;
          if (key && g > 0) {
            if (!scorersMap[key]) {
              scorersMap[key] = { name: pName, goals: g };
            } else if (seasonFilter !== 'all' && scorersMap[key].goals < g) {
              scorersMap[key].goals = g;
            }
          }
        }
      });
    }
  });

  return Object.values(scorersMap)
    .filter(p => p.goals > 0)
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name, 'de');
    })
    .map(p => ({
      ...p,
      link: getPlayerLink(p.name, teamName)
    }));
}





/**
 * Calculates exact playing minutes and substitution intervals for each player in a match.
 * Enforces the DSG Liga Max 5 Substitutions & Rückwechsel (re-substitution) rules.
 */
export function calculateMatchMinutes(match, teamName, roster) {
  const normTeam = (teamName || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
  
  // Roster players
  const rosterPlayers = (roster && Array.isArray(roster.players)) ? roster.players : [];
  
  // Identify starters (isStarter !== false && role !== 'sub', max 11)
  const starters = new Set();
  const allTeamPlayers = new Set();
  
  if (rosterPlayers.length > 0) {
    let starterCount = 0;
    rosterPlayers.forEach((rp) => {
      const pName = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
      if (!pName) return;
      allTeamPlayers.add(pName);
      const isStart = (rp.isStarter !== false && rp.role !== 'sub');
      if (isStart && starterCount < 11) {
        starters.add(pName);
        starterCount++;
      }
    });
    // Fallback if no explicit starter flag: first 11 players are starters
    if (starterCount === 0) {
      rosterPlayers.slice(0, 11).forEach(rp => {
        const pName = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
        if (pName) starters.add(pName);
      });
    }
  }

  // Get match substitutions for this team
  const rawSubs = (match.substitutions && match.substitutions.length > 0)
    ? match.substitutions 
    : (match.events || []).filter(e => e.type === 'substitution');

  const teamSubs = rawSubs.filter(s => {
    const sTeam = (s.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    return !sTeam || sTeam.includes(normTeam) || normTeam.includes(sTeam);
  });

  // Track intervals per player: player -> array of [startMinute, endMinute]
  const intervals = {};
  starters.forEach(pName => {
    intervals[pName] = [[0, null]];
  });

  // Sort substitutions chronologically by minute
  teamSubs.sort((a, b) => (parseInt(a.minute, 10) || 0) - (parseInt(b.minute, 10) || 0));

  teamSubs.forEach(sub => {
    const min = Math.min(90, Math.max(0, parseInt(sub.minute, 10) || 45));
    const pOut = (sub.playerOut || '').trim();
    const pIn = (sub.playerIn || '').trim();

    // Close open interval for playerOut
    if (pOut) {
      if (!intervals[pOut]) intervals[pOut] = [];
      const openIdx = intervals[pOut].findIndex(iv => iv[1] === null);
      if (openIdx !== -1) {
        intervals[pOut][openIdx][1] = min;
      }
      allTeamPlayers.add(pOut);
    }

    // Open new interval for playerIn (supports Rückwechsel: player subbed back in gets an additional interval)
    if (pIn) {
      if (!intervals[pIn]) intervals[pIn] = [];
      intervals[pIn].push([min, null]);
      allTeamPlayers.add(pIn);
    }
  });

  // Handle Red Cards: if a player received red or yellow-red, close their open interval at that minute
  const teamCards = (match.cards || match.events || []).filter(c => {
    const cTeam = (c.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    const isRed = c.type === 'red' || c.type === 'yellowRed' || c.type === 'yellow-red';
    return isRed && (!cTeam || cTeam.includes(normTeam) || normTeam.includes(cTeam));
  });

  teamCards.forEach(c => {
    const cName = (c.player || c.name || '').trim();
    const cMin = Math.min(90, Math.max(0, parseInt(c.minute, 10) || 90));
    if (cName && intervals[cName]) {
      const openIdx = intervals[cName].findIndex(iv => iv[1] === null);
      if (openIdx !== -1) {
        intervals[cName][openIdx][1] = cMin;
      }
    }
  });

  // Close any open intervals at full time (90 minutes)
  const result = {};
  Object.keys(intervals).forEach(pName => {
    let totalMinutes = 0;
    intervals[pName].forEach(iv => {
      const start = iv[0];
      const end = iv[1] !== null ? iv[1] : 90;
      if (end >= start) {
        totalMinutes += (end - start);
      }
    });
    result[pName] = {
      minutes: totalMinutes,
      started: starters.has(pName),
      subbedIn: intervals[pName].some(iv => iv[0] > 0),
      subbedOut: intervals[pName].some(iv => iv[1] !== null && iv[1] < 90),
      intervals: intervals[pName]
    };
  });

  return { playerMinutes: result, allPlayers: Array.from(allTeamPlayers), starters: Array.from(starters) };
}

/**
 * Aggregates complete squad statistics for a specific team and season.
 * Generates match minutes, startelf counts, substitutions, goals, and cards.
 */
export function calculateTeamPlayerStats(seasonKey, teamName, allPlayersList = []) {
  const normTeam = (teamName || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
  const data = Store.getData();
  const seasonObj = data.seasons?.[seasonKey] || {};
  const seasonMatches = Array.isArray(seasonObj.matches) ? seasonObj.matches : [];

  const teamMatches = seasonMatches.filter(m => {
    const h = (m.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    const a = (m.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    return h.includes(normTeam) || normTeam.includes(h) || a.includes(normTeam) || normTeam.includes(a);
  });

  const playedMatches = teamMatches.filter(m => 
    m.status === 'Gespielt' || m.status === 'Played' || m.status === 'Beendet' ||
    (m.score && m.score !== '-:-' && m.score !== '- : -')
  );

  const clubPlayers = allPlayersList.filter(p => {
    const t = (p.Team || p.Mannschaft || p.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    return t.includes(normTeam) || normTeam.includes(t);
  });

  const { playerMap } = calculateSeasonSuspensions(seasonKey);

  const getSuspData = (pName) => {
    const pNorm = normalizePlayerKey(pName);
    for (const [k, v] of playerMap.entries()) {
      if (k.startsWith(pNorm + '___') || normalizePlayerKey(k.split('___')[0]) === pNorm) {
        return v;
      }
    }
    return { yellowCount: 0, redCount: 0, yellowRedCount: 0, isSuspended: false, isWarning: false, warningThreshold: 3 };
  };

  const playerStatsMap = new Map();

  // Initialize with official club players
  clubPlayers.forEach(p => {
    const fullName = `${p.Vorname || p.firstName || ''} ${p.Nachname || p.lastName || ''}`.trim();
    const key = normalizePlayerKey(fullName);
    if (!key) return;
    const susp = getSuspData(fullName);
    playerStatsMap.set(key, {
      id: p['#'] || p.id || fullName,
      name: fullName,
      raw: p,
      position: p.Position || p.position || 'Feldspieler',
      avatar: getPlayerAvatar(p),
      jerseyNumber: p['#'] && p['#'] !== '-' ? p['#'] : '',
      nominated: 0,
      played: 0,
      started: 0,
      subbedIn: 0,
      subbedOut: 0,
      benchUnused: 0,
      minutes: 0,
      goals: 0,
      yellowCards: 0,
      yellowRedCards: 0,
      redCards: 0,
      suspensionStatus: susp.status || 'clear',
      isSuspended: susp.isSuspended || (susp.status === 'suspended'),
      isWarning: susp.isWarning || (susp.status === 'warning'),
      yellowTotal: susp.yellowCount || 0
    });
  });

  // Aggregate across all played matches in this season
  playedMatches.forEach(m => {
    const roster = Store.getMatchdayRoster(seasonKey, m.id, teamName);
    const { playerMinutes } = calculateMatchMinutes(m, teamName, roster);

    const nominatedInMatch = new Set();
    if (roster && Array.isArray(roster.players)) {
      roster.players.forEach(rp => {
        const full = `${rp.firstName || ''} ${rp.lastName || ''}`.trim();
        const key = normalizePlayerKey(full);
        if (key) {
          nominatedInMatch.add(key);
          if (!playerStatsMap.has(key)) {
            playerStatsMap.set(key, {
              id: rp.id || full,
              name: full,
              raw: rp,
              position: rp.position || 'Feldspieler',
              avatar: rp.avatar || getPlayerAvatar(rp),
              jerseyNumber: rp.jerseyNumber || '',
              nominated: 0, played: 0, started: 0, subbedIn: 0, subbedOut: 0, benchUnused: 0, minutes: 0, goals: 0, yellowCards: 0, yellowRedCards: 0, redCards: 0, isSuspended: false, isWarning: false, yellowTotal: 0
            });
          }
          const pStat = playerStatsMap.get(key);
          pStat.nominated++;
          if (rp.jerseyNumber && !pStat.jerseyNumber) pStat.jerseyNumber = rp.jerseyNumber;
        }
      });
    }

    // Minutes and match roles
    Object.keys(playerMinutes).forEach(pName => {
      const key = normalizePlayerKey(pName);
      if (!key) return;
      if (!playerStatsMap.has(key)) {
        playerStatsMap.set(key, {
          id: pName,
          name: pName,
          raw: { Vorname: pName.split(' ')[0] || '', Nachname: pName.split(' ').slice(1).join(' ') || '' },
          position: 'Feldspieler',
          avatar: getPlayerAvatar({ Vorname: pName }),
          jerseyNumber: '',
          nominated: 0, played: 0, started: 0, subbedIn: 0, subbedOut: 0, benchUnused: 0, minutes: 0, goals: 0, yellowCards: 0, yellowRedCards: 0, redCards: 0, isSuspended: false, isWarning: false, yellowTotal: 0
        });
      }
      const pStat = playerStatsMap.get(key);
      const minData = playerMinutes[pName];
      pStat.minutes += minData.minutes;
      if (minData.minutes > 0) {
        pStat.played++;
        if (minData.started) pStat.started++;
        if (minData.subbedIn) pStat.subbedIn++;
        if (minData.subbedOut) pStat.subbedOut++;
      } else if (nominatedInMatch.has(key)) {
        pStat.benchUnused++;
      }
    });

    // Goals in this match
    const matchScorers = (m.scorers || m.events || []).filter(e => e.type === 'goal');
    matchScorers.forEach(s => {
      const sTeam = (s.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
      const belongs = !sTeam || sTeam.includes(normTeam) || normTeam.includes(sTeam);
      if (belongs) {
        const sName = (s.player || s.name || '').trim();
        const key = normalizePlayerKey(sName);
        if (key && playerStatsMap.has(key)) {
          const count = parseInt(s.count || s.goals, 10) || 1;
          playerStatsMap.get(key).goals += count;
        }
      }
    });

    // Cards in this match
    const matchCards = (m.cards || m.events || []).filter(c => c.type === 'yellow' || c.type === 'yellowRed' || c.type === 'yellow-red' || c.type === 'red');
    matchCards.forEach(c => {
      const cTeam = (c.team || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
      const belongs = !cTeam || cTeam.includes(normTeam) || normTeam.includes(cTeam);
      if (belongs) {
        const cName = (c.player || c.name || '').trim();
        const key = normalizePlayerKey(cName);
        if (key && playerStatsMap.has(key)) {
          const pStat = playerStatsMap.get(key);
          if (c.type === 'yellow') pStat.yellowCards++;
          else if (c.type === 'yellowRed' || c.type === 'yellow-red') pStat.yellowRedCards++;
          else if (c.type === 'red') pStat.redCards++;
        }
      }
    });
  });

  const statsList = Array.from(playerStatsMap.values());
  statsList.sort((a, b) => {
    if (b.minutes !== a.minutes) return b.minutes - a.minutes;
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.played !== a.played) return b.played - a.played;
    return a.name.localeCompare(b.name, 'de');
  });

  const maxPossibleMinutes = playedMatches.length * 90;

  return {
    seasonKey,
    teamName,
    playedMatchesCount: playedMatches.length,
    maxMinutes: maxPossibleMinutes,
    players: statsList
  };
}
