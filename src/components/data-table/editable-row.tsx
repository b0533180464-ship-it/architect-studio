'use client';

import { BaseCellWrapper } from './base-cell';
import { CellContent } from './cell-content';
import { RowActions } from './row-actions';
import type { ColumnDef } from './types';

interface EditableRowProps<T extends { id: string }> {
  item: T;
  columns: ColumnDef<T>[];
  onUpdate: (field: keyof T & string, value: unknown) => void;
  onClick?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  detailUrl?: string;
}

/**
 * שורה עם תאים לעריכה
 */
export function EditableRow<T extends { id: string }>(props: EditableRowProps<T>) {
  const { item, columns, onClick, onDelete, onDuplicate, detailUrl } = props;
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      {columns.map((col) => (
        <BaseCellWrapper key={col.key} sticky={col.sticky} width={col.width} onClick={col.sticky && onClick ? onClick : undefined}>
          <CellContent value={item[col.key]} column={col} isNameColumn={col.sticky} />
        </BaseCellWrapper>
      ))}
      <td className="py-2 px-1 w-10">
        <RowActions onDelete={onDelete} onDuplicate={onDuplicate} detailUrl={detailUrl} />
      </td>
    </tr>
  );
}
