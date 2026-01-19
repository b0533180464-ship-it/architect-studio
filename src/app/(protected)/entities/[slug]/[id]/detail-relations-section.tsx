/* eslint-disable max-lines-per-function */
'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { RelationGroup } from './relation-group';

interface DetailRelationsSectionProps {
  slug: string;
  entityId: string;
}

export function DetailRelationsSection({ slug, entityId }: DetailRelationsSectionProps) {
  const sourceEntityType = `generic:${slug}`;

  // Fetch relation definitions for this entity type
  const { data: relationDefs, isLoading } = trpc.relations.listDefs.useQuery(
    { sourceEntityType, activeOnly: true },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">קשרים</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relationDefs || relationDefs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">קשרים</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {relationDefs.map((relDef) => (
            <RelationGroup
              key={relDef.id}
              relationDef={relDef}
              sourceEntityType={sourceEntityType}
              sourceEntityId={entityId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
