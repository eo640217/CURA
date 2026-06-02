import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { listFacilities, Facility } from "../api/facilities";
import { listUnitsByFacility, Unit } from "../api/units";
import { createResidentUnderUnit, ResidentCreateRequest } from "../api/residents";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./CreateResidentModal.scss";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type SubmitState = "idle" | "loading" | "success" | { error: string };

type Step = 1 | 2 | 3;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function remainingSpots(u: Unit) {
  return Math.max(0, (u.capacity ?? 0) - (u.occupiedCount ?? 0));
}

function isUnitFull(u: Unit) {
  return (u.capacity ?? 0) > 0 && u.occupiedCount >= u.capacity;
}

const STEP_TITLES: Record<Step, string> = {
  1: "Select a Facility",
  2: "Select a Unit",
  3: "Resident Details",
};

export default function CreateResidentModal({ open, onClose, onCreated }: Props) {
  const reduced = useReducedMotion();

  const [step, setStep] = useState<Step>(1);
  // direction tracks whether we're moving forward (1) or backward (-1) for animation
  const [direction, setDirection] = useState(1);

  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  const [unitsState, setUnitsState] = useState<LoadState<Unit[]>>({ status: "idle" });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const [form, setForm] = useState<ResidentCreateRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    roomNumber: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setDirection(1);
      setFacilitiesState({ status: "idle" });
      setSelectedFacilityId(null);
      setUnitsState({ status: "idle" });
      setSelectedUnitId(null);
      setForm({ firstName: "", lastName: "", dateOfBirth: null, roomNumber: "" });
      setFormError(null);
      setSubmitState("idle");
    }
  }, [open]);

  // Load facilities when modal opens
  useEffect(() => {
    if (!open) return;
    async function load() {
      try {
        setFacilitiesState({ status: "loading" });
        const data = await listFacilities();
        setFacilitiesState({ status: "success", data });
      } catch (e: any) {
        setFacilitiesState({ status: "error", message: apiErrorMessage(e) });
      }
    }
    load();
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function loadUnits(facilityId: number) {
    try {
      setUnitsState({ status: "loading" });
      const data = await listUnitsByFacility(facilityId);
      setUnitsState({ status: "success", data });
    } catch (e: any) {
      setUnitsState({ status: "error", message: apiErrorMessage(e) });
    }
  }

  function goNext() {
    setDirection(1);
    if (step === 1) {
      if (selectedFacilityId == null) return;
      loadUnits(selectedFacilityId);
      setStep(2);
    } else if (step === 2) {
      if (selectedUnitId == null) return;
      setStep(3);
    }
  }

  function goBack() {
    setDirection(-1);
    if (step === 2) {
      setSelectedUnitId(null);
      setUnitsState({ status: "idle" });
      setStep(1);
    } else if (step === 3) {
      setFormError(null);
      setSubmitState("idle");
      setStep(2);
    }
  }

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (selectedUnitId == null) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName) {
      setFormError(`${lexicon.residentsPanel.firstName} is required.`);
      return;
    }
    if (!lastName) {
      setFormError(`${lexicon.residentsPanel.lastName} is required.`);
      return;
    }

    setFormError(null);
    setSubmitState("loading");

    try {
      await createResidentUnderUnit(selectedUnitId, {
        firstName,
        lastName,
        dateOfBirth: form.dateOfBirth || null,
        roomNumber: form.roomNumber?.trim() || null,
      });

      setSubmitState("success");
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);
    } catch (e: any) {
      setSubmitState({ error: apiErrorMessage(e) });
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: reduced ? 0 : dir * 20,
      opacity: reduced ? 1 : 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reduced ? 0 : dir * -20,
      opacity: reduced ? 1 : 0,
    }),
  };

  const facilities = facilitiesState.status === "success" ? facilitiesState.data : [];
  const units = unitsState.status === "success" ? unitsState.data : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="crm__root"
          onClick={onClose}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="crm__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="crm__header">
              <h2 className="crm__title">
                {submitState === "success" ? "Resident Added" : "New Resident"}
              </h2>
              <button
                className="crm__closeBtn"
                type="button"
                aria-label="Close"
                onClick={onClose}
              >
                {lexicon.common.closeX}
              </button>
            </div>

            {/* Step indicator */}
            {submitState !== "success" && (
              <div className="crm__stepIndicator">
                {([1, 2, 3] as Step[]).map((s) => (
                  <span
                    key={s}
                    className={`crm__stepDot${step === s ? " crm__stepDot--active" : ""}`}
                  />
                ))}
                <span className="crm__stepLabel">Step {step} of 3 — {STEP_TITLES[step]}</span>
              </div>
            )}

            {/* Step body */}
            <div className="crm__stepBody">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* ── STEP 1: Facility picker ─────────────────────────── */}
                  {step === 1 && (
                    <div className="crm__list">
                      {facilitiesState.status === "loading" && (
                        <div className="crm__status">{lexicon.common.loading}</div>
                      )}
                      {facilitiesState.status === "error" && (
                        <div className="crm__listError">
                          <div className="crm__error">{facilitiesState.message}</div>
                          <button
                            className="crm__retryBtn"
                            type="button"
                            onClick={() => {
                              setFacilitiesState({ status: "idle" });
                              listFacilities()
                                .then((d) => setFacilitiesState({ status: "success", data: d }))
                                .catch((e) => setFacilitiesState({ status: "error", message: apiErrorMessage(e) }));
                            }}
                          >
                            {lexicon.common.tryAgain}
                          </button>
                        </div>
                      )}
                      {facilitiesState.status === "success" && facilities.length === 0 && (
                        <div className="crm__status">{lexicon.common.noData}</div>
                      )}
                      {facilities.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`crm__listRow${selectedFacilityId === f.id ? " crm__listRow--selected" : ""}`}
                          onClick={() => setSelectedFacilityId(f.id)}
                        >
                          <div>
                            <div className="crm__listRowName">{f.name}</div>
                            <div className="crm__listRowMeta">{f.address}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── STEP 2: Unit picker ─────────────────────────────── */}
                  {step === 2 && (
                    <div className="crm__list">
                      {unitsState.status === "loading" && (
                        <div className="crm__status">{lexicon.common.loading}</div>
                      )}
                      {unitsState.status === "error" && (
                        <div className="crm__listError">
                          <div className="crm__error">{unitsState.message}</div>
                          <button
                            className="crm__retryBtn"
                            type="button"
                            onClick={() => selectedFacilityId != null && loadUnits(selectedFacilityId)}
                          >
                            {lexicon.common.tryAgain}
                          </button>
                        </div>
                      )}
                      {unitsState.status === "success" && units.length === 0 && (
                        <div className="crm__status">{lexicon.units.noUnits}</div>
                      )}
                      {units.map((u) => {
                        const full = isUnitFull(u);
                        const remaining = remainingSpots(u);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            className={`crm__listRow${selectedUnitId === u.id ? " crm__listRow--selected" : ""}${full ? " crm__listRow--disabled" : ""}`}
                            onClick={() => !full && setSelectedUnitId(u.id)}
                            disabled={full}
                          >
                            <div>
                              <div className="crm__listRowName">{u.name}</div>
                              <div className="crm__listRowMeta">
                                {u.type} · {u.occupiedCount}/{u.capacity} occupied · {remaining} remaining
                              </div>
                            </div>
                            {full && (
                              <span className="crm__fullPill">{lexicon.units.full}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ── STEP 3: Resident form ────────────────────────────── */}
                  {step === 3 && submitState !== "success" && (
                    <form id="crm-form" onSubmit={onSubmit} className="crm__form">
                      <div className="crm__grid2">
                        <div className="crm__field">
                          <label className="crm__label">{lexicon.residentsPanel.firstName}</label>
                          <input
                            className="crm__input"
                            value={form.firstName}
                            autoFocus
                            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="crm__field">
                          <label className="crm__label">{lexicon.residentsPanel.lastName}</label>
                          <input
                            className="crm__input"
                            value={form.lastName}
                            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="crm__gridOptional">
                        <div className="crm__field">
                          <label className="crm__label">{lexicon.residentsPanel.dob}</label>
                          <input
                            className="crm__input"
                            type="date"
                            value={form.dateOfBirth ?? ""}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, dateOfBirth: e.target.value || null }))
                            }
                          />
                        </div>
                        <div className="crm__field">
                          <label className="crm__label">{lexicon.residentsPanel.roomNumber}</label>
                          <input
                            className="crm__input"
                            value={form.roomNumber ?? ""}
                            placeholder={lexicon.residentsPanel.roomPlaceholder}
                            onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      {formError && <div className="crm__error">{formError}</div>}
                      {typeof submitState === "object" && "error" in submitState && (
                        <div className="crm__error">{submitState.error}</div>
                      )}
                    </form>
                  )}

                  {/* ── SUCCESS state ────────────────────────────────────── */}
                  {submitState === "success" && (
                    <div className="crm__success">
                      <div className="crm__successMsg">
                        {lexicon.residentsPanel.addResident} — resident created successfully.
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            {submitState !== "success" && (
              <div className="crm__actions">
                <div>
                  {step > 1 && (
                    <button
                      className="crm__backBtn"
                      type="button"
                      onClick={goBack}
                      disabled={submitState === "loading"}
                    >
                      {lexicon.common.back}
                    </button>
                  )}
                </div>
                <div className="crm__actionsRight">
                  <button
                    className="crm__cancelBtn"
                    type="button"
                    onClick={onClose}
                    disabled={submitState === "loading"}
                  >
                    {lexicon.common.cancel}
                  </button>
                  {step < 3 ? (
                    <button
                      className="crm__nextBtn"
                      type="button"
                      onClick={goNext}
                      disabled={
                        (step === 1 && selectedFacilityId == null) ||
                        (step === 2 && selectedUnitId == null)
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="crm__submitBtn"
                      type="submit"
                      form="crm-form"
                      disabled={submitState === "loading"}
                    >
                      {submitState === "loading"
                        ? lexicon.common.creating
                        : lexicon.residentsPanel.addResident}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
