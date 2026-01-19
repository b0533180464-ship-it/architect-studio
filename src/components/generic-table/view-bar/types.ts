export interface ViewData {
  id: string;
  name: string;
  isDefault: boolean;
  isShared: boolean;
  userId: string | null;
  user?: { firstName: string | null; lastName: string | null } | null;
}

export interface ViewBarProps {
  views: ViewData[];
  currentViewId: string | null;
  currentUserId: string;
  onSelectView: (viewId: string | null) => void;
  onCreateView: (name: string, isShared: boolean) => void;
  onDuplicateView: (viewId: string, name: string) => void;
  onDeleteView: (viewId: string) => void;
  onSetDefault: (viewId: string | null) => void;
  onSaveView?: () => void;
  hasUnsavedChanges?: boolean;
  activeFiltersCount?: number;
  isLoading?: boolean;
}
