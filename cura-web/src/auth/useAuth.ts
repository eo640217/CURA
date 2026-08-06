import { getAuth, roleAtLeast } from "./auth";

export function useAuthState() {
  const auth = getAuth();
  return {
    ...auth,
    isAuthed: !!auth.token,
    isAdmin: roleAtLeast(auth.role, "ADMIN"),
  };
}
