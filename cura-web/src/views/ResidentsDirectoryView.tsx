import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "../api/api-error";
import { listResidentDirectory, ResidentDirectoryItem } from "../api/api-resident-directory";
import ResidentDetailsModal from "../components/ResidentDetailsModal";
import lexicon from "../assets/lexicon";
import "./ResidentsDirectoryView.scss";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export default function ResidentsDirectoryView() {
  const t = lexicon;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(25);

  const [items, setItems] = useState<ResidentDirectoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const debouncedQ = useMemo(() => q.trim(), [q]);

  async function load(p = page) {
    try {
      setErr(null);
      setLoading(true);
      const data = await listResidentDirectory({ q: debouncedQ || undefined, page: p, size });
      setItems(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (e: any) {
      setErr(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const tmr = setTimeout(() => load(0), 250);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openDetails(id: number) {
    setDetailsId(id);
    setDetailsOpen(true);
  }
  function closeDetails() {
    setDetailsOpen(false);
    setDetailsId(null);
  }

  return (
    <div className="resDir">
      <div className="resDir__header">
        {/* <a className="resDir__backLink" href="/"><ArrowBackIcon fontSize="small" /></a> */}
        <h2>{t.residentsDirectory.title}</h2>
      </div>

      <div className="resDir__search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.residentsDirectory.searchPlaceholder}
        />
        <button className="primary" onClick={() => load(0)} disabled={loading}>
          {t.common.search}
        </button>
        <span className="muted" style={{ fontSize: 12 }}>
          {total} {t.residentsDirectory.countSuffix}
        </span>
      </div>

      {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      {loading && <div style={{ marginTop: 12 }}>{t.common.loading}</div>}

      <div className="resDir__table">
        <div className="resDir__thead">
          <div>{t.residentsDirectory.columns.name}</div>
          <div>{t.residentsDirectory.columns.dob}</div>
          <div>{t.residentsDirectory.columns.room}</div>
          <div>{t.residentsDirectory.columns.unit}</div>
          <div>{t.residentsDirectory.columns.facility}</div>
        </div>

        {items.map((r) => (
          <div
            key={r.residentId}
            className="resDir__row"
            role="button"
            tabIndex={0}
            onClick={() => openDetails(r.residentId)}
            onKeyDown={(e) =>
              e.key === "Enter" || e.key === " "
                ? openDetails(r.residentId)
                : null
            }
          >
            <div style={{ fontWeight: 700, color: "rgba(0,0,0,0.8)" }}>
              {r.firstName} {r.lastName}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>{r.dateOfBirth ?? "—"}</div>
            <div className="muted" style={{ fontSize: 13 }}>{r.roomNumber ?? "—"}</div>
            <div className="muted" style={{ fontSize: 13 }}>{r.unitName} ({r.unitType})</div>
            <div className="muted" style={{ fontSize: 13 }}>{r.facilityName}</div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div style={{ padding: 14 }} className="muted">
            {t.common.noResults}
          </div>
        )}
      </div>

      <div className="resDir__pagination">
        <button className="ghost" disabled={loading || page <= 0} onClick={() => load(page - 1)}>
          {t.common.prev}
        </button>

        <div className="muted" style={{ fontSize: 13 }}>
          {t.common.page} {page + 1} of {Math.max(1, totalPages)}
        </div>

        <button className="ghost" disabled={loading || page + 1 >= totalPages} onClick={() => load(page + 1)}>
          {t.common.next}
        </button>
      </div>

      <ResidentDetailsModal open={detailsOpen} residentId={detailsId} onClose={closeDetails} />
    </div>
  );
}
