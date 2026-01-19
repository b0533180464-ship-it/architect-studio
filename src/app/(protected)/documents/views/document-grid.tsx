/* eslint-disable max-lines-per-function, @next/next/no-img-element */
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

interface DocumentGridProps {
  documents: DocumentItem[];
  onPreview: (doc: DocumentItem) => void;
}

function getThumbnailContent(doc: DocumentItem) {
  if (doc.computed.isImage) {
    return (
      <img
        src={doc.fileUrl}
        alt={doc.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  if (doc.computed.isPDF) {
    return <span className="text-5xl">📄</span>;
  }
  if (doc.mimeType.startsWith('video/')) {
    return <span className="text-5xl">🎬</span>;
  }
  if (doc.mimeType.includes('document') || doc.mimeType.includes('word')) {
    return <span className="text-5xl">📝</span>;
  }
  if (doc.mimeType.includes('sheet') || doc.mimeType.includes('excel')) {
    return <span className="text-5xl">📊</span>;
  }
  return <span className="text-5xl">📎</span>;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function DocumentGrid({ documents, onPreview }: DocumentGridProps) {
  if (documents.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">אין מסמכים להצגה</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors group cursor-pointer"
          onClick={() => onPreview(doc)}
        >
          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
            {getThumbnailContent(doc)}
          </div>
          <div className="p-3">
            <Link
              href={`/documents/${doc.id}` as Route}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium truncate">{doc.name}</p>
            </Link>
            <p className="text-sm text-muted-foreground">{doc.computed.fileSizeFormatted}</p>
            {doc.project && <p className="text-xs text-muted-foreground truncate">{doc.project.name}</p>}
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
              <div className="flex items-center gap-1">
                <ConfigBadge entity={doc.documentCategory} size="sm" />
                {doc.isSharedWithClient && <Badge variant="secondary" className="text-xs">משותף</Badge>}
                {doc.computed.hasVersions && <Badge variant="outline" className="text-xs">v{doc.version}</Badge>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
