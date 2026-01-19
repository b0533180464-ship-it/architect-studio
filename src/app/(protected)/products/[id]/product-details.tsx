/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductDetailsProps {
  productId: string;
}

function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDimensions(
  width: number | null,
  height: number | null,
  depth: number | null,
  unit: string
): string {
  const dims = [width, height, depth].filter((d) => d !== null);
  if (dims.length === 0) return '-';
  return dims.join(' × ') + ' ' + unit;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: product, isLoading, error } = trpc.products.getById.useQuery({ id: productId });
  const utils = trpc.useUtils();

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      router.push('/products');
    },
  });

  const duplicateMutation = trpc.products.duplicate.useMutation({
    onSuccess: (newProduct) => {
      utils.products.list.invalidate();
      router.push(`/products/${newProduct.id}/edit`);
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: productId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate({ id: productId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">מוצר לא נמצא</p>
          <Link href="/products">
            <Button variant="outline">חזרה לספריית מוצרים</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
            {duplicateMutation.isPending ? 'משכפל...' : 'שכפל'}
          </Button>
          <Link href={`/products/${productId}/edit`}>
            <Button variant="outline">ערוך</Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">מחק</Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>מחיקת מוצר</AlertDialogTitle>
                <AlertDialogDescription>
                  האם אתה בטוח שברצונך למחוק את המוצר &quot;{product.name}&quot;?
                  פעולה זו תסמן את המוצר כלא פעיל.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'מוחק...' : 'מחק'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          {/* Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                {/* Image */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <svg
                        className="h-16 w-16"
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

                {/* Category */}
                {product.category && (
                  <Badge
                    variant="secondary"
                    className="mb-3"
                    style={{
                      backgroundColor: product.category.color
                        ? `${product.category.color}20`
                        : undefined,
                      color: product.category.color || undefined,
                    }}
                  >
                    {product.category.name}
                  </Badge>
                )}

                {/* Name & SKU */}
                <h2 className="text-xl font-semibold">{product.name}</h2>
                {product.sku && (
                  <p className="text-sm text-muted-foreground">מק&quot;ט: {product.sku}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>תיאור</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>מחירים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">מחיר עלות</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(product.costPrice, product.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">מחיר מחירון</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(product.retailPrice, product.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">מטבע</div>
                    <div className="text-lg font-semibold">{product.currency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>מידות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">רוחב</div>
                    <div className="font-medium">
                      {product.width ? `${product.width} ${product.unit}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">גובה</div>
                    <div className="font-medium">
                      {product.height ? `${product.height} ${product.unit}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">עומק</div>
                    <div className="font-medium">
                      {product.depth ? `${product.depth} ${product.unit}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">סה&quot;כ</div>
                    <div className="font-medium">
                      {formatDimensions(product.width, product.height, product.depth, product.unit)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier */}
            {product.supplier && (
              <Card>
                <CardHeader>
                  <CardTitle>ספק</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.supplier.name}</div>
                      {product.supplierSku && (
                        <div className="text-sm text-muted-foreground">
                          מק&quot;ט ספק: {product.supplierSku}
                        </div>
                      )}
                    </div>
                    <Link href={`/suppliers/${product.supplier.id}`}>
                      <Button variant="outline" size="sm">
                        צפה בספק
                      </Button>
                    </Link>
                  </div>
                  {product.leadTimeDays && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">זמן אספקה</div>
                      <div className="font-medium">{product.leadTimeDays} ימים</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>שימוש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">סה&quot;כ שימושים</div>
                    <div className="text-2xl font-bold">{product.usageCount}</div>
                  </div>
                  {product.lastUsedInProject && (
                    <div>
                      <div className="text-sm text-muted-foreground">שימוש אחרון</div>
                      <Link
                        href={`/projects/${product.lastUsedInProject.id}`}
                        className="text-primary hover:underline"
                      >
                        {product.lastUsedInProject.name}
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            {(product.productUrl || product.specSheetUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>קישורים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.productUrl && (
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        דף מוצר באתר הספק
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                    {product.specSheetUrl && (
                      <a
                        href={product.specSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        מפרט טכני
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>תגיות</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(product.tags as string[]).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </>
  );
}
