/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ConfigEntityItem } from './config-entity-item';
import { ConfigEntityForm } from './config-entity-form';
import { Plus } from 'lucide-react';
import type { ConfigurableEntityType } from '@/server/routers/config/schemas';
import type { RouterOutputs } from '@/lib/trpc';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Entity = RouterOutputs['config']['list'][number];

interface Props {
  entityType: ConfigurableEntityType;
  title: string;
}

function SortableItem({ entity }: { entity: Entity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ConfigEntityItem entity={entity} dragHandleProps={listeners} />
    </div>
  );
}

export function ConfigEntityList({ entityType, title }: Props) {
  const [showForm, setShowForm] = useState(false);
  const { data: entities = [], isLoading } = trpc.config.list.useQuery({ entityType });
  const utils = trpc.useUtils();

  const reorderMutation = trpc.config.reorder.useMutation({
    onSuccess: () => {
      void utils.config.list.invalidate({ entityType });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entities.findIndex((e) => e.id === active.id);
    const newIndex = entities.findIndex((e) => e.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new order array
    const newOrder = [...entities];
    const removed = newOrder.splice(oldIndex, 1)[0];
    if (!removed) return;
    newOrder.splice(newIndex, 0, removed);

    // Send reorder request
    reorderMutation.mutate({
      entityType,
      ids: newOrder.map((e) => e.id),
    });
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">טוען...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 ml-1" />
          הוסף
        </Button>
      </div>

      {showForm && <ConfigEntityForm entityType={entityType} onClose={() => setShowForm(false)} />}

      {entities.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">אין הגדרות</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entities.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {entities.map((entity) => (
                <SortableItem key={entity.id} entity={entity} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
