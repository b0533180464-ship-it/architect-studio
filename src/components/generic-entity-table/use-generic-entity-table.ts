/* eslint-disable max-lines-per-function, max-lines */
import { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { ColumnConfig, FilterConfig, GenericEntityColumn, GenericFieldDef, BaseColumnDef } from './types';

interface UseGenericEntityTableOptions {
  entityTypeSlug: string;
  baseColumns: BaseColumnDef[];
}

export function useGenericEntityTable({ entityTypeSlug, baseColumns }: UseGenericEntityTableOptions) {
  // State
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<ColumnConfig[] | null>(null);
  const [localSortBy, setLocalSortBy] = useState<string | null>(null);
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API queries
  const viewsQuery = trpc.genericEntityViews.list.useQuery(
    { entityTypeSlug, includeShared: true },
    { enabled: !!entityTypeSlug }
  );
  const fieldsQuery = trpc.genericEntityFields.list.useQuery(
    { entityTypeSlug, activeOnly: true },
    { enabled: !!entityTypeSlug }
  );

  // API mutations
  const createViewMut = trpc.genericEntityViews.create.useMutation();
  const updateViewMut = trpc.genericEntityViews.update.useMutation();
  const duplicateViewMut = trpc.genericEntityViews.duplicate.useMutation();
  const deleteViewMut = trpc.genericEntityViews.delete.useMutation();
  const setDefaultMut = trpc.genericEntityViews.setDefault.useMutation();
  const createFieldMut = trpc.genericEntityFields.create.useMutation();
  const updateFieldMut = trpc.genericEntityFields.update.useMutation();
  const deleteFieldMut = trpc.genericEntityFields.delete.useMutation();

  const views = viewsQuery.data ?? [];
  const customFields = useMemo(() => (fieldsQuery.data ?? []) as GenericFieldDef[], [fieldsQuery.data]);
  const currentView = views.find((v: { id: string }) => v.id === currentViewId);

  // Build effective column configs
  const effectiveColumnConfigs = useMemo((): ColumnConfig[] => {
    if (localColumns) return localColumns;
    if (currentView) {
      const viewCols = currentView as unknown as { columns?: ColumnConfig[] };
      if (viewCols.columns) return viewCols.columns;
    }
    const baseConfigs = baseColumns.map((col, i) => ({
      fieldKey: col.key,
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
  const columns = useMemo((): GenericEntityColumn[] => {
    const baseByKey = new Map(baseColumns.map((c) => [c.key, c]));
    const customByKey = new Map(customFields.map((f) => [f.fieldKey, f]));

    return effectiveColumnConfigs
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order)
      .map((config): GenericEntityColumn | null => {
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
            sortable: baseCol.sortable !== false,
            hideable: baseCol.hideable !== false,
            editable: true,
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
            options: customCol.options ?? undefined,
            isRequired: customCol.isRequired,
            sortable: true,
            hideable: true,
            editable: true,
            deletable: true,
          };
        }
        return null;
      })
      .filter((c): c is GenericEntityColumn => c !== null);
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
    setLocalColumns((prev) => (prev || effectiveColumnConfigs).map((c) =>
      c.fieldKey === key ? { ...c, width } : c
    ));
    setHasUnsavedChanges(true);
  }, [effectiveColumnConfigs]);

  const hideColumn = useCallback((key: string) => {
    setLocalColumns((prev) => (prev || effectiveColumnConfigs).map((c) =>
      c.fieldKey === key ? { ...c, visible: false } : c
    ));
    setHasUnsavedChanges(true);
  }, [effectiveColumnConfigs]);

  const toggleSort = useCallback((key: string) => {
    setLocalSortBy((prevKey) => {
      if (prevKey !== key) { setLocalSortOrder('asc'); return key; }
      if (localSortOrder === 'asc') { setLocalSortOrder('desc'); return key; }
      setLocalSortOrder(null);
      return null;
    });
    setHasUnsavedChanges(true);
  }, [localSortOrder]);

  const saveView = useCallback(async () => {
    if (!currentViewId) return;
    await updateViewMut.mutateAsync({
      id: currentViewId,
      columns: localColumns || undefined,
      sortBy: localSortBy,
      sortOrder: localSortOrder,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: localFilters.length > 0 ? (localFilters as any) : null,
    });
    setHasUnsavedChanges(false);
    viewsQuery.refetch();
  }, [currentViewId, localColumns, localSortBy, localSortOrder, localFilters, updateViewMut, viewsQuery]);

  return {
    views, columns, customFields, currentViewId, currentView, hasUnsavedChanges,
    sortBy: localSortBy || null,
    sortOrder: localSortOrder || null,
    filters: localFilters,
    isLoadingViews: viewsQuery.isLoading,
    isLoadingFields: fieldsQuery.isLoading,
    selectView, updateColumnWidth, hideColumn, toggleSort, saveView,
    createView: createViewMut.mutateAsync,
    duplicateView: duplicateViewMut.mutateAsync,
    deleteView: deleteViewMut.mutateAsync,
    setDefault: setDefaultMut.mutateAsync,
    createField: createFieldMut.mutateAsync,
    updateField: updateFieldMut.mutateAsync,
    deleteField: deleteFieldMut.mutateAsync,
    refetchViews: viewsQuery.refetch,
    refetchFields: fieldsQuery.refetch,
  };
}
