// Teams & Club Hub View
import { Store, sanitizeMojibake } from '../store.js?v=1791180000000';
import { renderIcon } from '../icons.js?v=1791180000000';
import { renderTeamLogo, getTeamLogoUrl } from '../logos.js?v=1791180000000';
import { getPlayerAvatar, calculatePlayerAge, formatMemberSince, getPlayerLiveStats, normalizePlayerKey } from '../playerUtils.js?v=1791180000000';

let allTeams = [];
let allPlayers = [];
let selectedTeamName = '';

export const viewTeams = () => {
  return `
    <div class="container" style="padding-top: 100px; padding-bottom: 60px;">
      <!-- Hero Header -->
      <div class="stagger-item" style="text-align: center; margin-bottom: var(--space-xl);">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 179, 65, 0.12); color: var(--color-accent); font-weight: 700; font-size: 0.8rem; padding: 6px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-sm); border: 1px solid rgba(0, 179, 65, 0.25);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          DSG Vereinszentrale
        </div>
        <h1 style="font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: -0.5px;">
          DSG <span style="color: var(--color-accent);">VEREINE</span> & TEAMS
        </h1>
        <p style="color: var(--color-text-secondary); max-width: 650px; margin: 0 auto; font-size: 1.05rem;">
          Wähle eine Mannschaft für detaillierte Kaderlisten, Spielpläne, Vereinsbilanzen und interne Torschützenkönige.
        </p>
      </div>

      <!-- Active Teams Quick Selector Grid -->
      <div class="stagger-item" style="margin-bottom: var(--space-xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
          <h3 style="margin: 0; font-size: 1.15rem;">Aktive Vereine (Saison 2026/27)</h3>
          <span style="font-size: 0.85rem; color: var(--color-text-secondary);">Wähle ein Team für Details</span>
        </div>
        <div id="teams-selector-grid" class="teams-quick-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- Selected Team Detail Showcase View -->
      <div id="selected-team-container" class="stagger-item">
        <!-- Injected dynamically when team selected -->
      </div>
    </div>

    <style>
      .teams-quick-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 12px;
      }
      .team-selector-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: 14px 10px;
        text-align: center;
        cursor: pointer;
        transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .team-selector-card:hover {
        transform: translateY(-3px);
        border-color: var(--color-accent);
        box-shadow: 0 8px 20px rgba(0, 179, 65, 0.12);
      }
      .team-selector-card.active {
        border-color: var(--color-accent);
        background: rgba(0, 179, 65, 0.08);
        box-shadow: 0 0 0 2px var(--color-accent);
      }
      .team-selector-name {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1.2;
      }
      .team-hero-box {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: var(--space-lg);
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        align-items: center;
        margin-bottom: var(--space-xl);
      }
      .team-hero-crest-wrap {
        width: 110px;
        height: 110px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        border: 1px solid var(--color-border);
        flex-shrink: 0;
      }
      [data-theme="dark"] .team-hero-crest-wrap {
        background: rgba(255, 255, 255, 0.04);
      }
      .team-kader-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: var(--space-md);
      }
      @media (max-width: 600px) {
        .teams-quick-grid {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
        }
        .team-hero-box {
          flex-direction: column;
          text-align: center;
          padding: var(--space-md);
        }
        .team-kader-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
};

export const bindTeams = async () => {
  const selectorGrid = document.getElementById('teams-selector-grid');
  const teamContainer = document.getElementById('selected-team-container');

  // Load data
  try {
    const [rawTeams, rawPlayers] = await Promise.all([
      Store.getAdminTeams(),
      Store.getAdminPlayers()
    ]);
    allTeams = rawTeams || [];
    allPlayers = (rawPlayers || []).filter(p => (p.Status || p.status) === 'Aktiv');
  } catch (err) {
    console.error("Error loading teams data:", err);
  }

  // Active teams in 2026/27
  const defaultActiveTeams = [
    'SV Croatia Linz',
    'DSG Union Traun',
    'Etehad Linz',
    'FC Gornjak',
    'DSG St. Josef/Oed FC',
    'Union Heiligenberg',
    'Walker FC'
  ];

  const activeTeamsList = defaultActiveTeams.filter(tName => {
    return allPlayers.some(p => sanitizeMojibake((p.Team || p.team || '').trim()) === tName);
  });

  // Add any additional active teams from admin teams with registered active players
  allTeams.forEach(t => {
    const name = sanitizeMojibake((t.Name || t.name || '').trim());
    const hasActivePlayers = allPlayers.some(p => sanitizeMojibake((p.Team || p.team || '').trim()) === name);
    if (name && (t.Status === 'Aktiv' || t.status === 'Aktiv') && hasActivePlayers && !activeTeamsList.includes(name)) {
      activeTeamsList.push(name);
    }
  });

  // Check URL query parameters (e.g. #/teams?team=SV+Croatia+Linz or #/teams?name=Traun)
  const hash = window.location.hash || '';
  let targetTeam = activeTeamsList[0];

  if (hash.includes('?')) {
    const queryString = hash.split('?')[1];
    const urlParams = new URLSearchParams(queryString);
    const paramTeam = urlParams.get('team') || urlParams.get('name') || urlParams.get('id');
    if (paramTeam) {
      const match = activeTeamsList.find(t => normalizePlayerKey(t).includes(normalizePlayerKey(paramTeam)));
      if (match) {
        targetTeam = match;
      }
    }
  }

  selectedTeamName = targetTeam;

  const renderSelector = () => {
    if (!selectorGrid) return;
    selectorGrid.innerHTML = activeTeamsList.map(tName => {
      const isSelected = tName === selectedTeamName;
      const logoHTML = renderTeamLogo(tName, 'sm');
      const count = allPlayers.filter(p => sanitizeMojibake((p.Team || p.team || '').trim()) === tName).length;

      return `
        <div class="team-selector-card ${isSelected ? 'active' : ''}" data-team-name="${tName}">
          <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
            ${logoHTML}
          </div>
          <div class="team-selector-name">${tName}</div>
          <div style="font-size: 0.72rem; color: var(--color-accent); font-weight: 700;">${count} Spieler</div>
        </div>
      `;
    }).join('');

    selectorGrid.querySelectorAll('.team-selector-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedTeamName = card.getAttribute('data-team-name');
        renderSelector();
        renderTeamDetails(selectedTeamName);
      });
    });
  };

  const renderTeamDetails = (teamName) => {
    if (!teamContainer) return;

    // Filter squad for this team
    const squad = allPlayers.filter(p => sanitizeMojibake((p.Team || p.team || '').trim()) === teamName).map(p => {
      const fn = sanitizeMojibake((p.Vorname || p.vorname || '').trim());
      const ln = sanitizeMojibake((p.Nachname || p.nachname || '').trim());
      const bDate = (p.Geburtsdatum || p.geburtsdatum || '').trim();
      const sDate = (p.seit || p.Seit || '').trim();
      const id = String(p['#'] || p.id || p.ID || '');
      const pos = (p.Position || p.position || '').trim();
      const stats = getPlayerLiveStats(p);

      return {
        id,
        fullName: `${fn} ${ln}`.trim(),
        birthDate: bDate,
        age: calculatePlayerAge(bDate),
        memberSince: sDate,
        position: pos,
        goals: stats.goals,
        yellow: stats.yellow,
        red: stats.red,
        raw: p
      };
    }).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.fullName.localeCompare(b.fullName, 'de');
    });

    const logoLarge = renderTeamLogo(teamName, 'lg');
    const teamRecord = allTeams.find(t => (t.Name || t.name) === teamName) || {};
    const activeSince = teamRecord['Aktiv seit'] || teamRecord.activeSince || 'Traditionsverein';

    // League table row for 2026/27
    const currentSeason = Store.getData()?.seasons?.['2026/2027'] || {};
    const teamTableEntry = (currentSeason.teams || []).find(t => normalizePlayerKey(t.name) === normalizePlayerKey(teamName)) || {
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
    };

    // Fixtures / Matches for this team in 2026/27
    const teamMatches = (currentSeason.matches || []).filter(m => {
      const h = normalizePlayerKey(m.home);
      const a = normalizePlayerKey(m.away);
      const t = normalizePlayerKey(teamName);
      return h.includes(t) || a.includes(t) || t.includes(h) || t.includes(a);
    });

    // Club Top Scorers
    const topScorers = squad.filter(p => p.goals > 0).slice(0, 5);

    teamContainer.innerHTML = `
      <!-- Hero Banner -->
      <div class="team-hero-box">
        <div class="team-hero-crest-wrap">
          ${logoLarge}
        </div>
        <div style="flex: 1; min-width: 250px;">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
            <span style="background: rgba(0, 179, 65, 0.15); color: var(--color-accent); font-weight: 800; font-size: 0.78rem; padding: 3px 10px; border-radius: 999px; text-transform: uppercase;">Aktiv</span>
            <span style="font-size: 0.85rem; color: var(--color-text-secondary);">${activeSince ? `Aktiv seit ${activeSince}` : ''}</span>
          </div>
          <h2 style="font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; margin: 0 0 6px 0; color: var(--color-text-primary);">${teamName}</h2>
          <p style="margin: 0; color: var(--color-text-secondary); font-size: 0.95rem;">
            Aktueller Kader: <strong>${squad.length} aktive Spieler</strong> &bull; DSG Meisterschaft 2026/27
          </p>
        </div>

        <!-- 2026/27 Season Stats Summary -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; min-width: 260px;">
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary);">${teamTableEntry.points || 0}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Punkte</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary);">${teamTableEntry.played || 0}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Spiele</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent);">${teamTableEntry.gf || 0}:${teamTableEntry.ga || 0}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Tore</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: ${teamTableEntry.gd > 0 ? 'var(--color-accent)' : (teamTableEntry.gd < 0 ? '#ef4444' : 'var(--color-text-primary)')};">${teamTableEntry.gd > 0 ? '+' : ''}${teamTableEntry.gd || 0}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Diff</div>
          </div>
        </div>
      </div>

      <!-- Top Scorers & Recent Matches 2-Column Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-xl);">
        
        <!-- Internal Top Scorers -->
        <div class="glass-card" style="padding: var(--space-md); border-radius: var(--border-radius-md);">
          <h3 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <span>⚽</span> Vereins-Torschützen (Top 5)
          </h3>
          ${topScorers.length === 0 ? `
            <div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 16px 0;">Noch keine registrierten Torschützen in den Spielberichten.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${topScorers.map((p, idx) => `
                <a href="#/spieler?id=${p.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 6px; text-decoration: none; color: var(--color-text-primary); transition: background var(--transition-fast);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 800; color: var(--color-text-secondary); width: 18px;">${idx + 1}.</span>
                    <span style="font-weight: 700;">${p.fullName}</span>
                  </div>
                  <span style="font-weight: 800; color: var(--color-accent); font-size: 1rem;">${p.goals} Tore</span>
                </a>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Matches & Results -->
        <div class="glass-card" style="padding: var(--space-md); border-radius: var(--border-radius-md);">
          <h3 style="margin: 0 0 var(--space-sm) 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <span>📅</span> Spielplan & Ergebnisse
          </h3>
          ${teamMatches.length === 0 ? `
            <div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 16px 0;">Keine aktuellen Begegnungen gelistet.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
              ${teamMatches.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 6px; font-size: 0.88rem;">
                  <div style="font-weight: 600;">
                    ${m.home} vs. ${m.away}
                  </div>
                  <div style="font-weight: 800; color: ${m.score && m.score !== '-:-' ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
                    ${m.score || m.time || '-:-'}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Squad / Active Roster -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
          <h3 style="margin: 0; font-size: 1.3rem;">Aktueller Kader (${squad.length} Spieler)</h3>
          <a href="#/spieler?team=${encodeURIComponent(teamName)}" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.85rem;">
            In Spieler-Datenbank suchen &rarr;
          </a>
        </div>

        <div class="team-kader-grid">
          ${squad.map(p => {
            const avatar = getPlayerAvatar(p.raw);
            const ageText = p.age ? `${p.age} J.` : '';
            const sinceText = formatMemberSince(p.memberSince);
            const teamBadgeSm = renderTeamLogo(teamName, 'xs');

            return `
              <a href="#/spieler?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="spieler-card" style="height: 100%;">
                  <div class="spieler-card-header" style="height: 170px;">
                    ${p.position ? `<span class="spieler-card-pos-tag">${p.position}</span>` : ''}
                    <img src="${avatar}" alt="${p.fullName}" class="spieler-card-avatar">
                    <div class="spieler-card-team-badge" title="${teamName}" style="width: 36px; height: 36px; bottom: 8px; right: 8px;">
                      ${teamBadgeSm}
                    </div>
                  </div>
                  <div class="spieler-card-body">
                    <h4 class="spieler-card-name" style="font-size: 1.05rem;">${p.fullName}</h4>
                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 6px;">
                      <span>${ageText}</span>
                      <span>${sinceText}</span>
                    </div>
                    <div class="spieler-stat-pills">
                      <div class="spieler-stat-pill">
                        <span class="spieler-stat-val" style="color: var(--color-accent); font-size: 0.95rem;">⚽ ${p.goals}</span>
                        <span class="spieler-stat-lbl">Tore</span>
                      </div>
                      <div class="spieler-stat-pill">
                        <span class="spieler-stat-val" style="color: #eab308; font-size: 0.95rem;">🟨 ${p.yellow}</span>
                        <span class="spieler-stat-lbl">Gelb</span>
                      </div>
                      <div class="spieler-stat-pill">
                        <span class="spieler-stat-val" style="color: #ef4444; font-size: 0.95rem;">🟥 ${p.red}</span>
                        <span class="spieler-stat-lbl">Rot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  renderSelector();
  renderTeamDetails(selectedTeamName);
};


