/* eslint-disable max-lines-per-function */
'use client';

import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupCodesDialog({ open, onOpenChange }: Props) {
  const generateMutation = trpc.twoFactor.generateBackupCodes.useMutation();

  const handleGenerateNew = () => {
    generateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>קודי גיבוי</DialogTitle>
          <DialogDescription>השתמש בקודים אלה להתחברות אם אין לך גישה לאפליקציית Authenticator</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {generateMutation.data ? (
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {generateMutation.data.backupCodes.map((code, i) => (
                  <code key={i} className="bg-background px-2 py-1 rounded text-sm text-center">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="mb-4">ליצור קודי גיבוי חדשים?</p>
              <p className="text-xs">הקודים הקודמים יבוטלו.</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">שמור קודים אלה במקום בטוח. כל קוד ניתן לשימוש פעם אחת בלבד.</p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              סגור
            </Button>
            <Button className="flex-1" onClick={handleGenerateNew} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'מייצר...' : 'יצירת קודים חדשים'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
