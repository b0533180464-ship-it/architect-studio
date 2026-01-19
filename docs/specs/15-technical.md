# Technical Specifications - מפרט טכני
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## מטרת המסמך

מסמך זה מכיל את כל המפרטים הטכניים של המערכת:
- תקני API
- כללי ולידציה
- הנחיות מסד נתונים
- אבטחה ופרטיות
- ביצועים
- פריסה

---

# ב. API Standards - תקני API

## Response Format - מבנה תגובה

```typescript
// תבנית תגובה אחידה לכל ה-API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

interface ApiError {
  code: string;                     // "VALIDATION_ERROR", "NOT_FOUND", etc.
  message: string;                  // הודעה ידידותית למשתמש
  details?: Record<string, string>; // פרטים נוספים (שגיאות לפי שדה)
  errorId?: string;                 // מזהה ייחודי לדיבוג
}

interface ApiMeta {
  // Pagination - Offset based
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Pagination - Cursor based
  cursor?: {
    next?: string;
    previous?: string;
    hasMore: boolean;
  };

  // Rate limiting info
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: Date;
  };
}
```

## Error Codes - קודי שגיאה

```typescript
const API_ERROR_CODES = {
  // Authentication
  'AUTH_REQUIRED': 'נדרשת התחברות',
  'AUTH_INVALID': 'פרטי התחברות שגויים',
  'AUTH_EXPIRED': 'פג תוקף ההתחברות',
  'AUTH_2FA_REQUIRED': 'נדרש אימות דו-שלבי',

  // Authorization
  'FORBIDDEN': 'אין הרשאה לפעולה זו',
  'INSUFFICIENT_PERMISSIONS': 'אין מספיק הרשאות',

  // Validation
  'VALIDATION_ERROR': 'שגיאת ולידציה',
  'INVALID_INPUT': 'קלט לא תקין',
  'MISSING_REQUIRED_FIELD': 'שדה חובה חסר',

  // Resources
  'NOT_FOUND': 'המשאב לא נמצא',
  'ALREADY_EXISTS': 'המשאב כבר קיים',
  'CONFLICT': 'קונפליקט - המשאב שונה',

  // Business Logic
  'QUOTA_EXCEEDED': 'חריגה ממכסה',
  'INVALID_STATUS_TRANSITION': 'מעבר סטטוס לא חוקי',
  'DEPENDENCY_ERROR': 'לא ניתן למחוק - יש תלויות',

  // External
  'EXTERNAL_SERVICE_ERROR': 'שגיאה בשירות חיצוני',
  'PAYMENT_FAILED': 'התשלום נכשל',

  // Server
  'INTERNAL_ERROR': 'שגיאת שרת',
  'SERVICE_UNAVAILABLE': 'השירות לא זמין',
  'RATE_LIMITED': 'יותר מדי בקשות',
} as const;
```

## HTTP Status Codes

```typescript
const HTTP_STATUS_USAGE = {
  // Success
  200: 'OK - הבקשה הצליחה',
  201: 'Created - משאב נוצר',
  204: 'No Content - הצליח, אין תוכן להחזיר',

  // Client Errors
  400: 'Bad Request - קלט לא תקין',
  401: 'Unauthorized - נדרשת התחברות',
  403: 'Forbidden - אין הרשאה',
  404: 'Not Found - לא נמצא',
  409: 'Conflict - קונפליקט',
  422: 'Unprocessable Entity - ולידציה נכשלה',
  429: 'Too Many Requests - rate limit',

  // Server Errors
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};
```

## Pagination - עימוד

```typescript
// Offset-based (לדפים קבועים)
interface OffsetPagination {
  page: number;                     // מתחיל מ-1
  pageSize: number;                 // ברירת מחדל 20, מקסימום 100
}

// Cursor-based (ל-infinite scroll, real-time)
interface CursorPagination {
  cursor?: string;                  // מזהה הפריט האחרון
  limit: number;                    // כמה להביא
  direction?: 'forward' | 'backward';
}

// שימוש מומלץ לפי סוג תוכן
const PAGINATION_STRATEGY = {
  'projects_list': 'offset',        // דפים, מספר קבוע
  'tasks_list': 'cursor',           // infinite scroll
  'activity_feed': 'cursor',        // real-time updates
  'search_results': 'offset',       // דפים עם מספור
  'notifications': 'cursor',        // infinite scroll
};
```

---

# ג. Validation Rules - כללי ולידציה

## שדות נפוצים

```typescript
const VALIDATION_RULES = {
  // טקסט
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[\u0590-\u05FFa-zA-Z0-9\s\-_.]+$/,  // עברית, אנגלית, מספרים
  },

  description: {
    maxLength: 5000,
  },

  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },

  phone: {
    pattern: /^[\d\-+().\s]+$/,
    minLength: 9,
    maxLength: 20,
  },

  // מספרים
  price: {
    min: 0,
    max: 999999999,
    precision: 2,
  },

  percentage: {
    min: 0,
    max: 100,
    precision: 2,
  },

  quantity: {
    min: 0,
    max: 999999,
    integer: true,
  },

  // תאריכים
  date: {
    format: 'ISO8601',
    minDate: '1900-01-01',
    maxDate: '2100-12-31',
  },

  // קבצים
  fileName: {
    maxLength: 255,
    forbiddenChars: ['/', '\\', ':', '*', '?', '"', '<', '>', '|'],
  },

  fileSize: {
    maxBytes: 104857600,            // 100MB
  },

  // URLs
  url: {
    pattern: /^https?:\/\/.+/,
    maxLength: 2000,
  },

  // סיסמה
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
};
```

## ולידציה לפי Entity

```typescript
const ENTITY_VALIDATION = {
  Project: {
    name: { required: true, ...VALIDATION_RULES.name },
    code: { maxLength: 20, pattern: /^[A-Z0-9\-]+$/ },
    budget: { ...VALIDATION_RULES.price },
    startDate: { required: false, ...VALIDATION_RULES.date },
    endDate: {
      ...VALIDATION_RULES.date,
      custom: (value, entity) => !entity.startDate || value >= entity.startDate,
      customMessage: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
    },
  },

  Client: {
    name: { required: true, ...VALIDATION_RULES.name },
    email: { required: true, ...VALIDATION_RULES.email },
    phone: { ...VALIDATION_RULES.phone },
  },

  Task: {
    title: { required: true, minLength: 1, maxLength: 500 },
    description: { ...VALIDATION_RULES.description },
    dueDate: { ...VALIDATION_RULES.date },
    estimatedHours: { min: 0, max: 1000 },
  },

  Payment: {
    amount: { required: true, min: 0.01, ...VALIDATION_RULES.price },
    dueDate: { required: true, ...VALIDATION_RULES.date },
  },

  Product: {
    name: { required: true, ...VALIDATION_RULES.name },
    sku: { maxLength: 50 },
    supplierPrice: { ...VALIDATION_RULES.price },
    clientPrice: { ...VALIDATION_RULES.price },
  },
};
```

---

# ד. Localization (i18n) - בינלאומיות

## תמיכה בשפות

```typescript
interface LocalizationConfig {
  // שפות נתמכות
  supportedLocales: ['he', 'en'];
  defaultLocale: 'he';

  // כיוון
  rtlLocales: ['he', 'ar'];

  // פורמטים לפי locale
  formats: {
    he: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      dateTimeFormat: 'DD/MM/YYYY HH:mm',
      firstDayOfWeek: 0,            // ראשון
      currency: 'ILS',
      currencySymbol: '₪',
      currencyPosition: 'after',    // 100 ₪
      decimalSeparator: '.',
      thousandsSeparator: ',',
      numberFormat: '#,##0.00',
    },
    en: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'h:mm A',
      dateTimeFormat: 'MM/DD/YYYY h:mm A',
      firstDayOfWeek: 0,
      currency: 'USD',
      currencySymbol: '$',
      currencyPosition: 'before',   // $100
      decimalSeparator: '.',
      thousandsSeparator: ',',
      numberFormat: '#,##0.00',
    },
  };
}
```

## מבנה תרגומים

```typescript
interface Translations {
  // כללי
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    loading: string;
  };

  // ישויות
  entities: {
    project: { singular: string; plural: string };
    client: { singular: string; plural: string };
    task: { singular: string; plural: string };
    // ...
  };

  // סטטוסים
  statuses: Record<string, string>;

  // שגיאות
  errors: Record<string, string>;

  // הצלחות
  success: Record<string, string>;

  // Empty states
  emptyStates: Record<string, { title: string; description: string }>;
}

// דוגמה לעברית
const HE_TRANSLATIONS: Partial<Translations> = {
  common: {
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    create: 'צור',
    search: 'חיפוש',
    filter: 'סינון',
    export: 'ייצוא',
    import: 'יבוא',
    loading: 'טוען...',
  },
  entities: {
    project: { singular: 'פרויקט', plural: 'פרויקטים' },
    client: { singular: 'לקוח', plural: 'לקוחות' },
    task: { singular: 'משימה', plural: 'משימות' },
    supplier: { singular: 'ספק', plural: 'ספקים' },
    payment: { singular: 'תשלום', plural: 'תשלומים' },
    document: { singular: 'מסמך', plural: 'מסמכים' },
    meeting: { singular: 'פגישה', plural: 'פגישות' },
    product: { singular: 'מוצר', plural: 'מוצרים' },
    room: { singular: 'חדר', plural: 'חדרים' },
    proposal: { singular: 'הצעת מחיר', plural: 'הצעות מחיר' },
    contract: { singular: 'חוזה', plural: 'חוזים' },
  },
};
```

---

# ה. Database Guidelines - הנחיות מסד נתונים

## Naming Conventions

```typescript
const DB_CONVENTIONS = {
  // Tables
  tables: {
    case: 'snake_case',
    plural: true,
    examples: ['projects', 'clients', 'room_products'],
  },

  // Columns
  columns: {
    case: 'snake_case',
    examples: ['created_at', 'tenant_id', 'is_active'],
  },

  // Primary Keys
  primaryKey: {
    name: 'id',
    type: 'uuid',                   // או cuid
    generation: 'uuid_generate_v4()',
  },

  // Foreign Keys
  foreignKeys: {
    pattern: '{table_singular}_id',
    examples: ['project_id', 'client_id', 'tenant_id'],
  },

  // Timestamps
  timestamps: {
    created: 'created_at',
    updated: 'updated_at',
    deleted: 'deleted_at',          // soft delete
  },

  // Booleans
  booleans: {
    prefix: 'is_' | 'has_' | 'can_',
    examples: ['is_active', 'has_notifications', 'can_edit'],
  },

  // Indexes
  indexes: {
    pattern: 'idx_{table}_{columns}',
    examples: ['idx_tasks_project_id', 'idx_payments_tenant_id_status'],
  },
};
```

## Required Indexes

```sql
-- כל טבלה צריכה index על tenant_id
CREATE INDEX idx_{table}_tenant_id ON {table}(tenant_id);

-- Foreign keys
CREATE INDEX idx_{table}_{fk}_id ON {table}({fk}_id);

-- Common queries
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_payments_tenant_due ON payments(tenant_id, due_date);
CREATE INDEX idx_activities_entity ON activity_logs(entity_type, entity_id);

-- Full-text search
CREATE INDEX idx_projects_search ON projects
  USING gin(to_tsvector('hebrew', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_clients_search ON clients
  USING gin(to_tsvector('hebrew', name || ' ' || COALESCE(email, '')));
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ... all tables

-- Policy template - SELECT/UPDATE/DELETE
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Insert policy
CREATE POLICY tenant_insert ON {table}
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Example: Setting tenant context in application
SET LOCAL app.current_tenant_id = 'tenant-uuid-here';
```

---

# ו. Security - אבטחה

## Authentication Security

```typescript
interface AuthenticationSecurity {
  // מדיניות סיסמאות
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    preventCommonPasswords: true,
    preventReuse: 5,                  // 5 סיסמאות אחרונות
  },

  // ניסיונות כניסה
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60,         // 15 דקות (בשניות)
    progressiveDelay: true,           // עיכוב גדל בין ניסיונות
  },

  // Sessions
  sessions: {
    accessTokenTTL: 24 * 60 * 60,     // 24 שעות
    refreshTokenTTL: 30 * 24 * 60 * 60, // 30 ימים
    maxConcurrentSessions: 5,
    invalidateOnPasswordChange: true,
  },

  // 2FA
  twoFactor: {
    available: true,
    required: false,                  // תלוי plan
    methods: ['totp', 'sms'],
    backupCodes: 10,
  },
}
```

## Data Security

```typescript
interface DataSecurity {
  // הצפנה
  encryption: {
    // At rest
    atRest: {
      database: 'AES-256',
      files: 'AES-256',
      backups: 'AES-256',
    },

    // In transit
    inTransit: {
      protocol: 'TLS 1.3',
      certificateType: 'EV SSL',
    },

    // שדות רגישים (מוצפנים תמיד)
    sensitiveFields: [
      'password',
      'apiKey',
      'accessToken',
      'refreshToken',
      'creditCard',
      'bankAccount',
    ],
  },

  // גיבוי
  backup: {
    frequency: 'daily',
    retention: 30,                    // ימים
    encryption: true,
    geoRedundant: true,
  },

  // Secrets management
  secrets: {
    storage: 'environment' | 'vault',
    rotation: 90,                     // ימים
  },
}
```

## Access Control

```typescript
interface AccessControl {
  // RBAC
  roles: {
    'owner': { all: true },
    'manager': { manage: true, delete: false },
    'member': { read: true, write: true, manage: false },
    'viewer': { read: true },
  },

  // Permissions
  permissions: Permission[],

  // Row Level Security
  rls: {
    enabled: true,
    byTenant: true,
    byProject: true,
    byUser: false,                    // optional
  },
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

const PERMISSIONS = [
  { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'team', actions: ['read', 'invite', 'remove', 'manage'] },
  { resource: 'settings', actions: ['read', 'update'] },
  { resource: 'billing', actions: ['read', 'manage'] },
  { resource: 'integrations', actions: ['read', 'connect', 'disconnect'] },
  { resource: 'reports', actions: ['read', 'create', 'export'] },
];
```

## API Security

```typescript
interface APISecurity {
  // Rate limiting
  rateLimiting: {
    global: '1000/minute',
    perEndpoint: {
      'auth/*': '10/minute',
      'api/*': '100/minute',
      'upload/*': '20/minute',
    },
    perTenant: true,
    perUser: true,
  },

  // CORS
  cors: {
    allowedOrigins: ['https://app.example.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowCredentials: true,
    maxAge: 86400,
  },

  // Security Headers
  securityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },

  // Input Validation
  inputValidation: {
    sanitizeInput: true,
    validateTypes: true,
    maxPayloadSize: '10mb',
  },
}
```

## Audit Logging

```typescript
interface AuditLog {
  id: string;
  tenantId: string;

  // מי
  userId: string;
  userEmail: string;
  userRole: string;

  // מה
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;

  // פרטים
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  // מאיפה
  ipAddress: string;
  userAgent: string;
  location?: string;

  // מתי
  timestamp: Date;

  // סטטוס
  status: 'success' | 'failure';
  errorMessage?: string;
}

// אילו פעולות לתעד
const AUDITED_ACTIONS = [
  // Authentication
  'auth.login',
  'auth.logout',
  'auth.password_change',
  'auth.2fa_enable',
  'auth.2fa_disable',

  // Users
  'user.invite',
  'user.remove',
  'user.role_change',

  // Data - sensitive
  'client.create',
  'client.delete',
  'payment.create',
  'payment.update',
  'contract.sign',

  // Settings
  'settings.update',
  'integration.connect',
  'integration.disconnect',

  // Export
  'data.export',
  'report.download',
];
```

---

# ז. Privacy (GDPR) - פרטיות

## מדיניות איסוף נתונים

```typescript
interface PrivacyPolicy {
  // מה אוספים
  dataCollected: {
    // הכרחי לשירות
    essential: ['email', 'name', 'phone', 'business_info'],

    // אופציונלי
    optional: ['profile_photo', 'location', 'usage_analytics'],

    // אוטומטי
    automatic: ['ip_address', 'device_info', 'usage_logs'],
  },

  // מטרות
  purposes: [
    'service_delivery',
    'customer_support',
    'product_improvement',
    'marketing',               // requires consent
  ],

  // משך שמירה
  retention: {
    activeAccount: 'indefinite',
    deletedAccount: '30 days',
    logs: '90 days',
    backups: '30 days',
  },
}
```

## זכויות משתמש

```typescript
interface UserRights {
  // Right to Access - זכות לגישה
  dataAccess: {
    enabled: true,
    format: ['json', 'csv'],
    deliveryTime: '30 days',
    endpoint: 'GET /api/privacy/my-data',
  },

  // Right to Portability - זכות לניידות
  dataPortability: {
    enabled: true,
    format: 'json',
    includesFiles: true,
    endpoint: 'POST /api/privacy/export',
  },

  // Right to Erasure - זכות למחיקה
  dataErasure: {
    enabled: true,
    softDelete: true,
    permanentAfter: '30 days',
    endpoint: 'DELETE /api/privacy/my-account',

    // מה נמחק
    deletes: ['user_profile', 'user_settings', 'personal_files'],

    // מה נשמר (anonymized) - חובה חוקית
    retains: ['audit_logs', 'financial_records'],
  },

  // Right to Rectification - זכות לתיקון
  dataRectification: {
    enabled: true,
    selfService: true,
    endpoint: 'PATCH /api/users/me',
  },

  // Right to Restrict Processing - זכות להגבלת עיבוד
  processingRestriction: {
    enabled: true,
    options: ['marketing', 'analytics'],
    endpoint: 'PATCH /api/privacy/preferences',
  },
}
```

## ניהול הסכמות

```typescript
interface ConsentManagement {
  // סוגי הסכמות
  consentTypes: {
    essential: {
      required: true,
      description: 'נדרש לתפעול השירות',
    },
    analytics: {
      required: false,
      description: 'עוזר לנו לשפר את השירות',
      default: true,
    },
    marketing: {
      required: false,
      description: 'קבלת עדכונים ומבצעים',
      default: false,
    },
    thirdParty: {
      required: false,
      description: 'שיתוף עם שותפים',
      default: false,
    },
  },

  // לוג הסכמות
  consentLog: {
    trackChanges: true,
    retainHistory: true,
  },

  // UI
  consentUI: {
    showOnFirstVisit: true,
    allowGranular: true,
    easyWithdrawal: true,
  },
}

interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
  method: 'signup' | 'settings' | 'banner';
  ipAddress: string;
  policyVersion: string;
}
```

## Privacy API

```typescript
// Privacy endpoints
GET  /api/privacy/policy              // מדיניות פרטיות
GET  /api/privacy/my-data             // ייצוא נתונים אישיים
POST /api/privacy/export              // בקשת ייצוא מלא
DELETE /api/privacy/my-account        // מחיקת חשבון

GET  /api/privacy/consents            // הסכמות נוכחיות
PATCH /api/privacy/consents           // עדכון הסכמות

GET  /api/privacy/data-processors     // רשימת ספקי משנה
```

---

# ח. Performance - ביצועים

## Response Time Targets

```typescript
const PERFORMANCE_TARGETS = {
  // API
  api: {
    p50: 100,                       // ms
    p95: 500,
    p99: 1000,
  },

  // Database queries
  database: {
    simple: 10,                     // ms
    complex: 100,
    report: 1000,
  },

  // Frontend (Core Web Vitals)
  frontend: {
    FCP: 1500,                      // First Contentful Paint
    LCP: 2500,                      // Largest Contentful Paint
    TTI: 3500,                      // Time to Interactive
    CLS: 0.1,                       // Cumulative Layout Shift
  },

  // WebSocket
  websocket: {
    latency: 100,                   // ms
    reconnect: 3000,                // max time to reconnect
  },

  // File operations
  files: {
    uploadStart: 200,               // time to start upload
    thumbnailGeneration: 5000,      // background job
  },
};
```

## Caching Strategy

```typescript
const CACHING_STRATEGY = {
  // Redis cache
  redis: {
    userSession: { ttl: 86400 },    // 24 hours
    tenantConfig: { ttl: 3600 },    // 1 hour
    searchIndex: { ttl: 300 },      // 5 minutes
    dashboardWidgets: { ttl: 60 },  // 1 minute
    recentItems: { ttl: 3600 },
  },

  // HTTP cache headers
  http: {
    staticAssets: 'max-age=31536000, immutable',
    api: 'private, no-cache',
    publicData: 'max-age=60',
  },

  // React Query / TanStack Query
  reactQuery: {
    staleTime: 30000,               // 30 seconds
    cacheTime: 300000,              // 5 minutes
    refetchOnWindowFocus: true,
  },
};
```

---

# ט. Environment Variables

```typescript
// משתני סביבה נדרשים
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URL: 'postgresql://...',

  // Auth
  JWT_SECRET: 'random-string-min-32-chars',
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '30d',

  // Storage
  S3_BUCKET: 'bucket-name',
  S3_REGION: 'eu-central-1',
  S3_ACCESS_KEY: 'xxx',
  S3_SECRET_KEY: 'xxx',

  // Redis
  REDIS_URL: 'redis://...',

  // Email
  SENDGRID_API_KEY: 'xxx',
  EMAIL_FROM: 'noreply@example.com',

  // SMS
  TWILIO_ACCOUNT_SID: 'xxx',
  TWILIO_AUTH_TOKEN: 'xxx',
  TWILIO_PHONE_NUMBER: '+972...',

  // WhatsApp
  WHATSAPP_PHONE_NUMBER_ID: 'xxx',
  WHATSAPP_ACCESS_TOKEN: 'xxx',

  // Payments
  STRIPE_SECRET_KEY: 'xxx',
  STRIPE_WEBHOOK_SECRET: 'xxx',

  // OAuth
  GOOGLE_CLIENT_ID: 'xxx',
  GOOGLE_CLIENT_SECRET: 'xxx',

  // App
  APP_URL: 'https://app.example.com',
  API_URL: 'https://api.example.com',

  // Feature flags
  ENABLE_DEBUG_MODE: 'false',
  ENABLE_DEMO_MODE: 'false',
};
```

---

# י. Deployment Checklist

```typescript
const DEPLOYMENT_CHECKLIST = {
  // Pre-deployment
  pre: [
    'Run all tests',
    'Check TypeScript compilation',
    'Run linter',
    'Check bundle size',
    'Review environment variables',
    'Database migrations ready',
  ],

  // Database
  database: [
    'Backup current database',
    'Run migrations',
    'Verify indexes',
    'Check RLS policies',
  ],

  // Infrastructure
  infrastructure: [
    'SSL certificates valid',
    'CDN cache cleared',
    'Redis connected',
    'S3 bucket accessible',
    'Email service working',
  ],

  // Post-deployment
  post: [
    'Health check passing',
    'Critical user flows working',
    'WebSocket connections working',
    'Monitoring alerts configured',
    'Error tracking enabled',
  ],
};
```

---

# יא. קשרים לקבצים אחרים

## מסמך זה רלוונטי לכל שאר הקבצים

מפרט טכני זה מספק את ההנחיות עבור:

| תחום | קבצים רלוונטיים |
|------|-----------------|
| API Standards | כל הקבצים עם API Endpoints |
| Validation | כל הקבצים עם Interfaces |
| Database | כל הקבצים עם Database Schema |
| Security | `02-auth-tenant-user.md`, `08-client-portal.md` |
| Performance | `07-collaboration.md` (Real-time), `13-files-billing.md` |

---

**הפניות לקבצים אחרים:**
- Enums: `00-shared-definitions.md`
- Foundation: `01-foundation.md`
- Auth: `02-auth-tenant-user.md`
- כל שאר הקבצים: יישום ההנחיות הטכניות
