import { Store } from '../store.js';

export const viewHome = () => {
  const data = Store.getData();
  const defaultHomeSeason = data.currentSeason || "2026/2027";

  const teams = Store.getLiga(defaultHomeSeason).slice(0, 5);
  const scorers = (Store.getStats(defaultHomeSeason) || { topScorers: [] }).topScorers.slice(0, 4);
  const news = Store.getNews().slice(0, 3);
  const allMatches = Store.getMatches(defaultHomeSeason) || [];

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

  // Next Featured Match
  const nextMatch = upcomingMatches[0] || null;

  // Next upcoming fixtures (up to 4)
  const nextFixtures = upcomingMatches.slice(0, 4);

  // Recent results (last 4 played)
  const recentResults = [...playedMatches].slice(-4).reverse();

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
    <a href="#/article/${n.id}" class="glass-card news-card stagger-item" style="display: flex; flex-direction: column;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: var(--space-xs); color: var(--color-text-primary);">${n.title}</h3>
      <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-bottom: var(--space-sm);">${n.date} | ${n.author}</p>
      ${n.excerpt ? `<p style="color: var(--color-text-secondary); font-size: 0.95rem; margin-bottom: var(--space-md); flex-grow: 1;">${n.excerpt}</p>` : '<div style="flex-grow: 1;"></div>'}
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
        <p style="margin-top: var(--space-sm); color: var(--color-text-secondary); font-size: 0.95rem; font-weight: 500;">
          📅 ${formattedDate}${nextMatch.time ? ' | ⏰ ' + nextMatch.time + ' Uhr' : ''} | 📍 ${loc}
        </p>
      </div>
    `;
  }

  // Render Match Center Rows
  const renderMatchRow = (m, isResult = false) => {
    const formattedDate = formatMatchDate(m.date);
    const loc = m.location || m.venue || 'DSG-Platz';
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
      ${upcomingMatchHtml}

      <!-- Match Center: Recent Results & Upcoming Fixtures -->
      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
            <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>⚽</span> Letzte Ergebnisse
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
              <span>📅</span> Nächste Spiele
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
              <span>🏆</span> Top 5 Tabelle
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
              <span>🎯</span> Torschützen
            </h2>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">Top Scorer</span>
          </div>
          <div class="table-container">
            ${scorerRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/liga" class="text-btn">Alle Statistiken &rarr;</a>
          </div>
        </div>
      </div>

      <!-- News Section -->
      <div class="news-section stagger-item" style="margin-top: var(--space-xl);">
        <h2 style="margin-bottom: var(--space-md); font-size: 2rem;">Aktuelle Nachrichten</h2>
        <div class="news-carousel">
          ${newsCards}
        </div>
      </div>
      
      <!-- Sponsor Marquee -->
      <div class="marquee-container stagger-item" style="margin-top: var(--space-xl); margin-bottom: var(--space-xl);">
        <h3 style="text-align: center; color: var(--color-text-secondary); margin-bottom: var(--space-md);">Offizielle Partner</h3>
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
