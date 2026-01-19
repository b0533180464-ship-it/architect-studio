/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2, Send, Copy } from 'lucide-react';

const statusLabels: Record<string, string> = {
  draft: 'טיוטה', sent: 'נשלחה', viewed: 'נצפתה',
  approved: 'אושרה', rejected: 'נדחתה', expired: 'פג תוקף', revised: 'עודכנה',
};

const statusColors: Record<string, string> = {
  draft: 'secondary', sent: 'default', viewed: 'default',
  approved: 'success', rejected: 'destructive', expired: 'secondary', revised: 'default',
};

export function ProposalDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: proposal, isLoading } = trpc.proposals.getById.useQuery({ id });

  const sendMutation = trpc.proposals.send.useMutation({
    onSuccess: () => { utils.proposals.invalidate(); },
  });

  const deleteMutation = trpc.proposals.delete.useMutation({
    onSuccess: () => { router.push('/proposals'); },
  });

  const duplicateMutation = trpc.proposals.duplicate.useMutation({
    onSuccess: (data) => { router.push(`/proposals/${data.id}`); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!proposal) return <div className="text-center py-8 text-muted-foreground">הצעה לא נמצאה</div>;

  const handleSend = () => {
    if (confirm('האם לשלוח את ההצעה ללקוח?')) {
      sendMutation.mutate({ id });
    }
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק הצעה זו?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate({ id });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/proposals"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">{proposal.title}</h1>
            <div className="text-sm text-muted-foreground">{proposal.proposalNumber} • גרסה {proposal.version}</div>
          </div>
          <Badge variant={statusColors[proposal.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>
            {statusLabels[proposal.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
            <Copy className="h-4 w-4 ml-1" />שכפל
          </Button>
          {proposal.status === 'draft' && (
            <>
              <Button onClick={handleSend} disabled={sendMutation.isPending}><Send className="h-4 w-4 ml-1" />שלח</Button>
              <Button variant="outline" onClick={() => router.push(`/proposals/${id}/edit`)}>עריכה</Button>
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">לקוח</div><div className="font-medium">{proposal.client.name}</div></div>
            {proposal.project && <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{proposal.project.name}</div></div>}
            <div><div className="text-sm text-muted-foreground">תאריך יצירה</div><div className="font-medium">{formatDate(proposal.createdAt)}</div></div>
            {proposal.validUntil && <div><div className="text-sm text-muted-foreground">בתוקף עד</div><div className="font-medium">{formatDate(proposal.validUntil)}</div></div>}
            {proposal.sentAt && <div><div className="text-sm text-muted-foreground">נשלח</div><div className="font-medium">{formatDate(proposal.sentAt)}</div></div>}
            {proposal.viewedAt && <div><div className="text-sm text-muted-foreground">נצפה</div><div className="font-medium">{formatDate(proposal.viewedAt)} ({proposal.viewCount} צפיות)</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>סכומים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">סכום ביניים</div><div className="text-xl font-medium">{formatCurrency(proposal.subtotal)}</div></div>
            {proposal.discountAmount && proposal.discountAmount > 0 && (
              <div><div className="text-sm text-muted-foreground">הנחה {proposal.discountType === 'percent' ? `(${proposal.discountAmount}%)` : ''}</div>
                <div className="text-xl font-medium text-red-600">-{formatCurrency(proposal.discountType === 'percent' ? proposal.subtotal * proposal.discountAmount / 100 : proposal.discountAmount)}</div>
              </div>
            )}
            <div><div className="text-sm text-muted-foreground">מע&quot;מ ({proposal.vatRate}%)</div><div className="text-xl font-medium">{formatCurrency(proposal.vatAmount)}</div></div>
            <div className="pt-2 border-t"><div className="text-sm text-muted-foreground">סה&quot;כ לתשלום</div><div className="text-2xl font-bold">{formatCurrency(proposal.total)}</div></div>
          </CardContent>
        </Card>
      </div>

      {proposal.introduction && (
        <Card className="mt-6">
          <CardHeader><CardTitle>מבוא</CardTitle></CardHeader>
          <CardContent><div className="whitespace-pre-wrap">{proposal.introduction}</div></CardContent>
        </Card>
      )}

      {proposal.scope && (
        <Card className="mt-6">
          <CardHeader><CardTitle>היקף העבודה</CardTitle></CardHeader>
          <CardContent><div className="whitespace-pre-wrap">{proposal.scope}</div></CardContent>
        </Card>
      )}

      {proposal.items && proposal.items.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>פריטים</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {proposal.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{formatCurrency(item.total)}</div>
                    <div className="text-sm text-muted-foreground">{item.quantity} × {formatCurrency(item.unitPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
