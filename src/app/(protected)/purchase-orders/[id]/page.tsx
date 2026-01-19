'use client';

import { PurchaseOrderDetails } from './po-details';

interface PageProps {
  params: { id: string };
}

export default function PurchaseOrderPage({ params }: PageProps) {
  return <PurchaseOrderDetails purchaseOrderId={params.id} />;
}
