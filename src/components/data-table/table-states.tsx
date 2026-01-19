'use client';

interface TableSkeletonProps {
  columns: number;
}

/**
 * מצב טעינה לטבלה
 */
export function TableSkeleton({ columns }: TableSkeletonProps) {
  const colCount = Math.min(columns, 5);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="animate-pulse">
        <div className="h-12 bg-muted/30 border-b" />
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonRow key={i} columns={colCount} />
        ))}
      </div>
    </div>
  );
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <div className="h-14 border-b border-border/50">
      <div className="flex gap-2 p-3">
        {Array.from({ length: columns }).map((_, j) => (
          <div
            key={j}
            className="h-6 bg-muted/50 rounded"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

/**
 * מצב ריק לטבלה
 */
export function TableEmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
      <div className="text-4xl mb-4">📋</div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
