import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ChatWidget from "../components/ChatWidget";
import "./PublicLayout.scss";

export default function PublicLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="homePage">
      <nav className="homeNav">
        <div className="homeNav__inner">
          <Link to="/" className="homeNav__brand">
            Cu<em>ra</em>
          </Link>
          <div className="homeNav__links">
            <Link to="/solutions">Features</Link>
            <Link to="/packages">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="homeNav__actions">
            <Link to="/login" className="homeNav__signIn">Sign in</Link>
            <Link to="/login" className="homeNav__trial">Start free trial</Link>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <footer className="homeFooter">
        <div className="homeFooter__inner">
          <Link to="/" className="homeFooter__brand">
            Cu<em>ra</em>
          </Link>
          <nav className="homeFooter__links">
            <Link to="/solutions">Features</Link>
            <Link to="/packages">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <Link to="/contact">Contact</Link>
          </nav>
          <p className="homeFooter__copy">© 2026 CURA Health Ltd. All rights reserved.</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
