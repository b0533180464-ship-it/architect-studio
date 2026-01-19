'use client';

import { useState } from 'react';
import { Plus, Link2, Folder, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AddNavItemButtonProps {
  onAddLink: () => void;
  onAddCategory: () => void;
  onCreateEntity?: () => void;
}

export function AddNavItemButton({ onAddLink, onAddCategory, onCreateEntity }: AddNavItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-[#1E293B]">
          <Plus className="h-4 w-4 ml-2" />
          הוסף
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <AddNavItemMenu onAddLink={() => handleAction(onAddLink)} onAddCategory={() => handleAction(onAddCategory)} onCreateEntity={onCreateEntity ? () => handleAction(onCreateEntity) : undefined} />
      </PopoverContent>
    </Popover>
  );
}

function AddNavItemMenu({ onAddLink, onAddCategory, onCreateEntity }: AddNavItemButtonProps) {
  return (
    <div className="space-y-1">
      <Button variant="ghost" className="w-full justify-start text-sm" onClick={onAddLink}>
        <Link2 className="h-4 w-4 ml-2" />
        הוסף קישור
      </Button>
      <Button variant="ghost" className="w-full justify-start text-sm" onClick={onAddCategory}>
        <Folder className="h-4 w-4 ml-2" />
        הוסף קטגוריה
      </Button>
      {onCreateEntity && (
        <>
          <div className="h-px bg-border my-2" />
          <Button variant="ghost" className="w-full justify-start text-sm" onClick={onCreateEntity}>
            <Sparkles className="h-4 w-4 ml-2" />
            צור ישות חדשה
          </Button>
        </>
      )}
    </div>
  );
}
