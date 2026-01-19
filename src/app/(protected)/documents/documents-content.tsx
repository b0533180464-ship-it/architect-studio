/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocumentUploadForm } from '@/components/documents/document-upload-form';
import { DocumentGrid } from './views/document-grid';
import { DocumentList } from './views/document-list';
import { ViewToggle, type DocumentViewType } from './views/view-toggle';
import { PreviewModal } from './views/preview-modal';

type DocumentItem = {
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
};

export function DocumentsContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'shared' | 'images' | 'pdfs'>('all');
  const [view, setView] = useState<DocumentViewType>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const { data: stats } = trpc.documents.getStats.useQuery();
  const { data: documentsData, isLoading } = trpc.documents.list.useQuery({
    search: search || undefined,
    isSharedWithClient: filter === 'shared' ? true : undefined,
    pageSize: 50,
  });

  const documents = (documentsData?.items || []) as DocumentItem[];
  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'images') return doc.computed.isImage;
    if (filter === 'pdfs') return doc.computed.isPDF;
    return true;
  });

  const handlePreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">מסמכים</h1>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>+ העלאת מסמך</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>העלאת מסמך חדש</DialogTitle>
            </DialogHeader>
            <DocumentUploadForm onSuccess={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">סה״כ</div></CardContent></Card>
            <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.categories.images}</div><div className="text-sm text-muted-foreground">תמונות</div></CardContent></Card>
            <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.categories.pdfs}</div><div className="text-sm text-muted-foreground">PDF</div></CardContent></Card>
            <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-blue-600">{stats.shared}</div><div className="text-sm text-muted-foreground">משותפים</div></CardContent></Card>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 items-center">
                {(['all', 'images', 'pdfs', 'shared'] as const).map((f) => (
                  <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                    {f === 'all' ? 'הכל' : f === 'images' ? 'תמונות' : f === 'pdfs' ? 'PDF' : 'משותפים'}
                  </Button>
                ))}
                <div className="w-px h-6 bg-border mx-2" />
                <ViewToggle view={view} onViewChange={setView} />
              </div>
              <div className="flex-1 max-w-sm">
                <Input placeholder="חיפוש מסמכים..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>גלריית מסמכים</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">טוען...</div>
            ) : view === 'grid' ? (
              <DocumentGrid documents={filteredDocuments} onPreview={handlePreview} />
            ) : (
              <DocumentList documents={filteredDocuments} onPreview={handlePreview} />
            )}
          </CardContent>
        </Card>

      <PreviewModal
        document={previewDoc}
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
      />
    </>
  );
}
