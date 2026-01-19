/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2 } from 'lucide-react';

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

export function RetainerDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: retainer, isLoading } = trpc.retainers.getById.useQuery({ id });

  const receiveMutation = trpc.retainers.receive.useMutation({
    onSuccess: () => { utils.retainers.invalidate(); },
  });

  const deleteMutation = trpc.retainers.delete.useMutation({
    onSuccess: () => { router.push('/retainers'); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!retainer) return <div className="text-center py-8 text-muted-foreground">מקדמה לא נמצאה</div>;

  const handleReceive = () => {
    if (confirm('האם לסמן את המקדמה כהתקבלה?')) {
      receiveMutation.mutate({ id, paymentMethod: 'העברה בנקאית' });
    }
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק מקדמה זו?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/retainers"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <h1 className="text-2xl font-semibold">פרטי מקדמה</h1>
          <Badge variant={statusColors[retainer.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>{statusLabels[retainer.status]}</Badge>
        </div>
        <div className="flex gap-2">
          {retainer.status === 'pending' && (
            <>
              <Button onClick={handleReceive} disabled={receiveMutation.isPending}>סמן כהתקבל</Button>
              <Link href={`/retainers/${id}/edit`}><Button variant="outline">עריכה</Button></Link>
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">לקוח</div><div className="font-medium">{retainer.client.name}</div></div>
            {retainer.project && <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{retainer.project.name}</div></div>}
            <div><div className="text-sm text-muted-foreground">סוג</div><div className="font-medium">{typeLabels[retainer.type]}</div></div>
            <div><div className="text-sm text-muted-foreground">תאריך יצירה</div><div className="font-medium">{formatDate(retainer.createdAt)}</div></div>
            {retainer.receivedAt && <div><div className="text-sm text-muted-foreground">תאריך קבלה</div><div className="font-medium">{formatDate(retainer.receivedAt)}</div></div>}
            {retainer.paymentMethod && <div><div className="text-sm text-muted-foreground">אמצעי תשלום</div><div className="font-medium">{retainer.paymentMethod}</div></div>}
            {retainer.referenceNumber && <div><div className="text-sm text-muted-foreground">מספר אסמכתא</div><div className="font-medium">{retainer.referenceNumber}</div></div>}
            {retainer.notes && <div><div className="text-sm text-muted-foreground">הערות</div><div className="font-medium">{retainer.notes}</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>סכומים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">סכום מקדמה</div><div className="text-2xl font-bold">{formatCurrency(retainer.amount)}</div></div>
            <div><div className="text-sm text-muted-foreground">שומש</div><div className="text-xl font-medium">{formatCurrency(retainer.amountApplied)}</div></div>
            <div><div className="text-sm text-muted-foreground">יתרה זמינה</div><div className="text-xl font-medium text-green-600">{formatCurrency(retainer.amountRemaining)}</div></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${retainer.amount > 0 ? (retainer.amountApplied / retainer.amount) * 100 : 0}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {retainer.applications && retainer.applications.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>היסטוריית יישומים</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {retainer.applications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{formatCurrency(app.amount)}</div>
                    <div className="text-sm text-muted-foreground">{app.notes || 'ללא הערות'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(app.appliedAt)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
