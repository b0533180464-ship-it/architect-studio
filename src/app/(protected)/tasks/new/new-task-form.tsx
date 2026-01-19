/* eslint-disable max-lines-per-function, max-lines */
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
import { ConfigSelect } from '@/components/ui/config-select';

export function NewTaskForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    statusId: '',
    categoryId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    projectId: '',
  });

  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      router.push('/tasks');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      statusId: formData.statusId || undefined,
      categoryId: formData.categoryId || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      projectId: formData.projectId || undefined,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">משימה חדשה</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>יצירת משימה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="שם המשימה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="פרטי המשימה"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <ConfigSelect
                    entityType="task_status"
                    value={formData.statusId}
                    onChange={(value) => setFormData({ ...formData, statusId: value })}
                    placeholder="בחר סטטוס"
                  />
                </div>
                <div className="space-y-2">
                  <Label>קטגוריה</Label>
                  <ConfigSelect
                    entityType="task_category"
                    value={formData.categoryId}
                    onChange={(value) => setFormData({ ...formData, categoryId: value })}
                    placeholder="בחר קטגוריה"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">עדיפות</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' | 'urgent' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">נמוכה</SelectItem>
                      <SelectItem value="medium">בינונית</SelectItem>
                      <SelectItem value="high">גבוהה</SelectItem>
                      <SelectItem value="urgent">דחוף</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">תאריך יעד</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

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

              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'יוצר...' : 'צור משימה'}
                </Button>
                <Link href="/tasks">
                  <Button type="button" variant="outline">
                    ביטול
                  </Button>
                </Link>
              </div>

              {createMutation.error && (
                <p className="text-destructive text-sm">{createMutation.error.message}</p>
              )}
            </form>
          </CardContent>
        </Card>
    </>
  );
}
