'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMagicLink } from './use-magic-link';

export function MagicLinkForm() {
  const { email, setEmail, isLoading, message, handleSubmit } = useMagicLink();

  const isSuccess = message.includes('נשלח');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          dir="ltr"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'שולח...' : 'שלח קישור התחברות'}
      </Button>
      {message && (
        <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
