/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '../../project-form';

export function EditProjectContent({ projectId }: { projectId: string }) {
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">עריכת פרויקט: {project.name}</h1>
      </div>
      <ProjectForm project={project} />
    </>
  );
}
