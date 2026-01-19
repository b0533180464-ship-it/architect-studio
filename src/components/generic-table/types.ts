/**
 * Generic Table Types
 * סוגים עבור טבלה גנרית עם שדות מותאמים ותצוגות
 */

import type { CustomFieldType } from '@/server/routers/customFields/schemas';
import type { ViewEntityType, filterOperatorEnum } from '@/server/routers/views/schemas';
import type { z } from 'zod';

export type FilterOperator = z.infer<typeof filterOperatorEnum>;

// Custom field definition
export interface CustomFieldDef {
  id: string;
  fieldKey: string;
  name: string;
  fieldType: CustomFieldType;
  options?: { value: string; label: string; color?: string }[] | null;
  isRequired: boolean;
  defaultValue?: string | null;
  placeholder?: string | null;
  width?: number | null;
  order: number;
}

// Column configuration (from view)
export interface ColumnConfig {
  fieldKey: string;
  width?: number;
  visible: boolean;
  order: number;
}

// Filter configuration
export interface FilterConfig {
  fieldKey: string;
  operator: FilterOperator;
  value: unknown;
}

// Full column definition (merged field + config)
export interface GenericColumn {
  key: string;
  label: string;
  width: number;
  visible: boolean;
  order: number;
  // Field info
  isCustomField: boolean;
  fieldId?: string;
  fieldType?: CustomFieldType;
  options?: { value: string; label: string; color?: string }[];
  isRequired?: boolean;
  // Capabilities
  sortable: boolean;
  hideable: boolean;
  editable: boolean;
  deletable: boolean;
}

// View state
export interface ViewState {
  id: string | null;
  columns: ColumnConfig[];
  sortBy: string | null;
  sortOrder: 'asc' | 'desc' | null;
  filters: FilterConfig[];
  groupBy: string | null;
}

// Generic table props
export interface GenericTableProps<T extends { id: string }> {
  // Entity info
  entityType: ViewEntityType;
  // Data
  data: T[];
  isLoading?: boolean;
  // Base columns (built-in fields)
  baseColumns: BaseColumnDef<T>[];
  // Callbacks
  onRowClick?: (item: T) => void;
  onCellUpdate?: (id: string, fieldKey: string, value: unknown, isCustomField: boolean) => void;
  onAddCustomField?: (fieldType: CustomFieldType, name: string, fieldKey: string) => void;
  onUpdateCustomField?: (fieldId: string, name: string) => void;
  onDeleteCustomField?: (fieldId: string) => void;
  // Empty state
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

// Base column definition (for built-in fields)
export interface BaseColumnDef<T> {
  key: keyof T & string;
  label: string;
  width: number;
  fieldType: CustomFieldType;
  sortable?: boolean;
  hideable?: boolean;
  sticky?: boolean;
  options?: { value: string; label: string; color?: string }[];
  render?: (item: T) => React.ReactNode;
}
