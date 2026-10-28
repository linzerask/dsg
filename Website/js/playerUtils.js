// Player Utilities & Automated Statistics Aggregator
import { Store, sanitizeMojibake } from './store.js?v=1793340000000';
import { renderIcon } from './icons.js?v=1791182000000';
import { renderTeamLogo } from './logos.js?v=1791182000000';
import { calculateSeasonSuspensions, getPlayerSuspensionInfo } from './suspensionUtils.js?v=1793040000000';

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
  // Roster players (support passed roster or embedded match rosters)
  let rosterPlayers = (roster && Array.isArray(roster.players)) ? roster.players : [];
  if (rosterPlayers.length === 0 && match) {
    const hNorm = (match.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    const aNorm = (match.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
    if ((hNorm.includes(normTeam) || normTeam.includes(hNorm)) && match.homeRoster?.players) {
      rosterPlayers = match.homeRoster.players;
    } else if ((aNorm.includes(normTeam) || normTeam.includes(aNorm)) && match.awayRoster?.players) {
      rosterPlayers = match.awayRoster.players;
    } else if (match.rosters && match.rosters[teamName]?.players) {
      rosterPlayers = match.rosters[teamName].players;
    }
  }
  
  // Identify starters (isStarter !== false && role !== 'sub', max 11)
  const starters = new Set();
  const allTeamPlayers = new Set();
  
  if (rosterPlayers.length > 0) {
    let starterCount = 0;
    rosterPlayers.forEach((rp) => {
      const pName = `${rp.firstName || ''} ${rp.lastName || ''}`.trim() || rp.pName || rp.name || '';
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
        const pName = `${rp.firstName || ''} ${rp.lastName || ''}`.trim() || rp.pName || rp.name || '';
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
      passNumber: p['#'] && p['#'] !== '-' ? p['#'] : (p.passNumber || p.id || '-'),
      jerseyNumber: p.shirtNumber || (p.jerseyNumber && p.jerseyNumber !== p['#'] ? p.jerseyNumber : ''),
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
    let roster = Store.getMatchdayRoster(seasonKey, m.id, teamName);
    if (!roster && m) {
      const hNorm = (m.home || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
      const aNorm = (m.away || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').trim();
      if ((hNorm.includes(normTeam) || normTeam.includes(hNorm)) && m.homeRoster) {
        roster = m.homeRoster;
      } else if ((aNorm.includes(normTeam) || normTeam.includes(aNorm)) && m.awayRoster) {
        roster = m.awayRoster;
      } else if (m.rosters && m.rosters[teamName]) {
        roster = m.rosters[teamName];
      }
    }
    const { playerMinutes } = calculateMatchMinutes(m, teamName, roster);

    const nominatedInMatch = new Set();
    if (roster && Array.isArray(roster.players)) {
      roster.players.forEach(rp => {
        const full = `${rp.firstName || ''} ${rp.lastName || ''}`.trim() || rp.pName || rp.name || '';
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
          if (rp.passNumber && (!pStat.passNumber || pStat.passNumber === '-')) pStat.passNumber = rp.passNumber;
          if (rp['#'] && (!pStat.passNumber || pStat.passNumber === '-')) pStat.passNumber = rp['#'];
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
  statsList.forEach(p => {
    p.minutesPerGoal = p.goals > 0 ? (p.minutes > 0 ? Math.round(p.minutes / p.goals) : '<90') : null;
    p.goalsPerMatch = p.played > 0 ? (p.goals / p.played).toFixed(2) : '0.00';
    p.startRate = p.played > 0 ? Math.round((p.started / p.played) * 100) : 0;
    p.squadRate = playedMatches.length > 0 ? Math.round((p.nominated / playedMatches.length) * 100) : 0;
  });
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

export function formatBirthdate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00') return '';
  const str = String(dateStr).trim();
  const parts = str.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return str;
}

export async function openPlayerStatsModal(playerData, options = {}) {
  if (!playerData) return;

  const data = Store.getData() || {};
  const currentSeason = data.currentSeason || '2026/2027';
  const seasonKey = options.seasonKey || currentSeason;

  let allPlayers = options.allPlayers || (Store.getAdminPlayersSync ? Store.getAdminPlayersSync() : []);
  if (!allPlayers || allPlayers.length === 0) {
    allPlayers = await Store.getAdminPlayers();
  }

  // Raw player resolution
  const raw = playerData.raw || playerData;
  const pId = raw['#'] || raw.id || raw.ID || playerData.id || '';
  
  // Find official player from allPlayers if possible
  const officialPlayer = allPlayers.find(p => {
    if (pId && (String(p['#']) === String(pId) || String(p.id) === String(pId))) return true;
    const pFullName = `${p.Vorname || ''} ${p.Nachname || ''}`.trim();
    const rawFullName = `${raw.Vorname || raw.firstName || ''} ${raw.Nachname || raw.lastName || ''}`.trim() || raw.name || raw.pName || '';
    return pFullName && rawFullName && normalizePlayerKey(pFullName) === normalizePlayerKey(rawFullName);
  }) || raw;

  const firstName = officialPlayer.Vorname || officialPlayer.firstName || raw.Vorname || raw.firstName || '';
  const lastName = officialPlayer.Nachname || officialPlayer.lastName || raw.Nachname || raw.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || officialPlayer.name || raw.name || raw.pName || 'Unbekannter Spieler';
  const teamName = options.teamName || officialPlayer.Team || raw.Team || raw.team || '';
  const avatarUrl = getPlayerAvatar(officialPlayer);
  const positionLabel = getPlayerPositionLabel(officialPlayer) || officialPlayer.Position || raw.position || 'Feldspieler';
  
  // Pass number vs. jersey number resolution
  const passNum = officialPlayer.passNumber || officialPlayer['#'] || raw.passNumber || raw['#'] || officialPlayer.id || pId || '-';
  const rawShirt = raw.jerseyNumber || officialPlayer.jerseyNumber || officialPlayer.shirtNumber || '';
  const trueShirtNum = (rawShirt && String(rawShirt) !== String(passNum) && parseInt(rawShirt, 10) > 0 && parseInt(rawShirt, 10) < 100) ? rawShirt : '';

  // Calculate team stats
  const teamStats = calculateTeamPlayerStats(seasonKey, teamName, allPlayers);
  const normKey = normalizePlayerKey(fullName);
  const pStat = (teamStats.players || []).find(p => {
    return normalizePlayerKey(p.name) === normKey || (p.id && pId && String(p.id) === String(pId));
  }) || {
    minutes: 0,
    played: 0,
    started: 0,
    subbedIn: 0,
    subbedOut: 0,
    benchUnused: 0,
    goals: 0,
    yellowCards: 0,
    yellowRedCards: 0,
    redCards: 0,
    yellowTotal: 0
  };

  const maxMins = teamStats.maxMinutes || (teamStats.playedMatchesCount * 90) || 0;
  const minPct = maxMins > 0 ? Math.min(100, Math.round((pStat.minutes / maxMins) * 100)) : 0;

  // Suspension information
  const susp = getPlayerSuspensionInfo(fullName, teamName, seasonKey);

  // Coach decision metrics
  const minPerGoal = pStat.goals > 0 ? (pStat.minutes > 0 ? Math.round(pStat.minutes / pStat.goals) : '<90') : null;
  const goalsPerMatch = pStat.played > 0 ? (pStat.goals / pStat.played).toFixed(2) : '0.00';
  const startPct = pStat.played > 0 ? Math.round((pStat.started / pStat.played) * 100) : 0;
  const squadPct = teamStats.playedMatchesCount > 0 ? Math.round((pStat.nominated / teamStats.playedMatchesCount) * 100) : 0;

  // Personal Info
  const birthRaw = officialPlayer.Geburtsdatum || raw.Geburtsdatum || '';
  const formattedBirth = formatBirthdate(birthRaw);
  const age = calculatePlayerAge(birthRaw);
  const ageDisplay = age ? `${formattedBirth} (${age} Jahre)` : (formattedBirth || 'Unbekannt');
  const memberSince = formatMemberSince(officialPlayer.memberSince || officialPlayer.seit || officialPlayer.Seit || raw.memberSince || '');
  const hasCustomPhoto = Boolean(officialPlayer.photoUrl || officialPlayer.foto || officialPlayer.avatar || officialPlayer.Foto || officialPlayer.image);
  const playerStatus = officialPlayer.Status || officialPlayer.status || raw.Status || 'Aktiv';

  // Ensure modal DOM element exists
  let modal = document.getElementById('dsg-player-stats-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dsg-player-stats-modal';
    modal.className = 'dsg-player-modal';
    document.body.appendChild(modal);
  }

  // Inject modal style once
  if (!document.getElementById('dsg-player-modal-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'dsg-player-modal-styles';
    styleEl.textContent = `
      .dsg-player-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
      }
      .dsg-player-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .dsg-player-modal-content {
        position: relative;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 12px;
        padding: 22px;
        border: 1px solid var(--color-border, #e2e8f0);
        background: var(--color-surface, #ffffff);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        z-index: 10;
        color: var(--color-text-primary, #1a1a24);
      }
      .dsg-player-modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #64748b;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        line-height: 1;
        padding: 0;
      }
      .dsg-player-modal-close:hover {
        background: #e2e8f0;
        color: #0f172a;
        transform: scale(1.05);
      }
      .dsg-card-white {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }
      .dsg-card-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
      }
      [data-theme="dark"] .dsg-player-modal-content {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.12);
        color: #f8fafc;
      }
      [data-theme="dark"] .dsg-player-modal-close {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        color: #94a3b8;
      }
      [data-theme="dark"] .dsg-player-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }
      [data-theme="dark"] .dsg-card-white {
        background: #0f172a !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: #f8fafc !important;
      }
      [data-theme="dark"] .dsg-card-section {
        background: rgba(255, 255, 255, 0.03) !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      @media (max-width: 480px) {
        .dsg-player-modal-content {
          padding: 16px;
          max-height: 92vh;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  const teamLogoHtml = teamName ? renderTeamLogo(teamName, 'md') : '';

  modal.innerHTML = `
    <div class="dsg-player-modal-backdrop" id="dsg-modal-backdrop"></div>
    <div class="dsg-player-modal-content">
      <button type="button" class="dsg-player-modal-close" id="dsg-modal-close-btn" aria-label="Schließen">&times;</button>
      
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;">
        
        <!-- Avatar & Team Crest Showcase -->
        <div style="position: relative; width: 110px; height: 110px; border-radius: 50%; background: #ffffff; padding: 3px; border: 3px solid var(--color-accent); box-shadow: 0 8px 24px rgba(0, 179, 65, 0.25); display: flex; align-items: center; justify-content: center; overflow: visible; margin-top: 6px;">
          <img src="${avatarUrl}" alt="${fullName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain; object-position: bottom center;">
          ${teamLogoHtml ? `
            <div style="position: absolute; bottom: -4px; right: -4px; width: 40px; height: 40px; background: var(--color-surface); border-radius: 50%; padding: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center;">
              ${teamLogoHtml}
            </div>
          ` : ''}
        </div>

        <!-- Name, Team & Position -->
        <div>
          <h2 style="font-size: 1.55rem; font-weight: 800; margin: 0 0 4px 0; color: var(--color-text-primary); line-height: 1.2;">${fullName}</h2>
          <div style="font-size: 1.0rem; font-weight: 700; color: var(--color-text-secondary); display: inline-flex; align-items: center; gap: 6px;">
            ${teamName || 'Vereinslos'}
          </div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
            ${positionLabel ? `<span style="background: rgba(0, 179, 65, 0.12); border: 1px solid rgba(0, 179, 65, 0.25); color: #16a34a; font-weight: 800; font-size: 0.76rem; padding: 3px 10px; border-radius: 999px; text-transform: uppercase;">${positionLabel}</span>` : ''}
            ${passNum && passNum !== '-' ? `<span class="dsg-card-white" style="font-weight: 800; font-size: 0.76rem; padding: 3px 10px; border-radius: 999px; color: var(--color-text-primary);">Pass #${passNum}</span>` : ''}
            ${trueShirtNum ? `<span class="dsg-card-white" style="font-weight: 800; font-size: 0.76rem; padding: 3px 10px; border-radius: 999px; color: var(--color-text-primary);">Trikot #${trueShirtNum}</span>` : ''}
            <span class="dsg-card-white" style="font-size: 0.76rem; padding: 3px 10px; border-radius: 999px; font-weight: 600; color: var(--color-text-secondary);">Saison ${seasonKey}</span>
          </div>
        </div>

        <!-- Playing Time & Appearance Card -->
        <div class="dsg-card-section" style="width: 100%; text-align: left; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #16a34a; letter-spacing: 0.5px;">Einsatz &amp; Spielzeit</span>
            <span style="font-size: 0.85rem; font-weight: 800; color: var(--color-text-primary);">${pStat.minutes} Min. <span style="font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600;">(${minPct}%)</span></span>
          </div>
          
          <!-- Progress Bar -->
          <div style="height: 7px; width: 100%; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin: 6px 0 10px 0;">
            <div style="height: 100%; width: ${minPct}%; background: linear-gradient(90deg, #16a34a, var(--color-accent)); border-radius: 999px; transition: width 0.4s ease;"></div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.82rem; margin-top: 8px;">
            <div class="dsg-card-white" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="color: #64748b; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">Einsätze absolviert</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: var(--color-text-primary); margin: 3px 0 2px 0; line-height: 1.1;">
                ${pStat.played} <span style="font-size: 0.76rem; font-weight: 600; color: #64748b;">/ ${teamStats.playedMatchesCount} Spiele</span>
              </div>
              <div style="font-size: 0.72rem; color: #475569; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${pStat.started}x Start &bull; ${pStat.subbedIn}x Ein
              </div>
            </div>

            <div class="dsg-card-white" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="color: #64748b; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">Kader-Status</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: var(--color-text-primary); margin: 3px 0 2px 0; line-height: 1.1;">
                ${pStat.nominated} <span style="font-size: 0.76rem; font-weight: 600; color: #64748b;">Nominierungen</span>
              </div>
              <div style="font-size: 0.72rem; color: #475569; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${pStat.benchUnused}x Bank &bull; ${pStat.subbedOut}x Aus
              </div>
            </div>
          </div>
        </div>

        <!-- Trainer-Entscheidungshilfe & Effizienz-KPIs -->
        <div class="dsg-card-section" style="width: 100%; text-align: left; padding: 14px;">
          <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-secondary); letter-spacing: 0.5px; margin-bottom: 8px;">
            Trainer-Entscheidungshilfe &amp; Effizienz
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
            <div class="dsg-card-white" style="padding: 10px 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;">Min. / Tor</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: ${minPerGoal !== null ? '#16a34a' : '#94a3b8'}; margin: 3px 0 2px 0; line-height: 1.1;">
                ${minPerGoal !== null ? minPerGoal + '<span style="font-size: 0.7rem; font-weight: 600; margin-left: 2px;">Min.</span>' : '&mdash;'}
              </div>
              <div style="font-size: 0.68rem; color: #64748b; font-weight: 500; white-space: nowrap;">
                ${pStat.goals > 0 ? goalsPerMatch + ' T/Sp.' : '0 Tore'}
              </div>
            </div>
            <div class="dsg-card-white" style="padding: 10px 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;">Startelf</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: ${startPct >= 70 ? '#16a34a' : startPct >= 40 ? '#2563eb' : '#94a3b8'}; margin: 3px 0 2px 0; line-height: 1.1;">
                ${startPct}%
              </div>
              <div style="font-size: 0.68rem; color: #64748b; font-weight: 500; white-space: nowrap;">
                ${pStat.started} / ${pStat.played || 0} Starts
              </div>
            </div>
            <div class="dsg-card-white" style="padding: 10px 6px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;">Kader</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: ${squadPct >= 80 ? '#16a34a' : squadPct >= 50 ? '#d97706' : '#94a3b8'}; margin: 3px 0 2px 0; line-height: 1.1;">
                ${squadPct}%
              </div>
              <div style="font-size: 0.68rem; color: #64748b; font-weight: 500; white-space: nowrap;">
                ${pStat.nominated} / ${teamStats.playedMatchesCount} Nom.
              </div>
            </div>
          </div>
        </div>

        <!-- Goals & Cards KPI Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;">
          <div class="dsg-card-white" style="padding: 10px 4px; text-align: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #16a34a; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${renderIcon('ball', { size: 16, color: '#16a34a' })} ${pStat.goals}
            </div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Tore</div>
          </div>

          <div class="dsg-card-white" style="padding: 10px 4px; text-align: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #d97706; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="display:inline-block;width:11px;height:15px;background:#eab308;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span> ${pStat.yellowCards}
            </div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Gelb (${pStat.yellowTotal || pStat.yellowCards})</div>
          </div>

          <div class="dsg-card-white" style="padding: 10px 4px; text-align: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #ea580c; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="display:inline-block;width:11px;height:15px;background:linear-gradient(135deg, #f1c40f 50%, #e74c3c 50%);border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span> ${pStat.yellowRedCards}
            </div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Gelb-Rot</div>
          </div>

          <div class="dsg-card-white" style="padding: 10px 4px; text-align: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #dc2626; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="display:inline-block;width:11px;height:15px;background:#ef4444;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span> ${pStat.redCards}
            </div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary); margin-top: 2px;">Rot</div>
          </div>
        </div>

        <!-- Disciplinary Eligibility Box -->
        <div style="width: 100%;">
          ${susp.active ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 12px; text-align: left; color: #991b1b; font-size: 0.82rem;">
              <div style="font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #dc2626;"></span> GESPERRT (${susp.active.reason})
              </div>
              <div style="margin-top: 4px; color: #b91c1c;">
                Fehlt in <strong>${susp.active.nextMatch.round || 'kommender Runde'}</strong> &bull; ${susp.active.gamesRemaining} Spiel${susp.active.gamesRemaining > 1 ? 'e' : ''} Sperre verbleibend.
              </div>
            </div>
          ` : susp.warning ? `
            <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 10px 12px; text-align: left; color: #854d0e; font-size: 0.82rem;">
              <div style="font-weight: 800; color: #ca8a04; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #ca8a04;"></span> VORVERWARNUNG: SPERRE DROHT
              </div>
              <div style="margin-top: 4px; color: #a16207;">
                Bereits <strong>${susp.warning.yellowCount} von ${susp.warning.threshold}</strong> Gelben Karten. Bei der nächsten Gelben Karte im folgenden Spiel automatisch gesperrt!
              </div>
            </div>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 14px; font-size: 0.82rem;">
              <span style="color: #166534; font-weight: 600;">Disziplinarstatus:</span>
              <span style="color: #15803d; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span> Spielberechtigt
              </span>
            </div>
          `}
        </div>

        <!-- Master Data / Pass Information -->
        <div class="dsg-card-white" style="width: 100%; text-align: left; padding: 12px 14px; font-size: 0.84rem;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border, #e2e8f0);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Pass-Nr. / ID:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">#${passNum}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border, #e2e8f0);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Geburtsdatum / Alter:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">${ageDisplay}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border, #e2e8f0);">
            <span style="color: var(--color-text-secondary); font-weight: 600;">DSG-Mitgliedschaft:</span>
            <span style="font-weight: 700; color: var(--color-text-primary);">${memberSince || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="color: var(--color-text-secondary); font-weight: 600;">Passfoto-Status:</span>
            <span style="font-weight: 700; color: ${hasCustomPhoto ? '#16a34a' : '#d97706'}; display: inline-flex; align-items: center; gap: 4px;">
              ${hasCustomPhoto ? 'Digital verifiziert' : 'Passfoto fehlt'}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; width: 100%; margin-top: 4px;">
          <button type="button" id="dsg-modal-close-action-btn" class="dsg-card-white" style="flex: 1; padding: 10px; font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary); cursor: pointer; text-align: center;">
            Schließen
          </button>
        </div>

      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.classList.add('no-scroll');
  document.documentElement.classList.add('no-scroll');

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
  };

  document.getElementById('dsg-modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('dsg-modal-close-action-btn')?.addEventListener('click', closeModal);
  document.getElementById('dsg-modal-backdrop')?.addEventListener('click', closeModal);

  const escHandler = (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
      window.removeEventListener('keydown', escHandler);
    }
  };
  window.addEventListener('keydown', escHandler);
}

export function closePlayerStatsModal() {
  const modal = document.getElementById('dsg-player-stats-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
  }
}
