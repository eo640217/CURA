import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduced = useReducedMotion();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setAddress("");
      setError(null);
    }
  }, [open]);

  async function onSubmit(e: { preventDefault(): void }) {
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="cfm__root"
          onClick={onClose}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="cfm__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="cfm__header">
              <h2 className="cfm__title">{lexicon.createFacility.title}</h2>
              <button
                className="cfm__closeBtn"
                onClick={onClose}
                aria-label="Close"
                type="button"
              >
                {lexicon.common.closeX}
              </button>
            </div>

            <form onSubmit={onSubmit} className="cfm__form">
              <div className="cfm__field">
                <label className="cfm__label">{lexicon.createFacility.nameLabel}</label>
                <input
                  className="cfm__input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lexicon.createFacility.namePlaceholder}
                  autoFocus
                />
              </div>

              <div className="cfm__field">
                <label className="cfm__label">{lexicon.createFacility.addressLabel}</label>
                <input
                  className="cfm__input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lexicon.createFacility.addressPlaceholder}
                />
              </div>

              {error && <div className="cfm__error">{error}</div>}

              <div className="cfm__actions">
                <button
                  className="cfm__cancelBtn"
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  {lexicon.common.cancel}
                </button>
                <button className="cfm__createBtn" type="submit" disabled={loading}>
                  {loading ? lexicon.common.creating : lexicon.common.create}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
