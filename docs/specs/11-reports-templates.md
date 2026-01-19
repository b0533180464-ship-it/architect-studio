# Reports & Templates - דוחות ותבניות

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

## סקירה כללית

מודול זה מכסה:
1. **Reports & Analytics** - דוחות, Dashboard, ייצוא
2. **Templates** - תבניות פרויקט, משימות, הצעות, חוזים, מיילים

---

# א. Reports & Analytics

## SavedFilter - תצוגות שמורות

### Interface

```typescript
interface SavedFilter {
  id: string;
  tenantId: string;
  userId?: string;                  // null = shared view

  // מזהה
  name: string;
  icon?: string;
  color?: string;

  // על מה
  entityType: string;

  // הגדרות
  filters: FilterConfig[];
  sort?: SortConfig;
  columns?: string[];               // אילו עמודות להציג

  // האם ברירת מחדל
  isDefault: boolean;

  // שיתוף
  isShared: boolean;

  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterConfig {
  // שדה לסנן
  field: string;

  // אופרטור
  operator: FilterOperator;

  // ערך
  value: any;

  // ערך דינמי (אם רלוונטי)
  valueType: 'static' | 'field' | 'variable';
  valueField?: string;               // אם valueType = 'field'
}

type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_list'
  | 'not_in_list'
  | 'date_before'
  | 'date_after'
  | 'date_between'
  | 'days_from_now'
  | 'days_ago'
  | 'date_equals'
  | 'this_week'
  | 'this_month'
  | 'last_7_days'
  | 'last_30_days';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
```

### Database Schema

```sql
CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),        -- null = shared view

  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),

  entity_type VARCHAR(50) NOT NULL,

  filters JSONB NOT NULL DEFAULT '[]',
  sort JSONB,
  columns JSONB,

  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,

  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_filters_tenant ON saved_filters(tenant_id);
CREATE INDEX idx_saved_filters_user ON saved_filters(tenant_id, user_id);
CREATE INDEX idx_saved_filters_entity ON saved_filters(tenant_id, entity_type);

-- RLS
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_filters_tenant_isolation ON saved_filters
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### תצוגות ברירת מחדל

```typescript
const DEFAULT_TASK_VIEWS = [
  {
    name: 'המשימות שלי',
    filters: [{ field: 'assignedTo', operator: 'equals', value: '{{currentUserId}}' }]
  },
  {
    name: 'לביצוע היום',
    filters: [{ field: 'dueDate', operator: 'date_equals', value: '{{today}}' }]
  },
  {
    name: 'באיחור',
    filters: [
      { field: 'dueDate', operator: 'date_before', value: '{{today}}' },
      { field: 'status', operator: 'not_equals', value: 'completed' }
    ]
  },
  {
    name: 'ללא תאריך',
    filters: [{ field: 'dueDate', operator: 'is_empty', value: null }]
  },
];

const DEFAULT_PROJECT_VIEWS = [
  {
    name: 'פעילים',
    filters: [{ field: 'status', operator: 'equals', value: 'active' }]
  },
  {
    name: 'שלי',
    filters: [{ field: 'assignedUserIds', operator: 'contains', value: '{{currentUserId}}' }]
  },
  {
    name: 'VIP',
    filters: [{ field: 'isVIP', operator: 'equals', value: true }]
  },
];
```

---

## DashboardLayout - פריסת Dashboard

### Interface

```typescript
interface DashboardLayout {
  id: string;
  tenantId: string;
  userId?: string;                  // null = default layout

  name: string;
  isDefault: boolean;

  // Grid configuration
  grid: {
    columns: number;                // 12
    rowHeight: number;              // 100px
    gap: number;                    // 16px
  };

  // Widgets placement
  widgets: DashboardWidgetPlacement[];

  createdAt: Date;
  updatedAt: Date;
}

interface DashboardWidgetPlacement {
  widgetId: string;
  x: number;                        // 0-11
  y: number;
  width: number;                    // 1-12
  height: number;                   // 1-6
}
```

### Database Schema

```sql
CREATE TABLE dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),        -- null = default layout

  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,

  grid JSONB NOT NULL DEFAULT '{"columns": 12, "rowHeight": 100, "gap": 16}',
  widgets JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dashboard_layouts_tenant ON dashboard_layouts(tenant_id);
CREATE INDEX idx_dashboard_layouts_user ON dashboard_layouts(tenant_id, user_id);

-- RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY dashboard_layouts_tenant_isolation ON dashboard_layouts
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Widget Library - ספריית Widgets

```typescript
const WIDGET_LIBRARY = {
  // Stat Cards
  'active_projects_count': {
    type: 'stat_card',
    name: 'פרויקטים פעילים',
    metric: 'active_projects',
    icon: 'folder',
    color: 'blue',
  },
  'pending_payments_amount': {
    type: 'stat_card',
    name: 'ממתין לתשלום',
    metric: 'pending_payments',
    format: 'currency',
    icon: 'dollar',
    color: 'orange',
  },
  'overdue_tasks_count': {
    type: 'stat_card',
    name: 'משימות באיחור',
    metric: 'overdue_tasks',
    icon: 'alert',
    color: 'red',
  },

  // Lists
  'my_tasks': {
    type: 'task_list',
    name: 'המשימות שלי',
    filters: [{ field: 'assignedTo', value: '{{currentUser}}' }],
    limit: 10,
  },
  'upcoming_meetings': {
    type: 'upcoming_meetings',
    name: 'פגישות קרובות',
    daysAhead: 7,
    limit: 5,
  },
  'pending_approvals': {
    type: 'pending_approvals',
    name: 'ממתין לאישור',
    limit: 10,
  },
  'recent_activity': {
    type: 'recent_activity',
    name: 'פעילות אחרונה',
    limit: 15,
  },

  // Charts
  'revenue_trend': {
    type: 'line_chart',
    name: 'מגמת הכנסות',
    dataSource: 'payments',
    xAxis: 'month',
    yAxis: 'sum:paidAmount',
    period: 'last_12_months',
  },
  'projects_by_phase': {
    type: 'pie_chart',
    name: 'פרויקטים לפי שלב',
    dataSource: 'projects',
    groupBy: 'phase',
  },
  'team_utilization': {
    type: 'bar_chart',
    name: 'ניצולת צוות',
    dataSource: 'time_entries',
    xAxis: 'user',
    yAxis: 'sum:hours',
  },
};
```

### Default Layouts לפי Role

```typescript
const DEFAULT_LAYOUTS = {
  'owner': {
    widgets: [
      { widgetId: 'revenue_trend', x: 0, y: 0, width: 8, height: 3 },
      { widgetId: 'pending_payments_amount', x: 8, y: 0, width: 4, height: 1 },
      { widgetId: 'active_projects_count', x: 8, y: 1, width: 4, height: 1 },
      { widgetId: 'team_utilization', x: 8, y: 2, width: 4, height: 1 },
      { widgetId: 'my_tasks', x: 0, y: 3, width: 6, height: 3 },
      { widgetId: 'recent_activity', x: 6, y: 3, width: 6, height: 3 },
    ]
  },
  'designer': {
    widgets: [
      { widgetId: 'my_tasks', x: 0, y: 0, width: 6, height: 4 },
      { widgetId: 'upcoming_meetings', x: 6, y: 0, width: 6, height: 2 },
      { widgetId: 'pending_approvals', x: 6, y: 2, width: 6, height: 2 },
      { widgetId: 'recent_activity', x: 0, y: 4, width: 12, height: 2 },
    ]
  },
};
```

---

## Built-in Reports - דוחות מובנים

### דוחות פרויקט

```typescript
const PROJECT_REPORTS = [
  {
    id: 'project_status',
    name: 'סטטוס פרויקט',
    description: 'סקירה מקיפה של פרויקט בודד',
    parameters: ['project'],
    sections: [
      { type: 'header', config: { content: 'דוח סטטוס: {{project.name}}' }},
      { type: 'summary', metrics: ['phase', 'progress', 'budget_used', 'days_remaining'] },
      { type: 'table', title: 'משימות פתוחות', entityType: 'task' },
      { type: 'table', title: 'תשלומים', entityType: 'payment' },
      { type: 'table', title: 'FF&E Status', entityType: 'room_product' },
    ]
  },
  {
    id: 'project_timeline',
    name: 'ציר זמן פרויקט',
    description: 'התקדמות פרויקט לאורך זמן',
    parameters: ['project'],
    sections: [
      { type: 'chart', chartType: 'gantt', title: 'ציר זמן' },
      { type: 'table', title: 'אבני דרך', entityType: 'milestone' },
    ]
  },
  {
    id: 'all_projects_overview',
    name: 'סקירת כל הפרויקטים',
    description: 'מבט על כל הפרויקטים הפעילים',
    parameters: ['date_range', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_projects', 'active', 'on_track', 'at_risk', 'delayed'] },
      { type: 'table', columns: ['name', 'client', 'phase', 'progress', 'budget', 'endDate', 'status'] },
    ]
  },
];
```

### דוחות זמן

```typescript
const TIME_REPORTS = [
  {
    id: 'timesheet',
    name: 'דוח שעות',
    description: 'שעות עבודה לפי משתמש ופרויקט',
    parameters: ['date_range', 'user', 'project'],
    sections: [
      { type: 'summary', metrics: ['total_hours', 'billable_hours', 'non_billable_hours', 'billable_amount'] },
      { type: 'chart', chartType: 'bar', title: 'שעות לפי יום' },
      { type: 'table', groupBy: 'project', columns: ['date', 'project', 'task', 'description', 'hours', 'billable'] },
    ]
  },
  {
    id: 'utilization',
    name: 'דוח ניצולת',
    description: 'ניצולת צוות',
    parameters: ['date_range'],
    sections: [
      { type: 'table', columns: ['user', 'capacity', 'logged', 'billable', 'utilization_percent'] },
      { type: 'chart', chartType: 'bar', title: 'ניצולת לפי עובד' },
    ]
  },
];
```

### דוחות רכש (FF&E)

```typescript
const PROCUREMENT_REPORTS = [
  {
    id: 'ff_e_schedule',
    name: 'לוח FF&E',
    description: 'כל המוצרים בפרויקט עם סטטוס',
    parameters: ['project', 'room', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_products', 'approved', 'ordered', 'delivered', 'installed'] },
      { type: 'table', groupBy: 'room', columns: ['product', 'supplier', 'quantity', 'clientPrice', 'approvalStatus', 'procurementStatus', 'expectedDelivery'] },
    ]
  },
  {
    id: 'purchase_orders',
    name: 'דוח הזמנות רכש',
    description: 'כל הזמנות הרכש',
    parameters: ['date_range', 'supplier', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_orders', 'total_value', 'pending', 'delivered'] },
      { type: 'table', columns: ['orderNumber', 'supplier', 'project', 'orderDate', 'total', 'status', 'expectedDelivery'] },
    ]
  },
  {
    id: 'delivery_tracking',
    name: 'מעקב משלוחים',
    description: 'משלוחים צפויים ובאיחור',
    parameters: ['date_range'],
    sections: [
      { type: 'summary', metrics: ['expected_this_week', 'expected_this_month', 'delayed', 'delivered'] },
      { type: 'table', columns: ['product', 'supplier', 'project', 'expectedDate', 'status', 'daysDelayed'] },
    ]
  },
];
```

### דוחות לקוחות

```typescript
const CLIENT_REPORTS = [
  {
    id: 'client_summary',
    name: 'סיכום לקוח',
    description: 'כל המידע על לקוח',
    parameters: ['client'],
    sections: [
      { type: 'header', config: { content: 'לקוח: {{client.name}}' }},
      { type: 'summary', metrics: ['total_projects', 'active_projects', 'total_revenue', 'outstanding'] },
      { type: 'table', title: 'פרויקטים', entityType: 'project' },
      { type: 'table', title: 'תשלומים', entityType: 'payment' },
      { type: 'text', config: { content: 'הערות: {{client.notes}}' }},
    ]
  },
  {
    id: 'client_aging',
    name: 'גיול חובות לקוחות',
    description: 'חובות לקוחות לפי גיל החוב',
    parameters: ['date_range'],
    sections: [
      { type: 'summary', metrics: ['total_outstanding', 'current', '30_days', '60_days', '90_plus'] },
      { type: 'table', columns: ['client', 'current', '1_30', '31_60', '61_90', '90_plus', 'total'] },
    ]
  },
];
```

---

## Report Builder - בניית דוחות מותאמים

```typescript
interface ReportBuilder {
  // שלב 1: בחירת סוג
  step1_type: {
    options: ['table', 'summary', 'chart', 'combined'];
  };

  // שלב 2: בחירת מקור נתונים
  step2_source: {
    entityType: EntityType;
    relationshipsToInclude: string[];
  };

  // שלב 3: בחירת שדות/עמודות
  step3_fields: {
    availableFields: FieldDefinition[];
    selectedFields: string[];
    fieldOrder: string[];
  };

  // שלב 4: פילטרים
  step4_filters: {
    filters: FilterConfig[];
    parameters: ReportParameter[];     // פילטרים שהמשתמש יבחר בהרצה
  };

  // שלב 5: מיון וקיבוץ
  step5_grouping: {
    groupBy?: string;
    subGroupBy?: string;
    sortBy: SortConfig[];
    showSubtotals: boolean;
    showGrandTotal: boolean;
  };

  // שלב 6: עיצוב
  step6_styling: {
    title: string;
    description?: string;
    logo: boolean;
    pageOrientation: 'portrait' | 'landscape';
    headerFooter: boolean;
  };

  // שלב 7: שמירה ותזמון
  step7_save: {
    name: string;
    category: string;
    schedule?: ScheduleConfig;
    outputFormats: string[];
  };
}

interface ReportParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'date_range' | 'select' | 'multi_select' | 'entity';
  required: boolean;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  entityType?: string;                // אם type = 'entity'
}
```

---

## Export - ייצוא דוחות

### PDF Export

```typescript
interface PDFExportConfig {
  // מידות
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };

  // Header
  header: {
    showLogo: boolean;
    logoUrl?: string;
    title: string;
    subtitle?: string;
    showDate: boolean;
    showPageNumbers: boolean;
  };

  // Footer
  footer: {
    text?: string;
    showPageNumbers: boolean;
  };

  // עיצוב
  styling: {
    primaryColor: string;
    fontFamily: string;
    fontSize: number;
  };

  // אבטחה
  security?: {
    password?: string;
    allowPrinting: boolean;
    allowCopying: boolean;
  };
}
```

### Excel Export

```typescript
interface ExcelExportConfig {
  // שם קובץ
  fileName: string;

  // גליונות
  sheets: {
    name: string;
    data: any[];
    columns: ExcelColumn[];
  }[];

  // עיצוב
  styling: {
    headerStyle: ExcelStyle;
    dataStyle: ExcelStyle;
    alternateRowColor?: string;
  };

  // פיצ'רים
  features: {
    autoFilter: boolean;
    freezeHeader: boolean;
    autoWidth: boolean;
    formulas: boolean;
  };
}

interface ExcelColumn {
  field: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  formula?: string;
}

interface ExcelStyle {
  backgroundColor?: string;
  fontColor?: string;
  fontBold?: boolean;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  border?: boolean;
}
```

---

# ב. Templates - מערכת תבניות

## עקרון מנחה

כל דבר שחוזר על עצמו צריך להיות תבנית - פרויקטים, משימות, הצעות מחיר, חוזים, מיילים.

---

## ProjectTemplate - תבנית פרויקט

### Interface

```typescript
interface ProjectTemplate {
  id: string;
  tenantId: string;

  // מזהה
  name: string;
  description?: string;

  // סיווג
  category?: string;                // "דירה", "וילה", "משרד"
  projectType?: string;

  // תמונה
  coverImage?: string;

  // הגדרות פרויקט
  defaults: {
    billingType?: BillingType;
    markupPercent?: number;
    revisionsIncluded?: number;
  };

  // שלבים מותאמים (אם שונה מברירת מחדל)
  customPhases?: {
    name: string;
    color: string;
    order: number;
  }[];

  // חדרים
  rooms: ProjectTemplateRoom[];

  // משימות
  tasks: ProjectTemplateTask[];

  // מסמכים נדרשים
  requiredDocuments?: {
    name: string;
    category: string;
  }[];

  // תשלומים (מבנה)
  paymentStructure?: ProjectTemplatePayment[];

  // סטטיסטיקות
  usageCount: number;
  lastUsedAt?: Date;

  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProjectTemplateRoom {
  id: string;
  name: string;
  typeId?: string;
  order: number;
}

interface ProjectTemplateTask {
  id: string;

  title: string;
  description?: string;

  // תזמון יחסי
  phase?: string;
  offsetDays?: number;              // X ימים מתחילת הפרויקט/שלב
  durationDays?: number;

  // הקצאה
  assignToRole?: 'owner' | 'manager' | 'member';

  // תלויות
  dependsOn?: string[];             // IDs של משימות אחרות בתבנית

  // צ'קליסט
  checklist?: { text: string }[];

  priority: Priority;
  categoryId?: string;

  order: number;
}

interface ProjectTemplatePayment {
  name: string;
  type: PaymentType;
  percentageOfTotal?: number;
  triggerDescription?: string;
}
```

### Database Schema

```sql
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,

  category VARCHAR(100),
  project_type VARCHAR(100),

  cover_image TEXT,

  defaults JSONB DEFAULT '{}',
  custom_phases JSONB,
  rooms JSONB NOT NULL DEFAULT '[]',
  tasks JSONB NOT NULL DEFAULT '[]',
  required_documents JSONB,
  payment_structure JSONB,

  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_project_templates_tenant ON project_templates(tenant_id);
CREATE INDEX idx_project_templates_category ON project_templates(tenant_id, category);
CREATE INDEX idx_project_templates_active ON project_templates(tenant_id, is_active);

-- RLS
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_templates_tenant_isolation ON project_templates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### שימוש בתבנית

```typescript
interface CreateProjectFromTemplate {
  templateId: string;

  // פרטי הפרויקט החדש
  name: string;
  clientId: string;
  startDate: Date;

  // מה לכלול
  includeRooms: boolean;
  includeTasks: boolean;
  includePaymentStructure: boolean;

  // התאמות
  overrides?: {
    rooms?: { templateRoomId: string; newName?: string; exclude?: boolean }[];
    tasks?: { templateTaskId: string; exclude?: boolean; assignTo?: string }[];
  };
}

// התוצאה: פרויקט חדש עם כל הישויות המשויכות
```

### תבניות מובנות

```typescript
const BUILT_IN_PROJECT_TEMPLATES = [
  {
    name: 'עיצוב דירה - סטנדרטי',
    category: 'דירה',
    rooms: [
      { name: 'סלון', order: 1 },
      { name: 'מטבח', order: 2 },
      { name: 'חדר שינה הורים', order: 3 },
      { name: 'חדר רחצה הורים', order: 4 },
      { name: 'חדר ילדים 1', order: 5 },
      { name: 'חדר רחצה ילדים', order: 6 },
    ],
    tasks: [
      { title: 'פגישת היכרות', phase: 'consultation', offsetDays: 0 },
      { title: 'סקר צרכים', phase: 'consultation', offsetDays: 3 },
      { title: 'מדידות באתר', phase: 'concept', offsetDays: 7 },
      { title: 'הכנת לוח השראה', phase: 'concept', offsetDays: 10 },
      { title: 'הצגת קונספט', phase: 'concept', offsetDays: 14 },
      { title: 'תכנון מפורט - סלון', phase: 'detailed', offsetDays: 21 },
      { title: 'תכנון מפורט - מטבח', phase: 'detailed', offsetDays: 28 },
      { title: 'בחירת ריהוט', phase: 'procurement', offsetDays: 35 },
      { title: 'הזמנות רכש', phase: 'procurement', offsetDays: 42 },
      { title: 'פיקוח התקנה', phase: 'installation', offsetDays: 60 },
      { title: 'ביקורת סיום', phase: 'handover', offsetDays: 75 },
    ],
    paymentStructure: [
      { name: 'מקדמה', type: 'retainer', percentageOfTotal: 30 },
      { name: 'אישור קונספט', type: 'milestone', percentageOfTotal: 30 },
      { name: 'לפני הזמנות', type: 'milestone', percentageOfTotal: 20 },
      { name: 'מסירה', type: 'final', percentageOfTotal: 20 },
    ],
  },
  {
    name: 'עיצוב וילה',
    category: 'וילה',
    // rooms and tasks...
  },
  {
    name: 'עיצוב משרד',
    category: 'מסחרי',
    // rooms and tasks...
  },
];
```

---

## TaskTemplate - תבנית משימות (צ'קליסטים)

### Interface

```typescript
interface TaskTemplate {
  id: string;
  tenantId: string;

  name: string;
  description?: string;
  category?: string;

  // המשימות
  tasks: TaskTemplateItem[];

  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

interface TaskTemplateItem {
  title: string;
  description?: string;
  checklist?: { text: string }[];
  priority: Priority;
  estimatedHours?: number;
  offsetDays?: number;
  order: number;
}
```

### Database Schema

```sql
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  tasks JSONB NOT NULL DEFAULT '[]',

  usage_count INTEGER DEFAULT 0,
  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_templates_tenant ON task_templates(tenant_id);

-- RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY task_templates_tenant_isolation ON task_templates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### תבניות מובנות

```typescript
const BUILT_IN_TASK_TEMPLATES = [
  {
    name: 'צ\'קליסט ביקור אתר',
    tasks: [
      { title: 'צילום מצב קיים', order: 1 },
      { title: 'מדידות', order: 2 },
      { title: 'בדיקת תשתיות חשמל', order: 3 },
      { title: 'בדיקת תשתיות אינסטלציה', order: 4 },
      { title: 'תיעוד בעיות', order: 5 },
      { title: 'שיחה עם קבלן/דייר', order: 6 },
    ],
  },
  {
    name: 'צ\'קליסט מסירת פרויקט',
    tasks: [
      { title: 'סיור סיום עם לקוח', order: 1 },
      { title: 'רשימת ליקויים', order: 2 },
      { title: 'איסוף חשבוניות אחריות', order: 3 },
      { title: 'העברת מדריכי שימוש', order: 4 },
      { title: 'צילום סופי', order: 5 },
      { title: 'עדכון פורטפוליו', order: 6 },
      { title: 'בקשת המלצה', order: 7 },
    ],
  },
  {
    name: 'צ\'קליסט הזמנת רכש',
    tasks: [
      { title: 'אישור מחיר מספק', order: 1 },
      { title: 'אישור לקוח', order: 2 },
      { title: 'שליחת הזמנה', order: 3 },
      { title: 'קבלת אישור הזמנה', order: 4 },
      { title: 'מעקב זמן אספקה', order: 5 },
    ],
  },
];
```

---

## ProposalTemplate - תבנית הצעת מחיר

### Interface

```typescript
interface ProposalTemplate {
  id: string;
  tenantId: string;

  name: string;
  description?: string;
  category?: string;

  // תוכן
  content: {
    introduction?: string;
    scope?: string;
    deliverables?: string[];
    timeline?: string;
    exclusions?: string[];
    assumptions?: string[];
    terms?: string;
  };

  // סעיפים
  sections: {
    title: string;
    content: string;
    order: number;
  }[];

  // פריטים לדוגמה (אופציונלי)
  sampleItems?: {
    type: string;
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }[];

  // עיצוב
  styling: {
    headerImage?: string;
    accentColor?: string;
    fontFamily?: string;
  };

  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  content JSONB NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  sample_items JSONB,
  styling JSONB DEFAULT '{}',

  usage_count INTEGER DEFAULT 0,
  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposal_templates_tenant ON proposal_templates(tenant_id);

-- RLS
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_templates_tenant_isolation ON proposal_templates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## ContractTemplate - תבנית חוזה

### Interface

```typescript
interface ContractTemplate {
  id: string;
  tenantId: string;

  name: string;
  description?: string;
  category?: string;

  // תוכן HTML עם placeholders
  content: string;

  // Placeholders זמינים
  availablePlaceholders: {
    key: string;
    description: string;
    example: string;
  }[];

  // שדות חתימה
  signatureFields: {
    party: 'designer' | 'client';
    label: string;
    required: boolean;
  }[];

  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  content TEXT NOT NULL,
  available_placeholders JSONB NOT NULL DEFAULT '[]',
  signature_fields JSONB NOT NULL DEFAULT '[]',

  usage_count INTEGER DEFAULT 0,
  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contract_templates_tenant ON contract_templates(tenant_id);

-- RLS
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_templates_tenant_isolation ON contract_templates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Placeholders נתמכים

```typescript
const CONTRACT_PLACEHOLDERS = [
  { key: '{{tenant.name}}', description: 'שם המשרד', example: 'סטודיו לעיצוב' },
  { key: '{{tenant.address}}', description: 'כתובת המשרד', example: 'רחוב הרצל 1, תל אביב' },
  { key: '{{tenant.phone}}', description: 'טלפון המשרד', example: '03-1234567' },
  { key: '{{client.name}}', description: 'שם הלקוח', example: 'ישראל ישראלי' },
  { key: '{{client.address}}', description: 'כתובת הלקוח', example: 'רחוב דיזנגוף 50' },
  { key: '{{client.phone}}', description: 'טלפון הלקוח', example: '050-1234567' },
  { key: '{{client.idNumber}}', description: 'ת.ז. הלקוח', example: '123456789' },
  { key: '{{project.name}}', description: 'שם הפרויקט', example: 'דירה ברמת גן' },
  { key: '{{project.address}}', description: 'כתובת הפרויקט', example: 'רחוב ביאליק 10' },
  { key: '{{contract.totalValue}}', description: 'סכום החוזה', example: '50,000' },
  { key: '{{contract.startDate}}', description: 'תאריך התחלה', example: '01/02/2026' },
  { key: '{{contract.endDate}}', description: 'תאריך סיום משוער', example: '01/06/2026' },
  { key: '{{today}}', description: 'תאריך היום', example: '13/01/2026' },
];
```

---

## EmailTemplate - תבנית מייל

### Interface

```typescript
interface EmailTemplate {
  id: string;
  tenantId: string;

  // מזהה
  name: string;
  description?: string;

  // סוג
  category: 'system' | 'marketing' | 'project' | 'payment' | 'custom';
  trigger?: string;                 // לאוטומציות

  // תוכן
  subject: string;
  body: string;                     // HTML עם placeholders

  // הגדרות
  settings: {
    includeSignature: boolean;
    includeLogo: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
  };

  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,

  category VARCHAR(50) NOT NULL,
  trigger VARCHAR(100),

  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,

  settings JSONB DEFAULT '{"includeSignature": true, "includeLogo": true, "trackOpens": true, "trackClicks": true}',

  usage_count INTEGER DEFAULT 0,
  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_category ON email_templates(tenant_id, category);
CREATE INDEX idx_email_templates_trigger ON email_templates(tenant_id, trigger);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_tenant_isolation ON email_templates
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### תבניות מובנות

```typescript
const BUILT_IN_EMAIL_TEMPLATES = [
  // System
  {
    name: 'הזמנה לצוות',
    category: 'system',
    trigger: 'team_invitation',
    subject: 'הוזמנת להצטרף ל-{{tenant.name}}',
    body: `
      <p>שלום,</p>
      <p>{{invitedBy.name}} מזמין אותך להצטרף לצוות של {{tenant.name}}.</p>
      <p><a href="{{inviteLink}}">לחץ כאן להצטרפות</a></p>
      <p>ההזמנה בתוקף ל-7 ימים.</p>
    `,
  },

  // Payment
  {
    name: 'תזכורת תשלום',
    category: 'payment',
    trigger: 'payment_reminder',
    subject: 'תזכורת: תשלום עבור {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>ברצוננו להזכיר כי תשלום בסך {{payment.amount}} ₪ עבור {{payment.name}} צפוי בתאריך {{payment.dueDate}}.</p>
      <p>פרטי הפרויקט: {{project.name}}</p>
      <p>לתשלום מאובטח: <a href="{{paymentLink}}">לחץ כאן</a></p>
      <p>בברכה,<br>{{tenant.name}}</p>
    `,
  },
  {
    name: 'תשלום באיחור',
    category: 'payment',
    trigger: 'payment_overdue',
    subject: 'תשלום באיחור - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>לתשומת לבך, תשלום בסך {{payment.amount}} ₪ עבור {{project.name}} היה אמור להתקבל בתאריך {{payment.dueDate}}.</p>
      <p>נשמח לסיוע בהסדרת התשלום.</p>
      <p>לתשלום: <a href="{{paymentLink}}">לחץ כאן</a></p>
    `,
  },
  {
    name: 'אישור קבלת תשלום',
    category: 'payment',
    trigger: 'payment_received',
    subject: 'התקבל תשלום - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תודה! קיבלנו את התשלום בסך {{payment.amount}} ₪.</p>
      <p>פרטי התשלום:</p>
      <ul>
        <li>פרויקט: {{project.name}}</li>
        <li>תשלום: {{payment.name}}</li>
        <li>סכום: {{payment.amount}} ₪</li>
        <li>תאריך: {{payment.paidDate}}</li>
      </ul>
    `,
  },

  // Project
  {
    name: 'ברוכים הבאים לפרויקט',
    category: 'project',
    trigger: 'project_started',
    subject: 'ברוכים הבאים! {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>שמחים להתחיל איתך את הפרויקט {{project.name}}!</p>
      <p>מצורף קישור לפורטל הלקוח שלך בו תוכל לעקוב אחר התקדמות הפרויקט:</p>
      <p><a href="{{portalLink}}">כניסה לפורטל</a></p>
    `,
  },
  {
    name: 'תזכורת פגישה',
    category: 'project',
    trigger: 'meeting_reminder',
    subject: 'תזכורת: פגישה מחר - {{meeting.title}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תזכורת לפגישה שנקבעה:</p>
      <ul>
        <li>נושא: {{meeting.title}}</li>
        <li>תאריך: {{meeting.date}}</li>
        <li>שעה: {{meeting.time}}</li>
        <li>מיקום: {{meeting.location}}</li>
      </ul>
    `,
  },
  {
    name: 'נדרש אישור',
    category: 'project',
    trigger: 'approval_needed',
    subject: 'נדרש אישורך - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>ממתינים לאישורך עבור: {{approval.itemName}}</p>
      <p><a href="{{approvalLink}}">לחץ כאן לצפייה ואישור</a></p>
    `,
  },

  // Satisfaction
  {
    name: 'סקר שביעות רצון',
    category: 'project',
    trigger: 'project_completed',
    subject: 'נשמח לשמוע ממך - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תודה שבחרת ב-{{tenant.name}}!</p>
      <p>נשמח מאוד אם תקדיש דקה לשתף אותנו במשוב:</p>
      <p><a href="{{surveyLink}}">למילוי הסקר</a></p>
    `,
  },
];
```

---

## API Endpoints

### Dashboard & Reports

```typescript
// Dashboard
GET  /api/dashboard/widgets                    // רשימת widgets זמינים
GET  /api/dashboard/widget/:id/data            // נתוני widget ספציפי
GET  /api/dashboard/layout                     // פריסה נוכחית
PATCH /api/dashboard/layout                    // עדכון פריסה

// Saved Filters
GET  /api/filters                              // רשימת פילטרים שמורים
POST /api/filters                              // יצירת פילטר חדש
PATCH /api/filters/:id                         // עדכון פילטר
DELETE /api/filters/:id                        // מחיקת פילטר

// Reports
GET  /api/reports/templates                    // רשימת דוחות
GET  /api/reports/templates/:id                // פרטי דוח
POST /api/reports/templates                    // יצירת דוח מותאם
POST /api/reports/generate/:templateId         // הפקת דוח
GET  /api/reports/generated/:id                // קבלת דוח שהופק
GET  /api/reports/generated/:id/download/:format

// Metrics
GET  /api/metrics/:metricId                    // מדד ספציפי
GET  /api/metrics/batch                        // מספר מדדים בבת אחת
POST /api/metrics/custom                       // שאילתת מדד מותאם

// Export
POST /api/export/pdf
POST /api/export/excel
POST /api/export/csv
```

### Templates

```typescript
// Project Templates
GET  /api/templates/projects
POST /api/templates/projects
GET  /api/templates/projects/:id
PATCH /api/templates/projects/:id
DELETE /api/templates/projects/:id
POST /api/templates/projects/:id/use          // יצירת פרויקט מתבנית

// Task Templates
GET  /api/templates/tasks
POST /api/templates/tasks
PATCH /api/templates/tasks/:id
DELETE /api/templates/tasks/:id
POST /api/templates/tasks/:id/apply/:projectId  // החלת תבנית על פרויקט

// Proposal Templates
GET  /api/templates/proposals
POST /api/templates/proposals
PATCH /api/templates/proposals/:id
DELETE /api/templates/proposals/:id
POST /api/templates/proposals/:id/use

// Contract Templates
GET  /api/templates/contracts
POST /api/templates/contracts
PATCH /api/templates/contracts/:id
DELETE /api/templates/contracts/:id

// Email Templates
GET  /api/templates/emails
POST /api/templates/emails
PATCH /api/templates/emails/:id
DELETE /api/templates/emails/:id
POST /api/templates/emails/:id/preview        // Preview עם נתוני דוגמה
POST /api/templates/emails/:id/test           // שליחת מייל לבדיקה
```

---

## WebSocket Events

```typescript
// Dashboard updates
const DASHBOARD_EVENTS = {
  'dashboard.widget_updated': 'נתוני widget התעדכנו',
  'dashboard.layout_changed': 'פריסה שונתה',
};

// Report events
const REPORT_EVENTS = {
  'report.generation_started': 'הפקת דוח התחילה',
  'report.generation_completed': 'הפקת דוח הסתיימה',
  'report.generation_failed': 'הפקת דוח נכשלה',
};
```

---

## Template Editor UI

```typescript
interface TemplateEditorUI {
  // Sidebar: placeholders זמינים
  placeholderPanel: {
    categories: string[];
    placeholders: { key: string; description: string }[];
    dragAndDrop: true;
  };

  // Main: עורך WYSIWYG
  editor: {
    type: 'rich_text';              // לemails, contracts
    toolbar: ['bold', 'italic', 'link', 'list', 'image', 'table'];
    placeholderHighlight: true;     // הדגשה ויזואלית של placeholders
  };

  // Preview
  preview: {
    sampleData: true;               // הצגה עם נתונים לדוגמה
    switchData: true;               // החלפת נתוני דוגמה
    responsive: true;               // תצוגה בגדלים שונים
  };
}
```

---

## הנחיות למימוש

### Reports

1. **Performance:**
   - Cache metric calculations (TTL based on data volatility)
   - Pre-calculate common metrics daily
   - Use materialized views for complex aggregations
   - Background job for heavy report generation

2. **Real-time Updates:**
   - Dashboard widgets refresh via WebSocket
   - Configurable refresh interval per widget
   - Manual refresh button

3. **Export:**
   - Generate in background for large reports
   - Send download link via email when ready
   - Clean up old generated files (7 days)

4. **Customization:**
   - Drag & drop widget placement
   - Resize widgets
   - Show/hide widgets
   - Save multiple layouts

### Templates

1. **Placeholder Processing:**
   ```typescript
   function processPlaceholders(template: string, data: Record<string, any>): string {
     return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
       const value = getNestedValue(data, key.trim());
       return value !== undefined ? String(value) : '';
     });
   }

   function getNestedValue(obj: any, path: string): any {
     return path.split('.').reduce((acc, part) => acc?.[part], obj);
   }
   ```

2. **Template Versioning:**
   - Keep history of changes
   - Ability to revert to previous version
   - Clone template

3. **Usage Tracking:**
   - Track which templates are used most
   - Suggest popular templates

4. **Multi-language:**
   - Support Hebrew and English templates
   - Auto-detect direction (RTL/LTR)

---

## קשרים לקבצים אחרים

| קובץ | קשר |
|------|-----|
| `00-shared-definitions.md` | Enums: Priority, PaymentType, BillingType |
| `03-project-client.md` | Project, Client - ישויות שדוחות פועלים עליהן |
| `04-tasks-docs-meetings.md` | Task, Meeting - ישויות בדוחות |
| `05-products-ffe.md` | RoomProduct, PurchaseOrder - דוחות FF&E |
| `06-financial.md` | Payment, Proposal, Contract - דוחות פיננסיים |
| `09-automations.md` | EmailTemplate.trigger - קישור לאוטומציות |
