# Shared Definitions
## הגדרות משותפות למערכת Architect Studio

> **חשוב:** קובץ זה מכיל את כל ההגדרות המשותפות למערכת.
> כל קובץ spec אחר צריך להפנות לכאן במקום להגדיר מחדש.

---

# א. Base Interfaces

## BaseEntity - ממשק בסיס לכל ישות

```typescript
interface BaseEntity {
  id: string;                       // UUID או CUID
  tenantId: string;                 // חובה - Multi-tenant isolation
  createdAt: Date;
  updatedAt: Date;
}
```

## WithTimestamps - טיימסטמפים

```typescript
interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;                 // Soft delete
}
```

## WithCreator - מי יצר

```typescript
interface WithCreator {
  createdBy: string;                // userId
}
```

## WithStatus - סטטוס גנרי

```typescript
interface WithStatus<T extends string> {
  status: T;
  statusChangedAt?: Date;
}
```

## WithOrder - סדר

```typescript
interface WithOrder {
  order: number;
}
```

## WithClientSharing - שיתוף עם לקוח

```typescript
interface WithClientSharing {
  isSharedWithClient: boolean;
  clientCanDownload?: boolean;
}
```

## WithApproval - אישור לקוח

```typescript
interface WithApproval {
  clientApprovalStatus: ClientApprovalStatus;
  clientApprovedAt?: Date;
  clientFeedback?: string;
}
```

---

# ב. Enums - כל ה-Enums במערכת

## Auth & User Enums

```typescript
// תפקיד משתמש
type UserRole = 'owner' | 'manager' | 'member';

// סוג Token
type MagicLinkTokenType = 'login' | 'signup' | 'invite' | 'password_reset';

// ספק OAuth
type OAuthProvider = 'google' | 'microsoft' | 'apple';

// שיטת 2FA
type TwoFactorMethod = 'totp' | 'sms';

// סטטוס הזמנה לצוות
type TeamInvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
```

## Project & Client Enums

```typescript
// סוג עסק
type BusinessType = 'interior_design' | 'architecture' | 'both';

// עדיפות
type Priority = 'low' | 'medium' | 'high' | 'urgent';

// סטטוס לקוח
type ClientStatus = 'lead' | 'active' | 'past' | 'inactive';

// סוג לקוח
type ClientType = 'individual' | 'company';

// דרך תקשורת מועדפת
type PreferredCommunication = 'email' | 'phone' | 'whatsapp';

// סטטוס היתר בנייה
type PermitStatus =
  | 'not_required'
  | 'preparing'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'appealed';

// סטטוס עיצוב חדר
type RoomDesignStatus =
  | 'not_started'
  | 'concept'
  | 'detailed'
  | 'approved'
  | 'in_progress'
  | 'completed';
```

## Financial Enums

```typescript
// סוג תמחור
type BillingType = 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';

// סוג Markup
type MarkupType = 'cost_plus' | 'discount_off_retail';

// סוג תשלום
type PaymentType =
  | 'retainer'
  | 'milestone'
  | 'scheduled'
  | 'final'
  | 'change_order'
  | 'hourly'
  | 'expense';

// סטטוס תשלום
type PaymentStatus =
  | 'scheduled'
  | 'pending'
  | 'invoiced'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

// סטטוס הצעת מחיר
type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'revised';

// סטטוס חוזה
type ContractStatus =
  | 'draft'
  | 'sent'
  | 'pending_signature'
  | 'partially_signed'
  | 'signed'
  | 'cancelled'
  | 'terminated';

// סטטוס מקדמה
type RetainerStatus =
  | 'pending'
  | 'received'
  | 'partially_applied'
  | 'fully_applied'
  | 'refunded';

// סוג מקדמה
type RetainerType =
  | 'project_retainer'
  | 'general_retainer'
  | 'deposit'
  | 'trust_account';

// סטטוס הוצאה
type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';
```

## Product & Procurement Enums

```typescript
// סטטוס אישור לקוח למוצר
type ClientApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

// סטטוס רכש מוצר
type ProcurementStatus =
  | 'not_ordered'
  | 'quoted'
  | 'ordered'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'installed'
  | 'issue';

// סוג בעיה במוצר
type ProductIssueType =
  | 'damage'
  | 'wrong_item'
  | 'missing'
  | 'defect'
  | 'delay'
  | 'other';

// סטטוס הזמנת רכש
type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'sent'
  | 'confirmed'
  | 'in_production'
  | 'partial'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

// סטטוס משלוח
type DeliveryStatus =
  | 'ordered'
  | 'confirmed'
  | 'in_production'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'issue';

// סוג בעיית משלוח
type DeliveryIssueType =
  | 'delay'
  | 'damage'
  | 'wrong_item'
  | 'partial'
  | 'lost'
  | 'other';

// יחידת מידה
type DimensionUnit = 'cm' | 'in' | 'mm';
```

## Task & Meeting Enums

```typescript
// סוג תזכורת
type ReminderType = 'email' | 'notification' | 'sms';

// סוג פגישה
type MeetingType =
  | 'site_visit'
  | 'client_meeting'
  | 'supplier'
  | 'internal'
  | 'presentation'
  | 'installation'
  | 'other';

// סטטוס פגישה
type MeetingStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

// תדירות חזרה
type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
```

## Document & File Enums

```typescript
// קטגוריית קובץ
type FileCategory =
  | 'document'
  | 'image'
  | 'drawing'
  | 'render'
  | 'plan'
  | 'presentation'
  | 'spreadsheet'
  | 'video'
  | 'audio'
  | 'archive'
  | 'other';

// ספק אחסון
type StorageProvider = 'local' | 's3' | 'gcs' | 'r2';

// סוג תיקייה
type FolderType = 'regular' | 'system' | 'smart';

// סוג שיתוף קובץ
type FileShareType = 'link' | 'email';
```

## MoodBoard Enums

```typescript
// סוג פריט בלוח השראה
type MoodBoardItemType =
  | 'image'
  | 'product'
  | 'color'
  | 'material'
  | 'text'
  | 'link';

// גודל פריט
type MoodBoardItemSize = 'small' | 'medium' | 'large';
```

## Change Management Enums

```typescript
// מי ביקש שינוי
type ChangeRequestedBy = 'client' | 'designer' | 'contractor' | 'other';

// סיבת שינוי
type ChangeReason =
  | 'client_request'
  | 'design_improvement'
  | 'site_condition'
  | 'material_unavailable'
  | 'regulation'
  | 'error_correction'
  | 'other';

// סטטוס בקשת שינוי
type ChangeOrderStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_client_approval'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'cancelled';

// סוג שינוי
type ChangeItemType = 'add' | 'remove' | 'modify';

// קטגוריית שינוי
type ChangeItemCategory = 'design' | 'product' | 'service' | 'construction';

// סוג אופציית עיצוב
type DesignOptionType =
  | 'concept'
  | 'layout'
  | 'material'
  | 'color'
  | 'furniture'
  | 'full_design';

// סטטוס אופציית עיצוב
type DesignOptionStatus =
  | 'draft'
  | 'internal_review'
  | 'presented'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

// סוג תמונת עיצוב
type DesignImageType =
  | 'render'
  | 'plan'
  | 'elevation'
  | 'section'
  | 'detail'
  | 'moodboard'
  | 'sketch'
  | 'photo';

// קטגוריית ליקוי
type SnagCategory =
  | 'defect'
  | 'incomplete'
  | 'damage'
  | 'wrong_item'
  | 'quality'
  | 'missing'
  | 'other';

// חומרת ליקוי
type SnagSeverity = 'cosmetic' | 'minor' | 'major' | 'critical';

// אחראי לתיקון
type ResponsibleParty =
  | 'contractor'
  | 'supplier'
  | 'designer'
  | 'installer'
  | 'unknown';

// סטטוס ליקוי
type SnagStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'fixed'
  | 'verified'
  | 'wont_fix'
  | 'disputed';
```

## Communication Enums

```typescript
// סוג תקשורת
type CommunicationType =
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'meeting'
  | 'note'
  | 'sms';

// כיוון תקשורת
type CommunicationDirection = 'incoming' | 'outgoing';

// סטטוס הודעת מייל
type EmailStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'failed';

// סטטוס הודעת SMS
type SMSStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received';

// סטטוס הודעת WhatsApp
type WhatsAppStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'received';

// סוג הודעת WhatsApp
type WhatsAppMessageType =
  | 'text'
  | 'template'
  | 'image'
  | 'document'
  | 'location';

// קטגוריית תבנית WhatsApp
type WhatsAppTemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

// סטטוס תבנית WhatsApp
type WhatsAppTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
```

## Collaboration Enums

```typescript
// סוג ישות לתגובה
type CommentEntityType =
  | 'task'
  | 'room_product'
  | 'document'
  | 'room'
  | 'purchase_order'
  | 'change_order'
  | 'snag_item'
  | 'design_option'
  | 'moodboard'
  | 'project';

// סוג דוח יומי
type DailyLogType =
  | 'site_visit'
  | 'installation'
  | 'inspection'
  | 'delivery'
  | 'general';

// מצב מזג אוויר
type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold';

// עדיפות הערה פנימית
type InternalNotePriority = 'normal' | 'important' | 'warning';

// סוג התראה
type NotificationType =
  | 'mention'
  | 'assignment'
  | 'comment'
  | 'approval_needed'
  | 'approval_received'
  | 'task_due'
  | 'task_overdue'
  | 'payment_received'
  | 'delivery_update'
  | 'status_change'
  | 'daily_log'
  | 'system';
```

## Activity Log Enums

```typescript
// סוג פעולה ביומן
type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'viewed'
  | 'commented'
  | 'status_changed'
  | 'assigned';
```

## Automation Enums

```typescript
// סוג טריגר
type AutomationTriggerType =
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'field_changed'
  | 'status_changed'
  | 'scheduled'
  | 'relative_date'
  | 'manual_trigger'
  | 'webhook_received';

// אופרטור תנאי
type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_list'
  | 'not_in_list'
  | 'date_before'
  | 'date_after'
  | 'date_between'
  | 'days_from_now'
  | 'days_ago';

// סוג פעולה
type AutomationActionType =
  | 'update_field'
  | 'update_status'
  | 'create_entity'
  | 'delete_entity'
  | 'assign_user'
  | 'create_task'
  | 'create_comment'
  | 'create_notification'
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'send_in_app_notification'
  | 'webhook_call'
  | 'create_calendar_event'
  | 'delay'
  | 'condition_branch';

// סטטוס הרצת אוטומציה
type AutomationLogStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial';

// סטטוס תוצאת פעולה
type ActionResultStatus = 'pending' | 'success' | 'failed' | 'skipped';
```

## Integration Enums

```typescript
// ספק אינטגרציה
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
  | 'hashavshevet'
  | 'priority'
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

// סטטוס אינטגרציה
type IntegrationStatus = 'disconnected' | 'connected' | 'error' | 'expired';

// כיוון סנכרון
type SyncDirection = 'import' | 'export' | 'bidirectional';

// תדירות סנכרון
type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

// סטטוס סנכרון
type SyncLogStatus = 'success' | 'partial' | 'failed';

// שיטת HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
```

## Billing Enums

```typescript
// תוכנית מנוי
type PlanId = 'free' | 'starter' | 'professional' | 'enterprise';

// סטטוס מנוי
type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused';

// תקופת חיוב
type BillingPeriod = 'monthly' | 'yearly';

// סטטוס חשבונית
type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// סוג פריט בחשבונית
type InvoiceLineItemType = 'subscription' | 'addon' | 'one_time';

// סוג תוספת
type AddonType = 'users' | 'storage' | 'automations';
```

## Mobile & Offline Enums

```typescript
// סטטוס שינוי ממתין
type PendingChangeStatus = 'pending' | 'syncing' | 'failed' | 'conflict';

// סוג פעולה בשינוי
type ChangeAction = 'create' | 'update' | 'delete';

// סטטוס סנכרון
type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

// רזולוציית קונפליקט
type ConflictResolution = 'local' | 'remote' | 'merge';
```

## UX Enums

```typescript
// סוג Empty State
type EmptyStateType = 'toast' | 'inline' | 'modal' | 'page';

// חומרת שגיאה
type ErrorSeverity = 'error' | 'warning' | 'info';

// סוג Confirmation Dialog
type ConfirmationVariant = 'danger' | 'warning' | 'info';

// סטטוס שדה טופס
type FieldState = 'default' | 'focus' | 'error' | 'success' | 'disabled' | 'readonly';
```

## Configuration Enums

```typescript
// סוג ישות מוגדרת
type ConfigurableEntityType =
  | 'project_type'
  | 'project_status'
  | 'project_phase'
  | 'task_status'
  | 'product_category'
  | 'room_type'
  | 'supplier_category'
  | 'trade'
  | 'document_category'
  | 'expense_category';

// סוג שדה מותאם
type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'url'
  | 'email'
  | 'phone'
  | 'currency'
  | 'textarea'
  | 'file';

// סוג ישות לשדה מותאם
type CustomFieldEntityType =
  | 'project'
  | 'client'
  | 'supplier'
  | 'product'
  | 'room'
  | 'task'
  | 'professional';

// טריגר להודעה
type NotificationTrigger =
  | 'payment_due'
  | 'payment_overdue'
  | 'approval_needed'
  | 'delivery_update'
  | 'project_update'
  | 'meeting_reminder'
  | 'task_due'
  | 'custom';

// ערוץ הודעה
type NotificationChannel =
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'in_app';

// סוגי ישויות לתגיות
type LabelEntityType =
  | 'project'
  | 'client'
  | 'supplier'
  | 'product'
  | 'task';
```

---

# ג. Shared Types - טיפוסים משותפים

## Address & Location

```typescript
interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface GeoLocation {
  lat: number;
  lng: number;
}
```

## Contact Info

```typescript
interface EmailAddress {
  email: string;
  name?: string;
}

interface PhoneNumber {
  number: string;
  countryCode?: string;
}
```

## Money & Pricing

```typescript
interface Money {
  amount: number;
  currency: string;
}

interface PriceRange {
  min: number;
  max: number;
  currency: string;
}
```

## Date & Time

```typescript
interface DateRange {
  from: Date;
  to: Date;
}

interface TimeRange {
  start: string;        // "09:00"
  end: string;          // "17:00"
}

interface ImportantDate {
  date: Date;
  description: string;
  reminder: boolean;
}
```

## Attachments

```typescript
interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

## Dimensions

```typescript
interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit: DimensionUnit;
}
```

## Pagination

```typescript
interface OffsetPagination {
  page: number;
  pageSize: number;
}

interface CursorPagination {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}
```

## API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
  errorId?: string;
}

interface ApiMeta {
  pagination?: PaginationMeta;
  cursor?: {
    next?: string;
    previous?: string;
    hasMore: boolean;
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: Date;
  };
}
```

---

# ד. Entity Relationships - קשרים בין ישויות (ERD מילולי)

## Core Relationships

```
Tenant (1) ──────< User (N)
Tenant (1) ──────< Project (N)
Tenant (1) ──────< Client (N)
Tenant (1) ──────< Supplier (N)
Tenant (1) ──────< Professional (N)
Tenant (1) ──────< Product (N)

Client (1) ──────< Project (N)
Project (1) ──────< Room (N)
Project (1) ──────< Task (N)
Project (1) ──────< Document (N)
Project (1) ──────< Meeting (N)
Project (1) ──────< Payment (N)

Room (1) ──────< RoomProduct (N)
Product (1) ──────< RoomProduct (N)

Project (1) ──────< Proposal (N)
Project (1) ──────< Contract (1)
```

## Financial Relationships

```
Project (1) ──────< Payment (N)
Project (1) ──────< Expense (N)
Project (1) ──────< TimeEntry (N)
Client (1) ──────< Retainer (N)
Retainer (1) ──────< RetainerApplication (N)
Proposal (1) ──────< ProposalItem (N)
```

## Procurement Relationships

```
Supplier (1) ──────< PurchaseOrder (N)
PurchaseOrder (1) ──────< PurchaseOrderItem (N)
RoomProduct (1) ──────< DeliveryTracking (1)
PurchaseOrder (1) ──────< DeliveryTracking (N)
```

## Change Management Relationships

```
Project (1) ──────< ChangeOrder (N)
ChangeOrder (1) ──────< ChangeOrderItem (N)
Project (1) ──────< DesignOption (N)
Room (1) ──────< DesignOption (N)
Project (1) ──────< SnagItem (N)
```

## Collaboration Relationships

```
(Any Entity) ──────< Comment (N)
Project (1) ──────< DailyLog (N)
(Client|Supplier|Professional|Project) ──────< InternalNote (N)
User (1) ──────< Notification (N)
(Any Entity) ──────< ActivityLog (N)
```

## Client Portal Relationships

```
Project (1) ──────< ClientPortalSettings (1)
Project (1) ──────< ClientApproval (N)
```

## MoodBoard Relationships

```
Project (1) ──────< MoodBoard (N)
Room (1) ──────< MoodBoard (N)
MoodBoard (1) ──────< MoodBoardItem (N)
```

## Integration Relationships

```
Tenant (1) ──────< Integration (N)
Integration (1) ──────< IntegrationLog (N)
Tenant (1) ──────< IncomingWebhook (N)
Tenant (1) ──────< OutgoingWebhook (N)
```

## Automation Relationships

```
Tenant (1) ──────< AutomationRule (N)
AutomationRule (1) ──────< AutomationLog (N)
```

## Billing Relationships

```
Tenant (1) ──────< Subscription (1)
Subscription (1) ──────< Invoice (N)
Tenant (1) ──────< UsageTracker (1 per period)
```

## Configuration Relationships

```
Tenant (1) ──────< ConfigurableEntity (N)
Tenant (1) ──────< CustomFieldDefinition (N)
(Any Entity) ──────< CustomFieldValue (N)
Tenant (1) ──────< Label (N)
Tenant (1) ──────< NotificationTemplate (N)
```

## Template Relationships

```
Tenant (1) ──────< ProjectTemplate (N)
Tenant (1) ──────< TaskTemplate (N)
Tenant (1) ──────< ProposalTemplate (N)
Tenant (1) ──────< ContractTemplate (N)
Tenant (1) ──────< EmailTemplate (N)
```

## File Relationships

```
Project (1) ──────< File (N)
Folder (1) ──────< File (N)
Folder (1) ──────< Folder (N)  // Nested folders
File (1) ──────< FileVersion (N)
File|Folder (1) ──────< FileShare (N)
```

## Communication Relationships

```
Tenant (1) ──────< EmailMessage (N)
Tenant (1) ──────< SMSMessage (N)
Tenant (1) ──────< WhatsAppMessage (N)
(Any Entity) ──────< CommunicationLog (N)
```

---

# ה. Naming Conventions - כללי מתן שמות

## Database

| סוג | Convention | דוגמה |
|-----|------------|-------|
| Tables | snake_case, plural | `projects`, `room_products` |
| Columns | snake_case | `created_at`, `tenant_id` |
| Primary Key | `id` (UUID) | `id` |
| Foreign Key | `{table}_id` | `project_id`, `client_id` |
| Timestamps | Standard names | `created_at`, `updated_at`, `deleted_at` |
| Booleans | `is_`, `has_`, `can_` prefix | `is_active`, `has_attachments` |
| Indexes | `idx_{table}_{columns}` | `idx_tasks_project_id` |

## TypeScript/Code

| סוג | Convention | דוגמה |
|-----|------------|-------|
| Interfaces | PascalCase | `Project`, `ClientApproval` |
| Types | PascalCase | `PaymentStatus`, `BillingType` |
| Enums | PascalCase | `Priority`, `FileCategory` |
| Variables | camelCase | `currentProject`, `isLoading` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE`, `API_TIMEOUT` |
| Functions | camelCase | `createProject`, `getClientById` |

## API Endpoints

```
Base: /api/v1

GET    /api/v1/{entities}              # List
POST   /api/v1/{entities}              # Create
GET    /api/v1/{entities}/:id          # Read
PATCH  /api/v1/{entities}/:id          # Update
DELETE /api/v1/{entities}/:id          # Delete

# Nested resources
GET    /api/v1/projects/:id/tasks
POST   /api/v1/projects/:id/tasks
```

## Files & Folders

| סוג | Convention | דוגמה |
|-----|------------|-------|
| Components | PascalCase | `ProjectCard.tsx` |
| Hooks | camelCase with `use` | `useProject.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase | `types/Project.ts` |
| Stores | camelCase with `Store` | `projectStore.ts` |

---

# ו. Constants - קבועים

## Limits

```typescript
const LIMITS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Files
  MAX_FILE_SIZE_MB: 100,
  MAX_UPLOAD_FILES: 20,

  // Text
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_COMMENT_LENGTH: 10000,

  // Quantities
  MAX_ROOMS_PER_PROJECT: 100,
  MAX_PRODUCTS_PER_ROOM: 500,
  MAX_TASKS_PER_PROJECT: 1000,

  // Automations
  MAX_AUTOMATIONS_PER_TENANT: 100,
  MAX_AUTOMATION_RUNS_PER_DAY: 1000,
} as const;
```

## Defaults

```typescript
const DEFAULTS = {
  // Locale
  LOCALE: 'he',
  TIMEZONE: 'Asia/Jerusalem',
  CURRENCY: 'ILS',
  DATE_FORMAT: 'DD/MM/YYYY',

  // Project
  MARKUP_PERCENT: 30,
  VAT_RATE: 17,
  REVISIONS_INCLUDED: 2,

  // Pagination
  PAGE_SIZE: 20,

  // Cache TTL (seconds)
  CACHE_TTL_SHORT: 60,
  CACHE_TTL_MEDIUM: 300,
  CACHE_TTL_LONG: 3600,
} as const;
```

---

# ז. Cross-File References

## איזה קובץ מכיל מה

| קובץ | ישויות |
|------|--------|
| `01-foundation.md` | עקרונות, UX, Design System |
| `02-auth-tenant-user.md` | Tenant, User, AuthSession, MagicLinkToken, OAuthConnection, TeamInvitation, TwoFactorSetup, UserSettings, OnboardingState |
| `03-project-client.md` | Project, Client, Supplier, Professional |
| `04-tasks-docs-meetings.md` | Task, Document, Meeting, Room |
| `05-products-ffe.md` | Product, RoomProduct, PurchaseOrder, PurchaseOrderItem, DeliveryTracking |
| `06-financial.md` | Proposal, ProposalItem, Contract, Retainer, RetainerApplication, Payment, Expense, TimeEntry |
| `07-collaboration.md` | Comment, DailyLog, InternalNote, Notification, ActivityLog, CommunicationLog |
| `08-client-portal.md` | ClientPortalSettings, ClientApproval, MoodBoard, MoodBoardItem, ChangeOrder, DesignOption, SnagItem |
| `09-automations.md` | AutomationRule, AutomationTrigger, AutomationCondition, AutomationAction, AutomationLog |
| `10-integrations.md` | Integration, IntegrationLog, IncomingWebhook, OutgoingWebhook |
| `11-reports-templates.md` | ReportTemplate, SavedFilter, DashboardWidget, ProjectTemplate, TaskTemplate, ProposalTemplate, ContractTemplate, EmailTemplate |
| `12-communication.md` | EmailMessage, SMSMessage, WhatsAppMessage, TenantEmailSettings, TenantSMSSettings, TenantWhatsAppSettings |
| `13-files-billing.md` | File, Folder, FileVersion, FileShare, Plan, Subscription, Invoice, UsageTracker |
| `14-configuration.md` | ConfigurableEntity, CustomFieldDefinition, CustomFieldValue, Label, NotificationTemplate, SearchIndex, RecentItem, Favorite |
| `15-technical.md` | API Standards, Validation, Database, Security, Performance |

---

**גרסה:** 1.0
**תאריך:** ינואר 2026
**מקור:** architect-studio-spec.md
