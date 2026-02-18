import { FormEvent, useState } from "react";
import { createFacility } from "../api/facilities";
import { apiErrorMessage } from "../api/api-error";
import lexicon from "../assets/lexicon";
import "./CreateFacilityModal.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateFacilityModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError(lexicon.createFacility.nameRequired);
    if (!address.trim()) return setError(lexicon.createFacility.addressRequired);

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
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2 className="modalTitle">{lexicon.createFacility.title}</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            {lexicon.common.closeX}
          </button>
        </div>

        <form onSubmit={onSubmit} className="modalForm">
          <div className="field">
            <label className="label">{lexicon.createFacility.nameLabel}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lexicon.createFacility.namePlaceholder}
            />
          </div>

          <div className="field">
            <label className="label">{lexicon.createFacility.addressLabel}</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={lexicon.createFacility.addressPlaceholder}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="button" onClick={onClose} disabled={loading}>
              {lexicon.common.cancel}
            </button>
            <button className="primaryBtn" type="submit" disabled={loading}>
              {loading ? lexicon.common.creating : lexicon.common.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
