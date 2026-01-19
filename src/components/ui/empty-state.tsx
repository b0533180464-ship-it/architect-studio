'use client';

import { LucideIcon, FileText, Users, FolderOpen, Calendar, CheckSquare, Package, Receipt, MessageSquare } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// Pre-configured empty states for common entities
export const emptyStates = {
  tasks: {
    icon: CheckSquare,
    title: 'אין משימות',
    description: 'צור משימה חדשה כדי להתחיל לעקוב אחרי העבודה שלך',
  },
  projects: {
    icon: FolderOpen,
    title: 'אין פרויקטים',
    description: 'צור פרויקט חדש כדי להתחיל לנהל את העבודה שלך',
  },
  clients: {
    icon: Users,
    title: 'אין לקוחות',
    description: 'הוסף לקוח חדש כדי להתחיל לנהל את קשרי הלקוחות',
  },
  documents: {
    icon: FileText,
    title: 'אין מסמכים',
    description: 'העלה מסמך או צור תיקיה חדשה',
  },
  meetings: {
    icon: Calendar,
    title: 'אין פגישות',
    description: 'קבע פגישה חדשה עם לקוח או צוות',
  },
  products: {
    icon: Package,
    title: 'אין מוצרים',
    description: 'הוסף מוצרים לקטלוג שלך',
  },
  invoices: {
    icon: Receipt,
    title: 'אין חשבוניות',
    description: 'צור חשבונית חדשה ללקוח',
  },
  communications: {
    icon: MessageSquare,
    title: 'אין תקשורת',
    description: 'אין רשומות תקשורת עם לקוח זה',
  },
  search: {
    icon: FileText,
    title: 'לא נמצאו תוצאות',
    description: 'נסה לחפש במילות מפתח אחרות',
  },
} as const;

interface PresetEmptyStateProps {
  preset: keyof typeof emptyStates;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PresetEmptyState({ preset, action }: PresetEmptyStateProps) {
  const config = emptyStates[preset];
  return <EmptyState icon={config.icon} title={config.title} description={config.description} action={action} />;
}
