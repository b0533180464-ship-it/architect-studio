'use client';

import { TwoFactorSetup } from './security/two-factor-setup';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">אבטחה</h2>
        <p className="text-sm text-muted-foreground">הגדרות אבטחה ואימות דו-שלבי</p>
      </div>
      <TwoFactorSetup />
    </div>
  );
}
