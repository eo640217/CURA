type AuthState = {
  token: string | null;
  username: string | null;
  role: "ADMIN" | "STAFF" | null;
};

const KEY = "cura_auth";

export function getAuth(): AuthState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { token: null, username: null, role: null };
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, username: null, role: null };
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
