# Generic Architecture Plan - Architect Studio

> **תאריך:** 2026-01-18
> **גרסה:** 2.0
> **סטטוס:** תכנון ראשוני - ממתין לאישור

---

# תוכן עניינים

1. [סקירה כללית](#א-סקירה-כללית)
2. [UI/UX Guidelines - ניהול במקום העבודה](#ב-uiux-guidelines---ניהול-במקום-העבודה)
3. [מצב קיים - מה כבר גנרי](#ג-מצב-קיים---מה-כבר-גנרי)
4. [מה צריך להפוך לגנרי](#ד-מה-צריך-להפוך-לגנרי)
5. [Custom Fields - שדות מותאמים](#ה-custom-fields---שדות-מותאמים)
6. [Dynamic Views - תצוגות דינמיות](#ו-dynamic-views---תצוגות-דינמיות)
7. [Dynamic Navigation - ניווט דינמי](#ז-dynamic-navigation---ניווט-דינמי)
8. [Dynamic Entities - ישויות דינמיות](#ח-dynamic-entities---ישויות-דינמיות)
9. [Dynamic Relations - קשרים דינמיים](#ט-dynamic-relations---קשרים-דינמיים)
10. [תוכנית יישום](#י-תוכנית-יישום)
11. [סיכום](#יא-סיכום)

---

# א. סקירה כללית

## מטרה

הפיכת Architect Studio ממערכת Hardcoded למערכת **גמישה ודינמית** שמאפשרת:

1. **למשתמשים** - התאמה מלאה לצרכים העסקיים שלהם
2. **למפתחים** - הוספת פיצ'רים חדשים במינימום קוד
3. **לעסק** - מכירת פתרון SaaS גנרי לתעשיות נוספות

## עקרונות מנחים

```
1. כל מה שיכול להשתנות בין לקוח ללקוח - צריך להיות Configurable.
2. כל מה שחוזר על עצמו בקוד - צריך להפוך לגנרי.
3. ניהול תמיד במקום העבודה - לא בהגדרות נפרדות. ⭐ חדש!
```

## רמות גנריות

| רמה | תיאור | דוגמאות | סטטוס |
|-----|--------|---------|-------|
| **Level 1** | Configurable Values | סטטוסים, קטגוריות, שלבים | ✅ קיים |
| **Level 2** | Custom Fields | שדות מותאמים לישויות | 🔶 מתוכנן |
| **Level 3** | Dynamic Views | תצוגות, עמודות, סינונים | ❌ לא קיים |
| **Level 4** | Dynamic Navigation | ניהול תפריט | ❌ לא קיים |
| **Level 5** | Dynamic Entities | יצירת ישויות חדשות | ❌ לא קיים |
| **Level 6** | Dynamic Relations | קשרים בין ישויות | ❌ לא קיים |

---

# ב. UI/UX Guidelines - ניהול במקום העבודה

## העיקרון המנחה

> **"הכל מנוהל מאיפה שעובדים"** - בסגנון Monday.com / Notion
>
> המשתמש לא צריך ללכת להגדרות כדי להתאים את המערכת.
> הכל קורה **In-Context** - במקום שבו משתמשים בפיצ'ר.

## מפת ניהול לפי פיצ'ר

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        איפה מנהלים כל דבר?                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │   SIDEBAR   │  ◄─── ניהול Navigation + יצירת Entities                │
│  │             │       • גרירה לשינוי סדר                               │
│  │  Dashboard  │       • לחיצה ימנית → תפריט עריכה                      │
│  │  Projects   │       • כפתור "+" → הוסף פריט / ישות חדשה              │
│  │  Clients    │       • Hover → אייקון עריכה/מחיקה                     │
│  │  Tasks      │                                                        │
│  │    ...      │                                                        │
│  │  [+ הוסף]   │                                                        │
│  └─────────────┘                                                        │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         TABLE VIEW                                │   │
│  │                                                                   │   │
│  │  ┌─── View Bar ──────────────────────────────────────────────┐   │   │
│  │  │ [Table ▼] [Kanban] [Calendar] │ [Filter] [Sort] │ [Save ▼]│   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  │  ◄─── ניהול Views (תצוגות, סינון, מיון, שמירה)                  │   │
│  │                                                                   │   │
│  │  ┌─── Column Headers ────────────────────────────────────────┐   │   │
│  │  │  Name  │  Status ▼  │  Client  │  Due Date  │    [+]      │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  │  ◄─── ניהול Columns + Custom Fields                             │   │
│  │       • לחיצה על כותרת → מיון / עריכה / הסתרה                   │   │
│  │       • כפתור "+" → הוסף עמודה (כולל שדות מותאמים)               │   │
│  │       • גרירת עמודות לשינוי סדר                                  │   │
│  │                                                                   │   │
│  │  ┌─── Data Rows ─────────────────────────────────────────────┐   │   │
│  │  │  Project A  │  Active   │  Client 1  │  15/01  │          │   │   │
│  │  │  Project B  │  On Hold  │  Client 2  │  20/01  │          │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## פירוט לפי פיצ'ר

### 1. Custom Fields (שדות מותאמים)

**איפה:** מהטבלה - לא מהגדרות!

| פעולה | איך |
|-------|-----|
| הוספת שדה | כפתור **"+"** בסוף שורת הכותרות |
| עריכת שדה | לחיצה על כותרת עמודה → **"Edit column"** |
| מחיקת שדה | לחיצה על כותרת עמודה → **"Delete column"** |
| שינוי סדר | **גרירת** כותרת עמודה |
| הסתרת שדה | לחיצה על כותרת → **"Hide column"** |

```
┌─────────────────────────────────────────────────────────────┐
│  Name  │  Status ▼  │  Budget  │  Custom1  │    [+]        │
│                                                   │         │
│                                          ┌────────▼────────┐
│                                          │ Add Column      │
│                                          ├─────────────────┤
│                                          │ 📝 Text         │
│                                          │ 🔢 Number       │
│                                          │ 📅 Date         │
│                                          │ 📋 Select       │
│                                          │ ☑️ Checkbox     │
│                                          │ 🔗 Link         │
│                                          │ 👤 Person       │
│                                          │ 📎 Relation     │
│                                          │ ─────────────── │
│                                          │ ⬇️ Import field │
│                                          └─────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 2. Views (תצוגות)

**איפה:** מעל הטבלה - View Bar

| פעולה | איך |
|-------|-----|
| שמירת תצוגה | כפתור **"Save view"** → שם + שמירה |
| החלפת תצוגה | **Dropdown** של תצוגות שמורות |
| שיתוף תצוגה | בשמירה → Toggle **"Share with team"** |
| סינון | כפתור **"Filter"** → בנה פילטר |
| מיון | כפתור **"Sort"** או לחיצה על כותרת |
| שינוי סוג | **Tab buttons**: Table / Kanban / Calendar |

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐  ┌─────────┐ ┌─────────┐         │
│  │ 📋 Table  ▼  │ │ 📊 Kanban    │  │ Filter  │ │  Sort   │         │
│  └──────┬───────┘ └──────────────┘  └────┬────┘ └────┬────┘         │
│         │                                │           │               │
│  ┌──────▼───────┐                 ┌──────▼───────────▼──────┐        │
│  │ ⭐ Default   │                 │ + Add filter            │        │
│  │ 📁 Active    │                 │ ────────────────────────│        │
│  │ 📁 On Hold   │                 │ Status │ is │ Active ▼ │        │
│  │ 📁 My Tasks  │                 │ + Add condition         │        │
│  │ ───────────  │                 └─────────────────────────┘        │
│  │ + Save view  │                                                    │
│  └──────────────┘                                                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ [Save view ▼]                                              │     │
│  │  ┌──────────────────────────────────────────────────────┐  │     │
│  │  │ View name: [My Custom View          ]                │  │     │
│  │  │ ☑️ Share with team                                   │  │     │
│  │  │ ☐ Set as default                                     │  │     │
│  │  │                              [Cancel] [Save]         │  │     │
│  │  └──────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3. Navigation (ניווט)

**איפה:** מה-Sidebar עצמו - לא מהגדרות!

| פעולה | איך |
|-------|-----|
| שינוי סדר | **גרירה** של פריטים |
| הוספת פריט | כפתור **"+"** בתחתית |
| עריכה | **לחיצה ימנית** או **Hover** → אייקון עריכה |
| מחיקה | לחיצה ימנית → **"Delete"** |
| קיפול/פתיחה | לחיצה על **חץ** ליד קטגוריה |
| הסתרה | לחיצה ימנית → **"Hide"** |

```
┌─────────────────────────────┐
│  ≡  Architect Studio        │
├─────────────────────────────┤
│                             │
│  ⊞ Dashboard                │  ◄── Drag handle (hover)
│                             │
│  ▼ Projects            [⋮]  │  ◄── Right-click menu
│    ├─ All Projects          │
│    ├─ Active                │
│    └─ Archived              │
│                             │
│  ▼ Contacts            [⋮]  │
│    ├─ Clients               │
│    ├─ Suppliers             │
│    └─ Professionals         │
│                             │
│  ▶ Work Management     [⋮]  │  ◄── Collapsed
│                             │
│  ─────────────────────────  │
│                             │
│  [+ Add item]               │  ◄── Opens menu:
│                             │      • Add link
│                             │      • Add category
│                             │      • Create new entity
└─────────────────────────────┘

Right-click menu:
┌─────────────────┐
│ ✏️ Rename       │
│ 🎨 Change icon  │
│ 📁 Move to...   │
│ 👁️ Hide        │
│ ─────────────── │
│ 🗑️ Delete      │
└─────────────────┘
```

### 4. Entities (ישויות חדשות)

**איפה:** מה-Sidebar - לא מהגדרות!

| פעולה | איך |
|-------|-----|
| יצירת ישות חדשה | Sidebar → **"+ Add item"** → **"Create new entity"** |
| הגדרת שדות | בתוך הישות החדשה → כמו כל טבלה |
| עריכת הגדרות | לחיצה ימנית על הישות ב-Sidebar |

```
┌─────────────────────────────┐      ┌──────────────────────────────┐
│                             │      │                              │
│  [+ Add item]         ──────┼──►   │  What would you like to add? │
│                             │      │  ─────────────────────────── │
└─────────────────────────────┘      │  📎 Add link                 │
                                     │  📁 Add category             │
                                     │  ─────────────────────────── │
                                     │  ✨ Create new entity    ────┼──►  ┌─────────────────────────┐
                                     │                              │     │ Create Entity           │
                                     └──────────────────────────────┘     │ ─────────────────────── │
                                                                          │ Name: [Subcontractors ] │
                                                                          │ Icon: [👷 ▼]            │
                                                                          │ Color: [🔵 ▼]           │
                                                                          │                         │
                                                                          │ ☑️ Show in sidebar      │
                                                                          │ ☐ Allow in projects     │
                                                                          │                         │
                                                                          │      [Cancel] [Create]  │
                                                                          └─────────────────────────┘
```

### 5. Relations (קשרים)

**איפה:** מהטבלה - כעמודה חדשה!

| פעולה | איך |
|-------|-----|
| הוספת קשר | כפתור **"+"** → **"Relation"** |
| בחירת ישות | בחר לאיזו ישות לקשר |
| עריכת קשר | לחיצה על כותרת העמודה |

```
┌─────────────────────────────────────────────────────────────┐
│  [+] Add Column                                             │
│  ├─ 📝 Text                                                 │
│  ├─ 🔢 Number                                               │
│  ├─ ...                                                     │
│  └─ 🔗 Relation  ───────────────────────────────────►       │
│                                                             │
│     ┌───────────────────────────────────────────────┐       │
│     │ Create Relation                               │       │
│     │ ─────────────────────────────────────────────│       │
│     │ Connect to: [Select entity      ▼]           │       │
│     │             ┌─────────────────────┐          │       │
│     │             │ 👤 Clients          │          │       │
│     │             │ 🏢 Suppliers        │          │       │
│     │             │ 📋 Projects         │          │       │
│     │             │ ✅ Tasks            │          │       │
│     │             │ 📦 Products         │          │       │
│     │             │ 👷 Subcontractors   │ ◄── Custom entity │
│     │             └─────────────────────┘          │       │
│     │                                              │       │
│     │ Relation type:                               │       │
│     │ ◉ Many (can link multiple)                   │       │
│     │ ○ One (single link only)                     │       │
│     │                                              │       │
│     │ ☑️ Show on related entity too                │       │
│     │                                              │       │
│     │                     [Cancel] [Create]        │       │
│     └───────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## השוואה: הגדרות נפרדות vs ניהול במקום

| פיצ'ר | ❌ גישה ישנה (Settings) | ✅ גישה חדשה (In-Context) |
|-------|------------------------|---------------------------|
| Custom Fields | Settings → Fields → Entity → Add | לחיצה על "+" בטבלה |
| Views | Settings → Views → Create | "Save view" מעל הטבלה |
| Navigation | Settings → Menu → Edit | גרירה + לחיצה ימנית ב-Sidebar |
| Entities | Settings → Entities → Create | "+ Add item" ב-Sidebar |
| Relations | Settings → Relations → Define | "+" בטבלה → Relation |

## יתרונות הגישה החדשה

1. **Zero Learning Curve** - המשתמש לומד תוך כדי עבודה
2. **Context Preservation** - לא עוזבים את העמוד הנוכחי
3. **Immediate Feedback** - רואים את התוצאה מיד
4. **Discoverability** - הפיצ'רים גלויים במקום הנכון
5. **Power User Friendly** - קיצורי דרך ותפריטי הקשר

---

# ג. מצב קיים - מה כבר גנרי

## ✅ מה עובד היום

### 1. ConfigurableEntity (Level 1)

**קיים ומלא!**

```typescript
// מיושם ב: prisma/schema.prisma, src/server/routers/config/
model ConfigurableEntity {
  id            String   @id
  tenantId      String
  entityType    String   // project_type, project_status, etc.
  name          String
  nameEn        String?
  color         String?
  icon          String?
  isDefault     Boolean
  isSystem      Boolean
  order         Int
  isActive      Boolean
}
```

**Entity Types נתמכים:**
- `project_type`, `project_status`, `project_phase`
- `task_status`, `task_category`
- `room_type`, `room_status`
- `document_category`, `supplier_category`, `trade`

**⚠️ בעיה:** הניהול נמצא ב-Settings → Config Tab (לא In-Context)

---

# ד. מה צריך להפוך לגנרי

## ❌ Hardcoded באפליקציה

| רכיב | בעיה | פתרון |
|------|------|-------|
| Navigation | תפריט קבוע ב-`sidebar.tsx` | Dynamic + ניהול מה-Sidebar |
| Entity Schemas | 50+ שדות קבועים ב-Prisma | Custom Fields |
| Form Schemas | Zod schemas קבועים | Schema Generation |
| UI Pages | 20+ תיקיות דומות | Generic Pages |
| tRPC Routers | 20+ routers חוזרים | Generic CRUD |
| Table Views | עמודות קבועות | Dynamic Views |

---

# ה. Custom Fields - שדות מותאמים

## Database Schema

```prisma
model CustomFieldDefinition {
  id          String   @id @default(cuid())
  tenantId    String
  entityType  String   // project | client | task | etc.

  // Field info
  name        String   // "מספר רישיון"
  fieldKey    String   // license_number
  fieldType   String   // text | number | date | select | etc.
  options     Json?    // [{ value, label }]

  // Validation
  isRequired  Boolean  @default(false)
  validation  Json?    // { min, max, pattern, etc. }

  // Display
  defaultValue  String?
  placeholder   String?
  helpText      String?
  width         Int?    // Column width in pixels

  // Visibility (בעתיד - לא MVP)
  // showInList, showInCard, showInPortal, showInFilter

  // Organization
  order       Int      @default(0)
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, entityType, fieldKey])
}

model CustomFieldValue {
  id          String   @id @default(cuid())
  tenantId    String
  fieldId     String
  entityType  String
  entityId    String
  value       String

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, fieldId, entityId])
  @@index([tenantId, entityType, entityId])
}
```

## In-Context UI

### הוספת שדה (Column Header "+")

```typescript
// Component: AddColumnButton
function AddColumnButton({ entityType }: { entityType: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <FieldTypeMenu
          onSelect={(type) => {
            // Open field creation form
            setFieldType(type);
            setShowFieldForm(true);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
```

### עריכת שדה (Column Header Click)

```typescript
// Component: ColumnHeader
function ColumnHeader({ field, onUpdate, onDelete, onHide }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-2">
          {field.name}
          <ChevronDown className="h-3 w-3 mr-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSort('asc')}>
          <ArrowUp className="h-4 w-4 ml-2" />
          מיין עולה
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('desc')}>
          <ArrowDown className="h-4 w-4 ml-2" />
          מיין יורד
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setEditMode(true)}>
          <Pencil className="h-4 w-4 ml-2" />
          ערוך עמודה
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHide}>
          <EyeOff className="h-4 w-4 ml-2" />
          הסתר עמודה
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash className="h-4 w-4 ml-2" />
          מחק עמודה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

# ו. Dynamic Views - תצוגות דינמיות

## Database Schema

```prisma
model ViewConfiguration {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String?  // null = shared view
  entityType  String

  // View info
  name        String
  viewType    String   @default("table") // table | kanban | calendar
  isDefault   Boolean  @default(false)
  isShared    Boolean  @default(false)

  // Configuration
  columns     Json     // [{ fieldKey, width, visible, order }]
  sortBy      String?
  sortOrder   String?  // asc | desc
  filters     Json?    // [{ fieldKey, operator, value }]
  groupBy     String?  // For kanban

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, entityType])
  @@index([userId, entityType])
}
```

## In-Context UI: View Bar

```typescript
// Component: ViewBar
function ViewBar({ entityType, currentView, onViewChange }: Props) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      {/* View Type Tabs */}
      <Tabs value={currentView.viewType} onValueChange={handleTypeChange}>
        <TabsList>
          <TabsTrigger value="table">
            <Table className="h-4 w-4 ml-1" />
            טבלה
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Kanban className="h-4 w-4 ml-1" />
            לוח
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 ml-1" />
            יומן
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator orientation="vertical" className="h-6" />

      {/* Saved Views Dropdown */}
      <ViewSelector
        views={savedViews}
        current={currentView}
        onSelect={onViewChange}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Filter Button */}
      <FilterBuilder
        filters={currentView.filters}
        onFiltersChange={updateFilters}
      />

      {/* Sort Button */}
      <SortSelector
        sortBy={currentView.sortBy}
        sortOrder={currentView.sortOrder}
        onSortChange={updateSort}
      />

      <div className="flex-1" />

      {/* Save View */}
      <SaveViewButton currentView={currentView} />
    </div>
  );
}
```

---

# ז. Dynamic Navigation - ניווט דינמי

## Database Schema

```prisma
model NavigationItem {
  id          String   @id @default(cuid())
  tenantId    String

  // Item info
  label       String
  icon        String?
  href        String?  // null for parent items
  entityType  String?  // For entity list pages

  // Hierarchy
  parentId    String?
  order       Int      @default(0)

  // Visibility
  isVisible   Boolean  @default(true)
  isSystem    Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent      NavigationItem? @relation("NavHierarchy", fields: [parentId], references: [id])
  children    NavigationItem[] @relation("NavHierarchy")

  @@index([tenantId, parentId])
}
```

## In-Context UI: Sidebar with Edit Mode

```typescript
// Component: DynamicSidebar
function DynamicSidebar() {
  const { data: navItems } = trpc.navigation.list.useQuery();
  const reorderMutation = trpc.navigation.reorder.useMutation();

  return (
    <aside className="w-64 border-l">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="nav">
          {(provided) => (
            <nav ref={provided.innerRef} {...provided.droppableProps}>
              {navItems?.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <NavItem
                      item={item}
                      provided={provided}
                      onContextMenu={handleContextMenu}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </nav>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Item Button */}
      <AddNavItemButton />
    </aside>
  );
}

// Right-click context menu
function NavItemContextMenu({ item, onEdit, onDelete, onHide }: Props) {
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => onEdit(item)}>
        <Pencil className="h-4 w-4 ml-2" />
        שנה שם
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setIconPicker(true)}>
        <Palette className="h-4 w-4 ml-2" />
        שנה אייקון
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => onHide(item)}>
        <EyeOff className="h-4 w-4 ml-2" />
        הסתר
      </ContextMenuItem>
      {!item.isSystem && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onDelete(item)} className="text-red-600">
            <Trash className="h-4 w-4 ml-2" />
            מחק
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );
}
```

---

# ח. Dynamic Entities - ישויות דינמיות

## Database Schema

```prisma
model EntityType {
  id          String   @id @default(cuid())
  tenantId    String

  // Entity info
  name        String   // "ספק משנה"
  namePlural  String   // "ספקי משנה"
  slug        String   // sub-contractors
  icon        String?
  color       String?
  description String?

  // Navigation
  showInNav   Boolean  @default(true)
  navParentId String?  // Group under existing category

  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@unique([tenantId, slug])
}

model GenericEntity {
  id           String   @id @default(cuid())
  tenantId     String
  entityTypeId String

  name         String
  data         Json     @default("{}")  // All field values

  isActive     Boolean  @default(true)
  createdById  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([tenantId, entityTypeId])
}
```

## In-Context UI: Create from Sidebar

```typescript
// Component: AddNavItemButton
function AddNavItemButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="h-4 w-4 ml-2" />
          הוסף
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Link className="h-4 w-4 ml-2" />
            הוסף קישור
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Folder className="h-4 w-4 ml-2" />
            הוסף קטגוריה
          </Button>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowEntityCreator(true)}
          >
            <Sparkles className="h-4 w-4 ml-2" />
            צור ישות חדשה
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

# ט. Dynamic Relations - קשרים דינמיים

## Database Schema

```prisma
model RelationDefinition {
  id                String   @id @default(cuid())
  tenantId          String

  name              String   // "ספקים קשורים"
  sourceEntityType  String   // project
  targetEntityType  String   // supplier
  relationType      String   // one_to_many | many_to_many
  isBidirectional   Boolean  @default(false)

  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())

  @@unique([tenantId, sourceEntityType, name])
}

model EntityRelation {
  id                String   @id @default(cuid())
  tenantId          String
  relationDefId     String

  sourceEntityType  String
  sourceEntityId    String
  targetEntityType  String
  targetEntityId    String

  order             Int      @default(0)
  createdAt         DateTime @default(now())

  @@unique([relationDefId, sourceEntityId, targetEntityId])
  @@index([tenantId, sourceEntityType, sourceEntityId])
}
```

## In-Context UI: Add Relation as Column

Relation נוסף בדיוק כמו Custom Field - מכפתור "+" בכותרת הטבלה.

---

# י. תוכנית יישום

## Phase G1: Custom Fields + Views (MVP)

**משך משוער:** 4-5 ימים

### משימות

| # | משימה | משך | In-Context UI |
|---|--------|-----|---------------|
| 1 | Prisma: `CustomFieldDefinition`, `CustomFieldValue`, `ViewConfiguration` | 1 שעה | - |
| 2 | Migration + Seed | 30 דק | - |
| 3 | tRPC: `customFields` router | 3 שעות | - |
| 4 | tRPC: `views` router | 2 שעות | - |
| 5 | UI: `AddColumnButton` ("+") | 2 שעות | ✅ |
| 6 | UI: `ColumnHeader` with menu | 3 שעות | ✅ |
| 7 | UI: Field Type Inputs | 4 שעות | ✅ |
| 8 | UI: `ViewBar` (tabs, filter, sort, save) | 4 שעות | ✅ |
| 9 | UI: `GenericDataTable` | 5 שעות | ✅ |
| 10 | Integration: החלפת טבלאות קיימות | 6 שעות | - |
| 11 | Testing | 4 שעות | - |

**תוצר:**
- משתמשים מוסיפים שדות מלחיצה על "+" בכותרת
- שומרים ומחליפים תצוגות מעל הטבלה

---

## Phase G2: Dynamic Navigation

**משך משוער:** 2-3 ימים

### משימות

| # | משימה | משך | In-Context UI |
|---|--------|-----|---------------|
| 1 | Prisma: `NavigationItem` | 30 דק | - |
| 2 | tRPC: `navigation` router | 2 שעות | - |
| 3 | UI: `DynamicSidebar` with drag | 4 שעות | ✅ |
| 4 | UI: Right-click context menu | 3 שעות | ✅ |
| 5 | UI: `AddNavItemButton` | 2 שעות | ✅ |
| 6 | Migration: NAV_ITEMS → DB | 2 שעות | - |
| 7 | Testing | 2 שעות | - |

**תוצר:** משתמשים גוררים ועורכים את ה-Sidebar ישירות

---

## Phase G3: Generic Entities

**משך משוער:** 3-4 ימים

### משימות

| # | משימה | משך | In-Context UI |
|---|--------|-----|---------------|
| 1 | Prisma: `EntityType`, `GenericEntity` | 1 שעה | - |
| 2 | tRPC: `entityTypes`, `genericEntities` | 4 שעות | - |
| 3 | UI: Entity Creator (from sidebar "+") | 3 שעות | ✅ |
| 4 | UI: Generic Entity Page | 4 שעות | ✅ |
| 5 | Integration: Custom Fields for new entities | 3 שעות | - |
| 6 | Integration: Add to navigation | 2 שעות | - |
| 7 | Testing | 3 שעות | - |

**תוצר:** משתמשים יוצרים ישויות חדשות מה-Sidebar

---

## Phase G4: Dynamic Relations

**משך משוער:** 2-3 ימים

### משימות

| # | משימה | משך | In-Context UI |
|---|--------|-----|---------------|
| 1 | Prisma: `RelationDefinition`, `EntityRelation` | 1 שעה | - |
| 2 | tRPC: `relations` router | 3 שעות | - |
| 3 | UI: Relation as column type | 3 שעות | ✅ |
| 4 | UI: Relation picker component | 3 שעות | ✅ |
| 5 | UI: Related panel in detail view | 3 שעות | ✅ |
| 6 | Testing | 2 שעות | - |

**תוצר:** משתמשים מוסיפים קשרים כעמודות בטבלה

---

## סיכום זמנים

| Phase | תיאור | משך | In-Context UI |
|-------|--------|-----|---------------|
| G1 | Custom Fields + Views | 4-5 ימים | מהטבלה |
| G2 | Dynamic Navigation | 2-3 ימים | מה-Sidebar |
| G3 | Generic Entities | 3-4 ימים | מה-Sidebar |
| G4 | Dynamic Relations | 2-3 ימים | מהטבלה |
| **סה"כ** | **מערכת גנרית מלאה** | **11-15 ימים** | **100%** |

---

# יא. סיכום

## מה משתנה עם הגישה החדשה

```
┌────────────────────────────────────────────────────────────────┐
│                    לפני (Settings-based)                       │
├────────────────────────────────────────────────────────────────┤
│  User → Settings → Fields → Select Entity → Add Field → Save   │
│  User → Settings → Views → Create View → Configure → Save      │
│  User → Settings → Menu → Add Item → Configure → Save          │
│                                                                │
│  😩 4-5 clicks, context switch, steep learning curve           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    אחרי (In-Context)                           │
├────────────────────────────────────────────────────────────────┤
│  User → Table → Click "+" → Select Type → Configure → Done     │
│  User → View Bar → Save View → Name → Done                     │
│  User → Sidebar → Drag / Right-click → Done                    │
│                                                                │
│  😊 1-2 clicks, stay in context, intuitive                     │
└────────────────────────────────────────────────────────────────┘
```

## עקרונות UI לפיתוח

1. **Inline Everything** - עריכה במקום, בלי modals מיותרים
2. **Contextual Menus** - לחיצה ימנית / hover לפעולות
3. **Drag & Drop** - לשינוי סדר בכל מקום
4. **Progressive Disclosure** - מראים מה צריך, מתי שצריך
5. **Immediate Feedback** - עדכון UI מיידי (Optimistic)

---

**נוצר ב:** 2026-01-18
**עודכן לאחרונה:** 2026-01-18
**גרסה:** 2.0 - In-Context Management
