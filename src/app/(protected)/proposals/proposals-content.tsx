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
  draft: 'טיוטה', sent: 'נשלחה', viewed: 'נצפתה',
  approved: 'אושרה', rejected: 'נדחתה', expired: 'פג תוקף', revised: 'עודכנה',
};

const statusColors: Record<string, string> = {
  draft: 'secondary', sent: 'default', viewed: 'default',
  approved: 'success', rejected: 'destructive', expired: 'secondary', revised: 'default',
};

type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'revised';

export function ProposalsContent() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProposalStatus | undefined>();

  const { data: stats } = trpc.proposals.getStats.useQuery();
  const { data: proposalsData, isLoading } = trpc.proposals.list.useQuery({
    search: search || undefined, status,
  });

  const proposals = proposalsData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">הצעות מחיר</h1>
        <Link href="/proposals/new"><Button>+ הצעה חדשה</Button></Link>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">סה&quot;כ</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.draft}</div><div className="text-sm text-muted-foreground">טיוטות</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.pending}</div><div className="text-sm text-muted-foreground">ממתינות</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{stats.approved}</div><div className="text-sm text-muted-foreground">אושרו</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(stats.approvedValue)}</div><div className="text-sm text-muted-foreground">ערך מאושר</div></CardContent></Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-2">
              {[undefined, 'draft', 'sent', 'approved', 'rejected'].map((s) => (
                <Button key={s ?? 'all'} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s as ProposalStatus | undefined)}>
                  {s ? statusLabels[s] : 'הכל'}
                </Button>
              ))}
            </div>
            <Input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>רשימת הצעות</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">לא נמצאו הצעות</div>
          ) : (
            <div className="divide-y">
              {proposals.map((p) => (
                <Link key={p.id} href={`/proposals/${p.id}`} className="block py-4 hover:bg-muted/50 -mx-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {p.proposalNumber} • {p.client.name} {p.project && `• ${p.project.name}`}
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={statusColors[p.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>{statusLabels[p.status]}</Badge>
                      <div className="text-sm font-medium mt-1">{formatCurrency(p.total)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</div>
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
