import type { ColumnDef } from '@/components/data-table/types';

// אופציות עדיפות
export const priorityOptions = [
  { value: 'low', label: 'נמוכה', color: '#94a3b8' },
  { value: 'medium', label: 'בינונית', color: '#3b82f6' },
  { value: 'high', label: 'גבוהה', color: '#f59e0b' },
  { value: 'urgent', label: 'דחוף', color: '#ef4444' },
];

// טיפוס משימה לטבלה
export interface TaskTableItem {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | string | null;
  projectId: string | null;
  statusId: string | null;
  categoryId: string | null;
  assignedToId: string | null;
  project?: { id: string; name: string } | null;
}

// הגדרות עמודות למשימות
export const tasksColumns: ColumnDef<TaskTableItem>[] = [
  {
    key: 'title',
    label: 'כותרת',
    type: 'text',
    width: 'auto',
    minWidth: 200,
    required: true,
    sticky: true,
    placeholder: 'הזן כותרת...',
  },
  {
    key: 'statusId',
    label: 'סטטוס',
    type: 'config-select',
    width: 130,
    entityType: 'task_status',
    placeholder: 'בחר סטטוס',
  },
  {
    key: 'priority',
    label: 'עדיפות',
    type: 'select',
    width: 110,
    options: priorityOptions,
    placeholder: 'בחר עדיפות',
  },
  {
    key: 'dueDate',
    label: 'תאריך יעד',
    type: 'date',
    width: 120,
    placeholder: 'בחר תאריך',
  },
  {
    key: 'categoryId',
    label: 'קטגוריה',
    type: 'config-select',
    width: 130,
    entityType: 'task_category',
    placeholder: 'בחר קטגוריה',
  },
  {
    key: 'projectId',
    label: 'פרויקט',
    type: 'select',
    width: 150,
    placeholder: 'בחר פרויקט',
  },
  {
    key: 'description',
    label: 'תיאור',
    type: 'textarea',
    width: 60,
    placeholder: 'הזן תיאור...',
  },
];
