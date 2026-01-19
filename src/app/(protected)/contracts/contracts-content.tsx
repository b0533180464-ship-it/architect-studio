/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'טיוטה', sent: 'נשלח', pending_signature: 'ממתין לחתימה',
  partially_signed: 'חתום חלקית', signed: 'חתום', cancelled: 'בוטל', terminated: 'הסתיים',
};

const statusColors: Record<string, string> = {
  draft: 'secondary', sent: 'default', pending_signature: 'default',
  partially_signed: 'default', signed: 'success', cancelled: 'destructive', terminated: 'secondary',
};

type ContractStatus = 'draft' | 'sent' | 'pending_signature' | 'partially_signed' | 'signed' | 'cancelled' | 'terminated';

export function ContractsContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContractStatus | undefined>();

  const { data: stats } = trpc.contracts.getStats.useQuery();
  const { data: contractsData, isLoading } = trpc.contracts.list.useQuery({
    search: search || undefined, status,
  });

  const contracts = contractsData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">חוזים</h1>
        <Link href="/contracts/new"><Button>+ חוזה חדש</Button></Link>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">סה&quot;כ</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.draft}</div><div className="text-sm text-muted-foreground">טיוטות</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{stats.signed}</div><div className="text-sm text-muted-foreground">חתומים</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(stats.signedValue)}</div><div className="text-sm text-muted-foreground">ערך חתום</div></CardContent></Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-2">
              {[undefined, 'draft', 'pending_signature', 'signed'].map((s) => (
                <Button key={s ?? 'all'} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s as ContractStatus | undefined)}>
                  {s ? statusLabels[s] : 'הכל'}
                </Button>
              ))}
            </div>
            <Input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>רשימת חוזים</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">לא נמצאו חוזים</div>
          ) : (
            <div className="divide-y">
              {contracts.map((c) => (
                <Link key={c.id} href={`/contracts/${c.id}`} className="block py-4 hover:bg-muted/50 -mx-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.contractNumber} • {c.client.name} • {c.project.name}
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={statusColors[c.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>{statusLabels[c.status]}</Badge>
                      <div className="text-sm font-medium mt-1">{formatCurrency(c.totalValue)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(c.startDate)}</div>
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
