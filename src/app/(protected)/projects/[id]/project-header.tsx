/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfigBadge } from '@/components/ui/config-badge';

interface ConfigEntity {
  id: string;
  name: string;
  color?: string | null;
}

interface ProjectHeaderProps {
  projectId: string;
  name: string;
  isVIP: boolean;
  priority: string;
  isArchived: boolean;
  projectType?: ConfigEntity | null;
  projectStatus?: ConfigEntity | null;
  projectPhase?: ConfigEntity | null;
  onArchive: () => void;
  onRestore: () => void;
  isArchiving: boolean;
  isRestoring: boolean;
}

const priorityLabels: Record<string, { label: string; variant: 'secondary' | 'outline' | 'warning' | 'destructive' }> = {
  low: { label: 'נמוכה', variant: 'secondary' },
  medium: { label: 'בינונית', variant: 'outline' },
  high: { label: 'גבוהה', variant: 'warning' },
  urgent: { label: 'דחוף', variant: 'destructive' },
};

export function ProjectHeader({
  projectId, name, isVIP, priority, isArchived,
  projectType, projectStatus, projectPhase,
  onArchive, onRestore, isArchiving, isRestoring,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{name}</h1>
          {isVIP && <span className="text-amber-500 text-xl">★</span>}
        </div>
        <ConfigBadge entity={projectType} />
        <ConfigBadge entity={projectStatus} />
        <ConfigBadge entity={projectPhase} />
        <Badge variant={priorityLabels[priority]?.variant || 'outline'}>
          {priorityLabels[priority]?.label || priority}
        </Badge>
        {isArchived && <Badge variant="secondary">ארכיון</Badge>}
      </div>
      <div className="flex gap-2">
        <Link href={`/projects/${projectId}/products` as Route}>
          <Button variant="outline">FF&E</Button>
        </Link>
        <Link href={`/projects/${projectId}/hub` as Route}>
          <Button variant="outline">Hub</Button>
        </Link>
        <Link href={`/projects/${projectId}/edit` as Route}>
          <Button variant="outline">עריכה</Button>
        </Link>
        {isArchived ? (
          <Button variant="outline" onClick={onRestore} disabled={isRestoring}>
            {isRestoring ? 'משחזר...' : 'שחזור'}
          </Button>
        ) : (
          <Button variant="destructive" onClick={onArchive} disabled={isArchiving}>
            {isArchiving ? 'מעביר...' : 'לארכיון'}
          </Button>
        )}
      </div>
    </div>
  );
}
