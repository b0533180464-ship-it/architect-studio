/* eslint-disable max-lines-per-function, max-lines, complexity, @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const setupMutation = trpc.twoFactor.setup.useMutation();
  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setStep('backup');
      utils.twoFactor.getStatus.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && step === 'qr') {
      setupMutation.mutate({ method: 'totp' });
    }
    if (!isOpen) {
      setStep('qr');
      setCode('');
      setError('');
      setBackupCodes([]);
    }
    onOpenChange(isOpen);
  };

  const handleVerify = () => {
    setError('');
    verifyMutation.mutate({ code });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הגדרת אימות דו-שלבי</DialogTitle>
          <DialogDescription>
            {step === 'qr' && 'סרוק את קוד ה-QR באפליקציית Authenticator'}
            {step === 'verify' && 'הזן את הקוד מהאפליקציה לאימות'}
            {step === 'backup' && 'שמור את קודי הגיבוי במקום בטוח'}
          </DialogDescription>
        </DialogHeader>

        {step === 'qr' && (
          <div className="space-y-4">
            {setupMutation.isPending ? (
              <div className="text-center py-8 text-muted-foreground">טוען...</div>
            ) : setupMutation.data ? (
              <>
                <div className="flex justify-center">
                  <img src={setupMutation.data.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  <p>או הזן ידנית:</p>
                  <code className="bg-muted px-2 py-1 rounded text-xs break-all">{setupMutation.data.secret}</code>
                </div>
                <Button className="w-full" onClick={() => setStep('verify')}>
                  המשך
                </Button>
              </>
            ) : null}
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>קוד אימות</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('qr')}>
                חזור
              </Button>
              <Button className="flex-1" onClick={handleVerify} disabled={code.length !== 6 || verifyMutation.isPending}>
                {verifyMutation.isPending ? 'מאמת...' : 'אמת והפעל'}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">קודי גיבוי</p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((c, i) => (
                  <code key={i} className="bg-background px-2 py-1 rounded text-sm text-center">
                    {c}
                  </code>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">שמור קודים אלה במקום בטוח. תוכל להשתמש בהם אם תאבד גישה לאפליקציה.</p>
            <Button className="w-full" onClick={() => handleOpen(false)}>
              סיימתי
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
