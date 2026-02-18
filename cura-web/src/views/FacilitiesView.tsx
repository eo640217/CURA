import { useCallback, useEffect, useMemo, useState } from "react";
import { Facility, getFacility, listFacilities } from "../api/facilities";
import { UnitsPanel } from "../components/UnitsPanel";
import { getAuth } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import CreateFacilityModal from "../components/CreateFacilityModal";
import lexicon from "../assets/lexicon";
import "./FacilitiesView.scss";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function FacilitiesView() {
  const t = lexicon;

  const auth = getAuth();
  const isAdmin = auth.role === "ADMIN";
  const [createOpen, setCreateOpen] = useState(false);

  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [facilityState, setFacilityState] = useState<LoadState<Facility>>({ status: "idle" });

  const facilities = useMemo(() => (facilitiesState.status === "success" ? facilitiesState.data : []), [facilitiesState]);

  const loadFacilities = useCallback(async () => {
    try {
      setFacilitiesState({ status: "loading" });
      const data = await listFacilities();
      setFacilitiesState({ status: "success", data });

      if (data.length === 0) {
        setSelectedFacilityId(null);
        setFacilityState({ status: "idle" });
        return;
      }

      setSelectedFacilityId((prev) => {
        if (prev && data.some((f) => f.id === prev)) return prev;
        return data[0].id;
      });
    } catch (e: any) {
      setFacilitiesState({ status: "error", message: apiErrorMessage(e) });
    }
  }, []);

  const loadFacility = useCallback(async (id: number) => {
    try {
      setFacilityState({ status: "loading" });
      const data = await getFacility(id);
      setFacilityState({ status: "success", data });
    } catch (e: any) {
      setFacilityState({ status: "error", message: apiErrorMessage(e) });
    }
  }, []);

  useEffect(() => { loadFacilities(); }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacilityId == null) return;
    loadFacility(selectedFacilityId);
  }, [selectedFacilityId, loadFacility]);

  return (
    <div className="page facilities">
      <div className="facilities__top">
        <div>
          <h1 className="facilities__appTitle">{t.facilities.appTitle}</h1>
          <p className="facilities__subtitle">
            {t.facilities.subtitle}
            {auth.username && (
              <>
                {" "}· {t.facilities.signedInAs} <b>{auth.username}</b> ({auth.role ?? "UNKNOWN"})
              </>
            )}
          </p>
        </div>

        <div className="facilities__topActions">
          <button onClick={loadFacilities}>{t.common.refresh}</button>
        </div>
      </div>

      <div className="facilities__grid">
        <div className="card facilities__left">
          <div className="facilities__leftHeader">
            <h2 className="facilities__panelTitle">{t.facilities.facilitiesTitle}</h2>

            <div className="facilities__leftActions">
              {isAdmin && <span className="facilities__adminBadge">{t.facilities.adminBadge}</span>}
              {isAdmin && <button onClick={() => setCreateOpen(true)}>{t.facilities.new}</button>}
            </div>
          </div>

          {facilitiesState.status === "loading" && <div className="facilities__status">{t.common.loading}</div>}

          {facilitiesState.status === "error" && (
            <div className="facilities__error">
              {facilitiesState.message}
              <div className="facilities__tryAgain">
                <button onClick={loadFacilities}>{t.common.tryAgain}</button>
              </div>
            </div>
          )}

          {facilitiesState.status === "success" && facilities.length === 0 && (
            <div className="facilities__empty">
              <div>{t.facilities.noFacilities}</div>
              {isAdmin ? (
                <div className="facilities__emptyHint">{t.facilities.adminNextStep}</div>
              ) : (
                <div className="facilities__emptyHint">{t.facilities.staffAskAdmin}</div>
              )}
            </div>
          )}

          {facilities.map((f) => (
            <button
              key={f.id}
              className={`facilities__facilityBtn ${selectedFacilityId === f.id ? "isActive" : ""}`}
              onClick={() => setSelectedFacilityId(f.id)}
            >
              <div className="facilities__facilityName">{f.name}</div>
              <div className="facilities__facilityAddr">{f.address}</div>
            </button>
          ))}
        </div>

        <div className="card facilities__right">
          <h2 className="facilities__panelTitle">{t.facilities.selectedFacilityTitle}</h2>

          {selectedFacilityId == null && <div className="facilities__status">{t.facilities.selectFacility}</div>}
          {facilityState.status === "loading" && <div className="facilities__status">{t.common.loading}</div>}

          {facilityState.status === "error" && (
            <div className="facilities__error">
              {facilityState.message}
              {selectedFacilityId != null && (
                <div className="facilities__tryAgain">
                  <button onClick={() => loadFacility(selectedFacilityId)}>{t.common.tryAgain}</button>
                </div>
              )}
            </div>
          )}

          {facilityState.status === "success" && (
            <>
              <div className="facilities__selected">
                <div className="facilities__selectedName">{facilityState.data.name}</div>
                <div className="facilities__selectedAddr">{facilityState.data.address}</div>
              </div>

              <UnitsPanel facilityId={facilityState.data.id} />
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <CreateFacilityModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => loadFacilities()}
        />
      )}
    </div>
  );
}
