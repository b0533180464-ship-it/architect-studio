/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface EditRoomProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomProductId: string | null;
  onSuccess: () => void;
}

export function EditRoomProductDialog({
  open, onOpenChange, roomProductId, onSuccess,
}: EditRoomProductDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [costPrice, setCostPrice] = useState('0');
  const [clientPrice, setClientPrice] = useState('0');
  const [markupPercent, setMarkupPercent] = useState('30');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [installationRequired, setInstallationRequired] = useState(false);

  const { data: roomProduct, isLoading } = trpc.roomProducts.getById.useQuery(
    { id: roomProductId! },
    { enabled: !!roomProductId && open }
  );

  const updateMutation = trpc.roomProducts.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (roomProduct) {
      setQuantity(roomProduct.quantity.toString());
      setCostPrice(roomProduct.costPrice.toString());
      setClientPrice(roomProduct.clientPrice.toString());
      setMarkupPercent(roomProduct.markupPercent?.toString() || '30');
      setNotes(roomProduct.notes || '');
      setInternalNotes(roomProduct.internalNotes || '');
      setInstallationRequired(roomProduct.installationRequired);
    }
  }, [roomProduct]);

  const handleCostChange = (value: string) => {
    setCostPrice(value);
    const cost = parseFloat(value) || 0;
    const markup = parseFloat(markupPercent) || 0;
    setClientPrice((cost * (1 + markup / 100)).toFixed(2));
  };

  const handleMarkupChange = (value: string) => {
    setMarkupPercent(value);
    const cost = parseFloat(costPrice) || 0;
    const markup = parseFloat(value) || 0;
    setClientPrice((cost * (1 + markup / 100)).toFixed(2));
  };

  const handleSubmit = () => {
    if (!roomProductId) return;
    updateMutation.mutate({
      id: roomProductId,
      quantity: parseInt(quantity) || 1,
      costPrice: parseFloat(costPrice) || 0,
      clientPrice: parseFloat(clientPrice) || 0,
      markupPercent: parseFloat(markupPercent) || 0,
      notes: notes || undefined,
      internalNotes: internalNotes || undefined,
      installationRequired,
    });
  };

  if (!roomProductId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מוצר בחדר</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">טוען...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">כמות</Label>
                <Input
                  id="quantity" type="number" min="1"
                  value={quantity} onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">מחיר עלות</Label>
                <Input
                  id="costPrice" type="number" step="0.01"
                  value={costPrice} onChange={(e) => handleCostChange(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="markup">אחוז Markup</Label>
                <Input
                  id="markup" type="number" step="0.1"
                  value={markupPercent} onChange={(e) => handleMarkupChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPrice">מחיר ללקוח</Label>
                <Input
                  id="clientPrice" type="number" step="0.01"
                  value={clientPrice} onChange={(e) => setClientPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות (גלוי ללקוח)</Label>
              <Textarea
                id="notes" value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות לגבי המוצר..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNotes">הערות פנימיות</Label>
              <Textarea
                id="internalNotes" value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="הערות פנימיות (לא גלוי ללקוח)..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="installationRequired"
                checked={installationRequired}
                onCheckedChange={(checked) => setInstallationRequired(checked === true)}
              />
              <Label htmlFor="installationRequired" className="cursor-pointer">
                נדרשת התקנה
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row-reverse gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending || isLoading}>
            {updateMutation.isPending ? 'שומר...' : 'שמור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
