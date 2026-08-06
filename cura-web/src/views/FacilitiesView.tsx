import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Facility, getFacility, listFacilities, patchFacility } from "../api/facilities";
import { Unit } from "../api/units";
import { UnitsPanel } from "../components/UnitsPanel";
import { getAuth, roleAtLeast } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import CreateFacilityModal from "../components/CreateFacilityModal";
import lexicon from "../assets/lexicon";
import "./FacilitiesView.scss";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function FacilitiesView() {
  const t = lexicon;
  const auth = getAuth();
  const isAdmin = roleAtLeast(auth.role, "ADMIN");
  const reduced = useReducedMotion();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [facilityState, setFacilityState] = useState<LoadState<Facility>>({ status: "idle" });

  const [unitsForStats, setUnitsForStats] = useState<Unit[]>([]);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", address: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const facilities = useMemo(
    () => (facilitiesState.status === "success" ? facilitiesState.data : []),
    [facilitiesState]
  );

  const filteredFacilities = useMemo(() => {
    if (!searchQuery.trim()) return facilities;
    const q = searchQuery.toLowerCase();
    return facilities.filter((f) => f.name?.toLowerCase().includes(q));
  }, [facilities, searchQuery]);

  const occupancyStats = useMemo(() => {
    const capacity = facilityState.status === "success" ? (facilityState.data.capacity ?? null) : null;
    const totalBeds = capacity ?? unitsForStats.reduce((s, u) => s + (u.capacity ?? 0), 0);
    const occupied = unitsForStats.reduce((s, u) => s + (u.occupiedCount ?? 0), 0);
    const available = Math.max(0, totalBeds - occupied);
    const rate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
    return { totalBeds, occupied, available, rate };
  }, [facilityState, unitsForStats]);

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
      setEditing(false);
      setEditError(null);
      setEditForm({
        name: data.name ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
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
    setUnitsForStats([]);
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
      phone: f.phone ?? "",
      email: f.email ?? "",
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
      phone: f.phone ?? "",
      email: f.email ?? "",
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

    const payload: any = {};
    if (next.name !== (current.name ?? "")) payload.name = next.name;
    if (next.address !== (current.address ?? "")) payload.address = next.address;
    if (next.phone !== (current.phone ?? "")) payload.phone = next.phone;
    if (next.email !== (current.email ?? "")) payload.email = next.email;

    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const updated = await patchFacility(current.id, payload);
      setFacilityState({ status: "success", data: updated });
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
    <div className="fv">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="fv__header">
        <div className="fv__headerLeft">
          <h1 className="fv__title">{t.facilities.facilitiesTitle}</h1>
          <p className="fv__subtitle">
            {facilities.length} {t.facilities.facilitiesTitle.toLowerCase()}
          </p>
        </div>
        <div className="fv__headerRight">
          {isAdmin && (
            <button
              className="fv__newBtn"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              {t.facilities.new}
            </button>
          )}
        </div>
      </div>

      {/* ── Body: left list + right detail ───────────────────────────────────── */}
      <div className="fv__body">

        {/* LEFT: facility list */}
        <div className="fv__left">
          <div className="fv__leftHeader">
            <input
              className="fv__search"
              type="search"
              placeholder={`${t.common.search}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="fv__facilityList">
            {facilitiesState.status === "loading" && (
              <div className="fv__status">{t.common.loading}</div>
            )}

            {facilitiesState.status === "error" && (
              <div className="fv__listError">
                <div className="fv__listErrorMsg">{facilitiesState.message}</div>
                <button className="fv__tryAgainBtn" onClick={loadFacilities} type="button">
                  {t.common.tryAgain}
                </button>
              </div>
            )}

            {facilitiesState.status === "success" && facilities.length === 0 && (
              <div className="fv__empty">
                <div className="fv__emptyMsg">{t.facilities.noFacilities}</div>
                <div className="fv__emptyHint">
                  {isAdmin ? t.facilities.adminNextStep : t.facilities.staffAskAdmin}
                </div>
              </div>
            )}

            {facilitiesState.status === "success" &&
              facilities.length > 0 &&
              filteredFacilities.length === 0 && (
                <div className="fv__empty">
                  <div className="fv__emptyMsg">{t.common.noResults}</div>
                </div>
              )}

            <AnimatePresence>
              {filteredFacilities.map((f, idx) => (
                <motion.button
                  key={f.id}
                  type="button"
                  className={`fv__facilityItem${selectedFacilityId === f.id ? " fv__facilityItem--active" : ""}`}
                  onClick={() => setSelectedFacilityId(f.id)}
                  initial={reduced ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: 4 }}
                  transition={{ duration: 0.15, delay: reduced ? 0 : idx * 0.04 }}
                >
                  <span className="fv__facilityItemName">{f.name}</span>
                  <span className="fv__facilityItemAddr">{f.address}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: facility detail + units + residents */}
        <div className="fv__right">
          {selectedFacilityId == null && facilityState.status === "idle" && (
            <div className="fv__selectPrompt">{t.facilities.selectFacility}</div>
          )}

          <AnimatePresence mode="wait">
            {facilityState.status === "loading" && (
              <motion.div
                key="fv-loading"
                className="fv__detailLoading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {t.common.loading}
              </motion.div>
            )}

            {facilityState.status === "error" && (
              <motion.div
                key="fv-error"
                className="fv__detailError"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div>{facilityState.message}</div>
                {selectedFacilityId != null && (
                  <button
                    className="fv__tryAgainBtn"
                    onClick={() => loadFacility(selectedFacilityId)}
                    type="button"
                  >
                    {t.common.tryAgain}
                  </button>
                )}
              </motion.div>
            )}

            {facilityState.status === "success" && (
              <motion.div
                key={facilityState.data.id}
                className="fv__detailContent"
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* ── Facility detail card ──────────────────────────────── */}
                <div className="fv__detailCard">
                  <div className="fv__detailHeader">
                    <div className="fv__detailNameRow">
                      <h2 className="fv__detailName">{facilityState.data.name}</h2>
                      {facilityState.data.facilityType && (
                        <span className="fv__typePill">{facilityState.data.facilityType}</span>
                      )}
                    </div>
                    <div className="fv__detailHeaderRight">
                      {editing && (
                        <span className="fv__unsavedDot" title="Unsaved changes" />
                      )}
                      {isAdmin && !editing && (
                        <button
                          className="fv__editBtn"
                          onClick={startEdit}
                          type="button"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 13 }} />
                          {t.facilities.edit}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* License number row */}
                  {facilityState.data.licenseNumber && (
                    <div className="fv__licenseRow">
                      <span className="fv__licenseLabel">License</span>
                      <span className="fv__licenseValue">{facilityState.data.licenseNumber}</span>
                    </div>
                  )}

                  {/* View mode — info grid */}
                  {!editing && (
                    <div className="fv__infoGrid">
                      <div className="fv__infoField">
                        <div className="fv__infoLabel">Address</div>
                        <div className="fv__infoValue">
                          {facilityState.data.address || "—"}
                        </div>
                      </div>
                      <div className="fv__infoField">
                        <div className="fv__infoLabel">Phone</div>
                        <div className="fv__infoValue">
                          {facilityState.data.phone || "—"}
                        </div>
                      </div>
                      <div className="fv__infoField">
                        <div className="fv__infoLabel">Email</div>
                        <div className="fv__infoValue">
                          {facilityState.data.email || "—"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Occupancy stats strip */}
                  {!editing && (
                    <div className="fv__statsStrip">
                      <div className="fv__statTile">
                        <span className="fv__statValue">{occupancyStats.totalBeds}</span>
                        <span className="fv__statLabel">Total Beds</span>
                      </div>
                      <div className="fv__statTile">
                        <span className="fv__statValue">{occupancyStats.occupied}</span>
                        <span className="fv__statLabel">Occupied</span>
                      </div>
                      <div className="fv__statTile">
                        <span className="fv__statValue">{occupancyStats.available}</span>
                        <span className="fv__statLabel">Available</span>
                      </div>
                      <div className="fv__statTile">
                        <span className="fv__statValue">{occupancyStats.rate}%</span>
                        <span className="fv__statLabel">Occupancy Rate</span>
                      </div>
                    </div>
                  )}

                  {/* Edit mode — slide-down form */}
                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        className="fv__editForm"
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduced ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="fv__editFormInner">
                          <div className="fv__editGrid">
                            <div className="fv__editField">
                              <label className="fv__editLabel">Name</label>
                              <input
                                className="fv__editInput"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm((p) => ({ ...p, name: e.target.value }))
                                }
                              />
                            </div>
                            <div className="fv__editField">
                              <label className="fv__editLabel">Address</label>
                              <input
                                className="fv__editInput"
                                value={editForm.address}
                                onChange={(e) =>
                                  setEditForm((p) => ({ ...p, address: e.target.value }))
                                }
                              />
                            </div>
                            <div className="fv__editField">
                              <label className="fv__editLabel">Phone</label>
                              <input
                                className="fv__editInput"
                                value={editForm.phone}
                                onChange={(e) =>
                                  setEditForm((p) => ({ ...p, phone: e.target.value }))
                                }
                              />
                            </div>
                            <div className="fv__editField">
                              <label className="fv__editLabel">Email</label>
                              <input
                                className="fv__editInput"
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm((p) => ({ ...p, email: e.target.value }))
                                }
                              />
                            </div>
                          </div>

                          {editError && (
                            <div className="fv__editError">{editError}</div>
                          )}

                          <div className="fv__editActions">
                            <button
                              className="fv__saveBtn"
                              onClick={saveEdit}
                              disabled={saving}
                              type="button"
                            >
                              {saving ? t.common.loading : t.facilities.save}
                            </button>
                            <button
                              className="fv__cancelBtn"
                              onClick={cancelEdit}
                              disabled={saving}
                              type="button"
                            >
                              {t.common.cancel}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Units + Residents ─────────────────────────────────── */}
                <UnitsPanel facilityId={facilityState.data.id} onUnitsLoaded={setUnitsForStats} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isAdmin && (
        <CreateFacilityModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => loadFacilities()}
        />
      )}
    </div>
  );
}
