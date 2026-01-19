/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  CheckSquare,
  Home,
  MapPin,
  FileText,
  Users,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsBar, type Metric } from '@/components/ui/metrics-bar';
import { AlertBanner } from '@/components/ui/alert-banner';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { ProjectHeader } from './project-header';
import { ProjectRooms } from './project-rooms';
import { ProjectTasks } from './project-tasks';

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number | null): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const billingTypeLabels: Record<string, string> = {
  fixed: 'מחיר קבוע',
  hourly: 'שעתי',
  percentage: 'אחוז מתקציב',
  cost_plus: 'Cost+',
  hybrid: 'משולב',
};

// ============================================
// Main Component
// ============================================

export function ProjectDetails({ projectId }: { projectId: string }) {
  const utils = trpc.useUtils();

  const { data: project, isLoading, error } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: rooms } = trpc.rooms.list.useQuery({ projectId });
  const { data: tasksData } = trpc.tasks.list.useQuery({ projectId, pageSize: 100 });

  const archiveMutation = trpc.projects.archive.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId });
      utils.projects.list.invalidate();
    },
  });

  const restoreMutation = trpc.projects.restore.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId });
      utils.projects.list.invalidate();
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  // Error state
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

  const isArchived = !!project.archivedAt;

  // Calculate metrics
  const tasks = tasksData?.items || [];
  const completedTasks = tasks.filter((t) => t.completedAt).length;
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter((t) => !t.completedAt && t.computed?.isOverdue).length;
  const roomsCount = rooms?.length || 0;
  const daysRemaining = project.computed?.daysRemaining ?? null;

  // Determine metric colors
  const getDaysColor = (): Metric['color'] => {
    if (daysRemaining === null) return 'default';
    if (daysRemaining < 0) return 'error';
    if (daysRemaining <= 7) return 'warning';
    return 'success';
  };

  const getTasksColor = (): Metric['color'] => {
    if (totalTasks === 0) return 'default';
    const openTasksPercent = ((totalTasks - completedTasks) / totalTasks) * 100;
    if (openTasksPercent > 50) return 'warning';
    return 'success';
  };

  const metrics: Metric[] = [
    {
      label: 'ימים לסיום',
      value: daysRemaining !== null ? (daysRemaining < 0 ? `${Math.abs(daysRemaining)}-` : daysRemaining) : '-',
      icon: Calendar,
      color: getDaysColor(),
    },
    {
      label: 'תקציב',
      value: project.budget ? formatCurrency(project.budget) : '-',
      icon: DollarSign,
      color: 'default',
    },
    {
      label: 'משימות',
      value: `${completedTasks}/${totalTasks}`,
      icon: CheckSquare,
      color: getTasksColor(),
    },
    {
      label: 'חדרים',
      value: roomsCount,
      icon: Home,
      color: 'default',
    },
  ];

  // Check for alerts
  const hasOverdueTasks = overdueTasks > 0;
  const isProjectOverdue = project.computed?.isOverdue ?? false;

  return (
    <div className="space-y-6">
      {/* ===== 1. HEADER (existing - unchanged) ===== */}
      <ProjectHeader
        projectId={projectId}
        name={project.name}
        isVIP={project.isVIP}
        priority={project.priority}
        isArchived={isArchived}
        projectType={project.projectType}
        projectStatus={project.projectStatus}
        projectPhase={project.projectPhase}
        onArchive={() => archiveMutation.mutate({ id: projectId })}
        onRestore={() => restoreMutation.mutate({ id: projectId })}
        isArchiving={archiveMutation.isPending}
        isRestoring={restoreMutation.isPending}
      />

      {/* ===== 2. METRICS BAR (new) ===== */}
      <MetricsBar metrics={metrics} />

      {/* ===== 3. ALERTS (new - conditional) ===== */}
      {hasOverdueTasks && (
        <AlertBanner type="warning" dismissible>
          {overdueTasks} משימות באיחור דורשות טיפול
        </AlertBanner>
      )}
      {isProjectOverdue && !hasOverdueTasks && (
        <AlertBanner type="error" dismissible>
          הפרויקט באיחור - תאריך היעד עבר
        </AlertBanner>
      )}

      {/* ===== 4. PRIMARY CONTENT - Rooms & Tasks (XL cards) ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectRooms projectId={projectId} />
        <ProjectTasks projectId={projectId} />
      </div>

      {/* ===== 5. SECONDARY CONTENT - Dates, Budget, Scope (MD cards) ===== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Dates Card */}
        <Card size="md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              תאריכים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">התחלה</span>
              <span className="text-sm font-medium ltr-nums">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">יעד</span>
              <span className="text-sm font-medium ltr-nums">{formatDate(project.expectedEndDate)}</span>
            </div>
            {project.actualEndDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">סיום בפועל</span>
                <span className="text-sm font-medium ltr-nums">{formatDate(project.actualEndDate)}</span>
              </div>
            )}
            {daysRemaining !== null && !isArchived && (
              <div className="border-t pt-3">
                {isProjectOverdue ? (
                  <p className="text-sm font-medium text-destructive">
                    באיחור של {Math.abs(daysRemaining)} ימים
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{daysRemaining} ימים לסיום</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card size="md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              תקציב ותמחור
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">סוג תמחור</span>
              <span className="text-sm font-medium">
                {billingTypeLabels[project.billingType] || project.billingType}
              </span>
            </div>
            {project.budget && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">תקציב</span>
                <span className="text-sm font-medium ltr-nums">{formatCurrency(project.budget)}</span>
              </div>
            )}
            {project.fixedFee && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">שכ״ט</span>
                <span className="text-sm font-medium ltr-nums">{formatCurrency(project.fixedFee)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scope Card */}
        <Card size="md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              היקף עבודה
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.scope ? (
              <p className="text-sm text-muted-foreground line-clamp-5 whitespace-pre-wrap">
                {project.scope}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">לא הוגדר היקף עבודה</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== 6. COLLAPSIBLE DETAILS (rarely needed) ===== */}
      <div className="space-y-3">
        {/* Project Details */}
        <CollapsibleSection title="פרטי פרויקט" defaultOpen={false}>
          <div className="grid gap-4 md:grid-cols-2">
            {project.code && (
              <div>
                <p className="text-sm text-muted-foreground">קוד פרויקט</p>
                <p className="font-medium">{project.code}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">לקוח</p>
              <Link
                href={`/clients/${project.client.id}`}
                className="font-medium text-primary hover:underline"
              >
                {project.client.name}
              </Link>
            </div>
            {project.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">תיאור</p>
                <p className="whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Location */}
        <CollapsibleSection title="מיקום" defaultOpen={false}>
          <div className="grid gap-4 md:grid-cols-2">
            {project.address && (
              <div className="md:col-span-2 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">כתובת</p>
                  <p className="font-medium">{project.address}</p>
                </div>
              </div>
            )}
            {project.city && (
              <div>
                <p className="text-sm text-muted-foreground">עיר</p>
                <p className="font-medium">{project.city}</p>
              </div>
            )}
            {project.area && (
              <div>
                <p className="text-sm text-muted-foreground">שטח</p>
                <p className="font-medium">{project.area} מ״ר</p>
              </div>
            )}
            {project.floors && (
              <div>
                <p className="text-sm text-muted-foreground">קומות</p>
                <p className="font-medium">{project.floors}</p>
              </div>
            )}
            {!project.address && !project.city && !project.area && !project.floors && (
              <p className="text-sm text-muted-foreground">לא הוזנו פרטי מיקום</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Team */}
        <CollapsibleSection title="צוות" defaultOpen={false}>
          <TeamList users={project.assignedUsers} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  title?: string | null;
}

function TeamList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">לא הוקצו חברי צוות</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              `${user.firstName[0]}${user.lastName[0]}`
            )}
          </div>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            {user.title && <p className="text-sm text-muted-foreground">{user.title}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
