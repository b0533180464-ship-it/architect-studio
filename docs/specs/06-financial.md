# Financial - תמחור ותשלומים
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## מודול Financial

מודול זה מנהל את כל ההיבטים הפיננסיים - הצעות מחיר, חוזים, מקדמות, תשלומים, הוצאות ומעקב שעות.

## מודלי תמחור נתמכים

| מודל | תיאור | שימוש מומלץ |
|------|-------|-------------|
| **Fixed Fee** | מחיר קבוע לכל הפרויקט | פרויקטים קטנים-בינוניים |
| **Hourly** | לפי שעות עבודה | ייעוץ, פרויקטים משתנים |
| **Percentage** | אחוז מתקציב הפרויקט (10-30%) | פרויקטים גדולים |
| **Cost Plus** | עלות מוצרים + markup (20-45%) | רכש + שירותי עיצוב |
| **Hybrid** | שילוב מודלים | הנפוץ ביותר |

## זרימת עבודה פיננסית

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Proposal │ → │ Contract │ → │ Retainer │ → │ Payments │
│ הצעת מחיר│    │   חוזה   │    │  מקדמה  │    │ תשלומים │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      ↑
                              ┌──────────────┐
                              │   Expenses   │
                              │    הוצאות    │
                              └──────────────┘
```

---

# ב. ישויות

## 1. Proposal (הצעת מחיר)

הצעת מחיר ללקוח - יכולה להיות לפני פרויקט (Lead) או עבור פרויקט קיים.

### Interface

```typescript
interface Proposal {
  id: string;
  tenantId: string;

  // קשרים - projectId אופציונלי כי הצעה יכולה להיות לפני פרויקט
  projectId?: string;               // → Project (03-project-client.md)
  clientId: string;                 // → Client (03-project-client.md)

  // מזהה
  proposalNumber: string;           // HM-2026-001 (auto-generated)
  title: string;

  // גרסאות
  version: number;                  // 1, 2, 3...
  parentId?: string;                // הצעה קודמת (אם זו גרסה מתוקנת)

  // תוכן
  introduction?: string;            // פתיח
  scope?: string;                   // היקף העבודה
  sections: ProposalSection[];      // סעיפים נוספים
  exclusions?: string[];            // לא כלול
  assumptions?: string[];           // הנחות יסוד
  terms?: string;                   // תנאים

  // סכומים
  subtotal: number;                 // סה"כ לפני הנחה ומע"מ
  discountAmount?: number;          // סכום הנחה
  discountType?: DiscountType;      // 'percent' | 'fixed'
  discountReason?: string;          // סיבת ההנחה
  vatRate: number;                  // אחוז מע"מ
  vatAmount: number;                // סכום מע"מ
  total: number;                    // סה"כ סופי
  currency: string;

  // סטטוס
  status: ProposalStatus;

  // תוקף
  validUntil: Date;

  // מעקב
  sentAt?: Date;
  viewedAt?: Date;
  viewCount: number;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;

  // חתימה דיגיטלית
  requiresSignature: boolean;
  signatureUrl?: string;
  signedAt?: Date;
  signedByName?: string;
  signedByEmail?: string;

  // גישה ציבורית (בלי התחברות)
  publicToken: string;              // token ייחודי לגישה
  publicUrl: string;                // URL מלא לצפייה

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProposalSection {
  id: string;
  title: string;
  content: string;                  // HTML/Markdown
  order: number;
}
```

### Database Schema

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- קשרים
  project_id UUID REFERENCES projects(id),
  client_id UUID NOT NULL REFERENCES clients(id),

  -- מזהה
  proposal_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,

  -- גרסאות
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES proposals(id),

  -- תוכן
  introduction TEXT,
  scope TEXT,
  sections JSONB DEFAULT '[]',
  exclusions JSONB DEFAULT '[]',
  assumptions JSONB DEFAULT '[]',
  terms TEXT,

  -- סכומים
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  discount_type VARCHAR(10),
  discount_reason VARCHAR(255),
  vat_rate DECIMAL(5, 2) DEFAULT 17,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'ILS',

  -- סטטוס
  status VARCHAR(20) DEFAULT 'draft',

  -- תוקף
  valid_until DATE,

  -- מעקב
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- חתימה
  requires_signature BOOLEAN DEFAULT false,
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_by_name VARCHAR(255),
  signed_by_email VARCHAR(255),

  -- גישה ציבורית
  public_token VARCHAR(64) NOT NULL,
  public_url TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT proposals_tenant_number_unique UNIQUE (tenant_id, proposal_number),
  CONSTRAINT proposals_public_token_unique UNIQUE (public_token)
);

-- Indexes
CREATE INDEX idx_proposals_tenant_id ON proposals(tenant_id);
CREATE INDEX idx_proposals_project_id ON proposals(project_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(tenant_id, status);
CREATE INDEX idx_proposals_public_token ON proposals(public_token);

-- RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON proposals USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Auto-Generated Proposal Number

```typescript
async function generateProposalNumber(tenantId: string): Promise<string> {
  const tenant = await db.tenants.findUnique({ where: { id: tenantId } });
  const prefix = tenant?.proposalPrefix || 'PRO';
  const year = new Date().getFullYear();

  const lastProposal = await db.proposals.findFirst({
    where: { tenantId, proposalNumber: { startsWith: `${prefix}-${year}-` } },
    orderBy: { proposalNumber: 'desc' }
  });

  const nextNum = lastProposal
    ? parseInt(lastProposal.proposalNumber.split('-')[2]) + 1
    : 1;

  return `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;
}
// Output: HM-2026-001, HM-2026-002, ...
```

### Computed Fields

```typescript
interface ProposalComputed {
  // פרטי לקוח
  clientName: string;
  clientEmail: string | null;

  // פרטי פרויקט (אם מקושר)
  projectName: string | null;

  // מי יצר
  createdByName: string;

  // פריטים
  itemCount: number;
  totalItems: number;               // כמות כוללת

  // סטטוס
  isExpired: boolean;               // validUntil < today
  daysUntilExpiry: number | null;
  canBeEdited: boolean;             // status = draft

  // גרסאות
  hasNewerVersion: boolean;
  latestVersion: number;

  // URL מלא לצפייה ציבורית
  fullPublicUrl: string;
}
```

### API Endpoints

```yaml
# Proposal CRUD
GET    /api/proposals                         # רשימת הצעות
POST   /api/proposals                         # יצירת הצעה חדשה
GET    /api/proposals/:id                     # קבלת הצעה
PATCH  /api/proposals/:id                     # עדכון הצעה
DELETE /api/proposals/:id                     # מחיקת הצעה (draft בלבד)

# גישה ציבורית (ללא auth)
GET    /api/public/proposals/:token           # צפייה בהצעה
POST   /api/public/proposals/:token/approve   # אישור הצעה
POST   /api/public/proposals/:token/reject    # דחיית הצעה
POST   /api/public/proposals/:token/sign      # חתימה

# פעולות
POST   /api/proposals/:id/send                # שליחה ללקוח
POST   /api/proposals/:id/duplicate           # שכפול הצעה
POST   /api/proposals/:id/new-version         # יצירת גרסה חדשה
POST   /api/proposals/:id/convert-to-contract # המרה לחוזה

# פריטים
GET    /api/proposals/:id/items               # פריטים בהצעה
POST   /api/proposals/:id/items               # הוספת פריט
PATCH  /api/proposals/:id/items/:itemId       # עדכון פריט
DELETE /api/proposals/:id/items/:itemId       # הסרת פריט
POST   /api/proposals/:id/items/reorder       # שינוי סדר

# ייצוא
GET    /api/proposals/:id/pdf                 # ייצוא PDF
GET    /api/proposals/:id/preview             # תצוגה מקדימה
```

### WebSocket Events

```typescript
const PROPOSAL_EVENTS = {
  'proposal.created': 'הצעה נוצרה',
  'proposal.updated': 'הצעה עודכנה',
  'proposal.sent': 'הצעה נשלחה',
  'proposal.viewed': 'לקוח צפה בהצעה',
  'proposal.approved': 'הצעה אושרה',
  'proposal.rejected': 'הצעה נדחתה',
  'proposal.signed': 'הצעה נחתמה',
  'proposal.expired': 'הצעה פגה',
};
```

---

## 2. ProposalItem (פריט בהצעת מחיר)

פריט בודד בהצעת מחיר - שירות, מוצר או הוצאה.

### Interface

```typescript
interface ProposalItem {
  id: string;
  proposalId: string;               // → Proposal

  // סוג
  type: ProposalItemType;           // 'service' | 'product' | 'expense'

  // פרטים
  name: string;
  description?: string;

  // כמות ומחיר
  quantity: number;
  unit?: string;                    // "שעות", "יח'", "מ"ר"
  unitPrice: number;
  total: number;                    // quantity * unitPrice

  // קישור למוצר (אופציונלי)
  productId?: string;               // → Product (05-products-ffe.md)
  imageUrl?: string;

  // אופציונלי
  isOptional: boolean;              // פריט אופציונלי
  isSelected: boolean;              // נבחר ע"י הלקוח

  // קיבוץ
  groupName?: string;               // "עיצוב", "ריהוט", "שירותים נוספים"

  // סדר
  order: number;
}
```

### Database Schema

```sql
CREATE TABLE proposal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  -- סוג
  type VARCHAR(20) NOT NULL,

  -- פרטים
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- כמות ומחיר
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(50),
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,

  -- קישור למוצר
  product_id UUID REFERENCES products(id),
  image_url TEXT,

  -- אופציונלי
  is_optional BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT true,

  -- קיבוץ
  group_name VARCHAR(100),

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT proposal_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT proposal_items_total_correct CHECK (total = quantity * unit_price)
);

-- Indexes
CREATE INDEX idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX idx_proposal_items_product_id ON proposal_items(product_id);
CREATE INDEX idx_proposal_items_group ON proposal_items(proposal_id, group_name);
```

### Computed Fields

```typescript
interface ProposalItemComputed {
  // פרטי מוצר (אם מקושר)
  productName: string | null;
  productSku: string | null;

  // סכום לאחר בחירה
  effectiveTotal: number;           // isSelected ? total : 0
}
```

### Triggers

```sql
-- עדכון סכומי הצעה בעת שינוי פריטים
CREATE OR REPLACE FUNCTION update_proposal_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
  v_vat_rate DECIMAL(5, 2);
  v_discount DECIMAL(12, 2);
  v_vat_amount DECIMAL(12, 2);
BEGIN
  -- חישוב subtotal (רק פריטים שנבחרו)
  SELECT COALESCE(SUM(total), 0)
  INTO v_subtotal
  FROM proposal_items
  WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
    AND is_selected = true;

  -- קבלת vat_rate והנחה
  SELECT vat_rate, COALESCE(discount_amount, 0)
  INTO v_vat_rate, v_discount
  FROM proposals
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  -- חישוב מע"מ
  v_vat_amount := (v_subtotal - v_discount) * v_vat_rate / 100;

  -- עדכון הצעה
  UPDATE proposals
  SET
    subtotal = v_subtotal,
    vat_amount = v_vat_amount,
    total = v_subtotal - v_discount + v_vat_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_proposal_totals
AFTER INSERT OR UPDATE OR DELETE ON proposal_items
FOR EACH ROW EXECUTE FUNCTION update_proposal_totals();
```

---

## 3. Contract (חוזה)

חוזה התקשרות עם הלקוח - נוצר מהצעת מחיר שאושרה או באופן עצמאי.

### Interface

```typescript
interface Contract {
  id: string;
  tenantId: string;
  projectId: string;                // → Project (03-project-client.md)
  clientId: string;                 // → Client (03-project-client.md)

  // מזהה
  contractNumber: string;           // CON-2026-001
  title: string;

  // תבנית (אם נוצר מתבנית)
  templateId?: string;              // → ContractTemplate (11-reports-templates.md)
  content: string;                  // HTML מלא של החוזה

  // קישור להצעה
  proposalId?: string;              // → Proposal

  // סכום
  totalValue: number;
  currency: string;

  // תקופה
  startDate: Date;
  endDate?: Date;

  // סטטוס
  status: ContractStatus;

  // חתימות
  signatures: ContractSignature[];

  // קבצים
  documentUrl?: string;             // קובץ החוזה
  signedDocumentUrl?: string;       // קובץ חתום

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ContractSignature {
  id: string;
  party: 'designer' | 'client';
  name: string;
  email: string;
  title?: string;                   // תפקיד
  signedAt?: Date;
  signatureUrl?: string;            // קובץ חתימה
  ipAddress?: string;
}
```

### Database Schema

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  client_id UUID NOT NULL REFERENCES clients(id),

  -- מזהה
  contract_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,

  -- תבנית
  template_id UUID REFERENCES contract_templates(id),
  content TEXT NOT NULL,

  -- קישור להצעה
  proposal_id UUID REFERENCES proposals(id),

  -- סכום
  total_value DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',

  -- תקופה
  start_date DATE NOT NULL,
  end_date DATE,

  -- סטטוס
  status VARCHAR(20) DEFAULT 'draft',

  -- חתימות
  signatures JSONB DEFAULT '[]',

  -- קבצים
  document_url TEXT,
  signed_document_url TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT contracts_tenant_number_unique UNIQUE (tenant_id, contract_number),
  CONSTRAINT contracts_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_project_id ON contracts(project_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_proposal_id ON contracts(proposal_id);
CREATE INDEX idx_contracts_status ON contracts(tenant_id, status);

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON contracts USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface ContractComputed {
  // פרטים
  clientName: string;
  projectName: string;
  createdByName: string;

  // חתימות
  designerSigned: boolean;
  clientSigned: boolean;
  allSigned: boolean;
  pendingSignatures: string[];      // מי עוד צריך לחתום

  // סטטוס
  isActive: boolean;                // status = signed && today between dates
  daysRemaining: number | null;     // endDate - today
}
```

### API Endpoints

```yaml
# Contract CRUD
GET    /api/contracts                         # רשימת חוזים
POST   /api/contracts                         # יצירת חוזה
GET    /api/contracts/:id                     # קבלת חוזה
PATCH  /api/contracts/:id                     # עדכון חוזה
DELETE /api/contracts/:id                     # מחיקת חוזה (draft בלבד)

# חתימות
POST   /api/contracts/:id/send-for-signature  # שליחה לחתימה
POST   /api/contracts/:id/sign                # חתימה (designer)
POST   /api/public/contracts/:token/sign      # חתימת לקוח (public)

# יצירה מהצעה
POST   /api/proposals/:proposalId/create-contract

# ייצוא
GET    /api/contracts/:id/pdf                 # ייצוא PDF
GET    /api/contracts/:id/preview             # תצוגה מקדימה
```

### WebSocket Events

```typescript
const CONTRACT_EVENTS = {
  'contract.created': 'חוזה נוצר',
  'contract.sent': 'חוזה נשלח לחתימה',
  'contract.designer_signed': 'מעצב חתם',
  'contract.client_signed': 'לקוח חתם',
  'contract.fully_signed': 'חוזה נחתם במלואו',
  'contract.cancelled': 'חוזה בוטל',
};
```

---

## 4. Retainer (מקדמה)

מקדמה מלקוח - יכולה להיות כללית או מקושרת לפרויקט.

### Interface

```typescript
interface Retainer {
  id: string;
  tenantId: string;
  clientId: string;                 // → Client
  projectId?: string;               // → Project (אופציונלי)

  // סוג
  type: RetainerType;

  // סכום
  amount: number;
  currency: string;

  // סטטוס
  status: RetainerStatus;

  // קבלה
  receivedAt?: Date;
  paymentMethod?: string;
  referenceNumber?: string;

  // שימוש
  amountApplied: number;            // כמה כבר שימשנו
  amountRemaining: number;          // כמה נשאר

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE retainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),

  -- סוג
  type VARCHAR(20) NOT NULL,

  -- סכום
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',

  -- סטטוס
  status VARCHAR(20) DEFAULT 'pending',

  -- קבלה
  received_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),

  -- שימוש
  amount_applied DECIMAL(12, 2) DEFAULT 0,
  amount_remaining DECIMAL(12, 2),

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT retainers_amount_positive CHECK (amount > 0),
  CONSTRAINT retainers_applied_valid CHECK (amount_applied >= 0 AND amount_applied <= amount)
);

-- Trigger לעדכון amount_remaining
CREATE OR REPLACE FUNCTION update_retainer_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount_remaining := NEW.amount - NEW.amount_applied;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_retainer_remaining
BEFORE INSERT OR UPDATE ON retainers
FOR EACH ROW EXECUTE FUNCTION update_retainer_remaining();

-- Indexes
CREATE INDEX idx_retainers_tenant_id ON retainers(tenant_id);
CREATE INDEX idx_retainers_client_id ON retainers(client_id);
CREATE INDEX idx_retainers_project_id ON retainers(project_id);
CREATE INDEX idx_retainers_status ON retainers(tenant_id, status);

-- RLS
ALTER TABLE retainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON retainers USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### API Endpoints

```yaml
# Retainer CRUD
GET    /api/retainers                         # רשימת מקדמות
POST   /api/retainers                         # יצירת מקדמה
GET    /api/retainers/:id                     # קבלת מקדמה
PATCH  /api/retainers/:id                     # עדכון מקדמה
DELETE /api/retainers/:id                     # מחיקה

# פעולות
POST   /api/retainers/:id/receive             # סימון כהתקבלה
POST   /api/retainers/:id/apply               # יישום על תשלום
POST   /api/retainers/:id/refund              # החזר
```

---

## 5. RetainerApplication (יישום מקדמה)

רישום של שימוש במקדמה על תשלום או חשבונית.

### Interface

```typescript
interface RetainerApplication {
  id: string;
  retainerId: string;               // → Retainer
  invoiceId?: string;               // → חשבונית חיצונית
  paymentId?: string;               // → Payment

  // סכום
  amount: number;

  // פרטים
  appliedAt: Date;
  appliedBy: string;                // userId
  notes?: string;
}
```

### Database Schema

```sql
CREATE TABLE retainer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retainer_id UUID NOT NULL REFERENCES retainers(id) ON DELETE CASCADE,
  invoice_id VARCHAR(100),
  payment_id UUID REFERENCES payments(id),

  -- סכום
  amount DECIMAL(12, 2) NOT NULL,

  -- פרטים
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,

  -- Constraints
  CONSTRAINT retainer_applications_amount_positive CHECK (amount > 0)
);

-- Trigger לעדכון amount_applied ב-Retainer
CREATE OR REPLACE FUNCTION update_retainer_applied()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE retainers
    SET amount_applied = amount_applied + NEW.amount
    WHERE id = NEW.retainer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE retainers
    SET amount_applied = amount_applied - OLD.amount
    WHERE id = OLD.retainer_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_retainer_applied
AFTER INSERT OR DELETE ON retainer_applications
FOR EACH ROW EXECUTE FUNCTION update_retainer_applied();

-- Indexes
CREATE INDEX idx_retainer_applications_retainer_id ON retainer_applications(retainer_id);
CREATE INDEX idx_retainer_applications_payment_id ON retainer_applications(payment_id);
```

---

## 6. Payment (תשלום)

תשלום מתוכנן או שהתקבל בפרויקט.

### Interface

```typescript
interface Payment {
  id: string;
  tenantId: string;
  projectId: string;                // → Project

  // פרטים
  name: string;
  description?: string;

  // סכום
  amount: number;
  currency: string;

  // סוג - קריטי להבנת אופי התשלום
  paymentType: PaymentType;

  // פרטים לפי סוג
  milestonePhaseId?: string;        // → ConfigurableEntity (phase)
  milestoneDescription?: string;
  percentageOfBudget?: number;
  hoursWorked?: number;
  hourlyRate?: number;
  changeOrderId?: string;           // → ChangeOrder (08-client-portal.md)

  // תזמון
  dueDate?: Date;
  triggerType?: PaymentTriggerType;
  triggerDescription?: string;

  // סטטוס
  status: PaymentStatus;

  // תשלום בפועל
  paidAmount: number;
  paidDate?: Date;
  paymentMethod?: string;
  referenceNumber?: string;

  // חשבונית
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceUrl?: string;

  // תזכורות
  remindersSent: number;
  lastReminderAt?: Date;
  nextReminderAt?: Date;

  // סדר
  order: number;

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- פרטים
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- סכום
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',

  -- סוג
  payment_type VARCHAR(20) NOT NULL,

  -- פרטים לפי סוג
  milestone_phase_id UUID REFERENCES configurable_entities(id),
  milestone_description TEXT,
  percentage_of_budget DECIMAL(5, 2),
  hours_worked DECIMAL(8, 2),
  hourly_rate DECIMAL(10, 2),
  change_order_id UUID REFERENCES change_orders(id),

  -- תזמון
  due_date DATE,
  trigger_type VARCHAR(20),
  trigger_description VARCHAR(255),

  -- סטטוס
  status VARCHAR(20) DEFAULT 'scheduled',

  -- תשלום בפועל
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  paid_date DATE,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),

  -- חשבונית
  invoice_id VARCHAR(100),
  invoice_number VARCHAR(50),
  invoice_date DATE,
  invoice_url TEXT,

  -- תזכורות
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ,

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT payments_amount_positive CHECK (amount > 0),
  CONSTRAINT payments_paid_valid CHECK (paid_amount >= 0 AND paid_amount <= amount)
);

-- Indexes
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(tenant_id, status);
CREATE INDEX idx_payments_due_date ON payments(tenant_id, due_date);
CREATE INDEX idx_payments_overdue ON payments(tenant_id, due_date, status)
  WHERE status IN ('scheduled', 'pending') AND due_date < CURRENT_DATE;

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payments USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface PaymentComputed {
  // פרטי פרויקט
  projectName: string;
  clientName: string;

  // סכומים
  remainingAmount: number;          // amount - paidAmount
  paidPercentage: number;           // paidAmount / amount * 100

  // סטטוס
  isOverdue: boolean;               // dueDate < today && status not paid
  daysOverdue: number | null;
  daysUntilDue: number | null;

  // תזמון
  formattedDueDate: string;
  dueDateRelative: string;          // "בעוד 3 ימים", "לפני שבוע"
}
```

### API Endpoints

```yaml
# Payment CRUD
GET    /api/payments                          # רשימת תשלומים (כל הפרויקטים)
GET    /api/projects/:projectId/payments      # תשלומים בפרויקט
POST   /api/projects/:projectId/payments      # יצירת תשלום
GET    /api/payments/:id                      # קבלת תשלום
PATCH  /api/payments/:id                      # עדכון תשלום
DELETE /api/payments/:id                      # מחיקה

# פעולות
POST   /api/payments/:id/mark-paid            # סימון כשולם
POST   /api/payments/:id/partial-payment      # תשלום חלקי
POST   /api/payments/:id/send-reminder        # שליחת תזכורת
POST   /api/payments/:id/create-invoice       # יצירת חשבונית

# דשבורד
GET    /api/payments/overdue                  # תשלומים באיחור
GET    /api/payments/upcoming                 # תשלומים קרובים
GET    /api/payments/summary                  # סיכום פיננסי

# תשלום אונליין
POST   /api/payments/:id/checkout-session     # יצירת session לתשלום
POST   /api/payments/webhook                  # Webhook מספק תשלומים
```

### WebSocket Events

```typescript
const PAYMENT_EVENTS = {
  'payment.created': 'תשלום נוצר',
  'payment.updated': 'תשלום עודכן',
  'payment.received': 'תשלום התקבל',
  'payment.partial': 'תשלום חלקי התקבל',
  'payment.overdue': 'תשלום באיחור',
  'payment.reminder_sent': 'תזכורת נשלחה',
};
```

---

## 7. Expense (הוצאה)

הוצאה - משויכת לפרויקט (billable) או משרדית (non-billable).

### Interface

```typescript
interface Expense {
  id: string;
  tenantId: string;
  projectId?: string;               // → Project (אופציונלי - הוצאה משרדית)

  // פרטים
  description: string;
  amount: number;
  currency: string;
  date: Date;

  // סיווג
  categoryId?: string;              // → ConfigurableEntity (ExpenseCategory)
  supplierId?: string;              // → Supplier

  // חיוב ללקוח
  isBillable: boolean;
  markupPercent?: number;
  billedAmount?: number;            // amount * (1 + markupPercent/100)

  // קבלה
  receiptUrl?: string;
  invoiceNumber?: string;

  // סטטוס
  status: ExpenseStatus;
  approvedBy?: string;              // userId
  approvedAt?: Date;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Database Schema

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),

  -- פרטים
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  date DATE NOT NULL,

  -- סיווג
  category_id UUID REFERENCES configurable_entities(id),
  supplier_id UUID REFERENCES suppliers(id),

  -- חיוב ללקוח
  is_billable BOOLEAN DEFAULT false,
  markup_percent DECIMAL(5, 2),
  billed_amount DECIMAL(12, 2),

  -- קבלה
  receipt_url TEXT,
  invoice_number VARCHAR(100),

  -- סטטוס
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT expenses_amount_positive CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX idx_expenses_date ON expenses(tenant_id, date);
CREATE INDEX idx_expenses_status ON expenses(tenant_id, status);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON expenses USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### API Endpoints

```yaml
# Expense CRUD
GET    /api/expenses                          # רשימת הוצאות
POST   /api/expenses                          # יצירת הוצאה
GET    /api/expenses/:id                      # קבלת הוצאה
PATCH  /api/expenses/:id                      # עדכון הוצאה
DELETE /api/expenses/:id                      # מחיקה

# לפי פרויקט
GET    /api/projects/:projectId/expenses      # הוצאות בפרויקט

# פעולות
POST   /api/expenses/:id/approve              # אישור הוצאה
POST   /api/expenses/:id/reject               # דחיית הוצאה
POST   /api/expenses/:id/upload-receipt       # העלאת קבלה

# דוחות
GET    /api/expenses/summary                  # סיכום הוצאות
GET    /api/expenses/by-category              # הוצאות לפי קטגוריה
```

---

## 8. TimeEntry (רישום זמן)

רישום שעות עבודה - אופציונלי, לפרויקטים עם תמחור שעתי.

### Interface

```typescript
interface TimeEntry {
  id: string;
  tenantId: string;
  projectId: string;                // → Project
  userId: string;                   // → User

  // זמן
  date: Date;
  hours: number;
  startTime?: string;               // "09:00"
  endTime?: string;                 // "17:30"

  // פרטים
  description?: string;
  categoryId?: string;              // → ConfigurableEntity (TimeCategory)

  // חיוב
  isBillable: boolean;
  hourlyRate?: number;

  // קישור למשימה
  taskId?: string;                  // → Task

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),

  -- זמן
  date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  start_time TIME,
  end_time TIME,

  -- פרטים
  description TEXT,
  category_id UUID REFERENCES configurable_entities(id),

  -- חיוב
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10, 2),

  -- קישור למשימה
  task_id UUID REFERENCES tasks(id),

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT time_entries_hours_positive CHECK (hours > 0 AND hours <= 24),
  CONSTRAINT time_entries_times_valid CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Indexes
CREATE INDEX idx_time_entries_tenant_id ON time_entries(tenant_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(tenant_id, date);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);

-- RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON time_entries USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface TimeEntryComputed {
  // פרטים
  projectName: string;
  userName: string;
  taskTitle: string | null;
  categoryName: string | null;

  // סכום
  totalAmount: number;              // hours * hourlyRate (if billable)

  // זמן מפורמט
  timeRange: string;                // "09:00 - 17:30"
  durationFormatted: string;        // "8.5 שעות"
}
```

### API Endpoints

```yaml
# TimeEntry CRUD
GET    /api/time-entries                      # רשימת רישומים
POST   /api/time-entries                      # יצירת רישום
GET    /api/time-entries/:id                  # קבלת רישום
PATCH  /api/time-entries/:id                  # עדכון רישום
DELETE /api/time-entries/:id                  # מחיקה

# לפי הקשר
GET    /api/projects/:projectId/time-entries  # לפי פרויקט
GET    /api/users/:userId/time-entries        # לפי משתמש
GET    /api/tasks/:taskId/time-entries        # לפי משימה

# Timer (טיימר חי)
POST   /api/time-entries/start                # התחלת טיימר
POST   /api/time-entries/stop                 # עצירת טיימר
GET    /api/time-entries/running              # טיימר פעיל

# דוחות
GET    /api/time-entries/summary              # סיכום שעות
GET    /api/time-entries/by-user              # לפי משתמש
GET    /api/time-entries/by-project           # לפי פרויקט
GET    /api/time-entries/timesheet            # דוח שבועי/חודשי
```

---

# ג. Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
// סטטוס הצעה
type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'revised';

// סוג הנחה
type DiscountType = 'percent' | 'fixed';

// סוג פריט בהצעה
type ProposalItemType = 'service' | 'product' | 'expense';

// סטטוס חוזה
type ContractStatus = 'draft' | 'sent' | 'pending_signature' | 'partially_signed' | 'signed' | 'cancelled' | 'terminated';

// סוג מקדמה
type RetainerType = 'project_retainer' | 'general_retainer' | 'deposit' | 'trust_account';

// סטטוס מקדמה
type RetainerStatus = 'pending' | 'received' | 'partially_applied' | 'fully_applied' | 'refunded';

// סוג תשלום
type PaymentType = 'retainer' | 'milestone' | 'scheduled' | 'final' | 'change_order' | 'hourly' | 'expense';

// trigger תשלום
type PaymentTriggerType = 'date' | 'phase' | 'event';

// סטטוס תשלום
type PaymentStatus = 'scheduled' | 'pending' | 'invoiced' | 'partial' | 'paid' | 'overdue' | 'cancelled';

// סטטוס הוצאה
type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';
```

---

# ד. יחסים בין ישויות

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              FINANCIAL                                    │
│                                                                          │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐                  │
│  │ Proposal │───────►│ Contract │───────►│ Project  │                  │
│  │ הצעת מחיר│   1:1  │   חוזה   │   1:1  │(03-proj) │                  │
│  └────┬─────┘        └──────────┘        └────┬─────┘                  │
│       │                                       │                          │
│       │ 1:N                                   │ 1:N                      │
│       ▼                                       ▼                          │
│  ┌──────────┐                          ┌──────────┐                      │
│  │Proposal  │                          │ Payment  │                      │
│  │  Item    │                          │  תשלום   │                      │
│  └──────────┘                          └──────────┘                      │
│                                              ▲                           │
│  ┌──────────┐        ┌──────────┐           │                           │
│  │ Retainer │───────►│Retainer  │───────────┘                           │
│  │  מקדמה   │  1:N   │Application│                                      │
│  └──────────┘        └──────────┘                                       │
│                                                                          │
│  ┌──────────┐        ┌──────────┐                                       │
│  │ Expense  │        │TimeEntry │                                       │
│  │  הוצאה   │        │רישום זמן │                                       │
│  └──────────┘        └──────────┘                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### יחסים עם ישויות מקבצים אחרים:

| ישות | יחס | ישות חיצונית | קובץ |
|------|-----|--------------|------|
| Proposal | N:1 | Client | `03-project-client.md` |
| Proposal | N:1 | Project | `03-project-client.md` |
| ProposalItem | N:1 | Product | `05-products-ffe.md` |
| Contract | N:1 | Project | `03-project-client.md` |
| Contract | N:1 | Client | `03-project-client.md` |
| Contract | N:1 | ContractTemplate | `11-reports-templates.md` |
| Retainer | N:1 | Client | `03-project-client.md` |
| Payment | N:1 | ChangeOrder | `08-client-portal.md` |
| Expense | N:1 | Supplier | `03-project-client.md` |
| TimeEntry | N:1 | Task | `04-tasks-docs-meetings.md` |
| TimeEntry | N:1 | User | `02-auth-tenant-user.md` |

---

# ה. הנחיות UI

## Payment Timeline

```typescript
interface PaymentTimelineUI {
  // תצוגת לוח תשלומים
  timeline: {
    showPastPayments: true;
    showUpcoming: true;
    showOverdue: true;
    colorCode: {
      paid: 'green',
      pending: 'yellow',
      overdue: 'red',
      scheduled: 'gray',
    };
  };

  // Progress bar
  progressBar: {
    showTotalPaid: true;
    showTotalRemaining: true;
    showPercentage: true;
  };
}
```

## Proposal Editor

```typescript
interface ProposalEditorUI {
  // Builder
  builder: {
    sections: ['header', 'scope', 'items', 'terms', 'footer'];
    itemsTable: {
      columns: ['name', 'quantity', 'unitPrice', 'total'];
      allowGroups: true;
      allowOptional: true;
      showImages: true;
    };
    totals: ['subtotal', 'discount', 'vat', 'total'];
  };

  // Preview
  preview: {
    realTimePreview: true;
    responsive: true;
    brandingApplied: true;
  };
}
```

---

# ו. Automations (אוטומציות מומלצות)

```typescript
const FINANCIAL_AUTOMATIONS = [
  // תזכורת תשלום
  {
    name: 'תזכורת תשלום - 7 ימים לפני',
    trigger: { type: 'relative_date', entity: 'Payment', field: 'dueDate', daysBefore: 7 },
    condition: { field: 'status', in: ['scheduled', 'pending'] },
    action: { type: 'send_email', to: 'client', template: 'payment_reminder' }
  },

  // תשלום באיחור
  {
    name: 'תשלום באיחור - התראה',
    trigger: { type: 'scheduled', schedule: 'daily' },
    condition: { field: 'dueDate', operator: 'date_before', value: 'today', status: { not: 'paid' } },
    action: [
      { type: 'update_field', field: 'status', value: 'overdue' },
      { type: 'send_email', to: 'client', template: 'payment_overdue' },
      { type: 'create_notification', to: 'owner', message: 'תשלום באיחור: {{paymentName}}' }
    ]
  },

  // הצעה אושרה - יצירת חוזה
  {
    name: 'הצעה אושרה - צור חוזה',
    trigger: { type: 'status_changed', entity: 'Proposal', to: 'approved' },
    action: { type: 'create_entity', entityType: 'Contract', fromTemplate: 'default_contract' }
  },

  // חוזה נחתם - יצירת פרויקט
  {
    name: 'חוזה נחתם - הפעל פרויקט',
    trigger: { type: 'status_changed', entity: 'Contract', to: 'signed' },
    action: [
      { type: 'update_field', entity: 'Project', field: 'status', value: 'active' },
      { type: 'send_email', to: 'client', template: 'project_kickoff' }
    ]
  },

  // הצעה פגה
  {
    name: 'הצעה פגה - עדכון סטטוס',
    trigger: { type: 'scheduled', schedule: 'daily' },
    condition: { field: 'validUntil', operator: 'date_before', value: 'today', status: 'sent' },
    action: { type: 'update_field', field: 'status', value: 'expired' }
  },
];
```

---

**הפניות לקבצים אחרים:**
- Tenant/User: `02-auth-tenant-user.md`
- Project/Client/Supplier: `03-project-client.md`
- Task: `04-tasks-docs-meetings.md`
- Product: `05-products-ffe.md`
- ChangeOrder: `08-client-portal.md`
- Templates: `11-reports-templates.md`
- ConfigurableEntity: `14-configuration.md`
- Automations: `09-automations.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
