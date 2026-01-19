# Collaboration - שיתוף פעולה ותקשורת צוות

## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

מודול זה מכיל את כל הישויות הקשורות לשיתוף פעולה בין חברי צוות, מעקב פעילות ותקשורת פנימית:

| ישות | תיאור | טבלה |
|------|-------|------|
| Comment | תגובות על ישויות | `comments` |
| DailyLog | דוחות יומיים/ביקורי אתר | `daily_logs` |
| InternalNote | הערות פנימיות | `internal_notes` |
| Notification | התראות למשתמשים | `notifications` |
| ActivityLog | יומן פעילות מערכת | `activity_logs` |
| CommunicationLog | יומן תקשורת עם גורמים חיצוניים | `communication_logs` |
| UserPresence | נוכחות משתמש (Redis בלבד) | - |
| UserWorkload | תצוגת עומס עבודה (computed) | - |

---

# ב. Comment - תגובות

תגובות על כל ישות במערכת - משימות, מוצרים, מסמכים, חדרים, הזמנות רכש.

## Interface

```typescript
interface Comment {
  id: string;
  tenantId: string;

  // על מה התגובה (פולימורפי)
  entityType: CommentEntityType;
  entityId: string;

  // תוכן
  content: string;                   // תומך Markdown בסיסי

  // Mentions - מערך של user IDs שתויגו עם @
  mentions: string[];

  // קבצים מצורפים
  attachments: CommentAttachment[];

  // Thread - תגובה על תגובה
  parentId?: string;

  // פנימי או גלוי ללקוח (ב-Client Portal)
  isInternal: boolean;

  // מטא
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;                // Soft delete
}

// סוגי ישויות שניתן להגיב עליהן
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

interface CommentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

## Database Schema

```sql
-- טבלת תגובות
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- פולימורפי
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- תוכן
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',

  -- Thread
  parent_id UUID REFERENCES comments(id),

  -- הרשאות
  is_internal BOOLEAN DEFAULT true,

  -- מטא
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Indexes
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'task', 'room_product', 'document', 'room', 'purchase_order',
    'change_order', 'snag_item', 'design_option', 'moodboard', 'project'
  ))
);

-- Indexes
CREATE INDEX idx_comments_tenant ON comments(tenant_id);
CREATE INDEX idx_comments_entity ON comments(tenant_id, entity_type, entity_id);
CREATE INDEX idx_comments_user ON comments(tenant_id, user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_mentions ON comments USING gin(mentions);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON comments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface CommentComputed {
  // פרטי הכותב
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  // תגובות ילדים
  replies: Comment[];
  replyCount: number;

  // זמן יחסי
  timeAgo: string;                   // "לפני 5 דקות"

  // האם ניתן לערוך (רק כותב, תוך 15 דקות)
  canEdit: boolean;
  canDelete: boolean;

  // פרטי הישות המקושרת
  linkedEntity: {
    type: string;
    name: string;
    url: string;
  };
}
```

## API Endpoints

```typescript
// CRUD תגובות
GET    /api/comments?entityType=:type&entityId=:id
POST   /api/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id

// Thread
GET    /api/comments/:id/replies

// Request/Response
interface CreateCommentRequest {
  entityType: CommentEntityType;
  entityId: string;
  content: string;
  mentions?: string[];
  attachments?: CommentAttachment[];
  parentId?: string;
  isInternal?: boolean;
}
```

## WebSocket Events

```typescript
// אירועים בזמן אמת
const COMMENT_EVENTS = {
  'comment.created': {
    channels: ['entity:{entityType}:{entityId}', 'project:{projectId}'],
    payload: Comment,
  },
  'comment.updated': {
    channels: ['entity:{entityType}:{entityId}'],
    payload: { id: string, content: string },
  },
  'comment.deleted': {
    channels: ['entity:{entityType}:{entityId}'],
    payload: { id: string },
  },
  'comment.typing': {
    channels: ['entity:{entityType}:{entityId}'],
    payload: { userId: string, userName: string },
  },
};
```

---

# ג. DailyLog - דוחות יומיים

תיעוד ביקורי אתר ועבודה יומית - קריטי בשלב הביצוע.

## Interface

```typescript
interface DailyLog {
  id: string;
  tenantId: string;
  projectId: string;

  // תאריך הדוח
  date: Date;

  // מי כתב
  userId: string;

  // סוג
  logType: DailyLogType;

  // תוכן
  summary: string;
  workCompleted?: string;
  issuesFound?: string;
  nextSteps?: string;

  // מזג אוויר (רלוונטי לאתר)
  weather?: DailyLogWeather;

  // מי היה באתר
  presentOnSite?: string[];

  // תמונות - קריטי!
  photos: DailyLogPhoto[];

  // קישור למשימות שהושלמו
  completedTaskIds: string[];

  // קישור לליקויים שנמצאו
  snagItemIds: string[];

  // שעות
  arrivalTime?: string;              // "09:00"
  departureTime?: string;            // "17:30"

  // שיתוף
  isSharedWithClient: boolean;

  createdAt: Date;
  updatedAt: Date;
}

type DailyLogType =
  | 'site_visit'                     // ביקור אתר
  | 'installation'                   // התקנה
  | 'inspection'                     // בדיקה
  | 'delivery'                       // מסירה
  | 'general';                       // כללי

interface DailyLogWeather {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold';
  temperature?: number;
  notes?: string;
}

interface DailyLogPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  roomId?: string;                   // קישור לחדר ספציפי
  takenAt: Date;
  order: number;
}
```

## Database Schema

```sql
-- טבלת דוחות יומיים
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  -- תאריך ומשתמש
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),

  -- סוג
  log_type VARCHAR(20) NOT NULL DEFAULT 'site_visit',

  -- תוכן
  summary TEXT NOT NULL,
  work_completed TEXT,
  issues_found TEXT,
  next_steps TEXT,

  -- מזג אוויר
  weather JSONB,

  -- נוכחות באתר
  present_on_site TEXT[],

  -- תמונות
  photos JSONB DEFAULT '[]',

  -- קישורים
  completed_task_ids UUID[] DEFAULT '{}',
  snag_item_ids UUID[] DEFAULT '{}',

  -- שעות
  arrival_time TIME,
  departure_time TIME,

  -- שיתוף
  is_shared_with_client BOOLEAN DEFAULT false,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_log_type CHECK (log_type IN (
    'site_visit', 'installation', 'inspection', 'delivery', 'general'
  )),
  CONSTRAINT unique_daily_log UNIQUE (tenant_id, project_id, date, user_id)
);

-- Indexes
CREATE INDEX idx_daily_logs_tenant ON daily_logs(tenant_id);
CREATE INDEX idx_daily_logs_project ON daily_logs(tenant_id, project_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(tenant_id, date DESC);
CREATE INDEX idx_daily_logs_user ON daily_logs(tenant_id, user_id);

-- RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON daily_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface DailyLogComputed {
  // פרטי המשתמש
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  // פרטי הפרויקט
  project: {
    id: string;
    name: string;
    code?: string;
  };

  // משך הביקור
  duration?: string;                 // "8 שעות 30 דקות"

  // סטטיסטיקות
  photoCount: number;
  completedTaskCount: number;
  snagItemCount: number;

  // תאריך מעוצב
  formattedDate: string;             // "יום ראשון, 12 בינואר 2026"

  // משימות שהושלמו (מורחב)
  completedTasks: {
    id: string;
    title: string;
  }[];

  // ליקויים שנמצאו (מורחב)
  snagItems: {
    id: string;
    title: string;
    severity: string;
  }[];
}
```

## API Endpoints

```typescript
// CRUD דוחות יומיים
GET    /api/projects/:projectId/daily-logs
GET    /api/projects/:projectId/daily-logs/:id
POST   /api/projects/:projectId/daily-logs
PATCH  /api/projects/:projectId/daily-logs/:id
DELETE /api/projects/:projectId/daily-logs/:id

// תמונות
POST   /api/daily-logs/:id/photos
DELETE /api/daily-logs/:id/photos/:photoId

// שיתוף
PATCH  /api/daily-logs/:id/share
POST   /api/daily-logs/:id/send-to-client

// Request
interface CreateDailyLogRequest {
  date: string;
  logType: DailyLogType;
  summary: string;
  workCompleted?: string;
  issuesFound?: string;
  nextSteps?: string;
  weather?: DailyLogWeather;
  presentOnSite?: string[];
  arrivalTime?: string;
  departureTime?: string;
}
```

## WebSocket Events

```typescript
const DAILY_LOG_EVENTS = {
  'daily_log.created': {
    channels: ['project:{projectId}'],
    payload: DailyLog,
  },
  'daily_log.updated': {
    channels: ['project:{projectId}'],
    payload: DailyLog,
  },
  'daily_log.photo_added': {
    channels: ['project:{projectId}'],
    payload: { dailyLogId: string, photo: DailyLogPhoto },
  },
};
```

---

# ד. InternalNote - הערות פנימיות

הערות פנימיות שרק הצוות רואה - על לקוחות, ספקים, פרויקטים.

## Interface

```typescript
interface InternalNote {
  id: string;
  tenantId: string;

  // על מה ההערה (פולימורפי)
  entityType: InternalNoteEntityType;
  entityId: string;

  // תוכן
  content: string;

  // חשיבות
  priority: InternalNotePriority;

  // האם להציג בולט (pinned)
  isPinned: boolean;

  // מטא
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

type InternalNoteEntityType =
  | 'client'
  | 'supplier'
  | 'professional'
  | 'project';

type InternalNotePriority =
  | 'normal'
  | 'important'
  | 'warning';
```

## Database Schema

```sql
-- טבלת הערות פנימיות
CREATE TABLE internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- פולימורפי
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,

  -- תוכן
  content TEXT NOT NULL,

  -- עדיפות
  priority VARCHAR(10) DEFAULT 'normal',
  is_pinned BOOLEAN DEFAULT false,

  -- מטא
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'client', 'supplier', 'professional', 'project'
  )),
  CONSTRAINT valid_priority CHECK (priority IN ('normal', 'important', 'warning'))
);

-- Indexes
CREATE INDEX idx_internal_notes_tenant ON internal_notes(tenant_id);
CREATE INDEX idx_internal_notes_entity ON internal_notes(tenant_id, entity_type, entity_id);
CREATE INDEX idx_internal_notes_pinned ON internal_notes(tenant_id, entity_type, entity_id, is_pinned DESC);

-- RLS
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON internal_notes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface InternalNoteComputed {
  // פרטי הכותב
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  // זמן יחסי
  timeAgo: string;

  // צבע לפי priority
  priorityColor: string;
  priorityIcon: string;
}
```

## API Endpoints

```typescript
// CRUD הערות פנימיות
GET    /api/internal-notes?entityType=:type&entityId=:id
POST   /api/internal-notes
PATCH  /api/internal-notes/:id
DELETE /api/internal-notes/:id

// Pin/Unpin
PATCH  /api/internal-notes/:id/pin
PATCH  /api/internal-notes/:id/unpin

// Request
interface CreateInternalNoteRequest {
  entityType: InternalNoteEntityType;
  entityId: string;
  content: string;
  priority?: InternalNotePriority;
  isPinned?: boolean;
}
```

---

# ה. Notification - התראות

מערכת התראות מרכזית - In-App, Email, Push.

## Interface

```typescript
interface Notification {
  id: string;
  tenantId: string;
  userId: string;                    // למי ההתראה

  // סוג
  type: NotificationType;

  // תוכן
  title: string;
  body: string;

  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  url?: string;

  // מי יצר (אם רלוונטי)
  triggeredByUserId?: string;

  // סטטוס
  isRead: boolean;
  readAt?: Date;

  // ערוצים שנשלחו
  channels: NotificationChannels;

  createdAt: Date;
}

type NotificationType =
  | 'mention'                        // תויגת בתגובה
  | 'assignment'                     // משימה הוקצתה לך
  | 'comment'                        // תגובה חדשה
  | 'approval_needed'                // נדרש אישורך
  | 'approval_received'              // אישור התקבל
  | 'task_due'                       // משימה מתקרבת
  | 'task_overdue'                   // משימה באיחור
  | 'payment_received'               // תשלום התקבל
  | 'delivery_update'                // עדכון משלוח
  | 'status_change'                  // שינוי סטטוס
  | 'daily_log'                      // דוח יומי חדש
  | 'system';                        // הודעת מערכת

interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  push: boolean;
}
```

## Database Schema

```sql
-- טבלת התראות
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- סוג
  type VARCHAR(30) NOT NULL,

  -- תוכן
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- קישור
  entity_type VARCHAR(50),
  entity_id UUID,
  project_id UUID REFERENCES projects(id),
  url VARCHAR(500),

  -- מי יצר
  triggered_by_user_id UUID REFERENCES users(id),

  -- סטטוס
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- ערוצים
  channels JSONB DEFAULT '{"inApp": true, "email": false, "push": false}',

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_notification_type CHECK (type IN (
    'mention', 'assignment', 'comment', 'approval_needed', 'approval_received',
    'task_due', 'task_overdue', 'payment_received', 'delivery_update',
    'status_change', 'daily_log', 'system'
  ))
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(tenant_id, user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notifications_project ON notifications(tenant_id, project_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY user_sees_own ON notifications
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

## שדות מחושבים

```typescript
interface NotificationComputed {
  // זמן יחסי
  timeAgo: string;

  // מי יצר
  triggeredBy?: {
    id: string;
    name: string;
    avatar?: string;
  };

  // אייקון לפי סוג
  icon: string;
  iconColor: string;

  // פרטי הפרויקט
  project?: {
    id: string;
    name: string;
  };
}
```

## API Endpoints

```typescript
// רשימת התראות
GET    /api/notifications
GET    /api/notifications/unread-count

// עדכון
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

// מחיקה
DELETE /api/notifications/:id
DELETE /api/notifications/clear-all

// הגדרות
GET    /api/notifications/settings
PATCH  /api/notifications/settings

// Response
interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  cursor?: string;
}
```

## WebSocket Events

```typescript
const NOTIFICATION_EVENTS = {
  'notification.new': {
    channels: ['user:{userId}'],
    payload: Notification,
  },
  'notification.read': {
    channels: ['user:{userId}'],
    payload: { id: string },
  },
  'notification.unread_count': {
    channels: ['user:{userId}'],
    payload: { count: number },
  },
};
```

---

# ו. ActivityLog - יומן פעילות

מעקב אוטומטי אחר כל הפעולות במערכת.

## Interface

```typescript
interface ActivityLog {
  id: string;
  tenantId: string;

  // מי ביצע
  userId: string;

  // מה נעשה
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityName?: string;

  // פרטי השינוי
  changes?: Record<string, { old: any; new: any }>;
  description?: string;

  // הקשר
  projectId?: string;
  clientId?: string;

  // מטא
  timestamp: Date;
  ipAddress?: string;
}

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

## Database Schema

```sql
-- טבלת יומן פעילות
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- מי
  user_id UUID NOT NULL REFERENCES users(id),

  -- מה
  action VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),

  -- פרטים
  changes JSONB,
  description TEXT,

  -- הקשר
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),

  -- מטא
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,

  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'created', 'updated', 'deleted', 'approved', 'rejected',
    'sent', 'viewed', 'commented', 'status_changed', 'assigned'
  ))
);

-- Indexes
CREATE INDEX idx_activity_logs_tenant ON activity_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_activity_logs_project ON activity_logs(tenant_id, project_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(tenant_id, user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(tenant_id, timestamp DESC);

-- Partition by month (לביצועים)
-- CREATE TABLE activity_logs_2026_01 PARTITION OF activity_logs
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON activity_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface ActivityLogComputed {
  // פרטי המשתמש
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  // תיאור מעוצב
  formattedDescription: string;      // "משה כהן יצר משימה 'הזמנת ריהוט'"

  // זמן יחסי
  timeAgo: string;

  // אייקון לפי action
  actionIcon: string;
  actionColor: string;

  // קישור לישות
  entityUrl?: string;

  // פרטי הפרויקט
  project?: {
    id: string;
    name: string;
  };
}
```

## API Endpoints

```typescript
// קריאת לוג
GET    /api/activity-logs
GET    /api/activity-logs?entityType=:type&entityId=:id
GET    /api/projects/:projectId/activity
GET    /api/clients/:clientId/activity

// Response
interface ActivityLogsResponse {
  logs: ActivityLog[];
  hasMore: boolean;
  cursor?: string;
}

// Query params
interface ActivityLogsQuery {
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;
  userId?: string;
  action?: ActivityAction;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
}
```

## Trigger אוטומטי

```sql
-- פונקציה ליצירת log אוטומטי
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR(20);
  v_changes JSONB;
  v_entity_name VARCHAR(255);
BEGIN
  -- קביעת action
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_changes := jsonb_build_object();
    -- השוואת שדות והוספת שינויים
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
  END IF;

  -- קבלת שם הישות
  IF TG_TABLE_NAME = 'tasks' THEN
    v_entity_name := COALESCE(NEW.title, OLD.title);
  ELSIF TG_TABLE_NAME = 'projects' THEN
    v_entity_name := COALESCE(NEW.name, OLD.name);
  -- ... more tables
  END IF;

  -- יצירת log
  INSERT INTO activity_logs (
    tenant_id, user_id, action, entity_type, entity_id,
    entity_name, changes, project_id, timestamp
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    current_setting('app.current_user_id')::uuid,
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_entity_name,
    v_changes,
    COALESCE(NEW.project_id, OLD.project_id),
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- הפעלת trigger על טבלאות חשובות
CREATE TRIGGER log_tasks_activity
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_projects_activity
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ... more tables
```

---

# ז. CommunicationLog - יומן תקשורת

יומן תקשורת עם לקוחות, ספקים ובעלי מקצוע.

## Interface

```typescript
interface CommunicationLog {
  id: string;
  tenantId: string;

  // עם מי התקשורת (פולימורפי)
  entityType: CommunicationEntityType;
  entityId: string;

  // הקשר לפרויקט (אופציונלי)
  projectId?: string;

  // פרטי התקשורת
  type: CommunicationType;
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content: string;

  // קבצים מצורפים
  attachments: string[];

  // זמן התקשורת
  date: Date;

  // מי תיעד
  userId: string;

  createdAt: Date;
}

type CommunicationEntityType =
  | 'client'
  | 'supplier'
  | 'professional';

type CommunicationType =
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'meeting'
  | 'note'
  | 'sms';
```

## Database Schema

```sql
-- טבלת יומן תקשורת
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- פולימורפי
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,

  -- הקשר
  project_id UUID REFERENCES projects(id),

  -- פרטים
  type VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  subject VARCHAR(500),
  content TEXT NOT NULL,

  -- קבצים
  attachments TEXT[] DEFAULT '{}',

  -- זמנים
  date TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('client', 'supplier', 'professional')),
  CONSTRAINT valid_type CHECK (type IN ('email', 'phone', 'whatsapp', 'meeting', 'note', 'sms')),
  CONSTRAINT valid_direction CHECK (direction IN ('incoming', 'outgoing'))
);

-- Indexes
CREATE INDEX idx_communication_logs_tenant ON communication_logs(tenant_id);
CREATE INDEX idx_communication_logs_entity ON communication_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_communication_logs_project ON communication_logs(tenant_id, project_id);
CREATE INDEX idx_communication_logs_date ON communication_logs(tenant_id, date DESC);

-- RLS
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON communication_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## שדות מחושבים

```typescript
interface CommunicationLogComputed {
  // פרטי המשתמש
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  // פרטי הגורם החיצוני
  contact: {
    id: string;
    name: string;
    type: string;
  };

  // פרטי הפרויקט
  project?: {
    id: string;
    name: string;
  };

  // זמן יחסי
  timeAgo: string;

  // אייקון לפי type
  typeIcon: string;
  typeColor: string;
}
```

## API Endpoints

```typescript
// CRUD
GET    /api/communication-logs
GET    /api/communication-logs/:id
POST   /api/communication-logs
DELETE /api/communication-logs/:id

// לפי ישות
GET    /api/clients/:id/communication
GET    /api/suppliers/:id/communication
GET    /api/professionals/:id/communication
GET    /api/projects/:id/communication

// Request
interface CreateCommunicationLogRequest {
  entityType: CommunicationEntityType;
  entityId: string;
  projectId?: string;
  type: CommunicationType;
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content: string;
  attachments?: string[];
  date: string;
}
```

---

# ח. UserPresence - נוכחות משתמש (Redis בלבד)

מעקב בזמן אמת מי מחובר ועובד על מה - נשמר רק ב-Redis, לא ב-DB.

## Interface

```typescript
interface UserPresence {
  userId: string;
  tenantId: string;

  // סטטוס
  status: 'online' | 'away' | 'offline';

  // איפה המשתמש נמצא עכשיו
  currentView?: {
    entityType: 'project' | 'client' | 'task' | 'document' | 'room';
    entityId: string;
    entityName: string;
  };

  lastActiveAt: Date;
}
```

## Redis Schema

```typescript
// Keys structure
const PRESENCE_KEYS = {
  // נוכחות משתמש
  user: 'presence:tenant:{tenantId}:user:{userId}',

  // משתמשים בישות
  entity: 'presence:tenant:{tenantId}:entity:{entityType}:{entityId}',

  // משתמשים online ב-tenant
  online: 'presence:tenant:{tenantId}:online',
};

// TTL
const PRESENCE_TTL = 5 * 60;           // 5 דקות

// Heartbeat interval
const HEARTBEAT_INTERVAL = 30 * 1000;  // 30 שניות
```

## API Endpoints

```typescript
// עדכון נוכחות (heartbeat)
POST   /api/presence/heartbeat
// Body: { currentView?: { entityType, entityId, entityName } }

// קבלת נוכחות
GET    /api/presence/entity/:entityType/:entityId
GET    /api/presence/online

// Response
interface EntityPresenceResponse {
  users: {
    userId: string;
    userName: string;
    avatar?: string;
    status: string;
  }[];
}
```

## WebSocket Events

```typescript
const PRESENCE_EVENTS = {
  'presence.user_online': {
    channels: ['tenant:{tenantId}'],
    payload: { userId: string, userName: string },
  },
  'presence.user_offline': {
    channels: ['tenant:{tenantId}'],
    payload: { userId: string },
  },
  'presence.user_viewing': {
    channels: ['entity:{entityType}:{entityId}'],
    payload: { userId: string, userName: string, avatar?: string },
  },
  'presence.user_left': {
    channels: ['entity:{entityType}:{entityId}'],
    payload: { userId: string },
  },
};
```

---

# ט. UserWorkload - תצוגת עומס עבודה (Computed)

תצוגה מחושבת בזמן אמת - לא ישות בפני עצמה.

## Interface

```typescript
interface UserWorkload {
  userId: string;
  userName: string;
  avatar?: string;

  // שעות
  totalCapacityHours: number;        // כמה שעות זמין בשבוע (ברירת מחדל 40)
  allocatedHours: number;            // כמה מוקצה מפרויקטים
  availableHours: number;            // כמה פנוי

  // Utilization
  utilizationPercent: number;        // allocatedHours / totalCapacityHours * 100

  // פירוט לפי פרויקט
  projectAllocations: {
    projectId: string;
    projectName: string;
    allocatedHours: number;
    taskCount: number;
  }[];

  // משימות קרובות
  upcomingTasks: {
    taskId: string;
    taskTitle: string;
    projectName: string;
    dueDate: Date;
  }[];

  // סטטוס
  status: 'underloaded' | 'balanced' | 'overloaded';  // <50%, 50-90%, >90%
}

interface TeamWorkloadView {
  tenantId: string;
  calculatedAt: Date;
  period: 'week' | 'month';
  startDate: Date;
  endDate: Date;

  members: UserWorkload[];

  // סיכומים
  totalTeamCapacity: number;
  totalAllocated: number;
  averageUtilization: number;
}
```

## API Endpoints

```typescript
// עומס משתמש בודד
GET    /api/workload/user/:userId?period=week

// עומס צוות
GET    /api/workload/team?period=week&startDate=:date

// Response
interface TeamWorkloadResponse {
  view: TeamWorkloadView;
}
```

## Query מחושב

```sql
-- חישוב עומס עבודה
WITH user_tasks AS (
  SELECT
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    u.avatar,
    t.project_id,
    p.name AS project_name,
    COUNT(t.id) AS task_count,
    COALESCE(SUM(t.estimated_hours), 0) AS allocated_hours
  FROM users u
  LEFT JOIN tasks t ON t.assigned_to = u.id
    AND t.status NOT IN ('completed', 'cancelled')
    AND t.due_date BETWEEN :start_date AND :end_date
  LEFT JOIN projects p ON t.project_id = p.id
  WHERE u.tenant_id = :tenant_id
    AND u.is_active = true
  GROUP BY u.id, u.first_name, u.last_name, u.avatar, t.project_id, p.name
)
SELECT
  user_id,
  user_name,
  avatar,
  40 AS total_capacity_hours,  -- ברירת מחדל
  SUM(allocated_hours) AS allocated_hours,
  40 - SUM(allocated_hours) AS available_hours,
  ROUND((SUM(allocated_hours) / 40.0) * 100, 1) AS utilization_percent,
  CASE
    WHEN SUM(allocated_hours) / 40.0 < 0.5 THEN 'underloaded'
    WHEN SUM(allocated_hours) / 40.0 > 0.9 THEN 'overloaded'
    ELSE 'balanced'
  END AS status,
  jsonb_agg(
    jsonb_build_object(
      'projectId', project_id,
      'projectName', project_name,
      'allocatedHours', allocated_hours,
      'taskCount', task_count
    )
  ) FILTER (WHERE project_id IS NOT NULL) AS project_allocations
FROM user_tasks
GROUP BY user_id, user_name, avatar;
```

---

# י. הנחיות UI

## Comments UI

```typescript
interface CommentsUI {
  // תצוגה
  display: {
    showThread: true,                // תגובות מקוננות
    showMentions: true,              // @mentions
    showAttachments: true,
    showTimestamp: true,
    showEditHistory: false,
  };

  // פעולות
  actions: {
    reply: true,
    edit: { enabled: true, timeLimit: 15 * 60 },  // 15 דקות
    delete: { enabled: true, softDelete: true },
    react: false,                    // אין reactions
  };

  // עורך
  editor: {
    markdown: true,
    mentionAutocomplete: true,
    fileUpload: true,
    maxLength: 10000,
  };
}
```

## Notifications UI

```typescript
interface NotificationsUI {
  // Bell icon
  bell: {
    position: 'header',
    showBadge: true,
    badgeMax: 99,
  };

  // Dropdown
  dropdown: {
    maxItems: 10,
    showMarkAllRead: true,
    showViewAll: true,
    groupByDate: true,
  };

  // Full page
  fullPage: {
    filters: ['all', 'unread', 'mentions', 'approvals'],
    pagination: 'infinite_scroll',
  };
}
```

## Activity Feed UI

```typescript
interface ActivityFeedUI {
  // תצוגה
  display: {
    groupByDate: true,
    showUserAvatar: true,
    showEntityLink: true,
    showChanges: true,
  };

  // סינון
  filters: {
    byUser: true,
    byAction: true,
    byEntityType: true,
    dateRange: true,
  };

  // Pagination
  pagination: 'infinite_scroll';
}
```

## Presence Indicators

```typescript
interface PresenceUI {
  // אווטרים
  avatars: {
    showOnlineIndicator: true,       // נקודה ירוקה
    showInEntityHeader: true,        // מי צופה עכשיו
    maxVisible: 5,
    showOverflowCount: true,
  };

  // צבעים
  colors: {
    online: 'green',
    away: 'yellow',
    offline: 'gray',
  };
}
```

---

# יא. אוטומציות מומלצות

## Mention → Notification

```typescript
const MENTION_AUTOMATION = {
  trigger: { type: 'entity_created', entityType: 'comment' },
  conditions: [{ field: 'mentions', operator: 'is_not_empty' }],
  actions: [{
    type: 'for_each',
    items: '{{mentions}}',
    action: {
      type: 'create_notification',
      config: {
        userId: '{{item}}',
        type: 'mention',
        title: 'תויגת בתגובה',
        body: '{{comment.user.name}} תייג אותך בתגובה',
      },
    },
  }],
};
```

## Task Assignment → Notification

```typescript
const ASSIGNMENT_AUTOMATION = {
  trigger: { type: 'field_changed', entityType: 'task', field: 'assignedTo' },
  conditions: [{ field: 'assignedTo', operator: 'is_not_empty' }],
  actions: [{
    type: 'create_notification',
    config: {
      userId: '{{task.assignedTo}}',
      type: 'assignment',
      title: 'משימה חדשה הוקצתה לך',
      body: '{{task.title}}',
      projectId: '{{task.projectId}}',
    },
  }],
};
```

## Daily Log → Activity

```typescript
const DAILY_LOG_AUTOMATION = {
  trigger: { type: 'entity_created', entityType: 'daily_log' },
  actions: [{
    type: 'create_notification',
    config: {
      userRole: 'manager',
      type: 'daily_log',
      title: 'דוח יומי חדש',
      body: '{{user.name}} העלה דוח יומי לפרויקט {{project.name}}',
    },
  }],
};
```

---

# יב. קשרים לקבצים אחרים

| קובץ | ישויות קשורות | סוג הקשר |
|------|---------------|----------|
| `02-auth-tenant-user.md` | User | Comment.userId, Notification.userId |
| `03-project-client.md` | Project, Client, Supplier | CommunicationLog.entityId |
| `04-tasks-docs-meetings.md` | Task, Document | Comment.entityId, ActivityLog.entityId |
| `05-products-ffe.md` | RoomProduct, PurchaseOrder | Comment.entityId |
| `08-client-portal.md` | ClientApproval | Notification triggers |
| `09-automations.md` | AutomationRule | Notification creation |

---

**הפניות:**
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
- ישויות Auth: `02-auth-tenant-user.md`
- ישויות Project: `03-project-client.md`
