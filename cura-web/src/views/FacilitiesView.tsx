import { useCallback, useEffect, useMemo, useState } from "react";
import { Facility, getFacility, listFacilities, patchFacility } from "../api/facilities";
import { UnitsPanel } from "../components/UnitsPanel";
import { getAuth } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import CreateFacilityModal from "../components/CreateFacilityModal";
import lexicon from "../assets/lexicon";
import "./FacilitiesView.scss";
import CachedIcon from '@mui/icons-material/Cached';

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function FacilitiesView() {
  const t = lexicon;

  const auth = getAuth();
  const isAdmin = auth.role === "ADMIN";
  const [createOpen, setCreateOpen] = useState(false);

  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [facilityState, setFacilityState] = useState<LoadState<Facility>>({ status: "idle" });

  // --- edit facility UI state ---
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; address: string; phone: string; email: string }>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const facilities = useMemo(
    () => (facilitiesState.status === "success" ? facilitiesState.data : []),
    [facilitiesState]
  );

  const loadFacilities = useCallback(async () => {
    try {
      setFacilitiesState({ status: "loading" });
      const data = await listFacilities();
      setFacilitiesState({ status: "success", data });

      if (data.length === 0) {
        setSelectedFacilityId(null);
        setFacilityState({ status: "idle" });
        return;
      }

      setSelectedFacilityId((prev) => {
        if (prev && data.some((f) => f.id === prev)) return prev;
        return data[0].id;
      });
    } catch (e: any) {
      setFacilitiesState({ status: "error", message: apiErrorMessage(e) });
    }
  }, []);

  const loadFacility = useCallback(async (id: number) => {
    try {
      setFacilityState({ status: "loading" });
      const data = await getFacility(id);
      setFacilityState({ status: "success", data });

      // seed edit form any time a new facility loads
      setEditing(false);
      setEditError(null);
      setEditForm({
        name: data.name ?? "",
        address: data.address ?? "",
        phone: (data as any).phone ?? "",
        email: (data as any).email ?? "",
      });
    } catch (e: any) {
      setFacilityState({ status: "error", message: apiErrorMessage(e) });
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacilityId == null) return;
    loadFacility(selectedFacilityId);
  }, [selectedFacilityId, loadFacility]);

  function startEdit() {
    if (!isAdmin) return;
    if (facilityState.status !== "success") return;

    const f = facilityState.data;
    setEditError(null);
    setEditing(true);
    setEditForm({
      name: f.name ?? "",
      address: f.address ?? "",
      phone: (f as any).phone ?? "",
      email: (f as any).email ?? "",
    });
  }

  function cancelEdit() {
    if (facilityState.status !== "success") {
      setEditing(false);
      return;
    }
    const f = facilityState.data;
    setEditing(false);
    setEditError(null);
    setEditForm({
      name: f.name ?? "",
      address: f.address ?? "",
      phone: (f as any).phone ?? "",
      email: (f as any).email ?? "",
    });
  }

  async function saveEdit() {
    if (!isAdmin) return;
    if (facilityState.status !== "success") return;

    const current = facilityState.data;

    const next = {
      name: editForm.name.trim(),
      address: editForm.address.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
    };

    if (!next.name) {
      setEditError("Name is required.");
      return;
    }

    // patch only changed fields
    const payload: any = {};
    if (next.name !== (current.name ?? "")) payload.name = next.name;
    if (next.address !== (current.address ?? "")) payload.address = next.address;
    if (next.phone !== ((current as any).phone ?? "")) payload.phone = next.phone;
    if (next.email !== ((current as any).email ?? "")) payload.email = next.email;

    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const updated = await patchFacility(current.id, payload);

      // update right panel
      setFacilityState({ status: "success", data: updated });

      // update left list (so name/address immediately reflect)
      setFacilitiesState((prev) => {
        if (prev.status !== "success") return prev;
        return {
          status: "success",
          data: prev.data.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)),
        };
      });

      setEditing(false);
    } catch (e: any) {
      setEditError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="facilities__container">
      <div className="facilities__top">
        <div>
          <h1 className="facilities__appTitle">{t.facilities.appTitle}</h1>
          <p className="facilities__subtitle">
            {auth.username && (
              <>
                {t.facilities.signedInAs} <b>{auth.username}</b> ({auth.role ?? "UNKNOWN"})
              </>
            )}
          </p>
        </div>

        <div className="facilities__topActions">
          <button onClick={loadFacilities} type="button" aria-label={t.common.refresh}>
            <CachedIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="facilities__grid">
        <div className="card facilities__left">
          <div className="facilities__leftHeader">
            <h2 className="facilities__panelTitle">{t.facilities.facilitiesTitle}</h2>

            <div className="facilities__leftActions">
              {isAdmin && <span className="facilities__adminBadge">{t.facilities.adminBadge}</span>}
              {isAdmin && <button onClick={() => setCreateOpen(true)}>{t.facilities.new}</button>}
            </div>
          </div>

          {facilitiesState.status === "loading" && <div className="facilities__status">{t.common.loading}</div>}

          {facilitiesState.status === "error" && (
            <div className="facilities__error">
              {facilitiesState.message}
              <div className="facilities__tryAgain">
                <button onClick={loadFacilities}>{t.common.tryAgain}</button>
              </div>
            </div>
          )}

          {facilitiesState.status === "success" && facilities.length === 0 && (
            <div className="facilities__empty">
              <div>{t.facilities.noFacilities}</div>
              {isAdmin ? (
                <div className="facilities__emptyHint">{t.facilities.adminNextStep}</div>
              ) : (
                <div className="facilities__emptyHint">{t.facilities.staffAskAdmin}</div>
              )}
            </div>
          )}

          {facilities.map((f) => (
            <button
              key={f.id}
              className={`facilities__facilityBtn ${selectedFacilityId === f.id ? "isActive" : ""}`}
              onClick={() => setSelectedFacilityId(f.id)}
            >
              <div className="facilities__facilityName">{f.name}</div>
              <div className="facilities__facilityAddr">{f.address}</div>
            </button>
          ))}
        </div>

        <div className="card facilities__right">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 className="facilities__panelTitle">{t.facilities.selectedFacilityTitle}</h2>

            {isAdmin && facilityState.status === "success" && !editing && (
              <button onClick={startEdit}>{t.facilities.edit}</button>
            )}
          </div>

          {selectedFacilityId == null && <div className="facilities__status">{t.facilities.selectFacility}</div>}
          {facilityState.status === "loading" && <div className="facilities__status">{t.common.loading}</div>}

          {facilityState.status === "error" && (
            <div className="facilities__error">
              {facilityState.message}
              {selectedFacilityId != null && (
                <div className="facilities__tryAgain">
                  <button onClick={() => loadFacility(selectedFacilityId)}>{t.common.tryAgain}</button>
                </div>
              )}
            </div>
          )}

          {facilityState.status === "success" && (
            <>
              {!editing ? (
                <div className="facilities__selected">
                  <div className="facilities__selectedName">{facilityState.data.name}</div>
                  <div className="facilities__selectedAddr">{facilityState.data.address}</div>
                </div>
              ) : (
                <div className="facilities__editCard" style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label>Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label>Address</label>
                    <input
                      value={editForm.address}
                      onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label>Phone</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label>Email</label>
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  {editError && <div className="facilities__error">{editError}</div>}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={saveEdit} disabled={saving}>
                      {saving ? t.common.loading : t.facilities.save}
                    </button>
                    <button onClick={cancelEdit} disabled={saving}>
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              )}

              <UnitsPanel facilityId={facilityState.data.id} />
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <CreateFacilityModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => loadFacilities()} />
      )}
    </div>
  );
}
