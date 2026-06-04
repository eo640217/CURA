import React, { useEffect, useState } from "react";
import { getProfile, ProfileResponse } from "../api/api-profile";
import { apiErrorMessage } from "../api/api-error";
import { fmtDepartment, fmtEmploymentType, fmtStatus, StaffDepartment, StaffEmploymentType, StaffStatus } from "../api/api-staff";
import "./ProfileView.scss";

export default function ProfileView() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="pv pv--center">Loading...</div>;
  if (error)   return <div className="pv pv--center pv--error">{error}</div>;
  if (!profile) return null;

  const s = profile.staffMember;

  return (
    <div className="pv">
      <div className="pv__header">
        <h1 className="pv__title">Profile</h1>
      </div>

      <div className="pv__grid">
        {/* Account card */}
        <div className="pv__card">
          <div className="pv__cardTitle">Account</div>

          <div className="pv__avatar">
            {profile.username.charAt(0).toUpperCase()}
          </div>

          <div className="pv__fields">
            <Field label="Username" value={profile.username} />
            <Field label="Role">
              <span className={`pv__rolePill pv__rolePill--${profile.role.toLowerCase()}`}>
                {profile.role}
              </span>
            </Field>
            <Field label="User ID" value={`#${profile.userId}`} />
          </div>
        </div>

        {/* Staff record card */}
        <div className="pv__card">
          <div className="pv__cardTitle">Staff Record</div>

          {!s ? (
            <div className="pv__noLink">
              No staff record linked to this account.
              <span className="pv__noLinkHint">An admin can link a staff record to your account.</span>
            </div>
          ) : (
            <>
              <div className="pv__staffName">{s.firstName} {s.lastName}</div>
              <div className="pv__staffTitle">{s.jobTitle}</div>

              <div className="pv__fields pv__fields--grid">
                <Field label="Employee #" value={s.employeeNumber} />
                <Field label="Status">
                  <StaffStatusBadge status={s.status as StaffStatus} />
                </Field>
                <Field label="Email" value={s.email} />
                <Field label="Phone" value={s.phone} />
                <Field label="Department" value={fmtDepartment(s.department as StaffDepartment)} />
                <Field label="Employment" value={fmtEmploymentType(s.employmentType as StaffEmploymentType)} />
                <Field label="Hire Date" value={s.hireDate} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="pv__field">
      <div className="pv__fieldLabel">{label}</div>
      <div className="pv__fieldValue">{children ?? (value || "—")}</div>
    </div>
  );
}

function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const colors: Record<StaffStatus, string> = {
    ACTIVE: "#3ab06a", INACTIVE: "#6b7a8d", ON_LEAVE: "#e8a032", TERMINATED: "#e05050",
  };
  return <span style={{ color: colors[status], fontWeight: 600 }}>{fmtStatus(status)}</span>;
}
