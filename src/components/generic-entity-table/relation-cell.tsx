/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/client';

interface RelationCellProps {
  relationDefId: string;
  relationName: string;
  sourceEntityType: string;
  targetEntityTypes: string[]; // Array of target types
  sourceEntityId: string;
  onAdd: (targetEntityType: string, targetEntityId: string) => void;
  onRemove: (relationId: string) => void;
  disabled?: boolean;
}

interface TargetEntity {
  id: string;
  name: string;
  entityType: string;
  entityTypeName: string;
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

export function RelationCell({
  relationDefId,
  relationName,
  sourceEntityType,
  targetEntityTypes,
  sourceEntityId,
  onAdd,
  onRemove,
  disabled,
}: RelationCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get entity type info for all target types
  const targetSlugs = targetEntityTypes
    .filter((t) => t.startsWith('generic:'))
    .map((t) => t.replace('generic:', ''));

  // Fetch all target entity types
  const entityTypeQueries = targetSlugs.map((slug) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trpc.entityTypes.getBySlug.useQuery({ slug }, { enabled: true })
  );

  // Fetch existing relations for this source entity
  const { data: existingRelations, refetch: refetchRelations } = trpc.relations.listRelations.useQuery(
    { sourceEntityType, sourceEntityId, relationDefId },
    { enabled: !!sourceEntityId }
  );

  // Fetch entities from all target types
  const entityQueries = entityTypeQueries.map((q) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trpc.genericEntities.list.useQuery(
      { entityTypeId: q.data?.id ?? '', limit: 50 },
      { enabled: !!q.data?.id }
    )
  );

  // Combine all target entities with their type info
  const allTargetEntities = useMemo(() => {
    const entities: TargetEntity[] = [];
    entityQueries.forEach((q, idx) => {
      const typeData = entityTypeQueries[idx]?.data;
      const entityType = targetEntityTypes[idx];
      if (q.data?.entities && typeData && entityType) {
        q.data.entities.forEach((e) => {
          entities.push({
            id: e.id,
            name: e.name,
            entityType,
            entityTypeName: typeData.name,
          });
        });
      }
    });
    return entities;
  }, [entityQueries, entityTypeQueries, targetEntityTypes]);

  const isLoading = entityQueries.some((q) => q.isLoading) || entityTypeQueries.some((q) => q.isLoading);

  // Get related item IDs (handles both direct and inverse relations)
  const relatedIds = useMemo(() => {
    const ids = new Set<string>();
    (existingRelations ?? []).forEach((r) => {
      const rel = r as ExtendedRelation;
      // For inverse relations, use _displayTargetEntityId
      const targetId = rel._isInverse ? rel._displayTargetEntityId : rel.targetEntityId;
      if (targetId) ids.add(targetId);
    });
    return ids;
  }, [existingRelations]);

  // Get related items with their entity info
  const relatedItems = useMemo(
    () => allTargetEntities
      .filter((e) => relatedIds.has(e.id))
      .map((e) => {
        const rel = (existingRelations ?? []).find((r) => {
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
    [allTargetEntities, relatedIds, existingRelations]
  );

  // Available entities grouped by type, filtered by search
  const availableByType = useMemo(() => {
    const filtered = allTargetEntities
      .filter((e) => !relatedIds.has(e.id))
      .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));

    // Group by entity type
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

  const handleAdd = (targetEntityType: string, targetId: string) => {
    onAdd(targetEntityType, targetId);
    setIsOpen(false);
    setSearch('');
    setTimeout(() => refetchRelations(), 500);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSearch('');
  };

  const handleRemove = (relationId: string) => {
    onRemove(relationId);
    setTimeout(() => refetchRelations(), 500);
  };

  return (
    <div className="flex flex-wrap gap-1 items-center min-h-[28px]">
      {relatedItems.map((item) => (
        <Badge
          key={item.id}
          variant={item.isInverse ? 'outline' : 'secondary'}
          className="text-xs gap-1 pl-1"
        >
          {targetEntityTypes.length > 1 && (
            <span className="text-muted-foreground text-[10px]">{item.entityTypeName}:</span>
          )}
          {item.name}
          {/* Don't show remove button for inverse relations - they're managed from the other board */}
          {!disabled && !item.isInverse && (
            <button
              onClick={() => handleRemove(item.relationId)}
              className="hover:bg-destructive/20 rounded-full p-0.5 mr-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              הוסף {relationName}
            </div>
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
                <div className="flex items-center justify-center py-4">
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
                        {targetEntityTypes.length > 1 && (
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
      )}
    </div>
  );
}
