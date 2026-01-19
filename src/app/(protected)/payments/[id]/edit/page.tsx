import { PaymentFormContent } from '../../_components/payment-form-content';

export default function EditPaymentPage({ params }: { params: { id: string } }) {
  return <PaymentFormContent id={params.id} />;
}
