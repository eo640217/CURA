import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "../api/api-error";
import { getResidentDetails, ResidentDetailsResponse, updateResident } from "../api/api-resident-details";
import { listResidentNotes, createResidentNote, ResidentNote } from "../api/api-resident-notes";
import { getResidentPhotoUrl } from "../api/api-resident-photo";
import lexicon from "../assets/lexicon";
import kobe from "../assets/images/kobe_old.png";
import "./ResidentDetailsModal.scss";
// import "./Modal.scss";
type Props = {
  open: boolean;
  residentId: number | null;
  onClose: () => void;
};

type Tab = "overview" | "documents" | "notes";

type MockDoc = {
  id: string;
  filename: string;
  contentType: string;
  createdAt: string;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

export default function ResidentDetailsModal({ open, residentId, onClose }: Props) {
  const t = lexicon;

  const [tab, setTab] = useState<Tab>("overview");

  // resident detail
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ResidentDetailsResponse | null>(null);

  // photo (S3-backed later)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // edit mode (MVP: room number only)
  const [editing, setEditing] = useState(false);
  const [roomDraft, setRoomDraft] = useState("");

  const fullName = useMemo(() => {
    if (!data) return "";
    return `${data.firstName} ${data.lastName}`;
  }, [data]);

  // documents (mock for now)
  const mockDocs: MockDoc[] = useMemo(
    () => [
      { id: "d1", filename: "Care Plan - Feb 2026.pdf", contentType: "application/pdf", createdAt: "2026-02-20T10:00:00Z" },
      { id: "d2", filename: "Consent Form.jpg", contentType: "image/jpeg", createdAt: "2026-02-18T14:20:00Z" },
      { id: "d3", filename: "Medication List.pdf", contentType: "application/pdf", createdAt: "2026-02-15T09:05:00Z" },
    ],
    []
  );

  // notes (DB-backed)
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesErr, setNotesErr] = useState<string | null>(null);
  const [notes, setNotes] = useState<ResidentNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const loadDetails = async (id: number) => {
    try {
      setErr(null);
      setLoading(true);
      const d = await getResidentDetails(id);
      setData(d);
      setRoomDraft(d.roomNumber ?? "");
    } catch (e: any) {
      setErr(apiErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPhoto = async (id: number) => {
    try {
      // backend will provide a presigned GET later
      const url = await getResidentPhotoUrl(id);
      setPhotoUrl(url || null);
    } catch {
      setPhotoUrl(null); // fail silently, show placeholder
    }
  };

  const loadNotes = async (id: number) => {
    try {
      setNotesErr(null);
      setNotesLoading(true);
      const list = await listResidentNotes(id);
      setNotes(list);
    } catch (e: any) {
      setNotesErr(apiErrorMessage(e));
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (!open || residentId == null) return;

    setTab("overview");
    setEditing(false);
    setNoteDraft("");
    setNotes([]);
    loadDetails(residentId);
    loadPhoto(residentId);
  }, [open, residentId]);

  useEffect(() => {
    if (!open || residentId == null) return;
    if (tab !== "notes") return;
    loadNotes(residentId);
  }, [tab, open, residentId]);

  useEffect(() => {
  if (!open) {
    setData(null);
    setErr(null);
    setPhotoUrl(null);
    setEditing(false);
    setRoomDraft("");
    setNotes([]);
    setNotesErr(null);
    setNotesLoading(false);
    setNoteDraft("");
  }
}, [open]);

  if (!open) return null;

  const onSaveOverview = async () => {
    if (!residentId || !data) return;
    try {
      setErr(null);
      setLoading(true);
      // MVP: update roomNumber only
      await updateResident(residentId, { roomNumber: roomDraft });
      await loadDetails(residentId);
      setEditing(false);
    } catch (e: any) {
      setErr(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onCreateNote = async () => {
    if (!residentId) return;
    const body = noteDraft.trim();
    if (!body) return;

    try {
      setNotesErr(null);
      setNoteSaving(true);
      await createResidentNote(residentId, { body });
      setNoteDraft("");
      await loadNotes(residentId);
    } catch (e: any) {
      setNotesErr(apiErrorMessage(e));
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard modalCard--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalHeader modalHeader--profile">
          <div className="modalProfile">
            <img
              className="modalAvatar"
              src={photoUrl || kobe || "https://placehold.co/160x160/png"}
              alt=""
            />
            <div className="modalProfileText">
              <div className="modalTitleRow">
                <h3 className="modalTitle">{fullName || t.residentDetails.title}</h3>
                {data && (
                  <span className="modalPill">
                    Room {data.roomNumber ?? "—"}
                  </span>
                )}
              </div>

              {data && (
                <div className="modalMeta">
                  {t.residentDetails.dobPrefix}: {data.dateOfBirth ?? "—"}
                  {" · "}
                  {data.unitName ? `${data.unitName} (${data.unitType})` : "—"}
                  {" · "}
                  {data.facilityName ?? "—"}
                </div>
              )}
            </div>
          </div>

          <button className="modalX" onClick={onClose} aria-label={t.common.closeX}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="modalTabs">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")} type="button">
            Overview
          </button>
          <button className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")} type="button">
            Documents
          </button>
          <button className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")} type="button">
            Notes
          </button>
        </div>

        {/* Body */}
        <div className="modalBody">
          {loading && <div className="muted" style={{ marginTop: 6 }}>{t.common.loading}</div>}
          {err && <div className="error" style={{ marginTop: 6 }}>{err}</div>}

          {!loading && !err && !data && (
            <div className="muted" style={{ marginTop: 6 }}>{t.common.noData}</div>
          )}

          {!err && data && tab === "overview" && (
            <div className="modalGrid">
              <div className="modalSection">
                <div className="modalSectionTitle">{t.residentDetails.currentPlacement}</div>

                <div className="modalKV">
                  <div className="k">
                    <b>{t.residentDetails.facilityLabel}:</b>
                  </div>
                  <div className="v">
                    {data.facilityName ?? "—"}
                    <div className="muted">{data.facilityAddress ?? "—"}</div>
                  </div>

                  <div className="k">
                    <b>{t.residentDetails.unitLabel}:</b>
                  </div>
                  <div className="v">
                    {data.unitName ? `${data.unitName} (${data.unitType})` : "—"}{" "}
                    <span className="muted">
                      · {t.residentDetails.capacityLabel} {data.unitCapacity ?? "—"}
                    </span>
                  </div>

                  <div className="k">
                    <b>{t.residentDetails.roomPrefix}:</b>
                  </div>
                  <div className="v">
                    {!editing ? (
                      <span>{data.roomNumber ?? "—"}</span>
                    ) : (
                      <input
                        className="modalInput"
                        value={roomDraft}
                        onChange={(e) => setRoomDraft(e.target.value)}
                        placeholder="Room number"
                      />
                    )}
                  </div>
                </div>

                <div className="modalActions">
                  {!editing ? (
                    <button className="primary" type="button" onClick={() => setEditing(true)}>
                      Edit
                    </button>
                  ) : (
                    <>
                      <button className="primary" type="button" onClick={onSaveOverview} disabled={loading}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setRoomDraft(data.roomNumber ?? "");
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <button className="" type="button" onClick={() => setTab("documents")}>View Documents</button>
                  <button className="" type="button" onClick={() => setTab("notes")}>View Notes</button>
                </div>
              </div>

              <div className="modalSection">
                <div className="modalSectionTitle">Quick Actions</div>
                <div className="modalQuick">
                  <button className="" type="button" onClick={() => setTab("documents")}>
                    Upload Document
                  </button>
                  <button className="" type="button" onClick={() => setTab("notes")}>
                    Add Note
                  </button>
                  <button className="" type="button" onClick={() => alert("Photo upload next (S3-backed)")}>
                    Upload Photo
                  </button>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                </div>
              </div>
            </div>
          )}

          {data && tab === "documents" && (
            <div className="modalSection">
              <div className="modalSectionHeaderRow">
                <div className="modalSectionTitle">Documents</div>
                <div className="modalSectionHeaderActions">
                  <button className="primary" type="button" onClick={() => alert("Upload mocked for today")}>
                    Upload
                  </button>
                </div>
              </div>

              <div className="modalList">
                {mockDocs.map((d) => (
                  <div className="modalListRow" key={d.id}>
                    <div>
                      <div style={{ fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>{d.filename}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {fmtDate(d.createdAt)} · {d.contentType.includes("pdf") ? "PDF" : "Image"}
                      </div>
                    </div>
                    <div className="modalRowActions">
                      <button type="button" onClick={() => alert("View mocked for today")}>View</button>
                      <button type="button" onClick={() => alert("Download mocked for today")}>Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && tab === "notes" && (
            <div className="modalSection">
              <div className="modalSectionHeaderRow">
                <div className="modalSectionTitle">Notes</div>
              </div>

              <div className="modalNoteComposer">
                <textarea
                  className="modalTextarea"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Write a note…"
                  rows={3}
                />
                <div className="modalRowActions">
                  <button className="primary" type="button" onClick={onCreateNote} disabled={noteSaving}>
                    {noteSaving ? "Saving…" : "Add Note"}
                  </button>
                  <button type="button" onClick={() => loadNotes(residentId!)} disabled={notesLoading}>
                    Refresh
                  </button>
                </div>
              </div>

              {notesErr && <div className="error" style={{ marginTop: 10 }}>{notesErr}</div>}
              {notesLoading && <div className="muted" style={{ marginTop: 10 }}>{t.common.loading}</div>}

              {!notesLoading && !notesErr && notes.length === 0 && (
                <div className="muted" style={{ marginTop: 10 }}>No notes yet.</div>
              )}

              <div className="modalList" style={{ marginTop: 12 }}>
                {notes.map((n) => (
                  <div className="modalListRow" key={n.id}>
                    <div>
                      <div style={{ fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>{n.body}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {fmtDate(n.createdAt)}
                        {n.createdBy ? ` · ${n.createdBy}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}