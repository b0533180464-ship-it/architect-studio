/* eslint-disable max-lines-per-function */
'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { SupplierForm } from '@/components/suppliers/supplier-form';

interface EditSupplierContentProps {
  supplierId: string;
}

export function EditSupplierContent({ supplierId }: EditSupplierContentProps) {
  const { data: supplier, isLoading, error } = trpc.suppliers.getById.useQuery({ id: supplierId });

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
        <h1 className="text-2xl font-semibold">עריכת ספק - {supplier.name}</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <SupplierForm supplier={supplier} />
        </CardContent>
      </Card>
    </>
  );
}
