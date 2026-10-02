"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cx } from "@/components/admin/ui";

/**
 * Drag-to-reorder grid.
 * - Mouse: drag after moving 6px (so clicks on buttons inside still work).
 * - Touch: press and hold ~200ms, then drag (a quick swipe still scrolls).
 * - Keyboard: focus a tile, Space to pick up, arrows to move, Space to drop.
 */
export default function SortableGrid<T>({
  items,
  getId,
  onReorder,
  renderItem,
  className,
  disabled,
}: {
  items: T[];
  getId: (item: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number, state: { isDragging: boolean }) => ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map(getId);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy} disabled={disabled}>
        <div className={className} role="list">
          {items.map((item, i) => (
            <SortableTile key={ids[i]} id={ids[i]} disabled={disabled}>
              {(isDragging) => renderItem(item, i, { isDragging })}
            </SortableTile>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTile({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (isDragging: boolean) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        // Only key presses on the tile itself (not on buttons inside it)
        // start a keyboard drag.
        setActivatorNodeRef(el);
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "relative touch-manipulation rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
        !disabled && "cursor-grab active:cursor-grabbing",
        isDragging && "z-20"
      )}
      {...attributes}
      {...listeners}
      // dnd-kit sets role="button"; that's misleading for a tile that also
      // contains real buttons.
      role={disabled ? undefined : "listitem"}
      aria-roledescription={disabled ? undefined : "sortable item"}
    >
      {children(isDragging)}
    </div>
  );
}
