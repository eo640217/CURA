import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Unit,
  UnitCreateRequest,
  UnitType,
  createUnit,
  deleteUnit,
  listUnitsByFacility,
  patchUnit,
} from "../api/units";
import { ResidentsPanel } from "./ResidentsPanel";
import { getAuth } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./UnitsPanel.scss";
import MenuSelect from "./MenuSelect";
import CachedIcon from "@mui/icons-material/Cached";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function remainingSpots(u: Unit) {
  return Math.max(0, (u.capacity ?? 0) - (u.occupiedCount ?? 0));
}

function occupancyPercent(u: Unit): number {
  if (!u.capacity || u.capacity === 0) return 0;
  return Math.min(100, (u.occupiedCount / u.capacity) * 100);
}

function occupancyColor(pct: number): string {
  if (pct >= 90) return "var(--cura-red)";
  if (pct >= 70) return "var(--cura-amber)";
  return "var(--cura-green)";
}

export function UnitsPanel({ facilityId }: { facilityId: number }) {
  const auth = getAuth();
  const isAdmin = auth.role === "ADMIN";
  const reduced = useReducedMotion();

  const [unitsState, setUnitsState] = useState<LoadState<Unit[]>>({ status: "idle" });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState<UnitCreateRequest>({
    name: "",
    type: "ROOM",
    capacity: 1,
  });

  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const units = useMemo(
    () => (unitsState.status === "success" ? unitsState.data : []),
    [unitsState]
  );

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) ?? null,
    [units, selectedUnitId]
  );

  async function load() {
    try {
      setUnitsState({ status: "loading" });
      const data = await listUnitsByFacility(facilityId);
      setUnitsState({ status: "success", data });
    } catch (e: any) {
      setUnitsState({ status: "error", message: apiErrorMessage(e) });
    }
  }

  useEffect(() => {
    load();
    setForm({ name: "", type: "ROOM", capacity: 1 });
    setEditingUnitId(null);
    setEditName("");
    setRenameError(null);
    setShowAddForm(false);
  }, [facilityId]);

  useEffect(() => {
    if (unitsState.status !== "success") return;
    setSelectedUnitId((prev) => {
      if (prev && unitsState.data.some((u) => u.id === prev)) return prev;
      return unitsState.data[0]?.id ?? null;
    });
  }, [unitsState]);

  async function onCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!isAdmin) return;
    if (!form.name.trim()) return;

    try {
      await createUnit(facilityId, {
        name: form.name.trim(),
        type: form.type,
        capacity: Number(form.capacity),
      });
      setForm({ name: "", type: form.type, capacity: form.capacity });
      setShowAddForm(false);
      await load();
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  async function onDelete(unitId: number) {
    if (!isAdmin) return;
    const ok = confirm(lexicon.common.deleteConfirmUnit);
    if (!ok) return;

    try {
      await deleteUnit(unitId);
      await load();
      setSelectedUnitId((prev) => {
        if (prev !== unitId) return prev;
        const next =
          unitsState.status === "success"
            ? unitsState.data.filter((u) => u.id !== unitId)
            : [];
        return next[0]?.id ?? null;
      });
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  function startRename(u: Unit) {
    if (!isAdmin) return;
    setRenameError(null);
    setEditingUnitId(u.id);
    setEditName(u.name ?? "");
  }

  function cancelRename() {
    setEditingUnitId(null);
    setEditName("");
    setRenameError(null);
  }

  async function saveRename(u: Unit) {
    if (!isAdmin) return;
    const nextName = editName.trim();
    if (!nextName || nextName === u.name) {
      cancelRename();
      return;
    }
    setRenameSaving(true);
    setRenameError(null);
    try {
      const updated = await patchUnit(u.id, { name: nextName });
      setUnitsState((prev) => {
        if (prev.status !== "success") return prev;
        return {
          status: "success",
          data: prev.data.map((x) => (x.id === updated.id ? updated : x)),
        };
      });
      cancelRename();
    } catch (e: any) {
      setRenameError(apiErrorMessage(e));
    } finally {
      setRenameSaving(false);
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.18, delay: reduced ? 0 : i * 0.05 },
    }),
    exit: { scale: reduced ? 1 : 0.92, opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <div className="up">
      {/* Section header */}
      <div className="up__header">
        <div className="up__headerLeft">
          <span className="up__title">{lexicon.units.title}</span>
          {unitsState.status === "success" && (
            <span className="up__unitCount">{units.length}</span>
          )}
        </div>
        <div className="up__headerRight">
          <button
            className="up__iconBtn"
            onClick={load}
            type="button"
            aria-label={lexicon.common.refresh}
          >
            <CachedIcon sx={{ fontSize: 16 }} />
          </button>
          {isAdmin && (
            <button
              className={`up__addBtn${showAddForm ? " up__addBtn--active" : ""}`}
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
            >
              <AddIcon sx={{ fontSize: 14 }} />
              {lexicon.units.addUnit}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible add-unit form */}
      <AnimatePresence>
        {isAdmin && showAddForm && (
          <motion.div
            className="up__addForm"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <form className="up__addFormInner" onSubmit={onCreate}>
              <div className="up__addFormGrid">
                <div className="up__field">
                  <label className="up__fieldLabel">{lexicon.units.nameLabel}</label>
                  <input
                    className="up__fieldInput"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={lexicon.units.namePlaceholder}
                    autoFocus
                  />
                </div>
                <div className="up__field">
                  <MenuSelect<UnitType>
                    label={lexicon.units.typeLabel}
                    value={form.type}
                    onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                    options={[
                      {
                        value: "ROOM",
                        label: lexicon.units.roomLabel,
                        description: lexicon.units.roomDescription,
                      },
                      {
                        value: "WING",
                        label: lexicon.units.wingLabel,
                        description: lexicon.units.wingDescription,
                      },
                      {
                        value: "FLOOR",
                        label: lexicon.units.floorLabel,
                        description: lexicon.units.floorDescription,
                      },
                    ]}
                  />
                </div>
                <div className="up__field">
                  <label className="up__fieldLabel">{lexicon.units.capacityLabel}</label>
                  <input
                    className="up__fieldInput"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, capacity: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="up__addFormActions">
                <button className="up__submitBtn" type="submit">
                  {lexicon.units.addUnit}
                </button>
                <button
                  className="up__cancelFormBtn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                >
                  {lexicon.common.cancel}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff notice */}
      {!isAdmin && (
        <div className="up__notice">
          <div className="up__noticeTitle">{lexicon.units.unitCreationAdminOnlyTitle}</div>
          <div className="up__noticeBody">
            {lexicon.units.unitCreationAdminOnlyBody}{" "}
            <b>{auth.username ?? "user"}</b> ({auth.role ?? "UNKNOWN"}).
          </div>
        </div>
      )}

      {/* States */}
      {unitsState.status === "loading" && (
        <div className="up__status">{lexicon.common.loading}</div>
      )}
      {unitsState.status === "error" && (
        <div className="up__error">{unitsState.message}</div>
      )}
      {unitsState.status === "success" && units.length === 0 && (
        <div className="up__status">{lexicon.units.noUnits}</div>
      )}

      {/* Unit cards — 2-column grid */}
      {unitsState.status === "success" && units.length > 0 && (
        <div className="up__grid">
          <AnimatePresence mode="popLayout">
            {units.map((u, idx) => {
              const remaining = remainingSpots(u);
              const full = remaining === 0 && (u.capacity ?? 0) > 0;
              const isEditing = editingUnitId === u.id;
              const isSelected = selectedUnitId === u.id;
              const pct = occupancyPercent(u);
              const barColor = occupancyColor(pct);

              return (
                <motion.div
                  key={u.id}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`up__card${isSelected ? " up__card--selected" : ""}`}
                  onClick={() => !isEditing && setSelectedUnitId(u.id)}
                >
                  {/* Card head: name / rename input + type pill + hover actions */}
                  <div className="up__cardHead">
                    <div className="up__cardNameWrap">
                      {isEditing ? (
                        <span
                          className="up__renameWrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            className="up__renameInput"
                            value={editName}
                            autoFocus
                            disabled={renameSaving}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveRename(u);
                              }
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={() => saveRename(u)}
                          />
                        </span>
                      ) : (
                        <span className="up__cardName">{u.name}</span>
                      )}
                    </div>

                    <div className="up__cardRight">
                      {!isEditing && (
                        <span className={`up__typePill up__typePill--${u.type.toLowerCase()}`}>
                          {u.type}
                        </span>
                      )}
                      {isAdmin && !isEditing && (
                        <div className="up__cardActions">
                          <button
                            className="up__actionBtn"
                            type="button"
                            title="Rename unit"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(u);
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 13 }} />
                          </button>
                          <button
                            className="up__actionBtn up__actionBtn--danger"
                            type="button"
                            title={lexicon.units.delete}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(u.id);
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rename error */}
                  {isEditing && renameError && (
                    <div
                      className="up__renameError"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renameError}
                    </div>
                  )}

                  {/* Occupancy bar */}
                  <div className="up__occupancyBar">
                    <div
                      className="up__occupancyFill"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>

                  {/* Occupancy text + full pill */}
                  <div className="up__occupancyRow">
                    <span className="up__occupancyText">
                      {u.occupiedCount}/{u.capacity} occupied · {remaining} remaining
                    </span>
                    {full && <span className="up__fullPill">{lexicon.units.full}</span>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Residents section — slides in when a unit is selected */}
      <AnimatePresence>
        {selectedUnitId != null && unitsState.status === "success" && (
          <motion.div
            key={selectedUnitId}
            className="up__residentsSection"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="up__residentsHeader">
              <span className="up__residentsTitle">
                {lexicon.residentsPanel.title}
                {selectedUnit && (
                  <span className="up__residentsSubtitle"> in {selectedUnit.name}</span>
                )}
              </span>
            </div>
            <div className="up__residentsCard">
              <ResidentsPanel
                unitId={selectedUnitId}
                availableUnits={units}
                onResidentChanged={load}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
