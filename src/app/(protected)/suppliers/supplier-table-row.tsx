'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, TextareaCell, RatingCell, ConfigSelectCell } from '@/components/data-table/cells';
import type { SupplierTableItem } from './suppliers-columns';
import { cn } from '@/lib/utils';

interface SupplierTableRowProps {
  supplier: SupplierTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function SupplierTableRow({ supplier, onUpdate, onClick, onDelete }: SupplierTableRowProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <NameCell supplier={supplier} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={120}><ConfigSelectCell value={supplier.categoryId} onSave={(v) => onUpdate('categoryId', v)} entityType="supplier_category" placeholder="קטגוריה" /></Cell>
      <Cell width={150}><TextCell value={supplier.contactPerson} onSave={(v) => onUpdate('contactPerson', v)} placeholder="איש קשר" /></Cell>
      <Cell width={180}><TextCell value={supplier.email} onSave={(v) => onUpdate('email', v)} placeholder="אימייל" dir="ltr" /></Cell>
      <Cell width={120}><TextCell value={supplier.phone} onSave={(v) => onUpdate('phone', v)} placeholder="טלפון" dir="ltr" /></Cell>
      <Cell width={100}><TextCell value={supplier.city} onSave={(v) => onUpdate('city', v)} placeholder="עיר" /></Cell>
      <Cell width={100}><RatingCell value={supplier.rating} onSave={(v) => onUpdate('rating', v)} /></Cell>
      <Cell width={60}><TextareaCell value={supplier.notes} onSave={(v) => onUpdate('notes', v)} placeholder="הערות..." /></Cell>
      <ActionsCell onDelete={onDelete} supplierId={supplier.id} />
    </tr>
  );
}

function NameCell({ supplier, onUpdate, onClick }: { supplier: SupplierTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 180 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={supplier.name} onSave={(v) => onUpdate('name', v)} placeholder="שם ספק" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, supplierId }: { onDelete?: () => void; supplierId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/suppliers/${supplierId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
