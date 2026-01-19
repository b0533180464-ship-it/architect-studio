'use client';

import { Input } from '@/components/ui/input';

interface ContactsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ContactsSearch({ value, onChange, placeholder }: ContactsSearchProps) {
  return (
    <div className="relative max-w-md">
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'חיפוש אנשי קשר...'}
        className="pr-10"
      />
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
