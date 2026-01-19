import type { CustomFieldType } from '@/server/routers/customFields/schemas';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onCancel?: () => void;
  options?: FieldOption[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export interface FieldDisplayProps {
  value: unknown;
  options?: FieldOption[];
  className?: string;
}

export type { CustomFieldType };
