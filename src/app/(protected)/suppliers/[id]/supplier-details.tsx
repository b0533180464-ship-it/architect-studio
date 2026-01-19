/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface SupplierDetailsProps {
  supplierId: string;
}

export function SupplierDetails({ supplierId }: SupplierDetailsProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: supplier, isLoading, error } = trpc.suppliers.getById.useQuery({ id: supplierId });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      router.push('/suppliers');
    },
  });

  const handleDelete = () => {
    if (supplier && confirm(`האם למחוק את הספק "${supplier.name}"?`)) {
      deleteMutation.mutate({ id: supplierId });
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">לא דורג</span>;
    return (
      <span className="text-yellow-500 text-lg">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">ספק לא נמצא</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{supplier.name}</h1>
          {supplier.category && (
            <Badge variant="secondary" style={{ backgroundColor: supplier.category.color || undefined }}>
              {supplier.category.name}
            </Badge>
          )}
          {supplier.hasTradeAccount && (
            <Badge variant="default" className="bg-green-600">Trade Account</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/suppliers/${supplierId}/edit`}>
            <Button variant="outline">עריכה</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            מחיקה
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי התקשרות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplier.contactPerson && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">איש קשר:</span>
                  <span>{supplier.contactPerson}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אימייל:</span>
                  <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">{supplier.email}</a>
                </div>
              )}
              {supplier.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">טלפון:</span>
                  <a href={`tel:${supplier.phone}`} className="text-primary hover:underline" dir="ltr">{supplier.phone}</a>
                </div>
              )}
              {supplier.website && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אתר:</span>
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{supplier.website}</a>
                </div>
              )}
              {(supplier.address || supplier.city) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">כתובת:</span>
                  <span>{[supplier.address, supplier.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {supplier.companyNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ח.פ./עוסק:</span>
                  <span>{supplier.companyNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>תנאים מסחריים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplier.paymentTerms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">תנאי תשלום:</span>
                  <span>{supplier.paymentTerms}</span>
                </div>
              )}
              {supplier.discountPercent !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">הנחה:</span>
                  <span>{supplier.discountPercent}%</span>
                </div>
              )}
              {supplier.creditDays !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ימי אשראי:</span>
                  <span>{supplier.creditDays} ימים</span>
                </div>
              )}
              {supplier.minimumOrder !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">הזמנה מינימלית:</span>
                  <span>₪{supplier.minimumOrder.toLocaleString()}</span>
                </div>
              )}
              {supplier.hasTradeAccount && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <div className="font-medium mb-2">Trade Account</div>
                    {supplier.tradeAccountNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">מספר חשבון:</span>
                        <span>{supplier.tradeAccountNumber}</span>
                      </div>
                    )}
                    {supplier.tradeDiscountPercent !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">הנחת Trade:</span>
                        <span>{supplier.tradeDiscountPercent}%</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rating & Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>דירוג</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRating(supplier.rating)}
              {supplier.reliabilityScore !== null && (
                <div className="mt-2 text-sm text-muted-foreground">
                  ציון אמינות: {supplier.reliabilityScore}/100
                </div>
              )}
            </CardContent>
          </Card>

          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle>הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{supplier.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
