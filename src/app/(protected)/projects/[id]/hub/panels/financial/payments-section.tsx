/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface PaymentsSectionProps {
  projectId: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  invoiced: 'bg-blue-100 text-blue-700',
  partial: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  scheduled: 'מתוכנן',
  pending: 'ממתין',
  invoiced: 'חשבונית',
  partial: 'חלקי',
  paid: 'שולם',
  overdue: 'באיחור',
  cancelled: 'בוטל',
};

export function PaymentsSection({ projectId }: PaymentsSectionProps) {
  const { data } = trpc.payments.list.useQuery({ projectId, pageSize: 5 });

  const payments = data?.items || [];
  const total = data?.pagination.total || 0;

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">תשלומים ({total})</h4>
        <Link href={`/payments/new?projectId=${projectId}`}>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Plus className="h-4 w-4 ml-1" />
            חדש
          </Button>
        </Link>
      </div>

      {total > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <span>סה״כ: {formatCurrency(totalAmount)}</span>
          <span>שולם: {formatCurrency(paidAmount)}</span>
          <span>יתרה: {formatCurrency(totalAmount - paidAmount)}</span>
        </div>
      )}

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">אין תשלומים</p>
      ) : (
        <div className="space-y-1">
          {payments.map((payment) => (
            <Link key={payment.id} href={`/payments/${payment.id}`}>
              <div className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm">
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{payment.name}</span>
                  {payment.dueDate && (
                    <span className="text-xs text-muted-foreground">{formatDate(payment.dueDate)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  <Badge className={statusColors[payment.status] || ''}>
                    {statusLabels[payment.status] || payment.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
          {total > 5 && (
            <Link href={`/payments?projectId=${projectId}`}>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                צפה בכל {total} התשלומים
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
