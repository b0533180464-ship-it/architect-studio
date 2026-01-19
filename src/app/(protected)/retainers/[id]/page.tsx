import { RetainerDetailContent } from './retainer-detail-content';

export default function RetainerDetailPage({ params }: { params: { id: string } }) {
  return <RetainerDetailContent id={params.id} />;
}
