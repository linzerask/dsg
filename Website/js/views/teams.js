import { Store, sanitizeMojibake } from '../store.js?v=1793360000000';
import { renderIcon } from '../icons.js?v=1791270000000';
import { renderTeamLogo, getTeamLogoUrl } from '../logos.js?v=1791270000000';
import { getPlayerAvatar, calculatePlayerAge, formatMemberSince, getPlayerLiveStats, normalizePlayerKey, getTeamScorers, getPlayerLink, getPlayerPositionLabel, getPlayerPositionCategory, openPlayerStatsModal } from '../playerUtils.js?v=1793442000000';

let allTeams = [];
let allPlayers = [];
let selectedTeamName = '';
let scorerSeasonFilter = null;
let squadStatusFilter = 'Aktiv';
let squadViewMode = localStorage.getItem('dsg_player_view_mode') || 'cards';
let squadSortField = 'goals';
let squadSortDirection = 'desc';
let showAllScorers = false;
let scorerCurrentPage = 1;
const SCORERS_PER_PAGE = 5;

// Dynamically resolves current/latest active season key and formatted label
export const getActiveSeasonInfo = () => {
  const data = Store.getData() || {};
  const leagues = (Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : []) || [];
  const activeLeagues = leagues.filter(l => l.active !== false && l.status !== 'Archiviert' && l.status !== 'Inaktiv');
  const currentLeague = activeLeagues.find(l => l.isCurrent) || leagues.find(l => l.isCurrent) || activeLeagues[0] || leagues[0];
  
  const seasonsData = data.seasons || {};
  const seasonKeys = Object.keys(seasonsData).sort((a, b) => b.localeCompare(a));
  
  const seasonKey = currentLeague ? (currentLeague.seasonKey || currentLeague.name) : (data.currentSeason || seasonKeys[0] || '2026/2027');
  
  let label = seasonKey;
  if (/^\d{4}\/\d{4}$/.test(seasonKey)) {
    const parts = seasonKey.split('/');
    label = `Saison ${parts[0]}/${parts[1].slice(2)}`;
  } else if (/^\d{4}$/.test(seasonKey)) {
    label = `Saison ${seasonKey}`;
  } else if (currentLeague && currentLeague.name) {
    label = currentLeague.name;
  }
  
  return { seasonKey, label };
};

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
          <h3 style="margin: 0; font-size: 1.15rem;" id="teams-active-heading">Aktive Vereine</h3>
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
        width: 120px;
        height: 120px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        border: 1px solid var(--color-border);
        flex-shrink: 0;
      }
      .team-hero-crest-wrap .team-logo {
        width: 84px;
        height: 84px;
        max-width: 84px;
        max-height: 84px;
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
        .team-hero-crest-wrap {
          width: 105px;
          height: 105px;
          padding: 10px;
        }
        .team-hero-crest-wrap .team-logo {
          width: 74px;
          height: 74px;
          max-width: 74px;
          max-height: 74px;
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
  const activeSeasonInfo = getActiveSeasonInfo();
  
  const activeHeadingEl = document.getElementById('teams-active-heading');
  if (activeHeadingEl) {
    activeHeadingEl.textContent = `Aktive Vereine (${activeSeasonInfo.label})`;
  }
  if (!scorerSeasonFilter) {
    scorerSeasonFilter = activeSeasonInfo.seasonKey;
  }

  // Load data
  try {
    const [rawTeams, rawPlayers] = await Promise.all([
      Store.getAdminTeams(),
      Store.getAdminPlayers()
    ]);
    allTeams = rawTeams || [];
    allPlayers = rawPlayers || [];
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

  let activeTeamsList = defaultActiveTeams.filter(tName => {
    return allPlayers.some(p => {
      const isAct = (p.Status || p.status) === 'Aktiv';
      const tm = sanitizeMojibake((p.Team || p.team || '').trim());
      return isAct && (tm === tName || normalizePlayerKey(tm) === normalizePlayerKey(tName));
    });
  });

  if (activeTeamsList.length === 0) {
    activeTeamsList = [...defaultActiveTeams];
  }

  // Add any additional active teams from admin teams with registered active players
  allTeams.forEach(t => {
    const name = sanitizeMojibake((t.Name || t.name || '').trim());
    const hasActivePlayers = allPlayers.some(p => {
      const isAct = (p.Status || p.status) === 'Aktiv';
      const tm = sanitizeMojibake((p.Team || p.team || '').trim());
      return isAct && (tm === name || normalizePlayerKey(tm) === normalizePlayerKey(name));
    });
    const isActiveStatus = (t.Status === 'Aktiv' || t.status === 'Aktiv');
    if (name && isActiveStatus && hasActivePlayers && !activeTeamsList.includes(name)) {
      activeTeamsList.push(name);
    }
  });

  // Check URL query parameters (e.g. #/teams?team=SV+Croatia+Linz or #/teams?name=Traun)
  const hash = window.location.hash || '';
  let targetTeam = activeTeamsList[0] || 'SV Croatia Linz';

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

  const renderTeamDetails = (teamName) => {
    if (!teamContainer || !teamName) return;

    // Filter squad for this team
    const teamNorm = normalizePlayerKey(teamName);
    const teamPlayersAll = allPlayers.filter(p => {
      const tm = sanitizeMojibake((p.Team || p.team || '').trim());
      return tm === teamName || normalizePlayerKey(tm) === teamNorm;
    });

    const activeSquadPlayers = teamPlayersAll.filter(p => (p.Status || p.status) === 'Aktiv');
    const inactiveSquadPlayers = teamPlayersAll.filter(p => (p.Status || p.status) !== 'Aktiv');

    const filteredPlayers = teamPlayersAll.filter(p => {
      const isAct = (p.Status || p.status) === 'Aktiv';
      if (squadStatusFilter === 'Aktiv') return isAct;
      if (squadStatusFilter === 'Inaktiv') return !isAct;
      return true; // 'all'
    });

    const getPosBadgeHtml = (player) => {
      const label = getPlayerPositionLabel(player.raw || player);
      if (!label) return `<span class="dsg-pos-badge pos-none">-</span>`;
      const cat = getPlayerPositionCategory(label);
      let badgeClass = 'pos-mf';
      if (cat === 'Torwart') badgeClass = 'pos-tw';
      else if (cat === 'Abwehr') badgeClass = 'pos-abw';
      else if (cat === 'Sturm') badgeClass = 'pos-st';
      return `<span class="dsg-pos-badge ${badgeClass}" title="${label}">${label}</span>`;
    };

    const squad = filteredPlayers.map((p, pIdx) => {
      const fn = sanitizeMojibake((p.Vorname || p.vorname || '').trim());
      const ln = sanitizeMojibake((p.Nachname || p.nachname || '').trim());
      const bDate = (p.Geburtsdatum || p.geburtsdatum || '').trim();
      const sDate = (p.seit || p.Seit || '').trim();
      const id = String(p['#'] || p.id || p.ID || '');
      const pos = (p.Position || p.position || '').trim();
      const status = (p.Status || p.status || 'Aktiv');
      const stats = getPlayerLiveStats(p);

      return {
        id,
        origIndex: pIdx + 1,
        fullName: `${fn} ${ln}`.trim(),
        birthDate: bDate,
        age: calculatePlayerAge(bDate),
        memberSince: sDate,
        position: pos,
        status: status,
        isActive: status === 'Aktiv',
        goals: stats.goals,
        yellow: stats.yellow,
        yellowRed: stats.yellowRed || 0,
        red: stats.red,
        raw: p
      };
    }).sort((a, b) => {
      let cmp = 0;
      if (squadSortField === '#') {
        cmp = a.origIndex - b.origIndex;
      } else if (squadSortField === 'name') {
        cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'position') {
        const getPosWeight = (item) => {
          const cat = getPlayerPositionCategory(item.position);
          if (cat === 'Torwart') return 1;
          if (cat === 'Abwehr') return 2;
          if (cat === 'Mittelfeld') return 3;
          if (cat === 'Sturm') return 4;
          return 5;
        };
        cmp = getPosWeight(a) - getPosWeight(b);
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'age') {
        const ageA = a.age !== null ? a.age : (squadSortDirection === 'asc' ? 999 : -1);
        const ageB = b.age !== null ? b.age : (squadSortDirection === 'asc' ? 999 : -1);
        cmp = ageA - ageB;
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'since') {
        const parseYear = (s) => {
          const m = String(s || '').match(/\b(19\d\d|20\d\d)\b/);
          return m ? parseInt(m[1], 10) : 0;
        };
        cmp = parseYear(a.memberSince) - parseYear(b.memberSince);
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'goals') {
        cmp = a.goals - b.goals;
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'yellow') {
        cmp = a.yellow - b.yellow;
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'yellowRed') {
        cmp = a.yellowRed - b.yellowRed;
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      } else if (squadSortField === 'red') {
        cmp = a.red - b.red;
        if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName, 'de');
      }

      return squadSortDirection === 'asc' ? cmp : -cmp;
    });

    const getSortIcon = (field) => {
      if (squadSortField !== field) {
        return `<span class="sort-icon" style="opacity: 0.3; margin-left: 5px; display: inline-flex; vertical-align: middle;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>
        </span>`;
      }
      const isAsc = squadSortDirection === 'asc';
      return `<span class="sort-icon" style="color: var(--color-accent); margin-left: 5px; display: inline-flex; vertical-align: middle;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="${isAsc ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
        </svg>
      </span>`;
    };

    const logoLarge = renderTeamLogo(teamName, 'xl');
    const teamBadgeSm = renderTeamLogo(teamName, 'xs');
    const teamRecord = allTeams.find(t => {
      const n = (t.Name || t.name || '').trim();
      return n === teamName || normalizePlayerKey(n) === teamNorm;
    }) || {};
    const activeSince = teamRecord['Aktiv seit'] || teamRecord.activeSince || 'Traditionsverein';

    // League table row for active season
    const activeInfo = getActiveSeasonInfo();
    const currentSeasonKey = activeInfo.seasonKey;
    const activeSeasonLabel = activeInfo.label;
    if (!scorerSeasonFilter) {
      scorerSeasonFilter = currentSeasonKey;
    }

    const currentSeason = Store.getData()?.seasons?.[currentSeasonKey] || {};
    const leagueTeams = Store.getLiga ? Store.getLiga(currentSeasonKey) : (currentSeason.teams || []);
    const teamTableEntry = (leagueTeams || []).find(t => normalizePlayerKey(t.name || t.Name) === normalizePlayerKey(teamName)) || {
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0
    };

    const gf = teamTableEntry.goalsFor !== undefined ? Number(teamTableEntry.goalsFor) : (teamTableEntry.gf !== undefined ? Number(teamTableEntry.gf) : 0);
    const ga = teamTableEntry.goalsAgainst !== undefined ? Number(teamTableEntry.goalsAgainst) : (teamTableEntry.ga !== undefined ? Number(teamTableEntry.ga) : 0);
    const gd = teamTableEntry.goalDiff !== undefined ? Number(teamTableEntry.goalDiff) : (teamTableEntry.gd !== undefined ? Number(teamTableEntry.gd) : (gf - ga));
    const pts = teamTableEntry.points !== undefined ? Number(teamTableEntry.points) : 0;
    const played = teamTableEntry.played !== undefined ? Number(teamTableEntry.played) : 0;

    // Fixtures / Matches for this team in 2026/27
    const teamMatches = (currentSeason.matches || []).filter(m => {
      const h = normalizePlayerKey(m.home);
      const a = normalizePlayerKey(m.away);
      const t = normalizePlayerKey(teamName);
      return h.includes(t) || a.includes(t) || t.includes(h) || t.includes(a);
    });

    // Available Seasons for Scorer Dropdown
    const seasonsData = Store.getData()?.seasons || {};
    const rawLeagues = Store.getAdminLeaguesSync ? Store.getAdminLeaguesSync() : [];
    const seasonKeysSet = new Set(Object.keys(seasonsData));
    rawLeagues.forEach(l => {
      if (l.seasonKey) seasonKeysSet.add(l.seasonKey);
    });
    seasonKeysSet.add(currentSeasonKey);
    const sortedKeys = Array.from(seasonKeysSet).sort((a, b) => b.localeCompare(a));

    const seasonOptions = [
      ...sortedKeys.map(k => {
        let label = k;
        if (/^\d{4}\/\d{4}$/.test(k)) {
          const parts = k.split('/');
          label = `Saison ${parts[0]}/${parts[1].slice(2)}`;
        } else if (k.includes('_')) {
          label = `Saison ${k.replace('_', ' ')}`;
        } else if (/^\d{4}$/.test(k)) {
          label = `Saison ${k}`;
        }
        return { key: k, label };
      }),
      { key: 'all', label: 'Alle Saisons (Ewige)' }
    ];

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
            Aktueller Kader: <strong>${activeSquadPlayers.length} aktive Spieler</strong>${inactiveSquadPlayers.length > 0 ? ` <span style="opacity: 0.75;">(${inactiveSquadPlayers.length} inaktiv)</span>` : ''} &bull; DSG Meisterschaft ${activeSeasonLabel}
          </p>
        </div>

        <!-- 2026/27 Season Stats Summary -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; min-width: 260px;">
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary);">${pts}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Punkte</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary);">${played}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Spiele</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent);">${gf}:${ga}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Tore</div>
          </div>
          <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border); border-radius: 6px; padding: 8px 4px;">
            <div style="font-size: 1.2rem; font-weight: 800; color: ${gd > 0 ? 'var(--color-accent)' : (gd < 0 ? '#ef4444' : 'var(--color-text-primary)')};">${gd > 0 ? '+' : ''}${gd}</div>
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-secondary);">Diff</div>
          </div>
        </div>
      </div>

      <!-- Top Scorers & Recent Matches 2-Column Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-xl);">
        
        <!-- Internal Top Scorers Interactive Widget -->
        <div id="team-scorers-widget" class="glass-card" style="padding: var(--space-md); border-radius: var(--border-radius-md);">
          <!-- Populated dynamically by renderScorersWidget -->
        </div>

        <!-- Matches & Results -->
        <div class="glass-card" style="padding: var(--space-md); border-radius: var(--border-radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
            <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
              ${renderIcon('calendar', { size: 18, color: 'var(--color-accent)' })} Spielplan & Ergebnisse
            </h3>
            <span style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 600;">${activeSeasonLabel}</span>
          </div>
          ${teamMatches.length === 0 ? `
            <div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 16px 0; text-align: center;">Keine aktuellen Begegnungen gelistet.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
              ${teamMatches.map(m => {
                const isPlayed = m.score && m.score !== '-:-' && m.score !== '- : -';
                const isCanceled = (m.status || '').toLowerCase().includes('abgesagt');
                const scoreText = isCanceled ? m.status : (isPlayed ? m.score.replace(/\s*\([^)]*\)/g, '').trim() : (m.time ? `${m.time} Uhr` : '-:-'));
                const scoreColor = isCanceled ? '#e74c3c' : (isPlayed ? 'var(--color-accent)' : 'var(--color-text-secondary)');

                // Format date with weekday (e.g. "Fr, 11.09.")
                let dateDisplay = '';
                if (m.date) {
                  const cleanDate = String(m.date).trim();
                  const parts = cleanDate.includes('.') ? cleanDate.split('.') : (cleanDate.includes('-') ? cleanDate.split('-').reverse() : []);
                  if (parts.length >= 2) {
                    dateDisplay = `${parts[0]}.${parts[1]}.`;
                  } else {
                    dateDisplay = cleanDate;
                  }
                  if (m.weekday && m.weekday.trim()) {
                    dateDisplay = `${m.weekday.trim()}, ${dateDisplay}`;
                  }
                }

                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 6px; font-size: 0.88rem; gap: 10px; border: 1px solid var(--color-border);">
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; overflow: hidden;">
                    <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; justify-content: flex-end;">
                      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; font-size: 0.86rem; text-align: right;">${m.home}</span>
                      <a href="#/teams?team=${encodeURIComponent(m.home)}" class="team-logo-link" title="${m.home} Vereinsseite" onclick="event.stopPropagation();">
                        ${renderTeamLogo(m.home, 'xs')}
                      </a>
                    </div>
                    <span style="color: var(--color-text-secondary); font-size: 0.72rem; font-weight: 700; flex-shrink: 0; opacity: 0.8;">vs</span>
                    <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;">
                      <a href="#/teams?team=${encodeURIComponent(m.away)}" class="team-logo-link" title="${m.away} Vereinsseite" onclick="event.stopPropagation();">
                        ${renderTeamLogo(m.away, 'xs')}
                      </a>
                      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; font-size: 0.86rem;">${m.away}</span>
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; min-width: 65px; text-align: right;">
                    <div style="font-weight: 800; font-size: 0.95rem; color: ${scoreColor}; line-height: 1.2;">
                      ${scoreText}
                    </div>
                    ${dateDisplay ? `<div style="font-size: 0.72rem; color: var(--color-text-secondary); font-weight: 500; margin-top: 2px; white-space: nowrap;">${dateDisplay}</div>` : ''}
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Squad / Active Roster -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 1.3rem;">
              ${squadStatusFilter === 'Aktiv' ? `Aktueller Kader (${activeSquadPlayers.length} Spieler)` : (squadStatusFilter === 'Inaktiv' ? `Inaktive Spieler (${inactiveSquadPlayers.length})` : `Gesamtkader (${teamPlayersAll.length} Spieler)`)}
            </h3>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${activeSquadPlayers.length} Aktiv &bull; ${inactiveSquadPlayers.length} Inaktiv / Archiviert
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <!-- Segmented Filter Switcher -->
            <div class="team-squad-filter-group" style="display: inline-flex; background: rgba(0,0,0,0.06); padding: 3px; border-radius: 8px; gap: 4px; border: 1px solid var(--color-border);">
              <button type="button" class="squad-status-btn ${squadStatusFilter === 'Aktiv' ? 'active' : ''}" data-status="Aktiv" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; background: ${squadStatusFilter === 'Aktiv' ? 'var(--color-surface)' : 'transparent'}; color: ${squadStatusFilter === 'Aktiv' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; box-shadow: ${squadStatusFilter === 'Aktiv' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'};">
                Aktive (${activeSquadPlayers.length})
              </button>
              <button type="button" class="squad-status-btn ${squadStatusFilter === 'Inaktiv' ? 'active' : ''}" data-status="Inaktiv" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; background: ${squadStatusFilter === 'Inaktiv' ? 'var(--color-surface)' : 'transparent'}; color: ${squadStatusFilter === 'Inaktiv' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; box-shadow: ${squadStatusFilter === 'Inaktiv' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'};">
                Inaktive (${inactiveSquadPlayers.length})
              </button>
              <button type="button" class="squad-status-btn ${squadStatusFilter === 'all' ? 'active' : ''}" data-status="all" style="padding: 6px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; background: ${squadStatusFilter === 'all' ? 'var(--color-surface)' : 'transparent'}; color: ${squadStatusFilter === 'all' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; box-shadow: ${squadStatusFilter === 'all' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'};">
                Alle (${teamPlayersAll.length})
              </button>
            </div>

            <!-- View Mode Switcher (Galerie / Tabelle) -->
            <div class="dsg-view-switcher">
              <button type="button" class="dsg-view-btn squad-view-btn ${squadViewMode === 'cards' ? 'active' : ''}" data-view="cards" title="Galerie / Karten-Ansicht">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Galerie</span>
              </button>
              <button type="button" class="dsg-view-btn squad-view-btn ${squadViewMode === 'table' ? 'active' : ''}" data-view="table" title="Tabelle / Listen-Ansicht">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span>Tabelle</span>
              </button>
            </div>

            <a href="#/spieler?team=${encodeURIComponent(teamName)}" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.85rem;">
              In Spieler-Datenbank suchen &rarr;
            </a>
          </div>
        </div>

        ${squad.length === 0 ? `
          <div class="glass-card" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary); margin-top: var(--space-md);">
            <p style="margin: 0; font-size: 1rem;">Keine Spieler für diese Auswahl gelistet.</p>
          </div>
        ` : (squadViewMode === 'table' ? `
          <div class="dsg-players-table-wrap">
            <table class="dsg-players-table">
              <thead>
                <tr>
                  <th class="sortable-th ${squadSortField === '#' ? 'active-sort' : ''}" data-sort="#" style="width: 48px; text-align: center; cursor: pointer; user-select: none;" title="Nach Nummer / Rang sortieren">#${getSortIcon('#')}</th>
                  <th class="sortable-th ${squadSortField === 'name' ? 'active-sort' : ''}" data-sort="name" style="cursor: pointer; user-select: none;" title="Nach Namen sortieren">Spieler${getSortIcon('name')}</th>
                  <th class="sortable-th ${squadSortField === 'position' ? 'active-sort' : ''}" data-sort="position" style="cursor: pointer; user-select: none;" title="Nach Position sortieren">Position${getSortIcon('position')}</th>
                  <th class="sortable-th ${squadSortField === 'age' ? 'active-sort' : ''}" data-sort="age" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Alter sortieren">Alter${getSortIcon('age')}</th>
                  <th class="sortable-th ${squadSortField === 'since' ? 'active-sort' : ''}" data-sort="since" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Vereinszugehörigkeit sortieren">Seit${getSortIcon('since')}</th>
                  <th class="sortable-th ${squadSortField === 'goals' ? 'active-sort' : ''}" data-sort="goals" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Toren sortieren">Tore${getSortIcon('goals')}</th>
                  <th class="sortable-th ${squadSortField === 'yellow' ? 'active-sort' : ''}" data-sort="yellow" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Gelben Karten sortieren">Gelb <span style="display:inline-block;width:7px;height:10px;background:#eab308;border-radius:1px;margin-left:2px;vertical-align:middle;"></span>${getSortIcon('yellow')}</th>
                  <th class="sortable-th ${squadSortField === 'yellowRed' ? 'active-sort' : ''}" data-sort="yellowRed" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Gelb-Roten Karten sortieren">G-Rot <span style="display:inline-block;width:7px;height:10px;background:linear-gradient(135deg,#f1c40f 50%,#e74c3c 50%);border-radius:1px;margin-left:2px;vertical-align:middle;"></span>${getSortIcon('yellowRed')}</th>
                  <th class="sortable-th ${squadSortField === 'red' ? 'active-sort' : ''}" data-sort="red" style="text-align: center; cursor: pointer; user-select: none;" title="Nach Roten Karten sortieren">Rot <span style="display:inline-block;width:7px;height:10px;background:#ef4444;border-radius:1px;margin-left:2px;vertical-align:middle;"></span>${getSortIcon('red')}</th>
                  <th style="text-align: right; width: 85px;">Profil</th>
                </tr>
              </thead>
              <tbody>
                ${squad.map((p, idx) => {
                  const avatar = getPlayerAvatar(p.raw);
                  const ageText = p.age ? `${p.age} J.` : '-';
                  const sinceText = formatMemberSince(p.memberSince) || '-';
                  const posBadge = getPosBadgeHtml(p);
                  const inactBadge = !p.isActive ? `<span style="font-size: 0.65rem; padding: 1px 6px; border-radius: 999px; background: rgba(100, 116, 139, 0.2); color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-left: 6px;">Inaktiv</span>` : '';
                  
                  return `
                    <tr class="team-player-row" data-player-id="${p.id}" title="${p.fullName} - Profil & Statistik" style="cursor: pointer;">
                      <td style="text-align: center; color: var(--color-text-secondary); font-weight: 700; font-size: 0.82rem;">${idx + 1}</td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <img src="${avatar}" alt="${p.fullName}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: contain; background: #ffffff; border: 1.5px solid var(--color-border); flex-shrink: 0; ${!p.isActive ? 'filter: grayscale(40%); opacity: 0.8;' : ''}">
                          <div>
                            <div style="font-weight: 700; color: var(--color-text-primary); display: flex; align-items: center;">
                              ${p.fullName}
                              ${inactBadge}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>${posBadge}</td>
                      <td style="text-align: center; color: var(--color-text-secondary); font-size: 0.85rem; font-weight: 600;">${ageText}</td>
                      <td style="text-align: center; color: var(--color-text-secondary); font-size: 0.82rem;">${sinceText}</td>
                      <td style="text-align: center; font-weight: 800; font-size: 0.95rem; color: ${p.goals > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'};">
                        ${p.goals > 0 ? `${renderIcon('ball', { size: 12, color: 'var(--color-accent)' })} ${p.goals}` : '0'}
                      </td>
                      <td style="text-align: center; font-weight: 700; font-size: 0.88rem; color: ${p.yellow > 0 ? '#eab308' : 'var(--color-text-secondary)'};">
                        ${p.yellow > 0 ? `<span style="display:inline-block;width:8px;height:11px;background:#eab308;border-radius:1px;margin-right:3px;vertical-align:middle;"></span>${p.yellow}` : '0'}
                      </td>
                      <td style="text-align: center; font-weight: 700; font-size: 0.88rem; color: ${p.yellowRed > 0 ? '#f1c40f' : 'var(--color-text-secondary)'};">
                        ${p.yellowRed > 0 ? `<span style="display:inline-block;width:8px;height:11px;background:linear-gradient(135deg,#f1c40f 50%,#e74c3c 50%);border-radius:1px;margin-right:3px;vertical-align:middle;"></span>${p.yellowRed}` : '0'}
                      </td>
                      <td style="text-align: center; font-weight: 700; font-size: 0.88rem; color: ${p.red > 0 ? '#ef4444' : 'var(--color-text-secondary)'};">
                        ${p.red > 0 ? `<span style="display:inline-block;width:8px;height:11px;background:#ef4444;border-radius:1px;margin-right:3px;vertical-align:middle;"></span>${p.red}` : '0'}
                      </td>
                      <td style="text-align: right;">
                        <button type="button" class="btn-dsg-sm team-player-modal-btn" data-player-id="${p.id}" title="Statistik & Details">
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Accordion View (Zero Draggable Tables) -->
          <div class="dsg-players-accordion-list">
            ${squad.map((p, idx) => {
              const avatar = getPlayerAvatar(p.raw);
              const ageText = p.age ? `${p.age} J.` : '-';
              const sinceText = formatMemberSince(p.memberSince) || '-';
              const posBadge = getPosBadgeHtml(p);
              const inactBadge = !p.isActive ? `<span style="font-size: 0.65rem; padding: 1px 6px; border-radius: 999px; background: rgba(100, 116, 139, 0.2); color: #94a3b8; font-weight: 800; text-transform: uppercase;">Inaktiv</span>` : '';

              return `
                <div class="dsg-player-acc-card" data-player-id="${p.id}">
                  <div class="dsg-player-acc-header">
                    <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                      <img src="${avatar}" alt="${p.fullName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: contain; background: #ffffff; border: 1.5px solid var(--color-border); flex-shrink: 0; ${!p.isActive ? 'filter: grayscale(40%); opacity: 0.8;' : ''}">
                      <div style="min-width: 0; flex: 1;">
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                          <span>${p.fullName}</span>
                          ${inactBadge}
                        </div>
                        <div style="margin-top: 3px;">
                          ${posBadge}
                        </div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                      <span style="font-size: 0.85rem; font-weight: 800; color: ${p.goals > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; background: ${p.goals > 0 ? 'rgba(0, 179, 65, 0.12)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${p.goals > 0 ? 'rgba(0, 179, 65, 0.25)' : 'var(--color-border)'}; border-radius: 6px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">
                        ${renderIcon('ball', { size: 12, color: p.goals > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)' })} ${p.goals}
                      </span>
                      <span class="dsg-player-acc-chevron">&#9660;</span>
                    </div>
                  </div>

                  <div class="dsg-player-acc-drawer">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px; font-size: 0.82rem;">
                      <div style="background: var(--color-surface); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border);">
                        <div style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Alter</div>
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--color-text-primary); margin-top: 2px;">${ageText}</div>
                        ${p.birthDate ? `<div style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 1px;">${p.birthDate}</div>` : ''}
                      </div>
                      <div style="background: var(--color-surface); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border);">
                        <div style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Mitglied seit</div>
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--color-text-primary); margin-top: 2px;">${sinceText}</div>
                      </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--color-surface); border-radius: 6px; border: 1px solid var(--color-border); font-size: 0.8rem; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
                      <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Kartenkonto:</span>
                      <div style="display: flex; gap: 12px; align-items: center;">
                        <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: ${p.yellow > 0 ? '#eab308' : 'var(--color-text-secondary)'};">
                          <span style="display:inline-block;width:8px;height:11px;background:#eab308;border-radius:1px;"></span> ${p.yellow} Gelb
                        </span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: ${p.yellowRed > 0 ? '#f1c40f' : 'var(--color-text-secondary)'};">
                          <span style="display:inline-block;width:8px;height:11px;background:linear-gradient(135deg,#f1c40f 50%,#e74c3c 50%);border-radius:1px;"></span> ${p.yellowRed} G-Rot
                        </span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: ${p.red > 0 ? '#ef4444' : 'var(--color-text-secondary)'};">
                          <span style="display:inline-block;width:8px;height:11px;background:#ef4444;border-radius:1px;"></span> ${p.red} Rot
                        </span>
                      </div>
                    </div>

                    <div style="text-align: right;">
                      <button type="button" class="btn-dsg-sm btn-acc-open-modal" data-player-id="${p.id}" style="width: 100%; justify-content: center; padding: 8px 12px; font-size: 0.84rem;">
                        Vollständiges Profil & Statistik &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="team-kader-grid">
            ${squad.map(p => {
              const avatar = getPlayerAvatar(p.raw);
              const ageText = p.age ? `${p.age} J.` : '';
              const sinceText = formatMemberSince(p.memberSince);
              const posLabelText = getPlayerPositionLabel(p.raw || p);
              const posLabel = posLabelText ? `<span class="spieler-card-pos-tag">${posLabelText}</span>` : '';
              const statusBadge = !p.isActive ? `
                <span style="position: absolute; top: 8px; right: 8px; background: rgba(100, 116, 139, 0.25); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.4); font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; z-index: 2;">Inaktiv</span>
              ` : (squadStatusFilter === 'all' ? `
                <span style="position: absolute; top: 8px; right: 8px; background: rgba(0, 179, 65, 0.18); color: var(--color-accent); border: 1px solid rgba(0, 179, 65, 0.35); font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; z-index: 2;">Aktiv</span>
              ` : '');

              return `
                <a href="#/spieler?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
                  <div class="spieler-card ${!p.isActive ? 'spieler-card-inactive' : ''}" style="height: 100%; position: relative;">
                    <div class="spieler-card-header" style="height: 170px; position: relative;">
                      ${posLabel}
                      ${statusBadge}
                      <img src="${avatar}" alt="${p.fullName}" class="spieler-card-avatar" style="${!p.isActive ? 'filter: grayscale(40%); opacity: 0.85;' : ''}">
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
                        <span class="spieler-stat-val" style="color: var(--color-accent); font-size: 0.95rem; display: inline-flex; align-items: center; gap: 4px;">
                          ${renderIcon('ball', { size: 13, color: 'var(--color-accent)' })} ${p.goals}
                        </span>
                        <span class="spieler-stat-lbl">Tore</span>
                      </div>
                      <div class="spieler-stat-pill">
                        <span class="spieler-stat-val" style="color: #eab308; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 4px;">
                          <span style="display:inline-block;width:9px;height:12px;background:#eab308;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span> ${p.yellow}
                        </span>
                        <span class="spieler-stat-lbl">Gelb</span>
                      </div>
                      <div class="spieler-stat-pill" title="Gelb-Rote Karten">
                        <span class="spieler-stat-val" style="color: #f1c40f; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 4px;">
                          <span style="display:inline-block;width:9px;height:12px;background:linear-gradient(135deg, #f1c40f 50%, #e74c3c 50%);border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span> ${p.yellowRed}
                        </span>
                        <span class="spieler-stat-lbl">G-Rot</span>
                      </div>
                      <div class="spieler-stat-pill">
                        <span class="spieler-stat-val" style="color: #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 4px;">
                          <span style="display:inline-block;width:9px;height:12px;background:#ef4444;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span> ${p.red}
                        </span>
                        <span class="spieler-stat-lbl">Rot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      `)}
      </div>
    `;

    // Render interactive scorers widget
    const renderScorersWidget = () => {
      const scorersWidgetEl = document.getElementById('team-scorers-widget');
      if (!scorersWidgetEl) return;

      const scorers = getTeamScorers(teamName, scorerSeasonFilter);
      const totalCount = scorers.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / SCORERS_PER_PAGE));

      if (scorerCurrentPage > totalPages) scorerCurrentPage = totalPages;
      if (scorerCurrentPage < 1) scorerCurrentPage = 1;

      let displayedScorers = [];
      let startIndex = 0;

      if (!showAllScorers) {
        displayedScorers = scorers.slice(0, 5);
      } else {
        startIndex = (scorerCurrentPage - 1) * SCORERS_PER_PAGE;
        displayedScorers = scorers.slice(startIndex, startIndex + SCORERS_PER_PAGE);
      }

      scorersWidgetEl.innerHTML = `
        <div class="team-scorer-header-wrap">
          <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            ${renderIcon('ball', { size: 18, color: 'var(--color-accent)' })} Vereins-Torschützen ${!showAllScorers && totalCount > 5 ? '<span style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: normal;">(Top 5)</span>' : ''}
          </h3>
          <select id="team-scorer-season-select" style="background: var(--color-surface); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: 6px; padding: 6px 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; max-width: 180px; outline: none;">
            ${seasonOptions.map(opt => `<option value="${opt.key}" ${opt.key === scorerSeasonFilter ? 'selected' : ''}>${opt.label}</option>`).join('')}
          </select>
        </div>

        ${totalCount === 0 ? `
          <div style="color: var(--color-text-secondary); font-size: 0.9rem; padding: 20px 0; text-align: center;">
            Keine registrierten Torschützen für diesen Filter.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${displayedScorers.map((p, idx) => {
              const absoluteRank = showAllScorers ? (startIndex + idx + 1) : (idx + 1);
              let rankColor = 'var(--color-text-secondary)';
              if (absoluteRank === 1) rankColor = '#eab308';
              else if (absoluteRank === 2) rankColor = '#94a3b8';
              else if (absoluteRank === 3) rankColor = '#d97706';

              return `
                <a href="${p.link}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 6px; text-decoration: none; color: var(--color-text-primary); transition: background var(--transition-fast);" class="scorer-row-hover">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 800; color: ${rankColor}; width: 22px; text-align: right;">${absoluteRank}.</span>
                    <span style="font-weight: 700;">${p.name}</span>
                  </div>
                  <span style="font-weight: 800; color: var(--color-accent); font-size: 0.95rem;">
                    ${p.goals} ${p.goals === 1 ? 'Tor' : 'Tore'}
                  </span>
                </a>
              `;
            }).join('')}
          </div>
        `}

        ${totalCount > 5 ? `
          <div style="margin-top: 12px;">
            ${!showAllScorers ? `
              <button id="btn-toggle-all-scorers" style="width: 100%; padding: 7px 12px; font-size: 0.82rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; color: var(--color-accent); border: 1px solid rgba(0, 179, 65, 0.35); background: rgba(0, 179, 65, 0.06); transition: all var(--transition-fast);">
                Alle ${totalCount} Torschützen anzeigen ▾
              </button>
            ` : `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid var(--color-border); gap: 6px;">
                <button id="btn-prev-scorers" ${scorerCurrentPage <= 1 ? 'disabled' : ''} style="padding: 4px 10px; font-size: 0.78rem; font-weight: 600; cursor: ${scorerCurrentPage <= 1 ? 'not-allowed' : 'pointer'}; opacity: ${scorerCurrentPage <= 1 ? '0.4' : '1'}; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text-primary);">
                  &larr; Zurück
                </button>
                <span style="font-size: 0.78rem; color: var(--color-text-secondary); font-weight: 600; text-align: center;">
                  Seite ${scorerCurrentPage} / ${totalPages} (${totalCount} Spieler)
                </span>
                <button id="btn-next-scorers" ${scorerCurrentPage >= totalPages ? 'disabled' : ''} style="padding: 4px 10px; font-size: 0.78rem; font-weight: 600; cursor: ${scorerCurrentPage >= totalPages ? 'not-allowed' : 'pointer'}; opacity: ${scorerCurrentPage >= totalPages ? '0.4' : '1'}; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text-primary);">
                  Weiter &rarr;
                </button>
              </div>
              <button id="btn-toggle-top5-scorers" style="width: 100%; padding: 5px 12px; font-size: 0.78rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; color: var(--color-text-secondary); border: 1px dashed var(--color-border); background: transparent; transition: all var(--transition-fast);">
                Nur Top 5 anzeigen ▴
              </button>
            `}
          </div>
        ` : ''}
      `;

      // Event listeners
      const selectEl = document.getElementById('team-scorer-season-select');
      if (selectEl) {
        selectEl.addEventListener('change', (e) => {
          scorerSeasonFilter = e.target.value;
          scorerCurrentPage = 1;
          renderScorersWidget();
        });
      }

      const btnShowAll = document.getElementById('btn-toggle-all-scorers');
      if (btnShowAll) {
        btnShowAll.addEventListener('click', () => {
          showAllScorers = true;
          scorerCurrentPage = 1;
          renderScorersWidget();
        });
      }

      const btnShowTop5 = document.getElementById('btn-toggle-top5-scorers');
      if (btnShowTop5) {
        btnShowTop5.addEventListener('click', () => {
          showAllScorers = false;
          scorerCurrentPage = 1;
          renderScorersWidget();
        });
      }

      const btnPrev = document.getElementById('btn-prev-scorers');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (scorerCurrentPage > 1) {
            scorerCurrentPage--;
            renderScorersWidget();
          }
        });
      }

      const btnNext = document.getElementById('btn-next-scorers');
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (scorerCurrentPage < totalPages) {
            scorerCurrentPage++;
            renderScorersWidget();
          }
        });
      }
    };

    renderScorersWidget();

    // Bind squad status buttons
    teamContainer.querySelectorAll('.squad-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        squadStatusFilter = btn.getAttribute('data-status') || 'Aktiv';
        renderTeamDetails(teamName);
      });
    });

    // Bind mobile accordion toggles
    teamContainer.querySelectorAll('.dsg-player-acc-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        const card = header.closest('.dsg-player-acc-card');
        if (!card) return;
        card.classList.toggle('open');
      });
    });

    // Bind modal openers inside mobile accordion
    teamContainer.querySelectorAll('.btn-acc-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.getAttribute('data-player-id');
        const playerObj = squad.find(p => String(p.id) === String(pId)) || allPlayers.find(p => String(p['#'] || p.id || p.ID) === String(pId));
        if (playerObj) {
          openPlayerStatsModal(playerObj.raw || playerObj, { teamName, seasonKey: currentSeasonKey });
        }
      });
    });

    // Bind table column sorting
    teamContainer.querySelectorAll('.dsg-players-table th.sortable-th').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.getAttribute('data-sort');
        if (!sortKey) return;
        if (squadSortField === sortKey) {
          squadSortDirection = squadSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          squadSortField = sortKey;
          if (['name', 'position', '#'].includes(sortKey)) {
            squadSortDirection = 'asc';
          } else {
            squadSortDirection = 'desc';
          }
        }
        renderTeamDetails(teamName);
      });
    });

    // Bind squad view mode buttons
    teamContainer.querySelectorAll('.squad-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-view') || 'cards';
        squadViewMode = mode;
        localStorage.setItem('dsg_player_view_mode', mode);
        renderTeamDetails(teamName);
      });
    });

    // Bind squad player clicks to open stats modal in-place
    teamContainer.querySelectorAll('.team-player-row, .team-kader-grid a').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const pId = el.getAttribute('data-player-id') || el.getAttribute('href')?.replace('#/spieler?id=', '');
        const playerObj = squad.find(p => String(p.id) === String(pId)) || allPlayers.find(p => String(p['#'] || p.id || p.ID) === String(pId));
        if (playerObj) {
          openPlayerStatsModal(playerObj.raw || playerObj, { teamName, seasonKey: currentSeasonKey });
        }
      });
    });
  };

  const renderSelector = () => {
    if (!selectorGrid) return;
    selectorGrid.innerHTML = activeTeamsList.map(tName => {
      const isSelected = tName === selectedTeamName;
      const logoHTML = renderTeamLogo(tName, 'sm');
      const count = allPlayers.filter(p => {
        const tm = sanitizeMojibake((p.Team || p.team || '').trim());
        const isAct = (p.Status || p.status) === 'Aktiv';
        return isAct && (tm === tName || normalizePlayerKey(tm) === normalizePlayerKey(tName));
      }).length;

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
        showAllScorers = false;
        scorerCurrentPage = 1;
        renderSelector();
        renderTeamDetails(selectedTeamName);
      });
    });
  };

  renderSelector();
  renderTeamDetails(selectedTeamName);
};


