import { useCallback, useEffect, useMemo, useState } from "react";
import { Facility, getFacility, listFacilities } from "../api/facilities";
import { UnitsPanel } from "../components/UnitsPanel";
import { clearAuth, getAuth } from "../auth/auth";
import { apiErrorMessage } from "../api/api-error";
import CreateFacilityModal from "../components/CreateFacilityModal";


type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function FacilitiesView() {
    const auth = getAuth();
    const isAdmin = auth.role === "ADMIN";
    const [createOpen, setCreateOpen] = useState(false);


  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({
    status: "idle",
  });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [facilityState, setFacilityState] = useState<LoadState<Facility>>({ status: "idle" });

  const facilities = useMemo(() => {
    return facilitiesState.status === "success" ? facilitiesState.data : [];
  }, [facilitiesState]);

  const loadFacilities = useCallback(async () => {
    try {
      setFacilitiesState({ status: "loading" });
      const data = await listFacilities();
      setFacilitiesState({ status: "success", data });

      // Keep selection if possible; otherwise pick first.
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

  // Initial load
  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  // Load selected facility details
  useEffect(() => {
    if (selectedFacilityId == null) return;
    loadFacility(selectedFacilityId);
  }, [selectedFacilityId, loadFacility]);

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Cura</h1>
 
            <p style={{ marginTop: 0, opacity: 0.7 }}>
            Facilities → Units{" "}
            {auth.username && (
              <>
                · Signed in as <b>{auth.username}</b> ({auth.role ?? "UNKNOWN"})
              </>
            )}
          </p>

        </div>


        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadFacilities}>Refresh</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        {/* Left: facilities list */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>Facilities</h2>
            {isAdmin && (
                <button onClick={() => setCreateOpen(true)}>
                    + New
                </button>
            )}

            {/* Admin-only placeholder for next step */}
            {isAdmin && (
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Admin controls enabled
              </span>
            )}
          </div>

          {facilitiesState.status === "loading" && <div>Loading…</div>}

          {facilitiesState.status === "error" && (
            <div style={{ color: "crimson" }}>
              {facilitiesState.message}
              <div style={{ marginTop: 8 }}>
                <button onClick={loadFacilities}>Try again</button>
              </div>
            </div>
          )}

          {facilitiesState.status === "success" && facilities.length === 0 && (
            <div>
              No facilities yet.
              {isAdmin ? (
                <div style={{ marginTop: 8, opacity: 0.8 }}>
                  Next step: we’ll add a “Create Facility” modal for admins.
                </div>
              ) : (
                <div style={{ marginTop: 8, opacity: 0.8 }}>
                  Ask an admin to create the first facility.
                </div>
              )}
            </div>
          )}

          {facilities.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFacilityId(f.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 10px",
                marginBottom: 8,
                borderRadius: 8,
                border: selectedFacilityId === f.id ? "2px solid #111" : "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{f.address}</div>
            </button>
          ))}
        </div>

        {/* Right: facility detail + units */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>Selected Facility</h2>

          {selectedFacilityId == null && <div>Select a facility.</div>}

          {facilityState.status === "loading" && <div>Loading…</div>}

          {facilityState.status === "error" && (
            <div style={{ color: "crimson" }}>
              {facilityState.message}
              {selectedFacilityId != null && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => loadFacility(selectedFacilityId)}>Try again</button>
                </div>
              )}
            </div>
          )}

          {facilityState.status === "success" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{facilityState.data.name}</div>
                <div style={{ opacity: 0.7 }}>{facilityState.data.address}</div>
              </div>

              <UnitsPanel facilityId={facilityState.data.id} />
            </>
          )}
        </div>
      </div>
          <CreateFacilityModal
              open={createOpen}
              onClose={() => setCreateOpen(false)}
              onCreated={() => {
                  // refresh list so the new facility appears
                  loadFacilities();
              }}
          />
    </div>
  );
}
