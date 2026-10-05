// Player Utilities & Automated Statistics Aggregator
import { Store, sanitizeMojibake } from './store.js?v=1791182000000';

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
      statsMap[key].yellow += (count * 2);
      statsMap[key].red += count;
    }
  };

  Object.keys(seasons).forEach(seasonKey => {
    const s = seasons[seasonKey];
    if (!s) return;

    // 1. Matches events
    (s.matches || []).forEach(m => {
      if (m.events && Array.isArray(m.events)) {
        m.events.forEach(ev => {
          registerEvent(ev.player, ev.type, parseInt(ev.count) || 1, ev.team);
        });
      } else if (m.scorers && Array.isArray(m.scorers)) {
        m.scorers.forEach(sc => {
          registerEvent(sc.name, 'goal', parseInt(sc.count) || parseInt(sc.goals) || 1, sc.team);
        });
      }
    });

    // 2. Season scorers list
    if (s.stats && s.stats.scorers && Array.isArray(s.stats.scorers)) {
      s.stats.scorers.forEach(sc => {
        const pName = (sc.player || sc.name || '').trim();
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
        const r = parseInt(c.red || c.rot || 0) || 0;
        if (key) {
          if (!statsMap[key]) {
            statsMap[key] = { name: pName, goals: 0, yellow: y, red: r, yellowRed: 0, teams: new Set(c.team ? [c.team] : []) };
          } else {
            if (y > statsMap[key].yellow) statsMap[key].yellow = y;
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
      red: matched.red || 0
    };
  }

  return { goals: 0, yellow: 0, red: 0 };
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



