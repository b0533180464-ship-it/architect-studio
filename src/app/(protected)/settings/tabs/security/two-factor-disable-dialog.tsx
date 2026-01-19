/* eslint-disable max-lines-per-function */
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

export function TwoFactorDisableDialog({ open, onOpenChange }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const disableMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      utils.twoFactor.getStatus.invalidate();
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleClose = () => {
    setCode('');
    setError('');
    onOpenChange(false);
  };

  const handleDisable = () => {
    setError('');
    disableMutation.mutate({ code });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>ביטול אימות דו-שלבי</DialogTitle>
          <DialogDescription>הזן את הקוד מהאפליקציה לאישור ביטול 2FA</DialogDescription>
        </DialogHeader>

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
            <Button variant="outline" onClick={handleClose}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDisable}
              disabled={code.length !== 6 || disableMutation.isPending}
            >
              {disableMutation.isPending ? 'מבטל...' : 'בטל 2FA'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
