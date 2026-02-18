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
import { getAuth } from "../auth/auth";
import lexicon from "../assets/lexicon";
import "./ResidentsPanel.scss";

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

  const auth = getAuth();
  const isAdmin = auth.role === "ADMIN";

  const canCreateResident = true;
  const canTransferResident = true;

  const otherUnits = useMemo(() => availableUnits.filter((u) => u.id !== unitId), [availableUnits, unitId]);

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
      alert(lexicon.residentsPanel.unitCapacityAlert);
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
      await onResidentChanged();
    } catch (e: any) {
      alert(apiErrorMessage(e));
    }
  }

  const noValidTransferTargets = otherUnits.length > 0 && otherUnits.every((u) => remainingSpots(u) === 0);

  return (
    <div className="rp">
      <div className="rp__header">
        <div>
          <h4 className="rp__title">{lexicon.residentsPanel.title}</h4>

          {currentUnit && (
            <div className="rp__sub">
              <div>
                Unit: <b>{currentUnit.name}</b> · Capacity {capacity} · Occupied {used} ·{" "}
                <b>{remaining}</b> remaining
                {isFull && <span className="rp__full"> · {lexicon.units.full}</span>}
              </div>

              <div className="rp__auth">
                {lexicon.topBar.signedInAs} <b>{auth.username ?? "user"}</b> ({auth.role ?? "UNKNOWN"})
                {!isAdmin && <span> · {lexicon.residentsPanel.staffAccess}</span>}
              </div>
            </div>
          )}
        </div>

        <button onClick={load}>{lexicon.common.refresh}</button>
      </div>

      <form className={`rp__form ${isFull ? "rp__form--disabled" : ""}`} onSubmit={onCreate}>
        <div className="rp__grid2">
          <div className="rp__field">
            <label>{lexicon.residentsPanel.firstName}</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              disabled={isFull}
            />
          </div>

          <div className="rp__field">
            <label>{lexicon.residentsPanel.lastName}</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              disabled={isFull}
            />
          </div>
        </div>

        <div className="rp__gridDobRoom">
          <div className="rp__field">
            <label>{lexicon.residentsPanel.dob}</label>
            <input
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value || null }))}
              disabled={isFull}
            />
          </div>

          <div className="rp__field">
            <label>{lexicon.residentsPanel.roomNumber}</label>
            <input
              value={form.roomNumber ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
              placeholder={lexicon.residentsPanel.roomPlaceholder}
              disabled={isFull}
            />
          </div>
        </div>

        <button className="rp__primary" type="submit" disabled={isFull || !canCreateResident}>
          {isFull ? lexicon.residentsPanel.unitFull : lexicon.residentsPanel.addResident}
        </button>

        {isFull && <div className="rp__hint">{lexicon.residentsPanel.unitCapacityHint}</div>}
      </form>

      <div className="rp__list">
        {state.status === "loading" && <div className="rp__status">{lexicon.common.loading}</div>}
        {state.status === "error" && <div className="rp__error">{state.message}</div>}
        {state.status === "success" && residents.length === 0 && <div className="rp__status">{lexicon.residentsPanel.noResidents}</div>}

        {state.status === "success" && residents.length > 0 && (
          <div className="rp__cards">
            {residents.map((r) => {
              const fallback = defaultTransferTarget();
              const selected = transferTo[r.id] ?? fallback ?? 0;

              return (
                <div key={r.id} className="rp__card">
                  <div className="rp__name">
                    {r.firstName} {r.lastName}
                  </div>

                  <div className="rp__meta">
                    {r.roomNumber ? `Room ${r.roomNumber}` : lexicon.residentsPanel.noRoom}
                    {r.dateOfBirth ? ` • DOB ${r.dateOfBirth}` : ""}
                  </div>

                  {otherUnits.length > 0 && (
                    <div className="rp__transferRow">
                      <select
                        value={selected}
                        onChange={(e) => setTransferTo((p) => ({ ...p, [r.id]: Number(e.target.value) }))}
                        disabled={noValidTransferTargets}
                      >
                        {otherUnits.map((u) => {
                          const rem = remainingSpots(u);
                          const full = rem === 0;
                          return (
                            <option key={u.id} value={u.id} disabled={full}>
                              {u.name} ({u.type}) · {u.occupiedCount}/{u.capacity} · {full ? "FULL" : `${rem} left`}
                            </option>
                          );
                        })}
                      </select>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransfer(r.id);
                        }}
                        disabled={noValidTransferTargets || !canTransferResident}
                      >
                        {lexicon.residentsPanel.transfer}
                      </button>

                      {noValidTransferTargets && <span className="rp__warn">{lexicon.residentsPanel.noAvailableUnits}</span>}
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
