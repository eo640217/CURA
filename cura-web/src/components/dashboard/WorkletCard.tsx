import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import { WIDGET_REGISTRY } from '../../lib/widgetRegistry';
import type { WidgetKey } from '../../types/dashboard';
import './WorkletCard.scss';

interface Props {
  widgetKey: WidgetKey;
  editMode: boolean;
  index: number;
  onRemove: () => void;
}

export default function WorkletCard({ widgetKey, editMode, index, onRemove }: Props) {
  const reduced = useReducedMotion();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: dndTransition,
    isDragging,
  } = useSortable({ id: widgetKey });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: dndTransition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const meta = WIDGET_REGISTRY[widgetKey];
  const WidgetComponent = meta.component;

  // Stagger delay for controls: 30ms per card, capped at 240ms
  const staggerDelay = reduced ? 0 : Math.min(index * 0.03, 0.24);

  const controlVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={dndStyle}
      // layout only when not dragging — prevents FM conflicting with dnd-kit transforms
      layout={isDragging ? false : !reduced}
      initial={reduced ? false : { scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={reduced ? undefined : { scale: 0.85, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`dwc${editMode ? ' dwc--edit' : ''}`}
    >
      <AnimatePresence>
        {editMode && (
          <motion.button
            key="drag-handle"
            type="button"
            className="dwc__drag-handle"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            variants={controlVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.18, delay: staggerDelay }}
            {...attributes}
            {...listeners}
          >
            <DragIndicatorIcon sx={{ fontSize: 16 }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editMode && (
          <motion.button
            key="remove-btn"
            type="button"
            className="dwc__remove"
            aria-label={`Remove ${meta.label}`}
            title={`Remove ${meta.label}`}
            variants={controlVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.18, delay: staggerDelay }}
            onClick={onRemove}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* pointer-events: none prevents tile navigation while in edit mode */}
      <div className={editMode ? 'dwc__content-locked' : undefined}>
        <WidgetComponent />
      </div>
    </motion.div>
  );
}
