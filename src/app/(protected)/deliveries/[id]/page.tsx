'use client';

import { use } from 'react';
import { DeliveryDetails } from './delivery-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeliveryPage({ params }: PageProps) {
  const { id } = use(params);
  return <DeliveryDetails deliveryId={id} />;
}
