/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  token: string;
  isExisting: boolean;
}

export function InviteForm({ token, isExisting }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/invite/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, firstName, lastName }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(data.redirectTo || '/dashboard');
      } else {
        setError(data.error || 'שגיאה בהשלמת ההרשמה');
      }
    } catch {
      setError('שגיאת שרת');
    } finally {
      setSubmitting(false);
    }
  };

  if (isExisting) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>נמצא חשבון קיים עם האימייל הזה. לחץ להצטרפות לארגון.</AlertDescription>
        </Alert>
        <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
          {submitting ? 'מצטרף...' : 'הצטרף לארגון'}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">שם פרטי *</Label>
        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">שם משפחה *</Label>
        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'נרשם...' : 'השלם הרשמה והצטרף'}
      </Button>
    </form>
  );
}
