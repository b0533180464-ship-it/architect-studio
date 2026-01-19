# תוכנית בנייה - Architect Studio
## גרסה 1.0 | ינואר 2026

---

# 🎯 עקרונות בנייה

## קוד נקי
- **מקסימום 100 שורות לקובץ**
- **מקסימום 20 שורות לפונקציה**
- **מקסימום 100 תווים לשורה**
- **אין כפילויות** - DRY (Don't Repeat Yourself)
- **Single Responsibility** - כל קובץ עושה דבר אחד

## מבנה תיקיות
```
/src
├── /app                    # Next.js App Router
│   ├── /(auth)            # דפי התחברות
│   ├── /(dashboard)       # דפים מוגנים
│   │   ├── /projects
│   │   ├── /clients
│   │   ├── /calendar
│   │   └── /settings
│   └── /api               # API Routes
│
├── /components
│   ├── /ui                # רכיבי בסיס (shadcn)
│   ├── /shared            # רכיבים משותפים
│   └── /features          # רכיבים לפי פיצ'ר
│
├── /lib
│   ├── /api               # API client
│   ├── /hooks             # Custom hooks
│   ├── /utils             # פונקציות עזר
│   └── /validators        # Zod schemas
│
├── /server
│   ├── /db                # Database (Prisma)
│   ├── /services          # Business logic
│   └── /trpc              # tRPC routers
│
├── /types                 # TypeScript types
└── /config               # קבועים והגדרות
```

---

# 📦 חלוקה ל-13 מודולים

## Module 1: Core Foundation
**קבצים:** ~15
**ישויות:** Tenant, User
**כולל:**
- Prisma schema base
- Auth (NextAuth)
- Middleware
- Base layouts

## Module 2: Projects
**קבצים:** ~20
**ישויות:** Project, Room
**כולל:**
- Project CRUD
- Room management
- Project Hub UI

## Module 3: Contacts
**קבצים:** ~15
**ישויות:** Client, Supplier, Professional
**כולל:**
- Contact CRUD
- Contact lists
- Contact details

## Module 4: Tasks
**קבצים:** ~15
**ישויות:** Task
**כולל:**
- Task CRUD
- Task lists (Kanban, List, Calendar)
- Checklist support

## Module 5: Documents & Files
**קבצים:** ~15
**ישויות:** Document, File, Folder
**כולל:**
- File upload (S3)
- Document viewer
- Folder structure

## Module 6: Products & FF&E
**קבצים:** ~20
**ישויות:** Product, RoomProduct
**כולל:**
- Product library
- FF&E schedule
- Product in room

## Module 7: Procurement
**קבצים:** ~15
**ישויות:** PurchaseOrder, DeliveryTracking
**כולל:**
- PO creation
- Delivery tracking
- Supplier orders

## Module 8: Financial
**קבצים:** ~25
**ישויות:** Proposal, Contract, Payment, Expense, Retainer
**כולל:**
- Proposal builder
- Contract management
- Payment tracking
- Invoicing

## Module 9: Calendar & Meetings
**קבצים:** ~10
**ישויות:** Meeting
**כולל:**
- Calendar view
- Meeting CRUD
- Reminders

## Module 10: Collaboration
**קבצים:** ~15
**ישויות:** Comment, DailyLog, Notification
**כולל:**
- Comments system
- Activity log
- Real-time notifications

## Module 11: Client Portal
**קבצים:** ~15
**ישויות:** ClientPortalSettings, ClientApproval
**כולל:**
- Portal pages
- Approval workflow
- Public links

## Module 12: Settings & Config
**קבצים:** ~15
**ישויות:** ConfigurableEntity, CustomField, Label
**כולל:**
- Tenant settings
- Custom fields
- Configurable lists

## Module 13: Reports & Analytics
**קבצים:** ~15
**ישויות:** Report, Dashboard
**כולל:**
- Dashboard widgets
- Report builder
- Export (PDF/Excel)

---

# 🔧 Tech Stack

```yaml
Frontend:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - TanStack Query
  - Zustand (state)
  - React Hook Form + Zod

Backend:
  - Next.js API Routes / tRPC
  - Prisma (ORM)
  - PostgreSQL (Supabase)
  - Redis (Upstash)

Infrastructure:
  - Vercel (hosting)
  - Supabase (DB + Auth + Storage)
  - Upstash (Redis + Queue)
  - Resend (Email)

Real-time:
  - Supabase Realtime
  - or Socket.io
```

---

# 📝 Prompts ל-Claude Code

## שלב 1: Setup Project

```
Create a new Next.js 14 project with:
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui (install Button, Input, Card, Dialog, Form, Table)
- Prisma with PostgreSQL
- NextAuth for authentication

Directory structure should follow the plan in ARCHITECTURE.md.
Keep files under 100 lines.
Use Hebrew comments where appropriate.
```

## שלב 2: Core Module

```
Based on the spec document (section Core), create:

1. Prisma schema for:
   - Tenant (multi-tenant base)
   - User (with roles)

2. Auth setup:
   - NextAuth config
   - Magic link provider
   - Google OAuth provider
   - Session handling

3. Middleware:
   - Tenant isolation
   - Auth protection

Rules:
- Max 100 lines per file
- Max 20 lines per function
- Use Zod for validation
- TypeScript strict
```

## שלב 3: Projects Module

```
Create the Projects module:

1. Prisma schema additions:
   - Project entity
   - Room entity

2. API routes (or tRPC):
   - GET /api/projects
   - POST /api/projects
   - GET /api/projects/:id
   - PATCH /api/projects/:id
   - DELETE /api/projects/:id
   - Projects for rooms

3. UI Components:
   - ProjectList (table with filters)
   - ProjectCard (summary card)
   - ProjectForm (create/edit)
   - ProjectHub (main project page)
   - RoomList
   - RoomForm

4. Pages:
   - /projects (list)
   - /projects/[id] (hub)
   - /projects/new

Rules:
- Reuse shared components
- Server components where possible
- Optimistic updates
- Hebrew UI
```

---

# 🔄 סדר עבודה מומלץ

## Week 1: Foundation
1. ✅ Project setup
2. ✅ Core module (Tenant, User, Auth)
3. ✅ Base UI components
4. ✅ Layout & Navigation

## Week 2: Main Entities
5. ✅ Projects module
6. ✅ Contacts module (Clients, Suppliers)
7. ✅ Tasks module

## Week 3: Content
8. ✅ Documents module
9. ✅ Products module
10. ✅ Calendar module

## Week 4: Business Logic
11. ✅ Procurement module
12. ✅ Financial module (Proposals, Payments)

## Week 5: Collaboration
13. ✅ Comments & Activity
14. ✅ Notifications
15. ✅ Client Portal

## Week 6: Polish
16. ✅ Settings & Config
17. ✅ Reports
18. ✅ Testing & Bug fixes

---

# 📁 Shared Code (לא לכפול!)

## Shared Types
```typescript
// /types/base.ts
export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithStatus {
  status: string;
  statusId?: string;
}

export interface WithAssignment {
  assignedTo?: string;
  assignedUserIds?: string[];
}
```

## Shared Hooks
```typescript
// /lib/hooks/use-entity.ts
// Generic hook for CRUD operations

// /lib/hooks/use-realtime.ts
// Subscribe to changes

// /lib/hooks/use-optimistic.ts
// Optimistic updates
```

## Shared Components
```typescript
// /components/shared/data-table.tsx
// Reusable table with sorting, filtering

// /components/shared/entity-form.tsx
// Base form component

// /components/shared/status-badge.tsx
// Status indicator

// /components/shared/empty-state.tsx
// Empty state component

// /components/shared/loading-skeleton.tsx
// Loading states
```

---

# ✅ Checklist לכל מודול

לפני שעוברים למודול הבא:

- [ ] כל הקבצים מתחת ל-100 שורות
- [ ] אין כפילויות קוד
- [ ] TypeScript ללא errors
- [ ] Zod validation לכל form
- [ ] API מחזיר format אחיד
- [ ] UI responsive
- [ ] Hebrew text תקין
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states