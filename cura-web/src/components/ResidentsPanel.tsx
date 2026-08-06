import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Resident,
  listResidentsByUnit,
  transferResident,
} from "../api/residents";
import { Unit } from "../api/units";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import MenuSelect from "../components/MenuSelect";
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
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState<Resident[]>>({ status: "idle" });
  const [transferTo, setTransferTo] = useState<Record<number, number>>({});

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
  const isFull = capacity > 0 && used >= capacity;

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
    const facilityId = currentUnit?.facilityId;
    const params = new URLSearchParams();
    if (facilityId) params.set("facilityId", String(facilityId));
    params.set("unitId", String(unitId));
    navigate(`/residents/new?${params.toString()}`);
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
    setTransferTo({});
  }, [unitId]);

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
              Unit: <b>{currentUnit.name}</b> · {capacity} capacity · {used} occupied
              {isFull && (
                <span className="rp__full"> · {lexicon.units.full}</span>
              )}
            </div>
          )}
        </div>

        <div className="rp__headerActions">
          <button
            className="rp__primary"
            onClick={openCreate}
            disabled={isFull}
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

    </div>
  );
}
