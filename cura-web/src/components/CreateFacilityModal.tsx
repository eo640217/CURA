import { FormEvent, useState } from "react";
import { createFacility } from "../api/facilities";
import { apiErrorMessage } from "../api/api-error";

export default function CreateFacilityModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name is required");
    if (!address.trim()) return setError("Address is required");

    try {
      setLoading(true);
      await createFacility({ name: name.trim(), address: address.trim() });
      onCreated();
      onClose();
      setName("");
      setAddress("");
    } catch (err: any) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          background: "white",
          borderRadius: 12,
          border: "1px solid #ddd",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Create Facility</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <label>Name</label>
            <input
              style={{ width: "100%", padding: 10 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cura Care Center"
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Address</label>
            <input
              style={{ width: "100%", padding: 10 }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 King St W, Toronto"
            />
          </div>

          {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
