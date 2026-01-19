# Configuration - הגדרות גנריות
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## מטרת המודול

מודול זה מטפל בכל ההגדרות הגנריות של המערכת - ערכים שיכולים להשתנות בין משרד למשרד וצריכים להיות configurable ע"י המשתמש.

## עקרון הגנריות

**כל מה שיכול להשתנות בין משרד למשרד צריך להיות configurable.**

### מה גנרי:

| Entity Type | תיאור | דוגמאות |
|-------------|--------|----------|
| `project_type` | סוגי פרויקטים | דירה, וילה, משרד, חנות |
| `project_status` | סטטוסי פרויקט | פעיל, מושהה, סגור |
| `project_phase` | שלבי פרויקט | ייעוץ, קונספט, תכנון, רכש, ביצוע, מסירה |
| `task_status` | סטטוסי משימה | לעשות, בעבודה, בבדיקה, הושלם |
| `product_category` | קטגוריות מוצרים | ריהוט, תאורה, טקסטיל |
| `room_type` | סוגי חדרים | סלון, מטבח, חדר שינה |
| `supplier_category` | סוגי ספקים | ריהוט, פרזול, בדים |
| `trade` | מקצועות | חשמלאי, אינסטלטור, נגר |
| `document_category` | סוגי מסמכים | תוכניות, חוזים, הצעות |
| `expense_category` | סוגי הוצאות | נסיעות, חומרים, שירותים |

## ישויות במודול

| ישות | תיאור | קשרים |
|------|--------|--------|
| ConfigurableEntity | ערך גנרי מוגדר | Tenant |
| CustomFieldDefinition | הגדרת שדה מותאם | Tenant |
| CustomFieldValue | ערך שדה מותאם | Entity כלשהי |
| Label | תגית | Entities שונות |
| NotificationTemplate | תבנית הודעה | Tenant, Automation |

---

# ב. ConfigurableEntity - ישות מוגדרת

ישות המאפשרת להגדיר ערכים גנריים לסוגים שונים (סטטוסים, שלבים, קטגוריות).

## Interface

```typescript
interface ConfigurableEntity {
  id: string;
  tenantId: string;

  // סוג הישות
  entityType: ConfigurableEntityType;   // מ-00-shared-definitions.md

  // תוכן
  name: string;                         // שם בעברית
  nameEn?: string;                      // שם באנגלית

  // עיצוב
  color?: string;                       // צבע hex
  icon?: string;                        // שם אייקון

  // מאפיינים
  isDefault: boolean;                   // האם ברירת מחדל
  isSystem: boolean;                    // מובנה - לא ניתן למחיקה

  // לסטטוסים - מעברים מותרים
  isFinal?: boolean;                    // האם סטטוס סופי
  allowedTransitions?: string[];        // IDs של סטטוסים שאפשר לעבור אליהם

  // מטא
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Schema

```sql
CREATE TABLE configurable_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- סוג
  entity_type VARCHAR(50) NOT NULL,

  -- תוכן
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),

  -- עיצוב
  color VARCHAR(7),
  icon VARCHAR(50),

  -- מאפיינים
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,

  -- סטטוסים
  is_final BOOLEAN,
  allowed_transitions UUID[],

  -- מטא
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_entity_name UNIQUE (tenant_id, entity_type, name)
);

-- Indexes
CREATE INDEX idx_configurable_entities_tenant ON configurable_entities(tenant_id);
CREATE INDEX idx_configurable_entities_type ON configurable_entities(tenant_id, entity_type);
CREATE INDEX idx_configurable_entities_active ON configurable_entities(tenant_id, entity_type, is_active);
```

## ערכי ברירת מחדל

### Project Phases (שלבי פרויקט)

```typescript
const DEFAULT_PROJECT_PHASES = [
  {
    name: 'ייעוץ ראשוני',
    nameEn: 'Initial Consultation',
    color: '#E8E8E8',
    order: 1,
    isSystem: true
  },
  {
    name: 'קונספט',
    nameEn: 'Concept Design',
    color: '#B8D4E8',
    order: 2,
    isSystem: true
  },
  {
    name: 'תכנון מפורט',
    nameEn: 'Detailed Design',
    color: '#7FB8D8',
    order: 3,
    isSystem: true
  },
  {
    name: 'רכש',
    nameEn: 'Procurement',
    color: '#4A9CC8',
    order: 4,
    isSystem: true
  },
  {
    name: 'התקנה וביצוע',
    nameEn: 'Installation',
    color: '#2080B8',
    order: 5,
    isSystem: true
  },
  {
    name: 'מסירה',
    nameEn: 'Handover',
    color: '#28A745',
    order: 6,
    isFinal: true,
    isSystem: true
  }
];
```

### Project Types (סוגי פרויקט)

```typescript
const DEFAULT_PROJECT_TYPES = [
  { name: 'דירה', nameEn: 'Apartment', icon: 'home', isDefault: true },
  { name: 'וילה', nameEn: 'Villa', icon: 'castle' },
  { name: 'פנטהאוז', nameEn: 'Penthouse', icon: 'building' },
  { name: 'משרד', nameEn: 'Office', icon: 'briefcase' },
  { name: 'חנות', nameEn: 'Retail', icon: 'shopping-bag' },
  { name: 'מסעדה', nameEn: 'Restaurant', icon: 'utensils' },
  { name: 'מלון/אירוח', nameEn: 'Hospitality', icon: 'bed' },
];
```

### Task Statuses (סטטוסי משימה)

```typescript
const DEFAULT_TASK_STATUSES = [
  {
    name: 'לעשות',
    nameEn: 'To Do',
    color: '#E5E7EB',
    order: 1,
    isDefault: true,
    allowedTransitions: ['in_progress']
  },
  {
    name: 'בעבודה',
    nameEn: 'In Progress',
    color: '#3B82F6',
    order: 2,
    allowedTransitions: ['todo', 'review', 'completed']
  },
  {
    name: 'בבדיקה',
    nameEn: 'In Review',
    color: '#F59E0B',
    order: 3,
    allowedTransitions: ['in_progress', 'completed']
  },
  {
    name: 'הושלם',
    nameEn: 'Completed',
    color: '#22C55E',
    order: 4,
    isFinal: true,
    allowedTransitions: ['in_progress']
  }
];
```

### Room Types (סוגי חדרים)

```typescript
const DEFAULT_ROOM_TYPES = [
  { name: 'סלון', nameEn: 'Living Room', icon: 'sofa' },
  { name: 'מטבח', nameEn: 'Kitchen', icon: 'chef-hat' },
  { name: 'חדר שינה', nameEn: 'Bedroom', icon: 'bed' },
  { name: 'חדר רחצה', nameEn: 'Bathroom', icon: 'bath' },
  { name: 'חדר ילדים', nameEn: 'Kids Room', icon: 'baby' },
  { name: 'מרפסת', nameEn: 'Balcony', icon: 'sun' },
  { name: 'משרד ביתי', nameEn: 'Home Office', icon: 'laptop' },
  { name: 'פינת אוכל', nameEn: 'Dining Area', icon: 'utensils' },
  { name: 'כניסה', nameEn: 'Entrance', icon: 'door-open' },
  { name: 'מעבר/מסדרון', nameEn: 'Hallway', icon: 'arrow-right' },
];
```

---

# ג. CustomFieldDefinition - הגדרת שדה מותאם

מאפשר למשרד להוסיף שדות מותאמים לישויות שונות.

## Interface

```typescript
interface CustomFieldDefinition {
  id: string;
  tenantId: string;

  // לאיזו ישות
  entityType: CustomFieldEntityType;    // מ-00-shared-definitions.md

  // פרטי השדה
  name: string;                         // שם להצגה
  fieldKey: string;                     // מזהה (snake_case)
  fieldType: CustomFieldType;           // מ-00-shared-definitions.md

  // אפשרויות (לשדות בחירה)
  options?: CustomFieldOption[];

  // ולידציה
  isRequired: boolean;
  minValue?: number;                    // למספרים
  maxValue?: number;
  minLength?: number;                   // לטקסט
  maxLength?: number;
  pattern?: string;                     // regex

  // תצוגה
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;

  // איפה להציג
  showInList: boolean;                  // בטבלה
  showInCard: boolean;                  // בכרטיס
  showInPortal: boolean;                // בפורטל לקוח
  showInFilter: boolean;                // בפילטרים

  // ארגון
  groupName?: string;                   // קיבוץ שדות
  order: number;
  isActive: boolean;

  // מטא
  createdAt: Date;
  updatedAt: Date;
}

interface CustomFieldOption {
  value: string;                        // ערך לשמירה
  label: string;                        // טקסט להצגה
  color?: string;                       // צבע (אופציונלי)
  isDefault?: boolean;                  // ברירת מחדל
}
```

## Database Schema

```sql
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- לאיזו ישות
  entity_type VARCHAR(50) NOT NULL,

  -- פרטי השדה
  name VARCHAR(100) NOT NULL,
  field_key VARCHAR(50) NOT NULL,
  field_type VARCHAR(30) NOT NULL,

  -- אפשרויות (JSON)
  options JSONB,

  -- ולידציה
  is_required BOOLEAN DEFAULT FALSE,
  min_value NUMERIC,
  max_value NUMERIC,
  min_length INTEGER,
  max_length INTEGER,
  pattern VARCHAR(500),

  -- תצוגה
  default_value TEXT,
  placeholder VARCHAR(200),
  help_text TEXT,

  -- איפה להציג
  show_in_list BOOLEAN DEFAULT FALSE,
  show_in_card BOOLEAN DEFAULT TRUE,
  show_in_portal BOOLEAN DEFAULT FALSE,
  show_in_filter BOOLEAN DEFAULT FALSE,

  -- ארגון
  group_name VARCHAR(100),
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_field_key UNIQUE (tenant_id, entity_type, field_key)
);

-- Indexes
CREATE INDEX idx_custom_fields_tenant ON custom_field_definitions(tenant_id);
CREATE INDEX idx_custom_fields_entity ON custom_field_definitions(tenant_id, entity_type);
CREATE INDEX idx_custom_fields_active ON custom_field_definitions(tenant_id, entity_type, is_active);
```

---

# ד. CustomFieldValue - ערך שדה מותאם

ערכים בפועל של שדות מותאמים.

## Interface

```typescript
interface CustomFieldValue {
  id: string;
  tenantId: string;

  // קשרים
  fieldId: string;                      // מזהה ההגדרה
  entityType: string;                   // סוג הישות
  entityId: string;                     // מזהה הישות

  // ערך
  value: string;                        // תמיד string - parse לפי type

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Schema

```sql
CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- קשרים
  field_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- ערך
  value TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_field_value UNIQUE (tenant_id, field_id, entity_id)
);

-- Indexes
CREATE INDEX idx_custom_values_tenant ON custom_field_values(tenant_id);
CREATE INDEX idx_custom_values_entity ON custom_field_values(tenant_id, entity_type, entity_id);
CREATE INDEX idx_custom_values_field ON custom_field_values(field_id);
```

## Type Parsing

```typescript
// המרת ערך מ-string לפי סוג השדה
function parseCustomFieldValue(value: string, fieldType: CustomFieldType): any {
  switch (fieldType) {
    case 'number':
    case 'currency':
      return parseFloat(value);
    case 'boolean':
      return value === 'true';
    case 'date':
    case 'datetime':
      return new Date(value);
    case 'multiselect':
      return JSON.parse(value);       // מערך של ערכים
    default:
      return value;                   // text, select, url, email, phone, textarea, file
  }
}

// המרת ערך ל-string לשמירה
function serializeCustomFieldValue(value: any, fieldType: CustomFieldType): string {
  switch (fieldType) {
    case 'multiselect':
      return JSON.stringify(value);
    case 'date':
    case 'datetime':
      return value instanceof Date ? value.toISOString() : value;
    default:
      return String(value);
  }
}
```

---

# ה. Label - תגית

תגיות לסיווג ישויות שונות.

## Interface

```typescript
interface Label {
  id: string;
  tenantId: string;

  // פרטים
  name: string;
  color: string;                        // hex color

  // לאילו ישויות
  applicableTo: LabelEntityType[];      // מ-00-shared-definitions.md

  // מטא
  order: number;
  isActive: boolean;
  createdAt: Date;
}
```

## Database Schema

```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- פרטים
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,

  -- לאילו ישויות (מערך)
  applicable_to VARCHAR(50)[] NOT NULL,

  -- מטא
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_label_name UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX idx_labels_tenant ON labels(tenant_id);
CREATE INDEX idx_labels_active ON labels(tenant_id, is_active);
```

## EntityLabel - קשר בין תגית לישות

```sql
CREATE TABLE entity_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- קשרים
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_entity_label UNIQUE (label_id, entity_type, entity_id)
);

-- Indexes
CREATE INDEX idx_entity_labels_entity ON entity_labels(entity_type, entity_id);
CREATE INDEX idx_entity_labels_label ON entity_labels(label_id);
```

---

# ו. NotificationTemplate - תבנית הודעה

תבניות להודעות אוטומטיות.

## Interface

```typescript
interface NotificationTemplate {
  id: string;
  tenantId: string;

  // מזהה
  name: string;

  // טריגר
  trigger: NotificationTrigger;         // מ-00-shared-definitions.md

  // ערוצים
  channels: NotificationChannel[];      // מ-00-shared-definitions.md

  // תוכן
  subject?: string;                     // לאימייל
  body: string;                         // עם placeholders

  // תזמון
  sendAutomatically: boolean;
  daysBeforeEvent?: number;             // X ימים לפני
  daysAfterEvent?: number;              // X ימים אחרי
  sendTime?: string;                    // שעה לשליחה "09:00"

  // מטא
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Schema

```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- מזהה
  name VARCHAR(100) NOT NULL,

  -- טריגר
  trigger VARCHAR(50) NOT NULL,

  -- ערוצים (מערך)
  channels VARCHAR(20)[] NOT NULL,

  -- תוכן
  subject VARCHAR(500),
  body TEXT NOT NULL,

  -- תזמון
  send_automatically BOOLEAN DEFAULT FALSE,
  days_before_event INTEGER,
  days_after_event INTEGER,
  send_time TIME,

  -- מטא
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_template_name UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX idx_notification_templates_tenant ON notification_templates(tenant_id);
CREATE INDEX idx_notification_templates_trigger ON notification_templates(tenant_id, trigger);
CREATE INDEX idx_notification_templates_active ON notification_templates(tenant_id, is_active);
```

## Placeholders זמינים

```typescript
const TEMPLATE_PLACEHOLDERS = {
  // פרויקט
  '{{project.name}}': 'שם הפרויקט',
  '{{project.code}}': 'קוד פרויקט',
  '{{project.address}}': 'כתובת',
  '{{project.phase}}': 'שלב נוכחי',

  // לקוח
  '{{client.name}}': 'שם הלקוח',
  '{{client.email}}': 'מייל',
  '{{client.phone}}': 'טלפון',

  // תשלום
  '{{payment.name}}': 'שם התשלום',
  '{{payment.amount}}': 'סכום',
  '{{payment.dueDate}}': 'תאריך יעד',

  // משימה
  '{{task.title}}': 'כותרת משימה',
  '{{task.dueDate}}': 'תאריך יעד',
  '{{task.assignee}}': 'מבצע',

  // פגישה
  '{{meeting.title}}': 'כותרת פגישה',
  '{{meeting.date}}': 'תאריך',
  '{{meeting.time}}': 'שעה',
  '{{meeting.location}}': 'מיקום',

  // מוצר
  '{{product.name}}': 'שם המוצר',
  '{{product.supplier}}': 'ספק',

  // משרד
  '{{tenant.name}}': 'שם המשרד',
  '{{tenant.phone}}': 'טלפון משרד',

  // מערכת
  '{{today}}': 'תאריך היום',
  '{{link}}': 'קישור רלוונטי',
};
```

## תבניות ברירת מחדל

```typescript
const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    name: 'תזכורת תשלום - 7 ימים לפני',
    trigger: 'payment_due',
    channels: ['email'],
    subject: 'תזכורת: תשלום קרוב - {{project.name}}',
    body: `שלום {{client.name}},

ברצוננו להזכיר כי תשלום בסך {{payment.amount}} ₪ עבור {{payment.name}} צפוי בתאריך {{payment.dueDate}}.

לתשלום: {{link}}

בברכה,
{{tenant.name}}`,
    sendAutomatically: true,
    daysBeforeEvent: 7,
    sendTime: '09:00',
  },
  {
    name: 'תשלום באיחור',
    trigger: 'payment_overdue',
    channels: ['email', 'whatsapp'],
    subject: 'תשלום באיחור - {{project.name}}',
    body: `שלום {{client.name}},

לתשומת לבך, תשלום בסך {{payment.amount}} ₪ עבור {{project.name}} היה אמור להתקבל בתאריך {{payment.dueDate}}.

נשמח לסיועך בהסדרת התשלום.

לתשלום: {{link}}

בברכה,
{{tenant.name}}`,
    sendAutomatically: true,
    daysAfterEvent: 1,
    sendTime: '10:00',
  },
  {
    name: 'תזכורת פגישה',
    trigger: 'meeting_reminder',
    channels: ['email', 'sms'],
    subject: 'תזכורת: פגישה מחר - {{meeting.title}}',
    body: `שלום {{client.name}},

תזכורת לפגישה:
- נושא: {{meeting.title}}
- תאריך: {{meeting.date}}
- שעה: {{meeting.time}}
- מיקום: {{meeting.location}}

נתראה!
{{tenant.name}}`,
    sendAutomatically: true,
    daysBeforeEvent: 1,
    sendTime: '18:00',
  },
  {
    name: 'נדרש אישור',
    trigger: 'approval_needed',
    channels: ['email', 'in_app'],
    subject: 'נדרש אישורך - {{project.name}}',
    body: `שלום {{client.name}},

ממתינים לאישורך עבור פרויקט {{project.name}}.

לצפייה ואישור: {{link}}

בברכה,
{{tenant.name}}`,
    sendAutomatically: true,
  },
  {
    name: 'משימה באיחור',
    trigger: 'task_due',
    channels: ['in_app'],
    subject: 'משימה באיחור',
    body: `משימה "{{task.title}}" בפרויקט {{project.name}} באיחור.
תאריך יעד: {{task.dueDate}}`,
    sendAutomatically: true,
    daysAfterEvent: 1,
  },
];
```

---

# ז. API Endpoints

## ConfigurableEntity API

```typescript
// רשימת ערכים לפי סוג
GET /api/config/:entityType
// Query: ?active=true
// Response: ConfigurableEntity[]

// ערך בודד
GET /api/config/:entityType/:id

// יצירת ערך חדש
POST /api/config/:entityType
// Body: Omit<ConfigurableEntity, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>

// עדכון ערך
PATCH /api/config/:entityType/:id
// Body: Partial<ConfigurableEntity>

// מחיקה (רק אם לא system)
DELETE /api/config/:entityType/:id

// שינוי סדר
PATCH /api/config/:entityType/reorder
// Body: { ids: string[] }

// איפוס לברירת מחדל
POST /api/config/:entityType/reset
```

## CustomField API

```typescript
// רשימת שדות לפי ישות
GET /api/custom-fields/:entityType
// Query: ?active=true
// Response: CustomFieldDefinition[]

// הגדרה בודדת
GET /api/custom-fields/:entityType/:id

// יצירת שדה
POST /api/custom-fields/:entityType
// Body: Omit<CustomFieldDefinition, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>

// עדכון שדה
PATCH /api/custom-fields/:entityType/:id

// מחיקה
DELETE /api/custom-fields/:entityType/:id

// ערכים של ישות
GET /api/custom-fields/values/:entityType/:entityId
// Response: { [fieldKey: string]: any }

// עדכון ערכים
PUT /api/custom-fields/values/:entityType/:entityId
// Body: { [fieldKey: string]: any }
```

## Label API

```typescript
// רשימת תגיות
GET /api/labels
// Query: ?applicableTo=project,task

// תגית בודדת
GET /api/labels/:id

// יצירה
POST /api/labels

// עדכון
PATCH /api/labels/:id

// מחיקה
DELETE /api/labels/:id

// הוספת תגית לישות
POST /api/labels/:id/attach
// Body: { entityType: string, entityId: string }

// הסרת תגית מישות
DELETE /api/labels/:id/detach
// Body: { entityType: string, entityId: string }

// תגיות של ישות
GET /api/labels/entity/:entityType/:entityId
```

## NotificationTemplate API

```typescript
// רשימת תבניות
GET /api/notification-templates
// Query: ?trigger=payment_due

// תבנית בודדת
GET /api/notification-templates/:id

// יצירה
POST /api/notification-templates

// עדכון
PATCH /api/notification-templates/:id

// מחיקה
DELETE /api/notification-templates/:id

// Preview עם נתונים לדוגמה
POST /api/notification-templates/:id/preview
// Body: { sampleData: Record<string, any> }
// Response: { subject: string, body: string }

// שליחת בדיקה
POST /api/notification-templates/:id/test
// Body: { to: string, channel: NotificationChannel }
```

---

# ח. קשרים לקבצים אחרים

## תלויות (קבצים שמודול זה תלוי בהם)

| קובץ | ישויות בשימוש |
|------|---------------|
| `00-shared-definitions.md` | ConfigurableEntityType, CustomFieldType, CustomFieldEntityType, NotificationTrigger, NotificationChannel, LabelEntityType |
| `02-auth-tenant-user.md` | Tenant |

## תלויים (קבצים שתלויים במודול זה)

| קובץ | שימוש |
|------|-------|
| `03-project-client.md` | Project.typeId, Project.statusId, Project.phaseId, Room.typeId |
| `04-tasks-docs-meetings.md` | Task.statusId, Task.categoryId, Document.categoryId |
| `05-products-ffe.md` | Product.categoryId, Supplier.categoryId |
| `06-financial.md` | Expense.categoryId |
| `07-collaboration.md` | Professional.tradeId |
| `09-automations.md` | AutomationRule.actions → NotificationTemplate |

---

# ט. הנחיות למימוש

## Seeding

```typescript
// יצירת ערכי ברירת מחדל ב-Tenant חדש
async function seedTenantDefaults(tenantId: string) {
  // שלבי פרויקט
  await createConfigurableEntities(tenantId, 'project_phase', DEFAULT_PROJECT_PHASES);

  // סוגי פרויקט
  await createConfigurableEntities(tenantId, 'project_type', DEFAULT_PROJECT_TYPES);

  // סטטוסי משימה
  await createConfigurableEntities(tenantId, 'task_status', DEFAULT_TASK_STATUSES);

  // סוגי חדרים
  await createConfigurableEntities(tenantId, 'room_type', DEFAULT_ROOM_TYPES);

  // תבניות הודעות
  await createNotificationTemplates(tenantId, DEFAULT_NOTIFICATION_TEMPLATES);
}
```

## Caching

```typescript
const CONFIGURATION_CACHE = {
  // Cache TTL
  configurableEntities: 3600,       // שעה
  customFields: 3600,
  labels: 3600,
  notificationTemplates: 1800,      // 30 דקות

  // Invalidation
  invalidateOn: [
    'configurable_entity.created',
    'configurable_entity.updated',
    'configurable_entity.deleted',
    'custom_field.created',
    'custom_field.updated',
    'custom_field.deleted',
    'label.created',
    'label.updated',
    'label.deleted',
    'notification_template.updated',
  ],
};
```

## UI Guidelines

### הגדרות כלליות

```typescript
interface ConfigurationUI {
  // דף הגדרות
  settingsPage: {
    sections: [
      { id: 'project_phases', name: 'שלבי פרויקט', entityType: 'project_phase' },
      { id: 'project_types', name: 'סוגי פרויקט', entityType: 'project_type' },
      { id: 'task_statuses', name: 'סטטוסי משימה', entityType: 'task_status' },
      { id: 'room_types', name: 'סוגי חדרים', entityType: 'room_type' },
      { id: 'product_categories', name: 'קטגוריות מוצרים', entityType: 'product_category' },
      { id: 'supplier_categories', name: 'קטגוריות ספקים', entityType: 'supplier_category' },
      { id: 'trades', name: 'מקצועות', entityType: 'trade' },
      { id: 'expense_categories', name: 'קטגוריות הוצאות', entityType: 'expense_category' },
    ];
  };

  // רכיב עריכה
  editableList: {
    dragToReorder: true;
    inlineEdit: true;
    colorPicker: true;
    iconPicker: true;
    canDelete: (item) => !item.isSystem;
    canDisable: true;
  };
}
```

### שדות מותאמים

```typescript
interface CustomFieldsUI {
  // בניית שדה
  fieldBuilder: {
    typeSelector: true;
    validationConfig: true;
    displayOptions: true;
    preview: true;
  };

  // תצוגה בטופס
  formRendering: {
    groupByGroupName: true;
    sortByOrder: true;
    showHelpText: true;
    validateOnBlur: true;
  };
}
```

---

**הפניות לקבצים אחרים:**
- Enums: `00-shared-definitions.md`
- Tenant: `02-auth-tenant-user.md`
- Project/Room: `03-project-client.md`
- Task/Document: `04-tasks-docs-meetings.md`
- Product/Supplier: `05-products-ffe.md`
- Expense: `06-financial.md`
- Automations: `09-automations.md`
