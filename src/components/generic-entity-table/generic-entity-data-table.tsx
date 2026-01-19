/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useMemo } from 'react';
import { ViewBar } from '../generic-table/view-bar';
import { GenericColumnHeader } from '../generic-table/column-header';
import { AddColumnButton, type AddColumnData, type AddRelationData } from '../generic-table/add-column-button';
import type { RelationSettingsData } from '../generic-table/column-header';
import { GenericEntityRow } from './generic-entity-row';
import { useGenericEntityTable } from './use-generic-entity-table';
import { useEntityRelations } from './use-entity-relations';
import type { BaseColumnDef, GenericEntityColumn } from './types';
import type { GenericEntity } from '@prisma/client';

interface EntityTypeOption {
  slug: string;
  name: string;
}

interface Props {
  entityTypeSlug: string;
  data: GenericEntity[];
  isLoading?: boolean;
  baseColumns: BaseColumnDef[];
  entityTypes?: EntityTypeOption[];
  onCellUpdate?: (id: string, fieldKey: string, value: unknown) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  userId?: string;
}

export function GenericEntityDataTable({
  entityTypeSlug,
  data,
  isLoading,
  baseColumns,
  entityTypes = [],
  onCellUpdate,
  onDelete,
  emptyMessage = 'אין נתונים להצגה',
  userId = '',
}: Props) {
  const {
    views, columns, currentViewId, hasUnsavedChanges, sortBy, sortOrder, filters,
    selectView, updateColumnWidth, hideColumn, toggleSort, saveView,
    createView, duplicateView, deleteView, setDefault,
    createField, updateField, deleteField, refetchFields,
  } = useGenericEntityTable({ entityTypeSlug, baseColumns });

  // Relations hook
  const sourceEntityType = `generic:${entityTypeSlug}`;
  const {
    relationDefs,
    createRelationDef,
    updateRelationDef,
    deleteRelationDef,
    addRelation,
    removeRelation,
    refetch: refetchRelations,
  } = useEntityRelations({ sourceEntityType });

  const handleCreateView = async (name: string, isShared: boolean) => {
    const defaultColumns = columns.map((c, i) => ({
      fieldKey: c.key, width: c.width, visible: true, order: i,
    }));
    const newView = await createView({ entityTypeSlug, name, isShared, columns: defaultColumns });
    selectView(newView.id);
  };

  const handleDuplicateView = async (viewId: string, name: string) => {
    const newView = await duplicateView({ id: viewId, name });
    selectView(newView.id);
  };

  const handleDeleteView = async (viewId: string) => {
    await deleteView({ id: viewId });
    selectView(null);
  };

  const handleSetDefault = async (viewId: string | null) => {
    await setDefault({ entityTypeSlug, viewId });
  };

  const handleAddColumn = async (colData: AddColumnData) => {
    await createField({
      entityTypeSlug,
      name: colData.name,
      fieldKey: colData.fieldKey,
      fieldType: colData.fieldType,
      options: colData.options,
    });
    refetchFields();
  };

  const handleAddRelation = async (relData: AddRelationData) => {
    await createRelationDef({
      name: relData.name,
      fieldKey: relData.fieldKey,
      targetEntityTypes: relData.targetEntityTypes.map((t) => `generic:${t}`),
      relationType: relData.relationType,
      isBidirectional: relData.isBidirectional,
      inverseName: relData.inverseName,
    });
    refetchRelations();
  };

  const handleEditRelation = async (relationDefId: string, data: RelationSettingsData) => {
    await updateRelationDef({ id: relationDefId, ...data });
    refetchRelations();
  };

  const handleEditColumn = async (key: string, newLabel: string) => {
    // Check if it's a relation column
    const relDef = relationDefs.find((d) => d.fieldKey === key);
    if (relDef) {
      await updateRelationDef({ id: relDef.id, name: newLabel });
      refetchRelations();
      return;
    }
    // Handle custom field columns
    const col = columns.find((c) => c.key === key);
    if (col?.isCustomField && col.fieldId) {
      await updateField({ id: col.fieldId, name: newLabel });
      refetchFields();
    }
  };

  const handleDeleteColumn = async (key: string) => {
    // Check if it's a relation column
    const relDef = relationDefs.find((d) => d.fieldKey === key);
    if (relDef) {
      await deleteRelationDef(relDef.id);
      refetchRelations();
      return;
    }
    // Handle custom field columns
    const col = columns.find((c) => c.key === key);
    if (col?.isCustomField && col.fieldId) {
      await deleteField({ id: col.fieldId });
      refetchFields();
    }
  };

  const handleEditColumnOptions = async (
    key: string,
    options: { value: string; label: string; color: string }[]
  ) => {
    const col = columns.find((c) => c.key === key);
    if (col?.isCustomField && col.fieldId) {
      await updateField({ id: col.fieldId, options });
      refetchFields();
    }
  };

  // Merge columns with relation columns
  const allColumns = useMemo((): GenericEntityColumn[] => {
    const relationColumns: GenericEntityColumn[] = relationDefs.map((def, i) => {
      // Check if this is an inverse definition (from bidirectional relation)
      const isInverse = '_isInverse' in def && def._isInverse === true;
      const displayName = isInverse && '_displayName' in def ? (def._displayName as string) : def.name;
      const displayFieldKey = isInverse && '_displayFieldKey' in def ? (def._displayFieldKey as string) : def.fieldKey;
      const displayTargetTypes = isInverse && '_displayTargetEntityTypes' in def
        ? (def._displayTargetEntityTypes as string[])
        : def.targetEntityTypes;

      return {
        key: displayFieldKey,
        label: displayName,
        width: 150,
        visible: true,
        order: columns.length + i,
        isCustomField: false,
        isRelation: true,
        fieldType: 'relation' as const,
        relationDef: {
          relationDefId: def.id,
          name: displayName,
          fieldKey: displayFieldKey,
          targetEntityTypes: displayTargetTypes,
          relationType: def.relationType as 'one_to_one' | 'one_to_many' | 'many_to_many',
        },
        sortable: false,
        hideable: true,
        // Inverse columns can't be edited/deleted from here - they're managed from source board
        editable: !isInverse,
        deletable: !isInverse,
      };
    });
    return [...columns, ...relationColumns];
  }, [columns, relationDefs]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy || !sortOrder) return data;
    const col = columns.find((c) => c.key === sortBy);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const aVal = getCellValue(a, col);
      const bVal = getCellValue(b, col);
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === null) return sortOrder === 'asc' ? -1 : 1;
      const cmp = typeof aVal === 'string' && typeof bVal === 'string'
        ? aVal.localeCompare(bVal, 'he')
        : String(aVal).localeCompare(String(bVal), 'he');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [data, sortBy, sortOrder, columns]);

  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-muted/30" />
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 border-t bg-muted/10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <ViewBar
        views={views}
        currentViewId={currentViewId}
        currentUserId={userId}
        onSelectView={selectView}
        onCreateView={handleCreateView}
        onDuplicateView={handleDuplicateView}
        onDeleteView={handleDeleteView}
        onSetDefault={handleSetDefault}
        onSaveView={saveView}
        hasUnsavedChanges={hasUnsavedChanges}
        activeFiltersCount={filters.length}
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="group">
              {allColumns.map((column) => (
                <GenericColumnHeader
                  key={column.key}
                  column={column}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  entityTypes={entityTypes}
                  onSort={toggleSort}
                  onResize={updateColumnWidth}
                  onEdit={handleEditColumn}
                  onEditOptions={handleEditColumnOptions}
                  onEditRelation={handleEditRelation}
                  onHide={hideColumn}
                  onDelete={handleDeleteColumn}
                />
              ))}
              <th className="py-2 px-1 bg-muted/30 border-l border-border/50">
                <AddColumnButton
                  onAdd={handleAddColumn}
                  onAddRelation={handleAddRelation}
                  entityTypes={entityTypes}
                  sourceEntityType={entityTypeSlug}
                />
              </th>
              <th className="py-2 px-0 w-10 bg-muted/30" />
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length + 2} className="py-12 text-center">
                  <span className="text-muted-foreground">{emptyMessage}</span>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <GenericEntityRow
                  key={item.id}
                  item={item}
                  columns={allColumns}
                  entityTypeSlug={entityTypeSlug}
                  sourceEntityType={sourceEntityType}
                  onCellUpdate={onCellUpdate}
                  onDelete={onDelete}
                  onAddRelation={addRelation}
                  onRemoveRelation={removeRelation}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getCellValue(item: GenericEntity, column: GenericEntityColumn): unknown {
  if (column.key === 'name') return item.name;
  const data = item.data as Record<string, unknown>;
  return data[column.key] ?? null;
}
