'use client';

import { useState } from 'react';
import {
  Plus,
  ChevronDown,
  Copy,
  Trash2,
  Star,
  StarOff,
  Save,
  Filter,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CreateViewDialog, DuplicateViewDialog, DeleteViewDialog } from './view-dialogs';
import type { ViewBarProps } from './types';

export function ViewBar({
  views,
  currentViewId,
  currentUserId,
  onSelectView,
  onCreateView,
  onDuplicateView,
  onDeleteView,
  onSetDefault,
  onSaveView,
  hasUnsavedChanges,
  activeFiltersCount = 0,
  isLoading,
}: ViewBarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewShared, setNewViewShared] = useState(false);

  const currentView = views.find((v) => v.id === currentViewId);
  const isOwnView = currentView?.userId === currentUserId;

  const handleCreate = () => {
    if (!newViewName.trim()) return;
    onCreateView(newViewName.trim(), newViewShared);
    setCreateDialogOpen(false);
    setNewViewName('');
    setNewViewShared(false);
  };

  const handleDuplicate = () => {
    if (!newViewName.trim() || !currentViewId) return;
    onDuplicateView(currentViewId, newViewName.trim());
    setDuplicateDialogOpen(false);
    setNewViewName('');
  };

  const handleDelete = () => {
    if (!currentViewId) return;
    onDeleteView(currentViewId);
    setDeleteDialogOpen(false);
  };

  const openDuplicateDialog = () => {
    setNewViewName(currentView ? `${currentView.name} - עותק` : '');
    setDuplicateDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        {/* View tabs */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {/* Default/All view */}
          <Button
            variant={currentViewId === null ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSelectView(null)}
            className="shrink-0"
          >
            כל הנתונים
          </Button>

          {/* Saved views */}
          {views.map((view) => (
            <Button
              key={view.id}
              variant={currentViewId === view.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSelectView(view.id)}
              className={cn(
                'shrink-0 gap-1',
                view.isDefault && 'font-semibold'
              )}
            >
              {view.isDefault && <Star className="h-3 w-3 fill-current" />}
              {view.name}
              {view.isShared && view.userId !== currentUserId && (
                <span className="text-xs text-muted-foreground">
                  ({view.user?.firstName || 'משותף'})
                </span>
              )}
            </Button>
          ))}

          {/* Create new view */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Active filters indicator */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{activeFiltersCount} פילטרים</span>
          </div>
        )}

        {/* Current view actions */}
        {currentViewId && (
          <div className="flex items-center gap-1">
            {/* Save button (if changes and own view) */}
            {hasUnsavedChanges && isOwnView && onSaveView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveView}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 ml-1" />
                שמור
              </Button>
            )}

            {/* View menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings2 className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 mr-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnView ? (
                  <>
                    <DropdownMenuItem onClick={() => onSetDefault(currentView?.isDefault ? null : currentViewId)}>
                      {currentView?.isDefault ? (
                        <>
                          <StarOff className="h-4 w-4 ml-2" />
                          הסר כברירת מחדל
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 ml-2" />
                          הגדר כברירת מחדל
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openDuplicateDialog}>
                      <Copy className="h-4 w-4 ml-2" />
                      שכפל תצוגה
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      מחק תצוגה
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={openDuplicateDialog}>
                    <Copy className="h-4 w-4 ml-2" />
                    העתק לתצוגות שלי
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateViewDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        name={newViewName}
        onNameChange={setNewViewName}
        isShared={newViewShared}
        onSharedChange={setNewViewShared}
        onSubmit={handleCreate}
      />

      <DuplicateViewDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        name={newViewName}
        onNameChange={setNewViewName}
        onSubmit={handleDuplicate}
      />

      <DeleteViewDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        viewName={currentView?.name || ''}
        onConfirm={handleDelete}
      />
    </>
  );
}
