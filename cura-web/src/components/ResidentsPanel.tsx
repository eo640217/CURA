import { useEffect, useState } from "react";
import {
  Resident,
  ResidentCreateRequest,
  createResidentUnderUnit,
  listResidentsByUnit,
  transferResident
} from "../api/residents";
import { Unit } from "../api/units";


type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function apiErrorMessage(e: any): string {
  return e?.response?.data?.message ?? e?.message ?? "Request failed";
}

export function ResidentsPanel({ unitId, availableUnits }: { unitId: number; availableUnits: Unit[] }) {
  const [state, setState] = useState<LoadState<Resident[]>>({ status: "idle" });
  const [form, setForm] = useState<ResidentCreateRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    roomNumber: "",
  });
  const [transferTo, setTransferTo] = useState<Record<number, number>>({});


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName?.trim() || !form.lastName?.trim()) return;

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
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  const residents = state.status === "success" ? state.data : [];
  const otherUnits = availableUnits.filter((u) => u.id !== unitId);


  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h4 style={{ margin: 0 }}>Residents</h4>
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
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>First name</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Last name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
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
            />
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Room number</label>
            <input
              value={form.roomNumber ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
              placeholder="e.g. A12"
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
          Add Resident
        </button>
      </form>

      {/* List */}
      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
        {state.status === "loading" && <div>Loading…</div>}
        {state.status === "error" && <div style={{ color: "crimson" }}>{state.message}</div>}

        {state.status === "success" && residents.length === 0 && <div>No residents in this unit.</div>}

        {state.status === "success" && residents.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {residents.map((r) => (
                
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
                                value={transferTo[r.id] ?? otherUnits[0].id}
                                onChange={(e) =>
                                    setTransferTo((p) => ({ ...p, [r.id]: Number(e.target.value) }))
                                }
                                style={{ padding: 6, borderRadius: 8, border: "1px solid #ddd" }}
                            >
                                {otherUnits.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.type})
                                    </option>
                                ))}
                            </select>

                            {/* <button
                                onClick={async () => {
                                    try {
                                        const toUnitId = transferTo[r.id] ?? otherUnits[0].id;
                                        await transferResident(r.id, { toUnitId });
                                        await load(); // refresh current unit’s resident list
                                    } catch (e: any) {
                                        alert(apiErrorMessage(e));
                                    }
                                }}
                                style={{
                                    border: "1px solid #ddd",
                                    background: "white",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Transfer
                            </button> */}

                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        const toUnitId = transferTo[r.id] ?? otherUnits[0].id;
                                        await transferResident(r.id, { toUnitId });
                                        await load();
                                    } catch (e: any) {
                                        alert(apiErrorMessage(e));
                                    }
                                }}
                                style={{
                                    border: "1px solid #ddd",
                                    background: "white",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Transfer
                            </button>

                        </div>
                    )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
