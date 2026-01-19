'use client';

import { trpc } from '@/lib/trpc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ConfigEntityType =
  | 'project_type'
  | 'project_status'
  | 'project_phase'
  | 'task_status'
  | 'task_category'
  | 'room_type'
  | 'room_status'
  | 'document_category'
  | 'supplier_category'
  | 'trade'
  | 'expense_category';

interface ConfigSelectProps {
  entityType: ConfigEntityType;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showColor?: boolean;
  className?: string;
}

function LoadingSelect({ className }: { className?: string }) {
  return (
    <Select disabled>
      <SelectTrigger className={className}>
        <SelectValue placeholder="..." />
      </SelectTrigger>
    </Select>
  );
}

export function ConfigSelect(props: ConfigSelectProps) {
  const { entityType, value, onChange, placeholder = 'בחר...', disabled = false, showColor = true, className } = props;
  const { data: options, isLoading } = trpc.config.list.useQuery({ entityType, activeOnly: true });

  if (isLoading) return <LoadingSelect className={className} />;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            <span className="flex items-center gap-2">
              {showColor && o.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: o.color }} />}
              {o.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
