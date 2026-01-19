/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProposalItemsManagerProps {
  proposalId: string;
  readonly?: boolean;
}

export function ProposalItemsManager({ proposalId, readonly }: ProposalItemsManagerProps) {
  const utils = trpc.useUtils();
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unitPrice: '' });

  const { data: items = [], isLoading } = trpc.proposalItems.list.useQuery({ proposalId });

  const createMutation = trpc.proposalItems.create.useMutation({
    onSuccess: () => {
      utils.proposalItems.list.invalidate({ proposalId });
      utils.proposals.getById.invalidate({ id: proposalId });
      setNewItem({ name: '', quantity: '1', unitPrice: '' });
    },
  });

  const updateMutation = trpc.proposalItems.update.useMutation({
    onSuccess: () => {
      utils.proposalItems.list.invalidate({ proposalId });
      utils.proposals.getById.invalidate({ id: proposalId });
    },
  });

  const deleteMutation = trpc.proposalItems.delete.useMutation({
    onSuccess: () => {
      utils.proposalItems.list.invalidate({ proposalId });
      utils.proposals.getById.invalidate({ id: proposalId });
    },
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unitPrice) return;
    createMutation.mutate({
      proposalId,
      type: 'service',
      name: newItem.name,
      quantity: parseFloat(newItem.quantity) || 1,
      unitPrice: parseFloat(newItem.unitPrice) || 0,
    });
  };

  const handleUpdateItem = (id: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateMutation.mutate({ id, [field]: numValue });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('האם למחוק פריט זה?')) {
      deleteMutation.mutate({ id });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.isSelected ? item.total : 0), 0);

  if (isLoading) return <div className="py-4 text-center text-muted-foreground">טוען פריטים...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>פריטים בהצעה</CardTitle>
        <div className="text-lg font-bold">{formatCurrency(totalAmount)}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items list */}
        <div className="divide-y border rounded-md">
          {items.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">אין פריטים עדיין</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-muted/50">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <Input
                  className="flex-1"
                  defaultValue={item.name}
                  disabled={readonly}
                  onBlur={(e) => e.target.value !== item.name && updateMutation.mutate({ id: item.id, name: e.target.value })}
                />
                <Input
                  className="w-20 text-center"
                  type="number"
                  defaultValue={item.quantity}
                  disabled={readonly}
                  onBlur={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  className="w-24 text-left"
                  type="number"
                  defaultValue={item.unitPrice}
                  disabled={readonly}
                  onBlur={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                />
                <span className="w-24 text-left font-medium">{formatCurrency(item.total)}</span>
                {!readonly && (
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add new item */}
        {!readonly && (
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <Input
              className="flex-1"
              placeholder="שם הפריט..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Input
              className="w-20 text-center"
              type="number"
              placeholder="כמות"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <span className="text-muted-foreground">×</span>
            <Input
              className="w-24 text-left"
              type="number"
              placeholder="מחיר"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
            />
            <Button
              size="sm"
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.unitPrice || createMutation.isPending}
            >
              הוסף
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
