import { ExpenseDetailContent } from './expense-detail-content';

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  return <ExpenseDetailContent id={params.id} />;
}
