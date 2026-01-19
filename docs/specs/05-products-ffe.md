# Products & FF&E - מוצרים ורכש
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## מודול Products & FF&E

מודול זה מנהל את מחזור החיים המלא של מוצרים - מספריית מוצרים גלובלית, דרך הוספה לחדרים, אישור לקוח, הזמנת רכש, מעקב משלוחים והתקנה.

## תהליך FF&E (Furniture, Fixtures & Equipment)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Specification│ → │   Client    │ → │ Procurement │
│   בחירה     │    │  Approval   │    │    רכש      │
└─────────────┘    └─────────────┘    └─────────────┘
                          ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Installation│ ← │  Delivery   │ ← │  Tracking   │
│   התקנה    │    │   אספקה     │    │   מעקב     │
└─────────────┘    └─────────────┘    └─────────────┘
```

**שלבים:**
1. **Specification** - בחירת מוצר מהספרייה והוספה לחדר
2. **Client Approval** - הלקוח מאשר/דוחה ב-Client Portal
3. **Procurement** - יצירת הזמנת רכש (PO) לספק
4. **Tracking** - מעקב Lead Times ומשלוחים
5. **Delivery** - קבלת סחורה ובדיקת איכות
6. **Installation** - התקנה ובקרת איכות

---

# ב. ישויות

## 1. Product (מוצר בספרייה)

ספריית מוצרים גלובלית ברמת ה-Tenant - לשימוש חוזר בכל הפרויקטים.

### Interface

```typescript
interface Product {
  id: string;
  tenantId: string;

  // פרטי מוצר
  name: string;
  sku?: string;                     // קוד מוצר פנימי
  description?: string;
  categoryId?: string;              // ProductCategory מ-ConfigurableEntity

  // ספק
  supplierId?: string;              // → Supplier (03-project-client.md)
  supplierSku?: string;             // קוד מוצר אצל הספק

  // מחירים
  costPrice?: number;               // מחיר עלות (מהספק)
  retailPrice?: number;             // מחיר מחירון
  currency: string;                 // ברירת מחדל מ-Tenant

  // מידות
  width?: number;
  height?: number;
  depth?: number;
  unit: DimensionUnit;              // 'cm' | 'in' | 'mm'

  // זמני אספקה
  leadTimeDays?: number;            // זמן אספקה ממוצע בימים

  // מדיה
  imageUrl?: string;                // תמונה ראשית
  images?: string[];                // גלריית תמונות
  productUrl?: string;              // קישור לאתר הספק
  specSheetUrl?: string;            // מפרט טכני

  // תיוג
  tags?: string[];

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- פרטי מוצר
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  category_id UUID REFERENCES configurable_entities(id),

  -- ספק
  supplier_id UUID REFERENCES suppliers(id),
  supplier_sku VARCHAR(100),

  -- מחירים
  cost_price DECIMAL(12, 2),
  retail_price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'ILS',

  -- מידות
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  depth DECIMAL(10, 2),
  unit VARCHAR(5) DEFAULT 'cm',

  -- זמני אספקה
  lead_time_days INTEGER,

  -- מדיה
  image_url TEXT,
  images JSONB DEFAULT '[]',
  product_url TEXT,
  spec_sheet_url TEXT,

  -- תיוג
  tags JSONB DEFAULT '[]',

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT products_tenant_sku_unique UNIQUE (tenant_id, sku)
);

-- Indexes
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('hebrew', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sku, ''))
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON products USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface ProductComputed {
  // מידות מפורמטות
  dimensionsFormatted: string;      // "120 × 80 × 45 cm"

  // מחיר עם markup
  suggestedClientPrice: number;     // costPrice * (1 + defaultMarkup)

  // שימוש
  usageCount: number;               // כמה פעמים נעשה שימוש בפרויקטים
  lastUsedAt: Date | null;

  // זמינות ספק
  supplierName: string | null;
  isSupplierActive: boolean;
}
```

### API Endpoints

```yaml
# Product CRUD
GET    /api/products                  # רשימת מוצרים (עם pagination, filters)
POST   /api/products                  # יצירת מוצר חדש
GET    /api/products/:id              # קבלת מוצר
PATCH  /api/products/:id              # עדכון מוצר
DELETE /api/products/:id              # מחיקת מוצר

# פעולות נוספות
GET    /api/products/search           # חיפוש מוצרים
POST   /api/products/import           # יבוא מוצרים מ-CSV/Excel
GET    /api/products/export           # ייצוא מוצרים

# סטטיסטיקות
GET    /api/products/:id/usage        # היסטוריית שימוש במוצר
```

### Query Parameters

```typescript
interface ProductListParams {
  // Pagination
  page?: number;
  pageSize?: number;

  // Filters
  categoryId?: string;
  supplierId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  hasImage?: boolean;

  // Search
  search?: string;

  // Sort
  sortBy?: 'name' | 'costPrice' | 'createdAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}
```

---

## 2. RoomProduct (מוצר בחדר)

מופע של מוצר בחדר ספציפי בפרויקט - עם כמות, מחיר ללקוח, סטטוס אישור וסטטוס רכש.

### Interface

```typescript
interface RoomProduct {
  id: string;
  tenantId: string;
  projectId: string;                // → Project (03-project-client.md)
  roomId: string;                   // → Room (04-tasks-docs-meetings.md)
  productId: string;                // → Product

  // כמות ומחירים
  quantity: number;
  costPrice: number;                // מחיר עלות (עותק מ-Product או ידני)
  retailPrice?: number;             // מחיר מחירון
  clientPrice: number;              // מחיר ללקוח (אחרי markup)
  markupPercent?: number;           // אחוז markup (או default מ-Tenant)

  // אישור לקוח
  clientApprovalStatus: ClientApprovalStatus;
  clientApprovedAt?: Date;
  clientFeedback?: string;          // משוב/הערות מהלקוח

  // סטטוס רכש
  procurementStatus: ProcurementStatus;

  // פרטי הזמנה
  purchaseOrderId?: string;         // → PurchaseOrder
  orderDate?: Date;
  vendorOrderNumber?: string;       // מספר הזמנה אצל הספק

  // מעקב משלוח
  estimatedLeadTime?: number;       // ימים
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;

  // התקנה
  installationRequired: boolean;
  installedAt?: Date;
  installedBy?: string;             // שם המתקין

  // בעיות
  hasIssue: boolean;
  issueType?: ProductIssueType;
  issueDescription?: string;
  issueResolvedAt?: Date;

  // הערות
  notes?: string;                   // גלוי ללקוח
  internalNotes?: string;           // פנימי בלבד

  // סדר
  order: number;

  // מטא
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE room_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),

  -- כמות ומחירים
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_price DECIMAL(12, 2) NOT NULL,
  retail_price DECIMAL(12, 2),
  client_price DECIMAL(12, 2) NOT NULL,
  markup_percent DECIMAL(5, 2),

  -- אישור לקוח
  client_approval_status VARCHAR(20) DEFAULT 'pending',
  client_approved_at TIMESTAMPTZ,
  client_feedback TEXT,

  -- סטטוס רכש
  procurement_status VARCHAR(20) DEFAULT 'not_ordered',

  -- פרטי הזמנה
  purchase_order_id UUID REFERENCES purchase_orders(id),
  order_date DATE,
  vendor_order_number VARCHAR(100),

  -- מעקב משלוח
  estimated_lead_time INTEGER,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),

  -- התקנה
  installation_required BOOLEAN DEFAULT false,
  installed_at TIMESTAMPTZ,
  installed_by VARCHAR(255),

  -- בעיות
  has_issue BOOLEAN DEFAULT false,
  issue_type VARCHAR(20),
  issue_description TEXT,
  issue_resolved_at TIMESTAMPTZ,

  -- הערות
  notes TEXT,
  internal_notes TEXT,

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT room_products_quantity_positive CHECK (quantity > 0),
  CONSTRAINT room_products_prices_positive CHECK (
    cost_price >= 0 AND client_price >= 0
  )
);

-- Indexes
CREATE INDEX idx_room_products_tenant_id ON room_products(tenant_id);
CREATE INDEX idx_room_products_project_id ON room_products(project_id);
CREATE INDEX idx_room_products_room_id ON room_products(room_id);
CREATE INDEX idx_room_products_product_id ON room_products(product_id);
CREATE INDEX idx_room_products_purchase_order_id ON room_products(purchase_order_id);
CREATE INDEX idx_room_products_approval_status ON room_products(tenant_id, client_approval_status);
CREATE INDEX idx_room_products_procurement_status ON room_products(tenant_id, procurement_status);

-- RLS
ALTER TABLE room_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON room_products USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface RoomProductComputed {
  // סכומים
  totalCost: number;                // costPrice * quantity
  totalClientPrice: number;         // clientPrice * quantity
  profit: number;                   // totalClientPrice - totalCost
  profitMargin: number;             // profit / totalClientPrice * 100

  // פרטי מוצר (מ-Product)
  productName: string;
  productSku: string | null;
  productImageUrl: string | null;

  // פרטי ספק (מ-Product→Supplier)
  supplierName: string | null;
  supplierId: string | null;

  // פרטי חדר (מ-Room)
  roomName: string;

  // סטטוס כללי
  overallStatus: 'pending_approval' | 'approved' | 'ordered' | 'in_transit' | 'delivered' | 'installed' | 'issue';

  // עיכובים
  isDelayed: boolean;               // estimatedDeliveryDate < today && !actualDeliveryDate
  delayDays: number | null;         // today - estimatedDeliveryDate
}
```

### API Endpoints

```yaml
# Room Product CRUD
GET    /api/projects/:projectId/rooms/:roomId/products       # מוצרים בחדר
POST   /api/projects/:projectId/rooms/:roomId/products       # הוספת מוצר לחדר
GET    /api/room-products/:id                                # קבלת מוצר בחדר
PATCH  /api/room-products/:id                                # עדכון מוצר בחדר
DELETE /api/room-products/:id                                # הסרת מוצר מחדר

# פעולות נוספות
PATCH  /api/room-products/:id/approval                       # עדכון סטטוס אישור
PATCH  /api/room-products/:id/procurement                    # עדכון סטטוס רכש
PATCH  /api/room-products/:id/delivery                       # עדכון פרטי משלוח
PATCH  /api/room-products/:id/installation                   # עדכון התקנה
POST   /api/room-products/:id/issue                          # דיווח על בעיה
PATCH  /api/room-products/:id/resolve-issue                  # פתרון בעיה

# Bulk operations
POST   /api/room-products/bulk/approval                      # אישור מרובה
POST   /api/room-products/bulk/add-to-po                     # הוספה ל-PO

# FF&E Schedule (תצוגה מרוכזת)
GET    /api/projects/:projectId/ffe-schedule                 # לוח FF&E מלא
GET    /api/projects/:projectId/ffe-schedule/export          # ייצוא Excel/PDF
```

### WebSocket Events

```typescript
// Events שנשלחים ב-channel: project:{projectId}
const ROOM_PRODUCT_EVENTS = {
  'room_product.created': 'מוצר נוסף לחדר',
  'room_product.updated': 'עדכון מוצר בחדר',
  'room_product.deleted': 'מוצר הוסר מחדר',
  'room_product.approval_changed': 'שינוי סטטוס אישור',
  'room_product.procurement_changed': 'שינוי סטטוס רכש',
  'room_product.delivery_update': 'עדכון משלוח',
  'room_product.installed': 'מוצר הותקן',
  'room_product.issue_reported': 'דווחה בעיה',
  'room_product.issue_resolved': 'בעיה נפתרה',
};
```

---

## 3. PurchaseOrder (הזמנת רכש)

הזמנת רכש לספק - מכילה פריטים מרובים מפרויקט אחד או יותר.

### Interface

```typescript
interface PurchaseOrder {
  id: string;
  tenantId: string;
  projectId: string;                // → Project (פרויקט ראשי)
  supplierId: string;               // → Supplier (03-project-client.md)

  // מזהה
  orderNumber: string;              // PO-2026-001 (auto-generated)
  vendorOrderNumber?: string;       // מספר הזמנה אצל הספק

  // סטטוס
  status: PurchaseOrderStatus;

  // תאריכים
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;

  // סכומים
  subtotal: number;                 // סה"כ לפני הנחה ומע"מ
  discount?: number;                // הנחה
  shippingCost?: number;            // עלות משלוח
  vatAmount: number;                // מע"מ
  total: number;                    // סה"כ כולל הכל
  currency: string;

  // תנאים
  paymentTerms?: string;            // "שוטף + 30"
  deliveryAddress?: string;
  deliveryInstructions?: string;

  // הערות
  notes?: string;                   // גלוי לספק
  internalNotes?: string;           // פנימי בלבד

  // אישור פנימי
  approvedBy?: string;              // userId שאישר
  approvedAt?: Date;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Database Schema

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),

  -- מזהה
  order_number VARCHAR(50) NOT NULL,
  vendor_order_number VARCHAR(100),

  -- סטטוס
  status VARCHAR(20) DEFAULT 'draft',

  -- תאריכים
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  actual_delivery DATE,

  -- סכומים
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  vat_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'ILS',

  -- תנאים
  payment_terms VARCHAR(255),
  delivery_address TEXT,
  delivery_instructions TEXT,

  -- הערות
  notes TEXT,
  internal_notes TEXT,

  -- אישור
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT purchase_orders_tenant_number_unique UNIQUE (tenant_id, order_number),
  CONSTRAINT purchase_orders_amounts_positive CHECK (
    subtotal >= 0 AND total >= 0
  )
);

-- Indexes
CREATE INDEX idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(tenant_id, status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(tenant_id, order_date);

-- RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON purchase_orders USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Auto-Generated Order Number

```typescript
// פונקציה ליצירת מספר הזמנה
async function generateOrderNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const lastOrder = await db.purchaseOrders.findFirst({
    where: { tenantId, orderNumber: { startsWith: `PO-${year}-` } },
    orderBy: { orderNumber: 'desc' }
  });

  const nextNum = lastOrder
    ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1
    : 1;

  return `PO-${year}-${String(nextNum).padStart(3, '0')}`;
}
// Output: PO-2026-001, PO-2026-002, ...
```

### Computed Fields

```typescript
interface PurchaseOrderComputed {
  // פרטי ספק
  supplierName: string;
  supplierEmail: string | null;
  supplierPhone: string | null;

  // פרטי פרויקט
  projectName: string;

  // מי יצר
  createdByName: string;

  // מי אישר
  approvedByName: string | null;

  // פריטים
  itemCount: number;
  totalQuantity: number;

  // סטטוס אספקה
  deliveryStatus: 'pending' | 'partial' | 'complete';
  deliveredPercentage: number;

  // עיכובים
  isOverdue: boolean;               // expectedDelivery < today && status not delivered
  daysOverdue: number | null;
}
```

### API Endpoints

```yaml
# Purchase Order CRUD
GET    /api/purchase-orders                      # רשימת הזמנות
POST   /api/purchase-orders                      # יצירת הזמנה חדשה
GET    /api/purchase-orders/:id                  # קבלת הזמנה
PATCH  /api/purchase-orders/:id                  # עדכון הזמנה
DELETE /api/purchase-orders/:id                  # מחיקת הזמנה (draft בלבד)

# סטטוס
PATCH  /api/purchase-orders/:id/status           # שינוי סטטוס
POST   /api/purchase-orders/:id/approve          # אישור הזמנה
POST   /api/purchase-orders/:id/send             # שליחה לספק

# פריטים
GET    /api/purchase-orders/:id/items            # פריטים בהזמנה
POST   /api/purchase-orders/:id/items            # הוספת פריט
PATCH  /api/purchase-orders/:id/items/:itemId    # עדכון פריט
DELETE /api/purchase-orders/:id/items/:itemId    # הסרת פריט

# ייצוא
GET    /api/purchase-orders/:id/pdf              # ייצוא PDF
GET    /api/purchase-orders/:id/email-preview    # תצוגה מקדימה למייל
POST   /api/purchase-orders/:id/email            # שליחה במייל לספק
```

### WebSocket Events

```typescript
const PURCHASE_ORDER_EVENTS = {
  'purchase_order.created': 'הזמנה נוצרה',
  'purchase_order.updated': 'הזמנה עודכנה',
  'purchase_order.approved': 'הזמנה אושרה',
  'purchase_order.sent': 'הזמנה נשלחה לספק',
  'purchase_order.confirmed': 'ספק אישר הזמנה',
  'purchase_order.shipped': 'הזמנה נשלחה',
  'purchase_order.delivered': 'הזמנה נמסרה',
  'purchase_order.cancelled': 'הזמנה בוטלה',
};
```

---

## 4. PurchaseOrderItem (פריט בהזמנת רכש)

פריט בודד בהזמנת רכש - מקושר למוצר בחדר או תיאור חופשי.

### Interface

```typescript
interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;          // → PurchaseOrder

  // קישורים (אופציונליים)
  productId?: string;               // → Product
  roomProductId?: string;           // → RoomProduct
  roomId?: string;                  // → Room

  // פרטי פריט
  description: string;
  sku?: string;

  // כמויות
  quantity: number;
  unitPrice: number;
  totalPrice: number;               // quantity * unitPrice

  // מעקב אספקה
  deliveredQuantity: number;        // כמה כבר נמסרו
  pendingQuantity: number;          // כמה ממתינים (computed)

  // הערות
  notes?: string;

  // סדר
  order: number;
}
```

### Database Schema

```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,

  -- קישורים
  product_id UUID REFERENCES products(id),
  room_product_id UUID REFERENCES room_products(id),
  room_id UUID REFERENCES rooms(id),

  -- פרטי פריט
  description VARCHAR(500) NOT NULL,
  sku VARCHAR(100),

  -- כמויות ומחירים
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,

  -- מעקב אספקה
  delivered_quantity INTEGER NOT NULL DEFAULT 0,

  -- הערות
  notes TEXT,

  -- סדר
  "order" INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT po_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT po_items_delivered_valid CHECK (delivered_quantity >= 0 AND delivered_quantity <= quantity)
);

-- Indexes
CREATE INDEX idx_po_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product_id ON purchase_order_items(product_id);
CREATE INDEX idx_po_items_room_product_id ON purchase_order_items(room_product_id);

-- No RLS needed - access controlled through purchase_orders
```

### Computed Fields

```typescript
interface PurchaseOrderItemComputed {
  // כמות ממתינה
  pendingQuantity: number;          // quantity - deliveredQuantity

  // אחוז אספקה
  deliveryPercentage: number;       // deliveredQuantity / quantity * 100

  // סטטוס
  deliveryStatus: 'pending' | 'partial' | 'complete';

  // פרטי מוצר (אם מקושר)
  productName: string | null;
  productImageUrl: string | null;

  // פרטי חדר (אם מקושר)
  roomName: string | null;
}
```

### Triggers

```sql
-- עדכון סכומי הזמנה בעת שינוי פריטים
CREATE OR REPLACE FUNCTION update_purchase_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM purchase_order_items
      WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  -- עדכון total (עם מע"מ והנחות)
  UPDATE purchase_orders po
  SET
    total = po.subtotal - COALESCE(po.discount, 0) + COALESCE(po.shipping_cost, 0) + po.vat_amount
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_po_totals
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
FOR EACH ROW EXECUTE FUNCTION update_purchase_order_totals();
```

---

## 5. DeliveryTracking (מעקב משלוחים)

מעקב מפורט אחר משלוחים - סטטוס, עיכובים, בעיות.

### Interface

```typescript
interface DeliveryTracking {
  id: string;
  tenantId: string;

  // קישורים (לפחות אחד חייב להיות מוגדר)
  purchaseOrderId?: string;         // → PurchaseOrder
  purchaseOrderItemId?: string;     // → PurchaseOrderItem
  roomProductId?: string;           // → RoomProduct

  // ספק
  supplierId: string;               // → Supplier
  vendorOrderNumber?: string;

  // תאריכים
  orderDate: Date;
  estimatedShipDate?: Date;
  actualShipDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  // מעקב משלוח
  trackingNumber?: string;
  carrier?: string;                 // שם חברת המשלוח
  trackingUrl?: string;             // קישור למעקב

  // סטטוס
  status: DeliveryTrackingStatus;

  // Lead Time
  originalLeadTimeDays?: number;    // זמן אספקה מקורי
  currentLeadTimeDays?: number;     // זמן אספקה נוכחי (אם השתנה)
  delayDays?: number;               // ימי עיכוב
  delayReason?: string;

  // בעיות
  hasIssue: boolean;
  issueType?: DeliveryIssueType;
  issueDescription?: string;
  issueResolvedAt?: Date;

  // היסטוריית סטטוסים
  statusHistory: DeliveryStatusHistory[];

  // הערות
  notes?: string;

  // מטא
  createdAt: Date;
  updatedAt: Date;
}

interface DeliveryStatusHistory {
  status: DeliveryTrackingStatus;
  date: Date;
  location?: string;                // מיקום (אם רלוונטי)
  note?: string;
}
```

### Database Schema

```sql
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- קישורים
  purchase_order_id UUID REFERENCES purchase_orders(id),
  purchase_order_item_id UUID REFERENCES purchase_order_items(id),
  room_product_id UUID REFERENCES room_products(id),

  -- ספק
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  vendor_order_number VARCHAR(100),

  -- תאריכים
  order_date DATE NOT NULL,
  estimated_ship_date DATE,
  actual_ship_date DATE,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,

  -- מעקב משלוח
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  tracking_url TEXT,

  -- סטטוס
  status VARCHAR(20) DEFAULT 'ordered',

  -- Lead Time
  original_lead_time_days INTEGER,
  current_lead_time_days INTEGER,
  delay_days INTEGER,
  delay_reason TEXT,

  -- בעיות
  has_issue BOOLEAN DEFAULT false,
  issue_type VARCHAR(20),
  issue_description TEXT,
  issue_resolved_at TIMESTAMPTZ,

  -- היסטוריה
  status_history JSONB DEFAULT '[]',

  -- הערות
  notes TEXT,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint - לפחות קישור אחד חייב להיות מוגדר
  CONSTRAINT delivery_tracking_has_reference CHECK (
    purchase_order_id IS NOT NULL OR
    purchase_order_item_id IS NOT NULL OR
    room_product_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_delivery_tracking_tenant_id ON delivery_tracking(tenant_id);
CREATE INDEX idx_delivery_tracking_purchase_order_id ON delivery_tracking(purchase_order_id);
CREATE INDEX idx_delivery_tracking_room_product_id ON delivery_tracking(room_product_id);
CREATE INDEX idx_delivery_tracking_supplier_id ON delivery_tracking(supplier_id);
CREATE INDEX idx_delivery_tracking_status ON delivery_tracking(tenant_id, status);
CREATE INDEX idx_delivery_tracking_estimated_delivery ON delivery_tracking(tenant_id, estimated_delivery_date);
CREATE INDEX idx_delivery_tracking_has_issue ON delivery_tracking(tenant_id, has_issue) WHERE has_issue = true;

-- RLS
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON delivery_tracking USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Computed Fields

```typescript
interface DeliveryTrackingComputed {
  // פרטי ספק
  supplierName: string;

  // פרטי מוצר (אם מקושר ל-RoomProduct)
  productName: string | null;
  projectName: string | null;
  roomName: string | null;

  // פרטי הזמנה (אם מקושר ל-PO)
  orderNumber: string | null;

  // חישובי זמן
  daysInTransit: number | null;     // today - actualShipDate (אם shipped)
  daysUntilDelivery: number | null; // estimatedDeliveryDate - today
  isOverdue: boolean;               // estimatedDeliveryDate < today && !actualDeliveryDate

  // סטטוס מפורמט
  statusLabel: string;
  statusColor: string;
}
```

### API Endpoints

```yaml
# Delivery Tracking CRUD
GET    /api/delivery-tracking                    # רשימת משלוחים
POST   /api/delivery-tracking                    # יצירת מעקב חדש
GET    /api/delivery-tracking/:id                # קבלת מעקב
PATCH  /api/delivery-tracking/:id                # עדכון מעקב
DELETE /api/delivery-tracking/:id                # מחיקת מעקב

# עדכון סטטוס
PATCH  /api/delivery-tracking/:id/status         # שינוי סטטוס
POST   /api/delivery-tracking/:id/issue          # דיווח על בעיה
PATCH  /api/delivery-tracking/:id/resolve        # פתרון בעיה

# לפי הקשר
GET    /api/purchase-orders/:poId/deliveries     # משלוחים לפי הזמנה
GET    /api/projects/:projectId/deliveries       # משלוחים לפי פרויקט
GET    /api/suppliers/:supplierId/deliveries     # משלוחים לפי ספק

# דשבורד
GET    /api/delivery-tracking/overdue            # משלוחים באיחור
GET    /api/delivery-tracking/expected-this-week # צפויים השבוע
GET    /api/delivery-tracking/with-issues        # עם בעיות
```

### WebSocket Events

```typescript
const DELIVERY_TRACKING_EVENTS = {
  'delivery.status_changed': 'שינוי סטטוס משלוח',
  'delivery.shipped': 'משלוח יצא',
  'delivery.out_for_delivery': 'משלוח בדרך',
  'delivery.delivered': 'משלוח נמסר',
  'delivery.delayed': 'עיכוב במשלוח',
  'delivery.issue_reported': 'דווחה בעיה',
  'delivery.issue_resolved': 'בעיה נפתרה',
};
```

---

# ג. Enums (מוגדרים ב-00-shared-definitions.md)

להלן ה-Enums הרלוונטיים למודול זה:

```typescript
// סטטוס אישור לקוח
type ClientApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

// סטטוס רכש
type ProcurementStatus =
  | 'not_ordered'      // לא הוזמן
  | 'quoted'           // בקשת הצעת מחיר
  | 'ordered'          // הוזמן
  | 'in_production'    // בייצור
  | 'shipped'          // נשלח
  | 'delivered'        // נמסר
  | 'installed'        // הותקן
  | 'issue';           // בעיה

// סוג בעיה במוצר
type ProductIssueType = 'damage' | 'wrong_item' | 'missing' | 'defect' | 'delay' | 'other';

// סטטוס הזמנת רכש
type PurchaseOrderStatus =
  | 'draft'            // טיוטה
  | 'pending_approval' // ממתין לאישור
  | 'sent'             // נשלח לספק
  | 'confirmed'        // ספק אישר
  | 'in_production'    // בייצור
  | 'partial'          // אספקה חלקית
  | 'shipped'          // נשלח
  | 'delivered'        // נמסר
  | 'completed'        // הושלם
  | 'cancelled';       // בוטל

// סטטוס מעקב משלוח
type DeliveryTrackingStatus =
  | 'ordered'          // הוזמן
  | 'confirmed'        // ספק אישר
  | 'in_production'    // בייצור
  | 'ready_to_ship'    // מוכן למשלוח
  | 'shipped'          // נשלח
  | 'in_transit'       // בדרך
  | 'out_for_delivery' // בדרך ללקוח
  | 'delivered'        // נמסר
  | 'issue';           // בעיה

// סוג בעיה במשלוח
type DeliveryIssueType = 'delay' | 'damage' | 'wrong_item' | 'partial' | 'lost' | 'other';

// יחידות מידה
type DimensionUnit = 'cm' | 'in' | 'mm';
```

---

# ד. יחסים בין ישויות

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTS & FF&E                              │
│                                                                          │
│  ┌─────────┐        ┌─────────────┐        ┌──────────────┐            │
│  │ Product │◄───────│ RoomProduct │───────►│    Room      │            │
│  │ (ספרייה)│  1:N   │  (בחדר)     │   N:1  │ (04-tasks)   │            │
│  └────┬────┘        └──────┬──────┘        └──────────────┘            │
│       │                    │                                            │
│       │ 1:N                │ N:1                                        │
│       ▼                    ▼                                            │
│  ┌─────────┐        ┌─────────────┐                                    │
│  │Supplier │◄───────│PurchaseOrder│                                    │
│  │(03-proj)│  N:1   │   (הזמנה)   │                                    │
│  └─────────┘        └──────┬──────┘                                    │
│                            │                                            │
│                            │ 1:N                                        │
│                            ▼                                            │
│                    ┌───────────────┐                                    │
│                    │PurchaseOrder  │                                    │
│                    │    Item       │                                    │
│                    └───────┬───────┘                                    │
│                            │                                            │
│                            │ 1:1                                        │
│                            ▼                                            │
│                    ┌───────────────┐                                    │
│                    │Delivery       │                                    │
│                    │  Tracking     │                                    │
│                    └───────────────┘                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### יחסים עם ישויות מקבצים אחרים:

| ישות | יחס | ישות חיצונית | קובץ |
|------|-----|--------------|------|
| Product | N:1 | Supplier | `03-project-client.md` |
| Product | N:1 | ConfigurableEntity (Category) | `14-configuration.md` |
| RoomProduct | N:1 | Project | `03-project-client.md` |
| RoomProduct | N:1 | Room | `04-tasks-docs-meetings.md` |
| PurchaseOrder | N:1 | Project | `03-project-client.md` |
| PurchaseOrder | N:1 | Supplier | `03-project-client.md` |
| PurchaseOrder | N:1 | User (createdBy, approvedBy) | `02-auth-tenant-user.md` |
| DeliveryTracking | N:1 | Supplier | `03-project-client.md` |

---

# ה. תצוגות וממשקים

## FF&E Schedule (לוח מוצרים)

תצוגה מאוחדת של כל המוצרים בפרויקט.

```typescript
interface FFEScheduleView {
  projectId: string;
  projectName: string;

  // סיכומים
  summary: {
    totalProducts: number;
    totalCost: number;
    totalClientPrice: number;
    totalProfit: number;

    // לפי סטטוס אישור
    byApprovalStatus: {
      pending: number;
      approved: number;
      rejected: number;
      revisionRequested: number;
    };

    // לפי סטטוס רכש
    byProcurementStatus: {
      notOrdered: number;
      ordered: number;
      inProduction: number;
      shipped: number;
      delivered: number;
      installed: number;
      issue: number;
    };
  };

  // פריטים
  items: RoomProductWithDetails[];

  // סינון
  filters: {
    roomId?: string;
    categoryId?: string;
    supplierId?: string;
    approvalStatus?: ClientApprovalStatus;
    procurementStatus?: ProcurementStatus;
    hasIssue?: boolean;
  };
}

interface RoomProductWithDetails extends RoomProduct {
  // פרטי מוצר
  product: Product;

  // פרטי חדר
  room: { id: string; name: string };

  // פרטי ספק
  supplier: { id: string; name: string } | null;

  // פרטי הזמנה
  purchaseOrder: { id: string; orderNumber: string; status: string } | null;

  // מעקב משלוח
  deliveryTracking: DeliveryTracking | null;
}
```

## Products Library (ספריית מוצרים)

```typescript
interface ProductLibraryView {
  // קטגוריות
  categories: {
    id: string;
    name: string;
    count: number;
  }[];

  // ספקים
  suppliers: {
    id: string;
    name: string;
    count: number;
  }[];

  // מוצרים
  products: ProductWithUsage[];

  // סינון/חיפוש
  filters: {
    categoryId?: string;
    supplierId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

interface ProductWithUsage extends Product {
  // שימוש
  usageCount: number;
  lastUsedAt: Date | null;
  lastUsedInProject: { id: string; name: string } | null;

  // ספק
  supplier: { id: string; name: string } | null;

  // קטגוריה
  category: { id: string; name: string } | null;
}
```

---

# ו. הנחיות UI

## Product Card

```typescript
interface ProductCardUI {
  // תמונה
  image: {
    size: '120px' | '160px';
    fallback: 'placeholder_icon';
  };

  // פרטים
  details: ['name', 'sku', 'supplierName', 'costPrice', 'retailPrice'];

  // Actions
  actions: ['edit', 'duplicate', 'add_to_room', 'delete'];

  // Hover
  hover: {
    showQuickActions: true;
    showFullDescription: true;
  };
}
```

## Room Product Row

```typescript
interface RoomProductRowUI {
  // תמונה
  thumbnail: {
    size: '48px';
    showZoomOnHover: true;
  };

  // עמודות
  columns: [
    'image',
    'name',
    'quantity',
    'clientPrice',
    'totalPrice',
    'approvalStatus',
    'procurementStatus',
    'expectedDelivery',
    'actions'
  ];

  // Status badges
  statusBadges: {
    approvalStatus: { colors: { pending: 'yellow', approved: 'green', rejected: 'red' } };
    procurementStatus: { colors: { /* per status */ } };
  };

  // Actions
  rowActions: ['edit', 'approve', 'order', 'track', 'delete'];

  // Inline edit
  inlineEditable: ['quantity', 'clientPrice', 'notes'];
}
```

## Purchase Order Form

```typescript
interface PurchaseOrderFormUI {
  // Header
  header: {
    orderNumber: { readonly: true };
    status: { readonly: true };
    supplier: { required: true, searchable: true };
    orderDate: { required: true };
    expectedDelivery: { required: false };
  };

  // Items table
  itemsTable: {
    addFromProducts: true;          // בחירה מספרייה
    addFromRoomProducts: true;      // בחירה ממוצרים בפרויקט
    addManual: true;                // הוספה ידנית

    columns: ['product', 'quantity', 'unitPrice', 'totalPrice', 'notes'];

    footer: {
      showSubtotal: true;
      showDiscount: true;
      showShipping: true;
      showVat: true;
      showTotal: true;
    };
  };

  // Notes
  notes: {
    showInternal: true;
    showExternal: true;
  };

  // Actions
  actions: ['save_draft', 'approve', 'send_to_supplier', 'print', 'export_pdf'];
}
```

## Delivery Tracking Timeline

```typescript
interface DeliveryTimelineUI {
  // Steps
  steps: [
    { status: 'ordered', label: 'הוזמן', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'אושר', icon: 'check' },
    { status: 'in_production', label: 'בייצור', icon: 'factory' },
    { status: 'shipped', label: 'נשלח', icon: 'truck' },
    { status: 'in_transit', label: 'בדרך', icon: 'map-pin' },
    { status: 'delivered', label: 'נמסר', icon: 'package-check' },
  ];

  // Current status
  currentStep: {
    highlight: true;
    showDate: true;
  };

  // History
  history: {
    showAll: true;
    showNotes: true;
    showLocation: true;
  };

  // Issue indicator
  issueIndicator: {
    showIfHasIssue: true;
    color: 'red';
    showResolutionDate: true;
  };
}
```

---

# ז. Automations (אוטומציות מומלצות)

```typescript
const PRODUCT_AUTOMATIONS = [
  // עדכון סטטוס רכש
  {
    name: 'מוצר אושר - עדכן סטטוס',
    trigger: { type: 'field_changed', entity: 'RoomProduct', field: 'clientApprovalStatus', to: 'approved' },
    action: { type: 'create_notification', to: 'project_manager', message: 'מוצר {{productName}} אושר - מוכן להזמנה' }
  },

  // יצירת הזמנת רכש
  {
    name: 'הזמנה חדשה - התראה לספק',
    trigger: { type: 'status_changed', entity: 'PurchaseOrder', to: 'sent' },
    action: { type: 'send_email', to: 'supplier', template: 'new_purchase_order' }
  },

  // עיכוב משלוח
  {
    name: 'משלוח באיחור - התראה',
    trigger: { type: 'scheduled', schedule: 'daily' },
    condition: { field: 'estimatedDeliveryDate', operator: 'date_before', value: 'today' },
    action: [
      { type: 'update_field', field: 'hasIssue', value: true },
      { type: 'update_field', field: 'issueType', value: 'delay' },
      { type: 'create_notification', to: 'assigned_user', message: 'משלוח באיחור: {{productName}}' }
    ]
  },

  // משלוח נמסר
  {
    name: 'משלוח נמסר - עדכן מוצר',
    trigger: { type: 'status_changed', entity: 'DeliveryTracking', to: 'delivered' },
    action: [
      { type: 'update_field', entity: 'RoomProduct', field: 'procurementStatus', value: 'delivered' },
      { type: 'update_field', entity: 'RoomProduct', field: 'actualDeliveryDate', value: '{{today}}' },
      { type: 'create_task', title: 'בדיקת {{productName}} שנמסר', dueInDays: 1 }
    ]
  },
];
```

---

**הפניות לקבצים אחרים:**
- Tenant/User: `02-auth-tenant-user.md`
- Project/Client/Supplier: `03-project-client.md`
- Room: `04-tasks-docs-meetings.md`
- ConfigurableEntity (Categories): `14-configuration.md`
- Automations: `09-automations.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
