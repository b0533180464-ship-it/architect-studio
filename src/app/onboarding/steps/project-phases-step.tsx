'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const DEFAULT_PHASES = [
  { name: 'תכנון ראשוני', color: '#3B82F6' },
  { name: 'עיצוב', color: '#8B5CF6' },
  { name: 'ביצוע', color: '#F59E0B' },
  { name: 'פיקוח', color: '#10B981' },
  { name: 'סיום', color: '#6B7280' },
];

export function ProjectPhasesStep({ onNext, onPrevious }: StepProps) {
  const [useDefault, setUseDefault] = useState(true);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [error, setError] = useState('');

  const mutation = trpc.onboarding.setupProjectPhases.useMutation({
    onSuccess: () => onNext(),
    onError: (err) => setError(err.message),
  });
  const skipMutation = trpc.onboarding.skipStep.useMutation({ onSuccess: () => onNext() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ useDefault, customPhases: useDefault ? undefined : phases });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />
      <PhaseOptions useDefault={useDefault} setUseDefault={setUseDefault} />
      {!useDefault && <PhaseList phases={phases} setPhases={setPhases} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Buttons
        onPrevious={onPrevious}
        onSkip={() => skipMutation.mutate({ step: 4 })}
        isPending={mutation.isPending}
      />
    </form>
  );
}

function Header() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">שלבי פרויקט</h2>
      <p className="mt-2 text-muted-foreground">הגדר את שלבי העבודה בפרויקטים שלך</p>
    </div>
  );
}

interface PhaseOptionsProps {
  useDefault: boolean;
  setUseDefault: (v: boolean) => void;
}

function PhaseOptions({ useDefault, setUseDefault }: PhaseOptionsProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer">
        <input type="radio" checked={useDefault} onChange={() => setUseDefault(true)} />
        <div><p className="font-medium">שלבים ברירת מחדל</p>
          <p className="text-sm text-muted-foreground">תכנון → עיצוב → ביצוע → פיקוח → סיום</p></div>
      </label>
      <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer">
        <input type="radio" checked={!useDefault} onChange={() => setUseDefault(false)} />
        <div><p className="font-medium">שלבים מותאמים אישית</p>
          <p className="text-sm text-muted-foreground">הגדר שלבים משלך</p></div>
      </label>
    </div>
  );
}

interface Phase { name: string; color: string; }
interface PhaseListProps {
  phases: Phase[];
  setPhases: (p: Phase[]) => void;
}

function PhaseList({ phases, setPhases }: PhaseListProps) {
  const updatePhase = (i: number, field: keyof Phase, value: string) => {
    const newPhases = phases.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
    setPhases(newPhases);
  };
  const addPhase = () => setPhases([...phases, { name: '', color: '#3B82F6' }]);
  const removePhase = (i: number) => setPhases(phases.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {phases.map((phase, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input value={phase.name} onChange={(e) => updatePhase(i, 'name', e.target.value)}
            placeholder="שם השלב" className="flex-1" />
          <input type="color" value={phase.color} onChange={(e) => updatePhase(i, 'color', e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer" />
          {phases.length > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => removePhase(i)}>✕</Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addPhase} className="w-full">+ הוסף שלב</Button>
    </div>
  );
}

interface ButtonsProps { onPrevious: () => void; onSkip: () => void; isPending: boolean; }

function Buttons({ onPrevious, onSkip, isPending }: ButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onPrevious} className="flex-1">חזור</Button>
      <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">דלג</Button>
      <Button type="submit" className="flex-1" disabled={isPending}>
        {isPending ? 'שומר...' : 'המשך'}
      </Button>
    </div>
  );
}
