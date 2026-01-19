# תוכנית שדרוג טבלאות - סגנון Monday.com עם Inline Editing

> **מטרה:** שדרוג כל הטבלאות במערכת לתמוך בעריכה ישירה בתאים (Inline Editing)
>
> **עיקרון:** כל שדה שקיים בטופס = עמודה בטבלה וניתן לעריכה inline

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [החלטות עיצוב](#החלטות-עיצוב)
3. [סוגי Editors](#סוגי-editors)
4. [מיפוי טבלאות ושדות](#מיפוי-טבלאות-ושדות)
5. [מבנה קומפוננטות](#מבנה-קומפוננטות)
6. [פיצ'רים מתקדמים](#פיצ'רים-מתקדמים)
7. [סדר עבודה](#סדר-עבודה)
8. [דוגמאות קוד](#דוגמאות-קוד)

---

## סקירה כללית

### מה משתנה?

| לפני | אחרי |
|------|------|
| טבלה מציגה חלק מהשדות | טבלה מציגה את **כל** השדות |
| לחיצה על שם → דף חדש | לחיצה על שם → Side Panel |
| עריכה רק בטופס נפרד | עריכה ישירה בתא |
| Link-based navigation | Click-based inline editing |

### טבלאות לשדרוג

| # | טבלה | מס' עמודות | קובץ נוכחי |
|---|------|------------|------------|
| 1 | Tasks (משימות) | 7 | `tasks/views/task-list.tsx` |
| 2 | Projects (פרויקטים) | 17 | `projects/projects-table.tsx` |
| 3 | Clients (לקוחות) | 12 | `clients/clients-table.tsx` |
| 4 | Payments (תשלומים) | 9 | `payments/payments-table.tsx` |
| 5 | Expenses (הוצאות) | 10 | `expenses/expenses-table.tsx` |
| 6 | Suppliers (ספקים) | 8 | `suppliers/suppliers-table.tsx` |
| 7 | Products (מוצרים) | 10 | `products/products-table.tsx` |

---

## החלטות עיצוב

### 1. אינטראקציה

| החלטה | פירוט |
|--------|--------|
| **Single Click** | לחיצה בודדת על תא פותחת את ה-editor (לא double-click) |
| **Auto-save** | שמירה אוטומטית ב-onChange (select) או onBlur (text/number) |
| **Escape** | ביטול עריכה וחזרה לערך המקורי |
| **Tab** | מעבר לתא הבא |

### 2. שדות טקסט ארוכים (description, notes, scope)

| שדה | פתרון |
|-----|--------|
| description | אייקון 📝 → לחיצה פותחת **Popover** עם Textarea |
| notes | אייקון 📝 → לחיצה פותחת **Popover** עם Textarea |
| scope | אייקון 📝 → לחיצה פותחת **Popover** עם Textarea |

> **הסיבה:** טקסט ארוך לא נוח לערוך inline בתא צר

### 3. שדות מותנים

| מצב | החלטה |
|-----|--------|
| `fixedFee` כש-`billingType !== 'fixed'` | **מוצג תמיד** - תא ריק אם לא רלוונטי |
| `companyNumber` כש-`type !== 'company'` | **מוצג תמיד** - תא ריק אם לא רלוונטי |
| `markupPercent` כש-`isBillable === false` | **מוצג תמיד** - תא ריק אם לא רלוונטי |

> **הסיבה:** פשטות - לא צריך לשנות מבנה טבלה דינמית

### 4. Side Panel

| אלמנט | התנהגות |
|-------|---------|
| לחיצה על **שם הפריט** | פותח Sheet מצד ימין |
| תוכן ה-Sheet | הטופס המלא הקיים (reuse) |
| כפתור "פתח בדף מלא" | לינק לדף הפרטים הקיים |

---

## סוגי Editors

### רשימת כל ה-Editors

| סוג | קומפוננטה | שימוש | התנהגות |
|-----|-----------|-------|---------|
| `text` | `TextCell` | שמות, כתובות | Input רגיל, Blur לשמירה |
| `number` | `NumberCell` | שטח, ימי אספקה | Input type="number" עם step |
| `currency` | `CurrencyCell` | תקציב, מחירים | Input + פורמט ₪ |
| `date` | `DateCell` | תאריכים | Input type="date" |
| `select` | `SelectCell` | עדיפות, סוג, סטטוס | Dropdown עם אופציות קבועות |
| `config-select` | `ConfigSelectCell` | statusId, typeId, phaseId | Dropdown מ-ConfigurableEntity |
| `checkbox` | `CheckboxCell` | isVIP, isBillable | Toggle/Checkbox |
| `textarea` | `TextareaCell` | description, notes | אייקון + Popover עם Textarea |
| `multi-user` | `MultiUserCell` | assignedUsers | Popover עם בחירת משתמשים |
| `rating` | `RatingCell` | rating | כוכבים (1-5) |
| `multi-tag` | `MultiTagCell` | tags | Combobox עם תגיות |

### פירוט לכל Editor

#### TextCell
```
┌─────────────────┐
│ ערך נוכחי      │  ← מצב תצוגה
└─────────────────┘
       ↓ click
┌─────────────────┐
│ [input field]  │  ← מצב עריכה
└─────────────────┘
       ↓ blur/enter
       שמירה אוטומטית
```

#### SelectCell
```
┌─────────────────┐
│ Badge/Text  ▼  │  ← מצב תצוגה + חץ
└─────────────────┘
       ↓ click
┌─────────────────┐
│ ○ אופציה 1     │
│ ● אופציה 2     │  ← Dropdown פתוח
│ ○ אופציה 3     │
└─────────────────┘
       ↓ select
       שמירה אוטומטית + סגירה
```

#### TextareaCell
```
┌────┐
│ 📝 │  ← אייקון בלבד (או קיצור טקסט)
└────┘
  ↓ click
┌──────────────────────────┐
│ ┌────────────────────┐  │
│ │                    │  │
│ │   Textarea         │  │  ← Popover
│ │                    │  │
│ └────────────────────┘  │
│              [שמור]     │
└──────────────────────────┘
```

#### MultiUserCell
```
┌──────────────────┐
│ 👤👤👤 +2       │  ← אווטארים
└──────────────────┘
       ↓ click
┌──────────────────────────┐
│ ☑ יוסי כהן              │
│ ☑ מיכל לוי              │  ← Popover
│ ☐ דני אברהם             │
│ ☐ שרה רוזן              │
└──────────────────────────┘
```

---

## מיפוי טבלאות ושדות

### 1. Tasks (משימות) - 7 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | title | כותרת | text | flex-1 (min 200px) | ✅ |
| 2 | description | תיאור | textarea | 50px | - |
| 3 | projectId | פרויקט | select | 150px | - |
| 4 | statusId | סטטוס | config-select (task_status) | 120px | - |
| 5 | categoryId | קטגוריה | config-select (task_category) | 120px | - |
| 6 | priority | עדיפות | select | 100px | - |
| 7 | dueDate | תאריך יעד | date | 120px | - |
| + | assignedToId | אחראי | select (users) | 120px | - |

**אופציות עדיפות:**
- `low` → נמוכה
- `medium` → בינונית
- `high` → גבוהה
- `urgent` → דחוף

---

### 2. Projects (פרויקטים) - 17 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | name | שם פרויקט | text | 200px | ✅ |
| 2 | code | קוד | text | 100px | - |
| 3 | clientId | לקוח | select | 150px | ✅ |
| 4 | typeId | סוג | config-select (project_type) | 120px | - |
| 5 | statusId | סטטוס | config-select (project_status) | 120px | - |
| 6 | phaseId | שלב | config-select (project_phase) | 120px | - |
| 7 | priority | עדיפות | select | 100px | - |
| 8 | isVIP | VIP | checkbox | 60px | - |
| 9 | address | כתובת | text | 150px | - |
| 10 | city | עיר | text | 100px | - |
| 11 | area | שטח (מ"ר) | number | 80px | - |
| 12 | budget | תקציב | currency | 100px | - |
| 13 | billingType | סוג תמחור | select | 120px | - |
| 14 | fixedFee | שכ"ט | currency | 100px | - |
| 15 | startDate | תאריך התחלה | date | 120px | - |
| 16 | expectedEndDate | תאריך יעד | date | 120px | - |
| 17 | assignedUsers | צוות | multi-user | 150px | - |
| + | description | תיאור | textarea | 50px | - |
| + | scope | היקף | textarea | 50px | - |

**אופציות סוג תמחור:**
- `fixed` → מחיר קבוע
- `hourly` → שעתי
- `percentage` → אחוז מתקציב
- `cost_plus` → Cost+
- `hybrid` → משולב

---

### 3. Clients (לקוחות) - 12 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | name | שם לקוח | text | 180px | ✅ |
| 2 | type | סוג | select | 100px | - |
| 3 | status | סטטוס | select | 100px | - |
| 4 | email | אימייל | text | 180px | - |
| 5 | phone | טלפון | text | 120px | - |
| 6 | mobile | נייד | text | 120px | - |
| 7 | preferredCommunication | דרך תקשורת | select | 120px | - |
| 8 | address | כתובת | text | 150px | - |
| 9 | city | עיר | text | 100px | - |
| 10 | companyNumber | ח.פ/ע.מ | text | 100px | - |
| 11 | contactPerson | איש קשר | text | 150px | - |
| 12 | notes | הערות | textarea | 50px | - |

**אופציות סוג לקוח:**
- `individual` → פרטי
- `company` → חברה

**אופציות סטטוס:**
- `lead` → ליד
- `active` → פעיל
- `past` → לקוח עבר
- `inactive` → לא פעיל

**אופציות דרך תקשורת:**
- `email` → אימייל
- `phone` → טלפון
- `whatsapp` → וואטסאפ

---

### 4. Payments (תשלומים) - 9 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | name | שם תשלום | text | 200px | ✅ |
| 2 | projectId | פרויקט | select | 150px | ✅ |
| 3 | paymentType | סוג | select | 120px | - |
| 4 | amount | סכום | currency | 100px | ✅ |
| 5 | status | סטטוס | select | 100px | - |
| 6 | dueDate | תאריך יעד | date | 120px | - |
| 7 | paidAmount | שולם | currency | 100px | - |
| 8 | paidAt | תאריך תשלום | date | 120px | - |
| 9 | milestoneDescription | אבן דרך | text | 150px | - |
| + | description | תיאור | textarea | 50px | - |

**אופציות סוג תשלום:**
- `retainer` → מקדמה
- `milestone` → אבן דרך
- `scheduled` → מתוזמן
- `final` → סופי
- `change_order` → שינויים
- `hourly` → לפי שעות
- `expense` → הוצאות

**אופציות סטטוס:**
- `scheduled` → מתוכנן
- `pending` → ממתין
- `invoiced` → חשבונית
- `partial` → חלקי
- `paid` → שולם
- `overdue` → באיחור
- `cancelled` → בוטל

---

### 5. Expenses (הוצאות) - 10 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | description | תיאור | text | 200px | ✅ |
| 2 | projectId | פרויקט | select | 150px | - |
| 3 | supplierId | ספק | select | 150px | - |
| 4 | amount | סכום | currency | 100px | ✅ |
| 5 | status | סטטוס | select | 100px | - |
| 6 | date | תאריך | date | 120px | ✅ |
| 7 | isBillable | לחיוב | checkbox | 80px | - |
| 8 | markupPercent | אחוז מרווח | number | 80px | - |
| 9 | invoiceNumber | מס' חשבונית | text | 100px | - |
| 10 | category | קטגוריה | text | 100px | - |

**אופציות סטטוס:**
- `pending` → ממתין
- `approved` → אושר
- `rejected` → נדחה
- `reimbursed` → הוחזר

---

### 6. Suppliers (ספקים) - 8 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | name | שם ספק | text | 180px | ✅ |
| 2 | categoryId | קטגוריה | config-select (supplier_category) | 120px | - |
| 3 | contactPerson | איש קשר | text | 150px | - |
| 4 | email | אימייל | text | 180px | - |
| 5 | phone | טלפון | text | 120px | - |
| 6 | city | עיר | text | 100px | - |
| 7 | rating | דירוג | rating | 100px | - |
| 8 | notes | הערות | textarea | 50px | - |

---

### 7. Products (מוצרים) - 10 עמודות

| # | שדה | תווית | סוג Editor | רוחב | חובה |
|---|-----|-------|-----------|------|------|
| 1 | name | שם מוצר | text | 200px | ✅ |
| 2 | sku | מק"ט | text | 100px | - |
| 3 | categoryId | קטגוריה | config-select (product_category) | 120px | - |
| 4 | supplierId | ספק | select | 150px | - |
| 5 | costPrice | מחיר עלות | currency | 100px | - |
| 6 | retailPrice | מחיר קמעונאי | currency | 100px | - |
| 7 | currency | מטבע | select | 80px | - |
| 8 | dimensions | מידות | text | 120px | - |
| 9 | leadTimeDays | ימי אספקה | number | 80px | - |
| 10 | tags | תגיות | multi-tag | 150px | - |
| + | description | תיאור | textarea | 50px | - |

---

## מבנה קומפוננטות

### מבנה תיקיות

```
src/components/data-table/
│
├── index.ts                    # Barrel export
│
├── editable-table.tsx          # קומפוננטת טבלה ראשית
├── editable-row.tsx            # שורה בודדת
├── column-header.tsx           # כותרת עמודה
│
├── cells/                      # כל סוגי התאים
│   ├── index.ts
│   ├── base-cell.tsx           # Base class/wrapper
│   ├── text-cell.tsx
│   ├── number-cell.tsx
│   ├── currency-cell.tsx
│   ├── date-cell.tsx
│   ├── select-cell.tsx
│   ├── config-select-cell.tsx
│   ├── checkbox-cell.tsx
│   ├── textarea-cell.tsx
│   ├── multi-user-cell.tsx
│   ├── rating-cell.tsx
│   └── multi-tag-cell.tsx
│
├── entity-sheet.tsx            # Side Panel גנרי
│
└── types.ts                    # TypeScript types
```

### Types

```typescript
// types.ts

export type CellType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'config-select'
  | 'checkbox'
  | 'textarea'
  | 'multi-user'
  | 'rating'
  | 'multi-tag';

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  type: CellType;
  width: number | string;
  required?: boolean;
  sticky?: boolean;  // לעמודה דביקה

  // לסוגים ספציפיים
  options?: Array<{ value: string; label: string }>;
  entityType?: string;  // ל-config-select
  step?: number;        // ל-number
  min?: number;
  max?: number;
}

export interface EditableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate: (id: string, field: keyof T, value: unknown) => void;
  onRowClick?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

---

## פיצ'רים מתקדמים

### 1. Sticky Column (עמודת שם דביקה)

```
┌──────────────────────────────────────────────────────────────┐
│ ║ שם פרויקט   ║  סטטוס  │  שלב   │  עדיפות │  תקציב │ ... │
├──────────────────────────────────────────────────────────────┤
│ ║ פרויקט א    ║  פעיל   │ קונספט │  גבוהה  │ ₪50K   │     │
│ ║ פרויקט ב    ║  מושהה  │ רכש    │  בינונית│ ₪120K  │     │
└──────────────────────────────────────────────────────────────┘
         ↑                              ← scroll →
    עמודה דביקה
    (sticky)
```

**מימוש CSS:**
```css
.sticky-column {
  position: sticky;
  right: 0;
  z-index: 10;
  background: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
}
```

### 2. Horizontal Scroll

- הטבלה גוללת אופקית כשיש הרבה עמודות
- הכותרות נשארות במקום (sticky top)
- עמודת השם נשארת במקום (sticky right)

### 3. Side Panel (EntitySheet)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          ┌─────┤
│  טבלה ראשית                                              │     │
│                                                          │ Side│
│  ┌──────┬────────┬────────┐                              │Panel│
│  │ שם   │ סטטוס  │ ...    │                              │     │
│  ├──────┼────────┼────────┤      ← click on name →       │פרטי │
│  │ ABC  │ פעיל   │        │                              │מלאים│
│  │ XYZ  │ מושהה  │        │                              │     │
│  └──────┴────────┴────────┘                              │     │
│                                                          │     │
│                                                          └─────┤
└─────────────────────────────────────────────────────────────────┘
```

**שימוש:**
```tsx
<Sheet open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
  <SheetContent side="left" className="w-[500px]">
    <SheetHeader>
      <SheetTitle>פרטי פרויקט</SheetTitle>
    </SheetHeader>
    <ProjectDetailContent id={selectedId} />
  </SheetContent>
</Sheet>
```

### 4. Row Actions

בצד שמאל של כל שורה:
```
┌────┐
│ ⋮  │  ← Dropdown menu
└────┘
   │
   ├─ פתח בדף מלא
   ├─ שכפל
   ├─ ──────────
   └─ מחק
```

---

## סדר עבודה

### שלב 1: תשתית Base Components

**משימות:**
- [ ] יצירת תיקיית `src/components/data-table/`
- [ ] יצירת `types.ts` עם כל ה-Types
- [ ] יצירת `base-cell.tsx` - wrapper בסיסי לכל התאים
- [ ] יצירת `editable-table.tsx` - הטבלה הגנרית
- [ ] יצירת `editable-row.tsx` - שורה בודדת
- [ ] יצירת `column-header.tsx` - כותרת עמודה
- [ ] יצירת `entity-sheet.tsx` - Side Panel

**תוצאה:** תשתית מוכנה לשימוש

---

### שלב 2: Cell Components - חלק א'

**משימות:**
- [ ] `text-cell.tsx` - עריכת טקסט
- [ ] `number-cell.tsx` - עריכת מספרים
- [ ] `currency-cell.tsx` - עריכת מחירים
- [ ] `date-cell.tsx` - עריכת תאריכים
- [ ] `checkbox-cell.tsx` - Toggle

**תוצאה:** 5 סוגי תאים בסיסיים

---

### שלב 3: Cell Components - חלק ב'

**משימות:**
- [ ] `select-cell.tsx` - בחירה מרשימה
- [ ] `config-select-cell.tsx` - בחירה מ-ConfigurableEntity
- [ ] `textarea-cell.tsx` - טקסט ארוך עם Popover
- [ ] `multi-user-cell.tsx` - בחירת משתמשים
- [ ] `rating-cell.tsx` - דירוג כוכבים
- [ ] `multi-tag-cell.tsx` - תגיות

**תוצאה:** כל סוגי התאים מוכנים

---

### שלב 4: שדרוג Tasks (POC)

**משימות:**
- [ ] להחליף את `task-list.tsx` להשתמש ב-`EditableTable`
- [ ] להוסיף את כל 7 העמודות
- [ ] לחבר mutations קיימים
- [ ] להוסיף Side Panel לפרטים מלאים
- [ ] בדיקות ותיקונים

**תוצאה:** טבלת משימות עובדת במלואה

---

### שלב 5: שדרוג Projects

**משימות:**
- [ ] להחליף את `projects-table.tsx`
- [ ] להוסיף את כל 17 העמודות
- [ ] לממש Sticky Column לעמודת השם
- [ ] לחבר mutations
- [ ] Side Panel

**תוצאה:** טבלת פרויקטים עובדת

---

### שלב 6: שדרוג Clients

**משימות:**
- [ ] להחליף את `clients-table.tsx`
- [ ] להוסיף את כל 12 העמודות
- [ ] לחבר mutations
- [ ] Side Panel

**תוצאה:** טבלת לקוחות עובדת

---

### שלב 7: שדרוג Payments

**משימות:**
- [ ] להחליף טבלת תשלומים
- [ ] 9 עמודות
- [ ] mutations + Side Panel

---

### שלב 8: שדרוג Expenses

**משימות:**
- [ ] להחליף טבלת הוצאות
- [ ] 10 עמודות
- [ ] mutations + Side Panel

---

### שלב 9: שדרוג Suppliers

**משימות:**
- [ ] להחליף טבלת ספקים
- [ ] 8 עמודות
- [ ] mutations + Side Panel

---

### שלב 10: שדרוג Products

**משימות:**
- [ ] להחליף טבלת מוצרים
- [ ] 10 עמודות
- [ ] mutations + Side Panel

---

### שלב 11: בדיקות וליטוש

**משימות:**
- [ ] בדיקת RTL בכל הטבלאות
- [ ] בדיקת Responsive (מובייל)
- [ ] בדיקת ביצועים (טבלאות גדולות)
- [ ] תיקון באגים
- [ ] TypeScript errors = 0
- [ ] ESLint errors = 0

---

## דוגמאות קוד

### שימוש בטבלה

```tsx
// projects-content.tsx

import { EditableTable } from '@/components/data-table';
import { EntitySheet } from '@/components/data-table';
import { ProjectDetailContent } from './project-detail-content';

export function ProjectsContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = trpc.projects.list.useQuery({ pageSize: 100 });
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => utils.projects.list.invalidate(),
  });

  const columns = [
    { key: 'name', label: 'שם פרויקט', type: 'text', width: 200, sticky: true, required: true },
    { key: 'clientId', label: 'לקוח', type: 'select', width: 150, options: clientOptions },
    { key: 'statusId', label: 'סטטוס', type: 'config-select', entityType: 'project_status', width: 120 },
    { key: 'phaseId', label: 'שלב', type: 'config-select', entityType: 'project_phase', width: 120 },
    { key: 'priority', label: 'עדיפות', type: 'select', width: 100, options: priorityOptions },
    { key: 'isVIP', label: 'VIP', type: 'checkbox', width: 60 },
    { key: 'budget', label: 'תקציב', type: 'currency', width: 100 },
    { key: 'startDate', label: 'התחלה', type: 'date', width: 120 },
    { key: 'expectedEndDate', label: 'יעד', type: 'date', width: 120 },
    { key: 'assignedUsers', label: 'צוות', type: 'multi-user', width: 150 },
    { key: 'description', label: 'תיאור', type: 'textarea', width: 50 },
  ];

  const handleUpdate = (id: string, field: string, value: unknown) => {
    updateMutation.mutate({ id, [field]: value });
  };

  return (
    <>
      <EditableTable
        data={data?.items || []}
        columns={columns}
        onUpdate={handleUpdate}
        onRowClick={setSelectedId}
        isLoading={isLoading}
        emptyMessage="אין פרויקטים"
      />

      <EntitySheet
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="פרטי פרויקט"
      >
        {selectedId && <ProjectDetailContent id={selectedId} />}
      </EntitySheet>
    </>
  );
}
```

### מימוש TextCell

```tsx
// cells/text-cell.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface TextCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
  required?: boolean;
  placeholder?: string;
}

export function TextCell({ value, onSave, required, placeholder }: TextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newValue = editValue.trim() || null;
    if (required && !newValue) {
      setEditValue(value || '');
    } else if (newValue !== value) {
      onSave(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer px-2 py-1 min-h-[32px] hover:bg-muted/50 rounded"
    >
      {value || <span className="text-muted-foreground">{placeholder || '-'}</span>}
    </div>
  );
}
```

### מימוש SelectCell

```tsx
// cells/select-cell.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface SelectCellProps {
  value: string | null;
  options: Option[];
  onSave: (value: string | null) => void;
  placeholder?: string;
  allowEmpty?: boolean;
}

export function SelectCell({ value, options, onSave, placeholder, allowEmpty = true }: SelectCellProps) {
  const handleChange = (newValue: string) => {
    const finalValue = newValue === '__empty__' ? null : newValue;
    if (finalValue !== value) {
      onSave(finalValue);
    }
  };

  return (
    <Select value={value || '__empty__'} onValueChange={handleChange}>
      <SelectTrigger className="h-8 border-none shadow-none hover:bg-muted/50">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value="__empty__">
            <span className="text-muted-foreground">-</span>
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.color && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## סיכום

### מה נבנה:
- ✅ 11 סוגי Cell editors
- ✅ טבלה גנרית עם inline editing
- ✅ Side Panel לצפייה מלאה
- ✅ 7 טבלאות משודרגות

### עקרונות מנחים:
- Single click לעריכה
- Auto-save
- כל השדות מהטופס = עמודות בטבלה
- Sticky column לשם
- Side Panel כאופציה נוספת

### כללי קוד:
- מקסימום 150 שורות לקובץ
- אפס שגיאות TypeScript
- אפס שגיאות ESLint
- עברית ב-UI

---

**מסמך זה הוא ה-Source of Truth לפרויקט שדרוג הטבלאות.**
