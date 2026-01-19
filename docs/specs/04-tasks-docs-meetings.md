# Tasks, Documents, Meetings & Rooms
## משימות, מסמכים, פגישות וחדרים

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. Room (חדר/אזור)

## תיאור

חדר הוא יחידת עיצוב בתוך פרויקט. כל פרויקט מורכב מחדרים/אזורים שונים, וכל חדר יכול להכיל מוצרים, משימות ואופציות עיצוב.

## קשרים

```
Project (1) ──────< Room (N)
Room (1) ──────< RoomProduct (N)         # ראה 05-products-ffe.md
Room (1) ──────< DesignOption (N)        # ראה 08-client-portal.md
Room (1) ──────< MoodBoard (N)           # ראה 08-client-portal.md
Room (1) ──────< Task (N)                # קישור אופציונלי
```

## Interface

```typescript
interface Room {
  id: string;
  tenantId: string;
  projectId: string;                    // FK to Project

  // פרטים בסיסיים
  name: string;
  typeId?: string;                      // FK to ConfigurableEntity (room_type)
  area?: number;                        // שטח במ"ר
  budget?: number;                      // תקציב לחדר

  // סטטוס עיצוב
  designStatus: RoomDesignStatus;

  // הערות
  notes?: string;

  // סדר תצוגה
  order: number;

  // מטא
  createdAt: Date;
  updatedAt: Date;
}

// Enum - מוגדר ב-00-shared-definitions.md
type RoomDesignStatus =
  | 'not_started'
  | 'concept'
  | 'detailed'
  | 'approved'
  | 'in_progress'
  | 'completed';
```

## Database Schema

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  type_id UUID REFERENCES configurable_entities(id),
  area DECIMAL(10,2),
  budget DECIMAL(15,2),

  design_status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  notes TEXT,

  "order" INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes
CREATE INDEX idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX idx_rooms_project_id ON rooms(project_id);
CREATE INDEX idx_rooms_project_order ON rooms(project_id, "order");
```

## Computed Fields

```typescript
interface RoomComputed {
  // מוצרים
  totalProducts: number;              // כמות מוצרים בחדר
  approvedProducts: number;           // מוצרים שאושרו
  pendingProducts: number;            // מוצרים ממתינים לאישור

  // פיננסי
  totalProductsCost: number;          // סה"כ עלות מוצרים
  totalProductsClientPrice: number;   // סה"כ מחיר ללקוח
  budgetUsed: number;                 // אחוז ניצול תקציב
  budgetRemaining: number;            // תקציב שנותר

  // משימות
  openTasks: number;                  // משימות פתוחות
  completedTasks: number;             // משימות שהושלמו
}
```

## API Endpoints

```
GET    /api/v1/projects/:projectId/rooms              # List rooms in project
POST   /api/v1/projects/:projectId/rooms              # Create room
GET    /api/v1/rooms/:id                              # Get room details
PATCH  /api/v1/rooms/:id                              # Update room
DELETE /api/v1/rooms/:id                              # Delete room
PATCH  /api/v1/projects/:projectId/rooms/reorder      # Reorder rooms
```

---

# ב. Task (משימה)

## תיאור

משימה היא פעולה שצריך לבצע. יכולה להיות משויכת לפרויקט ספציפי או להיות משימה כללית (ללא פרויקט). ניתן לקשר משימות לישויות אחרות כמו חדרים, מוצרים, תשלומים או מסמכים.

## קשרים

```
Tenant (1) ──────< Task (N)
Project (1) ──────< Task (N)              # אופציונלי
User (1) ──────< Task (N)                 # assignedTo
Task (1) ──────< Comment (N)              # ראה 07-collaboration.md

# קישורים אופציונליים
Task ──────> Room                         # linkedEntityType = 'room'
Task ──────> RoomProduct                  # linkedEntityType = 'product'
Task ──────> Payment                      # linkedEntityType = 'payment'
Task ──────> Document                     # linkedEntityType = 'document'
Task ──────> ChangeOrder                  # linkedEntityType = 'change_order'
```

## Interface

```typescript
interface Task {
  id: string;
  tenantId: string;
  projectId?: string;                   // אופציונלי - משימה יכולה להיות כללית

  // תוכן
  title: string;
  description?: string;

  // סטטוס וקטגוריה
  statusId: string;                     // FK to ConfigurableEntity (task_status)
  priority: Priority;
  categoryId?: string;                  // FK to ConfigurableEntity (task_category)

  // הקצאה
  assignedTo?: string;                  // FK to User

  // תאריכים
  dueDate?: Date;
  dueTime?: string;                     // "14:00"
  startDate?: Date;
  completedAt?: Date;

  // תזכורות
  reminders?: TaskReminder[];

  // קישור לישות אחרת (polymorphic)
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;

  // צ'קליסט (sub-tasks)
  checklist?: ChecklistItem[];

  // סדר תצוגה
  order: number;

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                    // FK to User
}

// Sub-interfaces
interface TaskReminder {
  type: ReminderType;                   // 'email' | 'notification' | 'sms'
  beforeMinutes: number;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

// Enum - מוגדר ב-00-shared-definitions.md
type LinkedEntityType = 'room' | 'product' | 'payment' | 'document' | 'change_order';
```

## Database Schema

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  title VARCHAR(500) NOT NULL,
  description TEXT,

  status_id UUID NOT NULL REFERENCES configurable_entities(id),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  category_id UUID REFERENCES configurable_entities(id),

  assigned_to UUID REFERENCES users(id),

  due_date DATE,
  due_time TIME,
  start_date DATE,
  completed_at TIMESTAMPTZ,

  reminders JSONB DEFAULT '[]',

  linked_entity_type VARCHAR(20),
  linked_entity_id UUID,

  checklist JSONB DEFAULT '[]',

  "order" INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(tenant_id, assigned_to);
CREATE INDEX idx_tasks_status ON tasks(tenant_id, status_id);
CREATE INDEX idx_tasks_due_date ON tasks(tenant_id, due_date);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status_id);
CREATE INDEX idx_tasks_linked ON tasks(linked_entity_type, linked_entity_id);
```

## Computed Fields

```typescript
interface TaskComputed {
  // סטטוס
  isOverdue: boolean;                   // due_date < now && not completed
  daysUntilDue: number;                 // ימים עד ה-due date

  // צ'קליסט
  checklistTotal: number;               // סה"כ פריטים בצ'קליסט
  checklistCompleted: number;           // פריטים שהושלמו
  checklistProgress: number;            // אחוז השלמה

  // קשרים
  commentsCount: number;                // מספר תגובות
  attachmentsCount: number;             // מספר קבצים מצורפים

  // משתמשים
  assigneeName?: string;                // שם המשתמש המוקצה
  creatorName: string;                  // שם היוצר
}
```

## API Endpoints

```
# ברמת Tenant
GET    /api/v1/tasks                                  # All my tasks
GET    /api/v1/tasks/overdue                          # Overdue tasks
GET    /api/v1/tasks/today                            # Tasks due today

# ברמת Project
GET    /api/v1/projects/:projectId/tasks              # Tasks in project
POST   /api/v1/projects/:projectId/tasks              # Create task in project

# ברמת Task
GET    /api/v1/tasks/:id                              # Get task
PATCH  /api/v1/tasks/:id                              # Update task
DELETE /api/v1/tasks/:id                              # Delete task

# פעולות מיוחדות
POST   /api/v1/tasks/:id/complete                     # Mark as complete
POST   /api/v1/tasks/:id/reopen                       # Reopen task
PATCH  /api/v1/tasks/:id/assign                       # Assign to user
PATCH  /api/v1/tasks/:id/checklist                    # Update checklist
POST   /api/v1/tasks/bulk                             # Bulk operations

# תזכורות
POST   /api/v1/tasks/:id/reminders                    # Add reminder
DELETE /api/v1/tasks/:id/reminders/:reminderId        # Remove reminder
```

## WebSocket Events

```typescript
const TASK_EVENTS = {
  'task.created': 'משימה חדשה נוצרה',
  'task.updated': 'משימה עודכנה',
  'task.completed': 'משימה הושלמה',
  'task.assigned': 'משימה הוקצתה למשתמש',
  'task.deleted': 'משימה נמחקה',
  'task.reminder': 'תזכורת למשימה',
};
```

## Views (Saved Filters)

```typescript
const DEFAULT_TASK_VIEWS = [
  {
    name: 'המשימות שלי',
    filters: [{ field: 'assignedTo', operator: 'equals', value: '{{currentUserId}}' }],
  },
  {
    name: 'לביצוע היום',
    filters: [{ field: 'dueDate', operator: 'date_equals', value: '{{today}}' }],
  },
  {
    name: 'באיחור',
    filters: [
      { field: 'dueDate', operator: 'date_before', value: '{{today}}' },
      { field: 'completedAt', operator: 'is_null', value: null },
    ],
  },
  {
    name: 'ללא תאריך',
    filters: [{ field: 'dueDate', operator: 'is_null', value: null }],
  },
  {
    name: 'עדיפות גבוהה',
    filters: [{ field: 'priority', operator: 'in_list', value: ['high', 'urgent'] }],
  },
];
```

---

# ג. Document (מסמך)

## תיאור

מסמך מייצג קובץ שהועלה למערכת. יכול להיות מסמך פרויקט (תוכניות, חוזים, הדמיות) או מסמך כללי. תומך בגרסאות, שיתוף עם לקוח, וקטגוריזציה.

## קשרים

```
Tenant (1) ──────< Document (N)
Project (1) ──────< Document (N)          # אופציונלי
Document (1) ──────< Document (N)         # גרסאות (parentId)
Document (1) ──────< Comment (N)          # ראה 07-collaboration.md
```

## Interface

```typescript
interface Document {
  id: string;
  tenantId: string;
  projectId?: string;                   // אופציונלי - מסמך יכול להיות כללי

  // פרטי המסמך
  name: string;
  type: string;                         // סוג מסמך חופשי
  categoryId?: string;                  // FK to ConfigurableEntity (document_category)

  // קובץ
  fileUrl: string;
  fileSize: number;                     // bytes
  mimeType: string;

  // גרסאות
  version: number;
  parentId?: string;                    // FK to Document (original version)

  // שיתוף עם לקוח
  isSharedWithClient: boolean;
  clientCanDownload: boolean;

  // מטא
  uploadedBy: string;                   // FK to User
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Schema

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  category_id UUID REFERENCES configurable_entities(id),

  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,

  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  is_shared_with_client BOOLEAN NOT NULL DEFAULT FALSE,
  client_can_download BOOLEAN NOT NULL DEFAULT FALSE,

  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_category ON documents(tenant_id, category_id);
CREATE INDEX idx_documents_parent ON documents(parent_id);
CREATE INDEX idx_documents_shared ON documents(project_id, is_shared_with_client)
  WHERE is_shared_with_client = TRUE;
```

## Computed Fields

```typescript
interface DocumentComputed {
  // גרסאות
  hasVersions: boolean;                 // יש גרסאות קודמות
  latestVersion: number;                // מספר הגרסה האחרונה
  versionHistory: DocumentVersion[];    // היסטוריית גרסאות

  // קובץ
  fileSizeFormatted: string;            // "2.5 MB"
  fileExtension: string;                // "pdf"
  isImage: boolean;                     // האם זה קובץ תמונה
  isPDF: boolean;                       // האם זה PDF

  // מטא
  uploaderName: string;                 // שם המעלה
  categoryName?: string;                // שם הקטגוריה

  // תגובות
  commentsCount: number;
}

interface DocumentVersion {
  version: number;
  uploadedAt: Date;
  uploadedBy: string;
}
```

## API Endpoints

```
# ברמת Project
GET    /api/v1/projects/:projectId/documents          # Documents in project
POST   /api/v1/projects/:projectId/documents          # Upload document

# ברמת Document
GET    /api/v1/documents/:id                          # Get document details
PATCH  /api/v1/documents/:id                          # Update document metadata
DELETE /api/v1/documents/:id                          # Delete document

# גרסאות
GET    /api/v1/documents/:id/versions                 # Get version history
POST   /api/v1/documents/:id/versions                 # Upload new version

# הורדה ותצוגה מקדימה
GET    /api/v1/documents/:id/download                 # Download file
GET    /api/v1/documents/:id/preview                  # Preview (if supported)
GET    /api/v1/documents/:id/thumbnail                # Thumbnail image

# שיתוף
PATCH  /api/v1/documents/:id/share                    # Toggle client sharing
POST   /api/v1/documents/:id/share-link               # Create public share link

# Bulk
POST   /api/v1/documents/bulk/delete                  # Delete multiple
POST   /api/v1/documents/bulk/download                # Download as ZIP
```

## תבניות קטגוריות מסמכים (Defaults)

```typescript
const DEFAULT_DOCUMENT_CATEGORIES = [
  { name: 'תוכניות', nameEn: 'Plans', icon: 'blueprint' },
  { name: 'הדמיות', nameEn: 'Renders', icon: 'image' },
  { name: 'חוזים', nameEn: 'Contracts', icon: 'file-signature' },
  { name: 'הצעות מחיר', nameEn: 'Proposals', icon: 'file-text' },
  { name: 'מפרטים', nameEn: 'Specifications', icon: 'list' },
  { name: 'תמונות מהשטח', nameEn: 'Site Photos', icon: 'camera' },
  { name: 'אישורים', nameEn: 'Approvals', icon: 'check-circle' },
  { name: 'היתרים', nameEn: 'Permits', icon: 'certificate' },
  { name: 'אחר', nameEn: 'Other', icon: 'file' },
];
```

---

# ד. Meeting (פגישה)

## תיאור

פגישה מייצגת אירוע ביומן - יכולה להיות פגישת לקוח, ביקור באתר, פגישה עם ספק, או פגישה פנימית. תומכת בחזרה (recurrence), משתתפים, והערות מעקב.

## קשרים

```
Tenant (1) ──────< Meeting (N)
Project (1) ──────< Meeting (N)           # אופציונלי
Client (1) ──────< Meeting (N)            # אופציונלי
User (N) <─────── Meeting (1)             # attendeeUserIds
Meeting (1) ──────< Task (N)              # followUpTasks
Meeting (1) ──────< Comment (N)           # ראה 07-collaboration.md
```

## Interface

```typescript
interface Meeting {
  id: string;
  tenantId: string;
  projectId?: string;                   // FK to Project (אופציונלי)
  clientId?: string;                    // FK to Client (אופציונלי)

  // פרטים בסיסיים
  title: string;
  description?: string;
  location?: string;
  meetingType: MeetingType;

  // זמנים
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;

  // משתתפים
  attendeeUserIds: string[];            // FK[] to User
  externalAttendees?: string[];         // שמות/מיילים של אורחים חיצוניים

  // סטטוס
  status: MeetingStatus;

  // הערות ומעקב
  notes?: string;
  followUpTasks?: string[];             // FK[] to Task

  // חזרה
  recurrence?: MeetingRecurrence;
  recurrenceParentId?: string;          // FK to Meeting (original)

  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                    // FK to User
}

// Sub-interface
interface MeetingRecurrence {
  frequency: RecurrenceFrequency;       // 'daily' | 'weekly' | 'biweekly' | 'monthly'
  endDate?: Date;
  occurrences?: number;
}

// Enums - מוגדרים ב-00-shared-definitions.md
type MeetingType =
  | 'site_visit'
  | 'client_meeting'
  | 'supplier'
  | 'internal'
  | 'presentation'
  | 'installation'
  | 'other';

type MeetingStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';
```

## Database Schema

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  meeting_type VARCHAR(20) NOT NULL DEFAULT 'other',

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,

  attendee_user_ids UUID[] DEFAULT '{}',
  external_attendees TEXT[] DEFAULT '{}',

  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',

  notes TEXT,
  follow_up_tasks UUID[] DEFAULT '{}',

  recurrence JSONB,
  recurrence_parent_id UUID REFERENCES meetings(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_meetings_tenant_id ON meetings(tenant_id);
CREATE INDEX idx_meetings_project_id ON meetings(project_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_start_time ON meetings(tenant_id, start_time);
CREATE INDEX idx_meetings_status ON meetings(tenant_id, status);
CREATE INDEX idx_meetings_attendees ON meetings USING GIN (attendee_user_ids);
CREATE INDEX idx_meetings_date_range ON meetings(tenant_id, start_time, end_time);
```

## Computed Fields

```typescript
interface MeetingComputed {
  // זמן
  duration: number;                     // משך בדקות
  durationFormatted: string;            // "1 שעה 30 דקות"
  isUpcoming: boolean;                  // עתידית
  isPast: boolean;                      // עברה
  isToday: boolean;                     // היום

  // משתתפים
  attendeesCount: number;               // מספר משתתפים
  attendeeNames: string[];              // שמות המשתתפים

  // קשרים
  projectName?: string;                 // שם הפרויקט
  clientName?: string;                  // שם הלקוח

  // חזרה
  isRecurring: boolean;                 // האם זו פגישה חוזרת
  recurrenceDescription?: string;       // "כל יום שני"

  // משימות
  followUpTasksCount: number;           // מספר משימות מעקב
}
```

## API Endpoints

```
# יומן
GET    /api/v1/calendar                               # Calendar view (all meetings)
GET    /api/v1/calendar/day/:date                     # Meetings for specific day
GET    /api/v1/calendar/week/:date                    # Meetings for week
GET    /api/v1/calendar/month/:year/:month            # Meetings for month

# ברמת Project
GET    /api/v1/projects/:projectId/meetings           # Meetings for project
POST   /api/v1/projects/:projectId/meetings           # Create meeting for project

# ברמת Meeting
GET    /api/v1/meetings/:id                           # Get meeting details
POST   /api/v1/meetings                               # Create meeting
PATCH  /api/v1/meetings/:id                           # Update meeting
DELETE /api/v1/meetings/:id                           # Delete meeting

# פעולות מיוחדות
POST   /api/v1/meetings/:id/confirm                   # Confirm meeting
POST   /api/v1/meetings/:id/cancel                    # Cancel meeting
POST   /api/v1/meetings/:id/reschedule                # Reschedule
POST   /api/v1/meetings/:id/complete                  # Mark as completed
POST   /api/v1/meetings/:id/add-follow-up             # Add follow-up task

# חזרה
POST   /api/v1/meetings/:id/recurrence                # Set recurrence
DELETE /api/v1/meetings/:id/recurrence                # Cancel recurrence
DELETE /api/v1/meetings/:id/recurrence/future         # Cancel future occurrences

# הזמנות
POST   /api/v1/meetings/:id/invite                    # Send invitations
```

## WebSocket Events

```typescript
const MEETING_EVENTS = {
  'meeting.created': 'פגישה חדשה נוצרה',
  'meeting.updated': 'פגישה עודכנה',
  'meeting.cancelled': 'פגישה בוטלה',
  'meeting.rescheduled': 'פגישה נדחתה',
  'meeting.reminder': 'תזכורת לפגישה',
};
```

## תבניות סוגי פגישות (Defaults)

```typescript
const DEFAULT_MEETING_TYPES = [
  { id: 'site_visit', name: 'ביקור באתר', icon: 'map-pin', color: '#3B82F6' },
  { id: 'client_meeting', name: 'פגישת לקוח', icon: 'users', color: '#10B981' },
  { id: 'supplier', name: 'פגישת ספק', icon: 'truck', color: '#F59E0B' },
  { id: 'internal', name: 'פגישה פנימית', icon: 'home', color: '#6B7280' },
  { id: 'presentation', name: 'הצגה', icon: 'presentation', color: '#8B5CF6' },
  { id: 'installation', name: 'התקנה', icon: 'tool', color: '#EF4444' },
  { id: 'other', name: 'אחר', icon: 'calendar', color: '#6B7280' },
];
```

---

# ה. הנחיות UI

## Room UI

```typescript
interface RoomUI {
  // תצוגה ב-Project Hub
  projectHub: {
    showAsList: true;
    showDesignStatus: true;
    showProductCount: true;
    showBudgetProgress: true;
    allowDragReorder: true;
  };

  // דף חדר
  roomPage: {
    tabs: ['מוצרים', 'השראה', 'משימות', 'מסמכים'];
    showBudgetTracker: true;
    showDesignTimeline: true;
  };
}
```

## Task UI

```typescript
interface TaskUI {
  // תצוגות
  views: ['list', 'kanban', 'calendar'];
  defaultView: 'list';

  // Kanban
  kanban: {
    groupBy: 'status';
    allowDragBetweenColumns: true;
    showSubtasks: true;
  };

  // רשימה
  list: {
    inlineEdit: true;
    quickComplete: true;
    showChecklist: true;
    groupBy: ['none', 'project', 'assignee', 'priority', 'dueDate'];
  };

  // יצירה מהירה
  quickAdd: {
    showInHeader: true;
    defaultProject: 'current';
    fields: ['title', 'dueDate', 'assignee'];
  };
}
```

## Document UI

```typescript
interface DocumentUI {
  // תצוגות
  views: ['grid', 'list'];
  defaultView: 'grid';

  // Grid
  grid: {
    showThumbnails: true;
    thumbnailSize: 'medium';
  };

  // Preview
  preview: {
    supportedTypes: ['image/*', 'application/pdf', 'video/*'];
    showInModal: true;
    allowZoom: true;
  };

  // Upload
  upload: {
    dragAndDrop: true;
    multipleFiles: true;
    showProgress: true;
    maxFileSize: '100MB';
  };
}
```

## Meeting UI

```typescript
interface MeetingUI {
  // יומן
  calendar: {
    views: ['month', 'week', 'day', 'agenda'];
    defaultView: 'week';
    showWeekends: true;
    firstDayOfWeek: 0;              // ראשון
    startHour: 8;
    endHour: 20;
  };

  // צבעים
  colors: {
    byType: true;                   // צבע לפי סוג פגישה
    byProject: false;
  };

  // יצירה
  create: {
    defaultDuration: 60;            // דקות
    showQuickAdd: true;
    suggestAvailability: true;
  };
}
```

---

**הפניות לקבצים אחרים:**
- Project: `03-project-client.md`
- Comment, ActivityLog: `07-collaboration.md`
- RoomProduct: `05-products-ffe.md`
- MoodBoard, DesignOption: `08-client-portal.md`
- ConfigurableEntity: `14-configuration.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
