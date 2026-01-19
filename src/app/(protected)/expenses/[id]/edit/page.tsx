import { ExpenseFormContent } from '../../_components/expense-form-content';

export default function EditExpensePage({ params }: { params: { id: string } }) {
  return <ExpenseFormContent id={params.id} />;
}
