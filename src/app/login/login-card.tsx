'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagicLinkForm } from './magic-link-form';

export function LoginCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Architect Studio</CardTitle>
        <CardDescription>התחבר למערכת ניהול המשרד שלך</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <MagicLinkForm />
        {/* Google OAuth will be added in a future phase */}
      </CardContent>
    </Card>
  );
}
