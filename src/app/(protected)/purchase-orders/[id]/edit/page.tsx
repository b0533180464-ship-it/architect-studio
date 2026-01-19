'use client';

import { EditPurchaseOrderContent } from './edit-po-content';

interface PageProps {
  params: { id: string };
}

export default function EditPurchaseOrderPage({ params }: PageProps) {
  return <EditPurchaseOrderContent purchaseOrderId={params.id} />;
}
