/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState, useMemo } from 'react';
import { Plus, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/client';
import { RelatedEntityCard } from './related-entity-card';

interface RelationDef {
  id: string;
  name: string;
  targetEntityTypes: string[];
}

interface TargetEntity {
  id: string;
  name: string;
  entityType: string;
  entityTypeName: string;
  entityTypeSlug: string;
}

// Extended relation type that may include inverse relation fields
interface ExtendedRelation {
  id: string;
  targetEntityId: string;
  targetEntityType: string;
  _isInverse?: boolean;
  _displayTargetEntityId?: string;
  _displayTargetEntityType?: string;
}

interface RelationGroupProps {
  relationDef: RelationDef;
  sourceEntityType: string;
  sourceEntityId: string;
}

export function RelationGroup({ relationDef, sourceEntityType, sourceEntityId }: RelationGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const targetSlugs = relationDef.targetEntityTypes
    .filter((t) => t.startsWith('generic:'))
    .map((t) => t.replace('generic:', ''));

  // Fetch target entity types
  const entityTypeQueries = targetSlugs.map((slug) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trpc.entityTypes.getBySlug.useQuery({ slug }, { enabled: true })
  );

  // Fetch existing relations
  const { data: relations, refetch } = trpc.relations.listRelations.useQuery(
    { sourceEntityType, sourceEntityId, relationDefId: relationDef.id },
    { enabled: !!sourceEntityId }
  );

  // Fetch entities from all target types
  const entityQueries = entityTypeQueries.map((q) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trpc.genericEntities.list.useQuery(
      { entityTypeId: q.data?.id ?? '', limit: 50 },
      { enabled: !!q.data?.id && isOpen }
    )
  );

  // Combine all target entities
  const allTargetEntities = useMemo(() => {
    const entities: TargetEntity[] = [];
    entityQueries.forEach((q, idx) => {
      const typeData = entityTypeQueries[idx]?.data;
      const entityType = relationDef.targetEntityTypes[idx];
      const slug = targetSlugs[idx];
      if (q.data?.entities && typeData && entityType && slug) {
        q.data.entities.forEach((e) => {
          entities.push({
            id: e.id,
            name: e.name,
            entityType,
            entityTypeName: typeData.name,
            entityTypeSlug: slug,
          });
        });
      }
    });
    return entities;
  }, [entityQueries, entityTypeQueries, relationDef.targetEntityTypes, targetSlugs]);

  const isLoading = entityQueries.some((q) => q.isLoading) || entityTypeQueries.some((q) => q.isLoading);

  // Mutations
  const addMutation = trpc.relations.addRelation.useMutation({
    onSuccess: () => setTimeout(() => refetch(), 300),
  });
  const removeMutation = trpc.relations.removeRelation.useMutation({
    onSuccess: () => setTimeout(() => refetch(), 300),
  });

  // Get related item IDs (handles both direct and inverse relations)
  const relatedIds = useMemo(() => {
    const ids = new Set<string>();
    (relations ?? []).forEach((r) => {
      const rel = r as ExtendedRelation;
      // For inverse relations, use _displayTargetEntityId
      const targetId = rel._isInverse ? rel._displayTargetEntityId : rel.targetEntityId;
      if (targetId) ids.add(targetId);
    });
    return ids;
  }, [relations]);

  // Get related items with entity type info
  const relatedItems = useMemo(
    () => allTargetEntities
      .filter((e) => relatedIds.has(e.id))
      .map((e) => {
        const rel = (relations ?? []).find((r) => {
          const extRel = r as ExtendedRelation;
          const targetId = extRel._isInverse ? extRel._displayTargetEntityId : extRel.targetEntityId;
          return targetId === e.id;
        }) as ExtendedRelation | undefined;
        return {
          ...e,
          relationId: rel?.id ?? '',
          isInverse: rel?._isInverse ?? false,
        };
      }),
    [allTargetEntities, relatedIds, relations]
  );

  // Available entities grouped by type, filtered by search
  const availableByType = useMemo(() => {
    const filtered = allTargetEntities
      .filter((e) => !relatedIds.has(e.id))
      .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));

    const grouped: Record<string, { typeName: string; entities: TargetEntity[] }> = {};
    filtered.forEach((e) => {
      if (!grouped[e.entityType]) {
        grouped[e.entityType] = { typeName: e.entityTypeName, entities: [] };
      }
      grouped[e.entityType]!.entities.push(e);
    });
    return grouped;
  }, [allTargetEntities, relatedIds, search]);

  const hasAvailableItems = Object.values(availableByType).some((g) => g.entities.length > 0);

  const handleAdd = (targetEntityType: string, targetEntityId: string) => {
    addMutation.mutate({
      relationDefId: relationDef.id,
      sourceEntityType,
      targetEntityType,
      sourceEntityId,
      targetEntityId,
    });
    setIsOpen(false);
    setSearch('');
  };

  const handleRemove = (relationId: string) => {
    removeMutation.mutate({ id: relationId });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{relationDef.name}</h3>
        <Popover open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setSearch(''); }}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <Plus className="h-3.5 w-3.5" />
              הוסף
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="end">
            <div className="relative mb-2">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="חיפוש..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pr-8 text-sm"
              />
            </div>
            <ScrollArea className="max-h-64">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : !hasAvailableItems ? (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  {search ? 'לא נמצאו תוצאות' : 'אין פריטים זמינים'}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(availableByType).map(([entityType, group]) => (
                    group.entities.length > 0 && (
                      <div key={entityType}>
                        {relationDef.targetEntityTypes.length > 1 && (
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded mb-1">
                            {group.typeName}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {group.entities.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleAdd(entityType, item.id)}
                              className="w-full text-right text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Related entities */}
      {relatedItems.length > 0 ? (
        <div className="space-y-2">
          {relatedItems.map((item) => (
            <RelatedEntityCard
              key={item.id}
              entityId={item.id}
              entityTypeSlug={item.entityTypeSlug}
              entityTypeName={relationDef.targetEntityTypes.length > 1 ? item.entityTypeName : undefined}
              isInverse={item.isInverse}
              onRemove={() => handleRemove(item.relationId)}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-2">אין קשרים</div>
      )}
    </div>
  );
}
