import { getAuth } from "./auth";

export function useAuthState() {
  const auth = getAuth();
  return {
    ...auth,
    isAuthed: !!auth.token,
    isAdmin: auth.role === "ADMIN",
  };
}
