import { clearAuth, getAuth } from "../auth/auth";
import lexicon from "../assets/lexicon";
import "./TopBar.scss";

export default function TopBar() {
  const { token, username, role } = getAuth();
  if (!token) return null;

  return (
    <div className="tb">
      <div className="tb__brand">{lexicon.topBar.brand}</div>

      <div className="tb__right">
        <span className="tb__user">
          {username} · {role}
        </span>

        {role === "ADMIN" && (
          <a className="tb__link" href="/admin/users">
            {lexicon.topBar.users}
          </a>
        )}

        <a className="tb__btnLink" href="/residents">
          {lexicon.topBar.residents}
        </a>

        <button
          onClick={() => {
            clearAuth();
            window.location.href = "/login";
          }}
        >
          {lexicon.topBar.logout}
        </button>
      </div>
    </div>
  );
}
