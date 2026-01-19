import { ContractFormContent } from '../../_components/contract-form-content';

export default function EditContractPage({ params }: { params: { id: string } }) {
  return <ContractFormContent id={params.id} />;
}
