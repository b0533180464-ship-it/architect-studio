// Helper to parse stored string value back to proper type
export function parseValue(value: string, fieldType: string): unknown {
  if (!value) return null;

  switch (fieldType) {
    case 'number':
    case 'currency':
      return parseFloat(value) || 0;
    case 'boolean':
      return value === 'true';
    case 'multiselect':
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    case 'date':
    case 'datetime':
      return value; // Keep as ISO string
    default:
      return value;
  }
}
