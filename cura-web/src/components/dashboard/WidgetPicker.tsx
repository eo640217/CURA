import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WIDGET_REGISTRY, ALL_WIDGET_KEYS } from '../../lib/widgetRegistry';
import type { WidgetKey } from '../../types/dashboard';
import './WidgetPicker.scss';

interface Props {
  currentWidgets: WidgetKey[];
  onAdd: (key: WidgetKey) => void;
  onClose: () => void;
}

export default function WidgetPicker({ currentWidgets, onAdd, onClose }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="wp"
      initial={reduced ? false : { y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduced ? undefined : { y: -8, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="wp__header">
        <h3 className="wp__title">Add widget</h3>
        <button type="button" className="wp__close" onClick={onClose} aria-label="Close picker">
          ✕
        </button>
      </div>
      <div className="wp__grid">
        {ALL_WIDGET_KEYS.map(key => {
          const meta = WIDGET_REGISTRY[key];
          const Icon = meta.icon;
          const added = currentWidgets.includes(key);
          return (
            <div key={key} className={`wp__item${added ? ' wp__item--added' : ''}`}>
              <div className="wp__item-icon">
                <Icon sx={{ fontSize: 20 }} />
              </div>
              <span className="wp__item-label">{meta.label}</span>
              {added ? (
                <span className="wp__item-badge">Added</span>
              ) : (
                <button type="button" className="wp__item-add" onClick={() => onAdd(key)}>
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
