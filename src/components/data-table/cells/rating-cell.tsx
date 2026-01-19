'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingCellProps } from '../types';

/**
 * תא דירוג כוכבים
 * לחיצה על כוכב = שמירה מיידית
 */
export function RatingCell({ value, onSave, disabled, max = 5 }: RatingCellProps) {
  const handleClick = (rating: number) => {
    if (disabled) return;
    onSave(rating === value ? null : rating);
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const rating = i + 1;
        const filled = value !== null && rating <= value;
        return (
          <button key={rating} type="button" onClick={() => handleClick(rating)} disabled={disabled} className={cn('p-0.5 rounded hover:bg-muted/50 transition-colors', disabled && 'cursor-default hover:bg-transparent')}>
            <Star className={cn('h-4 w-4', filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
          </button>
        );
      })}
    </div>
  );
}
