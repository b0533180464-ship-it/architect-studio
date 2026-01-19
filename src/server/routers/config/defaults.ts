import type { ConfigurableEntityType } from './schemas';

interface DefaultEntity {
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  isFinal?: boolean;
  order: number;
}

// Project Types
const PROJECT_TYPES: DefaultEntity[] = [
  { code: 'apartment', name: 'דירה', nameEn: 'Apartment', icon: 'home', isDefault: true, order: 0, isSystem: true },
  { code: 'villa', name: 'וילה', nameEn: 'Villa', icon: 'castle', order: 1, isSystem: true },
  { code: 'penthouse', name: 'פנטהאוז', nameEn: 'Penthouse', icon: 'building', order: 2, isSystem: true },
  { code: 'office', name: 'משרד', nameEn: 'Office', icon: 'briefcase', order: 3, isSystem: true },
  { code: 'retail', name: 'חנות', nameEn: 'Retail', icon: 'shopping-bag', order: 4, isSystem: true },
  { code: 'restaurant', name: 'מסעדה', nameEn: 'Restaurant', icon: 'utensils', order: 5, isSystem: true },
  { code: 'hospitality', name: 'מלון/אירוח', nameEn: 'Hospitality', icon: 'bed', order: 6, isSystem: true },
];

// Project Statuses
const PROJECT_STATUSES: DefaultEntity[] = [
  { code: 'active', name: 'פעיל', nameEn: 'Active', color: '#22C55E', isDefault: true, order: 0, isSystem: true },
  { code: 'on_hold', name: 'מושהה', nameEn: 'On Hold', color: '#F59E0B', order: 1, isSystem: true },
  { code: 'completed', name: 'הושלם', nameEn: 'Completed', color: '#3B82F6', isFinal: true, order: 2, isSystem: true },
  { code: 'cancelled', name: 'בוטל', nameEn: 'Cancelled', color: '#EF4444', isFinal: true, order: 3, isSystem: true },
];

// Project Phases
const PROJECT_PHASES: DefaultEntity[] = [
  { code: 'consultation', name: 'ייעוץ ראשוני', nameEn: 'Initial Consultation', color: '#E8E8E8', order: 0, isSystem: true },
  { code: 'concept', name: 'קונספט', nameEn: 'Concept Design', color: '#B8D4E8', order: 1, isSystem: true },
  { code: 'detailed', name: 'תכנון מפורט', nameEn: 'Detailed Design', color: '#7FB8D8', order: 2, isSystem: true },
  { code: 'procurement', name: 'רכש', nameEn: 'Procurement', color: '#4A9CC8', order: 3, isSystem: true },
  { code: 'installation', name: 'התקנה וביצוע', nameEn: 'Installation', color: '#2080B8', order: 4, isSystem: true },
  { code: 'handover', name: 'מסירה', nameEn: 'Handover', color: '#28A745', isFinal: true, order: 5, isSystem: true },
];

// Task Statuses
const TASK_STATUSES: DefaultEntity[] = [
  { code: 'todo', name: 'לעשות', nameEn: 'To Do', color: '#E5E7EB', isDefault: true, order: 0, isSystem: true },
  { code: 'in_progress', name: 'בעבודה', nameEn: 'In Progress', color: '#3B82F6', order: 1, isSystem: true },
  { code: 'review', name: 'בבדיקה', nameEn: 'In Review', color: '#F59E0B', order: 2, isSystem: true },
  { code: 'completed', name: 'הושלם', nameEn: 'Completed', color: '#22C55E', isFinal: true, order: 3, isSystem: true },
];

// Task Categories
const TASK_CATEGORIES: DefaultEntity[] = [
  { code: 'design', name: 'עיצוב', nameEn: 'Design', icon: 'palette', order: 0, isSystem: true },
  { code: 'procurement', name: 'רכש', nameEn: 'Procurement', icon: 'shopping-cart', order: 1, isSystem: true },
  { code: 'construction', name: 'ביצוע', nameEn: 'Construction', icon: 'hammer', order: 2, isSystem: true },
  { code: 'admin', name: 'מנהלה', nameEn: 'Admin', icon: 'file-text', order: 3, isSystem: true },
  { code: 'client', name: 'לקוח', nameEn: 'Client', icon: 'user', order: 4, isSystem: true },
];

// Room Types
const ROOM_TYPES: DefaultEntity[] = [
  { code: 'living_room', name: 'סלון', nameEn: 'Living Room', icon: 'sofa', order: 0, isSystem: true },
  { code: 'kitchen', name: 'מטבח', nameEn: 'Kitchen', icon: 'chef-hat', order: 1, isSystem: true },
  { code: 'bedroom', name: 'חדר שינה', nameEn: 'Bedroom', icon: 'bed', order: 2, isSystem: true },
  { code: 'bathroom', name: 'חדר רחצה', nameEn: 'Bathroom', icon: 'bath', order: 3, isSystem: true },
  { code: 'kids_room', name: 'חדר ילדים', nameEn: 'Kids Room', icon: 'baby', order: 4, isSystem: true },
  { code: 'balcony', name: 'מרפסת', nameEn: 'Balcony', icon: 'sun', order: 5, isSystem: true },
  { code: 'home_office', name: 'משרד ביתי', nameEn: 'Home Office', icon: 'laptop', order: 6, isSystem: true },
  { code: 'dining', name: 'פינת אוכל', nameEn: 'Dining Area', icon: 'utensils', order: 7, isSystem: true },
  { code: 'entrance', name: 'כניסה', nameEn: 'Entrance', icon: 'door-open', order: 8, isSystem: true },
  { code: 'hallway', name: 'מעבר/מסדרון', nameEn: 'Hallway', icon: 'arrow-right', order: 9, isSystem: true },
];

// Room Statuses
const ROOM_STATUSES: DefaultEntity[] = [
  { code: 'not_started', name: 'לא התחיל', nameEn: 'Not Started', color: '#9CA3AF', isDefault: true, order: 0, isSystem: true },
  { code: 'concept', name: 'קונספט', nameEn: 'Concept', color: '#A78BFA', order: 1, isSystem: true },
  { code: 'detailed', name: 'תכנון מפורט', nameEn: 'Detailed Design', color: '#60A5FA', order: 2, isSystem: true },
  { code: 'approved', name: 'מאושר', nameEn: 'Approved', color: '#34D399', order: 3, isSystem: true },
  { code: 'in_progress', name: 'בביצוע', nameEn: 'In Progress', color: '#FBBF24', order: 4, isSystem: true },
  { code: 'completed', name: 'הושלם', nameEn: 'Completed', color: '#22C55E', isFinal: true, order: 5, isSystem: true },
];

// Document Categories
const DOCUMENT_CATEGORIES: DefaultEntity[] = [
  { code: 'plans', name: 'תוכניות', nameEn: 'Plans', icon: 'map', order: 0, isSystem: true },
  { code: 'contracts', name: 'חוזים', nameEn: 'Contracts', icon: 'file-signature', order: 1, isSystem: true },
  { code: 'proposals', name: 'הצעות מחיר', nameEn: 'Proposals', icon: 'file-text', order: 2, isSystem: true },
  { code: 'renders', name: 'רנדרים', nameEn: 'Renders', icon: 'image', order: 3, isSystem: true },
  { code: 'other', name: 'אחר', nameEn: 'Other', icon: 'file', isDefault: true, order: 4, isSystem: true },
];

// Supplier Categories
const SUPPLIER_CATEGORIES: DefaultEntity[] = [
  { code: 'furniture', name: 'ריהוט', nameEn: 'Furniture', icon: 'armchair', color: '#8B5CF6', order: 0, isSystem: true },
  { code: 'lighting', name: 'תאורה', nameEn: 'Lighting', icon: 'lamp', color: '#F59E0B', order: 1, isSystem: true },
  { code: 'textiles', name: 'טקסטיל', nameEn: 'Textiles', icon: 'shirt', color: '#EC4899', order: 2, isSystem: true },
  { code: 'flooring', name: 'ריצוף', nameEn: 'Flooring', icon: 'grid', color: '#6366F1', order: 3, isSystem: true },
  { code: 'kitchen', name: 'מטבחים', nameEn: 'Kitchens', icon: 'chef-hat', color: '#EF4444', order: 4, isSystem: true },
  { code: 'bathroom', name: 'אמבטיה', nameEn: 'Bathroom', icon: 'bath', color: '#3B82F6', order: 5, isSystem: true },
  { code: 'hardware', name: 'פרזול', nameEn: 'Hardware', icon: 'wrench', color: '#71717A', order: 6, isSystem: true },
  { code: 'wallpaper', name: 'טפטים', nameEn: 'Wallpaper', icon: 'paintbrush', color: '#84CC16', order: 7, isSystem: true },
  { code: 'art', name: 'אמנות', nameEn: 'Art', icon: 'frame', color: '#D946EF', order: 8, isSystem: true },
  { code: 'outdoor', name: 'חוץ', nameEn: 'Outdoor', icon: 'tree', color: '#22C55E', order: 9, isSystem: true },
  { code: 'other', name: 'אחר', nameEn: 'Other', icon: 'package', color: '#9CA3AF', isDefault: true, order: 10, isSystem: true },
];

// Trades (Professionals)
const TRADES: DefaultEntity[] = [
  { code: 'general_contractor', name: 'קבלן ראשי', nameEn: 'General Contractor', icon: 'hard-hat', color: '#1F2937', order: 0, isSystem: true },
  { code: 'electrician', name: 'חשמלאי', nameEn: 'Electrician', icon: 'zap', color: '#FBBF24', order: 1, isSystem: true },
  { code: 'plumber', name: 'אינסטלטור', nameEn: 'Plumber', icon: 'droplet', color: '#3B82F6', order: 2, isSystem: true },
  { code: 'carpenter', name: 'נגר', nameEn: 'Carpenter', icon: 'axe', color: '#92400E', order: 3, isSystem: true },
  { code: 'painter', name: 'צבע', nameEn: 'Painter', icon: 'paintbrush', color: '#EC4899', order: 4, isSystem: true },
  { code: 'tiler', name: 'רצף', nameEn: 'Tiler', icon: 'grid', color: '#6366F1', order: 5, isSystem: true },
  { code: 'metalworker', name: 'מסגר', nameEn: 'Metalworker', icon: 'wrench', color: '#71717A', order: 6, isSystem: true },
  { code: 'hvac', name: 'מיזוג אוויר', nameEn: 'HVAC', icon: 'wind', color: '#06B6D4', order: 7, isSystem: true },
  { code: 'drywall', name: 'גבס', nameEn: 'Drywall', icon: 'layers', color: '#D1D5DB', order: 8, isSystem: true },
  { code: 'glass', name: 'זגג', nameEn: 'Glazier', icon: 'square', color: '#A5F3FC', order: 9, isSystem: true },
  { code: 'kitchen_installer', name: 'מתקין מטבחים', nameEn: 'Kitchen Installer', icon: 'chef-hat', color: '#EF4444', order: 10, isSystem: true },
  { code: 'curtains', name: 'וילונות', nameEn: 'Curtains', icon: 'blinds', color: '#A78BFA', order: 11, isSystem: true },
  { code: 'other', name: 'אחר', nameEn: 'Other', icon: 'tool', color: '#9CA3AF', isDefault: true, order: 12, isSystem: true },
];

// All defaults map
const DEFAULTS_MAP: Record<ConfigurableEntityType, DefaultEntity[]> = {
  project_type: PROJECT_TYPES,
  project_status: PROJECT_STATUSES,
  project_phase: PROJECT_PHASES,
  task_status: TASK_STATUSES,
  task_category: TASK_CATEGORIES,
  room_type: ROOM_TYPES,
  room_status: ROOM_STATUSES,
  document_category: DOCUMENT_CATEGORIES,
  supplier_category: SUPPLIER_CATEGORIES,
  trade: TRADES,
  expense_category: [], // Will be added in Financial phase
};

export function getDefaultEntities(entityType: ConfigurableEntityType): DefaultEntity[] {
  return DEFAULTS_MAP[entityType] || [];
}

export function getAllDefaultEntities(): { entityType: ConfigurableEntityType; entities: DefaultEntity[] }[] {
  return Object.entries(DEFAULTS_MAP)
    .filter(([, entities]) => entities.length > 0)
    .map(([entityType, entities]) => ({
      entityType: entityType as ConfigurableEntityType,
      entities,
    }));
}
