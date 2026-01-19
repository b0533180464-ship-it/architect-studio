/* eslint-disable max-lines-per-function */
import { useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

interface UseEntityRelationsOptions {
  sourceEntityType: string;
  enabled?: boolean;
}

export function useEntityRelations({ sourceEntityType, enabled = true }: UseEntityRelationsOptions) {
  // Fetch relation definitions for this entity type
  const relDefsQuery = trpc.relations.listDefs.useQuery(
    { sourceEntityType, activeOnly: true },
    { enabled: enabled && !!sourceEntityType }
  );

  // Mutations
  const createDefMut = trpc.relations.createDef.useMutation();
  const updateDefMut = trpc.relations.updateDef.useMutation();
  const deleteDefMut = trpc.relations.deleteDef.useMutation();
  const addRelMut = trpc.relations.addRelation.useMutation();
  const removeRelMut = trpc.relations.removeRelation.useMutation();

  const relationDefs = useMemo(() => relDefsQuery.data ?? [], [relDefsQuery.data]);

  // Create new relation definition
  const createRelationDef = useCallback(
    async (data: {
      name: string;
      fieldKey: string;
      targetEntityTypes: string[];
      relationType: 'one_to_one' | 'one_to_many' | 'many_to_many';
      isBidirectional?: boolean;
      inverseName?: string;
    }) => {
      const result = await createDefMut.mutateAsync({
        ...data,
        sourceEntityType,
      });
      relDefsQuery.refetch();
      return result;
    },
    [createDefMut, sourceEntityType, relDefsQuery]
  );

  // Delete relation definition
  const deleteRelationDef = useCallback(
    async (id: string) => {
      await deleteDefMut.mutateAsync({ id });
      relDefsQuery.refetch();
    },
    [deleteDefMut, relDefsQuery]
  );

  // Add relation between entities
  const addRelation = useCallback(
    async (relationDefId: string, sourceEntityId: string, targetEntityType: string, targetEntityId: string) => {
      const def = relationDefs.find((d) => d.id === relationDefId);
      if (!def) return;

      return addRelMut.mutateAsync({
        relationDefId,
        sourceEntityType: def.sourceEntityType,
        sourceEntityId,
        targetEntityType,
        targetEntityId,
      });
    },
    [addRelMut, relationDefs]
  );

  // Remove relation
  const removeRelation = useCallback(
    async (relationId: string) => {
      return removeRelMut.mutateAsync({ id: relationId });
    },
    [removeRelMut]
  );

  return {
    relationDefs,
    isLoading: relDefsQuery.isLoading,
    createRelationDef,
    updateRelationDef: updateDefMut.mutateAsync,
    deleteRelationDef,
    addRelation,
    removeRelation,
    refetch: relDefsQuery.refetch,
  };
}
