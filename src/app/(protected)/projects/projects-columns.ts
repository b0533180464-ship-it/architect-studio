import type { ColumnDef } from '@/components/data-table/types';

// אופציות עדיפות
export const priorityOptions = [
  { value: 'low', label: 'נמוכה', color: '#94a3b8' },
  { value: 'medium', label: 'בינונית', color: '#3b82f6' },
  { value: 'high', label: 'גבוהה', color: '#f59e0b' },
  { value: 'urgent', label: 'דחוף', color: '#ef4444' },
];

// אופציות סוג תמחור
export const billingTypeOptions = [
  { value: 'fixed', label: 'מחיר קבוע' },
  { value: 'hourly', label: 'שעתי' },
  { value: 'percentage', label: 'אחוז מתקציב' },
  { value: 'cost_plus', label: 'Cost+' },
  { value: 'hybrid', label: 'משולב' },
];

// טיפוס פרויקט לטבלה
export interface ProjectTableItem {
  id: string;
  name: string;
  code: string | null;
  clientId: string;
  typeId: string | null;
  statusId: string | null;
  phaseId: string | null;
  priority: string;
  isVIP: boolean;
  address: string | null;
  city: string | null;
  area: number | null;
  budget: number | null;
  billingType: string;
  fixedFee: number | null;
  startDate: Date | string | null;
  expectedEndDate: Date | string | null;
  description: string | null;
  scope: string | null;
  archivedAt: Date | null;
  client: { id: string; name: string };
  assignedUsers: Array<{ id: string; firstName: string; lastName: string; avatar: string | null }>;
  projectType?: { id: string; name: string; color: string | null } | null;
  projectStatus?: { id: string; name: string; color: string | null } | null;
  projectPhase?: { id: string; name: string; color: string | null } | null;
}

// הגדרות עמודות לפרויקטים - 17 עמודות + 2 textarea
export const projectsColumns: ColumnDef<ProjectTableItem>[] = [
  { key: 'name', label: 'שם פרויקט', type: 'text', width: 'auto', minWidth: 200, required: true, sticky: true },
  { key: 'code', label: 'קוד', type: 'text', width: 100 },
  { key: 'clientId', label: 'לקוח', type: 'select', width: 150, required: true },
  { key: 'typeId', label: 'סוג', type: 'config-select', width: 120, entityType: 'project_type' },
  { key: 'statusId', label: 'סטטוס', type: 'config-select', width: 120, entityType: 'project_status' },
  { key: 'phaseId', label: 'שלב', type: 'config-select', width: 120, entityType: 'project_phase' },
  { key: 'priority', label: 'עדיפות', type: 'select', width: 110, options: priorityOptions },
  { key: 'isVIP', label: 'VIP', type: 'checkbox', width: 60 },
  { key: 'address', label: 'כתובת', type: 'text', width: 150 },
  { key: 'city', label: 'עיר', type: 'text', width: 100 },
  { key: 'area', label: 'שטח', type: 'number', width: 80 },
  { key: 'budget', label: 'תקציב', type: 'currency', width: 100 },
  { key: 'billingType', label: 'תמחור', type: 'select', width: 120, options: billingTypeOptions },
  { key: 'fixedFee', label: 'שכ"ט', type: 'currency', width: 100 },
  { key: 'startDate', label: 'התחלה', type: 'date', width: 120 },
  { key: 'expectedEndDate', label: 'יעד', type: 'date', width: 120 },
  { key: 'description', label: 'תיאור', type: 'textarea', width: 60 },
  { key: 'scope', label: 'היקף', type: 'textarea', width: 60 },
];
