/* eslint-disable max-lines-per-function, complexity */
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectInfoProps {
  code: string | null;
  client: { id: string; name: string };
  description: string | null;
  address: string | null;
  city: string | null;
  area: number | null;
  floors: number | null;
  billingType: string;
  budget: number | null;
  fixedFee: number | null;
  scope: string | null;
}

const billingTypeLabels: Record<string, string> = {
  fixed: 'מחיר קבוע',
  hourly: 'שעתי',
  percentage: 'אחוז מתקציב',
  cost_plus: 'Cost+',
  hybrid: 'משולב',
};

function formatCurrency(amount: number | null): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
}

export function ProjectInfo({
  code, client, description, address, city, area, floors, billingType, budget, fixedFee, scope,
}: ProjectInfoProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>פרטי פרויקט</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {code && (
              <div>
                <p className="text-sm text-muted-foreground">קוד פרויקט</p>
                <p className="font-medium">{code}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">לקוח</p>
              <Link href={`/clients/${client.id}`} className="font-medium hover:underline">{client.name}</Link>
            </div>
          </div>
          {description && (
            <div>
              <p className="text-sm text-muted-foreground">תיאור</p>
              <p className="whitespace-pre-wrap">{description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>מיקום</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {address && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">כתובת</p>
                <p className="font-medium">{address}</p>
              </div>
            )}
            {city && (
              <div>
                <p className="text-sm text-muted-foreground">עיר</p>
                <p className="font-medium">{city}</p>
              </div>
            )}
            {area && (
              <div>
                <p className="text-sm text-muted-foreground">שטח</p>
                <p className="font-medium">{area} מ״ר</p>
              </div>
            )}
            {floors && (
              <div>
                <p className="text-sm text-muted-foreground">קומות</p>
                <p className="font-medium">{floors}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>תקציב ותמחור</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">סוג תמחור</p>
              <p className="font-medium">{billingTypeLabels[billingType] || billingType}</p>
            </div>
            {budget && (
              <div>
                <p className="text-sm text-muted-foreground">תקציב</p>
                <p className="font-medium">{formatCurrency(budget)}</p>
              </div>
            )}
            {fixedFee && (
              <div>
                <p className="text-sm text-muted-foreground">שכ״ט</p>
                <p className="font-medium">{formatCurrency(fixedFee)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {scope && (
        <Card>
          <CardHeader><CardTitle>היקף עבודה</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{scope}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
