// Team Logos & Default Badges Resolver
import { Store } from './store.js?v=1791172000000';

export const DEFAULT_BADGES = [
  'Logos/Ready/standard/default/shield_01_classic_heater.png',
  'Logos/Ready/standard/default/shield_02_iberian_rounded.png',
  'Logos/Ready/standard/default/shield_03_swiss_notched.png',
  'Logos/Ready/standard/default/shield_04_florentine_scalloped.png',
  'Logos/Ready/standard/default/shield_05_modern_hexagonal.png',
  'Logos/Ready/standard/default/shield_06_crown_crenellated.png',
  'Logos/Ready/standard/default/shield_07_gothic_ogive.png',
  'Logos/Ready/standard/default/shield_08_stadium_pill.png',
  'Logos/Ready/standard/default/shield_09_diamond_lozenge.png',
  'Logos/Ready/standard/default/shield_10_pointed_scutum.png'
];

export function getTeamHash(name) {
  let hash = 0;
  const str = String(name || '').toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDefaultBadge(teamName) {
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : (teamName || '');
  const idx = getTeamHash(rawName) % DEFAULT_BADGES.length;
  return DEFAULT_BADGES[idx];
}

export function getCustomTeamLogo(teamName) {
  if (!teamName) return null;
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : String(teamName);
  const nameStr = rawName.trim().toLowerCase();
  
  if (typeof teamName === 'object' && (teamName.logoUrl || teamName.logo || teamName.Logo)) {
    return teamName.logoUrl || teamName.logo || teamName.Logo;
  }

  try {
    if (Store && typeof Store.getAdminTeamsSync === 'function') {
      const teams = Store.getAdminTeamsSync();
      if (Array.isArray(teams)) {
        const found = teams.find(t => (t.Name || t.name || '').trim().toLowerCase() === nameStr);
        if (found && (found.logoUrl || found.logo || found.Logo)) {
          return found.logoUrl || found.logo || found.Logo;
        }
      }
    }
  } catch (e) {
    // fallback gracefully
  }
  return null;
}

export function getTeamLogoUrl(teamName) {
  if (!teamName) return DEFAULT_BADGES[0];

  // 1. Check if an admin uploaded a custom logo
  const custom = getCustomTeamLogo(teamName);
  if (custom) return custom;

  // 2. Check standard presets
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : String(teamName);
  const norm = rawName.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');

  if (norm.includes('croatia')) return 'Logos/Ready/standard/croatia.png';
  if (norm.includes('auberg')) return 'Logos/Ready/standard/dsgauberg.png';
  if (norm.includes('froschberg')) return 'Logos/Ready/standard/dsgfroschberg.png';
  if (norm.includes('thalheim')) return 'Logos/Ready/standard/dsgthalheim.png';
  if (norm.includes('traun')) return 'Logos/Ready/standard/dsgtraun.png';
  if (norm.includes('eschenau')) return 'Logos/Ready/standard/eschenau.png';
  if (norm.includes('etehad')) return 'Logos/Ready/standard/etehad.png';
  if (norm.includes('bruck')) return 'Logos/Ready/standard/fcbruck.png';
  if (norm.includes('gornjak')) return 'Logos/Ready/standard/fcgornjak.png';
  if (norm.includes('hinzenbach')) return 'Logos/Ready/standard/fchinzenbach.png';
  if (norm.includes('geboltskirchen')) return 'Logos/Ready/standard/geboltskirchen.png';
  if (norm.includes('oed') || norm.includes('josef')) return 'Logos/Ready/standard/oed.png';
  if (norm.includes('schleissheim') || norm.includes('schleisheim')) return 'Logos/Ready/standard/schleissheim.png';
  if (norm.includes('goldwoerth') || norm.includes('goldworth')) return 'Logos/Ready/standard/uniongoldwoerth.png';
  if (norm.includes('heiligenberg')) return 'Logos/Ready/standard/unionheiligenberg.png';
  if (norm.includes('walker')) return 'Logos/Ready/standard/walker.png';

  // 3. Deterministic default shield badge fallback
  return getDefaultBadge(rawName);
}

export function renderTeamLogo(teamName, size = 'sm', extraClass = '') {
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : (teamName || '');
  const name = String(rawName).trim();
  const url = getTeamLogoUrl(teamName);
  const fallback = getDefaultBadge(name);
  return `<img src="${url}" alt="${name || 'Team'}" class="team-logo team-logo-${size} ${extraClass}" onerror="this.onerror=null; this.src='${fallback}';" loading="lazy" />`;
}

export function renderNewsFallbackHeader(tag = 'NEWSLETTER') {
  return `
    <div class="news-fallback-header">
      <svg class="pitch-svg" viewBox="0 0 350 180" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="1.5">
        <rect x="20" y="15" width="310" height="150" rx="2" />
        <line x1="175" y1="15" x2="175" y2="165" />
        <circle cx="175" cy="90" r="36" />
        <circle cx="175" cy="90" r="2.5" fill="white" />
        <rect x="20" y="45" width="55" height="90" />
        <rect x="20" y="65" width="20" height="50" />
        <circle cx="58" cy="90" r="2" fill="white" />
        <path d="M 75 72 A 32 32 0 0 1 75 108" />
        <rect x="10" y="72" width="10" height="36" stroke-dasharray="2 2" opacity="0.5" />
        <rect x="275" y="45" width="55" height="90" />
        <rect x="310" y="65" width="20" height="50" />
        <circle cx="292" cy="90" r="2" fill="white" />
        <path d="M 275 72 A 32 32 0 0 0 275 108" />
        <rect x="330" y="72" width="10" height="36" stroke-dasharray="2 2" opacity="0.5" />
        <path d="M 20 23 A 8 8 0 0 0 28 15" />
        <path d="M 20 157 A 8 8 0 0 1 28 165" />
        <path d="M 330 23 A 8 8 0 0 1 322 15" />
        <path d="M 330 157 A 8 8 0 0 0 322 165" />
      </svg>
      <img class="news-fallback-logo" src="Logos/Ready/standard/DSGLiga_white.png" alt="DSG Liga">
      <div class="news-fallback-tag">${tag}</div>
      <div class="news-fallback-accent"></div>
    </div>
  `;
}

