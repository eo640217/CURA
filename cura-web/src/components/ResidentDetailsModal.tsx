import { useEffect, useState } from "react";
import { apiErrorMessage } from "../api/api-error";
import { getResidentDetails, ResidentDetailsResponse } from "../api/api-resident-details";
import lexicon from "../assets/lexicon";
import "./Modal.scss";

type Props = {
  open: boolean;
  residentId: number | null;
  onClose: () => void;
};

export default function ResidentDetailsModal({ open, residentId, onClose }: Props) {
  const t = lexicon;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ResidentDetailsResponse | null>(null);

  useEffect(() => {
    if (!open || residentId == null) return;
    let cancelled = false;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const d = await getResidentDetails(residentId);
        if (!cancelled) setData(d);
      } catch (e: any) {
        if (!cancelled) setErr(apiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, residentId]);

  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>{t.residentDetails.title}</h3>
          <button onClick={onClose}>{t.common.close}</button>
        </div>

        {loading && <div style={{ marginTop: 12 }}>{t.common.loading}</div>}
        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}

        {!loading && !err && data && (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "rgba(0,0,0,0.8)" }}>
                {data.firstName} {data.lastName}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                {t.residentDetails.dobPrefix}: {data.dateOfBirth ?? "—"} · {t.residentDetails.roomPrefix}: {data.roomNumber ?? "—"}
              </div>
            </div>

            <div className="modalSection">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.residentDetails.currentPlacement}</div>
              <div style={{ fontSize: 13 }}>
                <div><b>{t.residentDetails.facilityLabel}:</b> {data.facilityName}</div>
                <div className="muted">{data.facilityAddress}</div>
                <div style={{ marginTop: 8 }}>
                  <b>{t.residentDetails.unitLabel}:</b> {data.unitName} ({data.unitType}) · {t.residentDetails.capacityLabel} {data.unitCapacity ?? "—"}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !err && !data && <div className="muted" style={{ marginTop: 12 }}>{t.common.noData}</div>}
      </div>
    </div>
  );
}
