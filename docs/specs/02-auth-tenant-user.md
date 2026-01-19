# Auth, Tenant & User
## אימות, משרד ומשתמשים

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces
>
> **Enums בשימוש:** `UserRole`, `MagicLinkTokenType`, `OAuthProvider`, `TwoFactorMethod`, `TeamInvitationStatus`, `BusinessType`

---

# א. Tenant (משרד/ארגון)

## תיאור
ישות המשרד - כל הנתונים במערכת שייכים ל-Tenant ספציפי.

## Interface

```typescript
interface Tenant {
  id: string;

  // פרטים בסיסיים
  name: string;
  slug: string;                     // URL-friendly identifier

  // ברנדינג
  logo?: string;
  primaryColor?: string;

  // פרטי קשר
  email: string;
  phone?: string;
  address?: string;
  website?: string;

  // הגדרות עסקיות
  businessType: BusinessType;       // 'interior_design' | 'architecture' | 'both'
  currency: string;                 // default: 'ILS'
  vatRate: number;                  // default: 17
  fiscalYearStart: number;          // 1-12

  // הגדרות תמחור
  feeSettings: TenantFeeSettings;

  // הגדרות מערכת
  language: string;                 // default: 'he'
  timezone: string;                 // default: 'Asia/Jerusalem'
  dateFormat: string;               // default: 'DD/MM/YYYY'

  // פיצ'רים מופעלים
  features: TenantFeatures;

  // מנוי
  plan: PlanId;                     // 'free' | 'starter' | 'professional' | 'enterprise'
  planExpiresAt?: Date;
  limits: TenantLimits;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface TenantFeeSettings {
  defaultBillingType: BillingType;
  defaultHourlyRate?: number;
  defaultMarkupPercent: number;     // default: 30
  markupType: MarkupType;           // 'cost_plus' | 'discount_off_retail'
  disbursementPercent: number;
  defaultRetainerPercent: number;   // default: 30
}

interface TenantFeatures {
  timeTracking: boolean;
  permitTracking: boolean;
  clientPortal: boolean;
  advancedReporting: boolean;
  multipleLocations: boolean;
  customFields: boolean;
  apiAccess: boolean;
}

interface TenantLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxClientsPortal: number;
}
```

## Database Schema

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,

  -- Branding
  logo TEXT,
  primary_color VARCHAR(7),

  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  website VARCHAR(255),

  -- Business settings
  business_type VARCHAR(20) NOT NULL DEFAULT 'interior_design',
  currency VARCHAR(3) NOT NULL DEFAULT 'ILS',
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 17,
  fiscal_year_start INTEGER NOT NULL DEFAULT 1,

  -- Fee settings (JSONB)
  fee_settings JSONB NOT NULL DEFAULT '{}',

  -- System settings
  language VARCHAR(5) NOT NULL DEFAULT 'he',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jerusalem',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',

  -- Features (JSONB)
  features JSONB NOT NULL DEFAULT '{}',

  -- Plan
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  limits JSONB NOT NULL DEFAULT '{}',

  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
```

---

# ב. User (משתמש)

## תיאור
משתמש במערכת. כל משתמש שייך ל-Tenant אחד או יותר.

## Interface

```typescript
interface User {
  id: string;
  tenantId: string;

  // פרטים אישיים
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  title?: string;                   // תפקיד: "מעצבת ראשית"

  // הרשאות
  role: UserRole;                   // 'owner' | 'manager' | 'member'
  permissions: UserPermissions;

  // העדפות
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;

  // מטא
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface UserPermissions {
  canViewFinancials: boolean;
  canEditFinancials: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  canAccessAllProjects: boolean;
  canManageSettings: boolean;
}

interface NotificationSettings {
  email: {
    taskAssigned: boolean;
    taskDue: boolean;
    paymentReceived: boolean;
    approvalNeeded: boolean;
    weeklyDigest: boolean;
  };
  push: {
    enabled: boolean;
    urgentOnly: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
  };
}
```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Personal info
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  title VARCHAR(100),

  -- Permissions
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '{}',

  -- Preferences
  language VARCHAR(5) NOT NULL DEFAULT 'he',
  theme VARCHAR(10) NOT NULL DEFAULT 'system',
  notifications JSONB NOT NULL DEFAULT '{}',

  -- Meta
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## Roles & Permissions Matrix

| Permission | Owner | Manager | Member |
|------------|-------|---------|--------|
| ניהול משתמשים | ✅ | צפייה בלבד | ❌ |
| הגדרות משרד | ✅ | צפייה בלבד | ❌ |
| פיננסי - הכל | ✅ | פרויקטים בלבד | ❌ |
| כל הפרויקטים | ✅ | ✅ | רק מוקצים |
| מחיקת נתונים | ✅ | ❌ | ❌ |

---

# ג. Authentication Entities

## AuthSession

```typescript
interface AuthSession {
  id: string;
  userId: string;
  tenantId: string;

  // Session tokens
  token: string;
  refreshToken: string;

  // Device info
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName?: string;
  browser?: string;
  os?: string;
  ip: string;

  // Timing
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;

  // Status
  isActive: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}
```

## MagicLinkToken

```typescript
interface MagicLinkToken {
  id: string;
  email: string;
  token: string;

  type: MagicLinkTokenType;  // 'login' | 'signup' | 'invite' | 'password_reset'

  // For invitations
  invitedByUserId?: string;
  invitedToTenantId?: string;
  invitedRole?: UserRole;

  // Timing
  createdAt: Date;
  expiresAt: Date;           // 15 minutes
  usedAt?: Date;

  isUsed: boolean;
}
```

## OAuthConnection

```typescript
interface OAuthConnection {
  id: string;
  userId: string;

  provider: OAuthProvider;   // 'google' | 'microsoft' | 'apple'
  providerUserId: string;
  providerEmail: string;

  accessToken?: string;      // encrypted
  refreshToken?: string;     // encrypted
  tokenExpiresAt?: Date;

  scopes: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

## TeamInvitation

```typescript
interface TeamInvitation {
  id: string;
  tenantId: string;

  email: string;
  role: UserRole;
  customPermissions?: Partial<UserPermissions>;
  projectIds?: string[];     // הקצאה ראשונית לפרויקטים

  invitedByUserId: string;

  status: TeamInvitationStatus;  // 'pending' | 'accepted' | 'expired' | 'cancelled'

  token: string;

  createdAt: Date;
  expiresAt: Date;           // 7 days
  acceptedAt?: Date;

  existingUserId?: string;   // if user exists in another tenant
}
```

## TwoFactorSetup

```typescript
interface TwoFactorSetup {
  id: string;
  userId: string;

  method: TwoFactorMethod;   // 'totp' | 'sms'

  // TOTP
  secret?: string;           // encrypted
  qrCodeUrl?: string;

  // SMS
  phoneNumber?: string;

  isEnabled: boolean;
  enabledAt?: Date;

  // Backup codes
  backupCodes: string[];     // hashed
  usedBackupCodes: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

---

# ד. Settings Entities

## UserSettings

```typescript
interface UserSettings {
  id: string;
  userId: string;

  // Display
  display: {
    language: 'he' | 'en';
    theme: 'light' | 'dark' | 'system';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '24h' | '12h';
    timezone: string;
    startOfWeek: 'sunday' | 'monday';
    currency: string;
  };

  // Notifications
  notifications: {
    inApp: { enabled: boolean; sound: boolean };
    email: {
      enabled: boolean;
      taskAssigned: boolean;
      taskDue: boolean;
      taskOverdue: boolean;
      mentions: boolean;
      comments: boolean;
      approvalNeeded: boolean;
      approvalReceived: boolean;
      paymentReceived: boolean;
      deliveryUpdates: boolean;
      weeklyDigest: boolean;
      digestFrequency: 'daily' | 'weekly' | 'never';
      digestDay?: 'sunday' | 'monday';
      digestTime: string;
    };
    push: {
      enabled: boolean;
      taskAssigned: boolean;
      mentions: boolean;
      urgentOnly: boolean;
    };
  };

  // Shortcuts
  shortcuts: {
    enabled: boolean;
    customShortcuts?: Record<string, string>;
  };

  // Dashboard
  dashboard: {
    defaultView: 'overview' | 'tasks' | 'calendar' | 'projects';
    widgetOrder: string[];
    hiddenWidgets: string[];
  };

  // Privacy
  privacy: {
    showOnlineStatus: boolean;
    showCurrentActivity: boolean;
  };

  updatedAt: Date;
}
```

## OnboardingState

```typescript
interface OnboardingState {
  id: string;
  tenantId: string;
  userId: string;

  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];

  data: OnboardingData;

  startedAt: Date;
  completedAt?: Date;

  showOnLogin: boolean;
}

interface OnboardingData {
  // Step 1: Company Profile
  companyProfile?: {
    name: string;
    logo?: string;
    businessType: BusinessType;
    teamSize: '1' | '2-5' | '6-10' | '11-20' | '20+';
    website?: string;
    phone?: string;
    address?: string;
  };

  // Step 2: Branding
  branding?: {
    primaryColor: string;
    secondaryColor?: string;
    logo?: string;
    emailSignature?: string;
  };

  // Step 3: Pricing
  pricing?: {
    defaultBillingType: BillingType;
    hourlyRate?: number;
    markupPercent?: number;
    currency: string;
    vatRate: number;
  };

  // Step 4: Project Phases
  projectPhases?: {
    useDefault: boolean;
    customPhases?: { name: string; color: string }[];
  };

  // Step 5: Team Invites
  teamInvites?: {
    email: string;
    role: string;
  }[];

  // Step 6: Data Import
  dataImport?: {
    importClients: boolean;
    importProducts: boolean;
    source?: 'csv' | 'excel' | 'other_system';
  };

  // Step 7: Integrations
  integrations?: {
    googleCalendar: boolean;
    googleDrive: boolean;
    quickbooks: boolean;
    whatsapp: boolean;
  };
}
```

---

# ה. Authentication Flows

## Magic Link Login Flow

```
1. User enters email
   POST /api/auth/magic-link
   { email: "user@example.com" }

2. Server creates MagicLinkToken (15 min expiry)
   Sends email with link: /auth/verify?token=xxx

3. User clicks link
   GET /auth/verify?token=xxx

4. Server validates token
   - Check not expired
   - Check not used
   - Mark as used

5. Create AuthSession
   Return: { accessToken, refreshToken, user }

6. Redirect to dashboard
```

## Google OAuth Flow

```
1. User clicks "Continue with Google"
   GET /api/auth/google
   → Redirect to Google OAuth

2. Google redirects back
   GET /api/auth/google/callback?code=xxx

3. Server exchanges code for tokens

4. Find or create user
   - If user exists: link OAuthConnection
   - If new user: create User + Tenant

5. Create AuthSession
   Return: { accessToken, refreshToken, user }

6. Redirect to dashboard
```

## Team Invitation Flow

```
1. Admin sends invitation
   POST /api/team/invite
   { email, role, projectIds }

2. Server creates TeamInvitation (7 day expiry)
   Sends email with link: /invite/accept?token=xxx

3. User clicks link
   GET /invite/accept?token=xxx

4. If user exists in system:
   - Add to tenant
   - Set role and permissions

5. If new user:
   - Show signup form (name only)
   - Create user
   - Add to tenant

6. Create AuthSession
   Redirect to dashboard
```

---

# ו. Security Configuration

```typescript
const SECURITY_CONFIG = {
  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    preventCommonPasswords: true,
    preventReuse: 5,
  },

  // Login attempts
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60,    // 15 minutes
    progressiveDelay: true,
  },

  // Sessions
  sessions: {
    accessTokenTTL: 24 * 60 * 60,      // 24 hours
    refreshTokenTTL: 30 * 24 * 60 * 60, // 30 days
    maxConcurrentSessions: 5,
    invalidateOnPasswordChange: true,
  },

  // 2FA
  twoFactor: {
    available: true,
    required: false,
    methods: ['totp', 'sms'],
    backupCodes: 10,
  },

  // Magic Link
  magicLink: {
    expiresIn: 15 * 60,          // 15 minutes
    singleUse: true,
  },
};
```

---

# ז. API Endpoints

```typescript
// Authentication
POST   /api/auth/magic-link          // Request magic link
GET    /api/auth/verify              // Verify magic link token
POST   /api/auth/refresh             // Refresh access token
POST   /api/auth/logout              // Logout
POST   /api/auth/logout-all          // Logout from all devices

// OAuth
GET    /api/auth/google              // Start Google OAuth
GET    /api/auth/google/callback     // Google OAuth callback

// 2FA
POST   /api/auth/2fa/setup           // Start 2FA setup
POST   /api/auth/2fa/verify          // Verify 2FA code
POST   /api/auth/2fa/disable         // Disable 2FA
POST   /api/auth/2fa/backup-codes    // Generate new backup codes

// User
GET    /api/users/me                 // Get current user
PATCH  /api/users/me                 // Update current user
GET    /api/users/me/settings        // Get settings
PATCH  /api/users/me/settings        // Update settings
GET    /api/users/me/sessions        // Get active sessions
DELETE /api/users/me/sessions/:id    // Revoke session

// Team
GET    /api/team                     // List team members
POST   /api/team/invite              // Send invitation
DELETE /api/team/:userId             // Remove member
PATCH  /api/team/:userId/role        // Change role

// Tenant
GET    /api/tenant                   // Get tenant info
PATCH  /api/tenant                   // Update tenant
```

---

**קשרים לקבצים אחרים:**
- Project שייך ל-Tenant: `03-project-client.md`
- Subscription שייך ל-Tenant: `13-files-billing.md`
- Automations שייכות ל-Tenant: `09-automations.md`
