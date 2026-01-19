/* eslint-disable max-lines-per-function, @next/next/no-img-element */
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DocumentItem {
  id: string;
  name: string;
  mimeType: string;
  fileUrl: string;
  computed: {
    isImage: boolean;
    isPDF: boolean;
    fileSizeFormatted: string;
  };
}

interface PreviewModalProps {
  document: DocumentItem | null;
  open: boolean;
  onClose: () => void;
}

export function PreviewModal({ document, open, onClose }: PreviewModalProps) {
  if (!document) return null;

  const isPreviewable = document.computed.isImage ||
    document.computed.isPDF ||
    document.mimeType.startsWith('video/');

  const handleDownload = () => {
    window.open(document.fileUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{document.name}</span>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              הורדה
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-[400px] flex items-center justify-center bg-muted/30 rounded-lg">
          {document.computed.isImage && (
            <img
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}
          {document.computed.isPDF && (
            <iframe
              src={document.fileUrl}
              title={document.name}
              className="w-full h-[70vh] border-0"
            />
          )}
          {document.mimeType.startsWith('video/') && (
            <video
              src={document.fileUrl}
              controls
              className="max-w-full max-h-[70vh]"
            />
          )}
          {!isPreviewable && (
            <div className="text-center p-8">
              <span className="text-6xl block mb-4">📎</span>
              <p className="text-muted-foreground mb-2">לא ניתן להציג תצוגה מקדימה לקובץ זה</p>
              <p className="text-sm text-muted-foreground">{document.computed.fileSizeFormatted}</p>
              <Button onClick={handleDownload} className="mt-4">
                הורד את הקובץ
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
