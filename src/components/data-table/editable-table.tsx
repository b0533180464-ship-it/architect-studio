'use client';

import { TableHeader } from './column-header';
import { EditableRow } from './editable-row';
import { TableSkeleton, TableEmptyState } from './table-states';
import type { ColumnDef } from './types';

interface EditableTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate: (id: string, field: keyof T & string, value: unknown) => void;
  onRowClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  getDetailUrl?: (id: string) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * טבלה עם עריכה inline
 */
export function EditableTable<T extends { id: string }>(props: EditableTableProps<T>) {
  const { data, columns, onUpdate, onRowClick, onDelete, onDuplicate, getDetailUrl, isLoading, emptyMessage = 'אין נתונים להצגה' } = props;
  if (isLoading) return <TableSkeleton columns={columns.length} />;
  if (data.length === 0) return <TableEmptyState message={emptyMessage} />;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse" dir="rtl">
        <TableHeader columns={columns} />
        <TableBody data={data} columns={columns} onUpdate={onUpdate} onRowClick={onRowClick} onDelete={onDelete} onDuplicate={onDuplicate} getDetailUrl={getDetailUrl} />
      </table>
    </div>
  );
}

interface TableBodyProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate: (id: string, field: keyof T & string, value: unknown) => void;
  onRowClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  getDetailUrl?: (id: string) => string;
}

function TableBody<T extends { id: string }>(props: TableBodyProps<T>) {
  const { data, columns, onUpdate, onRowClick, onDelete, onDuplicate, getDetailUrl } = props;
  return (
    <tbody>
      {data.map((item) => (
        <EditableRow
          key={item.id}
          item={item}
          columns={columns}
          onUpdate={(field, value) => onUpdate(item.id, field, value)}
          onClick={onRowClick ? () => onRowClick(item.id) : undefined}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
          onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
          detailUrl={getDetailUrl ? getDetailUrl(item.id) : undefined}
        />
      ))}
    </tbody>
  );
}
