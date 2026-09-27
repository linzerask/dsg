import { Store } from '../store.js';
import { computeAllTimeStats } from './statistiken.js';

const ICONS = {
  ball: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 9 17 15 17 16 12 12 8"></polygon></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  calendarSm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); vertical-align: -2px; margin-right: 4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clockSm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  pinSm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary); vertical-align: -2px; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  trophy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z"></path></svg>`,
  target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  newspaper: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>`,
  handshake: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent); vertical-align: middle;"><path d="m11 17 2 2a1 1 0 0 0 1.42 0l4.58-4.58a1 1 0 0 0 0-1.42l-2-2"></path><path d="m3 11 8.5 8.5a2.12 2.12 0 0 0 3 0l6-6a2.12 2.12 0 0 0 0-3L13 3"></path><path d="m2 16 6-6"></path><path d="m15 3 6 6"></path></svg>`
};

export const viewHome = () => {
  const data = Store.getData();
  const defaultHomeSeason = data.currentSeason || "2026/2027";

  const teams = Store.getLiga(defaultHomeSeason).slice(0, 5);
  const scorers = (Store.getStats(defaultHomeSeason) || { topScorers: [] }).topScorers.slice(0, 4);
  const news = Store.getNews().slice(0, 3);
  const allMatches = Store.getMatches(defaultHomeSeason) || [];
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
  const teamRows = teams.map((t, index) => `
    <div class="table-row">
      <span class="rank" style="font-weight: 700; color: ${index === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; min-width: 20px;">${index + 1}</span>
      <span class="team-name" style="font-weight: 600; flex: 1; margin-left: var(--space-sm); color: var(--color-text-primary);">${t.name}</span>
      <span class="points" style="font-weight: 700; color: var(--color-accent);">${t.points} Pkt</span>
    </div>
  `).join('');

  // Render Top Scorers
  let currentRankHome = 1;
  let prevGoalsHome = -1;
  
  const scorerRows = scorers.map((s, index) => {
    let displayRank = '';
    if (s.goals !== prevGoalsHome) {
      if (prevGoalsHome !== -1) currentRankHome++;
      prevGoalsHome = s.goals;
      displayRank = currentRankHome + '.';
    }
    
    return `
    <div class="table-row">
      <span class="rank" style="min-width: 24px; font-weight: 700; color: ${index === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; display: inline-block;">${displayRank}</span>
      <div style="flex: 1; margin-left: var(--space-sm); display: flex; flex-direction: column;">
        <span class="scorer-name" style="font-weight: 600; color: var(--color-text-primary);">${s.name}</span>
        <span class="team-name" style="color: var(--color-text-secondary); font-size: 0.8rem;">${s.team}</span>
      </div>
      <span class="goals" style="font-weight: 700; color: var(--color-accent);">${s.goals} Tore</span>
    </div>
  `;
  }).join('');

  // Render News
  const newsCards = news.map(n => `
    <a href="#/article/${n.id}" class="glass-card news-card stagger-item" style="display: flex; flex-direction: column; overflow: hidden; text-decoration: none;">
      ${n.image ? `
        <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 4px; margin-bottom: var(--space-sm);">
          <img src="${n.image}" alt="${n.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-fast);">
        </div>
      ` : ''}
      <div style="font-size: 0.75rem; color: var(--color-accent); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">${n.date || ''}</div>
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: var(--space-xs); color: var(--color-text-primary);">${n.title}</h3>
      ${(n.excerpt || (n.content ? n.content.replace(/<[^>]+>/g, ' ').substring(0, 120) + '...' : '')) ? `<p style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-md); flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${n.excerpt || n.content.replace(/<[^>]+>/g, ' ').substring(0, 120) + '...'}</p>` : '<div style="flex-grow: 1;"></div>'}
      <span class="text-btn" style="align-self: flex-start; margin-top: auto; color: var(--color-accent); font-weight: 600;">Mehr lesen &rarr;</span>
    </a>
  `).join('');

  // Render Upcoming Featured Match Banner
  let upcomingMatchHtml = '';
  if (nextMatch) {
    const formattedDate = formatMatchDate(nextMatch.date);
    const loc = nextMatch.location || nextMatch.venue || 'DSG-Platz';
    const roundLabel = nextMatch.round || 'Kommendes Spiel';
    
    upcomingMatchHtml = `
      <div class="upcoming-match banner glass-card stagger-item" style="margin-top: var(--space-xl); text-align: center; border-left: 4px solid var(--color-accent);">
        <div style="display: inline-block; background: rgba(0, 179, 65, 0.12); border: 1px solid rgba(0, 179, 65, 0.35); color: var(--color-accent); font-weight: 700; font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; margin-bottom: var(--space-xs); text-transform: uppercase; letter-spacing: 0.5px;">
          ${roundLabel} &bull; Topspiel
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: var(--space-lg); margin-top: var(--space-sm); flex-wrap: wrap;">
          <h3 style="font-size: clamp(1.2rem, 3vw, 1.7rem); font-weight: 700; margin: 0; color: var(--color-text-primary);">${nextMatch.home}</h3>
          <span style="font-size: 1.1rem; font-weight: 900; color: var(--color-accent); background: rgba(0,0,0,0.04); padding: 4px 12px; border-radius: 6px;">VS</span>
          <h3 style="font-size: clamp(1.2rem, 3vw, 1.7rem); font-weight: 700; margin: 0; color: var(--color-text-primary);">${nextMatch.away}</h3>
        </div>
        <p style="margin-top: var(--space-sm); color: var(--color-text-secondary); font-size: 0.95rem; font-weight: 500; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 16px;">
          <span>${ICONS.calendarSm}${formattedDate}</span>
          ${nextMatch.time ? `<span>${ICONS.clockSm}${nextMatch.time} Uhr</span>` : ''}
          <span>${ICONS.pinSm}${loc}</span>
        </p>
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
            <span style="font-weight: 600; font-size: 0.95rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.home}</span>
            <span style="font-weight: 700; font-size: ${isResult ? '1rem' : '0.85rem'}; color: ${isCanceled ? '#e74c3c' : (isResult ? 'var(--color-accent)' : 'var(--color-text-secondary)')}; margin-left: 8px; flex-shrink: 0;">
              ${isCanceled ? m.status : (isResult ? m.score : (m.time ? `${m.time} Uhr` : '-:-'))}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 0.95rem; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.away}</span>
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
        <h1 class="hero-title" style="color: var(--color-text-inverse);">DSG Fussball<span class="mobile-break">-<br></span>meisterschaft</h1>
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
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-lg);">
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">DSG Liga in Zahlen</div>
            <h2 style="font-size: 1.6rem; margin: 4px 0 0 0; color: var(--color-text-primary);">Statistiken & Rekorde</h2>
          </div>
          <a href="#/statistiken" class="primary-btn" style="padding: 9px 20px; font-size: 0.9rem; text-decoration: none;">
            Zur gesamten Statistik & Hall of Fame &rarr;
          </a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-md); text-align: center;">
          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="font-size: 1.8rem; margin-bottom: 2px;">⚽</div>
            <div class="home-stat-number" data-target="${allTimeStats.totalGoals}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Tore gesamt</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Ø ${allTimeStats.goalsPerMatch} / Spiel</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="font-size: 1.8rem; margin-bottom: 2px;">🏟️</div>
            <div class="home-stat-number" data-target="${allTimeStats.totalMatches}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Gespielte Partien</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Seit 2021/2022</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="font-size: 1.8rem; margin-bottom: 2px;">🏃</div>
            <div class="home-stat-number" data-target="${allTimeStats.uniquePlayersCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Torschützen</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Eingetragene Torschützen</div>
          </div>

          <div style="padding: var(--space-md) var(--space-sm); background: rgba(0,0,0,0.03); border-radius: 8px;">
            <div style="font-size: 1.8rem; margin-bottom: 2px;">🏆</div>
            <div class="home-stat-number" data-target="${allTimeStats.seasonsCount}" style="font-size: 2.2rem; font-weight: 800; color: var(--color-accent); line-height: 1.1;">0</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-top: 4px;">Saisons</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">Digital dokumentiert</div>
          </div>
        </div>

        <div style="margin-top: var(--space-md); text-align: center; font-size: 0.78rem; color: var(--color-text-secondary); opacity: 0.85;">
          * Sämtliche Statistiken und Rekorde basieren auf den digital erfassten Spielberichten seit Beginn der Aufzeichnungen in der Saison 2021/2022.
        </div>
      </div>

      ${upcomingMatchHtml}

      <!-- Match Center: Recent Results & Upcoming Fixtures -->
      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>${ICONS.ball}</span> Letzte Ergebnisse
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Saison ${defaultHomeSeason}</span>
          </div>
          <div class="table-container">
            ${resultsHtml}
          </div>
          <div style="margin-top: var(--space-md); text-align: right;">
            <a href="#/liga" class="text-btn">Alle Spielberichte &rarr;</a>
          </div>
        </div>

        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>${ICONS.calendar}</span> Nächste Spiele
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Spielplan</span>
          </div>
          <div class="table-container">
            ${fixturesHtml}
          </div>
          <div style="margin-top: var(--space-md); text-align: right;">
            <a href="#/liga" class="text-btn">Gesamter Spielplan &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Stats Grid: Table & Scorers -->
      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>${ICONS.trophy}</span> Top 5 Tabelle
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
              <span>${ICONS.target}</span> Torschützen
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Top Scorer</span>
          </div>
          <div class="table-container">
            ${scorerRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/statistiken" class="text-btn">Alle Statistiken &rarr;</a>
          </div>
        </div>
      </div>

      <!-- News Section -->
      <div class="news-section stagger-item" style="margin-top: var(--space-xl);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: var(--space-md);">
          <span>${ICONS.newspaper}</span>
          <h2 style="font-size: 2rem; margin: 0;">Aktuelle Nachrichten</h2>
        </div>
        <div class="news-carousel">
          ${newsCards}
        </div>
      </div>
      
      <!-- Sponsor Marquee -->
      <div class="marquee-container stagger-item" style="margin-top: var(--space-xl); margin-bottom: var(--space-xl);">
        <h3 style="text-align: center; color: var(--color-text-secondary); margin-bottom: var(--space-md); display: flex; justify-content: center; align-items: center; gap: 8px;">
          <span>${ICONS.handshake}</span> Offizielle Partner
        </h3>
        <div class="marquee">
          <div class="marquee-content">
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
          </div>
          <div class="marquee-content" aria-hidden="true">
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
            <img src="dsg.avif" alt="Sponsor" />
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
};
