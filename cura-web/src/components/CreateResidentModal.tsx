import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { listFacilities, Facility } from "../api/facilities";
import { listUnitsByFacility, listRoomsByUnit, Unit, Room } from "../api/units";
import { createResidentUnderUnit } from "../api/residents";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./CreateResidentModal.scss";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type SubmitState = "idle" | "loading" | "success" | { error: string };

const CARE_LEVELS = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Stable", "Monitoring", "Urgent", "Discharged"];
const GENDERS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateResidentModal({ open, onClose, onCreated }: Props) {
  const reduced = useReducedMotion();

  // Cascading dropdowns
  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  const [unitsState, setUnitsState] = useState<LoadState<Unit[]>>({ status: "idle" });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const [roomsState, setRoomsState] = useState<LoadState<Room[]>>({ status: "idle" });
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Form fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    admissionDate: "",
    nhsNumber: "",
    condition: "",
    careLevel: "",
    status: "Stable",
    gpName: "",
    carePlan: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  // Reset on close
  useEffect(() => {
    if (!open) {
      setFacilitiesState({ status: "idle" });
      setSelectedFacilityId(null);
      setUnitsState({ status: "idle" });
      setSelectedUnitId(null);
      setRoomsState({ status: "idle" });
      setSelectedRoomId(null);
      setForm({ firstName: "", lastName: "", dateOfBirth: "", gender: "", admissionDate: "", nhsNumber: "", condition: "", careLevel: "", status: "Stable", gpName: "", carePlan: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "" });
      setErrors({});
      setSubmitState("idle");
    }
  }, [open]);

  // Load facilities on open
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
    setUnitsState({ status: "loading" });
    setSelectedUnitId(null);
    setRoomsState({ status: "idle" });
    setSelectedRoomId(null);
    try {
      const data = await listUnitsByFacility(facilityId);
      setUnitsState({ status: "success", data });
    } catch (e: any) {
      setUnitsState({ status: "error", message: apiErrorMessage(e) });
    }
  }

  async function loadRooms(unitId: number) {
    setRoomsState({ status: "loading" });
    setSelectedRoomId(null);
    try {
      const data = await listRoomsByUnit(unitId, true);
      setRoomsState({ status: "success", data });
    } catch (e: any) {
      setRoomsState({ status: "error", message: apiErrorMessage(e) });
    }
  }

  function onFacilityChange(facilityId: number | null) {
    setSelectedFacilityId(facilityId);
    setUnitsState({ status: "idle" });
    setSelectedUnitId(null);
    setRoomsState({ status: "idle" });
    setSelectedRoomId(null);
    if (facilityId != null) loadUnits(facilityId);
  }

  function onUnitChange(unitId: number | null) {
    setSelectedUnitId(unitId);
    setRoomsState({ status: "idle" });
    setSelectedRoomId(null);
    if (unitId != null) loadRooms(unitId);
  }

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = `${lexicon.residentsPanel.firstName} is required.`;
    if (!form.lastName.trim()) errs.lastName = `${lexicon.residentsPanel.lastName} is required.`;
    if (!selectedUnitId) errs.unit = "Please select a unit.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setSubmitState("loading");

    try {
      await createResidentUnderUnit(selectedUnitId!, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth || null,
        condition: form.condition.trim() || null,
        careLevel: form.careLevel || null,
        status: form.status || "Stable",
        gpName: form.gpName.trim() || null,
        emergencyContactName: form.emergencyContactName.trim() || null,
        emergencyContactPhone: form.emergencyContactPhone.trim() || null,
        emergencyContactRelationship: form.emergencyContactRelationship.trim() || null,
        roomId: selectedRoomId,
        gender: form.gender || null,
        admissionDate: form.admissionDate || null,
        nhsNumber: form.nhsNumber.trim() || null,
        carePlan: form.carePlan.trim() || null,
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

  const facilities = facilitiesState.status === "success" ? facilitiesState.data : [];
  const units = unitsState.status === "success" ? unitsState.data : [];
  const rooms = roomsState.status === "success" ? roomsState.data : [];

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
              <button className="crm__closeBtn" type="button" aria-label="Close" onClick={onClose}>
                {lexicon.common.closeX}
              </button>
            </div>

            {/* Form body — scrollable */}
            {submitState !== "success" ? (
              <form id="crm-form" onSubmit={onSubmit} className="crm__formBody">

                {/* ── PERSONAL INFO ─────────────────────────────────────── */}
                <div className="crm__sectionLabel">Personal Info</div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">{lexicon.residentsPanel.firstName} *</label>
                    <input
                      className={`crm__input${errors.firstName ? " crm__input--error" : ""}`}
                      value={form.firstName}
                      autoFocus
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    />
                    {errors.firstName && <div className="crm__fieldErr">{errors.firstName}</div>}
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">{lexicon.residentsPanel.lastName} *</label>
                    <input
                      className={`crm__input${errors.lastName ? " crm__input--error" : ""}`}
                      value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    />
                    {errors.lastName && <div className="crm__fieldErr">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">{lexicon.residentsPanel.dob}</label>
                    <input
                      className="crm__input"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">Gender</label>
                    <div className="crm__selectWrap">
                      <select
                        className="crm__select"
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">Admission Date</label>
                    <input
                      className="crm__input"
                      type="date"
                      value={form.admissionDate}
                      onChange={(e) => setForm((p) => ({ ...p, admissionDate: e.target.value }))}
                    />
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">NHS Number</label>
                    <input
                      className="crm__input"
                      value={form.nhsNumber}
                      placeholder="e.g. 943 476 5919"
                      onChange={(e) => setForm((p) => ({ ...p, nhsNumber: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ── CLINICAL INFO ─────────────────────────────────────── */}
                <div className="crm__sectionLabel">Clinical Info</div>
                <div className="crm__field">
                  <label className="crm__label">Condition</label>
                  <input
                    className="crm__input"
                    value={form.condition}
                    placeholder="e.g. Type 2 Diabetes, Hypertension"
                    onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                  />
                </div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">Care Level</label>
                    <div className="crm__selectWrap">
                      <select
                        className="crm__select"
                        value={form.careLevel}
                        onChange={(e) => setForm((p) => ({ ...p, careLevel: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {CARE_LEVELS.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">Status</label>
                    <div className="crm__selectWrap">
                      <select
                        className="crm__select"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">GP / Physician</label>
                    <input
                      className="crm__input"
                      value={form.gpName}
                      placeholder="e.g. Dr. Smith"
                      onChange={(e) => setForm((p) => ({ ...p, gpName: e.target.value }))}
                    />
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">Care Plan</label>
                    <input
                      className="crm__input"
                      value={form.carePlan}
                      placeholder="e.g. Standard Residential, Palliative"
                      onChange={(e) => setForm((p) => ({ ...p, carePlan: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ── PLACEMENT ────────────────────────────────────────── */}
                <div className="crm__sectionLabel">Placement</div>

                {/* Facility */}
                <div className="crm__field">
                  <label className="crm__label">
                    Facility
                    {facilitiesState.status === "loading" && <span className="crm__spinnerInline" />}
                  </label>
                  <div className="crm__selectWrap">
                    <select
                      className="crm__select"
                      value={selectedFacilityId ?? ""}
                      disabled={facilitiesState.status === "loading"}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : null;
                        onFacilityChange(v);
                      }}
                    >
                      <option value="">
                        {facilitiesState.status === "loading" ? "Loading…" : "Select facility…"}
                      </option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  {facilitiesState.status === "error" && (
                    <div className="crm__fieldError">
                      Failed to load facilities —{" "}
                      <button
                        type="button"
                        className="crm__retryLink"
                        onClick={() => {
                          setFacilitiesState({ status: "idle" });
                          listFacilities()
                            .then((d) => setFacilitiesState({ status: "success", data: d }))
                            .catch((e) => setFacilitiesState({ status: "error", message: apiErrorMessage(e) }));
                        }}
                      >
                        try again
                      </button>
                    </div>
                  )}
                </div>

                {/* Unit */}
                <div className="crm__field">
                  <label className="crm__label">
                    Unit *
                    {unitsState.status === "loading" && <span className="crm__spinnerInline" />}
                  </label>
                  <div className="crm__selectWrap">
                    <select
                      className={`crm__select${errors.unit ? " crm__select--error" : ""}`}
                      value={selectedUnitId ?? ""}
                      disabled={selectedFacilityId == null || unitsState.status === "loading"}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : null;
                        onUnitChange(v);
                      }}
                    >
                      <option value="">
                        {unitsState.status === "loading"
                          ? "Loading…"
                          : selectedFacilityId == null
                          ? "Select a facility first"
                          : "Select unit…"}
                      </option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.type}) · {u.occupiedCount}/{u.capacity}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.unit && <div className="crm__fieldErr">{errors.unit}</div>}
                  {unitsState.status === "error" && (
                    <div className="crm__fieldError">
                      Failed to load units —{" "}
                      <button
                        type="button"
                        className="crm__retryLink"
                        onClick={() => selectedFacilityId != null && loadUnits(selectedFacilityId)}
                      >
                        try again
                      </button>
                    </div>
                  )}
                  {unitsState.status === "success" && units.length === 0 && (
                    <div className="crm__fieldHint">{lexicon.units.noUnits}</div>
                  )}
                </div>

                {/* Room */}
                <div className="crm__field">
                  <label className="crm__label">
                    Room
                    {roomsState.status === "loading" && <span className="crm__spinnerInline" />}
                  </label>
                  <div className="crm__selectWrap">
                    <select
                      className="crm__select"
                      value={selectedRoomId ?? ""}
                      disabled={selectedUnitId == null || roomsState.status === "loading" || (roomsState.status === "success" && rooms.length === 0)}
                      onChange={(e) => {
                        setSelectedRoomId(e.target.value ? Number(e.target.value) : null);
                      }}
                    >
                      <option value="">
                        {roomsState.status === "loading"
                          ? "Loading…"
                          : selectedUnitId == null
                          ? "Select a unit first"
                          : roomsState.status === "success" && rooms.length === 0
                          ? "No rooms available"
                          : "Select room (optional)…"}
                      </option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.roomNumber}</option>
                      ))}
                    </select>
                  </div>
                  {roomsState.status === "error" && (
                    <div className="crm__fieldError">
                      Failed to load rooms —{" "}
                      <button
                        type="button"
                        className="crm__retryLink"
                        onClick={() => selectedUnitId != null && loadRooms(selectedUnitId)}
                      >
                        try again
                      </button>
                    </div>
                  )}
                </div>

                {/* ── EMERGENCY CONTACT ─────────────────────────────────── */}
                <div className="crm__sectionLabel">Emergency Contact</div>
                <div className="crm__grid2">
                  <div className="crm__field">
                    <label className="crm__label">Contact Name</label>
                    <input
                      className="crm__input"
                      value={form.emergencyContactName}
                      placeholder="e.g. Jane Smith"
                      onChange={(e) => setForm((p) => ({ ...p, emergencyContactName: e.target.value }))}
                    />
                  </div>
                  <div className="crm__field">
                    <label className="crm__label">Relationship</label>
                    <input
                      className="crm__input"
                      value={form.emergencyContactRelationship}
                      placeholder="e.g. Daughter, Spouse"
                      onChange={(e) => setForm((p) => ({ ...p, emergencyContactRelationship: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="crm__field crm__field--half">
                  <label className="crm__label">Contact Phone</label>
                  <input
                    className="crm__input"
                    type="tel"
                    value={form.emergencyContactPhone}
                    placeholder="e.g. +44 7700 900001"
                    onChange={(e) => setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                  />
                </div>

                {/* Submit error */}
                {typeof submitState === "object" && "error" in submitState && (
                  <div className="crm__error">{submitState.error}</div>
                )}

              </form>
            ) : (
              <div className="crm__success">
                <div className="crm__successMsg">
                  {lexicon.residentsPanel.addResident} — resident created successfully.
                </div>
              </div>
            )}

            {/* Actions */}
            {submitState !== "success" && (
              <div className="crm__actions">
                <button
                  className="crm__cancelBtn"
                  type="button"
                  onClick={onClose}
                  disabled={submitState === "loading"}
                >
                  {lexicon.common.cancel}
                </button>
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
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
