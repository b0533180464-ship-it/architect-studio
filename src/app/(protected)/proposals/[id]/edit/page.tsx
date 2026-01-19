import { ProposalFormContent } from '../../_components/proposal-form-content';

export default function EditProposalPage({ params }: { params: { id: string } }) {
  return <ProposalFormContent id={params.id} />;
}
