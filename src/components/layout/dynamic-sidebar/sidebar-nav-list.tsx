/* eslint-disable max-lines-per-function */
'use client';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { NavItem } from './nav-item';
import { NavContextMenu } from './nav-context-menu';
import type { NavigationItemWithChildren } from './types';

interface SidebarNavListProps {
  items: NavigationItemWithChildren[] | undefined;
  isLoading: boolean;
  openCategories: Set<string>;
  onToggleCategory: (label: string) => void;
  onRename: (item: NavigationItemWithChildren) => void;
  onChangeIcon: (item: NavigationItemWithChildren) => void;
  onToggleVisibility: (item: NavigationItemWithChildren) => void;
  onDelete: (item: NavigationItemWithChildren) => void;
  onReorder: (items: { id: string; order: number; parentId: string | null }[]) => void;
}

export function SidebarNavList(props: SidebarNavListProps) {
  const { items, isLoading, openCategories, onToggleCategory, onReorder } = props;
  const { onRename, onChangeIcon, onToggleVisibility, onDelete } = props;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !items) return;
    if (result.source.index === result.destination.index) return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    if (!moved) return;
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((item, index) => ({
      id: item.id,
      order: index,
      parentId: item.parentId,
    }));

    onReorder(updates);
  };

  if (isLoading) {
    return <NavListSkeleton />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="nav-list">
        {(provided) => (
          <ul className="space-y-1" ref={provided.innerRef} {...provided.droppableProps}>
            {items?.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <NavContextMenu
                      item={item}
                      onRename={onRename}
                      onChangeIcon={onChangeIcon}
                      onToggleVisibility={onToggleVisibility}
                      onDelete={onDelete}
                    >
                      <div>
                        <NavItem
                          item={item}
                          isOpen={openCategories.has(item.label)}
                          onToggle={() => onToggleCategory(item.label)}
                        />
                      </div>
                    </NavContextMenu>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function NavListSkeleton() {
  return (
    <div className="px-4 space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
