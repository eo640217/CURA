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
import MenuSelect from "../components/MenuSelect";
import "./ResidentsPanel.scss";
import CachedIcon from '@mui/icons-material/Cached';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const residents = useMemo(
    () => (state.status === "success" ? state.data : []),
    [state]
  );

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

  const otherUnits = useMemo(
    () => availableUnits.filter((u) => u.id !== unitId),
    [availableUnits, unitId]
  );

  function defaultTransferTarget(): number | null {
    const nonFull = otherUnits.find((u) => remainingSpots(u) > 0);
    return nonFull?.id ?? otherUnits[0]?.id ?? null;
  }


  function openCreate() {
    if (isFull) {
      alert(lexicon.residentsPanel.unitCapacityAlert);
      return;
    }
    setIsCreateOpen(true);
  }

  function closeCreate() {
    setIsCreateOpen(false);
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
    setIsCreateOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    if (!isCreateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCreate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCreateOpen]);



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

      setForm({ firstName: "", lastName: "", dateOfBirth: null, roomNumber: "" });
      closeCreate();
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

  const noValidTransferTargets =
    otherUnits.length > 0 && otherUnits.every((u) => remainingSpots(u) === 0);

  return (
    <div className="rp">
      <div className="rp__header">
        <div>
          <h4 className="rp__title">{lexicon.residentsPanel.title}</h4>

          {currentUnit && (
            <div className="rp__sub">
              <div>
                Unit: <b>{currentUnit.name}</b> · Capacity {capacity} · Occupied{" "}
                {used} · <b>{remaining}</b> remaining
                {isFull && (
                  <span className="rp__full"> · {lexicon.units.full}</span>
                )}
              </div>

              <div className="rp__auth">
                {lexicon.topBar.signedInAs}{" "}
                <b>{auth.username ?? "user"}</b> ({auth.role ?? "UNKNOWN"})
                {!isAdmin && (
                  <span> · {lexicon.residentsPanel.staffAccess}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rp__headerActions">
          <button onClick={load} type="button" aria-label={lexicon.common.refresh}>
            <CachedIcon fontSize="small" />
          </button>


          <button
            className="rp__primary"
            onClick={openCreate}
            disabled={isFull || !canCreateResident}
            type="button"
          >
            {lexicon.residentsPanel.create_resident}
          </button>
        </div>

      </div>

      <div className="rp__list">
        {state.status === "loading" && (
          <div className="rp__status">{lexicon.common.loading}</div>
        )}
        {state.status === "error" && (
          <div className="rp__error">{state.message}</div>
        )}
        {state.status === "success" && residents.length === 0 && (
          <div className="rp__status">{lexicon.residentsPanel.noResidents}</div>
        )}

        {state.status === "success" && residents.length > 0 && (
          <div className="rp__cards">
            {residents.map((r) => {
              const fallback = defaultTransferTarget();
              const selected = transferTo[r.id] ?? fallback ?? 0;

              const transferOptions = otherUnits.map((u) => {
                const rem = remainingSpots(u);
                const full = rem === 0;
                return {
                  value: u.id,
                  disabled: full,
                  label: `${u.name} (${u.type}) · ${u.occupiedCount}/${u.capacity} · ${full ? "FULL" : `${rem} left`
                    }`,
                };
              });

              return (
                <div key={r.id} className="rp__card">
                  <div className="rp__name">
                    {r.firstName} {r.lastName}
                  </div>

                  <div className="rp__meta">
                    {r.roomNumber
                      ? `Room ${r.roomNumber}`
                      : lexicon.residentsPanel.noRoom}
                    {r.dateOfBirth ? ` • DOB ${r.dateOfBirth}` : ""}
                  </div>

                  {otherUnits.length > 0 && (
                    <div className="rp__transferRow">
                      <MenuSelect
                        value={selected}
                        options={transferOptions}
                        disabled={noValidTransferTargets}
                        onChange={(val: number) =>
                          setTransferTo((p) => ({ ...p, [r.id]: val }))
                        }
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransfer(r.id);
                        }}
                        disabled={
                          noValidTransferTargets || !canTransferResident
                        }
                      >
                        {lexicon.residentsPanel.transfer}
                      </button>

                      {noValidTransferTargets && (
                        <span className="rp__warn">
                          {lexicon.residentsPanel.noAvailableUnits}
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

      {isCreateOpen && (
        <div
          className="rp__modalOverlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) closeCreate();
          }}
        >
          <div className="rp__modal">
            <div className="rp__modalHeader">
              <h4 className="rp__modalTitle">{lexicon.residentsPanel.create_resident}</h4>

              <button className="rp__modalClose" type="button" onClick={closeCreate}>
                {lexicon.common.closeX}
              </button>
            </div>

            <form className="rp__form" onSubmit={onCreate}>
              <div className="rp__grid2">
                <div className="rp__field">
                  <label>{lexicon.residentsPanel.firstName}</label>
                  <input
                    autoFocus
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
                <div className="rp__field dob__field">
                  <label>{lexicon.residentsPanel.dob}</label>
                  <input
                    type="date"
                    value={form.dateOfBirth ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value || null }))}
                    disabled={isFull}
                  />
                </div>

                <div className="rp__field rm_number__field">
                  <label>{lexicon.residentsPanel.roomNumber}</label>
                  <input
                    value={form.roomNumber ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                    placeholder={lexicon.residentsPanel.roomPlaceholder}
                    disabled={isFull}
                  />
                </div>
              </div>

              <div className="rp__modalActions">
                <button type="button" onClick={closeCreate}>
                  {lexicon.common.cancel}
                </button>

                <button className="rp__primary" type="submit" disabled={isFull || !canCreateResident}>
                  {isFull ? lexicon.residentsPanel.unitFull : lexicon.residentsPanel.addResident}
                </button>
              </div>

              {isFull && <div className="rp__hint">{lexicon.residentsPanel.unitCapacityHint}</div>}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
