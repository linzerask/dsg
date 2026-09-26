import re

with open('js/views/liga.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the bindings at the end of bindLigaTabs
bindings_addition = """
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
  ['gelb', 'gelbrot', 'rot'].forEach(type => {
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
"""

# Insert bindings before the last closing brace
content = content.replace("  if (btnShowAll) {", bindings_addition + "\n  if (btnShowAll) {")

# 2. Update btnShowAll style in scorersHTML
content = content.replace(
    '<button id="btn-show-all-scorers" class="btn" style="width: 100%; margin-top: var(--space-md); background: rgba(255,255,255,0.05); border: 1px solid var(--color-accent); color: var(--color-text-primary);">Alle anschauen</button>',
    '<button id="btn-show-all-scorers" class="btn" style="width: 100%; margin-top: var(--space-md); padding: 8px; font-size: 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--color-accent); color: var(--color-text-primary);">Alle anschauen</button>'
)

# 3. Add Cards processing right before scorersHTML
cards_logic = """
  const cardsData = stats.cards || [];
  
  const generateCardsHTML = (typeKey, cssClass, iconHtml) => {
    // Sort descending by typeKey
    let sorted = [...cardsData].sort((a, b) => b[typeKey] - a[typeKey]).filter(c => c[typeKey] > 0);
    
    // Dense Ranking
    let currentRank = 1;
    let currentVal = -1;
    sorted.forEach(c => {
      if (currentVal === -1) currentVal = c[typeKey];
      if (c[typeKey] < currentVal) {
        currentRank++;
        currentVal = c[typeKey];
      }
      c._tempRank = currentRank;
    });
    
    const renderRow = (s, extraClass) => `
      <div class="glass-card stagger-item ${extraClass}" style="margin-bottom: var(--space-sm); display: grid; grid-template-columns: 25px 1fr auto; align-items: center; gap: 10px; padding: var(--space-md);">
        <span style="font-weight: 900; font-size: 1.1rem; color: var(--color-text-secondary);">${s._tempRank}.</span>
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
          ${s.suspension ? `<span class="sperre-badge">${s.suspension}</span>` : ''}
        </div>
      </div>
    `;

    const top10 = sorted.slice(0, 10).map(s => renderRow(s, '')).join('');
    const rest = sorted.slice(10).map(s => renderRow(s, `extra-${typeKey}-scorer`)).join('');
    
    let html = top10;
    if (rest) {
      html += `
        <div id="extra-${typeKey}-container" style="display: none;">${rest}</div>
        <button id="btn-show-all-${typeKey}" class="btn" style="width: 100%; margin-top: var(--space-md); padding: 8px; font-size: 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--color-accent); color: var(--color-text-primary);">Alle anschauen</button>
      `;
    }
    return html || '<div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: var(--space-md) 0;">Keine Karten</div>';
  };

  const cardsHTML = {
    gelb: generateCardsHTML('yellow', 'card-icon-yellow', '<div class="card-icon card-icon-yellow"></div>'),
    gelbrot: generateCardsHTML('yellowRed', 'card-icon-yellow-red', '<div class="card-icon-yellow-red"></div>'),
    rot: generateCardsHTML('red', 'card-icon-red', '<div class="card-icon card-icon-red"></div>')
  };
"""

content = content.replace("  const scorersHTML =", cards_logic + "\n  const scorersHTML =")

# 4. Replace tab-stats HTML
tab_stats_old = """      <div id="tab-stats" class="tab-content" style="display: none;">
        <h3 style="margin-bottom: var(--space-md);">Top Torjäger</h3>
        ${scorersHTML}
      </div>"""

tab_stats_new = """      <div id="tab-stats" class="tab-content" style="display: none;">
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
      </div>"""

content = content.replace(tab_stats_old, tab_stats_new)

with open('js/views/liga.js', 'w', encoding='utf-8') as f:
    f.write(content)
