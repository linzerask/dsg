import { Store, sortLeaguesByPriority, sanitizeMojibake } from '../store.js?v=1791182000000';
import { computeAllTimeStats } from './statistiken.js?v=1791182000000';
import { renderIcon } from '../icons.js?v=1791182000000';
import { renderTeamLogo, renderNewsFallbackHeader } from '../logos.js?v=1791182000000';
import { getPlayerLink } from '../playerUtils.js?v=1791182000000';

export const viewHome = () => {
  const data = Store.getData();
  const leagues = Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : [];
  const visibleLeagues = sortLeaguesByPriority((leagues || []).filter(l => l.showOnHomepage !== false));
  const currentLeague = visibleLeagues.find(l => l.isCurrent) || visibleLeagues[0] || null;
  const defaultHomeSeason = currentLeague ? (currentLeague.seasonKey || currentLeague.name) : null;

  const rawTeams = defaultHomeSeason ? (Store.getLiga(defaultHomeSeason) || []) : [];
  const sortedTeams = [...rawTeams].sort((a, b) => {
    const ptsA = Number(a.points) || 0;
    const ptsB = Number(b.points) || 0;
    if (ptsB !== ptsA) return ptsB - ptsA;

    const diffA = (a.goalDiff !== undefined && !isNaN(Number(a.goalDiff))) ? Number(a.goalDiff) : ((a.diff !== undefined && !isNaN(Number(a.diff))) ? Number(a.diff) : ((Number(a.gf !== undefined ? a.gf : (a.goalsFor || 0))) - (Number(a.ga !== undefined ? a.ga : (a.goalsAgainst || 0)))));
    const diffB = (b.goalDiff !== undefined && !isNaN(Number(b.goalDiff))) ? Number(b.goalDiff) : ((b.diff !== undefined && !isNaN(Number(b.diff))) ? Number(b.diff) : ((Number(b.gf !== undefined ? b.gf : (b.goalsFor || 0))) - (Number(b.ga !== undefined ? b.ga : (b.goalsAgainst || 0)))));
    if (diffB !== diffA) return diffB - diffA;

    const gfA = Number(a.gf !== undefined ? a.gf : (a.goalsFor || 0));
    const gfB = Number(b.gf !== undefined ? b.gf : (b.goalsFor || 0));
    return gfB - gfA;
  });
  const teams = sortedTeams.slice(0, 5);

  const rawScorers = defaultHomeSeason ? ((Store.getStats(defaultHomeSeason) || { topScorers: [] }).topScorers || []) : [];
  const sortedScorers = [...rawScorers].sort((a, b) => (b.goals || 0) - (a.goals || 0));
  const scorers = sortedScorers.slice(0, 5);

  const news = Store.getNews().slice(0, 3);
  const allMatches = defaultHomeSeason ? (Store.getMatches(defaultHomeSeason) || []) : [];
  const allTimeStats = computeAllTimeStats();

  // Helper: Format Dates safely (YYYY-MM-DD or DD.MM.YYYY)
  const formatMatchDate = (dateStr) => {
    if (!dateStr) return '';
    const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const day = !isNaN(d.getDay()) ? `${days[d.getDay()]}, ` : '';
        return `${day}${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    } else if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const d = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        const day = !isNaN(d.getDay()) ? `${days[d.getDay()]}, ` : '';
        return `${day}${parts[0]}.${parts[1]}.${year}`;
      }
    }
    return dateStr;
  };

  // Helper: Parse Date & Time to Timestamp for accurate sorting
  const parseMatchDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 0;
    let year = 1970, month = 0, day = 1;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0]) || 1970;
        month = (parseInt(parts[1]) || 1) - 1;
        day = parseInt(parts[2]) || 1;
      }
    } else if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        day = parseInt(parts[0]) || 1;
        month = (parseInt(parts[1]) || 1) - 1;
        year = parseInt(parts[2]) || 1970;
        if (year < 100) year += 2000;
      }
    }

    let hours = 12, minutes = 0;
    if (timeStr) {
      const cleanTime = String(timeStr).replace(/[^\d:]/g, '');
      const tParts = cleanTime.split(':');
      if (tParts.length >= 2) {
        hours = parseInt(tParts[0]) || 0;
        minutes = parseInt(tParts[1]) || 0;
      }
    }

    return new Date(year, month, day, hours, minutes).getTime();
  };

  // Filter Played and Upcoming matches
  const playedMatches = allMatches.filter(m => 
    m.status === 'Played' || 
    (m.status && m.status.startsWith('Abgesagt')) || 
    (m.score && m.score !== '-:-' && m.score !== '- : -')
  );
  
  const upcomingMatches = allMatches.filter(m => 
    m.status === 'Upcoming' || 
    !m.score || 
    m.score === '-:-' || 
    m.score === '- : -'
  );

  // Sort upcoming matches ascending by date & time (earliest first)
  const sortedUpcomingMatches = [...upcomingMatches].sort((a, b) => {
    const timeA = parseMatchDateTime(a.date, a.time);
    const timeB = parseMatchDateTime(b.date, b.time);
    if (timeA !== timeB) return timeA - timeB;
    const rA = parseInt(String(a.round || '').replace(/\D/g, '')) || 0;
    const rB = parseInt(String(b.round || '').replace(/\D/g, '')) || 0;
    return rA - rB;
  });

  // Sort played matches descending by date & time (most recent first)
  const sortedPlayedMatches = [...playedMatches].sort((a, b) => {
    const timeA = parseMatchDateTime(a.date, a.time);
    const timeB = parseMatchDateTime(b.date, b.time);
    if (timeA !== timeB) return timeB - timeA;
    const rA = parseInt(String(a.round || '').replace(/\D/g, '')) || 0;
    const rB = parseInt(String(b.round || '').replace(/\D/g, '')) || 0;
    return rB - rA;
  });

  // Next Featured Match
  const nextMatch = sortedUpcomingMatches[0] || null;

  // Next upcoming fixtures (up to 4)
  const nextFixtures = sortedUpcomingMatches.slice(0, 4);

  // Recent results (last 4 played)
  const recentResults = sortedPlayedMatches.slice(0, 4);

  // Render Top 5 Teams
  const teamRows = teams.length > 0 ? teams.map((t, index) => {
    const gf = Number(t.gf !== undefined ? t.gf : (t.goalsFor || 0));
    const ga = Number(t.ga !== undefined ? t.ga : (t.goalsAgainst || 0));
    const diff = (t.goalDiff !== undefined && !isNaN(Number(t.goalDiff))) ? Number(t.goalDiff) : ((t.diff !== undefined && !isNaN(Number(t.diff))) ? Number(t.diff) : (gf - ga));
    const diffStr = diff > 0 ? '+' + diff : diff;
    return `
    <div class="table-row has-home-accordion" style="display: flex; flex-direction: column; cursor: pointer; transition: background 0.2s; padding: 10px 12px; border-radius: 6px; margin-bottom: 4px; border: 1px solid transparent;">
      <div style="display: flex; align-items: center; width: 100%;">
        <span class="rank" style="font-weight: 700; color: ${index === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; min-width: 22px;">${index + 1}</span>
        <div class="team-name" style="font-weight: 600; flex: 1; margin-left: var(--space-sm); color: var(--color-text-primary); display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden;">
          <a href="#/teams?team=${encodeURIComponent(t.name)}" class="team-logo-link" title="${t.name} Vereinsseite" onclick="event.stopPropagation();">
            ${renderTeamLogo(t.name, 'sm')}
          </a>
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 8px;">
          <span class="points" style="font-weight: 700; color: var(--color-accent);">${t.points} Pkt</span>
          <svg class="home-accordion-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      <div class="home-table-accordion-body" style="display: none; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center;">
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Spiele</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${t.played || 0}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Siege</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${t.won || 0}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Unent.</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${t.drawn || 0}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Nied.</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${t.lost || 0}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Tore</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${gf}:${ga}</div></div>
          <div><div style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-text-secondary);">Diff</div><div style="font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem;">${diffStr}</div></div>
        </div>
      </div>
    </div>
  `;
  }).join('') : '<p style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 12px 0; text-align: center;">Noch keine Tabellendaten vorhanden.</p>';

  // Render Top Scorers
  let currentRankHome = 1;
  let prevGoalsHome = -1;
  
  const scorerRows = scorers.length > 0 ? scorers.map((s, index) => {
    let displayRank = '';
    if (s.goals !== prevGoalsHome) {
      if (prevGoalsHome !== -1) currentRankHome++;
      prevGoalsHome = s.goals;
      displayRank = currentRankHome + '.';
    }
    
    const playerName = s.player || s.name || '';
    const playerLink = getPlayerLink(playerName, s.team);

    return `
    <div class="table-row">
      <span class="rank" style="min-width: 24px; font-weight: 700; color: ${index === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: inline-block;">${displayRank}</span>
      <div style="flex: 1; margin-left: var(--space-sm); display: flex; flex-direction: column; min-width: 0;">
        <a href="${playerLink}" class="player-link scorer-name" style="font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block;">${playerName}</a>
        <div class="team-name" style="color: var(--color-text-secondary); font-size: 0.8rem; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
          <a href="#/teams?team=${encodeURIComponent(s.team || '')}" class="team-logo-link" title="${s.team || ''} Vereinsseite" onclick="event.stopPropagation();">
            ${renderTeamLogo(s.team, 'xs')}
          </a>
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.team || ''}</span>
        </div>
      </div>
      <span class="goals" style="font-weight: 700; color: var(--color-accent); flex-shrink: 0; margin-left: 8px;">${s.goals} Tore</span>
    </div>
  `;
  }).join('') : '<p style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 12px 0; text-align: center;">Noch keine Torschützen vorhanden.</p>';

  // Render News
  const newsCards = news.map(n => {
    const hasImage = n.image && n.image.trim() !== '' && n.image !== 'dsg.avif';
    return `
    <a href="#/article/${n.id}" class="glass-card news-card stagger-item" style="display: flex; flex-direction: column; overflow: hidden; text-decoration: none;">
      ${hasImage ? `
        <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 4px; margin-bottom: var(--space-sm);">
          <img src="${n.image}" alt="${n.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-fast);">
        </div>
      ` : renderNewsFallbackHeader('NEWSLETTER')}
      <div style="font-size: 0.75rem; color: var(--color-accent); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">${n.date || ''}</div>
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: var(--space-xs); color: var(--color-text-primary);">${n.title}</h3>
      ${(n.excerpt || (n.content ? n.content.replace(/<[^>]+>/g, ' ').substring(0, 120) + '...' : '')) ? `<p style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-md); flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${n.excerpt || n.content.replace(/<[^>]+>/g, ' ').substring(0, 120) + '...'}</p>` : '<div style="flex-grow: 1;"></div>'}
      <span class="text-btn" style="align-self: flex-start; margin-top: auto; color: var(--color-accent); font-weight: 600;">Mehr lesen &rarr;</span>
    </a>
  `;
  }).join('');

  // Render Upcoming Featured Match Banner
  let upcomingMatchHtml = '';
  if (nextMatch) {
    const formattedDate = formatMatchDate(nextMatch.date);
    const loc = nextMatch.location || nextMatch.venue || 'DSG-Platz';
    const roundLabel = nextMatch.round || 'Kommendes Spiel';
    
    upcomingMatchHtml = `
      <div class="upcoming-match banner glass-card stagger-item">
        <div class="topspiel-badge">
          ${roundLabel} &bull; Topspiel
        </div>
        <div class="topspiel-teams">
          <div class="topspiel-team home-team">
            <h3 class="topspiel-team-name">${nextMatch.home}</h3>
            <a href="#/teams?team=${encodeURIComponent(nextMatch.home)}" class="team-logo-link" title="${nextMatch.home} Vereinsseite">
              ${renderTeamLogo(nextMatch.home, 'lg')}
            </a>
          </div>
          <span class="topspiel-vs">VS</span>
          <div class="topspiel-team away-team">
            <a href="#/teams?team=${encodeURIComponent(nextMatch.away)}" class="team-logo-link" title="${nextMatch.away} Vereinsseite">
              ${renderTeamLogo(nextMatch.away, 'lg')}
            </a>
            <h3 class="topspiel-team-name">${nextMatch.away}</h3>
          </div>
        </div>
        <div class="topspiel-meta">
          <div class="topspiel-meta-row topspiel-datetime">
            <span class="meta-item">${renderIcon('calendar', { size: 15, color: 'var(--color-text-secondary)' })}${formattedDate}</span>
            ${nextMatch.time ? `<span class="meta-item">${renderIcon('clock', { size: 15, color: 'var(--color-text-secondary)' })}${nextMatch.time} Uhr</span>` : ''}
          </div>
          <div class="topspiel-meta-row topspiel-location">
            <span class="meta-item">${renderIcon('pin', { size: 15, color: 'var(--color-text-secondary)' })}${loc}</span>
          </div>
        </div>
        <div class="topspiel-action">
          <a href="#/liga?tab=spiele" class="text-btn" style="font-weight: 700;">Zum Spieltag &rarr;</a>
        </div>
      </div>
    `;
  }

  // Render Match Center Rows
  const renderMatchRow = (m, isResult = false) => {
    const formattedDate = formatMatchDate(m.date);
    const isCanceled = (m.status || '').toLowerCase().includes('abgesagt');
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--color-border); gap: 10px;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.95rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <a href="#/teams?team=${encodeURIComponent(m.home)}" class="team-logo-link" title="${m.home} Vereinsseite" onclick="event.stopPropagation();">
                ${renderTeamLogo(m.home, 'xs')}
              </a>
              <span style="overflow: hidden; text-overflow: ellipsis;">${m.home}</span>
            </div>
            <span style="font-weight: 700; font-size: ${isResult ? '1rem' : '0.85rem'}; color: ${isCanceled ? '#e74c3c' : (isResult ? 'var(--color-accent)' : 'var(--color-text-secondary)')}; margin-left: 8px; flex-shrink: 0;">
              ${isCanceled ? m.status : (isResult ? (m.score ? m.score.replace(/\s*\([^)]*\)/g, '').trim() : '-:-') : (m.time ? `${m.time} Uhr` : '-:-'))}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.95rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <a href="#/teams?team=${encodeURIComponent(m.away)}" class="team-logo-link" title="${m.away} Vereinsseite" onclick="event.stopPropagation();">
                ${renderTeamLogo(m.away, 'xs')}
              </a>
              <span style="overflow: hidden; text-overflow: ellipsis;">${m.away}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--color-text-secondary); flex-shrink: 0; margin-left: 8px;">${formattedDate}</span>
          </div>
        </div>
      </div>
    `;
  };

  const resultsHtml = recentResults.length > 0
    ? recentResults.map(m => renderMatchRow(m, true)).join('')
    : '<p style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 10px 0;">Noch keine Ergebnisse vorhanden.</p>';

  const fixturesHtml = nextFixtures.length > 0
    ? nextFixtures.map(m => renderMatchRow(m, false)).join('')
    : '<p style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 10px 0;">Keine ausstehenden Spiele.</p>';

  return `
    <div class="hero-section stagger-item">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title" style="color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">DSG Fussball<span class="mobile-break">-<br></span>meisterschaft</h1>
        <p class="hero-subtitle" style="color: rgba(255, 255, 255, 0.95); margin-top: var(--space-md); font-size: 1.2rem; max-width: 600px;">
          Willkommen auf der Homepage der DSG-Fussballmeisterschaft Oberösterreich.<br><br>
          Wir freuen uns, euch hier begrüßen zu dürfen.<br><br>
          Hier findet ihr alle aktuellen Ergebnisse, Tabellen und Spielberichte.
        </p>
        <a href="#/liga" class="primary-btn stagger-item" style="margin-top: var(--space-lg); display: inline-block;">Liga & Spielberichte</a>
      </div>
    </div>

    <div class="container">
      <!-- Count-Up Stats Section -->
      <div class="stats-counter-section stagger-item glass-card" style="margin-top: var(--space-xl); padding: var(--space-lg) var(--space-xl); border-top: 3px solid var(--color-accent);">
        <div class="stats-header-row" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-lg);">
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">DSG Liga in Zahlen</div>
            <h2 style="font-size: 1.6rem; margin: 4px 0 0 0; color: var(--color-text-primary);">Statistiken & Rekorde</h2>
          </div>
          <a href="#/statistiken" class="primary-btn stats-header-btn" style="padding: 9px 20px; font-size: 0.9rem; text-decoration: none;">
            Zur Statistik &rarr;
          </a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-md); text-align: center;">
          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('ball', { size: 28, color: 'var(--color-accent)' })}</div>
            <div class="home-stat-number" data-target="${allTimeStats.totalGoals}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Tore gesamt</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Ø ${allTimeStats.goalsPerMatch} / Spiel</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('stadium', { size: 28, color: 'var(--color-accent)' })}</div>
            <div class="home-stat-number" data-target="${allTimeStats.totalMatches}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Gespielte Partien</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Seit 2022/2023</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('run', { size: 28, color: 'var(--color-accent)' })}</div>
            <div class="home-stat-number" data-target="${allTimeStats.uniquePlayersCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Torschützen</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Eingetragene Torschützen</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${renderIcon('trophy', { size: 28, color: 'var(--color-accent)' })}</div>
            <div class="home-stat-number" data-target="${allTimeStats.seasonsCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Saisons</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Digital dokumentiert</div>
          </div>
        </div>

        <div class="stats-mobile-footer-btn" style="margin-top: var(--space-lg); text-align: center;">
          <a href="#/statistiken" class="primary-btn" style="padding: 10px 24px; font-size: 0.95rem; text-decoration: none;">
            Zur gesamten Statistik &rarr;
          </a>
        </div>

        <div style="margin-top: var(--space-md); text-align: center; font-size: 0.78rem; color: var(--color-text-secondary); opacity: 0.85;">
          * Sämtliche Statistiken und Rekorde basieren auf den digital erfassten Spielberichten seit Beginn der Aufzeichnungen in der Saison 2022/2023.
        </div>
      </div>

      ${upcomingMatchHtml}

      <!-- Match Center: Recent Results & Upcoming Fixtures -->
      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${renderIcon('ball', { size: 20, color: 'var(--color-accent)' })} Letzte Ergebnisse
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Saison ${defaultHomeSeason}</span>
          </div>
          <div class="table-container">
            ${resultsHtml}
          </div>
          <div style="margin-top: var(--space-md); text-align: right;">
            <a href="#/liga?tab=spiele" class="text-btn">Alle Spielberichte &rarr;</a>
          </div>
        </div>

        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${renderIcon('calendar', { size: 20, color: 'var(--color-accent)' })} Nächste Spiele
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Spielplan</span>
          </div>
          <div class="table-container">
            ${fixturesHtml}
          </div>
          <div style="margin-top: var(--space-md); text-align: right;">
            <a href="#/liga?tab=spiele" class="text-btn">Gesamter Spielplan &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Stats Grid: Table & Scorers -->
      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${renderIcon('table', { size: 20, color: 'var(--color-accent)' })} Top 5 Tabelle
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Saison ${defaultHomeSeason}</span>
          </div>
          <div class="table-container">
            ${teamRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/liga" class="text-btn">Zur gesamten Tabelle &rarr;</a>
          </div>
        </div>

        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${renderIcon('target', { size: 20, color: 'var(--color-accent)' })} Torschützen
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Top Scorer</span>
          </div>
          <div class="table-container">
            ${scorerRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/liga?tab=stats" class="text-btn">Zu den Statistiken &rarr;</a>
          </div>
        </div>
      </div>

      <!-- News Section -->
      <div class="news-section stagger-item" style="margin-top: var(--space-xl);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-md);">
          ${renderIcon('newspaper', { size: 24, color: 'var(--color-accent)' })}
          <h2 style="font-size: 2rem; margin: 0;">Aktuelle Nachrichten</h2>
        </div>
        <div class="news-carousel">
          ${newsCards}
        </div>
      </div>
      
      <!-- Sponsor Marquee -->
      <div class="marquee-container stagger-item" style="margin-top: var(--space-xl); margin-bottom: var(--space-xl);">
        <h3 style="text-align: center; color: var(--color-text-secondary); margin-bottom: var(--space-md); display: flex; justify-content: center; align-items: center; gap: 8px;">
          ${renderIcon('badgeCheck', { size: 22, color: 'var(--color-accent)' })} Offizielle Partner
        </h3>
        <div class="marquee">
          <div class="marquee-content">
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" title="AnonymCreator - Digitalstudio">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" title="AnonymCreator - Digitalstudio">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" title="AnonymCreator - Digitalstudio">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" title="AnonymCreator - Digitalstudio">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
          </div>
          <div class="marquee-content" aria-hidden="true">
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" tabindex="-1">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" tabindex="-1">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" tabindex="-1">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
            <img src="dsg.avif" alt="DSG Diözesansportgemeinschaft" />
            <a href="https://anonymcreator.online" target="_blank" rel="noopener noreferrer" class="marquee-partner-link" tabindex="-1">
              <img src="ac_black.png" alt="AnonymCreator" />
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const bindHome = () => {
  const counters = document.querySelectorAll('.home-stat-number');
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

  // Top 5 Table Accordions (Expand/collapse on click)
  const homeTableRows = document.querySelectorAll('.has-home-accordion');
  homeTableRows.forEach(row => {
    row.addEventListener('click', () => {
      const body = row.querySelector('.home-table-accordion-body');
      const chevron = row.querySelector('.home-accordion-chevron');
      if (body) {
        const isVisible = body.style.display === 'block';
        body.style.display = isVisible ? 'none' : 'block';
        if (chevron) chevron.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        if (!isVisible && typeof anime !== 'undefined') {
          anime({
            targets: body,
            opacity: [0, 1],
            translateY: [-6, 0],
            duration: 250,
            easing: 'easeOutQuad'
          });
        }
      }
    });
  });
};

