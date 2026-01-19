'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, CurrencyCell, NumberCell, TextareaCell, ConfigSelectCell } from '@/components/data-table/cells';
import { currencyOptions, type ProductTableItem } from './products-columns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface ProductTableRowProps {
  product: ProductTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ProductTableRow({ product, onUpdate, onClick, onDelete }: ProductTableRowProps) {
  const { data: suppliers } = trpc.suppliers.list.useQuery({ pageSize: 100 });
  const supplierOptions = (suppliers?.items || []).map((s) => ({ value: s.id, label: s.name }));

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <NameCell product={product} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={100}><TextCell value={product.sku} onSave={(v) => onUpdate('sku', v)} placeholder="מק״ט" dir="ltr" /></Cell>
      <Cell width={120}><ConfigSelectCell value={product.categoryId} onSave={(v) => onUpdate('categoryId', v)} entityType="product_category" placeholder="קטגוריה" /></Cell>
      <Cell width={150}><SelectCell value={product.supplierId} onSave={(v) => onUpdate('supplierId', v)} options={supplierOptions} placeholder="ספק" /></Cell>
      <Cell width={100}><CurrencyCell value={product.costPrice} onSave={(v) => onUpdate('costPrice', v)} placeholder="עלות" /></Cell>
      <Cell width={100}><CurrencyCell value={product.retailPrice} onSave={(v) => onUpdate('retailPrice', v)} placeholder="מחירון" /></Cell>
      <Cell width={80}><SelectCell value={product.currency} onSave={(v) => onUpdate('currency', v)} options={currencyOptions} placeholder="מטבע" /></Cell>
      <Cell width={80}><NumberCell value={product.leadTimeDays} onSave={(v) => onUpdate('leadTimeDays', v)} placeholder="ימים" /></Cell>
      <Cell width={60}><TextareaCell value={product.description} onSave={(v) => onUpdate('description', v)} placeholder="תיאור..." /></Cell>
      <ActionsCell onDelete={onDelete} productId={product.id} />
    </tr>
  );
}

function NameCell({ product, onUpdate, onClick }: { product: ProductTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 200 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={product.name} onSave={(v) => onUpdate('name', v)} placeholder="שם מוצר" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, productId }: { onDelete?: () => void; productId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/products/${productId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
