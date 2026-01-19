# Code Migration Tracker

מעקב אחר מיגרציה מקוד ישן (data-table) לקוד חדש (generic-table).

---

## 1. קוד ישן - `data-table/`

### קבצים ראשיים

| קובץ | תיאור | משמש ב-ישויות |
|------|-------|---------------|
| `index.ts` | Barrel exports | כל הישויות |
| `types.ts` | טיפוסים משותפים | כל הישויות |
| `base-cell.tsx` | קומפוננטת תא בסיסית | - |
| `cell-content.tsx` | תוכן תא | - |
| `column-header.tsx` | כותרת עמודה עם מיון | כל הטבלאות |
| `editable-row.tsx` | שורה עם יכולת עריכה inline | כל הטבלאות |
| `editable-table.tsx` | טבלה עם עריכה | - |
| `entity-sheet.tsx` | Sheet לפרטי ישות | clients, projects, tasks, products, suppliers, payments, expenses |
| `row-actions.tsx` | תפריט פעולות לשורה | כל הטבלאות |
| `table-states.tsx` | TableSkeleton, TableEmptyState | כל הטבלאות |

### תיקיית `cells/`

| קובץ | תיאור | משמש ב-ישויות |
|------|-------|---------------|
| `index.ts` | Barrel exports | - |
| `use-editable-cell.ts` | Hook לעריכת תא | כל התאים |
| `cell-display.tsx` | תצוגת תא | - |
| `text-cell.tsx` | תא טקסט | clients, projects, tasks, products, suppliers, payments, expenses |
| `textarea-cell.tsx` | תא טקסט ארוך | clients, projects, tasks, products, suppliers, payments |
| `number-cell.tsx` | תא מספר | projects, products, expenses |
| `currency-cell.tsx` | תא מטבע (₪) | projects, products, payments, expenses |
| `date-cell.tsx` | תא תאריך | projects, tasks, payments, expenses |
| `checkbox-cell.tsx` | תא סימון (checkbox) | projects, expenses |
| `select-cell.tsx` | תא בחירה (dropdown) | clients, projects, tasks, products, payments, expenses |
| `config-select-cell.tsx` | תא בחירה מ-config (סטטוסים וכו') | projects, tasks, products, suppliers, expenses |
| `rating-cell.tsx` | תא דירוג (כוכבים) | suppliers |
| `multi-tag-cell.tsx` | תא תגיות מרובות | - |
| `multi-user-cell.tsx` | תא משתמשים מרובים | - |

---

## 2. קוד חדש - `generic-table/`

### קבצים ראשיים

| קובץ | תיאור | שורות |
|------|-------|-------|
| `index.ts` | Barrel exports | 34 |
| `types.ts` | טיפוסים - GenericColumn, BaseColumnDef, etc. | 102 |
| `generic-data-table.tsx` | טבלה ראשית עם custom fields, views, sorting | 285 |
| `use-generic-table.ts` | Hook לניהול state הטבלה | 227 |
| `table-row.tsx` | שורת טבלה עם תאים דינמיים | 111 |
| `editable-cell.tsx` | תא עריכה עם ולידציה ואייקונים | 242 |
| `cell-components.tsx` | SelectCell, MultiSelectCell, TextareaCell | 199 |
| `add-column-button.tsx` | כפתור הוספת עמודה (custom field) | 198 |
| `select-options-editor.tsx` | עורך אפשרויות לשדות select | 201 |
| `field-input.tsx` | Re-export (backwards compatibility) | 6 |
| `view-bar.tsx` | Re-export (backwards compatibility) | 6 |
| `column-header.tsx` | Re-export (backwards compatibility) | 6 |

### תיקיית `fields/`

| קובץ | תיאור | שורות |
|------|-------|-------|
| `index.tsx` | Router - FieldInput, FieldDisplay | 158 |
| `types.ts` | FieldOption, FieldInputProps, FieldDisplayProps | 26 |
| `validation.ts` | פונקציות ולידציה לכל סוג שדה | 88 |
| `text-fields.tsx` | Input: text, textarea, email, phone, url | 133 |
| `number-fields.tsx` | Input: number, currency | 95 |
| `date-fields.tsx` | Input: date, datetime | 75 |
| `boolean-field.tsx` | Input: boolean (checkbox) | 20 |
| `select-field.tsx` | Input: select (dropdown) | 47 |
| `multiselect-field.tsx` | Input: multiselect (popover) | 90 |

### תיקיית `fields/display/`

| קובץ | תיאור | שורות |
|------|-------|-------|
| `index.ts` | Barrel exports | 5 |
| `text-display.tsx` | Display: text, email, phone, url (עם אייקונים) | 62 |
| `number-display.tsx` | Display: number, currency (עם ₪) | 33 |
| `date-display.tsx` | Display: date, datetime (עם אייקון לוח שנה) | 29 |
| `boolean-display.tsx` | Display: boolean (✓/✗) | 21 |
| `select-display.tsx` | Display: select, multiselect (badges) | 54 |

### תיקיית `view-bar/`

| קובץ | תיאור | שורות |
|------|-------|-------|
| `index.ts` | Barrel exports | 2 |
| `types.ts` | ViewData, ViewBarProps | 23 |
| `view-bar.tsx` | בר תצוגות שמורות (tabs) | 224 |
| `view-dialogs.tsx` | CreateViewDialog, DuplicateViewDialog, DeleteViewDialog | 156 |

### תיקיית `column-header/`

| קובץ | תיאור | שורות |
|------|-------|-------|
| `index.ts` | Barrel exports | 2 |
| `types.ts` | GenericColumnDef, GenericColumnHeaderProps | 36 |
| `column-header.tsx` | כותרת עמודה עם resize, drag, menu | 226 |
| `column-dialogs.tsx` | EditLabelDialog, EditOptionsDialog, DeleteColumnDialog | 134 |

### תיקיית `examples/`

| קובץ | תיאור | שורות |
|------|-------|-------|
| `clients-example.tsx` | דוגמה לשימוש בטבלה הגנרית | ~150 |

---

## 3. סטטוס ישויות

| ישות | קוד ישן | קוד חדש | סטטוס | הערות |
|------|---------|---------|-------|-------|
| **Clients** | `clients-table.tsx` | `generic-clients-table.tsx` | 🟡 שניהם קיימים | הישן עדיין פעיל, החדש במקביל |
| **Projects** | `projects-table.tsx` | - | 🔴 ישן בלבד | |
| **Tasks** | `tasks-table.tsx` | - | 🔴 ישן בלבד | |
| **Products** | `products-table.tsx` | - | 🔴 ישן בלבד | |
| **Suppliers** | `suppliers-table.tsx` | - | 🔴 ישן בלבד | |
| **Payments** | `payments-table.tsx` | - | 🔴 ישן בלבד | |
| **Expenses** | `expenses-table.tsx` | - | 🔴 ישן בלבד | |

### מקרא
- 🟢 **חדש בלבד** - עבר לגמרי לקוד החדש
- 🟡 **שניהם** - יש גם ישן וגם חדש (במעבר)
- 🔴 **ישן בלבד** - עדיין על הקוד הישן

---

## 4. לוג שינויים

### 2026-01-18

#### Refactor: פיצול קבצים גדולים
- **שלב 1**: פיצול `field-input.tsx` (422 שורות) לתיקיית `fields/`
  - יצירת 13 קבצים קטנים
  - הפרדת Input מ-Display
  - קובץ ישן הפך ל-re-export

- **שלב 2**: פיצול `view-bar.tsx` (320 שורות) לתיקיית `view-bar/`
  - הפרדת דיאלוגים לקובץ נפרד
  - קובץ ישן הפך ל-re-export

- **שלב 3**: פיצול `column-header.tsx` (312 שורות) לתיקיית `column-header/`
  - הפרדת דיאלוגים לקובץ נפרד
  - קובץ ישן הפך ל-re-export

#### Feature: ולידציה ואייקונים
- יצירת `fields/validation.ts` עם פונקציות ולידציה:
  - `validateEmail` - פורמט מייל
  - `validatePhone` - מספרים + מקף/רווח
  - `validateUrl` - פורמט URL
  - `validateNumber` - מספר תקין
  - `validateCurrency` - סכום עשרוני
  - `validateDate` - תאריך תקין

- עדכון `editable-cell.tsx`:
  - שילוב ולידציה לפני שמירה
  - הצגת שגיאות בעברית
  - הוספת אייקונים לתצוגה (Mail, Phone, Link2, Calendar, Clock)

- עדכון Display components עם אייקונים:
  - מייל: 📧 Mail
  - טלפון: 📞 Phone
  - קישור: 🔗 Link2
  - תאריך: 📅 Calendar
  - תאריך ושעה: 🕐 Clock
  - מטבע: ₪

#### G2: Dynamic Navigation - ניווט דינמי

**Prisma Schema:**
- הוספת מודל `NavigationItem` עם hierarchy (parent/children)

**tRPC Router - `src/server/routers/navigation/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas | 93 |
| `queries.ts` | Query functions | 111 |
| `mutations.ts` | Mutation functions | 148 |
| `index.ts` | Router definition | 60 |

**UI Components - `src/components/layout/dynamic-sidebar/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `types.ts` | Types + DEFAULT_NAV_ITEMS | 118 |
| `nav-icon.tsx` | Dynamic icon component | 67 |
| `nav-item.tsx` | Navigation item | 115 |
| `nav-context-menu.tsx` | Right-click menu | 64 |
| `add-nav-item-button.tsx` | Add button with popover | 60 |
| `sidebar-header.tsx` | Logo header | 17 |
| `sidebar-footer.tsx` | Settings + add button | 37 |
| `sidebar-nav-list.tsx` | Navigation list | 50 |
| `use-nav-state.ts` | Navigation state hook | 71 |
| `dynamic-sidebar.tsx` | Main component | 53 |
| `dialogs/rename-dialog.tsx` | Rename dialog | 60 |
| `dialogs/icon-dialog.tsx` | Icon picker dialog | 67 |
| `dialogs/delete-dialog.tsx` | Delete confirmation | 50 |
| `dialogs/index.ts` | Barrel exports | 3 |
| `index.ts` | Barrel exports | 12 |

**UI Components - `src/components/ui/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `context-menu.tsx` | Context menu (Radix) | 120 |

**Seed - `prisma/seed.ts`:**
- הוספת `seedNavigationItems()` ליצירת ניווט ברירת מחדל
- נוצרו 23 פריטי ניווט ברירת מחדל

**סטטוס:** ✅ הושלם

**תוצאות:**
- `prisma generate` ✅
- `prisma migrate dev --name add-navigation-items` ✅
- `prisma db seed` ✅ (23 פריטי ניווט)
- `npm run typecheck` ✅ אפס שגיאות
- `npm run lint` ✅ רק warnings (מקוד קיים)

#### G2.5: Drag & Drop לשינוי סדר

**Dependencies:**
- `@hello-pangea/dnd` - React DnD library (fork of react-beautiful-dnd)

**שינויים:**
| קובץ | שינוי |
|------|-------|
| `sidebar-nav-list.tsx` | הוספת DragDropContext, Droppable, Draggable |
| `use-nav-state.ts` | הוספת reorderMutation + handleReorder |
| `dynamic-sidebar.tsx` | חיבור onReorder prop |

**סטטוס:** ✅ הושלם

**תוצאות:**
- `npm run typecheck` ✅ אפס שגיאות
- `npm run lint` ✅ רק warnings (מקוד קיים)

#### G3: Dynamic Entities - ישויות דינמיות

**Prisma Schema:**
- הוספת מודל `EntityType` - הגדרת סוגי ישויות
- הוספת מודל `GenericEntity` - רשומות של ישויות דינמיות
- הוספת שדה `fields` JSON ל-`EntityType` להגדרות עמודות

**tRPC Router - `src/server/routers/entity-types/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas | 56 |
| `queries.ts` | list, getById, getBySlug | 75 |
| `mutations.ts` | create, update, delete | 127 |
| `index.ts` | Router definition | 47 |

**tRPC Router - `src/server/routers/generic-entities/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas | 53 |
| `queries.ts` | list (paginated), getById | 68 |
| `mutations.ts` | create, update, delete, bulkUpdate | 145 |
| `index.ts` | Router definition | 44 |

**tRPC Router - `src/server/routers/generic-entity-views/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas לתצוגות | 82 |
| `queries.ts` | list, getById, getDefault | 75 |
| `mutations.ts` | create, update, delete, duplicate, setDefault | 142 |
| `index.ts` | Router definition | 31 |

**tRPC Router - `src/server/routers/generic-entity-fields/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas לשדות | 60 |
| `queries.ts` | list fields | 41 |
| `mutations.ts` | create, update, delete, reorder | 119 |
| `index.ts` | Router definition | 26 |

**UI Components - `src/components/generic-entity-table/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `types.ts` | Type definitions | 66 |
| `use-generic-entity-table.ts` | Hook for data management | 173 |
| `generic-entity-data-table.tsx` | Main table component | 182 |
| `generic-entity-row.tsx` | Row with inline editing | 82 |
| `index.ts` | Barrel exports | 15 |

**UI Components - `src/components/layout/dynamic-sidebar/dialogs/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `entity-creator-dialog.tsx` | Dialog ליצירת ישות חדשה | 164 |

**UI Components - `src/app/(protected)/entities/[slug]/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `page.tsx` | Server component | 19 |
| `generic-entity-content.tsx` | Main page content | 134 |
| `generic-entity-dialog.tsx` | Add/Edit entity dialog | 101 |

**Utilities - `src/lib/utils/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `transliterate.ts` | Hebrew to English slug conversion | 26 |

**סטטוס:** ✅ הושלם

**תוצאות:**
- `prisma migrate dev --name add-entity-types` ✅
- `prisma migrate dev --name add-entity-type-fields` ✅
- `npm run typecheck` ✅ אפס שגיאות
- `npm run lint` ✅ רק warnings (מקוד קיים)

**יכולות:**
- ✅ יצירת ישות חדשה מתוך Sidebar (כפתור +)
- ✅ Transliteration עברית → אנגלית ל-slug
- ✅ בחירת אייקון וצבע לישות
- ✅ דף דינמי `/entities/[slug]`
- ✅ טבלה עם Views, Custom Fields, Inline Editing
- ✅ שימוש חוזר בקוד מ-`generic-table/`
- ✅ שמירת תצוגות וסדר עמודות

#### G4: Dynamic Relations - קשרים דינמיים

**Prisma Schema:**
- הוספת מודל `RelationDefinition` - הגדרת קשרים בין סוגי ישויות
- הוספת מודל `EntityRelation` - רשומות קשרים בפועל בין ישויות

**tRPC Router - `src/server/routers/relations/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `schemas.ts` | Zod schemas לקשרים | 72 |
| `queries.ts` | listDefs, getDefById, listRelations | 67 |
| `mutations.ts` | createDef, updateDef, deleteDef, add/remove relations | 183 |
| `index.ts` | Router definition | 51 |

**UI Components - `src/components/generic-entity-table/`:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `add-relation-button.tsx` | כפתור הוספת קשר | 56 |
| `add-relation-form.tsx` | טופס הוספת קשר | 145 |
| `relation-cell.tsx` | תא תצוגת קשרים (badges) | 100 |
| `use-entity-relations.ts` | Hook לניהול קשרים | 82 |
| `types.ts` | עדכון - RelationType, RelationColumnDef | +20 |

**עדכון קבצים קיימים:**
| קובץ | שינוי |
|------|-------|
| `generic-entity-row.tsx` | תמיכה בעמודות קשר |
| `generic-entity-data-table.tsx` | rendering מיוחד לעמודות קשר |
| `index.ts` | exports חדשים |

**סטטוס:** ✅ הושלם

**תוצאות:**
- `prisma migrate dev --name add_relations` ✅
- `npm run typecheck` ✅ אפס שגיאות
- `npm run lint` ✅ רק warnings (מקוד קיים)

**יכולות:**
- ✅ הגדרת קשרים בין סוגי ישויות
- ✅ סוגי קשר: one_to_one, one_to_many, many_to_many
- ✅ תמיכה ב-generic entities עם prefix `generic:`
- ✅ API מלא: createDef, updateDef, deleteDef
- ✅ API ליחסים: addRelation, removeRelation, reorder
- ✅ UI: RelationCell עם badges וכפתורי הוספה/הסרה
- ✅ UI: AddRelationButton עם form בחירת יעד וסוג קשר
- ✅ Hook: useEntityRelations לניהול state

---

## 5. סטטוס Navigation

| רכיב | ישן | חדש | סטטוס |
|------|-----|-----|-------|
| **Sidebar** | `sidebar.tsx` (hardcoded) | `dynamic-sidebar/` (מ-DB) | 🟡 שניהם קיימים |

### יכולות חדשות ב-DynamicSidebar:
- ✅ טעינת פריטים מ-Database
- ✅ שינוי שם (לחיצה ימנית)
- ✅ שינוי אייקון (לחיצה ימנית)
- ✅ הסתרת פריט (לחיצה ימנית)
- ✅ מחיקת פריט (לחיצה ימנית)
- ✅ הוספת קישור (כפתור +)
- ✅ הוספת קטגוריה (כפתור +)
- ✅ Drag & Drop לשינוי סדר (@hello-pangea/dnd)

### שימוש:
```tsx
// להחלפת Sidebar הישן ב-DynamicSidebar:
import { DynamicSidebar } from '@/components/layout/dynamic-sidebar';

// במקום:
import { Sidebar } from '@/components/layout';
```

---

## 6. גיבויים

| נתיב | תיאור | סטטוס |
|------|-------|-------|
| `clients/_backup/clients-table.tsx.bak` | טבלת לקוחות לפני מעבר לגנרי | 🗑️ אפשר למחוק |
| `clients/_backup/clients-content.tsx.bak` | תוכן לקוחות לפני מעבר | 🗑️ אפשר למחוק |
| `clients/_backup/client-table-row.tsx.bak` | שורת לקוח לפני מעבר | 🗑️ אפשר למחוק |

---

## 7. תוכנית המשך

### Generic Architecture Phases

| Phase | תיאור | סטטוס |
|-------|--------|-------|
| G1 | Custom Fields + Views | ✅ הושלם |
| G2 | Dynamic Navigation | ✅ הושלם |
| G3 | Dynamic Entities | ✅ הושלם |
| G4 | Dynamic Relations | ✅ הושלם |
| G5 | Generic Entity Form | ✅ הושלם |
| G6 | Generic Detail Page | ✅ הושלם |
| G7 | Relations UI | ✅ הושלם |

#### G5: Generic Entity Form - טופס ישות גנרי

**תאריך:** 2026-01-18
**סטטוס:** ✅ הושלם

**קבצים חדשים:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `src/app/(protected)/entities/[slug]/use-entity-form.ts` | Hook לניהול state הטופס | 82 |

**קבצים ששודרגו:**
| קובץ | לפני | אחרי | שינוי |
|------|------|------|-------|
| `generic-entity-dialog.tsx` | 111 | 113 | שימוש ב-FieldInput, תמיכה בכל השדות |

**שימוש חוזר בקוד קיים:**
- `FieldInput` מ-`generic-table/fields`
- `CustomFieldType`, `FieldOption` מ-`generic-table/fields`

**פונקציונליות חדשה:**
- ✅ טעינת custom fields לפי entityTypeSlug
- ✅ רינדור כל סוגי השדות (text, number, date, select, etc.)
- ✅ שמירת נתונים ב-data JSON
- ✅ טעינת ערכים קיימים במצב עריכה
- ✅ ScrollArea לטפסים ארוכים

**בדיקות:**
- `npm run typecheck` ✅
- `npm run lint` ✅

#### G6: Generic Detail Page - דף פרטי ישות גנרי

**תאריך:** 2026-01-18
**סטטוס:** ✅ הושלם

**קבצים חדשים:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `src/app/(protected)/entities/[slug]/[id]/page.tsx` | Server component לניתוב | 19 |
| `src/app/(protected)/entities/[slug]/[id]/entity-detail-content.tsx` | תוכן דף הפרטים הראשי | 172 |
| `src/app/(protected)/entities/[slug]/[id]/delete-confirm-dialog.tsx` | דיאלוג אישור מחיקה | 54 |

**שימוש חוזר בקוד קיים:**
- `FieldDisplay` מ-`generic-table/fields`
- `CustomFieldType`, `FieldOption` מ-`generic-table/fields`
- `NavIcon` מ-`dynamic-sidebar/nav-icon`
- `GenericEntityDialog` מ-`../generic-entity-dialog`

**פונקציונליות:**
- ✅ ניתוב דינמי `/entities/[slug]/[id]`
- ✅ הצגת כותרת עם אייקון וצבע מסוג הישות
- ✅ Breadcrumb לחזרה לטבלה
- ✅ תצוגת שם ושדות מותאמים אישית
- ✅ כפתור עריכה (פותח GenericEntityDialog)
- ✅ כפתור מחיקה עם דיאלוג אישור
- ✅ ניווט חזרה לרשימה אחרי מחיקה

**בדיקות:**
- `npm run typecheck` ✅
- `npm run lint` ✅

#### G7: Relations UI - ממשק קשרים משופר

**תאריך:** 2026-01-19
**סטטוס:** ✅ הושלם

**קבצים חדשים:**
| קובץ | תיאור | שורות |
|------|-------|-------|
| `relation-group.tsx` | קבוצת קשרים עם picker וחיפוש | 143 |
| `related-entity-card.tsx` | כרטיס ישות קשורה עם עריכה | 104 |

**קבצים ששודרגו:**
| קובץ | שינוי |
|------|-------|
| `detail-relations-section.tsx` | שימוש ב-RelationGroup במקום RelationCell |
| `relation-cell.tsx` | הוספת שדה חיפוש ב-picker |

**פונקציונליות:**
- ✅ חיפוש וסינון ב-relation picker
- ✅ סקשן קשרים בדף פרטים
- ✅ הצגת כל השדות של הישות המקושרת
- ✅ עריכה inline של כל שדה בישות המקושרת
- ✅ כפתור הסרת קשר
- ✅ כפתור הוספת קשר עם חיפוש

**שימוש חוזר בקוד קיים:**
- `EditableCell` מ-`generic-table`
- `trpc.genericEntities.getById`
- `trpc.genericEntityFields.list`
- `trpc.genericEntities.update`
- `trpc.relations.*`

**בדיקות:**
- `npm run typecheck` ✅
- `npm run lint` ✅

---

### Phase הבא - מיגרציה של ישויות לטבלה הגנרית
1. [ ] Projects - העברה לטבלה הגנרית
2. [ ] Tasks - העברה לטבלה הגנרית
3. [ ] Products - העברה לטבלה הגנרית
4. [ ] Suppliers - העברה לטבלה הגנרית
5. [ ] Payments - העברה לטבלה הגנרית
6. [ ] Expenses - העברה לטבלה הגנרית

### אחרי מיגרציה מלאה
- [ ] החלפת `Sidebar` ב-`DynamicSidebar` ב-`app-layout.tsx`
- [ ] מחיקת `data-table/` (אחרי שכל הישויות עברו)
- [ ] מחיקת `_backup/`
- [ ] עדכון imports בכל הקבצים

---

*עודכן לאחרונה: 2026-01-19 (G7 הושלם)*
