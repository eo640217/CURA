import { useEffect, useMemo, useState } from "react";
import { Unit, UnitCreateRequest, UnitType, createUnit, deleteUnit, listUnitsByFacility } from "../api/units";
import { ResidentsPanel } from "./ResidentsPanel";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

const UNIT_TYPES: UnitType[] = ["ROOM", "WING", "FLOOR"];

export function UnitsPanel({ facilityId }: { facilityId: number }) {
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
      setUnitsState({ status: "error", message: e?.message ?? "Failed to load units" });
    }
  }

  useEffect(() => {
    load();
    // reset form when switching facilities
    setForm({ name: "", type: "ROOM", capacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  useEffect(() => {
  if (unitsState.status === "success") {
    setSelectedUnitId(unitsState.data[0]?.id ?? null);
    }
  }, [unitsState]);


  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const created = await createUnit(facilityId, {
        name: form.name.trim(),
        type: form.type,
        capacity: Number(form.capacity),
      });

      // optimistic add
      setUnitsState((prev) => {
        if (prev.status !== "success") return prev;
        return { status: "success", data: [created, ...prev.data] };
      });

      setForm({ name: "", type: form.type, capacity: form.capacity });
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Failed to create unit");
    }
  }

  async function onDelete(unitId: number) {
    const ok = confirm("Delete this unit?");
    if (!ok) return;

    try {
      await deleteUnit(unitId);
      setUnitsState((prev) => {
        if (prev.status !== "success") return prev;
        return { status: "success", data: prev.data.filter((u) => u.id !== unitId) };
      });
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Failed to delete unit");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>Units</h3>
        <button onClick={load} style={{ border: "1px solid #ddd", background: "white", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {/* Create form */}
      <form onSubmit={onCreate} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='e.g. "2A" or "West Wing"'
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as UnitType }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
            >
              {UNIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Capacity</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            justifySelf: "start",
            border: "1px solid #111",
            background: "#111",
            color: "white",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Add Unit
        </button>
      </form>

      {/* List */}
      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
        {unitsState.status === "loading" && <div>Loading…</div>}
        {unitsState.status === "error" && <div style={{ color: "crimson" }}>{unitsState.message}</div>}

        {unitsState.status === "success" && units.length === 0 && <div>No units yet.</div>}

        {unitsState.status === "success" && units.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {units.map((u) => (
                <div
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    style={{
                        cursor: "pointer",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10,
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 10,
                        border: selectedUnitId === u.id ? "2px solid #111" : "1px solid #ddd",
                    }}
                >
                    {/* {selectedUnitId != null && (
                        <div style={{ marginTop: 12 }}>
                            <ResidentsPanel unitId={selectedUnitId} />
                        </div>
                    )} */}

                    


                <div>
                  <div style={{ fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {u.type} • capacity {u.capacity}
                  </div>
                </div>
                

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(u.id);
                        }}
                        style={{
                            border: "1px solid #ddd",
                            background: "white",
                            borderRadius: 8,
                            padding: "6px 10px",
                            cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>

              </div>
            ))}

            {selectedUnitId != null && unitsState.status === "success" && (
                <div style={{ marginTop: 12 }}>
                    <ResidentsPanel
                        unitId={selectedUnitId}
                        availableUnits={unitsState.data}
                    />
                </div>
                      )}
            </div>
            )}
        </div>
    </div>
  );
}
