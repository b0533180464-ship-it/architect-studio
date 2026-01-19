/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2, Send, Check } from 'lucide-react';

const statusLabels: Record<string, string> = {
  draft: 'טיוטה', sent: 'נשלח', pending_signature: 'ממתין לחתימה',
  partially_signed: 'חתום חלקית', signed: 'חתום', cancelled: 'בוטל', terminated: 'הסתיים',
};

const statusColors: Record<string, string> = {
  draft: 'secondary', sent: 'default', pending_signature: 'default',
  partially_signed: 'default', signed: 'success', cancelled: 'destructive', terminated: 'secondary',
};

export function ContractDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: contract, isLoading } = trpc.contracts.getById.useQuery({ id });

  const sendMutation = trpc.contracts.sendForSignature.useMutation({
    onSuccess: () => { utils.contracts.invalidate(); },
  });

  const signMutation = trpc.contracts.sign.useMutation({
    onSuccess: () => { utils.contracts.invalidate(); },
  });

  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => { router.push('/contracts'); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!contract) return <div className="text-center py-8 text-muted-foreground">חוזה לא נמצא</div>;

  const handleSend = () => {
    if (confirm('האם לשלוח את החוזה לחתימה?')) {
      sendMutation.mutate({ id });
    }
  };

  const handleSignDesigner = () => {
    if (confirm('האם לחתום כמעצב?')) {
      signMutation.mutate({ id, party: 'designer', name: 'מעצב', email: 'designer@example.com' });
    }
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק חוזה זה?')) {
      deleteMutation.mutate({ id });
    }
  };

  const signatures = (contract.signatures as { party: string; signedAt?: string; name?: string }[]) || [];
  const designerSigned = signatures.find((s) => s.party === 'designer' && s.signedAt);
  const clientSigned = signatures.find((s) => s.party === 'client' && s.signedAt);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/contracts"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">{contract.title}</h1>
            <div className="text-sm text-muted-foreground">{contract.contractNumber}</div>
          </div>
          <Badge variant={statusColors[contract.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>
            {statusLabels[contract.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          {contract.status === 'draft' && (
            <>
              <Button onClick={handleSend} disabled={sendMutation.isPending}><Send className="h-4 w-4 ml-1" />שלח לחתימה</Button>
              <Button variant="outline" onClick={() => router.push(`/contracts/${id}/edit`)}>עריכה</Button>
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {(contract.status === 'sent' || contract.status === 'pending_signature' || contract.status === 'partially_signed') && !designerSigned && (
            <Button onClick={handleSignDesigner} disabled={signMutation.isPending}><Check className="h-4 w-4 ml-1" />חתום כמעצב</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">לקוח</div><div className="font-medium">{contract.client.name}</div></div>
            <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{contract.project.name}</div></div>
            {contract.proposal && <div><div className="text-sm text-muted-foreground">הצעת מחיר</div><div className="font-medium">{contract.proposal.proposalNumber}</div></div>}
            <div><div className="text-sm text-muted-foreground">תאריך התחלה</div><div className="font-medium">{formatDate(contract.startDate)}</div></div>
            {contract.endDate && <div><div className="text-sm text-muted-foreground">תאריך סיום</div><div className="font-medium">{formatDate(contract.endDate)}</div></div>}
            <div><div className="text-sm text-muted-foreground">תאריך יצירה</div><div className="font-medium">{formatDate(contract.createdAt)}</div></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>ערך וחתימות</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">ערך החוזה</div><div className="text-2xl font-bold">{formatCurrency(contract.totalValue)}</div></div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">חתימות</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {designerSigned ? <Check className="h-4 w-4 text-green-600" /> : <div className="h-4 w-4 rounded-full border-2" />}
                  <span className={designerSigned ? 'text-green-600' : 'text-muted-foreground'}>מעצב {designerSigned && `(${designerSigned.name})`}</span>
                </div>
                <div className="flex items-center gap-2">
                  {clientSigned ? <Check className="h-4 w-4 text-green-600" /> : <div className="h-4 w-4 rounded-full border-2" />}
                  <span className={clientSigned ? 'text-green-600' : 'text-muted-foreground'}>לקוח {clientSigned && `(${clientSigned.name})`}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {contract.content && (
        <Card className="mt-6">
          <CardHeader><CardTitle>תוכן החוזה</CardTitle></CardHeader>
          <CardContent><div className="whitespace-pre-wrap">{contract.content}</div></CardContent>
        </Card>
      )}
    </>
  );
}
