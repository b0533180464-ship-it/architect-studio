/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  ordered: { label: 'הוזמן', variant: 'secondary' },
  confirmed: { label: 'אושר', variant: 'outline' },
  in_production: { label: 'בייצור', variant: 'outline' },
  ready_to_ship: { label: 'מוכן למשלוח', variant: 'default' },
  shipped: { label: 'נשלח', variant: 'default' },
  in_transit: { label: 'בדרך', variant: 'default' },
  out_for_delivery: { label: 'בדרך ללקוח', variant: 'default' },
  delivered: { label: 'נמסר', variant: 'default' },
  issue: { label: 'בעיה', variant: 'destructive' },
};

const TIMELINE_STEPS = [
  { status: 'ordered', label: 'הוזמן' },
  { status: 'confirmed', label: 'אושר' },
  { status: 'in_production', label: 'בייצור' },
  { status: 'shipped', label: 'נשלח' },
  { status: 'in_transit', label: 'בדרך' },
  { status: 'delivered', label: 'נמסר' },
];

interface DeliveryDetailsProps {
  deliveryId: string;
}

interface StatusHistoryEntry {
  status: string;
  date: string;
  location?: string;
  note?: string;
}

export function DeliveryDetails({ deliveryId }: DeliveryDetailsProps) {
  const utils = trpc.useUtils();
  const { data: delivery, isLoading } = trpc.deliveryTracking.getById.useQuery({ id: deliveryId });

  const updateStatusMutation = trpc.deliveryTracking.updateStatus.useMutation({
    onSuccess: () => {
      utils.deliveryTracking.getById.invalidate({ id: deliveryId });
    },
  });

  const resolveIssueMutation = trpc.deliveryTracking.resolveIssue.useMutation({
    onSuccess: () => {
      utils.deliveryTracking.getById.invalidate({ id: deliveryId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">טוען...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">משלוח לא נמצא</p>
          <Link href="/deliveries"><Button variant="outline">חזרה לרשימה</Button></Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.status === delivery.status);
  const statusHistory = (delivery.statusHistory || []) as unknown as StatusHistoryEntry[];

  const handleNextStatus = () => {
    const nextStep = TIMELINE_STEPS[currentStepIndex + 1];
    if (nextStep) {
      updateStatusMutation.mutate({
        id: deliveryId,
        status: nextStep.status as 'ordered' | 'confirmed' | 'shipped' | 'delivered',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">מעקב משלוח</h1>
          <Badge variant={statusLabels[delivery.status]?.variant || 'outline'}>
            {statusLabels[delivery.status]?.label || delivery.status}
          </Badge>
          {delivery.hasIssue && <Badge variant="destructive">בעיה</Badge>}
        </div>
        <div className="flex gap-2">
          {delivery.hasIssue ? (
            <Button onClick={() => resolveIssueMutation.mutate({ id: deliveryId })}>
              סמן בעיה כפתורה
            </Button>
          ) : currentStepIndex < TIMELINE_STEPS.length - 1 ? (
            <Button onClick={handleNextStatus} disabled={updateStatusMutation.isPending}>
              עדכן ל: {TIMELINE_STEPS[currentStepIndex + 1]?.label}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>ציר זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex && delivery.status !== 'issue';
                  const isCurrent = index === currentStepIndex;
                  const historyEntry = statusHistory.find((h) => h.status === step.status);

                  return (
                    <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? 'bg-primary border-primary text-primary-foreground'
                              : isCurrent
                              ? 'border-primary'
                              : 'border-muted'
                          }`}
                        >
                          {isCompleted && '✓'}
                        </div>
                        {index < TIMELINE_STEPS.length - 1 && (
                          <div className={`w-0.5 flex-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                          {step.label}
                        </div>
                        {historyEntry && (
                          <div className="text-sm text-muted-foreground">
                            {new Date(historyEntry.date).toLocaleDateString('he-IL')}
                            {historyEntry.location && ` - ${historyEntry.location}`}
                            {historyEntry.note && <div>{historyEntry.note}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>פרטי משלוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">ספק</div>
                  <div className="font-medium">{delivery.supplier.name}</div>
                </div>
                {delivery.purchaseOrder && (
                  <div>
                    <div className="text-sm text-muted-foreground">הזמנה</div>
                    <Link
                      href={`/purchase-orders/${delivery.purchaseOrder.id}` as Route}
                      className="font-medium hover:underline"
                    >
                      {delivery.purchaseOrder.orderNumber}
                    </Link>
                  </div>
                )}
                {delivery.roomProduct && (
                  <div>
                    <div className="text-sm text-muted-foreground">מוצר</div>
                    <div className="font-medium">{delivery.roomProduct.product.name}</div>
                    {delivery.roomProduct.room && (
                      <div className="text-sm text-muted-foreground">
                        חדר: {delivery.roomProduct.room.name}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">תאריך הזמנה</div>
                  <div className="font-medium">
                    {new Date(delivery.orderDate).toLocaleDateString('he-IL')}
                  </div>
                </div>
                {delivery.estimatedDeliveryDate && (
                  <div>
                    <div className="text-sm text-muted-foreground">אספקה צפויה</div>
                    <div className="font-medium">
                      {new Date(delivery.estimatedDeliveryDate).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                )}
                {delivery.actualDeliveryDate && (
                  <div>
                    <div className="text-sm text-muted-foreground">נמסר בפועל</div>
                    <div className="font-medium">
                      {new Date(delivery.actualDeliveryDate).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {delivery.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle>מעקב</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">מספר מעקב</div>
                    <div className="font-medium">{delivery.trackingNumber}</div>
                  </div>
                  {delivery.carrier && (
                    <div>
                      <div className="text-sm text-muted-foreground">חברת משלוח</div>
                      <div className="font-medium">{delivery.carrier}</div>
                    </div>
                  )}
                  {delivery.trackingUrl && (
                    <a
                      href={delivery.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      צפה במעקב ←
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {delivery.hasIssue && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">בעיה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-1">{delivery.issueType}</div>
                  <div>{delivery.issueDescription}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </>
  );
}
