import { useEffect, useMemo, useState } from "react";
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
import CachedIcon from '@mui/icons-material/Cached';

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

const UNIT_TYPES: UnitType[] = ["ROOM", "WING", "FLOOR"];

function remainingSpots(u: Unit) {
  return Math.max(0, (u.capacity ?? 0) - (u.occupiedCount ?? 0));
}

export function UnitsPanel({ facilityId }: { facilityId: number }) {
  const auth = getAuth();
  const isAdmin = auth.role === "ADMIN";

  const [unitsState, setUnitsState] = useState<LoadState<Unit[]>>({ status: "idle" });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const [form, setForm] = useState<UnitCreateRequest>({
    name: "",
    type: "ROOM",
    capacity: 1,
  });

  // --- inline rename state ---
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const units = useMemo(() => (unitsState.status === "success" ? unitsState.data : []), [unitsState]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  useEffect(() => {
    if (unitsState.status !== "success") return;
    setSelectedUnitId((prev) => {
      if (prev && unitsState.data.some((u) => u.id === prev)) return prev;
      return unitsState.data[0]?.id ?? null;
    });
  }, [unitsState]);

  async function onCreate(e: React.FormEvent) {
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
        const next = unitsState.status === "success" ? unitsState.data.filter((u) => u.id !== unitId) : [];
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

      // update list in-place (no full reload needed)
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

  return (
    <div className="up">
      <div className="up__header">
        <h3 className="up__title">{lexicon.units.title}</h3>
        <button onClick={load} type="button" aria-label={lexicon.common.refresh}>
          <CachedIcon fontSize="small" />
        </button>
      </div>

      {isAdmin ? (
        <form className="up__form" onSubmit={onCreate}>
          <div className="up__formGrid">
            <div className="up__field name__field">
              <label>{lexicon.units.nameLabel}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={lexicon.units.namePlaceholder}
              />
            </div>



            <div className="up__field type__field">
              <MenuSelect<UnitType>
                label={lexicon.units.typeLabel}
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                options={[
                  { value: "ROOM", label: lexicon.units.roomLabel, description: lexicon.units.roomDescription },
                  { value: "WING", label: lexicon.units.wingLabel, description: lexicon.units.wingDescription },
                  { value: "FLOOR", label: lexicon.units.floorLabel, description: lexicon.units.floorDescription },
                ]}
              />
            </div>


            <div className="up__field capacity__field">
              <label>{lexicon.units.capacityLabel}</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
              />
            </div>
          </div>

          <button className="up__primary" type="submit">
            {lexicon.units.addUnit}
          </button>
        </form>
      ) : (
        <div className="up__notice">
          <div className="up__noticeTitle">{lexicon.units.unitCreationAdminOnlyTitle}</div>
          <div className="up__noticeBody">
            {lexicon.units.unitCreationAdminOnlyBody} <b>{auth.username ?? "user"}</b> ({auth.role ?? "UNKNOWN"}).
          </div>
        </div>
      )}

      <div className="up__list">
        {unitsState.status === "loading" && <div className="up__status">{lexicon.common.loading}</div>}
        {unitsState.status === "error" && <div className="up__error">{unitsState.message}</div>}
        {unitsState.status === "success" && units.length === 0 && (
          <div className="up__status">{lexicon.units.noUnits}</div>
        )}

        {unitsState.status === "success" && units.length > 0 && (
          <div className="up__cards">
            {units.map((u) => {
              const remaining = remainingSpots(u);
              const full = remaining === 0;
              const isEditing = editingUnitId === u.id;

              return (
                <div
                  key={u.id}
                  className={`up__card ${selectedUnitId === u.id ? "up__card--active" : ""}`}
                  onClick={() => setSelectedUnitId(u.id)}
                >
                  <div>
                    <div className="up__cardTitle">
                      {isEditing ? (
                        <span
                          style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            value={editName}
                            autoFocus
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveRename(u);
                              }
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={() => saveRename(u)}
                            style={{ maxWidth: 220 }}
                          />
                          <button
                            type="button"
                            disabled={renameSaving}
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRename(u);
                            }}
                          >
                            {renameSaving ? lexicon.common.loading : lexicon.common.create /* replace if you have "Save" */}
                          </button>
                          <button
                            type="button"
                            disabled={renameSaving}
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelRename();
                            }}
                          >
                            {lexicon.common.cancel}
                          </button>
                        </span>
                      ) : (
                        <span>
                          {u.name}{" "}
                          {isAdmin && (
                            <button
                              type="button"
                              className="up__linkBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(u);
                              }}
                              title="Rename unit"
                            >
                              ✎
                            </button>
                          )}
                        </span>
                      )}

                      {full && <span className="up__pill">{lexicon.units.full}</span>}
                    </div>

                    <div className="up__meta">
                      {u.type} • {u.occupiedCount}/{u.capacity} occupied • {remaining} remaining
                    </div>

                    {isEditing && renameError && (
                      <div className="up__error" style={{ marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                        {renameError}
                      </div>
                    )}
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(u.id);
                      }}
                    >
                      {lexicon.units.delete}
                    </button>
                  ) : (
                    <span className="up__adminOnly">{lexicon.common.adminOnly}</span>
                  )}
                </div>
              );
            })}

            {selectedUnitId != null && (
              <div className="up__residentPanel">
                <ResidentsPanel unitId={selectedUnitId} availableUnits={units} onResidentChanged={load} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
