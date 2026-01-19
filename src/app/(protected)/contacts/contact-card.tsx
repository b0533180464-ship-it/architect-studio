/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ContactType = 'client' | 'supplier' | 'professional';

interface ContactCardProps {
  id: string;
  type: ContactType;
  name: string;
  subtitle?: string | null;
  phone?: string | null;
  email?: string | null;
  badge?: { label: string; color?: string | null } | null;
  rating?: number | null;
}

const TYPE_CONFIG = {
  client: { href: '/clients', label: 'לקוח', color: 'bg-blue-100 text-blue-800' },
  supplier: { href: '/suppliers', label: 'ספק', color: 'bg-green-100 text-green-800' },
  professional: { href: '/professionals', label: 'בעל מקצוע', color: 'bg-purple-100 text-purple-800' },
};

export function ContactCard({ id, type, name, subtitle, phone, email, badge, rating }: ContactCardProps) {
  const config = TYPE_CONFIG[type];
  const detailsHref = `${config.href}/${id}` as Route;
  const editHref = `${config.href}/${id}/edit` as Route;

  const renderRating = (r: number) => (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(r)}
      {'☆'.repeat(5 - r)}
    </span>
  );

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-background">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link href={detailsHref} className="font-medium hover:underline block truncate">
            {name}
          </Link>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <Badge variant="secondary" className={config.color}>
          {config.label}
        </Badge>
      </div>

      {badge && (
        <div className="mb-3">
          <Badge variant="outline" style={{ borderColor: badge.color || undefined, color: badge.color || undefined }}>
            {badge.label}
          </Badge>
        </div>
      )}

      <div className="space-y-1 text-sm text-muted-foreground mb-3">
        {phone && (
          <div className="flex items-center gap-2">
            <span>📞</span>
            <a href={`tel:${phone}`} className="hover:text-foreground" dir="ltr">
              {phone}
            </a>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <a href={`mailto:${email}`} className="hover:text-foreground truncate">
              {email}
            </a>
          </div>
        )}
      </div>

      {rating && <div className="mb-3">{renderRating(rating)}</div>}

      <div className="flex gap-2 pt-2 border-t">
        <Link href={detailsHref} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full">
            צפייה
          </Button>
        </Link>
        <Link href={editHref} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full">
            עריכה
          </Button>
        </Link>
      </div>
    </div>
  );
}
