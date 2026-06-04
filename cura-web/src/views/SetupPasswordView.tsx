import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setupPassword } from '../api/api-auth';
import './AuthView.scss';

export default function SetupPasswordView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-panel">
            <div className="auth-brand">
              <div className="auth-brand__mark">C.</div>
              <span className="auth-brand__name">Cura</span>
            </div>
            <div className="auth-header">
              <h1>Invalid link</h1>
              <p>This setup link is missing or malformed. Ask your administrator to resend the invite.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await setupPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired setup link');
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
            <h1>Set your password</h1>
            <p>Choose a password to activate your account.</p>
          </div>

          {done ? (
            <div className="auth-success">
              Password set. Redirecting to sign in...
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="auth-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
              <button
                className="auth-btn"
                type="submit"
                disabled={loading || !password || !confirm}
              >
                {loading ? 'Activating...' : 'Activate Account'}
              </button>
              {error && <div className="auth-error">{error}</div>}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
