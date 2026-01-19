# Generic Migration Plan - Architect Studio

> **תאריך יצירה:** 2026-01-18
> **עדכון אחרון:** 2026-01-18 (בדיקה מעמיקה)
> **מטרה:** הפיכת כל המערכת לגנרית תוך שמירה על יציבות

---

## 0. סקירת מצב נוכחי (בדיקה מעמיקה)

### A. מה שלם ועובד

#### 1. Prisma Schema - מודלים גנריים ✅
| Model | שדות | קשרים | הערות |
|-------|-------|-------|-------|
| `EntityType` | ✅ מלא | entities | הגדרת ישויות עם fields כ-JSON |
| `GenericEntity` | ✅ מלא | entityType, tenant | data כ-JSON |
| `RelationDefinition` | ✅ מלא | entityRelations | מגדיר קשרים בין entity types |
| `EntityRelation` | ✅ מלא | relationDef | מופעי קשרים בודדים |
| `ViewConfiguration` | ✅ מלא | tenant, user | תצוגות שמורות (משותף עם סטטי) |
| `CustomFieldDefinition` | ✅ מלא | tenant | הגדרות שדות (משותף עם סטטי) |
| `CustomFieldValue` | ✅ מלא | field | ערכי שדות (משותף עם סטטי) |
| `NavigationItem` | ✅ מלא | parent, children | ניווט דינמי עם היררכיה |

#### 2. tRPC Routers ✅
| Router | Queries | Mutations | הערות |
|--------|---------|-----------|-------|
| `entityTypes` | list, getById, getBySlug | create, update, delete | מלא |
| `genericEntities` | list, getById | create, update, delete, bulkUpdate | מלא |
| `genericEntityViews` | list, getById | create, update, delete, duplicate, setDefault | משתמש ב-ViewConfiguration עם prefix `generic:` |
| `genericEntityFields` | list | create, update, delete, reorder | משתמש ב-CustomFieldDefinition עם prefix `generic:` |
| `relations` | listDefs, getDefById, listRelations | createDef, updateDef, deleteDef, addRelation, removeRelation, reorderRelations | מלא |
| `navigation` | tree | create, update, delete, toggleVisibility, reorder | מלא |

#### 3. Generic Table Components ✅
```
src/components/generic-table/
├── generic-data-table.tsx      ✅ טבלה מלאה עם כל הפיצ'רים
├── use-generic-table.ts        ✅ Hook עם views, sorting, columns
├── types.ts                    ✅ טיפוסים מוגדרים
├── table-row.tsx               ✅ שורה עם editable cells
├── editable-cell.tsx           ✅ תא עריכה לכל סוגי השדות
├── cell-components.tsx         ✅ Select, MultiSelect, Textarea cells
├── view-bar/                   ✅ תצוגות שמורות מלא
│   ├── view-bar.tsx            ✅ tabs, create, duplicate, delete
│   └── view-dialogs.tsx        ✅ דיאלוגים
├── column-header/              ✅ עריכת עמודות
│   ├── column-header.tsx       ✅ sort, resize, hide, edit, delete
│   └── column-dialogs.tsx      ✅ דיאלוגים
├── add-column-button.tsx       ✅ הוספת עמודה חדשה + קשר
├── select-options-editor.tsx   ✅ עריכת אפשרויות select
└── fields/                     ✅ Field Renderers
    ├── text-fields.tsx         ✅ text, textarea, email, phone, url
    ├── number-fields.tsx       ✅ number, currency
    ├── date-fields.tsx         ✅ date, datetime
    ├── boolean-field.tsx       ✅ checkbox
    ├── select-field.tsx        ✅ single select
    ├── multiselect-field.tsx   ✅ multi select
    ├── validation.ts           ✅ validators לכל סוג
    └── display/                ✅ Display components
```

#### 4. Generic Entity Table ✅
```
src/components/generic-entity-table/
├── generic-entity-data-table.tsx  ✅ טבלה ל-GenericEntity
├── use-generic-entity-table.ts    ✅ Hook עם fields, views
├── generic-entity-row.tsx         ✅ שורה עם תמיכה בקשרים
├── relation-cell.tsx              ✅ תא קשרים עם popover
├── use-entity-relations.ts        ✅ Hook לניהול קשרים
├── add-relation-button.tsx        ✅ כפתור הוספת קשר
└── types.ts                       ✅ טיפוסים
```

#### 5. Dynamic Sidebar ✅
```
src/components/layout/dynamic-sidebar/
├── dynamic-sidebar.tsx            ✅ הסיידבר הראשי
├── use-nav-state.ts               ✅ State + mutations
├── sidebar-nav-list.tsx           ✅ רשימת פריטי ניווט
├── nav-item.tsx                   ✅ פריט ניווט + context menu
├── nav-context-menu.tsx           ✅ תפריט ימני (rename, icon, delete)
├── nav-icon.tsx                   ✅ אייקונים דינמיים
├── add-nav-item-button.tsx        ✅ הוספת פריט/קטגוריה
└── dialogs/
    ├── rename-dialog.tsx          ✅ שינוי שם
    ├── icon-dialog.tsx            ✅ בחירת אייקון
    ├── delete-dialog.tsx          ✅ מחיקה
    └── entity-creator-dialog.tsx  ✅ יצירת entity type חדש
```

#### 6. Entity Pages ✅ (חלקי)
```
src/app/(protected)/entities/[slug]/
├── page.tsx                       ✅ Server component
├── generic-entity-content.tsx     ✅ Client component עם טבלה
└── generic-entity-dialog.tsx      ✅ דיאלוג יצירה/עריכה (בסיסי!)
```

---

### B. מה קיים אבל חלקי

#### 1. Generic Entity Dialog 🔶
**קובץ:** `src/app/(protected)/entities/[slug]/generic-entity-dialog.tsx`

**מה יש:**
- יצירה ועריכה בסיסית
- שדה `name` בלבד

**מה חסר:**
- [ ] רינדור שדות לפי EntityType.fields
- [ ] תמיכה בכל סוגי השדות
- [ ] ולידציה
- [ ] שדות קשרים

**חומרה:** קריטי - הטופס הנוכחי רק שומר `name`, לא את שאר השדות!

#### 2. Relations in Table 🔶
**קבצים:** `relation-cell.tsx`, `use-entity-relations.ts`

**מה יש:**
- הצגת קשרים קיימים כ-badges
- הוספת קשר חדש עם popover
- הסרת קשר

**מה חסר:**
- [ ] חיפוש/סינון בבחירת קשר (רק רשימה פשוטה)
- [ ] תמיכה ב-one_to_one ו-one_to_many (כרגע הכל כמו many_to_many)
- [ ] Bidirectional relations לא מוצגים בצד השני

#### 3. AddColumnButton - Relations 🔶
**קובץ:** `add-column-button.tsx`

**מה יש:**
- יצירת RelationDefinition דרך הטבלה
- בחירת entity type יעד
- בחירת סוג קשר

**מה חסר:**
- [ ] אין תמיכה ב-inverseName (bidirectional)
- [ ] אין displayFields configuration

---

### C. מה חסר לגמרי

#### 1. Generic Detail Page ❌
**נדרש:** `src/app/(protected)/entities/[slug]/[id]/page.tsx`

לא קיים! אין דף פרטים לישות.

**צריך:**
- [ ] דף עם כל השדות
- [ ] הצגה יפה לכל סוג שדה
- [ ] Inline editing
- [ ] סקשן קשרים
- [ ] Breadcrumbs

#### 2. Generic Entity Form (Full) ❌
**נדרש:** `src/components/generic-form/`

הטופס הקיים רק שומר `name`. צריך טופס מלא שמרנדר את כל השדות.

**צריך:**
- [ ] רינדור שדות לפי EntityType.fields
- [ ] Field renderers לכל סוג (כבר קיימים ב-generic-table!)
- [ ] ולידציה
- [ ] שדות קשרים

#### 3. System Entities Seed ❌
**נדרש:** `prisma/seed/entity-types/`

אין seed script להגדרת Client, Project וכו' כ-EntityTypes.

#### 4. Data Migration Scripts ❌
**נדרש:** `scripts/migration/`

אין סקריפטים להעברת נתונים מסטטי לגנרי.

---

### D. סיכום לפי קטגוריה

| קטגוריה | סטטוס | הערות |
|---------|-------|-------|
| **DB Schema** | ✅ 100% | כל המודלים קיימים |
| **Routers** | ✅ 100% | כל ה-APIs קיימים |
| **Table Components** | ✅ 95% | חסר filtering |
| **Relations in Table** | 🔶 70% | עובד, חסר חיפוש |
| **Dynamic Sidebar** | ✅ 100% | מלא כולל entity creator |
| **Entity List Page** | ✅ 90% | עובד עם טבלה מלאה |
| **Entity Dialog** | 🔶 20% | רק name, צריך fields! |
| **Entity Detail Page** | ❌ 0% | לא קיים |
| **System Seed** | ❌ 0% | לא קיים |
| **Migration Scripts** | ❌ 0% | לא קיים |

---

## 1. סיכום מנהלים

### המטרה הסופית
- **מערכת גנרית לחלוטין** - כל ישות (Entity) מוגדרת דרך EntityType
- **קוד סטטי יימחק** - לא יישאר קוד ספציפי ל-Client, Project, Task וכו'
- **פיצ'ר אחד לכולם** - טבלאות, Views, Custom Fields, Relations - הכל עובד על כל ישות

### הגישה - "Build, Test, Delete"
```
┌─────────────────────────────────────────────────────────────────┐
│  1. BUILD    בונים את הגנרי במקביל (לא נוגעים בסטטי)           │
│  2. TEST     בודקים שהגנרי עובד טוב (השוואה לסטטי)              │
│  3. MIGRATE  מעבירים את הנתונים לגנרי                           │
│  4. DELETE   מוחקים את הסטטי רק אחרי שהכל עובד                  │
└─────────────────────────────────────────────────────────────────┘
```

### מה כבר קיים (תשתית גנרית)
| רכיב | סטטוס | הערות |
|------|-------|-------|
| EntityType Model | ✅ | הגדרת ישויות דינמיות |
| GenericEntity Model | ✅ | אחסון נתונים כ-JSON |
| CustomFieldDefinition | ✅ | הגדרת שדות מותאמים |
| CustomFieldValue | ✅ | ערכי שדות מותאמים |
| ViewConfiguration | ✅ | תצוגות טבלה שמורות |
| NavigationItem | ✅ | ניווט דינמי בסיידבר |
| RelationDefinition | ✅ | הגדרת קשרים בין ישויות |
| EntityRelation | ✅ | מופעי קשרים |
| entityTypes Router | ✅ | API להגדרת ישויות |
| genericEntities Router | ✅ | API לנתונים גנריים |
| customFields Router | ✅ | API לשדות מותאמים |
| views Router | ✅ | API לתצוגות |
| navigation Router | ✅ | API לניווט |
| GenericDataTable | ✅ | טבלה גנרית עם Views |
| DynamicSidebar | ✅ | סיידבר דינמי |
| /entities/[slug] | ✅ | דף גנרי לישויות |

### מה צריך לעשות
| רכיב | סטטוס | עדיפות | הערות |
|------|-------|--------|-------|
| Generic Entity Form | 🔶 20% | P0 - קריטי | קיים עם name בלבד! |
| Generic Detail Page | ❌ 0% | P0 - קריטי | לא קיים כלל |
| Relations UI (picker) | ✅ 70% | P1 - חשוב | עובד, חסר חיפוש |
| Seed System Entities | ❌ 0% | P0 - קריטי | לא קיים |
| Migrate Static Data | ❌ 0% | P1 - חשוב | לא קיים |
| Delete Static Code | ⬜ | P2 - אחרון | ממתין |

---

## 2. טבלת שלבים

| שלב | שם | מה נבנה | תלות | מה נמחק | סטטוס |
|-----|-----|---------|------|---------|--------|
| G1 | תשתית DB | EntityType, GenericEntity, Relations | - | - | ✅ הושלם |
| G2 | Routers גנריים | entityTypes, genericEntities, relations | G1 | - | ✅ הושלם |
| G3 | Navigation דינמי | DynamicSidebar, NavigationItem | G2 | Sidebar סטטי | ✅ הושלם |
| G4 | טבלאות גנריות | GenericDataTable, Views | G2 | - | ✅ הושלם |
| **G5** | **Entity Form** | **שדרוג** הדיאלוג לטופס מלא | G2 | - | 🔶 20% (רק name!) |
| **G6** | **Detail Page** | דף פרטים גנרי | G5 | - | ❌ 0% |
| **G7** | **Relations UI** | שיפור picker, bidirectional | G4 | - | 🔶 70% (עובד בסיסי) |
| G8 | System Entities Seed | הגדרת Client, Project כ-EntityType | G5, G6, G7 | - | - |
| G9 | Data Migration | סקריפט העברת נתונים | G8 | - | - |
| G10 | Cleanup - Clients | - | G9 | client router, pages | - |
| G11 | Cleanup - Projects | - | G9 | project router, pages | - |
| G12 | Cleanup - Tasks | - | G9 | task router, pages | - |
| G13 | Cleanup - Docs/Meetings | - | G9 | document, meeting routers | - |
| G14 | Cleanup - Products | - | G9 | product, roomProduct routers | - |
| G15 | Cleanup - Financial | - | G9 | proposal, payment routers | - |
| G16 | Final Cleanup | - | G10-G15 | Static models from Prisma | - |

---

## 3. פירוט שלבים

---

### G5: Generic Entity Form
**מטרה:** שדרוג הדיאלוג הקיים לטופס מלא שעובד עם כל השדות

#### מה כבר קיים (20%)
- [x] `generic-entity-dialog.tsx` - דיאלוג בסיסי
- [x] תמיכה ב-create/update
- [x] שדה `name` בלבד

#### מה חסר (80%)
- [ ] G5.1 - שדרוג `GenericEntityDialog`
  - [ ] קבלת EntityType.fields (כבר זמין!)
  - [ ] רינדור שדות לפי fieldType
  - [ ] שמירת data JSON עם כל השדות

- [ ] G5.2 - שימוש ב-Field Renderers הקיימים!
  **הערה חשובה:** כל ה-field renderers כבר קיימים ב-`src/components/generic-table/fields/`!
  - [x] text, textarea, email, phone, url - קיים ב-`text-fields.tsx`
  - [x] number, currency - קיים ב-`number-fields.tsx`
  - [x] date, datetime - קיים ב-`date-fields.tsx`
  - [x] boolean - קיים ב-`boolean-field.tsx`
  - [x] select - קיים ב-`select-field.tsx`
  - [x] multiselect - קיים ב-`multiselect-field.tsx`
  - [ ] **צריך רק לייבא ולהשתמש בהם בטופס!**

- [ ] G5.3 - Validation
  - [x] validators קיימים ב-`validation.ts`
  - [ ] שילוב עם הטופס

- [ ] G5.4 - Form State
  - [ ] ניהול state של כל השדות
  - [ ] טעינת ערכים קיימים (update mode)
  - [ ] שליחה לשרת

#### קובץ קיים לשדרוג
```
src/app/(protected)/entities/[slug]/generic-entity-dialog.tsx
```

**גישה:** לא צריך ליצור תיקייה חדשה! אפשר פשוט לשדרג את הדיאלוג הקיים ולייבא את ה-field components מ-generic-table.

#### Checklist להשלמה
- [x] הטופס נפתח בדיאלוג - קיים
- [ ] כל סוגי השדות נתמכים - **עדיפות גבוהה**
- [ ] ולידציה עובדת
- [ ] יצירת entity עם כל השדות
- [ ] עריכת entity עם כל השדות
- [ ] בדיקה עם entity שיש לו שדות

---

### G6: Generic Detail Page
**מטרה:** דף פרטים אחד שעובד לכל ישות

#### תתי-משימות
- [ ] G6.1 - יצירת `GenericEntityDetail` component
  - [ ] הצגת כל השדות בצורה יפה
  - [ ] תמיכה ב-layout שונים (card, list, grid)
  - [ ] Inline editing

- [ ] G6.2 - Header Component
  - [ ] שם הישות
  - [ ] אייקון וצבע לפי EntityType
  - [ ] כפתורי עריכה/מחיקה
  - [ ] Breadcrumbs

- [ ] G6.3 - Field Display Components
  - [ ] Display mode לכל סוג שדה
  - [ ] Copy to clipboard
  - [ ] Links לשדות email/phone/url

- [ ] G6.4 - Related Entities Section
  - [ ] הצגת Relations
  - [ ] Quick add relation
  - [ ] Navigate to related entity

- [ ] G6.5 - Activity/History Section (אופציונלי)
  - [ ] מי יצר
  - [ ] מי עדכן
  - [ ] תאריכים

#### קבצים ליצירה
```
src/components/generic-detail/
├── generic-entity-detail.tsx   # דף הפרטים הראשי
├── detail-header.tsx           # Header עם actions
├── field-display.tsx           # הצגת שדה לפי סוג
├── related-entities.tsx        # סקשן קשרים
├── entity-activity.tsx         # היסטוריה (אופציונלי)
└── types.ts
```

#### שילוב עם routing
```
src/app/(protected)/entities/[slug]/[id]/
├── page.tsx                    # Server component
└── entity-detail-content.tsx   # Client component
```

#### Checklist להשלמה
- [ ] דף פרטים נטען נכון
- [ ] כל השדות מוצגים
- [ ] עריכה inline עובדת
- [ ] מחיקה עובדת (עם confirmation)
- [ ] קשרים מוצגים
- [ ] ניווט בין ישויות קשורות
- [ ] בדיקה מול דף Client Details סטטי

---

### G7: Relations UI
**מטרה:** שיפור ממשק הקשרים הקיים

#### מה כבר קיים (70%)
- [x] G7.1 - Relations Router - **מלא!**
  - [x] CRUD על RelationDefinition - `src/server/routers/relations/`
  - [x] CRUD על EntityRelation
  - [x] Query relations לפי entity

- [x] G7.2 - Relation Picker Component (בסיסי)
  - [x] Popover בחירת ישויות - `relation-cell.tsx`
  - [ ] **חסר:** חיפוש וסינון
  - [x] Multi-select (כמו many-to-many)
  - [ ] **חסר:** Single-select מוגבל (one-to-one)

- [x] G7.3 - Relation Display in Table - **עובד!**
  - [x] עמודת קשרים בטבלה - Badges
  - [x] הצגת שמות entities קשורים
  - [ ] **חסר:** Click לניווט לישות

#### מה חסר (30%)
- [ ] G7.4 - שיפורים ל-Picker
  - [ ] חיפוש וסינון ב-popover
  - [ ] הגבלת כמות לפי relationType

- [ ] G7.5 - Bidirectional Relations
  - [ ] הצגה בצד השני של הקשר
  - [ ] inverseName support

- [ ] G7.6 - Relation Display in Form
  - [ ] שדה קשר בדיאלוג יצירה/עריכה

- [ ] G7.7 - Relation Display in Detail (דורש G6)
  - [ ] סקשן קשרים בדף פרטים
  - [ ] Cards/List של קשורים

#### קבצים קיימים
```
src/server/routers/relations/       ✅ Router מלא
├── index.ts
├── schemas.ts
├── queries.ts
└── mutations.ts

src/components/generic-entity-table/
├── relation-cell.tsx              ✅ תצוגה בטבלה
├── use-entity-relations.ts        ✅ Hook
├── add-relation-button.tsx        ✅ כפתור הוספה
└── add-relation-form.tsx          ✅ טופס
```

#### Checklist להשלמה
- [x] יצירת RelationDefinition עובדת
- [x] בחירת entities קשורים עובדת
- [x] הצגה בטבלה עובדת
- [ ] חיפוש ב-picker
- [ ] הצגה בדף פרטים (דורש G6)
- [ ] Bidirectional relations

---

### G8: System Entities Seed
**מטרה:** הגדרת הישויות הסטטיות כ-EntityTypes

#### תתי-משימות
- [ ] G8.1 - יצירת Seed Script
  - [ ] פונקציה ליצירת EntityType עם fields
  - [ ] פונקציה ליצירת RelationDefinition
  - [ ] פונקציה ליצירת NavigationItem

- [ ] G8.2 - הגדרת Client כ-EntityType
  ```typescript
  {
    name: "לקוח",
    namePlural: "לקוחות",
    slug: "clients",
    icon: "Users",
    isSystem: true,
    fields: [
      { fieldKey: "name", name: "שם", fieldType: "text", isRequired: true },
      { fieldKey: "email", name: "אימייל", fieldType: "email" },
      { fieldKey: "phone", name: "טלפון", fieldType: "phone" },
      { fieldKey: "type", name: "סוג", fieldType: "select", options: [...] },
      { fieldKey: "status", name: "סטטוס", fieldType: "select", options: [...] },
      // ... all fields from Prisma Client model
    ]
  }
  ```

- [ ] G8.3 - הגדרת Project כ-EntityType
- [ ] G8.4 - הגדרת Task כ-EntityType
- [ ] G8.5 - הגדרת Document כ-EntityType
- [ ] G8.6 - הגדרת Meeting כ-EntityType
- [ ] G8.7 - הגדרת Supplier כ-EntityType
- [ ] G8.8 - הגדרת Professional כ-EntityType
- [ ] G8.9 - הגדרת Product כ-EntityType
- [ ] G8.10 - הגדרת קשרים בין ישויות
  - [ ] Client → Projects (one-to-many)
  - [ ] Project → Tasks (one-to-many)
  - [ ] Project → Documents (one-to-many)
  - [ ] Project → Rooms (one-to-many)
  - [ ] Room → RoomProducts (one-to-many)
  - [ ] Supplier → Products (one-to-many)

#### קבצים ליצירה
```
prisma/seed/
├── entity-types/
│   ├── client.ts
│   ├── project.ts
│   ├── task.ts
│   ├── document.ts
│   ├── meeting.ts
│   ├── supplier.ts
│   ├── professional.ts
│   ├── product.ts
│   └── index.ts
├── relations/
│   └── index.ts
├── navigation/
│   └── index.ts
└── index.ts
```

#### Checklist להשלמה
- [ ] Seed script רץ ללא שגיאות
- [ ] כל EntityTypes נוצרו
- [ ] כל Relations הוגדרו
- [ ] Navigation items נוצרו
- [ ] idempotent - אפשר להריץ כמה פעמים

---

### G9: Data Migration
**מטרה:** העברת הנתונים מהטבלאות הסטטיות ל-GenericEntity

#### תתי-משימות
- [ ] G9.1 - Migration Script
  - [ ] קריאה מטבלה סטטית
  - [ ] המרה ל-GenericEntity format
  - [ ] שמירה ב-GenericEntity
  - [ ] לוגים ודיווח

- [ ] G9.2 - מיגרציה לפי ישות
  - [ ] Client → GenericEntity
  - [ ] Supplier → GenericEntity
  - [ ] Professional → GenericEntity
  - [ ] Project (בשלב מאוחר יותר - מורכב)
  - [ ] Task (בשלב מאוחר יותר)

- [ ] G9.3 - מיגרציה של קשרים
  - [ ] FK ישנים → EntityRelation

- [ ] G9.4 - Validation
  - [ ] השוואת כמויות
  - [ ] בדיקת שלמות נתונים
  - [ ] Rollback אם יש בעיות

#### קבצים ליצירה
```
scripts/migration/
├── migrate-clients.ts
├── migrate-suppliers.ts
├── migrate-professionals.ts
├── migrate-relations.ts
├── validate.ts
└── run-migration.ts
```

#### Checklist להשלמה
- [ ] כל הנתונים הועברו
- [ ] אין איבוד מידע
- [ ] קשרים שמורים
- [ ] אפשר לראות את הכל בממשק הגנרי

---

### G10-G15: Cleanup Phases
**מטרה:** מחיקת הקוד הסטטי בצורה בטוחה

#### סדר מחיקה (לכל ישות):
1. ✅ וידוא שהגנרי עובד
2. 🔄 הסרת Routes מ-`_app.ts`
3. 🗑️ מחיקת router folder
4. 🗑️ מחיקת pages folder
5. 🗑️ מחיקת components ספציפיים
6. 📝 עדכון documentation

---

### G10: Cleanup - Clients

#### מה למחוק
```
src/server/routers/client/        # כל התיקייה
├── index.ts
├── schemas.ts
├── queries.ts
└── mutations.ts

src/app/(protected)/clients/      # כל התיקייה
├── page.tsx
├── clients-content.tsx
├── new/
│   ├── page.tsx
│   └── new-client-form.tsx
└── [id]/
    ├── page.tsx
    └── client-details.tsx
```

#### Checklist
- [ ] /entities/clients עובד טוב
- [ ] הסרת `clients: clientRouter` מ-_app.ts
- [ ] מחיקת `src/server/routers/client/`
- [ ] מחיקת `src/app/(protected)/clients/`
- [ ] עדכון redirects (אם יש)
- [ ] בדיקה שאין שגיאות build

---

### G11: Cleanup - Projects

#### מה למחוק
```
src/server/routers/project/
src/app/(protected)/projects/
```

**הערה:** Project הוא ה-Hub של המערכת. צריך לוודא שכל הפיצ'רים עובדים בגנרי לפני מחיקה.

#### Checklist
- [ ] /entities/projects עובד טוב
- [ ] Project Hub עובד
- [ ] קשרים ל-Tasks, Rooms, Documents עובדים
- [ ] הסרת router
- [ ] מחיקת קוד

---

### G12: Cleanup - Tasks

#### מה למחוק
```
src/server/routers/task/
src/app/(protected)/tasks/
src/components/tasks/
```

#### Checklist
- [ ] /entities/tasks עובד
- [ ] Task בתוך Project עובד
- [ ] Checklist, reminders עובדים
- [ ] הסרת router
- [ ] מחיקת קוד

---

### G13: Cleanup - Docs/Meetings

#### מה למחוק
```
src/server/routers/document/
src/server/routers/meeting/
src/app/(protected)/documents/
src/app/(protected)/meetings/
src/components/documents/
src/components/meetings/
```

#### Checklist
- [ ] Documents עובדים בגנרי
- [ ] Meetings עובדים בגנרי
- [ ] Versioning של Documents עובד
- [ ] Calendar view של Meetings עובד
- [ ] מחיקת קוד

---

### G14: Cleanup - Products

#### מה למחוק
```
src/server/routers/product/
src/server/routers/roomProduct/
src/server/routers/supplier/
src/server/routers/professional/
```

#### Checklist
- [ ] Products עובדים בגנרי
- [ ] RoomProducts עובדים בגנרי
- [ ] Suppliers עובדים בגנרי
- [ ] Professionals עובדים בגנרי
- [ ] מחיקת קוד

---

### G15: Cleanup - Financial

#### מה למחוק
```
src/server/routers/proposal/
src/server/routers/contract/
src/server/routers/payment/
src/server/routers/expense/
src/server/routers/timeEntry/
src/server/routers/retainer/
src/server/routers/purchaseOrder/
src/server/routers/deliveryTracking/
```

#### Checklist
- [ ] Proposals עובדים בגנרי
- [ ] Contracts עובדים בגנרי
- [ ] Payments עובדים בגנרי
- [ ] מחיקת קוד

---

### G16: Final Cleanup

#### מה למחוק מ-Prisma Schema
```prisma
// כל המודלים הסטטיים:
model Client { ... }
model Project { ... }
model Task { ... }
model Document { ... }
model Meeting { ... }
model Supplier { ... }
model Professional { ... }
model Product { ... }
model RoomProduct { ... }
// ... וכו'
```

**הערה חשובה:** רק אחרי שכל הנתונים הועברו ונבדקו!

#### מה נשאר ב-Prisma Schema
```prisma
// Infrastructure
model Tenant { ... }
model User { ... }
model Account { ... }
model Session { ... }

// Generic System
model EntityType { ... }
model GenericEntity { ... }
model CustomFieldDefinition { ... }
model CustomFieldValue { ... }
model ViewConfiguration { ... }
model NavigationItem { ... }
model RelationDefinition { ... }
model EntityRelation { ... }

// Maybe keep as special:
model ConfigurableEntity { ... }  // for status/phase enums
```

#### Checklist
- [ ] גיבוי מלא של ה-DB
- [ ] הסרת מודלים סטטיים
- [ ] הרצת migration
- [ ] בדיקה מקיפה
- [ ] ניקוי types שלא בשימוש

---

## 4. תרשים זרימה

```
                    ┌─────────────────┐
                    │   G5: Form      │
                    │  (Create/Edit)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │   G6:    │   │   G7:    │   │   G4:    │
       │  Detail  │◄──│ Relations│──►│  Table   │
       │   Page   │   │    UI    │   │  (done)  │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  G8: Seed    │
                    │  System      │
                    │  Entities    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  G9: Data    │
                    │  Migration   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         ┌────────┐   ┌────────┐   ┌────────┐
         │  G10   │   │  G11   │   │  G12   │
         │Clients │   │Projects│   │ Tasks  │
         └────┬───┘   └────┬───┘   └────┬───┘
              │            │            │
              └────────────┼────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         ┌────────┐   ┌────────┐   ┌────────┐
         │  G13   │   │  G14   │   │  G15   │
         │Docs/Mtg│   │Products│   │Finance │
         └────┬───┘   └────┬───┘   └────┬───┘
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   G16:       │
                    │   Final      │
                    │   Cleanup    │
                    └──────────────┘
```

---

## 5. עקרונות מנחים

### 1. Never Break Existing
```
✅ נכון: לבנות /entities/clients במקביל ל-/clients
❌ שגוי: לשנות /clients ולקוות לטוב
```

### 2. Test Before Delete
```
✅ נכון: להריץ טסטים השוואתיים בין סטטי לגנרי
❌ שגוי: למחוק קוד לפני בדיקה מקיפה
```

### 3. Small Steps
```
✅ נכון: למחוק ישות אחת, לבדוק, להמשיך
❌ שגוי: למחוק הכל בבת אחת
```

### 4. Keep Backups
```
✅ נכון: גיבוי DB לפני כל migration
❌ שגוי: להניח שאפשר לשחזר
```

### 5. Document Everything
```
✅ נכון: לעדכן את הקובץ הזה אחרי כל שלב
❌ שגוי: לסמוך על הזיכרון
```

---

## 6. Progress Tracking

### Overall Progress
```
[████████░░░░░░░░░░░░] 40% Complete (תשתית מוכנה, UI חסר)
```

### Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| G1 | ✅ 100% | Schema ready - כל המודלים קיימים |
| G2 | ✅ 100% | Routers ready - כל ה-APIs עובדים |
| G3 | ✅ 100% | Dynamic sidebar - מלא כולל entity creator |
| G4 | ✅ 95% | Tables ready - עובד, חסר filtering |
| G5 | 🔶 20% | **Dialog קיים עם name בלבד - צריך שדרוג!** |
| G6 | ❌ 0% | **לא קיים - עדיפות גבוהה** |
| G7 | 🔶 70% | Relations עובדים, חסר חיפוש ו-bidirectional |
| G8 | ⬜ 0% | System seed לא קיים |
| G9 | ⬜ 0% | Migration scripts לא קיימים |
| G10-G16 | ⬜ | ממתינים |

### Priority Order (מה לעשות עכשיו)
1. **G5** - שדרוג Dialog לטופס מלא (יש field renderers מוכנים!)
2. **G6** - יצירת Detail Page
3. **G8** - Seed script לישויות מערכת

---

## 7. Risk Management

### סיכונים ומענה

| סיכון | השפעה | מענה |
|-------|-------|------|
| איבוד נתונים ב-migration | קריטי | גיבויים, dry-run, validation |
| ביצועים של JSON queries | בינוני | אינדקסים, caching, monitoring |
| מורכבות Relations | בינוני | תכנון מדוקדק, testing |
| הרבה ישויות = זמן | נמוך | parallelization, scripting |
| שבירת פיצ'רים קיימים | גבוה | side-by-side, feature flags |

### Rollback Plan
1. שמירת גיבוי לפני כל שלב
2. Git branch לכל phase
3. סקריפט rollback מוכן
4. monitoring על errors

---

## 8. Next Steps

### מיידי - G5: שדרוג הדיאלוג
**זה הפריט הכי קריטי!** הדיאלוג הנוכחי שומר רק `name`.

**משימה קונקרטית:**
1. לפתוח `src/app/(protected)/entities/[slug]/generic-entity-dialog.tsx`
2. לייבא `FieldInput` מ-`@/components/generic-table/fields`
3. לקבל את `EntityType.fields` (כבר מועבר כ-prop!)
4. לעבור על fields ולרנדר כל אחד
5. לשמור את הערכים ב-data JSON

**קוד לדוגמה:**
```tsx
// בתוך הדיאלוג
{entityType.fields?.map((field) => (
  <div key={field.fieldKey}>
    <Label>{field.name}</Label>
    <FieldInput
      type={field.fieldType}
      value={formData[field.fieldKey]}
      onChange={(val) => setFormData({...formData, [field.fieldKey]: val})}
      options={field.options}
    />
  </div>
))}
```

### אחר כך - G6: דף פרטים
1. ליצור `src/app/(protected)/entities/[slug]/[id]/page.tsx`
2. להשתמש ב-`FieldDisplay` מ-generic-table
3. להוסיף סקשן קשרים

### בהמשך - G8: Seed
1. ליצור seed script להגדרת Client כ-EntityType
2. להגדיר את כל השדות של Client
3. לבדוק שהכל עובד

---

## 9. Quick Reference - קבצים חשובים

### Field Renderers (כבר קיימים!)
```
src/components/generic-table/fields/
├── index.tsx           - FieldInput, FieldDisplay exports
├── text-fields.tsx     - text, textarea, email, phone, url
├── number-fields.tsx   - number, currency
├── date-fields.tsx     - date, datetime
├── boolean-field.tsx   - checkbox/switch
├── select-field.tsx    - single select
├── multiselect-field.tsx - multi select
└── validation.ts       - validators
```

### Routers
```
src/server/routers/
├── entity-types/       - הגדרת EntityType
├── generic-entities/   - CRUD על GenericEntity
├── generic-entity-views/   - Views (משתמש ב-ViewConfiguration)
├── generic-entity-fields/  - Fields (משתמש ב-CustomFieldDefinition)
├── relations/          - RelationDefinition + EntityRelation
└── navigation/         - NavigationItem
```

### Entity Pages
```
src/app/(protected)/entities/[slug]/
├── page.tsx                    - Server component
├── generic-entity-content.tsx  - טבלה + דיאלוג
└── generic-entity-dialog.tsx   - **לשדרג!**
```

---

*עדכון אחרון: 2026-01-18 - לאחר בדיקה מעמיקה*
