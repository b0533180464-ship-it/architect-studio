/**
 * Data Table Components
 * קומפוננטות לטבלאות עם עריכה inline
 */

// Main components
export { EditableTable } from './editable-table';
export { EditableRow } from './editable-row';
export { TableHeader, ColumnHeader } from './column-header';

// Base components
export { BaseCellWrapper, EmptyValue, ClickableValue } from './base-cell';
export { CellContent } from './cell-content';
export { RowActions } from './row-actions';
export { TableSkeleton, TableEmptyState } from './table-states';

// Sheet components
export { EntitySheet, EntitySheetSection, EntitySheetField } from './entity-sheet';

// Cell components
export {
  TextCell, NumberCell, CurrencyCell, DateCell, CheckboxCell,
  SelectCell, ConfigSelectCell, TextareaCell, MultiUserCell, RatingCell, MultiTagCell,
} from './cells';

// Types
export type {
  CellType,
  ColumnDef,
  SelectOption,
  EditableTableProps,
  EditableRowProps,
  BaseCellProps,
  TextCellProps,
  NumberCellProps,
  CurrencyCellProps,
  DateCellProps,
  SelectCellProps,
  ConfigSelectCellProps,
  CheckboxCellProps,
  TextareaCellProps,
  MultiUserCellProps,
  RatingCellProps,
  BasicUser,
} from './types';
