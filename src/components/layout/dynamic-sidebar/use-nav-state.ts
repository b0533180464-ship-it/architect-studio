/* eslint-disable max-lines-per-function */
'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { NavigationItemWithChildren } from './types';
import type { EntityCreatorData } from './dialogs';

const DEFAULT_OPEN = new Set(['אנשי קשר', 'ניהול עבודה', 'מוצרים ורכש', 'פיננסי']);

export function useNavState() {
  const utils = trpc.useUtils();
  const [openCategories, setOpenCategories] = useState<Set<string>>(DEFAULT_OPEN);
  const [renameItem, setRenameItem] = useState<NavigationItemWithChildren | null>(null);
  const [iconItem, setIconItem] = useState<NavigationItemWithChildren | null>(null);
  const [deleteItem, setDeleteItem] = useState<NavigationItemWithChildren | null>(null);
  const [showEntityCreator, setShowEntityCreator] = useState(false);

  const { data: navItems, isLoading } = trpc.navigation.tree.useQuery({ includeHidden: false });

  const updateMutation = trpc.navigation.update.useMutation({
    onSuccess: () => utils.navigation.tree.invalidate(),
  });
  const deleteMutation = trpc.navigation.delete.useMutation({
    onSuccess: () => utils.navigation.tree.invalidate(),
  });
  const toggleVisibilityMutation = trpc.navigation.toggleVisibility.useMutation({
    onSuccess: () => utils.navigation.tree.invalidate(),
  });
  const createMutation = trpc.navigation.create.useMutation({
    onSuccess: () => utils.navigation.tree.invalidate(),
  });
  const reorderMutation = trpc.navigation.reorder.useMutation({
    onSuccess: () => utils.navigation.tree.invalidate(),
  });
  const createEntityTypeMutation = trpc.entityTypes.create.useMutation({
    onSuccess: (entityType) => {
      // Create navigation item for the new entity type
      createMutation.mutate({
        label: entityType.namePlural,
        icon: entityType.icon ?? 'FileText',
        href: `/entities/${entityType.slug}`,
        entityType: entityType.slug,
      });
    },
  });

  const toggleCategory = useCallback((label: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const handleRename = useCallback((item: NavigationItemWithChildren) => setRenameItem(item), []);
  const handleChangeIcon = useCallback((item: NavigationItemWithChildren) => setIconItem(item), []);
  const handleDelete = useCallback((item: NavigationItemWithChildren) => setDeleteItem(item), []);

  const handleToggleVisibility = useCallback(
    (item: NavigationItemWithChildren) => toggleVisibilityMutation.mutate({ id: item.id, isVisible: !item.isVisible }),
    [toggleVisibilityMutation]
  );

  const handleSaveRename = useCallback((id: string, label: string) => updateMutation.mutate({ id, label }), [updateMutation]);
  const handleSaveIcon = useCallback((id: string, icon: string) => updateMutation.mutate({ id, icon }), [updateMutation]);
  const handleConfirmDelete = useCallback((id: string) => deleteMutation.mutate({ id }), [deleteMutation]);

  const handleAddLink = useCallback(() => createMutation.mutate({ label: 'קישור חדש', href: '/new-link' }), [createMutation]);
  const handleAddCategory = useCallback(() => createMutation.mutate({ label: 'קטגוריה חדשה', icon: 'Folder' }), [createMutation]);

  const handleReorder = useCallback(
    (items: { id: string; order: number; parentId: string | null }[]) => reorderMutation.mutate({ items }),
    [reorderMutation]
  );

  const handleOpenEntityCreator = useCallback(() => setShowEntityCreator(true), []);
  const handleCreateEntity = useCallback(
    (data: EntityCreatorData) => createEntityTypeMutation.mutate(data),
    [createEntityTypeMutation]
  );

  return {
    navItems,
    isLoading,
    openCategories,
    renameItem,
    iconItem,
    deleteItem,
    setRenameItem,
    setIconItem,
    setDeleteItem,
    toggleCategory,
    handleRename,
    handleChangeIcon,
    handleDelete,
    handleToggleVisibility,
    handleSaveRename,
    handleSaveIcon,
    handleConfirmDelete,
    handleAddLink,
    handleAddCategory,
    handleReorder,
    showEntityCreator,
    setShowEntityCreator,
    handleOpenEntityCreator,
    handleCreateEntity,
  };
}
