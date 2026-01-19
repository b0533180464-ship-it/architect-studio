'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AddRelationForm, type AddRelationData } from './add-relation-form';

export type { AddRelationData };

interface EntityTypeOption {
  slug: string;
  name: string;
}

interface AddRelationButtonProps {
  sourceEntityType: string;
  entityTypes: EntityTypeOption[];
  onAdd: (data: AddRelationData) => void;
  disabled?: boolean;
}

export function AddRelationButton({
  sourceEntityType,
  entityTypes,
  onAdd,
  disabled,
}: AddRelationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableEntityTypes = entityTypes.filter((et) => et.slug !== sourceEntityType);

  const handleSubmit = (data: AddRelationData) => {
    onAdd(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled || availableEntityTypes.length === 0}>
          <Link2 className="h-4 w-4 ml-2" />
          הוסף קשר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <AddRelationForm
          entityTypes={availableEntityTypes}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
