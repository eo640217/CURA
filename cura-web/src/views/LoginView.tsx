import { FormEvent, useState } from "react";
import { login } from "../api/api-auth";
import { setAuth } from "../auth/auth";
import lexicon from "../assets/lexicon";
import "./LoginView.scss";

export default function LoginView() {
  const t = lexicon;

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({ username, password });
      setAuth({ token: data.token, username: data.username, role: data.role });
      window.location.href = "/dashboard";
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t.login.loginFailed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <div className="curaCard">
        <div className="curaPanel">
          <div className="curaHeader">
            <h1>{t.login.title}</h1>
            <p>{t.login.subtitle}</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="curaGroup">
              <label>{t.login.username}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="curaGroup">
              <label>{t.login.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="curaBtn" type="submit" disabled={loading}>
              {loading ? t.login.signingIn : t.login.signIn}
            </button>

            {error && <div className="curaError">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
