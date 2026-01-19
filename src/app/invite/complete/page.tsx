/* eslint-disable max-lines-per-function */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteForm } from './invite-form';

interface InvitationInfo {
  email: string;
  role: string;
  tenantName: string;
  invitedBy: string;
}

const roleLabels: Record<string, string> = {
  owner: 'בעלים',
  manager: 'מנהל',
  member: 'חבר צוות',
};

function InviteCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isExisting = searchParams.get('existing') === 'true';

  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login?error=missing_token');
      return;
    }

    fetch(`/api/auth/invite/info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push(`/login?error=${data.error}`);
        } else {
          setInvitationInfo(data);
        }
      })
      .catch(() => router.push('/login?error=server_error'))
      .finally(() => setLoading(false));
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="animate-pulse">טוען...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationInfo || !token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">הצטרפות לצוות</CardTitle>
          <CardDescription>
            הוזמנת להצטרף ל-<strong>{invitationInfo.tenantName}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">אימייל:</span>
              <span>{invitationInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">תפקיד:</span>
              <span>{roleLabels[invitationInfo.role] || invitationInfo.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">הוזמנת על ידי:</span>
              <span>{invitationInfo.invitedBy}</span>
            </div>
          </div>

          <InviteForm token={token} isExisting={isExisting} />
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">טוען...</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InviteCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InviteCompleteContent />
    </Suspense>
  );
}
