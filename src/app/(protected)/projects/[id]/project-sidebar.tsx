/* eslint-disable max-lines-per-function, @next/next/no-img-element */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  title?: string | null;
}

interface ProjectSidebarProps {
  startDate: Date | null;
  expectedEndDate: Date | null;
  actualEndDate: Date | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  isArchived: boolean;
  assignedUsers: User[];
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ProjectSidebar({
  startDate, expectedEndDate, actualEndDate,
  daysRemaining, isOverdue, isArchived, assignedUsers,
}: ProjectSidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>תאריכים</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">התחלה</span>
            <span className="font-medium">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">יעד</span>
            <span className="font-medium">{formatDate(expectedEndDate)}</span>
          </div>
          {actualEndDate && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">סיום בפועל</span>
              <span className="font-medium">{formatDate(actualEndDate)}</span>
            </div>
          )}
          {daysRemaining !== null && !isArchived && (
            <div className="pt-2 border-t">
              {isOverdue ? (
                <p className="text-destructive font-medium">באיחור של {Math.abs(daysRemaining)} ימים</p>
              ) : (
                <p className="text-muted-foreground">{daysRemaining} ימים לסיום</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>צוות</CardTitle></CardHeader>
        <CardContent>
          {assignedUsers.length > 0 ? (
            <div className="space-y-3">
              {assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      `${user.firstName[0]}${user.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    {user.title && <p className="text-sm text-muted-foreground">{user.title}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">לא הוקצו חברי צוות</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
