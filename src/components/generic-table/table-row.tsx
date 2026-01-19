'use client';

import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditableCell } from './editable-cell';
import type { GenericColumn, BaseColumnDef } from './types';

interface TableRowProps<T extends { id: string }> {
  item: T;
  columns: GenericColumn[];
  baseColumns: BaseColumnDef<T>[];
  customFieldValues?: Map<string, Record<string, unknown>>;
  onRowClick?: (item: T) => void;
  onCellUpdate?: (id: string, key: string, value: unknown, isCustomField: boolean) => void;
  detailUrl?: string | null;
  onDelete?: (id: string) => void;
}

export function GenericTableRow<T extends { id: string }>({
  item,
  columns,
  baseColumns,
  customFieldValues,
  onRowClick,
  onCellUpdate,
  detailUrl,
  onDelete,
}: TableRowProps<T>) {
  const getCellValue = (column: GenericColumn) => {
    if (column.isCustomField && customFieldValues) {
      return customFieldValues.get(item.id)?.[column.key] ?? null;
    }
    return (item as Record<string, unknown>)[column.key] ?? null;
  };

  const handleCellUpdate = (key: string, value: unknown, isCustomField: boolean) => {
    onCellUpdate?.(item.id, key, value, isCustomField);
  };

  return (
    <tr className="border-t hover:bg-muted/30 transition-colors group">
      {columns.map((column, colIndex) => {
        const baseCol = baseColumns.find((b) => b.key === column.key);
        const isSticky = baseCol?.sticky;
        const isFirstColumn = colIndex === 0;

        const cellDisabled = !onCellUpdate;

        return (
          <td
            key={column.key}
            style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
            className={cn(
              'py-1 px-2 border-l border-border/50',
              isSticky && 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_rgba(0,0,0,0.05)]',
              isFirstColumn && onRowClick && 'cursor-pointer'
            )}
            onClick={isFirstColumn && onRowClick ? () => onRowClick(item) : undefined}
          >
            <EditableCell
              type={column.fieldType || 'text'}
              value={getCellValue(column)}
              options={column.options}
              onSave={(value) => handleCellUpdate(column.key, value, column.isCustomField)}
              placeholder={column.label}
              disabled={cellDisabled}
            />
          </td>
        );
      })}
      {/* Add column placeholder */}
      <td className="w-10 border-l border-border/50" />
      {/* Action menu */}
      <td className="py-1 px-1 w-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {detailUrl && (
              <DropdownMenuItem asChild>
                <a href={detailUrl}>פתח בדף מלא</a>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive"
              >
                מחק
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
