/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { ConfigBadge } from '@/components/ui/config-badge';

interface DocumentItem {
  id: string;
  name: string;
  mimeType: string;
  fileUrl: string;
  version: number;
  isSharedWithClient: boolean;
  createdAt: Date;
  project?: { id: string; name: string } | null;
  documentCategory?: { id: string; name: string; color?: string | null } | null;
  computed: {
    fileSizeFormatted: string;
    isImage: boolean;
    isPDF: boolean;
    hasVersions: boolean;
  };
}

interface DocumentListProps {
  documents: DocumentItem[];
  onPreview: (doc: DocumentItem) => void;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  return '📎';
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function DocumentList({ documents, onPreview }: DocumentListProps) {
  if (documents.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">אין מסמכים להצגה</div>;
  }

  return (
    <div className="divide-y border rounded-lg overflow-hidden">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
          onClick={() => onPreview(doc)}
        >
          <span className="text-3xl flex-shrink-0">{getFileIcon(doc.mimeType)}</span>
          <div className="flex-1 min-w-0">
            <Link
              href={`/documents/${doc.id}` as Route}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium truncate">{doc.name}</p>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{doc.computed.fileSizeFormatted}</span>
              {doc.project && <span>{doc.project.name}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
            <ConfigBadge entity={doc.documentCategory} size="sm" />
            {doc.isSharedWithClient && <Badge variant="secondary">משותף</Badge>}
            {doc.computed.hasVersions && <Badge variant="outline">v{doc.version}</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}
