# תוכנית השלמה - Phase 1-6 ל-100%

## תאריך: ינואר 2026
## על בסיס: phase-1-6-audit-report.md

---

# סיכום פערים

| קטגוריה | פער | עדיפות | תלויות |
|---------|-----|--------|--------|
| **תשתית** | ConfigurableEntity לא קיים | 🔴 קריטי | אין |
| **ישויות** | Supplier לא קיים | 🔴 קריטי | ConfigurableEntity |
| **ישויות** | Professional לא קיים | 🔴 קריטי | ConfigurableEntity |
| **אבטחה** | 2FA API חסר | 🟡 גבוה | אין |
| **UI** | Task Kanban View | 🟡 גבוה | אין |
| **UI** | Calendar Page | 🟡 גבוה | אין |
| **UI** | Document Grid + Thumbnails | 🟡 גבוה | אין |
| **API** | Meeting Recurrence | 🟡 גבוה | אין |
| **API** | Document Download/Preview | 🟢 בינוני | אין |
| **API** | Task Bulk Operations | 🟢 בינוני | אין |
| **API** | DELETE /team/:userId | 🟢 בינוני | אין |
| **ישויות** | ActivityLog model | 🟢 בינוני | אין |
| **ישויות** | CommunicationLog model | 🟢 בינוני | אין |
| **UI** | Project Hub (expandable panels) | 🟡 גבוה | אין |
| **UI** | Task Calendar View | 🟡 גבוה | Task Kanban |
| **UI** | Room CRUD Pages | 🟢 בינוני | אין |
| **UI** | MeetingForm - Attendees Selector | 🟢 בינוני | אין |
| **תשתית** | Document Upload - Supabase Storage | 🟡 גבוה | אין |

---

# הערה: מחוץ לסקופ (Phase 6 - Financial)
הפריטים הבאים מוזכרים בדוח אך שייכים ל-Phase 6 ולא נכללים בתוכנית זו:
- Proposal model (הצעת מחיר)
- Contract model (חוזה)
- Payment, Invoice, Expense models

---

# שלב 1: ConfigurableEntity (תשתית)

## מטרה
בניית מערכת לניהול סטטוסים, קטגוריות וסוגים דינמיים - התשתית שכל שאר הישויות תלויות בה.

## קובץ אפיון
`docs/specs/14-configuration.md` (סעיפים א-ב)
`docs/specs/00-shared-definitions.md` (ConfigurableEntityType)

## משימות

### 1.1 Schema (Prisma)
- [ ] הוסף model ConfigurableEntity ל-schema.prisma
- [ ] שדות: id, tenantId, entityType, name, nameEn, color, icon, isDefault, isSystem, isFinal, allowedTransitions, order, isActive, createdAt, updatedAt
- [ ] Index על tenantId + entityType
- [ ] Unique constraint על tenantId + entityType + name

### 1.2 API (tRPC)
- [ ] צור תיקייה `src/server/routers/config/`
- [ ] צור router עם:
  - `list` - רשימה לפי entityType
  - `getById` - ערך בודד
  - `create` - יצירה
  - `update` - עדכון
  - `delete` - מחיקה (רק אם לא isSystem)
  - `reorder` - שינוי סדר
  - `reset` - איפוס לברירת מחדל

### 1.3 Seed Data
- [ ] צור קובץ `prisma/seed-config.ts`
- [ ] הוסף ערכי ברירת מחדל:
  - project_type (7 ערכים)
  - project_status (4 ערכים)
  - project_phase (6 ערכים)
  - task_status (4 ערכים)
  - task_category (5 ערכים: design, procurement, construction, admin, client)
  - room_type (10 ערכים)
  - document_category (5 ערכים)

### 1.4 UI
- [ ] צור דף הגדרות: `src/app/settings/configuration/page.tsx`
- [ ] צור קומפוננטה: `ConfigurableEntityList.tsx`
  - Drag & Drop לשינוי סדר
  - Inline edit לשם וצבע
  - Color picker
  - Icon picker
  - Toggle active/inactive
  - Delete (עם confirmation)

## קבצים ליצור/לערוך
```
prisma/schema.prisma (edit - add model)
prisma/seed-config.ts (create)
src/server/routers/config/index.ts (create)
src/server/routers/config/schemas.ts (create)
src/server/routers/_app.ts (edit - add configRouter)
src/app/settings/configuration/page.tsx (create)
src/components/settings/ConfigurableEntityList.tsx (create)
src/components/settings/ColorPicker.tsx (create)
src/components/settings/IconPicker.tsx (create)
```

## תזכורת לפני שמתחילים
```
1. קרא את docs/specs/14-configuration.md (סעיפים א-ב)
2. קרא את docs/specs/00-shared-definitions.md (ConfigurableEntityType)
3. בדוק את schema.prisma הקיים
4. וודא שאין model בשם דומה
```

## תזכורת אחרי שמסיימים
```
1. npx prisma migrate dev --name add_configurable_entity
2. npx prisma generate
3. npm run typecheck
4. npm run lint
5. בדוק ש-seed עובד
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| ConfigurableEntity model | | |
| שדות: entityType, name, color, icon | | |
| שדות: isDefault, isSystem, isFinal | | |
| שדות: allowedTransitions, order | | |
| API: list by entityType | | |
| API: create, update, delete | | |
| API: reorder | | |
| API: reset to defaults | | |
| Seed: project_type | | |
| Seed: project_status | | |
| Seed: project_phase | | |
| Seed: task_status | | |
| Seed: task_category | | |
| Seed: room_type | | |
| Seed: document_category | | |
| UI: Settings page | | |
| UI: Drag & Drop reorder | | |
| UI: Color picker | | |
| UI: Delete protection for isSystem | | |

---

# שלב 2: עדכון ישויות קיימות לשימוש ב-ConfigurableEntity

## מטרה
לחבר את Project, Task, Room, Document לשדות הדינמיים שנוצרו בשלב 1.

## קובץ אפיון
`docs/specs/03-project-client.md`
`docs/specs/04-tasks-docs-meetings.md`

## משימות

### 2.1 עדכון Schema
- [ ] Project: שנה typeId, statusId, phaseId ל-relations ל-ConfigurableEntity
- [ ] Task: שנה statusId, categoryId ל-relations
- [ ] Room: שנה typeId ל-relation
- [ ] Document: שנה categoryId ל-relation

### 2.2 עדכון API
- [ ] Project router: וודא שה-select כולל את ה-ConfigurableEntity
- [ ] Task router: עדכן לכלול status ו-category מורחבים
- [ ] Room router: עדכן לכלול type מורחב
- [ ] Document router: עדכן לכלול category מורחב

### 2.3 עדכון UI
- [ ] ProjectForm: החלף text fields ב-select מתוך ConfigurableEntity
- [ ] TaskForm: החלף text fields ב-select
- [ ] RoomForm: החלף text fields ב-select
- [ ] DocumentForm: החלף text fields ב-select
- [ ] הוסף צבע ואייקון לתצוגות

## קבצים לערוך
```
prisma/schema.prisma (edit - add relations)
src/server/routers/project/index.ts (edit)
src/server/routers/task/index.ts (edit)
src/server/routers/room/index.ts (edit)
src/server/routers/document/index.ts (edit)
src/components/projects/ProjectForm.tsx (edit)
src/components/tasks/TaskForm.tsx (edit)
src/components/rooms/RoomForm.tsx (edit)
src/components/documents/DocumentForm.tsx (edit)
```

## תזכורת לפני שמתחילים
```
1. וודא ששלב 1 הושלם והעובד
2. קרא את ה-forms הקיימים
3. בדוק אילו fields משתמשים ב-typeId/statusId
```

## תזכורת אחרי שמסיימים
```
1. npx prisma migrate dev --name update_entity_relations
2. npm run typecheck
3. npm run lint
4. בדוק שכל הטפסים עובדים
5. בדוק שהתצוגות מציגות צבע ואייקון
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Project.typeId -> ConfigurableEntity | | |
| Project.statusId -> ConfigurableEntity | | |
| Project.phaseId -> ConfigurableEntity | | |
| Task.statusId -> ConfigurableEntity | | |
| Task.categoryId -> ConfigurableEntity | | |
| Room.typeId -> ConfigurableEntity | | |
| Document.categoryId -> ConfigurableEntity | | |
| UI: Dropdowns מציגים ערכים דינמיים | | |
| UI: צבעים ואייקונים מוצגים | | |

---

# שלב 3: Supplier (ספק)

## מטרה
בניית ישות Supplier מלאה - Schema, API, UI.

## קובץ אפיון
`docs/specs/03-project-client.md` (סעיף Supplier)

## משימות

### 3.1 Schema
- [ ] הוסף model Supplier ל-schema.prisma
- [ ] שדות לפי האפיון: id, tenantId, name, email, phone, address, city, website, contactPerson, categoryIds, notes, rating, isPreferred, paymentTerms, bankDetails, isActive, createdAt, updatedAt

### 3.2 API
- [ ] צור תיקייה `src/server/routers/supplier/`
- [ ] צור router עם:
  - `list` - רשימה עם פילטרים (category, isPreferred, search)
  - `getById` - ספק בודד עם products
  - `create` - יצירה
  - `update` - עדכון
  - `delete` - מחיקה (soft)
  - `search` - חיפוש מהיר
  - `getCategories` - קטגוריות ספקים מ-ConfigurableEntity

### 3.3 UI
- [ ] צור דף רשימה: `src/app/suppliers/page.tsx`
- [ ] צור דף פרטים: `src/app/suppliers/[id]/page.tsx`
- [ ] צור דף יצירה: `src/app/suppliers/new/page.tsx`
- [ ] צור דף עריכה: `src/app/suppliers/[id]/edit/page.tsx`
- [ ] צור קומפוננטות:
  - SupplierList.tsx
  - SupplierCard.tsx
  - SupplierForm.tsx
  - SupplierFilters.tsx

### 3.4 Seed
- [ ] הוסף supplier_category לברירות מחדל של ConfigurableEntity

## קבצים ליצור/לערוך
```
prisma/schema.prisma (edit - add Supplier model)
prisma/seed-config.ts (edit - add supplier_category)
src/server/routers/supplier/index.ts (create)
src/server/routers/supplier/schemas.ts (create)
src/server/routers/_app.ts (edit - add supplierRouter)
src/app/suppliers/page.tsx (create)
src/app/suppliers/[id]/page.tsx (create)
src/app/suppliers/new/page.tsx (create)
src/app/suppliers/[id]/edit/page.tsx (create)
src/components/suppliers/SupplierList.tsx (create)
src/components/suppliers/SupplierCard.tsx (create)
src/components/suppliers/SupplierForm.tsx (create)
src/components/suppliers/SupplierFilters.tsx (create)
```

## תזכורת לפני שמתחילים
```
1. קרא את docs/specs/03-project-client.md (סעיף Supplier)
2. קרא את docs/specs/00-shared-definitions.md
3. וודא ש-ConfigurableEntity עובד (שלב 1)
4. בדוק את מבנה Client כהשראה
```

## תזכורת אחרי שמסיימים
```
1. npx prisma migrate dev --name add_supplier
2. npx prisma generate
3. npm run typecheck
4. npm run lint
5. בדוק CRUD מלא דרך ה-UI
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Supplier model | | |
| שדות: name, email, phone, address | | |
| שדות: categoryIds, contactPerson | | |
| שדות: rating, isPreferred | | |
| שדות: paymentTerms, bankDetails | | |
| API: list with filters | | |
| API: getById with products | | |
| API: create, update, delete | | |
| API: search | | |
| UI: Suppliers list page | | |
| UI: Supplier details page | | |
| UI: Supplier create/edit forms | | |
| UI: Category filter | | |
| UI: Preferred badge | | |
| Navigation link בתפריט | | |

---

# שלב 4: Professional (בעל מקצוע)

## מטרה
בניית ישות Professional מלאה - Schema, API, UI.

## קובץ אפיון
`docs/specs/03-project-client.md` (סעיף Professional)

## משימות

### 4.1 Schema
- [ ] הוסף model Professional ל-schema.prisma
- [ ] שדות: id, tenantId, name, email, phone, mobile, address, city, tradeIds, specializations, companyName, licenseNumber, website, notes, rating, hourlyRate, isPreferred, paymentTerms, isActive, createdAt, updatedAt

### 4.2 API
- [ ] צור תיקייה `src/server/routers/professional/`
- [ ] צור router עם:
  - `list` - רשימה עם פילטרים (trade, isPreferred, search)
  - `getById` - בעל מקצוע בודד עם projects
  - `create` - יצירה
  - `update` - עדכון
  - `delete` - מחיקה (soft)
  - `search` - חיפוש מהיר
  - `getTrades` - מקצועות מ-ConfigurableEntity

### 4.3 UI
- [ ] צור דף רשימה: `src/app/professionals/page.tsx`
- [ ] צור דף פרטים: `src/app/professionals/[id]/page.tsx`
- [ ] צור דף יצירה: `src/app/professionals/new/page.tsx`
- [ ] צור דף עריכה: `src/app/professionals/[id]/edit/page.tsx`
- [ ] צור קומפוננטות:
  - ProfessionalList.tsx
  - ProfessionalCard.tsx
  - ProfessionalForm.tsx
  - ProfessionalFilters.tsx

### 4.4 Seed
- [ ] הוסף trade לברירות מחדל של ConfigurableEntity

### 4.5 קישור לפרויקט
- [ ] עדכן Project schema: generalContractorId -> Professional
- [ ] עדכן ProjectForm לבחירת קבלן ראשי

## קבצים ליצור/לערוך
```
prisma/schema.prisma (edit - add Professional, update Project)
prisma/seed-config.ts (edit - add trade)
src/server/routers/professional/index.ts (create)
src/server/routers/professional/schemas.ts (create)
src/server/routers/_app.ts (edit - add professionalRouter)
src/server/routers/project/index.ts (edit - include generalContractor)
src/app/professionals/page.tsx (create)
src/app/professionals/[id]/page.tsx (create)
src/app/professionals/new/page.tsx (create)
src/app/professionals/[id]/edit/page.tsx (create)
src/components/professionals/ProfessionalList.tsx (create)
src/components/professionals/ProfessionalCard.tsx (create)
src/components/professionals/ProfessionalForm.tsx (create)
src/components/professionals/ProfessionalFilters.tsx (create)
src/components/projects/ProjectForm.tsx (edit - add contractor select)
```

## תזכורת לפני שמתחילים
```
1. קרא את docs/specs/03-project-client.md (סעיף Professional)
2. וודא ש-ConfigurableEntity עובד
3. וודא ש-Supplier נבנה כהשראה
```

## תזכורת אחרי שמסיימים
```
1. npx prisma migrate dev --name add_professional
2. npm run typecheck
3. npm run lint
4. בדוק CRUD מלא דרך ה-UI
5. בדוק בחירת קבלן בפרויקט
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Professional model | | |
| שדות: name, email, phone, mobile | | |
| שדות: tradeIds, specializations | | |
| שדות: licenseNumber, hourlyRate | | |
| שדות: rating, isPreferred | | |
| API: list with filters | | |
| API: getById with projects | | |
| API: create, update, delete | | |
| UI: Professionals list page | | |
| UI: Professional details page | | |
| UI: Professional create/edit forms | | |
| UI: Trade filter | | |
| Project: generalContractor selection | | |
| Navigation link בתפריט | | |

---

# שלב 5: Contacts Page (מאוחד)

## מטרה
יצירת דף Contacts שמציג Clients, Suppliers, Professionals ביחד.

## קובץ אפיון
`docs/specs/03-project-client.md` (סעיף Contacts)

## משימות

### 5.1 UI
- [ ] צור דף: `src/app/contacts/page.tsx`
- [ ] צור קומפוננטות:
  - ContactsTabs.tsx (Clients / Suppliers / Professionals)
  - ContactsSearch.tsx (חיפוש מאוחד)
  - ContactCard.tsx (generic)
- [ ] הוסף לניווט הראשי

### 5.2 API
- [ ] צור endpoint משולב לחיפוש בכל סוגי אנשי הקשר

## קבצים ליצור/לערוך
```
src/app/contacts/page.tsx (create)
src/components/contacts/ContactsTabs.tsx (create)
src/components/contacts/ContactsSearch.tsx (create)
src/components/contacts/ContactCard.tsx (create)
src/server/routers/contacts/index.ts (create - optional unified search)
src/components/layout/Sidebar.tsx (edit - add Contacts link)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Contacts page | | |
| Tabs: Clients / Suppliers / Professionals | | |
| Unified search | | |
| Quick actions per contact type | | |
| Navigation link | | |

---

# שלב 5.5: Project Hub UI

## מטרה
יצירת דף Project Hub עם Expandable Panels - דף מרכזי לכל מידע הפרויקט.

## קובץ אפיון
`docs/specs/03-project-client.md` (Project Hub section)

## משימות

### 5.5.1 UI
- [ ] צור דף: `src/app/projects/[id]/hub/page.tsx`
- [ ] צור קומפוננטות:
  - ProjectHubLayout.tsx (main container)
  - ExpandablePanel.tsx (reusable collapsible panel)
  - ProjectSummaryPanel.tsx (מידע כללי)
  - ProjectTasksPanel.tsx (משימות הפרויקט)
  - ProjectDocumentsPanel.tsx (מסמכים)
  - ProjectMeetingsPanel.tsx (פגישות)
  - ProjectRoomsPanel.tsx (חדרים)
  - ProjectTimelinePanel.tsx (Timeline)
- [ ] הוסף navigation מדף הפרויקט ל-Hub
- [ ] State management עבור פאנלים פתוחים/סגורים (localStorage)

## קבצים ליצור/לערוך
```
src/app/projects/[id]/hub/page.tsx (create)
src/components/projects/hub/ProjectHubLayout.tsx (create)
src/components/projects/hub/ExpandablePanel.tsx (create)
src/components/projects/hub/ProjectSummaryPanel.tsx (create)
src/components/projects/hub/ProjectTasksPanel.tsx (create)
src/components/projects/hub/ProjectDocumentsPanel.tsx (create)
src/components/projects/hub/ProjectMeetingsPanel.tsx (create)
src/components/projects/hub/ProjectRoomsPanel.tsx (create)
src/components/projects/hub/ProjectTimelinePanel.tsx (create)
src/app/projects/[id]/page.tsx (edit - add Hub link)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Project Hub page | | |
| Expandable panels | | |
| Summary panel | | |
| Tasks panel | | |
| Documents panel | | |
| Meetings panel | | |
| Rooms panel | | |
| Timeline panel | | |
| Panel state persistence | | |
| Navigation from project page | | |

---

# שלב 6: 2FA API

## מטרה
השלמת API ל-Two Factor Authentication (Schema קיים).

## קובץ אפיון
`docs/specs/02-auth-tenant-user.md` (סעיף 2FA)

## משימות

### 6.1 API
- [ ] צור תיקייה `src/server/routers/twoFactor/`
- [ ] צור router עם:
  - `setup` - התחלת הגדרת 2FA, החזרת QR code
  - `verify` - אימות קוד והפעלה
  - `disable` - ביטול 2FA
  - `generateBackupCodes` - יצירת קודי גיבוי
  - `verifyBackupCode` - שימוש בקוד גיבוי

### 6.2 Dependencies
- [ ] התקן `otplib` או `speakeasy` ל-TOTP

### 6.3 UI
- [ ] צור דף הגדרות: `src/app/settings/security/page.tsx`
- [ ] צור קומפוננטות:
  - TwoFactorSetup.tsx (QR code display)
  - TwoFactorVerify.tsx (code input)
  - BackupCodes.tsx (display & download)
- [ ] הוסף Tab בהגדרות

## קבצים ליצור/לערוך
```
package.json (add otplib)
src/server/routers/twoFactor/index.ts (create)
src/server/routers/twoFactor/schemas.ts (create)
src/server/routers/_app.ts (edit - add twoFactorRouter)
src/app/settings/security/page.tsx (create)
src/components/settings/TwoFactorSetup.tsx (create)
src/components/settings/TwoFactorVerify.tsx (create)
src/components/settings/BackupCodes.tsx (create)
```

## תזכורת לפני שמתחילים
```
1. קרא את docs/specs/02-auth-tenant-user.md (2FA section)
2. בדוק את TwoFactorSetup model ב-schema.prisma
3. בדוק ספריות TOTP ב-npm
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| API: setup (QR generation) | | |
| API: verify (TOTP validation) | | |
| API: disable | | |
| API: generateBackupCodes | | |
| API: verifyBackupCode | | |
| UI: Security settings page | | |
| UI: QR code display | | |
| UI: Code verification input | | |
| UI: Backup codes display | | |

---

# שלב 7: Task Kanban View + Calendar View

## מטרה
הוספת תצוגות נוספות למשימות: Kanban ו-Calendar.

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Task UI)

## משימות

### 7.1 Dependencies
- [ ] התקן `@dnd-kit/core` ו-`@dnd-kit/sortable`

### 7.2 API
- [ ] הוסף endpoint: `task.updateStatus` - עדכון סטטוס בלבד
- [ ] הוסף endpoint: `task.bulkUpdateStatus` - עדכון מרובה

### 7.3 UI - Kanban
- [ ] צור קומפוננטות:
  - TaskKanbanBoard.tsx (main container)
  - KanbanColumn.tsx (עמודה לכל סטטוס)
  - KanbanCard.tsx (כרטיס משימה)
- [ ] Drag & Drop בין עמודות

### 7.4 UI - Calendar View
- [ ] צור קומפוננטות:
  - TaskCalendarView.tsx (main container)
  - TaskCalendarEvent.tsx (event card for task)
- [ ] הצג משימות לפי dueDate
- [ ] לחיצה על תאריך ריק -> יצירת משימה חדשה עם dueDate
- [ ] Drag & Drop לשינוי dueDate

### 7.5 View Toggle
- [ ] הוסף toggle בדף Tasks: List / Kanban / Calendar
- [ ] שמירת preference ב-localStorage

## קבצים ליצור/לערוך
```
package.json (add @dnd-kit/core, @dnd-kit/sortable)
src/server/routers/task/index.ts (edit - add updateStatus, bulkUpdateStatus)
src/components/tasks/TaskKanbanBoard.tsx (create)
src/components/tasks/KanbanColumn.tsx (create)
src/components/tasks/KanbanCard.tsx (create)
src/components/tasks/TaskCalendarView.tsx (create)
src/components/tasks/TaskCalendarEvent.tsx (create)
src/app/tasks/page.tsx (edit - add view toggle)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Kanban board component | | |
| עמודה לכל סטטוס | | |
| Drag & Drop בין עמודות (Kanban) | | |
| עדכון סטטוס בשרת | | |
| Task Calendar View | | |
| משימות מוצגות לפי dueDate | | |
| Drag & Drop לשינוי dueDate | | |
| View toggle (List/Kanban/Calendar) | | |
| Optimistic UI | | |

---

# שלב 8: Calendar Page

## מטרה
יצירת דף לוח שנה ייעודי עם תצוגות Month/Week/Day.

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Meeting UI)

## משימות

### 8.1 Dependencies
- [ ] התקן ספריית calendar (react-big-calendar או FullCalendar)

### 8.2 API
- [ ] הוסף endpoint: `meeting.week` - פגישות לשבוע
- [ ] וודא ש-`meeting.calendar` מחזיר את כל השדות הנדרשים

### 8.3 UI
- [ ] צור דף: `src/app/calendar/page.tsx`
- [ ] צור קומפוננטות:
  - CalendarView.tsx (main)
  - CalendarHeader.tsx (navigation + view toggle)
  - CalendarEvent.tsx (event card)
- [ ] תצוגות: Month, Week, Day, Agenda
- [ ] צבעים לפי meetingType

## קבצים ליצור/לערוך
```
package.json (add calendar library)
src/server/routers/meeting/index.ts (edit - add week endpoint)
src/app/calendar/page.tsx (create)
src/components/calendar/CalendarView.tsx (create)
src/components/calendar/CalendarHeader.tsx (create)
src/components/calendar/CalendarEvent.tsx (create)
src/components/layout/Sidebar.tsx (edit - add Calendar link)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Calendar page | | |
| Month view | | |
| Week view | | |
| Day view | | |
| Agenda view | | |
| Color by meeting type | | |
| Click to create meeting | | |
| Navigation (today, prev, next) | | |

---

# שלב 9: Document Grid View + Thumbnails

## מטרה
הוספת תצוגת Grid עם thumbnails למסמכים.

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Document UI)

## משימות

### 9.1 API
- [ ] הוסף endpoint: `document.getThumbnail` - יצירת/קבלת thumbnail
- [ ] הוסף endpoint: `document.getDownloadUrl` - presigned URL להורדה
- [ ] הוסף endpoint: `document.getPreviewUrl` - presigned URL לתצוגה

### 9.2 Backend
- [ ] צור utility ליצירת thumbnails (sharp או imagemagick)
- [ ] הוסף שדה thumbnailUrl ל-Document model אם חסר

### 9.3 UI
- [ ] צור קומפוננטות:
  - DocumentGrid.tsx (grid layout)
  - DocumentThumbnail.tsx (thumbnail card)
  - DocumentPreviewModal.tsx (preview popup)
- [ ] הוסף toggle: List / Grid בדף Documents
- [ ] Drag & Drop להעלאה

## קבצים ליצור/לערוך
```
prisma/schema.prisma (edit - add thumbnailUrl if missing)
src/server/routers/document/index.ts (edit - add thumbnail, download, preview endpoints)
src/lib/thumbnails.ts (create)
src/components/documents/DocumentGrid.tsx (create)
src/components/documents/DocumentThumbnail.tsx (create)
src/components/documents/DocumentPreviewModal.tsx (create)
src/app/documents/page.tsx (edit - add view toggle)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Grid view component | | |
| Thumbnail generation | | |
| Thumbnail display | | |
| Preview modal | | |
| Download with presigned URL | | |
| View toggle (List/Grid) | | |
| Drag & Drop upload | | |

---

# שלב 10: Meeting Recurrence API

## מטרה
השלמת API לפגישות חוזרות.

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Meeting API - Recurrence)

## משימות

### 10.1 API
- [ ] הוסף endpoint: `meeting.createRecurring` - יצירת סדרת פגישות
- [ ] הוסף endpoint: `meeting.updateRecurrence` - עדכון תבנית חזרה
- [ ] הוסף endpoint: `meeting.deleteRecurrence` - מחיקת כל הסדרה
- [ ] הוסף endpoint: `meeting.deleteFutureOccurrences` - מחיקת פגישות עתידיות

### 10.2 Logic
- [ ] צור utility לחישוב תאריכי פגישות חוזרות
- [ ] תמיכה ב: daily, weekly, biweekly, monthly
- [ ] תמיכה בתאריך סיום או מספר חזרות

### 10.3 UI
- [ ] עדכן MeetingForm להוספת Recurrence options
- [ ] צור RecurrenceSelector.tsx

## קבצים ליצור/לערוך
```
src/server/routers/meeting/index.ts (edit - add recurrence endpoints)
src/server/routers/meeting/recurrence.ts (create - helper functions)
src/components/meetings/MeetingForm.tsx (edit - add recurrence)
src/components/meetings/RecurrenceSelector.tsx (create)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| API: createRecurring | | |
| API: updateRecurrence | | |
| API: deleteRecurrence | | |
| API: deleteFutureOccurrences | | |
| Recurrence patterns (daily, weekly, etc.) | | |
| UI: Recurrence selector | | |
| End date / count support | | |

---

# שלב 11: השלמת API חסרים (בינוני)

## מטרה
השלמת endpoints וישויות חסרים שנמצאו בביקורת.

## משימות

### 11.0 ActivityLog + CommunicationLog Models
- [ ] הוסף model ActivityLog ל-schema.prisma
  - שדות: id, tenantId, entityType, entityId, action, userId, metadata, createdAt
- [ ] הוסף model CommunicationLog ל-schema.prisma
  - שדות: id, tenantId, clientId, type, direction, subject, content, userId, createdAt
- [ ] צור API: `activityLog.list` - רשימת פעילויות לישות
- [ ] צור API: `activityLog.create` - יצירת רשומה (internal)
- [ ] צור API: `communicationLog.list` - היסטוריית תקשורת ללקוח
- [ ] צור API: `communicationLog.create` - הוספת רשומה

### 11.1 Team API
- [ ] הוסף endpoint: `team.delete` - מחיקת משתמש מהצוות (hard delete)

### 11.2 Task APIs
- [ ] `task.bulkCreate` - יצירה מרובה
- [ ] `task.bulkDelete` - מחיקה מרובה
- [ ] `task.addReminder` - הוספת תזכורת
- [ ] `task.removeReminder` - הסרת תזכורת

### 11.3 Document APIs
- [ ] `document.bulkDelete` - מחיקה מרובה
- [ ] `document.bulkDownload` - הורדה מרובה כ-ZIP
- [ ] `document.createShareLink` - יצירת קישור שיתוף

### 11.4 Meeting APIs
- [ ] `meeting.addFollowUpTask` - יצירת משימה מפגישה
- [ ] `meeting.sendInvite` - שליחת הזמנה

### 11.5 Project APIs
- [ ] `project.getActivity` - יומן פעילות (משתמש ב-ActivityLog)
- [ ] `project.getTimeline` - timeline ויזואלי

### 11.6 Client APIs
- [ ] `client.getCommunications` - היסטוריית תקשורת (משתמש ב-CommunicationLog)

## קבצים לערוך
```
prisma/schema.prisma (edit - add ActivityLog, CommunicationLog)
src/server/routers/activityLog/index.ts (create)
src/server/routers/communicationLog/index.ts (create)
src/server/routers/team/index.ts (edit - add delete)
src/server/routers/task/index.ts
src/server/routers/document/index.ts
src/server/routers/meeting/index.ts
src/server/routers/project/index.ts
src/server/routers/client/index.ts
src/server/routers/_app.ts (edit - add new routers)
```

## קריטריונים להצלחה

| Endpoint | נבנה? | עובד? |
|----------|-------|-------|
| ActivityLog model | | |
| CommunicationLog model | | |
| activityLog.list | | |
| activityLog.create | | |
| communicationLog.list | | |
| communicationLog.create | | |
| team.delete | | |
| task.bulkCreate | | |
| task.bulkDelete | | |
| task.addReminder | | |
| task.removeReminder | | |
| document.bulkDelete | | |
| document.bulkDownload | | |
| document.createShareLink | | |
| meeting.addFollowUpTask | | |
| meeting.sendInvite | | |
| project.getActivity | | |
| project.getTimeline | | |
| client.getCommunications | | |

---

# שלב 11.5: Room CRUD Pages

## מטרה
יצירת דפים עצמאיים לניהול חדרים (לא רק כ-panel ב-Project Hub).

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Room section)

## משימות

### 11.5.1 UI
- [ ] צור דף רשימה: `src/app/projects/[id]/rooms/page.tsx`
- [ ] צור דף יצירה: `src/app/projects/[id]/rooms/new/page.tsx`
- [ ] צור דף עריכה: `src/app/projects/[id]/rooms/[roomId]/edit/page.tsx`
- [ ] צור דף פרטים: `src/app/projects/[id]/rooms/[roomId]/page.tsx`
- [ ] צור קומפוננטות:
  - RoomList.tsx (grid of rooms with thumbnails)
  - RoomCard.tsx (room card with status badge)
  - RoomForm.tsx (create/edit form)
  - RoomDetails.tsx (room details view)

### 11.5.2 Navigation
- [ ] הוסף tab "חדרים" בדף פרויקט
- [ ] הוסף breadcrumbs

## קבצים ליצור/לערוך
```
src/app/projects/[id]/rooms/page.tsx (create)
src/app/projects/[id]/rooms/new/page.tsx (create)
src/app/projects/[id]/rooms/[roomId]/page.tsx (create)
src/app/projects/[id]/rooms/[roomId]/edit/page.tsx (create)
src/components/rooms/RoomList.tsx (create or edit)
src/components/rooms/RoomCard.tsx (create)
src/components/rooms/RoomDetails.tsx (create)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Rooms list page | | |
| Room create page | | |
| Room edit page | | |
| Room details page | | |
| Room card component | | |
| Navigation from project | | |

---

# שלב 11.6: Meeting Form - Attendees Selector

## מטרה
וידוא שטופס יצירת פגישה כולל בחירת משתתפים (צוות + חיצוניים).

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Meeting section)

## משימות

### 11.6.1 UI
- [ ] בדוק/הוסף: UserSelect component לבחירת משתתפים מהצוות
- [ ] בדוק/הוסף: ExternalAttendeesInput לתיאום עם אנשי קשר חיצוניים
- [ ] הוסף validation: לפחות משתתף אחד (פנימי או חיצוני)

### 11.6.2 Supabase/API
- [ ] וודא שה-API שומר attendeeUserIds ו-externalAttendees

## קבצים ליצור/לערוך
```
src/components/meetings/MeetingForm.tsx (edit)
src/components/meetings/UserSelect.tsx (create if missing)
src/components/meetings/ExternalAttendeesInput.tsx (create if missing)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Team members selector | | |
| External attendees input | | |
| Attendees displayed in meeting details | | |
| Attendees saved to database | | |

---

# שלב 11.7: Document Upload - Supabase Storage

## מטרה
אינטגרציה מלאה עם Supabase Storage להעלאת מסמכים.

## קובץ אפיון
`docs/specs/04-tasks-docs-meetings.md` (Document section)
`docs/specs/15-technical.md` (Storage section)

## משימות

### 11.7.1 Supabase Setup
- [ ] צור bucket: `documents` ב-Supabase Storage
- [ ] הגדר policies: tenant-based access
- [ ] הגדר file size limits

### 11.7.2 Backend
- [ ] צור utility: `src/lib/storage.ts`
  - `uploadFile(file, path)` - העלאה
  - `getSignedUrl(path)` - URL זמני להורדה
  - `getPublicUrl(path)` - URL ציבורי (אם נדרש)
  - `deleteFile(path)` - מחיקה
- [ ] עדכן Document router לשימוש ב-storage utility

### 11.7.3 Frontend
- [ ] צור FileUpload component עם:
  - Progress bar
  - Drag & Drop zone
  - File type validation
  - Size validation
- [ ] עדכן DocumentForm להשתמש ב-FileUpload

### 11.7.4 Thumbnails (Integration with Step 9)
- [ ] יצירת thumbnails לתמונות
- [ ] שמירת thumbnail ב-Supabase Storage

## קבצים ליצור/לערוך
```
src/lib/storage.ts (create)
src/lib/supabase.ts (edit - add storage client)
src/components/documents/FileUpload.tsx (create)
src/components/documents/DocumentForm.tsx (edit)
src/server/routers/document/index.ts (edit - integrate storage)
```

## קריטריונים להצלחה

| פריט מהאפיון | נבנה? | עובד? |
|--------------|-------|-------|
| Supabase bucket configured | | |
| Upload to Supabase works | | |
| Signed URLs for download | | |
| Delete from storage | | |
| File size validation | | |
| File type validation | | |
| Progress bar during upload | | |
| Drag & Drop upload | | |

---

# שלב 12: UI משלימים (נמוך)

## מטרה
השלמת פיצ'רי UI קטנים.

## משימות

### 12.1 Task UI
- [ ] Inline edit בטבלת משימות
- [ ] Group By (project, status, assignee, due date)

### 12.2 Document UI
- [ ] Multi-file upload עם progress bar
- [ ] Drag & Drop zone

### 12.3 General
- [ ] Empty states מעוצבים לכל דף
- [ ] Loading skeletons

## קריטריונים להצלחה

| פריט | נבנה? | עובד? |
|------|-------|-------|
| Task inline edit | | |
| Task group by | | |
| Multi-file upload | | |
| Upload progress | | |
| Drag & Drop zone | | |
| Empty states | | |
| Loading skeletons | | |

---

# סיכום כללי

## סדר ביצוע מומלץ

```
שלב 1: ConfigurableEntity (תשתית) ← קריטי, בסיס לכל
    ↓
שלב 2: עדכון ישויות קיימות
    ↓
שלב 3: Supplier ← תלוי בשלב 1
    ↓
שלב 4: Professional ← תלוי בשלב 1
    ↓
שלב 5: Contacts Page ← תלוי בשלבים 3-4
    ↓
שלב 5.5: Project Hub UI ← עצמאי (גבוה)
    ↓
שלב 6: 2FA API ← עצמאי
    ↓
שלב 7: Task Kanban + Calendar View ← עצמאי
    ↓
שלב 8: Calendar Page ← עצמאי
    ↓
שלב 9: Document Grid ← תלוי בשלב 11.7
    ↓
שלב 10: Meeting Recurrence ← עצמאי
    ↓
שלב 11: APIs חסרים (ActivityLog, CommunicationLog)
    ↓
שלב 11.5: Room CRUD Pages ← עצמאי
    ↓
שלב 11.6: Meeting Attendees Selector ← עצמאי
    ↓
שלב 11.7: Supabase Storage Integration ← קריטי לשלב 9
    ↓
שלב 12: UI משלימים
```

## טבלת מעקב

| שלב | תיאור | סטטוס | הערות |
|-----|-------|-------|-------|
| 1 | ConfigurableEntity | ⬜ לא התחיל | קריטי |
| 2 | עדכון ישויות | ⬜ לא התחיל | תלוי בשלב 1 |
| 3 | Supplier | ⬜ לא התחיל | תלוי בשלב 1 |
| 4 | Professional | ⬜ לא התחיל | תלוי בשלב 1 |
| 5 | Contacts Page | ⬜ לא התחיל | תלוי בשלבים 3-4 |
| 5.5 | Project Hub UI | ⬜ לא התחיל | |
| 6 | 2FA API | ⬜ לא התחיל | |
| 7 | Task Kanban + Calendar View | ⬜ לא התחיל | |
| 8 | Calendar Page | ⬜ לא התחיל | |
| 9 | Document Grid | ⬜ לא התחיל | תלוי בשלב 11.7 |
| 10 | Meeting Recurrence | ⬜ לא התחיל | |
| 11 | APIs חסרים + ActivityLog/CommunicationLog | ⬜ לא התחיל | |
| 11.5 | Room CRUD Pages | ⬜ לא התחיל | |
| 11.6 | Meeting Attendees Selector | ⬜ לא התחיל | |
| 11.7 | Supabase Storage Integration | ⬜ לא התחיל | קריטי לשלב 9 |
| 12 | UI משלימים | ⬜ לא התחיל | |

---

## הערות חשובות

1. **תלויות:** שלבים 1-2 הם תשתית - חייבים להסתיים לפני 3-5
2. **מקביליות:** שלבים 5.5, 6-10 עצמאיים ויכולים לרוץ במקביל
3. **בדיקות:** אחרי כל שלב - typecheck, lint, ובדיקה ידנית
4. **Migration:** כל שינוי ב-schema דורש migration
5. **Seed:** לא לשכוח לעדכן seed data
6. **ActivityLog/CommunicationLog:** נדרשים בשלב 11 לפני project.getActivity ו-client.getCommunications
7. **Supabase Storage:** שלב 11.7 קריטי - יש לבצע לפני שלב 9 (Document Grid) כי thumbnails דורשים storage
8. **Room UI:** חדרים הם חלק מפרויקט, אבל צריכים גם דפים עצמאיים לניהול מלא
9. **Meeting Attendees:** לוודא שהטופס תומך בבחירת משתתפים מהצוות + חיצוניים

---

## מחוץ לסקופ (Phase 6 - Financial)
הפריטים הבאים מוזכרים בדוח אך שייכים ל-Phase 6:
- Proposal model (שורה 292 בדוח)
- Contract model (שורה 294 בדוח)
- Payment, Invoice, Expense models

---

**נוצר:** ינואר 2026
**עודכן:** ינואר 2026 (בדיקה מקיפה שורה-שורה)
**מבוסס על:** phase-1-6-audit-report.md (כל 978 השורות)

## סיכום פערים שנוספו בבדיקה האחרונה:
1. ✅ Room CRUD Pages (שלב 11.5)
2. ✅ Meeting Attendees Selector (שלב 11.6)
3. ✅ Supabase Storage Integration (שלב 11.7)
4. ✅ הערה על Proposal/Contract - מחוץ לסקופ
