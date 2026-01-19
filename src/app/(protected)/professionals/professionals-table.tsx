/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

interface Trade {
  id: string;
  name: string;
  color: string | null;
}

interface Professional {
  id: string;
  name: string;
  companyName: string | null;
  phone: string;
  email: string | null;
  rating: number | null;
  trade: Trade | null;
  projectsCount: number;
}

interface ProfessionalsTableProps {
  professionals: Professional[];
}

export function ProfessionalsTable({ professionals }: ProfessionalsTableProps) {
  const utils = trpc.useUtils();
  const deleteMutation = trpc.professionals.delete.useMutation({
    onSuccess: () => utils.professionals.list.invalidate(),
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`האם למחוק את בעל המקצוע "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">-</span>;
    return (
      <span className="text-yellow-500">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-right">
            <th className="pb-3 font-medium text-muted-foreground">שם</th>
            <th className="pb-3 font-medium text-muted-foreground">מקצוע</th>
            <th className="pb-3 font-medium text-muted-foreground">חברה</th>
            <th className="pb-3 font-medium text-muted-foreground">טלפון</th>
            <th className="pb-3 font-medium text-muted-foreground">דירוג</th>
            <th className="pb-3 font-medium text-muted-foreground">פרויקטים</th>
            <th className="pb-3 font-medium text-muted-foreground text-left">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {professionals.map((pro) => (
            <tr key={pro.id} className="border-b hover:bg-muted/50">
              <td className="py-4">
                <Link href={`/professionals/${pro.id}`} className="font-medium hover:underline">
                  {pro.name}
                </Link>
              </td>
              <td className="py-4">
                {pro.trade ? (
                  <Badge variant="secondary" style={{ backgroundColor: pro.trade.color || undefined }}>
                    {pro.trade.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-4 text-muted-foreground">{pro.companyName || '-'}</td>
              <td className="py-4 text-muted-foreground" dir="ltr">{pro.phone}</td>
              <td className="py-4">{renderRating(pro.rating)}</td>
              <td className="py-4 text-muted-foreground">{pro.projectsCount}</td>
              <td className="py-4">
                <div className="flex gap-2 justify-end">
                  <Link href={`/professionals/${pro.id}/edit`}>
                    <Button variant="ghost" size="sm">עריכה</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(pro.id, pro.name)}
                    disabled={deleteMutation.isPending}
                  >
                    מחיקה
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
