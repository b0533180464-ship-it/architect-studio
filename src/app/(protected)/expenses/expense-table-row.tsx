'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, DateCell, CurrencyCell, NumberCell, CheckboxCell, ConfigSelectCell } from '@/components/data-table/cells';
import { statusOptions, type ExpenseTableItem } from './expenses-columns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface ExpenseTableRowProps {
  expense: ExpenseTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ExpenseTableRow({ expense, onUpdate, onClick, onDelete }: ExpenseTableRowProps) {
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: suppliers } = trpc.suppliers.list.useQuery({ pageSize: 100 });
  const projectOptions = (projects?.items || []).map((p) => ({ value: p.id, label: p.name }));
  const supplierOptions = (suppliers?.items || []).map((s) => ({ value: s.id, label: s.name }));

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <DescriptionCell expense={expense} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={150}><SelectCell value={expense.projectId} onSave={(v) => onUpdate('projectId', v)} options={projectOptions} placeholder="פרויקט" /></Cell>
      <Cell width={150}><SelectCell value={expense.supplierId} onSave={(v) => onUpdate('supplierId', v)} options={supplierOptions} placeholder="ספק" /></Cell>
      <Cell width={100}><CurrencyCell value={expense.amount} onSave={(v) => onUpdate('amount', v)} placeholder="סכום" /></Cell>
      <Cell width={100}><SelectCell value={expense.status} onSave={(v) => onUpdate('status', v)} options={statusOptions} placeholder="סטטוס" /></Cell>
      <Cell width={120}><DateCell value={expense.date} onSave={(v) => onUpdate('date', v)} placeholder="תאריך" /></Cell>
      <Cell width={80}><CheckboxCell value={expense.isBillable} onSave={(v) => onUpdate('isBillable', v)} /></Cell>
      <Cell width={80}><NumberCell value={expense.markupPercent} onSave={(v) => onUpdate('markupPercent', v)} placeholder="%" /></Cell>
      <Cell width={100}><TextCell value={expense.invoiceNumber} onSave={(v) => onUpdate('invoiceNumber', v)} placeholder="מס' חשבונית" dir="ltr" /></Cell>
      <Cell width={120}><ConfigSelectCell value={expense.categoryId} onSave={(v) => onUpdate('categoryId', v)} entityType="expense_category" placeholder="קטגוריה" /></Cell>
      <ActionsCell onDelete={onDelete} expenseId={expense.id} />
    </tr>
  );
}

function DescriptionCell({ expense, onUpdate, onClick }: { expense: ExpenseTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 200 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={expense.description} onSave={(v) => onUpdate('description', v)} placeholder="תיאור הוצאה" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, expenseId }: { onDelete?: () => void; expenseId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/expenses/${expenseId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
