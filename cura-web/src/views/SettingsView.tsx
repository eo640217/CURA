import React, { useEffect, useState } from "react";
import { getAuth, setAuth } from "../auth/auth";
import { changePassword, changeUsername } from "../api/api-settings";
import { apiErrorMessage } from "../api/api-error";
import "./SettingsView.scss";

export default function SettingsView() {
  const auth = getAuth();

  // ── username ──────────────────────────────────────────────────────────────
  const [newUsername, setNewUsername] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameErr, setUsernameErr] = useState<string | null>(null);
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);

  // ── password ──────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving]   = useState(false);
  const [passwordErr, setPasswordErr]         = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg]         = useState<string | null>(null);

  // ── appearance ────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => localStorage.getItem("cura.dark") === "1");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("cura.dark", dark ? "1" : "0");
  }, [dark]);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUsernameErr(null);
    setUsernameMsg(null);
    const trimmed = newUsername.trim();
    if (!trimmed) return setUsernameErr("Username is required");
    if (trimmed.length < 3) return setUsernameErr("Must be at least 3 characters");
    if (trimmed === auth.username) return setUsernameErr("New username matches current username");
    try {
      setUsernameSaving(true);
      await changeUsername(trimmed);
      // Update stored auth so UI reflects new username
      setAuth({ ...auth, username: trimmed });
      setUsernameMsg(`Username changed to "${trimmed}". You will need to log in again next session.`);
      setNewUsername("");
    } catch (e: any) {
      setUsernameErr(apiErrorMessage(e));
    } finally {
      setUsernameSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);
    if (!currentPassword) return setPasswordErr("Current password is required");
    if (!newPassword) return setPasswordErr("New password is required");
    if (newPassword.length < 6) return setPasswordErr("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setPasswordErr("Passwords do not match");
    try {
      setPasswordSaving(true);
      await changePassword(currentPassword, newPassword);
      setPasswordMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPasswordErr(apiErrorMessage(e));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="stg">
      <div className="stg__header">
        <h1 className="stg__title">Settings</h1>
        <p className="stg__subtitle">Manage your account and preferences</p>
      </div>

      <div className="stg__sections">

        {/* ── Account ───────────────────────────────────────────────────── */}
        <section className="stg__card">
          <h2 className="stg__cardTitle">Account</h2>

          <div className="stg__infoRow">
            <span className="stg__infoLabel">Current username</span>
            <span className="stg__infoValue">{auth.username}</span>
          </div>
          <div className="stg__infoRow">
            <span className="stg__infoLabel">Role</span>
            <span className={`stg__rolePill stg__rolePill--${(auth.role ?? "").toLowerCase().replace("_", "-")}`}>
              {auth.role}
            </span>
          </div>

          <div className="stg__divider" />

          <form onSubmit={handleUsernameSubmit} className="stg__form">
            <h3 className="stg__formTitle">Change Username</h3>
            <div className="stg__field">
              <label className="stg__label">New Username</label>
              <input
                className="stg__input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                autoComplete="off"
              />
            </div>
            {usernameErr && <div className="stg__err">{usernameErr}</div>}
            {usernameMsg && <div className="stg__ok">{usernameMsg}</div>}
            <button className="stg__btn stg__btn--primary" type="submit" disabled={usernameSaving}>
              {usernameSaving ? "Saving..." : "Update Username"}
            </button>
          </form>
        </section>

        {/* ── Security ──────────────────────────────────────────────────── */}
        <section className="stg__card">
          <h2 className="stg__cardTitle">Security</h2>
          <form onSubmit={handlePasswordSubmit} className="stg__form">
            <h3 className="stg__formTitle">Change Password</h3>
            <div className="stg__field">
              <label className="stg__label">Current Password</label>
              <input
                className="stg__input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="stg__field">
              <label className="stg__label">New Password</label>
              <input
                className="stg__input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="stg__field">
              <label className="stg__label">Confirm New Password</label>
              <input
                className="stg__input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {passwordErr && <div className="stg__err">{passwordErr}</div>}
            {passwordMsg && <div className="stg__ok">{passwordMsg}</div>}
            <button className="stg__btn stg__btn--primary" type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Saving..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* ── Appearance ────────────────────────────────────────────────── */}
        <section className="stg__card">
          <h2 className="stg__cardTitle">Appearance</h2>
          <div className="stg__toggle">
            <div>
              <div className="stg__toggleLabel">Dark Mode</div>
              <div className="stg__toggleHint">Applies across the entire app</div>
            </div>
            <button
              type="button"
              className={`stg__switch${dark ? " stg__switch--on" : ""}`}
              onClick={() => setDark((d) => !d)}
              role="switch"
              aria-checked={dark}
            >
              <span className="stg__switchThumb" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
