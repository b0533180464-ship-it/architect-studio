/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface TimeEntriesSectionProps {
  projectId: string;
}

export function TimeEntriesSection({ projectId }: TimeEntriesSectionProps) {
  const { data } = trpc.timeEntries.list.useQuery({ projectId, pageSize: 5 });

  const entries = data?.items || [];
  const total = data?.pagination.total || 0;

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = entries.filter((e) => e.isBillable).reduce((sum, e) => sum + e.hours, 0);
  const billableAmount = entries
    .filter((e) => e.isBillable && e.hourlyRate)
    .reduce((sum, e) => sum + e.hours * (e.hourlyRate || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">רישומי זמן ({total})</h4>
        <Link href={`/time-tracking/new?projectId=${projectId}`}>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Plus className="h-4 w-4 ml-1" />
            חדש
          </Button>
        </Link>
      </div>

      {total > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <span>סה״כ: {totalHours} שעות</span>
          <span>לחיוב: {billableHours} שעות</span>
          {billableAmount > 0 && <span>סכום: {formatCurrency(billableAmount)}</span>}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">אין רישומי זמן</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/time-tracking/${entry.id}`}>
              <div className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm">
                <div className="flex-1 min-w-0">
                  <span className="truncate block">
                    {entry.description || `${entry.hours} שעות`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.date)}
                    {entry.user && ` • ${entry.user.firstName} ${entry.user.lastName}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.hours} ש׳</span>
                  {entry.isBillable ? (
                    <Badge className="bg-green-100 text-green-700">לחיוב</Badge>
                  ) : (
                    <Badge variant="secondary">פנימי</Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {total > 5 && (
            <Link href={`/time-tracking?projectId=${projectId}`}>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                צפה בכל {total} רישומי הזמן
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
