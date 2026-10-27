// Role-Based Authentication & PIN Mapping for DSG Liga

export const PIN_ROLES = {
  '1111': {
    role: 'admin',
    name: 'Hauptadministrator',
    label: 'Liga-Vorstand'
  },
  '2222': {
    role: 'team',
    teamId: 'croatia',
    teamName: 'SV Croatia Linz',
    label: 'Team Manager: SV Croatia Linz'
  },
  '3333': {
    role: 'team',
    teamId: 'heiligenberg',
    teamName: 'Union Heiligenberg',
    label: 'Team Manager: Union Heiligenberg'
  },
  '4444': {
    role: 'team',
    teamId: 'etehad',
    teamName: 'Etehad Linz',
    label: 'Team Manager: Etehad Linz'
  },
  '5555': {
    role: 'team',
    teamId: 'oed',
    teamName: 'DSG St. Josef/Oed FC',
    label: 'Team Manager: DSG St. Josef/Oed FC'
  },
  '6666': {
    role: 'team',
    teamId: 'walker',
    teamName: 'Walker FC',
    label: 'Team Manager: Walker FC'
  },
  '7777': {
    role: 'team',
    teamId: 'gornjak',
    teamName: 'FC Gornjak',
    label: 'Team Manager: FC Gornjak'
  },
  '8888': {
    role: 'team',
    teamId: 'traun',
    teamName: 'DSG Union Traun',
    label: 'Team Manager: DSG Union Traun'
  },
  '9999': {
    role: 'referee',
    name: 'Schiedsrichter-Pool',
    label: 'Offizieller Schiedsrichter'
  }
};

export function getAuth() {
  try {
    const raw = sessionStorage.getItem('dsg_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) {
        return { ...parsed, isLoggedIn: true };
      }
    }
    // Backward compatibility for legacy 'dsg_admin' session
    if (sessionStorage.getItem('dsg_admin') === 'true') {
      return { ...PIN_ROLES['1111'], isLoggedIn: true, pin: '1111' };
    }
  } catch (e) {}
  return { isLoggedIn: false, role: null };
}

export function loginWithPin(pin) {
  const cleanPin = String(pin || '').trim();
  const roleConfig = PIN_ROLES[cleanPin];
  if (roleConfig) {
    const authData = { ...roleConfig, pin: cleanPin, isLoggedIn: true };
    sessionStorage.setItem('dsg_auth', JSON.stringify(authData));
    sessionStorage.setItem('dsg_admin', roleConfig.role === 'admin' ? 'true' : 'false');
    if (roleConfig.role === 'admin') {
      sessionStorage.setItem('dsg_admin_tab', 'admin-approvals');
    }
    return { success: true, user: authData };
  }
  return { success: false, error: 'Ungültiger PIN. Bitte prüfe deine Eingabe.' };
}

export function logout() {
  sessionStorage.removeItem('dsg_auth');
  sessionStorage.removeItem('dsg_admin');
  sessionStorage.removeItem('dsg_admin_tab');
}
