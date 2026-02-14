import { FormEvent, useState } from "react";
import { login } from "../api/api-auth";
import { setAuth } from "../auth/auth";

export default function LoginView() {
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
      window.location.href = "/";
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>CURA</h1>
      <p style={{ marginBottom: 16 }}>Sign in to continue.</p>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Username</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 12 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
