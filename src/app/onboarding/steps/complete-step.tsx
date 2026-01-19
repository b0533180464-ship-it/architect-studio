'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import type { Route } from 'next';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function CompleteStep({ onPrevious }: StepProps) {
  const router = useRouter();
  const mutation = trpc.onboarding.complete.useMutation({
    onSuccess: (data) => router.push(data.redirectTo as Route),
  });

  return (
    <div className="space-y-6 text-center">
      <SuccessIcon />
      <SuccessMessage />
      <NextSteps />
      <CompleteButtons onPrevious={onPrevious} onComplete={() => mutation.mutate()} isPending={mutation.isPending} />
    </div>
  );
}

function SuccessIcon() {
  return <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">🎉</div>;
}

function SuccessMessage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">מעולה!</h2>
      <p className="mt-2 text-muted-foreground">המשרד שלך מוכן לפעולה</p>
    </div>
  );
}

function NextSteps() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-right">
      <h3 className="font-medium">מה הלאה?</h3>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li>✓ הוסף את הלקוחות הראשונים שלך</li>
        <li>✓ צור פרויקט חדש</li>
        <li>✓ הזמן חברי צוות נוספים</li>
        <li>✓ התאם אישית את ההגדרות</li>
      </ul>
    </div>
  );
}

interface CompleteButtonsProps {
  onPrevious: () => void;
  onComplete: () => void;
  isPending: boolean;
}

function CompleteButtons({ onPrevious, onComplete, isPending }: CompleteButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">חזור</Button>
      <Button onClick={onComplete} className="flex-1" disabled={isPending}>
        {isPending ? 'מסיים...' : 'בוא נתחיל!'}
      </Button>
    </div>
  );
}
