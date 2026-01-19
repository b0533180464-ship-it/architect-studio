/* eslint-disable max-lines-per-function */
'use client';

import { cn } from '@/lib/utils';

interface ConfigEntity {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface ConfigBadgeProps {
  entity: ConfigEntity | null | undefined;
  fallback?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Dynamic badge that displays a configurable entity with its color from DB.
 * Uses light background with darker text for accessibility.
 */
export function ConfigBadge({ entity, fallback = '-', size = 'md', className }: ConfigBadgeProps) {
  if (!entity) {
    return <span className="text-muted-foreground text-sm">{fallback}</span>;
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-0.5 text-xs';

  // If entity has a color, use it with light background
  if (entity.color) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold',
          sizeClasses,
          className
        )}
        style={{
          backgroundColor: `${entity.color}20`, // 20 = ~12% opacity
          color: entity.color,
          border: `1px solid ${entity.color}40`, // 40 = ~25% opacity
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: entity.color }}
        />
        {entity.name}
      </span>
    );
  }

  // Default styling without custom color
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        'bg-secondary text-secondary-foreground border border-transparent',
        sizeClasses,
        className
      )}
    >
      {entity.name}
    </span>
  );
}
