import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import lexicon from "../assets/lexicon";
import "./TopBar.scss";
import cura_logo from "../assets/images/cura_logo_2.png";

export default function TopBar() {
  const { token, username, role } = getAuth();
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <div className="tb">
      <Link to="/dashboard" className="tb__brand">
        <img src={cura_logo} alt="Cura Logo" className="tb__logo" />
      </Link>

      <div className="tb__right">
        <span className="tb__user">
          {username} · {role}
        </span>
        <Link className="tb__link" to="/dashboard">
          {lexicon.topBar.home}
        </Link>
        <Link className="tb__link" to="/facilities">
          {lexicon.topBar.facilities}
        </Link>
        <Link className="tb__btnLink" to="/residents/directory">
          {lexicon.topBar.residents}
        </Link>
        {role === "ADMIN" && (
          <Link className="tb__link" to="/admin/users">
            {lexicon.topBar.users}
          </Link>
        )}

        <button
          onClick={() => {
            clearAuth();
            navigate("/login");
          }}
        >
          {lexicon.topBar.logout}
        </button>
      </div>
    </div>
  );
}