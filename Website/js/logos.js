// Team Logos & Default Badges Resolver
import { Store } from './store.js?v=1791178000000';

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

export function getCustomMonochromeLogo(teamName) {
  if (!teamName) return null;
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : String(teamName);
  const nameStr = rawName.trim().toLowerCase();

  if (typeof teamName === 'object' && (teamName.monochromeLogoUrl || teamName.monochromeLogo || teamName.MonochromeLogo || teamName.monoLogoUrl)) {
    return teamName.monochromeLogoUrl || teamName.monochromeLogo || teamName.MonochromeLogo || teamName.monoLogoUrl;
  }

  try {
    if (Store && typeof Store.getAdminTeamsSync === 'function') {
      const teams = Store.getAdminTeamsSync();
      if (Array.isArray(teams)) {
        const found = teams.find(t => (t.Name || t.name || '').trim().toLowerCase() === nameStr);
        if (found && (found.monochromeLogoUrl || found.monochromeLogo || found.MonochromeLogo || found.monoLogoUrl)) {
          return found.monochromeLogoUrl || found.monochromeLogo || found.MonochromeLogo || found.monoLogoUrl;
        }
      }
    }
  } catch (e) {
    // fallback gracefully
  }
  return null;
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

export function getTeamLogoData(teamName) {
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : String(teamName || '');
  if (!rawName.trim()) {
    return { url: DEFAULT_BADGES[0], isMonochrome: false, isFallback: true };
  }

  // 1. Check if custom monochrome logo was uploaded
  const customMono = getCustomMonochromeLogo(teamName);
  if (customMono) {
    return { url: customMono, isMonochrome: true, isFallback: false };
  }

  // 2. Check if custom standard logo was uploaded
  const custom = getCustomTeamLogo(teamName);
  if (custom) {
    return { url: custom, isMonochrome: false, isFallback: false };
  }

  // 3. Check preset monochrome logos (14 active and historic teams)
  const norm = rawName.toLowerCase()
    .replace(/ä|ae|ã¤/g, 'ae')
    .replace(/ö|oe|ã¶/g, 'oe')
    .replace(/ü|ue|ã¼/g, 'ue')
    .replace(/ß|ss|ãŸ/g, 'ss')
    .replace(/[^a-z0-9]/g, '');

  if (norm.includes('croatia')) return { url: 'Logos/monochrome/croatia.png', isMonochrome: true, isFallback: false };
  if (norm.includes('auberg')) return { url: 'Logos/monochrome/dsgauberg.png', isMonochrome: true, isFallback: false };
  if (norm.includes('froschberg')) return { url: 'Logos/monochrome/dsgfroschberg.png', isMonochrome: true, isFallback: false };
  if (norm.includes('traun')) return { url: 'Logos/monochrome/dsgtraun.png', isMonochrome: true, isFallback: false };
  if (norm.includes('etehad')) return { url: 'Logos/monochrome/etehad.png', isMonochrome: true, isFallback: false };
  if (norm.includes('bruck')) return { url: 'Logos/monochrome/fcbruck.png', isMonochrome: true, isFallback: false };
  if (norm.includes('gornjak')) return { url: 'Logos/monochrome/fcgornjak.png', isMonochrome: true, isFallback: false };
  if (norm.includes('hinzenbach')) return { url: 'Logos/monochrome/fchinzenbach.png', isMonochrome: true, isFallback: false };
  if (norm.includes('geboltskirchen')) return { url: 'Logos/monochrome/geboltskirchen.png', isMonochrome: true, isFallback: false };
  if (norm.includes('oed') || norm.includes('josef')) return { url: 'Logos/monochrome/oed.png', isMonochrome: true, isFallback: false };
  if (norm.includes('schleissheim') || norm.includes('schleisheim')) return { url: 'Logos/monochrome/schleissheim.png', isMonochrome: true, isFallback: false };
  if (norm.includes('goldwoerth') || norm.includes('goldworth') || norm.includes('goldw')) return { url: 'Logos/monochrome/uniongoldwoerth.png', isMonochrome: true, isFallback: false };
  if (norm.includes('heiligenberg')) return { url: 'Logos/monochrome/unionheiligenberg.png', isMonochrome: true, isFallback: false };
  if (norm.includes('walker')) return { url: 'Logos/monochrome/walker.png', isMonochrome: true, isFallback: false };

  // 4. Other historic/preset standard logos
  if (norm.includes('thalheim')) return { url: 'Logos/Ready/standard/dsgthalheim.png', isMonochrome: false, isFallback: false };
  if (norm.includes('eschenau')) return { url: 'Logos/Ready/standard/eschenau.png', isMonochrome: false, isFallback: false };

  // 5. Deterministic default shield badge fallback
  return { url: getDefaultBadge(rawName), isMonochrome: false, isFallback: true };
}

export function getTeamLogoUrl(teamName) {
  return getTeamLogoData(teamName).url;
}

export function renderTeamLogo(teamName, size = 'sm', extraClass = '') {
  const rawName = typeof teamName === 'object' ? (teamName.Name || teamName.name || '') : (teamName || '');
  const name = String(rawName).trim();
  const data = getTeamLogoData(teamName);
  const fallback = getDefaultBadge(name);
  const monoClass = data.isMonochrome ? 'team-logo-monochrome' : '';
  const classNames = `team-logo ${monoClass} team-logo-${size} ${extraClass}`.trim().replace(/\s+/g, ' ');
  return `<img src="${data.url}" alt="${name || 'Team'}" class="${classNames}" onerror="this.onerror=null; this.classList.remove('team-logo-monochrome'); this.src='${fallback}';" loading="lazy" />`;
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

