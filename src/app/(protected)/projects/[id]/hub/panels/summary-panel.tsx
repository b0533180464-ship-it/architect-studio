/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface ProjectData {
  code: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  area: number | null;
  floors: number | null;
  budget: number | null;
  billingType: string;
  client: { id: string; name: string } | null;
  startDate: Date | null;
  expectedEndDate: Date | null;
}

interface SummaryPanelProps {
  projectId: string;
  project: ProjectData;
}

export function ProjectSummaryPanel({ projectId, project }: SummaryPanelProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('he-IL');
  };

  return (
    <ExpandablePanel id="summary" title="מידע כללי" icon="📋" projectId={projectId}>
      <div className="space-y-3 text-sm">
        {project.code && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">קוד:</span>
            <span className="font-mono">{project.code}</span>
          </div>
        )}
        {project.client && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">לקוח:</span>
            <Link href={`/clients/${project.client.id}`} className="text-primary hover:underline">
              {project.client.name}
            </Link>
          </div>
        )}
        {(project.address || project.city) && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">מיקום:</span>
            <span>{[project.address, project.city].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {project.area && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">שטח:</span>
            <span>{project.area} מ״ר</span>
          </div>
        )}
        {project.budget && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">תקציב:</span>
            <span>₪{project.budget.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">תאריכים:</span>
          <span>{formatDate(project.startDate)} - {formatDate(project.expectedEndDate)}</span>
        </div>
        {project.description && (
          <div className="pt-2 border-t">
            <span className="text-muted-foreground block mb-1">תיאור:</span>
            <p className="text-sm">{project.description}</p>
          </div>
        )}
      </div>
    </ExpandablePanel>
  );
}
