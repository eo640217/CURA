import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './EditModeBanner.scss';

interface Props {
  hasChanges: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export default function EditModeBanner({ hasChanges, onCancel, onSave }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="emb"
      initial={reduced ? false : { y: -52, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduced ? undefined : { y: -52, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="emb__left">
        <span className="emb__text">Customise mode</span>
        <span className="emb__sub"> — changes won't save until you click Save layout</span>
      </div>
      <div className="emb__right">
        <button type="button" className="emb__btn emb__btn--cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="emb__btn emb__btn--save" onClick={onSave}>
          Save layout
        </button>
      </div>
    </motion.div>
  );
}
