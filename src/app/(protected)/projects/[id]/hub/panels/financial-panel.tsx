'use client';

import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';
import { PaymentsSection } from './financial/payments-section';
import { ExpensesSection } from './financial/expenses-section';
import { TimeEntriesSection } from './financial/time-entries-section';

interface FinancialPanelProps {
  projectId: string;
}

export function ProjectFinancialPanel({ projectId }: FinancialPanelProps) {
  return (
    <ExpandablePanel
      id="financial"
      title="פיננסי"
      icon="💰"
      projectId={projectId}
      defaultExpanded={true}
    >
      <div className="space-y-6">
        <PaymentsSection projectId={projectId} />
        <div className="border-t" />
        <ExpensesSection projectId={projectId} />
        <div className="border-t" />
        <TimeEntriesSection projectId={projectId} />
      </div>
    </ExpandablePanel>
  );
}
