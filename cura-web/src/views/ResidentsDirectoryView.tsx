import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/api-error";
import { listResidentDirectory, ResidentDirectoryItem } from "../api/api-resident-directory";
import ResidentDetailsModal from "../components/ResidentDetailsModal";
import lexicon from "../assets/lexicon";
import "./ResidentsDirectoryView.scss";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';


export default function ResidentsDirectoryView() {
  const t = lexicon;
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 0);
  const size = Number(searchParams.get("size") ?? 25);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [debouncedQ, setDebouncedQ] = useState(q.trim());
  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(tmr);
  }, [q]);

  const directoryQuery = useQuery({
    queryKey: ["residents-directory", debouncedQ || undefined, page, size, refreshKey],
    queryFn: () => listResidentDirectory({ q: debouncedQ || undefined, page, size }),
    placeholderData: (prev) => prev,
  });

  const items = directoryQuery.data?.content ?? [];
  const total = directoryQuery.data?.totalElements ?? 0;
  const totalPages = directoryQuery.data?.totalPages ?? 0;
  const loading = directoryQuery.isFetching;
  const err = directoryQuery.isError ? apiErrorMessage(directoryQuery.error) : null;

  function setParam(updates: Record<string, string | number | undefined>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "" || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      return next;
    }, { replace: true });
  }

  function handleQChange(value: string) {
    setParam({ q: value || undefined, page: 0 });
  }

  function goToPage(p: number) {
    setParam({ page: p });
  }

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
        <h2>{t.residentsDirectory.title}</h2>
        <button
          type="button"
          className="resDir__newBtn"
          onClick={() => navigate('/residents/new')}
        >
          <PersonAddAltOutlinedIcon sx={{ fontSize: 15 }} />
          New Resident
        </button>
      </div>

      <div className="resDir__search">
        <input
          value={q}
          onChange={(e) => handleQChange(e.target.value)}
          placeholder={t.residentsDirectory.searchPlaceholder}
        />
        <button className="primary" onClick={() => handleQChange(q)} disabled={loading}>
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
        <button className="ghost" disabled={loading || page <= 0} onClick={() => goToPage(page - 1)}>
          {t.common.prev}
        </button>

        <div className="muted" style={{ fontSize: 13 }}>
          {t.common.page} {page + 1} of {Math.max(1, totalPages)}
        </div>

        <button className="ghost" disabled={loading || page + 1 >= totalPages} onClick={() => goToPage(page + 1)}>
          {t.common.next}
        </button>
      </div>

      <ResidentDetailsModal open={detailsOpen} residentId={detailsId} onClose={closeDetails} />
    </div>
  );
}
