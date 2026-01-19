// Navigation item types for dynamic sidebar

export interface NavigationItem {
  id: string;
  tenantId: string;
  label: string;
  labelEn: string | null;
  icon: string | null;
  href: string | null;
  entityType: string | null;
  parentId: string | null;
  order: number;
  isVisible: boolean;
  isCollapsed: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationItemWithChildren extends NavigationItem {
  children?: NavigationItemWithChildren[];
}

// Icon mapping for dynamic icons
export const ICON_MAP: Record<string, string> = {
  LayoutDashboard: 'LayoutDashboard',
  FolderKanban: 'FolderKanban',
  Users: 'Users',
  Building2: 'Building2',
  CheckSquare: 'CheckSquare',
  Package: 'Package',
  Settings: 'Settings',
  Wallet: 'Wallet',
  FileText: 'FileText',
  Calendar: 'Calendar',
  Truck: 'Truck',
  Clock: 'Clock',
  Receipt: 'Receipt',
  FileSignature: 'FileSignature',
  Coins: 'Coins',
  CreditCard: 'CreditCard',
  UserCircle: 'UserCircle',
  Briefcase: 'Briefcase',
  Link: 'Link',
  Folder: 'Folder',
  Star: 'Star',
  Heart: 'Heart',
  Home: 'Home',
  Mail: 'Mail',
  Phone: 'Phone',
  MapPin: 'MapPin',
  Tag: 'Tag',
  Bookmark: 'Bookmark',
};

// Available icons for picker
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

// Default navigation structure (for seeding)
export interface DefaultNavItem {
  label: string;
  labelEn?: string;
  icon?: string;
  href?: string;
  entityType?: string;
  isSystem?: boolean;
  children?: DefaultNavItem[];
}

export const DEFAULT_NAV_ITEMS: DefaultNavItem[] = [
  {
    label: 'דשבורד',
    labelEn: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    isSystem: true,
  },
  {
    label: 'פרויקטים',
    labelEn: 'Projects',
    icon: 'FolderKanban',
    href: '/projects',
    entityType: 'projects',
    isSystem: true,
  },
  {
    label: 'אנשי קשר',
    labelEn: 'Contacts',
    icon: 'Users',
    isSystem: true,
    children: [
      { label: 'כל אנשי הקשר', labelEn: 'All Contacts', href: '/contacts' },
      { label: 'לקוחות', labelEn: 'Clients', href: '/clients', entityType: 'clients' },
      { label: 'ספקים', labelEn: 'Suppliers', href: '/suppliers', entityType: 'suppliers' },
      { label: 'אנשי מקצוע', labelEn: 'Professionals', href: '/professionals', entityType: 'professionals' },
    ],
  },
  {
    label: 'ניהול עבודה',
    labelEn: 'Work Management',
    icon: 'CheckSquare',
    isSystem: true,
    children: [
      { label: 'משימות', labelEn: 'Tasks', href: '/tasks', entityType: 'tasks' },
      { label: 'מסמכים', labelEn: 'Documents', href: '/documents', entityType: 'documents' },
      { label: 'פגישות', labelEn: 'Meetings', href: '/meetings', entityType: 'meetings' },
      { label: 'יומן', labelEn: 'Calendar', href: '/calendar' },
    ],
  },
  {
    label: 'מוצרים ורכש',
    labelEn: 'Products & Procurement',
    icon: 'Package',
    isSystem: true,
    children: [
      { label: 'קטלוג מוצרים', labelEn: 'Product Catalog', href: '/products', entityType: 'products' },
      { label: 'הזמנות רכש', labelEn: 'Purchase Orders', href: '/purchase-orders', entityType: 'purchaseOrders' },
      { label: 'מעקב משלוחים', labelEn: 'Delivery Tracking', href: '/deliveries', entityType: 'deliveryTracking' },
    ],
  },
  {
    label: 'פיננסי',
    labelEn: 'Financial',
    icon: 'Wallet',
    isSystem: true,
    children: [
      { label: 'הצעות מחיר', labelEn: 'Proposals', href: '/proposals', entityType: 'proposals' },
      { label: 'חוזים', labelEn: 'Contracts', href: '/contracts', entityType: 'contracts' },
      { label: 'מקדמות', labelEn: 'Retainers', href: '/retainers', entityType: 'retainers' },
      { label: 'תשלומים', labelEn: 'Payments', href: '/payments', entityType: 'payments' },
      { label: 'הוצאות', labelEn: 'Expenses', href: '/expenses', entityType: 'expenses' },
      { label: 'מעקב זמן', labelEn: 'Time Tracking', href: '/time-tracking', entityType: 'timeEntries' },
    ],
  },
];
