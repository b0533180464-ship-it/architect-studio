# Project, Client, Supplier & Professional
## פרויקט, לקוח, ספק ובעל מקצוע

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces
>
> **Enums בשימוש:** `Priority`, `ClientStatus`, `ClientType`, `PreferredCommunication`, `PermitStatus`, `BillingType`

---

# א. Project (פרויקט) - הישות המרכזית

## תיאור
הפרויקט הוא הישות המרכזית במערכת. כל העבודה מתרכזת סביב פרויקטים.

## Interface

```typescript
interface Project {
  id: string;
  tenantId: string;

  // פרטים בסיסיים
  name: string;
  description?: string;
  code?: string;                     // קוד פנימי: PRJ-001

  // קשרים
  clientId: string;
  assignedUserIds: string[];
  generalContractorId?: string;      // → Professional

  // סיווג (גנרי - מוגדר ב-ConfigurableEntity)
  typeId?: string;                   // → ConfigurableEntity (project_type)
  statusId: string;                  // → ConfigurableEntity (project_status)
  phaseId?: string;                  // → ConfigurableEntity (project_phase)
  priority: Priority;
  isVIP: boolean;
  tags?: string[];

  // מיקום
  address?: string;
  city?: string;
  area?: number;                     // שטח במ"ר
  floors?: number;

  // תקציב ותמחור
  budget?: number;
  currency: string;
  billingType: BillingType;
  fixedFee?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  percentageOfBudget?: number;
  markupPercent?: number;

  // היקף עבודה
  scope?: string;
  deliverables?: string[];
  revisionsIncluded: number;

  // רישוי (לאדריכלות)
  requiresPermit: boolean;
  permitStatus?: PermitStatus;
  permitNumber?: string;
  permitSubmittedAt?: Date;
  permitApprovedAt?: Date;
  permitNotes?: string;

  // תאריכים
  startDate?: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  constructionStartDate?: Date;
  constructionEndDate?: Date;
  installationDate?: Date;

  // מקור
  referralSource?: string;
  referredByClientId?: string;

  // קישורים למסמכים ראשיים
  proposalId?: string;               // → Proposal
  contractId?: string;               // → Contract

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  archivedAt?: Date;
}
```

## Database Schema

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  code VARCHAR(20),

  -- Relations
  client_id UUID NOT NULL REFERENCES clients(id),
  assigned_user_ids UUID[] NOT NULL DEFAULT '{}',
  general_contractor_id UUID REFERENCES professionals(id),

  -- Classification
  type_id UUID REFERENCES configurable_entities(id),
  status_id UUID NOT NULL REFERENCES configurable_entities(id),
  phase_id UUID REFERENCES configurable_entities(id),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  is_vip BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],

  -- Location
  address TEXT,
  city VARCHAR(100),
  area DECIMAL(10,2),
  floors INTEGER,

  -- Budget & Pricing
  budget DECIMAL(15,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'ILS',
  billing_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
  fixed_fee DECIMAL(15,2),
  hourly_rate DECIMAL(10,2),
  estimated_hours INTEGER,
  percentage_of_budget DECIMAL(5,2),
  markup_percent DECIMAL(5,2),

  -- Scope
  scope TEXT,
  deliverables TEXT[],
  revisions_included INTEGER NOT NULL DEFAULT 2,

  -- Permit
  requires_permit BOOLEAN NOT NULL DEFAULT false,
  permit_status VARCHAR(20),
  permit_number VARCHAR(50),
  permit_submitted_at TIMESTAMPTZ,
  permit_approved_at TIMESTAMPTZ,
  permit_notes TEXT,

  -- Dates
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  construction_start_date DATE,
  construction_end_date DATE,
  installation_date DATE,

  -- Source
  referral_source VARCHAR(100),
  referred_by_client_id UUID REFERENCES clients(id),

  -- Main documents
  proposal_id UUID,
  contract_id UUID,

  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status_id ON projects(status_id);
CREATE INDEX idx_projects_phase_id ON projects(phase_id);
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status_id);
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, '')));

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## Project Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Lead   │ ──▶ │ Proposal │ ──▶ │ Contract │ ──▶ │  Active  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Archive  │ ◀── │ Handover │ ◀── │ Snag List│ ◀── │ Changes  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**שלבים:**
1. **Lead** - לקוח פוטנציאלי נכנס למערכת
2. **Proposal** - הצעת מחיר (יכולות להיות כמה גרסאות)
3. **Contract** - אישור הצעה יוצר חוזה, חתימה מפעילה פרויקט
4. **Active** - ייעוץ → קונספט → תכנון → רכש → ביצוע → מסירה
5. **Changes** - בקשות שינוי מתועדות ומאושרות
6. **Snag List** - ליקויים לתיקון לפני מסירה
7. **Handover** - מסירה סופית
8. **Archive** - פרויקט סגור נשמר להיסטוריה

---

# ב. Client (לקוח)

## תיאור
לקוח במערכת - יכול להיות פרטי או עסקי.

## Interface

```typescript
interface Client {
  id: string;
  tenantId: string;

  // פרטים בסיסיים
  name: string;
  type: ClientType;                  // 'individual' | 'company'

  // קשר
  email?: string;
  phone?: string;
  mobile?: string;
  preferredCommunication: PreferredCommunication;
  bestTimeToContact?: string;

  // כתובת
  address?: string;
  city?: string;

  // חברה (אם type='company')
  companyNumber?: string;
  contactPerson?: string;

  // סטטוס
  status: ClientStatus;              // 'lead' | 'active' | 'past' | 'inactive'
  leadSource?: string;
  leadScore?: number;

  // העדפות עיצוב
  stylePreferences?: string[];
  budgetRange?: string;

  // הפניות
  referredBy?: string;
  referredByClientId?: string;

  // תאריכים חשובים
  anniversaryDate?: Date;
  importantDates?: ImportantDate[];

  // הערכה
  satisfactionRating?: number;       // 1-5
  wouldRecommend?: boolean;
  testimonial?: string;

  // הערות
  notes?: string;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## Database Schema

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'individual',

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  preferred_communication VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
  best_time_to_contact VARCHAR(100),

  -- Address
  address TEXT,
  city VARCHAR(100),

  -- Company
  company_number VARCHAR(50),
  contact_person VARCHAR(200),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'lead',
  lead_source VARCHAR(100),
  lead_score INTEGER,

  -- Preferences
  style_preferences TEXT[],
  budget_range VARCHAR(50),

  -- Referral
  referred_by VARCHAR(200),
  referred_by_client_id UUID REFERENCES clients(id),

  -- Important dates
  anniversary_date DATE,
  important_dates JSONB DEFAULT '[]',

  -- Rating
  satisfaction_rating INTEGER,
  would_recommend BOOLEAN,
  testimonial TEXT,

  -- Notes
  notes TEXT,

  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX idx_clients_status ON clients(tenant_id, status);
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('simple', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')));

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clients
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ג. Supplier (ספק)

## תיאור
ספק מוצרים - ריהוט, תאורה, טקסטיל וכו'.

## Interface

```typescript
interface Supplier {
  id: string;
  tenantId: string;

  // פרטים בסיסיים
  name: string;
  categoryId?: string;               // → ConfigurableEntity (supplier_category)

  // קשר
  email?: string;
  phone?: string;
  website?: string;
  contactPerson?: string;

  // כתובת
  address?: string;
  city?: string;
  companyNumber?: string;

  // תנאים מסחריים
  paymentTerms?: string;
  discountPercent?: number;
  creditDays?: number;
  minimumOrder?: number;

  // Trade Account
  hasTradeAccount: boolean;
  tradeAccountNumber?: string;
  tradeDiscountPercent?: number;

  // הערכה
  rating?: number;                   // 1-5
  reliabilityScore?: number;

  // הערות
  notes?: string;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## Database Schema

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES configurable_entities(id),

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  contact_person VARCHAR(200),

  -- Address
  address TEXT,
  city VARCHAR(100),
  company_number VARCHAR(50),

  -- Commercial terms
  payment_terms VARCHAR(100),
  discount_percent DECIMAL(5,2),
  credit_days INTEGER,
  minimum_order DECIMAL(10,2),

  -- Trade Account
  has_trade_account BOOLEAN NOT NULL DEFAULT false,
  trade_account_number VARCHAR(50),
  trade_discount_percent DECIMAL(5,2),

  -- Rating
  rating INTEGER,
  reliability_score INTEGER,

  -- Notes
  notes TEXT,

  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_category ON suppliers(tenant_id, category_id);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON suppliers
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ד. Professional (בעל מקצוע)

## תיאור
בעלי מקצוע - קבלנים, חשמלאים, אינסטלטורים, נגרים וכו'. נפרד מספקים.

## Interface

```typescript
interface Professional {
  id: string;
  tenantId: string;

  // פרטים בסיסיים
  name: string;
  companyName?: string;
  tradeId: string;                   // → ConfigurableEntity (trade)

  // קשר
  phone: string;
  email?: string;

  // רישיון
  licenseNumber?: string;
  insuranceExpiry?: Date;

  // הערכה
  rating?: number;                   // 1-5

  // פרויקטים
  totalProjects: number;
  projectIds: string[];              // → Project[]

  // הערות
  notes?: string;
  specialties?: string[];

  // מטא
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## Database Schema

```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),
  trade_id UUID NOT NULL REFERENCES configurable_entities(id),

  -- Contact
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),

  -- License
  license_number VARCHAR(50),
  insurance_expiry DATE,

  -- Rating
  rating INTEGER,

  -- Projects
  total_projects INTEGER NOT NULL DEFAULT 0,
  project_ids UUID[] NOT NULL DEFAULT '{}',

  -- Notes
  notes TEXT,
  specialties TEXT[],

  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_professionals_tenant_id ON professionals(tenant_id);
CREATE INDEX idx_professionals_trade ON professionals(tenant_id, trade_id);

-- RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON professionals
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ה. API Endpoints

```typescript
// Projects
GET    /api/projects                     // List with filters
POST   /api/projects                     // Create
GET    /api/projects/:id                 // Get with relations
PATCH  /api/projects/:id                 // Update
DELETE /api/projects/:id                 // Delete (soft)
POST   /api/projects/:id/archive         // Archive
POST   /api/projects/:id/restore         // Restore from archive
GET    /api/projects/:id/activity        // Activity log
GET    /api/projects/:id/timeline        // Timeline view

// Clients
GET    /api/clients                      // List with filters
POST   /api/clients                      // Create
GET    /api/clients/:id                  // Get with projects
PATCH  /api/clients/:id                  // Update
DELETE /api/clients/:id                  // Delete (soft)
GET    /api/clients/:id/projects         // Client's projects
GET    /api/clients/:id/communications   // Communication history

// Suppliers
GET    /api/suppliers                    // List with filters
POST   /api/suppliers                    // Create
GET    /api/suppliers/:id                // Get with products
PATCH  /api/suppliers/:id                // Update
DELETE /api/suppliers/:id                // Delete (soft)
GET    /api/suppliers/:id/products       // Supplier's products
GET    /api/suppliers/:id/orders         // Purchase orders

// Professionals
GET    /api/professionals                // List with filters
POST   /api/professionals                // Create
GET    /api/professionals/:id            // Get with projects
PATCH  /api/professionals/:id            // Update
DELETE /api/professionals/:id            // Delete (soft)
```

---

# ו. Computed Fields & Aggregations

## Project Computed Fields

```typescript
interface ProjectComputed {
  // Progress
  taskProgress: number;              // % משימות שהושלמו
  paymentProgress: number;           // % תשלומים שהתקבלו
  ffeProgress: number;               // % מוצרים שהותקנו

  // Financial
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  budgetUsed: number;
  budgetRemaining: number;

  // Counts
  openTasksCount: number;
  overdueTasksCount: number;
  roomsCount: number;
  productsCount: number;
  documentsCount: number;

  // Status indicators
  isOverdue: boolean;
  hasOverduePayments: boolean;
  hasIssues: boolean;
  daysRemaining: number;
}
```

## Client Computed Fields

```typescript
interface ClientComputed {
  // Projects
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;

  // Financial
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  lifetimeValue: number;

  // Communication
  lastContactAt: Date;
  communicationCount: number;
}
```

---

**קשרים לקבצים אחרים:**
- Room שייך ל-Project: `04-tasks-docs-meetings.md`
- Payment שייך ל-Project: `06-financial.md`
- RoomProduct שייך ל-Project/Supplier: `05-products-ffe.md`
- ClientPortalSettings שייך ל-Project: `08-client-portal.md`
