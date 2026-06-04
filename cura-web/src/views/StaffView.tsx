import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  STATUSES,
  StaffCreateRequest,
  StaffDetailResponse,
  StaffDepartment,
  StaffEmploymentType,
  StaffResponse,
  StaffStatus,
  assignFacility,
  createStaff,
  deleteStaff,
  fmtDepartment,
  fmtEmploymentType,
  fmtStatus,
  getStaff,
  listStaff,
  removeFacility,
  updateStaff,
} from "../api/api-staff";
import { listFacilities, Facility } from "../api/facilities";
import { apiErrorMessage } from "../api/api-error";
import "./StaffView.scss";

type Panel = "detail" | "create";

const BLANK: StaffCreateRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "NURSING",
  employmentType: "FULL_TIME",
  hireDate: "",
};

function statusColor(s: StaffStatus): string {
  return { ACTIVE: "#3ab06a", INACTIVE: "#6b7a8d", ON_LEAVE: "#e8a032", TERMINATED: "#e05050" }[s];
}

export default function StaffView() {
  const reduced = useReducedMotion();

  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [listErr, setListErr] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<StaffStatus | "">("");
  const [filterDept, setFilterDept] = useState<StaffDepartment | "">("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<StaffDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  const [panel, setPanel] = useState<Panel | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<StaffCreateRequest>(BLANK);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facErr, setFacErr] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setListErr(null);
      const page = await listStaff({ q: q.trim() || undefined, status: filterStatus || undefined, department: filterDept || undefined, size: 100 });
      setStaff(page.content);
      setTotal(page.totalElements);
    } catch (e: any) {
      setListErr(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q, filterStatus, filterDept]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    listFacilities().then(setFacilities).catch((e) => setFacErr(apiErrorMessage(e)));
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    try {
      setDetailLoading(true);
      setDetailErr(null);
      setDetail(null);
      const d = await getStaff(id);
      setDetail(d);
      setEditForm({
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone ?? "",
        jobTitle: d.jobTitle,
        department: d.department,
        employmentType: d.employmentType,
        hireDate: d.hireDate ?? "",
        dateOfBirth: d.dateOfBirth ?? "",
        notes: d.notes ?? "",
      });
      setEditing(false);
      setSaveErr(null);
      setSaveMsg(null);
      setDeleteConfirm(false);
    } catch (e: any) {
      setDetailErr(apiErrorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setPanel("detail");
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  function openCreate() {
    setPanel("create");
    setSelectedId(null);
    setDetail(null);
    setEditForm(BLANK);
    setSaveErr(null);
    setSaveMsg(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    setSaveMsg(null);
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) return setSaveErr("First and last name required");
    if (!editForm.email.trim()) return setSaveErr("Email required");
    if (!editForm.hireDate) return setSaveErr("Hire date required");
    try {
      setSaving(true);
      const created = await createStaff({ ...editForm, hireDate: editForm.hireDate, dateOfBirth: editForm.dateOfBirth || undefined });
      await load();
      setSelectedId(created.id);
      setSaveMsg(`${created.firstName} ${created.lastName} created`);
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    setSaveErr(null);
    setSaveMsg(null);
    try {
      setSaving(true);
      const updated = await updateStaff(detail.id, { ...editForm, hireDate: editForm.hireDate, dateOfBirth: editForm.dateOfBirth || undefined });
      setDetail(updated);
      setEditing(false);
      setSaveMsg("Saved");
      load();
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!detail) return;
    try {
      setDeleting(true);
      await deleteStaff(detail.id);
      setSelectedId(null);
      setDetail(null);
      setPanel(null);
      setDeleteConfirm(false);
      load();
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  async function handleAssignFacility(facilityId: number) {
    if (!detail) return;
    try {
      const updated = await assignFacility(detail.id, facilityId);
      setDetail(updated);
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    }
  }

  async function handleRemoveFacility(facilityId: number) {
    if (!detail) return;
    try {
      const updated = await removeFacility(detail.id, facilityId);
      setDetail(updated);
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    }
  }

  const unassignedFacilities = facilities.filter(
    (f) => !detail?.facilities.some((sf) => sf.id === f.id)
  );

  return (
    <div className="sv">
      <div className="sv__header">
        <div>
          <h1 className="sv__title">Staff</h1>
          <p className="sv__subtitle">{total} member{total !== 1 ? "s" : ""}</p>
        </div>
        <button className="sv__newBtn" onClick={openCreate} type="button">+ New Staff Member</button>
      </div>

      <div className="sv__filters">
        <input
          className="sv__search"
          placeholder="Search by name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="sv__select" value={filterDept} onChange={(e) => setFilterDept(e.target.value as any)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{fmtDepartment(d)}</option>)}
        </select>
        <select className="sv__select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{fmtStatus(s)}</option>)}
        </select>
      </div>

      <div className="sv__body">
        <div className="sv__list">
          {loading && <div className="sv__status">Loading...</div>}
          {listErr && <div className="sv__error">{listErr}</div>}
          {!loading && !listErr && staff.length === 0 && (
            <div className="sv__empty">No staff members found.</div>
          )}
          <AnimatePresence>
            {staff.map((s, idx) => (
              <motion.button
                key={s.id}
                type="button"
                className={`sv__row${selectedId === s.id ? " sv__row--active" : ""}`}
                onClick={() => setSelectedId(s.id)}
                initial={reduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.14, delay: reduced ? 0 : idx * 0.03 }}
              >
                <div className="sv__rowMain">
                  <div className="sv__rowName">{s.firstName} {s.lastName}</div>
                  <div className="sv__rowSub">{s.jobTitle} &middot; {fmtDepartment(s.department)}</div>
                </div>
                <div className="sv__rowRight">
                  <span className="sv__pill" style={{ color: statusColor(s.status) }}>
                    {fmtStatus(s.status)}
                  </span>
                  <span className="sv__pillGray">{fmtEmploymentType(s.employmentType)}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="sv__detail">
          {panel === null && (
            <div className="sv__placeholder">Select a staff member or create a new one.</div>
          )}

          {panel === "create" && (
            <div className="sv__panel">
              <div className="sv__panelHeader">
                <h2 className="sv__panelTitle">New Staff Member</h2>
                <button className="sv__closeBtn" onClick={() => setPanel(null)} type="button">&#x2715;</button>
              </div>
              <form onSubmit={handleCreate}>
                <StaffForm form={editForm} onChange={setEditForm} />
                {saveErr && <div className="sv__saveErr">{saveErr}</div>}
                {saveMsg && <div className="sv__saveMsg">{saveMsg}</div>}
                <div className="sv__panelActions">
                  <button className="sv__btn sv__btn--primary" type="submit" disabled={saving}>
                    {saving ? "Creating..." : "Create Staff Member"}
                  </button>
                  <button className="sv__btn sv__btn--ghost" type="button" onClick={() => setPanel(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {panel === "detail" && (
            <div className="sv__panel">
              {detailLoading && <div className="sv__status">Loading...</div>}
              {detailErr && <div className="sv__error">{detailErr}</div>}

              {detail && !detailLoading && (
                <>
                  <div className="sv__panelHeader">
                    <div>
                      <h2 className="sv__panelTitle">{detail.firstName} {detail.lastName}</h2>
                      <div className="sv__panelSub">{detail.jobTitle}</div>
                    </div>
                    <div className="sv__panelHeaderRight">
                      {!editing && (
                        <button className="sv__editBtn" onClick={() => { setEditing(true); setSaveErr(null); setSaveMsg(null); }} type="button">Edit</button>
                      )}
                      <button className="sv__closeBtn" onClick={() => { setPanel(null); setSelectedId(null); }} type="button">&#x2715;</button>
                    </div>
                  </div>

                  {!editing ? (
                    <div className="sv__infoGrid">
                      <InfoField label="Employee #" value={detail.employeeNumber} />
                      <InfoField label="User Number" value={detail.username} />
                      <InfoField label="Email" value={detail.email} />
                      <InfoField label="Phone" value={detail.phone} />
                      <InfoField label="Department" value={fmtDepartment(detail.department)} />
                      <InfoField label="Employment" value={fmtEmploymentType(detail.employmentType)} />
                      <InfoField label="Status">
                        <span style={{ color: statusColor(detail.status), fontWeight: 600 }}>{fmtStatus(detail.status)}</span>
                      </InfoField>
                      <InfoField label="Hire Date" value={detail.hireDate} />
                      <InfoField label="Date of Birth" value={detail.dateOfBirth} />
                      {detail.notes && <InfoField label="Notes" value={detail.notes} wide />}
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate}>
                      <StaffForm form={editForm} onChange={setEditForm} />
                      {saveErr && <div className="sv__saveErr">{saveErr}</div>}
                      <div className="sv__panelActions">
                        <button className="sv__btn sv__btn--primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                        <button className="sv__btn sv__btn--ghost" type="button" onClick={() => { setEditing(false); setSaveErr(null); }}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {saveMsg && !editing && <div className="sv__saveMsg">{saveMsg}</div>}

                  <div className="sv__section">
                    <div className="sv__sectionHeader">
                      <span className="sv__sectionTitle">Assigned Facilities</span>
                    </div>
                    {detail.facilities.length === 0 && <div className="sv__empty sv__empty--sm">Not assigned to any facility.</div>}
                    <div className="sv__facilityList">
                      {detail.facilities.map((f) => (
                        <div key={f.id} className="sv__facilityRow">
                          <span>{f.name}</span>
                          <button className="sv__removeBtn" type="button" onClick={() => handleRemoveFacility(f.id)}>Remove</button>
                        </div>
                      ))}
                    </div>
                    {unassignedFacilities.length > 0 && (
                      <div className="sv__assignRow">
                        <select
                          className="sv__select sv__select--sm"
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) handleAssignFacility(Number(e.target.value)); e.target.value = ""; }}
                        >
                          <option value="">Assign to facility...</option>
                          {unassignedFacilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>
                    )}
                    {facErr && <div className="sv__error">{facErr}</div>}
                  </div>

                  <div className="sv__section sv__section--danger">
                    {!deleteConfirm ? (
                      <button className="sv__btn sv__btn--danger" type="button" onClick={() => setDeleteConfirm(true)}>
                        Terminate Staff Member
                      </button>
                    ) : (
                      <div className="sv__deleteConfirm">
                        <span>Set status to TERMINATED?</span>
                        <button className="sv__btn sv__btn--danger" type="button" onClick={handleDelete} disabled={deleting}>
                          {deleting ? "Terminating..." : "Confirm"}
                        </button>
                        <button className="sv__btn sv__btn--ghost" type="button" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, children, wide }: { label: string; value?: string | null; children?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`sv__infoField${wide ? " sv__infoField--wide" : ""}`}>
      <div className="sv__infoLabel">{label}</div>
      <div className="sv__infoValue">{children ?? (value || "—")}</div>
    </div>
  );
}

function StaffForm({ form, onChange }: { form: StaffCreateRequest; onChange: (f: StaffCreateRequest) => void }) {
  const set = (key: keyof StaffCreateRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="sv__form">
      <div className="sv__formRow">
        <div className="sv__formField">
          <label className="sv__label">First Name *</label>
          <input className="sv__input" value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
        </div>
        <div className="sv__formField">
          <label className="sv__label">Last Name *</label>
          <input className="sv__input" value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
        </div>
      </div>
      <div className="sv__formRow">
        <div className="sv__formField">
          <label className="sv__label">Email *</label>
          <input className="sv__input" type="email" value={form.email} onChange={set("email")} placeholder="jane.smith@example.com" />
        </div>
        <div className="sv__formField">
          <label className="sv__label">Phone</label>
          <input className="sv__input" value={form.phone ?? ""} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="sv__formField">
        <label className="sv__label">Job Title *</label>
        <input className="sv__input" value={form.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Registered Nurse" />
      </div>
      <div className="sv__formRow">
        <div className="sv__formField">
          <label className="sv__label">Department *</label>
          <select className="sv__input" value={form.department} onChange={set("department")}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{fmtDepartment(d)}</option>)}
          </select>
        </div>
        <div className="sv__formField">
          <label className="sv__label">Employment Type *</label>
          <select className="sv__input" value={form.employmentType} onChange={set("employmentType")}>
            {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{fmtEmploymentType(t)}</option>)}
          </select>
        </div>
      </div>
      <div className="sv__formRow">
        <div className="sv__formField">
          <label className="sv__label">Hire Date *</label>
          <input className="sv__input" type="date" value={form.hireDate} onChange={set("hireDate")} />
        </div>
        <div className="sv__formField">
          <label className="sv__label">Date of Birth</label>
          <input className="sv__input" type="date" value={form.dateOfBirth ?? ""} onChange={set("dateOfBirth")} />
        </div>
      </div>
      <div className="sv__formField">
        <label className="sv__label">Notes</label>
        <textarea className="sv__input sv__textarea" value={form.notes ?? ""} onChange={set("notes")} rows={3} placeholder="Internal notes..." />
      </div>
    </div>
  );
}