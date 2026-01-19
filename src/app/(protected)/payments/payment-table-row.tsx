'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, DateCell, TextareaCell, CurrencyCell } from '@/components/data-table/cells';
import { paymentTypeOptions, statusOptions, type PaymentTableItem } from './payments-columns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface PaymentTableRowProps {
  payment: PaymentTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function PaymentTableRow({ payment, onUpdate, onClick, onDelete }: PaymentTableRowProps) {
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const projectOptions = (projects?.items || []).map((p) => ({ value: p.id, label: p.name }));

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <NameCell payment={payment} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={150}><SelectCell value={payment.projectId} onSave={(v) => onUpdate('projectId', v)} options={projectOptions} placeholder="פרויקט" /></Cell>
      <Cell width={120}><SelectCell value={payment.paymentType} onSave={(v) => onUpdate('paymentType', v)} options={paymentTypeOptions} placeholder="סוג" /></Cell>
      <Cell width={100}><CurrencyCell value={payment.amount} onSave={(v) => onUpdate('amount', v)} placeholder="סכום" /></Cell>
      <Cell width={100}><SelectCell value={payment.status} onSave={(v) => onUpdate('status', v)} options={statusOptions} placeholder="סטטוס" /></Cell>
      <Cell width={120}><DateCell value={payment.dueDate} onSave={(v) => onUpdate('dueDate', v)} placeholder="תאריך יעד" /></Cell>
      <Cell width={100}><CurrencyCell value={payment.paidAmount} onSave={(v) => onUpdate('paidAmount', v)} placeholder="שולם" /></Cell>
      <Cell width={120}><DateCell value={payment.paidAt ?? null} onSave={(v) => onUpdate('paidAt', v)} placeholder="תאריך תשלום" /></Cell>
      <Cell width={150}><TextCell value={payment.milestoneDescription} onSave={(v) => onUpdate('milestoneDescription', v)} placeholder="אבן דרך" /></Cell>
      <Cell width={60}><TextareaCell value={payment.description} onSave={(v) => onUpdate('description', v)} placeholder="תיאור..." /></Cell>
      <ActionsCell onDelete={onDelete} paymentId={payment.id} />
    </tr>
  );
}

function NameCell({ payment, onUpdate, onClick }: { payment: PaymentTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 200 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={payment.name} onSave={(v) => onUpdate('name', v)} placeholder="שם תשלום" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, paymentId }: { onDelete?: () => void; paymentId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/payments/${paymentId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
