import { useEffect, useMemo, useState } from "react";
import { Unit, UnitCreateRequest, UnitType, createUnit, deleteUnit, listUnitsByFacility } from "../api/units";
import { ResidentsPanel } from "./ResidentsPanel";
import { getAuth } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./UnitsPanel.scss";

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

  return (
    <div className="up">
      <div className="up__header">
        <h3 className="up__title">{lexicon.units.title}</h3>
        <button onClick={load}>{lexicon.common.refresh}</button>
      </div>

      {isAdmin ? (
        <form className="up__form" onSubmit={onCreate}>
          <div className="up__formGrid">
            <div className="up__field">
              <label>{lexicon.units.nameLabel}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={lexicon.units.namePlaceholder}
              />
            </div>

            <div className="up__field">
              <label>{lexicon.units.typeLabel}</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as UnitType }))}
              >
                {UNIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="up__field">
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
        {unitsState.status === "success" && units.length === 0 && <div className="up__status">{lexicon.units.noUnits}</div>}

        {unitsState.status === "success" && units.length > 0 && (
          <div className="up__cards">
            {units.map((u) => {
              const remaining = remainingSpots(u);
              const full = remaining === 0;

              return (
                <div
                  key={u.id}
                  className={`up__card ${selectedUnitId === u.id ? "up__card--active" : ""}`}
                  onClick={() => setSelectedUnitId(u.id)}
                >
                  <div>
                    <div className="up__cardTitle">
                      {u.name}
                      {full && <span className="up__pill">{lexicon.units.full}</span>}
                    </div>

                    <div className="up__meta">
                      {u.type} • {u.occupiedCount}/{u.capacity} occupied • {remaining} remaining
                    </div>
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
