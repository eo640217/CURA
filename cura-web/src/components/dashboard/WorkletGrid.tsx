import React from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { WidgetKey } from '../../types/dashboard';
import WorkletCard from './WorkletCard';
import './WorkletGrid.scss';

interface Props {
  widgets: WidgetKey[];
  editMode: boolean;
  onRemove: (key: WidgetKey) => void;
  onReorder: (newOrder: WidgetKey[]) => void;
  onAddClick: () => void;
}

export default function WorkletGrid({ widgets, editMode, onRemove, onReorder, onAddClick }: Props) {
  const reduced = useReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = widgets.indexOf(active.id as WidgetKey);
    const newIdx = widgets.indexOf(over.id as WidgetKey);
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(arrayMove(widgets, oldIdx, newIdx));
    }
  }

  return (
    <LayoutGroup>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets} strategy={rectSortingStrategy}>
          <div className="wg">
            <AnimatePresence mode="popLayout">
              {widgets.map((key, index) => (
                <WorkletCard
                  key={key}
                  widgetKey={key}
                  editMode={editMode}
                  index={index}
                  onRemove={() => onRemove(key)}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {editMode && (
                <motion.button
                  key="add-tile"
                  type="button"
                  className="wg__add-tile"
                  onClick={onAddClick}
                  initial={reduced ? false : { scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduced ? undefined : { scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <span className="wg__add-plus">+</span>
                  <span className="wg__add-label">Add widget</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </LayoutGroup>
  );
}
