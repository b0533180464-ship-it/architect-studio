'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricColor = 'default' | 'success' | 'warning' | 'error';

export interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: MetricColor;
  trend?: 'up' | 'down' | 'neutral';
}

interface MetricsBarProps {
  metrics: Metric[];
  className?: string;
}

const colorClasses: Record<MetricColor, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function MetricsBar({ metrics, className }: MetricsBarProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const color = metric.color || 'default';

  return (
    <div
      className={cn(
        'rounded-xl p-4 text-center transition-all hover:scale-[1.02]',
        colorClasses[color]
      )}
    >
      <Icon className="mx-auto mb-2 h-6 w-6 opacity-70" />
      <div className="text-2xl font-bold ltr-nums">{metric.value}</div>
      <div className="text-sm opacity-80">{metric.label}</div>
    </div>
  );
}
