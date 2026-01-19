/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import Link from 'next/link';
import {
  MapPin,
  Calendar,
  DollarSign,
  Ruler,
  Hash,
  User,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectTasksPanel } from './panels/tasks-panel';
import { ProjectDocumentsPanel } from './panels/documents-panel';
import { ProjectMeetingsPanel } from './panels/meetings-panel';
import { ProjectRoomsPanel } from './panels/rooms-panel';
import { ProjectTimelinePanel } from './panels/timeline-panel';
import { ProjectFinancialPanel } from './panels/financial-panel';

interface HubContentProps {
  projectId: string;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number | null): string {
  if (!amount) return '';
  return `₪${amount.toLocaleString()}`;
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function calculateDaysRemaining(endDate: Date | null): number | null {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ============================================
// Main Component
// ============================================

export function ProjectHubContent({ projectId }: HubContentProps) {
  const { data: project, isLoading, error } = trpc.projects.getById.useQuery({ id: projectId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">פרויקט לא נמצא</p>
          <Link href="/projects">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(project.expectedEndDate);

  return (
    <div className="space-y-6">
      {/* ===== 1. HEADER (existing - unchanged) ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.isVIP && <Badge variant="default" className="bg-yellow-500">VIP</Badge>}
          {project.projectStatus && (
            <Badge variant="secondary" style={{ backgroundColor: project.projectStatus.color || undefined }}>
              {project.projectStatus.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/products`}>
            <Button variant="outline">FF&E</Button>
          </Link>
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline">תצוגה רגילה</Button>
          </Link>
          <Link href={`/projects/${projectId}/edit`}>
            <Button variant="outline">עריכה</Button>
          </Link>
        </div>
      </div>

      {/* ===== 2. INFO BAR (new - compact row) ===== */}
      <InfoBar project={project} daysRemaining={daysRemaining} />

      {/* ===== 3. PRIMARY GRID - Rooms & Tasks ===== */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectRoomsPanel projectId={projectId} />
        <ProjectTasksPanel projectId={projectId} />
      </div>

      {/* ===== 4. SECONDARY GRID - Meetings & Documents ===== */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectMeetingsPanel projectId={projectId} />
        <ProjectDocumentsPanel projectId={projectId} />
      </div>

      {/* ===== 5. FINANCIAL - Full Width ===== */}
      <div className="w-full">
        <ProjectFinancialPanel projectId={projectId} />
      </div>

      {/* ===== 6. TIMELINE - Full Width ===== */}
      <div className="w-full">
        <ProjectTimelinePanel projectId={projectId} project={project} />
      </div>
    </div>
  );
}

// ============================================
// Info Bar Component
// ============================================

interface InfoBarProps {
  project: {
    code: string | null;
    client: { id: string; name: string };
    address: string | null;
    city: string | null;
    area: number | null;
    budget: number | null;
    startDate: Date | null;
    expectedEndDate: Date | null;
  };
  daysRemaining: number | null;
}

function InfoBar({ project, daysRemaining }: InfoBarProps) {
  const location = [project.address, project.city].filter(Boolean).join(', ');
  const hasLocation = location.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-muted px-4 py-3 text-sm">
      {/* Code */}
      {project.code && (
        <InfoItem icon={Hash} label="קוד" value={project.code} />
      )}

      {/* Client */}
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">לקוח:</span>
        <Link
          href={`/clients/${project.client.id}`}
          className="font-medium text-primary hover:underline"
        >
          {project.client.name}
        </Link>
      </div>

      {/* Divider */}
      {hasLocation && <Divider />}

      {/* Location */}
      {hasLocation && (
        <InfoItem icon={MapPin} label="מיקום" value={location} />
      )}

      {/* Area */}
      {project.area && (
        <>
          <Divider />
          <InfoItem icon={Ruler} label="שטח" value={`${project.area} מ״ר`} />
        </>
      )}

      {/* Budget */}
      {project.budget && (
        <>
          <Divider />
          <InfoItem icon={DollarSign} label="תקציב" value={formatCurrency(project.budget)} />
        </>
      )}

      {/* Dates */}
      <Divider />
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">תאריכים:</span>
        <span className="font-medium ltr-nums">
          {formatDate(project.startDate)} - {formatDate(project.expectedEndDate)}
        </span>
        {daysRemaining !== null && (
          <span
            className={`ms-2 rounded px-1.5 py-0.5 text-xs font-medium ${
              daysRemaining < 0
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : daysRemaining <= 7
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            {daysRemaining < 0
              ? `באיחור ${Math.abs(daysRemaining)} ימים`
              : `${daysRemaining} ימים נותרו`}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Divider() {
  return <span className="hidden text-muted-foreground/50 md:inline">|</span>;
}
