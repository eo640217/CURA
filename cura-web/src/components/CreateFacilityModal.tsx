import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createFacility } from "../api/facilities";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./CreateFacilityModal.scss";

type WizardStep = 1 | 2 | 3 | 4;

type SubmitState = "idle" | "loading" | "success" | { error: string };

interface FacilityForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  facilityType: string;
  licenseNumber: string;
  capacity: string;
}

interface UnitRow {
  localId: string;
  name: string;
  careSpeciality: string;
  capacity: string;
  nameError?: string;
  capacityError?: string;
}

const FACILITY_TYPES = [
  "Residential",
  "Nursing Home",
  "Memory Care",
  "Assisted Living",
  "Rehabilitation",
];

const CARE_SPECIALITIES = ["General", "Dementia", "Palliative", "Rehabilitation", "Psychiatric"];

interface FacilityTypeConfig {
  label: string;
  showSpeciality: boolean;
  description: string;
}

const FACILITY_TYPE_CONFIG: Record<string, FacilityTypeConfig> = {
  Residential:       { label: "Wing",    showSpeciality: false, description: "Define the wings or sections of this facility. You can skip this step." },
  "Nursing Home":    { label: "Unit",    showSpeciality: true,  description: "Define the clinical units within this facility. Units group residents by care type and determine staff assignments." },
  "Memory Care":     { label: "Zone",    showSpeciality: false, description: "Define the zones within this facility. You can skip this step." },
  "Assisted Living": { label: "Section", showSpeciality: false, description: "Define the wings or sections of this facility. You can skip this step." },
  Rehabilitation:    { label: "Unit",    showSpeciality: true,  description: "Define the clinical units within this facility. Units group residents by care type and determine staff assignments." },
};

const DEFAULT_TYPE_CONFIG: FacilityTypeConfig = {
  label: "Unit",
  showSpeciality: true,
  description: "Define the units within this facility. You can skip this step.",
};

function genId() {
  return Math.random().toString(36).slice(2);
}

function emptyUnit(): UnitRow {
  return { localId: genId(), name: "", careSpeciality: "General", capacity: "" };
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateFacilityModal({ open, onClose, onCreated }: Props) {
  const reduced = useReducedMotion();

  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState<FacilityForm>({
    name: "", address: "", phone: "", email: "",
    facilityType: "", licenseNumber: "", capacity: "",
  });
  const [step1Errors, setStep1Errors] = useState<{ name?: string; address?: string }>({});

  const [units, setUnits] = useState<UnitRow[]>([]);
  const [roomInput, setRoomInput] = useState<Record<string, string>>({});
  const [unitRooms, setUnitRooms] = useState<Record<string, string[]>>({});

  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const typeConfig = FACILITY_TYPE_CONFIG[form.facilityType] ?? DEFAULT_TYPE_CONFIG;

  const stepLabels: Record<WizardStep, string> = {
    1: "Facility details",
    2: `Add ${typeConfig.label}s`,
    3: "Add rooms",
    4: "Review",
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setDirection(1);
      setForm({ name: "", address: "", phone: "", email: "", facilityType: "", licenseNumber: "", capacity: "" });
      setStep1Errors({});
      setUnits([]);
      setRoomInput({});
      setUnitRooms({});
      setSubmitState("idle");
    }
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

  function goNext() {
    setDirection(1);
    if (step === 1) {
      const errors: { name?: string; address?: string } = {};
      if (!form.name.trim()) errors.name = "Facility name is required.";
      if (!form.address.trim()) errors.address = "Address is required.";
      if (Object.keys(errors).length > 0) { setStep1Errors(errors); return; }
      setStep1Errors({});
      setStep(2);
    } else if (step === 2) {
      if (units.length > 0) {
        let hasError = false;
        const next = units.map((u) => {
          const nameError = u.name.trim() ? undefined : `${typeConfig.label} name is required.`;
          const raw = Number(u.capacity);
          const capacityError = (!u.capacity || isNaN(raw) || raw < 1)
            ? "Capacity must be at least 1."
            : undefined;
          if (nameError || capacityError) hasError = true;
          return { ...u, nameError, capacityError };
        });
        if (hasError) { setUnits(next); return; }
        setUnits(next.map(u => ({ ...u, nameError: undefined, capacityError: undefined })));
      }
      setStep(units.length > 0 ? 3 : 4);
    } else if (step === 3) {
      setStep(4);
    }
  }

  function goBack() {
    setDirection(-1);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(units.length > 0 ? 3 : 2);
  }

  function addUnit() {
    setUnits((prev) => [...prev, emptyUnit()]);
  }

  function removeUnit(localId: string) {
    setUnits((prev) => prev.filter((u) => u.localId !== localId));
    setUnitRooms((prev) => { const n = { ...prev }; delete n[localId]; return n; });
    setRoomInput((prev) => { const n = { ...prev }; delete n[localId]; return n; });
  }

  function updateUnit(localId: string, field: keyof UnitRow, value: string) {
    setUnits((prev) =>
      prev.map((u) =>
        u.localId === localId
          ? { ...u, [field]: value, nameError: undefined, capacityError: undefined }
          : u
      )
    );
  }

  function addRoom(localId: string) {
    const raw = (roomInput[localId] ?? "").replace(/,/g, "").trim();
    if (!raw) return;
    setUnitRooms((prev) => ({
      ...prev,
      [localId]: [...(prev[localId] ?? []), raw],
    }));
    setRoomInput((prev) => ({ ...prev, [localId]: "" }));
  }

  function removeRoom(localId: string, room: string) {
    setUnitRooms((prev) => ({
      ...prev,
      [localId]: (prev[localId] ?? []).filter((r) => r !== room),
    }));
  }

  async function onSubmit() {
    setSubmitState("loading");
    try {
      await createFacility({
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        facilityType: form.facilityType || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        units: units.map((u) => ({
          name: u.name.trim(),
          ...(typeConfig.showSpeciality && u.careSpeciality ? { careSpeciality: u.careSpeciality } : {}),
          capacity: Number(u.capacity),
          rooms: unitRooms[u.localId] ?? [],
        })),
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
    enter: (dir: number) => ({ x: reduced ? 0 : dir * 20, opacity: reduced ? 1 : 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduced ? 0 : dir * -20, opacity: reduced ? 1 : 0 }),
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cfw__root"
          onClick={onClose}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="cfw__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="cfw__header">
              <h2 className="cfw__title">
                {submitState === "success" ? "Facility Created" : lexicon.createFacility.title}
              </h2>
              <button className="cfw__closeBtn" type="button" aria-label="Close" onClick={onClose}>
                {lexicon.common.closeX}
              </button>
            </div>

            {/* Step indicator */}
            {submitState !== "success" && (
              <div className="cfw__stepIndicator">
                {([1, 2, 3, 4] as WizardStep[]).map((s, idx) => (
                  <React.Fragment key={s}>
                    <div
                      className={`cfw__stepPill${step === s ? " cfw__stepPill--active" : step > s ? " cfw__stepPill--done" : " cfw__stepPill--upcoming"}`}
                      title={stepLabels[s]}
                    >
                      {s}
                    </div>
                    {idx < 3 && (
                      <div className={`cfw__stepLine${step > s ? " cfw__stepLine--done" : ""}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Step body */}
            <div className="cfw__stepBody">
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
                  {/* ── STEP 1: Facility details ─────────────────────────── */}
                  {step === 1 && (
                    <div className="cfw__form">
                      <div className="cfw__grid2">
                        <div className="cfw__field">
                          <label className="cfw__label">Name *</label>
                          <input
                            className={`cfw__input${step1Errors.name ? " cfw__input--error" : ""}`}
                            value={form.name}
                            autoFocus
                            placeholder="e.g. Sunrise Care Home"
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          />
                          {step1Errors.name && <div className="cfw__fieldErr">{step1Errors.name}</div>}
                        </div>
                        <div className="cfw__field">
                          <label className="cfw__label">Address *</label>
                          <input
                            className={`cfw__input${step1Errors.address ? " cfw__input--error" : ""}`}
                            value={form.address}
                            placeholder="e.g. 123 King St W, Toronto"
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                          />
                          {step1Errors.address && <div className="cfw__fieldErr">{step1Errors.address}</div>}
                        </div>
                        <div className="cfw__field">
                          <label className="cfw__label">Phone</label>
                          <input
                            className="cfw__input"
                            value={form.phone}
                            placeholder="e.g. +1 416 555 0100"
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="cfw__field">
                          <label className="cfw__label">Email</label>
                          <input
                            className="cfw__input"
                            type="email"
                            value={form.email}
                            placeholder="e.g. admin@sunrise.ca"
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                        <div className="cfw__field">
                          <label className="cfw__label">Facility Type</label>
                          <div className="cfw__selectWrap">
                            <select
                              className="cfw__select"
                              value={form.facilityType}
                              onChange={(e) => setForm((p) => ({ ...p, facilityType: e.target.value }))}
                            >
                              <option value="">Select type…</option>
                              {FACILITY_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="cfw__field">
                          <label className="cfw__label">License Number</label>
                          <input
                            className="cfw__input"
                            value={form.licenseNumber}
                            placeholder="e.g. LIC-2024-0042"
                            onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="cfw__field cfw__field--half">
                        <label className="cfw__label">Total Bed Capacity</label>
                        <input
                          className="cfw__input"
                          type="number"
                          min={1}
                          value={form.capacity}
                          placeholder="e.g. 60"
                          onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Add units / wings / zones / sections ─────── */}
                  {step === 2 && (
                    <div className="cfw__unitsStep">
                      <div className="cfw__unitsHint">{typeConfig.description}</div>
                      {units.length > 0 && (
                        <div className="cfw__unitRows">
                          {units.map((u) => (
                            <div key={u.localId} className="cfw__unitRow">
                              <div className={`cfw__unitRowFields${typeConfig.showSpeciality ? "" : " cfw__unitRowFields--simple"}`}>
                                <div className="cfw__field">
                                  <label className="cfw__label">{typeConfig.label} Name *</label>
                                  <input
                                    className={`cfw__input${u.nameError ? " cfw__input--error" : ""}`}
                                    value={u.name}
                                    placeholder={`e.g. ${typeConfig.label} A`}
                                    onChange={(e) => updateUnit(u.localId, "name", e.target.value)}
                                  />
                                  {u.nameError && <div className="cfw__fieldErr">{u.nameError}</div>}
                                </div>
                                {typeConfig.showSpeciality && (
                                  <div className="cfw__field">
                                    <label className="cfw__label">Care Speciality</label>
                                    <div className="cfw__selectWrap">
                                      <select
                                        className="cfw__select"
                                        value={u.careSpeciality}
                                        onChange={(e) => updateUnit(u.localId, "careSpeciality", e.target.value)}
                                      >
                                        {CARE_SPECIALITIES.map((s) => (
                                          <option key={s} value={s}>{s}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                )}
                                <div className="cfw__field">
                                  <label className="cfw__label">Capacity *</label>
                                  <input
                                    className={`cfw__input${u.capacityError ? " cfw__input--error" : ""}`}
                                    type="number"
                                    min={1}
                                    value={u.capacity}
                                    placeholder="e.g. 20"
                                    onChange={(e) => updateUnit(u.localId, "capacity", e.target.value)}
                                  />
                                  {u.capacityError && <div className="cfw__fieldErr">{u.capacityError}</div>}
                                </div>
                              </div>
                              <button
                                className="cfw__removeUnitBtn"
                                type="button"
                                title={`Remove ${typeConfig.label.toLowerCase()}`}
                                onClick={() => removeUnit(u.localId)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button className="cfw__addUnitBtn" type="button" onClick={addUnit}>
                        + Add {typeConfig.label}
                      </button>
                    </div>
                  )}

                  {/* ── STEP 3: Rooms per unit ───────────────────────────── */}
                  {step === 3 && (
                    <div className="cfw__roomsStep">
                      <div className="cfw__unitsHint">
                        Add room numbers for each {typeConfig.label.toLowerCase()}. Press Enter or comma after each number.
                      </div>
                      {units.map((u) => (
                        <div key={u.localId} className="cfw__roomSection">
                          <div className="cfw__roomSectionHeader">
                            <span className="cfw__roomSectionName">{u.name || `Unnamed ${typeConfig.label.toLowerCase()}`}</span>
                            <span className="cfw__roomSectionMeta">
                              {typeConfig.showSpeciality ? `${u.careSpeciality} · ` : ""}{u.capacity} beds
                            </span>
                          </div>
                          <div className="cfw__tagInputWrapper">
                            {(unitRooms[u.localId] ?? []).map((room) => (
                              <span key={room} className="cfw__tag">
                                {room}
                                <button
                                  type="button"
                                  className="cfw__tagRemove"
                                  onClick={() => removeRoom(u.localId, room)}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <input
                              className="cfw__tagInput"
                              value={roomInput[u.localId] ?? ""}
                              placeholder="Room #, Enter to add"
                              onChange={(e) =>
                                setRoomInput((prev) => ({ ...prev, [u.localId]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  addRoom(u.localId);
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── STEP 4: Review ───────────────────────────────────── */}
                  {step === 4 && submitState !== "success" && (
                    <div className="cfw__review">
                      <div className="cfw__reviewSection">
                        <div className="cfw__reviewSectionTitle">Facility Details</div>
                        <div className="cfw__reviewGrid">
                          <div className="cfw__reviewField">
                            <span className="cfw__reviewLabel">Name</span>
                            <span className="cfw__reviewValue">{form.name}</span>
                          </div>
                          <div className="cfw__reviewField">
                            <span className="cfw__reviewLabel">Address</span>
                            <span className="cfw__reviewValue">{form.address}</span>
                          </div>
                          {form.phone && (
                            <div className="cfw__reviewField">
                              <span className="cfw__reviewLabel">Phone</span>
                              <span className="cfw__reviewValue">{form.phone}</span>
                            </div>
                          )}
                          {form.email && (
                            <div className="cfw__reviewField">
                              <span className="cfw__reviewLabel">Email</span>
                              <span className="cfw__reviewValue">{form.email}</span>
                            </div>
                          )}
                          {form.facilityType && (
                            <div className="cfw__reviewField">
                              <span className="cfw__reviewLabel">Type</span>
                              <span className="cfw__reviewValue">{form.facilityType}</span>
                            </div>
                          )}
                          {form.licenseNumber && (
                            <div className="cfw__reviewField">
                              <span className="cfw__reviewLabel">License</span>
                              <span className="cfw__reviewValue">{form.licenseNumber}</span>
                            </div>
                          )}
                          {form.capacity && (
                            <div className="cfw__reviewField">
                              <span className="cfw__reviewLabel">Capacity</span>
                              <span className="cfw__reviewValue">{form.capacity} beds</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {units.length > 0 && (
                        <div className="cfw__reviewSection">
                          <div className="cfw__reviewSectionTitle">{typeConfig.label}s ({units.length})</div>
                          {units.map((u) => {
                            const rooms = unitRooms[u.localId] ?? [];
                            return (
                              <div key={u.localId} className="cfw__reviewUnit">
                                <div className="cfw__reviewUnitHeader">
                                  <span className="cfw__reviewUnitName">{u.name}</span>
                                  <span className="cfw__reviewUnitMeta">
                                    {typeConfig.showSpeciality ? `${u.careSpeciality} · ` : ""}{u.capacity} beds
                                  </span>
                                </div>
                                {rooms.length > 0 && (
                                  <div className="cfw__reviewRooms">
                                    {rooms.map((r) => (
                                      <span key={r} className="cfw__reviewRoom">{r}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {typeof submitState === "object" && "error" in submitState && (
                        <div className="cfw__error">{submitState.error}</div>
                      )}
                    </div>
                  )}

                  {/* ── SUCCESS ──────────────────────────────────────────── */}
                  {submitState === "success" && (
                    <div className="cfw__success">
                      <div className="cfw__successMsg">
                        Facility created successfully.
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            {submitState !== "success" && (
              <div className="cfw__actions">
                <div>
                  {step > 1 && (
                    <button
                      className="cfw__backBtn"
                      type="button"
                      onClick={goBack}
                      disabled={submitState === "loading"}
                    >
                      {lexicon.common.back}
                    </button>
                  )}
                </div>
                <div className="cfw__actionsRight">
                  <button
                    className="cfw__cancelBtn"
                    type="button"
                    onClick={onClose}
                    disabled={submitState === "loading"}
                  >
                    {lexicon.common.cancel}
                  </button>
                  {step < 4 ? (
                    <button className="cfw__nextBtn" type="button" onClick={goNext}>
                      Next
                    </button>
                  ) : (
                    <button
                      className="cfw__submitBtn"
                      type="button"
                      onClick={onSubmit}
                      disabled={submitState === "loading"}
                    >
                      {submitState === "loading" ? lexicon.common.creating : "Create Facility"}
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
