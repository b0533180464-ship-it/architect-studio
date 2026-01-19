import { TimeEntryDetailContent } from './time-entry-detail-content';

export default function TimeEntryDetailPage({ params }: { params: { id: string } }) {
  return <TimeEntryDetailContent id={params.id} />;
}
