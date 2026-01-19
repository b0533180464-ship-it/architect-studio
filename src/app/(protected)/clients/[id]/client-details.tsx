/* eslint-disable max-lines, max-lines-per-function, complexity, react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  lead: { label: 'ליד', variant: 'secondary' },
  active: { label: 'פעיל', variant: 'default' },
  past: { label: 'לקוח עבר', variant: 'outline' },
  inactive: { label: 'לא פעיל', variant: 'destructive' },
};

const typeLabels: Record<string, string> = {
  individual: 'פרטי',
  company: 'חברה',
};

const communicationLabels: Record<string, string> = {
  email: 'אימייל',
  phone: 'טלפון',
  whatsapp: 'וואטסאפ',
};

export function ClientDetails({ clientId }: { clientId: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: client, isLoading, error } = trpc.clients.getById.useQuery({ id: clientId });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      router.push('/clients');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">לקוח לא נמצא</p>
          <Link href="/clients">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
      deleteMutation.mutate({ id: clientId });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <Badge variant={statusLabels[client.status]?.variant || 'outline'}>
            {statusLabels[client.status]?.label || client.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <a href={`/clients/${clientId}/edit`}>
            <Button variant="outline">עריכה</Button>
          </a>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || (client.computed?.activeProjects ?? 0) > 0}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחיקה'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          {/* Client Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>פרטי לקוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">סוג לקוח</p>
                    <p className="font-medium">{typeLabels[client.type] || client.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">דרך תקשורת מועדפת</p>
                    <p className="font-medium">
                      {communicationLabels[client.preferredCommunication] || client.preferredCommunication}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פרטי התקשרות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {client.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">אימייל</p>
                      <p className="font-medium" dir="ltr">{client.email}</p>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">טלפון</p>
                      <p className="font-medium" dir="ltr">{client.phone}</p>
                    </div>
                  )}
                  {client.mobile && (
                    <div>
                      <p className="text-sm text-muted-foreground">נייד</p>
                      <p className="font-medium" dir="ltr">{client.mobile}</p>
                    </div>
                  )}
                  {client.city && (
                    <div>
                      <p className="text-sm text-muted-foreground">עיר</p>
                      <p className="font-medium">{client.city}</p>
                    </div>
                  )}
                  {client.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">כתובת</p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {client.type === 'company' && (client.companyNumber || client.contactPerson) && (
              <Card>
                <CardHeader>
                  <CardTitle>פרטי חברה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {client.companyNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">ח.פ / ע.מ</p>
                        <p className="font-medium" dir="ltr">{client.companyNumber}</p>
                      </div>
                    )}
                    {client.contactPerson && (
                      <div>
                        <p className="text-sm text-muted-foreground">איש קשר</p>
                        <p className="font-medium">{client.contactPerson}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>הערות</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Stats and Projects */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>סטטיסטיקות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">סה"כ פרויקטים</span>
                  <span className="text-2xl font-bold">{client.computed?.totalProjects || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">פרויקטים פעילים</span>
                  <span className="text-xl font-medium text-primary">
                    {client.computed?.activeProjects || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">פרויקטים שהושלמו</span>
                  <span className="text-xl font-medium">
                    {client.computed?.completedProjects || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {'projects' in client && Array.isArray(client.projects) && client.projects.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>פרויקטים אחרונים</CardTitle>
                  <a href={`/projects?clientId=${clientId}`}>
                    <Button variant="link" size="sm">הצג הכל</Button>
                  </a>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(client.projects as Array<{ id: string; name: string; code: string | null }>).map((project) => (
                      <a
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium">{project.name}</p>
                        {project.code && (
                          <p className="text-sm text-muted-foreground">{project.code}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <a href={`/projects/new?clientId=${clientId}`}>
              <Button className="w-full">+ פרויקט חדש</Button>
            </a>
          </div>
        </div>
    </>
  );
}
