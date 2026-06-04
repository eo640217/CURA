import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api-auth";
import { setAuth } from "../auth/auth";
import "./AuthView.scss";

type Mode = "org" | "platform";

export default function LoginView() {
  const navigate = useNavigate();

  const [mode, setMode]             = useState<Mode>("org");
  const [orgCode, setOrgCode]       = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [username, setUsername]     = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const req = mode === "org"
        ? { orgCode: orgCode.trim().toUpperCase(), userNumber: userNumber.trim(), password }
        : { username: username.trim(), password };

      const data = await login(req);
      setAuth({
        token: data.token,
        username: data.username,
        role: data.role,
        userNumber: data.userNumber,
        orgCode: data.orgCode,
      });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-panel">

          <div className="auth-brand">
            <div className="auth-brand__mark">C.</div>
            <span className="auth-brand__name">Cura</span>
          </div>

          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your care management dashboard.</p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${mode === "org" ? " auth-tab--active" : ""}`}
              onClick={() => { setMode("org"); setError(null); }}
            >
              Organization
            </button>
            <button
              type="button"
              className={`auth-tab${mode === "platform" ? " auth-tab--active" : ""}`}
              onClick={() => { setMode("platform"); setError(null); }}
            >
              Platform Admin
            </button>
          </div>

          <form onSubmit={onSubmit}>
            {mode === "org" ? (
              <>
                <div className="auth-group">
                  <label>Organization Code</label>
                  <input
                    value={orgCode}
                    onChange={e => setOrgCode(e.target.value)}
                    placeholder="e.g. SUNRISE"
                    autoCapitalize="characters"
                    autoComplete="organization"
                  />
                </div>
                <div className="auth-group">
                  <label>User Number</label>
                  <input
                    value={userNumber}
                    onChange={e => setUserNumber(e.target.value)}
                    placeholder="6-digit number"
                    inputMode="numeric"
                    autoComplete="username"
                  />
                </div>
              </>
            ) : (
              <div className="auth-group">
                <label>Username</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="auth-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {error && <div className="auth-error">{error}</div>}
          </form>

        </div>
      </div>
    </div>
  );
}
