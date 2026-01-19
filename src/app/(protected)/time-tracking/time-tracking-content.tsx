/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export function TimeTrackingContent() {
  const [billableOnly, setBillableOnly] = useState(false);
  const utils = trpc.useUtils();

  const { data: summary } = trpc.timeEntries.summary.useQuery({});
  const { data: entriesData, isLoading } = trpc.timeEntries.list.useQuery({
    isBillable: billableOnly ? true : undefined,
    pageSize: 50,
  });
  const { data: runningTimer } = trpc.timeEntries.running.useQuery();
  const { data: byProject } = trpc.timeEntries.byProject.useQuery({});

  const stopTimer = trpc.timeEntries.stopTimer.useMutation({
    onSuccess: () => { utils.timeEntries.invalidate(); },
  });

  const entries = entriesData?.items || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">מעקב זמן</h1>
        <Link href="/time-tracking/new"><Button>+ רישום זמן</Button></Link>
      </div>

      {runningTimer && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span className="animate-pulse h-3 w-3 bg-green-500 rounded-full inline-block" />
                  טיימר פעיל
                </div>
                <div className="text-sm text-muted-foreground">
                  {runningTimer.project.name} • התחלה: {runningTimer.startTime}
                </div>
              </div>
              <Button variant="destructive" onClick={() => stopTimer.mutate({ id: runningTimer.id })}>
                עצור טיימר
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{summary.totalHours.toFixed(1)}</div><div className="text-sm text-muted-foreground">סה&quot;כ שעות</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{summary.billableHours.toFixed(1)}</div><div className="text-sm text-muted-foreground">שעות לחיוב</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{formatCurrency(summary.billableAmount)}</div><div className="text-sm text-muted-foreground">סכום לחיוב</div></CardContent></Card>
        </div>
      )}

      {byProject && byProject.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>שעות לפי פרויקט</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byProject.slice(0, 5).map((p) => (
                <div key={p.projectId} className="flex justify-between items-center">
                  <span>{p.projectName}</span>
                  <span className="font-medium">{p.totalHours.toFixed(1)} שעות</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <Button variant={billableOnly ? 'default' : 'outline'} size="sm" onClick={() => setBillableOnly(!billableOnly)}>
            {billableOnly ? 'מציג לחיוב בלבד' : 'הצג לחיוב בלבד'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>רישומי זמן אחרונים</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">לא נמצאו רישומי זמן</div>
          ) : (
            <div className="divide-y">
              {entries.map((e) => (
                <Link key={e.id} href={`/time-tracking/${e.id}`} className="block py-4 hover:bg-muted/50 -mx-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {e.description || 'ללא תיאור'} • {e.user.firstName} {e.user.lastName}
                      </div>
                    </div>
                    <div className="text-left">
                      {e.isBillable && <Badge variant="outline">לחיוב</Badge>}
                      <div className="text-sm font-medium mt-1">{e.hours.toFixed(1)} שעות</div>
                      <div className="text-xs text-muted-foreground">{formatDate(e.date)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
