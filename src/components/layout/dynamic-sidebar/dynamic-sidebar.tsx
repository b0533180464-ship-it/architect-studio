/* eslint-disable max-lines-per-function */
'use client';

import { useNavState } from './use-nav-state';
import { SidebarHeader } from './sidebar-header';
import { SidebarFooter } from './sidebar-footer';
import { SidebarNavList } from './sidebar-nav-list';
import { RenameDialog, IconDialog, DeleteDialog, EntityCreatorDialog } from './dialogs';

export function DynamicSidebar() {
  const state = useNavState();

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-[#E2E8F0] flex flex-col z-50">
      <SidebarHeader />

      <nav className="flex-1 overflow-y-auto py-4">
        <SidebarNavList
          items={state.navItems}
          isLoading={state.isLoading}
          openCategories={state.openCategories}
          onToggleCategory={state.toggleCategory}
          onRename={state.handleRename}
          onChangeIcon={state.handleChangeIcon}
          onToggleVisibility={state.handleToggleVisibility}
          onDelete={state.handleDelete}
          onReorder={state.handleReorder}
        />
      </nav>

      <SidebarFooter
        onAddLink={state.handleAddLink}
        onAddCategory={state.handleAddCategory}
        onCreateEntity={state.handleOpenEntityCreator}
      />

      <RenameDialog
        item={state.renameItem}
        open={!!state.renameItem}
        onOpenChange={(open) => !open && state.setRenameItem(null)}
        onSave={state.handleSaveRename}
      />
      <IconDialog
        item={state.iconItem}
        open={!!state.iconItem}
        onOpenChange={(open) => !open && state.setIconItem(null)}
        onSave={state.handleSaveIcon}
      />
      <DeleteDialog
        item={state.deleteItem}
        open={!!state.deleteItem}
        onOpenChange={(open) => !open && state.setDeleteItem(null)}
        onConfirm={state.handleConfirmDelete}
      />
      <EntityCreatorDialog
        open={state.showEntityCreator}
        onOpenChange={state.setShowEntityCreator}
        onSave={state.handleCreateEntity}
      />
    </aside>
  );
}
