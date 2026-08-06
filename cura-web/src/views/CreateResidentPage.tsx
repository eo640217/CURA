import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { listFacilities, Facility } from "../api/facilities";
import { listUnitsByFacility, listRoomsByUnit, Unit, Room } from "../api/units";
import { createResidentUnderUnit, uploadResidentPhoto } from "../api/residents";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./CreateResidentPage.scss";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type SubmitState = "idle" | "loading" | "success" | { error: string };

const CARE_LEVELS = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Stable", "Monitoring", "Urgent", "Discharged"];
const GENDERS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

export default function CreateResidentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initFacilityId: number | null = searchParams.get("facilityId")
    ? Number(searchParams.get("facilityId"))
    : null;
  const initUnitId: number | null = searchParams.get("unitId")
    ? Number(searchParams.get("unitId"))
    : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(initFacilityId);

  const [unitsState, setUnitsState] = useState<LoadState<Unit[]>>({ status: "idle" });
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(initUnitId);

  const [roomsState, setRoomsState] = useState<LoadState<Room[]>>({ status: "idle" });
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setFacilitiesState({ status: "loading" });
      let facilities: Facility[];
      try {
        facilities = await listFacilities();
        if (cancelled) return;
        setFacilitiesState({ status: "success", data: facilities });
      } catch (e: any) {
        if (cancelled) return;
        setFacilitiesState({ status: "error", message: apiErrorMessage(e) });
        return;
      }

      if (!initFacilityId) return;
      setUnitsState({ status: "loading" });
      let units: Unit[];
      try {
        units = await listUnitsByFacility(initFacilityId);
        if (cancelled) return;
        setUnitsState({ status: "success", data: units });
      } catch (e: any) {
        if (cancelled) return;
        setUnitsState({ status: "error", message: apiErrorMessage(e) });
        return;
      }

      if (!initUnitId) return;
      setRoomsState({ status: "loading" });
      try {
        const rooms = await listRoomsByUnit(initUnitId, true);
        if (cancelled) return;
        setRoomsState({ status: "success", data: rooms });
      } catch (e: any) {
        if (cancelled) return;
        setRoomsState({ status: "error", message: apiErrorMessage(e) });
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prev = photoPreview;
    return () => { if (prev) URL.revokeObjectURL(prev); };
  }, [photoPreview]);

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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = `${lexicon.residentsPanel.firstName} is required.`;
    if (!form.lastName.trim()) errs.lastName = `${lexicon.residentsPanel.lastName} is required.`;
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required.";
    if (!selectedUnitId) errs.unit = "Please select a unit.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setSubmitState("loading");

    try {
      const created = await createResidentUnderUnit(selectedUnitId!, {
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

      if (photoFile) {
        try {
          await uploadResidentPhoto(created.id, photoFile);
        } catch {
          // Photo upload failure is non-fatal — resident still created
        }
      }

      setSubmitState("success");
      setTimeout(() => navigate(-1), 1200);
    } catch (e: any) {
      setSubmitState({ error: apiErrorMessage(e) });
    }
  }

  const facilities = facilitiesState.status === "success" ? facilitiesState.data : [];
  const units = unitsState.status === "success" ? unitsState.data : [];
  const rooms = roomsState.status === "success" ? roomsState.data : [];
  const isSubmitting = submitState === "loading";
  const isSuccess = submitState === "success";

  return (
    <div className="crp">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="crp__header">
        <button type="button" className="crp__backBtn" onClick={() => navigate(-1)}>
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
          Residents
        </button>
        <div className="crp__headerCenter">
          <h1 className="crp__title">{isSuccess ? "Resident Added" : "New Resident"}</h1>
        </div>
        <div className="crp__headerActions">
          <button
            type="button"
            className="crp__cancelBtn"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="crp-form"
            className="crp__saveBtn"
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? "Saving…" : isSuccess ? "Saved" : "Save Resident"}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="crp__layout">

        {/* Left: photo + name preview */}
        <aside className="crp__left">
          <div className="crp__photoCard">
            <div
              className="crp__photoBox"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="crp__photoImg" />
                : (
                  <div className="crp__photoPlaceholder">
                    <PhotoCameraOutlinedIcon sx={{ fontSize: 30 }} />
                    <span>Upload photo</span>
                  </div>
                )
              }
            </div>
            <p className="crp__photoHint">
              {photoFile ? photoFile.name : "Click to choose a photo"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="crp__photoInput"
              onChange={handlePhotoChange}
            />
          </div>

          {(form.firstName || form.lastName) && (
            <div className="crp__namePreview">
              <div className="crp__namePreviewLabel">Name</div>
              <div className="crp__namePreviewValue">
                {[form.firstName, form.lastName].filter(Boolean).join(" ")}
              </div>
            </div>
          )}
        </aside>

        {/* Right: form */}
        <form id="crp-form" className="crp__form" onSubmit={onSubmit}>

          {/* ── Personal Info ─────────────────────────────────────────── */}
          <div className="crp__section">
            <div className="crp__sectionTitle">Personal Info</div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">{lexicon.residentsPanel.firstName} *</label>
                <input
                  className={`crp__input${errors.firstName ? " crp__input--error" : ""}`}
                  value={form.firstName}
                  autoFocus
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                />
                {errors.firstName && <div className="crp__fieldErr">{errors.firstName}</div>}
              </div>
              <div className="crp__field">
                <label className="crp__label">{lexicon.residentsPanel.lastName} *</label>
                <input
                  className={`crp__input${errors.lastName ? " crp__input--error" : ""}`}
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
                {errors.lastName && <div className="crp__fieldErr">{errors.lastName}</div>}
              </div>
            </div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">{lexicon.residentsPanel.dob} *</label>
                <input
                  className={`crp__input${errors.dateOfBirth ? " crp__input--error" : ""}`}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
                {errors.dateOfBirth && <div className="crp__fieldErr">{errors.dateOfBirth}</div>}
              </div>
              <div className="crp__field">
                <label className="crp__label">Gender</label>
                <div className="crp__selectWrap">
                  <select
                    className="crp__select"
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">Admission Date</label>
                <input
                  className="crp__input"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => setForm((p) => ({ ...p, admissionDate: e.target.value }))}
                />
              </div>
              <div className="crp__field">
                <label className="crp__label">NHS Number</label>
                <input
                  className="crp__input"
                  value={form.nhsNumber}
                  placeholder="e.g. 943 476 5919"
                  onChange={(e) => setForm((p) => ({ ...p, nhsNumber: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* ── Clinical Info ────────────────────────────────────────── */}
          <div className="crp__section">
            <div className="crp__sectionTitle">Clinical Info</div>
            <div className="crp__field">
              <label className="crp__label">Condition</label>
              <input
                className="crp__input"
                value={form.condition}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
              />
            </div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">Care Level</label>
                <div className="crp__selectWrap">
                  <select
                    className="crp__select"
                    value={form.careLevel}
                    onChange={(e) => setForm((p) => ({ ...p, careLevel: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {CARE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="crp__field">
                <label className="crp__label">Status</label>
                <div className="crp__selectWrap">
                  <select
                    className="crp__select"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">GP / Physician</label>
                <input
                  className="crp__input"
                  value={form.gpName}
                  placeholder="e.g. Dr. Smith"
                  onChange={(e) => setForm((p) => ({ ...p, gpName: e.target.value }))}
                />
              </div>
              <div className="crp__field">
                <label className="crp__label">Care Plan</label>
                <input
                  className="crp__input"
                  value={form.carePlan}
                  placeholder="e.g. Standard Residential, Palliative"
                  onChange={(e) => setForm((p) => ({ ...p, carePlan: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* ── Placement ────────────────────────────────────────────── */}
          <div className="crp__section">
            <div className="crp__sectionTitle">Placement</div>

            <div className="crp__field">
              <label className="crp__label">
                Facility
                {facilitiesState.status === "loading" && <span className="crp__spinnerInline" />}
              </label>
              <div className="crp__selectWrap">
                <select
                  className="crp__select"
                  value={selectedFacilityId ?? ""}
                  disabled={facilitiesState.status === "loading"}
                  onChange={(e) => onFacilityChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">
                    {facilitiesState.status === "loading" ? "Loading…" : "Select facility…"}
                  </option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              {facilitiesState.status === "error" && (
                <div className="crp__fieldError">Failed to load facilities</div>
              )}
            </div>

            <div className="crp__field">
              <label className="crp__label">
                Unit *
                {unitsState.status === "loading" && <span className="crp__spinnerInline" />}
              </label>
              <div className="crp__selectWrap">
                <select
                  className={`crp__select${errors.unit ? " crp__select--error" : ""}`}
                  value={selectedUnitId ?? ""}
                  disabled={selectedFacilityId == null || unitsState.status === "loading"}
                  onChange={(e) => onUnitChange(e.target.value ? Number(e.target.value) : null)}
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
              {errors.unit && <div className="crp__fieldErr">{errors.unit}</div>}
              {unitsState.status === "success" && units.length === 0 && (
                <div className="crp__fieldHint">{lexicon.units.noUnits}</div>
              )}
              {unitsState.status === "error" && (
                <div className="crp__fieldError">
                  Failed to load units —{" "}
                  <button
                    type="button"
                    className="crp__retryLink"
                    onClick={() => selectedFacilityId != null && loadUnits(selectedFacilityId)}
                  >
                    try again
                  </button>
                </div>
              )}
            </div>

            <div className="crp__field">
              <label className="crp__label">
                Room
                {roomsState.status === "loading" && <span className="crp__spinnerInline" />}
              </label>
              <div className="crp__selectWrap">
                <select
                  className="crp__select"
                  value={selectedRoomId ?? ""}
                  disabled={
                    selectedUnitId == null ||
                    roomsState.status === "loading" ||
                    (roomsState.status === "success" && rooms.length === 0)
                  }
                  onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : null)}
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
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
                </select>
              </div>
              {roomsState.status === "error" && (
                <div className="crp__fieldError">
                  Failed to load rooms —{" "}
                  <button
                    type="button"
                    className="crp__retryLink"
                    onClick={() => selectedUnitId != null && loadRooms(selectedUnitId)}
                  >
                    try again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Emergency Contact ────────────────────────────────────── */}
          <div className="crp__section">
            <div className="crp__sectionTitle">Emergency Contact</div>
            <div className="crp__grid2">
              <div className="crp__field">
                <label className="crp__label">Contact Name</label>
                <input
                  className="crp__input"
                  value={form.emergencyContactName}
                  placeholder="e.g. Jane Smith"
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactName: e.target.value }))}
                />
              </div>
              <div className="crp__field">
                <label className="crp__label">Relationship</label>
                <input
                  className="crp__input"
                  value={form.emergencyContactRelationship}
                  placeholder="e.g. Daughter, Spouse"
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactRelationship: e.target.value }))}
                />
              </div>
            </div>
            <div className="crp__field crp__field--half">
              <label className="crp__label">Contact Phone</label>
              <input
                className="crp__input"
                type="tel"
                value={form.emergencyContactPhone}
                placeholder="e.g. +44 7700 900001"
                onChange={(e) => setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
              />
            </div>
          </div>

          {typeof submitState === "object" && "error" in submitState && (
            <div className="crp__error">{submitState.error}</div>
          )}
          {isSuccess && (
            <div className="crp__successBanner">Resident added successfully. Returning…</div>
          )}

        </form>
      </div>
    </div>
  );
}
