/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface DocumentsPanelProps {
  projectId: string;
}

export function ProjectDocumentsPanel({ projectId }: DocumentsPanelProps) {
  const { data } = trpc.documents.list.useQuery({ projectId, pageSize: 5 });

  const documents = data?.items || [];
  const total = data?.pagination.total || 0;

  return (
    <ExpandablePanel id="documents" title="מסמכים" icon="📁" count={total} projectId={projectId}>
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">אין מסמכים</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="truncate">{doc.name}</span>
              </div>
              {doc.documentCategory && (
                <Badge variant="outline" style={{ borderColor: doc.documentCategory.color || undefined }}>
                  {doc.documentCategory.name}
                </Badge>
              )}
            </div>
          ))}
          {total > 5 && (
            <div className="pt-2 border-t">
              <Link href={`/documents?projectId=${projectId}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  צפה בכל {total} המסמכים &larr;
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </ExpandablePanel>
  );
}
