/* eslint-disable max-lines-per-function */
'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalForm } from '@/components/professionals/professional-form';

interface EditProfessionalContentProps {
  professionalId: string;
}

export function EditProfessionalContent({ professionalId }: EditProfessionalContentProps) {
  const { data: professional, isLoading, error } = trpc.professionals.getById.useQuery({ id: professionalId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">בעל מקצוע לא נמצא</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">עריכת בעל מקצוע - {professional.name}</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <ProfessionalForm professional={professional} />
        </CardContent>
      </Card>
    </>
  );
}
