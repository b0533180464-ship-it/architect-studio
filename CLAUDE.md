# Architect Studio

מערכת SaaS לניהול משרדי אדריכלות ועיצוב פנים.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript strict
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 עם Magic Link + Google OAuth
- **API:** tRPC + TanStack Query
- **UI:** Tailwind + shadcn/ui
- **State:** Zustand
- **Realtime:** Supabase Realtime
- **Storage:** Supabase Storage
- **Hosting:** Vercel

## מבנה התיקיות

```
architect-studio/
├── docs/
│   ├── specs/                    # האפיון מפוצל ל-16 קבצים
│   │   ├── 00-shared-definitions.md
│   │   ├── 01-foundation.md
│   │   ├── 02-auth-tenant-user.md
│   │   ├── 03-project-client.md
│   │   ├── 04-tasks-docs-meetings.md
│   │   ├── 05-products-ffe.md
│   │   ├── 06-financial.md
│   │   ├── 07-collaboration.md
│   │   ├── 08-client-portal.md
│   │   ├── 09-automations.md
│   │   ├── 10-integrations.md
│   │   ├── 11-reports-templates.md
│   │   ├── 12-communication.md
│   │   ├── 13-files-billing.md
│   │   ├── 14-configuration.md
│   │   └── 15-technical.md
│   ├── CURRENT-CONTEXT.md        # מה אנחנו עושים עכשיו
│   ├── IMPLEMENTATION-STATUS.md  # סטטוס כל הישויות
│   └── architect-studio-spec.md  # המסמך המקורי (reference)
├── src/
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   ├── lib/                      # Utilities & helpers
│   ├── server/                   # tRPC routers
│   └── types/                    # TypeScript types
├── prisma/
│   └── schema.prisma             # Database schema
└── ...
```

---

## חובה בתחילת כל פרומפט

```
1. ✅ קרא CLAUDE.md
2. ✅ קרא CURRENT-CONTEXT.md
3. ✅ קרא את קובץ ה-spec הרלוונטי מ-docs/specs/
4. ✅ קרא תמיד את docs/specs/00-shared-definitions.md (Enums וטיפוסים משותפים)
```

---

## חובה בסוף כל ישות

אחרי בניית כל ישות, חייב להציג **טבלת השוואה מול האפיון**:

### 1. טבלת שדות
```markdown
| שדה | ב-Spec | Schema | API | UI |
|-----|--------|--------|-----|-----|
| id | ✅ | ✅ | ✅ | - |
| name | ✅ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... |
```

### 2. טבלת API Endpoints
```markdown
| Endpoint | ב-Spec | נבנה |
|----------|--------|------|
| GET /items | ✅ | ✅ |
| POST /items | ✅ | ✅ |
| ... | ... | ... |
```

### 3. טבלת מסכי UI
```markdown
| מסך | ב-Spec | נבנה |
|-----|--------|------|
| רשימה | ✅ | ✅ |
| טופס יצירה | ✅ | ✅ |
| ... | ... | ... |
```

### 4. סיכום
```markdown
✅ [Entity] Complete

Schema: X/Y שדות (Z%)
API:    X/Y endpoints (Z%)
UI:     X/Y מסכים (Z%)

חסר (אם יש):
- [ ] פיצ'ר X - יבנה ב-Phase Y
- [ ] פיצ'ר Z - לא נדרש ל-MVP
```

---

## חובה בסוף כל Phase

### 1. טבלת סיכום
```markdown
| ישות | Schema | API | UI | סטטוס |
|------|--------|-----|-----|-------|
| Client | 100% | 100% | 100% | ✅ |
| Project | 100% | 100% | 100% | ✅ |
```

### 2. עדכון קבצים
- [ ] עדכן `IMPLEMENTATION-STATUS.md` - סמן ישויות שהושלמו
- [ ] עדכן `CURRENT-CONTEXT.md` - מה נעשה ומה הבא

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations
npx prisma generate  # Generate Prisma client
```

---

## Architecture Rules

### Multi-Tenant (CRITICAL!)
```typescript
// ✅ נכון - tenantId תמיד ראשון
const tasks = await prisma.task.findMany({
  where: { tenantId, projectId }
});

// ❌ שגוי - חסר tenantId
const tasks = await prisma.task.findMany({
  where: { projectId }
});
```
- Every database query MUST include `tenantId` as the FIRST condition
- Never trust client-sent tenantId - always get from session
- Use Prisma middleware to enforce this

### Optimistic UI
```typescript
// עדכון UI מיידי, שליחה לשרת, rollback בכישלון
const updateTask = async (taskId: string, data: Partial<Task>) => {
  // 1. שמור את המצב הקודם
  const previousData = tasks.find(t => t.id === taskId);

  // 2. עדכן UI מיידית
  setTasks(tasks.map(t => t.id === taskId ? {...t, ...data} : t));

  // 3. שלח לשרת
  try {
    await api.tasks.update.mutate({ id: taskId, ...data });
  } catch (error) {
    // 4. Rollback בכישלון
    setTasks(tasks.map(t => t.id === taskId ? previousData : t));
    toast.error('העדכון נכשל');
  }
};
```
- Update UI immediately, send to server, rollback on error
- No loading spinners for quick actions

### Hebrew & RTL
- All UI text: Hebrew (עברית)
- All code/variables: English
- Use `dir="rtl"` on root elements
- Tailwind: use `rtl:` prefix when needed

---

## Code Quality

- Files and functions should be small and focused
- If a file grows too large, split it into smaller modules
- Maximum ~300 lines per file
- One component per file
- Use barrel exports (index.ts)

---

## Reference Files

| קובץ | תוכן |
|------|------|
| `docs/specs/00-shared-definitions.md` | כל ה-Enums והטיפוסים |
| `docs/specs/01-foundation.md` | עקרונות יסוד |
| `docs/specs/02-auth-tenant-user.md` | Authentication ומשתמשים |
| `docs/specs/03-project-client.md` | פרויקטים ולקוחות |
| `docs/specs/04-tasks-docs-meetings.md` | משימות, מסמכים, פגישות |
| `docs/specs/05-products-ffe.md` | מוצרים ו-FF&E |
| `docs/specs/06-financial.md` | הצעות, חוזים, תשלומים |
| `docs/specs/07-collaboration.md` | תגובות, התראות |
| `docs/specs/08-client-portal.md` | פורטל לקוח |
| `docs/CURRENT-CONTEXT.md` | מה עושים עכשיו |
| `docs/IMPLEMENTATION-STATUS.md` | סטטוס כל הישויות |
