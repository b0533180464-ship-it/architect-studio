/* eslint-disable max-lines-per-function */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { EntityType } from '@prisma/client';

interface UseEntityFormOptions {
  entityType: EntityType;
  editingId: string | null;
  open: boolean;
  onSuccess: () => void;
}

export function useEntityForm({ entityType, editingId, open, onSuccess }: UseEntityFormOptions) {
  const [name, setName] = useState('');
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Fetch custom fields for this entity type
  const { data: fields } = trpc.genericEntityFields.list.useQuery(
    { entityTypeSlug: entityType.slug, activeOnly: true },
    { enabled: open }
  );

  // Fetch entity data when editing
  const { data: editingEntity } = trpc.genericEntities.getById.useQuery(
    { id: editingId ?? '' },
    { enabled: !!editingId && open }
  );

  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (!open) return;

    if (editingEntity) {
      setName(editingEntity.name);
      setFormData((editingEntity.data as Record<string, unknown>) ?? {});
    } else if (!editingId) {
      setName('');
      setFormData({});
    }
  }, [editingEntity, editingId, open]);

  const updateField = useCallback((fieldKey: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setFormData({});
  }, []);

  const createMutation = trpc.genericEntities.create.useMutation({
    onSuccess: () => {
      resetForm();
      onSuccess();
    },
  });

  const updateMutation = trpc.genericEntities.update.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSave = useCallback(() => {
    if (!name.trim()) return;

    const dataToSave = Object.keys(formData).length > 0 ? formData : undefined;

    if (editingId) {
      updateMutation.mutate({ id: editingId, name: name.trim(), data: dataToSave });
    } else {
      createMutation.mutate({
        entityTypeId: entityType.id,
        name: name.trim(),
        data: dataToSave,
      });
    }
  }, [name, formData, editingId, entityType.id, createMutation, updateMutation]);

  return {
    name,
    setName,
    formData,
    updateField,
    fields,
    handleSave,
    isPending: createMutation.isPending || updateMutation.isPending,
    isEdit: !!editingId,
  };
}
