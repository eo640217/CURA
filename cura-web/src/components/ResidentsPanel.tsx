import { useEffect, useMemo, useState } from "react";
import {
  Resident,
  ResidentCreateRequest,
  createResidentUnderUnit,
  listResidentsByUnit,
  transferResident,
} from "../api/residents";
import { Unit } from "../api/units";
import { apiErrorMessage } from "../api/api-error";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function remainingSpots(u: Unit) {
  return Math.max(0, (u.capacity ?? 0) - (u.occupiedCount ?? 0));
}

export function ResidentsPanel({
  unitId,
  availableUnits,
  onResidentChanged,
}: {
  unitId: number;
  availableUnits: Unit[];
  onResidentChanged: () => void | Promise<void>;
}) {
  const [state, setState] = useState<LoadState<Resident[]>>({ status: "idle" });
  const [form, setForm] = useState<ResidentCreateRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    roomNumber: "",
  });

  const [transferTo, setTransferTo] = useState<Record<number, number>>({});

  const residents = useMemo(() => (state.status === "success" ? state.data : []), [state]);

  const currentUnit = useMemo(
    () => availableUnits.find((u) => u.id === unitId) ?? null,
    [availableUnits, unitId]
  );

  const capacity = currentUnit?.capacity ?? 0;
  const used = currentUnit?.occupiedCount ?? residents.length;
  const remaining = Math.max(0, capacity - used);
  const isFull = capacity > 0 && used >= capacity;

  const otherUnits = useMemo(() => {
    return availableUnits.filter((u) => u.id !== unitId);
  }, [availableUnits, unitId]);

  function defaultTransferTarget(): number | null {
    const nonFull = otherUnits.find((u) => remainingSpots(u) > 0);
    return nonFull?.id ?? otherUnits[0]?.id ?? null;
  }

  async function load() {
    try {
      setState({ status: "loading" });
      const data = await listResidentsByUnit(unitId);
      setState({ status: "success", data });
    } catch (e: any) {
      setState({ status: "error", message: apiErrorMessage(e) });
    }
  }

  useEffect(() => {
    load();
    setForm({ firstName: "", lastName: "", dateOfBirth: null, roomNumber: "" });
    setTransferTo({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName?.trim() || !form.lastName?.trim()) return;

    if (isFull) {
      alert("This unit is at capacity. Transfer someone out or increase capacity.");
      return;
    }

    try {
      const created = await createResidentUnderUnit(unitId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth ? form.dateOfBirth : null,
        roomNumber: form.roomNumber?.trim() ? form.roomNumber.trim() : null,
      });

      setState((prev) => {
        if (prev.status !== "success") return prev;
        return { status: "success", data: [created, ...prev.data] };
      });

      setForm((p) => ({ ...p, firstName: "", lastName: "" }));

      // ✅ Update units occupancy immediately
      await onResidentChanged();
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  async function onTransfer(residentId: number) {
    const fallback = defaultTransferTarget();
    if (fallback == null) return;

    const toUnitId = transferTo[residentId] ?? fallback;

    const target = otherUnits.find((u) => u.id === toUnitId);
    if (target && remainingSpots(target) === 0) {
      alert("That unit is full. Pick another one.");
      return;
    }

    try {
      await transferResident(residentId, { toUnitId });
      await load();

      // ✅ Update units occupancy immediately
      await onResidentChanged();
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  const noValidTransferTargets =
    otherUnits.length > 0 && otherUnits.every((u) => remainingSpots(u) === 0);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h4 style={{ margin: 0 }}>Residents</h4>
          {currentUnit && (
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              Unit: <b>{currentUnit.name}</b> · Capacity {capacity} · Occupied {used} ·{" "}
              <b>{remaining}</b> remaining
              {isFull && <span style={{ color: "crimson" }}> · Full</span>}
            </div>
          )}
        </div>

        <button
          onClick={load}
          style={{
            border: "1px solid #ddd",
            background: "white",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Create */}
      <form
        onSubmit={onCreate}
        style={{
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 12,
          display: "grid",
          gap: 10,
          opacity: isFull ? 0.6 : 1,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>First name</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
              disabled={isFull}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Last name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
              disabled={isFull}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Date of birth</label>
            <input
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value || null }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
              disabled={isFull}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Room number</label>
            <input
              value={form.roomNumber ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
              placeholder="e.g. A12"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
              disabled={isFull}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isFull}
          style={{
            justifySelf: "start",
            border: "1px solid #111",
            background: "#111",
            color: "white",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: isFull ? "not-allowed" : "pointer",
          }}
        >
          {isFull ? "Unit Full" : "Add Resident"}
        </button>

        {isFull && (
          <div style={{ fontSize: 12, color: "crimson" }}>
            This unit is at capacity. Transfer someone out or increase unit capacity.
          </div>
        )}
      </form>

      {/* List */}
      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
        {state.status === "loading" && <div>Loading…</div>}
        {state.status === "error" && <div style={{ color: "crimson" }}>{state.message}</div>}

        {state.status === "success" && residents.length === 0 && <div>No residents in this unit.</div>}

        {state.status === "success" && residents.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {residents.map((r) => {
              const fallback = defaultTransferTarget();
              const selected = transferTo[r.id] ?? fallback ?? 0;

              return (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    {r.firstName} {r.lastName}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {r.roomNumber ? `Room ${r.roomNumber}` : "No room #"}{" "}
                    {r.dateOfBirth ? `• DOB ${r.dateOfBirth}` : ""}
                  </div>

                  {otherUnits.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        value={selected}
                        onChange={(e) =>
                          setTransferTo((p) => ({ ...p, [r.id]: Number(e.target.value) }))
                        }
                        style={{ padding: 6, borderRadius: 8, border: "1px solid #ddd" }}
                        disabled={noValidTransferTargets}
                      >
                        {otherUnits.map((u) => {
                          const rem = remainingSpots(u);
                          const full = rem === 0;
                          return (
                            <option key={u.id} value={u.id} disabled={full}>
                              {u.name} ({u.type}) · {u.occupiedCount}/{u.capacity} ·{" "}
                              {full ? "FULL" : `${rem} left`}
                            </option>
                          );
                        })}
                      </select>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransfer(r.id);
                        }}
                        disabled={noValidTransferTargets}
                        style={{
                          border: "1px solid #ddd",
                          background: "white",
                          borderRadius: 8,
                          padding: "6px 10px",
                          cursor: noValidTransferTargets ? "not-allowed" : "pointer",
                          opacity: noValidTransferTargets ? 0.6 : 1,
                        }}
                      >
                        Transfer
                      </button>

                      {noValidTransferTargets && (
                        <span style={{ fontSize: 12, color: "crimson" }}>
                          No available units (all full)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
