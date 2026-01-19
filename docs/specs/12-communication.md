# Communication - תקשורת

## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces
> **הפניה:** ראה `07-collaboration.md` לישות CommunicationLog

---

# א. סקירה כללית

## עקרון מנחה

תקשורת אחידה עם לקוחות, ספקים ובעלי מקצוע - מייל, SMS, WhatsApp - הכל ממקום אחד עם לוג מרכזי.

## ישויות בקובץ זה

| ישות | תיאור | קשרים |
|------|-------|-------|
| EmailMessage | הודעת מייל | Tenant, Project, Client, EmailTemplate |
| SMSMessage | הודעת SMS | Tenant, Project, Client |
| WhatsAppMessage | הודעת WhatsApp | Tenant, Project, Client |
| TenantEmailSettings | הגדרות מייל | Tenant |
| TenantSMSSettings | הגדרות SMS | Tenant |
| TenantWhatsAppSettings | הגדרות WhatsApp | Tenant |
| WhatsAppTemplate | תבנית WhatsApp מאושרת | TenantWhatsAppSettings |

---

# ב. Helper Types

## EmailAddress

```typescript
interface EmailAddress {
  email: string;
  name?: string;
}
```

## EmailAttachment

```typescript
interface EmailAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

## EmailTrackingEvent

```typescript
interface EmailTrackingEvent {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  location?: string;
  linkUrl?: string;                 // לclicks
}
```

---

# ג. ישויות תקשורת

## 1. EmailMessage - הודעת מייל

### Interface

```typescript
interface EmailMessage {
  id: string;
  tenantId: string;

  // כיוון
  direction: 'outgoing' | 'incoming';

  // נמען/שולח
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;

  // תוכן
  subject: string;
  bodyHtml: string;
  bodyText?: string;

  // קבצים
  attachments?: EmailAttachment[];

  // קישור לישויות
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;

  // תבנית (מ-11-reports-templates.md)
  templateId?: string;

  // סטטוס
  status: EmailStatus;

  // מעקב
  tracking: {
    opens: EmailTrackingEvent[];
    clicks: EmailTrackingEvent[];
  };

  // שגיאות
  errorMessage?: string;
  errorCode?: string;

  // זמנים
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;

  createdAt: Date;
  createdBy: string;
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type EmailStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
```

### Database Schema

```sql
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Direction
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('outgoing', 'incoming')),

  -- Addresses (JSONB for flexibility)
  from_address JSONB NOT NULL,
  to_addresses JSONB NOT NULL,
  cc_addresses JSONB,
  bcc_addresses JSONB,
  reply_to_address JSONB,

  -- Content
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- Attachments (JSONB array)
  attachments JSONB DEFAULT '[]',

  -- Entity links
  entity_type VARCHAR(50),
  entity_id UUID,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),

  -- Template
  template_id UUID,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  -- Tracking (JSONB)
  tracking JSONB DEFAULT '{"opens": [], "clicks": []}',

  -- Errors
  error_message TEXT,
  error_code VARCHAR(50),

  -- Timestamps
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'bounced', 'failed'))
);

-- Indexes
CREATE INDEX idx_email_messages_tenant ON email_messages(tenant_id);
CREATE INDEX idx_email_messages_project ON email_messages(project_id);
CREATE INDEX idx_email_messages_client ON email_messages(client_id);
CREATE INDEX idx_email_messages_status ON email_messages(tenant_id, status);
CREATE INDEX idx_email_messages_entity ON email_messages(entity_type, entity_id);
CREATE INDEX idx_email_messages_created ON email_messages(tenant_id, created_at DESC);

-- RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON email_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 2. SMSMessage - הודעת SMS

### Interface

```typescript
interface SMSMessage {
  id: string;
  tenantId: string;

  // כיוון
  direction: 'outgoing' | 'incoming';

  // טלפונים
  from: string;                     // מספר השולח
  to: string;                       // מספר הנמען

  // תוכן
  body: string;

  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;

  // סטטוס
  status: SMSStatus;

  // מעקב
  providerMessageId?: string;
  segments: number;                 // כמה SMS (מעל 160 תווים)
  cost?: number;

  errorMessage?: string;

  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  createdBy?: string;
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type SMSStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
```

### Database Schema

```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Direction
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('outgoing', 'incoming')),

  -- Phone numbers
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,

  -- Content
  body TEXT NOT NULL,

  -- Entity links
  entity_type VARCHAR(50),
  entity_id UUID,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'queued',

  -- Provider tracking
  provider_message_id VARCHAR(100),
  segments INTEGER NOT NULL DEFAULT 1,
  cost DECIMAL(10,4),

  -- Errors
  error_message TEXT,

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'received'))
);

-- Indexes
CREATE INDEX idx_sms_messages_tenant ON sms_messages(tenant_id);
CREATE INDEX idx_sms_messages_project ON sms_messages(project_id);
CREATE INDEX idx_sms_messages_client ON sms_messages(client_id);
CREATE INDEX idx_sms_messages_to ON sms_messages(tenant_id, to_number);
CREATE INDEX idx_sms_messages_status ON sms_messages(tenant_id, status);
CREATE INDEX idx_sms_messages_created ON sms_messages(tenant_id, created_at DESC);

-- RLS
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON sms_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 3. WhatsAppMessage - הודעת WhatsApp

### Interface

```typescript
interface WhatsAppMessage {
  id: string;
  tenantId: string;

  // כיוון
  direction: 'outgoing' | 'incoming';

  // טלפונים
  from: string;
  to: string;

  // סוג הודעה
  messageType: WhatsAppMessageType;

  // תוכן
  content: WhatsAppContent;

  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;

  // סטטוס
  status: WhatsAppStatus;

  // מזהה WhatsApp
  whatsappMessageId?: string;

  // שגיאות
  errorMessage?: string;
  errorCode?: string;

  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  createdBy?: string;
}

interface WhatsAppContent {
  // text
  text?: string;

  // template (הודעה מאושרת)
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];

  // media
  mediaUrl?: string;
  mediaCaption?: string;
  fileName?: string;

  // location
  latitude?: number;
  longitude?: number;
  locationName?: string;
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type WhatsAppMessageType = 'text' | 'template' | 'image' | 'document' | 'location';
type WhatsAppStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
```

### Database Schema

```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Direction
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('outgoing', 'incoming')),

  -- Phone numbers
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,

  -- Message type
  message_type VARCHAR(20) NOT NULL,

  -- Content (JSONB for flexibility)
  content JSONB NOT NULL,

  -- Entity links
  entity_type VARCHAR(50),
  entity_id UUID,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'queued',

  -- WhatsApp ID
  whatsapp_message_id VARCHAR(100),

  -- Errors
  error_message TEXT,
  error_code VARCHAR(50),

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'template', 'image', 'document', 'location')),
  CONSTRAINT valid_status CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'received'))
);

-- Indexes
CREATE INDEX idx_whatsapp_messages_tenant ON whatsapp_messages(tenant_id);
CREATE INDEX idx_whatsapp_messages_project ON whatsapp_messages(project_id);
CREATE INDEX idx_whatsapp_messages_client ON whatsapp_messages(client_id);
CREATE INDEX idx_whatsapp_messages_to ON whatsapp_messages(tenant_id, to_number);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(tenant_id, status);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(tenant_id, created_at DESC);

-- RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON whatsapp_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ד. הגדרות תקשורת

## 1. TenantEmailSettings

### Interface

```typescript
interface TenantEmailSettings {
  tenantId: string;

  // שולח
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;

  // חתימה
  signature: {
    enabled: boolean;
    html: string;
    includeInReplies: boolean;
  };

  // ברנדינג
  branding: {
    logoUrl?: string;
    primaryColor: string;
    headerHtml?: string;
    footerHtml?: string;
  };

  // Provider
  provider: EmailProvider;
  providerConfig: EmailProviderConfig;

  // מעקב
  tracking: {
    trackOpens: boolean;
    trackClicks: boolean;
  };

  // Domain verification
  customDomain?: {
    domain: string;
    verified: boolean;
    dkimRecord: string;
    spfRecord: string;
  };
}

interface EmailProviderConfig {
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type EmailProvider = 'sendgrid' | 'ses' | 'smtp' | 'resend';
```

### Database Schema

```sql
CREATE TABLE tenant_email_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),

  -- Sender defaults
  default_from_email VARCHAR(255) NOT NULL,
  default_from_name VARCHAR(100) NOT NULL,
  reply_to_email VARCHAR(255),

  -- Signature (JSONB)
  signature JSONB DEFAULT '{"enabled": false, "html": "", "includeInReplies": false}',

  -- Branding (JSONB)
  branding JSONB DEFAULT '{"primaryColor": "#3399FF"}',

  -- Provider
  provider VARCHAR(20) NOT NULL DEFAULT 'sendgrid',
  provider_config JSONB NOT NULL DEFAULT '{}',  -- Encrypted values

  -- Tracking
  tracking JSONB DEFAULT '{"trackOpens": true, "trackClicks": true}',

  -- Custom domain (JSONB)
  custom_domain JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_provider CHECK (provider IN ('sendgrid', 'ses', 'smtp', 'resend'))
);

-- RLS
ALTER TABLE tenant_email_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_email_settings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 2. TenantSMSSettings

### Interface

```typescript
interface TenantSMSSettings {
  tenantId: string;

  // Provider
  provider: SMSProvider;
  providerConfig: {
    accountSid?: string;
    authToken?: string;
    fromNumber: string;
  };

  // הגדרות
  settings: {
    enabled: boolean;
    maxPerDay: number;
    maxLength: number;
  };
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type SMSProvider = 'twilio' | 'nexmo' | 'local_provider';
```

### Database Schema

```sql
CREATE TABLE tenant_sms_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),

  -- Provider
  provider VARCHAR(20) NOT NULL DEFAULT 'twilio',
  provider_config JSONB NOT NULL DEFAULT '{}',  -- Encrypted values

  -- Settings
  settings JSONB DEFAULT '{"enabled": false, "maxPerDay": 100, "maxLength": 160}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_provider CHECK (provider IN ('twilio', 'nexmo', 'local_provider'))
);

-- RLS
ALTER TABLE tenant_sms_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_sms_settings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 3. TenantWhatsAppSettings

### Interface

```typescript
interface TenantWhatsAppSettings {
  tenantId: string;

  // Meta Business
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string;              // מוצפן

  // Webhook
  webhookVerifyToken: string;
  webhookUrl: string;

  // תבניות מאושרות
  templates: WhatsAppTemplate[];

  // הגדרות
  settings: {
    enabled: boolean;
    autoReply: boolean;
    autoReplyMessage?: string;
    businessHoursOnly: boolean;
    businessHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: WhatsAppTemplateCategory;
  status: WhatsAppTemplateStatus;
  components: WhatsAppTemplateComponent[];
}

interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: string;
  parameters?: string[];
}
```

### Enums (מוגדרים ב-00-shared-definitions.md)

```typescript
type WhatsAppTemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
type WhatsAppTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
```

### Database Schema

```sql
CREATE TABLE tenant_whatsapp_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),

  -- Meta Business
  business_account_id VARCHAR(100),
  phone_number_id VARCHAR(100),
  access_token TEXT,  -- Encrypted

  -- Webhook
  webhook_verify_token VARCHAR(100),
  webhook_url VARCHAR(500),

  -- Templates (JSONB array)
  templates JSONB DEFAULT '[]',

  -- Settings (JSONB)
  settings JSONB DEFAULT '{"enabled": false, "autoReply": false, "businessHoursOnly": false}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE tenant_whatsapp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_whatsapp_settings
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

# ה. Send Request Types

## SendEmailRequest

```typescript
interface SendEmailRequest {
  to: string | string[];
  cc?: string[];
  bcc?: string[];

  // תבנית או custom
  templateId?: string;
  templateData?: Record<string, any>;

  // או תוכן ישיר
  subject?: string;
  body?: string;

  // קבצים
  attachments?: {
    fileName: string;
    content: string;              // base64
    contentType: string;
  }[];

  // קישור לישות
  entityType?: string;
  entityId?: string;
  projectId?: string;

  // תזמון
  scheduledFor?: Date;
}
```

## SendSMSRequest

```typescript
interface SendSMSRequest {
  to: string;                       // מספר טלפון
  body: string;

  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;

  // תזמון
  scheduledFor?: Date;
}
```

## SendWhatsAppRequest

```typescript
interface SendWhatsAppRequest {
  to: string;                       // מספר טלפון עם קידומת מדינה

  // סוג
  type: 'text' | 'template' | 'image' | 'document';

  // תוכן לפי סוג
  text?: string;

  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];

  mediaUrl?: string;
  mediaCaption?: string;

  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
}
```

---

# ו. API Endpoints

## Email API

```typescript
// שליחת מייל
POST /api/communication/email/send
Body: SendEmailRequest
Response: { success: true, data: EmailMessage }

// קבלת מייל
GET /api/communication/email/:id
Response: { success: true, data: EmailMessage }

// רשימת מיילים לפי ישות
GET /api/communication/email?entityType=...&entityId=...
Response: { success: true, data: EmailMessage[], meta: { pagination } }

// ביטול מייל מתוזמן
DELETE /api/communication/email/:id
Response: { success: true }
```

## SMS API

```typescript
// שליחת SMS
POST /api/communication/sms/send
Body: SendSMSRequest
Response: { success: true, data: SMSMessage }

// קבלת SMS
GET /api/communication/sms/:id
Response: { success: true, data: SMSMessage }

// רשימת SMS לפי לקוח
GET /api/communication/sms?clientId=...
Response: { success: true, data: SMSMessage[], meta: { pagination } }
```

## WhatsApp API

```typescript
// שליחת הודעה
POST /api/communication/whatsapp/send
Body: SendWhatsAppRequest
Response: { success: true, data: WhatsAppMessage }

// קבלת הודעה
GET /api/communication/whatsapp/:id
Response: { success: true, data: WhatsAppMessage }

// שיחה עם איש קשר
GET /api/communication/whatsapp/conversation/:phoneNumber
Response: { success: true, data: WhatsAppMessage[] }

// Webhook להודעות נכנסות
POST /api/communication/whatsapp/webhook
Headers: X-Hub-Signature-256
Body: WhatsApp webhook payload
```

## Unified Log API

```typescript
// כל התקשורת עם לקוח
GET /api/communication/log?clientId=123
Response: {
  success: true,
  data: (EmailMessage | SMSMessage | WhatsAppMessage | CommunicationLog)[]
}

// כל התקשורת בפרויקט
GET /api/communication/log?projectId=456
Response: { success: true, data: [...] }

// תקשורת לפי ישות ספציפית
GET /api/communication/log?entityType=payment&entityId=789
Response: { success: true, data: [...] }
```

## Settings API

```typescript
// Email settings
GET /api/communication/settings/email
PATCH /api/communication/settings/email
Body: Partial<TenantEmailSettings>

// SMS settings
GET /api/communication/settings/sms
PATCH /api/communication/settings/sms
Body: Partial<TenantSMSSettings>

// WhatsApp settings
GET /api/communication/settings/whatsapp
PATCH /api/communication/settings/whatsapp
Body: Partial<TenantWhatsAppSettings>

// Verify custom domain
POST /api/communication/settings/email/verify-domain
Body: { domain: string }
Response: { success: true, data: { dkimRecord, spfRecord } }
```

---

# ז. WebSocket Events

```typescript
// אירועי תקשורת
const COMMUNICATION_EVENTS = {
  // Email
  'email.sent': 'מייל נשלח',
  'email.delivered': 'מייל נמסר',
  'email.opened': 'מייל נפתח',
  'email.clicked': 'לינק במייל נלחץ',
  'email.bounced': 'מייל חזר',
  'email.received': 'מייל נכנס חדש',

  // SMS
  'sms.sent': 'SMS נשלח',
  'sms.delivered': 'SMS נמסר',
  'sms.failed': 'SMS נכשל',
  'sms.received': 'SMS נכנס',

  // WhatsApp
  'whatsapp.sent': 'הודעת WhatsApp נשלחה',
  'whatsapp.delivered': 'הודעת WhatsApp נמסרה',
  'whatsapp.read': 'הודעת WhatsApp נקראה',
  'whatsapp.failed': 'הודעת WhatsApp נכשלה',
  'whatsapp.received': 'הודעת WhatsApp חדשה',
};

// מבנה הודעה
interface CommunicationWebSocketEvent {
  type: keyof typeof COMMUNICATION_EVENTS;
  channel: string;                  // 'tenant:{tenantId}'
  messageId: string;
  messageType: 'email' | 'sms' | 'whatsapp';
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;
  timestamp: Date;
  payload?: any;
}
```

---

# ח. UI Guidelines

## Compose UI - ממשק שליחה אחיד

```typescript
interface ComposeMessageUI {
  // בחירת ערוץ
  channelSelector: {
    options: ['email', 'sms', 'whatsapp'];
    default: 'email';
    showAvailability: true;         // האם הלקוח יש לו את הערוץ
  };

  // נמען
  recipientSelector: {
    type: 'autocomplete';
    sources: ['clients', 'suppliers', 'professionals', 'custom'];
    showContactInfo: true;
  };

  // תבניות
  templateSelector: {
    show: true;
    filterByChannel: true;
    preview: true;
  };

  // עורך
  editor: {
    email: 'rich_text';
    sms: 'plain_text';
    whatsapp: 'plain_text_with_emoji';
    characterCount: true;
    placeholderAutocomplete: true;
  };

  // קבצים
  attachments: {
    email: true;
    whatsapp: true;                 // images, documents
    sms: false;
  };

  // תזמון
  scheduling: {
    enabled: true;
    presets: ['now', 'tomorrow_9am', 'custom'];
  };

  // שליחה
  sendOptions: {
    sendNow: true;
    schedule: true;
    saveDraft: true;                // email only
  };
}
```

## Inbox - תיבת דואר נכנס

```typescript
interface InboxUI {
  // תצוגה
  views: ['all', 'unread', 'email', 'sms', 'whatsapp'];

  // לכל הודעה
  messageRow: {
    avatar: true;
    senderName: true;
    preview: true;
    timestamp: true;
    channel: true;                  // icon
    status: true;                   // delivered, read
    linkedEntity: true;             // קישור לפרויקט/לקוח
  };

  // פעולות
  actions: ['reply', 'forward', 'archive', 'mark_read', 'link_to_entity'];

  // Conversation view
  conversationView: {
    groupByContact: true;
    showAllChannels: true;          // מייל + WhatsApp + SMS ביחד
    replyInline: true;
  };
}
```

---

# ט. Auto-Logging Rules

```typescript
// כל תקשורת נשמרת אוטומטית ב-CommunicationLog
// עם קישור לישויות רלוונטיות

interface AutoLoggingRules {
  // מייל
  email: {
    logOutgoing: true;
    logIncoming: true;              // אם יש inbox integration
    autoLinkToClient: true;
    autoLinkToProject: true;
  };

  // SMS
  sms: {
    logOutgoing: true;
    logIncoming: true;
    autoLinkByPhone: true;
  };

  // WhatsApp
  whatsapp: {
    logOutgoing: true;
    logIncoming: true;
    autoLinkByPhone: true;
    saveMediaFiles: true;
  };
}
```

---

# י. הנחיות מימוש

## Email Provider

- Use SendGrid or Resend for reliability
- Implement proper SPF/DKIM for deliverability
- Handle bounces and complaints
- Verify custom domains before use

## SMS Provider

- Use Twilio or local Israeli provider
- Handle international formatting (+972 for Israel)
- Track delivery status via webhooks
- Respect segment limits (160 chars per segment)

## WhatsApp

- Use official WhatsApp Business API
- Pre-approve message templates (Marketing/Utility/Authentication)
- Handle 24-hour window rule for session messages
- Implement webhook for incoming messages
- Support media messages (images, documents)

## Security

- Encrypt API keys at rest (AES-256)
- Rate limiting per tenant
- Audit log for all messages
- Validate phone numbers format

## Queue

- Send messages via background queue (BullMQ)
- Retry failed messages with exponential backoff
- Respect provider rate limits
- Track queue depth and processing times

## Tracking

- Track email opens via tracking pixel
- Track email clicks via redirect URLs
- Store delivery status from provider webhooks
- Respect privacy settings

---

# יא. קשרים לקבצים אחרים

| קובץ | ישויות קשורות | סוג הקשר |
|------|---------------|----------|
| `02-auth-tenant-user.md` | Tenant, User | Settings belong to Tenant |
| `03-project-client.md` | Project, Client | Messages linked to entities |
| `07-collaboration.md` | CommunicationLog | All messages auto-logged |
| `11-reports-templates.md` | EmailTemplate | Templates used in messages |

---

**הפניות:**
- ישויות Auth/Tenant: `02-auth-tenant-user.md`
- ישויות Project/Client: `03-project-client.md`
- ישות CommunicationLog: `07-collaboration.md`
- תבניות מייל: `11-reports-templates.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
