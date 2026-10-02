import { Store } from '../store.js?v=1790560300000';
import { renderIcon } from '../icons.js?v=1790560300000';

let activeStatsTab = 'scorers';
let scorerSearchQuery = '';
let clubSearchQuery = '';
let scorerPage = 1;
const SCORERS_PER_PAGE = 20;

let statsMasterTeams = [];
if (typeof window !== 'undefined' && Store.getAdminTeams) {
  Store.getAdminTeams().then(teams => {
    if (teams && teams.length > 0) {
      statsMasterTeams = teams;
    }
  });
}

export const formatSeasonDisplay = (seasonKey) => {
  if (!seasonKey) return '';
  const leagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
  const found = leagues.find(l => l.seasonKey === seasonKey || l.name === seasonKey);
  if (found) {
    const yr = found.year ? String(found.year).trim() : (seasonKey.match(/\d{4}(\/\d{4})?/)?.[0] || '');
    const cleanName = (found.name || 'DSG Liga').replace(/\s*\d{4}(\/\d{4})?/, '').trim();
    return yr ? `${cleanName} ${yr}` : cleanName;
  }
  let yr = seasonKey.match(/\d{4}(\/\d{4})?/)?.[0] || seasonKey;
  if (/^\d{4}$/.test(yr)) {
    yr = `${yr}/${parseInt(yr) + 1}`;
  }
  if (seasonKey.includes('oberes')) return `Oberes Playoff ${yr}`;
  if (seasonKey.includes('unteres')) return `Unteres Playoff ${yr}`;
  if (seasonKey.includes('1klasse') || seasonKey.toLowerCase().includes('1. klasse')) return `1. Klasse ${yr}`;
  return `DSG Liga ${yr}`;
};

// Helper: Compute aggregate statistics dynamically from Store data
export const computeAllTimeStats = () => {
  const data = Store.getData();
  const seasons = data.seasons || {};

  let totalMatches = 0;
  let totalGoals = 0;
  let matchScores = []; // for records
  const playerMap = {};
  const clubMap = {};
  const seasonHonors = [];
  const cardMap = {};
  const concededList = [];
  const roundGoalsMap = {};
  const drawsMap = {};

  // Iterate over all seasons
  const seasonKeys = Object.keys(seasons);
  const mainSeasons = ['2022/2023', '2023/2024', '2024/2025', '2025/2026', '2026/2027'];

  seasonKeys.forEach(seasonKey => {
    const s = seasons[seasonKey];
    if (!s) return;

    // Seasonal tracking for disciplinary cards
    const seasonEventCards = {};

    // Matches & Goals
    const matches = s.matches || [];
    matches.forEach(m => {
      const isPlayed = m.status === 'Gespielt' || m.status === 'Played' || (m.status && m.status.startsWith('Abgesagt')) || (m.score && m.score !== '-:-' && m.score !== '- : -' && m.score.trim() !== '');
      if (isPlayed) {
        totalMatches++;
        let gA = 0, gB = 0;
        if (m.status === 'Abgesagt 3:0') { gA = 3; gB = 0; }
        else if (m.status === 'Abgesagt 0:3') { gA = 0; gB = 3; }
        else if (m.score && m.score.includes(':')) {
          const p = m.score.split(' ')[0].replace('*', '').split(':');
          gA = parseInt(p[0]) || 0;
          gB = parseInt(p[1]) || 0;
        }
        const sumGoals = gA + gB;
        totalGoals += sumGoals;

        matchScores.push({
          home: m.home,
          away: m.away,
          score: m.score || `${gA}:${gB}`,
          totalGoals: sumGoals,
          diff: Math.abs(gA - gB),
          winner: gA > gB ? m.home : (gB > gA ? m.away : 'Unentschieden'),
          loser: gA > gB ? m.away : (gB > gA ? m.home : 'Unentschieden'),
          season: seasonKey,
          round: m.round || '',
          date: m.date || ''
        });

        if (m.home && m.away) {
          concededList.push({
            team: m.home,
            conceded: gB,
            opponent: m.away,
            score: m.score || `${gA}:${gB}`,
            season: seasonKey,
            date: m.date || ''
          });
          concededList.push({
            team: m.away,
            conceded: gA,
            opponent: m.home,
            score: m.score || `${gA}:${gB}`,
            season: seasonKey,
            date: m.date || ''
          });

          if (gA === gB && gA > 0) {
            drawsMap[m.home] = (drawsMap[m.home] || 0) + 1;
            drawsMap[m.away] = (drawsMap[m.away] || 0) + 1;
          }

          const rLabel = `${m.round || 'Runde'} (${formatSeasonDisplay(seasonKey)})`;
          roundGoalsMap[rLabel] = (roundGoalsMap[rLabel] || 0) + sumGoals;
        }
      }

      // Scorers & Disciplinary cards from match events
      if (m.events && Array.isArray(m.events) && m.events.length > 0) {
        m.events.forEach(ev => {
          if (ev.type === 'goal' && ev.player) {
            const name = (ev.player || '').trim();
            if (!name) return;
            if (!playerMap[name]) {
              playerMap[name] = {
                name,
                goals: 0,
                teams: new Set(),
                seasons: new Set(),
                matchCount: 0
              };
            }
            playerMap[name].goals += (parseInt(ev.count) || 1);
            if (ev.team) playerMap[name].teams.add(ev.team.trim());
            playerMap[name].seasons.add(seasonKey);
          } else if ((ev.type === 'yellow' || ev.type === 'red' || ev.type === 'yellowRed' || ev.type === 'yellow-red') && ev.player) {
            const name = (ev.player || '').trim();
            if (!name) return;
            if (!seasonEventCards[name]) {
              seasonEventCards[name] = {
                name,
                team: ev.team ? ev.team.trim() : (m.home || ''),
                yellow: 0,
                red: 0
              };
            }
            if (ev.type === 'yellow') {
              seasonEventCards[name].yellow += (parseInt(ev.count) || 1);
            } else if (ev.type === 'yellowRed' || ev.type === 'yellow-red') {
              seasonEventCards[name].yellow += 2;
              seasonEventCards[name].red += 1;
            } else {
              seasonEventCards[name].red += (parseInt(ev.count) || 1);
            }
          }
        });
      } else if (m.scorers && Array.isArray(m.scorers) && m.scorers.length > 0) {
        m.scorers.forEach(sc => {
          const name = (sc.name || '').trim();
          if (!name) return;
          if (!playerMap[name]) {
            playerMap[name] = {
              name,
              goals: 0,
              teams: new Set(),
              seasons: new Set(),
              matchCount: 0
            };
          }
          playerMap[name].goals += (parseInt(sc.count) || parseInt(sc.goals) || 1);
          if (sc.team) playerMap[name].teams.add(sc.team.trim());
          playerMap[name].seasons.add(seasonKey);
        });
      }
    });

    // Blend disciplinary cards from match events and s.stats.cards per season
    const seasonStatsCards = {};
    if (s.stats && s.stats.cards && Array.isArray(s.stats.cards)) {
      s.stats.cards.forEach(c => {
        const name = (c.player || c.name || '').trim();
        if (!name) return;
        seasonStatsCards[name] = {
          name,
          team: (c.team || '').trim(),
          yellow: parseInt(c.yellow || c.gelb || 0) || 0,
          red: parseInt(c.red || c.rot || 0) || 0
        };
      });
    }

    const allSeasonPlayersForCards = new Set([
      ...Object.keys(seasonEventCards),
      ...Object.keys(seasonStatsCards)
    ]);

    allSeasonPlayersForCards.forEach(name => {
      const evC = seasonEventCards[name] || { yellow: 0, red: 0, team: '' };
      const stC = seasonStatsCards[name] || { yellow: 0, red: 0, team: '' };

      const effectiveYellow = Math.max(evC.yellow || 0, stC.yellow || 0);
      const effectiveRed = Math.max(evC.red || 0, stC.red || 0);
      const team = stC.team || evC.team || '';

      if (effectiveYellow > 0 || effectiveRed > 0) {
        if (!cardMap[name]) {
          cardMap[name] = {
            name,
            team,
            yellow: 0,
            red: 0
          };
        }
        if (team && !cardMap[name].team) {
          cardMap[name].team = team;
        }
        cardMap[name].yellow += effectiveYellow;
        cardMap[name].red += effectiveRed;
      }
    });

    // Also blend stats from s.stats.topScorers if missing in match events
    if (s.stats && s.stats.topScorers && Array.isArray(s.stats.topScorers)) {
      s.stats.topScorers.forEach(sc => {
        const name = (sc.name || sc.player || '').trim();
        if (!name) return;
        if (!playerMap[name]) {
          playerMap[name] = {
            name,
            goals: sc.goals || 0,
            teams: new Set(sc.team ? [sc.team.trim()] : []),
            seasons: new Set([seasonKey]),
            matchCount: 0
          };
        } else {
          // If match events didn't register this season for the player
          if (!playerMap[name].seasons.has(seasonKey)) {
            playerMap[name].goals += (sc.goals || 0);
            if (sc.team) playerMap[name].teams.add(sc.team.trim());
            playerMap[name].seasons.add(seasonKey);
          }
        }
      });
    }

    // Teams & Club Standings
    const teams = s.teams || [];
    teams.forEach(t => {
      const name = (t.name || '').trim();
      if (!name) return;
      if (!clubMap[name]) {
        clubMap[name] = {
          name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          points: 0,
          seasonsCount: 0,
          titles: 0,
          seasonsList: new Set()
        };
      }
      clubMap[name].played += (t.played || 0);
      clubMap[name].won += (t.won || 0);
      clubMap[name].drawn += (t.drawn || 0);
      clubMap[name].lost += (t.lost || 0);
      clubMap[name].gf += (t.goalsFor ?? t.gf ?? 0);
      clubMap[name].ga += (t.goalsAgainst ?? t.ga ?? 0);
      clubMap[name].points += (t.points || 0);
      clubMap[name].seasonsCount++;
      clubMap[name].seasonsList.add(seasonKey);
    });

    // Season honors only for completed seasons (all matches finished)
    const isCompletedSeason = matches.length > 0 && matches.every(m => m.status === 'Gespielt' || m.status === 'Played' || (m.status && m.status.startsWith('Abgesagt')));
    if (isCompletedSeason && teams.length > 0 && teams.some(t => (t.played || 0) > 0 || (t.points || 0) > 0)) {
      const sortedTeams = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0) || (((b.goalsFor ?? b.gf ?? 0) - (b.goalsAgainst ?? b.ga ?? 0)) - ((a.goalsFor ?? a.gf ?? 0) - (a.goalsAgainst ?? a.ga ?? 0))));
      const champion = sortedTeams[0];
      const runnerUp = sortedTeams[1];
      
      let topScorer = null;
      if (s.stats?.topScorers && Array.isArray(s.stats.topScorers) && s.stats.topScorers.length > 0) {
        topScorer = [...s.stats.topScorers].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
      }

      if (champion && ((champion.played || 0) > 0 || (champion.points || 0) > 0)) {
        if (clubMap[champion.name.trim()]) {
          clubMap[champion.name.trim()].titles++;
        }
        seasonHonors.push({
          season: seasonKey,
          champion: champion.name,
          championPoints: champion.points || 0,
          championPlayed: champion.played || 0,
          runnerUp: runnerUp ? runnerUp.name : '',
          runnerUpPoints: runnerUp ? (runnerUp.points || 0) : 0,
          topScorer: topScorer ? (topScorer.name || topScorer.player || 'N/A') : 'N/A',
          topScorerGoals: topScorer ? (topScorer.goals || 0) : 0,
          topScorerTeam: topScorer ? (topScorer.team || '') : ''
        });
      }
    }
  });

  // Sort Season Honors: Year descending, DSG Liga before secondary leagues
  seasonHonors.sort((a, b) => {
    const yrA = parseInt(String(a.season).match(/\d{4}/)?.[0]) || 0;
    const yrB = parseInt(String(b.season).match(/\d{4}/)?.[0]) || 0;
    if (yrB !== yrA) return yrB - yrA;
    const isKlasseA = a.season.includes('1klasse') || a.season.toLowerCase().includes('1. klasse');
    const isKlasseB = b.season.includes('1klasse') || b.season.toLowerCase().includes('1. klasse');
    if (isKlasseA !== isKlasseB) return isKlasseA ? 1 : -1;
    return 0;
  });

  // Sort Scorers and assign real all-time rank
  const allTimeScorers = Object.values(playerMap).map(p => ({
    name: p.name,
    goals: p.goals,
    teams: Array.from(p.teams),
    seasonsCount: p.seasons.size,
    seasons: Array.from(p.seasons)
  })).sort((a, b) => b.goals - a.goals);

  allTimeScorers.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  // Merge all master teams from teams.json / Store.getAdminTeamsSync() into clubMap
  const allMasterTeams = (statsMasterTeams && statsMasterTeams.length > 0)
    ? statsMasterTeams
    : ((Store.getAdminTeamsSync ? Store.getAdminTeamsSync() : []) || []);
  allMasterTeams.forEach(mt => {
    const name = (mt.Name || mt.name || '').trim();
    if (name && !clubMap[name]) {
      clubMap[name] = {
        name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0,
        seasonsCount: 0,
        titles: 0,
        seasonsList: new Set()
      };
    }
  });

  const uniqueMasterTeamNames = new Set();
  allMasterTeams.forEach(mt => {
    const name = (mt.Name || mt.name || '').trim();
    if (name) uniqueMasterTeamNames.add(name);
  });
  Object.keys(clubMap).forEach(name => {
    if (name) uniqueMasterTeamNames.add(name);
  });
  const totalClubsCount = Math.max(uniqueMasterTeamNames.size, 54);

  // Sort Clubs and assign real all-time rank
  const allTimeClubs = Object.values(clubMap).map(c => {
    const diff = c.gf - c.ga;
    const winRate = c.played > 0 ? Math.round((c.won / c.played) * 100) : 0;
    return {
      ...c,
      diff,
      winRate,
      seasonsList: Array.from(c.seasonsList)
    };
  }).sort((a, b) => b.points - a.points || b.won - a.won || b.diff - a.diff);

  allTimeClubs.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  // Records
  matchScores.sort((a, b) => b.totalGoals - a.totalGoals);
  const highestScoringMatch = matchScores[0] || null;

  const matchDiffs = [...matchScores].sort((a, b) => b.diff - a.diff);
  const biggestWin = matchDiffs[0] || null;

  // Best single season goal scorer record
  let bestSingleSeasonScorer = { name: '', goals: 0, season: '', team: '' };
  seasonKeys.forEach(sKey => {
    const s = seasons[sKey];
    if (s && s.stats && s.stats.topScorers) {
      s.stats.topScorers.forEach(sc => {
        if (sc.goals > bestSingleSeasonScorer.goals) {
          bestSingleSeasonScorer = {
            name: sc.name || sc.player || '',
            goals: sc.goals,
            season: sKey,
            team: sc.team || ''
          };
        }
      });
    }
  });

  // Dynamic Rekordmeister calculation
  let rekordmeister = null;
  const clubsWithTitles = Object.values(clubMap)
    .filter(c => (c.titles || 0) > 0)
    .sort((a, b) => (b.titles || 0) - (a.titles || 0) || (b.points || 0) - (a.points || 0) || (b.won || 0) - (a.won || 0));

  if (clubsWithTitles.length > 0) {
    const topClub = clubsWithTitles[0];
    const wonSeasons = seasonHonors
      .filter(h => h.champion && h.champion.trim() === topClub.name.trim())
      .map(h => h.season);
    rekordmeister = {
      name: topClub.name,
      titles: topClub.titles,
      seasons: wonSeasons
    };
  }

  // 1. Die Schießbude (Most conceded in a single match)
  concededList.sort((a, b) => b.conceded - a.conceded);
  const mostConcededMatch = concededList.length > 0 && concededList[0].conceded > 0 ? concededList[0] : null;

  // 2. Der Kartensünder (Player with most card points)
  const badBoyList = Object.values(cardMap).sort((a, b) => (b.red * 3 + b.yellow) - (a.red * 3 + a.yellow) || b.yellow - a.yellow);
  const badBoy = badBoyList.length > 0 && (badBoyList[0].yellow > 0 || badBoyList[0].red > 0) ? badBoyList[0] : null;

  // 3. Die Remis-Könige (Team with most draws)
  let drawKings = null;
  const clubDraws = Object.entries(drawsMap).map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);
  if (clubDraws.length > 0 && clubDraws[0].count > 0) {
    drawKings = clubDraws[0];
  }

  // 4. Tor-Garantie (Average minutes per goal)
  const minutesPerGoal = totalGoals > 0 && totalMatches > 0 ? ((totalMatches * 90) / totalGoals).toFixed(1) : null;

  // 5. Torreichster Spieltag (Round with most goals)
  let mostGoalsRound = null;
  const roundEntries = Object.entries(roundGoalsMap).map(([round, goals]) => ({ round, goals })).sort((a, b) => b.goals - a.goals);
  if (roundEntries.length > 0 && roundEntries[0].goals > 0) {
    mostGoalsRound = roundEntries[0];
  }

  // 6. Das Vereins-Urgestein (Oldest active club)
  let oldestClub = null;
  const activeMasterTeamsWithDate = allMasterTeams
    .filter(t => (t.Status === 'Aktiv' || t.status === 'Aktiv') && t['Aktiv seit'] && t['Aktiv seit'] !== '0000-00-00' && t['Aktiv seit'].trim() !== '')
    .sort((a, b) => a['Aktiv seit'].localeCompare(b['Aktiv seit']));
  const targetOldest = activeMasterTeamsWithDate.length > 0 ? activeMasterTeamsWithDate[0] : allMasterTeams.filter(t => t['Aktiv seit'] && t['Aktiv seit'] !== '0000-00-00' && t['Aktiv seit'].trim() !== '').sort((a, b) => a['Aktiv seit'].localeCompare(b['Aktiv seit']))[0];

  if (targetOldest) {
    const yearMatch = String(targetOldest['Aktiv seit']).match(/\d{4}/);
    oldestClub = {
      name: targetOldest.Name || targetOldest.name,
      since: yearMatch ? yearMatch[0] : targetOldest['Aktiv seit'],
      fullDate: targetOldest['Aktiv seit']
    };
  }

  // Sort season honors descending by year (e.g. 2025/2026 first down to 2021/2022 last)
  const parseSeasonYear = (seasonStr) => {
    const match = String(seasonStr).match(/\d{4}/);
    return match ? parseInt(match[0]) : 0;
  };
  seasonHonors.sort((a, b) => parseSeasonYear(b.season) - parseSeasonYear(a.season));

  const goalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0';

  return {
    totalMatches,
    totalGoals,
    goalsPerMatch,
    uniquePlayersCount: allTimeScorers.length,
    uniqueClubsCount: totalClubsCount,
    seasonsCount: seasonKeys.filter(k => seasons[k] && ((seasons[k].teams && seasons[k].teams.length > 0) || (seasons[k].matches && seasons[k].matches.length > 0))).length,
    allTimeScorers,
    allTimeClubs,
    seasonHonors,
    records: {
      highestScoringMatch,
      biggestWin,
      bestSingleSeasonScorer,
      rekordmeister,
      mostConcededMatch,
      badBoy,
      drawKings,
      minutesPerGoal,
      mostGoalsRound,
      oldestClub
    }
  };
};

export const renderScorersTableRows = (pageScorers) => {
  if (!pageScorers || pageScorers.length === 0) {
    return `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--color-text-secondary);">Keine Torschützen gefunden.</td>
      </tr>
    `;
  }

  return pageScorers.map((s) => {
    let badge = '';
    if (s.rank === 1) badge = `${renderIcon('crown', { size: 14, color: '#f59e0b', style: 'vertical-align: -2px; margin-right: 4px;' })}`;
    else if (s.rank === 2) badge = `${renderIcon('medal', { size: 14, color: '#94a3b8', style: 'vertical-align: -2px; margin-right: 4px;' })}`;
    else if (s.rank === 3) badge = `${renderIcon('medal', { size: 14, color: '#b45309', style: 'vertical-align: -2px; margin-right: 4px;' })}`;

    return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.95rem;">
        <td style="padding: 12px 10px; font-weight: 700; color: ${s.rank <= 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
          ${badge}${s.rank}.
        </td>
        <td style="padding: 12px 10px; font-weight: 600; color: var(--color-text-primary);">
          ${s.name}
        </td>
        <td style="padding: 12px 10px; color: var(--color-text-secondary); font-size: 0.88rem;">
          ${s.teams.join(', ') || '-'}
        </td>
        <td style="padding: 12px 10px; text-align: center; color: var(--color-text-secondary);">
          ${s.seasonsCount}
        </td>
        <td style="padding: 12px 10px; text-align: right; font-weight: 800; font-size: 1.05rem; color: var(--color-accent);">
          ${s.goals}
        </td>
      </tr>
    `;
  }).join('');
};

export const renderScorersMobileCards = (pageScorers) => {
  if (!pageScorers || pageScorers.length === 0) {
    return `<div style="text-align: center; padding: 24px; color: var(--color-text-secondary);">Keine Torschützen gefunden.</div>`;
  }

  return pageScorers.map((s) => {
    let rankBadgeColor = 'var(--color-text-secondary)';
    let rankBg = 'rgba(0,0,0,0.03)';
    let icon = '';
    if (s.rank === 1) {
      rankBadgeColor = '#f59e0b';
      rankBg = 'rgba(245, 158, 11, 0.12)';
      icon = `${renderIcon('crown', { size: 14, color: '#f59e0b', style: 'margin-right: 2px;' })}`;
    } else if (s.rank === 2) {
      rankBadgeColor = '#94a3b8';
      rankBg = 'rgba(148, 163, 184, 0.15)';
      icon = `${renderIcon('medal', { size: 14, color: '#94a3b8', style: 'margin-right: 2px;' })}`;
    } else if (s.rank === 3) {
      rankBadgeColor = '#b45309';
      rankBg = 'rgba(180, 83, 9, 0.12)';
      icon = `${renderIcon('medal', { size: 14, color: '#b45309', style: 'margin-right: 2px;' })}`;
    }

    return `
      <div class="glass-card" style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; border: 1px solid var(--color-border); gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; min-width: 0; flex: 1;">
          <div style="min-width: 32px; height: 32px; border-radius: 6px; background: ${rankBg}; color: ${rankBadgeColor}; font-weight: 800; font-size: 0.92rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${icon}${s.rank}
          </div>
          <div style="display: flex; flex-direction: column; min-width: 0; overflow: hidden;">
            <strong style="color: var(--color-text-primary); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</strong>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span style="overflow: hidden; text-overflow: ellipsis;">${s.teams.join(', ') || '-'}</span>
              <span>&bull;</span>
              <span style="flex-shrink: 0;">${s.seasonsCount} ${s.seasonsCount === 1 ? 'Saison' : 'Saisons'}</span>
            </div>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <span style="font-weight: 900; font-size: 1.15rem; color: var(--color-accent); line-height: 1;">${s.goals}</span>
          <span style="font-size: 0.72rem; color: var(--color-accent); font-weight: 700; display: block; text-transform: uppercase;">Tore</span>
        </div>
      </div>
    `;
  }).join('');
};

export const renderScorerPagination = (totalScorers, currentPage, perPage = SCORERS_PER_PAGE) => {
  const totalPages = Math.ceil(totalScorers / perPage) || 1;
  if (totalScorers === 0) return '';
  if (totalPages <= 1) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border);">
        <div style="font-size: 0.88rem; color: var(--color-text-secondary);">
          Zeige <strong style="color: var(--color-text-primary);">1&ndash;${totalScorers}</strong> von <strong style="color: var(--color-text-primary);">${totalScorers}</strong> Torschützen
        </div>
      </div>
    `;
  }

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalScorers);

  let pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border);">
      <div style="font-size: 0.88rem; color: var(--color-text-secondary);">
        Zeige <strong style="color: var(--color-text-primary);">${totalScorers > 0 ? startIndex + 1 : 0}&ndash;${endIndex}</strong> von <strong style="color: var(--color-text-primary);">${totalScorers}</strong> Torschützen (Seite ${currentPage} von ${totalPages})
      </div>
      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
        <button class="stats-page-btn stats-prev-page" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
          &laquo; Zurück
        </button>
        ${pages.map(p => {
          if (p === '...') return `<span style="padding: 6px 8px; color: var(--color-text-secondary); font-size: 0.85rem;">&hellip;</span>`;
          const isActive = p === currentPage;
          return `
            <button class="stats-page-btn ${isActive ? 'active' : ''}" data-page="${p}">
              ${p}
            </button>
          `;
        }).join('')}
        <button class="stats-page-btn stats-next-page" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
          Weiter &raquo;
        </button>
      </div>
    </div>
  `;
};

export const renderClubsTableRows = (filteredClubs) => {
  if (!filteredClubs || filteredClubs.length === 0) {
    return `
      <tr>
        <td colspan="10" style="text-align: center; padding: 24px; color: var(--color-text-secondary);">Keine Vereine gefunden.</td>
      </tr>
    `;
  }

  return filteredClubs.map((c) => `
    <tr class="stats-club-row has-stats-club-accordion" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.95rem; cursor: pointer;">
      <td style="padding: 10px; font-weight: 700; color: ${c.rank <= 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
        ${c.rank}.
      </td>
      <td style="padding: 10px; font-weight: 700; color: var(--color-text-primary);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
          <span>${c.name} ${c.titles > 0 ? `<span title="${c.titles}x Meister" style="display: inline-flex; align-items: center; gap: 3px; font-size: 0.85rem; color: #f59e0b; margin-left: 6px;">${renderIcon('trophy', { size: 15, color: '#f59e0b' })} ${c.titles > 1 ? c.titles + 'x' : ''}</span>` : ''}</span>
          <svg class="stats-club-chevron show-mobile" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); transition: transform 0.2s; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.played}</td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; font-weight: 600; color: var(--color-text-primary);">${c.won}</td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.drawn}</td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.lost}</td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.gf}:${c.ga}</td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: ${c.diff > 0 ? 'var(--color-accent)' : (c.diff < 0 ? '#e74c3c' : 'var(--color-text-secondary)')}; font-weight: 600;">
        ${c.diff > 0 ? '+' + c.diff : c.diff}
      </td>
      <td class="hide-mobile" style="padding: 10px; text-align: center; color: var(--color-accent); font-weight: 600;">${c.winRate}%</td>
      <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 1.05rem; color: var(--color-accent);">${c.points}</td>
    </tr>
    <tr class="stats-club-accordion-row show-mobile-row" style="display: none; background: rgba(0,0,0,0.02);">
      <td colspan="3" style="padding: 8px 10px 14px 10px; border-bottom: 1px solid var(--color-border);">
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center; font-size: 0.8rem; color: var(--color-text-secondary);">
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Spiele</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${c.played}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Siege</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${c.won}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Unent.</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${c.drawn}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Nied.</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${c.lost}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Tore</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${c.gf}:${c.ga}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase;">Quote</div><div style="font-weight: 700; color: var(--color-accent); font-size: 0.95rem;">${c.winRate}%</div></div>
        </div>
      </td>
    </tr>
  `).join('');
};

export const getSeasonHonorLabel = (seasonKey) => {
  if (!seasonKey) return 'Saison';
  const leagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
  const found = leagues.find(l => l.seasonKey === seasonKey || l.name === seasonKey);
  if (found) {
    let yr = found.year ? String(found.year).trim() : '';
    if (!yr) {
      const match = seasonKey.match(/\d{4}(\/\d{4})?/);
      if (match) yr = match[0];
    }
    if (/^\d{4}$/.test(yr)) {
      yr = `${yr}/${parseInt(yr) + 1}`;
    }
    let name = (found.name || 'Liga').trim();
    name = name.replace(/\s*\d{4}(\/\d{4})?/, '').trim();
    if (yr) {
      return `${name} Saison ${yr}`;
    }
    return `${name}`;
  }

  // Fallback pattern matching
  let yr = seasonKey.match(/\d{4}(\/\d{4})?/)?.[0] || '2022/2023';
  if (/^\d{4}$/.test(yr)) {
    yr = `${yr}/${parseInt(yr) + 1}`;
  }

  if (seasonKey.includes('1klasse') || seasonKey.toLowerCase().includes('1. klasse')) {
    return `1. Klasse Saison ${yr}`;
  }
  if (seasonKey.includes('oberes')) {
    return `Oberes Playoff Saison ${yr}`;
  }
  if (seasonKey.includes('unteres')) {
    return `Unteres Playoff Saison ${yr}`;
  }

  return `DSG Liga Saison ${yr}`;
};

export const viewStatistiken = () => {
  const stats = computeAllTimeStats();
  const topScorers = stats.allTimeScorers;
  const clubs = stats.allTimeClubs;

  // Filtered lists based on search
  const query = scorerSearchQuery.trim().toLowerCase();
  const filteredScorers = query
    ? topScorers.filter(s => s.name.toLowerCase().includes(query) || s.teams.some(t => t.toLowerCase().includes(query)))
    : topScorers;

  const clubQuery = clubSearchQuery.trim().toLowerCase();
  const filteredClubs = clubQuery
    ? clubs.filter(c => c.name.toLowerCase().includes(clubQuery))
    : clubs;

  // Pagination for Scorers
  const totalScorers = filteredScorers.length;
  const totalPages = Math.ceil(totalScorers / SCORERS_PER_PAGE) || 1;
  if (scorerPage > totalPages) scorerPage = totalPages;
  if (scorerPage < 1) scorerPage = 1;

  const startIndex = (scorerPage - 1) * SCORERS_PER_PAGE;
  const endIndex = Math.min(startIndex + SCORERS_PER_PAGE, totalScorers);
  const pageScorers = filteredScorers.slice(startIndex, endIndex);

  // Top 3 Podium Cards for Hall of Fame
  const top1 = topScorers[0];
  const top2 = topScorers[1];
  const top3 = topScorers[2];

  return `
    <div class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-2xl);">
      
      <!-- Header Section -->
      <div class="stagger-item" style="margin-bottom: var(--space-xl); text-align: left;">
        <div style="display: inline-block; background: rgba(142, 198, 63, 0.12); border: 1px solid rgba(142, 198, 63, 0.35); color: var(--color-accent); font-weight: 700; font-size: 0.8rem; padding: 4px 14px; border-radius: 20px; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 0.5px;">
          Historische Datenbank
        </div>
        <h1 style="font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.15; margin: 0;">
          DSG <span class="accent-text">STATISTIKEN & REKORDE</span>
        </h1>
        <p style="color: var(--color-text-secondary); margin-top: var(--space-sm); font-size: 1.05rem; max-width: 700px;">
          Die ewige Bestenliste, Hall of Fame der Torjäger, Vereinsbilanzen und historische Meilensteine der DSG Meisterschaft.
        </p>
        
        <!-- Disclaimer Badge -->
        <div style="margin-top: var(--space-md); font-size: 0.8rem; color: var(--color-text-secondary); opacity: 0.85; display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--color-accent); font-weight: 700;">*</span>
          <span>Sämtliche Statistiken und Rekorde basieren auf den digital erfassten Spielberichten seit Beginn der Aufzeichnungen in der Saison 2022/2023.</span>
        </div>
      </div>

      <!-- Animated Key Stat Counters Grid -->
      <div class="stats-counter-grid stagger-item" style="margin-bottom: var(--space-xl);">
        
        <div class="glass-card stat-counter-card" style="padding: var(--space-md); text-align: center; border-top: 3px solid var(--color-accent);">
          <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('ball', { size: 30, color: 'var(--color-accent)' })}</div>
          <div class="stat-number count-up" data-target="${stats.totalGoals}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Tore gesamt</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Ø ${stats.goalsPerMatch} pro Spiel</div>
        </div>

        <div class="glass-card stat-counter-card" style="padding: var(--space-md); text-align: center; border-top: 3px solid var(--color-accent);">
          <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('stadium', { size: 30, color: 'var(--color-accent)' })}</div>
          <div class="stat-number count-up" data-target="${stats.totalMatches}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Gespielte Partien</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Seit 2022/2023</div>
        </div>

        <div class="glass-card stat-counter-card" style="padding: var(--space-md); text-align: center; border-top: 3px solid var(--color-accent);">
          <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('run', { size: 30, color: 'var(--color-accent)' })}</div>
          <div class="stat-number count-up" data-target="${stats.uniquePlayersCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Torschützen</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Eingetragene Torschützen</div>
        </div>

        <div class="glass-card stat-counter-card" style="padding: var(--space-md); text-align: center; border-top: 3px solid var(--color-accent);">
          <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('shield', { size: 30, color: 'var(--color-accent)' })}</div>
          <div class="stat-number count-up" data-target="${stats.uniqueClubsCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Vereine & Teams</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Aktive & Ehemalige</div>
        </div>

        <div class="glass-card stat-counter-card" style="padding: var(--space-md); text-align: center; border-top: 3px solid var(--color-accent);">
          <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('trophy', { size: 30, color: 'var(--color-accent)' })}</div>
          <div class="stat-number count-up" data-target="${stats.seasonsCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Saisons</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Digital dokumentiert</div>
        </div>

      </div>

      <!-- Navigation Tabs for Statistics Sub-Pages (Segmented Control) -->
      <div class="stats-tabs-wrapper stagger-item">
        <div class="stats-segmented-control">
          <button class="stats-pill-btn ${activeStatsTab === 'scorers' ? 'active' : ''}" data-tab="scorers">
            ${renderIcon('crown', { size: 16, color: 'currentColor' })}
            <span>Torjäger</span>
          </button>
          <button class="stats-pill-btn ${activeStatsTab === 'clubs' ? 'active' : ''}" data-tab="clubs">
            ${renderIcon('shield', { size: 16, color: 'currentColor' })}
            <span>Vereine</span>
          </button>
          <button class="stats-pill-btn ${activeStatsTab === 'champions' ? 'active' : ''}" data-tab="champions">
            ${renderIcon('trophy', { size: 16, color: 'currentColor' })}
            <span>Meister</span>
          </button>
          <button class="stats-pill-btn ${activeStatsTab === 'records' ? 'active' : ''}" data-tab="records">
            ${renderIcon('star', { size: 16, color: 'currentColor' })}
            <span>Rekorde</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: EWIGE TORJÄGERLISTE (HALL OF FAME) -->
      <div id="stats-section-scorers" class="stats-section" style="display: ${activeStatsTab === 'scorers' ? 'block' : 'none'};">
        
        <!-- Hall of Fame Top 3 Podium Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
          
          <!-- Platz 2 (Silber) -->
          ${top2 ? `
            <div class="glass-card" style="padding: var(--space-lg); text-align: center; border: 1px solid rgba(192, 192, 192, 0.4); order: 1;">
              <div style="margin-bottom: 8px; display: flex; justify-content: center;">${renderIcon('medal', { size: 36, color: '#94a3b8' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #a0a0a0; text-transform: uppercase;">Platz 2 &bull; Hall of Fame</div>
              <h3 style="font-size: 1.3rem; margin: 6px 0 2px 0; color: var(--color-text-primary);">${top2.name}</h3>
              <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 12px;">${top2.teams.join(', ')}</div>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent);">${top2.goals} <span style="font-size: 1rem; font-weight: 600;">Tore</span></div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">In ${top2.seasonsCount} ${top2.seasonsCount === 1 ? 'Saison' : 'Saisons'} erzielt</div>
            </div>
          ` : ''}

          <!-- Platz 1 (Gold / Ewiger Torschützenkönig) -->
          ${top1 ? `
            <div class="glass-card" style="padding: var(--space-lg); text-align: center; border: 2px solid var(--color-accent); box-shadow: 0 0 24px var(--color-accent-glow); transform: scale(1.03); order: 2; background: rgba(142, 198, 63, 0.05);">
              <div style="margin-bottom: 8px; display: flex; justify-content: center;">${renderIcon('crown', { size: 40, color: '#f59e0b' })}</div>
              <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">Ewiger Torschützenkönig</div>
              <h3 style="font-size: 1.5rem; font-weight: 800; margin: 6px 0 2px 0; color: var(--color-text-primary);">${top1.name}</h3>
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-accent); margin-bottom: 12px;">${top1.teams.join(', ')}</div>
              <div style="font-size: 2.5rem; font-weight: 900; color: var(--color-accent);">${top1.goals} <span style="font-size: 1.1rem; font-weight: 700;">Tore</span></div>
              <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">In ${top1.seasonsCount} ${top1.seasonsCount === 1 ? 'Saison' : 'Saisons'} erzielt</div>
            </div>
          ` : ''}

          <!-- Platz 3 (Bronze) -->
          ${top3 ? `
            <div class="glass-card" style="padding: var(--space-lg); text-align: center; border: 1px solid rgba(205, 127, 50, 0.4); order: 3;">
              <div style="margin-bottom: 8px; display: flex; justify-content: center;">${renderIcon('medal', { size: 36, color: '#b45309' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #cd7f32; text-transform: uppercase;">Platz 3 &bull; Hall of Fame</div>
              <h3 style="font-size: 1.3rem; margin: 6px 0 2px 0; color: var(--color-text-primary);">${top3.name}</h3>
              <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 12px;">${top3.teams.join(', ')}</div>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent);">${top3.goals} <span style="font-size: 1rem; font-weight: 600;">Tore</span></div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">In ${top3.seasonsCount} ${top3.seasonsCount === 1 ? 'Saison' : 'Saisons'} erzielt</div>
            </div>
          ` : ''}

        </div>

        <!-- Scorers Table Header & Search -->
        <div class="glass-card" style="padding: var(--space-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-md);">
            <div>
              <h3 style="margin: 0; font-size: 1.3rem;">Ewige Torschützenliste</h3>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--color-text-secondary);">Alle Torschützen der DSG-Liga seit der Saison 2022/2023</p>
            </div>
            <input type="text" id="stats-scorer-search" class="admin-input" placeholder="Spieler oder Verein suchen..." value="${scorerSearchQuery}" style="width: 100%; max-width: 280px; font-size: 0.9rem;">
          </div>

          <div class="table-container hide-mobile" style="overflow-x: auto;">
            <table class="league-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.85rem;">
                  <th style="padding: 12px 10px; width: 65px;">Rang</th>
                  <th style="padding: 12px 10px;">Spieler</th>
                  <th style="padding: 12px 10px;">Verein(e)</th>
                  <th style="padding: 12px 10px; text-align: center;">Saisons</th>
                  <th style="padding: 12px 10px; text-align: right;">Tore gesamt</th>
                </tr>
              </thead>
              <tbody id="stats-scorers-tbody">
                ${renderScorersTableRows(pageScorers)}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards for Scorers -->
          <div id="stats-scorers-mobile-cards" class="show-mobile" style="flex-direction: column; gap: 8px;">
            ${renderScorersMobileCards(pageScorers)}
          </div>

          <!-- Pagination Controls Container -->
          <div id="stats-scorers-pagination">
            ${renderScorerPagination(filteredScorers.length, scorerPage, SCORERS_PER_PAGE)}
          </div>

        </div>

      </div>

      <!-- TAB 2: EWIGE VEREINSTABELLE -->
      <div id="stats-section-clubs" class="stats-section" style="display: ${activeStatsTab === 'clubs' ? 'block' : 'none'};">
        <div class="glass-card" style="padding: var(--space-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-md);">
            <div>
              <h3 style="margin: 0; font-size: 1.3rem;">Ewige Vereinstabelle</h3>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--color-text-secondary);">Gesamtbilanz aller Vereine aus allen Meisterschaftsspielen</p>
            </div>
            <input type="text" id="stats-club-search" class="admin-input" placeholder="Verein suchen..." value="${clubSearchQuery}" style="width: 100%; max-width: 280px; font-size: 0.9rem;">
          </div>

          <div class="table-container" style="overflow-x: auto;">
            <table class="league-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.85rem;">
                  <th style="padding: 10px; width: 50px;">Rang</th>
                  <th style="padding: 10px;">Verein</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">Sp</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">S</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">U</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">N</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">Tore</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">Diff</th>
                  <th class="hide-mobile" style="padding: 10px; text-align: center;">Siegquote</th>
                  <th style="padding: 10px; text-align: right;">Punkte</th>
                </tr>
              </thead>
              <tbody id="stats-clubs-tbody">
                ${renderClubsTableRows(filteredClubs)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: EHRENTAFEL DER MEISTER -->
      <div id="stats-section-champions" class="stats-section" style="display: ${activeStatsTab === 'champions' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-lg);">
          ${stats.seasonHonors.map(h => `
            <div class="glass-card" style="padding: var(--space-lg); border-top: 4px solid var(--color-accent); display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-md); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                  <span style="font-weight: 800; font-size: 1.25rem; color: var(--color-accent); letter-spacing: 0.5px;">${getSeasonHonorLabel(h.season)}</span>
                  <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center;">
                    ${renderIcon('trophy', { size: 22, color: '#f59e0b' })}
                  </div>
                </div>
                
                <!-- Meister Box -->
                <div style="padding: 14px 16px; background: rgba(142, 198, 63, 0.09); border-radius: 8px; border: 1px solid rgba(142, 198, 63, 0.25);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.6px;">Meister</div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-text-primary); margin: 3px 0 2px 0;">${h.champion}</div>
                  <div style="font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 500;">
                    <strong style="color: var(--color-text-primary);">${h.championPoints} Punkte</strong> &bull; ${h.championPlayed} Spiele
                  </div>
                </div>
              </div>

              <!-- Secondary Honors Info -->
              <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0, 0, 0, 0.02); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border);">
                ${h.runnerUp ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; padding-bottom: 8px; border-bottom: 1px solid var(--color-border); gap: 10px;">
                    <span style="color: var(--color-text-secondary); display: inline-flex; align-items: center; gap: 6px; font-weight: 600; white-space: nowrap;">
                      ${renderIcon('medal', { size: 15, color: '#94a3b8' })} Vizemeister:
                    </span>
                    <span style="font-weight: 700; color: var(--color-text-primary); text-align: right;">
                      ${h.runnerUp} <span style="font-weight: 500; color: var(--color-text-secondary); font-size: 0.8rem;">(${h.runnerUpPoints} Pkt)</span>
                    </span>
                  </div>
                ` : ''}

                ${h.topScorer && h.topScorer !== 'N/A' ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; gap: 10px;">
                    <span style="color: var(--color-text-secondary); display: inline-flex; align-items: center; gap: 6px; font-weight: 600; white-space: nowrap;">
                      ${renderIcon('ball', { size: 15, color: 'var(--color-accent)' })} Torschützenkönig:
                    </span>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: var(--color-accent);">
                        ${h.topScorer} <span style="font-weight: 800; color: var(--color-accent); font-size: 0.82rem;">(${h.topScorerGoals} Tore)</span>
                      </div>
                      ${h.topScorerTeam ? `<div style="font-size: 0.75rem; font-weight: 500; color: var(--color-text-secondary);">${h.topScorerTeam}</div>` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TAB 4: REKORDE & MEILENSTEINE -->
      <div id="stats-section-records" class="stats-section" style="display: ${activeStatsTab === 'records' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-md);">
          
          <!-- Meiste Tore in einer Einzelsaison -->
          <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
            <div style="margin-bottom: 8px;">${renderIcon('flame', { size: 30, color: '#f97316' })}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Saison-Torrekord</div>
            <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.bestSingleSeasonScorer.name}</h3>
            <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
              ${stats.records.bestSingleSeasonScorer.goals} <span style="font-size: 1rem; font-weight: 600;">Tore</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
              Erzielt für <strong>${stats.records.bestSingleSeasonScorer.team}</strong> in der Saison <strong>${formatSeasonDisplay(stats.records.bestSingleSeasonScorer.season)}</strong>.
            </p>
          </div>

          <!-- Torreichstes Spiel -->
          ${stats.records.highestScoringMatch ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('zap', { size: 30, color: '#eab308' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Torreichstes Spiel</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.highestScoringMatch.home} vs. ${stats.records.highestScoringMatch.away}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                ${stats.records.highestScoringMatch.score} <span style="font-size: 1rem; font-weight: 600;">(${stats.records.highestScoringMatch.totalGoals} Tore)</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Saison <strong>${formatSeasonDisplay(stats.records.highestScoringMatch.season)}</strong> &bull; ${stats.records.highestScoringMatch.date || 'Meisterschaftsspiel'}
              </p>
            </div>
          ` : ''}

          <!-- Höchster Sieg -->
          ${stats.records.biggestWin ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('target', { size: 30, color: '#ef4444' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Höchster Sieg</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.biggestWin.home} vs. ${stats.records.biggestWin.away}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                ${stats.records.biggestWin.score}
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Saison <strong>${formatSeasonDisplay(stats.records.biggestWin.season)}</strong> &bull; Tordifferenz von ${stats.records.biggestWin.diff} Treffern
              </p>
            </div>
          ` : ''}

          <!-- Rekordmeister -->
          ${stats.records.rekordmeister ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('trophy', { size: 30, color: '#f59e0b' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Rekordmeister</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.rekordmeister.name}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                ${stats.records.rekordmeister.titles} <span style="font-size: 1rem; font-weight: 600;">${stats.records.rekordmeister.titles === 1 ? 'Meistertitel' : 'Meistertitel'}</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                ${stats.records.rekordmeister.seasons.length > 0 
                  ? `Titelgewinn${stats.records.rekordmeister.titles > 1 ? 'e' : ''} in ${stats.records.rekordmeister.titles > 1 ? 'den Spielzeiten' : 'der Spielzeit'} <strong>${stats.records.rekordmeister.seasons.map(s => formatSeasonDisplay(s)).join(', ')}</strong>.`
                  : 'Aktueller Titelträger der Liga.'}
              </p>
            </div>
          ` : ''}

          <!-- Die Schießbude (Most conceded in a single match) -->
          ${stats.records.mostConcededMatch ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid #ef4444;">
              <div style="margin-bottom: 8px;">${renderIcon('target', { size: 30, color: '#ef4444' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #ef4444; text-transform: uppercase;">Die Schießbude</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.mostConcededMatch.team}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: #ef4444; margin: 6px 0;">
                ${stats.records.mostConcededMatch.conceded} <span style="font-size: 1rem; font-weight: 600;">Gegentore</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Kassiert in einem einzigen Spiel beim <strong>${stats.records.mostConcededMatch.score}</strong> gegen <strong>${stats.records.mostConcededMatch.opponent}</strong> (Saison ${formatSeasonDisplay(stats.records.mostConcededMatch.season)}).
              </p>
            </div>
          ` : ''}

          <!-- Der Kartensünder -->
          ${stats.records.badBoy ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid #eab308;">
              <div style="margin-bottom: 8px;">${renderIcon('alertTriangle', { size: 30, color: '#eab308' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #eab308; text-transform: uppercase;">Der Kartensünder</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.badBoy.name}</h3>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); margin: 6px 0; display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 1.1rem; color: #eab308;">
                  <span style="display:inline-block;width:12px;height:16px;background:#eab308;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
                  ${stats.records.badBoy.yellow} Gelb
                </span>
                ${stats.records.badBoy.red > 0 ? `
                  <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 1.1rem; color: #ef4444;">
                    <span style="display:inline-block;width:12px;height:16px;background:#ef4444;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
                    ${stats.records.badBoy.red} Rot
                  </span>
                ` : ''}
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Aktiv für <strong>${stats.records.badBoy.team || 'DSG Verein'}</strong> &bull; Meiste Verwarnungen in den digital erfassten Spielberichten.
              </p>
            </div>
          ` : ''}

          <!-- Die Remis-Könige -->
          ${stats.records.drawKings ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('handshake', { size: 30, color: 'var(--color-accent)' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Die Remis-Könige</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.drawKings.team}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                ${stats.records.drawKings.count} <span style="font-size: 1rem; font-weight: 600;">Unentschieden</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Niemand teilte sich so oft die Punkte wie dieser Verein in den erfassten Ligaspielen.
              </p>
            </div>
          ` : ''}

          <!-- Tor-Garantie: Minuten pro Tor -->
          ${stats.records.minutesPerGoal ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('clock', { size: 30, color: 'var(--color-accent)' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Tor-Garantie</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">Taktfrequenz der Liga</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                Alle ${stats.records.minutesPerGoal} <span style="font-size: 1rem; font-weight: 600;">Min.</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Durchschnittliche Zeitspanne bis zum nächsten Treffer über alle <strong>${stats.totalMatches} Spiele</strong> hinweg.
              </p>
            </div>
          ` : ''}

          <!-- Torreichster Spieltag -->
          ${stats.records.mostGoalsRound ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid #f97316;">
              <div style="margin-bottom: 8px;">${renderIcon('sparkles', { size: 30, color: '#f97316' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #f97316; text-transform: uppercase;">Torreichster Spieltag</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.mostGoalsRound.round}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: #f97316; margin: 6px 0;">
                ${stats.records.mostGoalsRound.goals} <span style="font-size: 1rem; font-weight: 600;">Tore</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Der treffsicherste Spieltag der Ligageschichte mit dem höchsten Gesamtscore.
              </p>
            </div>
          ` : ''}

          <!-- Das Vereins-Urgestein -->
          ${stats.records.oldestClub ? `
            <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
              <div style="margin-bottom: 8px;">${renderIcon('award', { size: 30, color: 'var(--color-accent)' })}</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Vereins-Urgestein</div>
              <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">${stats.records.oldestClub.name}</h3>
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
                Seit ${stats.records.oldestClub.since} <span style="font-size: 1rem; font-weight: 600;">aktiv</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
                Ältester aktiver DSG-Mitgliedsverein laut Gründungs- und Beitrittsdatenbank.
              </p>
            </div>
          ` : ''}

        </div>
      </div>

      <style>
        .stats-counter-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-md);
        }
        @media (max-width: 768px) {
          .stats-counter-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .stats-counter-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </div>
  `;
};

export const bindStatistiken = () => {
  // Animate Count-Up Numbers
  const counters = document.querySelectorAll('.stat-number.count-up');
  counters.forEach(counter => {
    const targetVal = parseFloat(counter.getAttribute('data-target')) || 0;
    if (typeof anime !== 'undefined') {
      anime({
        targets: counter,
        innerHTML: [0, targetVal],
        round: 1,
        easing: 'easeOutExpo',
        duration: 1800
      });
    } else {
      counter.textContent = targetVal;
    }
  });

  // Tab Switching (Segmented Control)
  const tabBtns = document.querySelectorAll('.stats-pill-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      activeStatsTab = tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.stats-section').forEach(sec => sec.style.display = 'none');
      const targetSec = document.getElementById(`stats-section-${tab}`);
      if (targetSec) {
        targetSec.style.display = 'block';
        if (typeof anime !== 'undefined') {
          anime({ targets: targetSec, opacity: [0, 1], translateY: [8, 0], duration: 350 });
        }
      }
    });
  });

  const updateScorersView = () => {
    const stats = computeAllTimeStats();
    const query = scorerSearchQuery.trim().toLowerCase();
    const filtered = query
      ? stats.allTimeScorers.filter(s => s.name.toLowerCase().includes(query) || s.teams.some(t => t.toLowerCase().includes(query)))
      : stats.allTimeScorers;

    const totalPages = Math.ceil(filtered.length / SCORERS_PER_PAGE) || 1;
    if (scorerPage > totalPages) scorerPage = totalPages;
    if (scorerPage < 1) scorerPage = 1;

    const startIndex = (scorerPage - 1) * SCORERS_PER_PAGE;
    const endIndex = Math.min(startIndex + SCORERS_PER_PAGE, filtered.length);
    const pageScorers = filtered.slice(startIndex, endIndex);

    const tbody = document.getElementById('stats-scorers-tbody');
    const mobileContainer = document.getElementById('stats-scorers-mobile-cards');
    const pagContainer = document.getElementById('stats-scorers-pagination');
    if (tbody) tbody.innerHTML = renderScorersTableRows(pageScorers);
    if (mobileContainer) mobileContainer.innerHTML = renderScorersMobileCards(pageScorers);
    if (pagContainer) {
      pagContainer.innerHTML = renderScorerPagination(filtered.length, scorerPage, SCORERS_PER_PAGE);
      bindPaginationButtons();
    }
  };

  const bindPaginationButtons = () => {
    const pageBtns = document.querySelectorAll('.stats-page-btn');
    pageBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(btn.getAttribute('data-page'));
        if (page && !isNaN(page)) {
          scorerPage = page;
          updateScorersView();
          const tableContainer = document.getElementById('stats-section-scorers');
          if (tableContainer) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    });
  };

  // Scorer Search (in-place DOM update so input doesn't lose focus or reset cursor)
  const scorerSearch = document.getElementById('stats-scorer-search');
  scorerSearch?.addEventListener('input', (e) => {
    scorerSearchQuery = e.target.value;
    scorerPage = 1;
    updateScorersView();
  });

  const bindClubAccordions = () => {
    const clubRows = document.querySelectorAll('.has-stats-club-accordion');
    clubRows.forEach(row => {
      row.onclick = () => {
        if (window.innerWidth > 768) return;
        const accordionRow = row.nextElementSibling;
        const chevron = row.querySelector('.stats-club-chevron');
        if (accordionRow && accordionRow.classList.contains('stats-club-accordion-row')) {
          const isVisible = accordionRow.style.display === 'table-row';
          accordionRow.style.display = isVisible ? 'none' : 'table-row';
          if (chevron) chevron.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      };
    });
  };

  // Club Search (in-place DOM update)
  const clubSearch = document.getElementById('stats-club-search');
  clubSearch?.addEventListener('input', (e) => {
    clubSearchQuery = e.target.value;
    const stats = computeAllTimeStats();
    const query = clubSearchQuery.trim().toLowerCase();
    const filteredClubs = query
      ? stats.allTimeClubs.filter(c => c.name.toLowerCase().includes(query))
      : stats.allTimeClubs;
    const clubsTbody = document.getElementById('stats-clubs-tbody');
    if (clubsTbody) {
      clubsTbody.innerHTML = renderClubsTableRows(filteredClubs);
      bindClubAccordions();
    }
  });

  bindPaginationButtons();
  bindClubAccordions();
};
