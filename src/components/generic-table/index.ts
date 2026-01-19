/**
 * Generic Table Components
 * קומפוננטות לטבלה גנרית עם שדות מותאמים ותצוגות
 */

// Main component
export { GenericDataTable } from './generic-data-table';

// Sub-components
export { ViewBar } from './view-bar';
export { GenericColumnHeader } from './column-header';
export { AddColumnButton, type AddColumnData } from './add-column-button';
export { FieldInput, FieldDisplay } from './field-input';
export { EditableCell } from './editable-cell';
export { GenericTableRow } from './table-row';
export { SelectOptionsEditor, type SelectOption } from './select-options-editor';

// Hook
export { useGenericTable } from './use-generic-table';

// Types
export type {
  GenericTableProps,
  BaseColumnDef,
  GenericColumn,
  ColumnConfig,
  FilterConfig,
  ViewState,
  CustomFieldDef,
} from './types';

export type { ViewData } from './view-bar';
export type { GenericColumnDef } from './column-header';
export type { FieldOption } from './field-input';
