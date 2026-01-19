/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecurrenceSelector, type RecurrenceData } from '@/components/meetings/recurrence-selector';

export function NewMeetingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'other' as 'site_visit' | 'client_meeting' | 'supplier' | 'internal' | 'presentation' | 'installation' | 'other',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    projectId: '',
    clientId: '',
  });
  const [recurrence, setRecurrence] = useState<RecurrenceData>({
    enabled: false,
    frequency: 'weekly',
    endType: 'occurrences',
    occurrences: 10,
    endDate: '',
  });

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });
  const { data: clients } = trpc.clients.list.useQuery({ pageSize: 100 });

  const createMutation = trpc.meetings.create.useMutation({
    onSuccess: () => router.push('/meetings'),
  });
  const createRecurringMutation = trpc.meetings.createRecurring.useMutation({
    onSuccess: () => router.push('/meetings'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = formData.startDate && formData.startTime ? `${formData.startDate}T${formData.startTime}:00` : '';
    const endTime = formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}:00` : '';
    if (!startTime || !endTime) return;

    const meetingData = {
      title: formData.title,
      description: formData.description || undefined,
      meetingType: formData.meetingType,
      location: formData.location || undefined,
      startTime, endTime,
      projectId: formData.projectId || undefined,
      clientId: formData.clientId || undefined,
      attendeeUserIds: [], externalAttendees: [],
    };

    if (recurrence.enabled) {
      createRecurringMutation.mutate({
        meeting: meetingData,
        recurrence: {
          frequency: recurrence.frequency,
          ...(recurrence.endType === 'occurrences' ? { occurrences: recurrence.occurrences } : { endDate: recurrence.endDate }),
        },
      });
    } else {
      createMutation.mutate(meetingData);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">פגישה חדשה</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>יצירת פגישה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="שם הפגישה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="פרטי הפגישה"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meetingType">סוג פגישה</Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({ ...formData, meetingType: value as typeof formData.meetingType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site_visit">ביקור באתר</SelectItem>
                      <SelectItem value="client_meeting">פגישת לקוח</SelectItem>
                      <SelectItem value="supplier">ספקים</SelectItem>
                      <SelectItem value="internal">פנימי</SelectItem>
                      <SelectItem value="presentation">מצגת</SelectItem>
                      <SelectItem value="installation">התקנה</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">מיקום</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="כתובת או קישור לזום"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>תאריך ושעת התחלה *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate || e.target.value })}
                      required
                    />
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>תאריך ושעת סיום *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project">פרויקט</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר פרויקט (אופציונלי)" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.items.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">לקוח</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר לקוח (אופציונלי)" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.items.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <RecurrenceSelector value={recurrence} onChange={setRecurrence} />

              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending || createRecurringMutation.isPending}>
                  {(createMutation.isPending || createRecurringMutation.isPending) ? 'יוצר...' : 'צור פגישה'}
                </Button>
                <Link href="/meetings">
                  <Button type="button" variant="outline">ביטול</Button>
                </Link>
              </div>

              {(createMutation.error || createRecurringMutation.error) && (
                <p className="text-destructive text-sm">{createMutation.error?.message || createRecurringMutation.error?.message}</p>
              )}
            </form>
          </CardContent>
        </Card>
    </>
  );
}
