'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  withoutImage: number;
  byCategory: { categoryId: string | null; categoryName?: string | null; count: number }[];
}

interface ProductsStatsProps {
  stats: Stats;
}

export function ProductsStats({ stats }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm text-muted-foreground">מוצרים פעילים</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.inactive}</div>
          <div className="text-sm text-muted-foreground">לא פעילים</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.withoutImage}</div>
          <div className="text-sm text-muted-foreground">ללא תמונה</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.byCategory.length}</div>
          <div className="text-sm text-muted-foreground">קטגוריות</div>
        </CardContent>
      </Card>
    </div>
  );
}
