import { ProposalDetailContent } from './proposal-detail-content';

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  return <ProposalDetailContent id={params.id} />;
}
