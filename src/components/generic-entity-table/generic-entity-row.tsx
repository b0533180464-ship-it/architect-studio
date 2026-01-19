/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditableCell } from '../generic-table/editable-cell';
import { RelationCell } from './relation-cell';
import type { GenericEntityColumn } from './types';
import type { GenericEntity } from '@prisma/client';
import type { CustomFieldType } from '@/server/routers/customFields/schemas';

interface Props {
  item: GenericEntity;
  columns: GenericEntityColumn[];
  entityTypeSlug: string;
  sourceEntityType: string; // e.g., "generic:products"
  onCellUpdate?: (id: string, fieldKey: string, value: unknown) => void;
  onDelete?: (id: string) => void;
  onAddRelation?: (relationDefId: string, sourceEntityId: string, targetEntityType: string, targetEntityId: string) => void;
  onRemoveRelation?: (relationId: string) => void;
}

export function GenericEntityRow({
  item,
  columns,
  entityTypeSlug,
  sourceEntityType,
  onCellUpdate,
  onDelete,
  onAddRelation,
  onRemoveRelation,
}: Props) {
  const data = item.data as Record<string, unknown>;
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(item.name);

  const getCellValue = (column: GenericEntityColumn): unknown => {
    if (column.key === 'name') return item.name;
    return data[column.key] ?? null;
  };

  const handleCellUpdate = (fieldKey: string, value: unknown) => {
    onCellUpdate?.(item.id, fieldKey, value);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== item.name) {
      onCellUpdate?.(item.id, 'name', editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setEditedName(item.name);
      setIsEditingName(false);
    }
  };

  const renderNameCell = () => {
    if (isEditingName) {
      return (
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={handleNameKeyDown}
          className="h-7 text-sm"
          autoFocus
        />
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Link
          href={`/entities/${entityTypeSlug}/${item.id}`}
          className="text-primary hover:underline font-medium flex-1"
        >
          {item.name}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditingName(true)}>
              <Pencil className="h-4 w-4 ml-2" />
              עריכת שם
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                מחק
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderCell = (column: GenericEntityColumn) => {
    // Handle name column - render as link with actions menu
    if (column.key === 'name') {
      return renderNameCell();
    }

    // Handle relation columns
    if (column.isRelation || column.fieldType === 'relation') {
      const relationDef = column.relationDef;
      if (!relationDef) return null;

      return (
        <RelationCell
          relationDefId={relationDef.relationDefId}
          relationName={relationDef.name}
          sourceEntityType={sourceEntityType}
          targetEntityTypes={relationDef.targetEntityTypes}
          sourceEntityId={item.id}
          onAdd={(targetType, targetId) => onAddRelation?.(relationDef.relationDefId, item.id, targetType, targetId)}
          onRemove={(relationId) => onRemoveRelation?.(relationId)}
          disabled={!onAddRelation}
        />
      );
    }

    // Handle regular columns
    return (
      <EditableCell
        value={getCellValue(column)}
        type={column.fieldType as CustomFieldType}
        options={column.options}
        onSave={(value) => handleCellUpdate(column.key, value)}
        disabled={!column.editable}
      />
    );
  };

  return (
    <tr className="group border-t hover:bg-muted/30 transition-colors">
      {columns.map((column) => (
        <td
          key={column.key}
          className="py-1 px-2 border-l border-border/30"
          style={{ width: column.width, minWidth: column.width }}
        >
          {renderCell(column)}
        </td>
      ))}
      {/* Spacer for add-column button */}
      <td className="py-1 px-0 w-10 border-l border-border/30" />
    </tr>
  );
}
