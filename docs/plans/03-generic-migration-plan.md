# תוכנית מיגרציה לגנרי: 03-project-client

> **תאריך:** 2026-01-19
> **מקור:** docs/specs/03-project-client.md
> **ישויות:** Client, Supplier, Professional, Project

---

## 1. מצב המערכת הגנרית הקיימת

### 1.1 סוגי שדות נתמכים ✅

| סוג | תיאור | דוגמה |
|-----|-------|-------|
| `text` | טקסט קצר | שם, כתובת |
| `textarea` | טקסט ארוך | תיאור, הערות |
| `email` | כתובת אימייל | עם validation |
| `phone` | מספר טלפון | עם עיצוב |
| `url` | קישור | אתר אינטרנט |
| `number` | מספר | שטח, קומות |
| `currency` | סכום כסף | תקציב, מחיר |
| `date` | תאריך | תאריך התחלה |
| `datetime` | תאריך ושעה | מועד פגישה |
| `boolean` | כן/לא | VIP, פעיל |
| `select` | בחירה בודדת | סטטוס, עדיפות |
| `multiselect` | בחירה מרובה | תגיות, העדפות |

### 1.2 מודלים גנריים קיימים ✅

#### EntityType - הגדרת ישות
```typescript
{
  id: string;
  tenantId: string;
  name: string;           // "לקוח"
  namePlural: string;     // "לקוחות"
  nameEn?: string;        // "Client"
  slug: string;           // "clients"
  icon?: string;          // "Users"
  color?: string;         // "#3B82F6"
  description?: string;
  fields: FieldDefinition[];  // JSON array
  showInNav: boolean;
  navParentId?: string;
  isActive: boolean;
  isSystem: boolean;      // true = לא ניתן למחיקה
}
```

#### GenericEntity - רשומת ישות
```typescript
{
  id: string;
  tenantId: string;
  entityTypeId: string;
  name: string;           // שדה חובה - שם הרשומה
  data: Record<string, unknown>;  // JSON - כל השדות הנוספים
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### RelationDefinition - הגדרת קשר
```typescript
{
  id: string;
  tenantId: string;
  name: string;               // "פרויקטים"
  fieldKey: string;           // "projects"
  sourceEntityType: string;   // "generic:clients"
  targetEntityType: string;   // "generic:projects"
  relationType: string;       // "one_to_many" | "many_to_many" | "one_to_one"
  isBidirectional: boolean;   // true = מציג בשני הצדדים
  inverseName?: string;       // "לקוח"
  displayFields?: string[];   // ["name", "email"]
  isActive: boolean;
}
```

#### EntityRelation - מופע קשר
```typescript
{
  id: string;
  tenantId: string;
  relationDefId: string;
  sourceEntityType: string;
  sourceEntityId: string;
  targetEntityType: string;
  targetEntityId: string;
  order: number;
}
```

### 1.3 ConfigurableEntity - לסטטוסים ושלבים ✅

```typescript
{
  id: string;
  tenantId: string;
  entityType: string;         // "project_status" | "project_phase" | "trade" | ...
  code?: string;              // "active" | "completed"
  name: string;               // "פעיל"
  nameEn?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  isSystem: boolean;
  isFinal: boolean;           // סטטוס סופי
  allowedTransitions: string[]; // IDs של סטטוסים מותרים
  order: number;
  isActive: boolean;
}
```

---

## 2. מה צריך להוסיף למערכת הגנרית

### 2.1 תמיכה בקשרים לטבלאות מערכת 🆕

**בעיה:** RelationDefinition תומך רק ב-`generic:X` כיעד.

**פתרון:** הרחבת targetEntityType:
```typescript
targetEntityType:
  | "generic:clients"                    // ישות גנרית
  | "system:user"                        // טבלת User
  | "system:configurable:project_status" // ConfigurableEntity
```

**קבצים לשינוי:**
- `src/server/routers/relations/queries.ts` - פונקציית fetchTargetEntities
- `src/components/generic-entity-table/relation-cell.tsx` - תמיכה ב-picker

### 2.2 שדות מחושבים (Computed Fields) 🆕

**בעיה:** אין תמיכה בשדות שמחושבים מקשרים (count, sum, avg).

**פתרון:** הוספת `computedFields` ל-EntityType:
```typescript
// Schema change
model EntityType {
  // ...existing fields
  computedFields Json @default("[]")
}

// Structure
interface ComputedFieldDef {
  fieldKey: string;              // "total_projects"
  name: string;                  // "מספר פרויקטים"
  computationType: "count" | "sum" | "avg" | "percent" | "exists";
  sourceRelation: string;        // fieldKey של הקשר
  sourceField?: string;          // לאיזה שדה לעשות sum
  filterField?: string;          // לפילטר
  filterValue?: string;
  displayType: "number" | "percent" | "currency" | "boolean";
}
```

**קבצים לשינוי:**
- `prisma/schema.prisma` - הוספת computedFields
- `src/server/routers/generic-entities/queries.ts` - חישוב בזמן שליפה

### 2.3 Workflow Validation 🆕

**בעיה:** אין validation על מעברי סטטוס.

**פתרון:** שימוש ב-`allowedTransitions` של ConfigurableEntity:
```typescript
// In updateEntity mutation
if (statusChanged) {
  const currentStatus = await getConfigurableEntity(currentStatusId);
  if (!currentStatus.allowedTransitions.includes(newStatusId)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'מעבר לא מותר' });
  }
}
```

**קבצים לשינוי:**
- `src/server/routers/generic-entities/mutations.ts` - validation

---

## 3. שלבי עבודה מפורטים

### Phase 1: תשתית קשרים (G7.5-G7.6)

#### G7.5: System Relations
| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G7.5.1 | הוספת פונקציית `fetchTargetEntities` ב-relations router | P0 |
| G7.5.2 | תמיכה ב-`system:user` - שליפה מטבלת User | P0 |
| G7.5.3 | תמיכה ב-`system:configurable:X` - שליפה מ-ConfigurableEntity | P0 |
| G7.5.4 | עדכון relation-cell.tsx לתמיכה ב-system types | P0 |
| G7.5.5 | עדכון add-relation-button לבחירת system types | P1 |

#### G7.6: Bidirectional Relations
| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G7.6.1 | Query לקשרים הפוכים (inverse relations) | P0 |
| G7.6.2 | הצגת קשרים הפוכים בטבלה | P1 |
| G7.6.3 | הצגת קשרים הפוכים בדף פרטים | P1 |

### Phase 2: שדות מחושבים (G7.7)

| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G7.7.1 | Migration - הוספת computedFields ל-EntityType | P0 |
| G7.7.2 | פונקציית calculateComputedField | P0 |
| G7.7.3 | תמיכה ב-count (ספירת קשרים) | P0 |
| G7.7.4 | תמיכה ב-sum (סכימה) | P1 |
| G7.7.5 | תמיכה ב-percent (אחוז) | P1 |
| G7.7.6 | הצגת computed fields ב-UI (read-only) | P0 |

### Phase 3: Workflow (G7.8)

| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G7.8.1 | Validation במעבר סטטוס | P0 |
| G7.8.2 | הצגת סטטוסים מותרים בלבד ב-picker | P1 |
| G7.8.3 | UI לניהול workflow (אופציונלי) | P2 |

### Phase 4: Seed ישויות (G8)

| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G8.1 | Seed Client EntityType | P0 |
| G8.2 | Seed Supplier EntityType | P0 |
| G8.3 | Seed Professional EntityType | P0 |
| G8.4 | Seed Project EntityType | P0 |
| G8.5 | Seed כל הקשרים | P0 |
| G8.6 | Seed Navigation Items | P1 |

### Phase 5: מיגרציה (G9)

| משימה | תיאור | עדיפות |
|-------|-------|--------|
| G9.1 | Script מיגרציה Client | P0 |
| G9.2 | Script מיגרציה Supplier | P0 |
| G9.3 | Script מיגרציה Professional | P0 |
| G9.4 | Script מיגרציה Project | P0 |
| G9.5 | מיגרציה של קשרים | P0 |
| G9.6 | Validation ובדיקות | P0 |

---

## 4. הגדרות מפורטות לכל ישות

### 4.1 Client (לקוח)

#### EntityType Definition
```typescript
const clientEntityType = {
  name: "לקוח",
  namePlural: "לקוחות",
  nameEn: "Client",
  slug: "clients",
  icon: "Users",
  color: "#10B981",
  isSystem: true,
  fields: [
    // פרטים בסיסיים
    { fieldKey: "type", name: "סוג", fieldType: "select", isRequired: true, options: [
      { value: "individual", label: "פרטי" },
      { value: "company", label: "חברה" }
    ]},

    // קשר
    { fieldKey: "email", name: "אימייל", fieldType: "email" },
    { fieldKey: "phone", name: "טלפון", fieldType: "phone" },
    { fieldKey: "mobile", name: "נייד", fieldType: "phone" },
    { fieldKey: "preferred_communication", name: "תקשורת מועדפת", fieldType: "select", options: [
      { value: "phone", label: "טלפון" },
      { value: "email", label: "אימייל" },
      { value: "whatsapp", label: "וואטסאפ" },
      { value: "sms", label: "SMS" }
    ]},
    { fieldKey: "best_time_to_contact", name: "זמן מועדף ליצירת קשר", fieldType: "text" },

    // כתובת
    { fieldKey: "address", name: "כתובת", fieldType: "textarea" },
    { fieldKey: "city", name: "עיר", fieldType: "text" },

    // חברה
    { fieldKey: "company_number", name: "ח.פ.", fieldType: "text" },
    { fieldKey: "contact_person", name: "איש קשר", fieldType: "text" },

    // סטטוס
    { fieldKey: "status", name: "סטטוס", fieldType: "select", isRequired: true, options: [
      { value: "lead", label: "ליד", color: "#94A3B8" },
      { value: "active", label: "פעיל", color: "#10B981" },
      { value: "past", label: "לקוח עבר", color: "#6B7280" },
      { value: "inactive", label: "לא פעיל", color: "#EF4444" }
    ]},
    { fieldKey: "lead_source", name: "מקור הליד", fieldType: "text" },
    { fieldKey: "lead_score", name: "ציון ליד", fieldType: "number" },

    // העדפות
    { fieldKey: "style_preferences", name: "העדפות סגנון", fieldType: "multiselect", options: [
      { value: "modern", label: "מודרני" },
      { value: "classic", label: "קלאסי" },
      { value: "minimalist", label: "מינימליסטי" },
      { value: "industrial", label: "תעשייתי" },
      { value: "scandinavian", label: "סקנדינבי" }
    ]},
    { fieldKey: "budget_range", name: "טווח תקציב", fieldType: "text" },

    // הפניות
    { fieldKey: "referred_by", name: "הופנה ע״י", fieldType: "text" },

    // תאריכים
    { fieldKey: "anniversary_date", name: "יום נישואין", fieldType: "date" },

    // הערכה
    { fieldKey: "satisfaction_rating", name: "דירוג שביעות רצון", fieldType: "number" },
    { fieldKey: "would_recommend", name: "ימליץ לאחרים", fieldType: "boolean" },
    { fieldKey: "testimonial", name: "המלצה", fieldType: "textarea" },

    // הערות
    { fieldKey: "notes", name: "הערות", fieldType: "textarea" }
  ],

  computedFields: [
    { fieldKey: "total_projects", name: "מספר פרויקטים", computationType: "count", sourceRelation: "projects", displayType: "number" },
    { fieldKey: "active_projects", name: "פרויקטים פעילים", computationType: "count", sourceRelation: "projects", filterField: "status", filterValue: "active", displayType: "number" }
  ]
};
```

#### Relations for Client
```typescript
const clientRelations = [
  {
    name: "לקוח מפנה",
    fieldKey: "referred_by_client",
    sourceEntityType: "generic:clients",
    targetEntityType: "generic:clients",
    relationType: "many_to_one",
    isBidirectional: true,
    inverseName: "לקוחות שהפנה"
  },
  {
    name: "פרויקטים",
    fieldKey: "projects",
    sourceEntityType: "generic:clients",
    targetEntityType: "generic:projects",
    relationType: "one_to_many",
    isBidirectional: true,
    inverseName: "לקוח"
  }
];
```

---

### 4.2 Supplier (ספק)

#### EntityType Definition
```typescript
const supplierEntityType = {
  name: "ספק",
  namePlural: "ספקים",
  nameEn: "Supplier",
  slug: "suppliers",
  icon: "Truck",
  color: "#F59E0B",
  isSystem: true,
  fields: [
    // קשר
    { fieldKey: "email", name: "אימייל", fieldType: "email" },
    { fieldKey: "phone", name: "טלפון", fieldType: "phone" },
    { fieldKey: "website", name: "אתר", fieldType: "url" },
    { fieldKey: "contact_person", name: "איש קשר", fieldType: "text" },

    // כתובת
    { fieldKey: "address", name: "כתובת", fieldType: "textarea" },
    { fieldKey: "city", name: "עיר", fieldType: "text" },
    { fieldKey: "company_number", name: "ח.פ.", fieldType: "text" },

    // תנאים מסחריים
    { fieldKey: "payment_terms", name: "תנאי תשלום", fieldType: "text" },
    { fieldKey: "discount_percent", name: "אחוז הנחה", fieldType: "number" },
    { fieldKey: "credit_days", name: "ימי אשראי", fieldType: "number" },
    { fieldKey: "minimum_order", name: "הזמנה מינימלית", fieldType: "currency" },

    // Trade Account
    { fieldKey: "has_trade_account", name: "יש חשבון סוחר", fieldType: "boolean" },
    { fieldKey: "trade_account_number", name: "מספר חשבון סוחר", fieldType: "text" },
    { fieldKey: "trade_discount_percent", name: "הנחת סוחר %", fieldType: "number" },

    // הערכה
    { fieldKey: "rating", name: "דירוג", fieldType: "number" },
    { fieldKey: "reliability_score", name: "ציון אמינות", fieldType: "number" },

    // הערות
    { fieldKey: "notes", name: "הערות", fieldType: "textarea" }
  ],

  computedFields: [
    { fieldKey: "total_products", name: "מספר מוצרים", computationType: "count", sourceRelation: "products", displayType: "number" },
    { fieldKey: "total_orders", name: "מספר הזמנות", computationType: "count", sourceRelation: "orders", displayType: "number" }
  ]
};
```

#### Relations for Supplier
```typescript
const supplierRelations = [
  {
    name: "קטגוריה",
    fieldKey: "category",
    sourceEntityType: "generic:suppliers",
    targetEntityType: "system:configurable:supplier_category",
    relationType: "many_to_one",
    isBidirectional: false
  },
  {
    name: "מוצרים",
    fieldKey: "products",
    sourceEntityType: "generic:suppliers",
    targetEntityType: "generic:products",
    relationType: "one_to_many",
    isBidirectional: true,
    inverseName: "ספק"
  }
];
```

---

### 4.3 Professional (בעל מקצוע)

#### EntityType Definition
```typescript
const professionalEntityType = {
  name: "בעל מקצוע",
  namePlural: "בעלי מקצוע",
  nameEn: "Professional",
  slug: "professionals",
  icon: "Wrench",
  color: "#8B5CF6",
  isSystem: true,
  fields: [
    // פרטים
    { fieldKey: "company_name", name: "שם החברה", fieldType: "text" },

    // קשר
    { fieldKey: "phone", name: "טלפון", fieldType: "phone", isRequired: true },
    { fieldKey: "email", name: "אימייל", fieldType: "email" },

    // רישיון
    { fieldKey: "license_number", name: "מספר רישיון", fieldType: "text" },
    { fieldKey: "insurance_expiry", name: "תוקף ביטוח", fieldType: "date" },

    // הערכה
    { fieldKey: "rating", name: "דירוג", fieldType: "number" },

    // הערות
    { fieldKey: "notes", name: "הערות", fieldType: "textarea" },
    { fieldKey: "specialties", name: "התמחויות", fieldType: "multiselect", options: [] }
  ],

  computedFields: [
    { fieldKey: "total_projects", name: "מספר פרויקטים", computationType: "count", sourceRelation: "projects", displayType: "number" }
  ]
};
```

#### Relations for Professional
```typescript
const professionalRelations = [
  {
    name: "מקצוע",
    fieldKey: "trade",
    sourceEntityType: "generic:professionals",
    targetEntityType: "system:configurable:trade",
    relationType: "many_to_one",
    isBidirectional: false,
    isRequired: true
  },
  {
    name: "פרויקטים",
    fieldKey: "projects",
    sourceEntityType: "generic:professionals",
    targetEntityType: "generic:projects",
    relationType: "many_to_many",
    isBidirectional: true,
    inverseName: "בעלי מקצוע"
  }
];
```

---

### 4.4 Project (פרויקט)

#### EntityType Definition
```typescript
const projectEntityType = {
  name: "פרויקט",
  namePlural: "פרויקטים",
  nameEn: "Project",
  slug: "projects",
  icon: "FolderKanban",
  color: "#3B82F6",
  isSystem: true,
  fields: [
    // פרטים בסיסיים
    { fieldKey: "description", name: "תיאור", fieldType: "textarea" },
    { fieldKey: "code", name: "קוד פרויקט", fieldType: "text" },

    // סיווג
    { fieldKey: "priority", name: "עדיפות", fieldType: "select", isRequired: true, options: [
      { value: "low", label: "נמוכה", color: "#94A3B8" },
      { value: "medium", label: "בינונית", color: "#F59E0B" },
      { value: "high", label: "גבוהה", color: "#EF4444" },
      { value: "urgent", label: "דחוף", color: "#DC2626" }
    ]},
    { fieldKey: "is_vip", name: "VIP", fieldType: "boolean" },
    { fieldKey: "tags", name: "תגיות", fieldType: "multiselect", options: [] },

    // מיקום
    { fieldKey: "address", name: "כתובת", fieldType: "textarea" },
    { fieldKey: "city", name: "עיר", fieldType: "text" },
    { fieldKey: "area", name: "שטח (מ״ר)", fieldType: "number" },
    { fieldKey: "floors", name: "מספר קומות", fieldType: "number" },

    // תקציב
    { fieldKey: "budget", name: "תקציב", fieldType: "currency" },
    { fieldKey: "currency", name: "מטבע", fieldType: "select", options: [
      { value: "ILS", label: "₪ שקל" },
      { value: "USD", label: "$ דולר" },
      { value: "EUR", label: "€ אירו" }
    ]},
    { fieldKey: "billing_type", name: "סוג חיוב", fieldType: "select", options: [
      { value: "fixed", label: "מחיר קבוע" },
      { value: "hourly", label: "לפי שעה" },
      { value: "percentage", label: "אחוז מהתקציב" },
      { value: "cost_plus", label: "עלות + מרווח" }
    ]},
    { fieldKey: "fixed_fee", name: "מחיר קבוע", fieldType: "currency" },
    { fieldKey: "hourly_rate", name: "תעריף שעתי", fieldType: "currency" },
    { fieldKey: "estimated_hours", name: "שעות מוערכות", fieldType: "number" },
    { fieldKey: "percentage_of_budget", name: "אחוז מתקציב", fieldType: "number" },
    { fieldKey: "markup_percent", name: "אחוז מרווח", fieldType: "number" },

    // היקף עבודה
    { fieldKey: "scope", name: "היקף העבודה", fieldType: "textarea" },
    { fieldKey: "deliverables", name: "תוצרים", fieldType: "multiselect", options: [] },
    { fieldKey: "revisions_included", name: "מספר סבבי תיקונים", fieldType: "number" },

    // רישוי
    { fieldKey: "requires_permit", name: "דורש היתר", fieldType: "boolean" },
    { fieldKey: "permit_status", name: "סטטוס היתר", fieldType: "select", options: [
      { value: "not_required", label: "לא נדרש" },
      { value: "pending", label: "בהמתנה" },
      { value: "submitted", label: "הוגש" },
      { value: "approved", label: "אושר" },
      { value: "rejected", label: "נדחה" }
    ]},
    { fieldKey: "permit_number", name: "מספר היתר", fieldType: "text" },
    { fieldKey: "permit_submitted_at", name: "תאריך הגשת היתר", fieldType: "date" },
    { fieldKey: "permit_approved_at", name: "תאריך אישור היתר", fieldType: "date" },
    { fieldKey: "permit_notes", name: "הערות היתר", fieldType: "textarea" },

    // תאריכים
    { fieldKey: "start_date", name: "תאריך התחלה", fieldType: "date" },
    { fieldKey: "expected_end_date", name: "תאריך סיום צפוי", fieldType: "date" },
    { fieldKey: "actual_end_date", name: "תאריך סיום בפועל", fieldType: "date" },
    { fieldKey: "construction_start_date", name: "התחלת בנייה", fieldType: "date" },
    { fieldKey: "construction_end_date", name: "סיום בנייה", fieldType: "date" },
    { fieldKey: "installation_date", name: "תאריך התקנה", fieldType: "date" },

    // מקור
    { fieldKey: "referral_source", name: "מקור הפניה", fieldType: "text" },

    // ארכיון
    { fieldKey: "archived_at", name: "תאריך ארכוב", fieldType: "datetime" }
  ],

  computedFields: [
    { fieldKey: "task_progress", name: "התקדמות משימות", computationType: "percent", sourceRelation: "tasks", filterField: "status", filterValue: "completed", displayType: "percent" },
    { fieldKey: "open_tasks", name: "משימות פתוחות", computationType: "count", sourceRelation: "tasks", filterField: "status", filterValue: "open", displayType: "number" },
    { fieldKey: "total_paid", name: "סה״כ שולם", computationType: "sum", sourceRelation: "payments", sourceField: "amount", displayType: "currency" },
    { fieldKey: "rooms_count", name: "מספר חדרים", computationType: "count", sourceRelation: "rooms", displayType: "number" },
    { fieldKey: "products_count", name: "מספר מוצרים", computationType: "count", sourceRelation: "products", displayType: "number" }
  ]
};
```

#### Relations for Project
```typescript
const projectRelations = [
  // קשר ללקוח (חובה)
  {
    name: "לקוח",
    fieldKey: "client",
    sourceEntityType: "generic:projects",
    targetEntityType: "generic:clients",
    relationType: "many_to_one",
    isBidirectional: true,
    inverseName: "פרויקטים",
    isRequired: true
  },

  // קשר למשתמשים מוקצים
  {
    name: "משתמשים מוקצים",
    fieldKey: "assigned_users",
    sourceEntityType: "generic:projects",
    targetEntityType: "system:user",
    relationType: "many_to_many",
    isBidirectional: true,
    inverseName: "פרויקטים"
  },

  // קשר לקבלן ראשי
  {
    name: "קבלן ראשי",
    fieldKey: "general_contractor",
    sourceEntityType: "generic:projects",
    targetEntityType: "generic:professionals",
    relationType: "many_to_one",
    isBidirectional: true,
    inverseName: "פרויקטים כקבלן ראשי"
  },

  // סוג פרויקט
  {
    name: "סוג פרויקט",
    fieldKey: "type",
    sourceEntityType: "generic:projects",
    targetEntityType: "system:configurable:project_type",
    relationType: "many_to_one"
  },

  // סטטוס פרויקט
  {
    name: "סטטוס",
    fieldKey: "status",
    sourceEntityType: "generic:projects",
    targetEntityType: "system:configurable:project_status",
    relationType: "many_to_one",
    isRequired: true
  },

  // שלב פרויקט
  {
    name: "שלב",
    fieldKey: "phase",
    sourceEntityType: "generic:projects",
    targetEntityType: "system:configurable:project_phase",
    relationType: "many_to_one"
  },

  // לקוח מפנה
  {
    name: "לקוח מפנה",
    fieldKey: "referred_by_client",
    sourceEntityType: "generic:projects",
    targetEntityType: "generic:clients",
    relationType: "many_to_one",
    isBidirectional: false
  },

  // בעלי מקצוע
  {
    name: "בעלי מקצוע",
    fieldKey: "professionals",
    sourceEntityType: "generic:projects",
    targetEntityType: "generic:professionals",
    relationType: "many_to_many",
    isBidirectional: true,
    inverseName: "פרויקטים"
  }
];
```

---

## 5. סיכום Timeline

| שלב | משימות | זמן משוער | תלויות |
|-----|--------|-----------|--------|
| **G7.5** | System Relations | 2-3 ימים | - |
| **G7.6** | Bidirectional | 1-2 ימים | G7.5 |
| **G7.7** | Computed Fields | 2-3 ימים | G7.6 |
| **G7.8** | Workflow | 1-2 ימים | G7.5 |
| **G8** | Seed Entities | 3-4 ימים | G7.7, G7.8 |
| **G9** | Data Migration | 2-3 ימים | G8 |
| **סה״כ** | | **11-17 ימים** | |

---

## 6. הנחיות מיגרציה

### 6.1 סדר מיגרציה מומלץ
1. **Supplier** - הכי פשוט (מעט קשרים)
2. **Professional** - פשוט יחסית
3. **Client** - קשרים לעצמו
4. **Project** - הכי מורכב (אחרון)

### 6.2 Script מיגרציה לדוגמה
```typescript
async function migrateClients(prisma: PrismaClient, tenantId: string) {
  // 1. מצא את ה-EntityType
  const clientType = await prisma.entityType.findFirst({
    where: { tenantId, slug: 'clients' }
  });

  // 2. שלוף את כל הלקוחות הסטטיים
  const staticClients = await prisma.client.findMany({
    where: { tenantId }
  });

  // 3. המר כל לקוח ל-GenericEntity
  for (const client of staticClients) {
    await prisma.genericEntity.create({
      data: {
        id: client.id, // שמור את אותו ID!
        tenantId,
        entityTypeId: clientType.id,
        name: client.name,
        data: {
          type: client.type,
          email: client.email,
          phone: client.phone,
          // ... all other fields
        },
        isActive: client.isActive,
        createdById: client.createdById || 'system',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }
    });
  }

  // 4. מגרציה של קשרים (referredByClientId)
  // ...
}
```

### 6.3 Validation
```typescript
async function validateMigration(prisma: PrismaClient, tenantId: string) {
  const staticCount = await prisma.client.count({ where: { tenantId } });
  const genericCount = await prisma.genericEntity.count({
    where: { tenantId, entityType: { slug: 'clients' } }
  });

  if (staticCount !== genericCount) {
    throw new Error(`Migration mismatch: ${staticCount} static vs ${genericCount} generic`);
  }

  console.log(`✅ Migrated ${genericCount} clients successfully`);
}
```

---

## 7. Checklist להשלמה

### Phase G7.5-G7.8 (תשתית)
- [ ] G7.5.1 - fetchTargetEntities function
- [ ] G7.5.2 - system:user support
- [ ] G7.5.3 - system:configurable support
- [ ] G7.5.4 - relation-cell UI update
- [ ] G7.6.1 - inverse relations query
- [ ] G7.7.1 - computedFields migration
- [ ] G7.7.2 - calculateComputedField
- [ ] G7.8.1 - workflow validation

### Phase G8 (Seed)
- [ ] G8.1 - Client EntityType
- [ ] G8.2 - Supplier EntityType
- [ ] G8.3 - Professional EntityType
- [ ] G8.4 - Project EntityType
- [ ] G8.5 - All Relations

### Phase G9 (Migration)
- [ ] G9.1 - Migrate Suppliers
- [ ] G9.2 - Migrate Professionals
- [ ] G9.3 - Migrate Clients
- [ ] G9.4 - Migrate Projects
- [ ] G9.5 - Migrate Relations
- [ ] G9.6 - Validation

---

*עדכון אחרון: 2026-01-19*
