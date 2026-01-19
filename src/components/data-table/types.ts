/**
 * Data Table Types
 * סוגים עבור טבלאות עם עריכה inline
 */

// סוגי תאים נתמכים
export type CellType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'config-select'
  | 'checkbox'
  | 'textarea'
  | 'multi-user'
  | 'rating'
  | 'multi-tag';

// אופציה לבחירה
export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

// הגדרת עמודה
export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  type: CellType;
  width: number | string;
  minWidth?: number;
  required?: boolean;
  sticky?: boolean;

  // לסוגים ספציפיים
  options?: SelectOption[];
  entityType?: string; // ל-config-select
  step?: number; // ל-number
  min?: number;
  max?: number;
  placeholder?: string;
}

// Props לטבלה
export interface EditableTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate: (id: string, field: keyof T & string, value: unknown) => void;
  onRowClick?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

// Props לשורה
export interface EditableRowProps<T extends { id: string }> {
  item: T;
  columns: ColumnDef<T>[];
  onUpdate: (field: keyof T & string, value: unknown) => void;
  onClick?: () => void;
}

// Props משותפים לכל התאים
interface SharedCellProps {
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// Props בסיסי לתא (גנרי)
export interface BaseCellProps extends SharedCellProps {
  value: unknown;
  onSave: (value: unknown) => void;
}

// Props לתא טקסט
export interface TextCellProps extends SharedCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
  dir?: 'ltr' | 'rtl';
}

// Props לתא מספר
export interface NumberCellProps extends SharedCellProps {
  value: number | null;
  onSave: (value: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
}

// Props לתא מטבע
export interface CurrencyCellProps extends NumberCellProps {
  currency?: string;
}

// Props לתא תאריך
export interface DateCellProps extends SharedCellProps {
  value: Date | string | null;
  onSave: (value: string | null) => void;
}

// Props לתא בחירה
export interface SelectCellProps extends SharedCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
  options: SelectOption[];
  allowEmpty?: boolean;
}

// Props לתא config-select
export interface ConfigSelectCellProps extends SharedCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
  entityType: string;
  allowEmpty?: boolean;
}

// Props לתא checkbox
export interface CheckboxCellProps extends SharedCellProps {
  value: boolean;
  onSave: (value: boolean) => void;
}

// Props לתא textarea
export interface TextareaCellProps extends SharedCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
}

// Props לתא multi-user
export interface MultiUserCellProps extends SharedCellProps {
  value: string[];
  onSave: (value: string[]) => void;
}

// Props לתא rating
export interface RatingCellProps extends SharedCellProps {
  value: number | null;
  onSave: (value: number | null) => void;
  max?: number;
}

// משתמש בסיסי
export interface BasicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}
