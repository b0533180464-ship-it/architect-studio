'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TableSkeleton, TableEmptyState, EntitySheet } from '@/components/data-table';
import { projectsColumns, priorityOptions, billingTypeOptions, type ProjectTableItem } from './projects-columns';
import { ProjectTableRow } from './project-table-row';

interface ProjectsTableProps {
  projects: ProjectTableItem[];
  isLoading?: boolean;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete?: (id: string) => void;
}

/**
 * טבלת פרויקטים עם עריכה inline
 */
export function ProjectsTable({ projects, isLoading, onUpdate, onDelete }: ProjectsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton columns={projectsColumns.length} />;
  if (projects.length === 0) return <TableEmptyState message="אין פרויקטים להצגה" />;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse" dir="rtl">
          <ProjectTableHeader />
          <tbody>
            {projects.map((project) => (
              <ProjectTableRow
                key={project.id}
                project={project}
                onUpdate={(field, value) => onUpdate(project.id, field, value)}
                onClick={() => setSelectedId(project.id)}
                onDelete={onDelete ? () => onDelete(project.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ProjectDetailSheet projectId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ProjectTableHeader() {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        {projectsColumns.map((col) => (
          <th key={col.key} style={{ width: col.width, minWidth: col.minWidth }} className="py-3 px-2 text-right text-sm font-medium text-muted-foreground border-l border-border/50 bg-muted/30">
            {col.label}{col.required && <span className="text-destructive">*</span>}
          </th>
        ))}
        <th className="py-3 px-2 w-10 bg-muted/30 border-l border-border/50" />
      </tr>
    </thead>
  );
}

function ProjectDetailSheet({ projectId, onClose }: { projectId: string | null; onClose: () => void }) {
  const { data: project } = trpc.projects.getById.useQuery({ id: projectId! }, { enabled: !!projectId });

  if (!projectId) return null;

  return (
    <EntitySheet open={!!projectId} onOpenChange={(open) => !open && onClose()} title={project?.name || 'פרטי פרויקט'} detailUrl={`/projects/${projectId}`}>
      <div className="space-y-4">
        {project && (
          <>
            <div><span className="text-muted-foreground">שם:</span> {project.name}</div>
            <div><span className="text-muted-foreground">קוד:</span> {project.code || '-'}</div>
            <div><span className="text-muted-foreground">לקוח:</span> {project.client.name}</div>
            <div><span className="text-muted-foreground">עדיפות:</span> {priorityOptions.find((o) => o.value === project.priority)?.label}</div>
            <div><span className="text-muted-foreground">תמחור:</span> {billingTypeOptions.find((o) => o.value === project.billingType)?.label}</div>
            {project.description && <div><span className="text-muted-foreground">תיאור:</span> {project.description}</div>}
          </>
        )}
      </div>
    </EntitySheet>
  );
}

export { projectsColumns, priorityOptions, billingTypeOptions };
