import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuth } from '../auth/auth';
import './AuthView.scss';

export default function LogoutView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isInactive = params.get('reason') === 'inactive';

  useEffect(() => {
    clearAuth();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-panel">

          <div className="auth-brand">
            <div className="auth-brand__mark">C.</div>
            <span className="auth-brand__name">Cura</span>
          </div>

          <div className="auth-header">
            <h1>{isInactive ? 'Session expired' : 'Signed out'}</h1>
            <p>
              {isInactive
                ? 'You were signed out after a period of inactivity. Please sign in again to continue.'
                : 'You have been successfully signed out.'}
            </p>
          </div>

          <button className="auth-btn" onClick={() => navigate('/login')}>
            Sign In Again
          </button>

        </div>
      </div>
    </div>
  );
}
