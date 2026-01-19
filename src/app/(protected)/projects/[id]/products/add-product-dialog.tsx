/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Room {
  id: string;
  name: string;
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  rooms: Room[];
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  costPrice: number | null;
  retailPrice: number | null;
  supplier?: { id: string; name: string } | null;
}

function formatCurrency(amount: number | null, currency = 'ILS'): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AddProductDialog({
  open,
  onOpenChange,
  projectId,
  rooms,
  onSuccess,
}: AddProductDialogProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [markupPercent, setMarkupPercent] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: searchResults, isLoading: isSearching } = trpc.products.search.useQuery(
    { query: search, limit: 20 },
    { enabled: search.length >= 2 }
  );

  const addMutation = trpc.products.addToRoom.useMutation({
    onSuccess: () => {
      onSuccess();
      resetDialog();
    },
  });

  const resetDialog = () => {
    setStep('select');
    setSearch('');
    setSelectedProduct(null);
    setRoomId('');
    setQuantity('1');
    setMarkupPercent('30');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStep('configure');
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !roomId) return;

    setIsSubmitting(true);
    try {
      const costPrice = selectedProduct.costPrice || 0;
      const markup = parseFloat(markupPercent) || 30;
      const clientPrice = costPrice * (1 + markup / 100);

      await addMutation.mutateAsync({
        productId: selectedProduct.id,
        projectId,
        roomId,
        quantity: parseInt(quantity) || 1,
        costPrice,
        clientPrice,
        markupPercent: markup,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'בחר מוצר מהספרייה' : 'הגדרות מוצר'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Input
                placeholder="חפש מוצר לפי שם או מק״ט..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="text-center py-8 text-muted-foreground">מחפש...</div>
              ) : search.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  הקלד לפחות 2 תווים לחיפוש
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">לא נמצאו מוצרים</div>
              ) : (
                searchResults?.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded bg-muted flex-shrink-0">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sku && `מק"ט: ${product.sku}`}
                            {product.sku && product.supplier && ' | '}
                            {product.supplier?.name}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">
                            {formatCurrency(product.costPrice)}
                          </div>
                          {product.retailPrice && product.retailPrice !== product.costPrice && (
                            <div className="text-sm text-muted-foreground">
                              מחירון: {formatCurrency(product.retailPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Product */}
            {selectedProduct && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded bg-muted flex-shrink-0">
                      {selectedProduct.imageUrl ? (
                        <Image
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-lg">{selectedProduct.name}</div>
                      <div className="text-sm text-muted-foreground">
                        עלות: {formatCurrency(selectedProduct.costPrice)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                      שנה
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuration Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room">חדר *</Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חדר" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">כמות</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="markup">אחוז Markup</Label>
                <Input
                  id="markup"
                  type="number"
                  min="0"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                />
              </div>

              <div>
                <Label>מחיר ללקוח</Label>
                <div className="h-10 flex items-center font-semibold text-lg">
                  {formatCurrency(
                    (selectedProduct?.costPrice || 0) *
                      (1 + (parseFloat(markupPercent) || 0) / 100) *
                      (parseInt(quantity) || 1)
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                ביטול
              </Button>
              <Button onClick={handleSubmit} disabled={!roomId || isSubmitting}>
                {isSubmitting ? 'מוסיף...' : 'הוסף מוצר'}
              </Button>
            </div>

            {/* Error */}
            {addMutation.error && (
              <div className="text-center text-destructive">{addMutation.error.message}</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
