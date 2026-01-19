import { PaymentDetailContent } from './payment-detail-content';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  return <PaymentDetailContent id={params.id} />;
}
