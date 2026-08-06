type AuthState = {
  token: string | null;
  username: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | null;
  userNumber: string | null;
  orgCode: string | null;
};

const KEY = "cura_auth";

const EMPTY: AuthState = { token: null, username: null, role: null, userNumber: null, orgCode: null };

export function getAuth(): AuthState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return EMPTY;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return EMPTY;
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

const ROLE_LEVEL: Record<string, number> = { STAFF: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export function roleAtLeast(
  userRole: string | null,
  required: "STAFF" | "ADMIN" | "SUPER_ADMIN"
): boolean {
  if (!userRole) return false;
  return (ROLE_LEVEL[userRole] ?? 0) >= ROLE_LEVEL[required];
}
