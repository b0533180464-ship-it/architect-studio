'use client';

import { useMemo, useCallback } from 'react';
import { ViewBar } from './view-bar';
import { GenericColumnHeader } from './column-header';
import { AddColumnButton, type AddColumnData } from './add-column-button';
import { GenericTableRow } from './table-row';
import { useGenericTable } from './use-generic-table';
import type { GenericTableProps, GenericColumn } from './types';
import type { ViewEntityType } from '@/server/routers/views/schemas';

interface Props<T extends { id: string }> extends GenericTableProps<T> {
  // Custom field values per entity
  customFieldValues?: Map<string, Record<string, unknown>>;
  // Current user ID (optional - for view ownership display)
  userId?: string;
  // Detail page URL pattern (e.g., "/clients/{id}")
  detailUrlPattern?: string;
  // Delete callback
  onDelete?: (id: string) => void;
}

export function GenericDataTable<T extends { id: string }>({
  entityType,
  data,
  isLoading,
  baseColumns,
  onRowClick,
  onCellUpdate,
  onAddCustomField,
  onUpdateCustomField,
  onDeleteCustomField,
  customFieldValues,
  emptyMessage = 'אין נתונים להצגה',
  emptyIcon,
  userId = '',
  detailUrlPattern,
  onDelete,
}: Props<T>) {

  const {
    views,
    columns,
    currentViewId,
    hasUnsavedChanges,
    sortBy,
    sortOrder,
    filters,
    selectView,
    updateColumnWidth,
    hideColumn,
    toggleSort,
    saveView,
    createView,
    duplicateView,
    deleteView,
    setDefault,
    createField,
    updateField,
    deleteField,
    refetchFields,
  } = useGenericTable({ entityType, baseColumns });

  const handleCreateView = async (name: string, isShared: boolean) => {
    const defaultColumns = columns.map((c, i) => ({
      fieldKey: c.key,
      width: c.width,
      visible: true,
      order: i,
    }));
    const newView = await createView({
      entityType,
      name,
      isShared,
      columns: defaultColumns,
    });
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
    await setDefault({ entityType, viewId });
  };

  const handleAddColumn = async (data: AddColumnData) => {
    const fieldEntityType = mapViewToFieldEntity(entityType);
    await createField({
      entityType: fieldEntityType,
      name: data.name,
      fieldKey: data.fieldKey,
      fieldType: data.fieldType,
      options: data.options,
    });
    refetchFields();
    onAddCustomField?.(data.fieldType, data.name, data.fieldKey);
  };

  const handleEditColumn = async (key: string, newLabel: string) => {
    const col = columns.find((c) => c.key === key);
    if (col?.isCustomField && col.fieldId) {
      await updateField({ id: col.fieldId, name: newLabel });
      refetchFields();
      onUpdateCustomField?.(col.fieldId, newLabel);
    }
  };

  const handleDeleteColumn = async (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (col?.isCustomField && col.fieldId) {
      await deleteField({ id: col.fieldId });
      refetchFields();
      onDeleteCustomField?.(col.fieldId);
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

  // Get cell value helper
  const getCellValue = useCallback((item: T, column: GenericColumn) => {
    if (column.isCustomField && customFieldValues) {
      return customFieldValues.get(item.id)?.[column.key] ?? null;
    }
    return (item as Record<string, unknown>)[column.key] ?? null;
  }, [customFieldValues]);

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

      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal, 'he');
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'he');
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [data, sortBy, sortOrder, columns, getCellValue]);

  // Get detail URL for an item
  const getDetailUrl = useCallback((id: string) => {
    if (!detailUrlPattern) return null;
    return detailUrlPattern.replace('{id}', id);
  }, [detailUrlPattern]);

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-muted/30" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 border-t bg-muted/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* View bar */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="group">
              {columns.map((column) => (
                <GenericColumnHeader
                  key={column.key}
                  column={column}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={toggleSort}
                  onResize={updateColumnWidth}
                  onEdit={handleEditColumn}
                  onEditOptions={handleEditColumnOptions}
                  onHide={hideColumn}
                  onDelete={handleDeleteColumn}
                />
              ))}
              {/* Add column button */}
              <th className="py-2 px-0 w-10 bg-muted/30 border-l border-border/50">
                <AddColumnButton onAdd={handleAddColumn} />
              </th>
              {/* Action menu header */}
              <th className="py-2 px-0 w-10 bg-muted/30" />
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {emptyIcon}
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <GenericTableRow
                  key={item.id}
                  item={item}
                  columns={columns}
                  baseColumns={baseColumns}
                  customFieldValues={customFieldValues}
                  onRowClick={onRowClick}
                  onCellUpdate={onCellUpdate}
                  detailUrl={getDetailUrl(item.id)}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper to map view entity to field entity
function mapViewToFieldEntity(
  viewEntity: ViewEntityType
): 'project' | 'client' | 'task' | 'supplier' | 'professional' | 'product' | 'room' {
  const map: Record<ViewEntityType, 'project' | 'client' | 'task' | 'supplier' | 'professional' | 'product' | 'room'> = {
    projects: 'project',
    clients: 'client',
    tasks: 'task',
    suppliers: 'supplier',
    professionals: 'professional',
    products: 'product',
    rooms: 'room',
    documents: 'project',
    meetings: 'project',
    proposals: 'project',
    contracts: 'project',
    payments: 'project',
    expenses: 'project',
  };
  return map[viewEntity];
}
