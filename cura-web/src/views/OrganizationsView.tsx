import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  OrganizationResponse,
  CreateRootUserRequest,
  OrganizationCreateRequest,
  createOrganization,
  createRootUser,
  listOrganizations,
  updateOrganization,
} from "../api/api-organizations";
import { apiErrorMessage } from "../api/api-error";
import "./OrganizationsView.scss";

type Panel = "create" | "detail";

const BLANK_ORG: OrganizationCreateRequest = { name: "", contactEmail: "", phone: "" };

export default function OrganizationsView() {
  const reduced = useReducedMotion();

  const [orgs, setOrgs] = useState<OrganizationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState<string | null>(null);

  const [selectedOrg, setSelectedOrg] = useState<OrganizationResponse | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);

  const [orgForm, setOrgForm] = useState<OrganizationCreateRequest>(BLANK_ORG);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [rootUserForm, setRootUserForm] = useState<CreateRootUserRequest>({ username: "", password: "" });
  const [rootSaving, setRootSaving] = useState(false);
  const [rootErr, setRootErr] = useState<string | null>(null);
  const [rootMsg, setRootMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setListErr(null);
      setOrgs(await listOrganizations());
    } catch (e: any) {
      setListErr(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function selectOrg(org: OrganizationResponse) {
    setSelectedOrg(org);
    setOrgForm({ name: org.name, contactEmail: org.contactEmail ?? "", phone: org.phone ?? "" });
    setPanel("detail");
    setEditing(false);
    setSaveErr(null);
    setSaveMsg(null);
    setRootErr(null);
    setRootMsg(null);
    setRootUserForm({ username: "", password: "" });
  }

  function openCreate() {
    setSelectedOrg(null);
    setOrgForm(BLANK_ORG);
    setPanel("create");
    setSaveErr(null);
    setSaveMsg(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    if (!orgForm.name.trim()) return setSaveErr("Name is required");
    try {
      setSaving(true);
      const created = await createOrganization({ ...orgForm, name: orgForm.name.trim() });
      await load();
      selectOrg(created);
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg) return;
    setSaveErr(null);
    if (!orgForm.name.trim()) return setSaveErr("Name is required");
    try {
      setSaving(true);
      const updated = await updateOrganization(selectedOrg.id, { ...orgForm, name: orgForm.name.trim() });
      await load();
      setSelectedOrg(updated);
      setEditing(false);
      setSaveMsg("Saved");
    } catch (e: any) {
      setSaveErr(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRootUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg) return;
    setRootErr(null);
    setRootMsg(null);
    if (!rootUserForm.username.trim()) return setRootErr("Username required");
    if (rootUserForm.password.length < 6) return setRootErr("Password must be at least 6 characters");
    try {
      setRootSaving(true);
      const user = await createRootUser(selectedOrg.id, { username: rootUserForm.username.trim(), password: rootUserForm.password });
      setRootMsg(`Admin user "${user.username}" created for this organization`);
      setRootUserForm({ username: "", password: "" });
    } catch (e: any) {
      setRootErr(apiErrorMessage(e));
    } finally {
      setRootSaving(false);
    }
  }

  return (
    <div className="ov">
      <div className="ov__header">
        <div>
          <h1 className="ov__title">Organizations</h1>
          <p className="ov__subtitle">{orgs.length} organization{orgs.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="ov__newBtn" onClick={openCreate} type="button">+ New Organization</button>
      </div>

      <div className="ov__body">
        <div className="ov__list">
          {loading && <div className="ov__status">Loading...</div>}
          {listErr && <div className="ov__error">{listErr}</div>}
          {!loading && !listErr && orgs.length === 0 && (
            <div className="ov__empty">No organizations yet. Create the first one.</div>
          )}
          <AnimatePresence>
            {orgs.map((org, idx) => (
              <motion.button
                key={org.id}
                type="button"
                className={`ov__row${selectedOrg?.id === org.id ? " ov__row--active" : ""}`}
                onClick={() => selectOrg(org)}
                initial={reduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.14, delay: reduced ? 0 : idx * 0.03 }}
              >
                <div className="ov__rowIcon">
                  <i className="bx bxs-buildings" />
                </div>
                <div>
                  <div className="ov__rowName">{org.name}</div>
                  <div className="ov__rowSub">{org.contactEmail ?? "No contact email"}</div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="ov__detail">
          {panel === null && (
            <div className="ov__placeholder">Select an organization or create a new one.</div>
          )}

          {panel === "create" && (
            <div className="ov__panel">
              <div className="ov__panelHeader">
                <h2 className="ov__panelTitle">New Organization</h2>
                <button className="ov__closeBtn" onClick={() => setPanel(null)} type="button">&#x2715;</button>
              </div>
              <form onSubmit={handleCreate}>
                <OrgForm form={orgForm} onChange={setOrgForm} />
                {saveErr && <div className="ov__saveErr">{saveErr}</div>}
                <div className="ov__actions">
                  <button className="ov__btn ov__btn--primary" type="submit" disabled={saving}>{saving ? "Creating..." : "Create Organization"}</button>
                  <button className="ov__btn ov__btn--ghost" type="button" onClick={() => setPanel(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {panel === "detail" && selectedOrg && (
            <div className="ov__panel">
              <div className="ov__panelHeader">
                <div>
                  <h2 className="ov__panelTitle">{selectedOrg.name}</h2>
                  <div className="ov__panelSub">ID #{selectedOrg.id}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!editing && (
                    <button className="ov__editBtn" onClick={() => { setEditing(true); setSaveErr(null); setSaveMsg(null); }} type="button">Edit</button>
                  )}
                  <button className="ov__closeBtn" onClick={() => { setPanel(null); setSelectedOrg(null); }} type="button">&#x2715;</button>
                </div>
              </div>

              {!editing ? (
                <div className="ov__infoGrid">
                  <InfoField label="Name" value={selectedOrg.name} />
                  <InfoField label="Contact Email" value={selectedOrg.contactEmail} />
                  <InfoField label="Phone" value={selectedOrg.phone} />
                  <InfoField label="Created" value={new Date(selectedOrg.createdAt).toLocaleDateString()} />
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <OrgForm form={orgForm} onChange={setOrgForm} />
                  {saveErr && <div className="ov__saveErr">{saveErr}</div>}
                  <div className="ov__actions">
                    <button className="ov__btn ov__btn--primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    <button className="ov__btn ov__btn--ghost" type="button" onClick={() => { setEditing(false); setSaveErr(null); }}>Cancel</button>
                  </div>
                </form>
              )}

              {saveMsg && !editing && <div className="ov__saveMsg">{saveMsg}</div>}

              <div className="ov__section">
                <div className="ov__sectionTitle">Create Admin User</div>
                <p className="ov__sectionHint">Create the root admin account for this organization. They will be able to manage facilities, staff, and invite other users.</p>
                <form onSubmit={handleCreateRootUser} className="ov__rootForm">
                  <div className="ov__formRow">
                    <div className="ov__formField">
                      <label className="ov__label">Username</label>
                      <input
                        className="ov__input"
                        value={rootUserForm.username}
                        onChange={(e) => setRootUserForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="e.g. admin.acme"
                        autoComplete="off"
                      />
                    </div>
                    <div className="ov__formField">
                      <label className="ov__label">Temporary Password</label>
                      <input
                        className="ov__input"
                        type="text"
                        value={rootUserForm.password}
                        onChange={(e) => setRootUserForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 6 characters"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {rootErr && <div className="ov__saveErr">{rootErr}</div>}
                  {rootMsg && <div className="ov__saveMsg">{rootMsg}</div>}
                  <button className="ov__btn ov__btn--primary" type="submit" disabled={rootSaving} style={{ marginTop: 4 }}>
                    {rootSaving ? "Creating..." : "Create Admin User"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="ov__infoField">
      <div className="ov__infoLabel">{label}</div>
      <div className="ov__infoValue">{value || "—"}</div>
    </div>
  );
}

function OrgForm({ form, onChange }: { form: OrganizationCreateRequest; onChange: (f: OrganizationCreateRequest) => void }) {
  const set = (key: keyof OrganizationCreateRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="ov__form">
      <div className="ov__formField">
        <label className="ov__label">Organization Name *</label>
        <input className="ov__input" value={form.name} onChange={set("name")} placeholder="e.g. Acme Care Group" autoFocus />
      </div>
      <div className="ov__formRow">
        <div className="ov__formField">
          <label className="ov__label">Contact Email</label>
          <input className="ov__input" type="email" value={form.contactEmail ?? ""} onChange={set("contactEmail")} placeholder="admin@acme.com" />
        </div>
        <div className="ov__formField">
          <label className="ov__label">Phone</label>
          <input className="ov__input" value={form.phone ?? ""} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
    </div>
  );
}
