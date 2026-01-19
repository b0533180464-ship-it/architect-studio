'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface EntitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  detailUrl?: string;
  children: React.ReactNode;
}

/**
 * Side Panel גנרי להצגת פרטי ישות
 * נפתח מצד ימין (RTL) עם תוכן גלילה
 */
export function EntitySheet({
  open,
  onOpenChange,
  title,
  detailUrl,
  children,
}: EntitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle>{title}</SheetTitle>
            {detailUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={detailUrl} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  פתח בדף מלא
                </a>
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface EntitySheetSectionProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * סקשן בתוך ה-Sheet
 */
export function EntitySheetSection({ title, children }: EntitySheetSectionProps) {
  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface EntitySheetFieldProps {
  label: string;
  children: React.ReactNode;
}

/**
 * שדה יחיד בתוך ה-Sheet
 */
export function EntitySheetField({ label, children }: EntitySheetFieldProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
