import type { CustomFieldType } from '@/server/routers/customFields/schemas';
import type { RelationType } from '@/server/routers/relations/schemas';
import type { SelectOption } from '../select-options-editor';

export interface RelationDef {
  relationDefId: string;
  targetEntityTypes: string[];
  relationType: RelationType;
}

export interface EntityTypeOption {
  slug: string;
  name: string;
}

export interface GenericColumnDef {
  key: string;
  label: string;
  width: number;
  isCustomField?: boolean;
  isRelation?: boolean;
  fieldId?: string;
  fieldType?: CustomFieldType | 'relation';
  options?: { value: string; label: string; color?: string }[];
  relationDef?: RelationDef;
  sortable?: boolean;
  hideable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  sticky?: boolean;
}

export interface RelationSettingsData {
  targetEntityTypes: string[];
  relationType: RelationType;
}

export interface GenericColumnHeaderProps {
  column: GenericColumnDef;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  entityTypes?: EntityTypeOption[];
  onSort?: (key: string) => void;
  onResize?: (key: string, width: number) => void;
  onEdit?: (key: string, newLabel: string) => void;
  onEditOptions?: (key: string, options: SelectOption[]) => void;
  onEditRelation?: (relationDefId: string, data: RelationSettingsData) => void;
  onHide?: (key: string) => void;
  onDelete?: (key: string) => void;
  onDragStart?: (key: string) => void;
  onDragOver?: (key: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export type { SelectOption };
