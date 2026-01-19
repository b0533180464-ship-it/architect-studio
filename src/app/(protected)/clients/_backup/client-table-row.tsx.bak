'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, TextareaCell } from '@/components/data-table/cells';
import { typeOptions, statusOptions, communicationOptions, type ClientTableItem } from './clients-columns';
import { cn } from '@/lib/utils';

interface ClientTableRowProps {
  client: ClientTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ClientTableRow({ client, onUpdate, onClick, onDelete }: ClientTableRowProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <NameCell client={client} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={100}><SelectCell value={client.type} onSave={(v) => onUpdate('type', v)} options={typeOptions} placeholder="סוג" /></Cell>
      <Cell width={100}><SelectCell value={client.status} onSave={(v) => onUpdate('status', v)} options={statusOptions} placeholder="סטטוס" /></Cell>
      <Cell width={180}><TextCell value={client.email} onSave={(v) => onUpdate('email', v)} placeholder="אימייל" dir="ltr" /></Cell>
      <Cell width={120}><TextCell value={client.phone} onSave={(v) => onUpdate('phone', v)} placeholder="טלפון" dir="ltr" /></Cell>
      <Cell width={120}><TextCell value={client.mobile} onSave={(v) => onUpdate('mobile', v)} placeholder="נייד" dir="ltr" /></Cell>
      <Cell width={120}><SelectCell value={client.preferredCommunication} onSave={(v) => onUpdate('preferredCommunication', v)} options={communicationOptions} placeholder="תקשורת" /></Cell>
      <Cell width={150}><TextCell value={client.address} onSave={(v) => onUpdate('address', v)} placeholder="כתובת" /></Cell>
      <Cell width={100}><TextCell value={client.city} onSave={(v) => onUpdate('city', v)} placeholder="עיר" /></Cell>
      <Cell width={100}><TextCell value={client.companyNumber} onSave={(v) => onUpdate('companyNumber', v)} placeholder="ח.פ/ע.מ" dir="ltr" /></Cell>
      <Cell width={150}><TextCell value={client.contactPerson} onSave={(v) => onUpdate('contactPerson', v)} placeholder="איש קשר" /></Cell>
      <Cell width={60}><TextareaCell value={client.notes} onSave={(v) => onUpdate('notes', v)} placeholder="הערות..." /></Cell>
      <ActionsCell onDelete={onDelete} clientId={client.id} />
    </tr>
  );
}

function NameCell({ client, onUpdate, onClick }: { client: ClientTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 180 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={client.name} onSave={(v) => onUpdate('name', v)} placeholder="שם לקוח" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, clientId }: { onDelete?: () => void; clientId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/clients/${clientId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
