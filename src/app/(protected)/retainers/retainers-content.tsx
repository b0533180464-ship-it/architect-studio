/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'ממתין', received: 'התקבל', partially_applied: 'יושם חלקית',
  fully_applied: 'יושם במלואו', refunded: 'הוחזר',
};

const statusColors: Record<string, string> = {
  pending: 'secondary', received: 'success', partially_applied: 'default',
  fully_applied: 'default', refunded: 'destructive',
};

const typeLabels: Record<string, string> = {
  project_retainer: 'מקדמת פרויקט', general_retainer: 'מקדמה כללית',
  deposit: 'פיקדון', trust_account: 'חשבון נאמנות',
};

type RetainerStatus = 'pending' | 'received' | 'partially_applied' | 'fully_applied' | 'refunded';

export function RetainersContent() {
  const [status, setStatus] = useState<RetainerStatus | undefined>();

  const { data: stats } = trpc.retainers.getStats.useQuery();
  const { data: retainersData, isLoading } = trpc.retainers.list.useQuery({ status });

  const retainers = retainersData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">מקדמות</h1>
        <Link href="/retainers/new"><Button>+ מקדמה חדשה</Button></Link>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">סה&quot;כ</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div><div className="text-sm text-muted-foreground">סכום כולל</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{formatCurrency(stats.availableAmount)}</div><div className="text-sm text-muted-foreground">זמין לשימוש</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(stats.appliedAmount)}</div><div className="text-sm text-muted-foreground">שומש</div></CardContent></Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            {[undefined, 'pending', 'received', 'partially_applied', 'fully_applied'].map((s) => (
              <Button key={s ?? 'all'} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s as RetainerStatus | undefined)}>
                {s ? statusLabels[s] : 'הכל'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>רשימת מקדמות</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : retainers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">לא נמצאו מקדמות</div>
          ) : (
            <div className="divide-y">
              {retainers.map((r) => (
                <Link key={r.id} href={`/retainers/${r.id}`} className="block py-4 hover:bg-muted/50 -mx-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {typeLabels[r.type]} {r.project && `• ${r.project.name}`}
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={statusColors[r.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>{statusLabels[r.status]}</Badge>
                      <div className="text-sm font-medium mt-1">{formatCurrency(r.amount)}</div>
                      <div className="text-xs text-muted-foreground">יתרה: {formatCurrency(r.amountRemaining)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
