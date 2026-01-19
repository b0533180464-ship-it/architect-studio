/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { BasicInfoCard, SupplierCard, PricingCard } from '../../components/edit-form-sections';
import { DimensionsCard, MediaLinksCard } from '../../components/edit-form-dimensions';

interface EditProductContentProps {
  productId: string;
}

export function EditProductContent({ productId }: EditProductContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', categoryId: '', supplierId: '',
    supplierSku: '', costPrice: '', retailPrice: '', currency: 'ILS',
    width: '', height: '', depth: '', unit: 'cm', leadTimeDays: '',
    imageUrl: '', productUrl: '', specSheetUrl: '',
  });

  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  const { data: categories } = trpc.products.getCategories.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery({ page: 1, pageSize: 100 });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name, sku: product.sku || '', description: product.description || '',
        categoryId: product.categoryId || '', supplierId: product.supplierId || '',
        supplierSku: product.supplierSku || '', costPrice: product.costPrice?.toString() || '',
        retailPrice: product.retailPrice?.toString() || '', currency: product.currency,
        width: product.width?.toString() || '', height: product.height?.toString() || '',
        depth: product.depth?.toString() || '', unit: product.unit,
        leadTimeDays: product.leadTimeDays?.toString() || '', imageUrl: product.imageUrl || '',
        productUrl: product.productUrl || '', specSheetUrl: product.specSheetUrl || '',
      });
    }
  }, [product]);

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      utils.products.getById.invalidate({ id: productId });
      router.push(`/products/${productId}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: productId, name: formData.name,
        sku: formData.sku || undefined, description: formData.description || undefined,
        categoryId: formData.categoryId || undefined, supplierId: formData.supplierId || undefined,
        supplierSku: formData.supplierSku || undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        currency: formData.currency,
        width: formData.width ? parseFloat(formData.width) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
        unit: formData.unit as 'cm' | 'in' | 'mm',
        leadTimeDays: formData.leadTimeDays ? parseInt(formData.leadTimeDays) : undefined,
        imageUrl: formData.imageUrl || undefined, productUrl: formData.productUrl || undefined,
        specSheetUrl: formData.specSheetUrl || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">מוצר לא נמצא</p>
          <Link href="/products"><Button variant="outline">חזרה לספריית מוצרים</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">עריכת מוצר</h1>
      </div>

      <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <BasicInfoCard formData={formData} setFormData={setFormData} categories={categories} />
            <SupplierCard formData={formData} setFormData={setFormData} suppliers={suppliers} />
            <PricingCard formData={formData} setFormData={setFormData} />
            <DimensionsCard formData={formData} setFormData={setFormData} />
            <MediaLinksCard formData={formData} setFormData={setFormData} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            <Link href={`/products/${productId}`}>
              <Button type="button" variant="outline">ביטול</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || !formData.name}>
              {isSubmitting ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </div>

          {updateMutation.error && (
            <div className="mt-4 text-center text-destructive">{updateMutation.error.message}</div>
          )}
        </form>
    </>
  );
}
