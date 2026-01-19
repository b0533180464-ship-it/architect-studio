# Integrations - מרכז אינטגרציות
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## עקרון מנחה

מערכת אינטגרציות גנרית שמאפשרת:
1. **OAuth Connections** - חיבור לשירותים חיצוניים
2. **Data Sync** - סנכרון נתונים דו-כיווני
3. **Webhooks** - קבלה ושליחה של אירועים
4. **Field Mapping** - מיפוי שדות בין מערכות

## ישויות בקובץ זה

| ישות | תיאור | קשרים |
|------|-------|--------|
| Integration | חיבור לשירות חיצוני | Tenant, User (connectedBy) |
| IntegrationLog | היסטוריית סנכרון | Integration, Tenant |
| IncomingWebhook | webhook נכנס | Tenant |
| OutgoingWebhook | webhook יוצא | Tenant |
| WebhookLog | היסטוריית webhooks | IncomingWebhook/OutgoingWebhook |

---

# ב. Integration - חיבור לשירות

## Interface

```typescript
interface Integration {
  id: string;
  tenantId: string;

  // מזהה השירות
  provider: IntegrationProvider;

  // שם מותאם
  name: string;
  description?: string;

  // סטטוס
  status: IntegrationStatus;

  // OAuth credentials (מוצפן)
  oauth?: OAuthCredentials;

  // API Key (לשירותים שלא תומכים OAuth)
  apiKey?: string;                 // מוצפן

  // Webhook URL (אם רלוונטי)
  webhookUrl?: string;
  webhookSecret?: string;

  // הגדרות סנכרון
  syncSettings: IntegrationSyncSettings;

  // סטטיסטיקות
  lastSyncAt?: Date;
  lastSyncStatus?: IntegrationSyncStatus;
  lastError?: string;
  totalSyncs: number;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  connectedBy: string;             // User ID
}

interface OAuthCredentials {
  accessToken: string;             // מוצפן
  refreshToken?: string;           // מוצפן
  tokenExpiresAt?: Date;
  scopes: string[];
}

type IntegrationStatus =
  | 'disconnected'    // לא מחובר
  | 'connected'       // מחובר ופעיל
  | 'error'           // שגיאה בחיבור
  | 'expired';        // Token פג תוקף

type IntegrationSyncStatus =
  | 'success'         // הצליח
  | 'partial'         // הצליח חלקית
  | 'failed';         // נכשל

type IntegrationProvider =
  // Calendar
  | 'google_calendar'
  | 'outlook_calendar'
  | 'apple_calendar'

  // Storage
  | 'google_drive'
  | 'dropbox'
  | 'onedrive'

  // Accounting
  | 'quickbooks'
  | 'xero'
  | 'hashavshevet'              // חשבשבת
  | 'priority'                   // פריוריטי

  // Communication
  | 'whatsapp_business'
  | 'twilio'
  | 'sendgrid'
  | 'mailchimp'

  // Payments
  | 'stripe'
  | 'payplus'
  | 'cardcom'

  // Design Tools
  | 'canva'
  | 'figma'

  // CRM
  | 'hubspot'
  | 'monday'

  // Custom
  | 'custom_webhook'
  | 'custom_api';
```

## Sync Settings

```typescript
interface IntegrationSyncSettings {
  // האם סנכרון מופעל
  enabled: boolean;

  // כיוון
  direction: SyncDirection;

  // תדירות
  frequency: SyncFrequency;

  // מה לסנכרן
  entities: IntegrationEntitySync[];

  // מיפוי שדות
  fieldMappings: IntegrationFieldMapping[];

  // פילטרים
  filters?: IntegrationFilter[];
}

type SyncDirection = 'import' | 'export' | 'bidirectional';

type SyncFrequency =
  | 'realtime'        // מיידי
  | 'hourly'          // כל שעה
  | 'daily'           // יומי
  | 'manual';         // ידני בלבד

interface IntegrationEntitySync {
  localEntity: string;            // 'meeting', 'payment', 'document'
  remoteEntity: string;           // 'event', 'invoice', 'file'
  enabled: boolean;
  direction: SyncDirection;
}

interface IntegrationFieldMapping {
  localEntity: string;
  localField: string;
  remoteField: string;

  // טרנספורמציה
  transform?: FieldTransform;
  transformConfig?: any;

  // ברירת מחדל אם ריק
  defaultValue?: any;
}

type FieldTransform =
  | 'none'
  | 'date_format'
  | 'currency_convert'
  | 'custom';

interface IntegrationFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in_list';
  value: any;
}
```

## Database Schema

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Provider
  provider VARCHAR(50) NOT NULL,

  -- מזהה
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- סטטוס
  status VARCHAR(20) DEFAULT 'disconnected',

  -- OAuth (JSONB מוצפן)
  oauth_encrypted BYTEA,

  -- API Key (מוצפן)
  api_key_encrypted BYTEA,

  -- Webhook
  webhook_url TEXT,
  webhook_secret VARCHAR(200),

  -- Sync Settings (JSONB)
  sync_settings JSONB DEFAULT '{}'::jsonb,

  -- סטטיסטיקות
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(20),
  last_error TEXT,
  total_syncs INTEGER DEFAULT 0,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  connected_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT unique_tenant_provider UNIQUE (tenant_id, provider)
);

-- Indexes
CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(tenant_id, provider);
CREATE INDEX idx_integrations_status ON integrations(tenant_id, status);

-- RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON integrations
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Updated at trigger
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

# ג. אינטגרציות ספציפיות

## Google Calendar

```typescript
interface GoogleCalendarConfig {
  provider: 'google_calendar';

  settings: {
    // איזה calendars לסנכרן
    calendars: {
      calendarId: string;
      calendarName: string;
      color: string;
      syncEnabled: boolean;
    }[];

    // מה לסנכרן
    syncMeetings: boolean;            // Meeting → Calendar Event
    syncTasks: boolean;               // Task with dueDate → Calendar Event
    syncDeliveries: boolean;          // Expected deliveries → Calendar Event

    // כיוון
    direction: 'bidirectional';

    // יצירה אוטומטית
    autoCreateEvents: boolean;        // כשנוצרת פגישה במערכת
    autoCreateMeetings: boolean;      // כשנוצר אירוע בקלנדר
  };
}

// מיפוי שדות Meeting ↔ Calendar Event
const GOOGLE_CALENDAR_MAPPING: IntegrationFieldMapping[] = [
  { localEntity: 'meeting', localField: 'title', remoteField: 'summary' },
  { localEntity: 'meeting', localField: 'description', remoteField: 'description' },
  { localEntity: 'meeting', localField: 'startTime', remoteField: 'start.dateTime', transform: 'date_format' },
  { localEntity: 'meeting', localField: 'endTime', remoteField: 'end.dateTime', transform: 'date_format' },
  { localEntity: 'meeting', localField: 'location', remoteField: 'location' },
  { localEntity: 'meeting', localField: 'attendees', remoteField: 'attendees' },
];
```

## Google Drive

```typescript
interface GoogleDriveConfig {
  provider: 'google_drive';

  settings: {
    // תיקיית בסיס
    rootFolderId: string;
    rootFolderName: string;

    // מבנה תיקיות
    folderStructure: 'flat' | 'by_project' | 'by_client';

    // מה לסנכרן
    syncDocuments: boolean;
    syncProposals: boolean;
    syncContracts: boolean;
    syncPhotos: boolean;

    // כיוון
    direction: 'bidirectional';

    // אוטומטי
    autoUploadDocuments: boolean;
    autoImportFromFolder: boolean;
  };
}
```

## QuickBooks / Accounting

```typescript
interface AccountingIntegrationConfig {
  provider: 'quickbooks' | 'xero' | 'hashavshevet';

  settings: {
    // מה לסנכרן
    syncClients: boolean;             // Client → Customer
    syncSuppliers: boolean;           // Supplier → Vendor
    syncPayments: boolean;            // Payment → Invoice
    syncExpenses: boolean;            // Expense → Bill/Expense

    // הגדרות חשבוניות
    invoiceSettings: {
      autoCreateInvoice: boolean;     // כשתשלום מסומן invoiced
      invoicePrefix: string;
      defaultPaymentTerms: number;
      defaultTaxRate: number;
      defaultAccount: string;
    };

    // מיפוי חשבונות
    accountMappings: {
      revenue: string;                // חשבון הכנסות
      expenses: string;               // חשבון הוצאות
      retainer: string;               // חשבון מקדמות
    };
  };
}
```

## WhatsApp Business

```typescript
interface WhatsAppConfig {
  provider: 'whatsapp_business';

  config: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;              // מוצפן

    // תבניות מאושרות
    approvedTemplates: WhatsAppTemplate[];
  };

  settings: {
    // התראות אוטומטיות
    sendPaymentReminders: boolean;
    sendMeetingReminders: boolean;
    sendDeliveryUpdates: boolean;

    // לוג שיחות
    logIncomingMessages: boolean;
    logOutgoingMessages: boolean;
  };
}

interface WhatsAppTemplate {
  templateName: string;
  templateId: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}
```

## Stripe / PayPlus / Cardcom (תשלומים)

```typescript
interface PaymentProviderConfig {
  provider: 'stripe' | 'payplus' | 'cardcom';

  config: {
    apiKey: string;                   // מוצפן
    webhookSecret: string;            // מוצפן

    // הגדרות
    currency: string;
    allowPartialPayments: boolean;

    // עמלות
    feePercent: number;
    feeFixed: number;
  };

  settings: {
    // אוטומטי
    autoUpdatePaymentStatus: boolean;
    autoRecordTransaction: boolean;

    // התראות
    notifyOnPayment: boolean;
    notifyOnFailure: boolean;
  };
}
```

---

# ד. IntegrationLog - היסטוריית סנכרון

## Interface

```typescript
interface IntegrationLog {
  id: string;
  tenantId: string;
  integrationId: string;

  // סוג פעולה
  action: IntegrationAction;

  // כיוון
  direction: 'incoming' | 'outgoing';

  // תוצאה
  status: IntegrationSyncStatus;

  // פירוט
  summary: SyncSummary;

  // פריטים שנכשלו
  failedItems?: FailedItem[];

  // שגיאה כללית
  errorMessage?: string;
  errorCode?: string;

  // זמנים
  startedAt: Date;
  completedAt: Date;
  durationMs: number;

  // Request/Response (לדיבוג)
  requestSnapshot?: any;
  responseSnapshot?: any;
}

type IntegrationAction =
  | 'sync'              // סנכרון כללי
  | 'import'            // יבוא
  | 'export'            // ייצוא
  | 'webhook_received'  // קבלת webhook
  | 'webhook_sent';     // שליחת webhook

interface SyncSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

interface FailedItem {
  entityId: string;
  entityName: string;
  error: string;
}
```

## Database Schema

```sql
CREATE TABLE integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,

  -- פעולה
  action VARCHAR(30) NOT NULL,
  direction VARCHAR(10) NOT NULL,

  -- תוצאה
  status VARCHAR(20) NOT NULL,

  -- פירוט (JSONB)
  summary JSONB DEFAULT '{}'::jsonb,
  failed_items JSONB,

  -- שגיאות
  error_message TEXT,
  error_code VARCHAR(50),

  -- זמנים
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Snapshots (JSONB)
  request_snapshot JSONB,
  response_snapshot JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_integration_logs_tenant ON integration_logs(tenant_id);
CREATE INDEX idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_date ON integration_logs(tenant_id, started_at DESC);
CREATE INDEX idx_integration_logs_status ON integration_logs(integration_id, status);

-- RLS
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON integration_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Auto-cleanup: מחיקת לוגים ישנים (30 יום)
CREATE OR REPLACE FUNCTION cleanup_old_integration_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM integration_logs
  WHERE started_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

# ה. IncomingWebhook - Webhook נכנס

## Interface

```typescript
interface IncomingWebhook {
  id: string;
  tenantId: string;

  // מזהה ייחודי
  name: string;
  description?: string;

  // URL לקבלת webhooks
  url: string;                        // /api/webhooks/tenant/:tenantId/:webhookId
  secret: string;                     // לאימות HMAC

  // מה לעשות כשמקבלים
  actions: WebhookAction[];

  // פילטרים (אופציונלי)
  filters?: WebhookFilter;

  // סטטיסטיקות
  lastReceivedAt?: Date;
  totalReceived: number;

  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WebhookAction {
  type: WebhookActionType;
  config: WebhookActionConfig;
}

type WebhookActionType =
  | 'create_entity'        // יצירת ישות חדשה
  | 'update_entity'        // עדכון ישות קיימת
  | 'trigger_automation'   // הפעלת אוטומציה
  | 'forward';             // העברה ליעד אחר

interface WebhookActionConfig {
  // create_entity / update_entity
  entityType?: string;
  fieldMappings?: Record<string, string>;

  // trigger_automation
  automationId?: string;

  // forward
  forwardUrl?: string;
  forwardHeaders?: Record<string, string>;
}

interface WebhookFilter {
  headers?: Record<string, string>;
  bodyPath?: string;
  bodyValue?: any;
}
```

## Database Schema

```sql
CREATE TABLE incoming_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- מזהה
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- URL
  url TEXT NOT NULL UNIQUE,
  secret VARCHAR(200) NOT NULL,

  -- Actions (JSONB)
  actions JSONB NOT NULL,

  -- Filters (JSONB)
  filters JSONB,

  -- סטטיסטיקות
  last_received_at TIMESTAMPTZ,
  total_received INTEGER DEFAULT 0,

  -- מטא
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incoming_webhooks_tenant ON incoming_webhooks(tenant_id);
CREATE INDEX idx_incoming_webhooks_url ON incoming_webhooks(url);

-- RLS
ALTER TABLE incoming_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON incoming_webhooks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ו. OutgoingWebhook - Webhook יוצא

## Interface

```typescript
interface OutgoingWebhook {
  id: string;
  tenantId: string;

  // מזהה
  name: string;
  description?: string;

  // לאן לשלוח
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;

  // מתי לשלוח
  triggers: OutgoingWebhookTrigger[];

  // מה לשלוח
  payloadTemplate?: string;           // JSON עם placeholders, או null = שליחת הישות כמות שהיא

  // אבטחה
  signRequests: boolean;
  signatureHeader: string;
  signatureSecret: string;

  // Retry
  retryAttempts: number;
  retryDelaySeconds: number;

  // סטטיסטיקות
  lastSentAt?: Date;
  lastStatus?: 'success' | 'failed';
  totalSent: number;
  totalFailed: number;

  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OutgoingWebhookTrigger {
  entityType: string;
  events: WebhookEvent[];
}

type WebhookEvent =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed';
```

## Database Schema

```sql
CREATE TABLE outgoing_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- מזהה
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Target
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'POST',
  headers JSONB,

  -- Triggers (JSONB)
  triggers JSONB NOT NULL,

  -- Payload
  payload_template TEXT,

  -- Security
  sign_requests BOOLEAN DEFAULT false,
  signature_header VARCHAR(100) DEFAULT 'X-Webhook-Signature',
  signature_secret VARCHAR(200),

  -- Retry
  retry_attempts INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- סטטיסטיקות
  last_sent_at TIMESTAMPTZ,
  last_status VARCHAR(20),
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- מטא
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_outgoing_webhooks_tenant ON outgoing_webhooks(tenant_id);
CREATE INDEX idx_outgoing_webhooks_triggers ON outgoing_webhooks USING gin(triggers);

-- RLS
ALTER TABLE outgoing_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON outgoing_webhooks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ז. WebhookLog - היסטוריית Webhooks

## Interface

```typescript
interface WebhookLog {
  id: string;
  tenantId: string;
  webhookId: string;

  direction: 'incoming' | 'outgoing';

  // Request
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;

  // Response (לoutgoing)
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;

  // תוצאה
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;

  // Retry info
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: Date;

  // זמנים
  timestamp: Date;
  durationMs?: number;
}
```

## Database Schema

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL,         -- Can be incoming or outgoing
  webhook_type VARCHAR(10) NOT NULL, -- 'incoming' or 'outgoing'

  direction VARCHAR(10) NOT NULL,

  -- Request
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers JSONB,
  body JSONB,

  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,

  -- Status
  status VARCHAR(20) NOT NULL,
  error_message TEXT,

  -- Retry
  attempt INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- זמנים
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_webhook_logs_tenant ON webhook_logs(tenant_id);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_date ON webhook_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(webhook_id, status);
CREATE INDEX idx_webhook_logs_retry ON webhook_logs(next_retry_at)
  WHERE status = 'failed' AND next_retry_at IS NOT NULL;

-- RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON webhook_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Auto-cleanup: מחיקת לוגים ישנים (14 יום)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_logs
  WHERE timestamp < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;
```

---

# ח. API Endpoints

## OAuth Flow

```typescript
// 1. התחלת חיבור
GET /api/integrations/connect/:provider
// → Redirect to provider OAuth screen

// 2. Callback
GET /api/integrations/callback/:provider?code=xxx&state=xxx
// → Exchange code for tokens
// → Create Integration record
// → Redirect to settings page

// 3. Refresh Token (אוטומטי)
POST /api/integrations/:id/refresh
// → Get new access token

// 4. Disconnect
DELETE /api/integrations/:id
// → Revoke tokens
// → Delete Integration record
```

## Integration Management

```typescript
// רשימת אינטגרציות
GET /api/integrations

// אינטגרציה בודדת
GET /api/integrations/:id

// עדכון הגדרות
PATCH /api/integrations/:id

// מחיקה (disconnect)
DELETE /api/integrations/:id
```

## Sync API

```typescript
// Manual sync
POST /api/integrations/:id/sync
// → Trigger immediate sync

// Sync status
GET /api/integrations/:id/status
// → Return last sync info, next scheduled sync

// Sync history
GET /api/integrations/:id/logs
// → Return paginated sync logs
```

## Webhook API

```typescript
// === Incoming Webhooks ===
GET /api/webhooks/incoming
POST /api/webhooks/incoming
GET /api/webhooks/incoming/:id
PATCH /api/webhooks/incoming/:id
DELETE /api/webhooks/incoming/:id

// Incoming webhook endpoint (public)
POST /api/webhooks/tenant/:tenantId/:webhookId
// → Validate signature
// → Process payload
// → Execute actions

// === Outgoing Webhooks ===
GET /api/webhooks/outgoing
POST /api/webhooks/outgoing
GET /api/webhooks/outgoing/:id
PATCH /api/webhooks/outgoing/:id
DELETE /api/webhooks/outgoing/:id

// Test webhook
POST /api/webhooks/:id/test
// → Send test payload
// → Return response

// === Webhook Logs ===
GET /api/webhooks/:id/logs
GET /api/webhook-logs/:logId
```

---

# ט. WebSocket Events

```typescript
const INTEGRATION_WEBSOCKET_EVENTS = {
  // חיבור/ניתוק
  'integration.connected': {
    integrationId: string;
    provider: IntegrationProvider;
  },
  'integration.disconnected': {
    integrationId: string;
    provider: IntegrationProvider;
    reason: string;
  },

  // סנכרון
  'integration.sync_started': {
    integrationId: string;
    provider: IntegrationProvider;
  },
  'integration.sync_completed': {
    integrationId: string;
    provider: IntegrationProvider;
    status: IntegrationSyncStatus;
    summary: SyncSummary;
  },
  'integration.sync_failed': {
    integrationId: string;
    provider: IntegrationProvider;
    error: string;
  },

  // Webhooks
  'webhook.received': {
    webhookId: string;
    webhookName: string;
    status: 'success' | 'failed';
  },
  'webhook.sent': {
    webhookId: string;
    webhookName: string;
    status: 'success' | 'failed';
  },

  // Token expiry warning
  'integration.token_expiring': {
    integrationId: string;
    provider: IntegrationProvider;
    expiresAt: Date;
  },
};
```

---

# י. UI Guidelines

## Integrations Page

```typescript
interface IntegrationsPageUI {
  // קטגוריות
  categories: IntegrationCategory[];

  // לכל אינטגרציה
  integrationCard: {
    logo: string;
    name: string;
    description: string;
    status: IntegrationStatus;
    lastSync?: Date;
    actions: IntegrationAction[];
  };

  // Empty state
  emptyState: {
    title: 'אין אינטגרציות מחוברות';
    description: 'חבר את הכלים שאתה משתמש בהם';
    cta: 'הוסף אינטגרציה';
  };
}

interface IntegrationCategory {
  id: string;
  name: string;
  icon: string;
  providers: IntegrationProvider[];
}

const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  { id: 'calendar', name: 'יומן', icon: 'calendar', providers: ['google_calendar', 'outlook_calendar', 'apple_calendar'] },
  { id: 'storage', name: 'אחסון קבצים', icon: 'folder', providers: ['google_drive', 'dropbox', 'onedrive'] },
  { id: 'accounting', name: 'הנהלת חשבונות', icon: 'calculator', providers: ['quickbooks', 'xero', 'hashavshevet', 'priority'] },
  { id: 'communication', name: 'תקשורת', icon: 'message', providers: ['whatsapp_business', 'twilio', 'sendgrid', 'mailchimp'] },
  { id: 'payments', name: 'תשלומים', icon: 'credit-card', providers: ['stripe', 'payplus', 'cardcom'] },
  { id: 'webhooks', name: 'Webhooks', icon: 'webhook', providers: ['custom_webhook', 'custom_api'] },
];
```

## Integration Settings Page

```typescript
interface IntegrationSettingsUI {
  sections: [
    {
      id: 'connection',
      title: 'סטטוס חיבור',
      content: {
        status: IntegrationStatus;
        connectedAt: Date;
        connectedBy: string;
        scopes: string[];
      };
    },
    {
      id: 'sync',
      title: 'הגדרות סנכרון',
      content: {
        enabled: boolean;
        direction: SyncDirection;
        frequency: SyncFrequency;
        entities: IntegrationEntitySync[];
      };
    },
    {
      id: 'mappings',
      title: 'מיפוי שדות',
      content: {
        mappings: IntegrationFieldMapping[];
        addMapping: true;
        editMapping: true;
      };
    },
    {
      id: 'history',
      title: 'היסטוריית סנכרון',
      content: {
        logs: IntegrationLog[];
        pagination: true;
      };
    },
    {
      id: 'errors',
      title: 'לוג שגיאות',
      content: {
        errors: FailedItem[];
        retry: true;
      };
    },
  ];

  actions: ['sync_now', 'disconnect', 'test_connection'];
}
```

## Webhook Builder UI

```typescript
interface WebhookBuilderUI {
  // Incoming Webhook
  incoming: {
    fields: ['name', 'description'];
    generated: ['url', 'secret'];
    actions: {
      type: WebhookActionType;
      config: true;
    };
    filters: {
      headers: true;
      body: true;
    };
    test: {
      sendTestPayload: true;
      showResult: true;
    };
  };

  // Outgoing Webhook
  outgoing: {
    fields: ['name', 'description', 'url', 'method', 'headers'];
    triggers: {
      entityType: true;
      events: true;
    };
    payload: {
      template: true;
      placeholderHelper: true;
      preview: true;
    };
    security: {
      signRequests: true;
      signatureHeader: true;
      signatureSecret: true;
    };
    retry: {
      attempts: true;
      delay: true;
    };
    test: {
      sendTest: true;
      showResult: true;
    };
  };
}
```

---

# יא. Implementation Guidelines

## Token Security

```typescript
// כל tokens מוצפנים ב-DB (AES-256)
const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY;

async function encryptToken(token: string): Promise<Buffer> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

async function decryptToken(encrypted: Buffer): Promise<string> {
  const iv = encrypted.slice(0, 16);
  const tag = encrypted.slice(16, 32);
  const data = encrypted.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

// Refresh tokens אוטומטי לפני expiry
async function ensureValidToken(integration: Integration): Promise<string> {
  if (!integration.oauth) throw new Error('No OAuth credentials');

  const expiresAt = integration.oauth.tokenExpiresAt;
  if (expiresAt && expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    // Token valid for at least 5 more minutes
    return decryptToken(integration.oauth.accessToken);
  }

  // Refresh token
  return refreshToken(integration);
}
```

## Rate Limiting

```typescript
// כיבוד rate limits של כל provider
const PROVIDER_RATE_LIMITS = {
  google_calendar: { requests: 100, per: 'minute' },
  google_drive: { requests: 1000, per: 'minute' },
  stripe: { requests: 100, per: 'second' },
  quickbooks: { requests: 500, per: 'minute' },
};

// Queue לבקשות אם יש throttling
interface RateLimitedRequest {
  integrationId: string;
  request: () => Promise<any>;
  priority: number;
}

class IntegrationRequestQueue {
  private queues: Map<string, RateLimitedRequest[]> = new Map();

  async enqueue(request: RateLimitedRequest): Promise<any> {
    // Add to queue
    // Process respecting rate limits
    // Exponential backoff on errors
  }
}
```

## Sync Strategy

```typescript
// Incremental sync (רק שינויים)
interface SyncState {
  integrationId: string;
  entityType: string;
  lastSyncToken?: string;
  lastSyncAt: Date;
}

async function incrementalSync(integration: Integration, entityType: string) {
  const state = await getSyncState(integration.id, entityType);

  // Get changes since last sync
  const changes = await fetchChanges(integration, entityType, state.lastSyncToken);

  // Process changes
  for (const change of changes) {
    await processChange(change);
  }

  // Update sync state
  await updateSyncState(integration.id, entityType, {
    lastSyncToken: changes.nextToken,
    lastSyncAt: new Date(),
  });
}

// Full sync אופציונלי
async function fullSync(integration: Integration, entityType: string) {
  // Delete all synced items
  // Fetch and create all items
  // Update sync state
}
```

## Webhook Signature Verification

```typescript
// אימות HMAC signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// שליחת webhook עם signature
async function sendWebhook(webhook: OutgoingWebhook, payload: any) {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { ...webhook.headers };

  if (webhook.signRequests) {
    const signature = crypto
      .createHmac('sha256', webhook.signatureSecret)
      .update(body)
      .digest('hex');
    headers[webhook.signatureHeader] = signature;
  }

  return fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}
```

## Retry Logic

```typescript
async function sendWebhookWithRetry(
  webhook: OutgoingWebhook,
  payload: any,
  attempt: number = 1
): Promise<WebhookLog> {
  const log: WebhookLog = {
    id: uuid(),
    tenantId: webhook.tenantId,
    webhookId: webhook.id,
    direction: 'outgoing',
    method: webhook.method,
    url: webhook.url,
    headers: webhook.headers,
    body: payload,
    attempt,
    maxAttempts: webhook.retryAttempts,
    timestamp: new Date(),
    status: 'pending',
  };

  try {
    const response = await sendWebhook(webhook, payload);

    log.responseStatus = response.status;
    log.responseBody = await response.json().catch(() => null);
    log.status = response.ok ? 'success' : 'failed';
    log.durationMs = Date.now() - log.timestamp.getTime();

    if (!response.ok && attempt < webhook.retryAttempts) {
      // Schedule retry
      log.nextRetryAt = new Date(Date.now() + webhook.retryDelaySeconds * 1000 * attempt);
      await scheduleRetry(webhook, payload, attempt + 1, log.nextRetryAt);
    }
  } catch (error) {
    log.status = 'failed';
    log.errorMessage = error.message;

    if (attempt < webhook.retryAttempts) {
      log.nextRetryAt = new Date(Date.now() + webhook.retryDelaySeconds * 1000 * attempt);
      await scheduleRetry(webhook, payload, attempt + 1, log.nextRetryAt);
    }
  }

  await saveWebhookLog(log);
  return log;
}
```

---

# יב. קשרים לקבצים אחרים

| קובץ | ישויות קשורות |
|------|---------------|
| `00-shared-definitions.md` | IntegrationProvider, IntegrationStatus, SyncDirection, SyncFrequency |
| `02-auth-tenant-user.md` | Tenant, User (connectedBy) |
| `04-tasks-docs-meetings.md` | Meeting (Google Calendar sync), Document (Google Drive sync) |
| `06-financial.md` | Payment, Expense (Accounting sync) |
| `09-automations.md` | AutomationRule (webhook triggers) |
| `12-communication.md` | WhatsApp, Email (communication integrations) |

---

**הפניות:**
- ישויות Auth/User: `02-auth-tenant-user.md`
- אוטומציות: `09-automations.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
