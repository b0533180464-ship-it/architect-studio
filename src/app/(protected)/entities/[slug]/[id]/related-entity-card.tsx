/* eslint-disable max-lines-per-function */
'use client';

import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableCell } from '@/components/generic-table/editable-cell';
import type { CustomFieldType, FieldOption } from '@/components/generic-table/fields';
import { trpc } from '@/lib/trpc/client';

interface FieldDef {
  id: string;
  fieldKey: string;
  name: string;
  fieldType: CustomFieldType;
  options?: FieldOption[] | null;
}

interface RelatedEntityCardProps {
  entityId: string;
  entityTypeSlug: string;
  entityTypeName?: string;
  isInverse?: boolean;
  onRemove: () => void;
}

export function RelatedEntityCard({
  entityId,
  entityTypeSlug,
  entityTypeName,
  isInverse,
  onRemove,
}: RelatedEntityCardProps) {
  const utils = trpc.useUtils();

  // Fetch the entity
  const { data: entity, isLoading: entityLoading } = trpc.genericEntities.getById.useQuery(
    { id: entityId },
    { enabled: !!entityId }
  );

  // Fetch fields for this entity type
  const { data: fields, isLoading: fieldsLoading } = trpc.genericEntityFields.list.useQuery(
    { entityTypeSlug, activeOnly: true },
    { enabled: !!entityTypeSlug }
  );

  // Update mutation
  const updateMutation = trpc.genericEntities.update.useMutation({
    onSuccess: () => {
      utils.genericEntities.getById.invalidate({ id: entityId });
    },
  });

  const handleNameUpdate = (value: unknown) => {
    if (typeof value !== 'string') return;
    updateMutation.mutate({ id: entityId, name: value });
  };

  const handleFieldUpdate = (fieldKey: string, value: unknown) => {
    if (!entity) return;
    const currentData = (entity.data as Record<string, unknown>) ?? {};
    const newData = { ...currentData, [fieldKey]: value };
    updateMutation.mutate({ id: entityId, data: newData });
  };

  if (entityLoading || fieldsLoading) {
    return (
      <div className="border rounded-lg p-3 bg-muted/20">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!entity) {
    return null;
  }

  const data = (entity.data as Record<string, unknown>) ?? {};

  return (
    <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
      {/* Header with name and remove button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 font-medium">
          {entityTypeName && (
            <span className="text-xs text-muted-foreground mr-1">{entityTypeName}:</span>
          )}
          <EditableCell type="text" value={entity.name} onSave={handleNameUpdate} />
        </div>
        {/* Don't show remove button for inverse relations - they're managed from the other board */}
        {!isInverse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Fields grid */}
      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(fields as FieldDef[]).map((field) => (
            <div key={field.id} className="space-y-0.5">
              <div className="text-xs text-muted-foreground">{field.name}</div>
              <EditableCell
                type={field.fieldType}
                value={data[field.fieldKey]}
                onSave={(value) => handleFieldUpdate(field.fieldKey, value)}
                options={field.options ?? []}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
