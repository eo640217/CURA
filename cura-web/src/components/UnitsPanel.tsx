import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Unit,
  deleteUnit,
  listUnitsByFacility,
  patchUnit,
} from "../api/units";
import { ResidentsPanel } from "./ResidentsPanel";
import { getAuth, roleAtLeast } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./UnitsPanel.scss";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

export function UnitsPanel({
  facilityId,
  onUnitsLoaded,
}: {
  facilityId: number;
  onUnitsLoaded?: (units: Unit[]) => void;
}) {
  const auth = getAuth();
  const isAdmin = roleAtLeast(auth.role, "ADMIN");
  const reduced = useReducedMotion();
  const queryClient = useQueryClient();

  const unitsQuery = useQuery({
    queryKey: ["units", facilityId],
    queryFn: () => listUnitsByFacility(facilityId),
  });
  const unitsState: LoadState<Unit[]> = unitsQuery.isLoading
    ? { status: "loading" }
    : unitsQuery.isError
      ? { status: "error", message: apiErrorMessage(unitsQuery.error) }
      : unitsQuery.isSuccess
        ? { status: "success", data: unitsQuery.data }
        : { status: "idle" };

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

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

  function load() {
    return queryClient.invalidateQueries({ queryKey: ["units", facilityId] });
  }

  useEffect(() => {
    setEditingUnitId(null);
    setEditName("");
    setRenameError(null);
  }, [facilityId]);

  useEffect(() => {
    if (unitsQuery.isSuccess) onUnitsLoaded?.(unitsQuery.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitsQuery.isSuccess, unitsQuery.data]);

  useEffect(() => {
    if (unitsState.status !== "success") return;
    setSelectedUnitId((prev) => {
      if (prev && unitsState.data.some((u) => u.id === prev)) return prev;
      return unitsState.data[0]?.id ?? null;
    });
  }, [unitsState]);

  async function onDelete(unitId: number) {
    if (!isAdmin) return;
    const ok = confirm(lexicon.common.deleteConfirmUnit);
    if (!ok) return;

    const remaining = units.filter((u) => u.id !== unitId);
    try {
      await deleteUnit(unitId);
      await load();
      setSelectedUnitId((prev) => (prev === unitId ? remaining[0]?.id ?? null : prev));
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
      queryClient.setQueryData<Unit[]>(["units", facilityId], (prev) =>
        prev?.map((x) => (x.id === updated.id ? updated : x))
      );
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
      </div>

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

                  {/* Care speciality label */}
                  {u.careSpeciality && (
                    <div className="up__careSpeciality">{u.careSpeciality}</div>
                  )}

                  {/* Room tags — shown if API returns rooms data */}
                  {u.rooms && u.rooms.length > 0 && (
                    <div className="up__roomTags">
                      {u.rooms.map((r) => (
                        <span key={r} className="up__roomTag">{r}</span>
                      ))}
                    </div>
                  )}
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
