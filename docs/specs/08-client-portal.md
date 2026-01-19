# Client Portal & Design Management - פורטל לקוח וניהול עיצוב

## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

מודול זה מכיל את כל הישויות הקשורות לפורטל הלקוח ולניהול תהליכי העיצוב:

| ישות | תיאור | טבלה |
|------|-------|------|
| ClientPortalSettings | הגדרות פורטל לקוח | `client_portal_settings` |
| ClientApproval | בקשות אישור מלקוח | `client_approvals` |
| MoodBoard | לוחות השראה | `mood_boards` |
| MoodBoardItem | פריטים בלוח השראה | `mood_board_items` |
| ChangeOrder | בקשות שינוי | `change_orders` |
| ChangeOrderItem | פריטים בבקשת שינוי | `change_order_items` |
| DesignOption | אופציות עיצוב | `design_options` |
| SnagItem | ליקויים | `snag_items` |

---

# ב. ClientPortalSettings - הגדרות פורטל לקוח

מודל גישה: הלקוחות לא נרשמים למערכת. במקום - קישור ייחודי לכל פרויקט עם Token לאימות, ללא התחברות.

## Interface

```typescript
interface ClientPortalSettings {
  id: string;
  tenantId: string;
  projectId: string;

  // גישה
  isEnabled: boolean;
  token: string;                     // Token ייחודי לאימות
  publicUrl: string;                 // כתובת הפורטל
  expiresAt?: Date;                  // תוקף (אופציונלי)

  // הרשאות צפייה
  canViewProgress: boolean;
  canViewMoodBoards: boolean;
  canViewProducts: boolean;
  canViewSchedule: boolean;
  canViewDocuments: boolean;
  canViewPayments: boolean;
  canViewBudget: boolean;

  // הרשאות פעולה
  canApproveProducts: boolean;
  canApproveMoodBoards: boolean;
  canApproveDesignOptions: boolean;
  canLeaveComments: boolean;
  canUploadFiles: boolean;
  canMakePayments: boolean;
  canRequestChanges: boolean;

  // תצוגת מחירים
  priceDisplay: PriceDisplayMode;

  // הודעות
  notifyOnUpdate: boolean;
  notifyOnMessage: boolean;
  notifyOnApprovalNeeded: boolean;

  // ברנדינג
  customWelcomeMessage?: string;
  showDesignerLogo: boolean;

  // סטטיסטיקות
  lastAccessedAt?: Date;
  accessCount: number;

  createdAt: Date;
  updatedAt: Date;
}

type PriceDisplayMode =
  | 'hide'                           // לא מציג מחירים
  | 'show_retail'                    // מציג מחיר קמעונאי
  | 'show_client_price'              // מציג מחיר ללקוח
  | 'show_all';                      // מציג הכל
```

## Database Schema

```sql
-- טבלת הגדרות פורטל לקוח
CREATE TABLE client_portal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) UNIQUE,

  -- גישה
  is_enabled BOOLEAN DEFAULT false,
  token VARCHAR(64) NOT NULL UNIQUE,
  public_url VARCHAR(500),
  expires_at TIMESTAMPTZ,

  -- הרשאות צפייה
  can_view_progress BOOLEAN DEFAULT true,
  can_view_mood_boards BOOLEAN DEFAULT true,
  can_view_products BOOLEAN DEFAULT true,
  can_view_schedule BOOLEAN DEFAULT true,
  can_view_documents BOOLEAN DEFAULT true,
  can_view_payments BOOLEAN DEFAULT true,
  can_view_budget BOOLEAN DEFAULT false,

  -- הרשאות פעולה
  can_approve_products BOOLEAN DEFAULT true,
  can_approve_mood_boards BOOLEAN DEFAULT true,
  can_approve_design_options BOOLEAN DEFAULT true,
  can_leave_comments BOOLEAN DEFAULT true,
  can_upload_files BOOLEAN DEFAULT false,
  can_make_payments BOOLEAN DEFAULT false,
  can_request_changes BOOLEAN DEFAULT true,

  -- תצוגת מחירים
  price_display VARCHAR(20) DEFAULT 'show_client_price',

  -- הודעות
  notify_on_update BOOLEAN DEFAULT true,
  notify_on_message BOOLEAN DEFAULT true,
  notify_on_approval_needed BOOLEAN DEFAULT true,

  -- ברנדינג
  custom_welcome_message TEXT,
  show_designer_logo BOOLEAN DEFAULT true,

  -- סטטיסטיקות
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_price_display CHECK (price_display IN (
    'hide', 'show_retail', 'show_client_price', 'show_all'
  ))
);

-- Indexes
CREATE INDEX idx_client_portal_settings_tenant ON client_portal_settings(tenant_id);
CREATE INDEX idx_client_portal_settings_token ON client_portal_settings(token);

-- RLS
ALTER TABLE client_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON client_portal_settings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- יצירת token אוטומטית
CREATE OR REPLACE FUNCTION generate_portal_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token IS NULL THEN
    NEW.token := encode(gen_random_bytes(32), 'hex');
  END IF;
  NEW.public_url := '/portal/' || NEW.token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_portal_token
  BEFORE INSERT ON client_portal_settings
  FOR EACH ROW EXECUTE FUNCTION generate_portal_token();
```

## שדות מחושבים

```typescript
interface ClientPortalSettingsComputed {
  // פרטי הפרויקט
  project: {
    id: string;
    name: string;
    code?: string;
    phase: string;
  };

  // פרטי הלקוח
  client: {
    id: string;
    name: string;
    email: string;
  };

  // סיכום מה נראה לפורטל
  visibleSections: string[];

  // פריטים הממתינים לאישור
  pendingApprovalsCount: number;

  // קישור מלא לפורטל
  fullPortalUrl: string;
}
```

## API Endpoints

```typescript
// ניהול הגדרות (צד המעצב)
GET    /api/projects/:projectId/portal-settings
PATCH  /api/projects/:projectId/portal-settings
POST   /api/projects/:projectId/portal-settings/regenerate-token

// צד הלקוח (Public API - לא דורש auth)
GET    /api/portal/:token/dashboard
GET    /api/portal/:token/products
GET    /api/portal/:token/moodboards
GET    /api/portal/:token/documents
GET    /api/portal/:token/schedule
GET    /api/portal/:token/payments
POST   /api/portal/:token/approve
POST   /api/portal/:token/comment
POST   /api/portal/:token/change-request

// Request
interface PortalApprovalRequest {
  entityType: 'moodboard' | 'product' | 'design_option';
  entityId: string;
  status: 'approved' | 'rejected' | 'revision_requested';
  comment?: string;
  clientName?: string;
  clientEmail?: string;
}
```

---

# ג. ClientApproval - בקשות אישור

מעקב אחר כל האישורים הנדרשים מהלקוח.

## Interface

```typescript
interface ClientApproval {
  id: string;
  tenantId: string;
  projectId: string;
  portalSettingsId: string;

  // מה דורש אישור (פולימורפי)
  entityType: ClientApprovalEntityType;
  entityId: string;
  entityName: string;

  // סטטוס
  status: ClientApprovalStatus;
  comment?: string;

  // פרטי המאשר
  clientName?: string;
  clientEmail?: string;

  // זמנים
  requestedAt: Date;
  respondedAt?: Date;

  // תזכורות
  remindersSent: number;
  lastReminderAt?: Date;

  createdAt: Date;
}

type ClientApprovalEntityType =
  | 'moodboard'
  | 'product'
  | 'design_option'
  | 'document'
  | 'proposal'
  | 'change_order';

type ClientApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision_requested';
```

## Database Schema

```sql
-- טבלת אישורי לקוח
CREATE TABLE client_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  portal_settings_id UUID NOT NULL REFERENCES client_portal_settings(id),

  -- פולימורפי
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,

  -- סטטוס
  status VARCHAR(20) DEFAULT 'pending',
  comment TEXT,

  -- פרטי המאשר
  client_name VARCHAR(255),
  client_email VARCHAR(255),

  -- זמנים
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,

  -- תזכורות
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'moodboard', 'product', 'design_option', 'document', 'proposal', 'change_order'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'approved', 'rejected', 'revision_requested'
  )),
  CONSTRAINT unique_pending_approval UNIQUE (tenant_id, entity_type, entity_id, status)
    WHERE status = 'pending'
);

-- Indexes
CREATE INDEX idx_client_approvals_tenant ON client_approvals(tenant_id);
CREATE INDEX idx_client_approvals_project ON client_approvals(tenant_id, project_id);
CREATE INDEX idx_client_approvals_pending ON client_approvals(tenant_id, project_id, status)
  WHERE status = 'pending';
CREATE INDEX idx_client_approvals_entity ON client_approvals(tenant_id, entity_type, entity_id);

-- RLS
ALTER TABLE client_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON client_approvals
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface ClientApprovalComputed {
  // זמן המתנה
  waitingTime: string;               // "3 ימים"

  // האם דחוף
  isUrgent: boolean;                 // מעל 7 ימים

  // פרטי הישות המקושרת
  entity: {
    type: string;
    name: string;
    thumbnail?: string;
    url: string;
  };

  // פרטי הפרויקט
  project: {
    id: string;
    name: string;
  };
}
```

## API Endpoints

```typescript
// CRUD
GET    /api/projects/:projectId/approvals
GET    /api/approvals/pending                  // כל הפרויקטים
POST   /api/approvals/:id/remind               // שלח תזכורת
POST   /api/approvals/:id/cancel               // בטל בקשה

// Response
interface ApprovalsResponse {
  approvals: ClientApproval[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}
```

## WebSocket Events

```typescript
const CLIENT_APPROVAL_EVENTS = {
  'approval.received': {
    channels: ['project:{projectId}'],
    payload: ClientApproval,
  },
  'approval.reminder_sent': {
    channels: ['project:{projectId}'],
    payload: { approvalId: string },
  },
};
```

---

# ד. MoodBoard - לוחות השראה

## Interface

```typescript
interface MoodBoard {
  id: string;
  tenantId: string;
  projectId?: string;                // אופציונלי - יכול להיות גלובלי
  roomId?: string;                   // קישור לחדר ספציפי

  // פרטים
  name: string;
  description?: string;

  // סיווג
  categoryId?: string;
  styleId?: string;
  tags: string[];

  // גלובלי vs ספציפי לפרויקט
  isGlobal: boolean;
  linkedProjectIds: string[];        // לאיזה פרויקטים משויך (אם גלובלי)

  // תצוגה
  coverImageUrl?: string;

  // שיתוף עם לקוח
  isSharedWithClient: boolean;
  clientApprovalStatus?: ClientApprovalStatus;
  clientFeedback?: string;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## Database Schema

```sql
-- טבלת לוחות השראה
CREATE TABLE mood_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  room_id UUID REFERENCES rooms(id),

  -- פרטים
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- סיווג
  category_id UUID REFERENCES configurable_entities(id),
  style_id UUID REFERENCES configurable_entities(id),
  tags TEXT[] DEFAULT '{}',

  -- גלובלי
  is_global BOOLEAN DEFAULT false,
  linked_project_ids UUID[] DEFAULT '{}',

  -- תצוגה
  cover_image_url VARCHAR(500),

  -- שיתוף
  is_shared_with_client BOOLEAN DEFAULT false,
  client_approval_status VARCHAR(20),
  client_feedback TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_client_approval_status CHECK (
    client_approval_status IS NULL OR
    client_approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')
  )
);

-- Indexes
CREATE INDEX idx_mood_boards_tenant ON mood_boards(tenant_id);
CREATE INDEX idx_mood_boards_project ON mood_boards(tenant_id, project_id);
CREATE INDEX idx_mood_boards_global ON mood_boards(tenant_id, is_global)
  WHERE is_global = true;
CREATE INDEX idx_mood_boards_room ON mood_boards(tenant_id, room_id);
CREATE INDEX idx_mood_boards_tags ON mood_boards USING gin(tags);

-- RLS
ALTER TABLE mood_boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mood_boards
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface MoodBoardComputed {
  // יוצר
  createdByUser: {
    id: string;
    name: string;
    avatar?: string;
  };

  // פרויקט
  project?: {
    id: string;
    name: string;
  };

  // חדר
  room?: {
    id: string;
    name: string;
  };

  // פריטים
  itemCount: number;
  items: MoodBoardItem[];

  // סטטיסטיקות
  imageCount: number;
  productCount: number;
  colorCount: number;
}
```

## API Endpoints

```typescript
// CRUD
GET    /api/mood-boards
GET    /api/mood-boards/:id
POST   /api/mood-boards
PATCH  /api/mood-boards/:id
DELETE /api/mood-boards/:id

// לפי פרויקט
GET    /api/projects/:projectId/mood-boards

// לפי חדר
GET    /api/rooms/:roomId/mood-boards

// גלובליים
GET    /api/mood-boards/global

// שיתוף
PATCH  /api/mood-boards/:id/share
POST   /api/mood-boards/:id/request-approval

// Request
interface CreateMoodBoardRequest {
  name: string;
  description?: string;
  projectId?: string;
  roomId?: string;
  categoryId?: string;
  styleId?: string;
  tags?: string[];
  isGlobal?: boolean;
}
```

---

# ה. MoodBoardItem - פריטים בלוח השראה

## Interface

```typescript
interface MoodBoardItem {
  id: string;
  tenantId: string;
  moodBoardId: string;

  // סוג הפריט
  type: MoodBoardItemType;

  // תוכן לפי סוג
  imageUrl?: string;                 // type = 'image'
  productId?: string;                // type = 'product'
  colorHex?: string;                 // type = 'color'
  colorName?: string;
  materialName?: string;             // type = 'material'
  materialImageUrl?: string;
  text?: string;                     // type = 'text'
  linkUrl?: string;                  // type = 'link'
  linkTitle?: string;

  // תצוגה
  size: MoodBoardItemSize;
  caption?: string;

  // סדר
  order: number;

  createdAt: Date;
}

type MoodBoardItemType =
  | 'image'
  | 'product'
  | 'color'
  | 'material'
  | 'text'
  | 'link';

type MoodBoardItemSize =
  | 'small'
  | 'medium'
  | 'large';
```

## Database Schema

```sql
-- טבלת פריטים בלוח השראה
CREATE TABLE mood_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  mood_board_id UUID NOT NULL REFERENCES mood_boards(id) ON DELETE CASCADE,

  -- סוג
  type VARCHAR(20) NOT NULL,

  -- תוכן
  image_url VARCHAR(500),
  product_id UUID REFERENCES products(id),
  color_hex VARCHAR(7),
  color_name VARCHAR(50),
  material_name VARCHAR(100),
  material_image_url VARCHAR(500),
  text TEXT,
  link_url VARCHAR(500),
  link_title VARCHAR(255),

  -- תצוגה
  size VARCHAR(10) DEFAULT 'medium',
  caption VARCHAR(500),

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN (
    'image', 'product', 'color', 'material', 'text', 'link'
  )),
  CONSTRAINT valid_size CHECK (size IN ('small', 'medium', 'large'))
);

-- Indexes
CREATE INDEX idx_mood_board_items_tenant ON mood_board_items(tenant_id);
CREATE INDEX idx_mood_board_items_board ON mood_board_items(mood_board_id, "order");

-- RLS
ALTER TABLE mood_board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mood_board_items
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## API Endpoints

```typescript
// CRUD
GET    /api/mood-boards/:moodBoardId/items
POST   /api/mood-boards/:moodBoardId/items
PATCH  /api/mood-board-items/:id
DELETE /api/mood-board-items/:id

// סדר
PATCH  /api/mood-boards/:moodBoardId/items/reorder

// Request
interface CreateMoodBoardItemRequest {
  type: MoodBoardItemType;
  imageUrl?: string;
  productId?: string;
  colorHex?: string;
  colorName?: string;
  materialName?: string;
  materialImageUrl?: string;
  text?: string;
  linkUrl?: string;
  linkTitle?: string;
  size?: MoodBoardItemSize;
  caption?: string;
}

interface ReorderItemsRequest {
  items: { id: string; order: number }[];
}
```

---

# ו. ChangeOrder - בקשות שינוי

מנגנון קריטי למניעת Scope Creep - בעיה שמזוהה על ידי 50%+ מהמעצבים כגורם #1 לפגיעה ברווחיות.

## Interface

```typescript
interface ChangeOrder {
  id: string;
  tenantId: string;
  projectId: string;

  // מזהה
  changeOrderNumber: string;         // CO-001
  title: string;
  description: string;

  // מקור הבקשה
  requestedBy: ChangeOrderRequestedBy;
  requestDate: Date;

  // סיבה
  reason: ChangeOrderReason;

  // השפעה על תקציב (חיובי או שלילי)
  originalBudgetImpact: number;
  approvedBudgetImpact?: number;
  currency: string;

  // השפעה על לו"ז (ימים)
  originalScheduleImpact: number;
  approvedScheduleImpact?: number;

  // פריטים
  items: ChangeOrderItem[];

  // סטטוס
  status: ChangeOrderStatus;

  // אישור לקוח
  requiresClientApproval: boolean;
  clientApprovalStatus?: ClientApprovalStatus;
  clientApprovedAt?: Date;
  clientApprovalToken?: string;
  clientComments?: string;

  // אישור פנימי
  internalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  internalApprovedBy?: string;
  internalApprovedAt?: Date;

  // קבצים
  attachments: string[];

  // קישור לתשלום (אם נוצר)
  paymentId?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

type ChangeOrderRequestedBy =
  | 'client'
  | 'designer'
  | 'contractor'
  | 'other';

type ChangeOrderReason =
  | 'client_request'
  | 'design_improvement'
  | 'site_condition'
  | 'material_unavailable'
  | 'regulation'
  | 'error_correction'
  | 'other';

type ChangeOrderStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_client_approval'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'cancelled';

interface ChangeOrderItem {
  id: string;
  changeOrderId: string;

  // סוג שינוי
  type: 'add' | 'remove' | 'modify';
  category: 'design' | 'product' | 'service' | 'construction';
  description: string;

  // עלות
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;

  // קישורים
  roomId?: string;
  productId?: string;

  order: number;
}
```

## Database Schema

```sql
-- טבלת בקשות שינוי
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  -- מזהה
  change_order_number VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- מקור
  requested_by VARCHAR(20) NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason VARCHAR(30) NOT NULL,

  -- השפעה
  original_budget_impact DECIMAL(12, 2) NOT NULL,
  approved_budget_impact DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'ILS',
  original_schedule_impact INTEGER NOT NULL,
  approved_schedule_impact INTEGER,

  -- סטטוס
  status VARCHAR(30) DEFAULT 'draft',

  -- אישור לקוח
  requires_client_approval BOOLEAN DEFAULT true,
  client_approval_status VARCHAR(20),
  client_approved_at TIMESTAMPTZ,
  client_approval_token VARCHAR(64),
  client_comments TEXT,

  -- אישור פנימי
  internal_approval_status VARCHAR(20),
  internal_approved_by UUID REFERENCES users(id),
  internal_approved_at TIMESTAMPTZ,

  -- קבצים
  attachments TEXT[] DEFAULT '{}',

  -- קישור לתשלום
  payment_id UUID REFERENCES payments(id),

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_requested_by CHECK (requested_by IN ('client', 'designer', 'contractor', 'other')),
  CONSTRAINT valid_reason CHECK (reason IN (
    'client_request', 'design_improvement', 'site_condition',
    'material_unavailable', 'regulation', 'error_correction', 'other'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'draft', 'pending_review', 'pending_client_approval',
    'approved', 'rejected', 'implemented', 'cancelled'
  )),
  CONSTRAINT unique_change_order_number UNIQUE (tenant_id, change_order_number)
);

-- טבלת פריטי שינוי
CREATE TABLE change_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,

  -- פרטים
  type VARCHAR(10) NOT NULL,
  category VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,

  -- עלות
  quantity DECIMAL(10, 2),
  unit_price DECIMAL(12, 2),
  total_price DECIMAL(12, 2) NOT NULL,

  -- קישורים
  room_id UUID REFERENCES rooms(id),
  product_id UUID REFERENCES products(id),

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('add', 'remove', 'modify')),
  CONSTRAINT valid_category CHECK (category IN ('design', 'product', 'service', 'construction'))
);

-- Indexes
CREATE INDEX idx_change_orders_tenant ON change_orders(tenant_id);
CREATE INDEX idx_change_orders_project ON change_orders(tenant_id, project_id);
CREATE INDEX idx_change_orders_status ON change_orders(tenant_id, status);
CREATE INDEX idx_change_order_items_order ON change_order_items(change_order_id, "order");

-- RLS
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON change_orders
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE change_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON change_order_items
  USING (change_order_id IN (
    SELECT id FROM change_orders WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

-- Auto-generate number
CREATE OR REPLACE FUNCTION generate_change_order_number()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM change_orders
  WHERE tenant_id = NEW.tenant_id
    AND project_id = NEW.project_id;

  NEW.change_order_number := 'CO-' || LPAD(v_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_change_order_number
  BEFORE INSERT ON change_orders
  FOR EACH ROW
  WHEN (NEW.change_order_number IS NULL)
  EXECUTE FUNCTION generate_change_order_number();
```

## שדות מחושבים

```typescript
interface ChangeOrderComputed {
  // יוצר
  createdByUser: {
    id: string;
    name: string;
  };

  // פרויקט
  project: {
    id: string;
    name: string;
    originalBudget: number;
  };

  // סיכומים
  totalItems: number;
  netBudgetImpact: number;           // סכום כל הפריטים

  // אחוז שינוי מתקציב
  budgetChangePercent: number;

  // סטטוס מעוצב
  statusLabel: string;
  statusColor: string;

  // האם מאושר
  isFullyApproved: boolean;
}
```

## API Endpoints

```typescript
// CRUD
GET    /api/projects/:projectId/change-orders
GET    /api/change-orders/:id
POST   /api/projects/:projectId/change-orders
PATCH  /api/change-orders/:id
DELETE /api/change-orders/:id

// פריטים
POST   /api/change-orders/:id/items
PATCH  /api/change-order-items/:itemId
DELETE /api/change-order-items/:itemId

// Workflow
POST   /api/change-orders/:id/submit               // שלח לאישור
POST   /api/change-orders/:id/approve              // אישור פנימי
POST   /api/change-orders/:id/reject               // דחייה פנימית
POST   /api/change-orders/:id/send-to-client       // שלח ללקוח
POST   /api/change-orders/:id/implement            // סמן כמיושם
POST   /api/change-orders/:id/create-payment       // צור תשלום נוסף

// Request
interface CreateChangeOrderRequest {
  title: string;
  description: string;
  requestedBy: ChangeOrderRequestedBy;
  reason: ChangeOrderReason;
  originalBudgetImpact: number;
  originalScheduleImpact: number;
  requiresClientApproval?: boolean;
  items: CreateChangeOrderItemRequest[];
}

interface CreateChangeOrderItemRequest {
  type: 'add' | 'remove' | 'modify';
  category: 'design' | 'product' | 'service' | 'construction';
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
  roomId?: string;
  productId?: string;
}
```

## WebSocket Events

```typescript
const CHANGE_ORDER_EVENTS = {
  'change_order.created': {
    channels: ['project:{projectId}'],
    payload: ChangeOrder,
  },
  'change_order.status_changed': {
    channels: ['project:{projectId}'],
    payload: { id: string, status: string, previousStatus: string },
  },
  'change_order.client_approved': {
    channels: ['project:{projectId}'],
    payload: { id: string },
  },
};
```

---

# ז. DesignOption - אופציות עיצוב

מעצבים מציגים בדרך כלל 2-3 אופציות ללקוח לבחירה.

## Interface

```typescript
interface DesignOption {
  id: string;
  tenantId: string;
  projectId: string;
  roomId?: string;

  // פרטים
  name: string;                      // "אופציה א'", "קונספט מודרני"
  description?: string;

  // סוג
  type: DesignOptionType;

  // תמונות
  images: DesignOptionImage[];

  // עלות משוערת
  estimatedCost?: number;
  currency?: string;

  // סטטוס
  status: DesignOptionStatus;

  // הצגה
  presentedAt?: Date;
  presentedBy?: string;

  // משוב לקוח
  clientFeedback?: string;
  clientApprovedAt?: Date;
  rejectionReason?: string;

  // האם נבחרה
  isSelected: boolean;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

type DesignOptionType =
  | 'concept'                        // קונספט כללי
  | 'layout'                         // תכנון
  | 'material'                       // חומרים
  | 'color'                          // צבעים
  | 'furniture'                      // ריהוט
  | 'full_design';                   // עיצוב מלא

type DesignOptionStatus =
  | 'draft'
  | 'internal_review'
  | 'presented'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

interface DesignOptionImage {
  url: string;
  type: DesignOptionImageType;
  caption?: string;
  order: number;
}

type DesignOptionImageType =
  | 'render'
  | 'plan'
  | 'elevation'
  | 'section'
  | 'detail'
  | 'moodboard'
  | 'sketch'
  | 'photo';
```

## Database Schema

```sql
-- טבלת אופציות עיצוב
CREATE TABLE design_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  room_id UUID REFERENCES rooms(id),

  -- פרטים
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,

  -- תמונות
  images JSONB DEFAULT '[]',

  -- עלות
  estimated_cost DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'ILS',

  -- סטטוס
  status VARCHAR(20) DEFAULT 'draft',

  -- הצגה
  presented_at TIMESTAMPTZ,
  presented_by UUID REFERENCES users(id),

  -- משוב
  client_feedback TEXT,
  client_approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- בחירה
  is_selected BOOLEAN DEFAULT false,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN (
    'concept', 'layout', 'material', 'color', 'furniture', 'full_design'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'draft', 'internal_review', 'presented', 'approved', 'rejected', 'revision_requested'
  ))
);

-- Indexes
CREATE INDEX idx_design_options_tenant ON design_options(tenant_id);
CREATE INDEX idx_design_options_project ON design_options(tenant_id, project_id);
CREATE INDEX idx_design_options_room ON design_options(tenant_id, room_id);
CREATE INDEX idx_design_options_selected ON design_options(tenant_id, project_id, is_selected)
  WHERE is_selected = true;

-- RLS
ALTER TABLE design_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON design_options
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## API Endpoints

```typescript
// CRUD
GET    /api/projects/:projectId/design-options
GET    /api/design-options/:id
POST   /api/projects/:projectId/design-options
PATCH  /api/design-options/:id
DELETE /api/design-options/:id

// לפי חדר
GET    /api/rooms/:roomId/design-options

// תמונות
POST   /api/design-options/:id/images
DELETE /api/design-options/:id/images/:index
PATCH  /api/design-options/:id/images/reorder

// Workflow
POST   /api/design-options/:id/present              // הצג ללקוח
POST   /api/design-options/:id/select               // בחר אופציה זו
POST   /api/design-options/:id/request-approval     // בקש אישור

// Request
interface CreateDesignOptionRequest {
  name: string;
  description?: string;
  type: DesignOptionType;
  roomId?: string;
  estimatedCost?: number;
  images?: DesignOptionImage[];
}
```

---

# ח. SnagItem - ליקויים

רשימת ליקויים לתיקון - קריטי לשלב המסירה.

## Interface

```typescript
interface SnagItem {
  id: string;
  tenantId: string;
  projectId: string;
  roomId?: string;

  // מזהה
  snagNumber: string;                // SN-001

  // פרטים
  title: string;
  description: string;
  location: string;                  // תיאור מיקום מדויק

  // תמונות
  images: string[];

  // סיווג
  category: SnagCategory;
  severity: SnagSeverity;

  // אחריות
  responsibleParty: SnagResponsibleParty;
  responsibleEntityId?: string;
  responsibleEntityName?: string;

  // סטטוס
  status: SnagStatus;

  // תאריכים
  reportedAt: Date;
  reportedBy: string;
  dueDate?: Date;
  fixedAt?: Date;
  fixedBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;

  // תיקון
  fixDescription?: string;
  fixImages: string[];

  // הערות
  notes?: string;
  internalNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

type SnagCategory =
  | 'defect'                         // פגם
  | 'incomplete'                     // לא הושלם
  | 'damage'                         // נזק
  | 'wrong_item'                     // פריט שגוי
  | 'quality'                        // בעיית איכות
  | 'missing'                        // חסר
  | 'other';

type SnagSeverity =
  | 'cosmetic'                       // קוסמטי
  | 'minor'                          // קל
  | 'major'                          // משמעותי
  | 'critical';                      // קריטי

type SnagResponsibleParty =
  | 'contractor'
  | 'supplier'
  | 'designer'
  | 'installer'
  | 'unknown';

type SnagStatus =
  | 'open'                           // פתוח
  | 'assigned'                       // הוקצה
  | 'in_progress'                    // בטיפול
  | 'fixed'                          // תוקן
  | 'verified'                       // אומת
  | 'wont_fix'                       // לא יתוקן
  | 'disputed';                      // במחלוקת
```

## Database Schema

```sql
-- טבלת ליקויים
CREATE TABLE snag_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  room_id UUID REFERENCES rooms(id),

  -- מזהה
  snag_number VARCHAR(20) NOT NULL,

  -- פרטים
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NOT NULL,

  -- תמונות
  images TEXT[] DEFAULT '{}',

  -- סיווג
  category VARCHAR(20) NOT NULL,
  severity VARCHAR(10) NOT NULL,

  -- אחריות
  responsible_party VARCHAR(20) NOT NULL DEFAULT 'unknown',
  responsible_entity_id UUID,
  responsible_entity_name VARCHAR(255),

  -- סטטוס
  status VARCHAR(15) DEFAULT 'open',

  -- תאריכים
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  reported_by UUID NOT NULL REFERENCES users(id),
  due_date DATE,
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),

  -- תיקון
  fix_description TEXT,
  fix_images TEXT[] DEFAULT '{}',

  -- הערות
  notes TEXT,
  internal_notes TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_category CHECK (category IN (
    'defect', 'incomplete', 'damage', 'wrong_item', 'quality', 'missing', 'other'
  )),
  CONSTRAINT valid_severity CHECK (severity IN ('cosmetic', 'minor', 'major', 'critical')),
  CONSTRAINT valid_responsible_party CHECK (responsible_party IN (
    'contractor', 'supplier', 'designer', 'installer', 'unknown'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'open', 'assigned', 'in_progress', 'fixed', 'verified', 'wont_fix', 'disputed'
  )),
  CONSTRAINT unique_snag_number UNIQUE (tenant_id, project_id, snag_number)
);

-- Indexes
CREATE INDEX idx_snag_items_tenant ON snag_items(tenant_id);
CREATE INDEX idx_snag_items_project ON snag_items(tenant_id, project_id);
CREATE INDEX idx_snag_items_status ON snag_items(tenant_id, project_id, status);
CREATE INDEX idx_snag_items_severity ON snag_items(tenant_id, severity);
CREATE INDEX idx_snag_items_room ON snag_items(tenant_id, room_id);

-- RLS
ALTER TABLE snag_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON snag_items
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Auto-generate number
CREATE OR REPLACE FUNCTION generate_snag_number()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM snag_items
  WHERE tenant_id = NEW.tenant_id
    AND project_id = NEW.project_id;

  NEW.snag_number := 'SN-' || LPAD(v_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_snag_number
  BEFORE INSERT ON snag_items
  FOR EACH ROW
  WHEN (NEW.snag_number IS NULL)
  EXECUTE FUNCTION generate_snag_number();
```

## שדות מחושבים

```typescript
interface SnagItemComputed {
  // מדווח
  reportedByUser: {
    id: string;
    name: string;
  };

  // מתקן
  fixedByUser?: {
    id: string;
    name: string;
  };

  // מאמת
  verifiedByUser?: {
    id: string;
    name: string;
  };

  // חדר
  room?: {
    id: string;
    name: string;
  };

  // גיל הליקוי
  age: string;                       // "5 ימים"

  // האם באיחור
  isOverdue: boolean;

  // צבעים לפי severity
  severityColor: string;
  severityIcon: string;

  // סטטוס מעוצב
  statusLabel: string;
  statusColor: string;
}
```

## תהליך Snag List

```typescript
const SNAG_LIST_WORKFLOW = {
  steps: [
    {
      id: 'report',
      name: 'פתיחה',
      description: 'דיווח על ליקוי עם תמונות ומיקום',
    },
    {
      id: 'assign',
      name: 'הקצאה',
      description: 'שיוך לאחראי (ספק/קבלן/מתקין)',
    },
    {
      id: 'fix',
      name: 'טיפול',
      description: 'האחראי מתקן ומדווח',
    },
    {
      id: 'verify',
      name: 'אימות',
      description: 'המעצב/מנהל מאמת שהתיקון תקין',
    },
    {
      id: 'close',
      name: 'סגירה',
      description: 'הליקוי מסומן כתוקן ואומת',
    },
  ],
};
```

## API Endpoints

```typescript
// CRUD
GET    /api/projects/:projectId/snag-items
GET    /api/snag-items/:id
POST   /api/projects/:projectId/snag-items
PATCH  /api/snag-items/:id
DELETE /api/snag-items/:id

// לפי חדר
GET    /api/rooms/:roomId/snag-items

// תמונות
POST   /api/snag-items/:id/images
DELETE /api/snag-items/:id/images/:index

// Workflow
POST   /api/snag-items/:id/assign
POST   /api/snag-items/:id/mark-fixed
POST   /api/snag-items/:id/verify
POST   /api/snag-items/:id/reopen
POST   /api/snag-items/:id/dispute

// דוחות
GET    /api/projects/:projectId/snag-items/summary
GET    /api/projects/:projectId/snag-items/export

// Request
interface CreateSnagItemRequest {
  title: string;
  description: string;
  location: string;
  roomId?: string;
  category: SnagCategory;
  severity: SnagSeverity;
  images?: string[];
  responsibleParty?: SnagResponsibleParty;
  dueDate?: string;
}

interface AssignSnagItemRequest {
  responsibleParty: SnagResponsibleParty;
  responsibleEntityId?: string;
  dueDate?: string;
  notes?: string;
}

interface MarkSnagFixedRequest {
  fixDescription: string;
  fixImages?: string[];
}
```

## WebSocket Events

```typescript
const SNAG_ITEM_EVENTS = {
  'snag_item.created': {
    channels: ['project:{projectId}'],
    payload: SnagItem,
  },
  'snag_item.status_changed': {
    channels: ['project:{projectId}'],
    payload: { id: string, status: string, previousStatus: string },
  },
  'snag_item.fixed': {
    channels: ['project:{projectId}'],
    payload: { id: string },
  },
  'snag_item.verified': {
    channels: ['project:{projectId}'],
    payload: { id: string },
  },
};
```

---

# ט. הנחיות UI

## Client Portal UI

```typescript
interface ClientPortalUI {
  // Header
  header: {
    designerLogo: boolean;
    projectName: true;
    clientName: true;
  };

  // Dashboard
  dashboard: {
    welcomeMessage: true;
    progressBar: true;
    pendingApprovals: true;
    upcomingMilestones: true;
    paymentSummary: true;
  };

  // Navigation
  navigation: {
    style: 'tabs' | 'sidebar';
    sections: ['overview', 'products', 'moodboards', 'documents', 'payments'];
  };

  // Actions
  actions: {
    approve: { style: 'button', color: 'green' };
    reject: { style: 'button', color: 'red' };
    comment: { style: 'text_area' };
    requestChange: { style: 'form' };
  };
}
```

## MoodBoard Editor

```typescript
interface MoodBoardEditorUI {
  // Canvas
  canvas: {
    grid: 'masonry' | 'grid' | 'free';
    itemSizes: ['small', 'medium', 'large'];
  };

  // Tools
  tools: {
    addImage: true;
    addProduct: true;
    addColor: true;
    addText: true;
    addLink: true;
  };

  // Drag & Drop
  dragDrop: {
    reorder: true;
    resize: true;
    fromLibrary: true;
  };

  // Sharing
  sharing: {
    shareWithClient: true;
    requestApproval: true;
    export: ['pdf', 'image'];
  };
}
```

## Snag List UI

```typescript
interface SnagListUI {
  // תצוגה
  views: ['list', 'kanban', 'gallery'];

  // סינון
  filters: {
    status: true;
    severity: true;
    category: true;
    room: true;
    responsibleParty: true;
  };

  // כרטיס ליקוי
  snagCard: {
    showImage: true;
    showSeverityBadge: true;
    showStatus: true;
    showAge: true;
    quickActions: ['assign', 'mark_fixed', 'verify'];
  };

  // מובייל
  mobile: {
    cameraCapture: true;
    voiceNote: false;
    gps: true;
  };
}
```

---

# י. אוטומציות מומלצות

## אישור מוצר → עדכון סטטוס

```typescript
const PRODUCT_APPROVAL_AUTOMATION = {
  trigger: { type: 'entity_updated', entityType: 'client_approval' },
  conditions: [
    { field: 'entityType', operator: 'equals', value: 'product' },
    { field: 'status', operator: 'equals', value: 'approved' },
  ],
  actions: [{
    type: 'update_field',
    config: {
      entityType: 'room_product',
      entityId: '{{entityId}}',
      fieldName: 'clientApprovalStatus',
      fieldValue: 'approved',
    },
  }],
};
```

## ליקוי קריטי → התראה למנהל

```typescript
const CRITICAL_SNAG_AUTOMATION = {
  trigger: { type: 'entity_created', entityType: 'snag_item' },
  conditions: [
    { field: 'severity', operator: 'equals', value: 'critical' },
  ],
  actions: [{
    type: 'create_notification',
    config: {
      userRole: 'manager',
      type: 'system',
      title: 'ליקוי קריטי חדש',
      body: '{{title}} - {{project.name}}',
    },
  }, {
    type: 'send_email',
    config: {
      to: 'manager',
      templateId: 'critical_snag_alert',
    },
  }],
};
```

## בקשת שינוי מאושרת → תשלום

```typescript
const CHANGE_ORDER_APPROVED_AUTOMATION = {
  trigger: { type: 'status_changed', entityType: 'change_order', toStatus: 'approved' },
  conditions: [
    { field: 'approvedBudgetImpact', operator: 'greater_than', value: 0 },
  ],
  actions: [{
    type: 'create_task',
    config: {
      taskTemplate: {
        title: 'יצירת תשלום עבור בקשת שינוי {{changeOrderNumber}}',
        dueInDays: 3,
      },
    },
  }],
};
```

---

# יא. קשרים לקבצים אחרים

| קובץ | ישויות קשורות | סוג הקשר |
|------|---------------|----------|
| `03-project-client.md` | Project, Client | ClientPortalSettings.projectId |
| `04-tasks-docs-meetings.md` | Room, Document | MoodBoard.roomId, SnagItem.roomId |
| `05-products-ffe.md` | Product, RoomProduct | MoodBoardItem.productId, ChangeOrderItem.productId |
| `06-financial.md` | Payment | ChangeOrder.paymentId |
| `07-collaboration.md` | Comment, Notification | ClientApproval triggers |
| `09-automations.md` | AutomationRule | Approval triggers |

---

**הפניות:**
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
- ישויות Project: `03-project-client.md`
- ישויות Financial: `06-financial.md`
