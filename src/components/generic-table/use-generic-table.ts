import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import type { ViewEntityType } from '@/server/routers/views/schemas';
import type { CustomFieldEntityType } from '@/server/routers/customFields/schemas';
import type { ColumnConfig, FilterConfig, GenericColumn, CustomFieldDef, BaseColumnDef } from './types';

// Map view entity types to custom field entity types
const VIEW_TO_FIELD_ENTITY: Record<ViewEntityType, CustomFieldEntityType> = {
  projects: 'project',
  clients: 'client',
  tasks: 'task',
  suppliers: 'supplier',
  professionals: 'professional',
  products: 'product',
  rooms: 'room',
  documents: 'project', // documents don't have custom fields
  meetings: 'project', // meetings don't have custom fields
  proposals: 'project', // proposals don't have custom fields
  contracts: 'project', // contracts don't have custom fields
  payments: 'project', // payments don't have custom fields
  expenses: 'project', // expenses don't have custom fields
};

interface UseGenericTableOptions<T> {
  entityType: ViewEntityType;
  baseColumns: BaseColumnDef<T>[];
}

export function useGenericTable<T extends { id: string }>({
  entityType,
  baseColumns,
}: UseGenericTableOptions<T>) {
  const fieldEntityType = VIEW_TO_FIELD_ENTITY[entityType];

  // State
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<ColumnConfig[] | null>(null);
  const [localSortBy, setLocalSortBy] = useState<string | null>(null);
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API queries
  const viewsQuery = trpc.views.list.useQuery({ entityType, includeShared: true });
  const customFieldsQuery = trpc.customFields.listDefinitions.useQuery({
    entityType: fieldEntityType,
    activeOnly: true,
  });

  // API mutations
  const createViewMutation = trpc.views.create.useMutation();
  const duplicateViewMutation = trpc.views.duplicate.useMutation();
  const deleteViewMutation = trpc.views.delete.useMutation();
  const setDefaultMutation = trpc.views.setDefault.useMutation();
  const quickSaveMutation = trpc.views.quickSave.useMutation();
  const createFieldMutation = trpc.customFields.createDefinition.useMutation();
  const updateFieldMutation = trpc.customFields.updateDefinition.useMutation();
  const deleteFieldMutation = trpc.customFields.deleteDefinition.useMutation();

  const views = viewsQuery.data ?? [];
  const customFields = useMemo(
    () => (customFieldsQuery.data ?? []) as CustomFieldDef[],
    [customFieldsQuery.data]
  );
  const currentView = views.find((v) => v.id === currentViewId);

  // Get effective columns (from view or defaults)
  const effectiveColumnConfigs = useMemo((): ColumnConfig[] => {
    if (localColumns) return localColumns;
    if (currentView?.columns) {
      return currentView.columns as unknown as ColumnConfig[];
    }
    // Default: all base columns + custom fields visible
    const baseConfigs = baseColumns.map((col, i) => ({
      fieldKey: col.key as string,
      width: col.width,
      visible: true,
      order: i,
    }));
    const customConfigs = customFields.map((f, i) => ({
      fieldKey: f.fieldKey,
      width: f.width || 120,
      visible: true,
      order: baseColumns.length + i,
    }));
    return [...baseConfigs, ...customConfigs];
  }, [localColumns, currentView, baseColumns, customFields]);

  // Merge columns with field definitions
  const columns = useMemo((): GenericColumn[] => {
    const baseByKey = new Map(baseColumns.map((c) => [c.key as string, c]));
    const customByKey = new Map(customFields.map((f) => [f.fieldKey, f]));

    return effectiveColumnConfigs
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order)
      .map((config): GenericColumn | null => {
        const baseCol = baseByKey.get(config.fieldKey);
        if (baseCol) {
          return {
            key: config.fieldKey,
            label: baseCol.label,
            width: config.width || baseCol.width,
            visible: true,
            order: config.order,
            isCustomField: false,
            fieldType: baseCol.fieldType,
            options: baseCol.options,
            sortable: baseCol.sortable !== false,
            hideable: baseCol.hideable !== false,
            editable: false,
            deletable: false,
          };
        }
        const customCol = customByKey.get(config.fieldKey);
        if (customCol) {
          return {
            key: config.fieldKey,
            label: customCol.name,
            width: config.width || customCol.width || 120,
            visible: true,
            order: config.order,
            isCustomField: true,
            fieldId: customCol.id,
            fieldType: customCol.fieldType,
            options: customCol.options || undefined,
            isRequired: customCol.isRequired,
            sortable: true,
            hideable: true,
            editable: true,
            deletable: true,
          };
        }
        return null;
      })
      .filter((c): c is GenericColumn => c !== null);
  }, [effectiveColumnConfigs, baseColumns, customFields]);

  // Callbacks
  const selectView = useCallback((viewId: string | null) => {
    setCurrentViewId(viewId);
    setLocalColumns(null);
    setLocalSortBy(null);
    setLocalSortOrder(null);
    setLocalFilters([]);
    setHasUnsavedChanges(false);
  }, []);

  const updateColumnWidth = useCallback((key: string, width: number) => {
    setLocalColumns((prev) => {
      const cols = prev || effectiveColumnConfigs;
      return cols.map((c) => (c.fieldKey === key ? { ...c, width } : c));
    });
    setHasUnsavedChanges(true);
  }, [effectiveColumnConfigs]);

  const hideColumn = useCallback((key: string) => {
    setLocalColumns((prev) => {
      const cols = prev || effectiveColumnConfigs;
      return cols.map((c) => (c.fieldKey === key ? { ...c, visible: false } : c));
    });
    setHasUnsavedChanges(true);
  }, [effectiveColumnConfigs]);

  const toggleSort = useCallback((key: string) => {
    setLocalSortBy((prevKey) => {
      if (prevKey !== key) {
        setLocalSortOrder('asc');
        return key;
      }
      if (localSortOrder === 'asc') {
        setLocalSortOrder('desc');
        return key;
      }
      setLocalSortOrder(null);
      return null;
    });
    setHasUnsavedChanges(true);
  }, [localSortOrder]);

  const saveView = useCallback(async () => {
    if (!currentViewId) return;
    await quickSaveMutation.mutateAsync({
      id: currentViewId,
      columns: localColumns || undefined,
      sortBy: localSortBy,
      sortOrder: localSortOrder,
      filters: localFilters.length > 0 ? localFilters : null,
    });
    setHasUnsavedChanges(false);
    viewsQuery.refetch();
  }, [currentViewId, localColumns, localSortBy, localSortOrder, localFilters, quickSaveMutation, viewsQuery]);

  return {
    // Data
    views,
    columns,
    customFields,
    currentViewId,
    currentView,
    hasUnsavedChanges,
    sortBy: localSortBy || (currentView?.sortBy as string | null) || null,
    sortOrder: localSortOrder || (currentView?.sortOrder as 'asc' | 'desc' | null) || null,
    filters: localFilters,
    // Loading states
    isLoadingViews: viewsQuery.isLoading,
    isLoadingFields: customFieldsQuery.isLoading,
    // Actions
    selectView,
    updateColumnWidth,
    hideColumn,
    toggleSort,
    saveView,
    // View mutations
    createView: createViewMutation.mutateAsync,
    duplicateView: duplicateViewMutation.mutateAsync,
    deleteView: deleteViewMutation.mutateAsync,
    setDefault: setDefaultMutation.mutateAsync,
    // Field mutations
    createField: createFieldMutation.mutateAsync,
    updateField: updateFieldMutation.mutateAsync,
    deleteField: deleteFieldMutation.mutateAsync,
    // Refetch
    refetchViews: viewsQuery.refetch,
    refetchFields: customFieldsQuery.refetch,
  };
}
