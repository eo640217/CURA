# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```powershell
npm run dev      # dev server on http://localhost:5173
npm run build    # production build
npm run lint     # ESLint
npm run preview  # preview production build
```

Backend must be running on port 8080. Vite proxies `/api/*` to `http://localhost:8080`; see `vite.config.js`. The Axios instance in `src/api/http.ts` uses `http://localhost:8080/api/v1` as its base URL directly (not the proxy path), so both mechanisms are in play.

## Route map

| Path | View | Guard | Status |
|------|------|-------|--------|
| `/` | HomeView | public | live |
| `/login` | LoginView | public | live |
| `/dashboard` | DashboardView | auth | live |
| `/facilities` | FacilitiesView | auth | live |
| `/residents/directory` | ResidentsDirectoryView | auth | live |
| `/units` | UnitsView | auth | stub |
| `/hours` | HoursView | auth | stub |
| `/admin` | AdminView | auth + ADMIN | stub |
| `/admin/users` | AdminUsersView | auth + ADMIN | live |

All protected routes nest inside `AppShell` as the layout via an `Outlet`. Admin routes use `RequireRole` wrapping `RequireAuth`. Fallback `*` redirects to `/`.

Adding a new page requires: a route in `App.tsx`, a view in `src/views/`, and an entry in `src/components/sidebarConfig.ts`.

## API layer

All HTTP calls go through four helpers in `src/api/http.ts`:

```typescript
apiGet<T>(path: string): Promise<T>
apiPost<T>(path: string, body?: unknown): Promise<T>
apiPut<T>(path: string, body?: unknown): Promise<T>
apiPatch<T>(path: string, body?: unknown): Promise<T>
```

The request interceptor attaches `Authorization: Bearer {token}` from `getAuth().token`. The response interceptor clears auth and redirects to `/login` on 401.

One API module per domain area lives in `src/api/`. Use `apiErrorMessage(err)` from `src/api/api-error.ts` to extract a human-readable message from any caught error.

## Data-fetching pattern

Components use a discriminated union for async state rather than separate loading/error booleans:

```typescript
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Favour exhaustive `switch`/`if` blocks over optional chaining on `data`.

## Auth

Auth state is stored in localStorage under key `cura_auth`:

```typescript
type AuthState = {
  token: string | null;
  username: string | null;
  role: "ADMIN" | "STAFF" | null;
};
```

Use `useAuthState()` from `src/auth/useAuth.ts` inside components — it returns `{ auth, isAuthed, isAdmin }`. Use `getAuth()` / `setAuth()` / `clearAuth()` from `src/auth/auth.ts` when you need to read or update state outside a component (e.g., in the Axios interceptor).

## Sidebar

`src/components/sidebarConfig.ts` exports a typed array of nav items. Items with a `roles` field are only rendered for matching roles. Stubs present in config but without a working view: **Settings**, **Profile**, **Audit Logs**.

Icons use Boxicons CSS classes loaded via CDN (`bx bxs-* bx-sm`).

## Styling

Global SCSS tokens live in `src/styles/`. Component styles are co-located as `*.scss` files alongside the component.

Dark mode: the `AppShell` toggles the `.dark` class on `document.body` and persists the preference to localStorage under `cura.dark`. Style dark variants with `body.dark .your-class { … }`.

Use CSS variables defined in `_tokens.scss` for colors and spacing rather than hardcoded values.

## i18n

All user-facing strings live in `src/assets/en.json`. Import the typed lexicon:

```typescript
import { lexicon as t } from "../assets/lexicon";
// t.facilities.addFacility, t.common.loading, etc.
```

For interpolated strings the lexicon supports a `vars` map:
```typescript
t("common.pageOf", { page: 1, totalPages: 5 })
```

Add new keys to `en.json` and access them through `lexicon` — never hardcode display text inline.
