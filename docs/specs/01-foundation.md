# Foundation - עקרונות יסוד
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## מהות המערכת

מערכת SaaS לניהול משרדי אדריכלות ועיצוב פנים. מאפשרת ניהול מחזור חיים מלא של פרויקט - מהצעת מחיר ראשונה עד מסירה - הכל במקום אחד בלי מעבר בין טאבים.

## קהל יעד

| פרופיל | גודל | צרכים עיקריים |
|--------|------|---------------|
| מעצב/ת עצמאי/ת | 1 איש | פשטות, מעקב לקוחות, FF&E |
| משרד קטן | 2-5 | ניהול פרויקטים, רכש, תשלומים |
| משרד אדריכלות | 2-5 | רישוי, תיאום, מסמכים |
| סטודיו משולב | 5-20 | כל הנ"ל + ניהול צוות |
| משרד גדול | 20-50+ | Multi-project, דוחות, אינטגרציות |

## Tech Stack

```yaml
Frontend:
  framework: Next.js 14+ (App Router)
  language: TypeScript (strict)
  state: Zustand + TanStack Query
  realtime: Socket.io-client / Supabase Realtime
  ui: Tailwind CSS + shadcn/ui
  forms: React Hook Form + Zod
  tables: TanStack Table
  dnd: dnd-kit

Backend:
  platform: Supabase
  database: PostgreSQL 15+
  auth: Supabase Auth (Magic Link + Google OAuth)
  storage: Supabase Storage
  api: tRPC
  realtime: Supabase Realtime

Hosting:
  platform: Vercel
  database: Supabase (hosted)
```

---

# ב. פילוסופיית UX - Zero Navigation

## העיקרון המרכזי

**אדריכל או מעצב עובד 90% מהזמן בפרויקט אחד. כל מה שקשור לפרויקט צריך להיות בתוך הפרויקט - בלי לעבור דפים.**

### במקום:
```
Sidebar > Projects > Project X > Tab: Tasks > Create Task
(5 קליקים, 3 טעינות)
```

### צריך:
```
Project X > לחיצה על "+" > הוספת משימה
(קליק אחד, ללא טעינה)
```

## מבנה דף הפרויקט - Project Hub

כל פרויקט הוא Hub מרכזי:

```
┌─────────────────────────────────────────────────────────────┐
│ Quick Info Bar                                               │
│ [לקוח] [מיקום] [שטח] [תקציב] [תאריכים] [שלב נוכחי]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ משימות │ │  חדרים  │ │ תשלומים │ │ מסמכים │           │
│ │   12    │ │    8    │ │  30,000 │ │   25    │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ הצעות  │ │ שינויים │ │   זמן   │ │ ליקויים │           │
│ │    2    │ │    1    │ │  24.5h  │ │    3    │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Expandable Panel - נפתח בלחיצה על כרטיס]                  │
│                                                             │
│ רשימת משימות מפורטת...                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Expandable Panels Behavior

- **מצב ברירת מחדל:** כרטיסים קטנים עם סיכום
- **לחיצה על כרטיס:** פאנל מתרחב מתחתיו עם תוכן מלא
- **לחיצה על כרטיס אחר:** הנוכחי נסגר, החדש נפתח
- **Shift+Click:** פתיחת כמה פאנלים במקביל

---

# ג. Navigation Structure

## Sidebar - 5 פריטים בלבד

```typescript
const MAIN_NAVIGATION = [
  { id: 'dashboard', label: 'לוח בקרה', icon: 'home', path: '/dashboard' },
  { id: 'projects', label: 'פרויקטים', icon: 'folder', path: '/projects' },
  { id: 'calendar', label: 'יומן', icon: 'calendar', path: '/calendar' },
  { id: 'contacts', label: 'אנשי קשר', icon: 'users', path: '/contacts' },
  { id: 'library', label: 'ספרייה', icon: 'package', path: '/library' },
  { id: 'settings', label: 'הגדרות', icon: 'settings', path: '/settings', adminOnly: true },
];
```

## איפה נמצא כל דבר

| מה | איפה |
|----|------|
| 90% מהעבודה | בתוך דף הפרויקט |
| רשימת פרויקטים | פרויקטים |
| פגישות כל הפרויקטים | יומן |
| לקוחות + ספקים | אנשי קשר |
| ספריית מוצרים | ספרייה |
| הגדרות משרד | הגדרות (Admin) |

---

# ד. עקרונות עיצוב

## עקרונות UX מנחים

| עיקרון | הסבר |
|--------|------|
| **Zero Navigation** | 90% מהעבודה בתוך פרויקט אחד |
| **Progressive Disclosure** | מציגים רק מה שרלוונטי, פאנלים נפתחים לפי הקשר |
| **Contextual Actions** | פעולות במקום הנכון, לא בתפריטים מרוחקים |
| **Single Source of Truth** | כל מידע במקום אחד, אין כפילויות |
| **Inline Everything** | לחיצה על שדה = עריכה במקום |

## עקרונות טכניים מנחים

| עיקרון | הסבר |
|--------|------|
| **Multi-Tenant** | כל משרד = tenant מבודד (RLS) |
| **Optimistic UI** | עדכון UI מיידי, rollback בכישלון |
| **Real-time Sync** | שינויים מיידיים לכל המשתמשים |
| **Mobile-First** | רספונסיבי מלא |
| **Offline-Ready** | עבודה בשטח בלי אינטרנט |

---

# ה. Design System

## צבעים

```css
:root {
  /* Primary */
  --primary: #3399FF;           /* כחול מקצועי */
  --primary-hover: #2277DD;
  --primary-light: #E8F4FF;

  /* Neutral */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;

  /* Semantic */
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

## טיפוגרפיה

```css
:root {
  --font-family: 'Assistant', 'Segoe UI', system-ui, sans-serif;

  /* Sizes */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;

  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## ריווח

```css
/* בסיס 4px */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

## רדיוסים וצללים

```css
/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

# ו. Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  sm: 640,    // טאבלטים קטנים
  md: 768,    // טאבלטים
  lg: 1024,   // לפטופים
  xl: 1280,   // דסקטופ
  '2xl': 1536 // מסכים גדולים
};

const LAYOUT_BY_BREAKPOINT = {
  mobile: {
    sidebar: 'hidden',           // hamburger menu
    navigation: 'bottom_tabs',
    tables: 'card_view',
    modals: 'full_screen',
    panels: 'full_screen_modal',
    actions: 'bottom_bar',
    columns: 1,
  },
  tablet: {
    sidebar: 'collapsed',        // icons only
    navigation: 'sidebar',
    tables: 'horizontal_scroll',
    modals: 'side_sheet',
    panels: 'side_sheet',
    actions: 'inline',
    columns: 2,
  },
  desktop: {
    sidebar: 'expanded',         // full
    navigation: 'sidebar',
    tables: 'full',
    modals: 'centered',
    panels: 'inline_expand',
    actions: 'inline',
    columns: '3-4',
  },
};
```

---

# ז. RTL & Hebrew Support

## כללים בסיסיים

```typescript
const RTL_RULES = {
  // Document
  htmlDir: 'rtl',

  // Text alignment
  defaultAlign: 'right',

  // Tailwind classes
  spaceX: 'space-x-reverse',
  flexRow: 'flex-row-reverse',  // when needed

  // Icons with direction
  arrowNext: 'arrow-left',      // RTL flipped
  arrowPrev: 'arrow-right',

  // Numbers and dates
  numbersDir: 'ltr',            // מספרים תמיד LTR
  datesFormat: 'DD/MM/YYYY',
};
```

## כללי שפה

| סוג | שפה | דוגמה |
|-----|-----|-------|
| UI Text | עברית | "שמור", "ביטול" |
| Code/Variables | English | `projectName`, `isActive` |
| Database | English | `created_at`, `tenant_id` |
| Error Messages | עברית | "שגיאת ולידציה" |
| Logs | English | Technical logs |

---

# ח. Accessibility (נגישות)

## דרישות בסיסיות

```typescript
const ACCESSIBILITY_REQUIREMENTS = {
  // Color Contrast
  colorContrast: {
    normalText: 4.5,    // WCAG AA
    largeText: 3,
    uiComponents: 3,
  },

  // Focus Indicators
  focusIndicator: {
    style: 'ring',
    color: 'primary',
    width: 2,
    offset: 2,
  },

  // Keyboard Navigation
  keyboard: {
    tabNavigation: true,
    escapeToClose: true,
    arrowNavigation: true,  // in lists/tables
    shortcuts: true,
  },

  // Screen Readers
  screenReader: {
    ariaLabels: true,
    ariaDescriptions: true,
    announcements: true,
  },

  // Other
  textScaling: '200%',      // support up to
  reducedMotion: true,      // respect preference
};
```

---

# ט. Component Library

## רכיבי בסיס (shadcn/ui)

```typescript
const BASE_COMPONENTS = [
  // Layout
  'Card',
  'Separator',
  'ScrollArea',

  // Forms
  'Button',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio',
  'Switch',
  'DatePicker',
  'Combobox',

  // Feedback
  'Alert',
  'Toast',
  'Progress',
  'Skeleton',
  'Spinner',

  // Overlays
  'Dialog',
  'Sheet',
  'Popover',
  'Tooltip',
  'DropdownMenu',
  'ContextMenu',

  // Data Display
  'Table',
  'Badge',
  'Avatar',

  // Navigation
  'Tabs',
  'Breadcrumb',
  'Pagination',
];
```

## רכיבים מותאמים

```typescript
const CUSTOM_COMPONENTS = [
  // Layout
  'AppShell',
  'Sidebar',
  'PageHeader',
  'ExpandablePanel',

  // Data Entry
  'InlineEdit',
  'RichTextEditor',
  'FileUpload',
  'ImageGallery',

  // Data Display
  'StatCard',
  'DataTable',       // with sorting, filtering, pagination
  'KanbanBoard',
  'Timeline',
  'ActivityFeed',

  // Project Specific
  'ProjectCard',
  'TaskRow',
  'PaymentCard',
  'ProductCard',
  'RoomCard',

  // Charts
  'BarChart',
  'LineChart',
  'PieChart',
  'ProgressRing',
];
```

---

# י. Performance Requirements

```typescript
const PERFORMANCE_TARGETS = {
  // Frontend
  FCP: 1500,                    // First Contentful Paint (ms)
  LCP: 2500,                    // Largest Contentful Paint (ms)
  TTI: 3500,                    // Time to Interactive (ms)
  CLS: 0.1,                     // Cumulative Layout Shift

  // API
  apiP50: 100,                  // ms
  apiP95: 500,
  apiP99: 1000,

  // Database
  simpleQuery: 10,              // ms
  complexQuery: 100,
  reportQuery: 1000,

  // WebSocket
  latency: 100,                 // ms
  reconnect: 3000,              // max time

  // Optimistic UI
  uiUpdate: 50,                 // instant feel
};
```

---

**הפניות לקבצים אחרים:**
- ישויות Auth/User: `02-auth-tenant-user.md`
- ישויות Project/Client: `03-project-client.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
