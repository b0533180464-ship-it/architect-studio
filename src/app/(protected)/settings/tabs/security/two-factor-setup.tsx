/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TwoFactorSetupDialog } from './two-factor-setup-dialog';
import { TwoFactorDisableDialog } from './two-factor-disable-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';

export function TwoFactorSetup() {
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const { data: status, isLoading } = trpc.twoFactor.getStatus.useQuery();
  const utils = trpc.useUtils();

  const regenerateMutation = trpc.twoFactor.generateBackupCodes.useMutation({
    onSuccess: () => {
      utils.twoFactor.getStatus.invalidate();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse text-muted-foreground text-center">טוען...</div>
        </CardContent>
      </Card>
    );
  }

  const isEnabled = status?.isEnabled ?? false;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">אימות דו-שלבי (2FA)</CardTitle>
              <CardDescription>הגן על החשבון שלך עם שכבת אבטחה נוספת</CardDescription>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>{isEnabled ? 'מופעל' : 'לא מופעל'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEnabled ? (
            <>
              <p className="text-sm text-muted-foreground">
                אימות דו-שלבי מופעל מאז{' '}
                {status?.enabledAt ? new Date(status.enabledAt).toLocaleDateString('he-IL') : ''}.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                  צפה בקודי גיבוי
                </Button>
                <Button
                  variant="outline"
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? 'מייצר...' : 'יצירת קודים חדשים'}
                </Button>
                <Button variant="destructive" onClick={() => setShowDisable(true)}>
                  ביטול 2FA
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                הפעלת אימות דו-שלבי תדרוש ממך להזין קוד מאפליקציית Authenticator בכל התחברות.
              </p>
              <Button onClick={() => setShowSetup(true)}>הפעל אימות דו-שלבי</Button>
            </>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetupDialog open={showSetup} onOpenChange={setShowSetup} />
      <TwoFactorDisableDialog open={showDisable} onOpenChange={setShowDisable} />
      <BackupCodesDialog open={showBackupCodes} onOpenChange={setShowBackupCodes} />
    </>
  );
}
