/* eslint-disable max-lines-per-function */
'use client';

import { useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertBannerProps {
  type: AlertType;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const alertStyles: Record<AlertType, { bg: string; text: string; icon: typeof AlertCircle }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    icon: Info,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    icon: CheckCircle,
  },
};

export function AlertBanner({
  type,
  children,
  dismissible = false,
  className,
  onDismiss,
}: AlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const styles = alertStyles[type];
  const Icon = styles.icon;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg px-4 py-3',
        styles.bg,
        styles.text,
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="סגור התראה"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
