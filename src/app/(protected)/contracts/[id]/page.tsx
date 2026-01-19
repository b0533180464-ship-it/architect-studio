import { ContractDetailContent } from './contract-detail-content';

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  return <ContractDetailContent id={params.id} />;
}
