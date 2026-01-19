// Validation utilities for field types

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(value: string): ValidationResult {
  if (!value) return { isValid: true };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: 'כתובת מייל לא תקינה' };
  }
  return { isValid: true };
}

// Phone validation - allows digits, dashes, spaces, parentheses, plus
export function validatePhone(value: string): ValidationResult {
  if (!value) return { isValid: true };
  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phoneRegex.test(value)) {
    return { isValid: false, error: 'מספר טלפון לא תקין' };
  }
  // Must have at least 7 digits
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return { isValid: false, error: 'מספר טלפון קצר מדי' };
  }
  return { isValid: true };
}

// URL validation
export function validateUrl(value: string): ValidationResult {
  if (!value) return { isValid: true };
  try {
    // Add protocol if missing
    const urlToTest = value.startsWith('http') ? value : `https://${value}`;
    new URL(urlToTest);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'כתובת URL לא תקינה' };
  }
}

// Number validation
export function validateNumber(value: string): ValidationResult {
  if (!value) return { isValid: true };
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, error: 'יש להזין מספר' };
  }
  return { isValid: true };
}

// Currency validation (same as number, allows decimal)
export function validateCurrency(value: string): ValidationResult {
  if (!value) return { isValid: true };
  const currencyRegex = /^-?\d*\.?\d*$/;
  if (!currencyRegex.test(value)) {
    return { isValid: false, error: 'יש להזין סכום תקין' };
  }
  return { isValid: true };
}

// Date validation
export function validateDate(value: string): ValidationResult {
  if (!value) return { isValid: true };
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'תאריך לא תקין' };
  }
  return { isValid: true };
}

// Get validator by field type
export function getValidator(type: string): (value: string) => ValidationResult {
  switch (type) {
    case 'email':
      return validateEmail;
    case 'phone':
      return validatePhone;
    case 'url':
      return validateUrl;
    case 'number':
      return validateNumber;
    case 'currency':
      return validateCurrency;
    case 'date':
    case 'datetime':
      return validateDate;
    default:
      return () => ({ isValid: true });
  }
}
