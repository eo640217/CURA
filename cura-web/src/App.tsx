import { useEffect, useMemo, useState } from "react";
import { Facility, getFacility, listFacilities } from "./api/facilities";
import { UnitsPanel } from "./components/UnitsPanel";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export default function App() {
  const [facilitiesState, setFacilitiesState] = useState<LoadState<Facility[]>>({ status: "idle" });
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  const [facilityState, setFacilityState] = useState<LoadState<Facility>>({ status: "idle" });

  // Load facilities
  useEffect(() => {
    (async () => {
      try {
        setFacilitiesState({ status: "loading" });
        const data = await listFacilities();
        setFacilitiesState({ status: "success", data });
        if (data.length > 0) setSelectedFacilityId((prev) => prev ?? data[0].id);
      } catch (e: any) {
        setFacilitiesState({ status: "error", message: e?.message ?? "Failed to load facilities" });
      }
    })();
  }, []);

  // Load selected facility details
  useEffect(() => {
    if (selectedFacilityId == null) return;
    (async () => {
      try {
        setFacilityState({ status: "loading" });
        const data = await getFacility(selectedFacilityId);
        setFacilityState({ status: "success", data });
      } catch (e: any) {
        setFacilityState({ status: "error", message: e?.message ?? "Failed to load facility" });
      }
    })();
  }, [selectedFacilityId]);

  const facilities = useMemo(() => {
    return facilitiesState.status === "success" ? facilitiesState.data : [];
  }, [facilitiesState]);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ marginBottom: 6 }}>Cura</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>Facilities → Units</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        {/* Left: facilities list */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>Facilities</h2>

          {facilitiesState.status === "loading" && <div>Loading…</div>}
          {facilitiesState.status === "error" && <div style={{ color: "crimson" }}>{facilitiesState.message}</div>}

          {facilitiesState.status === "success" && facilities.length === 0 && (
            <div>No facilities yet. Create one via your backend endpoint.</div>
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
          {facilityState.status === "error" && <div style={{ color: "crimson" }}>{facilityState.message}</div>}

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
    </div>
  );
}
