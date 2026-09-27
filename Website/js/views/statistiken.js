import { Store } from '../store.js?v=1790560000008';
import { renderIcon } from '../icons.js?v=1790560000008';

let activeStatsTab = 'scorers';
let scorerSearchQuery = '';
let clubSearchQuery = '';

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

  // Iterate over all seasons
  const seasonKeys = Object.keys(seasons);
  const mainSeasons = ['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026', '2026/2027'];

  seasonKeys.forEach(seasonKey => {
    const s = seasons[seasonKey];
    if (!s) return;

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
      }

      // Scorers from match events (m.events or m.scorers)
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
            playerMap[name].goals += 1;
            if (ev.team) playerMap[name].teams.add(ev.team.trim());
            playerMap[name].seasons.add(seasonKey);
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
          playerMap[name].goals += (sc.goals || 1);
          if (sc.team) playerMap[name].teams.add(sc.team.trim());
          playerMap[name].seasons.add(seasonKey);
        });
      }
    });

    // Also blend stats from s.stats.topScorers if missing in match events
    if (s.stats && s.stats.topScorers && Array.isArray(s.stats.topScorers)) {
      s.stats.topScorers.forEach(sc => {
        const name = (sc.name || '').trim();
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
      clubMap[name].gf += (t.gf || 0);
      clubMap[name].ga += (t.ga || 0);
      clubMap[name].points += (t.points || 0);
      clubMap[name].seasonsCount++;
      clubMap[name].seasonsList.add(seasonKey);
    });

    // Season honors for completed main seasons
    if (mainSeasons.includes(seasonKey) && teams.length > 0 && seasonKey !== '2026/2027') {
      const sortedTeams = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0) || (((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0))));
      const champion = sortedTeams[0];
      const runnerUp = sortedTeams[1];
      const topScorer = s.stats?.topScorers?.[0] || null;

      if (champion) {
        if (clubMap[champion.name.trim()]) {
          clubMap[champion.name.trim()].titles++;
        }
        seasonHonors.push({
          season: seasonKey,
          champion: champion.name,
          championPoints: champion.points,
          championPlayed: champion.played,
          runnerUp: runnerUp ? runnerUp.name : '',
          runnerUpPoints: runnerUp ? runnerUp.points : 0,
          topScorer: topScorer ? topScorer.name : 'N/A',
          topScorerGoals: topScorer ? topScorer.goals : 0,
          topScorerTeam: topScorer ? topScorer.team : ''
        });
      }
    }
  });

  // Sort Scorers
  const allTimeScorers = Object.values(playerMap).map(p => ({
    name: p.name,
    goals: p.goals,
    teams: Array.from(p.teams),
    seasonsCount: p.seasons.size,
    seasons: Array.from(p.seasons)
  })).sort((a, b) => b.goals - a.goals);

  // Sort Clubs
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
            name: sc.name,
            goals: sc.goals,
            season: sKey,
            team: sc.team || ''
          };
        }
      });
    }
  });

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
    uniqueClubsCount: allTimeClubs.length,
    seasonsCount: mainSeasons.length,
    allTimeScorers,
    allTimeClubs,
    seasonHonors,
    records: {
      highestScoringMatch,
      biggestWin,
      bestSingleSeasonScorer
    }
  };
};

export const viewStatistiken = () => {
  const stats = computeAllTimeStats();
  const topScorers = stats.allTimeScorers;
  const clubs = stats.allTimeClubs;

  // Filtered lists based on search
  const filteredScorers = scorerSearchQuery
    ? topScorers.filter(s => s.name.toLowerCase().includes(scorerSearchQuery.toLowerCase()) || s.teams.some(t => t.toLowerCase().includes(scorerSearchQuery.toLowerCase())))
    : topScorers;

  const filteredClubs = clubSearchQuery
    ? clubs.filter(c => c.name.toLowerCase().includes(clubSearchQuery.toLowerCase()))
    : clubs;

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
          <span>Sämtliche Statistiken und Rekorde basieren auf den digital erfassten Spielberichten seit Beginn der Aufzeichnungen in der Saison 2021/2022.</span>
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
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Seit 2021/2022</div>
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

      <!-- Navigation Tabs for Statistics Sub-Pages -->
      <div class="stagger-item" style="display: flex; gap: var(--space-xs); flex-wrap: wrap; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm); margin-bottom: var(--space-xl);">
        <button class="tab-btn stats-tab-btn ${activeStatsTab === 'scorers' ? 'active' : ''}" data-tab="scorers" style="padding: 10px 18px; font-weight: 700; border-radius: 6px; cursor: pointer; border: none; background: ${activeStatsTab === 'scorers' ? 'rgba(142, 198, 63, 0.15)' : 'none'}; color: ${activeStatsTab === 'scorers' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: flex; align-items: center; gap: 8px;">
          ${renderIcon('crown', { size: 18, color: activeStatsTab === 'scorers' ? 'var(--color-accent)' : 'currentColor' })} Ewige Torjägerliste
        </button>
        <button class="tab-btn stats-tab-btn ${activeStatsTab === 'clubs' ? 'active' : ''}" data-tab="clubs" style="padding: 10px 18px; font-weight: 700; border-radius: 6px; cursor: pointer; border: none; background: ${activeStatsTab === 'clubs' ? 'rgba(142, 198, 63, 0.15)' : 'none'}; color: ${activeStatsTab === 'clubs' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: flex; align-items: center; gap: 8px;">
          ${renderIcon('shield', { size: 18, color: activeStatsTab === 'clubs' ? 'var(--color-accent)' : 'currentColor' })} Ewige Vereinstabelle
        </button>
        <button class="tab-btn stats-tab-btn ${activeStatsTab === 'champions' ? 'active' : ''}" data-tab="champions" style="padding: 10px 18px; font-weight: 700; border-radius: 6px; cursor: pointer; border: none; background: ${activeStatsTab === 'champions' ? 'rgba(142, 198, 63, 0.15)' : 'none'}; color: ${activeStatsTab === 'champions' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: flex; align-items: center; gap: 8px;">
          ${renderIcon('trophy', { size: 18, color: activeStatsTab === 'champions' ? 'var(--color-accent)' : 'currentColor' })} Ehrentafel der Meister
        </button>
        <button class="tab-btn stats-tab-btn ${activeStatsTab === 'records' ? 'active' : ''}" data-tab="records" style="padding: 10px 18px; font-weight: 700; border-radius: 6px; cursor: pointer; border: none; background: ${activeStatsTab === 'records' ? 'rgba(142, 198, 63, 0.15)' : 'none'}; color: ${activeStatsTab === 'records' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: flex; align-items: center; gap: 8px;">
          ${renderIcon('star', { size: 18, color: activeStatsTab === 'records' ? 'var(--color-accent)' : 'currentColor' })} Rekorde & Meilensteine
        </button>
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
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--color-text-secondary);">Alle Torschützen der DSG-Liga seit der Saison 2021/2022</p>
            </div>
            <input type="text" id="stats-scorer-search" class="admin-input" placeholder="Spieler oder Verein suchen..." value="${scorerSearchQuery}" style="width: 250px; font-size: 0.9rem;">
          </div>

          <div class="table-container" style="overflow-x: auto;">
            <table class="league-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.85rem;">
                  <th style="padding: 10px; width: 50px;">Rang</th>
                  <th style="padding: 10px;">Spieler</th>
                  <th style="padding: 10px;">Verein(e)</th>
                  <th style="padding: 10px; text-align: center;">Saisons</th>
                  <th style="padding: 10px; text-align: right;">Tore gesamt</th>
                </tr>
              </thead>
              <tbody>
                ${filteredScorers.length > 0 ? filteredScorers.map((s, idx) => {
                  let badge = '';
                  if (idx === 0 && !scorerSearchQuery) badge = `${renderIcon('crown', { size: 14, color: '#f59e0b', style: 'vertical-align: -2px; margin-right: 4px;' })}`;
                  else if (idx === 1 && !scorerSearchQuery) badge = `${renderIcon('medal', { size: 14, color: '#94a3b8', style: 'vertical-align: -2px; margin-right: 4px;' })}`;
                  else if (idx === 2 && !scorerSearchQuery) badge = `${renderIcon('medal', { size: 14, color: '#b45309', style: 'vertical-align: -2px; margin-right: 4px;' })}`;

                  return `
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.95rem;">
                      <td style="padding: 10px; font-weight: 700; color: ${idx < 3 && !scorerSearchQuery ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
                        ${badge}${idx + 1}.
                      </td>
                      <td style="padding: 10px; font-weight: 600; color: var(--color-text-primary);">
                        ${s.name}
                      </td>
                      <td style="padding: 10px; color: var(--color-text-secondary); font-size: 0.88rem;">
                        ${s.teams.join(', ') || '-'}
                      </td>
                      <td style="padding: 10px; text-align: center; color: var(--color-text-secondary);">
                        ${s.seasonsCount}
                      </td>
                      <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 1.05rem; color: var(--color-accent);">
                        ${s.goals}
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--color-text-secondary);">Keine Torschützen gefunden.</td>
                  </tr>
                `}
              </tbody>
            </table>
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
            <input type="text" id="stats-club-search" class="admin-input" placeholder="Verein suchen..." value="${clubSearchQuery}" style="width: 250px; font-size: 0.9rem;">
          </div>

          <div class="table-container" style="overflow-x: auto;">
            <table class="league-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.85rem;">
                  <th style="padding: 10px; width: 50px;">Rang</th>
                  <th style="padding: 10px;">Verein</th>
                  <th style="padding: 10px; text-align: center;">Sp</th>
                  <th style="padding: 10px; text-align: center;">S</th>
                  <th style="padding: 10px; text-align: center;">U</th>
                  <th style="padding: 10px; text-align: center;">N</th>
                  <th style="padding: 10px; text-align: center;">Tore</th>
                  <th style="padding: 10px; text-align: center;">Diff</th>
                  <th style="padding: 10px; text-align: center;">Siegquote</th>
                  <th style="padding: 10px; text-align: right;">Punkte</th>
                </tr>
              </thead>
              <tbody>
                ${filteredClubs.length > 0 ? filteredClubs.map((c, idx) => `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.95rem;">
                    <td style="padding: 10px; font-weight: 700; color: ${idx < 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
                      ${idx + 1}.
                    </td>
                    <td style="padding: 10px; font-weight: 700; color: var(--color-text-primary);">
                      ${c.name} ${c.titles > 0 ? `<span title="${c.titles}x Meister" style="display: inline-flex; align-items: center; gap: 3px; font-size: 0.85rem; color: #f59e0b; margin-left: 6px;">${renderIcon('trophy', { size: 15, color: '#f59e0b' })} ${c.titles > 1 ? c.titles + 'x' : ''}</span>` : ''}
                    </td>
                    <td style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.played}</td>
                    <td style="padding: 10px; text-align: center; font-weight: 600; color: var(--color-text-primary);">${c.won}</td>
                    <td style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.drawn}</td>
                    <td style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.lost}</td>
                    <td style="padding: 10px; text-align: center; color: var(--color-text-secondary);">${c.gf}:${c.ga}</td>
                    <td style="padding: 10px; text-align: center; color: ${c.diff > 0 ? 'var(--color-accent)' : (c.diff < 0 ? '#e74c3c' : 'var(--color-text-secondary)')}; font-weight: 600;">
                      ${c.diff > 0 ? '+' + c.diff : c.diff}
                    </td>
                    <td style="padding: 10px; text-align: center; color: var(--color-accent); font-weight: 600;">${c.winRate}%</td>
                    <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 1.05rem; color: var(--color-accent);">${c.points}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="10" style="text-align: center; padding: 24px; color: var(--color-text-secondary);">Keine Vereine gefunden.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: EHRENTAFEL DER MEISTER -->
      <div id="stats-section-champions" class="stats-section" style="display: ${activeStatsTab === 'champions' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-md);">
          ${stats.seasonHonors.map(h => `
            <div class="glass-card" style="padding: var(--space-lg); border-top: 3px solid var(--color-accent); display: flex; flex-direction: column; gap: var(--space-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; font-size: 1.15rem; color: var(--color-accent);">Saison ${h.season}</span>
                <span>${renderIcon('trophy', { size: 24, color: '#f59e0b' })}</span>
              </div>
              
              <div style="margin-top: 6px; padding: 12px; background: rgba(142, 198, 63, 0.08); border-radius: 6px; border: 1px solid rgba(142, 198, 63, 0.2);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Meister</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-text-primary); margin-top: 2px;">${h.champion}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">${h.championPoints} Punkte &bull; ${h.championPlayed} Spiele</div>
              </div>

              ${h.runnerUp ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px;">
                    ${renderIcon('medal', { size: 15, color: '#94a3b8' })} Vizemeister:
                  </span>
                  <span style="font-weight: 600; color: var(--color-text-primary);">${h.runnerUp} (${h.runnerUpPoints} Pkt)</span>
                </div>
              ` : ''}

              ${h.topScorer && h.topScorer !== 'N/A' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 0;">
                  <span style="color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px;">
                    ${renderIcon('ball', { size: 15, color: 'var(--color-accent)' })} Torschützenkönig:
                  </span>
                  <span style="font-weight: 600; color: var(--color-accent); text-align: right;">${h.topScorer} (${h.topScorerGoals} Tore)</span>
                </div>
              ` : ''}
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
              Erzielt für <strong>${stats.records.bestSingleSeasonScorer.team}</strong> in der Saison <strong>${stats.records.bestSingleSeasonScorer.season}</strong>.
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
                Saison <strong>${stats.records.highestScoringMatch.season}</strong> &bull; ${stats.records.highestScoringMatch.date || 'Meisterschaftsspiel'}
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
                Saison <strong>${stats.records.biggestWin.season}</strong> &bull; Tordifferenz von ${stats.records.biggestWin.diff} Treffern
              </p>
            </div>
          ` : ''}

          <!-- Rekordmeister der Neuzeit -->
          <div class="glass-card" style="padding: var(--space-lg); border-left: 4px solid var(--color-accent);">
            <div style="margin-bottom: 8px;">${renderIcon('trophy', { size: 30, color: '#f59e0b' })}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Rekordmeister (seit 2021)</div>
            <h3 style="font-size: 1.25rem; margin: 4px 0 2px 0;">SV Croatia Linz</h3>
            <div style="font-size: 2rem; font-weight: 800; color: var(--color-accent); margin: 6px 0;">
              3 <span style="font-size: 1rem; font-weight: 600;">Meistertitel</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
              Titelgewinne in den Spielzeiten <strong>2022/2023</strong>, <strong>2024/2025</strong> und <strong>2025/2026</strong>.
            </p>
          </div>

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

  // Tab Switching
  const tabBtns = document.querySelectorAll('.stats-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = btn.getAttribute('data-tab');
      activeStatsTab = tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'none';
        b.style.color = 'var(--color-text-secondary)';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(142, 198, 63, 0.15)';
      btn.style.color = 'var(--color-accent)';

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

  // Scorer Search
  const scorerSearch = document.getElementById('stats-scorer-search');
  scorerSearch?.addEventListener('input', (e) => {
    scorerSearchQuery = e.target.value;
    import('../router.js').then(module => module.Router.handleRoute());
  });

  // Club Search
  const clubSearch = document.getElementById('stats-club-search');
  clubSearch?.addEventListener('input', (e) => {
    clubSearchQuery = e.target.value;
    import('../router.js').then(module => module.Router.handleRoute());
  });
};
