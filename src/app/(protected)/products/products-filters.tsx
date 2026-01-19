/* eslint-disable max-lines-per-function */
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Filters {
  categoryId?: string;
  supplierId?: string;
  hasImage?: boolean;
}

interface ProductsFiltersProps {
  filters: Filters;
  categories: Category[];
  suppliers: Supplier[];
  onFilterChange: (filters: Filters) => void;
}

export function ProductsFilters({
  filters,
  categories,
  suppliers,
  onFilterChange,
}: ProductsFiltersProps) {
  const hasActiveFilters =
    filters.categoryId || filters.supplierId || filters.hasImage !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category Filter */}
      <Select
        value={filters.categoryId || 'all'}
        onValueChange={(value) =>
          onFilterChange({ ...filters, categoryId: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="קטגוריה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Supplier Filter */}
      <Select
        value={filters.supplierId || 'all'}
        onValueChange={(value) =>
          onFilterChange({ ...filters, supplierId: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="ספק" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הספקים</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Has Image Filter */}
      <Select
        value={filters.hasImage === undefined ? 'all' : filters.hasImage ? 'yes' : 'no'}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            hasImage: value === 'all' ? undefined : value === 'yes',
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="תמונה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">הכל</SelectItem>
          <SelectItem value="yes">עם תמונה</SelectItem>
          <SelectItem value="no">ללא תמונה</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({})}
          className="text-muted-foreground"
        >
          נקה סינון
        </Button>
      )}
    </div>
  );
}
