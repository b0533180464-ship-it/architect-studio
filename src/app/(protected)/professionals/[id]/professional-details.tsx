/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface ProfessionalDetailsProps {
  professionalId: string;
}

export function ProfessionalDetails({ professionalId }: ProfessionalDetailsProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: professional, isLoading, error } = trpc.professionals.getById.useQuery({ id: professionalId });

  const deleteMutation = trpc.professionals.delete.useMutation({
    onSuccess: () => {
      utils.professionals.list.invalidate();
      router.push('/professionals');
    },
  });

  const handleDelete = () => {
    if (professional && confirm(`האם למחוק את בעל המקצוע "${professional.name}"?`)) {
      deleteMutation.mutate({ id: professionalId });
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">לא דורג</span>;
    return (
      <span className="text-yellow-500 text-lg">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </span>
    );
  };

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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{professional.name}</h1>
          {professional.trade && (
            <Badge variant="secondary" style={{ backgroundColor: professional.trade.color || undefined }}>
              {professional.trade.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/professionals/${professionalId}/edit`}>
            <Button variant="outline">עריכה</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            מחיקה
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>פרטי התקשרות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {professional.companyName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">חברה:</span>
                  <span>{professional.companyName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">טלפון:</span>
                <a href={`tel:${professional.phone}`} className="text-primary hover:underline" dir="ltr">
                  {professional.phone}
                </a>
              </div>
              {professional.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אימייל:</span>
                  <a href={`mailto:${professional.email}`} className="text-primary hover:underline">
                    {professional.email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>רישיון וביטוח</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {professional.licenseNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מספר רישיון:</span>
                  <span>{professional.licenseNumber}</span>
                </div>
              )}
              {professional.insuranceExpiry && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">תוקף ביטוח:</span>
                  <span>{new Date(professional.insuranceExpiry).toLocaleDateString('he-IL')}</span>
                </div>
              )}
              {!professional.licenseNumber && !professional.insuranceExpiry && (
                <span className="text-muted-foreground">לא הוזנו פרטי רישיון</span>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>דירוג והתמחויות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">דירוג:</span>
                {renderRating(professional.rating)}
              </div>
              {professional.specialties && professional.specialties.length > 0 && (
                <div>
                  <span className="text-muted-foreground block mb-2">התמחויות:</span>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((specialty, i) => (
                      <Badge key={i} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">פרויקטים:</span>
                <span>{professional.totalProjects}</span>
              </div>
            </CardContent>
          </Card>

          {professional.notes && (
            <Card>
              <CardHeader>
                <CardTitle>הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{professional.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {professional.projects && professional.projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>פרויקטים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {professional.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted"
                  >
                    <span>{project.name}</span>
                    <span className="text-muted-foreground text-sm">{project.code}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
