import { Store } from '../store.js';

export const viewHome = () => {
  const data = Store.getData();
  let defaultHomeSeason = data.currentSeason || "2026/2027";

  const teams = Store.getLiga(defaultHomeSeason).slice(0, 5);
  const scorers = (Store.getStats(defaultHomeSeason) || { topScorers: [] }).topScorers.slice(0, 4);
  const news = Store.getNews().slice(0, 3);

  const teamRows = teams.map((t, index) => `
    <div class="table-row">
      <span class="rank">${index + 1}</span>
      <span class="team-name" style="font-weight: 600; flex: 1; margin-left: var(--space-sm);">${t.name}</span>
      <span class="points" style="font-weight: 700; color: var(--color-accent);">${t.points} Pkt</span>
    </div>
  `).join('');

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
      <span class="rank" style="min-width: 20px; display: inline-block;">${displayRank}</span>
      <div style="flex: 1; margin-left: var(--space-sm); display: flex; flex-direction: column;">
        <span class="scorer-name" style="font-weight: 600;">${s.name}</span>
        <span class="team-name" style="color: var(--color-text-secondary); font-size: 0.8rem;">${s.team}</span>
      </div>
      <span class="goals" style="font-weight: 700; color: var(--color-accent);">${s.goals} Tore</span>
    </div>
  `;
  }).join('');

  const newsCards = news.map(n => `
    <a href="#/article/${n.id}" class="glass-card news-card stagger-item" style="display: flex; flex-direction: column;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: var(--space-xs);">${n.title}</h3>
      <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-bottom: var(--space-sm);">${n.date} | ${n.author}</p>
      ${n.excerpt ? `<p style="color: var(--color-text-primary); font-size: 0.95rem; margin-bottom: var(--space-md); flex-grow: 1;">${n.excerpt}</p>` : '<div style="flex-grow: 1;"></div>'}
      <span class="text-btn" style="align-self: flex-start; margin-top: auto;">Mehr lesen &rarr;</span>
    </a>
  `).join('');

  let upcomingMatchHtml = '';
  const allMatches = Store.getMatches(defaultHomeSeason);
  const nextMatch = allMatches.find(m => m.status === 'Upcoming');
  if (nextMatch) {
    const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
    const dateParts = nextMatch.date ? nextMatch.date.split('.') : [];
    let dayName = '';
    if (dateParts.length === 3) {
      let year = parseInt(dateParts[2]); if (year < 100) year += 2000; const d = new Date(year, dateParts[1] - 1, dateParts[0]);
      if (!isNaN(d.getDay())) dayName = days[d.getDay()] + ', ';
    }
    
    upcomingMatchHtml = `
      <div class="upcoming-match banner glass-card stagger-item" style="margin-top: var(--space-xl); text-align: center;">
        <h2 style="font-size: 1.5rem; color: var(--color-accent);">Kommendes Topspiel</h2>
        <div style="display: flex; justify-content: center; align-items: center; gap: var(--space-lg); margin-top: var(--space-md); flex-wrap: wrap;">
          <h3 style="font-size: 1.8rem; font-weight: 700;">${nextMatch.home}</h3>
          <span style="font-size: 1.2rem; font-weight: 900; color: var(--color-text-secondary);">VS</span>
          <h3 style="font-size: 1.8rem; font-weight: 700;">${nextMatch.away}</h3>
        </div>
        <p style="margin-top: var(--space-sm); color: var(--color-text-secondary);">${dayName}${nextMatch.date}${nextMatch.time ? ' | ' + nextMatch.time + ' Uhr' : ''}${nextMatch.venue ? ' | ' + nextMatch.venue : ''}</p>
      </div>
    `;
  }

  return `
    <div class="hero-section stagger-item">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title" style="color: var(--color-text-inverse);">DSG Fussball<span class="mobile-break">-<br></span>meisterschaft</h1>
        <p class="hero-subtitle" style="color: rgba(255, 255, 255, 0.95); margin-top: var(--space-md); font-size: 1.2rem; max-width: 600px;">
          Willkommen auf der Homepage der DSG-Fussballmeisterschaft Oberösterreich.<br><br>
          Wir freuen uns, euch hier begrüßen zu dürfen.<br><br>
          Hier findet ihr alle Informationen rund um das Thema DSG Fussball.
        </p>
        <a href="#/liga" class="primary-btn stagger-item" style="margin-top: var(--space-lg); display: inline-block;">Liga entdecken</a>
      </div>
    </div>

    <div class="container">
      ${upcomingMatchHtml}

      <div class="stats-grid stagger-item" style="margin-top: var(--space-xl);">
        <div class="glass-card stagger-item">
          <h2 style="margin-bottom: var(--space-md); font-size: 1.5rem;">Top 5 Tabelle</h2>
          <div class="table-container">
            ${teamRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/liga" class="text-btn">Zur gesamten Tabelle &rarr;</a>
          </div>
        </div>

        <div class="glass-card stagger-item">
          <h2 style="margin-bottom: var(--space-md); font-size: 1.5rem;">Torschützenkönige</h2>
          <div class="table-container">
            ${scorerRows}
          </div>
          <div style="margin-top: var(--space-lg); text-align: right;">
            <a href="#/liga?tab=stats" class="text-btn">Alle Statistiken &rarr;</a>
          </div>
        </div>
      </div>

      <div class="news-section stagger-item" style="margin-top: var(--space-xl);">
        <h2 style="margin-bottom: var(--space-md); font-size: 2rem;">Aktuelle Nachrichten</h2>
        <div class="news-carousel">
          ${newsCards}
        </div>
      </div>
      
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

