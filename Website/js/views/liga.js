import { Store } from '../store.js?v=1790560000008';


let currentViewSeason = null;

export function viewLiga() {
  const data = Store.getData();
  const leagues = Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : [];
  const currentLeague = leagues.find(l => l.isCurrent) || leagues[0];
  const defaultSeason = currentLeague ? (currentLeague.seasonKey || currentLeague.name) : "2026/2027";

  let visibleItems = Store.getVisibleSeasonItems ? Store.getVisibleSeasonItems() : [];
  if (!visibleItems || visibleItems.length === 0) {
    if (leagues && leagues.length > 0) {
      visibleItems = leagues.map(l => {
        const key = l.seasonKey || l.name;
        let name = (l.name || key).trim();
        let year = l.year ? String(l.year).trim() : '';
        if (!year && key) {
          const match = key.match(/\d{4}(\/\d{4})?/);
          if (match) year = match[0];
        }
        if (/^\d{4}$/.test(year)) {
          const nextY = parseInt(year) + 1;
          year = `${year}/${nextY}`;
        }
        if (year && !name.includes(year)) {
          name = `${name} ${year}`;
        } else if (!year && /^\d{4}\/\d{4}$/.test(name)) {
          name = `Saison ${name}`;
        }
        return { key, label: name };
      });
    } else if (data && data.seasons) {
      visibleItems = Object.keys(data.seasons).map(s => ({
        key: s,
        label: s.includes('2026/2027') ? 'Liga 2026/2027' : (s.startsWith('Saison') || s.startsWith('Liga') ? s : `Saison ${s}`)
      }));
    } else {
      visibleItems = [
        { key: "2026/2027", label: "Liga 2026/2027" },
        { key: "2025/2026", label: "Saison 2025/2026" },
        { key: "2024/2025", label: "Saison 2024/2025" },
        { key: "2023/2024", label: "Saison 2023/2024" },
        { key: "2022/2023", label: "Saison 2022/2023" }
      ];
    }
  }

  const visibleSeasonKeys = visibleItems.map(i => i.key);
  if (!currentViewSeason || !visibleSeasonKeys.includes(currentViewSeason)) {
    currentViewSeason = defaultSeason;
  }
  const currentSeason = currentViewSeason;
  const currentItem = visibleItems.find(i => i.key === currentSeason) || {
    key: currentSeason,
    label: currentSeason.startsWith('Saison') || currentSeason.startsWith('Liga') ? currentSeason : `Saison ${currentSeason}`
  };
  
  const rawTeams = Store.getLiga(currentSeason) || [];
  const teams = [...rawTeams].sort((a, b) => {
    const ptsA = Number(a.points) || 0;
    const ptsB = Number(b.points) || 0;
    if (ptsB !== ptsA) return ptsB - ptsA;

    const diffA = (a.diff !== undefined ? Number(a.diff) : (Number(a.goalDiff) || (Number(a.gf || a.goalsFor || 0) - Number(a.ga || a.goalsAgainst || 0))));
    const diffB = (b.diff !== undefined ? Number(b.diff) : (Number(b.goalDiff) || (Number(b.gf || b.goalsFor || 0) - Number(b.ga || b.goalsAgainst || 0))));
    if (diffB !== diffA) return diffB - diffA;

    const gfA = Number(a.gf !== undefined ? a.gf : (a.goalsFor || 0));
    const gfB = Number(b.gf !== undefined ? b.gf : (b.goalsFor || 0));
    return gfB - gfA;
  });

  const stats = Store.getStats(currentSeason) || { topScorers: [], cards: [] };
  const topScorers = stats.topScorers || [];
  const matches = Store.getMatches(currentSeason) || [];

  const getMatchResult = (teamName, m) => {
    let sHome = 0;
    let sAway = 0;
    if (m.status === 'Abgesagt 3:0') { sHome = 3; sAway = 0; }
    else if (m.status === 'Abgesagt 0:3') { sHome = 0; sAway = 3; }
    else if (m.score && m.score !== '-:-' && m.score !== '- : -') {
      let mainScore = m.score.split(' ')[0].replace('*', '');
      let parts = mainScore.split(':');
      if (parts.length !== 2) return null;
      sHome = parseInt(parts[0]);
      sAway = parseInt(parts[1]);
      if (isNaN(sHome) || isNaN(sAway)) return null;
    } else {
      return null;
    }

    let isHome = m.home.trim() === teamName.trim();
    if (sHome === sAway) return 'D';
    if (isHome) return sHome > sAway ? 'W' : 'L';
    return sAway > sHome ? 'W' : 'L';
  };

  const generateForm = (teamName) => {
    // Find all matches for this team that have a valid score or are Abgesagt
    const teamMatches = matches.filter(m => (m.home.trim() === teamName.trim() || m.away.trim() === teamName.trim()) && (m.score !== '-:-' || m.status === 'Abgesagt 3:0' || m.status === 'Abgesagt 0:3'));
    const last5 = teamMatches.slice(-5);
    
    let html = '<div class="form-guide">';
    let dotCount = 0;

    last5.forEach(m => {
      const res = getMatchResult(teamName, m);
      if (res) {
        html += `<span class="form-dot form-${res}" title="${m.home} vs ${m.away}"></span>`;
        dotCount++;
      } else {
        // Fallback if getMatchResult returns null but it's a played match!
        let sHome = 0, sAway = 0;
        if (m.score && m.score.includes(':')) {
           let pts = m.score.split(':');
           sHome = parseInt(pts[0].trim()) || 0;
           sAway = parseInt(pts[1].trim()) || 0;
           let isHome = m.home.trim() === teamName.trim();
           let fallbackRes = (sHome === sAway) ? 'D' : (isHome ? (sHome > sAway ? 'W' : 'L') : (sAway > sHome ? 'W' : 'L'));
           html += `<span class="form-dot form-${fallbackRes}" title="Fallback: ${m.home} vs ${m.away}"></span>`;
           dotCount++;
        }
      }
    });

    for(let i = dotCount; i < 5; i++) {
        html += `<span class="form-dot" style="background: var(--color-border);" title="No match"></span>`;
    }
    html += '</div>';
    return html;
  };

  const rows = teams.map((t, i) => {
    const gf = Number(t.gf !== undefined ? t.gf : (t.goalsFor || 0));
    const ga = Number(t.ga !== undefined ? t.ga : (t.goalsAgainst || 0));
    const diff = t.diff !== undefined ? Number(t.diff) : (t.goalDiff !== undefined ? Number(t.goalDiff) : (gf - ga));
    const diffStr = diff > 0 ? '+' + diff : diff;
    return `
      <div class="liga-row glass-card stagger-item ${i < 3 ? 'top-3-row' : ''} has-table-accordion" style="display: grid; grid-template-columns: 40px 1fr 100px 40px 35px 35px 35px 70px 50px 60px; align-items: center; margin-bottom: var(--space-sm); padding: var(--space-sm) var(--space-md); cursor: pointer; transition: background 0.3s;">
        <span style="font-weight: 900; font-size: 1.2rem; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${i + 1}</span>
        <span style="font-weight: 700; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
        ${generateForm(t.name)}
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.played || 0}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.won || 0}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.drawn || 0}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.lost || 0}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${gf}:${ga}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${diffStr}</span>
        <span class="accent-text" style="font-weight: 900; text-align: right; font-size: 1.2rem;">${t.points || 0}</span>
        
        <div class="table-accordion show-mobile" style="grid-column: 1 / -1; display: none; margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
           <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; text-align: center;">
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Spiele</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.played || 0}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Siege</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.won || 0}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Unent.</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.drawn || 0}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Nied.</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.lost || 0}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Tore</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${gf}:${ga}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Diff</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${diffStr}</div></div>
           </div>
        </div>
      </div>
    `;
  }).join('');

  let currentRankScorer = 1;
  let prevGoalsScorer = -1;
  topScorers.forEach(s => {
    if (s.goals !== prevGoalsScorer) {
      if (prevGoalsScorer !== -1) currentRankScorer++;
      prevGoalsScorer = s.goals;
      s._displayRank = currentRankScorer + '.';
    } else {
      s._displayRank = '';
    }
  });

  const top10 = topScorers.slice(0, 10).map(s => `
    <div class="glass-card stagger-item" style="margin-bottom: var(--space-sm); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: var(--space-md); align-items: center;">
        <span style="font-weight: 900; font-size: 1.2rem; color: var(--color-text-secondary); width: 25px; display: inline-block;">${s._displayRank}</span>
        <div>
          <div style="font-weight: 700; font-size: 1.1rem;">${s.name}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${s.team}</div>
        </div>
      </div>
      <div style="font-weight: 900; font-size: 1.5rem; color: var(--color-accent);">${s.goals}</div>
    </div>
  `).join('');

  const restScorers = topScorers.slice(10).map(s => `
    <div class="glass-card extra-scorer" style="margin-bottom: var(--space-sm); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: var(--space-md); align-items: center;">
        <span style="font-weight: 900; font-size: 1.2rem; color: var(--color-text-secondary); width: 25px; display: inline-block;">${s._displayRank}</span>
        <div>
          <div style="font-weight: 700; font-size: 1.1rem;">${s.name}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${s.team}</div>
        </div>
      </div>
      <div style="font-weight: 900; font-size: 1.5rem; color: var(--color-accent);">${s.goals}</div>
    </div>
  `).join('');


  const cardsData = stats.cards || [];
  
  const generateCardsHTML = (typeKey, cssClass, iconHtml) => {
    // Sort descending by typeKey
    let sorted = [...cardsData].sort((a, b) => b[typeKey] - a[typeKey]).filter(c => c[typeKey] > 0);
    
    // Dense Ranking
    let currentRank = 1;
    let currentVal = -1;
    sorted.forEach(c => {
      if (c[typeKey] !== currentVal) {
        if (currentVal !== -1) currentRank++;
        currentVal = c[typeKey];
        c._displayRank = currentRank + '.';
      } else {
        c._displayRank = '';
      }
    });
    
    const renderRow = (s, extraClass) => `
      <div class="glass-card stagger-item ${extraClass}" style="margin-bottom: var(--space-sm); display: grid; grid-template-columns: 25px 1fr auto; align-items: center; gap: 10px; padding: var(--space-md);">
        <span style="font-weight: 900; font-size: 1.1rem; color: var(--color-text-secondary);">${s._displayRank}</span>
        <div style="min-width: 0;">
          <div style="font-weight: 700; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
          <div class="hide-mobile" style="font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.team}</div>
          <div class="show-mobile" style="font-size: 0.75rem; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.team}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
          <div style="display: flex; align-items: center;">
            <span style="font-weight: 900; font-size: 1.2rem; color: var(--color-text-primary); margin-right: 8px;">${s[typeKey]}</span>
            ${iconHtml}
          </div>
          ${s.suspension ? '<span class="sperre-badge">' + s.suspension + '</span>' : ''}
        </div>
      </div>
    `;

    const top10Cards = sorted.slice(0, 10).map(s => renderRow(s, '')).join('');
    const restCards = sorted.slice(10).map(s => renderRow(s, `extra-${typeKey}-scorer`)).join('');
    
    let html = top10Cards;
    if (restCards) {
      html += `
        <div id="extra-${typeKey}-container" style="display: none;">${restCards}</div>
        <div class="btn-container"><button id="btn-show-all-${typeKey}" class="link-btn">Alle anschauen</button></div>
      `;
    }
    return html || '<div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: var(--space-md) 0;">Keine Karten</div>';
  };

  const cardsHTML = {
    gelb: generateCardsHTML('yellow', 'card-icon-yellow', '<div class="card-icon card-icon-yellow"></div>'),
    gelbrot: generateCardsHTML('yellowRed', 'card-icon-yellow-red', '<div class="card-icon-yellow-red"></div>'),
    rot: generateCardsHTML('red', 'card-icon-red', '<div class="card-icon card-icon-red"></div>')
  };

  const scorersHTML = topScorers.length > 0 ? `
    ${top10}
    <div id="extra-scorers-container" style="display: none;">
      ${restScorers}
    </div>
    ${topScorers.length > 10 ? '<div class="btn-container"><button id="btn-show-all-scorers" class="link-btn">Alle anschauen</button></div>' : ''}
  ` : '<div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: var(--space-md) 0;">Keine Torschützen erfasst.</div>';

  // Group matches by round
  const rounds = {};
  matches.forEach(m => {
    if(!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  
  const parseRoundNumber = (str) => {
    if (!str) return 0;
    const m = str.match(/^\d+/) || str.match(/(\d+)\.\s*Runde/i) || str.match(/Runde\s*(\d+)/i);
    if (m) return parseInt(m[1] || m[0]) || 0;
    return parseInt(str) || 0;
  };

  const roundKeys = Object.keys(rounds).sort((a, b) => {
    return parseRoundNumber(a) - parseRoundNumber(b);
  });
  const maxRoundIdx = roundKeys.length - 1;
  
  let initialRoundIdx = 0;
  for (let i = 0; i <= maxRoundIdx; i++) {
     const roundMatches = rounds[roundKeys[i]];
     if (roundMatches.some(m => m.status === 'Played' || (!m.status && m.score && m.score !== '- : -'))) {
        initialRoundIdx = i;
     }
  }

  const spieleSlider = roundKeys.map((round, idx) => {
    const roundMatches = rounds[round].map(m => {
      const isAbgesagtStatus = m.status === 'Abgesagt 3:0' || m.status === 'Abgesagt 0:3';
      const isAbgesagt = isAbgesagtStatus || (m.score && m.score.includes('Abgesagt'));
      const isUpcoming = m.status === 'Upcoming';
      const hasEvents = (m.events && m.events.length > 0) || (m.scorers && m.scorers.length > 0) || (m.cards && m.cards.length > 0);

      let displayScore = m.score || "- : -";
      if (m.status === 'Abgesagt 3:0') displayScore = "Abges. 3:0";
      if (m.status === 'Abgesagt 0:3') displayScore = "Abges. 0:3";
      if (m.status === 'Postponed') displayScore = "Verschoben";

      let scoreBadgeClass = 'score-normal';
      if (isAbgesagtStatus || isAbgesagt) {
        scoreBadgeClass = 'score-abgesagt';
      } else if (isUpcoming || displayScore === '- : -' || displayScore === '-:-') {
        scoreBadgeClass = 'score-upcoming';
      }

      const dateParts = m.date ? m.date.split('.') : [];
      let weekdayStr = '';
      if (dateParts.length === 3) {
        let year = parseInt(dateParts[2]); if (year < 100) year += 2000; const d = new Date(year, dateParts[1] - 1, dateParts[0]);
        const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
        if (!isNaN(d.getDay())) {
          weekdayStr = `<span style="font-weight: 700; margin-right: 4px;">${days[d.getDay()]}</span>`;
        }
      }

      let eventsHtml = '';
      if (hasEvents) {
        const norm = (s) => (s || '').toLowerCase().replace(/fc|dsg|sv|u\.|union|\./g, '').replace(/\s+/g, '').trim();
        const homeNorm = norm(m.home);
        const awayNorm = norm(m.away);

        let combinedEvents = (m.events && m.events.length > 0) ? [...m.events] : [];
        if (combinedEvents.length === 0) {
          (m.scorers || []).forEach(s => combinedEvents.push({ type: 'goal', player: s.name || s.player, team: s.team, count: 1 }));
          (m.cards || []).forEach(c => combinedEvents.push({ type: c.type || 'yellow', player: c.name || c.player, team: c.team, count: 1 }));
        }

        const isHomeEvent = (e) => {
          const t = String(e.team || '');
          return t === String(m.home) || (homeNorm && norm(t) === homeNorm);
        };
        const isAwayEvent = (e) => {
          const t = String(e.team || '');
          return t === String(m.away) || (awayNorm && norm(t) === awayNorm);
        };

        // Group events by player & type to avoid repeating names
        const groupEvents = (eventsList) => {
          const map = new Map();
          eventsList.forEach(e => {
            const player = (e.player || e.name || '').trim();
            if (!player) return;
            const type = e.type || 'goal';
            const key = `${player}___${type}`;
            if (!map.has(key)) {
              map.set(key, { player, type, count: 0 });
            }
            map.get(key).count += parseInt(e.count) || 1;
          });
          return Array.from(map.values());
        };

        const homeGrouped = groupEvents(combinedEvents.filter(isHomeEvent));
        const awayGrouped = groupEvents(combinedEvents.filter(isAwayEvent));

        const soccerBallSvg = `
          <svg class="goal-svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; flex-shrink: 0;">
            <circle cx="12" cy="12" r="10" stroke-width="1.8"></circle>
            <path d="M12 7.5L15.8 10.2L14.4 15H9.6L8.2 10.2L12 7.5Z" fill="currentColor" fill-opacity="0.25" stroke-width="1.8"></path>
            <path d="M12 2v5.5"></path>
            <path d="M21.5 8.5l-5.7 1.7"></path>
            <path d="M18 20.3l-3.6-5.3"></path>
            <path d="M6 20.3l3.6-5.3"></path>
            <path d="M2.5 8.5l5.7 1.7"></path>
          </svg>
        `;

        const renderBadge = (type, count) => {
          if (type === 'goal') {
            const multiplier = count > 1 ? `<span class="event-multiplier">×${count}</span>` : '';
            return `<span class="event-icon-wrapper" title="${count > 1 ? count + ' Tore' : 'Tor'}">${soccerBallSvg}${multiplier}</span>`;
          }
          if (type === 'yellow') {
            return `<span class="match-card-badge-card badge-yellow" title="Gelbe Karte"></span>`;
          }
          if (type === 'yellowRed') {
            return `<span class="match-card-badge-card badge-yellow-red" title="Gelb-Rote Karte"></span>`;
          }
          if (type === 'red') {
            return `<span class="match-card-badge-card badge-red" title="Rote Karte"></span>`;
          }
          return '';
        };

        eventsHtml = `
          <div class="events-accordion" style="display: none;">
            <div class="events-container">
              <div class="events-col-home">
                ${homeGrouped.length > 0 ? homeGrouped.map(e => `
                  <div class="match-event-row match-event-home">
                    <span class="match-event-player">${e.player}</span>
                    <div class="match-event-badges">${renderBadge(e.type, e.count)}</div>
                  </div>
                `).join('') : '<span style="font-size: 0.75rem; color: var(--color-text-secondary); opacity: 0.5;">-</span>'}
              </div>
              <div class="events-col-away">
                ${awayGrouped.length > 0 ? awayGrouped.map(e => `
                  <div class="match-event-row match-event-away">
                    <div class="match-event-badges">${renderBadge(e.type, e.count)}</div>
                    <span class="match-event-player">${e.player}</span>
                  </div>
                `).join('') : '<span style="font-size: 0.75rem; color: var(--color-text-secondary); opacity: 0.5;">-</span>'}
              </div>
            </div>
          </div>
        `;
      }

      return `
      <div class="match-card glass-card ${hasEvents ? 'has-events-accordion' : ''}">
        <div class="match-card-meta">
          <div class="match-meta-left">
            <span class="match-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${weekdayStr}${m.date}${m.time ? ' • ' + m.time + ' Uhr' : ''}
            </span>
            ${m.venue ? `
              <span class="match-meta-item hide-mobile">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${m.venue}
              </span>
            ` : ''}
          </div>
          <div class="match-meta-right">
            ${m.venue ? `
              <span class="match-meta-item show-mobile" style="opacity: 0.85;">
                ${m.venue}
              </span>
            ` : ''}
            ${hasEvents ? `
              <span class="match-details-indicator">
                <span>Details</span>
                <svg class="details-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            ` : ''}
          </div>
        </div>

        <div class="match-card-body">
          <div class="match-team match-team-home">
            <span class="team-name">${m.home}</span>
          </div>
          
          <div class="match-score-center">
            <span class="match-score-badge ${scoreBadgeClass}">
              ${displayScore}
            </span>
            ${(m.ht && !isAbgesagtStatus) ? `<span class="match-ht-badge">HT ${m.ht}</span>` : ''}
          </div>
          
          <div class="match-team match-team-away">
            <span class="team-name">${m.away}</span>
          </div>
        </div>

        ${eventsHtml}
      </div>`;
    }).join('');

    return `
      <div class="round-slide" data-index="${idx}" style="display: ${idx === initialRoundIdx ? 'block' : 'none'}; width: 100%;">
        <div class="round-header">
           <button class="slider-btn prev-round glass-btn" title="Vorherige Runde" aria-label="Vorherige Runde">
             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
           </button>
           
           <div class="round-select-wrapper">
             <select class="round-select-dropdown" data-current-idx="${idx}" aria-label="Spielrunde auswählen">
               ${roundKeys.map((rk, rIdx) => `<option value="${rIdx}" ${rIdx === idx ? 'selected' : ''}>${rk}</option>`).join('')}
             </select>
             <span class="round-select-chevron">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
             </span>
           </div>
           
           <button class="slider-btn next-round glass-btn" title="Nächste Runde" aria-label="Nächste Runde">
             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
           </button>
        </div>
        <div class="round-matches stagger-item">
          ${roundMatches}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; position: relative; z-index: 50;" class="stagger-item">
        <h1 style="margin: 0;"><span class="accent-text" id="liga-season-label">${(currentItem.label || currentSeason).toUpperCase()}</span></h1>
        
        <div class="season-select-wrapper">
          <div class="season-select-trigger" id="season-custom-trigger">
            <span>${currentItem.label || currentSeason}</span>
            <svg style="margin-left: 10px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="season-select-options" id="season-custom-options">
            ${visibleItems.map(item => `
              <div class="season-option ${item.key === currentSeason ? 'selected' : ''}" data-value="${item.key}">
                ${item.label}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="tabs stagger-item" style="display: flex; gap: var(--space-md); margin: var(--space-xl) 0 var(--space-lg); padding-bottom: var(--space-sm);">
        <button class="tab-btn active liga-tab-active" data-target="table" style="color: var(--color-text-primary); font-size: 1.2rem; font-weight: 700; position: relative;">Tabelle</button>
        <button class="tab-btn" data-target="spiele" style="color: var(--color-text-secondary); font-size: 1.2rem; font-weight: 700; position: relative;">Spiele</button>
        <button class="tab-btn" data-target="stats" style="color: var(--color-text-secondary); font-size: 1.2rem; font-weight: 700; position: relative;">Statistiken</button>
      </div>

      <div id="tab-table" class="tab-content" style="display: block;">
        ${rows.length > 0 ? `
          <div class="liga-header" style="display: grid; grid-template-columns: 40px 1fr 100px 40px 35px 35px 35px 70px 50px 60px; padding: 0 var(--space-md) var(--space-sm); color: var(--color-text-secondary); font-size: 0.8rem; text-transform: uppercase;">
            <span>#</span>
            <span>Team</span>
            <span>Form</span>
            <span class="hide-mobile" style="text-align: center;">Sp</span>
            <span class="hide-mobile" style="text-align: center;">S</span>
            <span class="hide-mobile" style="text-align: center;">U</span>
            <span class="hide-mobile" style="text-align: center;">N</span>
            <span class="hide-mobile" style="text-align: center;">Tore</span>
            <span class="hide-mobile" style="text-align: center;">Diff.</span>
            <span style="text-align: right;">Pkt</span>
          </div>
          ${rows}
        ` : `
          <div class="glass-card" style="text-align: center; padding: 40px; color: var(--color-text-secondary); margin-top: var(--space-md);">
            <p style="margin: 0; font-size: 1.05rem;">Noch keine Mannschaften für diese Saison eingetragen.</p>
          </div>
        `}
      </div>

      <div id="tab-spiele" class="tab-content" style="display: none;">
        ${spieleSlider && spieleSlider.length > 0 ? spieleSlider : `
          <div class="glass-card" style="text-align: center; padding: 40px; color: var(--color-text-secondary); margin-top: var(--space-md);">
            <p style="margin: 0; font-size: 1.05rem;">Noch keine Spielrunden für diese Saison angelegt.</p>
          </div>
        `}
      </div>

      <div id="tab-stats" class="tab-content" style="display: none;">
        <div class="stats-toggle">
            <button class="stats-toggle-btn active" data-stats="tore">Top Torjäger</button>
            <button class="stats-toggle-btn" data-stats="karten">Karten</button>
        </div>

        <div id="stats-tore" class="stagger-item">
            ${scorersHTML}
        </div>

        <div id="stats-karten" style="display: none;" class="stagger-item">
            <div class="karten-sub-toggle">
                <button class="karten-sub-btn active" data-karten="gelb">Gelb</button>
                <button class="karten-sub-btn" data-karten="gelbrot">Gelb-Rot</button>
                <button class="karten-sub-btn" data-karten="rot">Rot</button>
            </div>
            
            <div id="karten-gelb">${cardsHTML.gelb}</div>
            <div id="karten-gelbrot" style="display: none;">${cardsHTML.gelbrot}</div>
            <div id="karten-rot" style="display: none;">${cardsHTML.rot}</div>
        </div>
      </div>
    </div>
  `;
};

export function bindLigaTabs() {
  const trigger = document.getElementById('season-custom-trigger');
  const optionsWrapper = document.getElementById('season-custom-options');
  const options = document.querySelectorAll('.season-option');

  if (trigger && optionsWrapper) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      optionsWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !optionsWrapper.contains(e.target)) {
        optionsWrapper.classList.remove('open');
      }
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        const selectedValue = e.currentTarget.dataset.value || e.target.dataset.value;
        optionsWrapper.classList.remove('open');
        if (selectedValue && currentViewSeason !== selectedValue) {
          currentViewSeason = selectedValue;
          window.dispatchEvent(new CustomEvent('data-updated'));
        }
      });
    });
  }

  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('liga-tab-active');
        b.style.color = 'var(--color-text-secondary)';
      });
      e.target.classList.add('active');
      e.target.classList.add('liga-tab-active');
      e.target.style.color = 'var(--color-text-primary)';
      
      document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
      const target = document.getElementById('tab-' + e.target.dataset.target);
      target.style.display = 'block';
      
      anime({
        targets: target.children,
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutCubic'
      });
    });
  });

  // Slider Logic with Dropdown & Arrow synchronization
  const slides = document.querySelectorAll('.round-slide');
  const maxRound = slides.length - 1;
  let currentRound = 0;
  for (let i = 0; i < slides.length; i++) {
    if (slides[i].style.display === 'block') currentRound = i;
  }

  const updateSliderState = (newIdx, direction = 0) => {
    if (newIdx < 0 || newIdx > maxRound) return;
    
    const oldIdx = currentRound;
    slides[oldIdx].style.display = 'none';
    currentRound = newIdx;
    slides[currentRound].style.display = 'block';

    // Synchronize all round dropdowns
    document.querySelectorAll('.round-select-dropdown').forEach(sel => {
      sel.value = currentRound;
    });

    // Update opacity/pointer-events on navigation buttons
    document.querySelectorAll('.prev-round').forEach(btn => {
      btn.style.opacity = currentRound === 0 ? '0.35' : '1';
      btn.style.pointerEvents = currentRound === 0 ? 'none' : 'auto';
    });
    document.querySelectorAll('.next-round').forEach(btn => {
      btn.style.opacity = currentRound === maxRound ? '0.35' : '1';
      btn.style.pointerEvents = currentRound === maxRound ? 'none' : 'auto';
    });

    const travelX = direction > 0 ? 20 : (direction < 0 ? -20 : 0);
    if (travelX !== 0) {
      anime({
        targets: slides[currentRound],
        opacity: [0, 1],
        translateX: [travelX, 0],
        duration: 300,
        easing: 'easeOutSine'
      });
    }
  };

  updateSliderState(currentRound, 0);

  document.querySelectorAll('.prev-round').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentRound > 0) updateSliderState(currentRound - 1, -1);
    });
  });

  document.querySelectorAll('.next-round').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentRound < maxRound) updateSliderState(currentRound + 1, 1);
    });
  });

  document.querySelectorAll('.round-select-dropdown').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const targetIdx = parseInt(e.target.value);
      const dir = targetIdx > currentRound ? 1 : -1;
      updateSliderState(targetIdx, dir);
    });
  });

  // Match Event Accordions
  const matchCards = document.querySelectorAll('.has-events-accordion');
  matchCards.forEach(card => {
    card.addEventListener('click', () => {
      const accordion = card.querySelector('.events-accordion');
      if (!accordion) return;
      if (accordion.style.display === 'none') {
        accordion.style.display = 'block';
        card.classList.add('accordion-open');
        anime({
          targets: accordion,
          opacity: [0, 1],
          translateY: [-6, 0],
          duration: 300,
          easing: 'easeOutQuad'
        });
      } else {
        accordion.style.display = 'none';
        card.classList.remove('accordion-open');
      }
    });
  });

  // Table Row Accordions (Mobile)
  const tableCards = document.querySelectorAll('.has-table-accordion');
  tableCards.forEach(card => {
    card.addEventListener('click', () => {
      // Only do this on mobile (where .show-mobile is not display:none anyway)
      if (window.innerWidth > 768) return; 
      const accordion = card.querySelector('.table-accordion');
      if (accordion.style.display === 'none') {
        accordion.style.display = 'block';
        anime({
          targets: accordion,
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 300,
          easing: 'easeOutQuad'
        });
      } else {
        accordion.style.display = 'none';
      }
    });
  });

  const btnShowAll = document.getElementById('btn-show-all-scorers');

  // Stats Main Toggle
  const statsBtns = document.querySelectorAll('.stats-toggle-btn');
  statsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      statsBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      document.getElementById('stats-tore').style.display = 'none';
      document.getElementById('stats-karten').style.display = 'none';
      
      const target = document.getElementById('stats-' + e.target.dataset.stats);
      target.style.display = 'block';
      
      anime({
        targets: target.children,
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutCubic'
      });
    });
  });

  // Karten Sub Toggle
  const kartenBtns = document.querySelectorAll('.karten-sub-btn');
  kartenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      kartenBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      document.getElementById('karten-gelb').style.display = 'none';
      document.getElementById('karten-gelbrot').style.display = 'none';
      document.getElementById('karten-rot').style.display = 'none';
      
      const target = document.getElementById('karten-' + e.target.dataset.karten);
      target.style.display = 'block';
      
      anime({
        targets: target.children,
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutCubic'
      });
    });
  });

  // Karten Alle anschauen buttons
  ['yellow', 'yellowRed', 'red'].forEach(type => {
    const btn = document.getElementById('btn-show-all-' + type);
    if (btn) {
      btn.addEventListener('click', () => {
        const container = document.getElementById('extra-' + type + '-container');
        if (container) {
          container.style.display = 'block';
          btn.style.display = 'none';
          anime({
            targets: '.extra-' + type + '-scorer',
            opacity: [0, 1],
            translateY: [10, 0],
            delay: anime.stagger(50),
            duration: 500,
            easing: 'easeOutCubic'
          });
        }
      });
    }
  });

  if (btnShowAll) {
    btnShowAll.addEventListener('click', () => {
      const container = document.getElementById('extra-scorers-container');
      container.style.display = 'block';
      btnShowAll.style.display = 'none';
      anime({
        targets: '.extra-scorer',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutCubic'
      });
    });
  }

  // Check URL for specific tab
  if (window.location.hash.includes('tab=stats')) {
    const statsTabBtn = document.querySelector('.tab-btn[data-target="stats"]');
    if (statsTabBtn) statsTabBtn.click();
  }
};



