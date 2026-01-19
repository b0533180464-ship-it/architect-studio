# Files & Billing - קבצים וחיוב

## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. מערכת ניהול קבצים

## עקרון מנחה

ניהול קבצים מרכזי עם תיקיות, גרסאות, ותצוגה מקדימה - הכל מאורגן לפי פרויקט ונגיש מכל מקום.

---

## File - קובץ

### Interface

```typescript
interface File {
  id: string;
  tenantId: string;

  // מיקום
  folderId?: string;                // null = root
  projectId?: string;

  // פרטי קובץ
  name: string;
  originalName: string;

  // סוג
  mimeType: string;
  extension: string;
  category: FileCategory;

  // גודל
  size: number;                     // bytes

  // אחסון
  storageProvider: StorageProvider;
  storagePath: string;
  storageUrl: string;

  // תמונות
  thumbnailUrl?: string;
  previewUrl?: string;

  // גרסאות
  version: number;
  parentVersionId?: string;
  isLatestVersion: boolean;

  // מטא
  metadata: FileMetadata;

  // תיוג
  tags?: string[];
  description?: string;

  // שיתוף
  isSharedWithClient: boolean;
  clientCanDownload: boolean;

  // סטטיסטיקות
  downloadCount: number;
  viewCount: number;
  lastAccessedAt?: Date;

  // מטא
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;                 // soft delete
}

interface FileMetadata {
  width?: number;                   // לתמונות
  height?: number;
  duration?: number;                // לוידאו
  pageCount?: number;               // ל-PDF

  // EXIF לתמונות
  camera?: string;
  takenAt?: Date;
  location?: { lat: number; lng: number };
}
```

### Database Schema

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- מיקום
  folder_id UUID REFERENCES folders(id),
  project_id UUID REFERENCES projects(id),

  -- פרטי קובץ
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,

  -- סוג
  mime_type VARCHAR(100) NOT NULL,
  extension VARCHAR(20),
  category VARCHAR(20) NOT NULL,

  -- גודל
  size BIGINT NOT NULL,

  -- אחסון
  storage_provider VARCHAR(20) NOT NULL,
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,

  -- תמונות
  thumbnail_url TEXT,
  preview_url TEXT,

  -- גרסאות
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES files(id),
  is_latest_version BOOLEAN NOT NULL DEFAULT true,

  -- מטא
  metadata JSONB DEFAULT '{}',

  -- תיוג
  tags TEXT[],
  description TEXT,

  -- שיתוף
  is_shared_with_client BOOLEAN NOT NULL DEFAULT false,
  client_can_download BOOLEAN NOT NULL DEFAULT true,

  -- סטטיסטיקות
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- מטא
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_category CHECK (category IN (
    'document', 'image', 'drawing', 'render', 'plan',
    'presentation', 'spreadsheet', 'video', 'audio', 'archive', 'other'
  ))
);

-- Indexes
CREATE INDEX idx_files_tenant_id ON files(tenant_id);
CREATE INDEX idx_files_folder_id ON files(tenant_id, folder_id);
CREATE INDEX idx_files_project_id ON files(tenant_id, project_id);
CREATE INDEX idx_files_category ON files(tenant_id, category);
CREATE INDEX idx_files_tags ON files USING gin(tags);
CREATE INDEX idx_files_deleted ON files(tenant_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON files
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Folder - תיקייה

### Interface

```typescript
interface Folder {
  id: string;
  tenantId: string;

  // היררכיה
  parentId?: string;                // null = root
  projectId?: string;

  // פרטים
  name: string;
  description?: string;
  color?: string;
  icon?: string;

  // סוג
  type: FolderType;

  // Smart folders - תיקיות דינמיות
  smartCriteria?: SmartFolderCriteria;

  // הרשאות
  permissions: FolderPermissions;

  // סטטיסטיקות (computed)
  fileCount: number;
  totalSize: number;

  // מטא
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SmartFolderCriteria {
  mimeTypes?: string[];
  tags?: string[];
  dateRange?: { from: Date; to: Date };
  uploadedBy?: string;
}

interface FolderPermissions {
  isSharedWithClient: boolean;
  clientCanUpload: boolean;
  clientCanDownload: boolean;
}
```

### Database Schema

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- היררכיה
  parent_id UUID REFERENCES folders(id),
  project_id UUID REFERENCES projects(id),

  -- פרטים
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),

  -- סוג
  type VARCHAR(20) NOT NULL DEFAULT 'regular',

  -- Smart folders
  smart_criteria JSONB,

  -- הרשאות
  permissions JSONB NOT NULL DEFAULT '{
    "isSharedWithClient": false,
    "clientCanUpload": false,
    "clientCanDownload": true
  }',

  -- סטטיסטיקות (computed - מתעדכן ב-trigger)
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size BIGINT NOT NULL DEFAULT 0,

  -- מטא
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('regular', 'system', 'smart'))
);

-- Indexes
CREATE INDEX idx_folders_tenant_id ON folders(tenant_id);
CREATE INDEX idx_folders_parent_id ON folders(tenant_id, parent_id);
CREATE INDEX idx_folders_project_id ON folders(tenant_id, project_id);

-- RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON folders
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## FileVersion - גרסת קובץ

### Interface

```typescript
interface FileVersion {
  id: string;
  fileId: string;

  version: number;

  // פרטי גרסה
  storageUrl: string;
  size: number;

  // מה השתנה
  changeNote?: string;

  // מטא
  uploadedBy: string;
  createdAt: Date;
}
```

### Database Schema

```sql
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  version INTEGER NOT NULL,

  -- פרטי גרסה
  storage_url TEXT NOT NULL,
  size BIGINT NOT NULL,

  -- מה השתנה
  change_note TEXT,

  -- מטא
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(file_id, version)
);

-- Indexes
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);

-- RLS (דרך file)
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON file_versions
  USING (
    file_id IN (
      SELECT id FROM files
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );
```

---

## FileShare - שיתוף קובץ

### Interface

```typescript
interface FileShare {
  id: string;
  tenantId: string;

  // מה משותף
  fileId?: string;
  folderId?: string;

  // סוג שיתוף
  type: FileShareType;

  // הגדרות
  settings: FileShareSettings;

  // קישור
  token: string;
  publicUrl: string;

  // אם email
  sharedWithEmail?: string;

  // סטטיסטיקות
  viewCount: number;
  downloadCount: number;
  lastAccessedAt?: Date;

  createdBy: string;
  createdAt: Date;
}

interface FileShareSettings {
  expiresAt?: Date;
  password?: string;
  maxDownloads?: number;
  allowDownload: boolean;
  allowPreview: boolean;
}
```

### Database Schema

```sql
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- מה משותף
  file_id UUID REFERENCES files(id),
  folder_id UUID REFERENCES folders(id),

  -- סוג שיתוף
  type VARCHAR(20) NOT NULL,

  -- הגדרות
  settings JSONB NOT NULL DEFAULT '{
    "allowDownload": true,
    "allowPreview": true
  }',

  -- קישור
  token VARCHAR(64) NOT NULL UNIQUE,
  public_url TEXT NOT NULL,

  -- אם email
  shared_with_email VARCHAR(255),

  -- סטטיסטיקות
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('link', 'email')),
  CONSTRAINT has_target CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_file_shares_tenant_id ON file_shares(tenant_id);
CREATE INDEX idx_file_shares_token ON file_shares(token);
CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX idx_file_shares_folder_id ON file_shares(folder_id);

-- RLS
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON file_shares
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## מבנה תיקיות ברירת מחדל

```typescript
// לכל פרויקט נוצר מבנה אוטומטי
const DEFAULT_PROJECT_FOLDERS = [
  { name: 'תוכניות', icon: 'blueprint', type: 'system' },
  { name: 'הדמיות', icon: 'image', type: 'system' },
  { name: 'מסמכים', icon: 'file-text', type: 'system' },
  { name: 'חוזים והצעות', icon: 'file-signature', type: 'system' },
  { name: 'תמונות מהשטח', icon: 'camera', type: 'system' },
  { name: 'ספקים', icon: 'truck', type: 'system' },
  { name: 'לקוח', icon: 'user', type: 'system', isSharedWithClient: true },
];

// תיקיות חכמות גלובליות
const SMART_FOLDERS = [
  { name: 'כל התמונות', smartCriteria: { mimeTypes: ['image/*'] }},
  { name: 'PDF', smartCriteria: { mimeTypes: ['application/pdf'] }},
  { name: 'הועלה השבוע', smartCriteria: { dateRange: 'this_week' }},
];
```

---

## Upload System

### Upload Flow

```typescript
// שלב 1: בקשת URL להעלאה
interface UploadUrlRequest {
  fileName: string;
  mimeType: string;
  size: number;
  folderId?: string;
  projectId?: string;
}

interface UploadUrlResponse {
  uploadId: string;
  uploadUrl: string;                // Pre-signed URL
  expiresAt: Date;
}

// שלב 2: העלאה ישירה ל-Storage
// Client uploads directly to S3/R2

// שלב 3: אישור העלאה
interface ConfirmUploadRequest {
  uploadId: string;
  description?: string;
  tags?: string[];
  isSharedWithClient?: boolean;
}

// שלב 4: עיבוד (Background)
// - יצירת thumbnail
// - חילוץ metadata
// - סריקת וירוסים
// - OCR לתמונות (אופציונלי)
```

### Chunked Upload (לקבצים גדולים)

```typescript
interface ChunkedUploadInit {
  fileName: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;                // default 5MB
}

interface ChunkedUploadResponse {
  uploadId: string;
  totalChunks: number;
  chunkUrls: {
    partNumber: number;
    uploadUrl: string;
  }[];
}

interface CompleteChunkedUpload {
  uploadId: string;
  parts: {
    partNumber: number;
    etag: string;
  }[];
}
```

### Upload Restrictions

```typescript
interface UploadRestrictions {
  maxFileSize: number;              // bytes - 100MB default
  maxTotalStorage: number;          // bytes - per tenant (לפי plan)
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  scanForViruses: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'application/vnd.ms-excel',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',

  // Design
  'application/x-autocad',
  'image/vnd.dwg',
  'application/x-dwg',

  // Video
  'video/mp4',
  'video/quicktime',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
];

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1',
  '.js', '.vbs', '.jar',
];
```

---

## Image Processing

```typescript
interface ImageProcessingConfig {
  // Thumbnails
  thumbnails: {
    small: { width: 150, height: 150, fit: 'cover' };
    medium: { width: 400, height: 400, fit: 'inside' };
    large: { width: 1200, height: 1200, fit: 'inside' };
  };

  // Optimization
  optimization: {
    maxWidth: 4000;
    maxHeight: 4000;
    quality: 85;
    format: 'webp' | 'original';
    stripMetadata: false;
  };

  // Watermark (אופציונלי)
  watermark?: {
    enabled: boolean;
    imageUrl: string;
    position: 'bottom-right' | 'center';
    opacity: number;
  };
}
```

---

## File Preview

### Preview Support

```typescript
const PREVIEW_SUPPORT = {
  // Native browser preview
  'image/*': { type: 'image', viewer: 'native' },
  'video/*': { type: 'video', viewer: 'native' },
  'audio/*': { type: 'audio', viewer: 'native' },

  // PDF
  'application/pdf': { type: 'pdf', viewer: 'pdfjs' },

  // Office (via conversion)
  'application/msword': { type: 'document', viewer: 'google_docs_viewer' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', viewer: 'google_docs_viewer' },
  'application/vnd.ms-excel': { type: 'spreadsheet', viewer: 'google_docs_viewer' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'spreadsheet', viewer: 'google_docs_viewer' },
  'application/vnd.ms-powerpoint': { type: 'presentation', viewer: 'google_docs_viewer' },

  // Text
  'text/*': { type: 'text', viewer: 'code' },

  // CAD - no preview, download only
  'application/x-autocad': { type: 'cad', viewer: 'none' },
};
```

### Preview Modal UI

```typescript
interface FilePreviewUI {
  // Header
  header: {
    fileName: true;
    fileSize: true;
    uploadedBy: true;
    uploadedAt: true;
  };

  // Viewer
  viewer: {
    fullscreen: true;
    zoom: true;                     // לתמונות, PDF
    rotate: true;                   // לתמונות
    pageNavigation: true;           // ל-PDF
  };

  // Sidebar (אופציונלי)
  sidebar: {
    metadata: true;
    versions: true;
    comments: true;
    activity: true;
  };

  // Actions
  actions: ['download', 'share', 'delete', 'rename', 'move', 'new_version'];

  // Navigation
  navigation: {
    previousFile: true;
    nextFile: true;
    keyboard: true;                 // ← →
  };
}
```

---

## Storage Usage

```typescript
interface StorageUsage {
  tenantId: string;

  // נוכחי
  usedBytes: number;
  usedFormatted: string;            // "2.5 GB"

  // מגבלה
  limitBytes: number;
  limitFormatted: string;

  // אחוז
  usagePercent: number;

  // פירוט
  breakdown: {
    category: string;
    bytes: number;
    fileCount: number;
    percent: number;
  }[];

  // לפי פרויקט
  byProject: {
    projectId: string;
    projectName: string;
    bytes: number;
    fileCount: number;
  }[];
}

interface StorageMaintenanceConfig {
  autoDelete: {
    deletedFilesAfterDays: 30;
    oldVersionsAfterDays: 90;
    keepMinVersions: 3;
    tempFilesAfterHours: 24;
  };

  alerts: {
    storageWarningPercent: 80;
    storageFullPercent: 95;
  };

  deduplication: {
    enabled: boolean;
    byHash: boolean;
  };
}
```

---

## File API Endpoints

```typescript
// Upload
POST /api/files/upload-url
POST /api/files/confirm-upload
POST /api/files/chunked/init
POST /api/files/chunked/complete

// CRUD
GET /api/files
GET /api/files/:id
PATCH /api/files/:id
DELETE /api/files/:id

// Versions
GET /api/files/:id/versions
POST /api/files/:id/versions
GET /api/files/:id/versions/:versionId/download

// Download
GET /api/files/:id/download
GET /api/files/:id/thumbnail/:size
GET /api/files/:id/preview

// Share
POST /api/files/:id/share
GET /api/files/shared/:token
DELETE /api/files/:id/share/:shareId

// Folders
GET /api/folders
POST /api/folders
PATCH /api/folders/:id
DELETE /api/folders/:id
GET /api/folders/:id/files

// Bulk
POST /api/files/bulk/move
POST /api/files/bulk/delete
POST /api/files/bulk/download        // ZIP

// Storage
GET /api/storage/usage
```

---

# ב. מערכת מנויים וחיוב

## Plan - תוכנית מנוי

### Interface

```typescript
interface Plan {
  id: string;

  // מזהה
  name: string;
  displayName: string;
  description: string;

  // מחיר
  pricing: PlanPricing;

  // מגבלות
  limits: PlanLimits;

  // פיצ'רים
  features: PlanFeature[];

  // סטטוס
  isActive: boolean;
  isPopular: boolean;               // להצגה

  // סדר
  order: number;
}

interface PlanPricing {
  monthly: number;
  yearly: number;
  yearlyDiscount: number;           // אחוז
  currency: string;
}

interface PlanLimits {
  maxUsers: number;                 // -1 = unlimited
  maxActiveProjects: number;
  maxTotalProjects: number;
  maxStorageGB: number;
  maxClientPortals: number;
  maxIntegrations: number;
  maxAutomations: number;
  automationRunsPerMonth: number;
  apiRequestsPerMonth: number;
}

interface PlanFeature {
  key: string;
  name: string;
  included: boolean;
  limit?: number | string;
}
```

### Database Schema

```sql
CREATE TABLE plans (
  id VARCHAR(50) PRIMARY KEY,

  -- מזהה
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,

  -- מחיר
  pricing JSONB NOT NULL,

  -- מגבלות
  limits JSONB NOT NULL,

  -- פיצ'רים
  features JSONB NOT NULL DEFAULT '[]',

  -- סטטוס
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,

  -- סדר
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plans_active ON plans(is_active);
CREATE INDEX idx_plans_order ON plans(sort_order);
```

### תוכניות מובנות

```typescript
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'חינם',
    description: 'להתחלה',
    pricing: { monthly: 0, yearly: 0, currency: 'ILS' },
    limits: {
      maxUsers: 1,
      maxActiveProjects: 2,
      maxTotalProjects: 5,
      maxStorageGB: 1,
      maxClientPortals: 0,
      maxIntegrations: 1,
      maxAutomations: 0,
      automationRunsPerMonth: 0,
      apiRequestsPerMonth: 0,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true, limit: 5 },
      { key: 'client_portal', name: 'פורטל לקוח', included: false },
      { key: 'automations', name: 'אוטומציות', included: false },
      { key: 'integrations', name: 'אינטגרציות', included: false },
      { key: 'reports', name: 'דוחות מתקדמים', included: false },
      { key: 'api', name: 'גישת API', included: false },
      { key: 'support', name: 'תמיכה', included: true, limit: 'email' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    displayName: 'מתחילים',
    description: 'למעצב עצמאי',
    pricing: { monthly: 99, yearly: 990, yearlyDiscount: 17, currency: 'ILS' },
    limits: {
      maxUsers: 1,
      maxActiveProjects: 10,
      maxTotalProjects: 50,
      maxStorageGB: 10,
      maxClientPortals: 5,
      maxIntegrations: 3,
      maxAutomations: 5,
      automationRunsPerMonth: 100,
      apiRequestsPerMonth: 0,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true },
      { key: 'client_portal', name: 'פורטל לקוח', included: true },
      { key: 'automations', name: 'אוטומציות', included: true },
      { key: 'integrations', name: 'אינטגרציות', included: true },
      { key: 'reports', name: 'דוחות מתקדמים', included: false },
      { key: 'api', name: 'גישת API', included: false },
      { key: 'support', name: 'תמיכה', included: true, limit: 'email + chat' },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    displayName: 'מקצועי',
    description: 'למשרד קטן',
    pricing: { monthly: 249, yearly: 2490, yearlyDiscount: 17, currency: 'ILS' },
    limits: {
      maxUsers: 5,
      maxActiveProjects: 50,
      maxTotalProjects: -1,
      maxStorageGB: 50,
      maxClientPortals: -1,
      maxIntegrations: -1,
      maxAutomations: 20,
      automationRunsPerMonth: 1000,
      apiRequestsPerMonth: 10000,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true },
      { key: 'client_portal', name: 'פורטל לקוח', included: true },
      { key: 'automations', name: 'אוטומציות', included: true },
      { key: 'integrations', name: 'אינטגרציות', included: true },
      { key: 'reports', name: 'דוחות מתקדמים', included: true },
      { key: 'api', name: 'גישת API', included: true },
      { key: 'custom_fields', name: 'שדות מותאמים', included: true },
      { key: 'time_tracking', name: 'מעקב שעות', included: true },
      { key: 'support', name: 'תמיכה', included: true, limit: 'priority' },
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'ארגוני',
    description: 'למשרד גדול',
    pricing: { monthly: 0, yearly: 0, currency: 'ILS' },  // Custom pricing
    limits: {
      maxUsers: -1,
      maxActiveProjects: -1,
      maxTotalProjects: -1,
      maxStorageGB: -1,
      maxClientPortals: -1,
      maxIntegrations: -1,
      maxAutomations: -1,
      automationRunsPerMonth: -1,
      apiRequestsPerMonth: -1,
    },
    features: [
      { key: 'all_professional', name: 'כל התכונות המקצועיות', included: true },
      { key: 'sso', name: 'SSO', included: true },
      { key: 'audit_log', name: 'יומן ביקורת מלא', included: true },
      { key: 'custom_contract', name: 'חוזה מותאם', included: true },
      { key: 'sla', name: 'SLA', included: true },
      { key: 'dedicated_support', name: 'תמיכה ייעודית', included: true },
      { key: 'onboarding', name: 'הדרכה והטמעה', included: true },
    ],
  },
];
```

---

## Subscription - מנוי

### Interface

```typescript
interface Subscription {
  id: string;
  tenantId: string;

  // תוכנית
  planId: string;

  // סטטוס
  status: SubscriptionStatus;

  // תקופה
  billingPeriod: BillingPeriod;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;

  // Trial
  trialEndsAt?: Date;

  // ביטול
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;

  // Payment provider
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;

  // תוספות
  addons: SubscriptionAddon[];

  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionAddon {
  type: 'users' | 'storage' | 'automations';
  quantity: number;
  pricePerUnit: number;
}
```

### Database Schema

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),

  -- תוכנית
  plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),

  -- סטטוס
  status VARCHAR(20) NOT NULL DEFAULT 'trialing',

  -- תקופה
  billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,

  -- Trial
  trial_ends_at TIMESTAMPTZ,

  -- ביטול
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  -- Payment provider
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),

  -- תוספות
  addons JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 'paused'
  )),
  CONSTRAINT valid_period CHECK (billing_period IN ('monthly', 'yearly'))
);

-- Indexes
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Invoice - חשבונית

### Interface

```typescript
interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;

  // מספר
  invoiceNumber: string;

  // תקופה
  periodStart: Date;
  periodEnd: Date;

  // פריטים
  lineItems: InvoiceLineItem[];

  // סכומים
  subtotal: number;
  discount?: number;
  discountReason?: string;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;

  // סטטוס
  status: InvoiceStatus;

  // תשלום
  paidAt?: Date;
  paymentMethod?: string;

  // קבצים
  pdfUrl?: string;

  // Stripe
  stripeInvoiceId?: string;

  createdAt: Date;
  dueDate: Date;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'subscription' | 'addon' | 'one_time';
}
```

### Database Schema

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),

  -- מספר
  invoice_number VARCHAR(50) NOT NULL UNIQUE,

  -- תקופה
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- פריטים
  line_items JSONB NOT NULL DEFAULT '[]',

  -- סכומים
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2),
  discount_reason TEXT,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ILS',

  -- סטטוס
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  -- תשלום
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50),

  -- קבצים
  pdf_url TEXT,

  -- Stripe
  stripe_invoice_id VARCHAR(100),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,

  CONSTRAINT valid_status CHECK (status IN (
    'draft', 'open', 'paid', 'void', 'uncollectible'
  ))
);

-- Indexes
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## UsageTracker - מעקב שימוש

### Interface

```typescript
interface UsageTracker {
  tenantId: string;
  period: string;                   // "2026-01"

  // ספירות
  counts: UsageCounts;

  // אחסון
  storage: StorageUsageData;

  // התראות שנשלחו
  alertsSent: UsageAlert[];

  updatedAt: Date;
}

interface UsageCounts {
  activeProjects: number;
  totalProjects: number;
  users: number;
  clientPortals: number;
  automationRuns: number;
  apiRequests: number;
}

interface StorageUsageData {
  usedBytes: number;
  limitBytes: number;
}

interface UsageAlert {
  type: string;
  sentAt: Date;
  percent: number;
}
```

### Database Schema

```sql
CREATE TABLE usage_trackers (
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period VARCHAR(7) NOT NULL,       -- "2026-01"

  -- ספירות
  counts JSONB NOT NULL DEFAULT '{
    "activeProjects": 0,
    "totalProjects": 0,
    "users": 0,
    "clientPortals": 0,
    "automationRuns": 0,
    "apiRequests": 0
  }',

  -- אחסון
  storage JSONB NOT NULL DEFAULT '{
    "usedBytes": 0,
    "limitBytes": 0
  }',

  -- התראות שנשלחו
  alerts_sent JSONB NOT NULL DEFAULT '[]',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (tenant_id, period)
);

-- Indexes
CREATE INDEX idx_usage_trackers_tenant ON usage_trackers(tenant_id);
CREATE INDEX idx_usage_trackers_period ON usage_trackers(period);

-- RLS
ALTER TABLE usage_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON usage_trackers
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Limit Enforcement

```typescript
interface LimitEnforcement {
  // בדיקה לפני פעולה
  checkLimit(tenantId: string, resource: string): {
    allowed: boolean;
    current: number;
    limit: number;
    message?: string;
  };

  // מה קורה כשמגיעים למגבלה
  onLimitReached: {
    projects: {
      action: 'block',
      message: 'הגעת למקסימום פרויקטים. שדרג את התוכנית להוספת פרויקטים.',
      showUpgrade: true,
    },
    storage: {
      action: 'block',
      message: 'נגמר מקום האחסון. שדרג או מחק קבצים.',
      showUpgrade: true,
    },
    users: {
      action: 'block',
      message: 'הגעת למקסימום משתמשים בתוכנית.',
      showUpgrade: true,
    },
    automations: {
      action: 'pause',
      message: 'האוטומציות הושהו. שדרג להמשך פעולה.',
      showUpgrade: true,
    },
    apiRequests: {
      action: 'rate_limit',
      message: 'חרגת ממכסת ה-API החודשית.',
      retryAfter: 'next_month',
    },
  };

  // התראות לפני הגעה למגבלה
  warnings: [
    { at: 80, message: 'הגעת ל-80% מהמכסה' },
    { at: 90, message: 'הגעת ל-90% מהמכסה' },
    { at: 100, message: 'הגעת למגבלה' },
  ];
}
```

---

## Trial Management

```typescript
interface TrialConfig {
  trialDays: 14;
  trialPlan: 'professional';        // גישה לכל הפיצ'רים
  requireCreditCard: false;

  reminders: [
    { daysBeforeEnd: 7, channel: 'email' },
    { daysBeforeEnd: 3, channel: 'email' },
    { daysBeforeEnd: 1, channel: 'email' },
    { daysBeforeEnd: 0, channel: 'in_app' },
  ];

  onTrialEnd: {
    withCard: 'start_subscription',
    withoutCard: 'downgrade_to_free',
  };
}
```

---

## Billing API Endpoints

```typescript
// Subscription
GET /api/billing/subscription
POST /api/billing/subscription/upgrade
// Body: { planId: string, billingPeriod: 'monthly' | 'yearly' }

POST /api/billing/subscription/downgrade
// Body: { planId: string }

POST /api/billing/subscription/cancel
// Body: { reason?: string, feedback?: string }

POST /api/billing/subscription/resume

// Plans
GET /api/billing/plans

// Usage
GET /api/billing/usage
GET /api/billing/usage/history?months=12

// Invoices
GET /api/billing/invoices
GET /api/billing/invoices/:id
GET /api/billing/invoices/:id/pdf

// Payment Methods
GET /api/billing/payment-methods
POST /api/billing/payment-methods
// Body: { stripePaymentMethodId: string }

DELETE /api/billing/payment-methods/:id
POST /api/billing/payment-methods/:id/default

// Checkout (Stripe)
POST /api/billing/checkout/session
// Returns: { sessionUrl: string }

POST /api/billing/portal/session
// Returns: { portalUrl: string }

// Webhooks (from Stripe)
POST /api/billing/webhooks/stripe
```

---

## Billing UI

### Pricing Page

```typescript
interface PricingPageUI {
  display: {
    showToggle: true;               // monthly / yearly toggle
    highlightPopular: true;
    showSavingsOnYearly: true;
  };

  planCard: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
  };

  showFAQ: true;
  showComparisonTable: true;
}
```

### Billing Settings Page

```typescript
interface BillingSettingsUI {
  sections: [
    {
      id: 'current_plan',
      title: 'התוכנית הנוכחית',
      content: {
        planName: string;
        price: string;
        renewalDate: Date;
        actions: ['upgrade', 'downgrade', 'cancel'];
      };
    },
    {
      id: 'usage',
      title: 'שימוש',
      content: {
        usageMetrics: {
          name: string;
          used: number;
          limit: number;
          percent: number;
        }[];
      };
    },
    {
      id: 'payment_method',
      title: 'אמצעי תשלום',
      content: {
        currentMethod: {
          type: 'card';
          last4: string;
          expiry: string;
          brand: string;
        };
        actions: ['change', 'add'];
      };
    },
    {
      id: 'invoices',
      title: 'חשבוניות',
      content: {
        invoiceList: Invoice[];
        actions: ['download', 'view'];
      };
    },
  ];
}
```

---

## WebSocket Events

```typescript
// אירועי קבצים
const FILE_EVENTS = {
  'file.uploaded': 'קובץ הועלה',
  'file.deleted': 'קובץ נמחק',
  'file.version_added': 'גרסה חדשה נוספה',
  'file.shared': 'קובץ שותף',
  'file.unshared': 'שיתוף בוטל',
  'folder.created': 'תיקייה נוצרה',
  'folder.deleted': 'תיקייה נמחקה',
};

// אירועי חיוב
const BILLING_EVENTS = {
  'subscription.created': 'מנוי נוצר',
  'subscription.updated': 'מנוי עודכן',
  'subscription.canceled': 'מנוי בוטל',
  'subscription.trial_ending': 'תקופת ניסיון מסתיימת בקרוב',
  'invoice.created': 'חשבונית נוצרה',
  'invoice.paid': 'חשבונית שולמה',
  'invoice.payment_failed': 'תשלום נכשל',
  'usage.warning': 'התראת שימוש',
  'usage.limit_reached': 'הגעה למגבלה',
};
```

---

## קשרי ישויות

### Files

| ישות | קשר | הסבר |
|------|-----|------|
| Tenant | N:1 | קבצים שייכים ל-tenant |
| Folder | N:1 | קובץ נמצא בתיקייה |
| Project | N:1 | קובץ משויך לפרויקט |
| User | N:1 | מי העלה את הקובץ |
| FileVersion | 1:N | היסטוריית גרסאות |
| FileShare | 1:N | קישורי שיתוף |
| Comment | 1:N | תגובות על קובץ |

### Billing

| ישות | קשר | הסבר |
|------|-----|------|
| Tenant | 1:1 | לכל tenant מנוי אחד |
| Plan | N:1 | מנוי מבוסס על תוכנית |
| Invoice | 1:N | חשבוניות למנוי |
| UsageTracker | 1:N | מעקב שימוש לפי תקופה |

---

## הנחיות למימוש

### File Management

1. **Storage Provider:**
   - Use S3-compatible storage (AWS S3, Cloudflare R2, MinIO)
   - Pre-signed URLs for uploads/downloads
   - CDN for thumbnails and previews

2. **Upload:**
   - Direct upload to storage (not through server)
   - Chunked upload for files > 10MB
   - Progress indication
   - Resume interrupted uploads

3. **Processing:**
   - Background job for thumbnails/optimization
   - Use Sharp for image processing
   - Virus scanning with ClamAV or external service

4. **Security:**
   - Validate file types (not just extension)
   - Scan for malware
   - Secure signed URLs (expiring)
   - Access control per file

5. **Performance:**
   - Lazy loading for file lists
   - Thumbnail sprites for galleries
   - CDN caching
   - Compression for downloads

### Billing

1. **Payment Provider:**
   - Use Stripe for international
   - Consider local Israeli providers (PayPlus, Cardcom) for local cards
   - Implement webhook handling properly

2. **Proration:**
   - Handle mid-cycle upgrades/downgrades
   - Credit unused time on downgrade
   - Charge difference on upgrade

3. **Grace Period:**
   - 3 days grace period for failed payments
   - Retry payment automatically
   - Notify user of payment issues

4. **Security:**
   - Never store full card numbers
   - Use Stripe Elements for card input
   - PCI compliance through Stripe

5. **Invoicing:**
   - Auto-generate invoices
   - Support Israeli invoice requirements
   - Send invoice by email

6. **Analytics:**
   - Track MRR, ARR
   - Track churn rate
   - Track upgrade/downgrade patterns

---

## קשרים לקבצים אחרים

| קובץ | קשר |
|------|-----|
| `00-shared-definitions.md` | FileCategory, StorageProvider, FolderType, FileShareType, SubscriptionStatus, BillingPeriod, InvoiceStatus |
| `02-auth-tenant-user.md` | Tenant (מנוי), User (מעלה קבצים) |
| `03-project-client.md` | Project (קבצים בפרויקט) |
| `04-tasks-docs-meetings.md` | Document (קישור לקובץ) |
| `07-collaboration.md` | Comment (על קבצים), ActivityLog |
| `09-automations.md` | מגבלות automationRuns |
| `10-integrations.md` | Google Drive sync, מגבלות integrations |
