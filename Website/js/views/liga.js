import { Store } from '../store.js';


let currentViewSeason = "2026/2027";

export function viewLiga() {
  const data = Store.getData();
  const visibleItems = Store.getVisibleSeasonItems ? Store.getVisibleSeasonItems() : [];
  const visibleSeasonKeys = visibleItems.map(i => i.key);
  if (visibleSeasonKeys.length > 0 && !visibleSeasonKeys.includes(currentViewSeason)) {
    currentViewSeason = visibleSeasonKeys.includes("2026/2027") ? "2026/2027" : (visibleSeasonKeys[0] || "2026/2027");
  }
  const currentSeason = currentViewSeason;
  const currentItem = visibleItems.find(i => i.key === currentSeason) || { key: currentSeason, label: currentSeason };
  const teams = Store.getLiga(currentSeason);
  const stats = Store.getStats(currentSeason) || { topScorers: [] };
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
    const diff = t.gf - t.ga;
    const diffStr = diff > 0 ? '+' + diff : diff;
    return `
      <div class="liga-row glass-card stagger-item ${i < 3 ? 'top-3-row' : ''} has-table-accordion" style="display: grid; grid-template-columns: 40px 1fr 100px 40px 35px 35px 35px 70px 50px 60px; align-items: center; margin-bottom: var(--space-sm); padding: var(--space-sm) var(--space-md); cursor: pointer; transition: background 0.3s;">
        <span style="font-weight: 900; font-size: 1.2rem; color: ${i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">${i + 1}</span>
        <span style="font-weight: 700; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
        ${generateForm(t.name)}
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.played}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.won}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.drawn}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.lost}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${t.gf}:${t.ga}</span>
        <span class="hide-mobile" style="color: var(--color-text-secondary); text-align: center;">${diffStr}</span>
        <span class="accent-text" style="font-weight: 900; text-align: right; font-size: 1.2rem;">${t.points}</span>
        
        <div class="table-accordion show-mobile" style="grid-column: 1 / -1; display: none; margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
           <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; text-align: center;">
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Spiele</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.played}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Siege</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.won}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Unent.</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.drawn}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Nied.</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.lost}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Tore</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${t.gf}:${t.ga}</div></div>
             <div><div style="font-size: 0.65rem; text-transform: uppercase;">Diff</div><div style="font-weight: bold; color: var(--color-text-primary); font-size: 1rem;">${diffStr}</div></div>
           </div>
        </div>
      </div>
    `}).join('');

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

      let scoreStyle = isUpcoming ? 'color: var(--color-text-secondary); opacity: 0.5;' : '';
      if (isAbgesagtStatus) scoreStyle = 'color: #e74c3c;';

      let htHtml = (m.ht && !isAbgesagtStatus) ? `<span style="font-size: 0.8rem; font-weight: normal; color: var(--color-text-secondary); margin-left: 5px;">(${m.ht})</span>` : '';

      const dateParts = m.date ? m.date.split('.') : [];
      let weekdayStr = '';
      if (dateParts.length === 3) {
        let year = parseInt(dateParts[2]); if (year < 100) year += 2000; const d = new Date(year, dateParts[1] - 1, dateParts[0]);
        const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
        if (!isNaN(d.getDay())) {
          weekdayStr = `<span style="font-weight: bold; margin-right: 4px;">${days[d.getDay()]}</span>`;
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

        const homeEvents = combinedEvents.filter(isHomeEvent);
        const awayEvents = combinedEvents.filter(isAwayEvent);

        const renderEventIcon = (type) => {
          if (type === 'goal') return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-primary); margin: 0 4px; opacity: 0.8; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><path d="M12 12l4-2.5v-5"></path><path d="M12 12l-4-2.5v-5"></path><path d="M12 12v5.5l-4 2"></path><path d="M12 17.5l4 2"></path><path d="M4.5 9.5l3.5 2.5"></path><path d="M19.5 9.5l-3.5 2.5"></path></svg>`;
          if (type === 'yellow') return `<span style="display:inline-block; width:10px; height:14px; background:#f1c40f; border-radius:2px; margin: 0 4px; vertical-align: middle;"></span>`;
          if (type === 'yellowRed') return `<span style="display:inline-block; width:10px; height:14px; background:linear-gradient(135deg, #f1c40f 50%, #e74c3c 50%); border-radius:2px; margin: 0 4px; vertical-align: middle;"></span>`;
          if (type === 'red') return `<span style="display:inline-block; width:10px; height:14px; background:#e74c3c; border-radius:2px; margin: 0 4px; vertical-align: middle;"></span>`;
          return '';
        };

        eventsHtml = `
          <div class="events-accordion" style="grid-column: 1 / -1; display: none; margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px;">
              <div style="text-align: right;">
                ${homeEvents.map(e => `
                  <div style="margin-bottom: 3px;">
                    <span style="font-weight: 500;">${e.player || e.name}</span>
                    ${Array(parseInt(e.count)||1).fill(renderEventIcon(e.type)).join('')}
                  </div>
                `).join('')}
              </div>
              <div style="visibility: hidden; font-size:1.1rem; white-space: nowrap;">
                ${displayScore} ${htHtml}
              </div>
              <div style="text-align: left;">
                ${awayEvents.map(e => `
                  <div style="margin-bottom: 3px;">
                    ${Array(parseInt(e.count)||1).fill(renderEventIcon(e.type)).join('')}
                    <span style="font-weight: 500;">${e.player || e.name || ""}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      return `
      <div class="match-card glass-card ${hasEvents ? 'has-events-accordion' : ''}" style="margin-bottom: var(--space-sm); display: grid; grid-template-columns: 80px 1fr auto 1fr auto; align-items: center; gap: 10px; padding: var(--space-md); cursor: ${hasEvents ? 'pointer' : 'default'}; transition: background 0.3s;">
          <span style="font-size: 0.8rem; color: var(--color-text-secondary);">
            ${weekdayStr}${m.date}${m.time ? ' - ' + m.time : ''}
            ${m.venue ? `<br><span style="font-size: 0.75rem; opacity: 0.8;">${m.venue}</span>` : ''}
          </span>
        <span style="font-weight: 700; text-align: right;">${m.home}</span>
        <span style="font-weight: 900; color: var(--color-text-secondary); padding: 0 var(--space-xs);">-</span>
        <span style="font-weight: 700; text-align: left;">${m.away}</span>
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <span class="${isAbgesagt ? 'score-abgesagt' : 'score-normal'}" style="font-weight: 900; text-align: right; font-size:1.1rem; white-space: nowrap; ${scoreStyle}">
            ${displayScore} ${htHtml}
          </span>
        </div>
        ${eventsHtml}
      </div>`;
    }).join('');

    return `
      <div class="round-slide" data-index="${idx}" style="display: ${idx === initialRoundIdx ? 'block' : 'none'}; width: 100%;">
        <div class="round-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); gap: 10px;">
           <button class="slider-btn prev-round glass-btn" style="cursor: pointer; padding: 6px 14px; font-size: 1.1rem; border-radius: 50px; background: var(--color-surface); border: var(--glass-border); color: var(--color-text-primary); transition: all 0.2s;" title="Vorherige Runde">◀</button>
           
           <div class="round-select-wrapper" style="position: relative; display: inline-block;">
             <select class="round-select-dropdown" data-current-idx="${idx}" style="background: rgba(142, 198, 63, 0.15); border: 1px solid var(--color-accent); padding: var(--space-xs) var(--space-lg); border-radius: 50px; font-weight: bold; color: var(--color-text-primary); text-align: center; cursor: pointer; font-size: 0.95rem; outline: none; appearance: none; -webkit-appearance: none; padding-right: 32px;">
               ${roundKeys.map((rk, rIdx) => `<option value="${rIdx}" ${rIdx === idx ? 'selected' : ''}>${rk}</option>`).join('')}
             </select>
             <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--color-accent); font-size: 0.8rem;">▼</span>
           </div>
           
           <button class="slider-btn next-round glass-btn" style="cursor: pointer; padding: 6px 14px; font-size: 1.1rem; border-radius: 50px; background: var(--color-surface); border: var(--glass-border); color: var(--color-text-primary); transition: all 0.2s;" title="Nächste Runde">▶</button>
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
            <span style="font-size: 0.7rem; margin-left: 10px;">▼</span>
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
        const selectedValue = e.target.dataset.value;
        if (currentViewSeason !== selectedValue) {
          currentViewSeason = selectedValue;
          window.dispatchEvent(new CustomEvent('data-updated'));
        } else {
          optionsWrapper.classList.remove('open');
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



