/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowRight, Trash2 } from 'lucide-react';

export function TimeEntryDetailContent({ id }: { id: string }) {
  const router = useRouter();

  const { data: entry, isLoading } = trpc.timeEntries.getById.useQuery({ id });

  const deleteMutation = trpc.timeEntries.delete.useMutation({
    onSuccess: () => { router.push('/time-tracking'); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">טוען...</div>;
  if (!entry) return <div className="text-center py-8 text-muted-foreground">רישום זמן לא נמצא</div>;

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק רישום זמן זה?')) {
      deleteMutation.mutate({ id });
    }
  };

  const totalAmount = entry.isBillable && entry.hourlyRate ? entry.hours * entry.hourlyRate : null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/time-tracking"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-semibold">רישום זמן</h1>
            <div className="text-sm text-muted-foreground">{formatDate(entry.date)}</div>
          </div>
          {entry.isBillable ? <Badge variant="success">לחיוב</Badge> : <Badge variant="secondary">לא לחיוב</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/time-tracking/${id}/edit`)}>עריכה</Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>פרטים כלליים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">פרויקט</div><div className="font-medium">{entry.project.name}</div></div>
            <div><div className="text-sm text-muted-foreground">משתמש</div><div className="font-medium">{entry.user.firstName} {entry.user.lastName}</div></div>
            {entry.task && <div><div className="text-sm text-muted-foreground">משימה</div><div className="font-medium">{entry.task.title}</div></div>}
            {entry.description && <div><div className="text-sm text-muted-foreground">תיאור</div><div className="font-medium">{entry.description}</div></div>}
            <div><div className="text-sm text-muted-foreground">תאריך</div><div className="font-medium">{formatDate(entry.date)}</div></div>
            {entry.startTime && entry.endTime && (
              <div><div className="text-sm text-muted-foreground">שעות</div><div className="font-medium">{entry.startTime} - {entry.endTime}</div></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>זמן וחיוב</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="text-sm text-muted-foreground">שעות</div><div className="text-2xl font-bold">{entry.hours} שעות</div></div>
            {entry.isBillable && (
              <>
                {entry.hourlyRate && (
                  <div><div className="text-sm text-muted-foreground">תעריף לשעה</div><div className="text-xl font-medium">{formatCurrency(entry.hourlyRate)}</div></div>
                )}
                {totalAmount && (
                  <div><div className="text-sm text-muted-foreground">סכום לחיוב</div><div className="text-xl font-medium text-green-600">{formatCurrency(totalAmount)}</div></div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
