// Team Logos & Default Badges Resolver

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
  const idx = getTeamHash(teamName) % DEFAULT_BADGES.length;
  return DEFAULT_BADGES[idx];
}

export function getTeamLogoUrl(teamName) {
  if (!teamName) return DEFAULT_BADGES[0];
  const norm = String(teamName).toLowerCase()
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

  return getDefaultBadge(teamName);
}

export function renderTeamLogo(teamName, size = 'sm', extraClass = '') {
  const name = (teamName || '').trim();
  const url = getTeamLogoUrl(name);
  const fallback = getDefaultBadge(name);
  return `<img src="${url}" alt="${name || 'Team'}" class="team-logo team-logo-${size} ${extraClass}" onerror="this.onerror=null; this.src='${fallback}';" loading="lazy" />`;
}
