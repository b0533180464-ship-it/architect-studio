/* eslint-disable max-lines-per-function */
'use client';

import { trpc } from '@/lib/trpc/client';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavIcon } from '@/components/layout/dynamic-sidebar/nav-icon';
import { GenericEntityDataTable } from '@/components/generic-entity-table';
import type { BaseColumnDef } from '@/components/generic-entity-table';
import { GenericEntityDialog } from './generic-entity-dialog';
import { useState, useMemo, useCallback } from 'react';

interface GenericEntityContentProps {
  slug: string;
}

export function GenericEntityContent({ slug }: GenericEntityContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: entityType, isLoading: typeLoading } = trpc.entityTypes.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: entities, isLoading: entitiesLoading } = trpc.genericEntities.list.useQuery(
    { entityTypeId: entityType?.id ?? '', limit: 100 },
    { enabled: !!entityType?.id }
  );

  // Fetch all entity types for relation selection
  const { data: allEntityTypes } = trpc.entityTypes.list.useQuery({});
  const entityTypesForRelation = useMemo(() => {
    return (allEntityTypes ?? []).map((et) => ({ slug: et.slug, name: et.name }));
  }, [allEntityTypes]);

  const updateMutation = trpc.genericEntities.update.useMutation({
    onSuccess: () => utils.genericEntities.list.invalidate(),
  });

  const deleteMutation = trpc.genericEntities.delete.useMutation({
    onSuccess: () => utils.genericEntities.list.invalidate(),
  });

  // Base columns - name is always the first column
  const baseColumns = useMemo((): BaseColumnDef[] => [
    { key: 'name', label: 'שם', width: 200, fieldType: 'text', sortable: true, hideable: false },
  ], []);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const handleCellUpdate = useCallback((id: string, fieldKey: string, value: unknown) => {
    if (fieldKey === 'name') {
      updateMutation.mutate({ id, name: String(value) });
    } else {
      // Update custom field in data JSON
      const entity = entities?.entities.find((e) => e.id === id);
      if (entity) {
        const currentData = entity.data as Record<string, unknown>;
        updateMutation.mutate({ id, data: { ...currentData, [fieldKey]: value } });
      }
    }
  }, [updateMutation, entities]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate({ id });
  }, [deleteMutation]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
  }, []);

  const handleSuccess = useCallback(() => {
    utils.genericEntities.list.invalidate();
    handleDialogClose();
  }, [utils.genericEntities.list, handleDialogClose]);

  if (typeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entityType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">סוג ישות לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${entityType.color}20`, color: entityType.color ?? undefined }}
          >
            <NavIcon name={entityType.icon} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{entityType.namePlural}</h1>
            <p className="text-muted-foreground text-sm">{entities?.total ?? 0} רשומות</p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          הוסף {entityType.name}
        </Button>
      </div>

      <GenericEntityDataTable
        entityTypeSlug={slug}
        data={entities?.entities ?? []}
        isLoading={entitiesLoading}
        baseColumns={baseColumns}
        entityTypes={entityTypesForRelation}
        onCellUpdate={handleCellUpdate}
        onDelete={handleDelete}
        emptyMessage={`אין ${entityType.namePlural} להצגה`}
      />

      <GenericEntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entityType={entityType}
        editingId={editingId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
