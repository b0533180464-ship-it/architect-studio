import { RetainerFormContent } from '../../_components/retainer-form-content';

export default function EditRetainerPage({ params }: { params: { id: string } }) {
  return <RetainerFormContent id={params.id} />;
}
