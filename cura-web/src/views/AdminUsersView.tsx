import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "../api/api-error";
import { registerUser, listUsers, UserResponse } from "../api/api-users";
import lexicon from "../assets/lexicon";
import "./AdminUsersView.scss";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TopBar from "../components/TopBar";

export default function AdminUsersView() {
  const t = lexicon;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const debouncedQ = useMemo(() => q.trim(), [q]);

  async function loadUsers(query?: string) {
    try {
      setListError(null);
      setListLoading(true);
      const data = await listUsers(query);
      setUsers(data);
    } catch (e: any) {
      setListError(apiErrorMessage(e));
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    const tmr = setTimeout(() => loadUsers(debouncedQ), 250);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!username.trim()) return setErr(t.createFacility?.nameRequired ?? "Username is required");
    if (!password.trim() || password.trim().length < 6) return setErr("Password must be at least 6 characters");

    try {
      setLoading(true);
      const created = await registerUser({ username: username.trim(), password: password.trim(), role });
      setMsg(`Created ${created.username} (${created.role})`);
      await loadUsers(debouncedQ);
      setUsername("");
      setPassword("password");
      setRole("STAFF");
    } catch (e: any) {
      setErr(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adminUsersView">
      <TopBar />
      <div className="adminUsers">
        <div className="adminUsers__header">
            <a className="adminUsers__backLink" href="/dashboard"><ArrowBackIcon fontSize="small" /></a>
          <h2>{t.adminUsers.title}</h2>
        </div>

        <div className="adminUsers__card">
          <h3 style={{ marginTop: 0 }}>{t.adminUsers.create_user}</h3>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <div className="adminUsers__grid3">
              <div>
                <label className="label">{t.adminUsers.usernameLabel}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  placeholder={t.adminUsers.usernamePlaceholder}
                />
              </div>

              <div>
                <label className="label">{t.adminUsers.tempPasswordLabel}</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="text"
                  autoComplete="off"
                />
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  {t.adminUsers.tempPasswordHint}
                </div>
              </div>

              <div>
                <label className="label">{t.adminUsers.roleLabel}</label>
                <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <button className="primary" type="submit" disabled={loading} style={{ justifySelf: "start" }}>
              {loading ? t.common.creating : t.adminUsers.create_user}
            </button>

            {err && <div className="error">{err}</div>}
            {msg && <div className="success">{msg}</div>}
          </form>

          <div className="adminUsers__listCard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <h3 style={{ margin: 0 }}>{t.adminUsers.usersTitle}</h3>
              <button className="ghost" onClick={() => loadUsers(debouncedQ)} disabled={listLoading}>
                {t.common.refresh}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.adminUsers.searchPlaceholder}
                style={{ flex: 1 }}
              />
              <span className="muted" style={{ fontSize: 12 }}>
                {users.length} {t.adminUsers.results}
              </span>
            </div>

            {listLoading && <div style={{ marginTop: 12 }}>{t.common.loading}</div>}
            {listError && <div className="error" style={{ marginTop: 12 }}>{listError}</div>}

            {!listLoading && !listError && (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {users.length === 0 ? (
                  <div className="muted">{t.adminUsers.empty}</div>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="adminUsers__row">
                      <div>
                        <div style={{ fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>{u.username}</div>
                        <div className="muted" style={{ fontSize: 12 }}>ID {u.id}</div>
                      </div>
                      <span className="pill">{u.role}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="adminUsers__note">{t.adminUsers.adminOnlyNote}</div>
      </div>
    </div>
  );
}
