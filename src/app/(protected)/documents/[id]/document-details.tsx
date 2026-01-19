/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentDetailsProps {
  documentId: string;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const utils = trpc.useUtils();

  const { data: document, isLoading } = trpc.documents.getById.useQuery({ id: documentId });

  const toggleSharingMutation = trpc.documents.toggleSharing.useMutation({
    onSuccess: () => {
      utils.documents.getById.invalidate({ id: documentId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">מסמך לא נמצא</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">פרטי מסמך</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toggleSharingMutation.mutate({
              id: documentId,
              isSharedWithClient: !document.isSharedWithClient,
            })}
            disabled={toggleSharingMutation.isPending}
          >
            {document.isSharedWithClient ? 'בטל שיתוף' : 'שתף עם לקוח'}
          </Button>
          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button>הורדה</Button>
          </a>
        </div>
      </div>

      <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{document.name}</CardTitle>
              <div className="flex gap-2">
                {document.isSharedWithClient && (
                  <Badge variant="secondary">משותף ללקוח</Badge>
                )}
                <Badge variant="outline">v{document.version}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-1">גודל קובץ</h3>
                <p className="text-muted-foreground">{document.computed.fileSizeFormatted}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">סוג קובץ</h3>
                <p className="text-muted-foreground">{document.mimeType}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">תאריך העלאה</h3>
                <p className="text-muted-foreground">{formatDate(document.createdAt)}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">הועלה על ידי</h3>
                <p className="text-muted-foreground">{document.computed.uploaderName}</p>
              </div>

              {document.project && (
                <div>
                  <h3 className="font-medium mb-1">פרויקט</h3>
                  <p className="text-muted-foreground">{document.project.name}</p>
                </div>
              )}
            </div>

            {/* Version History */}
            {document.versions && document.versions.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">היסטוריית גרסאות</h3>
                <div className="space-y-2">
                  {document.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">גרסה {version.version}</span>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(version.createdAt)} - {version.uploadedBy.firstName} {version.uploadedBy.lastName}
                        </p>
                      </div>
                      <a href={version.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">הורדה</Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview for images */}
            {document.computed.isImage && (
              <div>
                <h3 className="font-medium mb-3">תצוגה מקדימה</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={document.fileUrl}
                  alt={document.name}
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}

            {/* Preview for PDFs */}
            {document.computed.isPDF && (
              <div>
                <h3 className="font-medium mb-3">תצוגה מקדימה</h3>
                <iframe
                  src={document.fileUrl}
                  className="w-full h-[600px] rounded-lg border"
                  title={document.name}
                />
              </div>
            )}
          </CardContent>
        </Card>
    </>
  );
}
