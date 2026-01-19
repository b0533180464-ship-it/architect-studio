'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

interface StepProps { onNext: () => void; onPrevious: () => void; }
type ImportSource = 'csv' | 'excel' | 'other_system' | undefined;

export function DataImportStep({ onNext, onPrevious }: StepProps) {
  const [importClients, setImportClients] = useState(false);
  const [importProducts, setImportProducts] = useState(false);
  const [source, setSource] = useState<ImportSource>(undefined);
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupDataImport.useMutation({
    onSuccess: () => onNext(), onError: (err) => setError(err.message),
  });
  const skipMutation = trpc.onboarding.skipStep.useMutation({ onSuccess: () => onNext() });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ importClients, importProducts, source }); }} className="space-y-6">
      <Header />
      <ImportOptions iC={importClients} iP={importProducts} setIC={setImportClients} setIP={setImportProducts} />
      {(importClients || importProducts) && <SourceSelect source={source} setSource={setSource} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Buttons onPrev={onPrevious} onSkip={() => skipMutation.mutate({ step: 6 })} isPending={mutation.isPending} />
    </form>
  );
}

function Header() {
  return (<div className="text-center"><h2 className="text-2xl font-bold">ייבוא נתונים</h2>
    <p className="mt-2 text-muted-foreground">ייבא לקוחות ומוצרים ממערכת קיימת</p></div>);
}

interface ImportOptionsProps { iC: boolean; iP: boolean; setIC: (v: boolean) => void; setIP: (v: boolean) => void; }

function ImportOptions({ iC, iP, setIC, setIP }: ImportOptionsProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer">
        <input type="checkbox" checked={iC} onChange={(e) => setIC(e.target.checked)} />
        <div><p className="font-medium">ייבא לקוחות</p><p className="text-sm text-muted-foreground">רשימת לקוחות קיימים</p></div>
      </label>
      <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer">
        <input type="checkbox" checked={iP} onChange={(e) => setIP(e.target.checked)} />
        <div><p className="font-medium">ייבא מוצרים</p><p className="text-sm text-muted-foreground">קטלוג מוצרים וספקים</p></div>
      </label>
    </div>
  );
}

interface SourceSelectProps { source: ImportSource; setSource: (s: ImportSource) => void; }

function SourceSelect({ source, setSource }: SourceSelectProps) {
  return (
    <div className="space-y-2">
      <Label>מקור הנתונים</Label>
      <div className="grid grid-cols-3 gap-3">
        {(['csv', 'excel', 'other_system'] as const).map((v) => (
          <button key={v} type="button" onClick={() => setSource(v)}
            className={`p-3 rounded-lg border text-center ${source === v ? 'border-primary bg-primary/10' : ''}`}>
            {v === 'csv' ? 'CSV' : v === 'excel' ? 'Excel' : 'מערכת אחרת'}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ButtonsProps { onPrev: () => void; onSkip: () => void; isPending: boolean; }

function Buttons({ onPrev, onSkip, isPending }: ButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrev} className="flex-1">חזור</Button>
      <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">דלג</Button>
      <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? 'שומר...' : 'המשך'}</Button>
    </div>
  );
}
