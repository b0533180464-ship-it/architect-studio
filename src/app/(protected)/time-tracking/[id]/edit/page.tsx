import { TimeEntryFormContent } from '../../_components/time-entry-form-content';

export default function EditTimeEntryPage({ params }: { params: { id: string } }) {
  return <TimeEntryFormContent id={params.id} />;
}
