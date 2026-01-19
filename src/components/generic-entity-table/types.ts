/**
 * Types for Generic Entity Table
 */

import type { CustomFieldType } from '@/server/routers/customFields/schemas';

// Custom field definition for generic entities
export interface GenericFieldDef {
  id: string;
  fieldKey: string;
  name: string;
  fieldType: CustomFieldType;
  options?: { value: string; label: string; color?: string }[] | null;
  isRequired: boolean;
  width?: number | null;
  order: number;
}

// Column configuration
export interface ColumnConfig {
  fieldKey: string;
  width?: number;
  visible: boolean;
  order: number;
}

// Filter configuration
export interface FilterConfig {
  fieldKey: string;
  operator: string;
  value: unknown;
}

// Relation column type
export type RelationType = 'one_to_one' | 'one_to_many' | 'many_to_many';

// Relation definition for column
export interface RelationColumnDef {
  relationDefId: string;
  name: string;
  fieldKey: string;
  targetEntityTypes: string[];
  relationType: RelationType;
}

// Merged column definition
export interface GenericEntityColumn {
  key: string;
  label: string;
  width: number;
  visible: boolean;
  order: number;
  isCustomField: boolean;
  isRelation?: boolean;
  fieldId?: string;
  fieldType: CustomFieldType | 'relation';
  relationDef?: RelationColumnDef;
  options?: { value: string; label: string; color?: string }[];
  isRequired?: boolean;
  sortable: boolean;
  hideable: boolean;
  editable: boolean;
  deletable: boolean;
}

// View data
export interface GenericViewData {
  id: string;
  name: string;
  isDefault: boolean;
  isShared: boolean;
  userId: string | null;
}

// Base column definition
export interface BaseColumnDef {
  key: string;
  label: string;
  width: number;
  fieldType: CustomFieldType;
  sortable?: boolean;
  hideable?: boolean;
}
