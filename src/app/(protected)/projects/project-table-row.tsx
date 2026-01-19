'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TextCell, SelectCell, ConfigSelectCell, DateCell, TextareaCell, NumberCell, CurrencyCell, CheckboxCell } from '@/components/data-table/cells';
import { priorityOptions, billingTypeOptions, type ProjectTableItem } from './projects-columns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface ProjectTableRowProps {
  project: ProjectTableItem;
  onUpdate: (field: string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ProjectTableRow({ project, onUpdate, onClick, onDelete }: ProjectTableRowProps) {
  const { data: clients } = trpc.clients.list.useQuery({ pageSize: 100 });
  const clientOptions = (clients?.items || []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <NameCell project={project} onUpdate={onUpdate} onClick={onClick} />
      <Cell width={100}><TextCell value={project.code} onSave={(v) => onUpdate('code', v)} placeholder="קוד" /></Cell>
      <Cell width={150}><SelectCell value={project.clientId} onSave={(v) => onUpdate('clientId', v)} options={clientOptions} placeholder="לקוח" /></Cell>
      <Cell width={120}><ConfigSelectCell value={project.typeId} onSave={(v) => onUpdate('typeId', v)} entityType="project_type" placeholder="סוג" allowEmpty /></Cell>
      <Cell width={120}><ConfigSelectCell value={project.statusId} onSave={(v) => onUpdate('statusId', v)} entityType="project_status" placeholder="סטטוס" allowEmpty /></Cell>
      <Cell width={120}><ConfigSelectCell value={project.phaseId} onSave={(v) => onUpdate('phaseId', v)} entityType="project_phase" placeholder="שלב" allowEmpty /></Cell>
      <Cell width={110}><SelectCell value={project.priority} onSave={(v) => onUpdate('priority', v)} options={priorityOptions} placeholder="עדיפות" /></Cell>
      <Cell width={60}><CheckboxCell value={project.isVIP} onSave={(v) => onUpdate('isVIP', v)} /></Cell>
      <Cell width={150}><TextCell value={project.address} onSave={(v) => onUpdate('address', v)} placeholder="כתובת" /></Cell>
      <Cell width={100}><TextCell value={project.city} onSave={(v) => onUpdate('city', v)} placeholder="עיר" /></Cell>
      <Cell width={80}><NumberCell value={project.area} onSave={(v) => onUpdate('area', v)} placeholder="שטח" /></Cell>
      <Cell width={100}><CurrencyCell value={project.budget} onSave={(v) => onUpdate('budget', v)} placeholder="תקציב" /></Cell>
      <Cell width={120}><SelectCell value={project.billingType} onSave={(v) => onUpdate('billingType', v)} options={billingTypeOptions} placeholder="תמחור" /></Cell>
      <Cell width={100}><CurrencyCell value={project.fixedFee} onSave={(v) => onUpdate('fixedFee', v)} placeholder="שכ״ט" /></Cell>
      <Cell width={120}><DateCell value={project.startDate} onSave={(v) => onUpdate('startDate', v)} placeholder="התחלה" /></Cell>
      <Cell width={120}><DateCell value={project.expectedEndDate} onSave={(v) => onUpdate('expectedEndDate', v)} placeholder="יעד" /></Cell>
      <Cell width={60}><TextareaCell value={project.description} onSave={(v) => onUpdate('description', v)} placeholder="תיאור..." /></Cell>
      <Cell width={60}><TextareaCell value={project.scope} onSave={(v) => onUpdate('scope', v)} placeholder="היקף..." /></Cell>
      <ActionsCell onDelete={onDelete} projectId={project.id} />
    </tr>
  );
}

function NameCell({ project, onUpdate, onClick }: { project: ProjectTableItem; onUpdate: (f: string, v: unknown) => void; onClick?: () => void }) {
  return (
    <td className="py-2 px-2 border-l border-border/50 sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ minWidth: 200 }}>
      <div onClick={onClick} className={cn(onClick && 'cursor-pointer')}>
        <TextCell value={project.name} onSave={(v) => onUpdate('name', v)} placeholder="שם פרויקט" required />
      </div>
    </td>
  );
}

function Cell({ children, width }: { children: React.ReactNode; width: number }) {
  return <td className="py-2 px-2 border-l border-border/50" style={{ width }}>{children}</td>;
}

function ActionsCell({ onDelete, projectId }: { onDelete?: () => void; projectId: string }) {
  return (
    <td className="py-2 px-1 w-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild><a href={`/projects/${projectId}`}>פתח בדף מלא</a></DropdownMenuItem>
          {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">מחק</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
