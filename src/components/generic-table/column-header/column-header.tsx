'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, MoreHorizontal, Pencil, EyeOff, Trash2, GripVertical, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EditLabelDialog, EditOptionsDialog, DeleteColumnDialog, EditRelationSettingsDialog } from './column-dialogs';
import type { GenericColumnHeaderProps, SelectOption } from './types';
import type { RelationType } from '@/server/routers/relations/schemas';
import { Link2 } from 'lucide-react';

export function GenericColumnHeader({
  column,
  sortBy,
  sortOrder,
  entityTypes = [],
  onSort,
  onResize,
  onEdit,
  onEditOptions,
  onEditRelation,
  onHide,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
}: GenericColumnHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditOptionsOpen, setIsEditOptionsOpen] = useState(false);
  const [isEditRelationOpen, setIsEditRelationOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editLabel, setEditLabel] = useState(column.label);
  const [editOptions, setEditOptions] = useState<SelectOption[]>([]);
  const [editTargetEntities, setEditTargetEntities] = useState<string[]>([]);
  const [editRelationType, setEditRelationType] = useState<RelationType>('many_to_many');
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const isSorted = sortBy === column.key;
  const canSort = column.sortable !== false && !column.isRelation;
  const isRelation = column.isRelation || column.fieldType === 'relation';
  const canEdit = (column.isCustomField || isRelation) && column.editable !== false;
  const canHide = column.hideable !== false;
  const canDelete = (column.isCustomField || isRelation) && column.deletable !== false;
  const isSelectType = column.fieldType === 'select' || column.fieldType === 'multiselect';
  const canEditOptions = column.isCustomField && isSelectType;
  const canEditRelation = isRelation && column.relationDef && entityTypes.length > 0;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startWidth: column.width };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = resizeRef.current.startX - moveEvent.clientX; // RTL
      const newWidth = Math.max(50, resizeRef.current.startWidth + diff);
      onResize?.(column.key, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [column.key, column.width, onResize]);

  const handleEditSubmit = () => {
    if (editLabel.trim() && editLabel !== column.label) {
      onEdit?.(column.key, editLabel.trim());
    }
    setIsEditOpen(false);
  };

  const handleEditOptionsOpen = () => {
    const currentOptions = (column.options || []).map((opt) => ({
      value: opt.value,
      label: opt.label,
      color: opt.color || '#3b82f6',
    }));
    setEditOptions(currentOptions);
    setIsEditOptionsOpen(true);
  };

  const handleEditOptionsSubmit = () => {
    onEditOptions?.(column.key, editOptions);
    setIsEditOptionsOpen(false);
  };

  const handleEditRelationOpen = () => {
    if (column.relationDef) {
      const slugs = column.relationDef.targetEntityTypes.map((t) => t.replace('generic:', ''));
      setEditTargetEntities(slugs);
      setEditRelationType(column.relationDef.relationType);
      setIsEditRelationOpen(true);
    }
  };

  const handleEditRelationSubmit = () => {
    if (column.relationDef && editTargetEntities.length > 0) {
      onEditRelation?.(column.relationDef.relationDefId, {
        targetEntityTypes: editTargetEntities.map((s) => `generic:${s}`),
        relationType: editRelationType,
      });
    }
    setIsEditRelationOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(column.key);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <th
        style={{ width: `${column.width}px`, minWidth: '50px' }}
        className={cn(
          'relative py-2 px-2 text-right text-sm font-medium text-muted-foreground',
          'border-l border-border/50 bg-muted/30 select-none',
          column.sticky && 'sticky right-0 z-20 bg-muted/50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]',
          isDragging && 'opacity-50',
          isDragOver && 'bg-primary/10',
          isResizing && 'cursor-col-resize'
        )}
        draggable={!isResizing}
        onDragStart={() => onDragStart?.(column.key)}
        onDragOver={(e) => { e.preventDefault(); onDragOver?.(column.key); }}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-center gap-1">
          {/* Drag handle */}
          <GripVertical className="h-3 w-3 text-muted-foreground/50 cursor-grab" />

          {/* Relation icon */}
          {isRelation && <Link2 className="h-3 w-3 text-muted-foreground/70" />}

          {/* Label + Sort */}
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 flex-1 text-right',
              canSort && 'hover:text-foreground cursor-pointer'
            )}
            onClick={() => canSort && onSort?.(column.key)}
            disabled={!canSort}
          >
            <span className="truncate">{column.label}</span>
            {isSorted && (
              sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )
            )}
          </button>

          {/* Actions menu */}
          {(canEdit || canEditOptions || canEditRelation || canHide || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {canEdit && (
                  <DropdownMenuItem onClick={() => { setEditLabel(column.label); setIsEditOpen(true); }}>
                    <Pencil className="h-4 w-4 ml-2" />
                    ערוך שם
                  </DropdownMenuItem>
                )}
                {canEditOptions && (
                  <DropdownMenuItem onClick={handleEditOptionsOpen}>
                    <List className="h-4 w-4 ml-2" />
                    ערוך אפשרויות
                  </DropdownMenuItem>
                )}
                {canEditRelation && (
                  <DropdownMenuItem onClick={handleEditRelationOpen}>
                    <Link2 className="h-4 w-4 ml-2" />
                    ערוך הגדרות קשר
                  </DropdownMenuItem>
                )}
                {canHide && (
                  <DropdownMenuItem onClick={() => onHide?.(column.key)}>
                    <EyeOff className="h-4 w-4 ml-2" />
                    הסתר עמודה
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      מחק עמודה
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Resize handle */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full w-1 cursor-col-resize',
            'hover:bg-primary/50 active:bg-primary',
            isResizing && 'bg-primary'
          )}
          onMouseDown={handleResizeStart}
        />
      </th>

      {/* Dialogs */}
      <EditLabelDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        label={editLabel}
        onLabelChange={setEditLabel}
        onSubmit={handleEditSubmit}
      />

      <EditOptionsDialog
        open={isEditOptionsOpen}
        onOpenChange={setIsEditOptionsOpen}
        columnLabel={column.label}
        options={editOptions}
        onOptionsChange={setEditOptions}
        onSubmit={handleEditOptionsSubmit}
      />

      <DeleteColumnDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        columnLabel={column.label}
        onConfirm={handleDeleteConfirm}
      />

      <EditRelationSettingsDialog
        open={isEditRelationOpen}
        onOpenChange={setIsEditRelationOpen}
        columnLabel={column.label}
        targetEntityTypes={editTargetEntities}
        onTargetChange={setEditTargetEntities}
        relationType={editRelationType}
        onRelationTypeChange={setEditRelationType}
        entityTypes={entityTypes}
        onSubmit={handleEditRelationSubmit}
      />
    </>
  );
}
