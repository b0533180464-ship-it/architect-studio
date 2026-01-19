'use client';

import type { CustomFieldType, FieldOption, FieldInputProps, FieldDisplayProps } from './types';

// Input components
import { TextFieldInput } from './text-fields';
import { NumberFieldInput } from './number-fields';
import { DateFieldInput } from './date-fields';
import { BooleanFieldInput } from './boolean-field';
import { SelectFieldInput } from './select-field';
import { MultiSelectFieldInput } from './multiselect-field';
import { UserFieldInput, UsersFieldInput } from './user-field';

// Display components
import {
  TextFieldDisplay,
  NumberFieldDisplay,
  DateFieldDisplay,
  BooleanFieldDisplay,
  SelectFieldDisplay,
  UserFieldDisplay,
} from './display';

// Re-export types
export type { FieldOption, FieldInputProps, FieldDisplayProps, CustomFieldType };

/**
 * Main FieldInput component - routes to specific input based on type
 */
export function FieldInput({
  type,
  value,
  onChange,
  onCancel,
  options = [],
  placeholder,
  disabled,
  autoFocus = true,
  className,
}: FieldInputProps & { type: CustomFieldType }) {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'phone':
    case 'url':
      return (
        <TextFieldInput
          type={type}
          value={value}
          onChange={onChange}
          onCancel={onCancel}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
        />
      );

    case 'number':
    case 'currency':
      return (
        <NumberFieldInput
          type={type}
          value={value}
          onChange={onChange}
          onCancel={onCancel}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
        />
      );

    case 'date':
    case 'datetime':
      return (
        <DateFieldInput
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'boolean':
      return (
        <BooleanFieldInput
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'select':
      return (
        <SelectFieldInput
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      );

    case 'multiselect':
      return (
        <MultiSelectFieldInput
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      );

    case 'user':
      return (
        <UserFieldInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      );

    case 'users':
      return (
        <UsersFieldInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      );

    default:
      return null;
  }
}

/**
 * Main FieldDisplay component - routes to specific display based on type
 */
export function FieldDisplay({
  type,
  value,
  options = [],
  className,
}: FieldDisplayProps & { type: CustomFieldType }) {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'phone':
    case 'url':
      return <TextFieldDisplay type={type} value={value} className={className} />;

    case 'number':
    case 'currency':
      return <NumberFieldDisplay type={type} value={value} className={className} />;

    case 'date':
    case 'datetime':
      return <DateFieldDisplay type={type} value={value} className={className} />;

    case 'boolean':
      return <BooleanFieldDisplay value={value} className={className} />;

    case 'select':
    case 'multiselect':
      return <SelectFieldDisplay type={type} value={value} options={options} className={className} />;

    case 'user':
    case 'users':
      return <UserFieldDisplay type={type} value={value} className={className} />;

    default:
      return <span className={className}>{String(value)}</span>;
  }
}
