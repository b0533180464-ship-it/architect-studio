/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2, Check, Bell } from 'lucide-react';

const statusLabels: Record<string, string> = {
  scheduled: 'מתוכנן', pending: 'ממתין', invoiced: 'הופקה חשבונית',
  partial: 'שולם חלקית', paid: 'שולם', overdue: 'באיחור', cancelled: 'בוטל',
};

const statusColors: Record<string, string> = {
  scheduled: 'secondary', pending: 'default', invoiced: 'default',
  partial: 'default', paid: 'success', overdue: 'destructive', cancelled: 'secondary',
};

const typeLabels: Record<string, string> = {
  retainer: 'מקדמה', milestone: 'אבן דרך', scheduled: 'מתוזמן',
  final: 'סופי', change_order: 'שינויים', hourly: 'לפי שעות', expense: 'הוצאות',
};

export function PaymentDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: payment, isLoading } = trpc.payments.getById.useQuery({ id });

  const markPaidMutation = trpc.payments.markPaid.useMutation({
    onSuccess: () => { utils.payments.invalidate(); },
  });

  const sendReminderMutation = trpc.payments.sendReminder.useMutation({
    onSuccess: () => { utils.payments.invalidate(); },
  });

  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => { router.push('/payments'); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!payment) return <div className="text-center py-8 text-muted-foreground">תשלום לא נמצא</div>;

  const handleMarkPaid = () => {
    if (confirm('האם לסמן כשולם?')) {
      markPaidMutation.mutate({ id, paymentMethod: 'העברה בנקאית' });
    }
  };

  const handleSendReminder = () => {
    if (confirm('האם לשלוח תזכורת?')) {
      sendReminderMutation.mutate({ id });
    }
  };

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק תשלום זה?')) {
      deleteMutation.mutate({ id });
    }
  };

  const remainingAmount = payment.amount - payment.paidAmount;
  const paidPercentage = Math.round((payment.paidAmount / payment.amount) * 100);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/payments"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">{payment.name}</h1>
            <div className="text-sm text-muted-foreground">{typeLabels[payment.paymentType]}</div>
          </div>
          <Badge variant={statusColors[payment.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>
            {statusLabels[payment.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          {payment.status !== 'paid' && payment.status !== 'cancelled' && (
            <>
              <Button onClick={handleMarkPaid} disabled={markPaidMutation.isPending}><Check className="h-4 w-4 ml-1" />סמן כשולם</Button>
              <Button variant="outline" onClick={handleSendReminder} disabled={sendReminderMutation.isPending}>
                <Bell className="h-4 w-4 ml-1" />תזכורת
              </Button>
              <Button variant="outline" onClick={() => router.push(`/payments/${id}/edit`)}>עריכה</Button>
            </>
          )}
          {payment.paidAmount === 0 && (
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{payment.project.name}</div></div>
            <div><div className="text-sm text-muted-foreground">לקוח</div><div className="font-medium">{payment.project.client.name}</div></div>
            {payment.description && <div><div className="text-sm text-muted-foreground">תיאור</div><div className="font-medium">{payment.description}</div></div>}
            {payment.dueDate && <div><div className="text-sm text-muted-foreground">תאריך יעד</div><div className="font-medium">{formatDate(payment.dueDate)}</div></div>}
            {payment.paidDate && <div><div className="text-sm text-muted-foreground">תאריך תשלום</div><div className="font-medium">{formatDate(payment.paidDate)}</div></div>}
            {payment.paymentMethod && <div><div className="text-sm text-muted-foreground">אמצעי תשלום</div><div className="font-medium">{payment.paymentMethod}</div></div>}
            {payment.referenceNumber && <div><div className="text-sm text-muted-foreground">מספר אסמכתא</div><div className="font-medium">{payment.referenceNumber}</div></div>}
            {payment.remindersSent > 0 && <div><div className="text-sm text-muted-foreground">תזכורות נשלחו</div><div className="font-medium">{payment.remindersSent}</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>סכומים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">סכום לתשלום</div><div className="text-2xl font-bold">{formatCurrency(payment.amount)}</div></div>
            <div><div className="text-sm text-muted-foreground">שולם</div><div className="text-xl font-medium text-green-600">{formatCurrency(payment.paidAmount)}</div></div>
            <div><div className="text-sm text-muted-foreground">יתרה</div><div className="text-xl font-medium">{formatCurrency(remainingAmount)}</div></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${paidPercentage}%` }}></div>
            </div>
            <div className="text-sm text-muted-foreground text-center">{paidPercentage}% שולם</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
