/* eslint-disable max-lines-per-function, max-lines */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NavIcon } from '@/components/layout/dynamic-sidebar/nav-icon';
import { EditableCell } from '@/components/generic-table/editable-cell';
import type { CustomFieldType, FieldOption } from '@/components/generic-table/fields';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { DetailRelationsSection } from './detail-relations-section';

interface FieldDef {
  id: string;
  fieldKey: string;
  name: string;
  fieldType: CustomFieldType;
  options?: FieldOption[] | null;
}

interface EntityDetailContentProps {
  slug: string;
  entityId: string;
}

export function EntityDetailContent({ slug, entityId }: EntityDetailContentProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: entityType, isLoading: typeLoading } = trpc.entityTypes.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: entity, isLoading: entityLoading } = trpc.genericEntities.getById.useQuery(
    { id: entityId },
    { enabled: !!entityId }
  );

  const { data: fields } = trpc.genericEntityFields.list.useQuery(
    { entityTypeSlug: slug, activeOnly: true },
    { enabled: !!slug }
  );

  const updateMutation = trpc.genericEntities.update.useMutation({
    onSuccess: () => {
      utils.genericEntities.getById.invalidate({ id: entityId });
    },
  });

  const deleteMutation = trpc.genericEntities.delete.useMutation({
    onSuccess: () => {
      router.push(`/entities/${slug}`);
    },
  });

  const handleFieldUpdate = (fieldKey: string, value: unknown) => {
    if (!entity) return;
    const currentData = (entity.data as Record<string, unknown>) ?? {};
    const newData = { ...currentData, [fieldKey]: value };
    updateMutation.mutate({ id: entityId, data: newData });
  };

  const handleNameUpdate = (value: unknown) => {
    if (!entity || typeof value !== 'string') return;
    updateMutation.mutate({ id: entityId, name: value });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: entityId });
  };

  if (typeLoading || entityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entityType || !entity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">הישות לא נמצאה</p>
      </div>
    );
  }

  const data = (entity.data as Record<string, unknown>) ?? {};

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/entities/${slug}`)}
        className="gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        חזרה ל{entityType.namePlural}
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${entityType.color}20`, color: entityType.color ?? undefined }}
          >
            <NavIcon name={entityType.icon} className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{entity.name}</h1>
            <p className="text-muted-foreground">{entityType.name}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 ml-2" />
          מחיקה
        </Button>
      </div>

      {/* Fields Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">פרטים</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name field - editable */}
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">שם</dt>
              <dd className="font-medium">
                <EditableCell
                  type="text"
                  value={entity.name}
                  onSave={handleNameUpdate}
                />
              </dd>
            </div>

            {/* Custom fields - editable */}
            {(fields as FieldDef[] | undefined)?.map((field) => (
              <div key={field.id} className="space-y-1">
                <dt className="text-sm text-muted-foreground">{field.name}</dt>
                <dd className="font-medium">
                  <EditableCell
                    type={field.fieldType}
                    value={data[field.fieldKey]}
                    onSave={(value) => handleFieldUpdate(field.fieldKey, value)}
                    options={field.options ?? []}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Relations Section */}
      <DetailRelationsSection slug={slug} entityId={entityId} />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityName={entity.name}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
