/* eslint-disable max-lines-per-function */
'use client';

import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface ProjectData {
  startDate: Date | null;
  expectedEndDate: Date | null;
  actualEndDate: Date | null;
  createdAt: Date;
  projectPhase?: { name: string; color: string | null } | null;
}

interface TimelinePanelProps {
  projectId: string;
  project: ProjectData;
}

interface TimelineEvent {
  date: Date;
  label: string;
  type: 'past' | 'current' | 'future';
}

export function ProjectTimelinePanel({ projectId, project }: TimelinePanelProps) {
  const events: TimelineEvent[] = [];
  const now = new Date();

  events.push({ date: new Date(project.createdAt), label: 'נוצר', type: 'past' });

  if (project.startDate) {
    const start = new Date(project.startDate);
    events.push({ date: start, label: 'התחלה', type: start <= now ? 'past' : 'future' });
  }

  if (project.projectPhase) {
    events.push({ date: now, label: project.projectPhase.name, type: 'current' });
  }

  if (project.expectedEndDate) {
    const end = new Date(project.expectedEndDate);
    events.push({ date: end, label: 'צפי סיום', type: end <= now ? 'past' : 'future' });
  }

  if (project.actualEndDate) {
    events.push({ date: new Date(project.actualEndDate), label: 'סיום בפועל', type: 'past' });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  const formatDate = (date: Date) => date.toLocaleDateString('he-IL');

  return (
    <ExpandablePanel id="timeline" title="ציר זמן" icon="📈" projectId={projectId} defaultExpanded={false}>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">אין נתונים</p>
      ) : (
        <div className="relative pr-4">
          <div className="absolute right-1 top-0 bottom-0 w-0.5 bg-muted" />
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="relative flex items-center gap-3">
                <div
                  className={`absolute right-0 w-2 h-2 rounded-full -translate-x-1/2 ${
                    event.type === 'current'
                      ? 'bg-primary'
                      : event.type === 'past'
                        ? 'bg-muted-foreground'
                        : 'bg-muted border-2 border-muted-foreground'
                  }`}
                />
                <div className="flex-1 mr-4">
                  <div className={`text-sm ${event.type === 'current' ? 'font-medium text-primary' : ''}`}>
                    {event.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(event.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ExpandablePanel>
  );
}
